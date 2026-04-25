const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/:id", (req, res) => {
    const userID = req.params.id;

    const userQuery = "SELECT firstname, middlename, lastname, birthdate, email, phonenumber, accountType FROM logindata WHERE accID = ?";
    const stockQuery = "SELECT SUM(quantity) AS total_stock FROM inventory";
    const salesQuery = "SELECT SUM(subtotal) AS today_sales FROM transaction_log WHERE DATE(timestamp) = CURDATE()";
    const accountsQuery = "SELECT accID, firstname, middlename, lastname, birthdate, gender, email, phonenumber, accountType, username FROM logindata";

    db.query(userQuery, [userID], (err, userResult) => {
        if (err || userResult.length === 0) return res.status(404).json({ error: "User not found" });

        db.query(stockQuery, (err, stockResult) => {
            db.query(salesQuery, (err, salesResult) => {
                db.query(accountsQuery, (err, accResult) => {
                    res.json({
                        user: userResult[0],
                        total_stock: stockResult[0].total_stock,
                        today_sales: salesResult[0].today_sales || 0,
                        accounts: accResult
                    });
                });
            });
        });
    });
});

router.delete("/:id", (req, res) => {
    const id = req.params.id;
    db.query("DELETE FROM logindata WHERE accID = ?", [id], () => {
        res.json({ message: "deleted" });
    });
});

module.exports = router;
