import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();
  const [hoveredLogin, setHoveredLogin] = useState(false);
  const [hoveredRegister, setHoveredRegister] = useState(false);

  return (
    <div
      style={{
        height: "100vh",
        background: "#D32F2F",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: '"Inter", sans-serif',
        position: "relative",
        overflow: "hidden",
        gap: "0",
      }}
    >
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes pulse-ring {
          0%, 100% { opacity: 0.12; }
          50%       { opacity: 0.22; }
        }
        .f1 { animation: fadeUp 0.5s ease both 0.1s; }
        .f2 { animation: fadeUp 0.5s ease both 0.2s; }
        .f3 { animation: fadeUp 0.5s ease both 0.3s; }
        .f4 { animation: fadeUp 0.5s ease both 0.4s; }
        .f5 { animation: fadeUp 0.5s ease both 0.5s; }
        .f6 { animation: fadeUp 0.5s ease both 0.6s; }
      `}</style>

      {/* Decorative rings */}
      {[
        { w: 480, h: 480, top: "-160px", right: "-160px", delay: "0s" },
        { w: 280, h: 280, top: "40px", left: "-90px", delay: "1s" },
        { w: 160, h: 160, bottom: "80px", right: "60px", delay: "0.5s" },
        { w: 80, h: 80, bottom: "200px", left: "100px", delay: "1.5s" },
      ].map((r, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: r.w,
            height: r.h,
            borderRadius: "50%",
            border: "3px solid rgba(255,255,255,0.15)",
            top: r.top,
            bottom: r.bottom,
            left: r.left,
            right: r.right,
            animation: `pulse-ring 4.5s ease-in-out ${r.delay} infinite`,
            pointerEvents: "none",
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          width: "180px",
          height: "180px",
          borderRadius: "50%",
          backgroundColor: "rgba(255,255,255,0.05)",
          bottom: "60px",
          left: "-50px",
          pointerEvents: "none",
        }}
      />

      {/* ── Main content ─────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          position: "relative",
          gap: "0",
        }}
      >
        {/* Floating drop */}
        <div
          className="f1"
          style={{
            fontSize: "56px",
            lineHeight: 1,
            marginBottom: "16px",
            display: "inline-block",
            animation:
              "fadeUp 0.5s ease both 0.1s, float 3.5s ease-in-out 1s infinite",
          }}
        >
          🩸
        </div>

        {/* BloodBound — one line */}
        <h1
          className="f2"
          style={{
            color: "#ffffff",
            fontSize: "clamp(48px, 8vw, 80px)",
            fontWeight: "900",
            margin: "0 0 14px",
            letterSpacing: "-0.04em",
            lineHeight: "1.0",
            whiteSpace: "nowrap",
          }}
        >
          BloodBound
        </h1>

        {/* Accent bar */}
        <div
          className="f3"
          style={{
            width: "48px",
            height: "5px",
            backgroundColor: "rgba(255,255,255,0.5)",
            borderRadius: "3px",
            marginBottom: "18px",
          }}
        />

        {/* Tagline */}
        <p
          className="f4"
          style={{
            color: "rgba(255,255,255,0.75)",
            fontSize: "16px",
            lineHeight: "1.65",
            maxWidth: "380px",
            margin: "0 0 20px",
            fontWeight: "400",
          }}
        >
          A life-saving bridge connecting blood donors and requesters with
          patients in urgent need.
        </p>

        {/* Feature pills */}
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
          {["💉 Donors", "🏥 Requesters", "⚡ Real-time Alerts"].map((f) => (
            <span
              key={f}
              style={{
                fontSize: "12px",
                fontWeight: "700",
                padding: "7px 14px",
                borderRadius: "50px",
                backgroundColor: "rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.92)",
                border: "1px solid rgba(255,255,255,0.22)",
              }}
            >
              {f}
            </span>
          ))}
        </div>

        {/* Buttons — side by side */}
        <div
          className="f6"
          style={{
            display: "flex",
            gap: "12px",
            width: "100%",
            maxWidth: "480px",
            marginBottom: "16px",
          }}
        >
          {/* Login — solid white */}
          <button
            onClick={() => navigate("/login")}
            onMouseEnter={() => setHoveredLogin(true)}
            onMouseLeave={() => setHoveredLogin(false)}
            style={{
              flex: 1,
              height: "54px",
              backgroundColor: hoveredLogin
                ? "#ffffff"
                : "rgba(255,255,255,0.95)",
              color: hoveredLogin ? "#b71c1c" : "#D32F2F",
              border: "none",
              borderRadius: "16px",
              fontSize: "15px",
              fontWeight: "900",
              cursor: "pointer",
              boxShadow: hoveredLogin
                ? "0 16px 36px rgba(0,0,0,0.28)"
                : "0 8px 20px rgba(0,0,0,0.18)",
              transition: "all 0.18s ease",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
            }}
          >
            Login to Portal →
          </button>

          {/* Register — ghost */}
          <button
            onClick={() => navigate("/register")}
            onMouseEnter={() => setHoveredRegister(true)}
            onMouseLeave={() => setHoveredRegister(false)}
            style={{
              flex: 1,
              height: "54px",
              backgroundColor: hoveredRegister
                ? "rgba(255,255,255,0.15)"
                : "transparent",
              color: "#ffffff",
              border: "2.5px solid rgba(255,255,255,0.6)",
              borderRadius: "16px",
              fontSize: "15px",
              fontWeight: "900",
              cursor: "pointer",
              transition: "all 0.18s ease",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
            }}
          >
            Donor or Requester?
          </button>
        </div>

        {/* Trust note */}
        <p
          className="f6"
          style={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.4)",
            fontWeight: "600",
            letterSpacing: "0.06em",
            margin: 0,
          }}
        >
          🔒 SECURE · PRIVATE · FREE TO USE
        </p>
      </div>
    </div>
  );
}
