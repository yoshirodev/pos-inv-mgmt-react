const db = require("../config/db");

/**
 * logActivity({ description, inventory_id, transaction_id, components_id, user_id })
 * All ID fields are optional — pass only what's relevant.
 */
function logActivity({ description, inventory_id = null, transaction_id = null, components_id = null, user_id = null }) {
    const sql = `
        INSERT INTO activity_log (description, inventory_id, transaction_id, components_id, user_id)
        VALUES (?, ?, ?, ?, ?)
    `;
    db.query(sql, [description, inventory_id, transaction_id, components_id, user_id], (err) => {
        if (err) console.error("Activity log error:", err.message);
    });
}

module.exports = logActivity;