const express = require("express");

const { listEmployers, setEmployerVerification } = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/employers", protect, requireAdmin, listEmployers);
router.patch("/employers/:id/verification", protect, requireAdmin, setEmployerVerification);

module.exports = router;
