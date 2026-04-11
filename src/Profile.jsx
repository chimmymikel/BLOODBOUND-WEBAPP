import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getMe, getProfile, updateProfile, updatePassword, uploadPhoto } from "./api";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(20px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-20px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes pulse-ring {
    0%,100% { opacity: .3; transform: scale(1); }
    50%     { opacity: .55; transform: scale(1.03); }
  }
  @keyframes orb-drift-red {
    0%,100% { transform: translate(0,0) scale(1); }
    50%     { transform: translate(15px,-10px) scale(1.04); }
  }
  @keyframes orb-drift-blue {
    0%,100% { transform: translate(0,0) scale(1); }
    50%     { transform: translate(-15px,10px) scale(1.04); }
  }
  @keyframes float {
    0%,100% { transform: translateY(0px) rotate(0deg); }
    33%     { transform: translateY(-5px) rotate(-2deg); }
    66%     { transform: translateY(-2px) rotate(1deg); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes overlayFadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .db-f1 { animation: fadeUp .55s cubic-bezier(.16,1,.3,1) both .05s; }
  .db-f2 { animation: fadeUp .55s cubic-bezier(.16,1,.3,1) both .13s; }
  .db-f3 { animation: fadeUp .55s cubic-bezier(.16,1,.3,1) both .21s; }
  .db-f4 { animation: fadeUp .55s cubic-bezier(.16,1,.3,1) both .29s; }

  .wordmark-blood {
    background: linear-gradient(135deg,#E63946 0%,#DC2626 50%,#B91C1C 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .wordmark-bound {
    background: linear-gradient(135deg,#1D4ED8 0%,#2563EB 50%,#1E40AF 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }

  .sidebar {
    width: 280px;
    background: linear-gradient(145deg, #F8FAFC 0%, #EEF2FF 50%, #F1F5F9 100%);
    border-right: 2px solid #e2e8f0;
    padding: 40px 24px;
    position: fixed;
    top: 0; left: 0;
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 200;
    transition: transform 0.3s cubic-bezier(.16,1,.3,1);
  }

  .sidebar-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(15,23,42,0.45);
    z-index: 199;
    animation: overlayFadeIn 0.2s ease;
    backdrop-filter: blur(2px);
  }
  .sidebar-overlay.active { display: block; }

  .main-content {
    margin-left: 280px;
    padding: 56px;
    width: 100%;
    min-height: 100vh;
  }

  .mobile-topbar {
    display: none;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: #ffffff;
    border-bottom: 2px solid #e2e8f0;
    position: sticky;
    top: 0;
    z-index: 100;
    margin: -56px -56px 40px -56px;
  }

  .hamburger-btn {
    display: none;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 5px;
    width: 42px; height: 42px;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    background: #f8fafc;
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }
  .hamburger-btn:hover { background: #f1f5f9; border-color: #cbd5e1; }
  .hamburger-btn span {
    display: block; width: 18px; height: 2px;
    border-radius: 2px; background: #0f172a; transition: all 0.25s ease;
  }
  .hamburger-btn.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .hamburger-btn.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .hamburger-btn.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

  .nav-item {
    padding: 14px 18px; border-radius: 12px; color: #64748b;
    font-size: 15px; font-weight: 600; cursor: pointer;
    transition: all 0.2s ease; user-select: none;
    display: flex; align-items: center;
  }
  .nav-item:hover { background-color: rgba(15,23,42,0.04); color: #0f172a; }
  .nav-item-active {
    background-color: #ffffff; font-weight: 800; transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #f1f5f9;
  }

  .signout-btn {
    position: relative; z-index: 1;
    background: transparent; border: 2px solid #e2e8f0;
    color: #64748b; padding: 14px; border-radius: 12px;
    cursor: pointer; font-size: 14.5px; font-weight: 800;
    font-family: inherit; transition: all 0.2s ease; width: 100%;
  }
  .signout-btn:hover {
    background: #fff1f2; border-color: #fecdd3; color: #be123c;
    transform: translateY(-1px); box-shadow: 0 4px 12px rgba(220,38,38,0.08);
  }

  .custom-file-input {
    width: 100%; font-size: 13px; color: #64748b;
    font-family: 'Inter', sans-serif; outline: none;
  }
  .custom-file-input::file-selector-button {
    padding: 8px 16px; border-radius: 8px; border: 1.5px solid #e2e8f0;
    background-color: #f8fafc; color: #0f172a; font-weight: 700;
    font-size: 12px; cursor: pointer; margin-right: 12px;
    transition: all 0.2s ease; font-family: 'Inter', sans-serif;
  }
  .custom-file-input::file-selector-button:hover { background-color: #f1f5f9; border-color: #cbd5e1; }

  .profile-grid {
    display: grid;
    grid-template-columns: minmax(300px, 380px) 1fr;
    gap: 32px; align-items: start;
  }
  .pwd-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  .details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px 32px; margin-bottom: 8px; }
  .details-item { display: flex; flex-direction: column; gap: 6px; }
  .details-label { font-size: 11.5px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
  .details-value { font-size: 15px; font-weight: 700; color: #0f172a; word-break: break-word; }
  .full-width-item { grid-column: span 2; }
  .eligibility-card { display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
  .security-actions { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
  .pwd-save-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }

  @media (max-width: 1024px) {
    .sidebar { transform: translateX(-100%); box-shadow: 4px 0 40px rgba(0,0,0,0.12); }
    .sidebar.sidebar-open { transform: translateX(0); }
    .main-content { margin-left: 0 !important; padding: 28px 32px; }
    .mobile-topbar { display: flex; margin: -28px -32px 36px -32px; }
    .hamburger-btn { display: flex; }
  }
  @media (max-width: 900px) { .profile-grid { grid-template-columns: 1fr !important; } }
  @media (max-width: 640px) {
    .main-content { padding: 16px 16px !important; }
    .mobile-topbar { margin: -16px -16px 28px -16px !important; padding: 14px 16px; }
    .details-grid { grid-template-columns: 1fr !important; }
    .full-width-item { grid-column: span 1 !important; }
    .pwd-grid { grid-template-columns: 1fr !important; }
    .eligibility-card { flex-direction: column !important; align-items: flex-start !important; }
    .profile-card-inner { padding: 24px !important; }
    .details-card-inner { padding: 24px !important; }
    .security-card-inner { padding: 24px !important; }
    .page-title { font-size: 28px !important; }
    .pwd-save-row { flex-direction: column-reverse !important; align-items: stretch !important; }
    .pwd-save-row > div { display: flex !important; flex-direction: column !important; gap: 10px !important; }
    .pwd-save-row > div > button { width: 100% !important; }
  }
  @media (max-width: 400px) {
    .main-content { padding: 12px 12px !important; }
    .mobile-topbar { margin: -12px -12px 24px -12px !important; }
  }
`;

function formatBloodType(raw) {
  if (!raw) return "—";
  return raw.replace("_POSITIVE", "+").replace("_NEGATIVE", "−").replace(/_/g, "");
}

function getImageSrc(base64Data) {
  if (!base64Data) return null;
  if (base64Data.startsWith("data:image")) return base64Data;
  return `data:image/jpeg;base64,${base64Data}`;
}

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();

  const passedUser = location.state?.user || {};

  const [user,        setUser]        = useState(passedUser);
  const [authLoading, setAuthLoading] = useState(!passedUser.id);
  const [refreshing,  setRefreshing]  = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast,       setToast]       = useState({ text: "", ok: false, show: false });

  const [isEditingContact, setIsEditingContact] = useState(false);
  const [contactInput,     setContactInput]     = useState("");
  const [contactError,     setContactError]     = useState("");

  const [selectedFile, setSelectedFile] = useState(null);
  const [photoMsg,     setPhotoMsg]     = useState({ text: "", ok: false });
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const [showPwdForm, setShowPwdForm] = useState(false);
  const [pwdForm,     setPwdForm]     = useState({ oldPassword: "", newPassword: "", confirmNew: "" });
  const [pwdMsg,      setPwdMsg]      = useState({ text: "", ok: false });

  const [hoveredTab, setHoveredTab] = useState(null);

  const isDonor          = user?.role === "DONOR";
  const themeAccent      = isDonor ? "#DC2626" : "#1D4ED8";
  const themeAccentHover = isDonor ? "#b71c1c" : "#1e40af";
  const themeBgLight     = isDonor ? "#fff1f2" : "#eff6ff";
  const themeBorderLight = isDonor ? "#ffe4e6" : "#dbeafe";
  const activeNavColor   = themeAccent;

  const navItems = isDonor
    ? ["Overview", "My Commitments", "Active Requests", "My Profile"]
    : ["Overview", "Active Requests", "My Profile"];

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || "U")}&background=${isDonor ? "DC2626" : "1D4ED8"}&color=fff&size=128`;

  useEffect(() => {
    if (passedUser.id) {
      setUser(passedUser);
      setAuthLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    getMe()
      .then((res) => {
        if (res.data?.data) setUser(res.data.data);
        else navigate("/login");
      })
      .catch(() => navigate("/login"))
      .finally(() => setAuthLoading(false));
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1025px)");
    const handler = (e) => { if (e.matches) setSidebarOpen(false); };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const showToast = (text, ok) => {
    setToast({ text, ok, show: true });
    setTimeout(() => setToast({ text: "", ok: false, show: false }), 3500);
  };

  const backgroundRefresh = useCallback(async () => {
    if (!user.id) return;
    setRefreshing(true);
    try {
      const res = await getProfile(user.id);
      if (res.data.success) {
        const freshUser = res.data.data;
        setUser(freshUser);
        if (freshUser.profilePicture) {
          setPhotoPreview(null);
        }
      }
    } catch (err) {
      console.error("Background refresh error:", err);
    } finally {
      setRefreshing(false);
    }
  }, [user.id]);

  useEffect(() => {
    if (user.id) backgroundRefresh();
  }, [user.id]);

  const calculateEligibility = () => {
    if (!user?.lastDonationDate) return { eligible: true, days: 0 };
    const diffDays = Math.ceil(
      Math.abs(new Date() - new Date(user.lastDonationDate)) / (1000 * 60 * 60 * 24)
    );
    const remaining = 56 - diffDays;
    return { eligible: remaining <= 0, days: Math.max(remaining, 0) };
  };

  const handleContactSave = async () => {
    const cleanedNum = contactInput.replace(/[\s-]/g, "");
    const phRegex = /^(09|\+639)\d{9}$/;
    if (!phRegex.test(cleanedNum)) {
      setContactError("Format must be 09XXXXXXXXX or +639XXXXXXXXX");
      return;
    }
    const snapshot = { ...user };
    setUser(prev => ({ ...prev, contactNumber: cleanedNum }));
    setIsEditingContact(false);
    setContactError("");
    showToast("Contact number updated!", true);
    try {
      const res = await updateProfile(user.id, { contactNumber: cleanedNum });
      if (!res.data.success) throw new Error(res.data.message || "Update failed.");
    } catch (err) {
      setUser(snapshot);
      setIsEditingContact(true);
      setContactInput(cleanedNum);
      setContactError(err.response?.data?.message || err.message || "Update failed.");
      setToast({ text: "", ok: false, show: false });
      showToast("Couldn't save — please retry.", false);
    }
  };

  const handlePhotoUpload = async () => {
    if (!selectedFile) return;
    if (!["image/jpeg", "image/png"].includes(selectedFile.type)) {
      setPhotoMsg({ text: "Only .jpg and .png files are allowed.", ok: false });
      return;
    }
    const previewUrl = URL.createObjectURL(selectedFile);
    setPhotoPreview(previewUrl);
    const formData = new FormData();
    formData.append("file", selectedFile);
    try {
      const res = await uploadPhoto(user.id, formData);
      if (res.data.success) {
        showToast("Photo updated successfully!", true);
        setPhotoMsg({ text: "", ok: false });
        await backgroundRefresh();
      } else {
        setPhotoPreview(null);
        setPhotoMsg({ text: res.data.message || "Upload failed.", ok: false });
      }
    } catch (err) {
      setPhotoPreview(null);
      setPhotoMsg({ text: err.response?.data?.message || "File too large or upload failed.", ok: false });
    } finally {
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handlePasswordChange = async () => {
    setPwdMsg({ text: "", ok: false });
    if (!user.id)                                    { setPwdMsg({ text: "Session expired. Please log in again.", ok: false }); return; }
    if (pwdForm.newPassword !== pwdForm.confirmNew)  { setPwdMsg({ text: "New passwords do not match.", ok: false }); return; }
    if (pwdForm.newPassword.length < 8)              { setPwdMsg({ text: "Password must be at least 8 characters.", ok: false }); return; }
    if (pwdForm.newPassword === pwdForm.oldPassword) { setPwdMsg({ text: "New password must be different from your current password.", ok: false }); return; }
    try {
      const res = await updatePassword(user.id, { oldPassword: pwdForm.oldPassword, newPassword: pwdForm.newPassword });
      if (res.data.success) {
        showToast("Password changed successfully!", true);
        setPwdForm({ oldPassword: "", newPassword: "", confirmNew: "" });
        setTimeout(() => setShowPwdForm(false), 400);
      } else {
        const errMsg = res.data?.error?.message || res.data?.message || "Incorrect current password.";
        setPwdMsg({ text: errMsg, ok: false });
      }
    } catch (err) {
      const errMsg = err.response?.data?.error?.message || err.response?.data?.message || "Password change failed.";
      setPwdMsg({ text: errMsg, ok: false });
    }
  };

  const handleNavClick = (item) => {
    setSidebarOpen(false);
    if (item === "Overview")             navigate("/dashboard",   { state: { user } });
    else if (item === "My Commitments")  navigate("/commitments", { state: { user } });
    else if (item === "Active Requests") navigate("/requests",    { state: { user } });
    // "My Profile" = already here, do nothing
  };

  const inlineMsg = (m) =>
    m.text ? (
      <div style={{ fontSize: "13px", fontWeight: "700", color: m.ok ? "#065f46" : "#991b1b", backgroundColor: m.ok ? "#ecfdf5" : "#fff1f2", border: `1.5px solid ${m.ok ? "#10b981" : "#ef4444"}`, padding: "10px 14px", borderRadius: "8px", marginTop: "12px" }}>
        {m.ok ? "✅ " : "❌ "}{m.text}
      </div>
    ) : null;

  const fieldInput = (label, key, form, setForm, type = "text") => (
    <div key={key} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
      <input
        type={type} value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "2px solid #e2e8f0", fontSize: "14px", fontFamily: "inherit", outline: "none", color: "#0f172a", transition: "border-color 0.2s" }}
        onFocus={(e) => (e.target.style.borderColor = themeAccent)}
        onBlur={(e)  => (e.target.style.borderColor = "#e2e8f0")}
      />
    </div>
  );

  if (authLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
        <div style={{ width: "40px", height: "40px", border: "3px solid #e2e8f0", borderTopColor: "#DC2626", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user.id) return null;

  const { eligible, days } = calculateEligibility();

  const avatarSrc = photoPreview
    ? photoPreview
    : getImageSrc(user.profilePicture) ?? fallbackAvatar;

  const formattedMemberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })
    : "—";

  const SidebarContent = () => (
    <>
      <div style={{ position: "absolute", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(220,38,38,0.12) 0%, rgba(220,38,38,0.04) 50%, transparent 70%)", top: "-100px", left: "-100px", filter: "blur(24px)", animation: "orb-drift-red 8s ease-in-out infinite", pointerEvents: "none", zIndex: 0 }}/>
      <div style={{ position: "absolute", width: "350px", height: "350px", borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.1) 0%, rgba(37,99,235,0.03) 50%, transparent 70%)", bottom: "-100px", right: "-100px", filter: "blur(30px)", animation: "orb-drift-blue 10s ease-in-out infinite", pointerEvents: "none", zIndex: 0 }}/>
      <div style={{ position: "absolute", width: "240px", height: "240px", borderRadius: "50%", border: "1.5px solid rgba(220,38,38,0.08)", top: "-50px", right: "-50px", animation: "pulse-ring 5s ease-in-out infinite", pointerEvents: "none", zIndex: 0 }}/>
      <div style={{ position: "absolute", width: "120px", height: "120px", borderRadius: "50%", border: "1.5px solid rgba(37,99,235,0.08)", bottom: "40px", left: "-30px", animation: "pulse-ring 5s ease-in-out 1.2s infinite", pointerEvents: "none", zIndex: 0 }}/>

      <div style={{ position: "relative", zIndex: 1, marginBottom: "48px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "900", margin: "0", letterSpacing: "-0.045em", display: "flex", alignItems: "center", gap: "10px", lineHeight: "1.1", whiteSpace: "nowrap" }}>
          <span style={{ fontSize: "32px", filter: "drop-shadow(0 4px 10px rgba(220,38,38,.25))", animation: "float 4s ease-in-out infinite" }}>🩸</span>
          <span><span className="wordmark-blood">Blood</span><span className="wordmark-bound">Bound</span></span>
        </h2>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: "8px", position: "relative", zIndex: 1, flex: 1 }}>
        {navItems.map((item) => {
          const isActive = item === "My Profile";
          return (
            <div key={item} className={`nav-item${isActive ? " nav-item-active" : ""}`} onClick={() => handleNavClick(item)} onMouseEnter={() => setHoveredTab(item)} onMouseLeave={() => setHoveredTab(null)} style={{ color: isActive ? activeNavColor : (hoveredTab === item ? "#0f172a" : "#64748b") }}>
              {item}
            </div>
          );
        })}
      </nav>

      <div style={{ position: "relative", zIndex: 1, backgroundColor: "#ffffff", border: "2px solid #f1f5f9", borderRadius: "14px", padding: "14px 16px", marginBottom: "16px", boxShadow: "0 4px 12px -4px rgba(0,0,0,0.04)" }}>
        <div style={{ fontSize: "13.5px", fontWeight: "800", color: "#0f172a", marginBottom: "3px" }}>{user.fullName || "User"}</div>
        <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email || ""}</div>
        <div style={{ display: "inline-flex", marginTop: "8px", fontSize: "10px", fontWeight: "800", padding: "4px 10px", borderRadius: "6px", backgroundColor: themeBgLight, color: themeAccent, border: `1px solid ${themeBorderLight}`, letterSpacing: "0.06em" }}>{user.role || ""}</div>
      </div>

      <button className="signout-btn" onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}>← Sign Out</button>
    </>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: '"Inter", sans-serif' }}>
      <style>{STYLES}</style>

      {toast.show && (
        <div style={{ position: "fixed", top: "32px", right: "32px", zIndex: 9999, backgroundColor: toast.ok ? "#ecfdf5" : "#fff1f2", border: `2px solid ${toast.ok ? "#10b981" : "#ef4444"}`, color: toast.ok ? "#065f46" : "#991b1b", padding: "16px 24px", borderRadius: "14px", fontWeight: "800", fontSize: "14px", boxShadow: "0 8px 30px rgba(0,0,0,0.12)", display: "flex", alignItems: "center", gap: "10px", maxWidth: "min(380px, calc(100vw - 48px))", lineHeight: "1.5", animation: "slideIn 0.2s ease" }}>
          {toast.ok ? "✅" : "❌"} {toast.text}
        </div>
      )}

      <div className={`sidebar-overlay${sidebarOpen ? " active" : ""}`} onClick={() => setSidebarOpen(false)} aria-hidden="true" />

      <aside className={`sidebar${sidebarOpen ? " sidebar-open" : ""}`}>
        <SidebarContent />
      </aside>

      <main className="main-content">
        <div className="mobile-topbar">
          <button className={`hamburger-btn${sidebarOpen ? " open" : ""}`} onClick={() => setSidebarOpen(v => !v)} aria-label={sidebarOpen ? "Close menu" : "Open menu"}>
            <span /><span /><span />
          </button>
          <h2 style={{ fontSize: "20px", fontWeight: "900", margin: "0", letterSpacing: "-0.04em", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "22px" }}>🩸</span>
            <span><span className="wordmark-blood">Blood</span><span className="wordmark-bound">Bound</span></span>
          </h2>
          <div style={{ fontSize: "10px", fontWeight: "800", padding: "5px 11px", borderRadius: "6px", backgroundColor: themeBgLight, color: themeAccent, border: `1px solid ${themeBorderLight}`, letterSpacing: "0.06em" }}>{user.role || ""}</div>
        </div>

        <header className="db-f1" style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", marginBottom: "8px" }}>
            <h1 className="page-title" style={{ fontSize: "36px", fontWeight: "900", color: "#0f172a", margin: "0", letterSpacing: "-0.03em" }}>My Profile 👤</h1>
            {refreshing && (
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#94a3b8", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "12px", height: "12px", border: "2px solid #e2e8f0", borderTopColor: "#94a3b8", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }}/>
                Syncing...
              </span>
            )}
          </div>
          <p style={{ color: "#64748b", fontSize: "16px", margin: "0", fontWeight: "500" }}>Manage your account details and track your donation eligibility.</p>
        </header>

        <div className="profile-grid db-f2">

          {/* LEFT COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            <div className="profile-card-inner" style={{ backgroundColor: "#ffffff", padding: "36px", borderRadius: "24px", boxShadow: "0 8px 20px -4px rgba(0,0,0,0.04)", border: "2px solid #eef2ff", textAlign: "center" }}>

              <div style={{ position: "relative", display: "inline-block", marginBottom: "20px" }}>
                <img
                  src={avatarSrc}
                  alt="Profile"
                  onError={(e) => { e.target.onerror = null; e.target.src = fallbackAvatar; }}
                  style={{ width: "clamp(96px, 20vw, 128px)", height: "clamp(96px, 20vw, 128px)", borderRadius: "50%", border: `4px solid ${themeAccent}`, objectFit: "cover", display: "block", boxShadow: "0 8px 20px -6px rgba(0,0,0,0.1)" }}
                />
                {photoPreview && (
                  <div style={{ position: "absolute", inset: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.35)" }}>
                    <span style={{ width: "20px", height: "20px", border: "2.5px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "block" }}/>
                  </div>
                )}
              </div>

              <div style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: "900", color: "#0f172a", letterSpacing: "-0.02em", marginBottom: "8px" }}>{user.fullName}</div>

              {user.role === "DONOR" && user.bloodType && (
                <span style={{ display: "inline-block", backgroundColor: themeBgLight, color: themeAccent, padding: "6px 18px", borderRadius: "40px", fontWeight: "900", fontSize: "18px", marginBottom: "20px" }}>
                  {formatBloodType(user.bloodType)}
                </span>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "8px", paddingTop: "24px", borderTop: "2px solid #f1f5f9", textAlign: "left" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Role</div>
                  <div style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", marginTop: "4px" }}>{user.role}</div>
                </div>
                {user.role === "DONOR" && (
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Donations</div>
                    <div style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", marginTop: "4px" }}>{user.totalDonations ?? 0}</div>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Member Since</div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a", marginTop: "4px" }}>{formattedMemberSince}</div>
                </div>
              </div>

              <div style={{ marginTop: "28px", paddingTop: "24px", borderTop: "2px solid #f1f5f9" }}>
                <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px", textAlign: "left" }}>Update Profile Photo</div>
                <input
                  type="file" className="custom-file-input" ref={fileInputRef}
                  accept="image/jpeg,image/png"
                  onChange={(e) => { setSelectedFile(e.target.files[0]); setPhotoMsg({ text: "", ok: false }); }}
                  style={{ marginBottom: "12px", width: "100%" }}
                />
                <button
                  onClick={handlePhotoUpload} disabled={!selectedFile}
                  style={{ width: "100%", padding: "12px 0", borderRadius: "12px", border: "none", backgroundColor: selectedFile ? themeAccent : "#f1f5f9", color: selectedFile ? "#ffffff" : "#94a3b8", fontWeight: "800", fontSize: "13.5px", cursor: selectedFile ? "pointer" : "not-allowed", fontFamily: "inherit", transition: "all 0.2s ease" }}
                >
                  Upload Photo
                </button>
                {inlineMsg(photoMsg)}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="db-f3" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

            {user.role === "DONOR" && (
              <div style={{ padding: "32px 36px", borderRadius: "24px", backgroundColor: eligible ? "#ecfdf5" : "#fff1f2", border: `2px solid ${eligible ? "#10b981" : "#ef4444"}`, boxShadow: "0 8px 20px -4px rgba(0,0,0,0.04)" }}>
                <div className="eligibility-card">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "12px", fontWeight: "900", color: eligible ? "#065f46" : "#be123c", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Eligibility Status</div>
                    <div style={{ fontSize: "clamp(20px, 4vw, 28px)", fontWeight: "900", color: eligible ? "#065f46" : "#991b1b", letterSpacing: "-0.02em" }}>
                      {eligible ? "READY TO DONATE" : `ELIGIBLE IN ${days} DAYS ⏳`}
                    </div>
                    <div style={{ fontSize: "14px", color: eligible ? "#047857" : "#9f1239", marginTop: "8px", fontWeight: "600" }}>
                      {eligible ? "You are cleared to commit to donation requests." : "56-day waiting period from your last donation date."}
                    </div>
                  </div>
                  <div style={{ width: "72px", height: "72px", borderRadius: "20px", flexShrink: 0, backgroundColor: eligible ? "#d1fae5" : "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px" }}>
                    {eligible ? "✔️" : "⏳"}
                  </div>
                </div>
              </div>
            )}

            <div className="details-card-inner" style={{ backgroundColor: "#ffffff", padding: "36px 40px", borderRadius: "24px", boxShadow: "0 8px 20px -4px rgba(0,0,0,0.04)", border: "2px solid #eef2ff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "20px", borderBottom: "2px solid #f1f5f9", marginBottom: "28px" }}>
                <h3 style={{ fontSize: "20px", fontWeight: "900", color: "#0f172a", margin: "0", letterSpacing: "-0.02em" }}>Account Information</h3>
              </div>

              <div className="details-grid">
                <div className="details-item">
                  <div className="details-label">Full Name</div>
                  <div className="details-value">{user.fullName || "—"}</div>
                </div>
                <div className="details-item">
                  <div className="details-label">Email Address</div>
                  <div className="details-value">{user.email || "—"}</div>
                </div>
                {user.role === "DONOR" && (
                  <div className="details-item">
                    <div className="details-label">Blood Type</div>
                    <div className="details-value">{formatBloodType(user.bloodType)}</div>
                  </div>
                )}
                {/* ── REMOVED: Hospital / Organization field (user.hospitalOrOrg)       ──
                    Per SDD, requesters are individuals — hospital association lives on
                    the request record, not the user record. No hospital_id on users table. */}

                <div className="full-width-item">
                  <div className="details-label">Contact Number</div>
                  {!isEditingContact ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px", flexWrap: "wrap" }}>
                      <span className="details-value" style={{ fontSize: "15px" }}>{user.contactNumber || "—"}</span>
                      <button
                        onClick={() => { setContactInput(user.contactNumber || ""); setContactError(""); setIsEditingContact(true); }}
                        style={{ background: "none", border: `1.5px solid ${themeBorderLight}`, cursor: "pointer", color: themeAccent, fontSize: "12px", fontWeight: "800", display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "8px", transition: "all 0.2s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = themeBgLight)}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Edit
                      </button>
                    </div>
                  ) : (
                    <div style={{ marginTop: "4px" }}>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                        <input
                          type="tel" value={contactInput}
                          onChange={(e) => { setContactInput(e.target.value); setContactError(""); }}
                          placeholder="e.g. 09123456789"
                          style={{ flex: "1 1 160px", minWidth: 0, padding: "10px 12px", borderRadius: "10px", border: `2px solid ${contactError ? "#ef4444" : "#e2e8f0"}`, fontSize: "14px", fontFamily: "inherit", outline: "none", color: "#0f172a", transition: "border-color 0.2s" }}
                          onFocus={(e) => !contactError && (e.target.style.borderColor = themeAccent)}
                          onBlur={(e)  => !contactError && (e.target.style.borderColor = "#e2e8f0")}
                        />
                        <button onClick={handleContactSave} style={{ backgroundColor: themeAccent, color: "#fff", border: "none", borderRadius: "10px", padding: "10px 20px", fontWeight: "800", fontSize: "13px", cursor: "pointer", transition: "background 0.2s", whiteSpace: "nowrap" }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = themeAccentHover)} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = themeAccent)}>Save</button>
                        <button onClick={() => { setIsEditingContact(false); setContactError(""); }} style={{ backgroundColor: "#f8fafc", color: "#64748b", border: "2px solid #e2e8f0", borderRadius: "10px", padding: "10px 16px", fontWeight: "800", fontSize: "13px", cursor: "pointer", transition: "background 0.2s", whiteSpace: "nowrap" }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}>Cancel</button>
                      </div>
                      {contactError && <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: "700", marginTop: "6px", display: "block" }}>{contactError}</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="security-card-inner db-f4" style={{ backgroundColor: "#ffffff", padding: "36px 40px", borderRadius: "24px", boxShadow: "0 8px 20px -4px rgba(0,0,0,0.04)", border: "2px solid #eef2ff" }}>
              <div className="security-actions" style={{ paddingBottom: showPwdForm ? "24px" : "0", borderBottom: showPwdForm ? "2px solid #f1f5f9" : "none", marginBottom: showPwdForm ? "24px" : "0" }}>
                <div>
                  <h3 style={{ fontSize: "20px", fontWeight: "900", color: "#0f172a", margin: "0 0 4px", letterSpacing: "-0.02em" }}>Security</h3>
                  {!showPwdForm && <p style={{ margin: 0, fontSize: "13px", color: "#64748b", fontWeight: "500" }}>Manage your password and authentication.</p>}
                </div>
                {!showPwdForm && (
                  <button
                    onClick={() => { setShowPwdForm(true); setPwdMsg({ text: "", ok: false }); }}
                    style={{ backgroundColor: "#f8fafc", color: themeAccent, padding: "10px 22px", borderRadius: "12px", border: "2px solid #e2e8f0", fontWeight: "800", fontSize: "13px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s ease", whiteSpace: "nowrap" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = themeBorderLight; e.currentTarget.style.backgroundColor = themeBgLight; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.backgroundColor = "#f8fafc"; }}
                  >
                    Change Password
                  </button>
                )}
              </div>

              {showPwdForm && (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <div className="pwd-grid">
                    {fieldInput("Current Password",    "oldPassword", pwdForm, setPwdForm, "password")}
                    {fieldInput("New Password",         "newPassword", pwdForm, setPwdForm, "password")}
                    {fieldInput("Confirm New Password", "confirmNew",  pwdForm, setPwdForm, "password")}
                  </div>
                  <div className="pwd-save-row">
                    <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>Password must be at least 8 characters long.</div>
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                      <button onClick={() => { setShowPwdForm(false); setPwdMsg({ text: "", ok: false }); setPwdForm({ oldPassword: "", newPassword: "", confirmNew: "" }); }} style={{ backgroundColor: "#f8fafc", color: "#64748b", padding: "10px 24px", borderRadius: "10px", border: "2px solid #e2e8f0", fontWeight: "800", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}>Cancel</button>
                      <button onClick={handlePasswordChange} style={{ backgroundColor: themeAccent, color: "#fff", padding: "10px 24px", borderRadius: "10px", border: "none", fontWeight: "800", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = themeAccentHover)} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = themeAccent)}>Save Password</button>
                    </div>
                  </div>
                  {pwdMsg.text && inlineMsg(pwdMsg)}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}