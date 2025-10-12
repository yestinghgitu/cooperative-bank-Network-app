// src/services/api.js
import axios from "axios";
import { toast } from "sonner"; // you already used sonner in main.jsx

const api = axios.create({
  baseURL: process.env.NODE_ENV === "production" ? "/api" : "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (!config.url.includes("/public/")) {
    const token = localStorage.getItem("authToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

async function safeRequest(promise, successMsg = null, errorMsg = "Something went wrong") {
  try {
    const res = await promise;
    if (successMsg) toast.success(successMsg);
    // return the axios response (not only .data) so callers can check data/pagination
    return res;
  } catch (err) {
    console.error("API Error:", err.response?.data || err.message);
    toast.error(err.response?.data?.error || errorMsg);
    throw err;
  }
}

export const authAPI = {
  login: (credentials) => safeRequest(api.post("/auth/login", credentials)),
  register: (userData) => safeRequest(api.post("/auth/register", userData)),
  verifyToken: () => safeRequest(api.get("/auth/verify")),
  logout: () => safeRequest(api.post("/auth/logout")),
  getProfile: () => safeRequest(api.get("/auth/profile")),
};

export const dashboardAPI = {
  getStats: () => safeRequest(api.get("/dashboard/stats")),
};

export const loanAPI = {
  createApplication: (data) => safeRequest(api.post("/loans/applications", data)),
  getLoanApplications: (page = 1, limit = 10, search = "", sort = "latest") =>
    safeRequest(api.get("/loans/applications", { params: { page, limit, search, sort } }), null, "Failed to fetch loan applications"),
  updateApplication: (id, data) => safeRequest(api.put(`/loans/applications/${id}`, data)),
  deleteApplication: (id) => safeRequest(api.delete(`/loans/applications/${id}`)),
  // public/private search:
  searchApplicationsPublic: (params) => safeRequest(api.get("/public/loans/applications", { params })),
  searchApplicationsPrivate: (params) => safeRequest(api.get("/private/loans/applications", { params })),
};

export const uploadAPI = {
  uploadPhoto: (formData) => safeRequest(api.post("/upload/photo", formData, { headers: { "Content-Type": "multipart/form-data" } })),
};

export const servicesAPI = {
  getServices: () => safeRequest(api.get("/services")),
};

export default api;
