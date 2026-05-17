const express = require("express");
const router = express.Router();
const db = require("../config/db");
const multer = require("multer");
const path = require("path");

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
        cost, selling_price, quantity, length, width, height, description
    } = req.body;

    const image_path = req.file ? req.file.filename : null;

    const sql = `
        INSERT INTO inventory (
            product_name, type, category, brand, serial_number,
            cost, selling_price, quantity, length, width, height, image_path, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [
        product_name, type, category, brand, serial_number,
        cost, selling_price, quantity, length, width, height, image_path, description
    ], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Failed to create product" });
        }
        res.json({ message: "Product created successfully" });
    });
});

// ── PUT /inventory/:id ────────────────────────────────────────
// Updates ALL fields, keeps existing value if field is left blank
router.put("/:id", (req, res) => {
    const productID = req.params.id;
    const {
        product_name, type, category, brand, serial_number,
        cost, selling_price, quantity, length, width, height, description
    } = req.body;


    console.log("DESCRIPTION:", description);

    db.query("SELECT * FROM inventory WHERE id = ?", [productID], (err, result) => {
        if (err)               return res.status(500).json({ message: "Database error" });
        if (!result.length)    return res.status(404).json({ message: "Product not found" });

        const c = result[0]; // current values

        // Use submitted value if provided, otherwise keep current
        const val = (newVal, current) =>
            newVal !== undefined && newVal !== null && String(newVal).trim() !== ""
                ? newVal
                : current;

        const sql = `
            UPDATE inventory
            SET product_name  = ?,
                type          = ?,
                category      = ?,
                brand         = ?,
                serial_number = ?,
                cost          = ?,
                selling_price = ?,
                quantity      = ?,
                length        = ?,
                width         = ?,
                height        = ?,
                description   = ?
            WHERE id = ?
        `;

        db.query(sql, [
            val(product_name,  c.product_name),
            val(type,          c.type),
            val(category,      c.category),
            val(brand,         c.brand),
            val(serial_number, c.serial_number),
            val(cost,          c.cost),
            val(selling_price, c.selling_price),
            val(quantity,      c.quantity),
            val(length,        c.length),
            val(width,         c.width),
            val(height,        c.height),
             description || c.description,
            productID
        ], (err) => {
            if (err) return res.status(500).json({ message: "Update failed" });
            res.json({ message: "updated" });
        });
    });
});

// ── PUT /inventory/:id/add-stock ──────────────────────────────
router.put("/:id/add-stock", (req, res) => {
    const productID = req.params.id;
    const addQty    = parseInt(req.body.quantity, 10);

    if (isNaN(addQty) || addQty <= 0)
        return res.status(400).json({ message: "Invalid quantity" });

    db.query(
        "UPDATE inventory SET quantity = quantity + ? WHERE id = ?",
        [addQty, productID],
        (err) => {
            if (err) return res.status(500).json({ message: "Failed to add stock" });
            res.json({ message: "Stock added successfully" });
        }
    );
});

// ── DELETE /inventory/:id ─────────────────────────────────────
router.delete("/:id", (req, res) => {
    const role = req.headers.role;

    if (role !== "Manager")
        return res.status(403).json({ message: "Forbidden" });

    db.query("DELETE FROM inventory WHERE id = ?", [req.params.id], () => {
        res.json({ message: "deleted" });
    });
});

module.exports = router;