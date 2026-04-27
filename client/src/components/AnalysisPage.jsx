import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Zap, Shield, Cpu, Database, Activity,
  CheckCircle2, Terminal, Wifi, Lock, Layers, ScanLine as ScanIcon
} from "lucide-react";
import CalculatorForm from "./CalculatorForm";

/* ── Boot terminal steps ─────────────────────────────────────── */
const BOOT = [
  { text: "SAFETYNET.AI NEURAL ANALYSIS TERMINAL v4.0", color: "#a78bfa", ms: 0 },
  { text: "Connecting to Groq LLaMA-3.3-70b neural core...", color: "#475569", ms: 280 },
  { text: "✓  Groq AI engine ONLINE  (llama-3.3-70b-versatile)", color: "#10b981", ms: 600 },
  { text: "Loading XGBoost ML models (regressor + classifier)...", color: "#475569", ms: 840 },
  { text: "✓  XGBoost ML engine READY  R²=0.949  Acc=85.3%", color: "#10b981", ms: 1080 },
  { text: "Loading 14-factor risk assessment matrix...", color: "#475569", ms: 1300 },
  { text: "✓  Risk engine READY", color: "#10b981", ms: 1540 },
  { text: "✓  India benchmarks ACTIVE  (RBI · SEBI · NHA)", color: "#10b981", ms: 1780 },
  { text: "✓  AES-256 secure session established", color: "#10b981", ms: 2020 },
  { text: "SYSTEM READY — Launching interface...", color: "#60a5fa", ms: 2320 },
];

/* ── Neural network animated particles ───────────────────────── */
function NeuralParticles() {
  const pts = useMemo(() => Array.from({ length: 28 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1.2 + Math.random() * 2.4,
    dur: 5 + Math.random() * 9,
    delay: Math.random() * 7,
    op: 0.06 + Math.random() * 0.14,
  })), []);

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1, overflow: "hidden" }}>
      {pts.map(p => (
        <motion.div
          key={p.id}
          style={{
            position: "absolute", left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size, borderRadius: "50%", background: "#a78bfa", opacity: p.op,
          }}
          animate={{ y: [0, -32, 0], opacity: [p.op, p.op * 3.5, p.op] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ── Sweeping scan line ──────────────────────────────────────── */
function ScanBeam() {
  return (
    <motion.div
      style={{
        position: "fixed", left: 0, right: 0, height: 1.5, zIndex: 2, pointerEvents: "none",
        background: "linear-gradient(90deg, transparent 0%, rgba(124,58,237,0.7) 30%, rgba(6,182,212,0.5) 70%, transparent 100%)",
        boxShadow: "0 0 18px rgba(124,58,237,0.5), 0 0 36px rgba(6,182,212,0.2)",
      }}
      animate={{ top: ["-2%", "102%"] }}
      transition={{ duration: 7, repeat: Infinity, ease: "linear", repeatDelay: 1.5 }}
    />
  );
}

/* ── Holographic corner bracket ─────────────────────────────── */
function HUDBracket({ pos = "tl", size = 22, thickness = 2, glow = false }) {
  const c = glow ? "rgba(124,58,237,0.85)" : "rgba(124,58,237,0.55)";
  const base = { position: "absolute", width: size, height: size };
  const dirs = {
    tl: { top: -1, left: -1, borderTop: `${thickness}px solid ${c}`, borderLeft:  `${thickness}px solid ${c}` },
    tr: { top: -1, right: -1, borderTop: `${thickness}px solid ${c}`, borderRight: `${thickness}px solid ${c}` },
    bl: { bottom: -1, left: -1, borderBottom: `${thickness}px solid ${c}`, borderLeft:  `${thickness}px solid ${c}` },
    br: { bottom: -1, right: -1, borderBottom: `${thickness}px solid ${c}`, borderRight: `${thickness}px solid ${c}` },
  };
  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.3 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      style={{ ...base, ...dirs[pos], zIndex: 3, pointerEvents: "none" }}
    />
  );
}

/* ── Animated status chip ────────────────────────────────────── */
const CHIP_COLORS = {
  online: { bg: "rgba(16,185,129,0.1)",   border: "rgba(16,185,129,0.3)", text: "#10b981", dot: "#10b981" },
  active: { bg: "rgba(124,58,237,0.12)",  border: "rgba(124,58,237,0.35)", text: "#a78bfa", dot: "#a78bfa" },
  info:   { bg: "rgba(96,165,250,0.1)",   border: "rgba(96,165,250,0.3)", text: "#60a5fa", dot: "#60a5fa" },
  cyan:   { bg: "rgba(6,182,212,0.1)",    border: "rgba(6,182,212,0.3)", text: "#22d3ee", dot: "#22d3ee" },
};

function StatusChip({ icon: Icon, label, status = "online", delay = 0 }) {
  const c = CHIP_COLORS[status] || CHIP_COLORS.online;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.88 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 320, damping: 26 }}
      style={{
        display: "flex", alignItems: "center", gap: 7,
        background: c.bg, border: `1px solid ${c.border}`,
        borderRadius: 8, padding: "6px 12px", backdropFilter: "blur(14px)",
      }}
    >
      <motion.div
        animate={{ scale: [1, 1.6, 1], opacity: [0.9, 0.4, 0.9] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, boxShadow: `0 0 7px ${c.dot}`, flexShrink: 0 }}
      />
      {Icon && <Icon style={{ width: 11, height: 11, color: c.text, flexShrink: 0 }} />}
      <span style={{ fontFamily: "monospace", fontSize: "0.62rem", fontWeight: 700, color: c.text, letterSpacing: "0.07em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
        {label}
      </span>
    </motion.div>
  );
}

/* ── Boot screen ─────────────────────────────────────────────── */
function BootScreen({ onDone }) {
  const [visible, setVisible] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timers = BOOT.map((s, i) =>
      setTimeout(() => {
        setVisible(i + 1);
        setProgress(Math.round(((i + 1) / BOOT.length) * 100));
      }, s.ms + 120)
    );
    const done = setTimeout(onDone, 3500);
    return () => { timers.forEach(clearTimeout); clearTimeout(done); };
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, filter: "blur(8px)" }}
      transition={{ exit: { duration: 0.55 } }}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "radial-gradient(ellipse at 40% 25%, rgba(124,58,237,0.18) 0%, #09090f 62%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Grid bg */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.07,
        backgroundImage: "linear-gradient(rgba(124,58,237,1) 1px, transparent 1px), linear-gradient(90deg,rgba(124,58,237,1) 1px, transparent 1px)",
        backgroundSize: "60px 60px", pointerEvents: "none",
      }} />

      {/* Corner decorations */}
      {(["tl","tr","bl","br"]).map(p => (
        <div key={p} style={{ position: "absolute",
          top:    p.startsWith("t") ? 20 : "auto", bottom: p.startsWith("b") ? 20 : "auto",
          left:   p.endsWith("l")   ? 20 : "auto", right:  p.endsWith("r")   ? 20 : "auto",
          width: 36, height: 36,
          borderTop:    p.startsWith("t") ? "2px solid rgba(124,58,237,0.5)" : "none",
          borderBottom: p.startsWith("b") ? "2px solid rgba(124,58,237,0.5)" : "none",
          borderLeft:   p.endsWith("l")   ? "2px solid rgba(124,58,237,0.5)" : "none",
          borderRight:  p.endsWith("r")   ? "2px solid rgba(124,58,237,0.5)" : "none",
        }} />
      ))}

      {/* Horizontal scan */}
      <motion.div
        style={{ position: "absolute", left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(124,58,237,0.6),transparent)", pointerEvents: "none" }}
        animate={{ top: ["-2%", "102%"] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
      />

      {/* Content */}
      <div style={{ maxWidth: 580, width: "100%", padding: "0 32px", position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <motion.div
          initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
          style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 44 }}
        >
          <motion.div
            animate={{ boxShadow: ["0 0 20px rgba(124,58,237,0.45)","0 0 60px rgba(124,58,237,0.9)","0 0 20px rgba(124,58,237,0.45)"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ width: 58, height: 58, borderRadius: 17, background: "linear-gradient(135deg,#7c3aed,#4c1d95)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
          >
            <Brain style={{ width: 26, height: 26, color: "white" }} />
          </motion.div>
          <div>
            <div style={{ fontFamily: "monospace", fontSize: "0.6rem", color: "#7c3aed", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: 5 }}>SafetyNet.ai</div>
            <div style={{ fontFamily: "monospace", fontWeight: 800, fontSize: "1.05rem", color: "#a78bfa", letterSpacing: "0.06em" }}>NEURAL ANALYSIS TERMINAL</div>
          </div>
        </motion.div>

        {/* Terminal output */}
        <div style={{ fontFamily: "monospace", fontSize: "0.79rem", lineHeight: 2.1, marginBottom: 30, minHeight: 180 }}>
          {BOOT.slice(0, visible).map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.22 }}
              style={{ color: s.color, display: "flex", alignItems: "center", gap: 8 }}
            >
              <span style={{ color: "#334155", userSelect: "none" }}>&gt;&nbsp;</span>
              {s.text}
              {i === visible - 1 && visible < BOOT.length && (
                <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.55, repeat: Infinity }} style={{ color: "#7c3aed" }}>█</motion.span>
              )}
            </motion.div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 999, overflow: "hidden" }}>
          <motion.div
            style={{ height: "100%", background: "linear-gradient(90deg,#7c3aed,#06b6d4)", boxShadow: "0 0 14px rgba(124,58,237,0.7)", borderRadius: 999 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          <span style={{ fontFamily: "monospace", fontSize: "0.6rem", color: "#334155" }}>
            {visible > 0 ? BOOT[visible - 1]?.text.slice(0, 28) + "…" : "Initializing…"}
          </span>
          <span style={{ fontFamily: "monospace", fontSize: "0.6rem", color: progress === 100 ? "#10b981" : "#475569" }}>
            {progress}% INITIALIZED
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Animated HUD data strip ─────────────────────────────────── */
function DataStrip() {
  const items = ["RISK MATRIX v3.1", "AI MODEL: LLAMA-3.3-70B · XGBOOST ML", "FACTORS: 14", "BENCHMARKS: RBI · SEBI · NHA", "ENCRYPTION: AES-256", "R²=0.949  ACC=85.3%", "STATUS: SECURE"];
  const doubled = [...items, ...items];
  return (
    <div style={{ overflow: "hidden", borderTop: "1px solid rgba(124,58,237,0.1)", borderBottom: "1px solid rgba(124,58,237,0.1)", background: "rgba(124,58,237,0.04)", marginBottom: 28 }}>
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        style={{ display: "flex", whiteSpace: "nowrap", padding: "8px 0" }}
      >
        {doubled.map((item, i) => (
          <span key={i} style={{ fontFamily: "monospace", fontSize: "0.62rem", color: "#334155", fontWeight: 700, letterSpacing: "0.08em", paddingRight: 48, display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#7c3aed", display: "inline-block", opacity: 0.7, flexShrink: 0 }} />
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN ANALYSIS PAGE
══════════════════════════════════════════════════════════════ */
export default function AnalysisPage({ onComplete }) {
  const [phase, setPhase] = useState("booting");

  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>

      {/* Fixed background layers */}
      <div style={{ position: "fixed", inset: 0, background: "#09090f", zIndex: 0 }} />

      {/* Grid */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.045,
        backgroundImage: "linear-gradient(rgba(124,58,237,1) 1px, transparent 1px), linear-gradient(90deg,rgba(124,58,237,1) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      {/* Hexagonal accent dots */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.025,
        backgroundImage: "radial-gradient(circle, #a78bfa 1px, transparent 1px)",
        backgroundSize: "30px 30px",
      }} />

      <NeuralParticles />
      <ScanBeam />

      {/* Ambient glow blobs */}
      <div style={{ position: "fixed", top: "15%", left: "8%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,0.13),transparent 70%)", filter: "blur(70px)", zIndex: 0, pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "15%", right: "8%", width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle,rgba(6,182,212,0.09),transparent 70%)", filter: "blur(70px)", zIndex: 0, pointerEvents: "none" }} />
      <div style={{ position: "fixed", top: "60%", left: "50%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(167,139,250,0.06),transparent 70%)", filter: "blur(80px)", transform: "translateX(-50%)", zIndex: 0, pointerEvents: "none" }} />

      {/* Boot screen */}
      <AnimatePresence>
        {phase === "booting" && <BootScreen onDone={() => setPhase("ready")} />}
      </AnimatePresence>

      {/* Main content */}
      <AnimatePresence>
        {phase === "ready" && (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
            style={{ position: "relative", zIndex: 10, padding: "28px 16px 80px" }}
          >
            <div style={{ maxWidth: 920, margin: "0 auto" }}>

              {/* ── Page header ────────────────────────────────── */}
              <motion.div
                initial={{ y: -22, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                style={{ marginBottom: 20 }}
              >
                {/* Eyebrow */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 10px rgba(16,185,129,0.8)" }}
                  />
                  <span style={{ fontFamily: "monospace", fontSize: "0.62rem", color: "#7c3aed", letterSpacing: "0.3em", textTransform: "uppercase" }}>◈ Neural Analysis Terminal v4.0</span>
                </div>

                {/* Title + chips row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14 }}>
                  <div>
                    <h1 style={{
                      fontFamily: "var(--font-heading)", fontWeight: 800,
                      fontSize: "clamp(1.5rem, 3.5vw, 2.2rem)", letterSpacing: "-0.03em", margin: 0, lineHeight: 1.15,
                    }}>
                      <span style={{ color: "#f1f5f9" }}>AI Emergency Fund</span>{" "}
                      <span style={{ background: "linear-gradient(135deg,#a78bfa 0%,#7c3aed 50%,#06b6d4 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Analysis Engine</span>
                    </h1>
                    <p style={{ color: "#475569", fontSize: "0.82rem", marginTop: 7, fontFamily: "monospace" }}>
                      14 factors · Personalised risk scoring · India-benchmarked · Real-time AI
                    </p>
                  </div>
                  {/* Status chips */}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                  <StatusChip icon={Zap}      label="AI Online"        status="online" delay={0.25} />
                  <StatusChip icon={Cpu}      label="LLaMA-3.3-70b"    status="active" delay={0.35} />
                  <StatusChip icon={Database} label="14 Factors"       status="info"   delay={0.45} />
                  <StatusChip icon={Layers}   label="XGBoost ML"       status="online" delay={0.55} />
                  <StatusChip icon={Lock}     label="Secure"           status="cyan"   delay={0.65} />
                  </div>
                </div>
              </motion.div>

              {/* ── Data strip ticker ──────────────────────────── */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <DataStrip />
              </motion.div>

              {/* ── HUD-framed form panel ─────────────────────── */}
              <motion.div
                initial={{ y: 36, opacity: 0, scale: 0.98 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ delay: 0.22, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                style={{ position: "relative" }}
              >
                {/* Outer glow aura */}
                <motion.div
                  animate={{ opacity: [0.35, 0.65, 0.35] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    position: "absolute", inset: -3, borderRadius: 26,
                    background: "linear-gradient(135deg,rgba(124,58,237,0.35),rgba(6,182,212,0.15),rgba(124,58,237,0.25))",
                    filter: "blur(6px)", zIndex: 0, pointerEvents: "none",
                  }}
                />

                {/* Corner brackets */}
                <HUDBracket pos="tl" size={26} thickness={2} />
                <HUDBracket pos="tr" size={26} thickness={2} />
                <HUDBracket pos="bl" size={26} thickness={2} />
                <HUDBracket pos="br" size={26} thickness={2} />

                {/* Top scanning line on panel */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, borderRadius: "20px 20px 0 0", overflow: "hidden", zIndex: 4, pointerEvents: "none" }}>
                  <motion.div
                    style={{ height: "100%", width: "35%", background: "linear-gradient(90deg,transparent,rgba(124,58,237,0.9),rgba(6,182,212,0.5),transparent)" }}
                    animate={{ x: ["-100%", "390%"] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
                  />
                </div>

                {/* HUD label top-right */}
                <motion.div
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}
                  style={{
                    position: "absolute", top: 12, right: 18, zIndex: 5,
                    display: "flex", alignItems: "center", gap: 6,
                    fontFamily: "monospace", fontSize: "0.58rem", color: "#334155",
                    letterSpacing: "0.12em", textTransform: "uppercase", pointerEvents: "none",
                  }}
                >
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
                    style={{ width: 5, height: 5, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px rgba(16,185,129,0.7)" }}
                  />
                  SN-AI · SESSION ACTIVE
                </motion.div>

                {/* Inner panel */}
                <div style={{ position: "relative", zIndex: 2, borderRadius: 22, overflow: "hidden", background: "rgba(255,255,255,0.015)", border: "1px solid rgba(124,58,237,0.18)" }}>
                  <CalculatorForm onComplete={onComplete} />
                </div>
              </motion.div>

              {/* ── Bottom status row ─────────────────────────── */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 22, flexWrap: "wrap" }}
              >
                {[
                  { icon: Shield, text: "No data stored · privacy-first" },
                  { icon: Brain,  text: "Powered by Groq LLaMA-3.1" },
                  { icon: Activity, text: "14 risk factors scored" },
                ].map((it, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, color: "#334155", fontSize: "0.72rem", fontFamily: "monospace" }}>
                    <it.icon style={{ width: 12, height: 12, color: "#7c3aed" }} />
                    {it.text}
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
