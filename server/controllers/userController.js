const User = require("../models/user");
const { supabase, RESUME_BUCKET } = require("../config/supabaseStorage");

// GET /api/users/me — the logged-in user's own profile
exports.getMyProfile = async (req, res) => {
  try {
    const profile = await User.getProfile(req.user.id);
    if (!profile) return res.status(404).json({ message: "User not found" });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/users/me — update skills / bio / location
exports.updateMyProfile = async (req, res) => {
  try {
    const { skills, bio, location } = req.body;
    const cleanSkills = Array.isArray(skills)
      ? skills.map((s) => String(s).trim()).filter(Boolean)
      : undefined;

    const updated = await User.updateProfile(req.user.id, {
      skills: cleanSkills,
      bio,
      location
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/users/me/resume — upload/replace the logged-in user's resume (jobseeker only)
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const allowedTypes = ["application/pdf"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: "Only PDF files are allowed" });
    }
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ message: "File must be under 5MB" });
    }

    const path = `${req.user.id}/resume.pdf`;

    const { error: uploadError } = await supabase.storage
      .from(RESUME_BUCKET)
      .upload(path, req.file.buffer, {
        contentType: "application/pdf",
        upsert: true
      });

    if (uploadError) {
      return res.status(500).json({ message: "Upload failed", error: uploadError.message });
    }

    const updated = await User.setResumePath(req.user.id, path);
    res.json({ message: "Resume uploaded successfully", resumePath: updated.resumePath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/users/:id/resume — get a short-lived signed URL to view a resume.
// Allowed for the resume owner themselves, or an employer (checked at the route level).
exports.getResumeUrl = async (req, res) => {
  try {
    const profile = await User.getProfile(req.params.id);
    if (!profile || !profile.resumePath) {
      return res.status(404).json({ message: "No resume on file for this user" });
    }

    const { data, error } = await supabase.storage
      .from(RESUME_BUCKET)
      .createSignedUrl(profile.resumePath, 60 * 5); // valid for 5 minutes

    if (error) {
      return res.status(500).json({ message: "Could not generate resume link", error: error.message });
    }

    res.json({ url: data.signedUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
