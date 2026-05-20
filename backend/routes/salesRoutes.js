const express = require("express");
const router  = express.Router();
const db      = require("../config/db");

function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}

// GET /sales/daily
// Computes daily totals directly from transaction_log
router.get("/daily", async (req, res) => {
    try {
        const result = await query(
            `SELECT
                ROW_NUMBER() OVER (ORDER BY DATE(timestamp) DESC) AS daily_id,
                DATE(timestamp)            AS sales_date,
                COUNT(*)                   AS total_transactions,
                COALESCE(SUM(quantity), 0) AS total_items_sold,
                COALESCE(SUM(subtotal), 0) AS total_revenue
             FROM transaction_log
             GROUP BY DATE(timestamp)
             ORDER BY sales_date DESC`
        );
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /sales/weekly
// Computes weekly totals directly from transaction_log
router.get("/weekly", async (req, res) => {
    try {
        const result = await query(
            `SELECT
                ROW_NUMBER() OVER (ORDER BY YEAR(timestamp) DESC, WEEK(timestamp, 1) DESC) AS weekly_id,
                YEAR(timestamp)            AS year,
                WEEK(timestamp, 1)         AS week_number,
                COUNT(*)                   AS total_transactions,
                COALESCE(SUM(quantity), 0) AS total_items_sold,
                COALESCE(SUM(subtotal), 0) AS total_revenue
             FROM transaction_log
             GROUP BY YEAR(timestamp), WEEK(timestamp, 1)
             ORDER BY year DESC, week_number DESC`
        );
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /sales/monthly
// Computes monthly totals directly from transaction_log
router.get("/monthly", async (req, res) => {
    try {
        const result = await query(
            `SELECT
                ROW_NUMBER() OVER (ORDER BY YEAR(timestamp) DESC, MONTH(timestamp) DESC) AS monthly_id,
                YEAR(timestamp)            AS year,
                MONTH(timestamp)           AS month,
                COUNT(*)                   AS total_transactions,
                COALESCE(SUM(quantity), 0) AS total_items_sold,
                COALESCE(SUM(subtotal), 0) AS total_revenue
             FROM transaction_log
             GROUP BY YEAR(timestamp), MONTH(timestamp)
             ORDER BY year DESC, month DESC`
        );
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /sales/revenue-over-time  (unchanged, used by dashboard)
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

// GET /sales/top-products  (unchanged, used by dashboard)
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

module.exports = router;