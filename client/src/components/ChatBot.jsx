/**
 * components/ChatBot.jsx  — Enhanced v2
 * ─────────────────────────────────────────────────────────────────────────────
 * New features vs v1:
 *  • Voice INPUT  — tap mic, speak, transcript auto-fills the box
 *  • Voice OUTPUT — AI reads every response aloud (toggle in header)
 *    - Per-bubble play / stop button
 *    - Animated sound-wave inside the bubble while speaking
 *    - Stop-all button in header while TTS is active
 *  • Thinking enhancement — rotating context labels while waiting
 *  • Message reactions   — thumbs up / down on each AI bubble
 *  • Minimize mode       — collapses to a slim header strip
 *  • Export chat         — downloads .txt transcript
 *  • Scroll-to-bottom    — FAB appears when user scrolls up
 *  • Character counter   — live count + red at 1000
 *  • Keyboard shortcut   — Ctrl / Cmd + K  opens / closes
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, X, Send, Bot, User, Copy, CheckCheck,
  Trash2, Sparkles, TrendingUp, ShieldCheck, PiggyBank,
  Calculator, AlertCircle, Zap, Mic, MicOff,
  Volume2, VolumeX, StopCircle,
  Minimize2, Maximize2, Download, ChevronDown,
  ThumbsUp, ThumbsDown
} from "lucide-react";

/* ── constants ────────────────────────────────────────────────── */
const API = "http://localhost:5001/api";
const FMT = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

const THINKING_LABELS = [
  "Analyzing your question…",
  "Checking financial benchmarks…",
  "Reviewing RBI / SEBI guidelines…",
  "Calculating best advice…",
  "Formulating response…",
  "Consulting Indian tax rules…",
];

/* ── browser feature detection (evaluated once, outside component) */
const SpeechRecognitionAPI =
  typeof window !== "undefined" &&
  (window.SpeechRecognition || window.webkitSpeechRecognition);
const HAS_STT = !!SpeechRecognitionAPI;
const HAS_TTS = typeof window !== "undefined" && !!window.speechSynthesis;

/* ── Voice cache — loaded eagerly so speak() never waits ────── */
let _voicesCache = [];
function getVoices() {
  if (_voicesCache.length > 0) return _voicesCache;
  if (!HAS_TTS) return [];
  _voicesCache = window.speechSynthesis.getVoices();
  return _voicesCache;
}
if (HAS_TTS) {
  // Populate immediately; also listen for the async load event (Chrome)
  _voicesCache = window.speechSynthesis.getVoices();
  window.speechSynthesis.addEventListener("voiceschanged", () => {
    _voicesCache = window.speechSynthesis.getVoices();
  });
}

/* ══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
══════════════════════════════════════════════════════════════ */

/* ── Animated sound-wave bars (inside speaking bubble) ─────── */
function SpeakingWave() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2.5, height: 14 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          animate={{ scaleY: [0.25, 1, 0.25] }}
          transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.09, ease: "easeInOut" }}
          style={{
            width: 3, height: "100%",
            background: "#a78bfa", borderRadius: 2,
            transformOrigin: "center",
          }}
        />
      ))}
    </div>
  );
}

/* ── Thinking indicator with rotating label ─────────────────── */
function ThinkingBubble({ label, dark }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 12 }}
    >
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        background: "linear-gradient(135deg,#1e1b4b,#4c1d95)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, border: "1.5px solid rgba(167,139,250,0.3)",
      }}>
        <Bot style={{ width: 13, height: 13, color: "#a78bfa" }} />
      </div>
      <div style={{
        background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
        border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
        borderRadius: "4px 16px 16px 16px",
        padding: "10px 14px",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <div style={{ display: "flex", gap: 3 }}>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
              style={{ width: 7, height: 7, borderRadius: "50%", background: "#a78bfa" }}
            />
          ))}
        </div>
        <motion.span
          key={label}
          initial={{ opacity: 0, x: 6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          style={{ fontSize: "0.72rem", color: "#64748b" }}
        >
          {label}
        </motion.span>
      </div>
    </motion.div>
  );
}

/* ── Single chat bubble ─────────────────────────────────────── */
function Bubble({ msg, dark, isSpeaking, onSpeak, reaction, onReact }) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";

  async function copyText() {
    try { await navigator.clipboard.writeText(msg.content); } catch { return; }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const bg  = isUser
    ? "linear-gradient(135deg,#7c3aed,#6d28d9)"
    : dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  const clr = isUser ? "#fff" : dark ? "#e2e8f0" : "#1e293b";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: "flex",
        flexDirection: isUser ? "row-reverse" : "row",
        alignItems: "flex-end",
        gap: 8, marginBottom: 12,
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
        background: isUser
          ? "linear-gradient(135deg,#7c3aed,#06b6d4)"
          : "linear-gradient(135deg,#1e1b4b,#4c1d95)",
        display: "flex", alignItems: "center", justifyContent: "center",
        border: `1.5px solid ${isUser ? "rgba(124,58,237,0.5)" : "rgba(167,139,250,0.3)"}`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
      }}>
        {isUser
          ? <User style={{ width: 12, height: 12, color: "white" }} />
          : <Bot  style={{ width: 13, height: 13, color: "#a78bfa" }} />
        }
      </div>

      <div style={{ maxWidth: "78%" }}>
        {/* Bubble body */}
        <div style={{
          background: bg, color: clr,
          padding: "10px 14px",
          borderRadius: isUser ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
          fontSize: "0.83rem", lineHeight: 1.65,
          border: isUser ? "none" : `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
          boxShadow: isUser ? "0 4px 16px rgba(124,58,237,0.3)" : "0 2px 8px rgba(0,0,0,0.12)",
          whiteSpace: "pre-wrap", wordBreak: "break-word",
          outline: isSpeaking ? "2px solid rgba(167,139,250,0.45)" : "none",
          outlineOffset: 2,
          transition: "outline 0.2s",
        }}>
          {msg.content}
          {isSpeaking && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              style={{ marginTop: 8, paddingTop: 6, borderTop: "1px solid rgba(167,139,250,0.2)" }}
            >
              <SpeakingWave />
            </motion.div>
          )}
        </div>

        {/* Footer: timestamp + actions */}
        <div style={{
          display: "flex", alignItems: "center", gap: 3, marginTop: 4,
          justifyContent: isUser ? "flex-end" : "flex-start",
        }}>
          <span style={{ fontSize: "0.6rem", color: "#475569" }}>
            {new Date(msg.ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </span>

          {!isUser && (
            <>
              <button onClick={copyText} title="Copy"
                style={{ background: "none", border: "none", cursor: "pointer", padding: "1px 3px", borderRadius: 4, display: "flex", color: copied ? "#10b981" : "#475569" }}>
                {copied ? <CheckCheck style={{ width: 10, height: 10 }} /> : <Copy style={{ width: 10, height: 10 }} />}
              </button>

              {HAS_TTS && (
                <button onClick={onSpeak} title={isSpeaking ? "Stop" : "Read aloud"}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: "1px 3px", borderRadius: 4, display: "flex", color: isSpeaking ? "#a78bfa" : "#475569" }}>
                  {isSpeaking
                    ? <StopCircle style={{ width: 10, height: 10 }} />
                    : <Volume2    style={{ width: 10, height: 10 }} />
                  }
                </button>
              )}

              <button onClick={() => onReact("up")} title="Helpful"
                style={{ background: "none", border: "none", cursor: "pointer", padding: "1px 3px", borderRadius: 4, display: "flex", color: reaction === "up" ? "#10b981" : "#475569" }}>
                <ThumbsUp style={{ width: 10, height: 10 }} />
              </button>
              <button onClick={() => onReact("down")} title="Not helpful"
                style={{ background: "none", border: "none", cursor: "pointer", padding: "1px 3px", borderRadius: 4, display: "flex", color: reaction === "down" ? "#f43f5e" : "#475569" }}>
                <ThumbsDown style={{ width: 10, height: 10 }} />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Quick suggestion chips ─────────────────────────────────── */
const BASE_CHIPS = [
  { icon: Calculator, text: "How much emergency fund do I need?" },
  { icon: PiggyBank,  text: "Best liquid savings options in India?" },
  { icon: TrendingUp, text: "How do I start investing with ₹5,000/month?" },
  { icon: ShieldCheck,text: "Why is health insurance important?" },
  { icon: AlertCircle,text: "How to get out of debt faster?" },
  { icon: Zap,        text: "What is a good debt-to-income ratio?" },
];

function contextChips(ctx) {
  if (!ctx) return BASE_CHIPS;
  const extra = [];
  if (ctx.riskScore >= 60)
    extra.push({ icon: AlertCircle, text: `My risk score is ${ctx.riskScore} — what should I fix first?` });
  if ((ctx.inputs?.emi || 0) > 0)
    extra.push({ icon: Calculator,  text: "How do I pay off my EMIs faster?" });
  if ((ctx.monthsCovered || 0) < 3)
    extra.push({ icon: PiggyBank,   text: "How do I build an emergency fund quickly?" });
  extra.push({ icon: TrendingUp, text: `How do I reach my ${FMT(ctx.recommendedFund || 0)} target?` });
  return [...extra, ...BASE_CHIPS.slice(0, 4)];
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function ChatBot({ analysisContext = null, dark = true }) {
  /* UI */
  const [open,          setOpen]          = useState(false);
  const [minimized,     setMinimized]     = useState(false);
  const [hasNew,        setHasNew]        = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  /* Chat */
  const [messages,  setMessages]  = useState([]);
  const [input,     setInput]     = useState("");
  const [thinking,  setThinking]  = useState(false);
  const [thinkLabel,setThinkLabel]= useState(THINKING_LABELS[0]);
  const [showChips, setShowChips] = useState(true);
  const [reactions, setReactions] = useState({});

  /* Voice */
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [listening,    setListening]    = useState(false);
  const [interimText,  setInterimText]  = useState("");
  const [speakingId,   setSpeakingId]   = useState(null);
  const speakingId$    = useRef(null); // ref mirror — avoids stale closures in speak()

  /* Refs */
  const bottomRef        = useRef(null);
  const inputRef         = useRef(null);
  const recognRef        = useRef(null);
  const thinkTimer       = useRef(null);
  const voiceEnabled$    = useRef(voiceEnabled);
  const finalTranscript$ = useRef(""); // accumulates confirmed words while continuous mic is open

  useEffect(() => { voiceEnabled$.current = voiceEnabled; }, [voiceEnabled]);
  useEffect(() => { speakingId$.current   = speakingId;   }, [speakingId]);

  /* ── Rotate thinking label ──────────────────────────────── */
  useEffect(() => {
    if (thinking) {
      let i = 0;
      thinkTimer.current = setInterval(() => {
        i = (i + 1) % THINKING_LABELS.length;
        setThinkLabel(THINKING_LABELS[i]);
      }, 1400);
    } else {
      clearInterval(thinkTimer.current);
      setThinkLabel(THINKING_LABELS[0]);
    }
    return () => clearInterval(thinkTimer.current);
  }, [thinking]);

  /* ── One-time setup ─────────────────────────────────────── */
  useEffect(() => {
    function onGlobalKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", onGlobalKey);
    return () => {
      window.removeEventListener("keydown", onGlobalKey);
      window.speechSynthesis?.cancel();
    };
  }, []);

  /* ── Greeting on first open ─────────────────────────────── */
  useEffect(() => {
    if (open && messages.length === 0) {
      const greeting = analysisContext
        ? `Hi! 👋 I've loaded your financial profile.\n\nYour ${analysisContext.riskLevel} Risk score is ${analysisContext.riskScore}/100 and your target emergency fund is ${FMT(analysisContext.recommendedFund || 0)}.\n\nAsk me anything — improving your score, where to save, how to invest, or anything else!`
        : "Hi! 👋 I'm your SafetyNet.ai financial assistant.\n\nI specialise in Indian personal finance — emergency funds, savings, debt, insurance, and more.\n\nWhat would you like to know?";
      setMessages([{ role: "assistant", content: greeting, ts: Date.now(), id: "greeting" }]);
    }
    if (open) {
      setHasNew(false);
      setMinimized(false);
      setTimeout(() => inputRef.current?.focus(), 300);
      // Pre-warm Chrome's audio engine with a zero-length silent utterance
      // so the first real TTS fires instantly (requires a user gesture = opening the panel)
      if (HAS_TTS) {
        const warmup = new SpeechSynthesisUtterance(" ");
        warmup.volume = 0;
        warmup.rate   = 10;
        // Also force-load voices now if not yet cached
        if (_voicesCache.length === 0) _voicesCache = window.speechSynthesis.getVoices();
        window.speechSynthesis.speak(warmup);
      }
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Auto-scroll ────────────────────────────────────────── */
  useEffect(() => {
    if (!showScrollBtn) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking, showScrollBtn]);

  /* ── TTS speak / stop ───────────────────────────────────── */
  function speak(text, id) {
    if (!HAS_TTS) return;
    // Toggle off if same bubble tapped again
    if (speakingId$.current === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    window.speechSynthesis.cancel();

    const clean = text
      .replace(/[*_`#>~]/g, "")
      .replace(/\n{2,}/g, ". ")
      .replace(/\n/g, " ");

    const utt = new SpeechSynthesisUtterance(clean);
    utt.lang  = "en-IN";
    utt.rate  = 0.93;
    utt.pitch = 1.05;

    // Pick best available voice from pre-loaded cache
    const voices    = getVoices();
    const preferred = voices.find((v) => v.lang === "en-IN")
      || voices.find((v) => /\ben[-_]IN\b/i.test(v.lang))
      || voices.find((v) => v.lang.startsWith("en-GB"))
      || voices.find((v) => v.lang.startsWith("en-"))
      || voices[0];
    if (preferred) utt.voice = preferred;

    setSpeakingId(id);
    speakingId$.current = id;
    utt.onend   = () => { setSpeakingId(null); speakingId$.current = null; };
    utt.onerror = () => { setSpeakingId(null); speakingId$.current = null; };
    window.speechSynthesis.speak(utt);
  }

  function stopSpeaking() {
    window.speechSynthesis?.cancel();
    setSpeakingId(null);
  }

  /* ── Mic toggle (continuous — stays open until user stops or sends) ── */
  function toggleMic() {
    if (listening) {
      recognRef.current?.stop();
      // onend handler below will flush finalTranscript$ → input and set listening=false
      return;
    }
    if (!HAS_STT) return;
    finalTranscript$.current = "";

    const rec = new SpeechRecognitionAPI();
    rec.lang           = "en-IN";
    rec.continuous     = true;   // keep recording until manually stopped
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onstart = () => setListening(true);

    rec.onresult = (e) => {
      let newFinal   = "";
      let newInterim = "";
      // Only process results from the last event batch
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          newFinal += e.results[i][0].transcript;
        } else {
          newInterim += e.results[i][0].transcript;
        }
      }
      if (newFinal) {
        finalTranscript$.current += (finalTranscript$.current ? " " : "") + newFinal.trim();
        setInput(finalTranscript$.current);
      }
      setInterimText(newInterim);
    };

    rec.onend = () => {
      setListening(false);
      setInterimText("");
      // Make sure final accumulated text is in the input box
      if (finalTranscript$.current) setInput(finalTranscript$.current);
    };

    rec.onerror = (e) => {
      // "no-speech" is normal in continuous mode — ignore it, don't stop
      if (e.error === "no-speech") return;
      setListening(false);
      setInterimText("");
    };

    recognRef.current = rec;
    rec.start();
  }

  /* ── Send ───────────────────────────────────────────────── */
  const send = useCallback(
    async (text) => {
      const msg = (text ?? input).trim();
      if (!msg || thinking) return;
      setInput("");
      setInterimText("");
      setShowChips(false);
      // Stop mic first; we already have the text captured in `msg` above
      if (listening) {
        recognRef.current?.stop();
        setListening(false);
        finalTranscript$.current = "";
      }

      const replyId = `a-${Date.now()}`;
      setMessages((prev) => [...prev, { role: "user", content: msg, ts: Date.now(), id: `u-${Date.now()}` }]);
      setThinking(true);

      try {
        const history = messages.slice(-8).map((m) => ({ role: m.role, content: m.content }));
        const res   = await fetch(`${API}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: msg, history, context: analysisContext || undefined }),
        });
        const data  = await res.json();
        const reply = data.reply || "Sorry, I couldn't process that.";
        setMessages((prev) => [...prev, { role: "assistant", content: reply, ts: Date.now(), id: replyId }]);
        if (!open) setHasNew(true);
        // Speak immediately — no delay; voices are pre-loaded
        if (voiceEnabled$.current) speak(reply, replyId);
      } catch {
        setMessages((prev) => [...prev, {
          role: "assistant",
          content: "Connection error — make sure the server is running on port 5001.",
          ts: Date.now(), id: `err-${Date.now()}`,
        }]);
      } finally {
        setThinking(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input, thinking, messages, analysisContext, open, listening]
  );

  function onInputKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  /* ── Clear ──────────────────────────────────────────────── */
  function clearChat() {
    stopSpeaking();
    setMessages([]);
    setShowChips(true);
    setReactions({});
    setTimeout(() => {
      setMessages([{
        role: "assistant",
        content: analysisContext
          ? `Cleared! Ask me anything about your ${analysisContext.riskLevel} Risk profile.`
          : "Cleared! How can I help with your finances?",
        ts: Date.now(), id: `greet-${Date.now()}`,
      }]);
    }, 80);
  }

  /* ── Export .txt ────────────────────────────────────────── */
  function exportChat() {
    if (messages.length === 0) return;
    const lines = messages.map((m) => {
      const time = new Date(m.ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
      return `[${time}] ${m.role === "user" ? "You" : "SafetyNet.ai"}:\n${m.content}`;
    });
    const header = `SafetyNet.ai Chat Export\nDate: ${new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}\n${"─".repeat(44)}\n\n`;
    const blob = new Blob([header + lines.join("\n\n")], { type: "text/plain;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `safetynet-chat-${Date.now()}.txt`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  }

  /* ── Colours ────────────────────────────────────────────── */
  const panelBg  = dark ? "rgba(9,9,15,0.97)"     : "rgba(248,250,252,0.98)";
  const panelBdr = dark ? "rgba(124,58,237,0.35)"  : "rgba(124,58,237,0.2)";
  const headerBg = dark ? "linear-gradient(135deg,#1e1040,#2d1b69)" : "linear-gradient(135deg,#7c3aed,#6d28d9)";
  const inputBg  = dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const inputBdr = dark ? "rgba(255,255,255,0.1)"  : "rgba(0,0,0,0.12)";
  const inputClr = dark ? "#f1f5f9"                : "#1e293b";
  const chipBg   = dark ? "rgba(124,58,237,0.1)"   : "rgba(124,58,237,0.07)";
  const chipBdr  = dark ? "rgba(124,58,237,0.25)"  : "rgba(124,58,237,0.2)";
  const chipClr  = dark ? "#c4b5fd"                : "#6d28d9";

  const chips     = contextChips(analysisContext);
  const charCount = input.length;
  const overLimit = charCount > 1000;
  const canSend   = input.trim().length > 0 && !thinking && !overLimit;

  /* ── Status label ───────────────────────────────────────── */
  const statusLabel = speakingId   ? "speaking…"
    : listening    ? "listening…"
    : thinking     ? "thinking…"
    : "AI Assistant · Online";

  /* ════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════ */
  return (
    <>
      {/* ── Floating trigger ──────────────────────────────── */}
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9990 }}>
        <AnimatePresence>
          {!open && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
            >
              <motion.div
                animate={{ scale: [1, 1.55, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                style={{ position: "absolute", inset: -6, borderRadius: "50%", background: "rgba(124,58,237,0.35)", pointerEvents: "none" }}
              />
              {hasNew && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: "50%", background: "#f43f5e", border: "2px solid white", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "0.5rem", color: "white", fontWeight: 800 }}>!</span>
                </motion.div>
              )}
              <motion.button
                onClick={() => setOpen(true)}
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.93 }}
                title="AI financial assistant (Ctrl+K)"
                style={{
                  width: 58, height: 58, borderRadius: "50%", border: "none", cursor: "pointer",
                  background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 8px 32px rgba(124,58,237,0.55), 0 0 0 1.5px rgba(124,58,237,0.4)",
                  position: "relative",
                }}
              >
                <MessageCircle style={{ width: 24, height: 24, color: "white" }} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Minimized strip ───────────────────────────────── */}
      <AnimatePresence>
        {open && minimized && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            onClick={() => setMinimized(false)}
            style={{
              position: "fixed", bottom: 24, right: 24, zIndex: 9990,
              background: headerBg, borderRadius: 16, padding: "10px 16px",
              display: "flex", alignItems: "center", gap: 10,
              boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(124,58,237,0.3)",
              cursor: "pointer", minWidth: 220,
            }}
          >
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Bot style={{ width: 14, height: 14, color: "white" }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: "white", fontSize: "0.82rem" }}>SafetyNet.ai</div>
              <div style={{ fontSize: "0.63rem", color: "rgba(196,181,253,0.8)" }}>{speakingId ? "Speaking…" : "Click to expand"}</div>
            </div>
            {speakingId && <SpeakingWave />}
            <Maximize2 style={{ width: 13, height: 13, color: "rgba(255,255,255,0.7)" }} />
            <button
              onClick={(e) => { e.stopPropagation(); stopSpeaking(); setOpen(false); }}
              style={{ background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", borderRadius: 6, padding: 5, display: "flex", color: "white" }}
            >
              <X style={{ width: 12, height: 12 }} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Full panel ────────────────────────────────────── */}
      <AnimatePresence>
        {open && !minimized && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{   opacity: 0, y: 60, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            style={{
              position: "fixed", bottom: 24, right: 24, zIndex: 9990,
              width: 390, height: 590,
              background: panelBg,
              border: `1px solid ${panelBdr}`,
              borderRadius: 22,
              display: "flex", flexDirection: "column",
              boxShadow: "0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(124,58,237,0.2)",
              backdropFilter: "blur(32px)",
              overflow: "hidden",
            }}
          >
            {/* ── HEADER ──────────────────────────────────── */}
            <div style={{
              background: headerBg,
              padding: "12px 14px",
              display: "flex", alignItems: "center", gap: 9,
              flexShrink: 0,
              borderBottom: "1px solid rgba(124,58,237,0.3)",
            }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1.5px solid rgba(255,255,255,0.25)" }}>
                <Bot style={{ width: 16, height: 16, color: "white" }} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: "white", fontSize: "0.88rem", lineHeight: 1 }}>SafetyNet.ai</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
                  {speakingId ? (
                    <SpeakingWave />
                  ) : (
                    <motion.div
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: listening ? 0.7 : 1.6, repeat: Infinity }}
                      style={{ width: 6, height: 6, borderRadius: "50%", background: listening ? "#f43f5e" : "#10b981", boxShadow: `0 0 6px ${listening ? "rgba(244,63,94,0.8)" : "rgba(16,185,129,0.8)"}` }}
                    />
                  )}
                  <span style={{ fontSize: "0.62rem", color: "rgba(196,181,253,0.9)", fontFamily: "monospace" }}>
                    {statusLabel}
                  </span>
                </div>
              </div>

              {/* Buttons: stop → auto-speak → export → clear → minimize → close */}
              <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                {speakingId && (
                  <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }}
                    onClick={stopSpeaking} title="Stop speaking"
                    style={{ background: "rgba(244,63,94,0.2)", border: "1px solid rgba(244,63,94,0.4)", cursor: "pointer", borderRadius: 7, padding: 5, color: "#fca5a5", display: "flex" }}>
                    <StopCircle style={{ width: 12, height: 12 }} />
                  </motion.button>
                )}

                {HAS_TTS && (
                  <button
                    onClick={() => { setVoiceEnabled((v) => !v); if (speakingId) stopSpeaking(); }}
                    title={voiceEnabled ? "Auto-speak ON — click to disable" : "Auto-speak OFF — click to enable"}
                    style={{ background: voiceEnabled ? "rgba(167,139,250,0.25)" : "rgba(255,255,255,0.1)", border: voiceEnabled ? "1px solid rgba(167,139,250,0.5)" : "none", cursor: "pointer", borderRadius: 7, padding: 5, color: voiceEnabled ? "#c4b5fd" : "rgba(255,255,255,0.7)", display: "flex" }}>
                    {voiceEnabled ? <Volume2 style={{ width: 12, height: 12 }} /> : <VolumeX style={{ width: 12, height: 12 }} />}
                  </button>
                )}

                {messages.length > 1 && (
                  <button onClick={exportChat} title="Export chat as .txt"
                    style={{ background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", borderRadius: 7, padding: 5, color: "rgba(255,255,255,0.7)", display: "flex" }}>
                    <Download style={{ width: 12, height: 12 }} />
                  </button>
                )}

                {messages.length > 1 && (
                  <button onClick={clearChat} title="Clear conversation"
                    style={{ background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", borderRadius: 7, padding: 5, color: "rgba(255,255,255,0.7)", display: "flex" }}>
                    <Trash2 style={{ width: 12, height: 12 }} />
                  </button>
                )}

                <button onClick={() => setMinimized(true)} title="Minimize"
                  style={{ background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", borderRadius: 7, padding: 5, color: "rgba(255,255,255,0.7)", display: "flex" }}>
                  <Minimize2 style={{ width: 12, height: 12 }} />
                </button>

                <button onClick={() => { stopSpeaking(); setOpen(false); }} title="Close"
                  style={{ background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", borderRadius: 7, padding: 5, color: "rgba(255,255,255,0.9)", display: "flex" }}>
                  <X style={{ width: 13, height: 13 }} />
                </button>
              </div>
            </div>

            {/* ── Context banner ──────────────────────────── */}
            {analysisContext && (
              <div style={{
                padding: "6px 14px", flexShrink: 0,
                background: dark ? "rgba(124,58,237,0.1)" : "rgba(124,58,237,0.07)",
                borderBottom: `1px solid ${panelBdr}`,
                display: "flex", alignItems: "center", gap: 7,
              }}>
                <Sparkles style={{ width: 11, height: 11, color: "#a78bfa", flexShrink: 0 }} />
                <span style={{ fontSize: "0.66rem", color: "#a78bfa", fontFamily: "monospace" }}>
                  Analysis loaded · {analysisContext.riskLevel} Risk · {FMT(analysisContext.recommendedFund || 0)} target
                </span>
                {voiceEnabled && (
                  <span style={{ marginLeft: "auto", fontSize: "0.62rem", color: "#c4b5fd", display: "flex", alignItems: "center", gap: 3 }}>
                    <Volume2 style={{ width: 9, height: 9 }} /> Auto-speak on
                  </span>
                )}
              </div>
            )}

            {/* ── Hint bar ────────────────────────────────── */}
            <div style={{
              padding: "3px 14px", flexShrink: 0,
              background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
              borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}`,
              display: "flex", alignItems: "center", gap: 12, justifyContent: "flex-end",
            }}>
              {HAS_STT && <span style={{ fontSize: "0.59rem", color: "#334155" }}>🎤 Mic available</span>}
              <span style={{ fontSize: "0.59rem", color: "#334155" }}>Ctrl+K to toggle</span>
            </div>

            {/* ── Messages ────────────────────────────────── */}
            <div
              onScroll={(e) => {
                const el = e.currentTarget;
                setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 100);
              }}
              style={{
                flex: 1, overflowY: "auto", padding: "14px 12px 6px",
                scrollbarWidth: "thin",
                scrollbarColor: `${dark ? "#2a2a3d" : "#cbd5e1"} transparent`,
                position: "relative",
              }}
            >
              {messages.map((m, i) => (
                <Bubble
                  key={m.id || i}
                  msg={m}
                  dark={dark}
                  isSpeaking={speakingId === m.id}
                  onSpeak={() => speak(m.content, m.id)}
                  reaction={reactions[m.id]}
                  onReact={(v) =>
                    setReactions((prev) => ({ ...prev, [m.id]: prev[m.id] === v ? undefined : v }))
                  }
                />
              ))}

              {thinking && <ThinkingBubble label={thinkLabel} dark={dark} />}

              {/* Quick chips */}
              {showChips && messages.length <= 1 && !thinking && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                  <p style={{ fontSize: "0.67rem", color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, fontWeight: 700 }}>
                    Quick questions
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {chips.map((c, i) => (
                      <motion.button
                        key={i}
                        onClick={() => send(c.text)}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.45 + i * 0.07 }}
                        style={{
                          display: "flex", alignItems: "center", gap: 8,
                          background: chipBg, border: `1px solid ${chipBdr}`,
                          borderRadius: 10, padding: "8px 12px", cursor: "pointer",
                          color: chipClr, fontSize: "0.77rem", textAlign: "left",
                          fontFamily: "var(--font-body)",
                        }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <c.icon style={{ width: 12, height: 12, flexShrink: 0, opacity: 0.8 }} />
                        {c.text}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* ── Scroll-to-bottom FAB ─────────────────────── */}
            <AnimatePresence>
              {showScrollBtn && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{   opacity: 0, scale: 0.8 }}
                  onClick={() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); setShowScrollBtn(false); }}
                  style={{
                    position: "absolute", bottom: 100, left: "50%", transform: "translateX(-50%)",
                    background: "rgba(124,58,237,0.85)", border: "1px solid rgba(167,139,250,0.4)",
                    borderRadius: 20, padding: "5px 14px", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 5,
                    color: "white", fontSize: "0.7rem", backdropFilter: "blur(8px)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.3)", zIndex: 10,
                  }}
                >
                  <ChevronDown style={{ width: 12, height: 12 }} />
                  Scroll to latest
                </motion.button>
              )}
            </AnimatePresence>

            {/* ── INPUT BAR ───────────────────────────────── */}
            <div style={{
              padding: "10px 12px",
              borderTop: `1px solid ${dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
              flexShrink: 0,
              background: dark ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.4)",
            }}>
              {/* Voice interim transcript */}
              <AnimatePresence>
                {(listening || interimText) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{
                      marginBottom: 7, padding: "6px 10px",
                      background: "rgba(244,63,94,0.08)",
                      border: "1px solid rgba(244,63,94,0.2)",
                      borderRadius: 8,
                      display: "flex", alignItems: "center", gap: 6,
                    }}
                  >
                    <motion.div
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 0.7, repeat: Infinity }}
                      style={{ width: 7, height: 7, borderRadius: "50%", background: "#f43f5e", flexShrink: 0 }}
                    />
                    <span style={{ fontSize: "0.75rem", color: "#fca5a5" }}>
                      {interimText
                        ? interimText
                        : finalTranscript$.current
                          ? "Listening… keep speaking or press Send"
                          : "Listening… speak now"}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={{ display: "flex", gap: 7, alignItems: "flex-end" }}>
                {/* Mic button */}
                {HAS_STT && (
                  <motion.button
                    onClick={toggleMic}
                    whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                    title={listening ? "Stop recording" : "Voice input"}
                    animate={listening
                      ? { boxShadow: ["0 0 0 0 rgba(244,63,94,0.5)", "0 0 0 8px rgba(244,63,94,0)", "0 0 0 0 rgba(244,63,94,0.5)"] }
                      : { boxShadow: "none" }
                    }
                    transition={{ duration: 1.2, repeat: listening ? Infinity : 0 }}
                    style={{
                      width: 38, height: 38, borderRadius: "50%", border: "none", cursor: "pointer",
                      background: listening
                        ? "linear-gradient(135deg,#f43f5e,#e11d48)"
                        : dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                      transition: "background 0.2s",
                    }}
                  >
                    {listening
                      ? <MicOff style={{ width: 15, height: 15, color: "white" }} />
                      : <Mic    style={{ width: 15, height: 15, color: dark ? "#94a3b8" : "#475569" }} />
                    }
                  </motion.button>
                )}

                {/* Textarea */}
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onInputKey}
                  placeholder={listening ? "Speak now…" : "Ask about emergency funds, savings…"}
                  rows={1}
                  style={{
                    flex: 1, resize: "none", borderRadius: 12,
                    border: `1.5px solid ${overLimit ? "#f43f5e" : inputBdr}`,
                    background: inputBg, color: inputClr,
                    padding: "9px 12px",
                    fontFamily: "var(--font-body)", fontSize: "0.83rem",
                    outline: "none", maxHeight: 100, overflowY: "auto",
                    lineHeight: 1.5, boxSizing: "border-box",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(124,58,237,0.55)";
                    e.target.style.boxShadow   = "0 0 0 3px rgba(124,58,237,0.12)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = overLimit ? "#f43f5e" : inputBdr;
                    e.target.style.boxShadow   = "none";
                  }}
                />

                {/* Send */}
                <motion.button
                  onClick={() => send()}
                  disabled={!canSend}
                  whileHover={canSend ? { scale: 1.08 } : {}}
                  whileTap={canSend  ? { scale: 0.92 } : {}}
                  style={{
                    width: 38, height: 38, borderRadius: "50%", border: "none",
                    cursor: canSend ? "pointer" : "not-allowed",
                    background: canSend
                      ? "linear-gradient(135deg,#7c3aed,#6d28d9)"
                      : dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: canSend ? "0 4px 16px rgba(124,58,237,0.4)" : "none",
                    transition: "background 0.2s, box-shadow 0.2s",
                  }}
                >
                  <Send style={{ width: 14, height: 14, color: canSend ? "white" : "#475569" }} />
                </motion.button>
              </div>

              {/* Footer */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 5 }}>
                <p style={{ fontSize: "0.59rem", color: "#334155" }}>
                  Educational only · Not SEBI advice · Enter to send
                </p>
                {charCount > 600 && (
                  <span style={{ fontSize: "0.59rem", color: overLimit ? "#f43f5e" : "#475569" }}>
                    {charCount}/1000
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
