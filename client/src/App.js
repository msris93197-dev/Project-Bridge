import './App.css';
import Login from './components/Login';
import Error from './components/Error';
import React from 'react';
import "@fontsource/montserrat";
import StudentNav from './components/student/studentNav';
import TeacherNav from './components/teacher/teacherNav';
import StudentHome from './components/student/student_home';
import TeacherHome from './components/teacher/home/teacher_home';
import StudentProfile from './components/student/student_profile';
import TeacherProfile from './components/teacher/profile/teacher_profile';
import ProjectBank from './components/student/projectBank/student_projectBank';
import ProjectRequests from './components/teacher/requests/teacher_requestsPage';
import StudentSideBar from './components/student/studentSideBar';
import TeacherSideBar from './components/teacher/teacherSideBar';
import AdminHome  from "./components/admin/admin_home";
import AdminNav from './components/admin/adminNav';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Route, Routes, useParams } from 'react-router-dom';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/students/StudentHome/:userId/*" element={<StudentPageWrapper component={StudentHome} />} />
      <Route path="/teachers/TeacherHome/:userId/*" element={<TeacherPageWrapper component={TeacherHome} />} />
      <Route path="/students/StudentProfile/:userId/*" element={<StudentPageWrapper component={StudentProfile} />} />
      <Route path="/teachers/TeacherProfile/:userId/*" element={<TeacherPageWrapper component={TeacherProfile} />} />
      <Route path="/students/ProjectBank/:userId/*" element={<StudentPageWrapper component={ProjectBank} />} />
      <Route path="/teachers/RequestsPage/:userId/*" element={<TeacherPageWrapper component={ProjectRequests}/>} />
      <Route path="/admin/AdminHome/:userId/*" element={<AdminPageWrapper component={AdminHome} />} />
      <Route path="*" element={<Error />} />
    </Routes>
    </ThemeProvider>
  );
}

function StudentPageWrapper({ component: Component }) {
  const { userId } = useParams();
  return (
    <>
    <StudentSideBar userId={userId} >
      <StudentNav userId={userId} />
      <Component />
    </StudentSideBar>
    </>
  );
}

function AdminPageWrapper({ component: Component }) {
  const { userId } = useParams();
  return (
    <>
      {/* Assuming there's an AdminNav component for admin navigation */}
      <AdminNav userId={userId} />
      <Component />
    </>
  );
}

function TeacherPageWrapper({ component: Component }) {
  const { userId } = useParams();
  return (
    <>
    <TeacherSideBar userId={userId}>
      <TeacherNav userId={userId} />
      <Component />
      </TeacherSideBar>
    </>
  );
}

export default App;
