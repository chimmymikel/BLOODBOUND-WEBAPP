import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getMe,
  getRequests,
} from "./api";

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

  .db-f1 { animation: fadeUp .55s cubic-bezier(.16,1,.3,1) both .05s; }
  .db-f2 { animation: fadeUp .55s cubic-bezier(.16,1,.3,1) both .13s; }
  .db-f3 { animation: fadeUp .55s cubic-bezier(.16,1,.3,1) both .21s; }

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

  .request-row {
    border: 2px solid #f1f5f9; border-radius: 14px; padding: 20px 24px;
    transition: all 0.18s ease; background: #ffffff;
  }
  .request-row:hover {
    border-color: #e2e8f0;
    box-shadow: 0 6px 20px -4px rgba(0,0,0,0.07);
    transform: translateY(-1px);
  }
`;

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatBloodType(raw) {
  if (!raw) return "—";
  return raw.replace("_POSITIVE", "+").replace("_NEGATIVE", "−").replace(/_/g, "");
}
function formatDate(isoString) {
  if (!isoString) return null;
  return new Date(isoString).toLocaleDateString("en-PH", {
    year: "numeric", month: "long", day: "numeric",
  });
}
function timeAgo(isoString) {
  if (!isoString) return "";
  const diff = Math.floor((new Date() - new Date(isoString)) / 1000);
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── Shared UI primitives ──────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
      <div style={{
        width: "32px", height: "32px",
        border: "3px solid #e2e8f0", borderTopColor: "#DC2626",
        borderRadius: "50%", animation: "spin .7s linear infinite",
      }} />
    </div>
  );
}

function ErrorBanner({ msg, onRetry }) {
  return (
    <div style={{
      border: "2px solid #fecdd3", borderRadius: "14px", padding: "20px 24px",
      backgroundColor: "#fff1f2", display: "flex", alignItems: "center",
      justifyContent: "space-between", gap: "16px",
    }}>
      <div style={{ fontSize: "14px", color: "#be123c", fontWeight: "700" }}>⚠ {msg}</div>
      {onRetry && (
        <button onClick={onRetry} style={{ background: "#DC2626", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", fontWeight: "800", cursor: "pointer", fontFamily: "inherit" }}>
          Retry
        </button>
      )}
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

function SectionCard({ children, style = {} }) {
  return (
    <div style={{ backgroundColor: "#ffffff", padding: "32px", borderRadius: "20px", boxShadow: "0 8px 20px -4px rgba(0,0,0,0.03)", border: "2.5px solid #e2e8f0", ...style }}>
      {children}
    </div>
  );
}

function SectionHeader({ title, subtitle, right }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", paddingBottom: "20px", borderBottom: "1.5px solid #f1f5f9" }}>
      <div>
        <h3 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: "900", color: "#0f172a", letterSpacing: "-0.02em" }}>{title}</h3>
        {subtitle && <p style={{ margin: 0, fontSize: "13px", color: "#64748b", fontWeight: "500" }}>{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

// ── HISTORY ROW COMPONENT ─────────────────────────────────────────────────────
function HistoryRowRequester({ request }) {
  const bt = formatBloodType(request.bloodType);
  const commitCount = request.commitmentCount || request.units || 0; 

  return (
    <div className="request-row" style={{ display: "flex", alignItems: "center", gap: "16px", opacity: 0.9 }}>
      {/* Green theme for fulfilled items instead of the usual blue/red */}
      <div style={{ width: "52px", height: "52px", flexShrink: 0, borderRadius: "14px", background: "linear-gradient(135deg,#f0fdf4,#dcfce7)", border: "2px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px", fontWeight: "900", color: "#16a34a" }}>
        {bt}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a" }}>
            {bt} Blood · {request.units} unit{request.units !== 1 ? "s" : ""}
          </span>
          <span style={{ fontSize: "10px", fontWeight: "800", padding: "2px 8px", borderRadius: "5px", letterSpacing: "0.05em", backgroundColor: "#ecfdf5", color: "#16a34a", border: "1px solid #a7f3d0" }}>
            {request.status}
          </span>
        </div>
        <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", marginBottom: "4px" }}>📍 {request.hospitalName}</div>
        {request.notes && <div style={{ fontSize: "13px", color: "#94a3b8", fontWeight: "500", marginBottom: "3px" }}>{request.notes}</div>}
        <div style={{ fontSize: "11px", color: "#cbd5e1", fontWeight: "500" }}>
          Posted {formatDate(request.createdAt)}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px", flexShrink: 0 }}>
        <div style={{ textAlign: "right" }}>
           <div style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a", lineHeight: 1 }}>{commitCount} Donor{commitCount !== 1 ? 's' : ''}</div>
           <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", marginTop: "4px" }}>Helped fulfill this request</div>
        </div>
        <span style={{ fontSize: "12px", fontWeight: "800", color: "#16A34A", padding: "6px 12px", borderRadius: "8px", backgroundColor: "#ecfdf5", border: "1.5px solid #6ee7b7" }}>
          ✔ Successfully Fulfilled
        </span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN REQUEST HISTORY COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function RequestHistory() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(location.state?.user || {});
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (location.state?.user?.id) {
      setUser(location.state.user);
      setAuthLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    getMe()
      .then((res) => {
        if (res.data?.data) {
          setUser(res.data.data);
        } else {
          localStorage.removeItem("token");
          navigate("/login");
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      })
      .finally(() => setAuthLoading(false));
  }, []);

  const isDonor = user.role === "DONOR";

  // If a Donor somehow navigates here, redirect them back to dashboard
  useEffect(() => {
    if (!authLoading && isDonor) {
      navigate("/dashboard", { state: { user } });
    }
  }, [authLoading, isDonor, navigate, user]);

  const [activeTab] = useState("Request History"); // Set active tab strictly to this page
  const [hoveredTab, setHoveredTab] = useState(null);

  const navItems = isDonor
    ? ["Overview", "My Commitments", "Active Requests", "My Profile"]
    : ["Overview", "Active Requests", "Request History", "My Profile"];

  const handleNavClick = (item) => {
    if (item === "Overview")             navigate("/dashboard",   { state: { user } });
    else if (item === "My Commitments")  navigate("/commitments", { state: { user } });
    else if (item === "Active Requests") navigate("/requests",    { state: { user } });
    else if (item === "Request History") navigate("/history",     { state: { user } });
    else if (item === "My Profile")      navigate("/profile",     { state: { user } });
  };

  const [historyRequests, setHistoryRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [errorRequests, setErrorRequests]     = useState("");

  const fetchHistory = useCallback(async () => {
    if (!user.id) return;
    setLoadingRequests(true);
    setErrorRequests("");
    try {
      // Fetch all requests for this requester
      const res = await getRequests({ requesterId: user.id });
      const allRequests = res.data?.data ?? res.data ?? [];
      
      // Filter out ONLY the fulfilled ones for the history view
      const fulfilled = allRequests.filter(r => r.status === "FULFILLED" || r.status === "ARCHIVED");
      
      // Sort by newest first
      fulfilled.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setHistoryRequests(fulfilled);
    } catch {
      setErrorRequests("Failed to load your history. Please try again.");
    } finally {
      setLoadingRequests(false);
    }
  }, [user.id]);

  useEffect(() => {
    if (user.id && !isDonor) {
      fetchHistory();
    }
  }, [user.id, isDonor]);

  const activeNavColor = "#1D4ED8"; // Requester theme blue

  const renderHistorySection = () => {
    if (loadingRequests) return <Spinner />;
    if (errorRequests)   return <ErrorBanner msg={errorRequests} onRetry={fetchHistory} />;
    if (historyRequests.length === 0) {
      return <EmptyState icon="📂" title="No history found" body="You haven't marked any blood requests as fulfilled yet. Once you do, they will be archived here for your records." />;
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {historyRequests.map((r) => (
          <HistoryRowRequester key={r.id} request={r} />
        ))}
      </div>
    );
  };

  if (authLoading || isDonor) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
        <div style={{ width: "40px", height: "40px", border: "3px solid #e2e8f0", borderTopColor: "#1D4ED8", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
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
            const isActive = activeTab === item;
            return (
              <div
                key={item}
                className={`nav-item${isActive ? " nav-item-active" : ""}`}
                onClick={() => handleNavClick(item)}
                onMouseEnter={() => setHoveredTab(item)}
                onMouseLeave={() => setHoveredTab(null)}
                style={{ color: isActive ? activeNavColor : (hoveredTab === item ? "#0f172a" : "#64748b") }}
              >
                {item}
              </div>
            );
          })}
        </nav>

        <div style={{ position: "relative", zIndex: 1, backgroundColor: "#ffffff", border: "2px solid #f1f5f9", borderRadius: "14px", padding: "14px 16px", marginBottom: "16px", boxShadow: "0 4px 12px -4px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: "13.5px", fontWeight: "800", color: "#0f172a", marginBottom: "3px" }}>{user.fullName || "User"}</div>
          <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email || ""}</div>
          <div style={{ display: "inline-flex", marginTop: "8px", fontSize: "10px", fontWeight: "800", padding: "4px 10px", borderRadius: "6px", backgroundColor: "#eff6ff", color: "#1d4ed8", border: "1px solid #dbeafe", letterSpacing: "0.06em" }}>
            {user.role || "REQUESTER"}
          </div>
        </div>

        <button className="signout-btn" onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}>← Sign Out</button>
      </aside>

      {/* ══ MAIN CONTENT ══ */}
      <main style={{ marginLeft: "280px", padding: "56px", width: "100%", boxSizing: "border-box", position: "relative" }}>
        
        <header className="db-f1" style={{ marginBottom: "40px" }}>
          <h1 style={{ fontSize: "36px", fontWeight: "900", color: "#0f172a", margin: "0 0 8px", letterSpacing: "-0.03em" }}>
            Request History 📂
          </h1>
          <p style={{ color: "#64748b", fontSize: "16px", margin: "0", fontWeight: "500" }}>
            A record of all your successfully fulfilled and archived blood requests.
          </p>
        </header>

        <div className="db-f2">
          <SectionCard>
            <SectionHeader
              title="Past Requests"
              subtitle="Showing all requests marked as fulfilled"
              right={<button onClick={fetchHistory} style={{ background: "none", border: "2px solid #e2e8f0", borderRadius: "10px", padding: "6px 14px", fontSize: "13px", fontWeight: "700", cursor: "pointer", color: "#64748b", fontFamily: "inherit" }}>↻ Refresh</button>}
            />
            {renderHistorySection()}
          </SectionCard>
        </div>

      </main>
    </div>
  );
}