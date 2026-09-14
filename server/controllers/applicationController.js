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

    const existing = await Application.findOne({
    job: req.params.jobId,
    applicant: req.user.id
    });

    if (existing) {
    return res.status(400).json({ message: "Already applied", application: existing });
    }

    const assignedCount = await Application.countDocuments({
    job: req.params.jobId,
    status: "assigned"
    });

    const hasSpace = assignedCount < (job.vacancies || 1);
    const status = hasSpace ? "assigned" : "rejected";

    const application = await Application.create({
    job: req.params.jobId,
    applicant: req.user.id,
    status
    });

    res.status(201).json({
    application,
    message: hasSpace
        ? "You have been assigned to this position!"
        : "No available positions left for this job right now."
    });
} catch (error) {
    res.status(500).json({ error: error.message });
}
};

// VIEW APPLICATIONS (Employer)
exports.getApplications = async (req, res) => {
try {
    const applications = await Application.find()
    .populate("job")
    .populate("applicant", "name email");

    res.json(applications);
} catch (error) {
    res.status(500).json({ error: error.message });
}
};
exports.updateApplicationStatus = async (req, res) => {
try {
    const { status } = req.body;

    const application = await Application.findById(req.params.id);

    if (!application) {
    return res.status(404).json({ message: "Application not found" });
    }

    application.status = status;
    await application.save();

    res.json({ message: "Application status updated", application });
} catch (error) {
    res.status(500).json({ error: error.message });
}
};