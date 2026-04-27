import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

const API = "http://localhost:5001/api";

function InputField({ label, type, value, onChange, placeholder, icon: Icon, error, rightElement }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "0.8rem", color: "#94a3b8", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</label>
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#475569", pointerEvents: "none" }}>
          <Icon style={{ width: 15, height: 15 }} />
        </div>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="dark-input"
          style={{ paddingLeft: 40, paddingRight: rightElement ? 44 : 14, width: "100%", boxSizing: "border-box",
            border: error ? "1px solid rgba(244,63,94,0.5)" : undefined }}
          autoComplete={type === "password" ? "current-password" : type === "email" ? "email" : "off"}
        />
        {rightElement && (
          <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}>{rightElement}</div>
        )}
      </div>
      {error && <p style={{ color: "#f43f5e", fontSize: "0.72rem", marginTop: 5 }}>{error}</p>}
    </div>
  );
}

export default function AuthPage({ onAuth, onGuest }) {
  const [tab,      setTab]      = useState("login");   // "login" | "register"
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");
  const [fieldErr, setFieldErr] = useState({});

  const reset = () => { setError(""); setSuccess(""); setFieldErr({}); };

  const switchTab = (t) => {
    setTab(t);
    reset();
    setName(""); setEmail(""); setPassword(""); setConfirm(""); setShowPw(false);
  };

  const validate = () => {
    const e = {};
    if (tab === "register" && !name.trim()) e.name = "Name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Minimum 6 characters";
    if (tab === "register" && password !== confirm) e.confirm = "Passwords do not match";
    setFieldErr(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    reset();
    if (!validate()) return;
    setLoading(true);
    try {
      const endpoint = tab === "login" ? "/auth/login" : "/auth/register";
      const body     = tab === "login" ? { email, password } : { name, email, password };
      const res  = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong"); return; }
      setSuccess(tab === "register" ? "Account created!" : "Welcome back!");
      setTimeout(() => onAuth(data.user, data.token), 600);
    } catch {
      setError("Cannot reach server. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const pwToggle = (
    <button type="button" onClick={() => setShowPw(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", color: "#475569", padding: 0, display: "flex", alignItems: "center" }}>
      {showPw ? <EyeOff style={{ width: 14, height: 14 }} /> : <Eye style={{ width: 14, height: 14 }} />}
    </button>
  );

  const PERKS = ["14 AI risk factors analysed", "3-tier investment blueprint", "12-month savings roadmap", "Save & compare reports"];

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative" }}>
      {/* Ambient glow */}
      <div style={{ position: "fixed", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,0.12),transparent 70%)", pointerEvents: "none", filter: "blur(60px)" }} />

      <div style={{ display: "flex", gap: 0, width: "100%", maxWidth: 900, borderRadius: 28, overflow: "hidden", boxShadow: "0 48px 120px rgba(0,0,0,0.7),0 0 0 1px rgba(255,255,255,0.06)", position: "relative", zIndex: 1 }}>

        {/* ── Left panel — branding ──────────────────────── */}
        <div style={{ flex: "0 0 340px", background: "linear-gradient(145deg,#3b0764,#1e1b4b 40%,#0a0014)", padding: "52px 40px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
          {/* Grid dots bg */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(124,58,237,0.18) 1px,transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#7c3aed,#6d28d9)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(124,58,237,0.5)" }}>
                <ShieldCheck style={{ width: 20, height: 20, color: "white" }} />
              </div>
              <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.15rem", color: "white" }}>SafetyNet<span style={{ color: "#a78bfa" }}>.ai</span></span>
            </div>
            <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.9rem", lineHeight: 1.15, letterSpacing: "-0.03em", color: "white", marginBottom: 14 }}>Your financial safety net starts here.</h2>
            <p style={{ color: "rgba(167,139,250,0.8)", fontSize: "0.88rem", lineHeight: 1.7, marginBottom: 36 }}>Create a free account to save reports, track progress, and compare analyses over time.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {PERKS.map((p, i) => (
                <motion.div key={p} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.07 }} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <CheckCircle2 style={{ width: 14, height: 14, color: "#10b981", flexShrink: 0 }} />
                  <span style={{ color: "rgba(226,232,240,0.75)", fontSize: "0.82rem" }}>{p}</span>
                </motion.div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 20 }} />
            <p style={{ color: "rgba(100,116,139,0.8)", fontSize: "0.72rem" }}>No financial data is stored on our servers. All calculations happen locally.</p>
          </div>
        </div>

        {/* ── Right panel — form ─────────────────────────── */}
        <div style={{ flex: 1, background: "rgba(9,9,15,0.97)", backdropFilter: "blur(32px)", padding: "52px 44px" }}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 40, background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: 4 }}>
            {[["login", "Sign In"], ["register", "Create Account"]].map(([t, label]) => (
              <button key={t} onClick={() => switchTab(t)}
                style={{ flex: 1, padding: "10px 0", borderRadius: 9, border: "none", cursor: "pointer", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.85rem", transition: "all 0.25s",
                  background: tab === t ? "linear-gradient(135deg,#7c3aed,#6d28d9)" : "transparent",
                  color:      tab === t ? "white" : "#94a3b8",
                  boxShadow:  tab === t ? "0 4px 16px rgba(124,58,237,0.35)" : "none",
                }}>{label}</button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.5rem", color: "#f1f5f9", marginBottom: 6, letterSpacing: "-0.02em" }}>
                {tab === "login" ? "Welcome back" : "Create your account"}
              </h3>
              <p style={{ color: "#475569", fontSize: "0.85rem", marginBottom: 32 }}>
                {tab === "login" ? "Sign in to access your saved analyses." : "Join thousands of Indians securing their financial future."}
              </p>

              {tab === "register" && (
                <InputField label="Full Name" type="text" value={name} onChange={setName} placeholder="Rohan Mehta" icon={User} error={fieldErr.name} />
              )}
              <InputField label="Email Address" type="email" value={email} onChange={setEmail} placeholder="you@email.com" icon={Mail} error={fieldErr.email} />
              <InputField label="Password" type={showPw ? "text" : "password"} value={password} onChange={setPassword} placeholder="Min. 6 characters" icon={Lock} error={fieldErr.password} rightElement={pwToggle} />
              {tab === "register" && (
                <InputField label="Confirm Password" type={showPw ? "text" : "password"} value={confirm} onChange={setConfirm} placeholder="Repeat password" icon={Lock} error={fieldErr.confirm} />
              )}

              {/* Error / success */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.25)", borderRadius: 10, padding: "12px 14px", marginBottom: 16, color: "#f43f5e", fontSize: "0.82rem" }}>{error}</motion.div>
                )}
                {success && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 10, padding: "12px 14px", marginBottom: 16, color: "#10b981", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircle2 style={{ width: 14, height: 14 }} />{success}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button onClick={submit} disabled={loading} whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: 0.98 }}
                className="btn-violet" style={{ width: "100%", padding: "14px 0", fontSize: "0.95rem", borderRadius: 12, marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 8px 28px rgba(124,58,237,0.4)", opacity: loading ? 0.7 : 1 }}>
                {loading ? (
                  <><motion.div animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }} style={{ width: 15, height: 15, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%" }} /> Processing...</>
                ) : (
                  <>{tab === "login" ? "Sign In" : "Create Account"} <ArrowRight style={{ width: 15, height: 15 }} /></>
                )}
              </motion.button>

              {/* Guest option */}
              <div style={{ textAlign: "center" }}>
                <button onClick={onGuest} style={{ background: "none", border: "none", cursor: "pointer", color: "#475569", fontSize: "0.82rem" }}>
                  <Sparkles style={{ width: 11, height: 11, display: "inline", marginRight: 4 }} />Continue as guest (no save)
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
