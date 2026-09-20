const Application = require("../models/application");
const Job = require("../models/job");

// APPLY FOR JOB (Jobseeker only)
// Checks remaining vacancies on the job and immediately assigns the
// applicant if a spot is open, otherwise records the application as
// rejected due to no available space.
exports.applyJob = async (req, res) => {
try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
    return res.status(404).json({ message: "Job not found" });
    }

    const existing = await Application.findByJobAndApplicant(req.params.jobId, req.user.id);
    if (existing) {
    return res.status(400).json({ message: "Already applied", application: existing });
    }

    const assignedCount = await Application.countAssigned(req.params.jobId);
    const hasSpace = assignedCount < (job.vacancies || 1);
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

// VIEW APPLICATIONS (Employer)
exports.getApplications = async (req, res) => {
try {
    const applications = await Application.getAllApplications();
    res.json(applications);
} catch (error) {
    res.status(500).json({ error: error.message });
}
};

exports.updateApplicationStatus = async (req, res) => {
try {
    const { status } = req.body;

    const application = await Application.updateStatus(req.params.id, status);

    if (!application) {
    return res.status(404).json({ message: "Application not found" });
    }

    res.json({ message: "Application status updated", application });
} catch (error) {
    res.status(500).json({ error: error.message });
}
};
