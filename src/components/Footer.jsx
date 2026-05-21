import { useState } from "react";
import { useLocation } from "react-router-dom";

const HOTLINES = [
  { label: "Philippine Red Cross",     number: "143" },
  { label: "PCSO Blood Program",       number: "(032) 253-0788" },
  { label: "Cebu City Medical Center", number: "(032) 253-1871" },
  { label: "Chong Hua Hospital",       number: "(032) 255-8000" },
];

const QUICK_FACTS = [
  { icon: "🩸", value: "8",      label: "Blood Types Supported" },
  { icon: "🏥", value: "10+",    label: "Partner Hospitals in Cebu" },
  { icon: "⏱️", value: "56-day", label: "Donor Eligibility Cycle" },
];

const MODAL_CONTENT = {
  privacy: {
    title: "Privacy Policy",
    body: (
      <>
        <p>BloodBound is committed to protecting your personal information. This policy outlines how we collect, use, and safeguard your data.</p>
        <h4>Information We Collect</h4>
        <p>We collect your name, email address, blood type, and donation history solely for the purpose of matching donors with blood requests in Cebu City.</p>
        <h4>How We Use Your Information</h4>
        <p>Your data is used to verify donor eligibility, facilitate blood request commitments, and maintain your donation history. We do not sell or share your personal data with third parties.</p>
        <h4>Data Security</h4>
        <p>All passwords are encrypted using BCrypt. Data is transmitted over HTTPS/TLS 1.3. JWT tokens expire after 24 hours to protect your session.</p>
        <h4>Your Rights</h4>
        <p>You may request to view, update, or delete your account data at any time through your Profile page or by contacting the BloodBound team.</p>
        <h4>Contact</h4>
        <p>For privacy concerns, reach out through the platform or contact the CIT-U IT342 G7 development team.</p>
      </>
    ),
  },
  terms: {
    title: "Terms of Use",
    body: (
      <>
        <p>By using BloodBound, you agree to the following terms. Please read them carefully before using the platform.</p>
        <h4>Eligibility</h4>
        <p>BloodBound is intended for use by voluntary blood donors and individuals seeking blood donations in Cebu City. Users must provide accurate personal and medical information.</p>
        <h4>Donor Responsibilities</h4>
        <p>Donors commit to honoring their pledges in good faith. The 56-day eligibility rule must be respected. False commitments may result in account suspension.</p>
        <h4>Requester Responsibilities</h4>
        <p>Requesters must post accurate blood needs. Requests must correspond to genuine medical emergencies or planned procedures. Abuse of the platform is strictly prohibited.</p>
        <h4>Limitations</h4>
        <p>BloodBound is a coordination platform only. It does not provide medical advice, guarantee donor availability, or act as a blood bank or medical institution.</p>
        <h4>Modifications</h4>
        <p>These terms may be updated as the platform evolves. Continued use of BloodBound after changes constitutes acceptance of the revised terms.</p>
      </>
    ),
  },
  about: {
    title: "About BloodBound",
    body: (
      <>
        <p>BloodBound is a localized donor-matching platform designed to connect blood donors with individuals in urgent medical need across Cebu City and surrounding areas.</p>
        <h4>Our Mission</h4>
        <p>To eliminate the chaos of social-media-based blood donation coordination by providing a fast, verified, and structured platform for the Cebu community.</p>
        <h4>How It Works</h4>
        <p>Requesters post blood needs specifying blood type, hospital, and urgency. Eligible donors see compatible requests and commit to donate. Once enough donors commit, the request is marked fulfilled.</p>
        <h4>Eligibility System</h4>
        <p>A built-in 56-day countdown timer ensures donors only commit when medically cleared to donate, following standard donation interval guidelines.</p>
        <h4>Accessibility</h4>
        <p>BloodBound is designed to meet WCAG 2.1 Level AA accessibility standards, with proper color contrast, keyboard navigation support, and screen-reader-friendly markup throughout the platform.</p>
        <h4>Technology</h4>
        <p>Built with Spring Boot (Java) for the backend, React with TypeScript for the web app, and Kotlin Jetpack Compose for the Android mobile app — connected through a RESTful API with PostgreSQL.</p>
        <h4>Developer</h4>
        <p>Developed by Michelle Marie P. Habon as part of IT342 — System Integration and Architecture at Cebu Institute of Technology — University (CIT-U).</p>
      </>
    ),
  },
};

const SIDEBAR_WIDTH = 260;

function Modal({ type, onClose }) {
  if (!type) return null;
  const { title, body } = MODAL_CONTENT[type];

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.35)",
          zIndex: 1000,
          backdropFilter: "blur(2px)",
        }}
      />

      {/* Modal box */}
      <div style={{
        position: "fixed",
        top: "50%",
        left: `calc(50% + ${SIDEBAR_WIDTH / 2}px)`,
        transform: "translate(-50%, -50%)",
        backgroundColor: "#fff",
        borderRadius: "12px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        width: "min(560px, 90vw)",
        maxHeight: "78vh",
        display: "flex",
        flexDirection: "column",
        zIndex: 1001,
        overflow: "hidden",
        fontFamily: "'Inter', sans-serif",
      }}>

        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 24px 18px",
          borderBottom: "1px solid #f0f0f0",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "4px",
              height: "20px",
              background: "#D32F2F",
              borderRadius: "2px",
            }} />
            <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#111" }}>
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#f5f5f5",
              border: "none",
              borderRadius: "6px",
              width: "30px",
              height: "30px",
              cursor: "pointer",
              fontSize: "16px",
              color: "#888",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{
          padding: "20px 24px 24px",
          overflowY: "auto",
          fontSize: "13.5px",
          color: "#555",
          lineHeight: "1.75",
        }}>
          <style>{`
            .bb-modal-body h4 {
              font-size: 13px;
              font-weight: 700;
              color: #222;
              margin: 18px 0 6px;
              text-transform: uppercase;
              letter-spacing: 0.06em;
            }
            .bb-modal-body p {
              margin: 0 0 4px;
            }
          `}</style>
          <div className="bb-modal-body">{body}</div>
        </div>

      </div>
    </>
  );
}

export default function Footer() {
  const location = useLocation();
  const [openModal, setOpenModal] = useState(null); // "privacy" | "terms" | "about" | null

  const hideOn = ["/", "/login", "/register"];
  if (hideOn.includes(location.pathname)) return null;

  const linkStyle = {
    fontSize: "11.5px",
    color: "#c0c0c0",
    textDecoration: "none",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    fontFamily: "'Inter', sans-serif",
  };

  return (
    <>
      <Modal type={openModal} onClose={() => setOpenModal(null)} />

      <footer style={{
        marginLeft: `${SIDEBAR_WIDTH}px`,
        backgroundColor: "#fff",
        borderTop: "1px solid #ebebeb",
        fontFamily: "'Inter', sans-serif",
        padding: "36px 40px 0",
      }}>

        {/* ── TOP: 3-column grid ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 1.2fr 1.2fr",
          gap: "40px",
          alignItems: "start",
          paddingBottom: "28px",
        }}>

          {/* COL 1 — Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <svg width="20" height="24" viewBox="0 0 34 40" fill="none">
                <path d="M17 2C17 2 4 16 4 25C4 32.732 9.925 39 17 39C24.075 39 30 32.732 30 25C30 16 17 2 17 2Z" fill="#D32F2F"/>
                <path d="M17 12C17 12 10 21 10 25C10 28.866 13.134 32 17 32C20.866 32 24 28.866 24 25C24 21 17 12 17 12Z" fill="rgba(255,255,255,0.22)"/>
              </svg>
              <span style={{ fontWeight: "700", fontSize: "16px", letterSpacing: "-0.3px" }}>
                <span style={{ color: "#D32F2F" }}>Blood</span>
                <span style={{ color: "#1565C0" }}>Bound</span>
              </span>
            </div>
            <p style={{
              fontSize: "12.5px",
              color: "#999",
              lineHeight: "1.7",
              margin: "0 0 14px 0",
              maxWidth: "220px",
            }}>
              Connecting blood donors with those in urgent need across Cebu City — fast, verified, and community-driven.
            </p>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "11px",
              color: "#aaa",
              background: "#fafafa",
              border: "1px solid #ebebeb",
              borderRadius: "4px",
              padding: "4px 10px",
            }}>
              📍 Cebu City, Philippines
            </div>
          </div>

          {/* COL 2 — Platform Info */}
          <div>
            <p style={{
              fontSize: "10px",
              fontWeight: "700",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#bbb",
              margin: "0 0 16px 0",
            }}>
              Platform Info
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {QUICK_FACTS.map((f) => (
                <div key={f.label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "15px" }}>{f.icon}</span>
                  <div>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "#333" }}>{f.value}</span>
                    <span style={{ fontSize: "12px", color: "#aaa", marginLeft: "6px" }}>{f.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COL 3 — Hotlines */}
          <div>
            <p style={{
              fontSize: "10px",
              fontWeight: "700",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#bbb",
              margin: "0 0 16px 0",
            }}>
              🚨 Emergency Hotlines
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
              {HOTLINES.map((h) => (
                <div key={h.label}>
                  <div style={{ fontSize: "11px", color: "#bbb", marginBottom: "2px" }}>{h.label}</div>
                  <a
                    href={`tel:${h.number.replace(/[^0-9+]/g, "")}`}
                    style={{ fontSize: "13px", fontWeight: "700", color: "#D32F2F", textDecoration: "none" }}
                  >
                    {h.number}
                  </a>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── BOTTOM BAR ── */}
        <div style={{
          borderTop: "1px solid #f0f0f0",
          padding: "14px 0 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
        }}>
          <p style={{ fontSize: "11.5px", color: "#c0c0c0", margin: 0 }}>
            © {new Date().getFullYear()}{" "}
            <strong style={{ color: "#999", fontWeight: "600" }}>BloodBound</strong>.
            {" "}All rights reserved.
          </p>

          {/* Modal trigger buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {[
              { label: "Privacy Policy", key: "privacy" },
              { label: "Terms of Use",   key: "terms" },
              { label: "About",          key: "about" },
            ].map(({ label, key }, i, arr) => (
              <span key={key} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <button
                  onClick={() => setOpenModal(key)}
                  style={linkStyle}
                  onMouseEnter={e => e.currentTarget.style.color = "#888"}
                  onMouseLeave={e => e.currentTarget.style.color = "#c0c0c0"}
                >
                  {label}
                </button>
                {i < arr.length - 1 && (
                  <span style={{ color: "#e0e0e0", fontSize: "11px" }}>·</span>
                )}
              </span>
            ))}
          </div>
        </div>

      </footer>
    </>
  );
}