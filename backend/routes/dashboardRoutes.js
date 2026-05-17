const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/:id", (req, res) => {
    const userID = req.params.id;

    const userQuery = "SELECT * FROM logindata WHERE accID = ?";

    db.query(userQuery, [userID], (err, userResult) => {
        if (err || userResult.length === 0)
            return res.status(404).json({ error: "User not found" });

        const user = userResult[0];

        const stockQuery = "SELECT SUM(quantity) AS total_stock FROM inventory";
        const salesQuery = "SELECT SUM(subtotal) AS today_sales FROM transaction_log WHERE DATE(timestamp) = CURDATE()";

        const lowStockQuery = `
            SELECT id, product_name, quantity
            FROM inventory
            WHERE quantity < 50
            ORDER BY quantity ASC
        `;

        // 🔥 ONLY HR CAN GET ACCOUNTS
        if (user.accountType === "Manager") {
            const accountsQuery = "SELECT accID, firstname, middlename, lastname, birthdate, gender, email, phonenumber, accountType, username FROM logindata";

            db.query(accountsQuery, (err, accResult) => {
                db.query(stockQuery, (err, stockResult) => {
                    db.query(salesQuery, (err, salesResult) => {
                        db.query(lowStockQuery, (err, lowStockResult) => {
                            res.json({
                                user,
                                total_stock: stockResult[0].total_stock || 0,
                                today_sales: salesResult[0].today_sales || 0,
                                low_stock: lowStockResult,
                                accounts: accResult
                            });
                        });
                    });
                });
            });

        } else {
            db.query(stockQuery, (err, stockResult) => {
                db.query(salesQuery, (err, salesResult) => {
                    db.query(lowStockQuery, (err, lowStockResult) => {
                        res.json({
                            user,
                            total_stock: stockResult[0].total_stock || 0,
                            today_sales: salesResult[0].today_sales || 0,
                            low_stock: lowStockResult,
                            accounts: []
                        });
                    });
                });
            });
        }
    });
});

router.delete("/:id", (req, res) => {
    const { role, requestingUserID } = req.body;

    if (role !== "Manager") {
        return res.status(403).json({ error: "Forbidden" });
    }

    const id = req.params.id;

    // Prevent self-deletion
    if (String(id) === String(requestingUserID)) {
        return res.status(400).json({ error: "You cannot delete your own account." });
    }

    db.query("DELETE FROM logindata WHERE accID = ?", [id], () => {
        res.json({ message: "deleted" });
    });
});

module.exports = router;
