// Like roleMiddleware, this trusts the isAdmin flag baked into the JWT at
// login time. If you promote an account to admin, that account needs to
// log in again for the new token to carry isAdmin: true.
const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

module.exports = requireAdmin;
