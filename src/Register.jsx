import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "./api";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes float {
    0%,100% { transform: translateY(0px) rotate(0deg); }
    33%     { transform: translateY(-10px) rotate(-3deg); }
    66%     { transform: translateY(-5px) rotate(2deg); }
  }
  @keyframes pulse-ring {
    0%,100% { opacity: .3; transform: scale(1); }
    50%     { opacity: .55; transform: scale(1.03); }
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

  .rf1 { animation: fadeUp .55s cubic-bezier(.16,1,.3,1) both .05s; }
  .rf2 { animation: fadeUp .55s cubic-bezier(.16,1,.3,1) both .13s; }
  .rf3 { animation: fadeUp .55s cubic-bezier(.16,1,.3,1) both .21s; }
  .rf4 { animation: fadeUp .55s cubic-bezier(.16,1,.3,1) both .29s; }
  .rf5 { animation: fadeUp .55s cubic-bezier(.16,1,.3,1) both .37s; }
  .rf6 { animation: fadeUp .55s cubic-bezier(.16,1,.3,1) both .45s; }

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
    transition: transform .2s cubic-bezier(.34,1.56,.64,1),box-shadow .2s ease;
    cursor: default;
  }
  .pill-feat:hover { transform: scale(1.07) translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,.09); }

  .role-card {
    transition: all .2s cubic-bezier(.34,1.56,.64,1);
    cursor: pointer;
  }
  .role-card:hover { transform: scale(1.02) translateY(-3px); }
  .role-card:active { transform: scale(.99); }

  .btn-primary-r { transition: all .22s cubic-bezier(.16,1,.3,1); }
  .btn-primary-r:hover:not(:disabled) {
    transform: translateY(-2px);
    filter: brightness(1.08);
    box-shadow: 0 18px 40px rgba(0,0,0,.22) !important;
  }
  .btn-primary-r:active:not(:disabled) { transform: scale(.98); }

  .link-signin-r { transition: all .2s ease; }
  .link-signin-r:hover {
    border-color: rgba(37,99,235,.5) !important;
    background-color: rgba(37,99,235,.05) !important;
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(37,99,235,.13) !important;
  }
`;

function LeftPanel() {
  return (
    <div style={{
      width:"44%",height:"100vh",flexShrink:0,
      background:"linear-gradient(145deg,#F8FAFC 0%,#EEF2FF 50%,#F1F5F9 100%)",
      position:"relative",overflow:"hidden",
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      padding:"0 48px",
    }}>
      <div style={{
        position:"absolute",width:"420px",height:"420px",borderRadius:"50%",
        background:"radial-gradient(circle,rgba(220,38,38,.2) 0%,rgba(220,38,38,.07) 50%,transparent 70%)",
        top:"-160px",left:"-160px",filter:"blur(36px)",
        animation:"orb-drift-red 8s ease-in-out infinite",pointerEvents:"none",
      }}/>
      <div style={{
        position:"absolute",width:"500px",height:"500px",borderRadius:"50%",
        background:"radial-gradient(circle,rgba(37,99,235,.17) 0%,rgba(37,99,235,.05) 50%,transparent 70%)",
        bottom:"-180px",right:"-180px",filter:"blur(44px)",
        animation:"orb-drift-blue 10s ease-in-out infinite",pointerEvents:"none",
      }}/>
      <div style={{
        position:"absolute",width:"600px",height:"360px",borderRadius:"50%",
        background:"radial-gradient(ellipse,rgba(255,255,255,.75) 0%,transparent 70%)",
        top:"50%",left:"50%",transform:"translate(-50%,-50%)",pointerEvents:"none",
      }}/>
      {[
        {w:360,h:360,top:"-110px",right:"-110px",c:"rgba(220,38,38,.12)",d:"0s"},
        {w:200,h:200,top:"50px",left:"-60px",c:"rgba(37,99,235,.10)",d:"1.2s"},
        {w:110,h:110,bottom:"80px",right:"70px",c:"rgba(220,38,38,.09)",d:"0.6s"},
        {w:60,h:60,bottom:"200px",left:"100px",c:"rgba(37,99,235,.13)",d:"1.8s"},
      ].map((r,i)=>(
        <div key={i} style={{
          position:"absolute",width:r.w,height:r.h,borderRadius:"50%",
          border:`2px solid ${r.c}`,
          top:r.top,bottom:r.bottom,left:r.left,right:r.right,
          animation:`pulse-ring 5s ease-in-out ${r.d} infinite`,pointerEvents:"none",
        }}/>
      ))}
      <div style={{position:"relative",zIndex:10,textAlign:"center"}}>
        <div className="rf1" style={{
          fontSize:"64px",lineHeight:1,marginBottom:"20px",display:"inline-block",
          filter:"drop-shadow(0 8px 20px rgba(220,38,38,.32))",
          animation:"fadeUp .55s cubic-bezier(.16,1,.3,1) both .05s,float 4s ease-in-out 1s infinite",
        }}>🩸</div>
        <h1 className="rf2" style={{
          fontSize:"clamp(46px,4.5vw,70px)",fontWeight:"900",
          margin:"0 0 8px",letterSpacing:"-0.045em",lineHeight:"1.0",whiteSpace:"nowrap",
        }}>
          <span className="wordmark-blood">Blood</span>
          <span className="wordmark-bound">Bound</span>
        </h1>
        <p className="rf2" style={{
          fontSize:"11px",fontWeight:"700",color:"#94A3B8",
          letterSpacing:"0.18em",marginBottom:"14px",textTransform:"uppercase",
        }}>Blood Donation Platform</p>
        <div className="rf2 divider-grad" style={{width:"60px",height:"3px",borderRadius:"2px",margin:"0 auto 22px"}}/>
        <p className="rf3" style={{
          color:"#334155",fontSize:"14.5px",lineHeight:"1.75",
          maxWidth:"270px",margin:"0 auto 26px",fontWeight:"450",letterSpacing:"-0.01em",
        }}>
          A life-saving bridge connecting donors and requesters
          with patients in{" "}
          <span style={{color:"#DC2626",fontWeight:"700"}}>urgent need</span>.
        </p>
        <div className="rf4" style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:"8px"}}>
          {[
            {label:"💉 Donors",     border:"rgba(220,38,38,.2)"},
            {label:"🏥 Requesters", border:"rgba(37,99,235,.2)"},
            {label:"⚡ Real-time",  border:"rgba(234,179,8,.28)"},
          ].map((p)=>(
            <span key={p.label} className="pill-feat" style={{
              fontSize:"12px",fontWeight:"700",padding:"7px 15px",borderRadius:"50px",
              backgroundColor:"rgba(255,255,255,.62)",color:"#1E293B",
              border:`1.5px solid ${p.border}`,
              backdropFilter:"blur(10px)",WebkitBackdropFilter:"blur(10px)",
              boxShadow:"0 2px 10px rgba(0,0,0,.05),inset 0 1px 0 rgba(255,255,255,.9)",
            }}>{p.label}</span>
          ))}
        </div>
        <div className="rf5" style={{
          display:"flex",alignItems:"center",justifyContent:"center",gap:"16px",marginTop:"26px",
        }}>
          {["🔒 Secure","🕵️ Private","💚 Free"].map((item,i)=>(
            <span key={item} style={{
              fontSize:"11px",color:"#94A3B8",fontWeight:"600",letterSpacing:"0.04em",
              display:"flex",alignItems:"center",gap:"4px",
            }}>
              {item}
              {i<2&&<span style={{color:"#CBD5E1",marginLeft:"16px"}}>·</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function RightPanel({ children }) {
  return (
    <div style={{
      flex:1,height:"100vh",
      display:"flex",alignItems:"center",justifyContent:"center",
      background:"radial-gradient(ellipse at top right,#fff1f2 0%,#ffffff 60%)",
      padding:"0 52px",
      overflowY:"auto",
    }}>
      <div style={{width:"100%",maxWidth:"390px",paddingTop:"8px",paddingBottom:"8px"}}>
        {children}
      </div>
    </div>
  );
}

const labelStyle = {
  display:"block",fontSize:"11px",fontWeight:"800",color:"#64748b",
  textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:"7px",
};

function ErrorBanner({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      display:"flex",alignItems:"flex-start",gap:"10px",
      backgroundColor:"#fff1f2",color:"#be123c",
      padding:"12px 15px",borderRadius:"11px",marginBottom:"18px",
      fontSize:"13px",fontWeight:"700",border:"2px solid #fecdd3",lineHeight:"1.5",
    }}>
      <span style={{fontSize:"14px",flexShrink:0}}>⚠</span>
      <span>{msg}</span>
    </div>
  );
}

function Divider() {
  return (
    <div style={{display:"flex",alignItems:"center",gap:"12px",margin:"20px 0"}}>
      <div style={{flex:1,height:"2px",backgroundColor:"#f1f5f9"}}/>
      <span style={{fontSize:"11px",color:"#cbd5e1",fontWeight:"800",letterSpacing:"0.05em"}}>OR</span>
      <div style={{flex:1,height:"2px",backgroundColor:"#f1f5f9"}}/>
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    bloodType: "O_POSITIVE",
    role: "",
    hospitalOrOrg: "",
    contactNumber: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hoveredRole, setHoveredRole] = useState(null);
  const [focused, setFocused] = useState(null);

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
    const t = {
      ...formData,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      password: formData.password.trim(),
      confirmPassword: formData.confirmPassword.trim(),
      hospitalOrOrg: formData.hospitalOrOrg.trim(),
      contactNumber: formData.contactNumber.trim(),
    };

    if (!t.firstName || !t.lastName || !t.email || !t.password || !t.contactNumber) {
      setError("All required fields must be filled.");
      return;
    }

    const cleanedNum = t.contactNumber.replace(/[\s-]/g, "");
    const phRegex = /^(09|\+639)\d{9}$/;
    if (!phRegex.test(cleanedNum)) {
      setError("Invalid Contact Number. Format must be 09XXXXXXXXX or +639XXXXXXXXX.");
      return;
    }

    if (t.password !== t.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (t.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        fullName: `${t.firstName} ${t.lastName}`,
        email: t.email,
        password: t.password,
        confirmPassword: t.confirmPassword,
        role: t.role,
        contactNumber: cleanedNum,
        ...(t.role === "DONOR" && { bloodType: t.bloodType }),
        ...(t.role === "REQUESTER" && { hospitalOrOrg: t.hospitalOrOrg }),
      };
      const response = await api.post("/auth/register", payload);
      if (response.data.success) {
        // ✅ Save token then navigate
        const { token, ...user } = response.data.data;
        localStorage.setItem("token", token);
        navigate("/dashboard", { state: { user } });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (name) => ({
    width:"100%",height:"46px",padding:"0 13px",
    borderRadius:"10px",
    border:`2px solid ${focused===name?"rgba(220,38,38,.5)":"#e2e8f0"}`,
    fontSize:"14px",outline:"none",boxSizing:"border-box",fontFamily:"inherit",
    backgroundColor:focused===name?"#fffafa":"#f8fafc",
    color:"#0f172a",transition:"border-color .18s,background-color .18s",
  });

  const roles = [
    {
      key:"DONOR",emoji:"💉",title:"I'm a Donor",
      desc:"I want to donate blood and save lives.",
      badge:"DONOR",tags:["Blood Type Tracking","56-Day Cycle"],
      accent:"#DC2626",
      grad:"linear-gradient(135deg,#E63946 0%,#DC2626 50%,#B91C1C 100%)",
      border:"rgba(220,38,38,.25)",
      hoverShadow:"0 12px 32px rgba(220,38,38,.28)",
    },
    {
      key:"REQUESTER",emoji:"🏥",title:"I'm a Requester",
      desc:"I need blood for a patient or facility.",
      badge:"REQUESTER",tags:["Post Requests","Track Fulfillment"],
      accent:"#1D4ED8",
      grad:"linear-gradient(135deg,#2563EB 0%,#1D4ED8 50%,#1E40AF 100%)",
      border:"rgba(37,99,235,.25)",
      hoverShadow:"0 12px 32px rgba(37,99,235,.28)",
    },
  ];

  if (step === 1) {
    return (
      <div style={{height:"100vh",display:"flex",fontFamily:'"Inter",-apple-system,BlinkMacSystemFont,sans-serif',overflow:"hidden"}}>
        <style>{STYLES}</style>
        <LeftPanel/>
        <RightPanel>
          <div className="rf1" style={{marginBottom:"24px"}}>
            <h2 style={{fontSize:"26px",fontWeight:"900",color:"#0f172a",margin:"0 0 5px",letterSpacing:"-0.02em"}}>
              Create an account 🩸
            </h2>
            <p style={{color:"#94a3b8",fontSize:"14px",margin:0}}>Pick your role to get started.</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            {roles.map((r)=>{
              const hov = hoveredRole===r.key;
              return (
                <button
                  key={r.key}
                  className="role-card rf2"
                  onClick={()=>selectRole(r.key)}
                  onMouseEnter={()=>setHoveredRole(r.key)}
                  onMouseLeave={()=>setHoveredRole(null)}
                  style={{
                    background:hov?r.grad:"rgba(255,255,255,.7)",
                    border:`2px solid ${hov?"transparent":r.border}`,
                    borderRadius:"16px",padding:"18px 20px",
                    textAlign:"left",width:"100%",
                    boxShadow:hov?r.hoverShadow:"0 2px 10px rgba(0,0,0,.05)",
                    backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",
                  }}
                >
                  <div style={{display:"flex",alignItems:"center",gap:"14px"}}>
                    <div style={{
                      width:"46px",height:"46px",flexShrink:0,
                      backgroundColor:hov?"rgba(255,255,255,.18)":"rgba(255,255,255,.9)",
                      borderRadius:"12px",display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:"22px",
                      border:hov?"2px solid rgba(255,255,255,.3)":"2px solid rgba(226,232,240,.6)",
                      transition:"all .18s",
                    }}>{r.emoji}</div>
                    <div style={{flex:1}}>
                      <div style={{
                        fontSize:"15.5px",fontWeight:"900",
                        color:hov?"#fff":"#0f172a",
                        marginBottom:"2px",transition:"color .18s",
                      }}>{r.title}</div>
                      <div style={{
                        fontSize:"12.5px",lineHeight:"1.5",
                        color:hov?"rgba(255,255,255,.8)":"#64748b",
                        transition:"color .18s",
                      }}>{r.desc}</div>
                    </div>
                    <div style={{
                      color:hov?"rgba(255,255,255,.9)":r.accent,
                      fontSize:"18px",fontWeight:"900",
                      transform:hov?"translateX(4px)":"translateX(0)",
                      transition:"all .18s",
                    }}>→</div>
                  </div>
                  <div style={{display:"flex",gap:"7px",marginTop:"12px",flexWrap:"wrap"}}>
                    <span style={{
                      fontSize:"11px",fontWeight:"800",padding:"3px 9px",borderRadius:"6px",
                      backgroundColor:hov?"rgba(255,255,255,.22)":"rgba(255,255,255,.9)",
                      color:hov?"#fff":r.accent,
                      border:hov?"1px solid rgba(255,255,255,.3)":`1px solid ${r.border}`,
                      transition:"all .18s",
                    }}>{r.badge}</span>
                    {r.tags.map((tag)=>(
                      <span key={tag} style={{
                        fontSize:"11px",fontWeight:"600",padding:"3px 9px",borderRadius:"6px",
                        backgroundColor:hov?"rgba(255,255,255,.15)":"rgba(248,250,252,.9)",
                        color:hov?"rgba(255,255,255,.85)":"#64748b",
                        border:hov?"1px solid rgba(255,255,255,.2)":"1px solid rgba(226,232,240,.7)",
                        transition:"all .18s",
                      }}>{tag}</span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
          <Divider/>
          <Link
            to="/login"
            className="link-signin-r rf3"
            style={{
              display:"block",textAlign:"center",padding:"13px",
              borderRadius:"13px",border:"2px solid rgba(37,99,235,.22)",
              backgroundColor:"transparent",color:"#1D4ED8",
              fontSize:"14px",fontWeight:"800",textDecoration:"none",
              boxShadow:"0 2px 8px rgba(0,0,0,.04)",letterSpacing:"-0.01em",
            }}
          >Already have an account? Sign In</Link>
          <p className="rf4" style={{textAlign:"center",marginTop:"14px"}}>
            <Link to="/" style={{color:"#94a3b8",fontSize:"12.5px",textDecoration:"none",fontWeight:"600"}}>
              ← Back to Home
            </Link>
          </p>
        </RightPanel>
      </div>
    );
  }

  const isDonor = formData.role === "DONOR";
  const accent  = isDonor ? "#DC2626" : "#1D4ED8";
  const grad    = isDonor
    ? "linear-gradient(135deg,#E63946 0%,#DC2626 50%,#B91C1C 100%)"
    : "linear-gradient(135deg,#2563EB 0%,#1D4ED8 50%,#1E40AF 100%)";

  return (
    <div style={{height:"100vh",display:"flex",fontFamily:'"Inter",-apple-system,BlinkMacSystemFont,sans-serif',overflow:"hidden"}}>
      <style>{STYLES}</style>
      <LeftPanel/>
      <RightPanel>
        <div className="rf1" style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"18px"}}>
          <button
            onClick={()=>{setStep(1);setError("");}}
            style={{
              background:"none",border:"none",cursor:"pointer",
              color:"#94a3b8",fontSize:"13px",fontWeight:"700",
              padding:0,fontFamily:"inherit",
            }}
          >← Back</button>
          <span style={{
            fontSize:"11px",fontWeight:"900",padding:"5px 13px",
            borderRadius:"8px",background:grad,color:"#fff",
            letterSpacing:"0.07em",boxShadow:`0 4px 14px ${accent}44`,
          }}>{isDonor?"💉 DONOR":"🏥 REQUESTER"}</span>
        </div>

        <div className="rf1" style={{marginBottom:"20px"}}>
          <h2 style={{fontSize:"24px",fontWeight:"900",color:"#0f172a",margin:"0 0 4px",letterSpacing:"-0.02em"}}>
            {isDonor?"Donor Registration":"Requester Registration"}
          </h2>
          <p style={{color:"#94a3b8",fontSize:"13.5px",margin:0}}>
            {isDonor
              ?"Your blood type helps us match you with urgent requests."
              :"Register to post blood requests and find donors fast."}
          </p>
        </div>

        <ErrorBanner msg={error}/>

        <form onSubmit={handleRegister} style={{display:"flex",flexDirection:"column",gap:"13px"}}>
          <div className="rf2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
            <div>
              <label style={labelStyle}>First Name</label>
              <input
                type="text" name="firstName" placeholder="Maria"
                value={formData.firstName} onChange={handleChange}
                onFocus={()=>setFocused("firstName")} onBlur={()=>setFocused(null)}
                style={inputStyle("firstName")}
              />
            </div>
            <div>
              <label style={labelStyle}>Last Name</label>
              <input
                type="text" name="lastName" placeholder="Santos"
                value={formData.lastName} onChange={handleChange}
                onFocus={()=>setFocused("lastName")} onBlur={()=>setFocused(null)}
                style={inputStyle("lastName")}
              />
            </div>
          </div>

          <div className="rf2">
            <label style={labelStyle}>Email Address</label>
            <input
              type="email" name="email" placeholder="name@example.com"
              value={formData.email} autoComplete="email" onChange={handleChange}
              onFocus={()=>setFocused("email")} onBlur={()=>setFocused(null)}
              style={inputStyle("email")}
            />
          </div>

          {isDonor && (
            <div className="rf3">
              <label style={labelStyle}>Blood Type</label>
              <select
                name="bloodType" value={formData.bloodType} onChange={handleChange}
                onFocus={()=>setFocused("bloodType")} onBlur={()=>setFocused(null)}
                style={{...inputStyle("bloodType"),padding:"0 13px"}}
              >
                {[
                  ["O_POSITIVE","O+"],["O_NEGATIVE","O−"],
                  ["A_POSITIVE","A+"],["A_NEGATIVE","A−"],
                  ["B_POSITIVE","B+"],["B_NEGATIVE","B−"],
                  ["AB_POSITIVE","AB+"],["AB_NEGATIVE","AB−"],
                ].map(([val,lbl])=>(<option key={val} value={val}>{lbl}</option>))}
              </select>
            </div>
          )}

          {!isDonor && (
            <div className="rf3">
              <label style={labelStyle}>Hospital / Organization</label>
              <input
                type="text" name="hospitalOrOrg" placeholder="e.g. Cebu Doctors' Hospital"
                value={formData.hospitalOrOrg} onChange={handleChange}
                onFocus={()=>setFocused("hospitalOrOrg")} onBlur={()=>setFocused(null)}
                style={inputStyle("hospitalOrOrg")}
              />
            </div>
          )}

          <div className="rf3">
            <label style={labelStyle}>Contact Number</label>
            <input
              type="tel" name="contactNumber" placeholder="e.g. 09123456789"
              value={formData.contactNumber} onChange={handleChange}
              onFocus={()=>setFocused("contactNumber")} onBlur={()=>setFocused(null)}
              style={inputStyle("contactNumber")}
            />
          </div>

          <div className="rf4" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
            <div>
              <label style={labelStyle}>Password</label>
              <input
                type="password" name="password" placeholder="Min. 8 chars"
                value={formData.password} autoComplete="new-password" onChange={handleChange}
                onFocus={()=>setFocused("password")} onBlur={()=>setFocused(null)}
                style={inputStyle("password")}
              />
            </div>
            <div>
              <label style={labelStyle}>Confirm</label>
              <input
                type="password" name="confirmPassword" placeholder="Re-enter"
                value={formData.confirmPassword} autoComplete="new-password" onChange={handleChange}
                onFocus={()=>setFocused("confirmPassword")} onBlur={()=>setFocused(null)}
                style={inputStyle("confirmPassword")}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary-r rf5"
            disabled={loading}
            style={{
              height:"50px",background:loading?"#cbd5e1":grad,
              color:"#fff",border:"none",borderRadius:"13px",
              fontSize:"14.5px",fontWeight:"800",
              cursor:loading?"not-allowed":"pointer",
              marginTop:"2px",
              boxShadow:loading?"none":`0 8px 22px ${accent}44,inset 0 1px 0 rgba(255,255,255,.15)`,
              fontFamily:"inherit",letterSpacing:"-0.02em",
              display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",
              width:"100%",
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
                Creating Account…
              </>
            ):`Register as ${isDonor?"Donor":"Requester"} →`}
          </button>
        </form>

        <Divider/>

        <Link
          to="/login"
          className="link-signin-r rf5"
          style={{
            display:"block",textAlign:"center",padding:"13px",
            borderRadius:"13px",border:"2px solid rgba(37,99,235,.22)",
            backgroundColor:"transparent",color:"#1D4ED8",
            fontSize:"14px",fontWeight:"800",textDecoration:"none",
            boxShadow:"0 2px 8px rgba(0,0,0,.04)",letterSpacing:"-0.01em",
          }}
        >Already have an account? Sign In</Link>
      </RightPanel>
    </div>
  );
}