const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");

router.post("/saveProject/:teacherId", projectController.saveProject);
router.put("/updateProject/:projectId", projectController.updateProject);
router.delete("/deleteProject/:projectId", projectController.deleteProject);
router.get("/fetchProjects/:teacherId", projectController.fetchProjects);
router.get("/projectData/:projectId", projectController.projectData);

module.exports = router;
