import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import Skeleton from "@mui/material/Skeleton";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import UndoIcon from "@mui/icons-material/Undo";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { API_URL } from "../../../config";
import "./teacher_requestsPage.css";

const FILTERS = ["all", "pending", "approved", "rejected"];
const STATUS_COLOR = { pending: "warning", approved: "success", rejected: "error" };

const initials = (name = "?") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "?";

const RequestRow = ({ request, cgCutoff, onChange, busy, projectFull }) => {
  const [open, setOpen] = useState(false);
  const { studentInfo: s, status } = request;
  const eligible = parseFloat(s.cg) >= cgCutoff;
  const canApprove = !projectFull;

  return (
    <div className="req-row">
      <div className="req-main">
        <span className="pb-avatar">{initials(s.name)}</span>
        <div className="req-who">
          <strong>{s.name || "Unnamed student"}</strong>
          <span className="pb-meta">
            <span>{[s.degree, s.firstDegree, s.secondDegree].filter(Boolean).join(" · ") || "Degree not set"}</span>
            <span>CGPA {s.cg || "—"}</span>
          </span>
        </div>
        <Chip
          size="small"
          variant="outlined"
          color={eligible ? "success" : "error"}
          label={eligible ? "Eligible" : "Below cutoff"}
        />
        <div className="req-actions">
          {status === "pending" ? (
            <Stack direction="row" spacing={1}>
              <Tooltip title={canApprove ? "" : "All slots are filled"}>
                <span>
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    startIcon={<CheckIcon />}
                    disabled={busy || !canApprove}
                    onClick={() => onChange("approved")}
                  >
                    Approve
                  </Button>
                </span>
              </Tooltip>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<CloseIcon />}
                disabled={busy}
                onClick={() => onChange("rejected")}
              >
                Reject
              </Button>
            </Stack>
          ) : (
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip size="small" color={STATUS_COLOR[status]} label={status[0].toUpperCase() + status.slice(1)} />
              <Tooltip title="Move back to pending">
                <span>
                  <IconButton size="small" disabled={busy} onClick={() => onChange("pending")}>
                    <UndoIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          )}
          <IconButton
            size="small"
            aria-label="Show details"
            onClick={() => setOpen(!open)}
            className={`req-chevron ${open ? "open" : ""}`}
          >
            <KeyboardArrowDownIcon />
          </IconButton>
        </div>
      </div>

      <Collapse in={open} unmountOnExit>
        <div className="req-details">
          <p>
            <span className="req-label">Why this project</span>
            {request.reason_to_do_project}
          </p>
          <p>
            <span className="req-label">Prerequisites fulfilled</span>
            {(request.pre_requisites_fulfilled || []).length
              ? request.pre_requisites_fulfilled.map((p) => <Chip key={p} size="small" label={p} sx={{ mr: 0.5 }} />)
              : "None listed"}
          </p>
          <Stack direction="row" spacing={1}>
            {s.resume && s.resume.resumeUrl && (
              <Button size="small" variant="outlined" startIcon={<DescriptionOutlinedIcon />} href={s.resume.resumeUrl} target="_blank" rel="noreferrer">
                Resume
              </Button>
            )}
            {s.performanceSheet && s.performanceSheet.performanceSheetUrl && (
              <Button size="small" variant="outlined" startIcon={<DescriptionOutlinedIcon />} href={s.performanceSheet.performanceSheetUrl} target="_blank" rel="noreferrer">
                Performance sheet
              </Button>
            )}
            {!(s.resume && s.resume.resumeUrl) && !(s.performanceSheet && s.performanceSheet.performanceSheetUrl) && (
              <span className="pb-meta">No documents uploaded</span>
            )}
          </Stack>
        </div>
      </Collapse>
    </div>
  );
};

const ProjectRequests = () => {
  const { userId } = useParams();
  const [projects, setProjects] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [busyKey, setBusyKey] = useState("");
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/teachers/projectRequests/${userId}`);
      setProjects(Array.isArray(response.data) ? response.data : []);
      setError("");
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError(err.response?.data?.message || "Could not load requests. Please try again.");
      setProjects((prev) => prev || []);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (projectId, studentId, status) => {
    setBusyKey(`${projectId}:${studentId}`);
    try {
      await axios.put(`${API_URL}/teachers/status/${projectId}/${studentId}`, { status });
      setToast({ severity: "success", title: "Updated", message: `Request ${status === "pending" ? "moved back to pending" : status}.` });
      await load();
    } catch (err) {
      setToast({ severity: "error", title: "Could not update", message: err.response?.data?.message || "Something went wrong." });
    } finally {
      setBusyKey("");
    }
  };

  const totals = useMemo(() => {
    const all = (projects || []).flatMap((p) => p.requestsData);
    const count = (st) => all.filter((r) => r.status === st).length;
    return { all: all.length, pending: count("pending"), approved: count("approved"), rejected: count("rejected") };
  }, [projects]);

  return (
    <div className="pb-page">
      <div className="pb-page-header">
        <div>
          <h1>Project Requests</h1>
          <p>Review applications and manage your project slots.</p>
        </div>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {FILTERS.map((f) => (
            <Chip
              key={f}
              clickable
              label={`${f[0].toUpperCase() + f.slice(1)} · ${totals[f]}`}
              color={filter === f ? "primary" : "default"}
              variant={filter === f ? "filled" : "outlined"}
              onClick={() => setFilter(f)}
            />
          ))}
        </Stack>
      </div>

      {error && <div className="pb-error">{error}</div>}

      {projects === null && (
        <>
          <Skeleton variant="rounded" height={140} sx={{ mb: 2 }} />
          <Skeleton variant="rounded" height={140} />
        </>
      )}

      {projects && projects.length === 0 && !error && (
        <div className="pb-empty">
          <h3>No projects yet</h3>
          <p>Create a project from the Home page and student requests will appear here.</p>
        </div>
      )}

      {(projects || []).map(({ project, requestsData }) => {
        const rows = requestsData.filter((r) => filter === "all" || r.status === filter);
        const slots = Number(project.project_slots) || 0;
        const filled = Number(project.filled_slots) || 0;
        const full = slots > 0 && filled >= slots;
        return (
          <section className="pb-card" key={project._id}>
            <div className="pb-card-title">
              <h2>{project.project_name}</h2>
              <Chip size="small" variant="outlined" label={`${project.project_type || "Project"} · CG ≥ ${project.cg_cutoff}`} />
            </div>
            <div className="req-slots">
              <LinearProgress variant="determinate" value={slots ? (filled / slots) * 100 : 0} color={full ? "success" : "primary"} />
              <span className="pb-meta">
                {filled}/{slots} slots filled{full ? " · Full" : ""}
              </span>
            </div>

            {requestsData.length === 0 ? (
              <p className="pb-meta req-none">No requests yet.</p>
            ) : rows.length === 0 ? (
              <p className="pb-meta req-none">No {filter} requests.</p>
            ) : (
              rows.map((r) => (
                <RequestRow
                  key={r.studentId}
                  request={r}
                  cgCutoff={parseFloat(project.cg_cutoff) || 0}
                  projectFull={full}
                  busy={busyKey === `${project._id}:${r.studentId}`}
                  onChange={(status) => updateStatus(project._id, r.studentId, status)}
                />
              ))
            )}
          </section>
        );
      })}

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {toast ? (
          <Alert severity={toast.severity} variant="filled" onClose={() => setToast(null)}>
            <AlertTitle>{toast.title}</AlertTitle>
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </div>
  );
};

export default ProjectRequests;
