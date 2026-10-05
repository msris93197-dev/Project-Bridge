const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teacherController");

router.get("/getData/:userId", teacherController.getData);
router.put("/updateData/:userId", teacherController.updateData);
router.get("/projectRequests/:userId", teacherController.projectRequests);
router.put("/status/:projectId/:studentId", teacherController.updateRequestStatus)
module.exports = router;