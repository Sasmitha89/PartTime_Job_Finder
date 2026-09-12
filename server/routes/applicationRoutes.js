const express = require("express");

const {
applyJob,
getApplications,
updateApplicationStatus
} = require("../controllers/applicationController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

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
