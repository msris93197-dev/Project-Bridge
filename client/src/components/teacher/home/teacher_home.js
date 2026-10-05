import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CCollapse } from "@coreui/react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Skeleton from "@mui/material/Skeleton";
import Snackbar from "@mui/material/Snackbar";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ProjectForm from "./project_form";
import EditModal from "./edit_modal";
import DeleteModal from "./delete_modal";
import { API_URL } from "../../../config";
import "./teacher_home.css";

function TeacherHome() {
  const { userId } = useParams();
  const [formOpen, setFormOpen] = useState(false);
  const [projects, setProjects] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/projects/fetchProjects/${userId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not load projects");
      setProjects(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError(err.message || "Could not load projects.");
      setProjects((prev) => prev || []);
    }
  }, [userId]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const saveProject = async (projectData) => {
    try {
      const response = await fetch(`${API_URL}/projects/saveProject/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save project");
      setToast({ severity: "success", message: "Project created." });
      fetchProjects();
    } catch (err) {
      setToast({ severity: "error", message: err.message });
    }
  };

  const deleteProject = async (projectId) => {
    try {
      const response = await fetch(`${API_URL}/projects/deleteProject/${projectId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete project");
      setToast({ severity: "success", message: "Project deleted." });
      fetchProjects();
    } catch (err) {
      setToast({ severity: "error", message: err.message });
    }
  };

  const closeEdit = () => {
    setEditId(null);
    fetchProjects();
  };

  return (
    <div className="pb-page">
      <div className="pb-page-header">
        <div>
          <h1>Current Projects</h1>
          <p>Create projects, set slots and eligibility, and manage what students see.</p>
        </div>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(!formOpen)} aria-expanded={formOpen}>
          {formOpen ? "Close form" : "Add project"}
        </Button>
      </div>

      <CCollapse visible={formOpen}>
        <div className="pb-card home-form">
          <ProjectForm saveProject={saveProject} closeModal={() => setFormOpen(false)} teacherId={userId} />
        </div>
      </CCollapse>

      {error && <div className="pb-error">{error}</div>}

      {projects === null && (
        <div className="home-grid">
          <Skeleton variant="rounded" height={220} />
          <Skeleton variant="rounded" height={220} />
          <Skeleton variant="rounded" height={220} />
        </div>
      )}

      {projects && projects.length === 0 && !error && (
        <div className="pb-empty">
          <h3>No projects yet</h3>
          <p>Add your first project and students will be able to apply to it.</p>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
            Add project
          </Button>
        </div>
      )}

      <div className="home-grid">
        {(projects || []).map((project) => {
          const slots = Number(project.project_slots) || 0;
          const filled = Number(project.filled_slots) || 0;
          const isOpen = Boolean(expanded[project._id]);
          return (
            <section key={project._id} className={`pb-card home-card ${isOpen ? "expanded" : ""}`}>
              <div className="pb-card-title">
                <h2>{project.project_name}</h2>
              </div>
              <p className="desc">{project.project_description}</p>

              <div className="home-chips">
                <Chip size="small" label={project.project_type || "Project"} />
                <Chip size="small" variant="outlined" label={`CG ≥ ${project.cg_cutoff}`} />
                <Chip size="small" variant="outlined" color={slots && filled >= slots ? "success" : "default"} label={`${filled}/${slots} filled`} />
              </div>
              <LinearProgress variant="determinate" value={slots ? (filled / slots) * 100 : 0} sx={{ height: 5, borderRadius: 5, mb: 2 }} />

              {isOpen && (
                <dl className="home-detail">
                  <dt>Domain</dt>
                  <dd>{project.project_domain || "—"}</dd>
                  <dt>Prerequisites</dt>
                  <dd>{(project.pre_requisites || []).join(", ") || "None"}</dd>
                </dl>
              )}

              <div className="pb-actions">
                <Button size="small" color="inherit" endIcon={isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />} onClick={() => setExpanded({ ...expanded, [project._id]: !isOpen })}>
                  {isOpen ? "Less" : "Details"}
                </Button>
                <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={() => setEditId(project._id)}>
                  Edit
                </Button>
                <DeleteModal projectId={project._id} deleteProject={deleteProject} />
              </div>
            </section>
          );
        })}
      </div>

      {editId && <EditModal projectId={editId} closeModal={closeEdit} />}

      <Snackbar open={Boolean(toast)} autoHideDuration={3500} onClose={() => setToast(null)} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        {toast ? (
          <Alert severity={toast.severity} variant="filled" onClose={() => setToast(null)}>
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </div>
  );
}

export default TeacherHome;
