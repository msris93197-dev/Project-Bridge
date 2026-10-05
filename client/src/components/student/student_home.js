import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Snackbar from "@mui/material/Snackbar";
import { API_URL } from "../../config";

const STATUS_COLOR = { approved: "success", pending: "warning", rejected: "error", withdrawn: "default" };

const StudentHome = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [requests, setRequests] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_URL}/students/getSentRequests/${userId}`);
      setRequests(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError(err.response?.data?.message || "Could not load your requests.");
      setRequests((prev) => prev || []);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const withdraw = async (projectId) => {
    setBusy(projectId);
    try {
      await axios.put(`${API_URL}/requests/withdraw/${projectId}/${userId}`);
      setToast({ severity: "success", message: "Request withdrawn." });
      await load();
    } catch (err) {
      setToast({ severity: "error", message: err.response?.data?.message || "Could not withdraw the request." });
    } finally {
      setBusy("");
    }
  };

  const visible = (requests || []).filter((r) => r.status !== "withdrawn");

  return (
    <div className="pb-page">
      <div className="pb-page-header">
        <div>
          <h1>My Requests</h1>
          <p>Track the projects you have applied to.</p>
        </div>
        <Button variant="outlined" onClick={() => navigate(`/students/ProjectBank/${userId}`)}>
          Browse project bank
        </Button>
      </div>

      {error && <div className="pb-error">{error}</div>}
      {requests === null && <Skeleton variant="rounded" height={160} />}

      {requests && visible.length === 0 && !error && (
        <div className="pb-empty">
          <h3>No requests yet</h3>
          <p>Find a project in the project bank and send your first request.</p>
        </div>
      )}

      {visible.map((r) => (
        <section className="pb-card" key={r.projectId}>
          <div className="pb-card-title">
            <h2>{r.projectName}</h2>
            <Chip size="small" variant="outlined" color={STATUS_COLOR[r.status]} label={r.status[0].toUpperCase() + r.status.slice(1)} />
          </div>
          <div className="pb-meta">
            <span>{r.projectType}</span>
            <span>{r.prof_name} · {r.department}</span>
            <span>Room {r.block} {r.roomNumber}</span>
            <span>{Math.max(r.project_slots - r.filled_slots, 0)} of {r.project_slots} slots open</span>
          </div>
          {r.status === "pending" && (
            <div style={{ marginTop: 14 }}>
              <Button size="small" color="error" variant="outlined" disabled={busy === r.projectId} onClick={() => withdraw(r.projectId)}>
                Withdraw request
              </Button>
            </div>
          )}
        </section>
      ))}

      <Snackbar open={Boolean(toast)} autoHideDuration={3500} onClose={() => setToast(null)} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        {toast ? (
          <Alert severity={toast.severity} variant="filled" onClose={() => setToast(null)}>
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </div>
  );
};

export default StudentHome;
