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

        const components = await query(
            `SELECT component_id, component_name, quantity AS comp_stock,
                    selling_price AS comp_price
             FROM components WHERE product_id = ?`,
            [prod.id]
        );

        for (const comp of components) {
            if (comp.comp_stock < qty) {
                return res.json({
                    error: `Insufficient component stock: "${comp.component_name}" only has ${comp.comp_stock} left.`
                });
            }
        }

        // Parent row — price is product only (no component price rolled in)
        const parentIndex = cart.length;
        cart.push({
            product,
            quantity:     qty,
            price:        parseFloat(prod.selling_price),
            subtotal:     parseFloat(prod.selling_price) * qty,
            inventory_id: prod.id,
            isComponent:  false,
            parentIndex:  null,
        });

        // One row per component
        for (const comp of components) {
            cart.push({
                product:      comp.component_name,
                quantity:     qty,
                price:        parseFloat(comp.comp_price),
                subtotal:     parseFloat(comp.comp_price) * qty,
                inventory_id: null,
                component_id: comp.component_id,
                isComponent:  true,
                parentIndex,          // points back to the parent row
            });
        }

        res.json(cart);

    } catch (err) {
        console.error("Add to cart error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// ── DELETE /transactions/cart/:index ───────────────────────────
router.delete("/cart/:index", (req, res) => {
    const idx = Number(req.params.index);
    const item = cart[idx];

    if (!item) return res.json(cart);

    let indicesToRemove;

    if (!item.isComponent) {
        // Removing a parent: also remove all its children
        indicesToRemove = new Set(
            [idx, ...cart
                .map((c, i) => (c.isComponent && c.parentIndex === idx ? i : -1))
                .filter(i => i !== -1)]
        );
    } else {
        // Removing a single component
        indicesToRemove = new Set([idx]);
    }

    // Rebuild cart without removed indices, fix up parentIndex references
    const newCart = [];
    const indexMap = {}; // old index → new index
    cart.forEach((item, oldIdx) => {
        if (!indicesToRemove.has(oldIdx)) {
            indexMap[oldIdx] = newCart.length;
            newCart.push(item);
        }
    });

    // Remap parentIndex
    newCart.forEach(item => {
        if (item.isComponent && item.parentIndex !== null) {
            item.parentIndex = indexMap[item.parentIndex] ?? null;
        }
    });

    cart = newCart;
    res.json(cart);
});

// ── DELETE /transactions/cart/:index ───────────────────────────
router.delete("/cart/:index", (req, res) => {
    cart.splice(req.params.index, 1);
    res.json(cart);
});

// ── POST /transactions/checkout ────────────────────────────────
router.post("/checkout", async (req, res) => {
    try {
        const { paymethod, amount } = req.body;
        let   { refnum }            = req.body;
        const processedBy           = req.headers["x-user-id"] || null;

        const total = cart.reduce((sum, i) => sum + i.subtotal, 0);

        if (!paymethod)
            return res.json({ error: "Select payment method" });

        if (["GCash", "Maya", "MariBank"].includes(paymethod) && !refnum)
            return res.json({ error: "Reference number is required for online payments." });

        if (Number(amount) < total)
            return res.json({ error: "Insufficient Amount" });

        if (paymethod === "Cash" || !refnum) {
            refnum = generateCashRef();
        }

        const change  = Number(amount) - total;
        const now     = new Date();
        const dateStr = now.toISOString().slice(0, 10);
        const year    = now.getFullYear();
        const month   = now.getMonth() + 1;
        const weekNum = getISOWeekNumber(now);

        // Build product name string: "ProductA (x2) [CompA, CompB], ProductB (x1)"
        const parents = cart.filter(i => !i.isComponent);
        const productNameStr = parents.map(parent => {
            const parentIdx = cart.indexOf(parent);
            const children  = cart
                .filter(c => c.isComponent && c.parentIndex === parentIdx)
                .map(c => c.product);
            return children.length
                ? `${parent.product} (x${parent.quantity}) [${children.join(", ")}]`
                : `${parent.product} (x${parent.quantity})`;
        }).join(", ");

        const totalQty = parents.reduce((sum, i) => sum + i.quantity, 0);
        const avgPrice = totalQty > 0 ? (total / totalQty).toFixed(2) : 0;

        const cartSnapshot = cart.map(i => ({ ...i }));

        await new Promise((resolve, reject) => {
            db.beginTransaction(async (err) => {
                if (err) return reject(err);
                try {
                    // Deduct product inventory
                    for (const item of cart.filter(i => !i.isComponent)) {
                        await query(
                            "UPDATE inventory SET quantity = quantity - ? WHERE id = ?",
                            [item.quantity, item.inventory_id]
                        );
                    }
                    // Deduct component inventory
                    for (const item of cart.filter(i => i.isComponent)) {
                        await query(
                            "UPDATE components SET quantity = quantity - ? WHERE component_id = ?",
                            [item.quantity, item.component_id]
                        );
                    }
                    // Single log row
                    await query(
                        `INSERT INTO transaction_log
                            (inventory_id, processed_by, service_id,
                             product_name, quantity, price,
                             payment_method, amount_paid, change_amount,
                             subtotal, reference_number, timestamp)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                        [null, processedBy, null,
                         productNameStr, totalQty, avgPrice,
                         paymethod, Number(amount), change, total, refnum]
                    );
                    db.commit(err => { if (err) return reject(err); resolve(); });
                } catch (innerErr) {
                    db.rollback(() => reject(innerErr));
                }
            });
        });

        cart = [];

        try { await updateSalesFromDB(dateStr, year, month, weekNum); }
        catch (e) { console.error("Sales auto-update error:", e.message); }

        res.json({
            message: "success", change,
            items: cartSnapshot, payment: paymethod,
            amount: Number(amount), total, refnum,
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