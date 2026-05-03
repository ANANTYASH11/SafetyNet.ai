import React, { useState, useCallback, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Landing from "./components/Landing";
import CalculatorForm from "./components/CalculatorForm";
import Dashboard from "./components/Dashboard";
import HistoryPanel from "./components/HistoryPanel";
import AuthPage from "./components/AuthPage";
import AdminPage from "./components/AdminPage";
import AnalysisPage from "./components/AnalysisPage";
import PortalPage from "./components/PortalPage";
import ChatBot from "./components/ChatBot";
import { API_URL } from "./utils/api";
import { ShieldCheck, History, Home, ArrowRight, Sun, Moon, RotateCcw, LogIn, LogOut, Shield } from "lucide-react";

/* ── Theme context ─────────────────────────────────────────────── */
export const ThemeCtx = createContext({ dark: true, toggle: () => {} });
export const useTheme = () => useContext(ThemeCtx);

const T = {
  initial:  { opacity: 0, y: 24, scale: 0.99 },
  animate:  { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.42, ease: [0.22,1,0.36,1] } },
  exit:     { opacity: 0, y: -14, scale: 0.99, transition: { duration: 0.24, ease: "easeIn" } },
};

export default function App() {
  const [view,    setView]    = useState("landing");
  const [results, setResults] = useState(null);
  const [dark,    setDark]    = useState(true);
  const [user,    setUser]    = useState(() => { try { return JSON.parse(localStorage.getItem("sn_user") || "null"); } catch { return null; } });
  const [token,   setToken]   = useState(() => localStorage.getItem("sn_token") || "");

  const onAuth = useCallback((u, t) => {
    setUser(u); setToken(t);
    localStorage.setItem("sn_user", JSON.stringify(u));
    localStorage.setItem("sn_token", t);
    setView("portal");
  }, []);

  const onLogout = useCallback(() => {
    setUser(null); setToken("");
    localStorage.removeItem("sn_user");
    localStorage.removeItem("sn_token");
    setView("landing");
  }, []);

  const handleComplete = useCallback((data) => {
    setResults(data);
    setView("dashboard");
  }, []);

  const handleSave = useCallback(async (data) => {
    try {
      await fetch(`${API_URL}/history/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(data),
      });
    } catch (e) { console.warn("Save failed:", e.message); }
  }, [token]);

  /* Dynamic CSS vars for light/dark toggle */
  const bg       = dark ? "#09090f" : "#f8fafc";
  const surface  = dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
  const navBg    = dark ? "rgba(9,9,15,0.88)"       : "rgba(248,250,252,0.9)";
  const navBorder= dark ? "rgba(255,255,255,0.07)"  : "rgba(0,0,0,0.08)";
  const textPri  = dark ? "#f1f5f9"                 : "#0f172a";
  const textSub  = dark ? "#64748b"                 : "#64748b";

  return (
    <ThemeCtx.Provider value={{ dark, toggle: () => setDark(d => !d) }}>
      <div data-theme={dark ? "dark" : "light"} style={{ background: bg, minHeight: "100vh", color: dark ? "#e2e8f0" : "#1e293b", transition: "background 0.4s, color 0.4s" }}>

        {/* ── Ambient background ──────────────────────────────── */}
        {dark && (
          <>
            <div className="fixed inset-0 pointer-events-none mesh-bg z-0" />
            <div className="fixed inset-0 grid-dots pointer-events-none z-0" />
          </>
        )}

        {/* ── Nav ─────────────────────────────────────────────── */}
        <header className="sticky top-0 z-50" style={{ background: navBg, backdropFilter: "blur(24px)", borderBottom: `1px solid ${navBorder}`, transition: "all 0.4s" }}>
          <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex justify-between items-center">

            {/* Logo */}
            <button onClick={() => setView("landing")} className="flex items-center gap-2.5 group" style={{ background:"none", border:"none", cursor:"pointer" }}>
              <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#7c3aed,#6d28d9)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 16px rgba(124,58,237,0.4)", flexShrink:0 }}>
                <ShieldCheck style={{ width:18, height:18, color:"white" }} />
              </div>
              <span style={{ fontFamily:"var(--font-heading)", fontWeight:700, fontSize:"1.1rem", color: textPri, letterSpacing:"-0.02em" }}>
                SafetyNet<span style={{ color:"#a78bfa" }}>.ai</span>
              </span>
            </button>

            {/* Nav actions */}
            <nav className="flex items-center gap-1">
              {view !== "landing" && (
                <button onClick={() => setView("landing")} className="btn-ghost" style={{ color: textSub }}>
                  <Home style={{width:14,height:14}} /> <span className="hidden sm:inline">Home</span>
                </button>
              )}
              {view === "dashboard" && (
                <button onClick={() => setView("form")} className="btn-ghost" style={{ color: textSub }}>
                  <RotateCcw style={{width:14,height:14}} /> <span className="hidden sm:inline">Recalculate</span>
                </button>
              )}
              {user && view !== "landing" && (
                <button onClick={() => setView("history")} className="btn-ghost" style={{ color: textSub }}>
                  <History style={{width:14,height:14}} /> <span className="hidden sm:inline">History</span>
                </button>
              )}
              {user?.role === "admin" && (
                <button onClick={() => setView("admin")} className="btn-ghost" style={{ color: "#a78bfa" }}>
                  <Shield style={{width:14,height:14}} /> <span className="hidden sm:inline">Admin</span>
                </button>
              )}

              {/* Dark/Light toggle — gradient pill */}
              <motion.button
                onClick={() => setDark(d => !d)}
                title={dark ? "Switch to light mode" : "Switch to dark mode"}
                whileHover={{scale:1.07}} whileTap={{scale:0.93}}
                style={{
                  position:"relative", width:54, height:29, borderRadius:999,
                  border:"none", cursor:"pointer", padding:0, marginLeft:8, flexShrink:0,
                  background: dark
                    ? "linear-gradient(135deg,#4c1d95,#7c3aed,#6d28d9)"
                    : "linear-gradient(135deg,#f59e0b,#f97316,#ea580c)",
                  boxShadow: dark
                    ? "0 0 0 1px rgba(124,58,237,0.5),0 4px 16px rgba(124,58,237,0.4)"
                    : "0 0 0 1px rgba(245,158,11,0.5),0 4px 16px rgba(245,158,11,0.4)",
                  transition:"background 0.35s,box-shadow 0.35s",
                }}
              >
                <motion.div
                  animate={{x: dark ? 3 : 24}}
                  transition={{type:"spring",stiffness:520,damping:34}}
                  style={{
                    position:"absolute", top:3.5, width:22, height:22, borderRadius:"50%",
                    background:"white", boxShadow:"0 2px 8px rgba(0,0,0,0.28)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                  }}
                >
                  <AnimatePresence mode="wait">
                    {dark
                      ? <motion.div key="moon" initial={{opacity:0,rotate:-40,scale:0.6}} animate={{opacity:1,rotate:0,scale:1}} exit={{opacity:0,rotate:40,scale:0.6}} transition={{duration:0.18}}>
                          <Moon style={{width:11,height:11,color:"#7c3aed"}}/>
                        </motion.div>
                      : <motion.div key="sun" initial={{opacity:0,rotate:40,scale:0.6}} animate={{opacity:1,rotate:0,scale:1}} exit={{opacity:0,rotate:-40,scale:0.6}} transition={{duration:0.18}}>
                          <Sun style={{width:12,height:12,color:"#f97316"}}/>
                        </motion.div>
                    }
                  </AnimatePresence>
                </motion.div>
              </motion.button>

              {/* Nav CTA: logged in → portal, guest → auth */}
              {user
                ? view !== "portal" && view !== "analyze" && view !== "form" && view !== "dashboard" && (
                    <button onClick={() => setView("portal")} className="btn-violet ml-2" style={{ padding:"8px 16px", fontSize:"0.82rem" }}>
                      My Portal <ArrowRight style={{width:13,height:13}} />
                    </button>
                  )
                : view !== "auth" && (
                    <button onClick={() => setView("auth")} className="btn-violet ml-2" style={{ padding:"8px 16px", fontSize:"0.82rem" }}>
                      Sign In <ArrowRight style={{width:13,height:13}} />
                    </button>
                  )
              }
              {user ? (
                <div style={{ display:"flex", alignItems:"center", gap:8, marginLeft:4 }}>
                  <div title={user.name} style={{ width:30, height:30, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#06b6d4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.8rem", fontWeight:700, color:"white", flexShrink:0, cursor:"default" }}>
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <button onClick={onLogout} className="btn-ghost" style={{ color: textSub, fontSize:"0.78rem" }} title="Sign out">
                    <LogOut style={{width:13,height:13}} /> <span className="hidden sm:inline">Sign Out</span>
                  </button>
                </div>
              ) : null}
            </nav>
          </div>
        </header>

        {/* ── Main content ────────────────────────────────────── */}
        <main className="relative z-10">
          <AnimatePresence mode="wait">
            {view === "landing" && (
              <motion.div key="landing" {...T}>
                <Landing onStart={() => setView("analyze")} />
              </motion.div>
            )}
            {view === "portal" && user && (
              <motion.div key="portal" {...T}>
                <PortalPage user={user} onAnalyze={() => setView("analyze")} onHistory={() => setView("history")} />
              </motion.div>
            )}
            {(view === "form" || view === "analyze") && (
              <motion.div key="analyze" {...T}>
                <AnalysisPage onComplete={handleComplete} />
              </motion.div>
            )}
            {view === "dashboard" && results && (
              <motion.div key="dashboard" {...T} className="pt-8 pb-24 px-4 md:px-6">
                <Dashboard data={results} onRecalculate={() => setView("analyze")} onSave={handleSave} user={user} />
              </motion.div>
            )}
            {view === "history" && (
              <motion.div key="history" {...T} className="max-w-4xl mx-auto pt-10 pb-24 px-4 md:px-6">
                <HistoryPanel
                  onClose={() => setView("landing")}
                  onLoadResult={(r) => { setResults(r); setView("dashboard"); }}
                />
              </motion.div>
            )}
            {view === "auth" && (
              <motion.div key="auth" {...T}>
                <AuthPage onAuth={onAuth} onGuest={() => setView("analyze")} />
              </motion.div>
            )}
            {view === "admin" && user?.role === "admin" && (
              <motion.div key="admin" {...T}>
                <AdminPage user={user} token={token} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* ── Footer ──────────────────────────────────────────── */}
        <footer style={{ borderTop: `1px solid ${navBorder}` }}>
          <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              <div style={{ width:20, height:20, borderRadius:6, background:"linear-gradient(135deg,#7c3aed,#6d28d9)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <ShieldCheck style={{width:11,height:11,color:"white"}} />
              </div>
              <span style={{ fontFamily:"var(--font-heading)", fontWeight:700, color: textSub, fontSize:"0.8rem" }}>SafetyNet.ai</span>
            </div>
            <p style={{ fontSize:"0.72rem", color: textSub, textAlign:"center", maxWidth:420 }}>
              For educational purposes only. No personal data is stored or shared. Not financial advice.
            </p>
            <span style={{ fontSize:"0.72rem", color: textSub }}>v3.0 · India</span>
          </div>
        </footer>

        {/* ── Floating AI Chatbot ──────────────────────────────── */}
        <ChatBot analysisContext={results} dark={dark} />

      </div>
    </ThemeCtx.Provider>
  );
}

