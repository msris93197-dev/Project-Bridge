import React, { useEffect, useState } from 'react';
import axios from 'axios';
// import Dropdown from 'react-bootstrap/Dropdown';
// import Dropdown from 'react-bootstrap/Dropdown';
import { useNavigate} from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
// import Nav from 'react-bootstrap/Nav';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
// import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import ListItemIcon from '@mui/material/ListItemIcon';
import Avatar from '@mui/material/Avatar';
import Logout from '@mui/icons-material/Logout';
import './studentNav.css';

const StudentNav = ({ userId }) => {
  const [userdata, setUserdata] = useState({});
  // const [showDropdown, setShowDropdown] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    navigate(`/students/StudentProfile/${userId}`); // Redirect to user profile page
    handleClose(); // Close the menu
  }
  useEffect(() => {
    getUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const getUser = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/users/getUserData/${userId}`); // Fetch user data using userId
      setUserdata(response.data);
    } catch (error) {
      console.log("error", error);
    }
  }

  const redirectHome = () => {
    navigate(`/students/StudentHome/${userId}`); // Redirect to user profile page
    handleClose(); // Close the menu
    // console.log("userdata:", userdata);
  }

  const logout = () => {
    window.open("http://localhost:8000/logout", "_self");
  }

  // const toggleDropdown = () => {
  //   setShowDropdown(!showDropdown);
  // }

  return (
    <>
    <>
      <Navbar className="bg-body-tertiary mb-3" id="main_nav">
        <Container fluid id="main">
          <Navbar.Brand href="#" onClick={redirectHome}>Hello {userdata?.displayName} ! </Navbar.Brand>
          {/* <Dropdown show={showDropdown} onToggle={toggleDropdown}>
            <Dropdown.Toggle variant="light" id="dropdown-basic">
              <img src={userdata?.image} style={{ width: "50px", borderRadius: "50%" }} alt="" />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Nav.Link href={`/teachers/TeacherProfile/${userId}`}>My Profile</Nav.Link>
              <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown> */}
           <Tooltip title="Account settings">
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ ml: 2 }}
            id="user_img"
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <Avatar src={userdata?.image} onError={(e) => e.target.src = 'path_to_fallback_image'}  style={{ width: "50px", height:"50px", borderRadius: "50%" }}/>
          </IconButton>
        </Tooltip>
        </Container>
        <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&::before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleProfileClick}>
          <Avatar src={userdata?.image} onError={(e) => e.target.src = 'path_to_fallback_image'}/> Profile
        </MenuItem>
        <MenuItem onClick={logout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
          </Menu>

      </Navbar>
    </>
    </>
  );
}

export default StudentNav;
