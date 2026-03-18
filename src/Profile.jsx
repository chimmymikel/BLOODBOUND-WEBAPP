import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const BASE_URL = "http://localhost:8080/api/v1";

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();

  const passedUser = location.state?.user || {};
  const userId = passedUser.id;

  // ── FIX: Render INSTANTLY with passedUser from login/dashboard.
  // Do NOT block on API call. The user object from location.state
  // already has all fields except profilePicture.
  // We init user directly from passedUser — no loading spinner needed.
  const [user, setUser]                   = useState(passedUser);
  const [refreshing, setRefreshing]       = useState(false); // silent bg refresh

  // Global toast
  const [toast, setToast]                 = useState({ text: "", ok: false, show: false });

  // Edit profile
  const [isEditing, setIsEditing]         = useState(false);
  const [editForm, setEditForm]           = useState({
    fullName:      passedUser.fullName      || "",
    bloodType:     passedUser.bloodType     || "",
    hospitalOrOrg: passedUser.hospitalOrOrg || "",
    contactNumber: passedUser.contactNumber || "",
  });
  const [editMsg, setEditMsg]             = useState({ text: "", ok: false });

  // Photo upload
  const [selectedFile, setSelectedFile]   = useState(null);
  const [photoMsg, setPhotoMsg]           = useState({ text: "", ok: false });

  // Change password
  const [showPwdForm, setShowPwdForm]     = useState(false);
  const [pwdForm, setPwdForm]             = useState({ oldPassword: "", newPassword: "", confirmNew: "" });
  const [pwdMsg, setPwdMsg]               = useState({ text: "", ok: false });

  // Sidebar hover
  const [hoveredTab, setHoveredTab]       = useState(null);
  const [hoveredLogout, setHoveredLogout] = useState(false);

  const navItems = ["Overview", "Donor Directory", "Active Requests", "My Profile"];

  // ── Toast helper ─────────────────────────────────────────────────────
  const showToast = (text, ok) => {
    setToast({ text, ok, show: true });
    setTimeout(() => setToast({ text: "", ok: false, show: false }), 3500);
  };

  // ── Redirect if no userId ────────────────────────────────────────────
  useEffect(() => {
    if (!userId) { navigate("/login"); return; }
    // Silent background refresh — only to get profilePicture BLOB
    // and ensure data is fresh. Page is already visible from passedUser.
    backgroundRefresh();
  }, [userId]);

  // ── Background refresh — silent, non-blocking ────────────────────────
  // This runs AFTER the page is already rendered.
  // Only updates state when response arrives — user sees no delay.
  const backgroundRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await axios.get(`${BASE_URL}/profile/${userId}`);
      if (res.data.success) {
        const u = res.data.data;
        setUser(u);
        // Also update edit form with latest data
        setEditForm({
          fullName:      u.fullName      || "",
          bloodType:     u.bloodType     || "",
          hospitalOrOrg: u.hospitalOrOrg || "",
          contactNumber: u.contactNumber || "",
        });
      }
    } catch (err) {
      // Silent failure — user already sees the page with passedUser data
      console.error("Background refresh error:", err);
    } finally {
      setRefreshing(false);
    }
  };

  // ── 56-day eligibility ────────────────────────────────────────────────
  const calculateEligibility = () => {
    if (!user?.lastDonationDate) return { eligible: true, days: 0 };
    const diffDays = Math.ceil(
      Math.abs(new Date() - new Date(user.lastDonationDate)) / (1000 * 60 * 60 * 24)
    );
    const remaining = 56 - diffDays;
    return { eligible: remaining <= 0, days: Math.max(remaining, 0) };
  };

  // ── PUT /api/v1/profile/{id} ──────────────────────────────────────────
  const handleEditSave = async () => {
    setEditMsg({ text: "", ok: false });
    try {
      const body = {
        fullName:      editForm.fullName      || null,
        bloodType:     user.role === "DONOR"     ? (editForm.bloodType     || null) : null,
        hospitalOrOrg: user.role === "REQUESTER" ? (editForm.hospitalOrOrg || null) : null,
        contactNumber: user.role === "REQUESTER" ? (editForm.contactNumber || null) : null,
      };
      const res = await axios.put(`${BASE_URL}/profile/${userId}`, body);
      if (res.data.success) {
        showToast("Profile updated successfully!", true);
        setIsEditing(false);
        backgroundRefresh();
      } else {
        setEditMsg({ text: res.data.message || "Update failed.", ok: false });
      }
    } catch (err) {
      setEditMsg({ text: err.response?.data?.message || "Update failed.", ok: false });
    }
  };

  // ── POST /api/v1/profile/{id}/photo ──────────────────────────────────
  const handlePhotoUpload = async () => {
    if (!selectedFile) return;
    if (!["image/jpeg", "image/png"].includes(selectedFile.type)) {
      setPhotoMsg({ text: "Only .jpg and .png files are allowed.", ok: false });
      return;
    }
    const formData = new FormData();
    formData.append("file", selectedFile);
    try {
      const res = await axios.post(`${BASE_URL}/profile/${userId}/photo`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        showToast("Photo updated successfully!", true);
        setPhotoMsg({ text: "", ok: false });
        setSelectedFile(null);
        backgroundRefresh(); // refresh to get new photo
      } else {
        setPhotoMsg({ text: res.data.message || "Upload failed.", ok: false });
      }
    } catch (err) {
      setPhotoMsg({ text: err.response?.data?.message || "Upload failed.", ok: false });
    }
  };

  // ── PUT /api/v1/profile/{id}/password ────────────────────────────────
  const handlePasswordChange = async () => {
    setPwdMsg({ text: "", ok: false });
    if (!userId) {
      setPwdMsg({ text: "Session expired. Please log in again.", ok: false });
      return;
    }
    if (pwdForm.newPassword !== pwdForm.confirmNew) {
      setPwdMsg({ text: "New passwords do not match.", ok: false });
      return;
    }
    if (pwdForm.newPassword.length < 8) {
      setPwdMsg({ text: "Password must be at least 8 characters.", ok: false });
      return;
    }
    try {
      console.log("Changing password for userId:", userId);
      const res = await axios.put(`${BASE_URL}/profile/${userId}/password`, {
        oldPassword: pwdForm.oldPassword,
        newPassword: pwdForm.newPassword,
      });
      console.log("Password change response:", res.data);
      if (res.data.success) {
        showToast("Password changed successfully! Use your new password next time you log in.", true);
        setPwdForm({ oldPassword: "", newPassword: "", confirmNew: "" });
        setTimeout(() => setShowPwdForm(false), 400);
      } else {
        const errMsg = res.data?.error?.message || res.data?.message || "Incorrect current password.";
        setPwdMsg({ text: errMsg, ok: false });
      }
    } catch (err) {
      console.error("Password change error:", err.response);
      const errMsg = err.response?.data?.error?.message
        || err.response?.data?.message
        || `Error ${err.response?.status || "unknown"}: Password change failed.`;
      setPwdMsg({ text: errMsg, ok: false });
    }
  };

  // ── Sidebar nav ───────────────────────────────────────────────────────
  const handleNavClick = (item) => {
    if (item === "Overview") navigate("/dashboard", { state: { user: passedUser } });
  };

  // ── Helpers ───────────────────────────────────────────────────────────
  const inlineMsg = (m) => m.text ? (
    <div style={{
      fontSize: "13px", fontWeight: "700",
      color: m.ok ? "#065f46" : "#991b1b",
      backgroundColor: m.ok ? "#ecfdf5" : "#fff1f2",
      border: `1.5px solid ${m.ok ? "#10b981" : "#ef4444"}`,
      padding: "10px 14px", borderRadius: "8px",
    }}>
      {m.ok ? "✅ " : "❌ "}{m.text}
    </div>
  ) : null;

  const fieldInput = (label, key, form, setForm, type = "text") => (
    <div key={key}>
      <label style={{
        display: "block", marginBottom: "6px", fontSize: "11px",
        fontWeight: "800", color: "#64748b",
        textTransform: "uppercase", letterSpacing: "0.05em",
      }}>
        {label}
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        style={{
          width: "100%", padding: "10px 12px", borderRadius: "8px",
          border: "2px solid #e2e8f0", fontSize: "14px",
          fontFamily: "inherit", boxSizing: "border-box",
          outline: "none", color: "#0f172a",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#D32F2F")}
        onBlur={(e)  => (e.target.style.borderColor = "#e2e8f0")}
      />
    </div>
  );

  const readRow = (label, value, highlight = false, last = false) => (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "14px 0",
      borderBottom: last ? "none" : "1px solid #f8fafc",
    }}>
      <span style={{
        fontSize: "13px", fontWeight: "800", color: "#64748b",
        textTransform: "uppercase", letterSpacing: "0.04em",
      }}>
        {label}
      </span>
      <span style={{ fontSize: "15px", fontWeight: "700", color: highlight ? "#D32F2F" : "#0f172a" }}>
        {value || "—"}
      </span>
    </div>
  );

  // ── No userId guard ───────────────────────────────────────────────────
  if (!userId) return null; // useEffect will redirect to /login

  const { eligible, days } = calculateEligibility();

  // Photo: use BLOB from background refresh if available,
  // otherwise fallback to generated avatar (no external slow request)
  const avatarSrc = user.profilePicture
    ? `data:image/jpeg;base64,${user.profilePicture}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || "U")}&background=D32F2F&color=fff&size=128`;

  // ─────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: '"Inter", sans-serif' }}>

      {/* ── Global Toast ────────────────────────────────────────────────── */}
      {toast.show && (
        <div style={{
          position: "fixed", top: "32px", right: "32px", zIndex: 9999,
          backgroundColor: toast.ok ? "#ecfdf5" : "#fff1f2",
          border: `2px solid ${toast.ok ? "#10b981" : "#ef4444"}`,
          color: toast.ok ? "#065f46" : "#991b1b",
          padding: "16px 24px", borderRadius: "14px", fontWeight: "800",
          fontSize: "14px", boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          display: "flex", alignItems: "center", gap: "10px",
          maxWidth: "380px", lineHeight: "1.5", animation: "slideIn 0.2s ease",
        }}>
          {toast.ok ? "✅" : "❌"} {toast.text}
        </div>
      )}
      <style>{`@keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }`}</style>

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside style={{
        width: "280px", background: "#D32F2F", padding: "40px 24px",
        position: "fixed", height: "100vh", display: "flex",
        flexDirection: "column", overflow: "hidden", boxSizing: "border-box",
      }}>
        <div style={{ position: "absolute", width: "300px", height: "300px", borderRadius: "50%", border: "3px solid rgba(255,255,255,0.1)", top: "-100px", left: "-100px", zIndex: 0 }} />
        <div style={{ position: "absolute", width: "150px", height: "150px", borderRadius: "50%", border: "3px solid rgba(255,255,255,0.08)", bottom: "80px", right: "-50px", zIndex: 0 }} />

        <div style={{ position: "relative", zIndex: 1, marginBottom: "48px" }}>
          <h2 style={{ color: "#ffffff", fontSize: "28px", fontWeight: "900", margin: "0", letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "32px" }}>🩸</span>BloodBound
          </h2>
          <div style={{ width: "32px", height: "4px", background: "rgba(255,255,255,0.5)", borderRadius: "2px", marginTop: "12px" }} />
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "10px", position: "relative", zIndex: 1, flex: 1 }}>
          {navItems.map((item) => {
            const isActive = item === "My Profile";
            const isHovered = hoveredTab === item;
            return (
              <div
                key={item}
                onClick={() => handleNavClick(item)}
                onMouseEnter={() => setHoveredTab(item)}
                onMouseLeave={() => setHoveredTab(null)}
                style={{
                  padding: "14px 18px", borderRadius: "12px",
                  backgroundColor: isActive ? "#ffffff" : isHovered ? "rgba(255,255,255,0.15)" : "transparent",
                  color: isActive ? "#D32F2F" : "#ffffff",
                  fontSize: "15px", fontWeight: isActive ? "800" : "600",
                  cursor: "pointer", transition: "all 0.2s ease",
                  transform: isActive ? "translateX(4px)" : "translateX(0)",
                  boxShadow: isActive ? "0 4px 12px rgba(0,0,0,0.1)" : "none",
                }}
              >
                {item}
              </div>
            );
          })}
        </nav>

        <button
          onClick={() => navigate("/login")}
          onMouseEnter={() => setHoveredLogout(true)}
          onMouseLeave={() => setHoveredLogout(false)}
          style={{
            position: "relative", zIndex: 1,
            background: hoveredLogout ? "rgba(255,255,255,0.15)" : "transparent",
            border: "2px solid rgba(255,255,255,0.3)", color: "#ffffff",
            padding: "14px", borderRadius: "12px", cursor: "pointer",
            fontSize: "15px", fontWeight: "800", transition: "all 0.2s ease", fontFamily: "inherit",
          }}
        >
          ← Sign Out
        </button>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main style={{ marginLeft: "280px", padding: "56px", width: "100%", boxSizing: "border-box" }}>

        <header style={{ marginBottom: "48px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "8px" }}>
            <h1 style={{ fontSize: "36px", fontWeight: "900", color: "#0f172a", margin: "0", letterSpacing: "-0.03em" }}>
              My Profile 👤
            </h1>
            {/* Subtle refreshing indicator — not blocking */}
            {refreshing && (
              <span style={{
                fontSize: "12px", fontWeight: "700", color: "#94a3b8",
                display: "flex", alignItems: "center", gap: "6px",
              }}>
                <span style={{
                  width: "12px", height: "12px",
                  border: "2px solid #e2e8f0", borderTopColor: "#94a3b8",
                  borderRadius: "50%", display: "inline-block",
                  animation: "spin 0.7s linear infinite",
                }} />
                Syncing...
              </span>
            )}
          </div>
          <p style={{ color: "#64748b", fontSize: "16px", margin: "0", fontWeight: "500" }}>
            Manage your account details and track your donation eligibility.
          </p>
        </header>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "28px", alignItems: "start" }}>

          {/* ── LEFT COLUMN ──────────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

            {/* Profile Photo Card */}
            <div style={{
              backgroundColor: "#ffffff", padding: "32px 24px", borderRadius: "20px",
              boxShadow: "0 8px 20px -4px rgba(0,0,0,0.03)", border: "2.5px solid #e2e8f0",
              textAlign: "center",
            }}>
              <img
                src={avatarSrc}
                alt="Profile"
                style={{
                  width: "120px", height: "120px", borderRadius: "50%",
                  border: "4px solid #D32F2F", objectFit: "cover",
                  display: "block", margin: "0 auto 16px",
                }}
              />
              <div style={{ fontSize: "20px", fontWeight: "900", color: "#0f172a", letterSpacing: "-0.02em" }}>
                {user.fullName}
              </div>
              {user.role === "DONOR" && user.bloodType && (
                <span style={{
                  display: "inline-block", backgroundColor: "#fee2e2", color: "#D32F2F",
                  padding: "4px 14px", borderRadius: "8px", fontWeight: "900",
                  fontSize: "18px", marginTop: "8px",
                }}>
                  {user.bloodType}
                </span>
              )}
              <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1.5px solid #f1f5f9", fontSize: "13px", color: "#64748b", fontWeight: "600" }}>
                Role: <span style={{ color: "#0f172a", fontWeight: "900" }}>{user.role}</span>
              </div>
              {user.role === "DONOR" && (
                <div style={{ marginTop: "6px", fontSize: "13px", color: "#64748b", fontWeight: "600" }}>
                  Total Donations: <span style={{ color: "#0f172a", fontWeight: "900" }}>{user.totalDonations ?? 0}</span>
                </div>
              )}

              {/* Photo Upload */}
              <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1.5px solid #f1f5f9" }}>
                <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>
                  Update Photo
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) => { setSelectedFile(e.target.files[0]); setPhotoMsg({ text: "", ok: false }); }}
                  style={{ fontSize: "12px", color: "#64748b", display: "block", width: "100%", marginBottom: "6px" }}
                />
                <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "10px" }}>
                  Accepted: .jpg and .png only
                </div>
                <button
                  onClick={handlePhotoUpload}
                  disabled={!selectedFile}
                  style={{
                    width: "100%", padding: "10px 0", borderRadius: "10px", border: "none",
                    backgroundColor: selectedFile ? "#D32F2F" : "#e2e8f0",
                    color: selectedFile ? "#ffffff" : "#94a3b8",
                    fontWeight: "800", fontSize: "13px",
                    cursor: selectedFile ? "pointer" : "not-allowed",
                    fontFamily: "inherit", transition: "background 0.2s ease",
                  }}
                >
                  Upload Photo
                </button>
                {inlineMsg(photoMsg)}
              </div>
            </div>

            {/* Security Card */}
            <div style={{
              backgroundColor: "#ffffff", padding: "32px", borderRadius: "20px",
              boxShadow: "0 8px 20px -4px rgba(0,0,0,0.03)", border: "2.5px solid #e2e8f0",
            }}>
              <h3 style={{
                fontSize: "18px", fontWeight: "900", color: "#0f172a", margin: "0 0 24px",
                letterSpacing: "-0.02em", paddingBottom: "16px", borderBottom: "1.5px solid #f1f5f9",
              }}>
                Security
              </h3>
              {!showPwdForm ? (
                <button
                  onClick={() => { setShowPwdForm(true); setPwdMsg({ text: "", ok: false }); }}
                  style={{
                    width: "100%", backgroundColor: "#f8fafc", color: "#0f172a",
                    padding: "10px 0", borderRadius: "10px", border: "2px solid #e2e8f0",
                    fontWeight: "800", fontSize: "13px", cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  Change Password
                </button>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {fieldInput("Current Password",     "oldPassword", pwdForm, setPwdForm, "password")}
                  {fieldInput("New Password",         "newPassword", pwdForm, setPwdForm, "password")}
                  {fieldInput("Confirm New Password", "confirmNew",  pwdForm, setPwdForm, "password")}
                  <div style={{ fontSize: "11px", color: "#94a3b8" }}>Minimum 8 characters</div>
                  {pwdMsg.text && inlineMsg(pwdMsg)}
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={handlePasswordChange}
                      style={{
                        flex: 1, backgroundColor: "#D32F2F", color: "#fff",
                        padding: "10px 0", borderRadius: "10px", border: "none",
                        fontWeight: "800", fontSize: "13px", cursor: "pointer", fontFamily: "inherit",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#b71c1c")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#D32F2F")}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => { setShowPwdForm(false); setPwdMsg({ text: "", ok: false }); setPwdForm({ oldPassword: "", newPassword: "", confirmNew: "" }); }}
                      style={{
                        flex: 1, backgroundColor: "#f8fafc", color: "#64748b",
                        padding: "10px 0", borderRadius: "10px", border: "2px solid #e2e8f0",
                        fontWeight: "800", fontSize: "13px", cursor: "pointer", fontFamily: "inherit",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN ─────────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

            {/* Eligibility Card — DONOR only */}
            {user.role === "DONOR" && (
              <div style={{
                padding: "28px 32px", borderRadius: "20px",
                backgroundColor: eligible ? "#ecfdf5" : "#fff1f2",
                border: `2.5px solid ${eligible ? "#10b981" : "#ef4444"}`,
                boxShadow: "0 8px 20px -4px rgba(0,0,0,0.03)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                    Eligibility Status
                  </div>
                  <div style={{ fontSize: "26px", fontWeight: "900", color: eligible ? "#065f46" : "#991b1b", letterSpacing: "-0.02em" }}>
                    {eligible ? "READY TO DONATE ✔️" : `ELIGIBLE IN ${days} DAYS ⏳`}
                  </div>
                  <div style={{ fontSize: "13px", color: "#64748b", marginTop: "6px", fontWeight: "500" }}>
                    {eligible ? "You are cleared to commit to donation requests." : "56-day waiting period from your last donation date."}
                  </div>
                  {user.lastDonationDate && (
                    <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                      Last donation: {new Date(user.lastDonationDate).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}
                    </div>
                  )}
                </div>
                <div style={{
                  width: "64px", height: "64px", borderRadius: "16px",
                  backgroundColor: eligible ? "#d1fae5" : "#fee2e2",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "28px", flexShrink: 0,
                }}>
                  {eligible ? "✔️" : "⏳"}
                </div>
              </div>
            )}

            {/* Account Details — READ ONLY */}
            <div style={{
              backgroundColor: "#ffffff", padding: "32px", borderRadius: "20px",
              boxShadow: "0 8px 20px -4px rgba(0,0,0,0.03)", border: "2.5px solid #e2e8f0",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "16px", borderBottom: "1.5px solid #f1f5f9", marginBottom: "4px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a", margin: "0", letterSpacing: "-0.02em" }}>
                  Account Details
                </h3>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", backgroundColor: "#f8fafc", padding: "4px 10px", borderRadius: "6px", border: "1.5px solid #e2e8f0" }}>
                  Read-only
                </span>
              </div>
              {readRow("Email", user.email)}
              {readRow("Role", user.role)}
              {readRow("Member Since", user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }) : null)}
              {user.role === "DONOR" && readRow("Total Donations", String(user.totalDonations ?? 0))}
              {user.role === "DONOR" && readRow("Last Donation", user.lastDonationDate ? new Date(user.lastDonationDate).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }) : "No donations yet", false, true)}
              {user.role === "REQUESTER" && readRow("Last Donation", undefined, false, true)}
            </div>

            {/* Profile Details — EDITABLE */}
            <div style={{
              backgroundColor: "#ffffff", padding: "32px", borderRadius: "20px",
              boxShadow: "0 8px 20px -4px rgba(0,0,0,0.03)", border: "2.5px solid #e2e8f0",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "16px", borderBottom: "1.5px solid #f1f5f9", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a", margin: "0", letterSpacing: "-0.02em" }}>
                  Profile Details
                </h3>
                <button
                  onClick={() => { setIsEditing(!isEditing); setEditMsg({ text: "", ok: false }); }}
                  style={{ backgroundColor: isEditing ? "#f1f5f9" : "#fee2e2", color: isEditing ? "#64748b" : "#D32F2F", padding: "8px 20px", borderRadius: "8px", border: "none", fontWeight: "800", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}
                >
                  {isEditing ? "Cancel" : "Edit"}
                </button>
              </div>

              {isEditing ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {fieldInput("Full Name", "fullName", editForm, setEditForm)}
                  {user.role === "DONOR" && (
                    <div>
                      <label style={{ display: "block", marginBottom: "6px", fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Blood Type
                      </label>
                      <select
                        value={editForm.bloodType}
                        onChange={(e) => setEditForm({ ...editForm, bloodType: e.target.value })}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "2px solid #e2e8f0", fontSize: "14px", fontFamily: "inherit", boxSizing: "border-box", color: "#0f172a", backgroundColor: "#ffffff", outline: "none" }}
                        onFocus={(e) => (e.target.style.borderColor = "#D32F2F")}
                        onBlur={(e)  => (e.target.style.borderColor = "#e2e8f0")}
                      >
                        <option value="">Select blood type</option>
                        {["O+","O-","A+","A-","B+","B-","AB+","AB-"].map((bt) => (
                          <option key={bt} value={bt}>{bt}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {user.role === "REQUESTER" && fieldInput("Hospital / Organization", "hospitalOrOrg", editForm, setEditForm)}
                  {user.role === "REQUESTER" && fieldInput("Contact Number", "contactNumber", editForm, setEditForm)}
                  {inlineMsg(editMsg)}
                  <button
                    onClick={handleEditSave}
                    style={{ width: "100%", backgroundColor: "#D32F2F", color: "#fff", padding: "12px 0", borderRadius: "10px", border: "none", fontWeight: "800", fontSize: "14px", cursor: "pointer", fontFamily: "inherit" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#b71c1c")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#D32F2F")}
                  >
                    Save Changes
                  </button>
                </div>
              ) : (
                <>
                  {readRow("Full Name", user.fullName)}
                  {user.role === "DONOR"     && readRow("Blood Type",     user.bloodType,     true,  false)}
                  {user.role === "REQUESTER" && readRow("Hospital / Org", user.hospitalOrOrg, false, false)}
                  {user.role === "REQUESTER" && readRow("Contact Number", user.contactNumber, false, true)}
                  {user.role === "DONOR"     && readRow("Blood Type",     undefined, false, true)}
                </>
              )}
            </div>

            {/* Activity History */}
            <div style={{
              backgroundColor: "#ffffff", padding: "32px", borderRadius: "20px",
              boxShadow: "0 8px 20px -4px rgba(0,0,0,0.03)", border: "2.5px solid #e2e8f0",
            }}>
              <h3 style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a", margin: "0 0 24px", letterSpacing: "-0.02em", paddingBottom: "16px", borderBottom: "1.5px solid #f1f5f9" }}>
                {user.role === "DONOR" ? "Recent Donation Commitments" : "Active Blood Requests"}
              </h3>
              <div style={{ border: "2px dashed #e2e8f0", borderRadius: "12px", padding: "40px 24px", textAlign: "center", color: "#94a3b8", fontSize: "14px", fontWeight: "600" }}>
                No recent {user.role === "DONOR" ? "donation commitments" : "blood requests"} found.
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}