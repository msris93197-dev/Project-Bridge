import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";
import Skeleton from "@mui/material/Skeleton";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import EditIcon from "@mui/icons-material/Edit";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import app from "../firebase";
import { API_URL } from "../../config";
import "./student_profile.css";

const FIRST_DEGREES = [
  ["CE", "Civil Engineering (CE)"],
  ["CSE", "Computer Science Engineering (CSE)"],
  ["ECE", "Electronics and Communication Engineering (ECE)"],
  ["EEE", "Electrical and Electronics Engineering (EEE)"],
  ["ENI", "Electronics and Instrumentation Engineering (ENI)"],
  ["ME", "Mechanical Engineering (ME)"],
  ["PHA", "B.Pharma (PHA)"],
];
const SECOND_DEGREES = [
  ["BIO", "Biology (BIO)"],
  ["CHEM", "Chemistry (CHEM)"],
  ["ECON", "Economics (ECON)"],
  ["MATH", "Mathematics (MATH)"],
  ["PHY", "Physics (PHY)"],
];
const EMPTY = { name: "", idNumber: "", degree: "Single Degree", firstDegree: "", secondDegree: "", cg: "" };

const FileField = ({ label, name, url, disabled, progress, onPick }) => (
  <div className="file-field">
    <span className="file-label">{label}</span>
    <div className="file-actions">
      {url ? (
        <Button size="small" variant="outlined" startIcon={<VisibilityIcon />} onClick={() => window.open(url, "_blank")}>
          {name || "View file"}
        </Button>
      ) : (
        <span className="pb-meta">Nothing uploaded yet</span>
      )}
      <Button component="label" size="small" variant="contained" color="secondary" startIcon={<UploadFileIcon />} disabled={disabled}>
        {url ? "Replace" : "Upload"}
        <input hidden type="file" accept="application/pdf" onChange={(e) => e.target.files[0] && onPick(e.target.files[0])} />
      </Button>
    </div>
    {progress > 0 && progress < 100 && <LinearProgress variant="determinate" value={progress} sx={{ mt: 1, borderRadius: 2 }} />}
  </div>
);

const StudentProfile = () => {
  const { userId } = useParams();
  const [saved, setSaved] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [files, setFiles] = useState({ resume: {}, performanceSheet: {} });
  const [progress, setProgress] = useState({ resume: 0, performanceSheet: 0 });
  const [uploaded, setUploaded] = useState({});

  const load = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_URL}/students/getData/${userId}`);
      const profile = { ...EMPTY, ...data, degree: data.degree || "Single Degree" };
      setSaved(profile);
      setForm(profile);
      setFiles({ resume: data.resume || {}, performanceSheet: data.performanceSheet || {} });
      setLoadError("");
    } catch (err) {
      console.error("Error fetching student data:", err);
      setLoadError(err.response?.data?.error || err.response?.data?.message || "Could not load your profile.");
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const upload = (file, kind) => {
    const urlKey = kind === "resume" ? "resumeUrl" : "performanceSheetUrl";
    const nameKey = kind === "resume" ? "resumeName" : "performanceSheetName";
    const storageRef = ref(getStorage(app), `${kind}/${userId}_${kind}_${file.name}`);
    const task = uploadBytesResumable(storageRef, file);
    task.on(
      "state_changed",
      (snap) => setProgress((p) => ({ ...p, [kind]: Math.round((snap.bytesTransferred / snap.totalBytes) * 100) })),
      (error) => {
        console.error(error);
        setProgress((p) => ({ ...p, [kind]: 0 }));
        setToast({ severity: "error", message: "Upload failed. Check that Firebase Storage is enabled." });
      },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        setUploaded((u) => ({ ...u, [urlKey]: url, [nameKey]: file.name }));
        setFiles((f) => ({ ...f, [kind]: { [urlKey]: url, [nameKey]: file.name } }));
      }
    );
  };

  const change = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value, ...(name === "degree" && value === "Single Degree" ? { secondDegree: "" } : {}) }));
  };

  const cgInvalid = form.cg !== "" && (Number.isNaN(Number(form.cg)) || Number(form.cg) < 0 || Number(form.cg) > 10);
  const canSave = form.name.trim() !== "" && !cgInvalid && !saving;

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(`${API_URL}/students/updateData/${userId}`, { ...form, ...uploaded });
      setUploaded({});
      setEditing(false);
      await load();
      setToast({ severity: "success", message: "Profile saved." });
    } catch (err) {
      setToast({ severity: "error", message: err.response?.data?.error || "Could not save your profile." });
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => {
    setForm(saved);
    setUploaded({});
    setEditing(false);
    load();
  };

  const initials = (saved?.name || "?").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "?";

  return (
    <div className="pb-page profile-page">
      <div className="pb-page-header">
        <div>
          <h1>My Profile</h1>
          <p>Professors use this to decide on your requests. Keep it up to date.</p>
        </div>
        {saved && !editing && (
          <Button variant="contained" color="secondary" startIcon={<EditIcon />} onClick={() => setEditing(true)}>
            Edit
          </Button>
        )}
      </div>

      {loadError && (
        <div className="pb-error">
          {loadError}{" "}
          <Button size="small" color="inherit" onClick={load}>
            Retry
          </Button>
        </div>
      )}
      {!saved && !loadError && <Skeleton variant="rounded" height={420} />}

      {saved && (
        <form onSubmit={submit}>
          <div className="pb-card">
            <div className="profile-hero">
              <span className="pb-avatar profile-avatar">{initials}</span>
              <div>
                <strong>{saved.name || "Add your name"}</strong>
                <span className="pb-meta">
                  <span>{saved.idNumber || "ID not set"}</span>
                  <span>CGPA {saved.cg || "—"}</span>
                </span>
              </div>
            </div>

            <div className="profile-grid">
              <TextField label="Name" name="name" value={form.name} onChange={change} disabled={!editing} required fullWidth />
              <TextField label="ID number" name="idNumber" value={form.idNumber} onChange={change} disabled={!editing} fullWidth />
              <TextField
                label="CGPA"
                name="cg"
                type="number"
                value={form.cg}
                onChange={change}
                disabled={!editing}
                fullWidth
                inputProps={{ min: 0, max: 10, step: 0.01 }}
                error={cgInvalid}
                helperText={cgInvalid ? "Enter a value between 0 and 10" : " "}
              />
              <TextField select label="Degree" name="degree" value={form.degree} onChange={change} disabled={!editing} fullWidth>
                <MenuItem value="Single Degree">Single Degree</MenuItem>
                <MenuItem value="Dual Degree">Dual Degree</MenuItem>
              </TextField>
              <TextField select label="B.E. degree" name="firstDegree" value={form.firstDegree} onChange={change} disabled={!editing} fullWidth>
                <MenuItem value="">Select</MenuItem>
                {FIRST_DEGREES.map(([v, l]) => (
                  <MenuItem key={v} value={v}>{l}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="M.Sc. degree"
                name="secondDegree"
                value={form.secondDegree}
                onChange={change}
                disabled={!editing || form.degree !== "Dual Degree"}
                fullWidth
              >
                <MenuItem value="">Select</MenuItem>
                {SECOND_DEGREES.map(([v, l]) => (
                  <MenuItem key={v} value={v}>{l}</MenuItem>
                ))}
              </TextField>
            </div>
          </div>

          <div className="pb-card">
            <div className="pb-card-title">
              <h2>Documents</h2>
              <span className="pb-meta">PDF only</span>
            </div>
            <FileField
              label="Resume"
              url={files.resume.resumeUrl}
              name={files.resume.resumeName}
              disabled={!editing}
              progress={progress.resume}
              onPick={(f) => upload(f, "resume")}
            />
            <FileField
              label="Performance sheet"
              url={files.performanceSheet.performanceSheetUrl}
              name={files.performanceSheet.performanceSheetName}
              disabled={!editing}
              progress={progress.performanceSheet}
              onPick={(f) => upload(f, "performanceSheet")}
            />
          </div>

          {editing && (
            <div className="profile-buttons">
              <Button variant="text" color="inherit" onClick={cancel} disabled={saving}>Cancel</Button>
              <Button type="submit" variant="contained" color="success" disabled={!canSave}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          )}
        </form>
      )}

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

export default StudentProfile;
