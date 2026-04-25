const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET = "secretkey";

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

module.exports = router;
