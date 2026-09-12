const express = require("express");
const {
createJob,
getJobs
} = require("../controllers/jobController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", getJobs);
router.post(
"/",
protect,
allowRoles("employer"),
createJob
);

module.exports = router;
