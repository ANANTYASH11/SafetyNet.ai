import React, { useState, useRef, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { generatePDF } from "../utils/generatePDF";
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import {
  ShieldAlert, ShieldCheck, TrendingUp, Download, Save, RefreshCw,
  AlertTriangle, CheckCircle2, Zap, Target, Clock,
  Activity, ChevronRight, Brain, Cpu, BarChart3, Sparkles,
  TrendingDown, Layers, CreditCard, Copy
} from "lucide-react";

const FMT  = (n) => "\u20b9" + Math.round(n).toLocaleString("en-IN");
const FMT2 = (n) => {
  const v=Number(n);
  if(v>=10_00_000)return "\u20b9"+(v/10_00_000).toFixed(1)+"L";
  if(v>=1_000)    return "\u20b9"+(v/1_000).toFixed(0)+"k";
  return "\u20b9"+Math.round(v);
};

function AnimatedNum({to,prefix="\u20b9",decimals=0,duration=1500}){
  const[v,setV]=useState(0);
  const ref=useRef(null);
  const inView=useInView(ref,{once:true});
  useEffect(()=>{
    if(!inView)return;
    const start=Date.now();
    const tick=()=>{
      const pct=Math.min((Date.now()-start)/duration,1);
      setV(to*(1-Math.pow(1-pct,3)));
      if(pct<1)requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  },[inView,to,duration]);
  return <span ref={ref}>{prefix}{decimals?v.toFixed(decimals):Math.round(v).toLocaleString("en-IN")}</span>;
}

function RiskGauge({score,level,color}){
  const r=80,cx=100,cy=110;
  const circ=2*Math.PI*r,arcLen=circ*0.75,filled=arcLen*(score/100),offset=-(circ*0.125);
  const glow=color==="#f43f5e"?"rgba(244,63,94,0.8)":color==="#f59e0b"?"rgba(245,158,11,0.8)":"rgba(16,185,129,0.8)";
  return(
    <svg viewBox="0 0 200 165" style={{width:"100%",maxWidth:200}}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={12} strokeDasharray={`${arcLen} ${circ}`} strokeDashoffset={offset} strokeLinecap="round" transform={`rotate(135 ${cx} ${cy})`}/>
      <motion.circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={12} strokeDasharray={`0 ${circ}`} strokeDashoffset={offset} strokeLinecap="round" transform={`rotate(135 ${cx} ${cy})`} animate={{strokeDasharray:`${filled} ${circ}`}} transition={{duration:1.6,ease:[0.22,1,0.36,1]}} style={{filter:`drop-shadow(0 0 10px ${glow})`}}/>
      <text x={cx} y={cy-12} textAnchor="middle" fill="#f8fafc" fontFamily="Space Grotesk, sans-serif" fontWeight="800" fontSize="34">{score}</text>
      <text x={cx} y={cy+10} textAnchor="middle" fill={color} fontFamily="Space Grotesk, sans-serif" fontWeight="700" fontSize="11" style={{textTransform:"uppercase",letterSpacing:2.5}}>{level}</text>
      <text x={cx} y={cy+28} textAnchor="middle" fill="#334155" fontFamily="Space Grotesk" fontWeight="500" fontSize="10">Risk Score</text>
      <text x={16}  y={cy+22} fill="#1e293b" fontFamily="Space Grotesk" fontSize="9" fontWeight="700">LOW</text>
      <text x={163} y={cy+22} fill="#1e293b" fontFamily="Space Grotesk" fontSize="9" fontWeight="700">HIGH</text>
    </svg>
  );
}

function ChartTip({active,payload,label}){
  if(!active||!payload?.length)return null;
  return(
    <div style={{background:"rgba(9,9,15,0.95)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:12,padding:"10px 14px"}}>
      <p style={{fontSize:"0.72rem",color:"#475569",marginBottom:4,fontWeight:600}}>{label}</p>
      {payload.map((p,i)=><p key={i} style={{fontSize:"0.88rem",fontFamily:"var(--font-heading)",fontWeight:700,color:p.color||"#a78bfa"}}>{FMT2(p.value)}</p>)}
    </div>
  );
}

function AIChatBubble({text,type="insight",delay=0}){
  const S={
    insight:   {bg:"rgba(124,58,237,0.1)",border:"rgba(124,58,237,0.25)",icon:<Brain style={{width:14,height:14,color:"#a78bfa",flexShrink:0}}/>},
    suggestion:{bg:"rgba(16,185,129,0.08)",border:"rgba(16,185,129,0.25)",icon:<CheckCircle2 style={{width:14,height:14,color:"#10b981",flexShrink:0}}/>},
    warning:   {bg:"rgba(244,63,94,0.08)",border:"rgba(244,63,94,0.25)",icon:<AlertTriangle style={{width:14,height:14,color:"#f43f5e",flexShrink:0}}/>},
  };
  const s=S[type];
  return(
    <motion.div initial={{opacity:0,x:-12}} animate={{opacity:1,x:0}} transition={{delay,duration:0.4,ease:[0.22,1,0.36,1]}} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"13px 15px",background:s.bg,border:`1px solid ${s.border}`,borderRadius:13,marginBottom:10}}>
      <div style={{width:24,height:24,borderRadius:"50%",background:"rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>{s.icon}</div>
      <p style={{fontSize:"0.84rem",color:"#cbd5e1",lineHeight:1.7}}>{text}</p>
    </motion.div>
  );
}

function SH({eyebrow,title,icon:Icon}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
      {Icon&&<div style={{width:32,height:32,borderRadius:9,background:"rgba(124,58,237,0.12)",border:"1px solid rgba(124,58,237,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon style={{width:15,height:15,color:"#a78bfa"}}/></div>}
      <div>
        {eyebrow&&<p className="eyebrow" style={{marginBottom:2}}>{eyebrow}</p>}
        <h3 style={{fontFamily:"var(--font-heading)",fontWeight:700,color:"#f1f5f9",fontSize:"0.95rem",margin:0}}>{title}</h3>
      </div>
    </div>
  );
}

export default function Dashboard({data,onRecalculate,onSave,user}){
  const[saved,setSaved]=useState(false);
  const[copied,setCopied]=useState(false);
  const[stressInc,setStressInc]=useState(0);
  const[stressExp,setStressExp]=useState(0);
  const[tab,setTab]=useState("overview");
  const[announced,setAnnounced]=useState(true);
  useEffect(()=>{const t=setTimeout(()=>setAnnounced(false),3500);return()=>clearTimeout(t);},[]);

  const d=data||{};
  const riskColor=d.riskScore>=70?"#f43f5e":d.riskScore>=40?"#f59e0b":"#10b981";
  const riskBadge=d.riskScore>=70?"danger":d.riskScore>=40?"warning":"success";
  const pct=Math.min(100,Math.round((d.monthsCovered/(d.monthsRecommended||6))*100));
  const targetFund=d.recommendedFund||d.emergencyFund||0;
  const savings=d.inputs?.savings||0;
  const gap=Math.max(0,targetFund-savings);
  const stressedMonthly=Math.max(0,((d.inputs?.monthlyExpenses||0)+(d.inputs?.emi||0))*(1+stressExp/100));
  const stressedIncome=(d.inputs?.monthlyIncome||0)*(1-stressInc/100);
  const stressedSurvival=stressedMonthly>0?(savings/stressedMonthly).toFixed(1):"\u221e";
  const pieData=[
    {name:"Living Expenses",value:d.inputs?.monthlyExpenses||0,color:"#a78bfa"},
    {name:"EMI",value:d.inputs?.emi||0,color:"#60a5fa"},
    {name:"Surplus",value:Math.max(0,d.surplusIncome||0),color:"#34d399"},
  ].filter(x=>x.value>0);

  async function handleSave(){await onSave(d);setSaved(true);setTimeout(()=>setSaved(false),2500);}
  function handleDownload(){ generatePDF(d, user?.name||null); }
  async function handleCopy(){
    const surplus=Math.max(0,(d.inputs?.monthlyIncome||0)-(d.inputs?.monthlyExpenses||0)-(d.inputs?.emi||0));
    const text=[`SafetyNet.ai Report \u2014 ${new Date().toLocaleDateString("en-IN",{dateStyle:"medium"})}`,`Risk: ${d.riskLevel} (${d.riskScore}/100)`,`Target Fund: ${FMT(targetFund)}`,`Coverage: ${d.monthsCovered} months`,`Monthly Surplus: ${FMT(surplus)}`,`Gap to Goal: ${FMT(gap)}`,d.insights?`\nInsights: ${d.insights.slice(0,200)}...`:"","\nFor educational purposes only."].filter(Boolean).join("\n");
    try{await navigator.clipboard.writeText(text);}catch{return;}
    setCopied(true);setTimeout(()=>setCopied(false),2000);
  }

  const TABS=[{id:"overview",label:"Overview",icon:BarChart3},{id:"ai",label:"AI Insights",icon:Brain},{id:"projection",label:"Projection",icon:TrendingUp},{id:"stress",label:"Stress Test",icon:Activity},{id:"ml",label:"ML Analysis",icon:Cpu}];

  /* Smart suggestion cards — derived from analysis data */
  const smartSuggestions = [];
  if (gap > 0 && (d.surplusIncome||0) > 0) {
    const months = Math.ceil(gap / (d.surplusIncome||1));
    smartSuggestions.push({
      icon: TrendingUp, color: "#a78bfa", bg: "rgba(124,58,237,0.08)", border: "rgba(124,58,237,0.22)",
      title: `Save ${FMT2(d.suggestedMonthly||d.surplusIncome)} / month`,
      desc:  `At this rate, you'll close the ${FMT2(gap)} gap in ~${months} month${months===1?"":"s"}.`,
    });
  }
  if ((d.inputs?.hasHealthInsurance||"") === "no") {
    smartSuggestions.push({
      icon: ShieldCheck, color: "#f43f5e", bg: "rgba(244,63,94,0.08)", border: "rgba(244,63,94,0.22)",
      title: "Get health insurance first",
      desc:  "One hospitalisation can wipe out your emergency fund. A ₹5L family floater costs ~₹800–1,200/month.",
    });
  }
  if ((d.inputs?.emi||0) / (d.inputs?.monthlyIncome||1) > 0.35) {
    smartSuggestions.push({
      icon: CreditCard, color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.22)",
      title: "EMI exceeds 35% of income",
      desc:  "High debt load increases financial risk. Consider pre-paying the highest-interest loan first.",
    });
  }
  if ((d.inputs?.savings||0) < (d.inputs?.monthlyExpenses||0) * 2) {
    smartSuggestions.push({
      icon: Zap, color: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.22)",
      title: "Start a 2-week emergency buffer",
      desc:  `Park ${FMT2((d.inputs?.monthlyExpenses||0) * 0.5)} in a liquid MF this month as an immediate safety net.`,
    });
  }
  if ((d.tiers||[])[1]?.amount > 0) {
    smartSuggestions.push({
      icon: Layers, color: "#60a5fa", bg: "rgba(96,165,250,0.08)", border: "rgba(96,165,250,0.22)",
      title: "Open a Liquid Mutual Fund SIP",
      desc:  `Allocate ${FMT2((d.tiers||[])[1]?.amount||0)} to Tier 2 (Liquid MF). Earns ~7% p.a. with T+1 withdrawal.`,
    });
  }

  return(
    <div style={{maxWidth:1100,margin:"0 auto"}}>
      {/* ── Smart Suggestions Banner ─────────── */}
      {smartSuggestions.length > 0 && (
        <motion.div
          initial={{opacity:0,y:-16}} animate={{opacity:1,y:0}}
          transition={{delay:0.15,duration:0.5,ease:[0.22,1,0.36,1]}}
          style={{marginBottom:22,padding:"18px 20px",background:"rgba(124,58,237,0.07)",border:"1px solid rgba(124,58,237,0.2)",borderRadius:18}}
        >
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
            <Sparkles style={{width:15,height:15,color:"#a78bfa"}}/>
            <span style={{fontFamily:"var(--font-heading)",fontWeight:700,color:"#c4b5fd",fontSize:"0.85rem"}}>Smart Suggestions for You</span>
            <span style={{fontSize:"0.65rem",color:"#475569",marginLeft:"auto"}}>Based on your analysis</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10}}>
            {smartSuggestions.slice(0,4).map((s,i)=>(
              <motion.div key={i}
                initial={{opacity:0,scale:0.93}} animate={{opacity:1,scale:1}}
                transition={{delay:0.25+i*0.08,type:"spring",stiffness:300,damping:22}}
                style={{background:s.bg,border:`1px solid ${s.border}`,borderRadius:13,padding:"13px 14px",display:"flex",flexDirection:"column",gap:6}}
              >
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <div style={{width:26,height:26,borderRadius:8,background:s.bg,border:`1px solid ${s.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <s.icon style={{width:13,height:13,color:s.color}}/>
                  </div>
                  <p style={{fontFamily:"var(--font-heading)",fontWeight:700,color:"#e2e8f0",fontSize:"0.82rem",lineHeight:1.3}}>{s.title}</p>
                </div>
                <p style={{fontSize:"0.75rem",color:"#64748b",lineHeight:1.6,paddingLeft:33}}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Report-ready toast ───────────────── */}
      <AnimatePresence>
        {announced&&(
          <motion.div
            initial={{opacity:0,y:-48,x:"-50%"}} animate={{opacity:1,y:0,x:"-50%"}} exit={{opacity:0,y:-32,x:"-50%",scale:0.96}}
            transition={{duration:0.4,ease:[0.22,1,0.36,1]}}
            style={{position:"fixed",top:76,left:"50%",zIndex:200,background:"rgba(9,9,15,0.96)",
              border:`1px solid ${riskColor}50`,borderRadius:14,padding:"11px 22px",
              display:"flex",alignItems:"center",gap:10,backdropFilter:"blur(20px)",
              boxShadow:`0 8px 40px rgba(0,0,0,0.55),0 0 0 1px ${riskColor}20`}}>
            <motion.div animate={{scale:[0,1.3,1]}} transition={{duration:0.4}}>
              <CheckCircle2 style={{width:15,height:15,color:"#10b981"}}/>
            </motion.div>
            <span style={{fontFamily:"var(--font-heading)",fontWeight:700,color:"#f1f5f9",fontSize:"0.83rem",whiteSpace:"nowrap"}}>
              Report generated &nbsp;·&nbsp; <span style={{color:riskColor}}>{d.riskLevel} Risk</span> &nbsp;·&nbsp; Target {FMT2(d.recommendedFund||0)}
            </span>
            <motion.div style={{width:3,height:3,borderRadius:"50%",background:"#475569",marginLeft:4}}
              animate={{opacity:[1,0.3,1]}} transition={{duration:1.2,repeat:Infinity}}/>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ── Header bar ───────────────────── */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28,flexWrap:"wrap",gap:12}}>
        <div>
          <p className="eyebrow" style={{marginBottom:6}}>Analysis Complete</p>
          <h1 style={{fontFamily:"var(--font-heading)",fontWeight:800,fontSize:"clamp(1.5rem,3vw,2rem)",color:"#f1f5f9",letterSpacing:"-0.025em",margin:0}}>Your Emergency Fund Report</h1>
          <p style={{color:"#475569",fontSize:"0.82rem",marginTop:4}}>Generated {new Date().toLocaleDateString("en-IN",{dateStyle:"medium"})} · AI: <span style={{color:"#a78bfa",fontWeight:600}}>{d.aiSource||"fallback"}</span></p>
        </div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <button onClick={onRecalculate} className="btn-outline" style={{display:"flex",alignItems:"center",gap:8,padding:"10px 18px"}}><RefreshCw style={{width:14,height:14}}/> Recalculate</button>
          <motion.button onClick={handleCopy} whileHover={{scale:1.02}} whileTap={{scale:0.97}} className="btn-outline" style={{display:"flex",alignItems:"center",gap:8,padding:"10px 18px"}}>
            {copied?<><CheckCircle2 style={{width:14,height:14,color:"#10b981"}}/> Copied!</>:<><Copy style={{width:14,height:14}}/> Copy</>}
          </motion.button>
          <motion.button onClick={handleDownload} whileHover={{scale:1.02}} whileTap={{scale:0.97}} className="btn-outline" style={{display:"flex",alignItems:"center",gap:8,padding:"10px 18px"}}><Download style={{width:14,height:14}}/> PDF</motion.button>
          <button onClick={handleSave} className="btn-violet" style={{display:"flex",alignItems:"center",gap:8,padding:"10px 18px",opacity:saved?0.7:1}}>
            {saved?<><CheckCircle2 style={{width:14,height:14}}/> Saved!</>:<><Save style={{width:14,height:14}}/> Save Report</>}
          </button>
        </div>
      </div>

      {/* ── Hero metric strip ─────────────── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:14,marginBottom:24}}>
        {[
          {label:"Target Fund",val:<AnimatedNum to={targetFund}/>,sub:`${d.monthsRecommended||6}-month target`,accent:"#a78bfa",bg:"linear-gradient(135deg,rgba(124,58,237,0.15),rgba(124,58,237,0.05))",border:"rgba(124,58,237,0.25)"},
          {label:"Risk Score",val:<AnimatedNum to={d.riskScore||0} prefix=""/>,sub:d.riskLevel,accent:riskColor,bg:`linear-gradient(135deg,${riskColor}22,${riskColor}08)`,border:`${riskColor}40`},
          {label:"Survival Months",val:<AnimatedNum to={d.monthsCovered||0} prefix=""/>,sub:"months covered now",accent:"#60a5fa",bg:"linear-gradient(135deg,rgba(96,165,250,0.12),rgba(96,165,250,0.04))",border:"rgba(96,165,250,0.25)"},
          {label:"Monthly Surplus",val:<AnimatedNum to={Math.abs(d.surplusIncome||0)} prefix={d.surplusIncome>=0?"\u20b9":"-\u20b9"}/>,sub:"after all obligations",accent:d.surplusIncome>=0?"#34d399":"#f43f5e",bg:d.surplusIncome>=0?"linear-gradient(135deg,rgba(52,211,153,0.12),rgba(52,211,153,0.04))":"linear-gradient(135deg,rgba(244,63,94,0.12),rgba(244,63,94,0.04))",border:d.surplusIncome>=0?"rgba(52,211,153,0.25)":"rgba(244,63,94,0.25)"},
        ].map((card,i)=>(
          <motion.div key={i} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.08,duration:0.45}} style={{background:card.bg,border:`1px solid ${card.border}`,borderRadius:18,padding:"22px 20px"}}>
            <p className="label" style={{marginBottom:8}}>{card.label}</p>
            <div style={{fontFamily:"var(--font-heading)",fontWeight:800,fontSize:"1.7rem",color:card.accent,lineHeight:1,marginBottom:5}}>{card.val}</div>
            <p style={{fontSize:"0.73rem",color:"#475569"}}>{card.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Tab nav ───────────────────────── */}
      <div style={{display:"flex",gap:6,marginBottom:22,overflowX:"auto",paddingBottom:4}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:7,padding:"9px 18px",borderRadius:11,border:"1px solid",cursor:"pointer",whiteSpace:"nowrap",fontFamily:"var(--font-heading)",fontWeight:600,fontSize:"0.84rem",background:tab===t.id?"rgba(124,58,237,0.2)":"rgba(255,255,255,0.04)",color:tab===t.id?"#c4b5fd":"#64748b",borderColor:tab===t.id?"rgba(124,58,237,0.4)":"rgba(255,255,255,0.07)",boxShadow:tab===t.id?"0 0 20px rgba(124,58,237,0.2)":"none",transition:"all 0.2s"}}>
            <t.icon style={{width:14,height:14}}/>{t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ══ OVERVIEW ══ */}
        {tab==="overview"&&(
          <motion.div key="ov" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.35}}>

            {/* Row 1: 3:2 bento — gauge+metrics | AI snapshot */}
            <motion.div initial={{opacity:0,y:28}} animate={{opacity:1,y:0}} transition={{delay:0.05,duration:0.5,ease:[0.22,1,0.36,1]}} style={{display:"grid",gridTemplateColumns:"3fr 2fr",gap:16,marginBottom:16}}>

              {/* LEFT: gauge + coverage + key metrics */}
              <div className="glass" style={{padding:"24px 22px"}}>
                <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:18,alignItems:"start"}}>
                  {/* Gauge */}
                  <div style={{width:200,flexShrink:0}}>
                    <SH eyebrow="Risk Assessment" title="Your Risk Profile" icon={ShieldAlert}/>
                    <RiskGauge score={d.riskScore||0} level={d.riskLevel||"Low"} color={riskColor}/>
                  </div>
                  {/* Right of gauge */}
                  <div style={{display:"flex",flexDirection:"column",gap:9,paddingTop:6}}>
                    <div>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                        <span style={{fontSize:"0.75rem",color:"#64748b"}}>Fund Coverage</span>
                        <span style={{fontSize:"0.75rem",fontWeight:700,color:pct>=100?"#10b981":pct>=60?"#f59e0b":"#f43f5e"}}>{pct}%</span>
                      </div>
                      <div className="progress-track" style={{height:7}}>
                        <motion.div className="progress-fill" initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:1.2,delay:0.3}} style={{background:pct>=100?"linear-gradient(90deg,#10b981,#6ee7b7)":pct>=60?"linear-gradient(90deg,#f59e0b,#fcd34d)":"linear-gradient(90deg,#f43f5e,#fda4af)"}}/>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                        <span style={{fontSize:"0.67rem",color:"#334155"}}>Now: {FMT2(savings)}</span>
                        <span style={{fontSize:"0.67rem",color:"#334155"}}>Target: {FMT2(targetFund)}</span>
                      </div>
                    </div>
                    {[
                      {label:"Savings Gap",       val:FMT2(gap),                     color:gap>0?"#fda4af":"#6ee7b7", icon:gap>0?TrendingDown:CheckCircle2},
                      {label:"Monthly to Save",   val:FMT2(d.suggestedMonthly||0),  color:"#a78bfa",icon:Target},
                      {label:"Months to Goal",    val:d.monthsToGoal?d.monthsToGoal+" mo":"—",color:"#60a5fa",icon:Clock},
                      {label:"Total Obligations", val:FMT2(d.totalMonthlyObligations||0),color:"#fb923c",icon:CreditCard},
                    ].map((m,i)=>(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 12px",background:"rgba(255,255,255,0.03)",borderRadius:9}}>
                        <div style={{display:"flex",alignItems:"center",gap:7}}>
                          <m.icon style={{width:13,height:13,color:m.color,flexShrink:0}}/>
                          <span style={{fontSize:"0.79rem",color:"#64748b"}}>{m.label}</span>
                        </div>
                        <span style={{fontFamily:"var(--font-heading)",fontWeight:700,color:m.color,fontSize:"0.84rem"}}>{m.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT: AI snapshot */}
              <div className="glass" style={{padding:"24px 22px"}}>
                <SH eyebrow="AI Summary" title="Analysis Snapshot" icon={Brain}/>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
                  <span className="badge badge-violet" style={{fontSize:"0.62rem"}}>Groq · {d.aiSource||"fallback"}</span>
                  {(d.warnings||[]).length>0&&<span className="badge badge-danger" style={{fontSize:"0.62rem"}}>{(d.warnings||[]).length} warning{(d.warnings||[]).length>1?"s":""}</span>}
                  {(d.suggestions||[]).length>0&&<span className="badge badge-success" style={{fontSize:"0.62rem"}}>{(d.suggestions||[]).length} suggestion{(d.suggestions||[]).length>1?"s":""}</span>}
                </div>
                {d.insights&&<AIChatBubble text={d.insights} type="insight" delay={0}/>}
                {(d.warnings||[])[0]&&<AIChatBubble text={d.warnings[0]} type="warning" delay={0.12}/>}
                {(d.suggestions||[])[0]&&<AIChatBubble text={d.suggestions[0]} type="suggestion" delay={0.22}/>}
                {((d.warnings||[]).length+(d.suggestions||[]).length)>2&&(
                  <button onClick={()=>setTab("ai")} className="btn-ghost" style={{width:"100%",justifyContent:"center",marginTop:6,fontSize:"0.8rem"}}>
                    View full AI report <ChevronRight style={{width:13,height:13}}/>
                  </button>
                )}
              </div>
            </motion.div>

            {/* Row 2: 1:1:1.5 — pie | tiers | risk factors */}
            <motion.div initial={{opacity:0,y:28}} animate={{opacity:1,y:0}} transition={{delay:0.16,duration:0.5,ease:[0.22,1,0.36,1]}} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1.4fr",gap:16,marginBottom:16}}>

              {/* Expense pie */}
              <div className="glass" style={{padding:"22px 18px"}}>
                <SH eyebrow="Breakdown" title="Cash Flow" icon={BarChart3}/>
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value" strokeWidth={0}>
                      {pieData.map((entry,i)=><Cell key={i} fill={entry.color}/>)}
                    </Pie>
                    <Tooltip formatter={(v)=>FMT(v)} contentStyle={{background:"rgba(9,9,15,0.95)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10}}/>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{display:"flex",flexDirection:"column",gap:6,marginTop:8}}>
                  {pieData.map((item,i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <div style={{width:8,height:8,borderRadius:2,background:item.color,flexShrink:0}}/>
                        <span style={{fontSize:"0.75rem",color:"#94a3b8"}}>{item.name}</span>
                      </div>
                      <span style={{fontFamily:"var(--font-heading)",fontWeight:700,color:"#e2e8f0",fontSize:"0.8rem"}}>{FMT2(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3-tier split */}
              <div className="glass" style={{padding:"22px 18px"}}>
                <SH eyebrow="Investment Split" title="3-Tier Architecture" icon={Layers}/>
                {[
                  {label:"Tier 1 – Savings A/c",pct:40,color:"#a78bfa",note:"T+0 · ~3.5% p.a."},
                  {label:"Tier 2 – Liquid MF",   pct:40,color:"#60a5fa",note:"T+1 · ~7% p.a."},
                  {label:"Tier 3 – Short FD",    pct:20,color:"#34d399",note:"30d lock · ~7.5% p.a."},
                ].map((t,i)=>{
                  const tiers=d.tiers||[];
                  const amt=tiers[i]?.amount||targetFund*t.pct/100;
                  return(
                    <div key={i} style={{marginBottom:14}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                        <span style={{fontWeight:600,color:"#e2e8f0",fontSize:"0.82rem"}}>{t.label}</span>
                        <span style={{fontFamily:"var(--font-heading)",fontWeight:700,color:t.color,fontSize:"0.82rem"}}>{FMT2(amt)}</span>
                      </div>
                      <div className="progress-track" style={{height:5}}>
                        <motion.div className="progress-fill" initial={{width:0}} animate={{width:`${t.pct}%`}} transition={{duration:0.8,delay:0.2+i*0.15}} style={{background:t.color}}/>
                      </div>
                      <p style={{fontSize:"0.67rem",color:"#334155",marginTop:3}}>{t.note}</p>
                    </div>
                  );
                })}
              </div>

              {/* Risk & protective factors */}
              <div className="glass" style={{padding:"22px 18px"}}>
                <SH eyebrow="Score Contributors" title="Risk &#38; Safety Factors" icon={AlertTriangle}/>
                {(d.riskFactors||[]).slice(0,3).map((f,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"flex-start",gap:9,marginBottom:10}}>
                    <div style={{width:22,height:22,borderRadius:7,background:"rgba(244,63,94,0.1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}><AlertTriangle style={{width:11,height:11,color:"#f43f5e"}}/></div>
                    <p style={{fontSize:"0.8rem",color:"#94a3b8",lineHeight:1.6}}>{f.detail||f.factor||String(f)}</p>
                  </div>
                ))}
                {(d.protectiveFactors||[]).slice(0,3).map((f,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"flex-start",gap:9,marginBottom:10}}>
                    <div style={{width:22,height:22,borderRadius:7,background:"rgba(16,185,129,0.1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}><CheckCircle2 style={{width:11,height:11,color:"#10b981"}}/></div>
                    <p style={{fontSize:"0.8rem",color:"#94a3b8",lineHeight:1.6}}>{f.detail||f.factor||String(f)}</p>
                  </div>
                ))}
                {!(d.riskFactors||[]).length&&!(d.protectiveFactors||[]).length&&(
                  <p style={{fontSize:"0.82rem",color:"#334155",marginTop:4}}>Run a full analysis to see your risk contributors.</p>
                )}
              </div>
            </motion.div>

            {/* Row 3: Action steps full-width */}
            <motion.div initial={{opacity:0,y:28}} animate={{opacity:1,y:0}} transition={{delay:0.27,duration:0.5,ease:[0.22,1,0.36,1]}} className="glass" style={{padding:"22px 22px"}}>
              <SH eyebrow="Action Plan" title="Priority Steps" icon={Zap}/>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
                {(d.actionSteps||[]).slice(0,6).map((step,i)=>{
                  const urg=step.urgency||"medium";
                  const urgColor=urg==="critical"?"#f43f5e":urg==="high"?"#f59e0b":urg==="medium"?"#a78bfa":"#10b981";
                  const urgBadge=urg==="critical"?"danger":urg==="high"?"warning":urg==="medium"?"violet":"success";
                  return(
                    <div key={i} style={{padding:"14px 15px",background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:12}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{width:21,height:21,borderRadius:6,background:`${urgColor}20`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontFamily:"var(--font-heading)",fontWeight:800,fontSize:"0.68rem",color:urgColor}}>{i+1}</span></div>
                          <p style={{fontWeight:700,color:"#e2e8f0",fontSize:"0.85rem"}}>{step.title||step.action}</p>
                        </div>
                        <span className={`badge badge-${urgBadge}`} style={{marginLeft:8,flexShrink:0,fontSize:"0.6rem"}}>{urg}</span>
                      </div>
                      {step.description&&<p style={{fontSize:"0.76rem",color:"#64748b",lineHeight:1.6,paddingLeft:29}}>{step.description}</p>}
                    </div>
                  );
                })}
                {!(d.actionSteps||[]).length&&(
                  <div style={{padding:"16px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:12,textAlign:"center"}}>
                    <p style={{fontSize:"0.82rem",color:"#334155"}}>Action steps appear after full AI analysis.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ══ AI INSIGHTS ══ */}
        {tab==="ai"&&(
          <motion.div key="ai" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.35}}>
            <div style={{maxWidth:760,margin:"0 auto"}}>
              <div style={{background:"rgba(124,58,237,0.1)",border:"1px solid rgba(124,58,237,0.2)",borderRadius:16,padding:"20px 24px",marginBottom:24,display:"flex",alignItems:"center",gap:16}}>
                <div style={{width:44,height:44,borderRadius:14,background:"linear-gradient(135deg,#7c3aed,#6d28d9)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 4px 16px rgba(124,58,237,0.4)"}}><Brain style={{width:22,height:22,color:"white"}}/></div>
                <div>
                  <p style={{fontWeight:700,color:"#f1f5f9",fontSize:"0.95rem",marginBottom:3,fontFamily:"var(--font-heading)"}}>AI Financial Assessment</p>
                  <p style={{fontSize:"0.78rem",color:"#64748b"}}>Powered by Groq · Source: <strong style={{color:"#a78bfa"}}>{d.aiSource||"fallback"}</strong> · Personalised for your profile</p>
                </div>
              </div>
              {d.insights&&(<div style={{marginBottom:24}}><p className="eyebrow" style={{marginBottom:12}}>Assessment</p><AIChatBubble text={d.insights} type="insight" delay={0}/></div>)}
              {(d.suggestions||[]).length>0&&(<div style={{marginBottom:24}}><p className="eyebrow" style={{marginBottom:12}}>Suggestions</p>{d.suggestions.map((s,i)=><AIChatBubble key={i} text={s} type="suggestion" delay={i*0.1}/>)}</div>)}
              {(d.warnings||[]).length>0&&(<div style={{marginBottom:24}}><p className="eyebrow" style={{marginBottom:12}}>Warnings</p>{d.warnings.map((w,i)=><AIChatBubble key={i} text={w} type="warning" delay={i*0.1}/>)}</div>)}
              {d.benchmarks&&(
                <div className="glass-sm" style={{padding:"22px 24px",marginBottom:24}}>
                  <p className="eyebrow" style={{marginBottom:16}}>India Benchmarks</p>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:16}}>
                    {Object.entries(d.benchmarks).slice(0,4).map(([k,v])=>(<div key={k} style={{textAlign:"center"}}><p style={{fontFamily:"var(--font-heading)",fontWeight:800,color:"#a78bfa",fontSize:"1.2rem",marginBottom:4}}>{v}</p><p style={{fontSize:"0.72rem",color:"#475569",textTransform:"uppercase",letterSpacing:"0.08em"}}>{k.replace(/_/g," ")}</p></div>))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ══ PROJECTION ══ */}
        {tab==="projection"&&(
          <motion.div key="proj" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.35}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr",gap:20}}>
              <div className="glass" style={{padding:"28px 24px"}}>
                <SH eyebrow="12-Month Forecast" title="Savings Trajectory" icon={TrendingUp}/>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={d.projection||[]} margin={{top:10,right:10,bottom:0,left:10}}>
                    <defs>
                      <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7c3aed" stopOpacity={0.3}/><stop offset="100%" stopColor="#7c3aed" stopOpacity={0}/></linearGradient>
                      <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.15}/><stop offset="100%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                    <XAxis dataKey="month" tick={{fill:"#475569",fontSize:11}} axisLine={false} tickLine={false}/>
                    <YAxis tickFormatter={FMT2} tick={{fill:"#475569",fontSize:11}} axisLine={false} tickLine={false} width={54}/>
                    <Tooltip content={<ChartTip/>}/>
                    <Area type="monotone" dataKey="target"  stroke="#10b981" strokeWidth={1.5} fill="url(#tg)" strokeDasharray="6 3" dot={false}/>
                    <Area type="monotone" dataKey="balance" stroke="#a78bfa" strokeWidth={2.5} fill="url(#sg)" dot={false}/>
                  </AreaChart>
                </ResponsiveContainer>
                <div style={{display:"flex",gap:20,justifyContent:"center",marginTop:12}}>
                  {[{color:"#a78bfa",label:"Projected Savings"},{color:"#10b981",label:"Target Fund",dashed:true}].map(l=>(
                    <div key={l.label} style={{display:"flex",alignItems:"center",gap:7}}>
                      <div style={{width:20,height:2,background:l.color,borderRadius:99,borderStyle:l.dashed?"dashed":"solid"}}/>
                      <span style={{fontSize:"0.75rem",color:"#64748b"}}>{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass" style={{padding:"28px 24px"}}>
                <SH eyebrow="Allocation" title="Recommended Investment Split" icon={Layers}/>
                <div style={{display:"flex",flexDirection:"column",gap:16}}>
                  {(d.investmentSplit||[]).map((item,i)=>{
                    const colors=["#a78bfa","#60a5fa","#34d399","#fcd34d"];
                    return(
                      <div key={i}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                          <span style={{fontWeight:600,color:"#e2e8f0",fontSize:"0.88rem"}}>{item.type||item.label||item.name}</span>
                          <div style={{display:"flex",gap:12,alignItems:"center"}}>
                            <span style={{fontFamily:"var(--font-heading)",fontWeight:700,color:colors[i%4]}}>{item.percentage||item.pct}%</span>
                            <span style={{fontSize:"0.78rem",color:"#475569"}}>{FMT2(item.amount||(targetFund*(item.percentage||item.pct||0)/100))}</span>
                          </div>
                        </div>
                        <div className="progress-track" style={{height:8}}>
                          <motion.div className="progress-fill" initial={{width:0}} animate={{width:`${item.percentage||item.pct||0}%`}} transition={{duration:0.9,delay:i*0.1}} style={{background:colors[i%4],boxShadow:`0 0 8px ${colors[i%4]}80`}}/>
                        </div>
                        {item.vehicle&&<p style={{fontSize:"0.72rem",color:"#334155",marginTop:4}}>{item.vehicle}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ══ STRESS TEST ══ */}
        {tab==="stress"&&(
          <motion.div key="stress" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.35}}>
            <div style={{maxWidth:700,margin:"0 auto"}}>
              <div className="glass" style={{padding:"32px"}}>
                <SH eyebrow="Simulation" title="Emergency Scenario Simulator" icon={Activity}/>
                <p style={{fontSize:"0.85rem",color:"#64748b",marginBottom:28,lineHeight:1.7}}>Drag the sliders to simulate an emergency and see how long your current savings would last.</p>
                <div style={{display:"flex",flexDirection:"column",gap:28}}>
                  <div>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                      <label className="label">Income Reduction</label>
                      <span style={{fontFamily:"var(--font-heading)",fontWeight:700,color:stressInc>50?"#f43f5e":"#fcd34d",fontSize:"1rem"}}>-{stressInc}%</span>
                    </div>
                    <input type="range" min={0} max={100} step={5} value={stressInc} onChange={e=>setStressInc(Number(e.target.value))} style={{width:"100%"}}/>
                    <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}><span style={{fontSize:"0.72rem",color:"#334155"}}>No change</span><span style={{fontSize:"0.72rem",color:"#334155"}}>Total job loss</span></div>
                  </div>
                  <div>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                      <label className="label">Expense Spike</label>
                      <span style={{fontFamily:"var(--font-heading)",fontWeight:700,color:stressExp>50?"#f43f5e":"#fcd34d",fontSize:"1rem"}}>+{stressExp}%</span>
                    </div>
                    <input type="range" min={0} max={100} step={5} value={stressExp} onChange={e=>setStressExp(Number(e.target.value))} style={{width:"100%"}}/>
                    <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}><span style={{fontSize:"0.72rem",color:"#334155"}}>No change</span><span style={{fontSize:"0.72rem",color:"#334155"}}>+100% expenses</span></div>
                  </div>
                  <motion.div animate={{borderColor:Number(stressedSurvival)<2?"rgba(244,63,94,0.5)":Number(stressedSurvival)<4?"rgba(245,158,11,0.4)":"rgba(16,185,129,0.4)"}} transition={{duration:0.4}} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:16,padding:"28px",textAlign:"center"}}>
                    <p className="eyebrow" style={{marginBottom:8}}>Simulated Survival</p>
                    <div style={{fontFamily:"var(--font-heading)",fontWeight:900,fontSize:"4rem",lineHeight:1,color:Number(stressedSurvival)<2?"#f43f5e":Number(stressedSurvival)<4?"#f59e0b":"#10b981",marginBottom:8}}>{stressedSurvival}</div>
                    <p style={{color:"#64748b",fontSize:"1rem"}}>months your fund would last</p>
                    <div style={{marginTop:20,display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                      {[{label:"Stressed Income",val:FMT(stressedIncome),color:"#fda4af"},{label:"Stressed Monthly",val:FMT(stressedMonthly),color:"#fda4af"}].map(m=>(
                        <div key={m.label} style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"12px"}}>
                          <p style={{fontSize:"0.68rem",color:"#475569",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>{m.label}</p>
                          <p style={{fontFamily:"var(--font-heading)",fontWeight:700,color:m.color,fontSize:"1rem"}}>{m.val}</p>
                        </div>
                      ))}
                    </div>
                    {(stressInc>0||stressExp>0)&&Number(stressedSurvival)<3&&(
                      <div style={{marginTop:16,padding:"12px 16px",background:"rgba(244,63,94,0.1)",borderRadius:10,border:"1px solid rgba(244,63,94,0.2)"}}><p style={{fontSize:"0.82rem",color:"#fda4af"}}>&#9888;&#65039; Less than 3 months under this scenario — fund needs urgent attention.</p></div>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ══ ML ANALYSIS ══ */}
        {tab==="ml"&&(
          <motion.div key="ml" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.35}}>
            {d.ml ? (
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:16}}>

                {/* ML Risk Score */}
                <div className="glass" style={{padding:"28px 24px"}}>
                  <SH eyebrow="XGBoost Prediction" title="ML Risk Score" icon={Cpu}/>
                  <div style={{textAlign:"center",padding:"16px 0"}}>
                    <div style={{fontFamily:"var(--font-heading)",fontWeight:900,fontSize:"4.5rem",lineHeight:1,
                      color:(d.ml.riskScore||0)>=70?"#f43f5e":(d.ml.riskScore||0)>=40?"#f59e0b":"#10b981",marginBottom:6}}>
                      {Math.round(d.ml.riskScore||0)}
                    </div>
                    <div style={{fontSize:"0.82rem",color:"#64748b",marginBottom:14}}>out of 100</div>
                    <span className={`badge badge-${(d.ml.riskLevel||"")==="Critical"?"danger":(d.ml.riskLevel||"")==="High"?"warning":(d.ml.riskLevel||"")==="Medium"?"violet":"success"}`}
                      style={{fontSize:"0.78rem",padding:"5px 16px"}}>{d.ml.riskLevel||"Low"} Risk</span>
                    <div style={{marginTop:20,padding:"14px",background:"rgba(255,255,255,0.03)",borderRadius:12}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                        <span style={{fontSize:"0.73rem",color:"#64748b"}}>Model Confidence</span>
                        <span style={{fontFamily:"var(--font-heading)",fontWeight:700,color:"#a78bfa",fontSize:"0.82rem"}}>{(d.ml.confidence||0).toFixed(1)}%</span>
                      </div>
                      <div className="progress-track" style={{height:7}}>
                        <motion.div className="progress-fill" initial={{width:0}} animate={{width:`${d.ml.confidence||0}%`}}
                          transition={{duration:1,delay:0.2}} style={{background:"linear-gradient(90deg,#7c3aed,#a78bfa)"}}/>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI vs ML Comparison */}
                <div className="glass" style={{padding:"28px 24px"}}>
                  <SH eyebrow="Model Comparison" title="AI vs ML Agreement" icon={Brain}/>
                  <div style={{display:"flex",flexDirection:"column",gap:14}}>
                    <div style={{padding:"16px",background:`rgba(${(d.ml.agreement||"")==="agree"?"16,185,129":"245,158,11"},0.08)`,
                      border:`1px solid rgba(${(d.ml.agreement||"")==="agree"?"16,185,129":"245,158,11"},0.25)`,borderRadius:12,textAlign:"center"}}>
                      <div style={{fontSize:"1.8rem",marginBottom:6}}>{(d.ml.agreement||"")==="agree"?"\u2705":"\u26a1"}</div>
                      <p style={{fontFamily:"var(--font-heading)",fontWeight:700,fontSize:"0.95rem",
                        color:(d.ml.agreement||"")==="agree"?"#10b981":"#f59e0b",marginBottom:6}}>
                        {(d.ml.agreement||"")==="agree"?"Both Models Agree":"Models Diverge"}
                      </p>
                      <p style={{fontSize:"0.78rem",color:"#64748b",lineHeight:1.6}}>
                        {(d.ml.agreement||"")==="agree"
                          ?"Rule-based logic and XGBoost ML both reached the same risk level \u2014 high-confidence result."
                          :"The AI rule engine and XGBoost ML reached different risk levels. Both perspectives are considered in your report."}
                      </p>
                    </div>
                    {[
                      {label:"Rule-Based AI", val:`${d.riskScore||0}/100`, level:d.riskLevel||"Low", color:riskColor},
                      {label:"XGBoost ML",    val:`${Math.round(d.ml.riskScore||0)}/100`, level:d.ml.riskLevel||"Low",
                        color:(d.ml.riskScore||0)>=70?"#f43f5e":(d.ml.riskScore||0)>=40?"#f59e0b":"#10b981"},
                    ].map(m=>(
                      <div key={m.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 14px",background:"rgba(255,255,255,0.03)",borderRadius:10}}>
                        <span style={{fontSize:"0.82rem",color:"#94a3b8"}}>{m.label}</span>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span className={`badge badge-${(m.level||"")==="Critical"?"danger":(m.level||"")==="High"?"warning":(m.level||"")==="Medium"?"violet":"success"}`}
                            style={{fontSize:"0.62rem"}}>{m.level}</span>
                          <span style={{fontFamily:"var(--font-heading)",fontWeight:700,color:m.color,fontSize:"0.88rem"}}>{m.val}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Probability distribution */}
                {d.ml.probabilities&&Object.keys(d.ml.probabilities).length>0&&(
                  <div className="glass" style={{padding:"24px",gridColumn:"1/-1"}}>
                    <SH eyebrow="XGBoost Classifier" title="Risk Level Probabilities" icon={BarChart3}/>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:16}}>
                      {Object.entries(d.ml.probabilities).map(([level,prob])=>{
                        const pct=Math.round((prob||0)*100);
                        const clrMap={Low:"#10b981",Medium:"#f59e0b",High:"#f97316",Critical:"#f43f5e"};
                        const c=clrMap[level]||"#a78bfa";
                        return(
                          <div key={level} style={{textAlign:"center",padding:"16px 12px",background:`${c}0f`,border:`1px solid ${c}28`,borderRadius:12}}>
                            <div style={{fontFamily:"var(--font-heading)",fontWeight:900,fontSize:"2rem",color:c,lineHeight:1,marginBottom:4}}>{pct}%</div>
                            <div style={{fontSize:"0.75rem",color:"#64748b",marginBottom:10}}>{level} Risk</div>
                            <div className="progress-track" style={{height:5}}>
                              <motion.div className="progress-fill" initial={{width:0}} animate={{width:`${pct}%`}}
                                transition={{duration:0.8}} style={{background:c,boxShadow:`0 0 6px ${c}80`}}/>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{padding:"12px 16px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:10}}>
                      <p style={{fontSize:"0.76rem",color:"#475569",lineHeight:1.65}}>
                        <strong style={{color:"#94a3b8"}}>About XGBoost:</strong> Gradient boosting model trained on 8,000 synthetic Indian household profiles.
                        Regressor R\u00b2 = 0.949 (MAE 4.2 pts), Classifier Accuracy = 85.3%. Cross-validates the rule-based AI risk score.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="glass" style={{padding:"48px",textAlign:"center"}}>
                <Cpu style={{width:36,height:36,color:"#334155",margin:"0 auto 16px"}}/>
                <p style={{color:"#64748b",fontSize:"0.9rem",marginBottom:10}}>ML predictions unavailable — Flask inference service may not be running on port 5002.</p>
                <code style={{fontSize:"0.78rem",background:"rgba(255,255,255,0.06)",padding:"6px 14px",borderRadius:8,color:"#a78bfa"}}>cd ml &amp;&amp; python serve.py</code>
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>

      {/* ── Disclaimer ──────────────────────────────────────────────── */}
      <div style={{marginTop:28,padding:"14px 20px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:14,display:"flex",alignItems:"flex-start",gap:12}}>
        <ShieldCheck style={{width:15,height:15,color:"#334155",flexShrink:0,marginTop:2}}/>
        <p style={{fontSize:"0.72rem",color:"#334155",lineHeight:1.7,margin:0}}>
          <strong style={{color:"#475569"}}>For educational purposes only.</strong> This report is AI/ML-generated based on Indian financial heuristics (RBI, SEBI, NHA benchmarks) and does not constitute financial advice. Emergency fund calculations use generalised models calibrated for Indian households. Consult a SEBI-registered financial advisor before making investment decisions. All input data is discarded after your session.
        </p>
      </div>
    </div>
  );
}
