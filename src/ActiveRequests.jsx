import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getMe,
  getRequests,
  getCommitments,
  createCommitment,
  createRequest,
  fulfillRequest,
  getHospitals,
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
  @keyframes modalFadeIn {
    from { opacity: 0; transform: scale(0.96) translateY(10px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes overlayFadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes toastSlideUp {
    from { opacity: 0; transform: translate(-50%, 20px); }
    to   { opacity: 1; transform: translate(-50%, 0); }
  }

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

  .cta-btn {
    background: #ffffff; border: none; border-radius: 12px;
    padding: 14px 28px; font-weight: 900; font-size: 15px; cursor: pointer;
    font-family: inherit; flex-shrink: 0; box-shadow: 0 4px 14px rgba(0,0,0,0.15);
    transition: all 0.22s cubic-bezier(.16,1,.3,1); letter-spacing: -0.01em;
  }
  .cta-btn:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 10px 24px rgba(0,0,0,0.18); }
  .cta-btn:active { transform: scale(0.98); }

  .request-row {
    border: 2px solid #f1f5f9; border-radius: 14px; padding: 20px 24px;
    transition: all 0.18s ease; background: #ffffff;
  }
  .request-row:hover {
    border-color: #e2e8f0;
    box-shadow: 0 6px 20px -4px rgba(0,0,0,0.07);
    transform: translateY(-1px);
  }

  .commit-btn {
    padding: 9px 20px; border-radius: 10px; border: none;
    font-size: 13px; font-weight: 800; cursor: pointer;
    font-family: inherit; transition: all 0.18s ease; white-space: nowrap;
  }
  .commit-btn:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.08); }
  .commit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .fulfill-btn {
    padding: 8px 16px; border-radius: 9px; border: none;
    font-size: 12px; font-weight: 800; cursor: pointer; font-family: inherit;
    transition: all 0.18s ease; white-space: nowrap;
    background: linear-gradient(135deg,#ecfdf5,#d1fae5);
    color: #065f46; border: 1.5px solid #6ee7b7;
  }
  .fulfill-btn:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(0.96); }
  .fulfill-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  .confirm-btn {
    padding: 8px 16px; border-radius: 9px; border: none;
    font-size: 12px; font-weight: 800; cursor: pointer; font-family: inherit;
    transition: all 0.18s ease; white-space: nowrap;
    background: linear-gradient(135deg,#fff7ed,#fed7aa);
    color: #c2410c; border: 1.5px solid #fdba74;
  }
  .confirm-btn:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(0.96); }

  .filter-pill {
    padding: 8px 18px; border-radius: 10px; font-size: 13px; font-weight: 800;
    cursor: pointer; transition: all 0.2s ease; border: 2px solid transparent;
    font-family: inherit;
  }

  .modal-overlay {
    position: fixed; inset: 0; z-index: 1000;
    background: rgba(15,23,42,0.55); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    padding: 24px; animation: overlayFadeIn 0.2s ease;
  }
  .modal-box {
    background: #ffffff; border-radius: 24px; width: 100%; max-width: 520px;
    box-shadow: 0 32px 80px -8px rgba(0,0,0,0.28);
    animation: modalFadeIn 0.25s cubic-bezier(.16,1,.3,1);
    max-height: 90vh; overflow-y: auto;
  }
  .modal-input {
    width: 100%; padding: 11px 14px; border-radius: 10px;
    border: 2px solid #e2e8f0; font-size: 14px; font-family: inherit;
    outline: none; color: #0f172a; background: #f8fafc;
    transition: border-color 0.18s, background 0.18s; box-sizing: border-box;
  }
  .modal-input:focus { border-color: #1D4ED8; background: #f8fbff; }
  .modal-label {
    display: block; font-size: 11px; font-weight: 800; color: #64748b;
    text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 7px;
  }
  .urgency-btn {
    flex: 1; padding: 10px 8px; border-radius: 10px; border: 2px solid #e2e8f0;
    font-size: 12px; font-weight: 800; cursor: pointer; font-family: inherit;
    transition: all 0.18s ease; background: #f8fafc; color: #64748b;
  }
`;

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatBloodType(raw) {
  if (!raw) return "—";
  return raw.replace("_POSITIVE", "+").replace("_NEGATIVE", "−").replace(/_/g, "");
}
function calcEligibility(lastDonationDate) {
  if (!lastDonationDate) return { eligible: true, days: 0 };
  const diffDays = Math.ceil(
    Math.abs(new Date() - new Date(lastDonationDate)) / (1000 * 60 * 60 * 24)
  );
  const remaining = 56 - diffDays;
  return { eligible: remaining <= 0, days: Math.max(remaining, 0) };
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

// ── DONOR: single request row ─────────────────────────────────────────────────
function RequestRowDonor({ request, alreadyCommitted, eligible, daysLeft, onCommit, committing, hasAnyActiveCommitment }) {
  const bt = formatBloodType(request.bloodType);
  const urgencyColor =
    request.urgency === "CRITICAL" ? "#DC2626"
    : request.urgency === "HIGH"   ? "#EA580C"
    : "#16A34A";

  const isBlockedByOtherCommitment = !alreadyCommitted && hasAnyActiveCommitment;
  const isDisabled = alreadyCommitted || committing || !eligible || isBlockedByOtherCommitment;

  const btnLabel = committing        ? "..."
    : alreadyCommitted               ? "✔ Committed"
    : !eligible                      ? `⏳ ${daysLeft}d left`
    : isBlockedByOtherCommitment     ? "Unavailable"
    : "Commit to Donate";

  const btnStyle = {
    background: alreadyCommitted  ? "linear-gradient(135deg,#ecfdf5,#d1fae5)"
      : (!eligible || isBlockedByOtherCommitment) ? "linear-gradient(135deg,#f1f5f9,#e2e8f0)"
      : "linear-gradient(135deg,#E63946,#DC2626)",
    color: alreadyCommitted       ? "#065f46"
      : (!eligible || isBlockedByOtherCommitment) ? "#94a3b8"
      : "#ffffff",
    border: alreadyCommitted      ? "1.5px solid #6ee7b7"
      : (!eligible || isBlockedByOtherCommitment) ? "1.5px solid #cbd5e1"
      : "none",
  };

  const hoverTitle = isBlockedByOtherCommitment 
    ? "You already have an active commitment. Cancel or complete it first." 
    : (!eligible && !alreadyCommitted) 
    ? `Wait ${daysLeft} days to be eligible.` 
    : "";

  return (
    <div className="request-row" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      <div style={{ width: "52px", height: "52px", flexShrink: 0, borderRadius: "14px", background: "linear-gradient(135deg,#fff1f2,#ffe4e6)", border: "2px solid #fecdd3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px", fontWeight: "900", color: "#DC2626" }}>
        {bt}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <span style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a" }}>{request.hospitalName || "Hospital Facility"}</span>
          <span style={{ fontSize: "10px", fontWeight: "800", padding: "2px 8px", borderRadius: "5px", letterSpacing: "0.05em", backgroundColor: urgencyColor + "18", color: urgencyColor, border: `1px solid ${urgencyColor}30` }}>
            {request.urgency || "STANDARD"}
          </span>
        </div>
        <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "500" }}>
          {request.units} unit{request.units !== 1 ? "s" : ""} needed
          {request.notes ? ` · ${request.notes}` : ""}
        </div>
        <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "3px", fontWeight: "500" }}>
          Posted {timeAgo(request.createdAt)}{request.location ? ` · ${request.location}` : ""}
        </div>
      </div>
      <button className="commit-btn" disabled={isDisabled} onClick={() => !isDisabled && onCommit(request.id)} style={btnStyle} title={hoverTitle}>
        {btnLabel}
      </button>
    </div>
  );
}

// ── REQUESTER: single request row ─────────────────────────────────────────────
function RequestRowRequester({ request, onFulfill, fulfilling, confirmingId, onStartConfirm, onCancelConfirm }) {
  const bt          = formatBloodType(request.bloodType);
  const isFulfilled = request.status === "FULFILLED";
  const statusColor = isFulfilled   ? "#16A34A"
    : request.status === "ACTIVE"   ? "#DC2626"
    : "#64748b";
  const isConfirming = confirmingId === request.id;

  const commitCount = request.commitmentCount || 0;
  const unitsNeeded = request.units || 1;
  const hasEnoughDonors = commitCount >= unitsNeeded;

  return (
    <div className="request-row" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      <div style={{ width: "52px", height: "52px", flexShrink: 0, borderRadius: "14px", background: "linear-gradient(135deg,#eff6ff,#dbeafe)", border: "2px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px", fontWeight: "900", color: "#1D4ED8" }}>
        {bt}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a" }}>
            {bt} Blood · {request.units} unit{request.units !== 1 ? "s" : ""}
          </span>
          <span style={{ fontSize: "10px", fontWeight: "800", padding: "2px 8px", borderRadius: "5px", letterSpacing: "0.05em", backgroundColor: statusColor + "18", color: statusColor, border: `1px solid ${statusColor}30` }}>
            {request.status}
          </span>
        </div>
        <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", marginBottom: "4px" }}>📍 {request.hospitalName}</div>
        {request.notes && <div style={{ fontSize: "13px", color: "#94a3b8", fontWeight: "500", marginBottom: "3px" }}>{request.notes}</div>}
        <div style={{ fontSize: "11px", color: "#cbd5e1", fontWeight: "500" }}>Posted {timeAgo(request.createdAt)}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", flexShrink: 0 }}>
        <div style={{ textAlign: "center", padding: "8px 16px", background: "linear-gradient(135deg,#f8fafc,#f1f5f9)", border: "2px solid #e2e8f0", borderRadius: "10px" }}>
          <div style={{ fontSize: "20px", fontWeight: "900", color: "#0f172a", lineHeight: 1 }}>{commitCount}</div>
          <div style={{ fontSize: "10px", color: "#64748b", fontWeight: "700", marginTop: "2px" }}>donor{commitCount !== 1 ? "s" : ""}</div>
        </div>

        {!isFulfilled ? (
          isConfirming ? (
            <div style={{ display: "flex", gap: "6px", flexDirection: "column", alignItems: "flex-end" }}>
              <div style={{ fontSize: "11px", color: "#c2410c", fontWeight: "700", textAlign: "right" }}>Are you sure?</div>
              <div style={{ display: "flex", gap: "6px" }}>
                <button onClick={onCancelConfirm} style={{ padding: "6px 12px", borderRadius: "8px", border: "1.5px solid #e2e8f0", background: "#f8fafc", color: "#64748b", fontWeight: "800", fontSize: "11px", cursor: "pointer", fontFamily: "inherit" }}>
                  No
                </button>
                <button className="confirm-btn" disabled={fulfilling} onClick={() => onFulfill(request.id)}>
                  {fulfilling ? "..." : "✔ Yes, Fulfill"}
                </button>
              </div>
            </div>
          ) : (
            <button 
              className="fulfill-btn" 
              disabled={fulfilling || !hasEnoughDonors} 
              onClick={() => onStartConfirm(request.id)}
              title={!hasEnoughDonors ? `Wait for ${unitsNeeded} donor(s) to commit before fulfilling` : ""}
            >
              ✔ Mark Fulfilled
            </button>
          )
        ) : (
          <span style={{ fontSize: "11px", fontWeight: "800", color: "#16A34A", padding: "4px 10px", borderRadius: "6px", backgroundColor: "#ecfdf5", border: "1.5px solid #6ee7b7" }}>
            ✔ Fulfilled
          </span>
        )}
      </div>
    </div>
  );
}

// ── Post Request Modal ────────────────────────────────────────────────────────
function PostRequestModal({ onClose, onSubmit, submitting, error }) {
  const [form, setForm] = useState({
    bloodType:  "O_POSITIVE",
    units:      1,
    urgency:    "STANDARD",
    notes:      "",
    location:   "Cebu City",
    hospitalId: null,
  });
  const [hospitals,        setHospitals]        = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(true);

  useEffect(() => {
    getHospitals()
      .then((res) => {
        const data = res.data?.data || [];
        setHospitals(data);
        if (data.length > 0) setForm((prev) => ({ ...prev, hospitalId: data[0].id }));
      })
      .catch((err) => console.error("Error fetching hospitals:", err))
      .finally(() => setLoadingHospitals(false));
  }, []);

  const bloodTypes = [
    ["O_POSITIVE","O+"],["O_NEGATIVE","O−"],
    ["A_POSITIVE","A+"],["A_NEGATIVE","A−"],
    ["B_POSITIVE","B+"],["B_NEGATIVE","B−"],
    ["AB_POSITIVE","AB+"],["AB_NEGATIVE","AB−"],
  ];
  const urgencies = [
    { key: "STANDARD", label: "Standard", color: "#16A34A", bg: "#ecfdf5", border: "#6ee7b7" },
    { key: "HIGH",     label: "High",     color: "#EA580C", bg: "#fff7ed", border: "#fdba74" },
    { key: "CRITICAL", label: "Critical", color: "#DC2626", bg: "#fff1f2", border: "#fecdd3" },
  ];

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ padding: "28px 32px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: "900", color: "#0f172a", letterSpacing: "-0.02em" }}>Post Blood Request 🩸</h2>
            <p style={{ margin: 0, fontSize: "13px", color: "#64748b", fontWeight: "500" }}>Notify available donors in Cebu City.</p>
          </div>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: "8px", width: "32px", height: "32px", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
        </div>
        <div style={{ padding: "24px 32px 32px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label className="modal-label">Blood Type Needed</label>
            <select className="modal-input" value={form.bloodType} onChange={(e) => setForm({ ...form, bloodType: e.target.value })}>
              {bloodTypes.map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
            </select>
          </div>
          <div>
            <label className="modal-label">Units Needed</label>
            <input type="number" min="1" max="20" className="modal-input" value={form.units} onChange={(e) => setForm({ ...form, units: Math.max(1, parseInt(e.target.value) || 1) })} />
          </div>
          <div>
            <label className="modal-label">Urgency Level</label>
            <div style={{ display: "flex", gap: "10px" }}>
              {urgencies.map((u) => (
                <button key={u.key} type="button" className="urgency-btn" onClick={() => setForm({ ...form, urgency: u.key })}
                  style={{ background: form.urgency === u.key ? u.bg : "#f8fafc", borderColor: form.urgency === u.key ? u.border : "#e2e8f0", color: form.urgency === u.key ? u.color : "#64748b", transform: form.urgency === u.key ? "translateY(-1px)" : "none", boxShadow: form.urgency === u.key ? `0 4px 12px ${u.color}22` : "none" }}>
                  {u.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="modal-label">Hospital</label>
            <select className="modal-input" value={form.hospitalId ?? ""} onChange={(e) => setForm({ ...form, hospitalId: Number(e.target.value) })} disabled={loadingHospitals}>
              {loadingHospitals ? <option>Loading hospitals...</option> : hospitals.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          </div>
          <div>
            <label className="modal-label">Additional Notes <span style={{ fontWeight: "500", textTransform: "none", letterSpacing: 0, color: "#94a3b8" }}>(optional)</span></label>
            <textarea className="modal-input" placeholder="e.g. For post-op patient, Room 412" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} style={{ resize: "vertical", paddingTop: "10px", lineHeight: "1.5" }} />
          </div>
          {error && <div style={{ backgroundColor: "#fff1f2", border: "2px solid #fecdd3", borderRadius: "10px", padding: "12px 16px", fontSize: "13px", fontWeight: "700", color: "#be123c" }}>⚠ {error}</div>}
          <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
            <button onClick={onClose} style={{ flex: 1, padding: "13px", borderRadius: "12px", border: "2px solid #e2e8f0", background: "#f8fafc", color: "#64748b", fontWeight: "800", fontSize: "14px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.18s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")} onMouseLeave={(e) => (e.currentTarget.style.background = "#f8fafc")}>Cancel</button>
            <button onClick={() => onSubmit(form)} disabled={submitting} style={{ flex: 2, padding: "13px", borderRadius: "12px", border: "none", background: submitting ? "#cbd5e1" : "linear-gradient(135deg,#2563EB 0%,#1D4ED8 50%,#1E40AF 100%)", color: "#fff", fontWeight: "900", fontSize: "14px", cursor: submitting ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "all 0.18s", boxShadow: submitting ? "none" : "0 6px 20px rgba(37,99,235,0.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              {submitting ? (<><span style={{ width: "14px", height: "14px", border: "2.5px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} />Posting...</>) : "Post Request →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN ACTIVE REQUESTS COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function ActiveRequests() {
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
  const { eligible, days: daysLeft } = calcEligibility(user.lastDonationDate);

  const activeNavColor = isDonor ? "#DC2626" : "#1D4ED8";
  const themeBgLight   = isDonor ? "#fff1f2" : "#eff6ff";
  const themeBorder    = isDonor ? "#fecdd3" : "#bfdbfe";
  const accentGrad      = isDonor
    ? "linear-gradient(135deg,#E63946 0%,#DC2626 50%,#B91C1C 100%)"
    : "linear-gradient(135deg,#2563EB 0%,#1D4ED8 50%,#1E40AF 100%)";

  const [toastMessage, setToastMessage] = useState({ text: "", success: true });
  const showToast = (text, success = true) => {
    setToastMessage({ text, success });
    setTimeout(() => setToastMessage({ text: "", success: true }), 4000);
  };

  const [hoveredTab, setHoveredTab] = useState(null);

  const navItems = isDonor
    ? ["Overview", "My Commitments", "Active Requests", "My Profile"]
    : ["Overview", "Active Requests", "Request History", "My Profile"];

  const handleNavClick = (item) => {
    if (item === "Overview")             navigate("/dashboard",   { state: { user } });
    else if (item === "My Commitments")  navigate("/commitments", { state: { user } });
    else if (item === "Request History") navigate("/history",     { state: { user } });
    else if (item === "My Profile")      navigate("/profile",     { state: { user } });
    // Active Requests does nothing — already here
  };

  const [requests,        setRequests]        = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [errorRequests,   setErrorRequests]   = useState("");
  const [urgencyFilter,   setUrgencyFilter]   = useState("ALL");

  const [committedIds, setCommittedIds] = useState(new Set());
  const [committingId, setCommittingId] = useState(null);
  const [fulfillingId, setFulfillingId] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);

  const [showModal,   setShowModal]   = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState("");

  const fetchRequests = useCallback(async () => {
    if (!user.id) return;
    setLoadingRequests(true);
    setErrorRequests("");
    try {
      let res;
      if (isDonor) {
        const params = { status: "ACTIVE" };
        if (user.bloodType && user.bloodType !== "O_NEGATIVE") {
          params.bloodType = user.bloodType;
        }
        res = await getRequests(params);
      } else {
        res = await getRequests({ requesterId: user.id });
      }
      setRequests(res.data?.data ?? res.data ?? []);
    } catch {
      setErrorRequests("Failed to load requests. Please try again.");
    } finally {
      setLoadingRequests(false);
    }
  }, [user.id, user.bloodType, isDonor]);

  const fetchMyCommitments = useCallback(async () => {
    if (!isDonor || !user.id) return;
    try {
      const res  = await getCommitments({ donorId: user.id });
      const list = res.data?.data ?? res.data ?? [];
      const activeList = list.filter(c => c.status === "PENDING" || c.status === "COMPLETED");
      setCommittedIds(new Set(activeList.map((c) => c.requestId ?? c.request?.id)));
    } catch {
      // Non-critical
    }
  }, [user.id, isDonor]);

  useEffect(() => {
    if (user.id) {
      fetchRequests();
      fetchMyCommitments();
    }
  }, [user.id]);

  const handleCommit = async (requestId) => {
    if (!user.id || !eligible) return;
    setCommittingId(requestId);
    try {
      await createCommitment({ requestId });
      setCommittedIds((prev) => new Set([...prev, requestId]));
      navigate("/commitments", { state: { user } });
    } catch (err) {
      const msg = err.response?.data?.message || "Could not commit. Please try again.";
      showToast(msg, false);
    } finally {
      setCommittingId(null);
    }
  };

  const handleStartConfirm  = (requestId) => setConfirmingId(requestId);
  const handleCancelConfirm = () => setConfirmingId(null);

  const handleFulfill = async (requestId) => {
    setFulfillingId(requestId);
    try {
      await fulfillRequest(requestId);
      setRequests((prev) =>
        prev.map((r) => r.id === requestId ? { ...r, status: "FULFILLED" } : r)
      );
      setConfirmingId(null);
      showToast("Request successfully marked as fulfilled! 🎉", true);
    } catch (err) {
      showToast(err.response?.data?.message || "Could not fulfill request. Please try again.", false);
    } finally {
      setFulfillingId(null);
    }
  };

  const handlePostRequest = async (form) => {
    setSubmitting(true);
    setSubmitError("");
    try {
      const payload = {
        bloodType:   form.bloodType,
        units:       form.units,
        urgency:     form.urgency,
        notes:       form.notes   || null,
        location:    form.location || "Cebu City",
        requesterId: user.id,
        hospitalId:  Number(form.hospitalId),
      };
      const res = await createRequest(payload);
      if (res.data?.success || res.status === 201 || res.status === 200) {
        setShowModal(false);
        setSubmitError("");
        await fetchRequests(); 
        showToast("Request successfully posted! 🩸", true);
      } else {
        setSubmitError(res.data?.message || "Failed to post request.");
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Failed to post request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const displayedRequests = requests.filter(r =>
    urgencyFilter === "ALL" ? true : r.urgency === urgencyFilter
  );

  const renderRequestsSection = () => {
    if (loadingRequests) return <Spinner />;
    if (errorRequests)   return <ErrorBanner msg={errorRequests} onRetry={fetchRequests} />;
    if (displayedRequests.length === 0) {
      return isDonor
        ? <EmptyState icon="🏥" title="No matching requests" body="There are currently no active requests matching your selected filter." />
        : <EmptyState icon="📋" title="No matching requests" body="You don't have any requests matching your selected filter." />;
    }

    const hasAnyActiveCommitment = committedIds.size > 0;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {isDonor
          ? displayedRequests.map((r) => (
              <RequestRowDonor
                key={r.id} request={r}
                alreadyCommitted={committedIds.has(r.id)}
                eligible={eligible} daysLeft={daysLeft}
                committing={committingId === r.id}
                onCommit={handleCommit}
                hasAnyActiveCommitment={hasAnyActiveCommitment}
              />
            ))
          : displayedRequests.map((r) => (
              <RequestRowRequester
                key={r.id} request={r}
                onFulfill={handleFulfill}
                fulfilling={fulfillingId === r.id}
                confirmingId={confirmingId}
                onStartConfirm={handleStartConfirm}
                onCancelConfirm={handleCancelConfirm}
              />
            ))
        }
      </div>
    );
  };

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

      {showModal && !isDonor && (
        <PostRequestModal
          onClose={() => { setShowModal(false); setSubmitError(""); }}
          onSubmit={handlePostRequest}
          submitting={submitting}
          error={submitError}
        />
      )}

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
            const isActive = item === "Active Requests";
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
          <div style={{ display: "inline-flex", marginTop: "8px", fontSize: "10px", fontWeight: "800", padding: "4px 10px", borderRadius: "6px", backgroundColor: isDonor ? "#fff1f2" : "#eff6ff", color: isDonor ? "#be123c" : "#1d4ed8", border: `1px solid ${isDonor ? "#ffe4e6" : "#dbeafe"}`, letterSpacing: "0.06em" }}>
            {user.role || ""}
          </div>
        </div>

        <button className="signout-btn" onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}>← Sign Out</button>
      </aside>

      {/* ══ MAIN CONTENT ══ */}
      <main style={{ marginLeft: "280px", padding: "56px", width: "100%", boxSizing: "border-box", position: "relative" }}>

        {/* CHANGED: Replaced the old banner with a clean, header-aligned button */}
        <header className="db-f1" style={{ marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "36px", fontWeight: "900", color: "#0f172a", margin: "0 0 8px", letterSpacing: "-0.03em" }}>
              Active Requests 🚨
            </h1>
            <p style={{ color: "#64748b", fontSize: "16px", margin: "0", fontWeight: "500" }}>
              {isDonor
                ? "Browse emergencies and active requests."
                : "Manage your active blood postings and check donor commitments."}
            </p>
          </div>
          
          {!isDonor && (
            <button 
              className="cta-btn" 
              style={{ background: accentGrad, color: "#ffffff" }} 
              onClick={() => { setSubmitError(""); setShowModal(true); }}
            >
              + Post Blood Request
            </button>
          )}
        </header>

        <div className="db-f2">
          <SectionCard>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", paddingBottom: "20px", borderBottom: "1.5px solid #f1f5f9", flexWrap: "wrap", gap: "16px" }}>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {["ALL", "CRITICAL", "HIGH", "STANDARD"].map(u => (
                  <button key={u} onClick={() => setUrgencyFilter(u)} className="filter-pill" style={{
                    background: urgencyFilter === u ? themeBgLight : "#f8fafc",
                    color: urgencyFilter === u ? activeNavColor : "#64748b",
                    borderColor: urgencyFilter === u ? themeBorder : "transparent"
                  }}>
                    {u === "ALL" ? "All Requests" : u}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {isDonor && user.bloodType && (
                  <span style={{ backgroundColor: user.bloodType === "O_NEGATIVE" ? "#f0fdf4" : "#fff1f2", color: user.bloodType === "O_NEGATIVE" ? "#15803d" : "#be123c", padding: "6px 16px", borderRadius: "10px", fontWeight: "900", fontSize: "14px", border: `2px solid ${user.bloodType === "O_NEGATIVE" ? "#86efac" : "#fecdd3"}` }}>
                    {user.bloodType === "O_NEGATIVE" ? "O− Universal Donor" : `${formatBloodType(user.bloodType)} filter active`}
                  </span>
                )}
                <button onClick={fetchRequests} style={{ background: "none", border: "2px solid #e2e8f0", borderRadius: "10px", padding: "8px 16px", fontSize: "13px", fontWeight: "700", cursor: "pointer", color: "#64748b", fontFamily: "inherit" }}>
                  ↻ Refresh
                </button>
              </div>
            </div>

            {renderRequestsSection()}
          </SectionCard>
        </div>

        {toastMessage.text && (
          <div style={{
            position: "fixed", bottom: "40px", left: "50%", transform: "translateX(-50%)",
            background: "#0f172a", color: "#ffffff", padding: "14px 24px", borderRadius: "14px",
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)", zIndex: 9999,
            display: "flex", alignItems: "center", gap: "12px",
            animation: "toastSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            fontWeight: "600", fontSize: "14px", border: "1px solid #334155",
          }}>
            <span style={{ fontSize: "18px" }}>{toastMessage.success ? "✅" : "⚠️"}</span>
            <span>{toastMessage.text}</span>
            <button onClick={() => setToastMessage({ text: "", success: true })} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", marginLeft: "8px", fontSize: "16px" }}>✕</button>
          </div>
        )}
      </main>
    </div>
  );
}