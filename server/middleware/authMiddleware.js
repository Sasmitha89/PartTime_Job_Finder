const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
let token;

if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
) {
    try {
token = req.headers.authorization.split(" ")[1];
const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // contains id & role
next();
    } catch (error) {
return res.status(401).json({ message: "Invalid token" });
    }
} else {
    return res.status(401).json({ message: "No token provided" });
}
};

module.exports = protect;
