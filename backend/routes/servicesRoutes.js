const express = require("express");
const router = express.Router();
const db = require("../config/db");

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

// ── Helper: ISO week number ────────────────────────────────────
function getISOWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// ── Helper: generate CP- reference for cash payments ──────────
function generateCashRef() {
    const ts = Date.now();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `CP-${ts}${rand}`;
}

async function updateSalesFromDB(dateStr, year, month, weekNum) {
    const [day] = await query(
        `SELECT COUNT(*) AS total_transactions,
                COALESCE(SUM(quantity), 0) AS total_items_sold,
                COALESCE(SUM(subtotal),  0) AS total_revenue
         FROM transaction_log WHERE DATE(timestamp) = ?`,
        [dateStr]
    );
    await query(
        `INSERT INTO daily_sales (sales_date, total_transactions, total_items_sold, total_revenue)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
             total_transactions = VALUES(total_transactions),
             total_items_sold   = VALUES(total_items_sold),
             total_revenue      = VALUES(total_revenue)`,
        [dateStr, day.total_transactions, day.total_items_sold, parseFloat(day.total_revenue).toFixed(2)]
    );

    const [week] = await query(
        `SELECT COUNT(*) AS total_transactions,
                COALESCE(SUM(quantity), 0) AS total_items_sold,
                COALESCE(SUM(subtotal),  0) AS total_revenue
         FROM transaction_log
         WHERE YEAR(timestamp) = ? AND WEEK(timestamp, 1) = ?`,
        [year, weekNum]
    );
    await query(
        `INSERT INTO weekly_sales (year, week_number, total_transactions, total_items_sold, total_revenue)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
             total_transactions = VALUES(total_transactions),
             total_items_sold   = VALUES(total_items_sold),
             total_revenue      = VALUES(total_revenue)`,
        [year, weekNum, week.total_transactions, week.total_items_sold, parseFloat(week.total_revenue).toFixed(2)]
    );

    const [mon] = await query(
        `SELECT COUNT(*) AS total_transactions,
                COALESCE(SUM(quantity), 0) AS total_items_sold,
                COALESCE(SUM(subtotal),  0) AS total_revenue
         FROM transaction_log
         WHERE YEAR(timestamp) = ? AND MONTH(timestamp) = ?`,
        [year, month]
    );
    await query(
        `INSERT INTO monthly_sales (year, month, total_transactions, total_items_sold, total_revenue)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
             total_transactions = VALUES(total_transactions),
             total_items_sold   = VALUES(total_items_sold),
             total_revenue      = VALUES(total_revenue)`,
        [year, month, mon.total_transactions, mon.total_items_sold, parseFloat(mon.total_revenue).toFixed(2)]
    );
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
        "SELECT service_ordered, price FROM service_requests WHERE service_id = ?",
        [service_id],
        (err, result) => {
            if (err)            return res.status(500).json({ error: err.message });
            if (!result.length) return res.status(404).json({ error: "Service not found" });

            const service = result[0];

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
        const dateStr = now.toISOString().slice(0, 10);
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const weekNum = getISOWeekNumber(now);

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

        // Update sales summary tables
        try {
            await updateSalesFromDB(dateStr, year, month, weekNum);
        } catch (e) {
            console.error("Sales auto-update error:", e.message);
        }

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