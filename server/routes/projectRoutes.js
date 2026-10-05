const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const { requireRole, ownerOnly, ownsProject } = require("../middleware/auth");

router.use(requireRole("teacher"));

router.post("/saveProject/:teacherId", ownerOnly("teacherId"), projectController.saveProject);
router.put("/updateProject/:projectId", ownsProject, projectController.updateProject);
router.delete("/deleteProject/:projectId", ownsProject, projectController.deleteProject);
router.get("/fetchProjects/:teacherId", ownerOnly("teacherId"), projectController.fetchProjects);
router.get("/projectData/:projectId", ownsProject, projectController.projectData);

module.exports = router;
