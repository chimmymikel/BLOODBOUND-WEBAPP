import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// ─────────────────────────────────────────────────────────────────────────────
// BACKEND NOTES (for when you build the next endpoints):
//
// This dashboard is ready to wire up to:
//   GET /api/v1/requests?status=ACTIVE&bloodType=X  → replace the empty state below
//   GET /api/v1/requests?requesterId={id}           → REQUESTER's own active requests
//   GET /api/v1/commitments?donorId={id}            → DONOR's commitments
//
// All stats shown are REAL from the user object passed via location.state.
// NO hardcoded fake numbers anywhere in this file.
// ─────────────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("Overview");
  const [hoveredTab, setHoveredTab] = useState(null);
  const [hoveredLogout, setHoveredLogout] = useState(false);

  // Full user object from login/register → navigate("/dashboard", { state: { user: res.data.data } })
  const user = location.state?.user || {};
  const userName = user.fullName || "User";
  const isDonor = user.role === "DONOR";

  const navItems = ["Overview", "Donor Directory", "Active Requests", "My Profile"];

  const handleNavClick = (item) => {
    if (item === "My Profile") {
      navigate("/profile", { state: { user } });
    } else {
      setActiveTab(item);
    }
  };

  // ── 56-day eligibility (same formula as Profile, SDD Feature 3) ──────────
  const calculateEligibility = () => {
    if (!user?.lastDonationDate) return { eligible: true, days: 0 };
    const diffDays = Math.ceil(
      Math.abs(new Date() - new Date(user.lastDonationDate)) / (1000 * 60 * 60 * 24)
    );
    const remaining = 56 - diffDays;
    return { eligible: remaining <= 0, days: Math.max(remaining, 0) };
  };

  const { eligible, days } = calculateEligibility();

  // ── Member since formatting ───────────────────────────────────────────────
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })
    : null;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        fontFamily: '"Inter", sans-serif',
      }}
    >
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        style={{
          width: "280px",
          background: "#D32F2F",
          padding: "40px 24px",
          position: "fixed",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        {/* Decorative rings */}
        <div
          style={{
            position: "absolute",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            border: "3px solid rgba(255,255,255,0.1)",
            top: "-100px",
            left: "-100px",
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            border: "3px solid rgba(255,255,255,0.08)",
            bottom: "80px",
            right: "-50px",
            zIndex: 0,
          }}
        />

        {/* Brand Header */}
        <div style={{ position: "relative", zIndex: 1, marginBottom: "48px" }}>
          <h2
            style={{
              color: "#ffffff",
              fontSize: "28px",
              fontWeight: "900",
              margin: "0",
              letterSpacing: "-0.02em",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span style={{ fontSize: "32px" }}>🩸</span>
            BloodBound
          </h2>
          <div
            style={{
              width: "32px",
              height: "4px",
              background: "rgba(255,255,255,0.5)",
              borderRadius: "2px",
              marginTop: "12px",
            }}
          />
        </div>

        {/* Navigation */}
        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            position: "relative",
            zIndex: 1,
            flex: 1,
          }}
        >
          {navItems.map((item) => {
            const isActive = activeTab === item;
            const isHovered = hoveredTab === item;
            return (
              <div
                key={item}
                onClick={() => handleNavClick(item)}
                onMouseEnter={() => setHoveredTab(item)}
                onMouseLeave={() => setHoveredTab(null)}
                style={{
                  padding: "14px 18px",
                  borderRadius: "12px",
                  backgroundColor: isActive
                    ? "#ffffff"
                    : isHovered
                      ? "rgba(255,255,255,0.15)"
                      : "transparent",
                  color: isActive ? "#D32F2F" : "#ffffff",
                  fontSize: "15px",
                  fontWeight: isActive ? "800" : "600",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  transform: isActive ? "translateX(4px)" : "translateX(0)",
                  boxShadow: isActive ? "0 4px 12px rgba(0,0,0,0.1)" : "none",
                }}
              >
                {item}
              </div>
            );
          })}
        </nav>

        {/* User info at bottom of sidebar */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            backgroundColor: "rgba(255,255,255,0.1)",
            borderRadius: "12px",
            padding: "14px 16px",
            marginBottom: "12px",
          }}
        >
          <div style={{ fontSize: "13px", fontWeight: "800", color: "#ffffff", marginBottom: "2px" }}>
            {user.fullName || "User"}
          </div>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", fontWeight: "600" }}>
            {user.email || ""}
          </div>
          <div
            style={{
              display: "inline-block",
              marginTop: "6px",
              fontSize: "10px",
              fontWeight: "900",
              padding: "3px 8px",
              borderRadius: "6px",
              backgroundColor: isDonor ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.2)",
              color: "#ffffff",
              letterSpacing: "0.06em",
            }}
          >
            {user.role || ""}
          </div>
        </div>

        {/* Sign Out */}
        <button
          onClick={() => navigate("/login")}
          onMouseEnter={() => setHoveredLogout(true)}
          onMouseLeave={() => setHoveredLogout(false)}
          style={{
            position: "relative",
            zIndex: 1,
            background: hoveredLogout ? "rgba(255,255,255,0.15)" : "transparent",
            border: "2px solid rgba(255,255,255,0.3)",
            color: "#ffffff",
            padding: "14px",
            borderRadius: "12px",
            cursor: "pointer",
            fontSize: "15px",
            fontWeight: "800",
            transition: "all 0.2s ease",
            fontFamily: "inherit",
          }}
        >
          ← Sign Out
        </button>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main
        style={{
          marginLeft: "280px",
          padding: "56px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Page Header */}
        <header style={{ marginBottom: "40px" }}>
          <h1
            style={{
              fontSize: "36px",
              fontWeight: "900",
              color: "#0f172a",
              margin: "0 0 8px",
              letterSpacing: "-0.03em",
            }}
          >
            Welcome, {userName} 👋
          </h1>
          <p style={{ color: "#64748b", fontSize: "16px", margin: "0", fontWeight: "500" }}>
            {isDonor
              ? "Track your eligibility and find blood donation requests near you."
              : "Manage your blood requests and track incoming donor commitments."}
          </p>
        </header>

        {/* ══════════════════════════════════════════════════════════════════
            DONOR VIEW
        ══════════════════════════════════════════════════════════════════ */}
        {isDonor && (
          <>
            {/* ── Row 1: Eligibility + Personal Stats ─────────────────────── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "24px",
                marginBottom: "32px",
              }}
            >
              {/* Eligibility Card — REAL DATA from user.lastDonationDate */}
              <div
                style={{
                  gridColumn: "1 / 2",
                  backgroundColor: eligible ? "#ecfdf5" : "#fff1f2",
                  padding: "28px",
                  borderRadius: "20px",
                  border: `2.5px solid ${eligible ? "#10b981" : "#ef4444"}`,
                  boxShadow: "0 8px 20px -4px rgba(0,0,0,0.03)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                    Your Status
                  </div>
                  <div style={{ fontSize: "20px", fontWeight: "900", color: eligible ? "#065f46" : "#991b1b", letterSpacing: "-0.02em" }}>
                    {eligible ? "Ready to Donate ✔️" : `Eligible in ${days} days ⏳`}
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "6px", fontWeight: "500" }}>
                    {eligible
                      ? "You can commit to active requests."
                      : "56-day waiting period in progress."}
                  </div>
                </div>
              </div>

              {/* Blood Type Card — REAL DATA from user.bloodType */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  padding: "28px",
                  borderRadius: "20px",
                  border: "2.5px solid #e2e8f0",
                  boxShadow: "0 8px 20px -4px rgba(0,0,0,0.03)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                  Your Blood Type
                </div>
                <div style={{ fontSize: "36px", fontWeight: "900", color: "#D32F2F", letterSpacing: "-0.02em" }}>
                  {user.bloodType || "—"}
                </div>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", fontWeight: "500" }}>
                  Registered at sign-up
                </div>
              </div>

              {/* Total Donations Card — REAL DATA from user.totalDonations */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  padding: "28px",
                  borderRadius: "20px",
                  border: "2.5px solid #e2e8f0",
                  boxShadow: "0 8px 20px -4px rgba(0,0,0,0.03)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                  Total Donations
                </div>
                {/* Starts at 0 for new users — incremented by backend on AC-7 fulfillment */}
                <div style={{ fontSize: "36px", fontWeight: "900", color: "#0f172a", letterSpacing: "-0.02em" }}>
                  {user.totalDonations ?? 0}
                </div>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", fontWeight: "500" }}>
                  {user.totalDonations === 0
                    ? "No donations yet — commit to your first!"
                    : `Life${user.totalDonations === 1 ? "" : "s"} impacted so far`}
                </div>
              </div>
            </div>

            {/* ── Row 2: Last Donation + Member Since ─────────────────────── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
                marginBottom: "32px",
              }}
            >
              <div
                style={{
                  backgroundColor: "#ffffff",
                  padding: "24px 28px",
                  borderRadius: "16px",
                  border: "2.5px solid #e2e8f0",
                  boxShadow: "0 8px 20px -4px rgba(0,0,0,0.03)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                    Last Donation Date
                  </div>
                  <div style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a" }}>
                    {user.lastDonationDate
                      ? new Date(user.lastDonationDate).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })
                      : "No donations recorded yet"}
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                    Updated automatically when a request is fulfilled
                  </div>
                </div>
                <div style={{ fontSize: "32px" }}>📅</div>
              </div>

              <div
                style={{
                  backgroundColor: "#ffffff",
                  padding: "24px 28px",
                  borderRadius: "16px",
                  border: "2.5px solid #e2e8f0",
                  boxShadow: "0 8px 20px -4px rgba(0,0,0,0.03)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                    Member Since
                  </div>
                  <div style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a" }}>
                    {memberSince || "—"}
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                    Thank you for being part of BloodBound
                  </div>
                </div>
                <div style={{ fontSize: "32px" }}>🩸</div>
              </div>
            </div>

            {/* ── Active Blood Requests ────────────────────────────────────── */}
            {/* NOTE: This section needs GET /api/v1/requests when built */}
            <div
              style={{
                backgroundColor: "#ffffff",
                padding: "32px",
                borderRadius: "20px",
                boxShadow: "0 8px 20px -4px rgba(0,0,0,0.03)",
                border: "2.5px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "24px",
                  paddingBottom: "20px",
                  borderBottom: "1.5px solid #f1f5f9",
                }}
              >
                <div>
                  <h3 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: "900", color: "#0f172a", letterSpacing: "-0.02em" }}>
                    Nearby Blood Requests
                  </h3>
                  <p style={{ margin: "0", fontSize: "13px", color: "#64748b", fontWeight: "500" }}>
                    Active requests matching your blood type
                  </p>
                </div>
                {/* Blood type filter badge */}
                {user.bloodType && (
                  <span
                    style={{
                      backgroundColor: "#fee2e2",
                      color: "#D32F2F",
                      padding: "6px 16px",
                      borderRadius: "10px",
                      fontWeight: "900",
                      fontSize: "14px",
                      border: "2px solid #fca5a5",
                    }}
                  >
                    {user.bloodType} filter active
                  </span>
                )}
              </div>

              {/* Empty state — honest placeholder until GET /requests is built */}
              <div
                style={{
                  border: "2px dashed #e2e8f0",
                  borderRadius: "16px",
                  padding: "60px 24px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏥</div>
                <div style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a", marginBottom: "8px" }}>
                  No active requests right now
                </div>
                <div style={{ fontSize: "14px", color: "#64748b", fontWeight: "500", maxWidth: "360px", margin: "0 auto" }}>
                  When blood requests are posted by Requesters, they will appear here filtered by your blood type.
                </div>
              </div>
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            REQUESTER VIEW
        ══════════════════════════════════════════════════════════════════ */}
        {!isDonor && (
          <>
            {/* ── Row 1: Requester Stats ──────────────────────────────────── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "24px",
                marginBottom: "32px",
              }}
            >
              {/* Organization card — REAL DATA */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  padding: "28px",
                  borderRadius: "20px",
                  border: "2.5px solid #e2e8f0",
                  boxShadow: "0 8px 20px -4px rgba(0,0,0,0.03)",
                }}
              >
                <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                  Hospital / Organization
                </div>
                <div style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a", letterSpacing: "-0.01em", lineHeight: "1.3" }}>
                  {user.hospitalOrOrg || "—"}
                </div>
              </div>

              {/* Contact number card — REAL DATA */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  padding: "28px",
                  borderRadius: "20px",
                  border: "2.5px solid #e2e8f0",
                  boxShadow: "0 8px 20px -4px rgba(0,0,0,0.03)",
                }}
              >
                <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                  Contact Number
                </div>
                <div style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a" }}>
                  {user.contactNumber || "—"}
                </div>
              </div>

              {/* Member since card — REAL DATA */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  padding: "28px",
                  borderRadius: "20px",
                  border: "2.5px solid #e2e8f0",
                  boxShadow: "0 8px 20px -4px rgba(0,0,0,0.03)",
                }}
              >
                <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                  Member Since
                </div>
                <div style={{ fontSize: "17px", fontWeight: "900", color: "#0f172a" }}>
                  {memberSince || "—"}
                </div>
              </div>
            </div>

            {/* ── Post New Request CTA ─────────────────────────────────────── */}
            {/* NOTE: Needs POST /api/v1/requests when built */}
            <div
              style={{
                backgroundColor: "#D32F2F",
                padding: "32px",
                borderRadius: "20px",
                marginBottom: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{ position: "absolute", width: "200px", height: "200px", borderRadius: "50%", border: "3px solid rgba(255,255,255,0.1)", top: "-80px", right: "100px" }} />
              <div style={{ position: "absolute", width: "120px", height: "120px", borderRadius: "50%", border: "3px solid rgba(255,255,255,0.08)", bottom: "-40px", right: "40px" }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <h3 style={{ margin: "0 0 6px", fontSize: "22px", fontWeight: "900", color: "#ffffff", letterSpacing: "-0.02em" }}>
                  Need Blood Urgently?
                </h3>
                <p style={{ margin: "0", fontSize: "14px", color: "rgba(255,255,255,0.8)", fontWeight: "500" }}>
                  Post a request and notify available donors in Cebu City.
                </p>
              </div>
              <button
                style={{
                  position: "relative",
                  zIndex: 1,
                  backgroundColor: "#ffffff",
                  color: "#D32F2F",
                  padding: "14px 28px",
                  borderRadius: "12px",
                  border: "none",
                  fontWeight: "900",
                  fontSize: "15px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  flexShrink: 0,
                  boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fff1f2")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
              >
                + Post Blood Request
              </button>
            </div>

            {/* ── Active Requests Table ────────────────────────────────────── */}
            {/* NOTE: Needs GET /api/v1/requests?requesterId={id} when built */}
            <div
              style={{
                backgroundColor: "#ffffff",
                padding: "32px",
                borderRadius: "20px",
                boxShadow: "0 8px 20px -4px rgba(0,0,0,0.03)",
                border: "2.5px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "24px",
                  paddingBottom: "20px",
                  borderBottom: "1.5px solid #f1f5f9",
                }}
              >
                <div>
                  <h3 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: "900", color: "#0f172a", letterSpacing: "-0.02em" }}>
                    Your Active Requests
                  </h3>
                  <p style={{ margin: "0", fontSize: "13px", color: "#64748b", fontWeight: "500" }}>
                    Monitor donor commitments and mark fulfilled
                  </p>
                </div>
              </div>

              {/* Empty state */}
              <div
                style={{
                  border: "2px dashed #e2e8f0",
                  borderRadius: "16px",
                  padding: "60px 24px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>📋</div>
                <div style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a", marginBottom: "8px" }}>
                  No active requests yet
                </div>
                <div style={{ fontSize: "14px", color: "#64748b", fontWeight: "500", maxWidth: "360px", margin: "0 auto 24px" }}>
                  Post a blood request above to start receiving donor commitments.
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}