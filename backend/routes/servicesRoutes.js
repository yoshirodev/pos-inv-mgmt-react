const express = require("express");
const router = express.Router();
const db = require("../config/db");

const logActivity = require("../utils/logActivity");

let serviceCart = [];

// ── Helper: promisify db.query ─────────────────────────────────
function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}


// ── Helper: generate CP- reference for cash payments ──────────
function generateCashRef() {
    const ts = Date.now();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `CP-${ts}${rand}`;
}



// ── GET /services/all ──────────────────────────────────────────
// Joins service_requests with service_personel to get personnel name
router.get("/all", (req, res) => {
    db.query(
        `SELECT sr.*,
                CONCAT(sp.first_name, ' ', sp.last_name) AS personel_name
         FROM service_requests sr
         LEFT JOIN service_personel sp ON sr.perso_id = sp.perso_id
         ORDER BY sr.service_id DESC`,
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(result);
        }
    );
});

// ── GET /services/cart ─────────────────────────────────────────
router.get("/cart", (req, res) => {
    res.json(serviceCart);
});

// ── DELETE /services/cart/:index ───────────────────────────────
router.delete("/cart/:index", (req, res) => {
    serviceCart.splice(req.params.index, 1);
    res.json(serviceCart);
});

// ── POST /services/service-done ────────────────────────────────
router.post("/service-done", (req, res) => {
    const { service_id } = req.body;

    db.query(
        "SELECT service_ordered, price, perso_id FROM service_requests WHERE service_id = ?",
        [service_id],
        (err, result) => {
            if (err)            return res.status(500).json({ error: err.message });
            if (!result.length) return res.status(404).json({ error: "Service not found" });

            const service = result[0];

            if (!service.perso_id) {
                return res.status(400).json({
                    error: "Assign a service personnel first."
                });
            }

            serviceCart.push({
                product:      service.service_ordered,
                quantity:     1,
                price:        service.price,
                subtotal:     service.price,
                type:         "service",
                service_id:   parseInt(service_id),
                inventory_id: null,
            });

            db.query(
                "UPDATE service_requests SET status = 'Payment' WHERE service_id = ?",
                [service_id],
                (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json(serviceCart);
                }
            );
        }
    );
});

// ── PATCH /services/assign-personel ───────────────────────────
// Auto-saves personnel assignment when dropdown changes
router.patch("/assign-personel", (req, res) => {
    const { service_id, perso_id } = req.body;

    if (!service_id) return res.status(400).json({ error: "service_id required" });

    db.query(
        "UPDATE service_requests SET perso_id = ? WHERE service_id = ?",
        [perso_id || null, service_id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Personnel assigned" });
        }
    );
});

router.post("/checkout", async (req, res) => {
    try {
        const { paymethod, amount } = req.body;
        let { refnum } = req.body;
        const processedBy = req.headers["x-user-id"] || null;

        const total = serviceCart.reduce(
            (sum, i) => sum + Number(i.subtotal),
            0
        );

        if (!paymethod)
            return res.json({ error: "Select payment method" });

        // Online payments require reference number
        if (
            ["GCash", "Maya", "MariBank"].includes(paymethod) &&
            !refnum
        ) {
            return res.json({
                error: "Reference number is required for online payments."
            });
        }

        if (Number(amount) < total)
            return res.json({ error: "Insufficient Amount" });

        // Cash payment → auto-generate CP- reference
        if (paymethod === "Cash" || !refnum) {
            refnum = generateCashRef();
        }

        const change = Number(amount) - total;
        const now = new Date();

        await new Promise((resolve, reject) => {
            db.beginTransaction(async (err) => {
                if (err) return reject(err);

                try {
                    // Insert one transaction row per service item
                    for (const item of serviceCart) {
                        await query(
                            `INSERT INTO transaction_log
                                (inventory_id, processed_by, service_id,
                                 product_name, quantity, price,
                                 payment_method, amount_paid, change_amount,
                                 subtotal, reference_number, timestamp)
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                            [
                                null,
                                processedBy,
                                item.service_id || null,
                                item.product,
                                item.quantity,
                                item.price,
                                paymethod,
                                Number(amount),
                                change,
                                item.subtotal,
                                refnum, // CP-... or OP-...
                            ]
                        );

                        // Mark service as fully paid
                        if (item.service_id) {
                            await query(
                                `UPDATE service_requests
                                 SET status = 'Done'
                                 WHERE service_id = ?`,
                                [item.service_id]
                            );
                        }
                    }

                    db.commit((err) => {
                        if (err) return reject(err);
                        resolve();
                    });
                } catch (innerErr) {
                    db.rollback(() => reject(innerErr));
                }
            });
        });

        // Snapshot before clearing cart
        const cartSnapshot = [...serviceCart];

        // Clear cart
        serviceCart = [];

        logActivity({
            description: `Service transaction: ${cartSnapshot.map(i => i.product).join(", ")} — Total ₱${total.toFixed(2)} via ${paymethod} (Ref: ${refnum})`,
            user_id: processedBy ? parseInt(processedBy) : null
        });

        res.json({
            message: "success",
            change,
            items: cartSnapshot,
            payment: paymethod,
            amount: Number(amount),
            total,
            refnum, // send back generated/stored reference
        });

    } catch (err) {
        console.error("Service checkout error:", err);
        res.status(500).json({ error: err.message });
    }
});

// ══════════════════════════════════════════════════════════════
//  SERVICE PERSONNEL ROUTES
// ══════════════════════════════════════════════════════════════

// ── GET /services/personel ─────────────────────────────────────
router.get("/personel", (req, res) => {
    db.query(
        "SELECT * FROM service_personel ORDER BY perso_id DESC",
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(result);
        }
    );
});

// ── POST /services/personel ────────────────────────────────────
router.post("/personel", (req, res) => {
    const { first_name, last_name, email, phone_no } = req.body;

    if (!first_name || !last_name)
        return res.status(400).json({ error: "First name and last name are required" });

    db.query(
        "INSERT INTO service_personel (first_name, last_name, email, phone_no) VALUES (?, ?, ?, ?)",
        [first_name, last_name, email || null, phone_no || null],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            logActivity({
                description: `Added service personnel: "${first_name} ${last_name}"`,
                user_id: req.headers["x-user-id"] ? parseInt(req.headers["x-user-id"]) : null
            });

            res.json({ message: "Personnel created", perso_id: result.insertId });
        }
    );


});

// ── DELETE /services/personel/:id ─────────────────────────────
router.delete("/personel/:id", (req, res) => {
    const { id } = req.params;

    // Nullify FK in service_requests before deleting
    db.query(
        "UPDATE service_requests SET perso_id = NULL WHERE perso_id = ?",
        [id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });

            db.query(
                "DELETE FROM service_personel WHERE perso_id = ?",
                [id],
                (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ message: "Personnel deleted" });
                }
            );
        }
    );
});

module.exports = router;