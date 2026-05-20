const express = require("express");
const router = express.Router();
const db = require("../config/db");
const logActivity = require("../utils/logActivity");

router.get("/:id", (req, res) => {
    const userID = req.params.id;

    db.query("SELECT * FROM logindata WHERE accID = ?", [userID], (err, userResult) => {
        if (err || userResult.length === 0)
            return res.status(404).json({ error: "User not found" });

        const user = userResult[0];

        const stockQuery    = "SELECT SUM(quantity) AS total_stock FROM inventory";
        const salesQuery    = "SELECT SUM(subtotal) AS today_sales FROM transaction_log WHERE DATE(timestamp) = CURDATE()";
        const lowStockQuery = `
            SELECT id, product_name, quantity
            FROM inventory WHERE quantity < 50 ORDER BY quantity ASC
        `;
        const activityQuery = `
            SELECT  al.*,
                    CONCAT(l.firstname, ' ', l.lastname) AS performed_by
            FROM    activity_log al
            LEFT JOIN logindata l ON l.accID = al.user_id
            ORDER BY al.activity_id DESC
            LIMIT 100
        `;

        if (user.accountType === "Manager") {
            const accountsQuery = `
                SELECT accID, firstname, middlename, lastname, birthdate,
                       gender, email, phonenumber, accountType, username
                FROM logindata
            `;
            db.query(accountsQuery, (err, accResult) => {
                db.query(stockQuery, (err, stockResult) => {
                    db.query(salesQuery, (err, salesResult) => {
                        db.query(lowStockQuery, (err, lowStockResult) => {
                            db.query(activityQuery, (err, activityResult) => {
                                res.json({
                                    user,
                                    total_stock:   stockResult[0].total_stock  || 0,
                                    today_sales:   salesResult[0].today_sales  || 0,
                                    low_stock:     lowStockResult,
                                    accounts:      accResult,
                                    activity_logs: activityResult || []
                                });
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
                            total_stock:   stockResult[0].total_stock || 0,
                            today_sales:   salesResult[0].today_sales || 0,
                            low_stock:     lowStockResult,
                            accounts:      [],
                            activity_logs: []
                        });
                    });
                });
            });
        }
    });
});

router.delete("/:id", (req, res) => {
    const { role, requestingUserID } = req.body;

    if (role !== "Manager")
        return res.status(403).json({ error: "Forbidden" });

    const id = req.params.id;

    if (String(id) === String(requestingUserID))
        return res.status(400).json({ error: "You cannot delete your own account." });

    db.query("SELECT firstname, lastname FROM logindata WHERE accID = ?", [id], (err, result) => {
        const name = result?.[0] ? `${result[0].firstname} ${result[0].lastname}` : `ID ${id}`;

        db.query("DELETE FROM logindata WHERE accID = ?", [id], () => {
            logActivity({
                description: `Deleted account: "${name}"`,
                user_id: requestingUserID ? parseInt(requestingUserID) : null
            });
            res.json({ message: "deleted" });
        });
    });
});

module.exports = router;