const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// REGISTER (same as Laravel CusRegister)
exports.register = async (req, res) => {
    const { name, phone, password } = req.body;

    if (!name || !phone || !password) {
        return res.status(400).json({ message: "All fields required" });
    }

    // check unique phone
    const [exist] = await db.query("SELECT * FROM users WHERE phone = ?", [phone]);
    if (exist.length > 0) {
        return res.status(400).json({ message: "Phone already exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    await db.query(
        "INSERT INTO users (name, phone, password) VALUES (?, ?, ?)",
        [name, phone, hash]
    );

    res.json({ message: "Register success" });
};

// LOGIN (same as CusLogin)
exports.login = async (req, res) => {
    const { phone, password } = req.body;

    const [rows] = await db.query("SELECT * FROM users WHERE phone = ?", [phone]);

    if (rows.length === 0) {
        return res.status(401).json({ message: "Invalid phone or password" });
    }

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
        return res.status(401).json({ message: "Invalid phone or password" });
    }

    const token = jwt.sign({ id: user.id }, "secretkey", { expiresIn: "1d" });

    res.json({
        message: "Login success",
        token,
        user
    });
};

// LOGOUT
exports.logout = (req, res) => {
    res.json({ message: "Logout success" });
};