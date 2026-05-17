const express = require("express");
const router = express.Router();
const db = require("../config/db");

function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}

// GET /sales/daily
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

// GET /sales/weekly
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

// GET /sales/monthly
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


router.get("/revenue-over-time", async (req, res) => {
    try {
        const result = await query(
            `SELECT
                DATE(timestamp) AS sale_date,
                COALESCE(SUM(subtotal), 0) AS total_revenue
             FROM transaction_log
             WHERE timestamp >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
             GROUP BY DATE(timestamp)
             ORDER BY sale_date ASC`
        );
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.get("/top-products", async (req, res) => {
    try {
        const result = await query(
            `SELECT
                product_name,
                SUM(quantity)  AS total_qty,
                SUM(subtotal)  AS total_revenue
             FROM transaction_log
             GROUP BY product_name
             ORDER BY total_revenue DESC
             LIMIT 6`
        );
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /sales/sync
router.post("/sync", async (req, res) => {
    try {
        const logs = await query(
            "SELECT log_id, timestamp, quantity, subtotal FROM transaction_log"
        );

        if (logs.length === 0) return res.json({ message: "No transactions to sync." });

        const byDay = {}, byWeek = {}, byMonth = {};

        for (const log of logs) {
            const date = new Date(log.timestamp);
            const dayKey = date.toISOString().slice(0, 10);

            if (!byDay[dayKey]) byDay[dayKey] = { total_transactions: 0, total_items_sold: 0, total_revenue: 0 };
            byDay[dayKey].total_transactions += 1;
            byDay[dayKey].total_items_sold   += log.quantity || 0;
            byDay[dayKey].total_revenue      += parseFloat(log.subtotal) || 0;

            const year = date.getFullYear();
            const weekNum = getISOWeekNumber(date);
            const weekKey = `${year}-${String(weekNum).padStart(2, "0")}`;

            if (!byWeek[weekKey]) byWeek[weekKey] = { year, week_number: weekNum, total_transactions: 0, total_items_sold: 0, total_revenue: 0 };
            byWeek[weekKey].total_transactions += 1;
            byWeek[weekKey].total_items_sold   += log.quantity || 0;
            byWeek[weekKey].total_revenue      += parseFloat(log.subtotal) || 0;

            const month = date.getMonth() + 1;
            const monthKey = `${year}-${String(month).padStart(2, "0")}`;

            if (!byMonth[monthKey]) byMonth[monthKey] = { year, month, total_transactions: 0, total_items_sold: 0, total_revenue: 0 };
            byMonth[monthKey].total_transactions += 1;
            byMonth[monthKey].total_items_sold   += log.quantity || 0;
            byMonth[monthKey].total_revenue      += parseFloat(log.subtotal) || 0;
        }

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

// POST /sales/update-from-transaction
router.post("/update-from-transaction", async (req, res) => {
    try {
        const { quantity, subtotal, timestamp } = req.body;

        if (!quantity || !subtotal || !timestamp)
            return res.status(400).json({ error: "quantity, subtotal, and timestamp are required." });

        const date    = new Date(timestamp);
        const dateStr = date.toISOString().slice(0, 10);
        const year    = date.getFullYear();
        const month   = date.getMonth() + 1;
        const weekNum = getISOWeekNumber(date);

        const [dayTotals] = await query(
            `SELECT COUNT(*) AS total_transactions,
                    COALESCE(SUM(quantity), 0) AS total_items_sold,
                    COALESCE(SUM(subtotal), 0) AS total_revenue
             FROM transaction_log WHERE DATE(timestamp) = ?`,
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

        const [weekTotals] = await query(
            `SELECT COUNT(*) AS total_transactions,
                    COALESCE(SUM(quantity), 0) AS total_items_sold,
                    COALESCE(SUM(subtotal), 0) AS total_revenue
             FROM transaction_log
             WHERE YEAR(timestamp) = ? AND WEEK(timestamp, 1) = ?`,
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

        const [monthTotals] = await query(
            `SELECT COUNT(*) AS total_transactions,
                    COALESCE(SUM(quantity), 0) AS total_items_sold,
                    COALESCE(SUM(subtotal), 0) AS total_revenue
             FROM transaction_log
             WHERE YEAR(timestamp) = ? AND MONTH(timestamp) = ?`,
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

function getISOWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

module.exports = router;