import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "./api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(false);
  const [hoveredRegister, setHoveredRegister] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Fields cannot be empty.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      if (response.data.success) {
        navigate("/dashboard", { state: { user: response.data.data } });
      }
    } catch (err) {
      // 1. Handle network/cors errors (no response from server)
      if (!err.response) {
        setError(
          "Network error: Backend is unreachable. Please check your internet connection and try again.",
        );
        return;
      }

      // 2. Extract the SDD-compliant error code and message
      const backendError = err.response.data?.error;
      const errorCode = backendError?.code;
      const errorMessage = backendError?.message || err.response.data?.message;

      // 3. Translate SDD codes into actionable UI messages
      if (errorCode === "AUTH-001" || err.response.status === 401) {
        setError(
          "Incorrect email or password. Please double-check your credentials and try again.",
        );
      } else if (errorCode === "SYS-001" || err.response.status >= 500) {
        setError(
          "We're experiencing technical difficulties on our end. Please try logging in again in a few minutes.",
        );
      } else {
        setError(errorMessage || "Unable to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getInputStyle = (name) => ({
    width: "100%",
    height: "52px",
    padding: "0 16px",
    borderRadius: "12px",
    border: `2.5px solid ${focused === name ? "#D32F2F" : "#e2e8f0"}`,
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    backgroundColor: focused === name ? "#fffafa" : "#f8fafc",
    color: "#0f172a",
    transition: "border-color 0.18s, background-color 0.18s",
  });

  const labelStyle = {
    display: "block",
    fontSize: "11px",
    fontWeight: "800",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.09em",
    marginBottom: "8px",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        fontFamily: '"Inter", sans-serif',
      }}
    >
      {/* ── Left Panel: Branding ─────────────────────────── */}
      <div
        style={{
          width: "42%",
          background: "#D32F2F",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 48px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative rings */}
        {[
          { size: 340, top: "-100px", right: "-100px", opacity: 0.1 },
          { size: 200, bottom: "60px", left: "-60px", opacity: 0.08 },
          { size: 100, bottom: "200px", right: "50px", opacity: 0.12 },
        ].map((c, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: c.size,
              height: c.size,
              borderRadius: "50%",
              border: `3px solid rgba(255,255,255,${c.opacity})`,
              top: c.top,
              bottom: c.bottom,
              left: c.left,
              right: c.right,
            }}
          />
        ))}

        {/* Brand content */}
        <div style={{ position: "relative", textAlign: "center" }}>
          <div
            style={{ fontSize: "64px", marginBottom: "24px", lineHeight: 1 }}
          >
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

          {/* Accent bar */}
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

      {/* ── Right Panel: Form ────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(ellipse at top right, #fff1f2 0%, #ffffff 55%)",
          padding: "40px",
        }}
      >
        <div style={{ width: "100%", maxWidth: "390px" }}>
          {/* Heading */}
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
              Welcome back 👋
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "15px", margin: 0 }}>
              Sign in to continue to your portal.
            </p>
          </div>

          {/* Error banner — UX: specific, actionable, visible */}
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
                marginBottom: "24px",
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

          {/* Form */}
          <form
            onSubmit={handleLogin}
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {/* Email */}
            <div>
              <label style={labelStyle} htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email} // 👈 Added value binding
                placeholder="name@example.com"
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                style={getInputStyle("email")}
              />
            </div>

            {/* Password — UX: show/hide toggle */}
            <div>
              <label style={labelStyle} htmlFor="password">
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password} // 👈 Added value binding
                  placeholder="••••••••"
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  style={{ ...getInputStyle("password"), paddingRight: "48px" }}
                />
                {/* Show / hide toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "16px",
                    color: "#94a3b8",
                    padding: 0,
                    lineHeight: 1,
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              onMouseEnter={() => setHoveredBtn(true)}
              onMouseLeave={() => setHoveredBtn(false)}
              style={{
                height: "54px",
                backgroundColor: loading
                  ? "#cbd5e1"
                  : hoveredBtn
                    ? "#b71c1c"
                    : "#D32F2F",
                color: "#fff",
                border: "none",
                borderRadius: "14px",
                fontSize: "16px",
                fontWeight: "900",
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: "4px",
                boxShadow: loading
                  ? "none"
                  : hoveredBtn
                    ? "0 14px 30px -4px rgba(183,28,28,0.55)"
                    : "0 8px 20px -4px rgba(211,47,47,0.40)",
                transition: "background-color 0.18s, box-shadow 0.18s",
                fontFamily: "inherit",
                letterSpacing: "0.01em",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                width: "100%",
              }}
            >
              {loading ? (
                <>
                  {/* UX: Spinner feedback so user knows something's happening */}
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
                  Signing in…
                </>
              ) : (
                "Sign In →"
              )}
            </button>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </form>

          {/* Divider */}
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

          {/* Register CTA — UX: secondary action clearly visible but not competing */}
          <Link
            to="/register"
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
            Create an Account
          </Link>

          {/* Back to Home */}
          <p style={{ textAlign: "center", marginTop: "22px" }}>
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
