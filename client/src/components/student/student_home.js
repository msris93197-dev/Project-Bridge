import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';


const StudentHome = () => {
  const { userId } = useParams();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/students/getSentRequests/${userId}`);
        setProjects(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [userId]);

  return (
    <div style={{width:"90%", marginLeft:"5%", marginTop:"5%"}}>
      <h1>Current Requests</h1>
      <hr></hr>
      <TableContainer id="main_table" style={{width:"100%", marginLeft:"0%", left: "0px"}} component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead style={{backgroundColor:"black", borderBottom:"0.2px solid white"}}>
            <TableRow>
              <TableCell width="35%">Project Name</TableCell>
              <TableCell>Project Type</TableCell>
              <TableCell>Professor Name</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Room Number</TableCell>
              <TableCell>Available Slots</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.projectId}>
                <TableCell component="th" scope="row">{project.projectName}</TableCell>
                <TableCell>{project.projectType}</TableCell>
                <TableCell>{project.prof_name}</TableCell>
                <TableCell>{project.department}</TableCell>
                <TableCell>{`${project.block} ${project.roomNumber}`}</TableCell>
                <TableCell>{project.project_slots - project.filled_slots}</TableCell>
                <TableCell>
                  <Chip
                    label={project.status}
                    color={project.status === 'approved' ? 'success' : (project.status === 'pending' ? 'primary' : 'error')}
                    variant="outlined"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default StudentHome;
