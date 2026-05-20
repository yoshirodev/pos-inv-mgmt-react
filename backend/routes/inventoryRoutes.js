const express = require("express");
const router = express.Router();
const db = require("../config/db");
const multer = require("multer");
const path = require("path");
const logActivity = require("../utils/logActivity");

// ── Multer config ─────────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename:    (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"), false);
};
const upload = multer({ storage, fileFilter });

// ── GET /inventory ────────────────────────────────────────────
router.get("/", (req, res) => {
    db.query("SELECT * FROM inventory", (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(result);
    });
});

// ── POST /inventory/create ────────────────────────────────────
router.post("/create", upload.single("image"), (req, res) => {
    const {
        product_name, type, category, brand, serial_number,
        cost, selling_price, quantity, length, width, height,
        description, added_by
    } = req.body;

    const image_path = req.file ? req.file.filename : null;

    const sql = `
        INSERT INTO inventory (
            product_name, type, category, brand, serial_number,
            cost, selling_price, quantity, length, width, height,
            image_path, description, added_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [
        product_name, type, category, brand, serial_number,
        cost, selling_price, quantity, length, width, height,
        image_path, description, added_by || null
    ], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Failed to create product" });
        }

        // ── Activity log ──────────────────────────────────────
        logActivity({
            description: `Added new product: "${product_name}" (Qty: ${quantity}, Price: ₱${selling_price})`,
            inventory_id: result.insertId,
            user_id: added_by || null
        });

        res.json({ message: "Product created successfully" });
    });
});

// ── PUT /inventory/:id ────────────────────────────────────────
router.put("/:id", (req, res) => {
    const productID = req.params.id;
    const userId = req.headers["x-user-id"] || null;
    const {
        product_name, type, category, brand, serial_number,
        cost, selling_price, quantity, length, width, height, description
    } = req.body;

    db.query("SELECT * FROM inventory WHERE id = ?", [productID], (err, result) => {
        if (err)            return res.status(500).json({ message: "Database error" });
        if (!result.length) return res.status(404).json({ message: "Product not found" });

        const c = result[0];
        const val = (newVal, current) =>
            newVal !== undefined && newVal !== null && String(newVal).trim() !== ""
                ? newVal : current;

        const sql = `
            UPDATE inventory
            SET product_name  = ?, type = ?, category = ?, brand = ?,
                serial_number = ?, cost = ?, selling_price = ?, quantity = ?,
                length = ?, width = ?, height = ?, description = ?
            WHERE id = ?
        `;

        db.query(sql, [
            val(product_name, c.product_name), val(type, c.type),
            val(category, c.category),         val(brand, c.brand),
            val(serial_number, c.serial_number), val(cost, c.cost),
            val(selling_price, c.selling_price), val(quantity, c.quantity),
            val(length, c.length),             val(width, c.width),
            val(height, c.height),             description || c.description,
            productID
        ], (err) => {
            if (err) return res.status(500).json({ message: "Update failed" });

            // ── Activity log ──────────────────────────────────
            logActivity({
                description: `Updated product: "${val(product_name, c.product_name)}"`,
                inventory_id: parseInt(productID),
                user_id: userId
            });

            res.json({ message: "updated" });
        });
    });
});

// ── PUT /inventory/:id/add-stock ──────────────────────────────
router.put("/:id/add-stock", (req, res) => {
    const productID = req.params.id;
    const addQty    = parseInt(req.body.quantity, 10);
    const userId    = req.headers["x-user-id"] || null;

    if (isNaN(addQty) || addQty <= 0)
        return res.status(400).json({ message: "Invalid quantity" });

    db.query("SELECT product_name FROM inventory WHERE id = ?", [productID], (err, result) => {
        if (err || !result.length) return res.status(404).json({ message: "Product not found" });

        const productName = result[0].product_name;

        db.query(
            "UPDATE inventory SET quantity = quantity + ? WHERE id = ?",
            [addQty, productID],
            (err) => {
                if (err) return res.status(500).json({ message: "Failed to add stock" });

                // ── Activity log ──────────────────────────────
                logActivity({
                    description: `Added ${addQty} stock to "${productName}"`,
                    inventory_id: parseInt(productID),
                    user_id: userId
                });

                res.json({ message: "Stock added successfully" });
            }
        );
    });
});

// ── DELETE /inventory/:id ─────────────────────────────────────
router.delete("/:id", (req, res) => {
    const role   = req.headers.role;
    const userId = req.headers["x-user-id"] || null;

    if (role !== "Manager")
        return res.status(403).json({ message: "Forbidden" });

    db.query("SELECT product_name FROM inventory WHERE id = ?", [req.params.id], (err, result) => {
        const productName = result?.[0]?.product_name || `ID ${req.params.id}`;

        db.query("DELETE FROM inventory WHERE id = ?", [req.params.id], (err) => {
            if (err) return res.status(500).json({ message: "Delete failed" });

            // ── Activity log ──────────────────────────────────
            logActivity({
                description: `Deleted product: "${productName}"`,
                user_id: userId
                // inventory_id intentionally null — row is gone
            });

            res.json({ message: "deleted" });
        });
    });
});

module.exports = router;