const User = require("../models/user");

// GET /api/admin/employers — every employer, pending requests first
exports.listEmployers = async (req, res) => {
  try {
    const employers = await User.getEmployersForAdmin();
    res.json(employers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PATCH /api/admin/employers/:id/verification — set an employer's verification status
exports.setEmployerVerification = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["unverified", "pending", "verified", "rejected"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await User.setVerificationStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ message: "Employer not found" });
    }

    res.json({ message: "Verification status updated", employer: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
