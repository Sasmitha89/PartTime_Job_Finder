const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendMail } = require("../config/mailer");

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
    { id: user.id, role: user.role, isAdmin: user.isAdmin || false },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
    );

    res.json({ token });
} catch (error) {
    res.status(500).json({ error: error.message });
}
};

// FORGOT PASSWORD — always responds the same way whether or not the
// email exists, so this endpoint can't be used to check which emails
// are registered.
exports.forgotPassword = async (req, res) => {
try {
    const { email } = req.body;
    const genericMessage = "If an account with that email exists, a password reset link has been sent.";

    const user = await User.findByEmail(email);
    if (user) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await User.setResetToken(email, tokenHash, expiresAt);

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5500";
    const resetLink = `${clientUrl}/index.html?resetToken=${rawToken}`;

    await sendMail({
        to: email,
        subject: "Reset your Shiftly password",
        text: `We received a request to reset your password.\n\nClick this link to set a new password (valid for 1 hour):\n${resetLink}\n\nIf you didn't request this, you can safely ignore this email.`,
        html: `<p>We received a request to reset your password.</p><p><a href="${resetLink}">Click here to set a new password</a> (valid for 1 hour).</p><p>If you didn't request this, you can safely ignore this email.</p>`
    });
    }

    res.json({ message: genericMessage });
} catch (error) {
    res.status(500).json({ error: error.message });
}
};

// RESET PASSWORD — verifies the token (by hash) and its expiry, then
// sets a new password and invalidates the token so it can't be reused.
exports.resetPassword = async (req, res) => {
try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
    return res.status(400).json({ message: "Token and new password are required" });
    }
    if (newPassword.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findByValidResetToken(tokenHash);
    if (!user) {
    return res.status(400).json({ message: "This reset link is invalid or has expired. Please request a new one." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.resetPassword(user.id, hashedPassword);

    res.json({ message: "Password updated. You can now log in with your new password." });
} catch (error) {
    res.status(500).json({ error: error.message });
}
};
