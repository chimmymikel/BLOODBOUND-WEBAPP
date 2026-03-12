import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "./api";

function LeftPanel() {
  return (
    <div
      style={{
        width: "42%",
        minHeight: "100vh",
        background: "#D32F2F",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 48px",
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: "340px",
          height: "340px",
          borderRadius: "50%",
          border: "3px solid rgba(255,255,255,0.1)",
          top: "-100px",
          right: "-100px",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          border: "3px solid rgba(255,255,255,0.1)",
          bottom: "60px",
          left: "-60px",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          backgroundColor: "rgba(255,255,255,0.06)",
          bottom: "200px",
          right: "50px",
        }}
      />
      <div style={{ position: "relative", textAlign: "center" }}>
        <div style={{ fontSize: "64px", marginBottom: "24px", lineHeight: 1 }}>
          🩸
        </div>
        <h1
          style={{
            color: "#ffffff",
            fontSize: "46px",
            fontWeight: "900",
            margin: "0 0 16px",
            letterSpacing: "-0.04em",
            lineHeight: "1.05",
          }}
        >
          BLOOD
          <br />
          BOUND
        </h1>
        <div
          style={{
            width: "44px",
            height: "5px",
            background: "rgba(255,255,255,0.5)",
            borderRadius: "3px",
            margin: "0 auto 20px",
          }}
        />
        <p
          style={{
            color: "rgba(255,255,255,0.72)",
            fontSize: "15px",
            lineHeight: "1.65",
            maxWidth: "210px",
            margin: "0 auto",
            fontWeight: "500",
          }}
        >
          A bridge between life-savers and those in urgent need.
        </p>
      </div>
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    bloodType: "O_POSITIVE",
    role: "",
    hospitalOrOrg: "",
    contactNumber: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hoveredRole, setHoveredRole] = useState(null);
  const [hoveredRegister, setHoveredRegister] = useState(false);

  // ✅ Functional updater — no stale closure
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const selectRole = (role) => {
    setFormData((prev) => ({ ...prev, role }));
    setStep(2);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // ✅ Trim all string fields before validating
    const trimmed = {
      ...formData,
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      password: formData.password.trim(),
      confirmPassword: formData.confirmPassword.trim(),
      hospitalOrOrg: formData.hospitalOrOrg.trim(),
      contactNumber: formData.contactNumber.trim(),
    };

    if (!trimmed.email || !trimmed.password || !trimmed.fullName) {
      setError("All fields are required.");
      return;
    }
    if (trimmed.password !== trimmed.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (trimmed.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        fullName: trimmed.fullName,
        email: trimmed.email,
        password: trimmed.password,
        role: trimmed.role,
        ...(trimmed.role === "DONOR" && { bloodType: trimmed.bloodType }),
        ...(trimmed.role === "REQUESTER" && {
          hospitalOrOrg: trimmed.hospitalOrOrg,
          contactNumber: trimmed.contactNumber,
        }),
      };
      const response = await api.post("/auth/register", payload);
      if (response.data.success) {
        navigate("/dashboard", { state: { user: response.data.data } });
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    height: "52px",
    padding: "0 16px",
    borderRadius: "12px",
    border: "2.5px solid #e2e8f0",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    transition: "border-color 0.18s, background-color 0.18s",
  };

  const labelStyle = {
    display: "block",
    fontSize: "11px",
    fontWeight: "800",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.09em",
    marginBottom: "8px",
  };

  const roles = [
    {
      key: "DONOR",
      emoji: "💉",
      title: "I'm a Donor",
      desc: "I want to donate blood and save lives.",
      badge: "DONOR",
      tags: ["Blood Type Tracking", "56-Day Cycle"],
      defaultBg: "#fff1f2",
      defaultBorder: "#fca5a5",
      hoverBg: "#D32F2F",
      hoverBorder: "#D32F2F",
      hoverTextColor: "#ffffff",
      badgeBg: "#fee2e2",
      badgeColor: "#D32F2F",
      hoverBadgeBg: "rgba(255,255,255,0.2)",
      hoverBadgeColor: "#ffffff",
      iconBg: "#ffffff",
      hoverIconBg: "rgba(255,255,255,0.15)",
      shadow: "0 6px 20px rgba(211,47,47,0.25)",
    },
    {
      key: "REQUESTER",
      emoji: "🏥",
      title: "I'm a Requester",
      desc: "I need blood for a patient or facility.",
      badge: "REQUESTER",
      tags: ["Post Requests", "Track Fulfillment"],
      defaultBg: "#eff6ff",
      defaultBorder: "#93c5fd",
      hoverBg: "#1d4ed8",
      hoverBorder: "#1d4ed8",
      hoverTextColor: "#ffffff",
      badgeBg: "#dbeafe",
      badgeColor: "#1d4ed8",
      hoverBadgeBg: "rgba(255,255,255,0.2)",
      hoverBadgeColor: "#ffffff",
      iconBg: "#ffffff",
      hoverIconBg: "rgba(255,255,255,0.15)",
      shadow: "0 6px 20px rgba(29,78,216,0.25)",
    },
  ];

  const rightPanelStyle = {
    flex: 1,
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "radial-gradient(ellipse at top right, #fff1f2 0%, #ffffff 55%)",
    padding: "40px",
    overflowY: "auto",
  };

  // ── STEP 1: Role Picker ────────────────────────────────────────────
  if (step === 1) {
    return (
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          fontFamily: '"Inter", sans-serif',
        }}
      >
        <LeftPanel />
        <div style={rightPanelStyle}>
          <div style={{ width: "100%", maxWidth: "400px" }}>
            <div style={{ marginBottom: "32px" }}>
              <h2
                style={{
                  fontSize: "28px",
                  fontWeight: "900",
                  color: "#0f172a",
                  margin: "0 0 6px",
                  letterSpacing: "-0.02em",
                }}
              >
                Create an account 🩸
              </h2>
              <p style={{ color: "#94a3b8", fontSize: "15px", margin: 0 }}>
                Pick your role to get started.
              </p>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              {roles.map((r) => {
                const isHovered = hoveredRole === r.key;
                return (
                  <button
                    key={r.key}
                    onClick={() => selectRole(r.key)}
                    onMouseEnter={() => setHoveredRole(r.key)}
                    onMouseLeave={() => setHoveredRole(null)}
                    style={{
                      background: isHovered ? r.hoverBg : r.defaultBg,
                      border: `3px solid ${isHovered ? r.hoverBorder : r.defaultBorder}`,
                      borderRadius: "20px",
                      padding: "22px",
                      cursor: "pointer",
                      textAlign: "left",
                      boxShadow: isHovered ? r.shadow : "none",
                      transition: "all 0.18s ease",
                      width: "100%",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                      }}
                    >
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          flexShrink: 0,
                          backgroundColor: isHovered ? r.hoverIconBg : r.iconBg,
                          borderRadius: "13px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "22px",
                          transition: "background 0.18s",
                          border: isHovered
                            ? "2px solid rgba(255,255,255,0.25)"
                            : "2px solid transparent",
                        }}
                      >
                        {r.emoji}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: "17px",
                            fontWeight: "900",
                            color: isHovered ? r.hoverTextColor : "#0f172a",
                            marginBottom: "3px",
                            transition: "color 0.18s",
                          }}
                        >
                          {r.title}
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            lineHeight: "1.5",
                            color: isHovered
                              ? "rgba(255,255,255,0.8)"
                              : "#64748b",
                            transition: "color 0.18s",
                          }}
                        >
                          {r.desc}
                        </div>
                      </div>
                      <div
                        style={{
                          color: isHovered
                            ? "rgba(255,255,255,0.9)"
                            : r.badgeColor,
                          fontSize: "18px",
                          fontWeight: "900",
                          transition: "color 0.18s, transform 0.18s",
                          transform: isHovered
                            ? "translateX(4px)"
                            : "translateX(0)",
                        }}
                      >
                        →
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        marginTop: "14px",
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "800",
                          padding: "4px 10px",
                          borderRadius: "7px",
                          backgroundColor: isHovered
                            ? r.hoverBadgeBg
                            : r.badgeBg,
                          color: isHovered ? r.hoverBadgeColor : r.badgeColor,
                          border: isHovered
                            ? "1px solid rgba(255,255,255,0.3)"
                            : "1px solid transparent",
                          transition: "all 0.18s",
                        }}
                      >
                        {r.badge}
                      </span>
                      {r.tags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            fontSize: "11px",
                            fontWeight: "600",
                            padding: "4px 10px",
                            borderRadius: "7px",
                            backgroundColor: isHovered
                              ? "rgba(255,255,255,0.15)"
                              : "#ffffff",
                            color: isHovered
                              ? "rgba(255,255,255,0.85)"
                              : "#64748b",
                            border: isHovered
                              ? "1px solid rgba(255,255,255,0.2)"
                              : "1px solid #e2e8f0",
                            transition: "all 0.18s",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                margin: "28px 0",
              }}
            >
              <div
                style={{ flex: 1, height: "2px", backgroundColor: "#f1f5f9" }}
              />
              <span
                style={{
                  fontSize: "12px",
                  color: "#cbd5e1",
                  fontWeight: "800",
                  letterSpacing: "0.05em",
                }}
              >
                OR
              </span>
              <div
                style={{ flex: 1, height: "2px", backgroundColor: "#f1f5f9" }}
              />
            </div>

            <Link
              to="/login"
              onMouseEnter={() => setHoveredRegister(true)}
              onMouseLeave={() => setHoveredRegister(false)}
              style={{
                display: "block",
                textAlign: "center",
                padding: "15px",
                borderRadius: "14px",
                border: `3px solid ${hoveredRegister ? "#D32F2F" : "#fca5a5"}`,
                backgroundColor: hoveredRegister ? "#D32F2F" : "#fff1f2",
                color: hoveredRegister ? "#ffffff" : "#D32F2F",
                fontSize: "15px",
                fontWeight: "800",
                textDecoration: "none",
                transition: "all 0.18s ease",
              }}
            >
              Sign In Instead
            </Link>

            <p style={{ textAlign: "center", marginTop: "20px" }}>
              <Link
                to="/"
                style={{
                  color: "#94a3b8",
                  fontSize: "13px",
                  textDecoration: "none",
                  fontWeight: "600",
                }}
              >
                ← Back to Home
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── STEP 2: Registration Form ──────────────────────────────────────
  const isDonor = formData.role === "DONOR";
  const accent = isDonor ? "#D32F2F" : "#1d4ed8";
  const accentText = isDonor ? "#D32F2F" : "#1d4ed8";

  const focusInput = (e) => {
    e.target.style.borderColor = accent;
    e.target.style.backgroundColor = "#fffafa";
  };
  const blurInput = (e) => {
    e.target.style.borderColor = "#e2e8f0";
    e.target.style.backgroundColor = "#f8fafc";
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: '"Inter", sans-serif',
      }}
    >
      <LeftPanel />
      <div style={rightPanelStyle}>
        <div style={{ width: "100%", maxWidth: "400px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "24px",
            }}
          >
            <button
              onClick={() => {
                setStep(1);
                setError("");
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#94a3b8",
                fontSize: "14px",
                fontWeight: "700",
                padding: "0",
                fontFamily: "inherit",
              }}
            >
              ← Back
            </button>
            <span
              style={{
                fontSize: "11px",
                fontWeight: "900",
                padding: "5px 13px",
                borderRadius: "8px",
                backgroundColor: accent,
                color: "#ffffff",
                letterSpacing: "0.07em",
              }}
            >
              {isDonor ? "💉 DONOR" : "🏥 REQUESTER"}
            </span>
          </div>

          <h2
            style={{
              fontSize: "28px",
              fontWeight: "900",
              color: "#0f172a",
              margin: "0 0 6px",
              letterSpacing: "-0.02em",
            }}
          >
            {isDonor ? "Donor Registration" : "Requester Registration"}
          </h2>
          <p
            style={{ color: "#94a3b8", fontSize: "15px", marginBottom: "28px" }}
          >
            {isDonor
              ? "Your blood type helps us match you with urgent requests."
              : "Register to post blood requests and find donors fast."}
          </p>

          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                backgroundColor: "#fff1f2",
                color: "#be123c",
                padding: "13px 16px",
                borderRadius: "12px",
                marginBottom: "20px",
                fontSize: "13px",
                fontWeight: "700",
                border: "2px solid #fecdd3",
                lineHeight: "1.5",
              }}
            >
              <span style={{ fontSize: "15px", flexShrink: 0 }}>⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form
            onSubmit={handleRegister}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                name="fullName"
                placeholder="e.g. Anna Mar"
                value={formData.fullName}
                onChange={handleChange}
                onFocus={focusInput}
                onBlur={blurInput}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="name@example.com"
                value={formData.email}
                autoComplete="email"
                onChange={handleChange}
                onFocus={focusInput}
                onBlur={blurInput}
                style={inputStyle}
              />
            </div>

            {isDonor && (
              <div>
                <label style={labelStyle}>Blood Type</label>
                <select
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleChange}
                  onFocus={focusInput}
                  onBlur={blurInput}
                  style={{ ...inputStyle, padding: "0 16px" }}
                >
                  {[
                    ["O_POSITIVE", "O+"],
                    ["O_NEGATIVE", "O−"],
                    ["A_POSITIVE", "A+"],
                    ["A_NEGATIVE", "A−"],
                    ["B_POSITIVE", "B+"],
                    ["B_NEGATIVE", "B−"],
                    ["AB_POSITIVE", "AB+"],
                    ["AB_NEGATIVE", "AB−"],
                  ].map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {!isDonor && (
              <>
                <div>
                  <label style={labelStyle}>Hospital / Organization</label>
                  <input
                    type="text"
                    name="hospitalOrOrg"
                    placeholder="e.g. Cebu Doctors' Hospital"
                    value={formData.hospitalOrOrg}
                    onChange={handleChange}
                    onFocus={focusInput}
                    onBlur={blurInput}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Contact Number</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    placeholder="+63 9XX XXX XXXX"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    onFocus={focusInput}
                    onBlur={blurInput}
                    style={inputStyle}
                  />
                </div>
              </>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <div>
                <label style={labelStyle}>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Min. 8 chars"
                  value={formData.password}
                  autoComplete="new-password"
                  onChange={handleChange}
                  onFocus={focusInput}
                  onBlur={blurInput}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Confirm</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter"
                  value={formData.confirmPassword}
                  autoComplete="new-password"
                  onChange={handleChange}
                  onFocus={focusInput}
                  onBlur={blurInput}
                  style={inputStyle}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              onMouseEnter={(e) =>
                !loading && (e.currentTarget.style.filter = "brightness(1.1)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.filter = "brightness(1)")
              }
              style={{
                height: "54px",
                backgroundColor: loading ? "#cbd5e1" : accent,
                color: "white",
                border: "none",
                borderRadius: "14px",
                fontSize: "16px",
                fontWeight: "900",
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: "4px",
                boxShadow: loading ? "none" : `0 8px 20px -4px ${accent}66`,
                transition: "filter 0.18s",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                width: "100%",
              }}
            >
              {loading ? (
                <>
                  <span
                    style={{
                      width: "16px",
                      height: "16px",
                      border: "2.5px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#ffffff",
                      borderRadius: "50%",
                      display: "inline-block",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                  Creating Account…
                </>
              ) : (
                `Register as ${isDonor ? "Donor" : "Requester"} →`
              )}
            </button>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </form>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              margin: "24px 0",
            }}
          >
            <div
              style={{ flex: 1, height: "2px", backgroundColor: "#f1f5f9" }}
            />
            <span
              style={{
                fontSize: "12px",
                color: "#cbd5e1",
                fontWeight: "800",
                letterSpacing: "0.05em",
              }}
            >
              OR
            </span>
            <div
              style={{ flex: 1, height: "2px", backgroundColor: "#f1f5f9" }}
            />
          </div>

          <Link
            to="/login"
            onMouseEnter={() => setHoveredRegister(true)}
            onMouseLeave={() => setHoveredRegister(false)}
            style={{
              display: "block",
              textAlign: "center",
              padding: "15px",
              borderRadius: "14px",
              border: `3px solid ${hoveredRegister ? "#D32F2F" : "#fca5a5"}`,
              backgroundColor: hoveredRegister ? "#D32F2F" : "#fff1f2",
              color: hoveredRegister ? "#ffffff" : accentText,
              fontSize: "15px",
              fontWeight: "800",
              textDecoration: "none",
              transition: "all 0.18s ease",
            }}
          >
            Already have an account? Sign In
          </Link>

          <p style={{ textAlign: "center", marginTop: "20px" }}>
            <Link
              to="/"
              style={{
                color: "#94a3b8",
                fontSize: "13px",
                textDecoration: "none",
                fontWeight: "600",
              }}
            >
              ← Back to Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
