import axios from "axios";

export const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

// The API authenticates with a session cookie, so every request to it must carry credentials.
axios.defaults.withCredentials = true;

const nativeFetch = window.fetch.bind(window);
window.fetch = (input, init = {}) => {
  const url = typeof input === "string" ? input : input.url;
  return url.startsWith(API_URL) ? nativeFetch(input, { credentials: "include", ...init }) : nativeFetch(input, init);
};
