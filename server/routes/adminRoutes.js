const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

router.get("/projects-per-department", adminController.getProjectsPerDepartment);
router.get("/avg-requests-per-department", adminController.getAvgRequestsPerDepartment);
router.get("/project-type-counts", adminController.getProjectTypeCounts);
router.get("/project-type-counts-by-department", adminController.getProjectTypeCountsByDepartment);
router.get("/slot-counts-by-department", adminController.getSlotCountsByDepartment);
router.get("/getusercount",adminController.getUserCount);
module.exports = router;
