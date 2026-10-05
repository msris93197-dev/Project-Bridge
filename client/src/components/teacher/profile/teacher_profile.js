import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Skeleton from "@mui/material/Skeleton";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import EditIcon from "@mui/icons-material/Edit";
import { API_URL } from "../../../config";
import "./teacher_profile.css";

const BLOCKS = ["A", "B", "C", "D", "E", "H", "I", "J", "K"];
const DEPARTMENTS = [
  ["BIO", "Biological Sciences (BIO)"],
  ["CHE", "Chemical Engineering (CHE)"],
  ["CHEM", "Chemistry (CHEM)"],
  ["CE", "Civil Engineering (CE)"],
  ["CS", "Computer Science (CS)"],
  ["ECON", "Economics and Finance (ECON)"],
  ["EEE", "Electrical & Electronics Engineering (EEE)"],
  ["HSS", "Humanities and Social Sciences (HSS)"],
  ["MATH", "Mathematics (MATH)"],
  ["ME", "Mechanical Engineering (ME)"],
  ["PHA", "Pharmacy (PHA)"],
  ["PHY", "Physics (PHY)"],
];

const EMPTY = { name: "", block: "", roomNumber: "", department: "" };

const TeacherProfile = () => {
  const { userId } = useParams();
  const [saved, setSaved] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_URL}/teachers/getData/${userId}`);
      const profile = { ...EMPTY, ...data };
      setSaved(profile);
      setForm(profile);
      setLoadError("");
    } catch (err) {
      console.error("Error fetching teacher data:", err);
      setLoadError(err.response?.data?.error || err.response?.data?.message || "Could not load your profile.");
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const roomInvalid = form.roomNumber !== "" && !/^\d{1,3}$/.test(form.roomNumber);
  const canSave = form.name.trim() !== "" && !roomInvalid && !saving;

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await axios.put(`${API_URL}/teachers/updateData/${userId}`, form);
      setSaved({ ...EMPTY, ...data });
      setEditing(false);
      setToast({ severity: "success", message: "Profile saved." });
    } catch (err) {
      setToast({ severity: "error", message: err.response?.data?.error || "Could not save your profile." });
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => {
    setForm(saved);
    setEditing(false);
  };

  return (
    <div className="pb-page profile-page">
      <div className="pb-page-header">
        <div>
          <h1>My Profile</h1>
          <p>Students see these details when they look for you in person.</p>
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

      {!saved && !loadError && <Skeleton variant="rounded" height={320} />}

      {saved && (
        <form className="pb-card profile-card" onSubmit={submit}>
          <div className="profile-hero">
            <span className="pb-avatar profile-avatar">
              {(saved.name || "?").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "?"}
            </span>
            <div>
              <strong>{saved.name || "Add your name"}</strong>
              <span className="pb-meta">
                <span>{saved.department || "Department not set"}</span>
                <span>{saved.block && saved.roomNumber ? `Room ${saved.block}-${saved.roomNumber}` : "Room not set"}</span>
              </span>
            </div>
          </div>

          <div className="profile-grid">
            <TextField label="Name" name="name" value={form.name} onChange={change} disabled={!editing} required fullWidth error={editing && form.name.trim() === ""} />
            <TextField select label="Block" name="block" value={form.block} onChange={change} disabled={!editing} fullWidth>
              <MenuItem value="">Select</MenuItem>
              {BLOCKS.map((b) => (
                <MenuItem key={b} value={b}>
                  {b} - Block
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Room number"
              name="roomNumber"
              value={form.roomNumber}
              onChange={change}
              disabled={!editing}
              fullWidth
              inputProps={{ maxLength: 3, inputMode: "numeric" }}
              error={roomInvalid}
              helperText={roomInvalid ? "Use 1-3 digits" : " "}
            />
            <TextField select label="Department" name="department" value={form.department} onChange={change} disabled={!editing} fullWidth>
              <MenuItem value="">Select</MenuItem>
              {DEPARTMENTS.map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
          </div>

          {editing && (
            <div className="profile-buttons">
              <Button variant="text" color="inherit" onClick={cancel} disabled={saving}>
                Cancel
              </Button>
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

export default TeacherProfile;
