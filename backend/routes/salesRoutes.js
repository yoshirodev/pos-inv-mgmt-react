const express = require("express");
const router = express.Router();
const db = require("../config/db");


// Helper: promisify db.query so we can use async/await cleanly

function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}


// GET /sales/daily  — fetch all daily sales rows (newest first)

router.get("/daily", async (req, res) => {
    try {
        const result = await query(
            "SELECT daily_id, sales_date, total_items_sold, total_revenue, total_transactions FROM daily_sales ORDER BY sales_date DESC"
        );
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// GET /sales/weekly — fetch all weekly sales rows (newest first)

router.get("/weekly", async (req, res) => {
    try {
        const result = await query(
            "SELECT weekly_id, week_number, year, total_items_sold, total_revenue, total_transactions FROM weekly_sales ORDER BY year DESC, week_number DESC"
        );
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// GET /sales/monthly — fetch all monthly sales rows (newest first)

router.get("/monthly", async (req, res) => {
    try {
        const result = await query(
            "SELECT monthly_id, month, year, total_items_sold, total_revenue, total_transactions FROM monthly_sales ORDER BY year DESC, month DESC"
        );
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/sync", async (req, res) => {
    try {
        // 1. Fetch all transaction log rows
        const logs = await query(
            "SELECT log_id, timestamp, quantity, subtotal FROM transaction_log"
        );

        if (logs.length === 0) {
            return res.json({ message: "No transactions to sync." });
        }

        // 2. Group by day, week, month
        const byDay   = {};   // key: "YYYY-MM-DD"
        const byWeek  = {};   // key: "YYYY-WW"
        const byMonth = {};   // key: "YYYY-MM"

        for (const log of logs) {
            const date = new Date(log.timestamp);

            // ── Daily key 
            const dayKey = date.toISOString().slice(0, 10); // "2026-03-11"

            if (!byDay[dayKey]) {
                byDay[dayKey] = { total_transactions: 0, total_items_sold: 0, total_revenue: 0 };
            }
            byDay[dayKey].total_transactions += 1;
            byDay[dayKey].total_items_sold   += log.quantity || 0;
            byDay[dayKey].total_revenue      += parseFloat(log.subtotal) || 0;

            // ── Weekly key 
            // ISO week: Monday-based week number
            const year      = date.getFullYear();
            const weekNum   = getISOWeekNumber(date);
            const weekKey   = `${year}-${String(weekNum).padStart(2, "0")}`;

            if (!byWeek[weekKey]) {
                byWeek[weekKey] = { year, week_number: weekNum, total_transactions: 0, total_items_sold: 0, total_revenue: 0 };
            }
            byWeek[weekKey].total_transactions += 1;
            byWeek[weekKey].total_items_sold   += log.quantity || 0;
            byWeek[weekKey].total_revenue      += parseFloat(log.subtotal) || 0;

            // ── Monthly key 
            const month     = date.getMonth() + 1; // 1-12
            const monthKey  = `${year}-${String(month).padStart(2, "0")}`;

            if (!byMonth[monthKey]) {
                byMonth[monthKey] = { year, month, total_transactions: 0, total_items_sold: 0, total_revenue: 0 };
            }
            byMonth[monthKey].total_transactions += 1;
            byMonth[monthKey].total_items_sold   += log.quantity || 0;
            byMonth[monthKey].total_revenue      += parseFloat(log.subtotal) || 0;
        }

        // 3. UPSERT daily_sales
        //    ON DUPLICATE KEY UPDATE targets the UNIQUE KEY on sales_date
        for (const [dateStr, vals] of Object.entries(byDay)) {
            await query(
                `INSERT INTO daily_sales (sales_date, total_transactions, total_items_sold, total_revenue)
                 VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                     total_transactions = VALUES(total_transactions),
                     total_items_sold   = VALUES(total_items_sold),
                     total_revenue      = VALUES(total_revenue)`,
                [dateStr, vals.total_transactions, vals.total_items_sold, vals.total_revenue.toFixed(2)]
            );
        }

        // 4. UPSERT weekly_sales
        //    ON DUPLICATE KEY UPDATE targets the UNIQUE KEY on (year, week_number)
        for (const [, vals] of Object.entries(byWeek)) {
            await query(
                `INSERT INTO weekly_sales (year, week_number, total_transactions, total_items_sold, total_revenue)
                 VALUES (?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                     total_transactions = VALUES(total_transactions),
                     total_items_sold   = VALUES(total_items_sold),
                     total_revenue      = VALUES(total_revenue)`,
                [vals.year, vals.week_number, vals.total_transactions, vals.total_items_sold, vals.total_revenue.toFixed(2)]
            );
        }

        // 5. UPSERT monthly_sales
        //    ON DUPLICATE KEY UPDATE targets the UNIQUE KEY on (year, month)
        for (const [, vals] of Object.entries(byMonth)) {
            await query(
                `INSERT INTO monthly_sales (year, month, total_transactions, total_items_sold, total_revenue)
                 VALUES (?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                     total_transactions = VALUES(total_transactions),
                     total_items_sold   = VALUES(total_items_sold),
                     total_revenue      = VALUES(total_revenue)`,
                [vals.year, vals.month, vals.total_transactions, vals.total_items_sold, vals.total_revenue.toFixed(2)]
            );
        }

        res.json({
            message: "Sync complete.",
            synced: {
                days:   Object.keys(byDay).length,
                weeks:  Object.keys(byWeek).length,
                months: Object.keys(byMonth).length,
            },
        });

    } catch (err) {
        console.error("Sync error:", err);
        res.status(500).json({ error: err.message });
    }
});


router.post("/update-from-transaction", async (req, res) => {
    try {
        const { quantity, subtotal, timestamp } = req.body;

        if (!quantity || !subtotal || !timestamp) {
            return res.status(400).json({ error: "quantity, subtotal, and timestamp are required." });
        }

        const date     = new Date(timestamp);
        const dateStr  = date.toISOString().slice(0, 10);
        const year     = date.getFullYear();
        const month    = date.getMonth() + 1;
        const weekNum  = getISOWeekNumber(date);
        const qty      = parseInt(quantity);
        const rev      = parseFloat(subtotal).toFixed(2);

        // ── Daily: recount from transaction_log for that exact date ──
        // This keeps the totals 100% accurate even if called multiple
        // times on the same day (idempotent).
        const [dayTotals] = await query(
            `SELECT
                COUNT(*)          AS total_transactions,
                COALESCE(SUM(quantity), 0) AS total_items_sold,
                COALESCE(SUM(subtotal), 0) AS total_revenue
             FROM transaction_log
             WHERE DATE(timestamp) = ?`,
            [dateStr]
        );

        await query(
            `INSERT INTO daily_sales (sales_date, total_transactions, total_items_sold, total_revenue)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                 total_transactions = VALUES(total_transactions),
                 total_items_sold   = VALUES(total_items_sold),
                 total_revenue      = VALUES(total_revenue)`,
            [dateStr, dayTotals.total_transactions, dayTotals.total_items_sold, parseFloat(dayTotals.total_revenue).toFixed(2)]
        );

        // ── Weekly: recount from transaction_log for that ISO week ──
        const [weekTotals] = await query(
            `SELECT
                COUNT(*)          AS total_transactions,
                COALESCE(SUM(quantity), 0) AS total_items_sold,
                COALESCE(SUM(subtotal), 0) AS total_revenue
             FROM transaction_log
             WHERE YEAR(timestamp) = ?
               AND WEEK(timestamp, 1) = ?`,
            [year, weekNum]
        );

        await query(
            `INSERT INTO weekly_sales (year, week_number, total_transactions, total_items_sold, total_revenue)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                 total_transactions = VALUES(total_transactions),
                 total_items_sold   = VALUES(total_items_sold),
                 total_revenue      = VALUES(total_revenue)`,
            [year, weekNum, weekTotals.total_transactions, weekTotals.total_items_sold, parseFloat(weekTotals.total_revenue).toFixed(2)]
        );

        // ── Monthly: recount from transaction_log for that month ──
        const [monthTotals] = await query(
            `SELECT
                COUNT(*)          AS total_transactions,
                COALESCE(SUM(quantity), 0) AS total_items_sold,
                COALESCE(SUM(subtotal), 0) AS total_revenue
             FROM transaction_log
             WHERE YEAR(timestamp) = ?
               AND MONTH(timestamp) = ?`,
            [year, month]
        );

        await query(
            `INSERT INTO monthly_sales (year, month, total_transactions, total_items_sold, total_revenue)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                 total_transactions = VALUES(total_transactions),
                 total_items_sold   = VALUES(total_items_sold),
                 total_revenue      = VALUES(total_revenue)`,
            [year, month, monthTotals.total_transactions, monthTotals.total_items_sold, parseFloat(monthTotals.total_revenue).toFixed(2)]
        );

        res.json({ message: "Sales tables updated successfully." });

    } catch (err) {
        console.error("Update error:", err);
        res.status(500).json({ error: err.message });
    }
});

// 
// Helper: ISO 8601 week number (week starts Monday)
// Returns 1–53
// 
function getISOWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    // Set to nearest Thursday (makes the week year calculation correct)
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

module.exports = router;