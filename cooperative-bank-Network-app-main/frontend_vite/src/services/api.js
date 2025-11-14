// src/services/api.js
import axios from "axios";
import { toast } from "sonner";

// ------------------ BASE CONFIG ------------------
const api = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? "/api"
      : "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// ------------------ INTERCEPTORS ------------------
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
      const requestUrl = err.config?.url || "";

      // Skip redirect for login or public endpoints
      if (!requestUrl.includes("/auth/login") && !requestUrl.includes("/auth/register")) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);


// ------------------ SAFE WRAPPER ------------------
async function safeRequest(promise, successMsg = null, errorMsg = "Something went wrong") {
  try {
    const res = await promise;
    if (successMsg) toast.success(successMsg);
    return res;
  } catch (err) {
    console.error("API Error:", err.response?.data || err.message);
    toast.error(err.response?.data?.error || errorMsg);
    throw err;
  }
}

// ===================================================
// =============== AUTH APIS =========================
// ===================================================
export const authAPI = {
  login: (credentials) => safeRequest(api.post("/auth/login", credentials)),
  register: (userData) => safeRequest(api.post("/auth/register", userData)),
  verifyToken: () => safeRequest(api.get("/auth/verify")),
  logout: () => safeRequest(api.post("/auth/logout")),
  getProfile: () => safeRequest(api.get("/auth/profile")),
   // 🔹 Forgot Password: request reset link
  forgotPassword: (email) =>
    safeRequest(
      api.post("/auth/forgot-password", { email }),
      "Reset link sent to your email",
      "Failed to send reset link"
    ),

  resetPassword: (token, password) =>
    safeRequest(
      api.post(`/auth/reset-password/${token}`, { password }),
      "Password reset successful",
      "Failed to reset password"
    ),
};

// ===================================================
// =============== DASHBOARD APIS ====================
// ===================================================
export const dashboardAPI = {
  // Admin: all banks + branches
  getStats: () => safeRequest(api.get("/dashboard/stats")),

  // Manager/User: stats filtered by bank & branch
  getStatsForBranch: (bankId, branchId) =>
    safeRequest(
      api.get("/dashboard/stats", {
        params: { bank_id: bankId, branch_id: branchId },
      })
    ),
};

// ===================================================
// =============== LOAN APIS =========================
// ===================================================
// ------------------ LOAN APIS ------------------
export const loanAPI = {
  // Create loan (Admin, Manager, User)
  createApplication: (data) =>
    safeRequest(api.post("/loans/applications", data), ""),

  // List loans with optional filters
  getLoanApplications: ({
    page = 1,
    limit = 10,
    search = "",
    status = "",
    bank_id = "",
    branch_id = "",
  } = {}) =>
    safeRequest(
      api.get("/loans/applications", {
        params: { page, limit, search, status, bank_id, branch_id },
      }),
      null,
      "Failed to fetch loan applications"
    ),

  updateApplication: (id, data) =>
    safeRequest(api.put(`/loans/applications/${id}`, data), ""),

  deleteApplication: (id) =>
    safeRequest(api.delete(`/loans/applications/${id}`), ""),

  searchApplications: (params) =>
    safeRequest(api.get("/loans/applications/search", { params })),
};


// ===================================================
// =============== UPLOAD APIS =======================
// ===================================================
export const uploadAPI = {
  uploadPhoto: (formData) =>
    safeRequest(
      api.post("/upload/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
      "File uploaded successfully"
    ),
};

// ===================================================
// =============== BANK SERVICES =====================
// ===================================================
export const servicesAPI = {
  getServices: () => safeRequest(api.get("/services")),
};

// ===================================================
// =============== ADMIN / MANAGER USER MGMT =========
// ===================================================
export const adminAPI = {
  getUsers: (page = 1, limit = 10, search = "") =>
    safeRequest(api.get("/admin/users", { params: { page, limit, search } })),

  createUser: (data) =>
    safeRequest(api.post("/admin/users", data), ""),

  updateUser: (id, data) =>
    safeRequest(api.put(`/admin/users/${id}`, data), "User updated successfully"),

  deleteUser: (id) =>
    safeRequest(api.delete(`/admin/users/${id}`), "User deleted successfully"),

  resetPassword: (id, password) =>
    safeRequest(
      api.post(`/admin/users/${id}/reset-password`, { password }),
      ""
    ),
};

export const userAPI = {
  getProfile: () => safeRequest(api.get("/user/profile")),
};

// ===================================================
// =============== SUPERADMIN BANK MGMT ==============
// ===================================================
export const superAdminAPI = {
  // ---- BANKS ----
  getBanks: (page = 1, limit = 10, search = "") =>
    safeRequest(api.get("/admin/banks", { params: { page, limit, search } })),

  createBank: (data) =>
    safeRequest(api.post("/admin/banks", data), "Society created successfully"),

  updateBank: (id, data) =>
    safeRequest(api.put(`/admin/banks/${id}`, data), "Society updated successfully"),

  deleteBank: (id) =>
    safeRequest(api.delete(`/admin/banks/${id}`), "Society deleted successfully"),

  // ---- BRANCHES ----
  getBranches: (bankName = "", page = 1, limit = 10, search = "") =>
    safeRequest(
      api.get("/admin/branches", {
        params: { bank_name: bankName, page, limit, search },
      })
    ),

  createBranch: (data) =>
    safeRequest(api.post("/admin/branches", data), "Branch created successfully"),

  updateBranch: (id, data) =>
    safeRequest(api.put(`/admin/branches/${id}`, data), "Branch updated successfully"),

  deleteBranch: (id) =>
    safeRequest(api.delete(`/admin/branches/${id}`), "Branch deleted successfully"),
};

// ===================================================
// =============== CONTACT MESSAGE APIS ==============
// ===================================================
export const contactAPI = {
  // Public form submission
  sendMessage: (data) =>
    safeRequest(
      api.post("/contact", data),
      "Message sent successfully",
      "Failed to send message"
    ),

  // Admin / Manager: view all contact messages
  getMessages: ({ page = 1, limit = 10, search = "" } = {}) =>
    safeRequest(
      api.get("/contact", { params: { page, limit, search } }),
      null,
      "Failed to fetch messages"
    ),

  // Admin / Manager: update message status
  updateStatus: (id, status) =>
    safeRequest(
      api.put(`/contact/${id}/status`, { status }),
      `Marked as ${status}`
    ),

  // Admin: delete a contact message
  deleteMessage: (id) =>
    safeRequest(
      api.delete(`/contact/${id}`),
      ""
    ),
};

export default api;
