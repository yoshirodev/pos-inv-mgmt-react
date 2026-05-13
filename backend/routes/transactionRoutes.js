const express = require("express");
const router = express.Router();
const db = require("../config/db");

let cart = [];

//  GET PRODUCTS 
router.get("/products", (req, res) => {
    db.query("SELECT product_name FROM inventory", (err, result) => {
        res.json(result);
    });
});

//  GET CART 
router.get("/cart", (req, res) => {
    res.json(cart);
});

//  ADD TO CART 
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

            cart.push({ product, quantity, price: data.cost, subtotal });

            res.json(cart);
        }
    );
});

//  DELETE CART ITEM 
router.delete("/cart/:index", (req, res) => {
    const index = req.params.index;
    cart.splice(index, 1);
    res.json(cart);
});

//  CHECKOUT 
router.post("/checkout", (req, res) => {
    const { paymethod, amount, refnum } = req.body;

    const total = cart.reduce((sum, i) => sum + i.subtotal, 0);

    if (!paymethod) return res.json({ error: "Select payment method" });

    if (["GCash", "Maya", "MariBank"].includes(paymethod) && !refnum) {
        return res.json({ error: "Reference required" });
    }

    if (amount < total) return res.json({ error: "Insufficient Amount" });

    const change = amount - total;

    db.beginTransaction(err => {
        if (err) return res.json({ error: "Transaction error" });

        let completed = 0;
        let failed = false;

        cart.forEach(item => {

            // Only deduct inventory for product items, not services
            if (item.type !== "service") {
                db.query(
                    "UPDATE inventory SET quantity = quantity - ? WHERE product_name = ?",
                    [item.quantity, item.product],
                    (err) => {
                        if (err && !failed) {
                            failed = true;
                            return db.rollback(() => res.json({ error: "Inventory update failed" }));
                        }
                    }
                );
            }

            // Log every item (product or service) to transaction_log
            db.query(
                `INSERT INTO transaction_log
                    (product_name, quantity, price, payment_method, amount_paid, change_amount, subtotal, reference_number, timestamp)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                [item.product, item.quantity, item.price, paymethod, amount, change, item.subtotal, refnum || null],
                (err) => {
                    if (err && !failed) {
                        failed = true;
                        return db.rollback(() => res.json({ error: "Log insert failed" }));
                    }

                    // If this cart item is a service, mark it as Done now that it's paid
                    if (item.type === "service" && item.service_id) {
                        db.query(
                            "UPDATE service_requests SET status = 'Done' WHERE service_id = ?",
                            [item.service_id],
                            (err) => {
                                if (err && !failed) {
                                    failed = true;
                                    return db.rollback(() => res.json({ error: "Service status update failed" }));
                                }
                            }
                        );
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

//  LOGS 
router.get("/logs", (req, res) => {
    db.query("SELECT * FROM transaction_log ORDER BY log_id DESC", (err, result) => {
        res.json(result);
    });
});

//  GET SERVICES 
router.get("/services", (req, res) => {
    db.query("SELECT * FROM service_requests ORDER BY service_id DESC", (err, result) => {
        res.json(result);
    });
});

//  SERVICE DONE 
router.post("/service-done", (req, res) => {
    const { service_id } = req.body;

    db.query(
        "SELECT service_ordered, price FROM service_requests WHERE service_id = ?",
        [service_id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.length === 0) return res.status(404).json({ error: "Service not found" });

            const service = result[0];

            cart.push({
                product:    service.service_ordered,
                quantity:   1,
                price:      service.price,
                subtotal:   service.price,
                type:       "service",
                service_id: parseInt(service_id),
            });

            // Mark as "Payment" — awaiting cashier checkout
            db.query(
                "UPDATE service_requests SET status = 'Payment' WHERE service_id = ?",
                [service_id],
                (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json(cart);
                }
            );
        }
    );
});

module.exports = router;