const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/daily", (req, res) => {
    db.query("SELECT daily_id, sales_date, total_items_sold, total_revenue, total_transactions FROM daily_sales ORDER BY sales_date DESC", (err, result) => {
        res.json(result);
    });
});

router.get("/weekly", (req, res) => {
    db.query("SELECT weekly_id, week_number, year, total_items_sold, total_revenue, total_transactions FROM weekly_sales ORDER BY year DESC, week_number DESC", (err, result) => {
        res.json(result);
    });
});

router.get("/monthly", (req, res) => {
    db.query("SELECT monthly_id, month, year, total_items_sold, total_revenue, total_transactions FROM monthly_sales ORDER BY year DESC, month DESC", (err, result) => {
        res.json(result);
    });
});

module.exports = router;
