import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import Snackbar from "@mui/material/Snackbar";
import AlertTitle from "@mui/material/AlertTitle";
import Alert from "../../student/projectBank/Alert";
import Chip from "@mui/material/Chip";
import VisibilityIcon from "@mui/icons-material/Visibility";
// import ClearIcon from '@mui/icons-material/Clear';
import UndoIcon from '@mui/icons-material/Undo';
import "./teacher_requestsPage.css"
import Clear from '@mui/icons-material/Clear';
const ProjectRequests = () => {
  const { userId } = useParams();
  const [visible, setVisible] = useState(false);
  const [projects, setProjects] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [snackbarTitle, setSnackbarTitle] = useState("");
  const [alertStyle, setAlertStyle] = useState("");
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/teachers/projectRequests/${userId}`);
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [userId]);

  const updateRequestStatus = async (projectId, studentId, status) => {
    try {
      await axios.put(`http://localhost:8000/teachers/status/${projectId}/${studentId}`, { status });
      // Show success message
      setSnackbarSeverity("success");
      setSnackbarTitle("Success");
      // setSnackbarMessage(`Request ${status === 'approved' ? 'Approved' : 'Rejected'}`);
      // setAlertStyle({
      //   backgroundColor: "#ddffdd",
      //   color: "green",
      // });
      let message, backgroundColor, color;

      if (status === 'approved') {
        message = "Request Approved";
        backgroundColor = "rgb(12, 19, 13)";
        color = "rgb(204, 232, 205)";
      } else if (status === 'rejected') {
        message = "Request Rejected";
        backgroundColor = "rgb(7, 19, 24)";
        color = "rgb(184, 231, 251)";
      } else if (status === 'pending') {
        message = "Request Set back to Pending";
        backgroundColor = "rgb(25, 18, 7)";
        color = "rgb(255, 226, 183)";
      }

      setSnackbarMessage(message);
      setAlertStyle({
        backgroundColor: backgroundColor,
        color: color,
      });
      setSnackbarOpen(true);
      // Refresh the project requests after updating status
      const response = await fetch(`http://localhost:8000/teachers/projectRequests/${userId}`);
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      // Handle error
      setSnackbarSeverity("error");
      setSnackbarTitle("Failure");
      setSnackbarMessage("Error approving/rejecting request");
      console.error("Error sending request:", error);
      setAlertStyle({
        backgroundColor: "#ffdddd",
        color: "red",
      });
      setSnackbarOpen(true); // Open Snackbar for error case
    }
  };


  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <div style={{width:'92%', position:'relative', left:'3%', marginTop:'4%'}}>

      {projects.map((project) => (
        <Box key={project.project._id} mb={3}>
          <Typography variant="h6" style={{position:'relative', left:'5%', textAlign:'left'}}>{project.project.project_name}</Typography>
          {project.requestsData.length === 0 ? (
            <Typography id="main_table">No Requests Yet</Typography>
          ) : (
            <TableContainer component={Paper} id="main_table">
              <Table aria-label="collapsible table">
                <TableHead>
                  <TableRow>
                    <TableCell width="2%" />
                    <TableCell width="20%">Student Name</TableCell>
                    <TableCell width="12%">Degree</TableCell>
                    <TableCell width="12%">First Degree</TableCell>
                    <TableCell width="12%">Second Degree</TableCell>
                    <TableCell width="12%">CGPA</TableCell>
                    <TableCell width="12%">Eligibility</TableCell>
                    <TableCell align="right"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                {project.requestsData.map((request) => (
                  <Row key={request.studentId} request={request} cgCutoff={parseFloat(project.project.cg_cutoff)} updateRequestStatus={updateRequestStatus} projectId={project.project._id} />
                ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      ))}
       <Snackbar
        id="alert_snackbar"
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          id="alert_toast"
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
          style={alertStyle}
        >
          <AlertTitle>{snackbarTitle}</AlertTitle>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

const Row = ({ request, cgCutoff, updateRequestStatus, projectId }) => {
  const [open, setOpen] = useState(false);
  const { studentInfo, reason_to_do_project, pre_requisites_fulfilled } = request;

  const isEligible = parseFloat(studentInfo.cg) > cgCutoff;

  const handleApprove = () => {
    updateRequestStatus(projectId, request.studentId, 'approved');
  };

  const handleReject = () => {
    updateRequestStatus(projectId, request.studentId, 'rejected');
  };

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton aria-label="expand row" size="small" id="collapse_btn" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{studentInfo.name}</TableCell>
        <TableCell>{studentInfo.degree}</TableCell>
        <TableCell>{studentInfo.firstDegree}</TableCell>
        <TableCell>{studentInfo.secondDegree}</TableCell>
        <TableCell>{studentInfo.cg}</TableCell>
        <TableCell>{isEligible ? 'Eligible' : 'Not Eligible'}</TableCell>
        <TableCell align="right">
        {request.status === 'pending' ? (
            <Stack 
              direction="row" spacing={2}
              style={{display:"flex", justifyContent:"center"}}
            >
              <Button variant="outlined" color="success" startIcon={<ThumbUpAltIcon />} onClick={() => updateRequestStatus(projectId, request.studentId, 'approved')}>
                Approve
              </Button>
              <Button variant="outlined" color="error" endIcon={<ThumbDownAltIcon />} onClick={() => updateRequestStatus(projectId, request.studentId, 'rejected')}>
                Reject
              </Button>
            </Stack>
          ) : request.status === 'approved' ? (
            <Stack direction="row" spacing={1}>
              <Chip label="Approved" color="success" variant="outlined" />
              <IconButton aria-label="Example" onClick={() => updateRequestStatus(projectId, request.studentId, 'pending')}>
                <UndoIcon color="primary"  fontSize="medium" />
              </IconButton>
            </Stack>
          ) : (
            <Stack direction="row" spacing={1}>
              <Chip label="Rejected" color="primary" variant="outlined"  />
              <IconButton aria-label="Example" onClick={() => updateRequestStatus(projectId, request.studentId, 'pending')}>
                <UndoIcon color="primary"  fontSize="medium" />
              </IconButton>
            </Stack>
          )}
                
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Reason to do project:</strong> {reason_to_do_project}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Pre requisites fulfilled:</strong> {pre_requisites_fulfilled.join(', ')}
                </Typography>
                <div style={{display:'inline-flex'}}>
                {studentInfo.resume && (
                        <div style={{marginRight:'17px'}}>
                          <Button
                            variant="outlined"
                            startIcon={
                              <VisibilityIcon
                                color="success"
                                marginLeft="21px"
                              />
                              
                            }
                            style={{width:'max-content'}}
                            onClick={() => window.open(studentInfo.resume.resumeUrl, "_blank")}
                          >
                            {`Student Resume`}
                          </Button>
                        </div>
                      )}
                  {studentInfo.performanceSheet && (
                            <div>
                              <Button
                                variant="outlined"
                                startIcon={
                                  <VisibilityIcon
                                    color="success"
                                    marginLeft="21px"
                                  />
                                }
                                onClick={() =>
                                  window.open(studentInfo.performanceSheet.performanceSheetUrl, "_blank")
                                }
                                style={{width:'max-content'}}
                              >
                                {`Performance Sheet`}
                              </Button>
                            </div>
                          )}
                </div>

            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

export default ProjectRequests;
