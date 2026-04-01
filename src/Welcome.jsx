import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();
  const [hoveredLogin, setHoveredLogin] = useState(false);
  const [hoveredRegister, setHoveredRegister] = useState(false);
  const [hoveredPill, setHoveredPill] = useState(null);

  return (
    <div
      style={{
        height: "100vh",
        background: "linear-gradient(145deg, #F8FAFC 0%, #EEF2FF 50%, #F1F5F9 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33%       { transform: translateY(-12px) rotate(-3deg); }
          66%       { transform: translateY(-6px) rotate(2deg); }
        }
        @keyframes pulse-ring {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(1.03); }
        }
        @keyframes orb-drift-red {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(30px, -20px) scale(1.06); }
        }
        @keyframes orb-drift-blue {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(-25px, 20px) scale(1.04); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .f1 { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both 0.05s; }
        .f2 { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both 0.15s; }
        .f3 { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both 0.25s; }
        .f4 { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both 0.35s; }
        .f5 { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both 0.45s; }
        .f6 { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both 0.55s; }
        .f7 { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both 0.65s; }

        .pill-item {
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
                      box-shadow 0.2s ease,
                      background-color 0.2s ease;
        }
        .pill-item:hover {
          transform: scale(1.07) translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.10);
        }

        .btn-login {
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .btn-login:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 44px rgba(37, 99, 235, 0.38) !important;
        }
        .btn-login:active {
          transform: translateY(0px) scale(0.98);
        }

        .btn-register {
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .btn-register:hover {
          transform: translateY(-2px);
          background-color: rgba(220, 38, 38, 0.06) !important;
          box-shadow: 0 12px 32px rgba(220, 38, 38, 0.16) !important;
        }
        .btn-register:active {
          transform: translateY(0px) scale(0.98);
        }

        .wordmark-blood {
          background: linear-gradient(135deg, #E63946 0%, #DC2626 50%, #B91C1C 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .wordmark-bound {
          background: linear-gradient(135deg, #1D4ED8 0%, #2563EB 50%, #1E40AF 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .divider-line {
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(220, 38, 38, 0.4) 20%,
            rgba(37, 99, 235, 0.4) 80%,
            transparent 100%
          );
        }
      `}</style>

      {/* ── Ambient background orbs ──────────────────── */}
      {/* Red orb — top-left corner */}
      <div
        style={{
          position: "absolute",
          width: "520px",
          height: "520px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(220, 38, 38, 0.18) 0%, rgba(220, 38, 38, 0.06) 50%, transparent 70%)",
          top: "-180px",
          left: "-180px",
          filter: "blur(40px)",
          animation: "orb-drift-red 8s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      {/* Blue orb — bottom-right corner */}
      <div
        style={{
          position: "absolute",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(37, 99, 235, 0.16) 0%, rgba(37, 99, 235, 0.05) 50%, transparent 70%)",
          bottom: "-200px",
          right: "-200px",
          filter: "blur(50px)",
          animation: "orb-drift-blue 10s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      {/* Subtle warm center bloom */}
      <div
        style={{
          position: "absolute",
          width: "700px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(255,255,255,0.7) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Decorative rings ─────────────────────────── */}
      {[
        { w: 400, h: 400, top: "-130px", right: "-130px", color: "rgba(220,38,38,0.12)", delay: "0s" },
        { w: 220, h: 220, top: "60px",   left: "-70px",   color: "rgba(37,99,235,0.10)", delay: "1.2s" },
        { w: 130, h: 130, bottom: "90px", right: "80px",  color: "rgba(220,38,38,0.09)", delay: "0.6s" },
        { w: 70,  h: 70,  bottom: "220px", left: "120px", color: "rgba(37,99,235,0.13)", delay: "1.8s" },
      ].map((r, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: r.w,
            height: r.h,
            borderRadius: "50%",
            border: `2px solid ${r.color}`,
            top: r.top,
            bottom: r.bottom,
            left: r.left,
            right: r.right,
            animation: `pulse-ring 5s ease-in-out ${r.delay} infinite`,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* ── Main content card ────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          position: "relative",
          zIndex: 10,
          padding: "0 24px",
          maxWidth: "560px",
          width: "100%",
        }}
      >

        {/* Status badge */}
        <div
          className="f1"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 14px",
            borderRadius: "50px",
            backgroundColor: "rgba(255,255,255,0.72)",
            border: "1px solid rgba(220,38,38,0.18)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
            marginBottom: "22px",
          }}
        >
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              backgroundColor: "#22C55E",
              boxShadow: "0 0 0 2px rgba(34,197,94,0.25)",
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#475569", letterSpacing: "0.07em" }}>
            PLATFORM LIVE · CONNECT NOW
          </span>
        </div>

        {/* Floating drop */}
        <div
          className="f1"
          style={{
            fontSize: "68px",
            lineHeight: 1,
            marginBottom: "20px",
            display: "inline-block",
            filter: "drop-shadow(0 8px 20px rgba(220,38,38,0.3))",
            animation: "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both 0.05s, float 4s ease-in-out 1.2s infinite",
          }}
        >
          🩸
        </div>

        {/* BloodBound wordmark */}
        <h1
          className="f2"
          style={{
            fontSize: "clamp(52px, 9vw, 88px)",
            fontWeight: "900",
            margin: "0 0 6px",
            letterSpacing: "-0.045em",
            lineHeight: "1.0",
            whiteSpace: "nowrap",
          }}
        >
          <span className="wordmark-blood">Blood</span>
          <span className="wordmark-bound">Bound</span>
        </h1>

        {/* Subtitle */}
        <p
          className="f3"
          style={{
            fontSize: "12px",
            fontWeight: "700",
            color: "#94A3B8",
            letterSpacing: "0.18em",
            marginBottom: "16px",
            textTransform: "uppercase",
          }}
        >
          Blood Donation Platform
        </p>

        {/* Gradient divider */}
        <div
          className="f3 divider-line"
          style={{
            width: "72px",
            height: "3px",
            borderRadius: "2px",
            marginBottom: "20px",
          }}
        />

        {/* Tagline */}
        <p
          className="f4"
          style={{
            color: "#334155",
            fontSize: "16px",
            lineHeight: "1.7",
            maxWidth: "360px",
            margin: "0 0 28px",
            fontWeight: "450",
            letterSpacing: "-0.01em",
          }}
        >
          A life-saving bridge connecting blood donors and requesters
          with patients in{" "}
          <span style={{ color: "#DC2626", fontWeight: "700" }}>urgent need</span>.
        </p>

        {/* Feature pills — glassmorphic */}
        <div
          className="f5"
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "8px",
            marginBottom: "32px",
          }}
        >
          {[
            { label: "💉 Donors",          accent: "rgba(220,38,38,0.08)",  border: "rgba(220,38,38,0.18)" },
            { label: "🏥 Requesters",       accent: "rgba(37,99,235,0.07)",  border: "rgba(37,99,235,0.18)" },
            { label: "⚡ Real-time Alerts", accent: "rgba(234,179,8,0.07)",  border: "rgba(234,179,8,0.22)" },
          ].map((pill, i) => (
            <span
              key={pill.label}
              className="pill-item"
              onMouseEnter={() => setHoveredPill(i)}
              onMouseLeave={() => setHoveredPill(null)}
              style={{
                fontSize: "12.5px",
                fontWeight: "700",
                padding: "8px 16px",
                borderRadius: "50px",
                backgroundColor: hoveredPill === i
                  ? "rgba(255,255,255,0.85)"
                  : "rgba(255,255,255,0.55)",
                color: "#1E293B",
                border: `1.5px solid ${pill.border}`,
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
                cursor: "default",
                letterSpacing: "-0.01em",
              }}
            >
              {pill.label}
            </span>
          ))}
        </div>

        {/* CTA Buttons */}
        <div
          className="f6"
          style={{
            display: "flex",
            gap: "12px",
            width: "100%",
            maxWidth: "440px",
            marginBottom: "20px",
          }}
        >
          {/* Login — blue gradient */}
          <button
            className="btn-login"
            onClick={() => navigate("/login")}
            style={{
              flex: 1,
              height: "52px",
              background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 60%, #1E40AF 100%)",
              color: "#ffffff",
              border: "none",
              borderRadius: "14px",
              fontSize: "14.5px",
              fontWeight: "800",
              cursor: "pointer",
              boxShadow: hoveredLogin
                ? "0 20px 44px rgba(37, 99, 235, 0.38)"
                : "0 8px 24px rgba(37, 99, 235, 0.28), inset 0 1px 0 rgba(255,255,255,0.15)",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
              letterSpacing: "-0.02em",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <span style={{ position: "relative", zIndex: 1 }}>Login to Portal →</span>
          </button>

          {/* Register — red ghost */}
          <button
            className="btn-register"
            onClick={() => navigate("/register")}
            style={{
              flex: 1,
              height: "52px",
              backgroundColor: hoveredRegister ? "rgba(220, 38, 38, 0.06)" : "rgba(255,255,255,0.6)",
              color: "#DC2626",
              border: "2px solid rgba(220, 38, 38, 0.45)",
              borderRadius: "14px",
              fontSize: "14.5px",
              fontWeight: "800",
              cursor: "pointer",
              boxShadow: hoveredRegister
                ? "0 12px 32px rgba(220, 38, 38, 0.16)"
                : "0 2px 10px rgba(0,0,0,0.05)",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
              letterSpacing: "-0.02em",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            Donor or Requester?
          </button>
        </div>

        {/* Trust badges */}
        <div
          className="f7"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          {["🔒 Secure", "🕵️ Private", "💚 Free"].map((item, i) => (
            <span
              key={item}
              style={{
                fontSize: "11px",
                color: "#94A3B8",
                fontWeight: "600",
                letterSpacing: "0.04em",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              {item}
              {i < 2 && (
                <span style={{ color: "#CBD5E1", marginLeft: "16px" }}>·</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}