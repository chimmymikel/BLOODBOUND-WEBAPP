import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("Overview");
  const [hoveredTab, setHoveredTab] = useState(null);
  const [hoveredLogout, setHoveredLogout] = useState(false);

  // Dynamically get the name of the person who logged in
  const userName = location.state?.user?.fullName || "User";

  const navItems = ["Overview", "Donor Directory", "Active Requests"];

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        fontFamily: '"Inter", sans-serif',
      }}
    >
      {/* ── Sidebar Navigation (Matches Login Branding) ────────────── */}
      <aside
        style={{
          width: "280px",
          background: "#D32F2F",
          padding: "40px 24px",
          position: "fixed",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden", // Keeps rings inside
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
                onClick={() => setActiveTab(item)}
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

        {/* Logout Button */}
        <button
          onClick={() => navigate("/login")}
          onMouseEnter={() => setHoveredLogout(true)}
          onMouseLeave={() => setHoveredLogout(false)}
          style={{
            position: "relative",
            zIndex: 1,
            background: hoveredLogout
              ? "rgba(255,255,255,0.15)"
              : "transparent",
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

      {/* ── Dashboard Content ──────────────────────────────────────── */}
      <main
        style={{
          marginLeft: "280px",
          padding: "56px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <header style={{ marginBottom: "48px" }}>
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
          <p
            style={{
              color: "#64748b",
              fontSize: "16px",
              margin: "0",
              fontWeight: "500",
            }}
          >
            Here is your system overview and real-time alerts.
          </p>
        </header>

        {/* Stats Summary Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "24px",
            marginBottom: "48px",
          }}
        >
          {[
            { label: "Total Donors", val: "1,284" },
            { label: "Active Requests", val: "12" },
            { label: "Units (L)", val: "850" },
            { label: "Lives Saved", val: "2,550" },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                backgroundColor: "#ffffff",
                padding: "24px",
                borderRadius: "16px",
                boxShadow: "0 8px 20px -4px rgba(0,0,0,0.03)",
                border: "2.5px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  color: "#64748b",
                  fontSize: "12px",
                  fontWeight: "800",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: "900",
                  color: "#0f172a",
                  marginTop: "8px",
                  letterSpacing: "-0.02em",
                }}
              >
                {s.val}
              </div>
            </div>
          ))}
        </div>

        {/* Urgent Request Table */}
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
            }}
          >
            <h3
              style={{
                margin: "0",
                fontSize: "22px",
                fontWeight: "900",
                color: "#0f172a",
                letterSpacing: "-0.02em",
              }}
            >
              Urgent Blood Requests
            </h3>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    textAlign: "left",
                    color: "#64748b",
                    fontSize: "12px",
                    fontWeight: "800",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    borderBottom: "2px solid #f1f5f9",
                  }}
                >
                  <th style={{ padding: "0 16px 16px" }}>Facility</th>
                  <th style={{ padding: "0 16px 16px" }}>Blood Type</th>
                  <th style={{ padding: "0 16px 16px" }}>Urgency</th>
                  <th style={{ padding: "0 16px 16px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  style={{
                    borderBottom: "1px solid #f1f5f9",
                    transition: "background-color 0.2s",
                  }}
                >
                  <td
                    style={{
                      padding: "20px 16px",
                      fontWeight: "700",
                      color: "#0f172a",
                    }}
                  >
                    Cebu Doctors' Hospital
                  </td>
                  <td style={{ padding: "20px 16px" }}>
                    <span
                      style={{
                        backgroundColor: "#fee2e2",
                        color: "#D32F2F",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        fontWeight: "900",
                        fontSize: "14px",
                      }}
                    >
                      O+
                    </span>
                  </td>
                  <td style={{ padding: "20px 16px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "#ef4444",
                        fontWeight: "800",
                        fontSize: "14px",
                      }}
                    >
                      <span
                        style={{
                          width: "8px",
                          height: "8px",
                          backgroundColor: "#ef4444",
                          borderRadius: "50%",
                          display: "inline-block",
                        }}
                      />
                      CRITICAL
                    </div>
                  </td>
                  <td style={{ padding: "20px 16px" }}>
                    <button
                      style={{
                        backgroundColor: "#fff1f2",
                        color: "#D32F2F",
                        fontWeight: "800",
                        padding: "8px 16px",
                        borderRadius: "10px",
                        border: "2px solid #fca5a5",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        fontFamily: "inherit",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#D32F2F";
                        e.currentTarget.style.color = "#ffffff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#fff1f2";
                        e.currentTarget.style.color = "#D32F2F";
                      }}
                    >
                      Attend →
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
