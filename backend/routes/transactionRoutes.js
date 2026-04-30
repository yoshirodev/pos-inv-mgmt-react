const express = require("express");
const router = express.Router();
const db = require("../config/db");

let cart = [];

// GET PRODUCTS
router.get("/products", (req, res) => {
    db.query("SELECT product_name FROM inventory", (err, result) => {
        res.json(result);
    });
});

// GET CART
router.get("/cart", (req, res) => {
    res.json(cart);
});

// ADD TO CART (FIXED ROUTE)
router.post("/cart", (req, res) => {
    const { product, quantity } = req.body;

    db.query(
        "SELECT cost, quantity FROM inventory WHERE product_name = ?",
        [product],
        (err, result) => {
            if (err || result.length === 0) {
                return res.json({ error: "Product not found" });
            }

            const data = result[0];

            if (quantity > data.quantity) {
                return res.json({ error: "No Stock Available" });
            }

            const subtotal = data.cost * quantity;

            cart.push({
                product,
                quantity,
                price: data.cost,
                subtotal
            });

            res.json(cart);
        }
    );
});

// DELETE CART ITEM (FIXED)
router.delete("/cart/:index", (req, res) => {
    const index = req.params.index;
    cart.splice(index, 1);
    res.json(cart);
});

// CHECKOUT (UNCHANGED LOGIC)
router.post("/checkout", (req, res) => {
    const { paymethod, amount, refnum } = req.body;

    let total = cart.reduce((sum, i) => sum + i.subtotal, 0);

    if (!paymethod) return res.json({ error: "Select payment method" });

    if ((paymethod === "GCash" || paymethod === "Maya" || paymethod === "MariBank") && !refnum) {
        return res.json({ error: "Reference required" });
    }

    if (amount < total) return res.json({ error: "Insufficient Amount" });

    const change = amount - total;

    db.beginTransaction(err => {
        if (err) return res.json({ error: "Transaction error" });

        let completed = 0;
        let failed = false;

        cart.forEach(item => {

            db.query(
                "UPDATE inventory SET quantity = quantity - ? WHERE product_name = ?",
                [item.quantity, item.product],
                (err) => {
                    if (err && !failed) {
                        failed = true;
                        return db.rollback(() => {
                            res.json({ error: "Inventory update failed" });
                        });
                    }
                }
            );

            db.query(
                "INSERT INTO transaction_log (product_name, quantity, price, payment_method, amount_paid, change_amount, subtotal, reference_number, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())",
                [item.product, item.quantity, item.price, paymethod, amount, change, item.subtotal, refnum],
                (err) => {
                    if (err && !failed) {
                        failed = true;
                        return db.rollback(() => {
                            res.json({ error: "Log insert failed" });
                        });
                    }

                    completed++;

                    if (completed === cart.length && !failed) {
                        db.commit(() => {
                            cart = [];
                            res.json({ message: "success", change });
                        });
                    }
                }
            );
        });
    });
});


// LOGS
router.get("/logs", (req, res) => {
    db.query("SELECT * FROM transaction_log ORDER BY log_id DESC", (err, result) => {
        res.json(result);
    });
});

// SERVICES (UNCHANGED)
router.get("/services", (req, res) => {
    db.query("SELECT * FROM service_requests", (err, result) => {
        res.json(result);
    });
});

router.post("/service-done", (req, res) => {
    const { service_id } = req.body;

    db.query(
        "SELECT service_ordered, price FROM service_requests WHERE service_id = ?",
        [service_id],
        (err, result) => {

            if (err) return res.status(500).json({ error: err.message });

            if (result.length === 0) {
                return res.status(404).json({ error: "Service not found" });
            }

            const service = result[0];

            cart.push({
                product: service.service_ordered,
                quantity: 1,
                price: service.price,
                subtotal: service.price,
                type: "service",
                service_id
            });

            db.query(
                "UPDATE service_requests SET status='Payment' WHERE service_id=?",
                [service_id]
            );

            res.json(cart);
        }
    );
});




module.exports = router;
