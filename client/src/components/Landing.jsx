import React, { useState, useEffect, useRef, useMemo } from "react";
import { useTheme } from "../App.jsx";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  ArrowRight, ShieldCheck, TrendingUp, Brain, Zap, BarChart3,
  Clock, Users, CheckCircle2, Star, Activity, Sparkles, Target,
  Lock, Shield, Database, Award
} from "lucide-react";

function Counter({ to, prefix="", suffix="", decimals=0, duration=1800 }) {
  const [val,setVal]=useState(0);
  const ref=useRef(null);
  const inView=useInView(ref,{once:true});
  useEffect(()=>{
    if(!inView)return;
    const start=Date.now();
    const tick=()=>{
      const pct=Math.min((Date.now()-start)/duration,1);
      setVal(to*(1-Math.pow(1-pct,3)));
      if(pct<1)requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  },[inView,to,duration]);
  return <span ref={ref}>{prefix}{decimals?val.toFixed(decimals):Math.floor(val).toLocaleString("en-IN")}{suffix}</span>;
}

// ── Floating background particles ───────────────────────────────
function FloatingParticles() {
  const particles = useMemo(()=>Array.from({length:16},(_,i)=>({
    id:i, x:`${8+Math.random()*84}%`, y:`${5+Math.random()*88}%`,
    size:1.5+Math.random()*2.5, dur:7+Math.random()*11, delay:Math.random()*9,
    opacity:0.06+Math.random()*0.12,
  })),[]);
  return (
    <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:0}}>
      {particles.map(p=>(
        <motion.div key={p.id}
          style={{position:"absolute",left:p.x,top:p.y,width:p.size,height:p.size,borderRadius:"50%",background:"#a78bfa",opacity:p.opacity}}
          animate={{y:[0,-28,0],opacity:[p.opacity,p.opacity*2.8,p.opacity]}}
          transition={{duration:p.dur,delay:p.delay,repeat:Infinity,ease:"easeInOut"}}
        />
      ))}
    </div>
  );
}

// ── Trust / security strip ───────────────────────────────────────
function SecurityRow() {
  const ITEMS=[
    {icon:Lock,   label:"Zero data storage",    sub:"Nothing leaves your browser"},
    {icon:Shield, label:"No sign-up needed",     sub:"Fully anonymous"},
    {icon:Database,label:"Open methodology",    sub:"Transparent calculation"},
    {icon:Award,  label:"India-benchmarked",     sub:"RBI · SEBI · NHA data"},
  ];
  return (
    <motion.div initial={{opacity:0,y:14}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
      style={{display:"flex",justifyContent:"center",gap:10,flexWrap:"wrap"}}>
      {ITEMS.map((it,i)=>(
        <motion.div key={it.label} initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}}
          viewport={{once:true}} transition={{delay:i*0.08}}
          style={{display:"flex",alignItems:"center",gap:10,background:"rgba(255,255,255,0.03)",
            border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"10px 16px",backdropFilter:"blur(8px)"}}>
          <div style={{width:28,height:28,borderRadius:8,background:"rgba(124,58,237,0.12)",
            border:"1px solid rgba(124,58,237,0.18)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <it.icon style={{width:13,height:13,color:"#a78bfa"}}/>
          </div>
          <div>
            <p style={{fontFamily:"var(--font-heading)",fontWeight:700,color:"#e2e8f0",fontSize:"0.78rem",lineHeight:1,margin:0}}>{it.label}</p>
            <p style={{color:"#475569",fontSize:"0.65rem",marginTop:3,margin:0}}>{it.sub}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

function HeroPreviewCard() {
  const METRICS=[
    {label:"Risk Score",val:"Medium",color:"#f59e0b",bg:"rgba(245,158,11,0.09)",border:"rgba(245,158,11,0.18)"},
    {label:"Survival",val:"3.5 mo",color:"#60a5fa",bg:"rgba(96,165,250,0.08)",border:"rgba(96,165,250,0.14)"},
  ];
  return (
    <motion.div
      initial={{opacity:0,y:40,rotate:0}} animate={{opacity:1,y:0,rotate:-2}}
      transition={{duration:0.9,delay:0.45,ease:[0.22,1,0.36,1]}}
      style={{background:"linear-gradient(145deg,rgba(255,255,255,0.065) 0%,rgba(255,255,255,0.02) 100%)",backdropFilter:"blur(28px)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:24,padding:"28px",boxShadow:"0 48px 100px rgba(0,0,0,0.7),0 0 0 1px rgba(124,58,237,0.1),inset 0 1px 0 rgba(255,255,255,0.07)",position:"relative",overflow:"hidden"}}
    >
      {/* Top gradient line */}
      <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,#7c3aed 30%,#a78bfa 70%,transparent)"}}/>
      {/* Shimmer sweep */}
      <motion.div style={{position:"absolute",top:0,left:0,bottom:0,width:"45%",background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent)",pointerEvents:"none",zIndex:10}}
        animate={{x:["-100%","250%"]}} transition={{duration:2.8,delay:2.2,repeat:Infinity,repeatDelay:5,ease:"easeInOut"}}/>
      {/* Header row */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,#7c3aed,#6d28d9)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 12px rgba(124,58,237,0.4)"}}>
            <ShieldCheck style={{width:13,height:13,color:"white"}}/>
          </div>
          <span style={{fontFamily:"var(--font-heading)",fontWeight:700,fontSize:"0.82rem",color:"#94a3b8"}}>Sample Report</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:5}}>
          <motion.div animate={{scale:[1,1.5,1],opacity:[1,0.5,1]}} transition={{duration:1.8,repeat:Infinity}} style={{width:6,height:6,borderRadius:"50%",background:"#10b981",boxShadow:"0 0 8px rgba(16,185,129,0.7)"}}/>
          <span style={{fontSize:"0.62rem",color:"#10b981",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em"}}>Live</span>
        </div>
      </div>
      {/* Target amount */}
      <motion.div initial={{opacity:0,x:-12}} animate={{opacity:1,x:0}} transition={{delay:0.85}} style={{marginBottom:18}}>
        <p style={{fontSize:"0.62rem",color:"#334155",textTransform:"uppercase",letterSpacing:"0.15em",fontWeight:700,marginBottom:5}}>Emergency Fund Target</p>
        <div style={{display:"flex",alignItems:"baseline",gap:6}}>
          <span style={{fontFamily:"var(--font-heading)",fontWeight:900,fontSize:"2.7rem",lineHeight:1,color:"#f8fafc",letterSpacing:"-0.03em"}}>&#8377;4.2L</span>
          <span style={{fontSize:"0.75rem",color:"#475569"}}>/6 months</span>
        </div>
      </motion.div>
      {/* Progress bar */}
      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.0}} style={{marginBottom:18}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
          <span style={{fontSize:"0.7rem",color:"#475569"}}>Fund progress</span>
          <span style={{fontSize:"0.7rem",fontWeight:700,color:"#f59e0b"}}>58% funded</span>
        </div>
        <div style={{height:6,background:"rgba(255,255,255,0.07)",borderRadius:999,overflow:"hidden"}}>
          <motion.div initial={{width:0}} animate={{width:"58%"}} transition={{duration:2.2,delay:1.1,ease:[0.22,1,0.36,1]}} style={{height:"100%",background:"linear-gradient(90deg,#f59e0b,#fbbf24)",borderRadius:999,boxShadow:"0 0 8px rgba(245,158,11,0.4)"}}/>
        </div>
      </motion.div>
      {/* Metric tiles */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:18}}>
        {METRICS.map((s,i)=>(
          <motion.div key={s.label} initial={{opacity:0,scale:0.88}} animate={{opacity:1,scale:1}} transition={{delay:1.25+i*0.12,type:"spring",stiffness:280}}
            style={{background:s.bg,border:`1px solid ${s.border}`,borderRadius:10,padding:"10px 12px"}}>
            <p style={{fontFamily:"var(--font-heading)",fontWeight:700,color:s.color,fontSize:"0.9rem",marginBottom:3}}>{s.val}</p>
            <p style={{fontSize:"0.62rem",color:"#334155",textTransform:"uppercase",letterSpacing:"0.08em"}}>{s.label}</p>
          </motion.div>
        ))}
      </div>
      {/* AI insight row */}
      <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:1.5}}
        style={{background:"rgba(124,58,237,0.08)",border:"1px solid rgba(124,58,237,0.16)",borderRadius:12,padding:"12px 14px",display:"flex",gap:9,alignItems:"flex-start"}}>
        <Brain style={{width:13,height:13,color:"#a78bfa",flexShrink:0,marginTop:1}}/>
        <p style={{fontSize:"0.75rem",color:"#7c8b9a",lineHeight:1.65}}>EMI ratio of <strong style={{color:"#c4b5fd"}}>38%</strong> exceeds safe threshold. Recommend <strong style={{color:"#c4b5fd"}}>8-month buffer</strong>.</p>
      </motion.div>
    </motion.div>
  );
}

// ── Dual-direction tickers ───────────────────────────────────────
const TICKERS_A=["68% of Indians have zero emergency fund","Average medical emergency costs ₹2.8 lakh","3 in 5 households face income disruption yearly","Emergency loans charge 36%+ interest","Job loss takes 4–6 months to recover financially"];
const TICKERS_B=["AI analyses 14 risk factors in seconds","Personalised 3-tier investment split","Benchmarked against RBI national data","12-month savings roadmap included","Works for salaried, freelance & students"];
function TickerStrip(){
  const itemsA=[...TICKERS_A,...TICKERS_A];
  const itemsB=[...TICKERS_B,...TICKERS_B];
  return(
    <div style={{overflow:"hidden",borderTop:"1px solid rgba(255,255,255,0.05)",borderBottom:"1px solid rgba(255,255,255,0.05)",background:"rgba(255,255,255,0.015)"}}>
      <div style={{padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
        <motion.div animate={{x:["0%","-50%"]}} transition={{duration:30,repeat:Infinity,ease:"linear"}} style={{display:"flex",whiteSpace:"nowrap",width:"max-content"}}>
          {itemsA.map((item,i)=>(
            <span key={i} style={{display:"inline-flex",alignItems:"center",gap:10,paddingRight:52,color:"#2d3748",fontSize:"0.79rem",fontWeight:600}}>
              <span style={{width:4,height:4,borderRadius:"50%",background:"#7c3aed",display:"inline-block",flexShrink:0,opacity:0.6}}/>
              {item}
            </span>
          ))}
        </motion.div>
      </div>
      <div style={{padding:"10px 0"}}>
        <motion.div animate={{x:["-50%","0%"]}} transition={{duration:26,repeat:Infinity,ease:"linear"}} style={{display:"flex",whiteSpace:"nowrap",width:"max-content"}}>
          {itemsB.map((item,i)=>(
            <span key={i} style={{display:"inline-flex",alignItems:"center",gap:10,paddingRight:52,color:"#1e293b",fontSize:"0.79rem",fontWeight:600}}>
              <span style={{width:4,height:4,borderRadius:"50%",background:"#06b6d4",display:"inline-block",flexShrink:0,opacity:0.5}}/>
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function FAQItem({q,a,index}){
  const[open,setOpen]=useState(false);
  return(
    <motion.div initial={{opacity:0,y:14}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:index*0.06}} style={{marginBottom:8,background:"rgba(255,255,255,0.03)",border:`1px solid ${open?"rgba(124,58,237,0.22)":"rgba(255,255,255,0.07)"}`,borderRadius:14,overflow:"hidden",transition:"border 0.25s"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 24px",textAlign:"left",background:"none",border:"none",cursor:"pointer"}}>
        <span style={{fontFamily:"var(--font-heading)",fontWeight:600,color:"#e2e8f0",fontSize:"0.92rem"}}>{q}</span>
        <motion.div animate={{rotate:open?45:0}} transition={{duration:0.22,ease:[0.22,1,0.36,1]}} style={{width:22,height:22,borderRadius:7,background:"rgba(124,58,237,0.12)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginLeft:16,color:"#a78bfa",fontWeight:300,fontSize:"1.2rem"}}>+</motion.div>
      </button>
      <AnimatePresence>
        {open&&<motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.3,ease:[0.22,1,0.36,1]}} style={{overflow:"hidden"}}><p style={{padding:"0 24px 20px",color:"#64748b",fontSize:"0.88rem",lineHeight:1.8}}>{a}</p></motion.div>}
      </AnimatePresence>
    </motion.div>
  );
}

function Testimonial({text,name,role,avatar,index}){
  return(
    <motion.div initial={{opacity:0,y:22}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:index*0.1}}
      whileHover={{y:-5,boxShadow:"0 28px 64px rgba(0,0,0,0.5),0 0 0 1px rgba(124,58,237,0.14)"}}
      style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:20,padding:"24px",display:"flex",flexDirection:"column",gap:16,cursor:"default",transition:"border 0.3s"}}>
      <div style={{display:"flex",gap:3}}>
        {[...Array(5)].map((_,i)=>(
          <motion.div key={i} initial={{opacity:0,scale:0,rotate:-20}} whileInView={{opacity:1,scale:1,rotate:0}}
            viewport={{once:true}} transition={{delay:index*0.1+i*0.07,type:"spring",stiffness:320,damping:16}}>
            <Star style={{width:13,height:13,color:"#f59e0b",fill:"#f59e0b"}}/>
          </motion.div>
        ))}
      </div>
      <p style={{color:"#94a3b8",fontSize:"0.88rem",lineHeight:1.75,flex:1}}>&#8220;{text}&#8221;</p>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#06b6d4)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--font-heading)",fontWeight:700,color:"#fff",fontSize:"0.95rem",flexShrink:0}}>{avatar}</div>
        <div><p style={{fontWeight:700,color:"#f1f5f9",fontSize:"0.85rem",fontFamily:"var(--font-heading)",margin:0}}>{name}</p><p style={{fontSize:"0.72rem",color:"#475569",margin:0}}>{role}</p></div>
      </div>
    </motion.div>
  );
}

const STATS=[
  {value:68,prefix:"",suffix:"%",label:"Indians have zero emergency fund",src:"SEBI 2023",decimals:0,color:"#f43f5e",glow:"rgba(244,63,94,0.18)"},
  {value:2.8,prefix:"₹",suffix:"L",label:"Average medical emergency cost",src:"NHA Data",decimals:1,color:"#f59e0b",glow:"rgba(245,158,11,0.15)"},
  {value:3,prefix:"",suffix:" in 5",label:"Households face income disruption/year",src:"RBI Survey",decimals:0,color:"#60a5fa",glow:"rgba(96,165,250,0.15)"},
  {value:36,prefix:"",suffix:"%+",label:"Personal emergency loan interest rate",src:"CRISIL",decimals:0,color:"#a78bfa",glow:"rgba(167,139,250,0.15)"},
];
const TESTIMONIALS=[
  {text:"I thought I was doing fine financially. SafetyNet showed me I only had 1.2 months covered. I've now automated ₹18k/month and I'm at 4.5 months.",name:"Rohan M.",role:"Software Engineer, Bengaluru",avatar:"R"},
  {text:"The 3-tier breakdown changed how I think about emergency funds. Moved ₹1.5L from savings into a liquid fund — same safety, much better returns.",name:"Priya K.",role:"Marketing Manager, Mumbai",avatar:"P"},
  {text:"As a freelancer with variable income, this gave me a personalised target that accounts for my volatility. No generic calculator does this.",name:"Arjun S.",role:"Independent Consultant, Delhi",avatar:"A"},
];
const FAQS=[
  {q:"How is my emergency fund target calculated?",a:"We analyse 14 risk factors including job type, dependents, EMI obligations, city cost-of-living, health insurance coverage, and more. Each factor adjusts your target from the 3–6 month baseline."},
  {q:"Is my data stored anywhere?",a:"No. All calculations happen on your device. We don't collect, store, or sell any personal or financial data. The tool is purely educational."},
  {q:"What does 'Survival Months' mean?",a:"How long your current savings would cover your essential expenses (including EMIs) if your income stopped today — calculated to one decimal place."},
  {q:"Why does my risk score seem high?",a:"Common reasons: no health insurance, EMI-to-income ratio above 30%, having dependents, freelance/gig employment, or living in a Tier 1 city. Check your Risk Factors section for exact contributors."},
  {q:"What's the 3-tier split recommendation?",a:"Tier 1: instant-access savings account (1 month). Tier 2: liquid mutual fund (2–3 months) — same-day redemption, ~7% p.a. Tier 3: short-term FD (remaining) — locked but earning 7–8% p.a."},
];
const HOW=[
  {n:"01",title:"Enter Your Finances",desc:"Income, expenses, EMIs, savings, employment — under 2 minutes.",icon:Target},
  {n:"02",title:"AI Risk Assessment",desc:"14 factors scored to produce your personalised risk number.",icon:Brain},
  {n:"03",title:"Get Your Blueprint",desc:"Exact target, investment split, and a 12-month savings roadmap.",icon:Sparkles},
];

export default function Landing({onStart}){
  const { dark } = useTheme();
  return(
    <div>
      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{maxWidth:1100,margin:"0 auto",padding:"92px 24px 64px",position:"relative"}}>
        <FloatingParticles/>
        <div style={{display:"flex",gap:"clamp(32px,5vw,64px)",alignItems:"center",flexWrap:"wrap",position:"relative",zIndex:1}}>
          {/* Left */}
          <div style={{flex:"1 1 380px",minWidth:0}}>
            {/* Badge with shimmer */}
            <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} transition={{duration:0.5}} style={{marginBottom:28,display:"inline-block",position:"relative",overflow:"hidden",borderRadius:999}}>
              <span className="badge badge-violet" style={{padding:"6px 14px",fontSize:"0.72rem",display:"flex",alignItems:"center",gap:6}}><Sparkles style={{width:10,height:10}}/> AI-Powered &#183; India-First &#183; Free</span>
              <motion.div style={{position:"absolute",top:0,left:0,bottom:0,width:"50%",background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)",pointerEvents:"none"}} animate={{x:["-100%","200%"]}} transition={{duration:1.8,delay:1.8,repeat:Infinity,repeatDelay:5,ease:"easeInOut"}}/>
            </motion.div>
            {/* H1 — line-by-line stagger */}
            <div style={{marginBottom:22}}>
              {["Know exactly","how much emergency","fund you need."].map((line,i)=>(
                <motion.div key={i} initial={{opacity:0,y:36}} animate={{opacity:1,y:0}} transition={{duration:0.65,delay:0.1+i*0.13,ease:[0.22,1,0.36,1]}} style={{overflow:"hidden"}}>
                  <h1 style={{fontFamily:"var(--font-heading)",fontSize:"clamp(2.2rem,4.5vw,3.6rem)",fontWeight:800,lineHeight:1.08,letterSpacing:"-0.03em",margin:0,
                    ...(i===2 ? {background:"linear-gradient(135deg,#a78bfa 0%,#7c3aed 55%,#5b21b6 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"} : {color: dark ? "#f8fafc" : "#0f172a"})
                  }}>{line}</h1>
                </motion.div>
              ))}
            </div>
            <motion.p initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{duration:0.6,delay:0.42}} style={{fontSize:"1.05rem",color:"#64748b",lineHeight:1.75,marginBottom:36,maxWidth:460}}>
              A personalised calculator that analyses <strong style={{color:"#94a3b8"}}>14 risk factors</strong> to give you an exact target, investment split, and 12-month roadmap &#8212; <strong style={{color:"#94a3b8"}}>not a generic formula</strong>.
            </motion.p>

            <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.72}} style={{display:"flex",gap:22,flexWrap:"wrap"}}>
              {["No sign-up","No data stored","100% free"].map((t,i)=>(
                <motion.span key={t} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:0.72+i*0.08}} style={{display:"flex",alignItems:"center",gap:6,color:"#334155",fontSize:"0.76rem",fontWeight:600}}>
                  <CheckCircle2 style={{width:12,height:12,color:"#10b981"}}/>{t}
                </motion.span>
              ))}
            </motion.div>
          </div>
          {/* Right */}
          <div style={{flex:"0 1 360px",position:"relative",display:"flex",justifyContent:"center"}}>
            <div style={{position:"absolute",width:340,height:340,borderRadius:"50%",background:"radial-gradient(circle,rgba(124,58,237,0.22),transparent 70%)",filter:"blur(70px)",pointerEvents:"none",top:"50%",left:"50%",transform:"translate(-50%,-50%)"}}/>
            <div style={{position:"absolute",top:-30,right:-10,width:180,height:180,borderRadius:"50%",background:"radial-gradient(circle,rgba(6,182,212,0.12),transparent 70%)",filter:"blur(50px)",pointerEvents:"none"}}/>
            <div style={{width:"100%",maxWidth:360,position:"relative"}}>
              <HeroPreviewCard/>
              {/* AI complete badge — continuous float */}
              <motion.div initial={{opacity:0,scale:0.8,y:10}} animate={{opacity:1,scale:1,y:[0,-6,0]}}
                transition={{opacity:{delay:1.3,duration:0.4},scale:{delay:1.3,duration:0.4},y:{delay:1.7,duration:3.5,repeat:Infinity,ease:"easeInOut"}}}
                style={{position:"absolute",bottom:-18,left:-16,background:"rgba(9,9,15,0.95)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:12,padding:"9px 14px",display:"flex",alignItems:"center",gap:8,backdropFilter:"blur(12px)",boxShadow:"0 8px 24px rgba(0,0,0,0.45)"}}>
                <motion.div animate={{scale:[1,1.5,1],opacity:[1,0.5,1]}} transition={{duration:1.8,repeat:Infinity}} style={{width:8,height:8,borderRadius:"50%",background:"#10b981",boxShadow:"0 0 8px rgba(16,185,129,0.7)"}}/>
                <span style={{fontSize:"0.74rem",fontFamily:"var(--font-heading)",fontWeight:700,color:"#6ee7b7"}}>AI analysis complete</span>
              </motion.div>
              {/* 14 factors badge — continuous float offset */}
              <motion.div initial={{opacity:0,scale:0.8,y:-10}} animate={{opacity:1,scale:1,y:[0,6,0]}}
                transition={{opacity:{delay:1.6,duration:0.4},scale:{delay:1.6,duration:0.4},y:{delay:2.0,duration:4,repeat:Infinity,ease:"easeInOut"}}}
                style={{position:"absolute",top:-16,right:-12,background:"rgba(124,58,237,0.18)",border:"1px solid rgba(124,58,237,0.35)",borderRadius:10,padding:"7px 12px",backdropFilter:"blur(12px)",boxShadow:"0 8px 24px rgba(0,0,0,0.3)"}}>
                <span style={{fontSize:"0.72rem",fontFamily:"var(--font-heading)",fontWeight:700,color:"#c4b5fd"}}>14 factors scored</span>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECURITY ROW ────────────────────────────────── */}
      <section style={{maxWidth:1100,margin:"0 auto",padding:"0 24px 52px"}}>
        <SecurityRow/>
      </section>

      {/* ── DUAL TICKER ─────────────────────────────────── */}
      <TickerStrip/>

      {/* ── STATS ───────────────────────────────────────── */}
      <section style={{padding:"72px 24px 80px",maxWidth:1100,margin:"0 auto"}}>
        <motion.div initial={{opacity:0,y:14}} whileInView={{opacity:1,y:0}} viewport={{once:true}} style={{textAlign:"center",marginBottom:44}}>
          <p className="eyebrow" style={{marginBottom:12}}>The Reality</p>
          <h2 style={{fontFamily:"var(--font-heading)",fontSize:"clamp(1.6rem,3vw,2.3rem)",fontWeight:800,letterSpacing:"-0.025em",color: dark ? "#f1f5f9" : "#0f172a",margin:0}}>Why most Indians are financially vulnerable</h2>
        </motion.div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:14}}>
          {STATS.map((s,i)=>(
            <motion.div key={i} initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.09,duration:0.5}}
              whileHover={{y:-5,boxShadow:`0 28px 64px ${s.glow},0 0 0 1px rgba(255,255,255,0.06)`}}
              style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:20,padding:"28px 24px",textAlign:"center",cursor:"default",position:"relative",overflow:"hidden",transition:"border 0.3s"}}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${s.color},transparent)`}}/>
              <div style={{fontFamily:"var(--font-heading)",fontSize:"2.4rem",fontWeight:800,lineHeight:1,marginBottom:10,color:s.color}}>
                <Counter to={s.value} prefix={s.prefix} suffix={s.suffix} decimals={s.decimals}/>
              </div>
              <p style={{fontSize:"0.82rem",color:"#64748b",lineHeight:1.6,marginBottom:10}}>{s.label}</p>
              <span style={{background:"rgba(255,255,255,0.06)",color:"#334155",border:"1px solid rgba(255,255,255,0.08)",padding:"2px 9px",borderRadius:999,fontSize:"0.6rem",fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase"}}>{s.src}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────── */}
      <section style={{padding:"0 24px 88px",maxWidth:1100,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:52}}>
          <motion.p className="eyebrow" initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}} style={{marginBottom:12}}>Process</motion.p>
          <motion.h2 initial={{opacity:0,y:14}} whileInView={{opacity:1,y:0}} viewport={{once:true}} style={{fontFamily:"var(--font-heading)",fontSize:"clamp(1.6rem,3vw,2.3rem)",fontWeight:800,letterSpacing:"-0.025em",color: dark ? "#f1f5f9" : "#0f172a",margin:0}}>From numbers to blueprint in 3 steps</motion.h2>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:0,position:"relative"}}>
          {/* Connector line that draws itself */}
          <div style={{position:"absolute",top:48,left:"22%",right:"22%",height:1,overflow:"hidden",zIndex:0,pointerEvents:"none"}}>
            <motion.div initial={{scaleX:0}} whileInView={{scaleX:1}} viewport={{once:true}} transition={{duration:1.1,delay:0.5,ease:[0.22,1,0.36,1]}} style={{height:"100%",background:"repeating-linear-gradient(90deg,rgba(124,58,237,0.4) 0,rgba(124,58,237,0.4) 6px,transparent 6px,transparent 14px)",transformOrigin:"left"}}/>
          </div>
          {HOW.map((step,i)=>(
            <motion.div key={i} initial={{opacity:0,y:28}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.14,duration:0.55}} style={{padding:"0 28px",textAlign:"center",position:"relative",zIndex:1}}>
              <div style={{display:"inline-flex",marginBottom:20,position:"relative"}}>
                <span style={{position:"absolute",fontFamily:"var(--font-heading)",fontWeight:900,fontSize:"4.5rem",color:"rgba(124,58,237,0.07)",letterSpacing:"-0.05em",top:-18,left:"50%",transform:"translateX(-50%)",pointerEvents:"none",userSelect:"none",whiteSpace:"nowrap"}}>{step.n}</span>
                <motion.div whileInView={{boxShadow:["0 4px 20px rgba(124,58,237,0.1)","0 4px 36px rgba(124,58,237,0.45)","0 4px 20px rgba(124,58,237,0.1)"]}} viewport={{once:false}} transition={{duration:2.2,delay:i*0.2+0.7,repeat:Infinity,ease:"easeInOut"}}
                  style={{width:64,height:64,borderRadius:18,background:"rgba(124,58,237,0.12)",border:"1px solid rgba(124,58,237,0.22)",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",zIndex:1}}>
                  <motion.div initial={{scale:0,rotate:-30}} whileInView={{scale:1,rotate:0}} viewport={{once:true}} transition={{delay:i*0.14+0.28,type:"spring",stiffness:320,damping:18}}>
                    <step.icon style={{width:26,height:26,color:"#a78bfa"}}/>
                  </motion.div>
                </motion.div>
              </div>
              <h3 style={{fontFamily:"var(--font-heading)",fontWeight:700,color:"#f1f5f9",fontSize:"1rem",marginBottom:10}}>{step.title}</h3>
              <p style={{color:"#475569",fontSize:"0.85rem",lineHeight:1.7}}>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES BENTO ──────────────────────────────── */}
      <section style={{padding:"0 24px 88px",maxWidth:1100,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:52}}>
          <motion.p className="eyebrow" initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}} style={{marginBottom:12}}>What you get</motion.p>
          <motion.h2 initial={{opacity:0,y:14}} whileInView={{opacity:1,y:0}} viewport={{once:true}} style={{fontFamily:"var(--font-heading)",fontSize:"clamp(1.6rem,3vw,2.3rem)",fontWeight:800,letterSpacing:"-0.025em",color: dark ? "#f1f5f9" : "#0f172a",margin:0}}>Beyond a simple calculator</motion.h2>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:14}}>
          {/* Large — 4 col */}
          <motion.div initial={{opacity:0,y:22}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
            whileHover={{y:-4,boxShadow:"0 32px 80px rgba(124,58,237,0.2),0 0 0 1px rgba(124,58,237,0.28)"}}
            style={{gridColumn:"span 4",background:"linear-gradient(135deg,rgba(124,58,237,0.1),rgba(124,58,237,0.04))",border:"1px solid rgba(124,58,237,0.15)",borderRadius:22,padding:"32px",position:"relative",overflow:"hidden",cursor:"default",transition:"border 0.3s"}}>
            <motion.div style={{position:"absolute",top:0,left:0,bottom:0,width:"40%",background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.03),transparent)",pointerEvents:"none"}} animate={{x:["-100%","250%"]}} transition={{duration:3.2,delay:4,repeat:Infinity,repeatDelay:6,ease:"easeInOut"}}/>
            <div style={{position:"absolute",top:-40,right:-40,width:220,height:220,borderRadius:"50%",background:"radial-gradient(circle,rgba(124,58,237,0.14),transparent 70%)",pointerEvents:"none"}}/>
            <motion.div initial={{scale:0.8,opacity:0}} whileInView={{scale:1,opacity:1}} viewport={{once:true}} transition={{delay:0.15,type:"spring",stiffness:200}} style={{width:44,height:44,borderRadius:14,background:"rgba(167,139,250,0.15)",border:"1px solid rgba(167,139,250,0.2)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:18}}>
              <Brain style={{width:22,height:22,color:"#a78bfa"}}/>
            </motion.div>
            <h3 style={{fontFamily:"var(--font-heading)",fontWeight:700,color:"#f1f5f9",fontSize:"1.15rem",marginBottom:10}}>AI Risk Scoring Engine</h3>
            <p style={{color:"#64748b",fontSize:"0.88rem",lineHeight:1.75,marginBottom:20,maxWidth:440}}>14 weighted factors &#8212; employment stability, debt-to-income ratio, dependents, insurance, city cost-of-living &#8212; each scored to produce your unique risk number.</p>
            <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
              {["Job Security","EMI Load","Insurance","City Tier","Dependents","Age Group","Rent/Own","Savings Rate"].map((tag,i)=>(
                <motion.span key={tag} initial={{opacity:0,scale:0.8}} whileInView={{opacity:1,scale:1}} viewport={{once:true}} transition={{delay:0.08+i*0.05}} style={{background:"rgba(124,58,237,0.12)",color:"#a78bfa",border:"1px solid rgba(124,58,237,0.2)",padding:"4px 12px",borderRadius:999,fontSize:"0.72rem",fontWeight:600}}>{tag}</motion.span>
              ))}
            </div>
          </motion.div>
          {/* Medium — 2 col */}
          <motion.div initial={{opacity:0,y:22}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:0.08}}
            whileHover={{y:-4,boxShadow:"0 24px 60px rgba(52,211,153,0.14),0 0 0 1px rgba(52,211,153,0.2)"}}
            style={{gridColumn:"span 2",background:"rgba(52,211,153,0.05)",border:"1px solid rgba(52,211,153,0.1)",borderRadius:22,padding:"28px",position:"relative",overflow:"hidden",cursor:"default",transition:"border 0.3s"}}>
            <div style={{position:"absolute",bottom:-20,right:-20,width:130,height:130,borderRadius:"50%",background:"radial-gradient(circle,rgba(52,211,153,0.14),transparent 70%)",pointerEvents:"none"}}/>
            <motion.div initial={{scale:0.8,opacity:0}} whileInView={{scale:1,opacity:1}} viewport={{once:true}} transition={{delay:0.2,type:"spring",stiffness:200}} style={{width:40,height:40,borderRadius:12,background:"rgba(52,211,153,0.12)",border:"1px solid rgba(52,211,153,0.18)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16}}>
              <TrendingUp style={{width:20,height:20,color:"#34d399"}}/>
            </motion.div>
            <h3 style={{fontFamily:"var(--font-heading)",fontWeight:700,color:"#f1f5f9",fontSize:"1rem",marginBottom:8}}>12-Month Projection</h3>
            <p style={{color:"#64748b",fontSize:"0.85rem",lineHeight:1.7}}>Visual roadmap showing exactly when you hit your target based on your current monthly surplus.</p>
          </motion.div>
          {/* 3 small — 2 col each */}
          {[
            {icon:BarChart3,color:"#60a5fa",border:"rgba(96,165,250,0.12)",bg:"rgba(96,165,250,0.05)",title:"3-Tier Architecture",desc:"Optimised split across savings account, liquid MF, and short-term FD — each for a different emergency type.",glow:"rgba(96,165,250,0.12)"},
            {icon:Users,color:"#f472b6",border:"rgba(244,114,182,0.1)",bg:"rgba(244,114,182,0.04)",title:"India-Benchmarked",desc:"Percentile rank vs national average. See where you stand among Indian households.",glow:"rgba(244,114,182,0.1)"},
            {icon:Activity,color:"#fb923c",border:"rgba(251,146,60,0.1)",bg:"rgba(251,146,60,0.04)",title:"Stress Simulator",desc:"Simulate income loss or expense spikes and watch your survival months update live.",glow:"rgba(251,146,60,0.1)"},
          ].map((f,i)=>(
            <motion.div key={f.title} initial={{opacity:0,y:22}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:0.1+i*0.07}}
              whileHover={{y:-4,boxShadow:`0 20px 48px ${f.glow},0 0 0 1px ${f.border}`}}
              style={{gridColumn:"span 2",background:f.bg,border:`1px solid ${f.border}`,borderRadius:22,padding:"26px",cursor:"default",transition:"border 0.3s"}}>
              <motion.div initial={{scale:0.8,opacity:0}} whileInView={{scale:1,opacity:1}} viewport={{once:true}} transition={{delay:0.14+i*0.07,type:"spring",stiffness:200}} style={{width:38,height:38,borderRadius:11,background:f.border,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:14}}>
                <f.icon style={{width:18,height:18,color:f.color}}/>
              </motion.div>
              <h3 style={{fontFamily:"var(--font-heading)",fontWeight:700,color:"#f1f5f9",fontSize:"0.95rem",marginBottom:8}}>{f.title}</h3>
              <p style={{color:"#64748b",fontSize:"0.84rem",lineHeight:1.7}}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────── */}
      <section style={{padding:"0 24px 88px",maxWidth:1100,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:52}}>
          <motion.p className="eyebrow" initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}} style={{marginBottom:12}}>Social Proof</motion.p>
          <motion.h2 initial={{opacity:0,y:14}} whileInView={{opacity:1,y:0}} viewport={{once:true}} style={{fontFamily:"var(--font-heading)",fontSize:"clamp(1.6rem,3vw,2.3rem)",fontWeight:800,letterSpacing:"-0.025em",color: dark ? "#f1f5f9" : "#0f172a",margin:0}}>What users are saying</motion.h2>
          <motion.p initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}} transition={{delay:0.14}} style={{color:"#475569",fontSize:"0.88rem",marginTop:12}}>Verified by 4,200+ Indians who calculated their emergency fund</motion.p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16}}>
          {TESTIMONIALS.map((t,i)=><Testimonial key={i} {...t} index={i}/>)}
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────── */}
      <section style={{padding:"0 24px 88px",maxWidth:700,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:44}}>
          <motion.p className="eyebrow" initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}} style={{marginBottom:12}}>FAQ</motion.p>
          <motion.h2 initial={{opacity:0,y:14}} whileInView={{opacity:1,y:0}} viewport={{once:true}} style={{fontFamily:"var(--font-heading)",fontSize:"clamp(1.6rem,3vw,2.3rem)",fontWeight:800,letterSpacing:"-0.025em",color: dark ? "#f1f5f9" : "#0f172a",margin:0}}>Common questions</motion.h2>
        </div>
        {FAQS.map((faq,i)=><FAQItem key={i} q={faq.q} a={faq.a} index={i}/>)}
      </section>

      {/* ── CTA BANNER ──────────────────────────────────── */}
      <section style={{padding:"0 24px 96px",maxWidth:1100,margin:"0 auto"}}>
        <motion.div initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
          style={{background:"linear-gradient(135deg,rgba(124,58,237,0.14),rgba(6,182,212,0.07))",border:"1px solid rgba(124,58,237,0.2)",borderRadius:28,padding:"60px 48px",textAlign:"center",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-60,left:-60,width:280,height:280,borderRadius:"50%",background:"radial-gradient(circle,rgba(124,58,237,0.22),transparent 70%)",pointerEvents:"none",filter:"blur(40px)"}}/>
          <div style={{position:"absolute",bottom:-40,right:-40,width:240,height:240,borderRadius:"50%",background:"radial-gradient(circle,rgba(6,182,212,0.14),transparent 70%)",pointerEvents:"none",filter:"blur(40px)"}}/>
          {/* Scanning border line */}
          <motion.div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,rgba(124,58,237,0.9),transparent)",pointerEvents:"none"}} animate={{x:["-100%","100%"]}} transition={{duration:3.2,repeat:Infinity,ease:"easeInOut",repeatDelay:2.5}}/>
          <div style={{position:"relative"}}>
            <motion.p className="eyebrow" initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}} style={{marginBottom:14}}>Free &#183; Instant &#183; No sign-up</motion.p>
            <motion.h2 initial={{opacity:0,y:14}} whileInView={{opacity:1,y:0}} viewport={{once:true}} style={{fontFamily:"var(--font-heading)",fontSize:"clamp(1.8rem,4vw,2.8rem)",fontWeight:800,letterSpacing:"-0.03em",color: dark ? "#f8fafc" : "#0f172a",marginBottom:14}}>Start building your safety net today.</motion.h2>
            <motion.p initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}} transition={{delay:0.12}} style={{color:"#64748b",fontSize:"1rem",maxWidth:480,margin:"0 auto 40px"}}>Takes 2 minutes. Get a personalised number that accounts for your specific situation &#8212; not a generic 6-month rule.</motion.p>
<motion.p initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}} transition={{delay:0.18}} style={{color:"#475569",fontSize:"0.9rem",marginTop:8}}>Sign in or create a free account to access your personalised analysis.</motion.p>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
