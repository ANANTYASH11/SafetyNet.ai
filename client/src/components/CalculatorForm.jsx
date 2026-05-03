import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, ChevronLeft, CheckCircle2,
  Loader2, Sparkles, AlertCircle, HelpCircle
} from "lucide-react";
import { API_URL } from "../utils/api";

/* ── Inline tooltip ───────────────────────────────────────────── */
function Tip({ text }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    function close(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  return (
    <span ref={ref} style={{ position:"relative", display:"inline-flex", verticalAlign:"middle", marginLeft:5, cursor:"pointer" }}
      onClick={() => setOpen(o => !o)} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <HelpCircle style={{ width:13, height:13, color:"#475569" }} />
      {open && (
        <span style={{ position:"absolute", bottom:"calc(100% + 6px)", left:"50%", transform:"translateX(-50%)",
          width:220, background:"rgba(9,9,15,0.97)", border:"1px solid rgba(124,58,237,0.3)",
          borderRadius:10, padding:"9px 12px", fontSize:"0.74rem", color:"#94a3b8", lineHeight:1.6,
          zIndex:999, pointerEvents:"none", boxShadow:"0 8px 32px rgba(0,0,0,0.6)" }}>
          {text}
        </span>
      )}
    </span>
  );
}

const FMT = (n) => n ? "\u20b9" + Number(n).toLocaleString("en-IN") : "\u20b90";
const INR_SHORT = (n) => {
  const v = Number(n);
  if (v >= 1000000) return "\u20b9" + (v/100000).toFixed(1) + "L";
  if (v >= 1000) return "\u20b9" + (v/1000).toFixed(0) + "k";
  return "\u20b9" + v;
};

const AI_STEPS = [
  "Evaluating employment stability and income risk...",
  "Analysing your debt-to-income obligations...",
  "Checking for insurance coverage gaps...",
  "Applying city cost-of-living multiplier...",
  "Scoring household dependency factors...",
  "Running personalised risk score model...",
  "Generating your safety-net blueprint...",
];

function TypewriterText({ text, speed = 20 }) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    setShown("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return <span>{shown}<span style={{ color:"#a78bfa", animation:"apulse 1.2s ease-in-out infinite" }}>|</span></span>;
}

function Slider({ label, value, min, max, step = 1000, onChange, hint, showINR = true }) {
  const pct = ((Number(value) - min) / (max - min)) * 100;
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:10 }}>
        {label && <label className="label">{label}</label>}
        <span style={{ fontFamily:"var(--font-heading)", fontWeight:700, color:"#a78bfa", fontSize:"0.95rem" }}>
          {showINR ? INR_SHORT(value) : value}
        </span>
      </div>
      <div style={{ position:"relative", paddingBottom:8 }}>
        <div style={{ position:"absolute", top:"50%", left:0, right:0, height:5, background:"rgba(255,255,255,0.07)", borderRadius:99, transform:"translateY(-50%)", pointerEvents:"none" }}>
          <div style={{ width:`${Math.max(0,Math.min(100,pct))}%`, height:"100%", background:"linear-gradient(90deg,#7c3aed,#a78bfa)", borderRadius:99, boxShadow:"0 0 10px rgba(124,58,237,0.5)" }} />
        </div>
        <input
          type="range" min={min} max={max} step={step}
          value={value || min}
          onChange={e => onChange(e.target.value)}
          style={{ width:"100%", position:"relative", zIndex:1, background:"transparent" }}
        />
      </div>
      {hint && <p style={{ fontSize:"0.72rem", color:"#475569", marginTop:4 }}>{hint}</p>}
    </div>
  );
}

function OptionGrid({ options, value, onChange, cols = 2 }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols},1fr)`, gap:10 }}>
      {options.map(o => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className={`opt-btn${value === o.v ? " active" : ""}`}
          style={{ display:"flex", flexDirection:"column", gap:4, padding:"14px 16px", textAlign:"left" }}
        >
          {o.icon && <span style={{ fontSize:"1.05rem", marginBottom:2 }}>{o.icon}</span>}
          <span style={{ fontWeight:700, fontSize:"0.84rem" }}>{o.l}</span>
          {o.sub && <span style={{ fontSize:"0.7rem", opacity:0.55, lineHeight:1.4 }}>{o.sub}</span>}
        </button>
      ))}
    </div>
  );
}

const JOB_OPTS = [
  { v:"govt",       l:"Government / PSU",    sub:"Stable, pension-backed",   icon:"\u{1f3db}\ufe0f" },
  { v:"corporate",  l:"Private / Corporate", sub:"Moderate job security",     icon:"\u{1f4bc}" },
  { v:"freelancer", l:"Freelancer",          sub:"Variable income",           icon:"\u{1f4bb}" },
  { v:"business",   l:"Business Owner",      sub:"Self-employed",             icon:"\u{1f3e2}" },
  { v:"gig",        l:"Gig / Part-time",     sub:"Irregular income",          icon:"\u{1f6f5}" },
  { v:"student",    l:"Student / Intern",    sub:"Stipend / scholarship",     icon:"\u{1f393}" },
];
const CITY_OPTS = [
  { v:"1", l:"Tier 1 Metro",  sub:"Mumbai, Delhi, Bengaluru…", icon:"\u{1f3d9}\ufe0f" },
  { v:"2", l:"Tier 2 City",   sub:"Pune, Jaipur, Lucknow…",   icon:"\u{1f306}" },
  { v:"3", l:"Tier 3 Town",   sub:"Smaller cities & towns",    icon:"\u{1f3d8}" },
];
const LIFE_OPTS = [
  { v:"student",            l:"Student",           icon:"\u{1f393}" },
  { v:"young_professional", l:"Young Professional",icon:"\u{1f680}" },
  { v:"family",             l:"Family Stage",      icon:"\u{1f46a}" },
  { v:"mid_career",         l:"Mid-career",        icon:"\u{1f4c8}" },
  { v:"pre_retirement",     l:"Pre-Retirement",    icon:"\u{1f305}" },
];
const INS_OPTS = [
  { v:"yes",     l:"Fully covered",  icon:"\u2705" },
  { v:"partial", l:"Partial",        icon:"\u26a1" },
  { v:"no",      l:"No insurance",   icon:"\u274c" },
];
const OWN_OPTS = [
  { v:"rent",     l:"I rent",           icon:"\u{1f3e0}" },
  { v:"own_loan", l:"Own (with loan)",  icon:"\u{1f511}" },
  { v:"own_free", l:"Own (no loan)",    icon:"\u{1f3e1}" },
];

const STEPS = [
  { id:"profile",  label:"Profile",  title:"Tell us about you",     sub:"Employment and life stage" },
  { id:"income",   label:"Income",   title:"Your monthly income",   sub:"Take-home after tax" },
  { id:"expenses", label:"Expenses", title:"Monthly obligations",   sub:"Living costs and EMIs" },
  { id:"savings",  label:"Savings",  title:"Your current cushion",  sub:"Liquid savings only" },
  { id:"context",  label:"Context",  title:"Final details",         sub:"Location and dependents" },
  { id:"review",   label:"Review",   title:"Confirm your details",  sub:"Everything looks right?" },
];

const SLIDE = {
  initial:  (d) => ({ opacity:0, x: d * 56, scale:0.98 }),
  animate:  { opacity:1, x:0, scale:1, transition:{ duration:0.36, ease:[0.22,1,0.36,1] } },
  exit:     (d) => ({ opacity:0, x: d * -44, scale:0.98, transition:{ duration:0.22 } }),
};

export default function CalculatorForm({ onComplete }) {
  const [step,    setStep]    = useState(0);
  const [dir,     setDir]     = useState(1);
  const [loading, setLoading] = useState(false);
  const [aiStep,  setAiStep]  = useState(0);
  const [aiDone,  setAiDone]  = useState(false);
  const [error,   setError]   = useState("");

  const [data, setData] = useState({
    age: "28", jobType: "", lifeStage: "",
    monthlyIncome: "60000", monthlyExpenses: "35000",
    emi: "0", savings: "100000",
    hasHealthInsurance: "", rentOrOwn: "", dependents: "1", cityTier: "",
  });

  const set = useCallback((k, v) => setData(d => ({ ...d, [k]: v })), []);

  function go(delta) { setError(""); setDir(delta); setStep(s => s + delta); }

  function canAdvance() {
    if (step === 0) return !!data.jobType && !!data.lifeStage;
    if (step === 1) return data.jobType === "student" ? true : Number(data.monthlyIncome) > 0;
    if (step === 2) return Number(data.monthlyExpenses) > 0;
    if (step === 3) return !!data.hasHealthInsurance;
    if (step === 4) return !!data.rentOrOwn && !!data.cityTier;
    if (step === 5) return true;
    return true;
  }

  async function submit() {
    setLoading(true); setAiStep(0); setAiDone(false); setError("");
    const ticker = setInterval(() => {
      setAiStep(s => {
        if (s < AI_STEPS.length - 1) return s + 1;
        clearInterval(ticker); setAiDone(true); return s;
      });
    }, 480);
    try {
      const body = {
        monthlyIncome:      Number(data.monthlyIncome),
        monthlyExpenses:    Number(data.monthlyExpenses),
        emi:                Number(data.emi) || 0,
        savings:            Number(data.savings) || 0,
        jobType:            data.jobType,
        dependents:         Number(data.dependents) || 0,
        cityTier:           data.cityTier || "2",
        age:                Number(data.age) || 28,
        lifeStage:          data.lifeStage || "mid_career",
        hasHealthInsurance: data.hasHealthInsurance || "no",
        rentOrOwn:          data.rentOrOwn || "rent",
      };
      const res  = await fetch(`${API_URL}/analyze`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Server error");
      setTimeout(() => { setLoading(false); onComplete(json); }, aiDone ? 300 : 3500);
    } catch (e) {
      clearInterval(ticker);
      setLoading(false);
      setError("Could not connect to the server. Make sure it's running on port 5001.");
    }
  }

  // Keyboard: Enter key advances step (never auto-submits — user must click the button)
  useEffect(() => {
    function handleKey(e) {
      if (loading) return;
      if (e.key !== "Enter") return;
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (step < STEPS.length - 1 && canAdvance()) go(1);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [step, loading, data.jobType, data.lifeStage, data.monthlyIncome, data.hasHealthInsurance, data.rentOrOwn, data.cityTier]);

  const surplus  = Number(data.monthlyIncome) - Number(data.monthlyExpenses) - Number(data.emi);
  const progress = ((step + 1) / STEPS.length) * 100;

  if (loading) {
    const pct = Math.round(((aiStep + 1) / AI_STEPS.length) * 100);
    const factorPreviews = [
      { label:"Job Risk",    val:{govt:"Minimal",corporate:"Moderate",freelancer:"Elevated",business:"High",gig:"High",student:"Entry-level"}[data.jobType]||"Medium",
        color:["govt","student"].includes(data.jobType)?"#10b981":["freelancer","business","gig"].includes(data.jobType)?"#f43f5e":"#f59e0b" },
      { label:"Debt Load",   val:Number(data.emi)>0?Math.round((Number(data.emi)/(Number(data.monthlyIncome)||1))*100)+"%":"0%",
        color:Number(data.emi)/(Number(data.monthlyIncome)||1)>0.3?"#f43f5e":"#10b981" },
      { label:"City Tier",   val:{"1":"Metro +18%","2":"Tier 2 ×1.0","3":"Town −18%"}[data.cityTier]||"Tier 2", color:"#60a5fa" },
      { label:"Insurance",   val:{yes:"Covered",partial:"Partial",no:"Exposed"}[data.hasHealthInsurance]||"\u2014",
        color:data.hasHealthInsurance==="yes"?"#10b981":data.hasHealthInsurance==="partial"?"#f59e0b":"#f43f5e" },
      { label:"Dependents",  val:(Number(data.dependents)||0)+" people",
        color:Number(data.dependents)>2?"#f43f5e":Number(data.dependents)>0?"#f59e0b":"#10b981" },
      { label:"Savings Now", val:INR_SHORT(data.savings||0),
        color:Number(data.savings)>100000?"#10b981":Number(data.savings)>0?"#f59e0b":"#f43f5e" },
    ];
    return (
      <div style={{ maxWidth:560, margin:"0 auto" }}>
        <motion.div
          initial={{ opacity:0, scale:0.95, y:20 }} animate={{ opacity:1, scale:1, y:0 }}
          transition={{ duration:0.5, ease:[0.22,1,0.36,1] }}
          className="glass"
          style={{ padding:"44px 36px", textAlign:"center", boxShadow:"0 32px 96px rgba(0,0,0,0.65)", position:"relative", overflow:"hidden" }}
        >
          <div style={{ position:"absolute",top:-100,right:-80,width:280,height:280,borderRadius:"50%",background:"radial-gradient(circle,rgba(124,58,237,0.22),transparent 70%)",filter:"blur(50px)",pointerEvents:"none"}}/>
          <div style={{ position:"absolute",bottom:-80,left:-80,width:220,height:220,borderRadius:"50%",background:"radial-gradient(circle,rgba(6,182,212,0.14),transparent 70%)",filter:"blur(40px)",pointerEvents:"none"}}/>

          {/* Groq model badge */}
          <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} transition={{delay:0.15}}
            style={{ display:"inline-flex",alignItems:"center",gap:7,background:"rgba(124,58,237,0.12)",border:"1px solid rgba(124,58,237,0.28)",borderRadius:99,padding:"5px 14px",marginBottom:24 }}>
            <motion.div animate={{opacity:[1,0.3,1]}} transition={{duration:1.5,repeat:Infinity}}
              style={{width:6,height:6,borderRadius:"50%",background:"#10b981",boxShadow:"0 0 7px rgba(16,185,129,0.8)"}}/>
            <span style={{fontFamily:"var(--font-heading)",fontWeight:700,fontSize:"0.7rem",color:"#a78bfa",letterSpacing:"0.05em"}}>Groq · llama-3.3-70b-versatile · Live</span>
          </motion.div>

          {/* Triple-ring scanner */}
          <div style={{ position:"relative", width:130, height:130, margin:"0 auto 18px" }}>
            <motion.div animate={{rotate:360}} transition={{duration:2.8,repeat:Infinity,ease:"linear"}}
              style={{position:"absolute",inset:0,borderRadius:"50%",border:"2px solid transparent",borderTopColor:"#7c3aed",borderRightColor:"rgba(124,58,237,0.25)",boxShadow:"0 0 28px rgba(124,58,237,0.22)"}}/>
            <motion.div animate={{rotate:-360}} transition={{duration:4.5,repeat:Infinity,ease:"linear"}}
              style={{position:"absolute",inset:14,borderRadius:"50%",border:"1.5px solid transparent",borderTopColor:"#a78bfa",borderLeftColor:"rgba(167,139,250,0.3)"}}/>
            <motion.div animate={{rotate:360}} transition={{duration:1.8,repeat:Infinity,ease:"linear"}}
              style={{position:"absolute",inset:28,borderRadius:"50%",border:"1.5px solid transparent",borderTopColor:"#06b6d4",borderRightColor:"rgba(6,182,212,0.25)"}}/>
            {[0,60,120,180,240,300].map((deg,i) => (
              <motion.div key={i}
                animate={{opacity:[0.2,1,0.2],scale:[0.5,1.3,0.5]}} transition={{duration:1.4,repeat:Infinity,delay:i*0.23}}
                style={{position:"absolute",width:5,height:5,borderRadius:"50%",
                  background:i%3===0?"#7c3aed":i%3===1?"#06b6d4":"#a78bfa",
                  boxShadow:`0 0 5px ${i%3===0?"#7c3aed":i%3===1?"#06b6d4":"#a78bfa"}`,
                  top:65+62*Math.sin((deg*Math.PI)/180)-2.5,
                  left:65+62*Math.cos((deg*Math.PI)/180)-2.5}}/>
            ))}
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <motion.div animate={{scale:[1,1.2,1],opacity:[0.7,1,0.7]}} transition={{duration:1.6,repeat:Infinity}}>
                <Sparkles style={{width:30,height:30,color:"#a78bfa"}}/>
              </motion.div>
            </div>
          </div>

          {/* % counter */}
          <motion.div key={pct} initial={{scale:0.82,opacity:0}} animate={{scale:1,opacity:1}} transition={{duration:0.3}} style={{marginBottom:4}}>
            <span style={{fontFamily:"var(--font-heading)",fontWeight:900,fontSize:"2.8rem",lineHeight:1,color:"#f1f5f9",letterSpacing:"-0.04em"}}>{pct}</span>
            <span style={{fontSize:"1rem",color:"#64748b",marginLeft:2}}>%</span>
          </motion.div>
          <h3 style={{fontFamily:"var(--font-heading)",fontWeight:800,fontSize:"1.2rem",color:"#f1f5f9",letterSpacing:"-0.02em",marginBottom:22}}>
            {aiDone ? "Blueprint ready \u2713" : "Building your blueprint\u2026"}
          </h3>

          {/* Steps */}
          <div style={{textAlign:"left",marginBottom:16,display:"flex",flexDirection:"column",gap:5}}>
            {AI_STEPS.map((s,i) => (
              <motion.div key={i}
                initial={{opacity:0,x:-16}} animate={{opacity:i<=aiStep?1:0.18,x:0}} transition={{delay:i*0.05,duration:0.35}}
                style={{display:"flex",alignItems:"center",gap:10,padding:"7px 11px",borderRadius:9,
                  background:i===aiStep?"rgba(124,58,237,0.09)":"transparent",
                  border:i===aiStep?"1px solid rgba(124,58,237,0.22)":"1px solid transparent"}}>
                {i<aiStep
                  ? <CheckCircle2 style={{width:13,height:13,color:"#10b981",flexShrink:0}}/>
                  : i===aiStep
                    ? <motion.div animate={{rotate:360}} transition={{duration:0.8,repeat:Infinity,ease:"linear"}} style={{flexShrink:0}}><Loader2 style={{width:13,height:13,color:"#7c3aed"}}/></motion.div>
                    : <div style={{width:13,height:13,borderRadius:"50%",border:"1.5px solid rgba(255,255,255,0.1)",flexShrink:0}}/>}
                <span style={{fontSize:"0.79rem",color:i<aiStep?"#64748b":i===aiStep?"#e2e8f0":"#334155",fontWeight:i===aiStep?600:400,flex:1}}>
                  {i===aiStep?<TypewriterText text={s}/>:s}
                </span>
                {i<aiStep&&<motion.span initial={{opacity:0,scale:0}} animate={{opacity:1,scale:1}}
                  style={{fontSize:"0.58rem",color:"#10b981",fontWeight:700,background:"rgba(16,185,129,0.12)",padding:"2px 6px",borderRadius:4,flexShrink:0}}>\u2713</motion.span>}
              </motion.div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="progress-track" style={{height:3,marginBottom:18}}>
            <motion.div className="progress-fill" initial={{width:0}} animate={{width:`${pct}%`}}
              transition={{duration:0.5,ease:[0.22,1,0.36,1]}}
              style={{background:"linear-gradient(90deg,#7c3aed,#a78bfa,#06b6d4)",boxShadow:"0 0 10px rgba(124,58,237,0.5)"}}/>
          </div>

          {/* Live factor score cards */}
          {aiStep >= 1 && (
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7}}>
              {factorPreviews.slice(0, Math.min(aiStep + 1, 6)).map((f,i) => (
                <motion.div key={f.label}
                  initial={{opacity:0,scale:0.7,y:12}} animate={{opacity:1,scale:1,y:0}}
                  transition={{type:"spring",stiffness:380,damping:18,delay:i*0.04}}
                  style={{background:`${f.color}10`,border:`1px solid ${f.color}28`,borderRadius:9,padding:"9px 7px",textAlign:"center"}}>
                  <p style={{fontFamily:"var(--font-heading)",fontWeight:800,color:f.color,fontSize:"0.78rem",marginBottom:2,lineHeight:1.2}}>{f.val}</p>
                  <p style={{fontSize:"0.57rem",color:"#475569",textTransform:"uppercase",letterSpacing:"0.07em",lineHeight:1.3}}>{f.label}</p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth:680, margin:"0 auto" }}>
      {/* Step indicator */}
      <div style={{ marginBottom:28 }}>
        <div style={{ display:"flex", gap:6, justifyContent:"center", marginBottom:14 }}>
          {STEPS.map((s, i) => (
            <motion.div key={s.id}
              animate={{ width: i === step ? 28 : 8, background: i < step ? "#10b981" : i === step ? "#7c3aed" : "rgba(255,255,255,0.1)" }}
              transition={{ duration:0.3 }} style={{ height:8, borderRadius:99 }} />
          ))}
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:12 }}>
          <div>
            <p className="eyebrow" style={{ marginBottom:4, display:"flex", alignItems:"center", gap:8 }}>
              Step {step + 1} of {STEPS.length}
              {step > 0 && Array.from({length:step}).map((_,i) => (
                <CheckCircle2 key={i} style={{ width:12, height:12, color:"#10b981" }} />
              ))}
            </p>
            <h2 style={{ fontFamily:"var(--font-heading)", fontWeight:800, fontSize:"clamp(1.4rem,3vw,1.8rem)", color:"#f1f5f9", letterSpacing:"-0.025em", margin:0 }}>
              {STEPS[step].title}
            </h2>
            <p style={{ color:"#475569", fontSize:"0.82rem", marginTop:4 }}>{STEPS[step].sub}</p>
          </div>
        </div>
        <div className="progress-track" style={{ height:3 }}>
          <motion.div className="progress-fill" animate={{ width:`${progress}%` }}
            transition={{ duration:0.5, ease:[0.22,1,0.36,1] }}
            style={{ background:"linear-gradient(90deg,#7c3aed,#a78bfa)" }} />
        </div>
      </div>

      {/* Card */}
      <div className="glass" style={{ padding:"36px 32px", boxShadow:"0 24px 80px rgba(0,0,0,0.4)", minHeight:360, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-60, right:-60, width:200, height:200, borderRadius:"50%", background:"radial-gradient(circle,rgba(124,58,237,0.1),transparent 70%)", pointerEvents:"none" }} />

        <AnimatePresence mode="wait" custom={dir}>
          {step === 0 && (
            <motion.div key="s0" custom={dir} variants={SLIDE} initial="initial" animate="animate" exit="exit">
              <div style={{ display:"flex", flexDirection:"column", gap:22 }}>
                <div>
                  <label className="label" style={{ display:"block", marginBottom:12 }}>What best describes your employment?</label>
                  <OptionGrid options={JOB_OPTS} value={data.jobType} onChange={v => set("jobType", v)} cols={3} />
                </div>
                <Slider label="Your Age" value={data.age} min={18} max={65} step={1}
                  onChange={v => set("age", v)} showINR={false} hint={"Age " + data.age} />
                <div>
                  <label className="label" style={{ display:"block", marginBottom:12 }}>Life Stage</label>
                  <OptionGrid options={LIFE_OPTS} value={data.lifeStage} onChange={v => set("lifeStage", v)} cols={3} />
                </div>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="s1" custom={dir} variants={SLIDE} initial="initial" animate="animate" exit="exit">
              <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
                <div style={{ background:"rgba(124,58,237,0.06)", border:"1px solid rgba(124,58,237,0.15)", borderRadius:14, padding:"14px 18px" }}>
                  <p style={{ fontSize:"0.82rem", color:"#94a3b8", lineHeight:1.6 }}>
                    {data.jobType === "student"
                      ? <>Enter your <strong style={{ color:"#c4b5fd" }}>monthly funds</strong>. Include stipend, scholarship, parental support, or part-time earnings. <strong style={{ color:"#c4b5fd" }}>\u20b90 is valid</strong> if you have no personal income yet.</>
                      : <>Enter your <strong style={{ color:"#c4b5fd" }}>take-home pay after taxes</strong>. Include salary, freelance, business, rental — whatever hits your account monthly.</>
                    }
                  </p>
                </div>
                <Slider
                  label={data.jobType === "student" ? "Monthly Funds (Stipend / Allowance)" : <span>Monthly Income <Tip text="Your take-home pay after all taxes and PF deductions. Include salary, freelance earnings, rental income — everything that hits your bank account monthly."/></span>}
                  value={data.monthlyIncome}
                  min={0}
                  max={data.jobType === "student" ? 50000 : 500000}
                  step={data.jobType === "student" ? 500 : 5000}
                  onChange={v => set("monthlyIncome", v)}
                  hint={data.jobType === "student" ? "Enter \u20b90 if you have no personal income yet" : "Drag or type exact amount below"} />
                <div>
                  <label className="label" style={{ display:"block", marginBottom:10 }}>Exact Amount</label>
                  <input className="dark-input" type="number" placeholder="\u20b9 exact amount"
                    value={data.monthlyIncome} onChange={e => set("monthlyIncome", e.target.value)}
                    style={{ fontSize:"1.2rem", fontFamily:"var(--font-heading)", fontWeight:700 }} />
                </div>
                {Number(data.monthlyIncome) > 0 && (
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                    {[
                      { label:"Annual ~",  val: FMT(Number(data.monthlyIncome)*12),              color:"#a78bfa" },
                      { label:"Weekly ~",  val: FMT(Math.round(Number(data.monthlyIncome)/4.3)), color:"#60a5fa" },
                    ].map(m => (
                      <div key={m.label} style={{ background:"rgba(255,255,255,0.03)", borderRadius:10, padding:"12px 16px" }}>
                        <p style={{ fontSize:"0.65rem", color:"#475569", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:4 }}>{m.label}</p>
                        <p style={{ fontFamily:"var(--font-heading)", fontWeight:700, color:m.color, fontSize:"1rem" }}>{m.val}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" custom={dir} variants={SLIDE} initial="initial" animate="animate" exit="exit">
              <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
                <Slider label={<span>Monthly Living Expenses <Tip text="All regular monthly costs: rent/home loan EMI, groceries, utilities, transport, subscriptions, OTT, eating out. Do NOT include loan EMIs — those go in the next field."/></span>} value={data.monthlyExpenses} min={5000} max={300000} step={2000}
                  onChange={v => set("monthlyExpenses", v)} hint="Rent/food/utilities/transport — exclude loan EMIs" />
                <Slider label={<span>Total Monthly EMI <Tip text="Sum of all EMI payments: home loan, car loan, personal loan, credit card minimum payments. Enter 0 if you have no active loans."/></span>} value={data.emi} min={0} max={150000} step={1000}
                  onChange={v => set("emi", v)} hint="Home loan, car, personal loan, credit card EMIs — 0 if none" />
                {Number(data.monthlyIncome) > 0 && (
                  <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                    style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:"18px 20px" }}>
                    <p className="label" style={{ marginBottom:12 }}>Live Summary</p>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, textAlign:"center" }}>
                      {[
                        { label:"Income",      val: FMT(data.monthlyIncome),  color:"#6ee7b7" },
                        { label:"Obligations", val: FMT(Number(data.monthlyExpenses)+Number(data.emi)), color:"#fda4af" },
                        { label:"Surplus",     val: surplus >= 0 ? FMT(surplus) : "-"+FMT(Math.abs(surplus)), color: surplus >= 0 ? "#a78bfa" : "#f43f5e" },
                      ].map(m => (
                        <div key={m.label}>
                          <p style={{ fontFamily:"var(--font-heading)", fontWeight:800, color:m.color, fontSize:"1rem", marginBottom:2 }}>{m.val}</p>
                          <p style={{ fontSize:"0.65rem", color:"#475569", textTransform:"uppercase", letterSpacing:"0.1em" }}>{m.label}</p>
                        </div>
                      ))}
                    </div>
                    {surplus < 0 && (
                      <div style={{ marginTop:12, display:"flex", alignItems:"center", gap:8, padding:"10px 14px", background:"rgba(244,63,94,0.1)", borderRadius:9, border:"1px solid rgba(244,63,94,0.2)" }}>
                        <AlertCircle style={{ width:14, height:14, color:"#f43f5e", flexShrink:0 }} />
                        <p style={{ fontSize:"0.75rem", color:"#fda4af" }}>Expenses exceed income — review your numbers.</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" custom={dir} variants={SLIDE} initial="initial" animate="animate" exit="exit">
              <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
                <div style={{ background:"rgba(16,185,129,0.06)", border:"1px solid rgba(16,185,129,0.15)", borderRadius:14, padding:"14px 18px" }}>
                  <p style={{ fontSize:"0.82rem", color:"#94a3b8", lineHeight:1.6 }}>
                    <strong style={{ color:"#6ee7b7" }}>Liquid savings only</strong> — money you can access within 48 hours. Exclude locked FDs, EPF, PPF, and equity investments.
                  </p>
                </div>
                <Slider label={<span>Current Liquid Savings <Tip text="Only include money you can access within 48 hours: savings account balance, instant-redemption liquid mutual funds, cash at home. Exclude: Fixed Deposits with lock-in, PPF, EPF, ELSS, stocks."/></span>} value={data.savings} min={0} max={2000000} step={10000}
                  onChange={v => set("savings", v)} hint="Savings account + liquid MF + accessible cash" />
                <div>
                  <label className="label" style={{ display:"block", marginBottom:10 }}>Exact Amount</label>
                  <input className="dark-input" type="number" placeholder="\u20b9 exact amount"
                    value={data.savings} onChange={e => set("savings", e.target.value)}
                    style={{ fontSize:"1.1rem", fontFamily:"var(--font-heading)", fontWeight:700 }} />
                </div>
                <div>
                  <label className="label" style={{ display:"block", marginBottom:12 }}>Health Insurance Coverage</label>
                  <OptionGrid options={INS_OPTS} value={data.hasHealthInsurance} onChange={v => set("hasHealthInsurance", v)} cols={3} />
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" custom={dir} variants={SLIDE} initial="initial" animate="animate" exit="exit">
              <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
                <div>
                  <label className="label" style={{ display:"block", marginBottom:12 }}>City Tier</label>
                  <OptionGrid options={CITY_OPTS} value={data.cityTier} onChange={v => set("cityTier", v)} cols={3} />
                </div>
                <div>
                  <label className="label" style={{ display:"block", marginBottom:12 }}>Home Situation</label>
                  <OptionGrid options={OWN_OPTS} value={data.rentOrOwn} onChange={v => set("rentOrOwn", v)} cols={3} />
                </div>
                <div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                    <label className="label">Dependents <Tip text="People who rely on your income: spouse (if not independently earning), children, parents, or other family members you financially support. Does not include yourself."/></label>
                    <span style={{ fontFamily:"var(--font-heading)", fontWeight:700, color:"#a78bfa", fontSize:"0.95rem" }}>{data.dependents}</span>
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    {[0,1,2,3,4,5,6].map(n => (
                      <button key={n} onClick={() => set("dependents", String(n))}
                        className={`opt-btn${data.dependents === String(n) ? " active" : ""}`}
                        style={{ flex:1, padding:"12px 0", textAlign:"center", fontSize:"0.9rem" }}>{n}</button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="s5" custom={dir} variants={SLIDE} initial="initial" animate="animate" exit="exit">
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <div style={{ background:"rgba(124,58,237,0.07)", border:"1px solid rgba(124,58,237,0.2)", borderRadius:12, padding:"12px 16px" }}>
                  <p style={{ fontSize:"0.81rem", color:"#94a3b8", lineHeight:1.65 }}>
                    Review your details before the AI analysis runs. Click <strong style={{color:"#a78bfa"}}>Edit</strong> to correct anything.
                  </p>
                </div>
                {[
                  { stepIdx:0, title:"Profile", rows:[
                    ["Job Type",   JOB_OPTS.find(o=>o.v===data.jobType)?.l   || "—"],
                    ["Age",        `${data.age} years`],
                    ["Life Stage", LIFE_OPTS.find(o=>o.v===data.lifeStage)?.l || "—"],
                  ]},
                  { stepIdx:1, title:"Income", rows:[
                    ["Monthly Income",    FMT(data.monthlyIncome)],
                    ["Annual Equivalent", FMT(Number(data.monthlyIncome)*12)],
                  ]},
                  { stepIdx:2, title:"Expenses & Debt", rows:[
                    ["Monthly Expenses", FMT(data.monthlyExpenses)],
                    ["EMI Obligations",  Number(data.emi)>0 ? FMT(data.emi) : "None"],
                    ["Net Surplus",      surplus>=0 ? FMT(surplus) : "−"+FMT(Math.abs(surplus))],
                  ]},
                  { stepIdx:3, title:"Savings & Insurance", rows:[
                    ["Liquid Savings",   FMT(data.savings)],
                    ["Health Insurance", INS_OPTS.find(o=>o.v===data.hasHealthInsurance)?.l || "—"],
                  ]},
                  { stepIdx:4, title:"Context", rows:[
                    ["City Tier",      CITY_OPTS.find(o=>o.v===data.cityTier)?.l  || "—"],
                    ["Home Situation", OWN_OPTS.find(o=>o.v===data.rentOrOwn)?.l   || "—"],
                    ["Dependents",     `${data.dependents} ${Number(data.dependents)===1?"person":"people"}`],
                  ]},
                ].map(sec => (
                  <div key={sec.stepIdx} style={{ background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, overflow:"hidden" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 14px", borderBottom:"1px solid rgba(255,255,255,0.05)", background:"rgba(255,255,255,0.02)" }}>
                      <p className="label" style={{marginBottom:0}}>{sec.title}</p>
                      <button onClick={() => { setDir(-1); setStep(sec.stepIdx); }}
                        style={{ fontSize:"0.7rem", color:"#a78bfa", fontWeight:700, background:"rgba(124,58,237,0.12)", border:"1px solid rgba(124,58,237,0.25)", cursor:"pointer", padding:"3px 10px", borderRadius:6 }}>
                        Edit
                      </button>
                    </div>
                    <div style={{ padding:"10px 14px", display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))", gap:"6px 14px" }}>
                      {sec.rows.map(([label, val]) => (
                        <div key={label}>
                          <p style={{ fontSize:"0.63rem", color:"#475569", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:2 }}>{label}</p>
                          <p style={{ fontSize:"0.85rem", fontWeight:600, color:(label==="Net Surplus"&&surplus<0)?"#f43f5e":"#e2e8f0", fontFamily:"var(--font-heading)" }}>{val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {surplus < 0 && (
                  <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:"rgba(244,63,94,0.1)", border:"1px solid rgba(244,63,94,0.25)", borderRadius:10 }}>
                    <AlertCircle style={{ width:14, height:14, color:"#f43f5e", flexShrink:0 }} />
                    <p style={{ fontSize:"0.79rem", color:"#fda4af" }}>Your expenses exceed income — the analysis will flag this as a critical risk factor.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
            style={{ marginTop:20, padding:"12px 16px", borderRadius:12, background:"rgba(244,63,94,0.1)", border:"1px solid rgba(244,63,94,0.3)", display:"flex", alignItems:"center", gap:10 }}>
            <AlertCircle style={{ width:15, height:15, color:"#f43f5e", flexShrink:0 }} />
            <p style={{ fontSize:"0.82rem", color:"#fda4af" }}>{error}</p>
          </motion.div>
        )}

        <div style={{ display:"flex", gap:12, marginTop:28, alignItems:"center" }}>
          {step > 0 ? (
            <button onClick={() => go(-1)} className="btn-outline" style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 20px" }}>
              <ChevronLeft style={{width:16,height:16}} /> Back
            </button>
          ) : <div />}
          <div style={{ flex:1 }} />
          {step < STEPS.length - 1 ? (
            <motion.button onClick={() => go(1)} disabled={!canAdvance()} className="btn-violet"
              style={{ padding:"12px 24px", opacity: canAdvance() ? 1 : 0.35 }}
              whileHover={canAdvance() ? { scale:1.02 } : {}} whileTap={canAdvance() ? { scale:0.98 } : {}}>
              {step === STEPS.length - 2 ? "Review & Confirm" : "Continue"} <ChevronRight style={{width:16,height:16}} />
            </motion.button>
          ) : (
            <motion.button onClick={submit} disabled={!canAdvance()} className="btn-violet"
              style={{ padding:"14px 28px", fontSize:"0.95rem", opacity: canAdvance() ? 1 : 0.35, boxShadow:"0 8px 32px rgba(124,58,237,0.45)" }}
              whileHover={canAdvance() ? { scale:1.02, y:-2 } : {}} whileTap={canAdvance() ? { scale:0.98 } : {}}>
              <Sparkles style={{width:16,height:16}} /> Analyse with AI
            </motion.button>
          )}
        </div>
      </div>

      <p style={{ textAlign:"center", color:"#1e293b", fontSize:"0.7rem", marginTop:14 }}>
        Your data is never stored or shared. All calculations are discarded after your session.
      </p>
    </div>
  );
}
