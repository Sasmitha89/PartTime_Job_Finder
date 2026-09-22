const express = require("express");

const {
applyJob,
getApplications,
getMyApplications,
updateApplicationStatus
} = require("../controllers/applicationController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
"/mine",
protect,
allowRoles("jobseeker"),
getMyApplications
);

router.post(
"/:jobId",
protect,
allowRoles("jobseeker"),
applyJob
);

router.get(
"/",
protect,
allowRoles("employer"),
getApplications
);

router.put(
"/:id",
protect,
allowRoles("employer"),
updateApplicationStatus
);

module.exports = router;
