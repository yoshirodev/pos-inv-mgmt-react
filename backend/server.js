const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "waterapp",
});

// Connection to MySQL
db.connect(err => {
    if (err) {
        console.log("MySQL Connection Error:", err);
    } else {
        console.log("MySQL Connected!");
    }
});

// Read
app.get('/posts', (req, res) => {
    db.query("SELECT * FROM posts ORDER BY post_id DESC", (err, results) => {
        if (err) throw err;
            res.json(results);
    }); 
});

// Create
app.post("/posts", (req, res) => {
    const { content, date_time } = req.body;
    db.query("INSERT INTO posts (content, date_time) VALUES (?, ?)", [content, date_time], (err, result) => {
        if (err) return res.json({ error: err });
        res.json({ message: "Post added successfully" });
    });
});

app.listen(8082, () => {
  console.log("Server running on port 8081");
});