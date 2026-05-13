const express = require("express");
const router = express.Router();
const db = require("../config/db");
const multer = require("multer");

const path = require("path");

console.log("INVENTORY ROUTES LOADED");

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

// Accept only image files
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed"), false);
    }
};

const upload = multer({
    storage,
    fileFilter
});

router.get("/", (req, res) => {
    db.query("SELECT id, product_name, quantity, type, cost, image_path FROM inventory", (err, result) => {
        res.json(result);
    });
});

router.post("/create", upload.single("image"), (req, res) => {
    const { product_name, cost, quantity, type } = req.body;

    // Uploaded file name (stored in uploads folder)
    const image_path = req.file ? req.file.filename : null;

    const sql = `
        INSERT INTO inventory
        (product_name, cost, quantity, type, image_path)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [product_name, cost, quantity, type, image_path],
        (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    message: "Failed to create product"
                });
            }

            res.json({
                message: "Product created successfully"
            });
        }
    );
});

router.put("/:id", (req, res) => {
    const productID = req.params.id;
    const { product_name, cost, quantity, type } = req.body;

    db.query(
        "SELECT * FROM inventory WHERE id = ?",
        [productID],
        (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Database error" });
            }

            if (result.length === 0) {
                return res.status(404).json({ message: "Product not found" });
            }

            const current = result[0];

            const newName =
                product_name && product_name.trim() !== ""
                    ? product_name
                    : current.product_name;

            const newCost =
                cost !== undefined && cost !== null && cost !== ""
                    ? cost
                    : current.cost;

            const newQty =
                quantity !== undefined && quantity !== null && quantity !== ""
                    ? quantity
                    : current.quantity;

            const newType =
                type && type.trim() !== ""
                    ? type
                    : current.type;

            const sql = `
                UPDATE inventory
                SET product_name = ?, cost = ?, quantity = ?, type = ?
                WHERE id = ?
            `;

            db.query(
                sql,
                [newName, newCost, newQty, newType, productID],
                (err) => {
                    if (err) {
                        return res.status(500).json({ message: "Update failed" });
                    }

                    res.json({ message: "updated" });
                }
            );
        }
    );
});

router.put('/:id/add-stock', (req, res) => {
    const productID = req.params.id;
    const { quantity } = req.body;

    const addQty = parseInt(quantity, 10);

    if (isNaN(addQty) || addQty <= 0) {
        return res.status(400).json({ message: 'Invalid quantity' });
    }

    const sql = `
        UPDATE inventory
        SET quantity = quantity + ?
        WHERE id = ?
    `;

    db.query(sql, [addQty, productID], (err) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to add stock' });
        }

        res.json({ message: 'Stock added successfully' });
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
