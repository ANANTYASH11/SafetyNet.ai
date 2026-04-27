import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ShieldAlert, RefreshCw, ChevronRight, Inbox } from "lucide-react";

const FMT2 = (n) => {
  const v = Number(n);
  if (v >= 1000000) return "\u20b9" + (v / 100000).toFixed(1) + "L";
  if (v >= 1000)    return "\u20b9" + (v / 1000).toFixed(0) + "k";
  return "\u20b9" + Math.round(v);
};

function Skeleton({ w = "100%", h = 18, radius = 8 }) {
  return (
    <motion.div
      animate={{ opacity:[0.3, 0.65, 0.3] }}
      transition={{ duration:1.8, repeat:Infinity }}
      style={{ width:w, height:h, borderRadius:radius, background:"rgba(255,255,255,0.07)" }}
    />
  );
}

function HistoryCard({ item, onLoad, index }) {
  const riskColor = item.riskScore >= 70 ? "#f43f5e" : item.riskScore >= 40 ? "#f59e0b" : "#10b981";
  const riskBadge = item.riskScore >= 70 ? "danger"  : item.riskScore >= 40 ? "warning" : "success";
  const date      = new Date(item.createdAt || item.savedAt || Date.now());
  const dateStr   = date.toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });
  const timeStr   = date.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" });

  return (
    <motion.div
      initial={{ opacity:0, y:20 }}
      animate={{ opacity:1, y:0 }}
      transition={{ delay: index * 0.06, duration:0.4, ease:[0.22,1,0.36,1] }}
      className="glass-lift"
      style={{ padding:"22px 24px", borderRadius:20, cursor:"pointer" }}
      onClick={() => onLoad(item)}
      whileHover={{ y:-3, transition:{ duration:0.2 } }}
    >
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:11, background:`${riskColor}18`, display:"flex", alignItems:"center", justifyContent:"center" }}>
            {item.riskScore >= 70
              ? <ShieldAlert style={{ width:17, height:17, color:riskColor }} />
              : <ShieldCheck  style={{ width:17, height:17, color:riskColor }} />}
          </div>
          <div>
            <p style={{ fontFamily:"var(--font-heading)", fontWeight:700, color:"#f1f5f9", fontSize:"0.9rem" }}>
              {item.inputs?.jobType
                ? item.inputs.jobType.charAt(0).toUpperCase() + item.inputs.jobType.slice(1) + " Profile"
                : "Emergency Fund Analysis"}
            </p>
            <p style={{ fontSize:"0.72rem", color:"#475569" }}>{dateStr} · {timeStr}</p>
          </div>
        </div>
        <span className={`badge badge-${riskBadge}`}>{item.riskLevel || "Low"}</span>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:16 }}>
        {[
          { label:"Target Fund",    val: FMT2(item.recommendedFund || item.emergencyFund || 0), color:"#a78bfa" },
          { label:"Risk Score",     val: (item.riskScore || 0) + "/100",                        color: riskColor },
          { label:"Months Covered", val: (item.monthsCovered || 0) + " mo",                    color:"#60a5fa" },
        ].map(m => (
          <div key={m.label} style={{ background:"rgba(255,255,255,0.03)", borderRadius:10, padding:"10px 12px", textAlign:"center" }}>
            <p style={{ fontFamily:"var(--font-heading)", fontWeight:700, color:m.color, fontSize:"0.9rem", marginBottom:2 }}>{m.val}</p>
            <p style={{ fontSize:"0.66rem", color:"#334155", textTransform:"uppercase", letterSpacing:"0.08em" }}>{m.label}</p>
          </div>
        ))}
      </div>

      <div>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
          <span style={{ fontSize:"0.72rem", color:"#475569" }}>Coverage Progress</span>
          <span style={{ fontSize:"0.72rem", fontWeight:600, color:riskColor }}>
            {Math.min(100, Math.round(((item.monthsCovered || 0) / (item.monthsRecommended || 6)) * 100))}%
          </span>
        </div>
        <div className="progress-track" style={{ height:5 }}>
          <div className="progress-fill" style={{
            width:`${Math.min(100, ((item.monthsCovered || 0) / (item.monthsRecommended || 6)) * 100)}%`,
            background:`linear-gradient(90deg,${riskColor},${riskColor}99)`,
            transition:"width 0.8s ease",
          }} />
        </div>
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:14 }}>
        <p style={{ fontSize:"0.75rem", color:"#334155" }}>
          AI: <span style={{ color:"#64748b" }}>{item.aiSource || "fallback"}</span>
        </p>
        <div style={{ display:"flex", alignItems:"center", gap:4, color:"#7c3aed", fontSize:"0.78rem", fontWeight:600 }}>
          Load Report <ChevronRight style={{ width:13, height:13 }} />
        </div>
      </div>
    </motion.div>
  );
}

export default function HistoryPanel({ onLoadResult }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [page,    setPage]    = useState(1);
  const PER_PAGE = 6;

  async function fetchHistory() {
    setLoading(true); setError("");
    try {
      const res  = await fetch("http://localhost:5001/api/history");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load history");
      setRecords(json.records || json.data || json || []);
    } catch (e) {
      setError("Could not load history. Make sure the server is running on port 5001.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchHistory(); }, []);

  const totalPages = Math.ceil(records.length / PER_PAGE);
  const visible    = records.slice((page-1)*PER_PAGE, page*PER_PAGE);

  return (
    <div style={{ maxWidth:900, margin:"0 auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28, flexWrap:"wrap", gap:12 }}>
        <div>
          <p className="eyebrow" style={{ marginBottom:6 }}>Past Analyses</p>
          <h1 style={{ fontFamily:"var(--font-heading)", fontWeight:800, fontSize:"clamp(1.5rem,3vw,2rem)", color:"#f1f5f9", letterSpacing:"-0.025em", margin:0 }}>
            Analysis History
          </h1>
          <p style={{ color:"#475569", fontSize:"0.82rem", marginTop:4 }}>
            {loading ? "Loading\u2026" : `${records.length} saved report${records.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button onClick={fetchHistory} className="btn-outline" style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 18px" }}>
          <RefreshCw style={{ width:14, height:14 }} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
          {Array.from({ length:3 }).map((_, i) => (
            <div key={i} style={{ padding:"22px 24px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:20 }}>
              <div style={{ display:"flex", gap:10, marginBottom:16 }}>
                <Skeleton w={36} h={36} radius={11} />
                <div style={{ flex:1, display:"flex", flexDirection:"column", gap:8 }}>
                  <Skeleton w="60%" h={14} />
                  <Skeleton w="40%" h={10} />
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:14 }}>
                {[0,1,2].map(j => <Skeleton key={j} h={54} radius={10} />)}
              </div>
              <Skeleton h={5} radius={99} />
            </div>
          ))}
        </div>
      ) : error ? (
        <div style={{ textAlign:"center", padding:"60px 24px" }}>
          <div style={{ width:52, height:52, borderRadius:16, background:"rgba(244,63,94,0.1)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
            <ShieldAlert style={{ width:24, height:24, color:"#f43f5e" }} />
          </div>
          <p style={{ color:"#fda4af", fontWeight:600, marginBottom:6 }}>{error}</p>
          <button onClick={fetchHistory} className="btn-outline" style={{ marginTop:12 }}>Try Again</button>
        </div>
      ) : records.length === 0 ? (
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} style={{ textAlign:"center", padding:"80px 24px" }}>
          <div style={{ width:64, height:64, borderRadius:20, background:"rgba(124,58,237,0.1)", border:"1px solid rgba(124,58,237,0.2)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
            <Inbox style={{ width:28, height:28, color:"#7c3aed" }} />
          </div>
          <h3 style={{ fontFamily:"var(--font-heading)", fontWeight:700, color:"#f1f5f9", fontSize:"1.2rem", marginBottom:8 }}>No saved analyses yet</h3>
          <p style={{ color:"#475569", fontSize:"0.88rem" }}>Complete an analysis and click "Save Report" to see it here.</p>
        </motion.div>
      ) : (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16, marginBottom:28 }}>
            <AnimatePresence>
              {visible.map((item, i) => (
                <HistoryCard key={item._id || i} item={item} onLoad={onLoadResult} index={i} />
              ))}
            </AnimatePresence>
          </div>
          {totalPages > 1 && (
            <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
              {Array.from({ length:totalPages }).map((_, i) => (
                <button key={i} onClick={() => setPage(i+1)}
                  style={{
                    width:36, height:36, borderRadius:10, border:"1px solid",
                    borderColor: page === i+1 ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.08)",
                    background:  page === i+1 ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.03)",
                    color:       page === i+1 ? "#c4b5fd" : "#64748b",
                    fontFamily:"var(--font-heading)", fontWeight:700, fontSize:"0.85rem", cursor:"pointer",
                  }}>
                  {i+1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
