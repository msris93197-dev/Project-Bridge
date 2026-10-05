const projectdb = require("../model/projectSchema");
const requestsdb = require("../model/requestSchema");

const validateProject = ({ projectName, projectSlots, cgpaCutoff }) => {
  if (!projectName || !String(projectName).trim()) return "Project name is required";
  const slots = Number(projectSlots);
  if (!Number.isInteger(slots) || slots < 1) return "Slots must be a whole number of at least 1";
  const cg = Number(cgpaCutoff || 0);
  if (Number.isNaN(cg) || cg < 0 || cg > 10) return "CG cutoff must be between 0 and 10";
  return null;
};

exports.saveProject = async (req, res) => {
    // Logic for saving project
    try {
        const teacherId = req.user.googleId;
        const {
          projectName,
          projectDescription,
          projectType,
          projectDomain,
          projectSlots,
          cgpaCutoff,
          prerequisites,
        } = req.body;
    
        const invalid = validateProject(req.body);
        if (invalid) return res.status(400).json({ error: invalid });

        // Create a new project instance
        const newProject = new projectdb({
          teacherId,
          project_name: projectName,
          project_description: projectDescription,
          project_type: projectType,
          project_domain: projectDomain,
          project_slots: projectSlots,
          cg_cutoff: cgpaCutoff,
          pre_requisites: prerequisites,
          filled_slots: 0,
        });
    
        // Save the project to the database
        const savedProject = await newProject.save();
    
        res.status(201).json(savedProject); // Return the saved project
      } catch (error) {
        console.error("Error saving project:", error);
        res.status(500).json({ error: "Failed to save project" });
      }
};

exports.updateProject = async (req, res) => {
    // Logic for updating project
    try {
        const projectId = req.params.projectId;
        const updatedProjectData = req.body;
    
        const invalid = validateProject(updatedProjectData);
        if (invalid) return res.status(400).json({ error: invalid });

        const existing = await projectdb.findById(projectId);
        if (!existing) return res.status(404).json({ error: "Project not found" });
        if (Number(updatedProjectData.projectSlots) < existing.filled_slots) {
          return res.status(409).json({ error: "Slots cannot be fewer than already approved students" });
        }

        // Construct the updated project object with correct field names
        const updatedProject = {
          project_name: updatedProjectData.projectName,
          project_type: updatedProjectData.projectType,
          project_description: updatedProjectData.projectDescription,
          project_domain: updatedProjectData.projectDomain,
          cg_cutoff: updatedProjectData.cgpaCutoff,
          project_slots:updatedProjectData.projectSlots,
          pre_requisites: updatedProjectData.prerequisites,
          
        };
    
        // Update the project in the database
        const result = await projectdb.findByIdAndUpdate(
          projectId,
          updatedProject,
          { new: true }
        );
    
        res.json(result); // Return the updated project
      } catch (error) {
        console.error("Error updating project:", error);
        res.status(500).json({ error: "Failed to update project" });
      }
};

exports.deleteProject = async (req, res) => {
    // Logic for deleting project
    try {
        const projectId = req.params.projectId;
        const deletedProject = await projectdb.findByIdAndDelete(projectId);
        if (!deletedProject) {
          return res.status(404).json({ message: 'Project not found' });
        }
        await requestsdb.deleteOne({ projectId });
        res.json({ message: 'Project deleted successfully' });
      } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
};

exports.fetchProjects = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const projects = await projectdb.find({ teacherId });
        res.json(projects);
      } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ error: "Failed to fetch projects" });
      }
};

exports.projectData = async (req, res) => {
    // Logic for fetching project data
    try {
        const { projectId } = req.params;
    
        const project = await projectdb.findById(projectId);
    
        if (!project) {
          console.log("Project not found");
          return res.status(404).json({ error: "Project not found" });
        }
    
        // console.log("Fetched project:", project);
    
        res.json({ projectId, project });
      } catch (error) {
        console.error("Error fetching project:", error);
        res.status(500).json({ error: "Failed to fetch project" });
      }
};

