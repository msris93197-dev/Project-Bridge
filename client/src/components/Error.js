import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";

const Error = () => {
  const navigate = useNavigate();
  return (
    <div className="pb-page" style={{ textAlign: "center", paddingTop: "18vh" }}>
      <h1 style={{ fontSize: "3rem", fontWeight: 600 }}>Something went wrong</h1>
      <p style={{ color: "var(--pb-muted)", maxWidth: 440, margin: "12px auto 28px" }}>
        The page you asked for doesn't exist, or the account you signed in with can't use the role you picked.
      </p>
      <Button variant="contained" onClick={() => navigate("/")}>
        Back to login
      </Button>
    </div>
  );
};

export default Error;
