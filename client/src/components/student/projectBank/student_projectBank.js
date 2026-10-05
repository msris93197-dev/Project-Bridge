import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  Paper,
  IconButton,
  Box,
  Collapse,
  Button,
  Checkbox,
  TextField,
  FormControlLabel,
  Switch,
  TableFooter
  
} from "@mui/material";
import {
  // CFormInput,
  CFormSelect,
} from "@coreui/react";
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import Favorite from '@mui/icons-material/Favorite';
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import RequestFormModal from "./RequestFormModal";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import "./student_projectBank.css";
const ProjectBank = () => {
  const { userId } = useParams();
  const [projects, setProjects] = useState([]);
  const [likedProjects, setLikedProjects] = useState([]);
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null); // Define selectedProject state
  const [draftDetails, setDraftDetails] = useState(null);
  const [sentRequests, setSentRequests] = useState([]);
  const [projectStatuses, setProjectStatuses] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [projectType, setProjectType] = useState("Select"); // State variable for project type
  const [department, setDepartment] = useState("Select"); // State variable for department
  const [eligibleOnly, setEligibleOnly] = useState(false); 
  const [showLikedProjects, setShowLikedProjects] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 5;
  useEffect(() => {
    const fetchProjectBankData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/students/projectBank/${userId}`
        );
        console.log("Project Bank Data:", response.data);
        setProjects(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchLikedProjects = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/students/getLiked/${userId}`
        );
        console.log("Liked Projects Data:", response.data);
        setLikedProjects(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProjectBankData();
    fetchLikedProjects();
    // fetchProjectStatuses();
  }, [userId]);

  useEffect(() => {
    const fetchProjectStatuses = async () => {
      try {
        const requests = projects.map((project) =>
          axios.get(
            `http://localhost:8000/students/getProjectStatus/${userId}/${project.projectId}`
          )
        );
        const responses = await Promise.all(requests);
        const statuses = responses.reduce((acc, response, index) => {
          const project = projects[index];
          acc[project.projectId] = response.data.projectStatus;
          return acc;
        }, {});
        setProjectStatuses(statuses);
      } catch (error) {
        console.error("Error fetching project statuses:", error);
      }
    };

    if (projects.length > 0) {
      fetchProjectStatuses();
    }
  }, [projects, userId]);

  useEffect(() => {
    if (projects.length > 0) {
      const fetchSentRequests = async () => {
        try {
          const requests = {};
          for (const project of projects) {
            const response = await axios.get(
              `http://localhost:8000/requests/sentRequests/${project.projectId}/${userId}`
            );
            requests[project.projectId] = response.data ? true : false;
          }
          setSentRequests(requests);
        } catch (error) {
          console.error("Error fetching sent requests:", error);
        }
      };

      fetchSentRequests();
    }
  }, [projects, userId]);

  const handleLike = async (projectId, isChecked) => {
    try {
      if (isChecked) {
        await axios.post(
          `http://localhost:8000/students/saveLiked/${userId}/${projectId}`
        );
        setLikedProjects([...likedProjects, { projectId }]);
      } else {
        await axios.delete(
          `http://localhost:8000/students/removeLiked/${userId}/${projectId}`
        );
        setLikedProjects(
          likedProjects.filter((project) => project.projectId !== projectId)
        );
      }
    } catch (error) {
      console.error(error);
    }
  };
  const updateProjectStatus = (projectId, status) => {
    setProjectStatuses((prevStatuses) => ({
      ...prevStatuses,
      [projectId]: status,
    }));
  };

  const filteredProjects = projects.filter((project) => {
    const searchKeywords = searchQuery.toLowerCase().split(" ");
    const matchesSearchQuery = searchKeywords.every((keyword) =>
      project.project_name.toLowerCase().includes(keyword) ||
      project.teacher_name.toLowerCase().includes(keyword)
    );
    const matchesProjectType = projectType === "Select" || project.project_type === projectType;
    const matchesDepartment = department === "Select" || project.department === department;
    const matchesEligibility = !eligibleOnly || project.cg_eligibility === "Eligible";
    const matchesLikedProjects = !showLikedProjects || likedProjects.some((liked) => liked.projectId === project.project_name);
    return matchesSearchQuery && matchesProjectType && matchesDepartment && matchesEligibility && matchesLikedProjects;
  });

  const handleShowLikedProjectsChange = (event) => {
    setShowLikedProjects(event.target.checked);
  };
  // Event handlers for updating project type and department
  const handleProjectTypeChange = (event) => {
    setProjectType(event.target.value);
  };

  const handleDepartmentChange = (event) => {
    setDepartment(event.target.value);
  };
  // Event handler for updating search query state
  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleEligibilityChange = (event) => {
    setEligibleOnly(event.target.checked);
  };

  // Calculate start and end indices of the current page
const startIndex = currentPage * rowsPerPage;
const endIndex = startIndex + rowsPerPage;

// Handle next page button click
const handleNextPage = () => {
  setCurrentPage((prevPage) => prevPage + 1);
};

// Handle previous page button click
const handlePreviousPage = () => {
  setCurrentPage((prevPage) => prevPage - 1);
};

// Get the current page's projects
const currentPageProjects = filteredProjects.slice(startIndex, endIndex);

  // Function to clear all filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setProjectType("Select");
    setDepartment("Select");
    setEligibleOnly(false);
  };


  const Row = ({ project, projectStatuses }) => {
    const [open, setOpen] = useState(false);
    if (!project || !project.project_name) {
      return null; // Return null or some fallback JSX if project is null or undefined, or if project_name is not present
    }
    const isLiked = likedProjects.some(
      (liked) => liked.projectId === project.project_name
    );

    const isRequestSent = sentRequests[project.projectId];

    const projectStatus = projectStatuses[project.projectId];

    // This line is causing the error

    const handleRequest = (projectData) => {
      setSelectedProject(projectData); // Set selectedProject when request button is clicked
      setIsRequestFormOpen(true);
    };


    return (
      <>
        <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
          <TableCell>
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setOpen(!open)}
              id="collapse_btn"
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell component="th" scope="row">
            {project.project_name}
          </TableCell>
          <TableCell>{project.project_type}</TableCell>
          {/* <TableCell>{project.project_domain}</TableCell> */}
          <TableCell>{project.teacher_name}</TableCell>
          <TableCell>{project.department}</TableCell>
          <TableCell>{project.pre_requisites.join(", ")}</TableCell>
          {/* <TableCell>{project.cg_cutoff}</TableCell> */}
          <TableCell>{project.cg_eligibility}</TableCell>
          <TableCell>{projectStatus}</TableCell>
          <TableCell>
            <Checkbox
              checked={isLiked}
              onChange={(event) =>
                handleLike(project.project_name, event.target.checked)
              }
              icon={<FavoriteBorder />} checkedIcon={<Favorite />} 
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={11}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <Typography variant="h6" gutterBottom component="div">
                  Project Details
                </Typography>
                <Typography>{`Project Description: ${project.project_description}`}</Typography>
                <Typography>{`CG Cutoff: ${project.cg_cutoff}`}</Typography>
                <Typography>{`Project Domain: ${project.project_domain}`}</Typography>
                <Typography>{`CG Eligibility: ${project.cg_eligibility}`}</Typography>
                {/* <Button onClick={() => handleRequest(project)} variant="contained" color="primary">Request</Button> */}
                {/* Render other project details here */}
                <Stack
                  direction="row"
                  spacing={1}
                  style={{ justifyContent: "flex-start" }}
                >
                  {isRequestSent ? (
                    <Chip
                      label="Request Already Sent"
                      color="success"
                      variant="outlined"
                    />
                  ) : (
                    <Button
                      onClick={() => handleRequest(project)}
                      variant="contained"
                      color="primary"
                    >
                      Request
                    </Button>
                  )}
                </Stack>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </>
    );
  };

  return (
    <div style={{width:"90%", marginLeft:"5%"}}>
      <h1 style={{marginTop:"2%"}}>Project Bank</h1>
      <hr></hr>
      <Stack direction="row" spacing={2}>
            <TextField
              label="Enter Project Name or Teacher Name..."
              variant="outlined"
              value={searchQuery}
              onChange={handleSearchInputChange}
              style={{ marginBottom: 20, width:'350px'}}
            />
            <CFormSelect
              id="floatingInput"
              floatingLabel="Project Type"
              placeholder="name@example.com"
              value={projectType}
              onChange={handleProjectTypeChange}
              options={[
                "Select",
                { label: "Design Project (DOP)", value: "DOP" },
                { label: "Lab Project (LOP)", value: "LOP" },
                { label: "Study Project (SOP)", value: "SOP" },
              ]}
              
            />
            <CFormSelect
              id="floatingInput"
              floatingLabel="Department"
              placeholder="name@example.com" 
              name="department" onChange={handleDepartmentChange}
              options={[
                "Select",
                { label: "Biological Sciences (BIO)", value: "BIO" },
                { label: "Chemical Engineering (CHE)", value: "CHE" },
                { label: "Chemistry (CHEM)", value: "CHEM" },
                { label: "Civil Engineering (CE)", value: "CE" },
                { label: "Computer Science (CS)", value: "CS" },
                { label: "Economics and Finance (ECON)", value: "ECON" },
                { label: "Electrical & Electronics Engineering (EEE)", value: "EEE" },
                { label: "Humanities and Social Sciences (HSS)", value: "HSS" },
                { label: "Mathematics (MATH)", value: "MATH" },
                { label: "Mechanical Engineering (ME)", value: "ME" },
                { label: "Pharmacy (PHA)", value: "PHA" },
                { label: "Physics(PHY)", value: "PHY" },
              ]}
              />
            <FormControlLabel
              control={<Switch checked={eligibleOnly} onChange={handleEligibilityChange} />}
              label="Show Eligible Only"
              style={{alignItems:'baseline'}}
            />
            <FormControlLabel
                control={<Switch checked={showLikedProjects} onChange={handleShowLikedProjectsChange} />}
                label="Show Liked Projects"
                style={{alignItems:'baseline'}}
              />
            <Button variant="outlined" onClick={handleClearFilters} id="clr_btn" >Clear Filters</Button>
      </Stack>
      
      <TableContainer component={Paper} id="main_table" style={{width:"100%", marginLeft:"0%", left: "0px"}}>
        <Table aria-label="collapsible table">
          <TableHead style={{backgroundColor:"black", borderBottom:"0.2px solid white"}}>
            <TableRow>
              <TableCell width="2%" />
              <TableCell width="20%">Project Name</TableCell>
              <TableCell width="8%">Project Type</TableCell>
              {/* <TableCell width="10%">Project Domain</TableCell> */}
              <TableCell width="10%">Teacher Name</TableCell>
              <TableCell width="7%">Department</TableCell>
              <TableCell width="12%">Pre-requisites</TableCell>
              {/* <TableCell width="10%">CG Cutoff</TableCell> */}
              <TableCell width="8%">CG Eligibility</TableCell>
              <TableCell width="10%">Project Status</TableCell>
              <TableCell width="2%">Like</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentPageProjects.map((project, index) => (
              <Row
                key={index}
                project={project}
                projectStatuses={projectStatuses}
                updateProjectStatus={updateProjectStatus}
                handleRequest={() => setIsRequestFormOpen(true)}
              />
            ))}
          </TableBody>
          <TableFooter>
            <TableRow style={{paddingBottom:'0'}}>
              <TableCell colSpan={11} style={{ textAlign: "right" , borderBottom:'none', paddingBottom:'0' }}>
                <Button onClick={handlePreviousPage} disabled={currentPage === 0} id='pagination_btn' startIcon={<ArrowBackIosIcon/>}>
                  Previous
                </Button>
                <Button onClick={handleNextPage} disabled={endIndex >= filteredProjects.length} id='pagination_btn' endIcon={<ArrowForwardIosIcon/>}>
                  Next
                </Button>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
      {isRequestFormOpen && (
        <RequestFormModal
          visible={isRequestFormOpen}
          onClose={() => setIsRequestFormOpen(false)}
          project={selectedProject}
          userId={userId}
          selectedProject={selectedProject} // Pass selectedProject to RequestFormModal
          draftDetails={draftDetails}
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
