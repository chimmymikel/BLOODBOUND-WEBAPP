import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getMe, getCommitments, cancelCommitment } from "./api";

// ─────────────────────────────────────────────────────────────────────────────
// SDD §7.3 Design System:
//   Primary:   #D32F2F  (Emergency Red)
//   Secondary: #F44336  (Soft Red)
//   Success:   #388E3C  (Confirmations / Eligibility green)
//   Warning:   #F57C00  (Urgency / Pending orange)
//   Font:      Inter (Sans-serif), 8px grid
// ─────────────────────────────────────────────────────────────────────────────

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

  /* SDD §7.3 Success #388E3C eligibility pulse */
  @keyframes eligibility-pulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(56,142,60,0.4); }
    50%     { box-shadow: 0 0 0 10px rgba(56,142,60,0); }
  }
  /* SDD §7.3 Warning #F57C00 pending pulse */
  @keyframes pending-pulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(245,124,0,0.35); }
    50%     { box-shadow: 0 0 0 8px rgba(245,124,0,0); }
  }

  .cm-f1 { animation: fadeUp .55s cubic-bezier(.16,1,.3,1) both .05s; }
  .cm-f2 { animation: fadeUp .55s cubic-bezier(.16,1,.3,1) both .13s; }
  .cm-f3 { animation: fadeUp .55s cubic-bezier(.16,1,.3,1) both .21s; }

  .wordmark-blood {
    background: linear-gradient(135deg,#D32F2F 0%,#F44336 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .wordmark-bound {
    background: linear-gradient(135deg,#1D4ED8 0%,#2563EB 100%);
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
    background: transparent; border: 2px solid #e2e8f0; color: #64748b;
    padding: 14px; border-radius: 12px; cursor: pointer; font-size: 14.5px;
    font-weight: 800; font-family: inherit; transition: all 0.2s ease; width: 100%;
  }
  .signout-btn:hover {
    background: #fff1f2; border-color: #fecdd3; color: #be123c;
    transform: translateY(-1px); box-shadow: 0 4px 12px rgba(211,47,47,0.1);
  }

  .stat-card {
    background: #ffffff; border-radius: 20px; border: 2.5px solid #e2e8f0;
    box-shadow: 0 8px 20px -4px rgba(0,0,0,0.03); padding: 28px;
    transition: all 0.22s cubic-bezier(.34,1.56,.64,1);
    position: relative; overflow: hidden;
  }
  .stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 16px 32px -6px rgba(0,0,0,0.08); border-color: #cbd5e1;
  }
  .stat-watermark {
    position: absolute; right: -4px; bottom: -10px;
    font-size: 88px; opacity: 0.055; line-height: 1;
    pointer-events: none; user-select: none; transform: rotate(-8deg);
  }

  .voucher-card {
    background: #ffffff; border-radius: 20px; border: 2px solid #e8edf5;
    box-shadow: 0 6px 24px -6px rgba(0,0,0,0.07), 0 2px 8px -2px rgba(0,0,0,0.04);
    transition: all 0.22s cubic-bezier(.16,1,.3,1); overflow: hidden; display: flex; flex-direction: column;
  }
  .voucher-card:hover {
    box-shadow: 0 14px 40px -8px rgba(0,0,0,0.12), 0 4px 12px -3px rgba(0,0,0,0.05);
    transform: translateY(-2px); border-color: #d0d9ea;
  }

  .perf-line {
    width: 0; border-left: 2px dashed #dde3ed;
    position: relative; flex-shrink: 0; margin: 16px 0;
  }
  .perf-line::before, .perf-line::after {
    content: ''; position: absolute; left: -9px;
    width: 16px; height: 16px; background: #f8fafc;
    border-radius: 50%; border: 2px solid #dde3ed;
  }
  .perf-line::before { top: -24px; }
  .perf-line::after  { bottom: -24px; }

  /* SDD Primary #D32F2F → Blue gradient for blood type */
  .bt-text-gradient {
    background: linear-gradient(135deg,#D32F2F 0%,#F44336 40%,#1D4ED8 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }

  .badge-pulse-green  { animation: eligibility-pulse 2.4s ease-in-out infinite; }
  .badge-pulse-orange { animation: pending-pulse 2s ease-in-out infinite; }

  .hub-btn {
    width: 100%; padding: 11px 14px; border-radius: 12px; font-weight: 800;
    font-size: 13px; cursor: pointer; transition: all 0.18s ease;
    font-family: inherit; display: flex; justify-content: center;
    align-items: center; gap: 6px; border: none; letter-spacing: -0.01em;
  }
  .hub-btn:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.06); }
  .hub-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .tab-pill {
    padding: 8px 18px; border-radius: 10px; border: 2px solid transparent;
    font-size: 13px; font-weight: 800; cursor: pointer; font-family: inherit; transition: all 0.18s ease;
  }
`;

const microLabel = {
  display: "block", fontSize: "10px", fontWeight: "800", color: "#94a3b8",
  textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "5px",
};

function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
      <div style={{ width: "32px", height: "32px", border: "3px solid #e2e8f0", borderTopColor: "#D32F2F", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
    </div>
  );
}

function EmptyState({ icon, title, body }) {
  return (
    <div style={{ border: "2px dashed #e2e8f0", borderRadius: "20px", padding: "60px 24px", textAlign: "center" }}>
      <div style={{ fontSize: "48px", marginBottom: "16px" }}>{icon}</div>
      <div style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a", marginBottom: "8px", letterSpacing: "-0.02em" }}>{title}</div>
      <div style={{ fontSize: "14px", color: "#64748b", fontWeight: "500", maxWidth: "360px", margin: "0 auto" }}>{body}</div>
    </div>
  );
}

function formatBloodType(raw) {
  if (!raw) return "—";
  return raw.replace("_POSITIVE", "+").replace("_NEGATIVE", "−").replace(/_/g, "");
}

// ════════════════════════════════════════════════════════════════════
//  VERIFIED DONOR BADGE
//  Based on SDD §2.2 Journey 2: donor receives commitment confirmation
//  and SDD §2.4 AC-6: returns verified confirmation with hospital details.
//
//  Design:
//  • Outer animated ring — SDD Success #388E3C (completed) or
//    Warning #F57C00 (pending) per §7.3 colour system
//  • Inner circle — donor blood type large + check/status mark
//  • "BB" micro-pill branding top-right
//  • Donor name label below
// ════════════════════════════════════════════════════════════════════
function VerifiedDonorBadge({ bloodType, status, donorName }) {
  const isPending   = status === "PENDING";
  const isCompleted = status === "COMPLETED";
  const isCancelled = status === "CANCELLED";

  // SDD §7.3 colour mapping
  const ringColor  = isCompleted ? "#388E3C" : isPending ? "#F57C00" : "#94a3b8";
  const ringBg     = isCompleted ? "rgba(56,142,60,0.08)" : isPending ? "rgba(245,124,0,0.07)" : "rgba(148,163,184,0.05)";
  const pulseClass = isCompleted ? "badge-pulse-green" : isPending ? "badge-pulse-orange" : "";

  const checkIcon  = isCompleted ? "✔" : isPending ? "✔" : "✕";
  const checkColor = isCompleted ? "#388E3C" : isPending ? "#F57C00" : "#94a3b8";
  const badgeLabel = isCompleted ? "Donation Complete" : isPending ? "Verified Donor" : "Cancelled";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>

      {/* Outer pulsing ring */}
      <div
        className={pulseClass}
        style={{
          width: "104px", height: "104px", borderRadius: "50%",
          background: ringBg, border: `2.5px solid ${ringColor}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative", transition: "border-color 0.3s",
        }}
      >
        {/* Inner badge */}
        <div style={{
          width: "80px", height: "80px", borderRadius: "50%",
          background: isCancelled
            ? "linear-gradient(145deg,#f1f5f9,#e2e8f0)"
            : "linear-gradient(145deg,#ffffff,#f8fafc)",
          border: `2px solid ${isCancelled ? "#e2e8f0" : ringColor + "35"}`,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          boxShadow: isCancelled ? "none" : `0 4px 16px ${ringColor}20`,
          gap: "2px",
        }}>
          {/* Blood type — SDD Primary gradient */}
          <div
            className={isCancelled ? "" : "bt-text-gradient"}
            style={{
              fontSize: "22px", fontWeight: "900", lineHeight: 1,
              letterSpacing: "-0.03em",
              color: isCancelled ? "#cbd5e1" : undefined,
            }}
          >
            {formatBloodType(bloodType) || "?"}
          </div>

          {/* Status check */}
          <div style={{ fontSize: "12px", fontWeight: "900", color: checkColor, lineHeight: 1 }}>
            {checkIcon}
          </div>
        </div>

        {/* "BB" micro-pill branding */}
        {!isCancelled && (
          <div style={{
            position: "absolute", top: "0px", right: "-4px",
            background: ringColor, color: "#ffffff",
            fontSize: "8px", fontWeight: "900",
            padding: "2px 6px", borderRadius: "8px",
            letterSpacing: "0.05em",
            boxShadow: `0 2px 6px ${ringColor}44`,
          }}>
            BB
          </div>
        )}
      </div>

      {/* Label */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "10px", fontWeight: "900", color: checkColor, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          {badgeLabel}
        </div>
        <div style={{ fontSize: "9px", fontWeight: "600", color: "#94a3b8", marginTop: "2px", maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {donorName || "Donor"}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
//  TICKET CARD — Medical Voucher
//  SDD §7.1-C: Hospital Name, Date, Status, Action Buttons
//  Three-segment: Authenticator | Medical Core | Control Hub
// ════════════════════════════════════════════════════════════════════
function TicketCard({ ticket, navigate, user, onCancel, cancelling }) {
  const isPending   = ticket.status === "PENDING";
  const isCompleted = ticket.status === "COMPLETED";
  const isCancelled = ticket.status === "CANCELLED";
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  // SDD §7.3 colour mapping
  const statusColor = isPending ? "#F57C00" : isCompleted ? "#388E3C" : "#94a3b8";
  const statusBg    = isPending ? "#fff7ed"  : isCompleted ? "#f0fdf4"  : "#f8fafc";
  const statusBdr   = isPending ? "#fed7aa"  : isCompleted ? "#bbf7d0"  : "#e2e8f0";

  const stripeGrad = isPending
    ? "linear-gradient(90deg,#D32F2F 0%,#F44336 50%,#1D4ED8 100%)"
    : isCompleted
    ? "linear-gradient(90deg,#388E3C,#4caf50,#2e7d32)"
    : "linear-gradient(90deg,#94a3b8,#64748b)";

  const urgencyColor =
    ticket.urgency === "CRITICAL" ? "#D32F2F"
    : ticket.urgency === "HIGH"   ? "#F57C00"
    : "#388E3C";

  const committedDate = ticket.committedAt
    ? new Date(ticket.committedAt).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })
    : "—";

  return (
    <div className="voucher-card">

      {/* Top accent stripe */}
      <div style={{ height: "5px", background: stripeGrad, flexShrink: 0 }} />

      <div style={{ display: "flex", alignItems: "stretch", minHeight: "188px" }}>

        {/* ═══ LEFT — The Authenticator ═══════════════════════════════════ */}
        <div style={{
          width: "152px", flexShrink: 0,
          background: "linear-gradient(160deg,#f8fafc 0%,#f1f5f9 100%)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "24px 16px", gap: "8px",
        }}>
          {/* Status badge */}
          <span style={{
            padding: "3px 10px", borderRadius: "5px", fontSize: "9px",
            fontWeight: "900", letterSpacing: "0.1em",
            background: statusBg, color: statusColor, border: `1px solid ${statusBdr}`,
            marginBottom: "4px",
          }}>
            {ticket.status}
          </span>

          {/* Verified Donor Badge */}
          <VerifiedDonorBadge
            bloodType={ticket.bloodTypeNeeded}
            status={ticket.status}
            donorName={user.fullName}
          />

          {/* Reference number */}
          <div style={{ fontSize: "9px", fontWeight: "800", color: "#94a3b8", letterSpacing: "0.08em", textAlign: "center", marginTop: "2px" }}>
            {ticket.referenceNumber || "—"}
          </div>
        </div>

        {/* Perforated tear line */}
        <div className="perf-line" />

        {/* ═══ CENTER — The Medical Core ══════════════════════════════════ */}
        <div style={{ flex: 1, padding: "24px 28px", display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0 }}>
          <div>
            <h3 style={{
              fontSize: "19px", fontWeight: "900",
              color: isCancelled ? "#94a3b8" : "#0f172a",
              margin: "0 0 4px", letterSpacing: "-0.02em",
              textDecoration: isCancelled ? "line-through" : "none", lineHeight: 1.2,
            }}>
              🏥 {ticket.hospitalName || "Hospital Facility"}
            </h3>
            <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", marginBottom: "18px" }}>
              Committed · {committedDate}
            </div>
          </div>

          {/* Two-column grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

            {/* Column A: Medical Info */}
            <div>
              <div style={microLabel}>Blood Type Needed</div>
              <div
                className={isCancelled ? "" : "bt-text-gradient"}
                style={{ fontSize: "30px", fontWeight: "900", letterSpacing: "-0.02em", lineHeight: 1, color: isCancelled ? "#cbd5e1" : undefined }}
              >
                {formatBloodType(ticket.bloodTypeNeeded)}
              </div>
              {ticket.urgency && !isCancelled && (
                <div style={{
                  marginTop: "8px", display: "inline-flex", alignItems: "center", gap: "4px",
                  padding: "3px 10px", borderRadius: "6px", fontSize: "10px", fontWeight: "800",
                  letterSpacing: "0.04em",
                  background: urgencyColor + "14", color: urgencyColor, border: `1px solid ${urgencyColor}30`,
                }}>
                  {ticket.urgency === "CRITICAL" ? "🚨" : ticket.urgency === "HIGH" ? "⚠️" : "✅"}&nbsp;{ticket.urgency}
                </div>
              )}
            </div>

            {/* Column B: Contact Card
                SDD §2.2 Journey 2: "views hospital location and requester contact details"
                SDD §2.4 AC-6: "see the Hospital contact details (Name, Address, Phone)" */}
            {!isCancelled ? (
              <div style={{
                background: "linear-gradient(135deg,#eff6ff 0%,#dbeafe 100%)",
                border: "1.5px solid #bfdbfe", borderRadius: "14px", padding: "12px 14px",
              }}>
                <div style={{ ...microLabel, color: "#1d4ed8", marginBottom: "6px" }}>Contact Requester</div>
                <div style={{ fontSize: "14px", fontWeight: "900", color: "#1D4ED8", letterSpacing: "-0.01em", marginBottom: "4px", display: "flex", alignItems: "center", gap: "5px" }}>
                  📞 {ticket.requesterContactNumber || "—"}
                </div>
                <div style={{ fontSize: "12px", fontWeight: "600", color: "#3b82f6", display: "flex", alignItems: "center", gap: "4px" }}>
                  👤 {ticket.requesterName || "Anonymous"}
                </div>
              </div>
            ) : (
              <div style={{ background: "#f8fafc", border: "1.5px dashed #e2e8f0", borderRadius: "14px", padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: "11px", color: "#cbd5e1", fontWeight: "700", textAlign: "center" }}>Contact unavailable</div>
              </div>
            )}
          </div>
        </div>

        {/* Thin separator */}
        <div style={{ width: "1px", flexShrink: 0, background: "linear-gradient(to bottom,transparent,#e8edf5 20%,#e8edf5 80%,transparent)" }} />

        {/* ═══ RIGHT — The Control Hub ════════════════════════════════════
            SDD §7.1-C: "Get Directions" + "Cancel Commitment" + Dashboard
        ════════════════════════════════════════════════════════════════════ */}
        <div style={{
          width: "186px", flexShrink: 0,
          background: "linear-gradient(160deg,#f8fafc 0%,#f1f5f9 100%)",
          padding: "20px 16px", display: "flex", flexDirection: "column",
          justifyContent: "center", gap: "9px",
        }}>
          {isPending && (
            <>
              <button
                className="hub-btn"
                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ticket.hospitalName || "hospital")}`, "_blank")}
                style={{ background: "linear-gradient(135deg,#0f172a,#1e293b)", color: "#ffffff", boxShadow: "0 4px 12px rgba(15,23,42,0.22)" }}
              >
                📍 Get Directions
              </button>

              {!confirmingCancel ? (
                <button className="hub-btn" onClick={() => setConfirmingCancel(true)} style={{ background: "#ffffff", border: "1.5px solid #fecdd3", color: "#be123c" }}>
                  ✕ Cancel
                </button>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                  <div style={{ fontSize: "10px", fontWeight: "800", color: "#c2410c", textAlign: "center", letterSpacing: "0.02em" }}>
                    Sure you want to cancel?
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      onClick={() => setConfirmingCancel(false)}
                      style={{ flex: 1, padding: "9px 6px", borderRadius: "10px", border: "1.5px solid #e2e8f0", background: "#ffffff", color: "#64748b", fontWeight: "800", fontSize: "12px", cursor: "pointer", fontFamily: "inherit" }}
                    >No</button>
                    <button
                      className="hub-btn"
                      disabled={cancelling === ticket.id}
                      onClick={() => onCancel(ticket.id)}
                      style={{ flex: 1, padding: "9px 6px", fontSize: "12px", background: "linear-gradient(135deg,#D32F2F,#b91c1c)", color: "#fff" }}
                    >
                      {cancelling === ticket.id ? "..." : "Yes"}
                    </button>
                  </div>
                </div>
              )}

              <button className="hub-btn" onClick={() => navigate("/dashboard", { state: { user } })} style={{ background: "transparent", border: "1.5px solid #e2e8f0", color: "#64748b" }}>
                ← Dashboard
              </button>
            </>
          )}

          {(isCompleted || isCancelled) && (
            <button className="hub-btn" onClick={() => navigate("/dashboard", { state: { user } })} style={{ background: "linear-gradient(135deg,#f8fafc,#f1f5f9)", border: "1.5px solid #e2e8f0", color: "#475569" }}>
              ← Back to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN MY COMMITMENTS
//  SDD §7.1-C: My Commitments Page spec
// ══════════════════════════════════════════════════════════════════════════════
export default function MyCommitments() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user,        setUser]        = useState(location.state?.user || {});
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (location.state?.user?.id) {
      setUser(location.state.user);
      setAuthLoading(false);
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    getMe()
      .then((res) => {
        if (res.data?.data) setUser(res.data.data);
        else { localStorage.removeItem("token"); navigate("/login"); }
      })
      .catch(() => { localStorage.removeItem("token"); navigate("/login"); })
      .finally(() => setAuthLoading(false));
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
  const handleNavClick = (item) => {
    if (item === "Overview")             navigate("/dashboard",   { state: { user } });
    else if (item === "Active Requests") navigate("/requests",    { state: { user } });
    else if (item === "My Profile")      navigate("/profile",     { state: { user } });
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
      setCommitments((prev) => prev.map((c) => c.id === commitmentId ? { ...c, status: "CANCELLED" } : c));
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
  const filtered = activeTab === "ACTIVE" ? activeCommitments : activeTab === "PAST" ? completedCommitments : cancelledCommitments;
  const livesSaved = completedCommitments.length * 3; // SDD §7.1-C "each donation saves up to 3 lives"

  if (authLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
        <div style={{ width: "40px", height: "40px", border: "3px solid #e2e8f0", borderTopColor: "#D32F2F", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: '"Inter",-apple-system,BlinkMacSystemFont,sans-serif' }}>
      <style>{STYLES}</style>

      {/* ══ SIDEBAR ══ */}
      <aside style={{ width: "280px", background: "linear-gradient(145deg,#F8FAFC 0%,#EEF2FF 50%,#F1F5F9 100%)", borderRight: "2px solid #e2e8f0", padding: "40px 24px", position: "fixed", height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", boxSizing: "border-box" }}>
        <div style={{ position: "absolute", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle,rgba(211,47,47,0.12) 0%,rgba(211,47,47,0.04) 50%,transparent 70%)", top: "-100px", left: "-100px", filter: "blur(24px)", animation: "orb-drift-red 8s ease-in-out infinite", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "absolute", width: "350px", height: "350px", borderRadius: "50%", background: "radial-gradient(circle,rgba(37,99,235,0.1) 0%,rgba(37,99,235,0.03) 50%,transparent 70%)", bottom: "-100px", right: "-100px", filter: "blur(30px)", animation: "orb-drift-blue 10s ease-in-out infinite", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "absolute", width: "240px", height: "240px", borderRadius: "50%", border: "1.5px solid rgba(211,47,47,0.08)", top: "-50px", right: "-50px", animation: "pulse-ring 5s ease-in-out infinite", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "absolute", width: "120px", height: "120px", borderRadius: "50%", border: "1.5px solid rgba(37,99,235,0.08)", bottom: "40px", left: "-30px", animation: "pulse-ring 5s ease-in-out 1.2s infinite", pointerEvents: "none", zIndex: 0 }} />

        <div style={{ position: "relative", zIndex: 1, marginBottom: "48px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: "900", margin: "0", letterSpacing: "-0.045em", display: "flex", alignItems: "center", gap: "10px", lineHeight: "1.1", whiteSpace: "nowrap" }}>
            <span style={{ fontSize: "32px", filter: "drop-shadow(0 4px 10px rgba(211,47,47,.25))", animation: "float 4s ease-in-out infinite" }}>🩸</span>
            <span><span className="wordmark-blood">Blood</span><span className="wordmark-bound">Bound</span></span>
          </h2>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "8px", position: "relative", zIndex: 1, flex: 1 }}>
          {navItems.map((item) => {
            const isActive = item === "My Commitments";
            return (
              <div key={item} className={`nav-item${isActive ? " nav-item-active" : ""}`} onClick={() => handleNavClick(item)} onMouseEnter={() => setHoveredTab(item)} onMouseLeave={() => setHoveredTab(null)} style={{ color: isActive ? "#D32F2F" : (hoveredTab === item ? "#0f172a" : "#64748b") }}>
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

        {/* SDD §7.1-C page title */}
        <header className="cm-f1" style={{ marginBottom: "40px" }}>
          <h1 style={{ fontSize: "36px", fontWeight: "900", color: "#0f172a", margin: "0 0 8px", letterSpacing: "-0.03em" }}>My Commitments 🎫</h1>
          <p style={{ color: "#64748b", fontSize: "16px", margin: "0", fontWeight: "500" }}>Track your upcoming hospital visits and view your donation impact.</p>
        </header>

        {/* SDD §7.1-C "Impact Summary: Total Active, Completed, Lives Saved" */}
        <div className="cm-f2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px", marginBottom: "32px" }}>
          <div className="stat-card">
            <div style={microLabel}>Active Tickets</div>
            <div style={{ fontSize: "42px", fontWeight: "900", color: "#0f172a", letterSpacing: "-0.03em", lineHeight: 1 }}>{activeCommitments.length}</div>
            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "6px", fontWeight: "500" }}>{activeCommitments.length === 0 ? "No pending visits" : "Upcoming hospital visits"}</div>
            <div className="stat-watermark">🎫</div>
          </div>

          <div className="stat-card">
            <div style={microLabel}>Completed Donations</div>
            <div style={{ fontSize: "42px", fontWeight: "900", color: "#0f172a", letterSpacing: "-0.03em", lineHeight: 1 }}>{completedCommitments.length}</div>
            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "6px", fontWeight: "500" }}>{completedCommitments.length === 0 ? "Complete your first!" : "Donations fulfilled"}</div>
            <div className="stat-watermark">✅</div>
          </div>

          <div className="stat-card" style={{ background: "linear-gradient(135deg,#fff1f2 0%,#ffe4e6 60%,#fecdd3 100%)", border: "2.5px solid #fecdd3" }}>
            <div style={{ ...microLabel, color: "#be123c" }}>Lives Impacted</div>
            <div style={{ fontSize: "42px", fontWeight: "900", color: "#D32F2F", letterSpacing: "-0.03em", lineHeight: 1 }}>{livesSaved}</div>
            <div style={{ fontSize: "12px", color: "#be123c", marginTop: "6px", fontWeight: "500" }}>Each donation saves up to 3 lives</div>
            <div className="stat-watermark" style={{ opacity: 0.1 }}>🩸</div>
          </div>
        </div>

        {/* Ticket section */}
        <div className="cm-f3" style={{ backgroundColor: "#ffffff", padding: "32px", borderRadius: "20px", boxShadow: "0 8px 20px -4px rgba(0,0,0,0.03)", border: "2.5px solid #e2e8f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", paddingBottom: "20px", borderBottom: "1.5px solid #f1f5f9", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h3 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: "900", color: "#0f172a", letterSpacing: "-0.02em" }}>Donation Tickets</h3>
              <p style={{ margin: 0, fontSize: "13px", color: "#64748b", fontWeight: "500" }}>Your commitment history and upcoming visits</p>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
              <button className="tab-pill" onClick={() => setActiveTab("ACTIVE")} style={{ background: activeTab === "ACTIVE" ? "#fff1f2" : "#f8fafc", borderColor: activeTab === "ACTIVE" ? "#fecdd3" : "transparent", color: activeTab === "ACTIVE" ? "#D32F2F" : "#64748b" }}>Active ({activeCommitments.length})</button>
              <button className="tab-pill" onClick={() => setActiveTab("PAST")} style={{ background: activeTab === "PAST" ? "#f0fdf4" : "#f8fafc", borderColor: activeTab === "PAST" ? "#bbf7d0" : "transparent", color: activeTab === "PAST" ? "#388E3C" : "#64748b" }}>Completed ({completedCommitments.length})</button>
              <button className="tab-pill" onClick={() => setActiveTab("CANCELLED")} style={{ background: activeTab === "CANCELLED" ? "#f8fafc" : "#f8fafc", borderColor: activeTab === "CANCELLED" ? "#cbd5e1" : "transparent", color: activeTab === "CANCELLED" ? "#475569" : "#94a3b8" }}>Cancelled ({cancelledCommitments.length})</button>
              <button onClick={fetchCommitments} style={{ background: "none", border: "2px solid #e2e8f0", borderRadius: "10px", padding: "7px 14px", fontSize: "13px", fontWeight: "700", cursor: "pointer", color: "#64748b", fontFamily: "inherit" }}>↻ Refresh</button>
            </div>
          </div>

          {loading ? <Spinner /> : error ? (
            <div style={{ border: "2px solid #fecdd3", borderRadius: "14px", padding: "20px 24px", backgroundColor: "#fff1f2", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
              <div style={{ fontSize: "14px", color: "#be123c", fontWeight: "700" }}>⚠ {error}</div>
              <button onClick={fetchCommitments} style={{ background: "#D32F2F", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", fontWeight: "800", cursor: "pointer", fontFamily: "inherit" }}>Retry</button>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={activeTab === "ACTIVE" ? "🎫" : activeTab === "PAST" ? "✅" : "❌"}
              title={activeTab === "ACTIVE" ? "No active tickets" : activeTab === "PAST" ? "No completed donations yet" : "No cancelled commitments"}
              body={activeTab === "ACTIVE" ? "When you commit to a blood request, your ticket will appear here." : activeTab === "PAST" ? "Completed donations will show here after a request is marked fulfilled." : "Cancelled commitments will appear here for your records."}
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {filtered.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} navigate={navigate} user={user} onCancel={handleCancel} cancelling={cancelling} />
              ))}
            </div>
          )}
        </div>
      </main>

      {toast.text && (
        <div style={{ position: "fixed", bottom: "40px", left: "50%", transform: "translateX(-50%)", background: "#0f172a", color: "#ffffff", padding: "14px 24px", borderRadius: "14px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)", zIndex: 9999, display: "flex", alignItems: "center", gap: "12px", animation: "toastSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards", fontWeight: "600", fontSize: "14px", border: "1px solid #334155" }}>
          <span style={{ fontSize: "18px" }}>{toast.success ? "✅" : "⚠️"}</span>
          <span>{toast.text}</span>
          <button onClick={() => setToast({ text: "", success: true })} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", marginLeft: "8px", fontSize: "16px" }}>✕</button>
        </div>
      )}
    </div>
  );
}