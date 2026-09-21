const Job = require("../models/job");

// CREATE JOB (Employer only)
exports.createJob = async (req, res) => {
try {
    const job = await Job.createJob({
    ...req.body,
    postedBy: req.user.id
    });

    res.status(201).json(job);
} catch (error) {
    res.status(500).json({ error: error.message });
}
};

// GET ALL OPEN JOBS (Public)
exports.getJobs = async (req, res) => {
try {
    const jobs = await Job.getAllJobs();
    res.json(jobs);
} catch (error) {
    res.status(500).json({ error: error.message });
}
};

// GET MY JOBS (Employer) — powers the "My Jobs" dashboard
exports.getMyJobs = async (req, res) => {
try {
    const jobs = await Job.getJobsForEmployer(req.user.id);
    res.json(jobs);
} catch (error) {
    res.status(500).json({ error: error.message });
}
};

// UPDATE JOB (Employer, own jobs only)
exports.updateJob = async (req, res) => {
try {
    const job = await Job.findById(req.params.id);
    if (!job) {
    return res.status(404).json({ message: "Job not found" });
    }
    if (job.postedBy !== req.user.id) {
    return res.status(403).json({ message: "Access denied" });
    }

    const updated = await Job.updateJob(req.params.id, req.body);
    res.json(updated);
} catch (error) {
    res.status(500).json({ error: error.message });
}
};

// CLOSE / REOPEN JOB (Employer, own jobs only)
exports.setJobOpenStatus = async (req, res) => {
try {
    const { isOpen } = req.body;
    if (typeof isOpen !== "boolean") {
    return res.status(400).json({ message: "isOpen must be true or false" });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
    return res.status(404).json({ message: "Job not found" });
    }
    if (job.postedBy !== req.user.id) {
    return res.status(403).json({ message: "Access denied" });
    }

    const updated = await Job.setOpenStatus(req.params.id, isOpen);
    res.json({ message: isOpen ? "Job reopened" : "Job closed", job: updated });
} catch (error) {
    res.status(500).json({ error: error.message });
}
};

// DELETE JOB (Employer, own jobs only)
exports.deleteJob = async (req, res) => {
try {
    const job = await Job.findById(req.params.id);
    if (!job) {
    return res.status(404).json({ message: "Job not found" });
    }
    if (job.postedBy !== req.user.id) {
    return res.status(403).json({ message: "Access denied" });
    }

    await Job.deleteJob(req.params.id);
    res.json({ message: "Job deleted" });
} catch (error) {
    res.status(500).json({ error: error.message });
}
};
