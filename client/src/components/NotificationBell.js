import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { API_URL } from "../config";

const timeAgo = (iso) => {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.round(mins / 60)}h ago`;
  return `${Math.round(mins / 1440)}d ago`;
};

const NotificationBell = ({ userId }) => {
  const [items, setItems] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/notifications/${userId}`);
      setItems(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  }, [userId]);

  useEffect(() => {
    load();
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, [load]);

  const unread = items.filter((n) => !n.read).length;

  const open = async (event) => {
    setAnchorEl(event.currentTarget);
    if (unread > 0) {
      try {
        await axios.put(`${API_URL}/notifications/${userId}/readAll`);
      } catch (error) {
        console.error("Error marking notifications read:", error);
      }
    }
  };

  const close = () => {
    setAnchorEl(null);
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <>
      <IconButton aria-label="Notifications" onClick={open} sx={{ color: "rgb(153, 167, 187)" }}>
        <Badge badgeContent={unread} color="primary" max={9}>
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={close}
        PaperProps={{ sx: { width: 340, maxHeight: 420, mt: 1 } }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
          Notifications
        </Typography>
        <Divider />
        {items.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 3, textAlign: "center" }}>
            You're all caught up.
          </Typography>
        )}
        {items.map((n) => (
          <MenuItem
            key={n._id}
            onClick={() => {
              close();
              if (n.link) navigate(n.link);
            }}
            sx={{ whiteSpace: "normal", alignItems: "flex-start", flexDirection: "column", gap: 0.25 }}
          >
            <Typography variant="body2" sx={{ fontWeight: n.read ? 400 : 600 }}>
              {n.message}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {timeAgo(n.createdAt)}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default NotificationBell;
