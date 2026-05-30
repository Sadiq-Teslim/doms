import axios from "axios";

// In dev this stays "/api" (Vite proxies to localhost:4000).
// In production set VITE_API_URL to your deployed backend, e.g.
//   https://your-doms-api.onrender.com/api
export const API_BASE = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("doms_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config.url.includes("/auth/login")) {
      localStorage.removeItem("doms_token");
      if (window.location.pathname !== "/login") window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

/** Opens a PDF endpoint in a new tab using the auth token (blob fetch). */
export async function openPdf(path) {
  const token = localStorage.getItem("doms_token");
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    alert("Failed to load PDF");
    return;
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export default api;
