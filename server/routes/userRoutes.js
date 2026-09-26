const express = require("express");
const multer = require("multer");

const {
  getMyProfile,
  updateMyProfile,
  uploadResume,
  getResumeUrl,
  requestVerification
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Keep the file in memory only — we stream it straight to Supabase Storage,
// never write it to disk on the server itself.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateMyProfile);
router.post("/me/request-verification", protect, allowRoles("employer"), requestVerification);
router.post("/me/resume", protect, allowRoles("jobseeker"), upload.single("resume"), uploadResume);

// A resume can be viewed by its owner, or by an employer reviewing applicants.
router.get("/:id/resume", protect, (req, res, next) => {
  const isOwner = req.user.id === req.params.id;
  const isEmployer = req.user.role === "employer";
  if (!isOwner && !isEmployer) {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
}, getResumeUrl);

module.exports = router;
