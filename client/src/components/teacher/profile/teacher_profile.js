import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './teacher_profile.css'
import {
  CFormInput,
  // CFormTextarea,
  CFormSelect,
  // CInputGroup,
  // CButton,
  // CContainer,
  // CRow,
  // CCol,
  // CBadge,
  // CCloseButton,
  // CForm,
} from "@coreui/react";
import Button from '@mui/material/Button';
const TeacherProfile = () => {
  const { userId } = useParams();
  const [teacherData, setTeacherData] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    block: "",
    roomNumber: "",
    department: "",
  });
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchTeacherData(userId);
  }, [userId]);

  const fetchTeacherData = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:8000/teachers/getData/${userId}`);
      setTeacherData(response.data);
      // Populate form data with fetched teacher data
      setFormData(response.data);
    } catch (error) {
      console.error("Error fetching teacher data:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8000/teachers/updateData/${userId}`, formData);
      // After successful submission, fetch updated data again
      fetchTeacherData(userId);
      // Disable edit mode after saving
      setEditMode(false);
    } catch (error) {
      console.error("Error saving teacher data:", error);
    }
  };

  // Function to toggle edit mode
  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  if (!teacherData) {
    return <div>Loading...</div>;
  }

  return (
    <div id="profile_form">
      <form onSubmit={handleSubmit}>
        <div id='title_profile'>
              <h2 style={{color: "white"}} id='child_title'>My Profile</h2>
              {editMode ? (
                <>
                  <Button variant="contained" color="success" type="submit" id='child_title'>Save</Button>
                </>
              ) : (
                <Button variant="contained" color="secondary" type="button" onClick={toggleEditMode} id='child_title'>Edit</Button>
              )}
        </div>
        <hr></hr>
        <br></br>
        <CFormInput
         type="text"  name="name" value={formData.name} onChange={handleInputChange} disabled={!editMode} 
        //  id="name" 
         id="floatingInput"
         floatingClassName="mb-3"
         floatingLabel="Name"
         placeholder="name@example.com"
        //  onChange={(e) => setProjectName(e.target.value)}
         feedbackInvalid="Please enter valid Name"
         required
         />
        <CFormSelect
                id="floatingInput"
                floatingLabel="Block"
                placeholder="name@example.com" 
                name="block" value={formData.block} onChange={handleInputChange} disabled={!editMode}
                options={[
                  "Select",
                  { label: "A - Block", value: "A" },
                  { label: "B - Block", value: "B" },
                  { label: "C - Block", value: "C" },
                  { label: "D - Block", value: "D" },
                  { label: "E - Block", value: "E" },
                  { label: "H - Block", value: "F" },
                  { label: "I - Block", value: "G" },
                  { label: "J - Block", value: "H" },
                  { label: "K - Block", value: "I" },
                ]}
                /><br></br>
        {/* <select id="block" > 
          <option value="">Select Block</option>
          <option value="A">A - Block</option>
          <option value="B">B - Block</option>
          <option value="C">C - Block</option>
          <option value="D">D - Block</option>
          <option value="E">E - Block</option>
          <option value="H">H - Block</option>
          <option value="I">I - Block</option>
          <option value="J">J - Block</option>
          <option value="K">K - Block</option>
        </select><br/><br/> */}
        <CFormInput
          type="text" pattern="\d*" maxLength="3" name="roomNumber"value={formData.roomNumber} onChange={handleInputChange} disabled={!editMode} 
        //  id="name" 
         id="floatingInput"
         floatingClassName="mb-3"
         floatingLabel="Room Number"
         placeholder="name@example.com"
        //  onChange={(e) => setProjectName(e.target.value)}
         feedbackInvalid="Please enter valid Room Number"
        //  id="roomNumber"
         required
        />
         <CFormSelect
                id="floatingInput"
                floatingLabel="Department"
                placeholder="name@example.com" 
                name="department" value={formData.department} onChange={handleInputChange} disabled={!editMode}
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
        {/* <select id="department" > 
          <option value="">Select Department</option>
          <option value="BIO">Biological Sciences (BIO)</option>
          <option value="CHE">Chemical Engineering (CHE)</option>
          <option value="CHEM">Chemistry (CHEM)</option>
          <option value="CE">Civil Engineering (CE)</option>
          <option value="CS">Computer Science (CS)</option>
          <option value="ECON">Economics and Finance (ECON)</option>
          <option value="EEE">Electrical & Electronics Engineering (EEE)</option>
          <option value="HSS">Humanities and Social Sciences (HSS)</option>
          <option value="MATH">Mathematics (MATH)</option>
          <option value="ME">Mechanical Engineering (ME)</option>
          <option value="PHA">Pharmacy (PHA)</option>
          <option value="PHY">Physics(PHY)</option>
        </select><br/><br/> */}
      </form>
    </div>
  );
};

export default TeacherProfile;
