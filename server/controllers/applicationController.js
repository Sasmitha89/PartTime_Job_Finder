const Application = require("../models/application");

// APPLY FOR JOB (Jobseeker only)
exports.applyJob = async (req, res) => {
try {
    const existing = await Application.findOne({
    job: req.params.jobId,
    applicant: req.user.id
    });

    if (existing) {
    return res.status(400).json({ message: "Already applied" });
    }

    const application = await Application.create({
    job: req.params.jobId,
    applicant: req.user.id
    });

    res.status(201).json(application);
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