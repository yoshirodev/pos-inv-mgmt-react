const express = require("express");
const router  = express.Router();
const db      = require("../config/db");
const logActivity = require("../utils/logActivity");

// ── GET /components/all ───────────────────────────────────────
router.get("/all", (req, res) => {
    const sql = `
        SELECT c.*, i.product_name
        FROM   components c
        JOIN   inventory  i ON i.id = c.product_id
        ORDER BY c.component_id DESC
    `;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(result);
    });
});

// ── GET /components/:productId ────────────────────────────────
router.get("/:productId", (req, res) => {
    db.query(
        "SELECT * FROM components WHERE product_id = ? ORDER BY component_id DESC",
        [req.params.productId],
        (err, result) => {
            if (err) return res.status(500).json({ message: "Database error" });
            res.json(result);
        }
    );
});

// ── POST /components/create ───────────────────────────────────
router.post("/create", (req, res) => {
    const { product_id, component_name, description, quantity, cost, selling_price } = req.body;
    const added_by = req.headers["x-user-id"] || null;

    const sql = `
        INSERT INTO components
            (product_id, component_name, description, quantity, cost, selling_price, added_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [product_id, component_name, description, quantity, cost, selling_price, added_by], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Failed to create component" });
        }

        // ── Activity log ──────────────────────────────────────
        // Fetch product name for a readable description
        db.query("SELECT product_name FROM inventory WHERE id = ?", [product_id], (e, rows) => {
            const pName = rows?.[0]?.product_name || `Product ID ${product_id}`;
            logActivity({
                description: `Added component "${component_name}" to "${pName}" (Qty: ${quantity})`,
                inventory_id: parseInt(product_id),
                components_id: result.insertId,
                user_id: added_by
            });
        });

        res.json({ message: "Component created successfully" });
    });
});

// ── PUT /components/:id ───────────────────────────────────────
router.put("/:id", (req, res) => {
    const { component_name, description, quantity, cost, selling_price } = req.body;
    const userId = req.headers["x-user-id"] || null;

    db.query(
        "SELECT * FROM components WHERE component_id = ?",
        [req.params.id],
        (err, result) => {
            if (err)            return res.status(500).json({ message: "Database error" });
            if (!result.length) return res.status(404).json({ message: "Component not found" });

            const c   = result[0];
            const val = (newVal, current) =>
                newVal !== undefined && newVal !== null && String(newVal).trim() !== ""
                    ? newVal : current;

            const sql = `
                UPDATE components
                SET component_name = ?, description = ?, quantity = ?,
                    cost = ?, selling_price = ?
                WHERE component_id = ?
            `;

            db.query(sql, [
                val(component_name, c.component_name),
                description !== undefined ? description : c.description,
                val(quantity,       c.quantity),
                val(cost,           c.cost),
                val(selling_price,  c.selling_price),
                req.params.id
            ], (err) => {
                if (err) return res.status(500).json({ message: "Update failed" });

                // ── Activity log ──────────────────────────────
                logActivity({
                    description: `Updated component "${val(component_name, c.component_name)}"`,
                    components_id: parseInt(req.params.id),
                    inventory_id: c.product_id,
                    user_id: userId
                });

                res.json({ message: "Component updated" });
            });
        }
    );
});

// ── DELETE /components/:id ────────────────────────────────────
router.delete("/:id", (req, res) => {
    const userId = req.headers["x-user-id"] || null;

    db.query("SELECT * FROM components WHERE component_id = ?", [req.params.id], (err, result) => {
        const comp = result?.[0];
        const compName = comp?.component_name || `ID ${req.params.id}`;

        db.query("DELETE FROM components WHERE component_id = ?", [req.params.id], (err) => {
            if (err) return res.status(500).json({ message: "Delete failed" });

            // ── Activity log ──────────────────────────────────
            logActivity({
                description: `Deleted component "${compName}"`,
                inventory_id: comp?.product_id || null,
                user_id: userId
                // components_id null — row is gone
            });

            res.json({ message: "Component deleted" });
        });
    });
});

module.exports = router;