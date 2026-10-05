// TeacherHome.js
import React, { useState, useEffect } from "react";
import ProjectForm from "./project_form";
import EditModal from "./edit_modal";
import DeleteModal from "./delete_modal"; // Import the DeleteModal component
import { useParams } from "react-router-dom";
import {
  CCollapse,
  CCard,
  CCardBody,
  CCardTitle,
  CCardText,
} from "@coreui/react";
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import './teacher_home.css';

function TeacherHome() {
  const [visible, setVisible] = useState(false);
  const [projects, setProjects] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const { userId } = useParams();

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const fetchProjects = async () => {
    try {
      const response = await fetch(`http://localhost:8000/projects/fetchProjects/${userId}`);
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const saveProject = async (projectData) => {
    try {
      const response = await fetch(`http://localhost:8000/projects/saveProject/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      });
      const data = await response.json();
      console.log("Project saved successfully:", data);
      fetchProjects();
    } catch (error) {
      console.error("Error saving project:", error);
    }
};

  const deleteProject = async (projectId) => {
    try {
      const response = await fetch(
        `http://localhost:8000/projects/deleteProject/${projectId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        console.log("Project deleted successfully");
        fetchProjects(); // Reload projects after deletion
      } else {
        throw new Error("Failed to delete project");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const toggleExpandCollapse = (index) => {
    const newProjects = [...projects];
    newProjects[index].expanded = !newProjects[index].expanded;
    setProjects(newProjects);
  };

  const openEditModal = (projectId) => {
    setSelectedProjectId(projectId);
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setSelectedProjectId(null);
  };

  return (
    <>
    <div id="body">
      <div style={{display:'flex'}}>
          <h3
          style={{width:'20%', alignContent:'end'}}
          >Current Projects</h3>
          <Button
            className="mb-3"
            id="addProjectBtn"
            onClick={() => setVisible(!visible)}
            aria-expanded={visible}
            aria-controls="collapseWidthExample"
            variant="outlined"
            startIcon={<AddIcon/>}
          >
            Add Project
          </Button>
      </div>
      
      <hr></hr>
      <div>
        <CCollapse id="collapseWidthExample" visible={visible} >
          <CCard id="project_modal">
            <CCardBody>
              <ProjectForm
                saveProject={saveProject}
                closeModal={() => setVisible(false)}
                teacherId={userId}
              />
            </CCardBody>
          </CCard>
          <hr></hr>
        </CCollapse>
        
      </div>

      <div>
        
        <div id="current_projects_div">
        {projects.map((project, index) => (
          <CCard key={project._id} id="project_card">
            <CCardBody >
              <CCardTitle>{project.project_name}</CCardTitle>
              <CCardText>{project.project_description}</CCardText>
              {project.expanded && (
                <>
                  <CCardText><b>Type:</b>    {project.project_type}</CCardText>
                  <CCardText><b>CG Cutoff:</b>    {project.cg_cutoff}</CCardText>
                  <CCardText><b>Domain:</b>    {project.project_domain}</CCardText>
                  <CCardText><b>Pre-Requisites:</b>    {project.pre_requisites.join(', ')}</CCardText>
                </>
                
              )}
              <Button
                id="expand_collapse"
                onClick={() => toggleExpandCollapse(index)}
                variant="outlined"
              >
                {project.expanded ? "Collapse" : "Expand"}
              </Button>
              <Button onClick={() => openEditModal(project._id)} variant="outlined">Edit</Button>
              <DeleteModal
                projectId={project._id}
                deleteProject={deleteProject}
              />
            </CCardBody>
          </CCard>
        ))}
        </div>
        
      </div>
      {/* Edit Modal */}
      {editModalVisible && (
        <EditModal projectId={selectedProjectId} closeModal={closeEditModal} />
      )}
    </div>
    </>

  );
}

export default TeacherHome;
