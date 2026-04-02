import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true, // send HTTP-only cookies on every request
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// ── Response interceptor: redirect to /login on 401 ──────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // Token expired or invalid — clear any client state and redirect
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
