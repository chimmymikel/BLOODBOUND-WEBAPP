import axios from "axios";

// ── Base instance ────────────────────────────────────────────
export const api = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  headers: { "Content-Type": "application/json" },
});

// ── JWT interceptor — attaches token to every request ────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ══════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════
export const registerUser = (data) => api.post("/auth/register", data);
export const loginUser    = (data) => api.post("/auth/login", data);
export const getMe        = ()     => api.get("/auth/me");

// ══════════════════════════════════════════════════════════════
// REQUESTS
// ══════════════════════════════════════════════════════════════
export const getRequests    = (params = {}) => api.get("/requests", { params });
export const getRequestById = (id)          => api.get(`/requests/${id}`);
export const createRequest  = (data)        => api.post("/requests", data);
export const fulfillRequest = (id)          => api.patch(`/requests/${id}/fulfill`);

// ══════════════════════════════════════════════════════════════
// COMMITMENTS
// ══════════════════════════════════════════════════════════════
// Donor sees their history  → getCommitments({ donorId: 3 })
// Requester sees who committed → getCommitments({ requestId: 5 })
export const getCommitments   = (params = {}) => api.get("/commitments", { params });

// ✅ FIXED: donorId removed — backend reads it from JWT, not request body
export const createCommitment = (data)        => api.post("/commitments", data);

// ✅ ADDED: Cancel a pending commitment (soft-delete on backend)
export const cancelCommitment = (id)          => api.delete(`/commitments/${id}`);

// ══════════════════════════════════════════════════════════════
// PROFILE
// ══════════════════════════════════════════════════════════════
export const getProfile       = (id)          => api.get(`/profile/${id}`);
export const updateProfile    = (id, data)    => api.put(`/profile/${id}`, data);
export const updatePassword   = (id, data)    => api.put(`/profile/${id}/password`, data);
export const checkEligibility = (id)          => api.get(`/profile/${id}/eligibility`);
export const uploadPhoto      = (id, formData) =>
  api.post(`/profile/${id}/photo`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// ══════════════════════════════════════════════════════════════
// HOSPITALS
// ══════════════════════════════════════════════════════════════
export const getHospitals = () => api.get("/hospitals");