const express = require("express");
const {
createJob,
getJobs,
getMyJobs,
updateJob,
setJobOpenStatus,
deleteJob
} = require("../controllers/jobController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", getJobs);

// NOTE: "/mine" must come before "/:id" routes so Express doesn't try to
// treat "mine" as a job id.
router.get("/mine", protect, allowRoles("employer"), getMyJobs);

router.post(
"/",
protect,
allowRoles("employer"),
createJob
);

router.put("/:id", protect, allowRoles("employer"), updateJob);
router.patch("/:id/status", protect, allowRoles("employer"), setJobOpenStatus);
router.delete("/:id", protect, allowRoles("employer"), deleteJob);

module.exports = router;
