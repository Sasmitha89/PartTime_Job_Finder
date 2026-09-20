const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// REGISTER
exports.registerUser = async (req, res) => {
try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findByEmail(email);
    if (userExists) {
    return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.createUser({
    name,
    email,
    password: hashedPassword,
    role
    });

    res.status(201).json({ message: "User registered successfully" });
} catch (error) {
    res.status(500).json({ error: error.message });
}
};

// LOGIN
exports.loginUser = async (req, res) => {
try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
    return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
    );

    res.json({ token });
} catch (error) {
    res.status(500).json({ error: error.message });
}
};
