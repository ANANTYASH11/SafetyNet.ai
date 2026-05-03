import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import {
  ShieldCheck, Users, Activity, TrendingUp, Clock, RefreshCw,
  AlertTriangle, CheckCircle2, Eye, EyeOff, LogIn, LogOut,
  Trash2, Shield, UserX, UserCheck, Download, Search,
  ChevronLeft, ChevronRight, Server, Database, Info,
  Lock, Mail, Copy
} from "lucide-react";
import { API_URL } from "../utils/api";

const API = API_URL;
const FMT = (n) => n == null ? "—" : "₹" + Number(n).toLocaleString("en-IN");
const FMT_N = (n) => n == null ? "—" : Number(n).toLocaleString("en-IN");
const RISK_COLOR = { Low: "#10b981", Medium: "#f59e0b", High: "#f43f5e", Critical: "#7c3aed" };

const DEMO_CREDS = [
  { label: "Admin Account", email: "admin@safetynet.ai", password: "Admin@123", role: "admin", color: "#a78bfa" },
  { label: "Demo User",     email: "demo@safetynet.ai",  password: "Demo@123",  role: "user",  color: "#60a5fa" },
];

/* ── Helpers ───────────────────────────────────────────────────── */
function RiskBadge({ level }) {
  const c = RISK_COLOR[level] || "#475569";
  return (
    <span style={{ background: `${c}18`, color: c, border: `1px solid ${c}33`,
      borderRadius: 6, padding: "2px 8px", fontSize: "0.68rem", fontWeight: 700 }}>
      {level || "—"}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, sub, color, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 18, padding: "22px 20px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg,transparent,${color},transparent)` }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ fontSize: "0.68rem", color: "#475569", textTransform: "uppercase",
            letterSpacing: "0.1em", fontWeight: 700, marginBottom: 9 }}>{label}</p>
          <p style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.85rem",
            color, lineHeight: 1, margin: 0 }}>{value}</p>
          {sub && <p style={{ color: "#475569", fontSize: "0.7rem", marginTop: 6 }}>{sub}</p>}
        </div>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: `${color}14`,
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon style={{ width: 17, height: 17, color }} />
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════
   ADMIN LOGIN — shown when not yet authenticated
═══════════════════════════════════════════════════ */
function AdminLogin({ onSuccess }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [copied,   setCopied]   = useState(null);

  const fill = (cred) => { setEmail(cred.email); setPassword(cred.password); setError(""); };
  const copyText = async (text, key) => {
    try { await navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(null), 1500); } catch {}
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) { setError("Email and password are required"); return; }
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API}/auth/admin-login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login failed"); return; }
      onSuccess(data.user, data.token);
    } catch {
      setError("Cannot reach server. Make sure the backend is running on port 5001.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative" }}>
      <div style={{ position: "fixed", top: "40%", left: "50%", transform: "translate(-50%,-50%)",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle,rgba(124,58,237,0.1),transparent 70%)",
        pointerEvents: "none", filter: "blur(60px)" }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        style={{ width: "100%", maxWidth: 460, position: "relative", zIndex: 1 }}>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 60, height: 60, borderRadius: 18,
            background: "linear-gradient(135deg,#7c3aed,#6d28d9)", margin: "0 auto 16px",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 32px rgba(124,58,237,0.45)" }}>
            <Lock style={{ width: 26, height: 26, color: "white" }} />
          </div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.65rem",
            color: "#f1f5f9", letterSpacing: "-0.03em", margin: "0 0 6px" }}>Admin Console</h1>
          <p style={{ color: "#475569", fontSize: "0.85rem" }}>Sign in with your admin credentials to continue</p>
        </div>

        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 22, padding: "36px 32px", boxShadow: "0 32px 80px rgba(0,0,0,0.5)" }}>
          <form onSubmit={submit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontFamily: "var(--font-heading)", fontWeight: 600,
                fontSize: "0.72rem", color: "#64748b", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Admin Email
              </label>
              <div style={{ position: "relative" }}>
                <Mail style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
                  width: 14, height: 14, color: "#475569", pointerEvents: "none" }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@safetynet.ai" className="dark-input"
                  style={{ paddingLeft: 38, width: "100%", boxSizing: "border-box" }} autoComplete="email" />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontFamily: "var(--font-heading)", fontWeight: 600,
                fontSize: "0.72rem", color: "#64748b", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
                  width: 14, height: 14, color: "#475569", pointerEvents: "none" }} />
                <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" className="dark-input"
                  style={{ paddingLeft: 38, paddingRight: 42, width: "100%", boxSizing: "border-box" }} autoComplete="current-password" />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: "#475569", padding: 0, display: "flex" }}>
                  {showPw ? <EyeOff style={{ width: 14, height: 14 }} /> : <Eye style={{ width: 14, height: 14 }} />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.25)",
                    borderRadius: 10, padding: "11px 14px", marginBottom: 16, color: "#f43f5e", fontSize: "0.8rem",
                    display: "flex", alignItems: "center", gap: 8 }}>
                  <AlertTriangle style={{ width: 13, height: 13, flexShrink: 0 }} />{error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: 0.98 }}
              className="btn-violet" style={{ width: "100%", padding: "13px 0", fontSize: "0.92rem",
                borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
                gap: 8, boxShadow: "0 8px 28px rgba(124,58,237,0.4)", opacity: loading ? 0.7 : 1 }}>
              {loading
                ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                    style={{ width: 15, height: 15, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%" }} />
                    Signing in…</>
                : <><LogIn style={{ width: 15, height: 15 }} /> Sign in as Administrator</>
              }
            </motion.button>
          </form>

          {/* Demo credentials */}
          <div style={{ marginTop: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
              <span style={{ color: "#334155", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.1em", whiteSpace: "nowrap" }}>Demo Credentials</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
            </div>
            {DEMO_CREDS.map((c, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12, padding: "12px 14px", marginBottom: 8,
                display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, color: c.color }}>{c.label}</span>
                    <span style={{ background: `${c.color}18`, color: c.color, border: `1px solid ${c.color}30`,
                      padding: "1px 6px", borderRadius: 5, fontSize: "0.6rem", fontWeight: 700 }}>{c.role.toUpperCase()}</span>
                  </div>
                  <div style={{ fontFamily: "monospace", fontSize: "0.72rem", color: "#64748b" }}>
                    {c.email} · {c.password}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => copyText(`${c.email} / ${c.password}`, i)}
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 7, padding: "5px 8px", cursor: "pointer", color: "#475569", display: "flex", alignItems: "center" }}>
                    {copied === i ? <CheckCircle2 style={{ width: 12, height: 12, color: "#10b981" }} /> : <Copy style={{ width: 12, height: 12 }} />}
                  </button>
                  {c.role === "admin" && (
                    <button onClick={() => fill(c)} className="btn-violet"
                      style={{ padding: "5px 12px", fontSize: "0.7rem", borderRadius: 7 }}>
                      Use →
                    </button>
                  )}
                </div>
              </div>
            ))}
            <p style={{ color: "#334155", fontSize: "0.68rem", textAlign: "center", marginTop: 10 }}>
              Demo accounts are seeded automatically on server start.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN ADMIN DASHBOARD
═══════════════════════════════════════════════════ */
const PAGE_SIZE = 10;

export default function AdminPage({ user: propUser, token: propToken, onAdminAuth }) {
  const [adminUser,  setAdminUser]  = useState(() => {
    if (propUser?.role === "admin") return propUser;
    try { const u = JSON.parse(localStorage.getItem("sn_admin_user") || "null"); return u?.role === "admin" ? u : null; } catch { return null; }
  });
  const [adminToken, setAdminToken] = useState(() => {
    if (propUser?.role === "admin" && propToken) return propToken;
    return localStorage.getItem("sn_admin_token") || "";
  });

  const handleAdminAuth = useCallback((u, t) => {
    setAdminUser(u); setAdminToken(t);
    localStorage.setItem("sn_admin_user",  JSON.stringify(u));
    localStorage.setItem("sn_admin_token", t);
    if (onAdminAuth) onAdminAuth(u, t);
  }, [onAdminAuth]);

  const handleAdminLogout = () => {
    setAdminUser(null); setAdminToken("");
    localStorage.removeItem("sn_admin_user");
    localStorage.removeItem("sn_admin_token");
  };

  const [stats,    setStats]    = useState(null);
  const [users,    setUsers]    = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [system,   setSystem]   = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [tab,      setTab]      = useState("overview");

  const [userSearch,    setUserSearch]    = useState("");
  const [roleLoading,   setRoleLoading]   = useState(null);
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [anaSearch,  setAnaSearch]  = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [anaPage,    setAnaPage]    = useState(1);

  const authHeaders = useCallback(() => ({
    Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json",
  }), [adminToken]);

  const fetchAll = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const h = authHeaders();
      const [sRes, uRes, aRes, syRes] = await Promise.all([
        fetch(`${API}/admin/stats`,    { headers: h }),
        fetch(`${API}/admin/users`,    { headers: h }),
        fetch(`${API}/admin/analyses`, { headers: h }),
        fetch(`${API}/admin/system`,   { headers: h }),
      ]);
      if (sRes.status === 401 || sRes.status === 403) { handleAdminLogout(); return; }
      if (!sRes.ok) { setError("Failed to load admin data."); return; }
      const [s, u, a, sy] = await Promise.all([sRes.json(), uRes.json(), aRes.json(), syRes.json()]);
      if (s.success)  setStats(s.stats);
      if (u.success)  setUsers(u.users);
      if (a.success)  setAnalyses(a.records);
      if (sy.success) setSystem(sy.system);
    } catch { setError("Cannot reach server."); }
    finally { setLoading(false); }
  }, [adminToken]);

  useEffect(() => { if (adminUser) fetchAll(); }, [adminUser, fetchAll]);

  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    setRoleLoading(userId);
    try {
      const res  = await fetch(`${API}/admin/users/${userId}/role`, {
        method: "PATCH", headers: authHeaders(), body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error); return; }
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch { alert("Request failed"); }
    finally { setRoleLoading(null); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res  = await fetch(`${API}/admin/users/${deleteTarget}`, { method: "DELETE", headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) { alert(data.error); return; }
      setUsers(prev => prev.filter(u => u.id !== deleteTarget));
      setDeleteTarget(null);
    } catch { alert("Request failed"); }
    finally { setDeleteLoading(false); }
  };

  const exportCSV = () => {
    const header = ["Risk Level","Risk Score","Fund Target","Months Covered","Job Type","Income","AI Source","Saved At"];
    const rows   = analyses.map(r => [r.riskLevel, r.riskScore, r.fund,
      r.monthsCovered?.toFixed?.(1) ?? r.monthsCovered, r.jobType, r.income, r.aiSource,
      r.savedAt ? new Date(r.savedAt).toLocaleDateString("en-IN") : ""]);
    const csv    = [header, ...rows].map(r => r.map(v => `"${v ?? ""}"`).join(",")).join("\n");
    const blob   = new Blob([csv], { type: "text/csv" });
    const url    = URL.createObjectURL(blob);
    const a      = document.createElement("a"); a.href = url;
    a.download = `safetynet-analyses-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  if (!adminUser) return <AdminLogin onSuccess={handleAdminAuth} />;

  const filteredUsers = users.filter(u =>
    !userSearch ||
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );
  const filteredAnalyses = analyses
    .filter(r => riskFilter === "All" || r.riskLevel === riskFilter)
    .filter(r => !anaSearch || r.jobType?.toLowerCase().includes(anaSearch.toLowerCase()));
  const totalPages    = Math.ceil(filteredAnalyses.length / PAGE_SIZE);
  const pagedAnalyses = filteredAnalyses.slice((anaPage - 1) * PAGE_SIZE, anaPage * PAGE_SIZE);
  const riskChartData = stats ? Object.entries(stats.riskDistribution).map(([name, count]) => ({ name, count })) : [];

  const TABS = [
    { id: "overview",  label: "Overview" },
    { id: "users",     label: `Users (${users.length})` },
    { id: "analyses",  label: `Analyses (${analyses.length})` },
    { id: "system",    label: "System" },
  ];

  return (
    <div style={{ maxWidth: 1140, margin: "0 auto", padding: "28px 20px 80px" }}>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 1000,
              display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              style={{ background: "#0d0d1a", border: "1px solid rgba(244,63,94,0.3)", borderRadius: 20,
                padding: "32px 28px", maxWidth: 400, width: "100%", boxShadow: "0 32px 80px rgba(0,0,0,0.8)" }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(244,63,94,0.1)",
                border: "1px solid rgba(244,63,94,0.2)", display: "flex", alignItems: "center",
                justifyContent: "center", marginBottom: 16 }}>
                <Trash2 style={{ width: 20, height: 20, color: "#f43f5e" }} />
              </div>
              <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: "#f1f5f9",
                fontSize: "1.05rem", marginBottom: 8 }}>Delete User?</h3>
              <p style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: 24 }}>
                This action is permanent. The user will lose access and all associated data.
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setDeleteTarget(null)} className="btn-outline"
                  style={{ flex: 1, padding: "10px 0" }}>Cancel</button>
                <button onClick={confirmDelete} disabled={deleteLoading}
                  style={{ flex: 1, padding: "10px 0", background: "#f43f5e", border: "none",
                    borderRadius: 10, color: "white", fontWeight: 700, cursor: "pointer",
                    fontSize: "0.88rem", opacity: deleteLoading ? 0.6 : 1 }}>
                  {deleteLoading ? "Deleting…" : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 30, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Shield style={{ width: 14, height: 14, color: "#7c3aed" }} />
            <span style={{ color: "#7c3aed", fontSize: "0.7rem", fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.12em" }}>Admin Console</span>
          </div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.8rem",
            color: "#f1f5f9", letterSpacing: "-0.03em", margin: 0 }}>SafetyNet.ai Platform</h1>
          <p style={{ color: "#475569", fontSize: "0.82rem", marginTop: 5 }}>
            Signed in as <span style={{ color: "#a78bfa", fontWeight: 600 }}>{adminUser.name}</span>
            {" · "}{adminUser.email}{" · "}
            {new Date().toLocaleDateString("en-IN", { dateStyle: "medium" })}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={fetchAll} className="btn-outline"
            style={{ padding: "8px 14px", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: 6 }}>
            <RefreshCw style={{ width: 12, height: 12 }} /> Refresh
          </button>
          <button onClick={handleAdminLogout} className="btn-ghost"
            style={{ padding: "8px 14px", fontSize: "0.78rem", color: "#64748b",
              display: "flex", alignItems: "center", gap: 6 }}>
            <LogOut style={{ width: 12, height: 12 }} /> Sign Out
          </button>
        </div>
      </div>

      {/* Stat cards */}
      {!loading && stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(175px,1fr))", gap: 12, marginBottom: 28 }}>
          <StatCard icon={Users}       label="Registered Users"  value={FMT_N(stats.totalUsers)}    sub="All time"            color="#a78bfa" delay={0.04} />
          <StatCard icon={Activity}    label="Total Analyses"    value={FMT_N(stats.totalAnalyses)} sub="Saved records"       color="#60a5fa" delay={0.08} />
          <StatCard icon={Clock}       label="Today's Analyses"  value={FMT_N(stats.analysesToday)} sub="Since midnight"      color="#10b981" delay={0.12} />
          <StatCard icon={TrendingUp}  label="Avg Risk Score"    value={stats.avgRiskScore ?? "—"}  sub="Platform average"    color="#f59e0b" delay={0.16} />
          <StatCard icon={ShieldCheck} label="Avg Fund Target"   value={FMT(stats.avgFundTarget)}   sub="All analyses"        color="#34d399" delay={0.20} />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
          minHeight: 300, flexDirection: "column", gap: 14 }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{ width: 36, height: 36, border: "3px solid rgba(124,58,237,0.2)",
              borderTop: "3px solid #7c3aed", borderRadius: "50%" }} />
          <p style={{ color: "#475569", fontSize: "0.85rem" }}>Loading admin data…</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)",
          borderRadius: 14, padding: "18px 20px", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 12 }}>
          <AlertTriangle style={{ width: 16, height: 16, color: "#f43f5e", flexShrink: 0 }} />
          <span style={{ color: "#f43f5e", fontSize: "0.85rem" }}>{error}</span>
        </div>
      )}

      {/* Tabs */}
      {!loading && (
        <>
          <div style={{ display: "flex", gap: 3, background: "rgba(255,255,255,0.03)", borderRadius: 12,
            padding: 4, marginBottom: 24, width: "fit-content", flexWrap: "wrap" }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ padding: "8px 18px", borderRadius: 9, border: "none", cursor: "pointer",
                  fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "0.8rem", transition: "all 0.2s",
                  background: tab === t.id ? "linear-gradient(135deg,#7c3aed,#6d28d9)" : "transparent",
                  color: tab === t.id ? "white" : "#475569",
                  boxShadow: tab === t.id ? "0 4px 12px rgba(124,58,237,0.3)" : "none" }}>
                {t.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">

            {/* ── OVERVIEW ── */}
            {tab === "overview" && (
              <motion.div key="ov" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 20, padding: 26 }}>
                    <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: "#f1f5f9",
                      fontSize: "0.9rem", marginBottom: 20 }}>Risk Distribution</h3>
                    {riskChartData.every(d => d.count === 0)
                      ? <p style={{ color: "#475569", fontSize: "0.85rem" }}>No analyses yet.</p>
                      : <ResponsiveContainer width="100%" height={170}>
                          <BarChart data={riskChartData} barCategoryGap="30%">
                            <XAxis dataKey="name" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip contentStyle={{ background: "rgba(9,9,15,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 11 }} />
                            <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                              {riskChartData.map((d, i) => <Cell key={i} fill={RISK_COLOR[d.name] || "#475569"} />)}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                    }
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 20, padding: 26 }}>
                    <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: "#f1f5f9",
                      fontSize: "0.9rem", marginBottom: 20 }}>Platform Summary</h3>
                    {[["Admin Accounts", stats?.adminCount ?? "—", "#a78bfa"],
                      ["Total Users",    stats?.totalUsers ?? "—",  "#60a5fa"],
                      ["Avg Fund Target", FMT(stats?.avgFundTarget), "#10b981"],
                      ["Avg Risk Score",  `${stats?.avgRiskScore ?? "—"} / 100`, "#f59e0b"],
                    ].map(([label, val, color], i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "10px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                        <span style={{ color: "#64748b", fontSize: "0.82rem" }}>{label}</span>
                        <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color, fontSize: "0.9rem" }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 20, padding: 26 }}>
                  <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: "#f1f5f9",
                    fontSize: "0.9rem", marginBottom: 18 }}>Recent Analyses</h3>
                  {analyses.slice(0, 6).map((r, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "10px 0", borderBottom: i < 5 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <RiskBadge level={r.riskLevel} />
                        <span style={{ color: "#64748b", fontSize: "0.8rem", textTransform: "capitalize" }}>
                          {r.jobType || "—"} · Tier {r.cityTier || "—"}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                        <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: "#f1f5f9", fontSize: "0.85rem" }}>{FMT(r.fund)}</span>
                        <span style={{ background: r.aiSource === "groq" ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.04)",
                          color: r.aiSource === "groq" ? "#10b981" : "#475569", padding: "1px 6px",
                          borderRadius: 5, fontSize: "0.62rem", fontWeight: 700 }}>{r.aiSource || "—"}</span>
                        <span style={{ color: "#334155", fontSize: "0.7rem", whiteSpace: "nowrap" }}>
                          {r.savedAt ? new Date(r.savedAt).toLocaleDateString("en-IN") : "—"}
                        </span>
                      </div>
                    </div>
                  ))}
                  {analyses.length === 0 && <p style={{ color: "#475569", fontSize: "0.85rem" }}>No analyses saved yet.</p>}
                </div>
              </motion.div>
            )}

            {/* ── USERS ── */}
            {tab === "users" && (
              <motion.div key="us" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 20, overflow: "hidden" }}>
                  <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(255,255,255,0.06)",
                    display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: "#f1f5f9", fontSize: "0.9rem", margin: 0 }}>
                      Registered Users
                    </h3>
                    <div style={{ position: "relative" }}>
                      <Search style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)",
                        width: 13, height: 13, color: "#475569", pointerEvents: "none" }} />
                      <input value={userSearch} onChange={e => setUserSearch(e.target.value)}
                        placeholder="Search by name or email…" className="dark-input"
                        style={{ paddingLeft: 32, paddingRight: 12, width: 240, fontSize: "0.8rem" }} />
                    </div>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                          {["User", "Email", "Role", "Joined", "Analyses", "Actions"].map(h => (
                            <th key={h} style={{ padding: "11px 18px", textAlign: "left", color: "#334155",
                              fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase",
                              letterSpacing: "0.08em", whiteSpace: "nowrap" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u) => (
                          <tr key={u.id} style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                            <td style={{ padding: "13px 18px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ width: 30, height: 30, borderRadius: "50%",
                                  background: "linear-gradient(135deg,#7c3aed,#06b6d4)",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  fontSize: "0.78rem", fontWeight: 700, color: "white", flexShrink: 0 }}>
                                  {u.name?.[0]?.toUpperCase()}
                                </div>
                                <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, color: "#e2e8f0", fontSize: "0.83rem" }}>
                                  {u.name}
                                </span>
                                {u.isDemo && (
                                  <span style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b",
                                    border: "1px solid rgba(245,158,11,0.2)", padding: "1px 5px",
                                    borderRadius: 4, fontSize: "0.58rem", fontWeight: 700 }}>DEMO</span>
                                )}
                              </div>
                            </td>
                            <td style={{ padding: "13px 18px", color: "#475569", fontSize: "0.78rem" }}>{u.email}</td>
                            <td style={{ padding: "13px 18px" }}>
                              <span style={{
                                background: u.role === "admin" ? "rgba(167,139,250,0.12)" : "rgba(255,255,255,0.05)",
                                color: u.role === "admin" ? "#a78bfa" : "#64748b",
                                border: `1px solid ${u.role === "admin" ? "rgba(167,139,250,0.2)" : "rgba(255,255,255,0.06)"}`,
                                padding: "2px 8px", borderRadius: 6, fontSize: "0.68rem", fontWeight: 700, textTransform: "capitalize" }}>
                                {u.role}
                              </span>
                            </td>
                            <td style={{ padding: "13px 18px", color: "#475569", fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN") : "—"}
                            </td>
                            <td style={{ padding: "13px 18px", color: "#f1f5f9", fontSize: "0.85rem", fontWeight: 600 }}>
                              {u.analysesCount ?? 0}
                            </td>
                            <td style={{ padding: "13px 18px" }}>
                              <div style={{ display: "flex", gap: 6 }}>
                                <button onClick={() => toggleRole(u.id, u.role)}
                                  disabled={roleLoading === u.id || u.id === adminUser.id}
                                  title={u.role === "admin" ? "Demote to User" : "Promote to Admin"}
                                  style={{ background: u.role === "admin" ? "rgba(244,63,94,0.1)" : "rgba(16,185,129,0.1)",
                                    border: `1px solid ${u.role === "admin" ? "rgba(244,63,94,0.2)" : "rgba(16,185,129,0.2)"}`,
                                    borderRadius: 7, padding: "5px 10px",
                                    cursor: u.id === adminUser.id ? "not-allowed" : "pointer",
                                    color: u.role === "admin" ? "#f43f5e" : "#10b981",
                                    display: "flex", alignItems: "center", gap: 4, fontSize: "0.7rem", fontWeight: 700,
                                    opacity: u.id === adminUser.id ? 0.35 : roleLoading === u.id ? 0.5 : 1 }}>
                                  {u.role === "admin"
                                    ? <><UserX style={{ width: 11, height: 11 }} />Demote</>
                                    : <><UserCheck style={{ width: 11, height: 11 }} />Promote</>}
                                </button>
                                <button onClick={() => setDeleteTarget(u.id)}
                                  disabled={u.id === adminUser.id}
                                  title={u.id === adminUser.id ? "Cannot delete yourself" : "Delete user"}
                                  style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.15)",
                                    borderRadius: 7, padding: "5px 8px",
                                    cursor: u.id === adminUser.id ? "not-allowed" : "pointer",
                                    color: "#f43f5e", display: "flex", alignItems: "center",
                                    opacity: u.id === adminUser.id ? 0.3 : 1 }}>
                                  <Trash2 style={{ width: 11, height: 11 }} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                          <tr><td colSpan={6} style={{ padding: "28px 18px", textAlign: "center", color: "#475569", fontSize: "0.85rem" }}>
                            No users match your search.
                          </td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── ANALYSES ── */}
            {tab === "analyses" && (
              <motion.div key="an" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 20, overflow: "hidden" }}>
                  <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(255,255,255,0.06)",
                    display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: "#f1f5f9", fontSize: "0.9rem", margin: 0 }}>
                      Analyses <span style={{ color: "#475569", fontWeight: 500, fontSize: "0.78rem" }}>({filteredAnalyses.length})</span>
                    </h3>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <div style={{ display: "flex", gap: 3 }}>
                        {["All","Low","Medium","High","Critical"].map(f => (
                          <button key={f} onClick={() => { setRiskFilter(f); setAnaPage(1); }}
                            style={{ padding: "5px 10px", borderRadius: 7, border: "none", cursor: "pointer",
                              fontSize: "0.7rem", fontWeight: 700, transition: "all 0.15s",
                              background: riskFilter === f ? `${RISK_COLOR[f] || "#7c3aed"}25` : "rgba(255,255,255,0.04)",
                              color: riskFilter === f ? (RISK_COLOR[f] || "#a78bfa") : "#475569",
                              outline: riskFilter === f ? `1px solid ${(RISK_COLOR[f] || "#7c3aed")}40` : "none" }}>
                            {f}
                          </button>
                        ))}
                      </div>
                      <div style={{ position: "relative" }}>
                        <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
                          width: 12, height: 12, color: "#475569", pointerEvents: "none" }} />
                        <input value={anaSearch} onChange={e => { setAnaSearch(e.target.value); setAnaPage(1); }}
                          placeholder="Filter by job type…" className="dark-input"
                          style={{ paddingLeft: 28, paddingRight: 10, width: 180, fontSize: "0.78rem" }} />
                      </div>
                      <button onClick={exportCSV} className="btn-outline"
                        style={{ padding: "6px 12px", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 5 }}>
                        <Download style={{ width: 12, height: 12 }} /> Export CSV
                      </button>
                    </div>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                          {["Risk","Score","Fund Target","Months","Job Type","Income","AI","Date"].map(h => (
                            <th key={h} style={{ padding: "11px 14px", textAlign: "left", color: "#334155",
                              fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase",
                              letterSpacing: "0.08em", whiteSpace: "nowrap" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {pagedAnalyses.map((r, i) => (
                          <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                            <td style={{ padding: "11px 14px" }}><RiskBadge level={r.riskLevel} /></td>
                            <td style={{ padding: "11px 14px", fontFamily: "var(--font-heading)", fontWeight: 700,
                              color: RISK_COLOR[r.riskLevel] || "#f1f5f9", fontSize: "0.85rem" }}>{r.riskScore ?? "—"}</td>
                            <td style={{ padding: "11px 14px", color: "#f1f5f9", fontSize: "0.82rem", fontWeight: 600 }}>{FMT(r.fund)}</td>
                            <td style={{ padding: "11px 14px", color: "#94a3b8", fontSize: "0.78rem" }}>
                              {r.monthsCovered?.toFixed ? r.monthsCovered.toFixed(1) : r.monthsCovered ?? "—"}
                            </td>
                            <td style={{ padding: "11px 14px", color: "#64748b", fontSize: "0.75rem", textTransform: "capitalize" }}>{r.jobType || "—"}</td>
                            <td style={{ padding: "11px 14px", color: "#64748b", fontSize: "0.75rem" }}>
                              {r.income ? "₹" + Number(r.income).toLocaleString("en-IN") : "—"}
                            </td>
                            <td style={{ padding: "11px 14px" }}>
                              <span style={{ background: r.aiSource === "groq" ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.05)",
                                color: r.aiSource === "groq" ? "#10b981" : "#475569",
                                padding: "1px 6px", borderRadius: 5, fontSize: "0.62rem", fontWeight: 700 }}>
                                {r.aiSource || "—"}
                              </span>
                            </td>
                            <td style={{ padding: "11px 14px", color: "#334155", fontSize: "0.7rem", whiteSpace: "nowrap" }}>
                              {r.savedAt ? new Date(r.savedAt).toLocaleDateString("en-IN") : "—"}
                            </td>
                          </tr>
                        ))}
                        {pagedAnalyses.length === 0 && (
                          <tr><td colSpan={8} style={{ padding: "28px 14px", textAlign: "center", color: "#475569", fontSize: "0.85rem" }}>
                            No analyses match filters.
                          </td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {totalPages > 1 && (
                    <div style={{ padding: "14px 22px", borderTop: "1px solid rgba(255,255,255,0.05)",
                      display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "#475569", fontSize: "0.75rem" }}>
                        Page {anaPage} of {totalPages} · {filteredAnalyses.length} records
                      </span>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => setAnaPage(p => Math.max(1, p - 1))} disabled={anaPage === 1}
                          className="btn-outline" style={{ padding: "5px 10px", opacity: anaPage === 1 ? 0.35 : 1 }}>
                          <ChevronLeft style={{ width: 13, height: 13 }} />
                        </button>
                        <button onClick={() => setAnaPage(p => Math.min(totalPages, p + 1))} disabled={anaPage === totalPages}
                          className="btn-outline" style={{ padding: "5px 10px", opacity: anaPage === totalPages ? 0.35 : 1 }}>
                          <ChevronRight style={{ width: 13, height: 13 }} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── SYSTEM ── */}
            {tab === "system" && (
              <motion.div key="sy" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 20, padding: 26 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                      <Server style={{ width: 15, height: 15, color: "#a78bfa" }} />
                      <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: "#f1f5f9", fontSize: "0.9rem", margin: 0 }}>Server Info</h3>
                    </div>
                    {system && [
                      ["Node.js",          system.nodeVersion],
                      ["Platform",         system.platform],
                      ["Port",             system.port],
                      ["Uptime",           `${Math.floor(system.uptime / 60)}m ${system.uptime % 60}s`],
                      ["Memory (heap)",    `${system.memoryMB} MB`],
                      ["Server Time",      new Date(system.serverTime).toLocaleTimeString("en-IN")],
                    ].map(([k, v], i, arr) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0",
                        borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                        <span style={{ color: "#64748b", fontSize: "0.8rem" }}>{k}</span>
                        <span style={{ fontFamily: "monospace", color: "#a78bfa", fontSize: "0.78rem", fontWeight: 600 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 20, padding: 26 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                      <Database style={{ width: 15, height: 15, color: "#60a5fa" }} />
                      <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: "#f1f5f9", fontSize: "0.9rem", margin: 0 }}>Data Storage</h3>
                    </div>
                    {system && [
                      ["Total Users",      system.userCount],
                      ["Admins",           system.adminCount],
                      ["Demo Accounts",    system.demoCount],
                      ["Analyses Saved",   system.recordCount],
                      ["users.json",       `${system.usersFileSizeKB} KB`],
                      ["data.json",        `${system.dataFileSizeKB} KB`],
                    ].map(([k, v], i, arr) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0",
                        borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                        <span style={{ color: "#64748b", fontSize: "0.8rem" }}>{k}</span>
                        <span style={{ fontFamily: "var(--font-heading)", color: "#60a5fa", fontSize: "0.82rem", fontWeight: 700 }}>{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 20, padding: 26, marginTop: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <Info style={{ width: 14, height: 14, color: "#f59e0b" }} />
                    <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: "#f1f5f9", fontSize: "0.9rem", margin: 0 }}>
                      Demo Credentials
                    </h3>
                    <span style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b",
                      border: "1px solid rgba(245,158,11,0.2)", padding: "1px 7px",
                      borderRadius: 5, fontSize: "0.62rem", fontWeight: 700 }}>AUTO-SEEDED</span>
                  </div>
                  <p style={{ color: "#475569", fontSize: "0.8rem", marginBottom: 16 }}>
                    These accounts are created automatically on every server start if they don't exist.
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {DEMO_CREDS.map((c, i) => (
                      <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: 12, padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: c.color, fontSize: "0.82rem" }}>{c.label}</span>
                          <span style={{ background: `${c.color}18`, color: c.color, border: `1px solid ${c.color}30`,
                            padding: "1px 6px", borderRadius: 4, fontSize: "0.6rem", fontWeight: 700 }}>{c.role.toUpperCase()}</span>
                        </div>
                        <div style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#64748b", lineHeight: 1.8 }}>
                          <div>Email: <span style={{ color: "#94a3b8" }}>{c.email}</span></div>
                          <div>Pass:&nbsp;&nbsp;<span style={{ color: "#94a3b8" }}>{c.password}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </>
      )}
    </div>
  );
}
