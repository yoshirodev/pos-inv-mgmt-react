const express = require("express");
const router  = express.Router();
const db      = require("../config/db");

let cart = [];

// ── Helper: promisify db.query ─────────────────────────────────
function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}

// ── Helper: ISO week number ────────────────────────────────────
function getISOWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

async function updateSalesFromDB(dateStr, year, month, weekNum) {
    const [day] = await query(
        `SELECT COUNT(*) AS total_transactions,
                COALESCE(SUM(quantity), 0) AS total_items_sold,
                COALESCE(SUM(subtotal),  0) AS total_revenue
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
        [dateStr, day.total_transactions, day.total_items_sold, parseFloat(day.total_revenue).toFixed(2)]
    );

    const [week] = await query(
        `SELECT COUNT(*) AS total_transactions,
                COALESCE(SUM(quantity), 0) AS total_items_sold,
                COALESCE(SUM(subtotal),  0) AS total_revenue
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
        [year, weekNum, week.total_transactions, week.total_items_sold, parseFloat(week.total_revenue).toFixed(2)]
    );

    const [mon] = await query(
        `SELECT COUNT(*) AS total_transactions,
                COALESCE(SUM(quantity), 0) AS total_items_sold,
                COALESCE(SUM(subtotal),  0) AS total_revenue
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
        [year, month, mon.total_transactions, mon.total_items_sold, parseFloat(mon.total_revenue).toFixed(2)]
    );
}

// ── GET /transactions/products ─────────────────────────────────
router.get("/products", (req, res) => {
    db.query("SELECT product_name FROM inventory", (err, result) => {
        res.json(result);
    });
});

// ── GET /transactions/cart ─────────────────────────────────────
router.get("/cart", (req, res) => {
    res.json(cart);
});

// ── POST /transactions/cart ────────────────────────────────────
router.post("/cart", (req, res) => {
    const { product, quantity } = req.body;

    db.query(
        "SELECT id, selling_price, quantity FROM inventory WHERE product_name = ?",
        [product],
        (err, result) => {
            if (err || result.length === 0)
                return res.json({ error: "Product not found" });

            const data = result[0];

            if (quantity > data.quantity)
                return res.json({ error: "No Stock Available" });

            cart.push({
                product,
                quantity,
                price:        data.selling_price,
                subtotal:     data.selling_price * quantity,
                inventory_id: data.id,
            });

            res.json(cart);
        }
    );
});

// ── DELETE /transactions/cart/:index ───────────────────────────
router.delete("/cart/:index", (req, res) => {
    cart.splice(req.params.index, 1);
    res.json(cart);
});

// ── POST /transactions/checkout ────────────────────────────────
router.post("/checkout", async (req, res) => {
    const { paymethod, amount, refnum } = req.body;
    const processedBy = req.headers["x-user-id"] || null;

    const total = cart.reduce((sum, i) => sum + i.subtotal, 0);

    if (!paymethod)
        return res.json({ error: "Select payment method" });

    if (["GCash", "Maya", "MariBank"].includes(paymethod) && !refnum)
        return res.json({ error: "Reference required" });

    if (amount < total)
        return res.json({ error: "Insufficient Amount" });

    const change  = amount - total;
    const now     = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const year    = now.getFullYear();
    const month   = now.getMonth() + 1;
    const weekNum = getISOWeekNumber(now);

    db.beginTransaction(err => {
        if (err) return res.json({ error: "Transaction error" });

        let completed = 0;
        let failed    = false;

        cart.forEach(item => {
            db.query(
                "UPDATE inventory SET quantity = quantity - ? WHERE product_name = ?",
                [item.quantity, item.product],
                (err) => {
                    if (err && !failed) {
                        failed = true;
                        return db.rollback(() => res.json({ error: "Inventory update failed" }));
                    }
                }
            );

            db.query(
                `INSERT INTO transaction_log
                    (inventory_id, processed_by, service_id,
                     product_name, quantity, price,
                     payment_method, amount_paid, change_amount,
                     subtotal, reference_number, timestamp)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                [
                    item.inventory_id || null,
                    processedBy,
                    null,
                    item.product,
                    item.quantity,
                    item.price,
                    paymethod,
                    amount,
                    change,
                    item.subtotal,
                    refnum || null,
                ],
                (err) => {
                    if (err && !failed) {
                        failed = true;
                        return db.rollback(() => res.json({ error: "Log insert failed" }));
                    }

                    completed++;

                    if (completed === cart.length && !failed) {
                        db.commit(async (err) => {
                            if (err) return res.json({ error: "Commit failed" });

                            cart = [];

                            try {
                                await updateSalesFromDB(dateStr, year, month, weekNum);
                            } catch (e) {
                                console.error("Sales auto-update error:", e.message);
                            }

                            res.json({ message: "success", change });
                        });
                    }
                }
            );
        });
    });
});

// ── GET /transactions/logs ─────────────────────────────────────
router.get("/logs", (req, res) => {
    db.query("SELECT * FROM transaction_log ORDER BY log_id DESC", (err, result) => {
        res.json(result);
    });
});

module.exports = router;