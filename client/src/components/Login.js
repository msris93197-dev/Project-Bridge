import React from "react";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import GoogleIcon from "@mui/icons-material/Google";
import SchoolIcon from "@mui/icons-material/School";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import InsightsIcon from "@mui/icons-material/Insights";
import { API_URL } from "../config";
import "./Login.css";

const ROLES = [
  { key: "student", label: "Student", icon: <SchoolIcon />, blurb: "Browse projects and apply" },
  { key: "teacher", label: "Teacher", icon: <PersonSearchIcon />, blurb: "Post projects, review requests" },
  { key: "admin", label: "Admin", icon: <InsightsIcon />, blurb: "Department analytics" },
];

const demoEnabled = process.env.REACT_APP_DEMO_MODE === "true";

const Login = () => {
  const googleLogin = (role) => {
    window.location.href = `${API_URL}/auth/google?user_type=${role}`;
  };
  const demoLogin = (role) => {
    window.location.href = `${API_URL}/auth/demo/${role}`;
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <h1>Project Bridge</h1>
          <p>One place for students and professors to match on project courses — no more email chains.</p>
        </div>

        <h2 className="login-heading">Sign in with Google</h2>
        <div className="login-roles">
          {ROLES.map((r) => (
            <Button
              key={r.key}
              variant="outlined"
              size="large"
              startIcon={<GoogleIcon />}
              onClick={() => googleLogin(r.key)}
              className="login-btn"
            >
              Continue as {r.label}
            </Button>
          ))}
        </div>

        {demoEnabled && (
          <>
            <Divider sx={{ my: 3 }}>or try a demo</Divider>
            <p className="login-note">No account needed. Explore each role with sample data.</p>
            <div className="login-demo">
              {ROLES.map((r) => (
                <button key={r.key} type="button" className="demo-tile" onClick={() => demoLogin(r.key)}>
                  {r.icon}
                  <strong>{r.label}</strong>
                  <span>{r.blurb}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
