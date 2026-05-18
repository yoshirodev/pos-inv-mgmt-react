const express = require("express");
const router  = express.Router();
const db      = require("../config/db");

// ── GET /components/all  ──────────────────────────────────────
// Returns every component joined with its product name (for the "Show All" modal)
router.get("/all", (req, res) => {
    const sql = `
        SELECT  c.*,
                i.product_name
        FROM    components c
        JOIN    inventory  i ON i.id = c.product_id
        ORDER BY c.component_id DESC
    `;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(result);
    });
});

// ── GET /components/:productId  ───────────────────────────────
// Returns all components that belong to a specific product
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

// ── POST /components/create  ──────────────────────────────────
// Creates a new component; added_by comes from the x-user-id header set by the axios interceptor
router.post("/create", (req, res) => {
    const { product_id, component_name, description, quantity, cost, selling_price } = req.body;

    // Pull the user id the axios interceptor attaches on every request
    const added_by = req.headers["x-user-id"] || null;

    const sql = `
        INSERT INTO components
            (product_id, component_name, description, quantity, cost, selling_price, added_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [product_id, component_name, description, quantity, cost, selling_price, added_by], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Failed to create component" });
        }
        res.json({ message: "Component created successfully" });
    });
});

// ── PUT /components/:id  ──────────────────────────────────────
// Updates a component; keeps the existing value when a field is left blank
router.put("/:id", (req, res) => {
    const { component_name, description, quantity, cost, selling_price } = req.body;

    db.query(
        "SELECT * FROM components WHERE component_id = ?",
        [req.params.id],
        (err, result) => {
            if (err)            return res.status(500).json({ message: "Database error" });
            if (!result.length) return res.status(404).json({ message: "Component not found" });

            const c   = result[0];
            const val = (newVal, current) =>
                newVal !== undefined && newVal !== null && String(newVal).trim() !== ""
                    ? newVal
                    : current;

            const sql = `
                UPDATE components
                SET component_name = ?,
                    description    = ?,
                    quantity       = ?,
                    cost           = ?,
                    selling_price  = ?
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
                res.json({ message: "Component updated" });
            });
        }
    );
});

// ── DELETE /components/:id  ───────────────────────────────────
router.delete("/:id", (req, res) => {
    db.query("DELETE FROM components WHERE component_id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ message: "Delete failed" });
        res.json({ message: "Component deleted" });
    });
});

module.exports = router;