const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const { requireRole, ownerOnly } = require("../middleware/auth");

router.use(requireRole("student"));

router.get("/getData/:userId", ownerOnly("userId"), studentController.getData);
router.put("/updateData/:userId", ownerOnly("userId"), studentController.updateData);
router.get("/getSentRequests/:userId", ownerOnly("userId"), studentController.getSentRequests);
router.get('/projectBank/:userId',ownerOnly("userId"), studentController.getProjectsData);
router.get('/getLiked/:studentId', ownerOnly("studentId"), studentController.getLikedProjects);
router.post('/saveLiked/:studentId/:projectId', ownerOnly("studentId"), studentController.saveLikedProjects);
router.delete('/removeLiked/:studentId/:projectId', ownerOnly("studentId"), studentController.deleteLikedProjects);
router.post('/saveDraft/:studentId/:projectId', ownerOnly("studentId"), studentController.saveDrafts);
router.get('/getDraft/:studentId/:projectId', ownerOnly("studentId"), studentController.getDraftDetails);
router.delete('/deleteDraft/:studentId/:projectId', ownerOnly("studentId"), studentController.deleteDraft);
router.get('/getProjectStatus/:studentId/:projectId', ownerOnly("studentId"), studentController.getProjectStatus);
module.exports = router;