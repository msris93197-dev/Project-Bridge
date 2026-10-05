import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Collapse,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Skeleton,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
} from "@mui/material";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import Favorite from "@mui/icons-material/Favorite";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import RequestFormModal from "./RequestFormModal";
import { API_URL } from "../../../config";
import "./student_projectBank.css";

const PROJECT_TYPES = [
  ["DOP", "Design Project (DOP)"],
  ["LOP", "Lab Project (LOP)"],
  ["SOP", "Study Project (SOP)"],
];
const DEPARTMENTS = [
  ["BIO", "Biological Sciences (BIO)"],
  ["CHE", "Chemical Engineering (CHE)"],
  ["CHEM", "Chemistry (CHEM)"],
  ["CE", "Civil Engineering (CE)"],
  ["CS", "Computer Science (CS)"],
  ["ECON", "Economics and Finance (ECON)"],
  ["EEE", "Electrical & Electronics Engineering (EEE)"],
  ["HSS", "Humanities and Social Sciences (HSS)"],
  ["MATH", "Mathematics (MATH)"],
  ["ME", "Mechanical Engineering (ME)"],
  ["PHA", "Pharmacy (PHA)"],
  ["PHY", "Physics (PHY)"],
];
const ROWS_PER_PAGE = 6;

const statusChip = (status) => {
  if (!status || status === "No Draft/Request") return <span className="pb-meta">—</span>;
  const color = status === "Request Sent" ? "success" : "warning";
  return <Chip size="small" variant="outlined" color={color} label={status} />;
};

const BankRow = ({ project, status, liked, requestSent, onLike, onRequest }) => {
  const [open, setOpen] = useState(false);
  const eligible = project.cg_eligibility === "Eligible";
  const slots = Number(project.project_slots) || 0;
  const filled = Number(project.filled_slots) || 0;
  const full = slots > 0 && filled >= slots;
  const blockedReason = !eligible ? "You are below the CG cutoff" : full ? "All slots are filled" : "";

  return (
    <>
      <TableRow>
        <TableCell padding="checkbox">
          <IconButton size="small" aria-label="Show details" onClick={() => setOpen(!open)} sx={{ ml: 1 }}>
            <KeyboardArrowDownIcon sx={{ transition: "transform .2s", transform: open ? "rotate(180deg)" : "none" }} />
          </IconButton>
        </TableCell>
        <TableCell sx={{ fontWeight: 600 }}>{project.project_name}</TableCell>
        <TableCell>
          <Chip size="small" label={project.project_type} />
        </TableCell>
        <TableCell>{project.teacher_name}</TableCell>
        <TableCell>{project.department}</TableCell>
        <TableCell>
          <Chip size="small" variant="outlined" color={eligible ? "success" : "error"} label={eligible ? "Eligible" : "Not eligible"} />
        </TableCell>
        <TableCell align="center">
          <span className={full ? "pb-meta" : ""}>
            {Math.max(slots - filled, 0)}/{slots}
          </span>
        </TableCell>
        <TableCell>{statusChip(status)}</TableCell>
        <TableCell align="center">
          <Checkbox
            checked={liked}
            onChange={(e) => onLike(project.project_name, e.target.checked)}
            icon={<FavoriteBorder />}
            checkedIcon={<Favorite />}
            color="error"
            size="small"
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{ py: 0, borderBottom: open ? undefined : "none !important" }} colSpan={9}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box className="bank-detail">
              <div className="full">
                <span className="label">Description</span>
                {project.project_description || "No description provided."}
              </div>
              <div>
                <span className="label">Domain</span>
                {project.project_domain || "—"}
              </div>
              <div>
                <span className="label">CG cutoff</span>
                {project.cg_cutoff}
              </div>
              <div className="full">
                <span className="label">Prerequisites</span>
                {(project.pre_requisites || []).length
                  ? project.pre_requisites.map((p) => <Chip key={p} size="small" label={p} sx={{ mr: 0.75 }} />)
                  : "None"}
              </div>
              <div className="full">
                {requestSent ? (
                  <Chip label="Request already sent" color="success" variant="outlined" />
                ) : (
                  <Tooltip title={blockedReason}>
                    <span>
                      <Button variant="contained" disabled={Boolean(blockedReason)} onClick={() => onRequest(project)}>
                        Request this project
                      </Button>
                    </span>
                  </Tooltip>
                )}
              </div>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const ProjectBank = () => {
  const { userId } = useParams();
  const [projects, setProjects] = useState(null);
  const [likedProjects, setLikedProjects] = useState([]);
  const [sentRequests, setSentRequests] = useState({});
  const [projectStatuses, setProjectStatuses] = useState({});
  const [selectedProject, setSelectedProject] = useState(null);
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [projectType, setProjectType] = useState("");
  const [department, setDepartment] = useState("");
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [showLiked, setShowLiked] = useState(false);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const [bank, liked] = await Promise.all([
          axios.get(`${API_URL}/students/projectBank/${userId}`),
          axios.get(`${API_URL}/students/getLiked/${userId}`).catch(() => ({ data: [] })),
        ]);
        setProjects(Array.isArray(bank.data) ? bank.data : []);
        setLikedProjects(Array.isArray(liked.data) ? liked.data : []);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Could not load the project bank.");
        setProjects([]);
      }
    };
    load();
  }, [userId]);

  useEffect(() => {
    if (!projects || projects.length === 0) return;
    const loadStatuses = async () => {
      try {
        const [statusResponses, sentResponses] = await Promise.all([
          Promise.all(projects.map((p) => axios.get(`${API_URL}/students/getProjectStatus/${userId}/${p.projectId}`))),
          Promise.all(projects.map((p) => axios.get(`${API_URL}/requests/sentRequests/${p.projectId}/${userId}`))),
        ]);
        const statuses = {};
        const sent = {};
        projects.forEach((p, i) => {
          statuses[p.projectId] = statusResponses[i].data.projectStatus;
          sent[p.projectId] = Boolean(sentResponses[i].data);
        });
        setProjectStatuses(statuses);
        setSentRequests(sent);
      } catch (err) {
        console.error("Error fetching project statuses:", err);
      }
    };
    loadStatuses();
  }, [projects, userId]);

  const handleLike = async (projectName, isChecked) => {
    try {
      if (isChecked) {
        await axios.post(`${API_URL}/students/saveLiked/${userId}/${encodeURIComponent(projectName)}`);
        setLikedProjects((prev) => [...prev, { projectId: projectName }]);
      } else {
        await axios.delete(`${API_URL}/students/removeLiked/${userId}/${encodeURIComponent(projectName)}`);
        setLikedProjects((prev) => prev.filter((p) => p.projectId !== projectName));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = useMemo(() => {
    const words = searchQuery.toLowerCase().split(" ").filter(Boolean);
    return (projects || []).filter((p) => {
      const haystack = `${p.project_name} ${p.teacher_name}`.toLowerCase();
      return (
        words.every((w) => haystack.includes(w)) &&
        (!projectType || p.project_type === projectType) &&
        (!department || p.department === department) &&
        (!eligibleOnly || p.cg_eligibility === "Eligible") &&
        (!showLiked || likedProjects.some((l) => l.projectId === p.project_name))
      );
    });
  }, [projects, searchQuery, projectType, department, eligibleOnly, showLiked, likedProjects]);

  useEffect(() => {
    setPage(0);
  }, [searchQuery, projectType, department, eligibleOnly, showLiked]);

  const clearFilters = () => {
    setSearchQuery("");
    setProjectType("");
    setDepartment("");
    setEligibleOnly(false);
    setShowLiked(false);
  };

  const hasFilters = searchQuery || projectType || department || eligibleOnly || showLiked;
  const pageCount = Math.max(Math.ceil(filtered.length / ROWS_PER_PAGE), 1);
  const pageRows = filtered.slice(page * ROWS_PER_PAGE, (page + 1) * ROWS_PER_PAGE);

  return (
    <div className="pb-page" style={{ maxWidth: 1200 }}>
      <div className="pb-page-header">
        <div>
          <h1>Project Bank</h1>
          <p>Find a project that fits your interests and eligibility.</p>
        </div>
        <span className="pb-meta">
          {projects ? `${filtered.length} of ${projects.length} projects` : ""}
        </span>
      </div>

      <div className="pb-toolbar">
        <TextField
          className="grow"
          placeholder="Search by project or teacher name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <TextField select className="select" label="Project type" value={projectType} onChange={(e) => setProjectType(e.target.value)}>
          <MenuItem value="">All types</MenuItem>
          {PROJECT_TYPES.map(([v, l]) => (
            <MenuItem key={v} value={v}>{l}</MenuItem>
          ))}
        </TextField>
        <TextField select className="select" label="Department" value={department} onChange={(e) => setDepartment(e.target.value)}>
          <MenuItem value="">All departments</MenuItem>
          {DEPARTMENTS.map(([v, l]) => (
            <MenuItem key={v} value={v}>{l}</MenuItem>
          ))}
        </TextField>
        <FormControlLabel control={<Switch size="small" checked={eligibleOnly} onChange={(e) => setEligibleOnly(e.target.checked)} />} label="Eligible only" />
        <FormControlLabel control={<Switch size="small" checked={showLiked} onChange={(e) => setShowLiked(e.target.checked)} />} label="Liked" />
        <Button variant="outlined" size="small" startIcon={<FilterAltOffIcon />} onClick={clearFilters} disabled={!hasFilters}>
          Clear
        </Button>
      </div>

      {error && <div className="pb-error">{error}</div>}
      {projects === null && <Skeleton variant="rounded" height={360} />}

      {projects && (
        <TableContainer className="pb-table-wrap">
          <Table aria-label="Project bank">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" />
                <TableCell>Project</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Teacher</TableCell>
                <TableCell>Dept.</TableCell>
                <TableCell>Eligibility</TableCell>
                <TableCell align="center">Slots left</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Like</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pageRows.map((project) => (
                <BankRow
                  key={project.projectId}
                  project={project}
                  status={projectStatuses[project.projectId]}
                  liked={likedProjects.some((l) => l.projectId === project.project_name)}
                  requestSent={Boolean(sentRequests[project.projectId])}
                  onLike={handleLike}
                  onRequest={(p) => {
                    setSelectedProject(p);
                    setIsRequestFormOpen(true);
                  }}
                />
              ))}
              {pageRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} sx={{ border: "none" }}>
                    <div className="pb-empty" style={{ border: "none" }}>
                      <h3>No projects match your filters</h3>
                      <p>Try clearing a filter or searching for something else.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {filtered.length > ROWS_PER_PAGE && (
            <div className="bank-pager">
              <span>
                Page {page + 1} of {pageCount}
              </span>
              <Button size="small" startIcon={<ArrowBackIosNewIcon fontSize="inherit" />} disabled={page === 0} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <Button size="small" endIcon={<ArrowForwardIosIcon fontSize="inherit" />} disabled={page + 1 >= pageCount} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          )}
        </TableContainer>
      )}

      {isRequestFormOpen && selectedProject && (
        <RequestFormModal
          visible={isRequestFormOpen}
          onClose={() => setIsRequestFormOpen(false)}
          project={selectedProject}
          userId={userId}
          selectedProject={selectedProject}
          draftDetails={null}
          setSentRequests={setSentRequests}
          sentRequests={sentRequests}
          setProjectStatuses={setProjectStatuses}
          projectStatuses={projectStatuses}
        />
      )}
    </div>
  );
};

export default ProjectBank;
