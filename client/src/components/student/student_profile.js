import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  CFormInput,
  // CFormTextarea,
  CFormSelect,
  // CInputGroup,
  // CButton,
  CContainer,
  CRow,
  CCol,
  // CForm,
  // CBadge,
  // CCloseButton,
  // CForm,
} from "@coreui/react";
import Button from "@mui/material/Button";
import "./student_profile.css";
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
// import { faEllipsisV } from '@fortawesome/free-solid-svg-icons/faEllipsisV';
// import { faInfo } from "@fortawesome/free-solid-svg-icons/faInfo";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import app from "../firebase";

const StudentProfile = () => {
  const { userId } = useParams();
  const [studentData, setStudentData] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    idNumber: "",
    degree: "Single Degree",
    firstDegree: "",
    secondDegree: "",
    cg: "",
  });
  const [editMode, setEditMode] = useState(false);

  const [resume, setResume] = useState(undefined);
  const [performanceSheet, setPerformanceSheet] = useState(undefined);
  const [resumePerc, setResumePerc] = useState(0);
  const [performaceSheetPerc, setPerformanceSheetPerc] = useState(0);
  const [resumeUrl, setResumeUrl] = useState(null);
  const [performanceSheetUrl, setPerformanceSheetUrl] = useState(null);
  const [resumeName, setResumeName] = useState(null);
  const [performanceSheetName, setPerformanceSheetName] = useState(null);
  const [inputs, setInputs] = useState({});

  useEffect(() => {
    resume && uploadFile(resume, "resumeUrl");
  }, [resume]);

  useEffect(() => {
    performanceSheet && uploadFile(performanceSheet, "performanceSheetUrl");
  }, [performanceSheet]);

  const uploadFile = (file, fileType) => {
    const storage = getStorage(app);
    const folder = fileType === "resumeUrl" ? "resume/" : "performanceSheet/";
    const fileTypeSuffix =
      fileType === "resumeUrl" ? "_resume" : "_performanceSheet";
    const nameType =
      fileType === "resumeUrl" ? "resumeName" : "performanceSheetName";
    const fileName = userId + fileTypeSuffix + "_" + file.name;

    const storageRef = ref(storage, folder + fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        fileType === "resumeUrl"
          ? setResumePerc(Math.round(progress))
          : setPerformanceSheetPerc(Math.round(progress));
        switch (snapshot.state) {
          case "paused":
            console.log("Upload is paused");
            break;
          case "running":
            console.log("Upload is running");
            break;
          default:
            break;
        }
      },
      (error) => {
        console.log(error);
        switch (error.code) {
          case "storage/unauthorized":
            // User doesn't have permission to access the object
            console.log(error);
            break;
          case "storage/canceled":
            // User canceled the upload
            break;
          case "storage/unknown":
            // Unknown error occurred, inspect error.serverResponse
            break;
          default:
            break;
        }
      },
      () => {
        // Upload completed successfully, now we can get the download URL
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          console.log("DownloadURL - ", downloadURL);
          setInputs((prev) => {
            return {
              ...prev,
              [fileType]: downloadURL,
              [nameType]: file.name,
            };
          });
        });
      }
    );
  };

  useEffect(() => {
    fetchStudentData(userId);
  }, [userId]);

  // const fetchStudentData = async (userId) => {
  //   try {
  //     const response = await axios.get(`http://localhost:8000/students/getData/${userId}`);
  //     setStudentData(response.data);
  //     // Populate form data with fetched student data
  //     setFormData(response.data);
  //   } catch (error) {
  //     console.error("Error fetching student data:", error);
  //   }
  // };

  const fetchStudentData = async (userId) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/students/getData/${userId}`
      );
      setStudentData(response.data);
      // Populate form data with fetched student data
      setFormData(response.data);
      // Set uploaded file URLs and names if available
      if (response.data.resume) {
        setResumeUrl(response.data.resume.resumeUrl);
        setResumeName(response.data.resume.resumeName);
      }
      if (response.data.performanceSheet) {
        setPerformanceSheetUrl(
          response.data.performanceSheet.performanceSheetUrl
        );
        setPerformanceSheetName(
          response.data.performanceSheet.performanceSheetName
        );
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "degree" && value === "Single Degree") {
      setFormData({
        ...formData,
        [name]: value,
        secondDegree: "", // Reset the value of the "Second Degree" field
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    console.log("Form submitted");
    console.log("formData:", formData);
    console.log("inputs:", inputs);
    try {
      await axios.put(`http://localhost:8000/students/updateData/${userId}`, {
        ...formData,
        ...inputs,
      });
      // After successful submission, fetch updated data again
      fetchStudentData(userId);
      // Disable edit mode after saving
      setEditMode(false);
    } catch (error) {
      console.error("Error saving student data:", error);
    }
  };

  // Function to toggle edit mode
  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  // const handleFilesUpload = async (e) => {
  //   e.preventDefault();
  //   try{
  //     await axios.post(`http://localhost:8000/students/uploadFiles/${userId}`, { ...inputs });
  //   } catch (error){
  //     console.log(error);
  //   }
  // }

  if (!studentData) {
    return <div>Loading...</div>;
  }

  return (
    <CContainer>
      <CRow>
        <div
          id="profile_form"
          style={{
            width: "100%",
            left: "0",
            marginBottom: "0",
            paddingBottom: "0",
          }}
        >
          <form onSubmit={handleSubmit}>
            <CRow>
              <CCol>
                <div id="title_profile">
                  <h2
                    style={{ color: "white", marginBottom: "0" }}
                    id="child_title"
                  >
                    My Profile
                  </h2>
                  {editMode ? (
                    <>
                      <Button
                        variant="contained"
                        color="success"
                        type="submit"
                        id="child_title"
                      >
                        Save
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="contained"
                      color="secondary"
                      type="button"
                      onClick={toggleEditMode}
                      id="child_title"
                    >
                      Edit
                    </Button>
                  )}
                </div>
              </CCol>
            </CRow>
            <hr></hr>
            <br />
            <br />
            <CRow>
              <CCol>
                <div id="student_details">
                  <CFormInput
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    id="floatingInput"
                    floatingClassName="mb-3"
                    floatingLabel="Name"
                    placeholder="name@example.com"
                    feedbackInvalid="Please enter valid Name"
                    required
                  />

                  <CFormInput
                    type="text"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    id="floatingInput"
                    floatingClassName="mb-3"
                    floatingLabel="ID Number"
                    placeholder="name@example.com"
                    feedbackInvalid="Please enter valid ID number"
                    required
                  />

                  <CFormSelect
                    id="floatingInput"
                    floatingLabel="Degree"
                    name="degree"
                    value={formData.degree}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    options={[
                      { label: "Single Degree", value: "Single Degree" },
                      { label: "Dual Degree", value: "Dual Degree" },
                    ]}
                  />
                  <br />

                  <CFormSelect
                    id="floatingInput"
                    floatingLabel="B.E Degree"
                    name="firstDegree"
                    value={formData.firstDegree}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    options={[
                      "Select",
                      { label: "Civil Engineering(CE)", value: "CE" },
                      {
                        label: "Computer Science Engineering (CSE)",
                        value: "CSE",
                      },
                      {
                        label: "Electronics and Communication Engineering(ECE)",
                        value: "ECE",
                      },
                      {
                        label: "Electrical and Electronics Engineering (EEE)",
                        value: "EEE",
                      },
                      {
                        label:
                          "Electronics and Instrumention Engineering (ENI)",
                        value: "ENI",
                      },
                      { label: "Mechanical Engineering (ME)", value: "ME" },
                      { label: "B.Pharma (PHA)", value: "PHA" },
                    ]}
                  />
                  <br></br>
                  <CFormSelect
                    id="floatingInput"
                    floatingLabel="MSc. Degree"
                    name="secondDegree"
                    value={formData.secondDegree}
                    onChange={handleInputChange}
                    disabled={!editMode || formData.degree !== "Dual Degree"}
                    options={[
                      "Select",
                      { label: "Biology (BIO)", value: "BIO" },
                      { label: "Chemistry (CHEM)", value: "CHEM" },
                      { label: "Economics (ECON)", value: "ECON" },
                      { label: "Mathematics (MATH)", value: "MATH" },
                      { label: "Physics (PHY)", value: "PHY" },
                    ]}
                  />
                  <br></br>
                  <CFormInput
                    type="number"
                    id="floatingInput"
                    floatingLabel="CGPA"
                    name="cg"
                    min="0"
                    step="0.01"
                    max="10"
                    value={formData.cg}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                  <br />
                  <br />
                </div>
              </CCol>
              <CCol>
                <div
                  id="files"
                  // style={{width:'80%', position:'relative', left:'10%', top:'20%'}}
                >
                  <div id="title_profile">
                    <h2 style={{ color: "white" }} id="child_title" disabled>
                      Upload files
                    </h2>
                  </div>
                  <hr></hr>
                  <CRow>
                    <div>
                      <CFormInput
                        type="file"
                        id="resume"
                        accept="application/pdf"
                        label="Resume (pdf)"
                        disabled={!editMode}
                        // onChange={(e) => setResume((prev) => e.target.files[0])}
                        onChange={(e) => setResume(e.target.files[0])}
                      />
                      {resumeUrl && (
                        <div>
                          <Button
                            variant="outlined"
                            startIcon={
                              <VisibilityIcon
                                color="success"
                                marginLeft="21px"
                              />
                            }
                            onClick={() => window.open(resumeUrl, "_blank")}
                          >
                            {resumeName}
                          </Button>
                        </div>
                      )}
                      {editMode && (
                          resumePerc > 0 && "Uploading: " + resumePerc + "%"
                      )}
                      
                    </div>

                    {/* <CButton color="danger">Delete Resume</CButton> */}
                  </CRow>
                  <br></br>
                  <CRow>
                    <div>
                      <CFormInput
                        type="file"
                        id="performaceSheet"
                        accept="application/pdf"
                        label="Performance Sheet (pdf)"
                        disabled={!editMode}
                        // onChange={(e) => setPerformanceSheet((prev) => e.target.files[0])}
                        onChange={(e) => setPerformanceSheet(e.target.files[0])}
                      />

                      {performanceSheetUrl && (
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
                              window.open(performanceSheetUrl, "_blank")
                            }
                          >
                            {performanceSheetName}
                          </Button>
                        </div>
                      )}
                      {editMode && (
                            performaceSheetPerc > 0 && "Uploading: " + performaceSheetPerc + "%"
                      )}
                      
                    </div>
                    {/* <CButton color="danger">Delete Performance Sheet</CButton> */}
                  </CRow>
                </div>
              </CCol>
            </CRow>
          </form>
        </div>
      </CRow>
    </CContainer>
  );
};

export default StudentProfile;
