const Job = require("../models/job");

// CREATE JOB (Employer only)
exports.createJob = async (req, res) => {
try {
    const job = await Job.create({
    ...req.body,
    postedBy: req.user.id
    });

    res.status(201).json(job);
} catch (error) {
    res.status(500).json({ error: error.message });
}
};

// GET ALL JOBS (Public)
exports.getJobs = async (req, res) => {
try {
    const jobs = await Job.find().populate("postedBy", "name email");
    res.json(jobs);
} catch (error) {
    res.status(500).json({ error: error.message });
}
};
