const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET = "secretkey";

// ── POST /api/auth/login ──────────────────────────────────────
router.post("/login", (req, res) => {
    const { username, password } = req.body;

    db.query("SELECT * FROM logindata WHERE username = ?", [username], async (err, result) => {
        if (result.length === 0) return res.json({ error: "Invalid" });

        const user = result[0];

        const match = await bcrypt.compare(password, user.userpassword);
        if (!match) return res.json({ error: "Invalid" });

        const token = jwt.sign(
            { id: user.accID, role: user.accountType },
            SECRET
        );

        res.json({ token, user });
    });
});

// ── POST /api/auth/register ───────────────────────────────────
// Only called from the Manager dashboard — creates a new account
router.post("/register", async (req, res) => {
    const {
        lastname, firstname, middlename,
        birthdate, gender, phonenumber,
        email, username, userpassword, accountType
    } = req.body;

    // Basic validation
    if (!lastname || !firstname || !email || !username || !userpassword || !accountType) {
        return res.status(400).json({ error: "Please fill in all required fields." });
    }

    try {
        // Check if username already exists
        db.query("SELECT accID FROM logindata WHERE username = ?", [username], async (err, result) => {
            if (err) return res.status(500).json({ error: "Database error." });

            if (result.length > 0) {
                return res.status(409).json({ error: "Username already taken." });
            }

            // Hash password
            const hashed = await bcrypt.hash(userpassword, 10);

            const sql = `
                INSERT INTO logindata
                    (lastname, firstname, middlename, birthdate, gender,
                     phonenumber, email, username, userpassword, accountType)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            db.query(sql, [
                lastname, firstname, middlename || "",
                birthdate, gender, phonenumber,
                email, username, hashed, accountType
            ], (err, result) => {
                if (err) return res.status(500).json({ error: "Failed to create account." });
                res.json({ message: "Account created successfully.", accID: result.insertId });
            });
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;