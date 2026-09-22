const Application = require("../models/application");
const Job = require("../models/job");

// APPLY FOR JOB (Jobseeker only)
// Auto-review jobs: checks vacancies and immediately assigns/rejects, as before.
// Manual-review jobs: always goes to "pending" for the employer to decide.
exports.applyJob = async (req, res) => {
try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
    return res.status(404).json({ message: "Job not found" });
    }
    if (!job.isOpen) {
    return res.status(400).json({ message: "This job is no longer accepting applications" });
    }

    const existing = await Application.findByJobAndApplicant(req.params.jobId, req.user.id);
    if (existing) {
    return res.status(400).json({ message: "Already applied", application: existing });
    }

    if (job.reviewMode === "manual") {
    const application = await Application.createApplication({
        jobId: req.params.jobId,
        applicantId: req.user.id,
        status: "pending"
    });

    return res.status(201).json({
        application,
        message: "Application submitted! The employer will review it."
    });
    }

    // Auto-review (default) path — unchanged vacancy-based logic.
    const filledCount = await Application.countFilledSlots(req.params.jobId);
    const hasSpace = filledCount < (job.vacancies || 1);
    const status = hasSpace ? "assigned" : "rejected";

    const application = await Application.createApplication({
    jobId: req.params.jobId,
    applicantId: req.user.id,
    status
    });

    res.status(201).json({
    application,
    message: hasSpace
        ? "You have been assigned to this position!"
        : "No available positions left for this job right now."
    });
} catch (error) {
    // 23505 = unique_violation — the DB-level safety net for duplicate applications
    if (error.code === "23505") {
    return res.status(400).json({ message: "Already applied" });
    }
    res.status(500).json({ error: error.message });
}
};

// VIEW MY APPLICATIONS (Jobseeker) — every application this jobseeker has made
exports.getMyApplications = async (req, res) => {
try {
    const applications = await Application.getApplicationsForApplicant(req.user.id);
    res.json(applications);
} catch (error) {
    res.status(500).json({ error: error.message });
}
};

// VIEW APPLICATIONS (Employer) — only for jobs this employer posted
exports.getApplications = async (req, res) => {
try {
    const applications = await Application.getApplicationsForEmployer(req.user.id);
    res.json(applications);
} catch (error) {
    res.status(500).json({ error: error.message });
}
};

// UPDATE APPLICATION STATUS (Employer, manual-review flow: pending -> accepted/rejected)
// Verifies the employer actually owns the job this application belongs to,
// and — when accepting — that a vacancy is actually still open.
exports.updateApplicationStatus = async (req, res) => {
try {
    const { status } = req.body;
    const allowedStatuses = ["pending", "accepted", "rejected"];
    if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
    }

    const application = await Application.findByIdWithJob(req.params.id);
    if (!application) {
    return res.status(404).json({ message: "Application not found" });
    }

    if (application.jobPostedBy !== req.user.id) {
    return res.status(403).json({ message: "Access denied" });
    }

    if (status === "accepted") {
    const filledCount = await Application.countFilledSlots(application.jobId);
    if (filledCount >= (application.jobVacancies || 1)) {
        return res.status(400).json({ message: "No positions left for this job" });
    }
    }

    const updated = await Application.updateStatus(req.params.id, status);
    res.json({ message: "Application status updated", application: updated });
} catch (error) {
    res.status(500).json({ error: error.message });
}
};
