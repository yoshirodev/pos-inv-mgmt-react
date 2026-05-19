const express = require("express");
const router  = express.Router();
const db      = require("../config/db");

let cart = [];

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
// Format: CP-<timestamp><4-digit random>
// e.g. CP-17346829341234
function generateCashRef() {
    const ts   = Date.now();
    const rand = Math.floor(1000 + Math.random() * 9000); // 4-digit
    return `CP-${ts}${rand}`;
}

// ── Helper: auto-update sales tables after checkout ────────────
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

// ── GET /transactions/products ─────────────────────────────────
router.get("/products", (req, res) => {
    db.query("SELECT product_name FROM inventory", (err, result) => {
        res.json(result);
    });
});

// ── GET /transactions/cart ─────────────────────────────────────
router.get("/cart", (req, res) => {
    res.json(cart);
});

// ── POST /transactions/cart ────────────────────────────────────
router.post("/cart", async (req, res) => {
    try {
        const { product, quantity } = req.body;
        const qty = Number(quantity);

        const productResult = await query(
            "SELECT id, selling_price, quantity FROM inventory WHERE product_name = ?",
            [product]
        );

        if (!productResult.length)
            return res.json({ error: "Product not found" });

        const prod = productResult[0];

        if (qty > prod.quantity)
            return res.json({ error: "No Stock Available" });

        // Get components linked to this product
        const components = await query(
            `SELECT component_id, component_name, quantity AS comp_stock,
                    selling_price AS comp_price
             FROM components WHERE product_id = ?`,
            [prod.id]
        );

        // Check component stock
        for (const comp of components) {
            if (comp.comp_stock < qty) {
                return res.json({
                    error: `Insufficient component stock: "${comp.component_name}" only has ${comp.comp_stock} left.`
                });
            }
        }

        const componentPricePerUnit = components.reduce(
            (sum, c) => sum + parseFloat(c.comp_price), 0
        );

        const unitPrice = parseFloat(prod.selling_price) + componentPricePerUnit;
        const subtotal  = unitPrice * qty;

        cart.push({
            product,
            quantity:     qty,
            price:        unitPrice,
            subtotal,
            inventory_id: prod.id,
            components:   components.map(c => ({
                component_id:   c.component_id,
                component_name: c.component_name,
                comp_price:     parseFloat(c.comp_price),
            })),
        });

        res.json(cart);

    } catch (err) {
        console.error("Add to cart error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// ── DELETE /transactions/cart/:index ───────────────────────────
router.delete("/cart/:index", (req, res) => {
    cart.splice(req.params.index, 1);
    res.json(cart);
});

// ── POST /transactions/checkout ────────────────────────────────
// Reference number logic:
//   Cash    → refnum is null from frontend → backend generates CP-<timestamp><rand>
//   Online  → refnum is "OP-<input>" from frontend → stored as-is
router.post("/checkout", async (req, res) => {
    try {
        const { paymethod, amount } = req.body;
        let   { refnum }            = req.body;
        const processedBy           = req.headers["x-user-id"] || null;

        const total = cart.reduce((sum, i) => sum + i.subtotal, 0);

        if (!paymethod)
            return res.json({ error: "Select payment method" });

        // Online payments must have OP- reference (frontend already validates + prefixes)
        if (["GCash", "Maya", "MariBank"].includes(paymethod) && !refnum)
            return res.json({ error: "Reference number is required for online payments." });

        if (Number(amount) < total)
            return res.json({ error: "Insufficient Amount" });

        // Cash payment: auto-generate CP- reference
        if (paymethod === "Cash" || !refnum) {
            refnum = generateCashRef();
        }

        const change  = Number(amount) - total;
        const now     = new Date();
        const dateStr = now.toISOString().slice(0, 10);
        const year    = now.getFullYear();
        const month   = now.getMonth() + 1;
        const weekNum = getISOWeekNumber(now);

        const productNames = cart.map(i => `${i.product} (x${i.quantity})`).join(", ");
        const totalQty     = cart.reduce((sum, i) => sum + i.quantity, 0);
        const avgPrice     = totalQty > 0 ? (total / totalQty).toFixed(2) : 0;

        const cartSnapshot = cart.map(i => ({
            product:    i.product,
            quantity:   i.quantity,
            price:      i.price,
            subtotal:   i.subtotal,
            components: i.components,
        }));

        // Run all DB operations in a transaction
        await new Promise((resolve, reject) => {
            db.beginTransaction(async (err) => {
                if (err) return reject(err);

                try {
                    // 1. Deduct product stock
                    for (const item of cart) {
                        await query(
                            "UPDATE inventory SET quantity = quantity - ? WHERE product_name = ?",
                            [item.quantity, item.product]
                        );
                    }

                    // 2. Deduct component stock
                    for (const item of cart) {
                        for (const comp of (item.components || [])) {
                            await query(
                                "UPDATE components SET quantity = quantity - ? WHERE component_id = ?",
                                [item.quantity, comp.component_id]
                            );
                        }
                    }

                    // 3. Insert ONE transaction log row with the formatted reference
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
                            null,
                            productNames,
                            totalQty,
                            avgPrice,
                            paymethod,
                            Number(amount),
                            change,
                            total,
                            refnum,     // CP-... or OP-...
                        ]
                    );

                    db.commit((err) => {
                        if (err) return reject(err);
                        resolve();
                    });

                } catch (innerErr) {
                    db.rollback(() => reject(innerErr));
                }
            });
        });

        cart = [];

        try {
            await updateSalesFromDB(dateStr, year, month, weekNum);
        } catch (e) {
            console.error("Sales auto-update error:", e.message);
        }

        res.json({
            message: "success",
            change,
            items:   cartSnapshot,
            payment: paymethod,
            amount:  Number(amount),
            total,
            refnum,     // send back the final reference (CP- or OP-) for the receipt
        });

    } catch (err) {
        console.error("Checkout error:", err);
        res.status(500).json({ error: err.message });
    }
});

// ── GET /transactions/logs ─────────────────────────────────────
router.get("/logs", (req, res) => {
    db.query("SELECT * FROM transaction_log ORDER BY log_id DESC", (err, result) => {
        res.json(result);
    });
});

module.exports = router;