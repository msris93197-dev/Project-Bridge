const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

router.get("/getData/:userId", studentController.getData);
router.put("/updateData/:userId", studentController.updateData);
router.get("/getSentRequests/:userId", studentController.getSentRequests);
router.get('/projectBank/:userId',studentController.getProjectsData);
router.get('/getLiked/:studentId', studentController.getLikedProjects);
router.post('/saveLiked/:studentId/:projectId', studentController.saveLikedProjects);
router.delete('/removeLiked/:studentId/:projectId', studentController.deleteLikedProjects);
router.post('/saveDraft/:studentId/:projectId', studentController.saveDrafts);
router.get('/getDraft/:studentId/:projectId', studentController.getDraftDetails);
router.delete('/deleteDraft/:studentId/:projectId', studentController.deleteDraft);
router.get('/getProjectStatus/:studentId/:projectId', studentController.getProjectStatus);
module.exports = router;