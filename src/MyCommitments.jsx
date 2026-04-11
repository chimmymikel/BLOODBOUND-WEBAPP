import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getMe, getCommitments, cancelCommitment } from "./api";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes float {
    0%,100% { transform: translateY(0px) rotate(0deg); }
    33%     { transform: translateY(-5px) rotate(-2deg); }
    66%     { transform: translateY(-2px) rotate(1deg); }
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
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes toastSlideUp {
    from { opacity: 0; transform: translate(-50%, 20px); }
    to   { opacity: 1; transform: translate(-50%, 0); }
  }

  .cm-f1 { animation: fadeUp .55s cubic-bezier(.16,1,.3,1) both .05s; }
  .cm-f2 { animation: fadeUp .55s cubic-bezier(.16,1,.3,1) both .13s; }
  .cm-f3 { animation: fadeUp .55s cubic-bezier(.16,1,.3,1) both .21s; }
  .cm-f4 { animation: fadeUp .55s cubic-bezier(.16,1,.3,1) both .29s; }

  .wordmark-blood {
    background: linear-gradient(135deg,#E63946 0%,#DC2626 50%,#B91C1C 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .wordmark-bound {
    background: linear-gradient(135deg,#1D4ED8 0%,#2563EB 50%,#1E40AF 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }

  .nav-item {
    padding: 14px 18px; border-radius: 12px; color: #64748b;
    font-size: 15px; font-weight: 600; cursor: pointer;
    transition: all 0.2s ease; user-select: none; display: flex; align-items: center;
  }
  .nav-item:hover { background-color: rgba(15,23,42,0.04); color: #0f172a; }
  .nav-item-active {
    background-color: #ffffff; font-weight: 800; transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #f1f5f9;
  }

  .signout-btn {
    position: relative; background: transparent; border: 2px solid #e2e8f0;
    color: #64748b; padding: 14px; border-radius: 12px; cursor: pointer;
    font-size: 14.5px; font-weight: 800; font-family: inherit;
    transition: all 0.2s ease; width: 100%;
  }
  .signout-btn:hover {
    background: #fff1f2; border-color: #fecdd3; color: #be123c;
    transform: translateY(-1px); box-shadow: 0 4px 12px rgba(220,38,38,0.08);
  }

  .stat-card {
    background: #ffffff; border-radius: 20px; border: 2.5px solid #e2e8f0;
    box-shadow: 0 8px 20px -4px rgba(0,0,0,0.03); padding: 28px;
    transition: all 0.22s cubic-bezier(.34,1.56,.64,1);
  }
  .stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 16px 32px -6px rgba(0,0,0,0.08); border-color: #cbd5e1;
  }

  .ticket-card {
    background: #ffffff; border-radius: 18px; border: 2px solid #f1f5f9;
    box-shadow: 0 4px 16px -4px rgba(0,0,0,0.04);
    transition: all 0.2s ease; overflow: hidden;
  }
  .ticket-card:hover {
    border-color: #e2e8f0;
    box-shadow: 0 10px 28px -6px rgba(0,0,0,0.09);
    transform: translateY(-2px);
  }

  .tab-pill {
    padding: 8px 20px; border-radius: 10px; border: 2px solid transparent;
    font-size: 13px; font-weight: 800; cursor: pointer;
    font-family: inherit; transition: all 0.18s ease; background: transparent;
  }

  .action-btn {
    width: 100%; padding: 11px; border-radius: 10px; font-weight: 800;
    font-size: 13px; cursor: pointer; transition: all 0.18s ease;
    font-family: inherit; display: flex; justify-content: center;
    align-items: center; gap: 6px; border: none;
  }
  .action-btn:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.05); }
  .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const microLabel = {
  display: "block", fontSize: "11px", fontWeight: "800", color: "#64748b",
  textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px",
};

function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
      <div style={{ width: "32px", height: "32px", border: "3px solid #e2e8f0", borderTopColor: "#DC2626", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
    </div>
  );
}

function EmptyState({ icon, title, body }) {
  return (
    <div style={{ border: "2px dashed #e2e8f0", borderRadius: "16px", padding: "60px 24px", textAlign: "center" }}>
      <div style={{ fontSize: "48px", marginBottom: "16px" }}>{icon}</div>
      <div style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a", marginBottom: "8px" }}>{title}</div>
      <div style={{ fontSize: "14px", color: "#64748b", fontWeight: "500", maxWidth: "360px", margin: "0 auto" }}>{body}</div>
    </div>
  );
}

function formatBloodType(raw) {
  if (!raw) return "—";
  return raw.replace("_POSITIVE", "+").replace("_NEGATIVE", "−").replace(/_/g, "");
}

// ── Ticket Card Component ─────────────────────────────────────────────────────
function TicketCard({ ticket, navigate, user, onCancel, cancelling }) {
  const isPending   = ticket.status === "PENDING";
  const isCompleted = ticket.status === "COMPLETED";
  const isCancelled = ticket.status === "CANCELLED";

  const statusColor = isPending   ? "#EA580C"
    : isCompleted                 ? "#16A34A"
    : "#94a3b8";

  const statusBg  = isPending   ? "#fff7ed"
    : isCompleted               ? "#ecfdf5"
    : "#f8fafc";

  const statusBdr = isPending   ? "#fdba74"
    : isCompleted               ? "#6ee7b7"
    : "#e2e8f0";

  const stripeGrad = isPending   ? "linear-gradient(135deg,#E63946,#DC2626)"
    : isCompleted               ? "linear-gradient(135deg,#10b981,#059669)"
    : "linear-gradient(135deg,#94a3b8,#64748b)";

  const committedDate = ticket.committedAt
    ? new Date(ticket.committedAt).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })
    : "—";

  const [confirmingCancel, setConfirmingCancel] = useState(false);

  return (
    <div className="ticket-card">
      <div style={{ display: "flex", alignItems: "stretch" }}>

        {/* Left accent stripe */}
        <div style={{ width: "6px", flexShrink: 0, background: stripeGrad }} />

        {/* Main content */}
        <div style={{ flex: 1, padding: "24px", display: "flex", gap: "24px", alignItems: "flex-start" }}>

          {/* QR code — only show for active tickets */}
          {!isCancelled && (
            <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "12px", border: "2px solid #e2e8f0", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", flexShrink: 0 }}>
              <span style={{ fontSize: "9px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>Scan Me</span>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${ticket.referenceNumber}`}
                alt="QR Code"
                style={{ width: "70px", height: "70px", borderRadius: "6px" }}
              />
            </div>
          )}

          {/* Details */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
              <span style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "10px", fontWeight: "900", letterSpacing: "0.06em", background: statusBg, color: statusColor, border: `1px solid ${statusBdr}` }}>
                {ticket.status}
              </span>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#94a3b8" }}>Ref: {ticket.referenceNumber}</span>
            </div>

            <h3 style={{ fontSize: "18px", fontWeight: "900", color: isCancelled ? "#94a3b8" : "#0f172a", margin: "0 0 8px", letterSpacing: "-0.01em", textDecoration: isCancelled ? "line-through" : "none" }}>
              {ticket.hospitalName || "Hospital Facility"}
            </h3>

            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
              <div>
                <div style={{ ...microLabel, marginBottom: "3px" }}>Blood Type Needed</div>
                <div style={{ fontSize: "16px", fontWeight: "900", color: isCancelled ? "#94a3b8" : "#DC2626" }}>
                  {formatBloodType(ticket.bloodTypeNeeded)}
                </div>
              </div>
              <div>
                <div style={{ ...microLabel, marginBottom: "3px" }}>Date Committed</div>
                <div style={{ fontSize: "14px", fontWeight: "700", color: isCancelled ? "#94a3b8" : "#0f172a" }}>{committedDate}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right actions panel */}
        <div style={{ background: "#f8fafc", padding: "24px", borderLeft: "2px solid #f1f5f9", display: "flex", flexDirection: "column", justifyContent: "center", gap: "10px", minWidth: "200px", flexShrink: 0 }}>

          {isPending && (
            <>
              <button
                className="action-btn"
                onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(ticket.hospitalName || "hospital")}`, "_blank")}
                style={{ background: "linear-gradient(135deg,#0f172a,#1e293b)", color: "#fff" }}
              >
                📍 Get Directions
              </button>

              {!confirmingCancel ? (
                <button
                  className="action-btn"
                  onClick={() => setConfirmingCancel(true)}
                  style={{ background: "#fff1f2", border: "1.5px solid #fecdd3", color: "#be123c" }}
                >
                  ✕ Cancel Commitment
                </button>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#c2410c", textAlign: "center" }}>
                    Cancel this commitment?
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      onClick={() => setConfirmingCancel(false)}
                      style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "1.5px solid #e2e8f0", background: "#f8fafc", color: "#64748b", fontWeight: "800", fontSize: "12px", cursor: "pointer", fontFamily: "inherit" }}
                    >
                      No
                    </button>
                    <button
                      className="action-btn"
                      disabled={cancelling === ticket.id}
                      onClick={() => onCancel(ticket.id)}
                      style={{ flex: 1, padding: "8px", background: "#DC2626", color: "#fff", fontSize: "12px" }}
                    >
                      {cancelling === ticket.id ? "..." : "Yes"}
                    </button>
                  </div>
                </div>
              )}

              <button
                className="action-btn"
                onClick={() => navigate("/dashboard", { state: { user } })}
                style={{ background: "#fff", border: "2px solid #e2e8f0", color: "#64748b" }}
              >
                ← Dashboard
              </button>
            </>
          )}

          {(isCompleted || isCancelled) && (
            <button
              className="action-btn"
              onClick={() => navigate("/dashboard", { state: { user } })}
              style={{ background: "#fff", border: "2px solid #e2e8f0", color: "#64748b" }}
            >
              ← Back to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN MY COMMITMENTS COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function MyCommitments() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user,        setUser]        = useState(location.state?.user || {});
  const [authLoading, setAuthLoading] = useState(!location.state?.user);

  useEffect(() => {
    if (!location.state?.user?.id) {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/login"); return; }
      getMe()
        .then((res) => {
          if (res.data?.data) setUser(res.data.data);
          else navigate("/login");
        })
        .catch(() => navigate("/login"))
        .finally(() => setAuthLoading(false));
    } else {
      setAuthLoading(false);
    }
  }, []);

  const [commitments, setCommitments] = useState([]);
  const [activeTab,   setActiveTab]   = useState("ACTIVE");
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [hoveredTab,  setHoveredTab]  = useState(null);
  const [cancelling,  setCancelling]  = useState(null);
  const [toast,       setToast]       = useState({ text: "", success: true });

  const showToast = (text, success = true) => {
    setToast({ text, success });
    setTimeout(() => setToast({ text: "", success: true }), 4000);
  };

  const navItems = ["Overview", "My Commitments", "Active Requests", "My Profile"];

  // ✅ FIXED: "Active Requests" now correctly navigates to /requests
  const handleNavClick = (item) => {
    if (item === "Overview")             navigate("/dashboard",   { state: { user } });
    else if (item === "Active Requests") navigate("/requests",    { state: { user } }); // ✅ was "/dashboard"
    else if (item === "My Profile")      navigate("/profile",     { state: { user } });
    // "My Commitments" = already here, do nothing
  };

  const fetchCommitments = useCallback(async () => {
    if (!user.id) return;
    setLoading(true);
    try {
      const res = await getCommitments({ donorId: user.id });
      if (res.data.success) setCommitments(res.data.data);
      else setError(res.data.message);
    } catch {
      setError("Could not load your commitments. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    if (user.id) fetchCommitments();
  }, [user.id, fetchCommitments]);

  const handleCancel = async (commitmentId) => {
    setCancelling(commitmentId);
    try {
      await cancelCommitment(commitmentId);
      setCommitments((prev) =>
        prev.map((c) => c.id === commitmentId ? { ...c, status: "CANCELLED" } : c)
      );
      showToast("Commitment cancelled successfully.", true);
    } catch (err) {
      showToast(err.response?.data?.message || "Could not cancel. Please try again.", false);
    } finally {
      setCancelling(null);
    }
  };

  const activeCommitments    = commitments.filter((c) => c.status === "PENDING");
  const completedCommitments = commitments.filter((c) => c.status === "COMPLETED");
  const cancelledCommitments = commitments.filter((c) => c.status === "CANCELLED");

  const filtered =
    activeTab === "ACTIVE"    ? activeCommitments
    : activeTab === "PAST"    ? completedCommitments
    : cancelledCommitments;

  const livesSaved = completedCommitments.length * 3;

  if (authLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
        <div style={{ width: "40px", height: "40px", border: "3px solid #e2e8f0", borderTopColor: "#DC2626", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: '"Inter",-apple-system,BlinkMacSystemFont,sans-serif' }}>
      <style>{STYLES}</style>

      {/* ══ SIDEBAR ══ */}
      <aside style={{ width: "280px", background: "linear-gradient(145deg,#F8FAFC 0%,#EEF2FF 50%,#F1F5F9 100%)", borderRight: "2px solid #e2e8f0", padding: "40px 24px", position: "fixed", height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", boxSizing: "border-box" }}>
        <div style={{ position: "absolute", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle,rgba(220,38,38,0.12) 0%,rgba(220,38,38,0.04) 50%,transparent 70%)", top: "-100px", left: "-100px", filter: "blur(24px)", animation: "orb-drift-red 8s ease-in-out infinite", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "absolute", width: "350px", height: "350px", borderRadius: "50%", background: "radial-gradient(circle,rgba(37,99,235,0.1) 0%,rgba(37,99,235,0.03) 50%,transparent 70%)", bottom: "-100px", right: "-100px", filter: "blur(30px)", animation: "orb-drift-blue 10s ease-in-out infinite", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "absolute", width: "240px", height: "240px", borderRadius: "50%", border: "1.5px solid rgba(220,38,38,0.08)", top: "-50px", right: "-50px", animation: "pulse-ring 5s ease-in-out infinite", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "absolute", width: "120px", height: "120px", borderRadius: "50%", border: "1.5px solid rgba(37,99,235,0.08)", bottom: "40px", left: "-30px", animation: "pulse-ring 5s ease-in-out 1.2s infinite", pointerEvents: "none", zIndex: 0 }} />

        <div style={{ position: "relative", zIndex: 1, marginBottom: "48px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: "900", margin: "0", letterSpacing: "-0.045em", display: "flex", alignItems: "center", gap: "10px", lineHeight: "1.1", whiteSpace: "nowrap" }}>
            <span style={{ fontSize: "32px", filter: "drop-shadow(0 4px 10px rgba(220,38,38,.25))", animation: "float 4s ease-in-out infinite" }}>🩸</span>
            <span><span className="wordmark-blood">Blood</span><span className="wordmark-bound">Bound</span></span>
          </h2>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "8px", position: "relative", zIndex: 1, flex: 1 }}>
          {navItems.map((item) => {
            const isActive = item === "My Commitments";
            return (
              <div key={item} className={`nav-item${isActive ? " nav-item-active" : ""}`} onClick={() => handleNavClick(item)} onMouseEnter={() => setHoveredTab(item)} onMouseLeave={() => setHoveredTab(null)} style={{ color: isActive ? "#DC2626" : (hoveredTab === item ? "#0f172a" : "#64748b") }}>
                {item}
              </div>
            );
          })}
        </nav>

        <div style={{ position: "relative", zIndex: 1, backgroundColor: "#ffffff", border: "2px solid #f1f5f9", borderRadius: "14px", padding: "14px 16px", marginBottom: "16px", boxShadow: "0 4px 12px -4px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: "13.5px", fontWeight: "800", color: "#0f172a", marginBottom: "3px" }}>{user.fullName || "User"}</div>
          <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email || ""}</div>
          <div style={{ display: "inline-flex", marginTop: "8px", fontSize: "10px", fontWeight: "800", padding: "4px 10px", borderRadius: "6px", backgroundColor: "#fff1f2", color: "#be123c", border: "1px solid #ffe4e6", letterSpacing: "0.06em" }}>DONOR</div>
        </div>

        <button className="signout-btn" onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}>← Sign Out</button>
      </aside>

      {/* ══ MAIN CONTENT ══ */}
      <main style={{ marginLeft: "280px", padding: "56px", width: "100%", boxSizing: "border-box" }}>

        <header className="cm-f1" style={{ marginBottom: "40px" }}>
          <h1 style={{ fontSize: "36px", fontWeight: "900", color: "#0f172a", margin: "0 0 8px", letterSpacing: "-0.03em" }}>My Commitments 🎫</h1>
          <p style={{ color: "#64748b", fontSize: "16px", margin: "0", fontWeight: "500" }}>Track your upcoming hospital visits and view your donation impact.</p>
        </header>

        {/* Impact stat cards */}
        <div className="cm-f2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px", marginBottom: "32px" }}>
          <div className="stat-card" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={microLabel}>Active Tickets</div>
            <div style={{ fontSize: "36px", fontWeight: "900", color: "#0f172a", letterSpacing: "-0.02em" }}>{activeCommitments.length}</div>
            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", fontWeight: "500" }}>{activeCommitments.length === 0 ? "No pending visits" : "Upcoming hospital visits"}</div>
          </div>
          <div className="stat-card" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={microLabel}>Completed Donations</div>
            <div style={{ fontSize: "36px", fontWeight: "900", color: "#0f172a", letterSpacing: "-0.02em" }}>{completedCommitments.length}</div>
            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", fontWeight: "500" }}>{completedCommitments.length === 0 ? "Complete your first!" : "Donations fulfilled"}</div>
          </div>
          <div className="stat-card" style={{ display: "flex", flexDirection: "column", justifyContent: "center", background: "linear-gradient(135deg,#fff1f2 0%,#ffe4e6 100%)", border: "2.5px solid #fecdd3" }}>
            <div style={{ ...microLabel, color: "#be123c" }}>Lives Impacted</div>
            <div style={{ fontSize: "36px", fontWeight: "900", color: "#DC2626", letterSpacing: "-0.02em" }}>{livesSaved}</div>
            <div style={{ fontSize: "12px", color: "#be123c", marginTop: "4px", fontWeight: "500" }}>Each donation saves up to 3 lives</div>
          </div>
        </div>

        {/* Ticket list card */}
        <div className="cm-f3" style={{ backgroundColor: "#ffffff", padding: "32px", borderRadius: "20px", boxShadow: "0 8px 20px -4px rgba(0,0,0,0.03)", border: "2.5px solid #e2e8f0" }}>

          {/* Section header with tabs */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", paddingBottom: "20px", borderBottom: "1.5px solid #f1f5f9" }}>
            <div>
              <h3 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: "900", color: "#0f172a", letterSpacing: "-0.02em" }}>Donation Tickets</h3>
              <p style={{ margin: 0, fontSize: "13px", color: "#64748b", fontWeight: "500" }}>Your commitment history and upcoming visits</p>
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button className="tab-pill" onClick={() => setActiveTab("ACTIVE")}
                style={{ background: activeTab === "ACTIVE" ? "#fff1f2" : "#f8fafc", borderColor: activeTab === "ACTIVE" ? "#fecdd3" : "#e2e8f0", color: activeTab === "ACTIVE" ? "#DC2626" : "#64748b" }}>
                Active ({activeCommitments.length})
              </button>
              <button className="tab-pill" onClick={() => setActiveTab("PAST")}
                style={{ background: activeTab === "PAST" ? "#ecfdf5" : "#f8fafc", borderColor: activeTab === "PAST" ? "#6ee7b7" : "#e2e8f0", color: activeTab === "PAST" ? "#065f46" : "#64748b" }}>
                Completed ({completedCommitments.length})
              </button>
              <button className="tab-pill" onClick={() => setActiveTab("CANCELLED")}
                style={{ background: activeTab === "CANCELLED" ? "#f8fafc" : "#f8fafc", borderColor: activeTab === "CANCELLED" ? "#cbd5e1" : "#e2e8f0", color: activeTab === "CANCELLED" ? "#475569" : "#94a3b8" }}>
                Cancelled ({cancelledCommitments.length})
              </button>
              <button onClick={fetchCommitments} style={{ background: "none", border: "2px solid #e2e8f0", borderRadius: "10px", padding: "6px 14px", fontSize: "13px", fontWeight: "700", cursor: "pointer", color: "#64748b", fontFamily: "inherit" }}>
                ↻ Refresh
              </button>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <Spinner />
          ) : error ? (
            <div style={{ border: "2px solid #fecdd3", borderRadius: "14px", padding: "20px 24px", backgroundColor: "#fff1f2", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
              <div style={{ fontSize: "14px", color: "#be123c", fontWeight: "700" }}>⚠ {error}</div>
              <button onClick={fetchCommitments} style={{ background: "#DC2626", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", fontWeight: "800", cursor: "pointer", fontFamily: "inherit" }}>Retry</button>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={activeTab === "ACTIVE" ? "🎫" : activeTab === "PAST" ? "✅" : "❌"}
              title={
                activeTab === "ACTIVE"    ? "No active tickets"
                : activeTab === "PAST"    ? "No completed donations yet"
                : "No cancelled commitments"
              }
              body={
                activeTab === "ACTIVE"    ? "When you commit to a blood request, your ticket will appear here."
                : activeTab === "PAST"    ? "Completed donations will show here after a request is marked fulfilled."
                : "Cancelled commitments will appear here for your records."
              }
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {filtered.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  navigate={navigate}
                  user={user}
                  onCancel={handleCancel}
                  cancelling={cancelling}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Toast */}
      {toast.text && (
        <div style={{
          position: "fixed", bottom: "40px", left: "50%", transform: "translateX(-50%)",
          background: "#0f172a", color: "#ffffff", padding: "14px 24px", borderRadius: "14px",
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)", zIndex: 9999,
          display: "flex", alignItems: "center", gap: "12px",
          animation: "toastSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          fontWeight: "600", fontSize: "14px", border: "1px solid #334155",
        }}>
          <span style={{ fontSize: "18px" }}>{toast.success ? "✅" : "⚠️"}</span>
          <span>{toast.text}</span>
          <button onClick={() => setToast({ text: "", success: true })} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", marginLeft: "8px", fontSize: "16px" }}>✕</button>
        </div>
      )}
    </div>
  );
}