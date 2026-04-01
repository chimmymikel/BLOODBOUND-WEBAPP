import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "./api";

export default function Login() {
  const navigate = useNavigate();
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused,      setFocused]      = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Fields cannot be empty."); return; }
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      const data = response.data;

      // ✅ FIXED: Backend always returns { success, data: { token, ...user }, message }
      // No more multi-fallback guessing — clean and direct.
      const token = data?.data?.token;
      if (!token) {
        setError("Login succeeded but no token was returned. Please contact support.");
        return;
      }

      // Strip token out of the user object cleanly
      const { token: _t, ...user } = data.data;

      localStorage.setItem("token", token);
      navigate("/dashboard", { state: { user } });

    } catch (err) {
      if (!err.response) {
        setError("Network error: Backend is unreachable. Please check your connection.");
        return;
      }
      const errorCode    = err.response.data?.error?.code;
      const errorMessage = err.response.data?.error?.message || err.response.data?.message;

      if (errorCode === "AUTH-001" || err.response.status === 401) {
        setError("Incorrect email or password. Please double-check your credentials.");
      } else if (errorCode === "SYS-001" || err.response.status >= 500) {
        setError("We're experiencing technical difficulties. Please try again in a few minutes.");
      } else {
        setError(errorMessage || "Unable to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (name) => ({
    width: "100%",
    height: "48px",
    padding: "0 14px",
    borderRadius: "11px",
    border: `2px solid ${focused === name ? "rgba(220,38,38,0.5)" : "#e2e8f0"}`,
    fontSize: "14.5px",
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
    marginBottom: "7px",
  };

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          33%      { transform: translateY(-10px) rotate(-3deg); }
          66%      { transform: translateY(-5px) rotate(2deg); }
        }
        @keyframes pulse-ring {
          0%,100% { opacity: 0.3; transform: scale(1); }
          50%     { opacity: 0.55; transform: scale(1.03); }
        }
        @keyframes orb-drift-red {
          0%,100% { transform: translate(0,0) scale(1); }
          50%     { transform: translate(24px,-16px) scale(1.06); }
        }
        @keyframes orb-drift-blue {
          0%,100% { transform: translate(0,0) scale(1); }
          50%     { transform: translate(-20px,16px) scale(1.04); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .lf1 { animation: fadeUp .55s cubic-bezier(.16,1,.3,1) both .05s; }
        .lf2 { animation: fadeUp .55s cubic-bezier(.16,1,.3,1) both .13s; }
        .lf3 { animation: fadeUp .55s cubic-bezier(.16,1,.3,1) both .21s; }
        .lf4 { animation: fadeUp .55s cubic-bezier(.16,1,.3,1) both .29s; }
        .lf5 { animation: fadeUp .55s cubic-bezier(.16,1,.3,1) both .37s; }
        .lf6 { animation: fadeUp .55s cubic-bezier(.16,1,.3,1) both .45s; }

        .wordmark-blood {
          background: linear-gradient(135deg,#E63946 0%,#DC2626 50%,#B91C1C 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .wordmark-bound {
          background: linear-gradient(135deg,#1D4ED8 0%,#2563EB 50%,#1E40AF 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .divider-grad {
          background: linear-gradient(90deg,transparent 0%,rgba(220,38,38,.45) 20%,rgba(37,99,235,.45) 80%,transparent 100%);
        }
        .pill-feat {
          transition: transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s ease;
          cursor: default;
        }
        .pill-feat:hover { transform: scale(1.07) translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,.09); }

        .btn-signin { transition: all .22s cubic-bezier(.16,1,.3,1); }
        .btn-signin:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 18px 40px rgba(220,38,38,.36) !important;
        }
        .btn-signin:active:not(:disabled) { transform: scale(.98); }

        .link-create { transition: all .2s ease; }
        .link-create:hover {
          border-color: rgba(37,99,235,.5) !important;
          background-color: rgba(37,99,235,.05) !important;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(37,99,235,.13) !important;
        }
      `}</style>

      {/* ══ LEFT PANEL ══ */}
      <div style={{
        width: "44%", height: "100vh",
        background: "linear-gradient(145deg,#F8FAFC 0%,#EEF2FF 50%,#F1F5F9 100%)",
        position: "relative", overflow: "hidden",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "0 48px", flexShrink: 0,
      }}>
        <div style={{ position:"absolute",width:"420px",height:"420px",borderRadius:"50%", background:"radial-gradient(circle,rgba(220,38,38,.2) 0%,rgba(220,38,38,.07) 50%,transparent 70%)", top:"-160px",left:"-160px",filter:"blur(36px)", animation:"orb-drift-red 8s ease-in-out infinite",pointerEvents:"none" }}/>
        <div style={{ position:"absolute",width:"500px",height:"500px",borderRadius:"50%", background:"radial-gradient(circle,rgba(37,99,235,.17) 0%,rgba(37,99,235,.05) 50%,transparent 70%)", bottom:"-180px",right:"-180px",filter:"blur(44px)", animation:"orb-drift-blue 10s ease-in-out infinite",pointerEvents:"none" }}/>
        <div style={{ position:"absolute",width:"600px",height:"360px",borderRadius:"50%", background:"radial-gradient(ellipse,rgba(255,255,255,.75) 0%,transparent 70%)", top:"50%",left:"50%",transform:"translate(-50%,-50%)",pointerEvents:"none" }}/>
        {[
          {w:360,h:360,top:"-110px",right:"-110px",c:"rgba(220,38,38,.12)",d:"0s"},
          {w:200,h:200,top:"50px",left:"-60px",c:"rgba(37,99,235,.10)",d:"1.2s"},
          {w:110,h:110,bottom:"80px",right:"70px",c:"rgba(220,38,38,.09)",d:"0.6s"},
          {w:60,h:60,bottom:"200px",left:"100px",c:"rgba(37,99,235,.13)",d:"1.8s"},
        ].map((r,i)=>(
          <div key={i} style={{ position:"absolute",width:r.w,height:r.h,borderRadius:"50%", border:`2px solid ${r.c}`, top:r.top,bottom:r.bottom,left:r.left,right:r.right, animation:`pulse-ring 5s ease-in-out ${r.d} infinite`,pointerEvents:"none" }}/>
        ))}

        <div style={{position:"relative",zIndex:10,textAlign:"center"}}>
          <div className="lf1" style={{ fontSize:"64px",lineHeight:1,marginBottom:"20px",display:"inline-block", filter:"drop-shadow(0 8px 20px rgba(220,38,38,.32))", animation:"fadeUp .55s cubic-bezier(.16,1,.3,1) both .05s,float 4s ease-in-out 1s infinite" }}>🩸</div>
          <h1 className="lf2" style={{ fontSize:"clamp(46px,4.5vw,70px)",fontWeight:"900", margin:"0 0 8px",letterSpacing:"-0.045em",lineHeight:"1.0",whiteSpace:"nowrap" }}>
            <span className="wordmark-blood">Blood</span>
            <span className="wordmark-bound">Bound</span>
          </h1>
          <p className="lf2" style={{ fontSize:"11px",fontWeight:"700",color:"#94A3B8", letterSpacing:"0.18em",marginBottom:"14px",textTransform:"uppercase" }}>Blood Donation Platform</p>
          <div className="lf2 divider-grad" style={{width:"60px",height:"3px",borderRadius:"2px",margin:"0 auto 22px"}}/>
          <p className="lf3" style={{ color:"#334155",fontSize:"14.5px",lineHeight:"1.75", maxWidth:"270px",margin:"0 auto 26px",fontWeight:"450",letterSpacing:"-0.01em" }}>
            A life-saving bridge connecting donors and requesters with patients in{" "}
            <span style={{color:"#DC2626",fontWeight:"700"}}>urgent need</span>.
          </p>
          <div className="lf4" style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:"8px"}}>
            {[
              {label:"💉 Donors",     border:"rgba(220,38,38,.2)"},
              {label:"🏥 Requesters", border:"rgba(37,99,235,.2)"},
              {label:"⚡ Real-time",  border:"rgba(234,179,8,.28)"},
            ].map((p)=>(
              <span key={p.label} className="pill-feat" style={{ fontSize:"12px",fontWeight:"700",padding:"7px 15px",borderRadius:"50px", backgroundColor:"rgba(255,255,255,.62)",color:"#1E293B", border:`1.5px solid ${p.border}`, backdropFilter:"blur(10px)",WebkitBackdropFilter:"blur(10px)", boxShadow:"0 2px 10px rgba(0,0,0,.05),inset 0 1px 0 rgba(255,255,255,.9)" }}>{p.label}</span>
            ))}
          </div>
          <div className="lf5" style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:"16px",marginTop:"26px" }}>
            {["🔒 Secure","🕵️ Private","💚 Free"].map((item,i)=>(
              <span key={item} style={{ fontSize:"11px",color:"#94A3B8",fontWeight:"600",letterSpacing:"0.04em", display:"flex",alignItems:"center",gap:"4px" }}>
                {item}
                {i<2&&<span style={{color:"#CBD5E1",marginLeft:"16px"}}>·</span>}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ══ RIGHT PANEL ══ */}
      <div style={{
        flex:1, height:"100vh",
        display:"flex", alignItems:"center", justifyContent:"center",
        background:"radial-gradient(ellipse at top right,#fff1f2 0%,#ffffff 60%)",
        padding:"0 52px",
      }}>
        <div style={{width:"100%",maxWidth:"370px"}}>
          <div className="lf1" style={{marginBottom:"28px"}}>
            <h2 style={{ fontSize:"26px",fontWeight:"900",color:"#0f172a", margin:"0 0 5px",letterSpacing:"-0.02em" }}>Welcome back 👋</h2>
            <p style={{color:"#94a3b8",fontSize:"14px",margin:0}}>Sign in to continue to your portal.</p>
          </div>

          {error && (
            <div className="lf1" style={{
              display:"flex",alignItems:"flex-start",gap:"10px",
              backgroundColor:"#fff1f2",color:"#be123c",
              padding:"12px 15px",borderRadius:"11px",marginBottom:"20px",
              fontSize:"13px",fontWeight:"700",border:"2px solid #fecdd3",lineHeight:"1.5",
            }}>
              <span style={{fontSize:"14px",flexShrink:0}}>⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{display:"flex",flexDirection:"column",gap:"16px"}}>
            <div className="lf2">
              <label style={labelStyle} htmlFor="email">Email Address</label>
              <input
                id="email" type="email" value={email}
                placeholder="name@example.com" autoComplete="email"
                onChange={(e)=>setEmail(e.target.value)}
                onFocus={()=>setFocused("email")} onBlur={()=>setFocused(null)}
                style={inputStyle("email")}
              />
            </div>

            <div className="lf3">
              <label style={labelStyle} htmlFor="password">Password</label>
              <div style={{position:"relative"}}>
                <input
                  id="password"
                  type={showPassword?"text":"password"}
                  value={password} placeholder="••••••••"
                  autoComplete="current-password"
                  onChange={(e)=>setPassword(e.target.value)}
                  onFocus={()=>setFocused("password")} onBlur={()=>setFocused(null)}
                  style={{...inputStyle("password"),paddingRight:"46px"}}
                />
                <button type="button" onClick={()=>setShowPassword(!showPassword)}
                  style={{
                    position:"absolute",right:"13px",top:"50%",transform:"translateY(-50%)",
                    background:"none",border:"none",cursor:"pointer",
                    fontSize:"15px",color:"#94a3b8",padding:0,lineHeight:1,
                  }}
                  aria-label={showPassword?"Hide password":"Show password"}
                >{showPassword?"🙈":"👁️"}</button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-signin lf4"
              disabled={loading}
              style={{
                height:"50px",
                background:loading?"#cbd5e1":"linear-gradient(135deg,#E63946 0%,#DC2626 50%,#B91C1C 100%)",
                color:"#fff",border:"none",borderRadius:"13px",
                fontSize:"14.5px",fontWeight:"800",
                cursor:loading?"not-allowed":"pointer",
                boxShadow:loading?"none":"0 8px 22px rgba(220,38,38,.28),inset 0 1px 0 rgba(255,255,255,.15)",
                fontFamily:"inherit",letterSpacing:"-0.02em",
                display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",
                width:"100%",marginTop:"4px",
              }}
            >
              {loading?(
                <>
                  <span style={{
                    width:"15px",height:"15px",
                    border:"2.5px solid rgba(255,255,255,.3)",
                    borderTopColor:"#fff",borderRadius:"50%",
                    display:"inline-block",animation:"spin .7s linear infinite",
                  }}/>
                  Signing in…
                </>
              ):"Sign In →"}
            </button>
          </form>

          <div className="lf5" style={{display:"flex",alignItems:"center",gap:"12px",margin:"22px 0"}}>
            <div style={{flex:1,height:"2px",backgroundColor:"#f1f5f9"}}/>
            <span style={{fontSize:"11px",color:"#cbd5e1",fontWeight:"800",letterSpacing:"0.05em"}}>OR</span>
            <div style={{flex:1,height:"2px",backgroundColor:"#f1f5f9"}}/>
          </div>

          <Link
            to="/register"
            className="link-create lf5"
            style={{
              display:"block",textAlign:"center",padding:"14px",
              borderRadius:"13px",
              border:"2px solid rgba(37,99,235,.22)",
              backgroundColor:"transparent",
              color:"#1D4ED8",
              fontSize:"14px",fontWeight:"800",textDecoration:"none",
              boxShadow:"0 2px 8px rgba(0,0,0,.04)",
              letterSpacing:"-0.01em",
            }}
          >
            Donor or Requester? Create Account
          </Link>

          <p className="lf6" style={{textAlign:"center",marginTop:"16px"}}>
            <Link to="/" style={{color:"#94a3b8",fontSize:"12.5px",textDecoration:"none",fontWeight:"600"}}>
              ← Back to Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}