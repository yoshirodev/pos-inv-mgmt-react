const express = require("express");
const router = express.Router();
const db = require("../config/db");

console.log("INVENTORY ROUTES LOADED");

router.get("/", (req, res) => {
    db.query("SELECT id, product_name, quantity, type, cost, image_path FROM inventory", (err, result) => {
        res.json(result);
    });
});

router.post("/create", (req, res) => {
    const { product_name, cost, quantity, type } = req.body;

    const sql = "INSERT INTO inventory (product_name, cost, quantity, type) VALUES (?, ?, ?, ?)";
    db.query(sql, [product_name, cost, quantity, type], () => {
        res.json({ message: "created" });
    });
});

router.put("/:id", (req, res) => {
    console.log("UPDATE HIT:", req.params.id);

    const productID = req.params.id;
    const { product_name, cost, quantity, type } = req.body;

    db.query("SELECT * FROM inventory WHERE id = ?", [productID], (err, result) => {
        if (err || result.length === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        const current = result[0];

        const newName = product_name ?? current.product_name;
        const newCost = cost ?? current.cost;
        const newQty = quantity ?? current.quantity;
        const newType = type ?? current.type;

        const sql = `
            UPDATE inventory 
            SET product_name=?, cost=?, quantity=?, type=? 
            WHERE id=?
        `;

        db.query(sql, [newName, newCost, newQty, newType, productID], () => {
            res.json({ message: "updated" });
        });
    });
});




router.delete("/:id", (req, res) => {
    const role = req.headers.role;

    if (role !== "Manager") {
        return res.status(403).json({ message: "Forbidden" });
    }

    db.query("DELETE FROM inventory WHERE id = ?", [req.params.id], () => {
        res.json({ message: "deleted" });
    });
});

module.exports = router;
