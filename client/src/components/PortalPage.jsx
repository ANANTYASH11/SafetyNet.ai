import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, History, ArrowRight, Shield, TrendingUp,
  Zap, Activity, Clock, Database, CheckCircle2, Sparkles,
  ChevronRight, BarChart3, Star
} from "lucide-react";

/* ── Floating particles ─────────────────────────────────────── */
function Particles() {
  const pts = useMemo(() => Array.from({ length: 22 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1.2 + Math.random() * 2.8,
    dur: 6 + Math.random() * 10,
    delay: Math.random() * 8,
    op: 0.05 + Math.random() * 0.13,
    color: i % 3 === 0 ? "#06b6d4" : i % 3 === 1 ? "#a78bfa" : "#34d399",
  })), []);
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
      {pts.map(p => (
        <motion.div
          key={p.id}
          style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, borderRadius: "50%", background: p.color, opacity: p.op }}
          animate={{ y: [0, -30, 0], opacity: [p.op, p.op * 3, p.op] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ── Animated action card ───────────────────────────────────── */
function ActionCard({ icon: Icon, title, subtitle, desc, features, color, glow, gradient, onClick, delay = 0, badge }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.button
      onClick={onClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      initial={{ opacity: 0, y: 36, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8, scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      style={{
        position: "relative", width: "100%", textAlign: "left",
        background: "rgba(255,255,255,0.035)", cursor: "pointer",
        border: `1px solid ${hovered ? color + "50" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 26, padding: "36px 34px 32px", overflow: "hidden",
        boxShadow: hovered ? `0 32px 80px ${glow}, 0 0 0 1px ${color}30` : "0 8px 32px rgba(0,0,0,0.4)",
        transition: "border 0.25s, box-shadow 0.3s",
      }}
    >
      {/* Animated gradient bg on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "absolute", inset: 0, background: gradient, pointerEvents: "none", zIndex: 0 }}
          />
        )}
      </AnimatePresence>

      {/* Top accent line */}
      <motion.div
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${color},transparent)`, zIndex: 1 }}
        animate={{ opacity: hovered ? 1 : 0.4 }}
        transition={{ duration: 0.25 }}
      />

      {/* Shimmer sweep */}
      <motion.div
        style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "40%", background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent)", zIndex: 1, pointerEvents: "none" }}
        animate={hovered ? { x: ["-100%", "260%"] } : {}}
        transition={{ duration: 0.9, ease: "easeInOut" }}
      />

      {/* Glow blob */}
      <div style={{ position: "absolute", top: -40, right: -40, width: 220, height: 220, borderRadius: "50%", background: `radial-gradient(circle,${glow},transparent 70%)`, pointerEvents: "none", filter: "blur(40px)", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 2 }}>
        {/* Badge + icon row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <motion.div
            animate={hovered ? { boxShadow: `0 8px 32px ${glow}` } : {}}
            style={{ width: 56, height: 56, borderRadius: 18, background: gradient, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
          >
            <Icon style={{ width: 26, height: 26, color: "white" }} />
          </motion.div>
          {badge && (
            <motion.span
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: delay + 0.35, type: "spring", stiffness: 380 }}
              style={{ background: `${color}18`, color, border: `1px solid ${color}35`, padding: "4px 10px", borderRadius: 999, fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}
            >
              {badge}
            </motion.span>
          )}
        </div>

        {/* Title */}
        <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.55rem", letterSpacing: "-0.03em", color: "#f1f5f9", margin: "0 0 8px", lineHeight: 1.2 }}>
          {title}
        </h2>
        <p style={{ fontSize: "0.75rem", color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14, fontFamily: "monospace" }}>
          {subtitle}
        </p>
        <p style={{ color: "#475569", fontSize: "0.88rem", lineHeight: 1.75, marginBottom: 26 }}>{desc}</p>

        {/* Feature list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 30 }}>
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.25 + i * 0.07 }}
              style={{ display: "flex", alignItems: "center", gap: 9 }}
            >
              <CheckCircle2 style={{ width: 13, height: 13, color, flexShrink: 0 }} />
              <span style={{ color: "#64748b", fontSize: "0.82rem" }}>{f}</span>
            </motion.div>
          ))}
        </div>

        {/* CTA row */}
        <motion.div
          animate={hovered ? { x: 4 } : { x: 0 }}
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.88rem", color }}>
            {title === "Start Analysis" ? "Begin Analysis" : "View History"}
          </span>
          <motion.div animate={hovered ? { x: 4 } : { x: 0 }} transition={{ type: "spring", stiffness: 400 }}>
            <ArrowRight style={{ width: 15, height: 15, color }} />
          </motion.div>
        </motion.div>
      </div>
    </motion.button>
  );
}

/* ── Stat mini-chip ─────────────────────────────────────────── */
function MiniStat({ label, value, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 300, damping: 24 }}
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "12px 18px", textAlign: "center" }}
    >
      <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.2rem", color, lineHeight: 1 }}>{value}</div>
      <div style={{ color: "#334155", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 5 }}>{label}</div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PORTAL PAGE
═══════════════════════════════════════════════════════════════ */
export default function PortalPage({ user, onAnalyze, onHistory }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      {/* Fixed bg layers */}
      <div style={{ position: "fixed", inset: 0, background: "#09090f", zIndex: 0 }} />
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.03,
        backgroundImage: "linear-gradient(rgba(124,58,237,1) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,1) 1px,transparent 1px)",
        backgroundSize: "80px 80px",
      }} />
      {/* Ambient glows */}
      <div style={{ position: "fixed", top: "10%", left: "5%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,0.11),transparent 70%)", filter: "blur(80px)", zIndex: 0, pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "10%", right: "5%", width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle,rgba(6,182,212,0.08),transparent 70%)", filter: "blur(80px)", zIndex: 0, pointerEvents: "none" }} />

      <Particles />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 10, maxWidth: 980, margin: "0 auto", padding: "52px 20px 80px" }}>

        {/* ── Welcome header ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: 48 }}
        >
          {/* Status pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 999, padding: "5px 14px", marginBottom: 22 }}
          >
            <motion.div
              animate={{ scale: [1, 1.7, 1], opacity: [0.9, 0.4, 0.9] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px rgba(16,185,129,0.7)" }}
            />
            <span style={{ fontFamily: "monospace", fontSize: "0.65rem", fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Session Active · SafetyNet.ai
            </span>
          </motion.div>

          {/* Greeting */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "clamp(1.8rem,4.5vw,2.9rem)", letterSpacing: "-0.03em", lineHeight: 1.12, margin: "0 0 10px" }}>
                <span style={{ color: "#64748b", fontWeight: 600, fontSize: "0.6em" }}>{greeting},</span>
                <br />
                <span style={{ background: "linear-gradient(135deg,#f1f5f9 0%,#c4b5fd 55%,#a78bfa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  {firstName}
                </span>
                <motion.span
                  animate={{ rotate: [0, 16, -8, 16, 0] }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  style={{ display: "inline-block", marginLeft: 10, WebkitTextFillColor: "initial", color: "white" }}
                >
                  👋
                </motion.span>
              </h1>
              <p style={{ color: "#475569", fontSize: "0.92rem", lineHeight: 1.7, margin: 0 }}>
                Your AI-powered financial safety analysis dashboard. Choose an action below to get started.
              </p>
            </div>

            {/* User avatar */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 280, damping: 20 }}
              style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.55rem", fontWeight: 800, color: "white", flexShrink: 0, boxShadow: "0 8px 28px rgba(124,58,237,0.45), 0 0 0 3px rgba(124,58,237,0.2)" }}
            >
              {user?.name?.[0]?.toUpperCase() || "U"}
            </motion.div>
          </div>

          {/* Mini stats row */}
          <div style={{ display: "flex", gap: 10, marginTop: 28, flexWrap: "wrap" }}>
            <MiniStat label="AI Engine" value="Online" color="#10b981" delay={0.3} />
            <MiniStat label="Risk Factors" value="14" color="#a78bfa" delay={0.36} />
            <MiniStat label="Benchmarks" value="RBI · SEBI" color="#60a5fa" delay={0.42} />
            <MiniStat label="Analysis Time" value="~2 min" color="#f59e0b" delay={0.48} />
          </div>
        </motion.div>

        {/* ── Divider ─────────────────────────────────────────── */}
        <motion.div
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(124,58,237,0.4),rgba(6,182,212,0.3),transparent)", marginBottom: 40, transformOrigin: "left" }}
        />

        {/* ── Action cards ────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))", gap: 20, marginBottom: 40 }}>
          <ActionCard
            icon={Brain}
            title="Start Analysis"
            subtitle="AI · 14 factors · Real-time"
            desc="Get a personalised emergency fund target with AI-powered risk scoring. Includes investment split, 12-month roadmap, and actionable steps."
            features={[
              "14 risk factors analysed in real-time",
              "Groq LLaMA-3.1 AI insights",
              "3-tier investment architecture",
              "Downloadable PDF report",
            ]}
            color="#a78bfa"
            glow="rgba(124,58,237,0.25)"
            gradient="linear-gradient(135deg,#7c3aed,#6d28d9)"
            badge="AI Powered"
            onClick={onAnalyze}
            delay={0.15}
          />
          <ActionCard
            icon={History}
            title="My History"
            subtitle="Saved reports · Track progress"
            desc="View all your previous analyses, compare risk scores over time, and reload any past report for detailed review."
            features={[
              "All past analyses at a glance",
              "Compare risk score over time",
              "Reload any previous result",
              "Track your fund progress",
            ]}
            color="#34d399"
            glow="rgba(52,211,153,0.2)"
            gradient="linear-gradient(135deg,#059669,#047857)"
            badge="Your Records"
            onClick={onHistory}
            delay={0.25}
          />
        </div>

        {/* ── Quick tips strip ────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.12)", borderRadius: 18, padding: "22px 28px" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Sparkles style={{ width: 14, height: 14, color: "#a78bfa" }} />
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.82rem", color: "#c4b5fd", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Quick Facts
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
            {[
              { icon: BarChart3, text: "68% of Indians have zero emergency fund", color: "#f43f5e" },
              { icon: TrendingUp, text: "Ideal fund covers 6–12 months of expenses", color: "#10b981" },
              { icon: Shield, text: "Medical emergencies cost avg ₹2.8 lakh", color: "#f59e0b" },
              { icon: Zap, text: "AI analyses your profile in under 2 minutes", color: "#a78bfa" },
            ].map((it, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.07 }}
                style={{ display: "flex", alignItems: "flex-start", gap: 10 }}
              >
                <div style={{ width: 26, height: 26, borderRadius: 8, background: `${it.color}14`, border: `1px solid ${it.color}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  <it.icon style={{ width: 12, height: 12, color: it.color }} />
                </div>
                <span style={{ color: "#475569", fontSize: "0.78rem", lineHeight: 1.6 }}>{it.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
