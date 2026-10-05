const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teacherController");
const { requireRole, ownerOnly, ownsProject } = require("../middleware/auth");

router.use(requireRole("teacher"));

router.get("/getData/:userId", ownerOnly("userId"), teacherController.getData);
router.put("/updateData/:userId", ownerOnly("userId"), teacherController.updateData);
router.get("/projectRequests/:userId", ownerOnly("userId"), teacherController.projectRequests);
router.put("/status/:projectId/:studentId", ownsProject, teacherController.updateRequestStatus);

module.exports = router;
