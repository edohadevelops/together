import { useState, useEffect, useRef, useCallback } from "react";

// ── Google Fonts ──────────────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Serif+Display:ital@0;1&display=swap";
document.head.appendChild(fontLink);

// ── Viewport meta (critical for mobile scaling) ───────────────────────────────
let vp = document.querySelector('meta[name="viewport"]');
if (!vp) { vp = document.createElement("meta"); vp.name = "viewport"; document.head.appendChild(vp); }
vp.content = "width=device-width, initial-scale=1, maximum-scale=1";

// ── Supabase ──────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://sonbphyeomzzcdyuiotl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvbmJwaHllb216emNkeXVpb3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMzkxMjksImV4cCI6MjA4ODgxNTEyOX0.CtcZAFtqCQUOrzPBfhSfN5BZ1EQDJFVxa-FsjMX5IRg";
const HDRS = {
  "Content-Type": "application/json",
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Prefer": "resolution=merge-duplicates",
};
async function dbGet(key) {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/together_data?key=eq.${key}&select=value`, { headers: HDRS });
    const d = await r.json();
    return d.length ? JSON.parse(d[0].value) : null;
  } catch { return null; }
}
async function dbSet(key, value) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/together_data`, {
      method: "POST", headers: HDRS,
      body: JSON.stringify({ key, value: JSON.stringify(value), updated_at: new Date().toISOString() }),
    });
  } catch {}
}

// ── Constants ─────────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: "faith",      label: "Faith & Spirit",      emoji: "✦",  color: "#E8A838" },
  { id: "health",     label: "Health & Fitness",     emoji: "◈",  color: "#3DBF8A" },
  { id: "finance",    label: "Finance & Money",      emoji: "◆",  color: "#3B9EDB" },
  { id: "work",       label: "Work & Career",        emoji: "▣",  color: "#9B6EE8" },
  { id: "school",     label: "School",               emoji: "🎓", color: "#7B61FF" },
  { id: "growth",     label: "Personal Growth",      emoji: "◉",  color: "#E8704A" },
  { id: "relation",   label: "Relationship & Dates", emoji: "♡",  color: "#E84E8A" },
  { id: "social",     label: "Social & Friends",     emoji: "◎",  color: "#C8B030" },
  { id: "home",       label: "Home & Chores",        emoji: "⌂",  color: "#5BAD4E" },
  { id: "hobbies",    label: "Hobbies & Fun",        emoji: "◐",  color: "#E8883A" },
  { id: "mentorship", label: "Mentorship",           emoji: "🤝", color: "#20B2AA" },
  { id: "church",     label: "Church & Fellowship",  emoji: "⛪", color: "#8B5CF6" },
  { id: "life",       label: "Life",                 emoji: "🌱", color: "#06B6D4" },
];

const TASK_TYPES = [
  { id: "todo",   label: "To-Do",   icon: "☐" },
  { id: "habit",  label: "Habit",   icon: "↺" },
  { id: "daily",  label: "Daily",   icon: "⟳" },
  { id: "weekly", label: "Weekly",  icon: "⟲" },
  { id: "goal",   label: "Goal",    icon: "◎" },
];

const PRIORITIES = ["Low", "Medium", "High", "Urgent"];
const PRI_COLOR  = { Urgent:"#E84E8A", High:"#E8704A", Medium:"#E8A838", Low:"#3DBF8A" };
const DONE_COL   = "__done__";
const TODAY      = new Date().toISOString().slice(0, 10);

// ── AI Tools ──────────────────────────────────────────────────────────────────
const AI_TOOLS = [
  { name:"Claude",         emoji:"🤖", color:"#E8A838", url:"https://claude.ai",                desc:"AI assistant for thinking, writing, coding & summarising" },
  { name:"Notion",         emoji:"📝", color:"#3B9EDB", url:"https://notion.so",                desc:"Notes, tasks, budget & life organisation — your second brain" },
  { name:"Otter.ai",       emoji:"🎙️", color:"#9B6EE8", url:"https://otter.ai",               desc:"Auto-transcribes lectures, classes & meetings hands-free" },
  { name:"Bitwarden",      emoji:"🔐", color:"#3DBF8A", url:"https://bitwarden.com",            desc:"Store all passwords, SSN & bank info securely — free" },
  { name:"Google Calendar",emoji:"📅", color:"#E8704A", url:"https://calendar.google.com",     desc:"Schedule, birthdays & reminders — share with Gloria" },
  { name:"Reclaim.ai",     emoji:"⚡", color:"#E84E8A", url:"https://reclaim.ai",              desc:"Auto-schedules study blocks & tasks around your calendar" },
  { name:"NotebookLM",     emoji:"📚", color:"#C8B030", url:"https://notebooklm.google.com",   desc:"Upload lecture notes, ask questions, study smarter" },
  { name:"Perplexity",     emoji:"🔍", color:"#5BAD4E", url:"https://perplexity.ai",           desc:"AI-powered search with direct answers & sources" },
  { name:"Wolfram Alpha",  emoji:"📐", color:"#E8883A", url:"https://wolframalpha.com",        desc:"Solves equations, integrals & proofs step-by-step" },
  { name:"Anki",           emoji:"🃏", color:"#3DBF8A", url:"https://apps.ankiweb.net",        desc:"Flashcards with spaced repetition — retain anything long term" },
  { name:"Focusmate",      emoji:"👥", color:"#9B6EE8", url:"https://focusmate.com",           desc:"Virtual body doubling — study with strangers, stay focused" },
  { name:"Investopedia",   emoji:"💰", color:"#E8A838", url:"https://investopedia.com",        desc:"Learn finance, investing & US taxes in plain English" },
];

// ── Greeting ──────────────────────────────────────────────────────────────────
function getGreeting(name) {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return { text: `Good morning, ${name} ☀️`,  sub: "Start your day with intention.",        bg: "linear-gradient(135deg,#1a1200 0%,#2a1f00 100%)", accent: "#E8C050" };
  if (h >= 12 && h < 17) return { text: `Good afternoon, ${name} 🌤️`, sub: "Keep the momentum going.",             bg: "linear-gradient(135deg,#001a1a 0%,#002828 100%)", accent: "#3DBF8A" };
  if (h >= 17 && h < 21) return { text: `Good evening, ${name} 🌇`,  sub: "Wind down and reflect on the day.",    bg: "linear-gradient(135deg,#1a0a00 0%,#200e00 100%)", accent: "#E8883A" };
  return                         { text: `Good night, ${name} 🌙`,    sub: "Rest well. Tomorrow is a new day.",    bg: "linear-gradient(135deg,#080a14 0%,#0d1020 100%)", accent: "#9B6EE8" };
}
function getGreetingLight(name) {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return { text: `Good morning, ${name} ☀️`,  sub: "Start your day with intention.",        bg: "linear-gradient(135deg,#fff8e6 0%,#fff3cc 100%)", accent: "#D4921E" };
  if (h >= 12 && h < 17) return { text: `Good afternoon, ${name} 🌤️`, sub: "Keep the momentum going.",             bg: "linear-gradient(135deg,#e6fff8 0%,#ccfff0 100%)", accent: "#2A9D74" };
  if (h >= 17 && h < 21) return { text: `Good evening, ${name} 🌇`,  sub: "Wind down and reflect on the day.",    bg: "linear-gradient(135deg,#fff3e6 0%,#ffe8cc 100%)", accent: "#C06020" };
  return                         { text: `Good night, ${name} 🌙`,    sub: "Rest well. Tomorrow is a new day.",    bg: "linear-gradient(135deg,#eeeeff 0%,#e0e0ff 100%)", accent: "#6040C0" };
}

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

const SAMPLES = [
  { id:genId(), section:"faith",    title:"Morning devotion together", type:"daily", assignee:"both", priority:"High",   done:false, streak:3,  notes:"", order:0, createdAt:TODAY, dueDate:"", lastReset:TODAY },
  { id:genId(), section:"health",   title:"30-min workout",             type:"daily", assignee:"A",   priority:"Medium", done:false, streak:7,  notes:"", order:1, createdAt:TODAY, dueDate:"", lastReset:TODAY },
  { id:genId(), section:"finance",  title:"Review monthly budget",      type:"todo",  assignee:"both",priority:"High",   done:false, streak:0,  notes:"", order:2, createdAt:TODAY, dueDate:"", lastReset:"" },
  { id:genId(), section:"relation", title:"Plan date night",            type:"todo",  assignee:"B",   priority:"High",   done:true,  streak:0,  notes:"Dinner at the Italian place 🍝", order:3, createdAt:TODAY, dueDate:"", lastReset:"" },
  { id:genId(), section:"growth",   title:"Read 20 pages",              type:"daily", assignee:"A",   priority:"Medium", done:false, streak:12, notes:"", order:4, createdAt:TODAY, dueDate:"", lastReset:TODAY },
  { id:genId(), section:"school",   title:"Study for midterms",         type:"goal",  assignee:"A",   priority:"Urgent", done:false, streak:0,  notes:"", order:5, createdAt:TODAY, dueDate:"", lastReset:"" },
  { id:genId(), section:"work",     title:"Update resume / portfolio",  type:"goal",  assignee:"A",   priority:"Medium", done:false, streak:0,  notes:"Due end of month", order:6, createdAt:TODAY, dueDate:"", lastReset:"" },
  { id:genId(), section:"hobbies",  title:"Try a new recipe together",  type:"goal",  assignee:"both",priority:"Low",    done:false, streak:0,  notes:"", order:7, createdAt:TODAY, dueDate:"", lastReset:"" },
  { id:genId(), section:"social",   title:"Call parents this week",     type:"todo",  assignee:"B",   priority:"Medium", done:false, streak:0,  notes:"", order:8, createdAt:TODAY, dueDate:"", lastReset:"" },
];

// ── Themes ────────────────────────────────────────────────────────────────────
const THEMES = {
  dark: {
    bg:"#0F1117", surface:"#181B23", colBg:"#13161E",
    border:"rgba(255,255,255,0.07)", text:"#EEEAE3", textSub:"#888D9B",
    textMuted:"#3E424E", topbar:"rgba(15,17,23,0.96)",
    inputBg:"rgba(255,255,255,0.05)", accent:"#E8A838", accentFg:"#0F1117",
    cardShadow:"0 2px 8px rgba(0,0,0,0.35)",
  },
  light: {
    bg:"#EEF0F5", surface:"#FFFFFF", colBg:"#E4E6ED",
    border:"rgba(0,0,0,0.08)", text:"#1A1D26", textSub:"#6B6E7A",
    textMuted:"#B8BBC4", topbar:"rgba(238,240,245,0.96)",
    inputBg:"rgba(0,0,0,0.04)", accent:"#D4921E", accentFg:"#FFFFFF",
    cardShadow:"0 1px 4px rgba(0,0,0,0.09)",
  },
};

// ── Date helpers ──────────────────────────────────────────────────────────────
function formatDate(d) {
  if (!d) return null;
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });
}
function daysUntil(d) {
  if (!d) return null;
  return Math.ceil((new Date(d+"T00:00:00") - new Date(TODAY+"T00:00:00")) / 86400000);
}
function dueBadgeColor(d) {
  const n = daysUntil(d);
  if (n === null) return null;
  if (n < 0) return "#E84E8A";
  if (n === 0) return "#E8704A";
  if (n <= 3) return "#E8A838";
  return "#3DBF8A";
}
function dueBadgeLabel(d) {
  const n = daysUntil(d);
  if (n === null) return null;
  if (n < 0) return `${Math.abs(n)}d overdue`;
  if (n === 0) return "Due today";
  if (n === 1) return "Due tomorrow";
  return `Due in ${n}d`;
}

// ── Main App ──────────────────────────────────────────────────────────────────
// ── AnalyticsView ─────────────────────────────────────────────────────────────
function AnalyticsView({ log, tasks, names, T, mode, SECTIONS, PRI_COLOR, TODAY }) {
  const [period,   setPeriod]   = useState("month"); // week | month | year | all
  const [focus,    setFocus]    = useState("both");  // "A" | "B" | "both"
  const [tab,      setTab]      = useState("overview"); // overview | history | report

  const sec = id => SECTIONS.find(s => s.id === id) || SECTIONS[0];

  // ── Date ranges ────────────────────────────────────────────────────────────
  const now = new Date();
  function getRangeStart(p) {
    if (p === "week") {
      const d = new Date(now); d.setDate(now.getDate()-((now.getDay()+6)%7)); d.setHours(0,0,0,0); return d;
    }
    if (p === "month")  return new Date(now.getFullYear(), now.getMonth(), 1);
    if (p === "year")   return new Date(now.getFullYear(), 0, 1);
    return new Date("2000-01-01");
  }
  function getPrevRangeStart(p) {
    if (p === "week") { const d = getRangeStart(p); d.setDate(d.getDate()-7); return d; }
    if (p === "month") return new Date(now.getFullYear(), now.getMonth()-1, 1);
    if (p === "year")  return new Date(now.getFullYear()-1, 0, 1);
    return new Date("2000-01-01");
  }
  function getPrevRangeEnd(p) {
    if (p === "week") { const d = getRangeStart(p); d.setDate(d.getDate()-1); d.setHours(23,59,59,999); return d; }
    if (p === "month") return new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    if (p === "year")  return new Date(now.getFullYear()-1, 11, 31, 23, 59, 59, 999);
    return new Date(getRangeStart(p).getTime()-1);
  }

  const rangeStart = getRangeStart(period);
  const prevStart  = getPrevRangeStart(period);
  const prevEnd    = getPrevRangeEnd(period);

  // Filter log by period and focus
  function filterLog(entries, start, end) {
    return entries.filter(e => {
      const d = new Date(e.completedAt);
      const inTime = d >= start && (!end || d <= end);
      const inFocus = focus === "both" || e.completedBy === focus || e.assignee === focus || e.assignee === "both";
      return inTime && inFocus;
    });
  }

  const curLog  = filterLog(log, rangeStart, new Date());
  const prevLog = period !== "all" ? filterLog(log, prevStart, prevEnd) : [];

  // ── Key metrics ────────────────────────────────────────────────────────────
  const totalDone   = curLog.length;
  const prevDone    = prevLog.length;
  const pctChange   = prevDone > 0 ? Math.round(((totalDone - prevDone) / prevDone) * 100) : null;
  const aDone       = curLog.filter(e => e.completedBy === "A" || e.assignee === "A").length;
  const bDone       = curLog.filter(e => e.completedBy === "B" || e.assignee === "B").length;
  const totalTasks  = tasks.length;
  const overallRate = totalTasks > 0 ? Math.round((tasks.filter(t=>t.done).length / totalTasks)*100) : 0;

  // ── Category breakdown ─────────────────────────────────────────────────────
  const bySec = SECTIONS.map(s => ({
    ...s,
    count: curLog.filter(e => e.section === s.id).length,
  })).filter(s => s.count > 0).sort((a,b) => b.count - a.count);

  const maxSecCount = bySec.length ? bySec[0].count : 1;

  // ── Daily activity for chart (last 14 days or weekly buckets) ─────────────
  function getDailyBuckets() {
    const days = period === "week" ? 7 : period === "month" ? 30 : period === "year" ? 52 : 30;
    const buckets = [];
    if (period === "year") {
      // Weekly buckets for year view
      for (let w = 51; w >= 0; w--) {
        const wStart = new Date(now); wStart.setDate(now.getDate() - w*7 - ((now.getDay()+6)%7)); wStart.setHours(0,0,0,0);
        const wEnd   = new Date(wStart); wEnd.setDate(wStart.getDate()+6); wEnd.setHours(23,59,59,999);
        const count  = filterLog(log, wStart, wEnd).length;
        buckets.push({ label: wStart.toLocaleDateString("en-US",{month:"short",day:"numeric"}), count, aCount: filterLog(log,wStart,wEnd).filter(e=>e.completedBy==="A").length, bCount: filterLog(log,wStart,wEnd).filter(e=>e.completedBy==="B").length });
      }
    } else {
      for (let d = days-1; d >= 0; d--) {
        const day = new Date(now); day.setDate(now.getDate()-d); day.setHours(0,0,0,0);
        const dayEnd = new Date(day); dayEnd.setHours(23,59,59,999);
        const dayStr = day.toISOString().slice(0,10);
        const entries = filterLog(log, day, dayEnd);
        buckets.push({ label: day.toLocaleDateString("en-US",{month:"short",day:"numeric"}), date: dayStr, count: entries.length, aCount: entries.filter(e=>e.completedBy==="A").length, bCount: entries.filter(e=>e.completedBy==="B").length });
      }
    }
    return buckets;
  }
  const buckets = getDailyBuckets();
  const maxBucket = Math.max(...buckets.map(b=>b.count), 1);

  // ── Priority breakdown ─────────────────────────────────────────────────────
  const byPri = ["Urgent","High","Medium","Low"].map(p => ({
    label: p, color: PRI_COLOR[p],
    count: curLog.filter(e => e.priority === p).length,
  })).filter(p => p.count > 0);

  // ── Streaks ────────────────────────────────────────────────────────────────
  const topStreaks = [...tasks].filter(t=>t.streak>0).sort((a,b)=>b.streak-a.streak).slice(0,5);

  // ── Styles ────────────────────────────────────────────────────────────────
  const card = (x={}) => ({ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, boxShadow:"0 2px 8px rgba(0,0,0,0.08)", padding:"18px 20px", ...x });
  const subBtn = (active, color="#E8A838") => ({ padding:"6px 14px", borderRadius:20, border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:active?700:400, background:active?color+"22":"transparent", color:active?color:T.textSub, outline:active?`1px solid ${color}44`:"none", transition:"all 0.15s" });

  return (
    <div style={{ padding:"24px 16px", maxWidth:1100, margin:"0 auto" }}>
      {/* ── Header ── */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:24 }}>
        <div>
          <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:28, color:T.text }}>📊 Analytics</div>
          <div style={{ fontSize:13, color:T.textSub, marginTop:3 }}>Track your progress together</div>
        </div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {/* Period */}
          <div style={{ display:"flex", background:T.inputBg, borderRadius:10, padding:3, border:`1px solid ${T.border}`, gap:2 }}>
            {[["week","Week"],["month","Month"],["year","Year"],["all","All Time"]].map(([p,l])=>(
              <button key={p} onClick={()=>setPeriod(p)} style={{ padding:"5px 12px", borderRadius:8, border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:period===p?700:400, background:period===p?T.accent:"transparent", color:period===p?T.accentFg:T.textSub, transition:"all 0.15s" }}>{l}</button>
            ))}
          </div>
          {/* Focus */}
          <div style={{ display:"flex", background:T.inputBg, borderRadius:10, padding:3, border:`1px solid ${T.border}`, gap:2 }}>
            {[["both","Both"],["A",names.A],["B",names.B]].map(([f,l])=>(
              <button key={f} onClick={()=>setFocus(f)} style={{ padding:"5px 12px", borderRadius:8, border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:focus===f?700:400, background:focus===f?(f==="A"?"#E8A838":f==="B"?"#E84E8A":"#9B6EE8"):"transparent", color:focus===f?"#fff":T.textSub, transition:"all 0.15s" }}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sub tabs ── */}
      <div style={{ display:"flex", gap:4, marginBottom:24, borderBottom:`1px solid ${T.border}`, paddingBottom:0 }}>
        {[["overview","Overview"],["history","History"],["report","Report"]].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{ padding:"9px 18px 10px", border:"none", cursor:"pointer", background:"none", fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:tab===t?700:400, color:tab===t?"#9B6EE8":T.textSub, borderBottom:tab===t?"2px solid #9B6EE8":"2px solid transparent", transition:"all 0.15s" }}>{l}</button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab==="overview"&&(
        <>
          {/* Stat cards */}
          <div className="stats-row" style={{ marginBottom:20 }}>
            {[
              { label:"Tasks Completed", value:totalDone, color:"#9B6EE8", sub: pctChange!==null ? `${pctChange>=0?"+":""}${pctChange}% vs last ${period}` : "All time" },
              { label:`${names.A} Completed`, value:curLog.filter(e=>e.completedBy==="A").length, color:"#E8A838", sub:`${tasks.filter(t=>t.done&&(t.assignee==="A"||t.assignee==="both")).length} tasks currently done` },
              { label:`${names.B} Completed`, value:curLog.filter(e=>e.completedBy==="B").length, color:"#E84E8A", sub:`${tasks.filter(t=>t.done&&(t.assignee==="B"||t.assignee==="both")).length} tasks currently done` },
              { label:"Overall Rate", value:`${overallRate}%`, color:"#3DBF8A", sub:`${tasks.filter(t=>t.done).length} of ${totalTasks} tasks done` },
            ].map(s=>(
              <div key={s.label} style={card({ flex:"1 1 140px", borderLeft:`3px solid ${s.color}`, padding:"16px 18px" })}>
                <div style={{ fontSize:28, fontWeight:700, color:T.text, lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize:11, fontWeight:600, color:T.textSub, marginTop:4, textTransform:"uppercase", letterSpacing:"0.08em" }}>{s.label}</div>
                {pctChange!==null&&s.label==="Tasks Completed"&&(
                  <div style={{ fontSize:11, marginTop:4, color:pctChange>=0?"#3DBF8A":"#E84E8A", fontWeight:600 }}>{s.sub}</div>
                )}
                {s.label!=="Tasks Completed"&&<div style={{ fontSize:11, marginTop:4, color:T.textMuted }}>{s.sub}</div>}
              </div>
            ))}
          </div>

          {/* Activity chart */}
          <div style={card({ marginBottom:20, padding:"20px" })}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:17, color:T.text }}>Activity</div>
              <div style={{ display:"flex", gap:12, fontSize:11, color:T.textSub }}>
                <span style={{ display:"flex", alignItems:"center", gap:4 }}><span style={{ width:10,height:10,borderRadius:3,background:"#E8A838",display:"inline-block" }}/>{names.A}</span>
                <span style={{ display:"flex", alignItems:"center", gap:4 }}><span style={{ width:10,height:10,borderRadius:3,background:"#E84E8A",display:"inline-block" }}/>{names.B}</span>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"flex-end", gap:3, height:120, overflowX:"auto", paddingBottom:24, position:"relative" }}>
              {buckets.map((b,i)=>(
                <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:0, flex:"1 0 auto", minWidth: period==="year"?12:period==="month"?16:28, maxWidth: period==="year"?20:period==="month"?28:50 }}>
                  <div style={{ width:"100%", display:"flex", flexDirection:"column", justifyContent:"flex-end", height:100, gap:1 }}>
                    {/* Amen bar */}
                    <div style={{ width:"100%", height:`${maxBucket>0?(b.aCount/maxBucket)*100:0}%`, minHeight:b.aCount>0?3:0, background:"#E8A838", borderRadius:"3px 3px 0 0", transition:"height 0.3s" }}/>
                    {/* Gloria bar */}
                    <div style={{ width:"100%", height:`${maxBucket>0?(b.bCount/maxBucket)*100:0}%`, minHeight:b.bCount>0?3:0, background:"#E84E8A", borderRadius:"3px 3px 0 0", transition:"height 0.3s" }}/>
                  </div>
                  {(period==="week"||(period==="month"&&i%5===0)||(period==="year"&&i%4===0))&&(
                    <div style={{ fontSize:9, color:T.textMuted, marginTop:4, whiteSpace:"nowrap", transform:"rotate(-30deg)", transformOrigin:"top left", position:"absolute", bottom:0 }}>{b.label}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,300px),1fr))", gap:16 }}>
            {/* Category breakdown */}
            <div style={card({})}>
              <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:17, color:T.text, marginBottom:16 }}>By Category</div>
              {bySec.length===0
                ? <div style={{ fontSize:13, color:T.textMuted, fontStyle:"italic" }}>No completions this period</div>
                : bySec.map(s=>(
                  <div key={s.id} style={{ marginBottom:12 }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
                      <span style={{ fontSize:13, color:T.text, fontWeight:500 }}>{s.emoji} {s.label}</span>
                      <span style={{ fontSize:13, fontWeight:700, color:s.color }}>{s.count}</span>
                    </div>
                    <div style={{ height:6, background:T.inputBg, borderRadius:6, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${(s.count/maxSecCount)*100}%`, background:s.color, borderRadius:6, transition:"width 0.4s" }}/>
                    </div>
                  </div>
                ))
              }
            </div>

            {/* Head to head */}
            <div style={card({})}>
              <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:17, color:T.text, marginBottom:16 }}>Head to Head</div>
              {[["A","#E8A838"],["B","#E84E8A"]].map(([u,uc])=>{
                const uDone = curLog.filter(e=>e.completedBy===u).length;
                const total = curLog.length;
                const pct   = total>0 ? Math.round((uDone/total)*100) : 0;
                return (
                  <div key={u} style={{ marginBottom:16 }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ width:28,height:28,borderRadius:"50%",background:uc+"22",border:`2px solid ${uc}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:uc,fontWeight:700 }}>{(names[u]||"?")[0]}</div>
                        <span style={{ fontSize:14, fontWeight:600, color:T.text }}>{names[u]}</span>
                      </div>
                      <span style={{ fontSize:18, fontWeight:700, color:uc }}>{uDone}</span>
                    </div>
                    <div style={{ height:8, background:T.inputBg, borderRadius:8, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${pct}%`, background:uc, borderRadius:8, transition:"width 0.4s" }}/>
                    </div>
                    <div style={{ fontSize:11, color:T.textMuted, marginTop:3 }}>{pct}% of period completions</div>
                  </div>
                );
              })}
              {curLog.length===0&&<div style={{ fontSize:13, color:T.textMuted, fontStyle:"italic" }}>No data for this period</div>}
            </div>

            {/* Priority breakdown */}
            {byPri.length>0&&(
              <div style={card({})}>
                <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:17, color:T.text, marginBottom:16 }}>By Priority</div>
                {byPri.map(p=>(
                  <div key={p.label} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                    <div style={{ width:8,height:8,borderRadius:"50%",background:p.color,flexShrink:0 }}/>
                    <span style={{ fontSize:13, color:T.text, flex:1 }}>{p.label}</span>
                    <div style={{ width:80, height:6, background:T.inputBg, borderRadius:6, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${(p.count/totalDone)*100}%`, background:p.color, borderRadius:6 }}/>
                    </div>
                    <span style={{ fontSize:13, fontWeight:700, color:p.color, minWidth:20 }}>{p.count}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Top streaks */}
            {topStreaks.length>0&&(
              <div style={card({})}>
                <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:17, color:T.text, marginBottom:16 }}>🔥 Top Streaks</div>
                {topStreaks.map((t,i)=>{
                  const s=SECTIONS.find(sec=>sec.id===t.section)||SECTIONS[0];
                  return (
                    <div key={t.id} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                      <span style={{ fontSize:16, fontWeight:700, color:T.textMuted, minWidth:20 }}>#{i+1}</span>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:500, color:T.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.title}</div>
                        <div style={{ fontSize:11, color:s.color }}>{s.emoji} {s.label}</div>
                      </div>
                      <span style={{ fontSize:14, fontWeight:700, color:"#E8A838", background:"#E8A83820", padding:"3px 9px", borderRadius:8 }}>🔥 {t.streak}d</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── HISTORY TAB ── */}
      {tab==="history"&&(
        <div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:8 }}>
            <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:20, color:T.text }}>Completion History</div>
            <div style={{ fontSize:13, color:T.textSub }}>{curLog.length} tasks completed this {period}</div>
          </div>
          {curLog.length===0
            ? <div style={card({ padding:"50px 20px", textAlign:"center" })}>
                <div style={{ fontSize:36, marginBottom:10 }}>📭</div>
                <div style={{ fontSize:16, fontWeight:600, color:T.text }}>No completions yet</div>
                <div style={{ fontSize:13, color:T.textSub, marginTop:4 }}>Start checking off tasks!</div>
              </div>
            : [...curLog].reverse().map(e=>{
                const s=sec(e.section);
                const completer = names[e.completedBy]||e.completedBy;
                const completerColor = e.completedBy==="A"?"#E8A838":"#E84E8A";
                return (
                  <div key={e.id} style={{ ...card({ padding:"14px 16px", marginBottom:8 }), borderLeft:`3px solid ${s.color}` }}>
                    <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                      <div style={{ width:32,height:32,borderRadius:9,background:s.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0 }}>{s.emoji}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:14, fontWeight:600, color:T.text, marginBottom:4 }}>{e.title}</div>
                        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                          <span style={{ fontSize:10,padding:"2px 7px",borderRadius:5,background:s.color+"22",color:s.color,fontWeight:600 }}>{s.label}</span>
                          <span style={{ fontSize:10,padding:"2px 7px",borderRadius:5,background:completerColor+"20",color:completerColor,fontWeight:600 }}>✓ {completer}</span>
                          {e.priority&&<span style={{ fontSize:10,padding:"2px 7px",borderRadius:5,background:PRI_COLOR[e.priority]+"20",color:PRI_COLOR[e.priority],fontWeight:600 }}>{e.priority}</span>}
                          <span style={{ fontSize:10,color:T.textMuted }}>{new Date(e.completedAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"})}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
          }
        </div>
      )}

      {/* ── REPORT TAB ── */}
      {tab==="report"&&(
        <div style={{ maxWidth:680 }}>
          <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:24, color:T.text, marginBottom:6 }}>
            {period==="week"?"Weekly":period==="month"?"Monthly":period==="year"?"Yearly":"All Time"} Report
          </div>
          <div style={{ fontSize:13, color:T.textSub, marginBottom:24 }}>{names.A} & {names.B} · {new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</div>

          {/* Summary block */}
          <div style={{ background:mode==="dark"?"linear-gradient(135deg,#1a1408,#140a18)":"linear-gradient(135deg,#fff8e6,#f3eeff)", borderRadius:16, padding:"24px", marginBottom:20, border:`1px solid ${T.border}` }}>
            <div style={{ fontSize:13, fontWeight:700, color:T.accent, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12 }}>📋 Summary</div>
            <div style={{ fontSize:15, color:T.text, lineHeight:1.8 }}>
              <p style={{ margin:"0 0 8px" }}>During this {period}, <strong style={{color:"#E8A838"}}>{names.A}</strong> and <strong style={{color:"#E84E8A"}}>{names.B}</strong> completed a total of <strong style={{color:"#9B6EE8"}}>{totalDone} tasks</strong> together.</p>
              {pctChange!==null&&<p style={{ margin:"0 0 8px", color:pctChange>=0?"#3DBF8A":"#E84E8A" }}>{pctChange>=0?"📈":"📉"} That's a <strong>{Math.abs(pctChange)}% {pctChange>=0?"increase":"decrease"}</strong> compared to the previous {period}.</p>}
              <p style={{ margin:"0 0 8px" }}><strong style={{color:"#E8A838"}}>{names.A}</strong> completed <strong>{curLog.filter(e=>e.completedBy==="A").length}</strong> tasks · <strong style={{color:"#E84E8A"}}>{names.B}</strong> completed <strong>{curLog.filter(e=>e.completedBy==="B").length}</strong> tasks.</p>
              {bySec.length>0&&<p style={{ margin:"0" }}>Top category: <strong style={{color:bySec[0].color}}>{bySec[0].emoji} {bySec[0].label}</strong> with <strong>{bySec[0].count}</strong> completions.</p>}
            </div>
          </div>

          {/* Per person report */}
          {["A","B"].map(u=>{
            const uLog = curLog.filter(e=>e.completedBy===u);
            const uc   = u==="A"?"#E8A838":"#E84E8A";
            const uSec = SECTIONS.map(s=>({ ...s, count:uLog.filter(e=>e.section===s.id).length })).filter(s=>s.count>0).sort((a,b)=>b.count-a.count);
            return (
              <div key={u} style={{ ...card({ marginBottom:16 }), borderTop:`3px solid ${uc}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                  <div style={{ width:38,height:38,borderRadius:"50%",background:uc+"22",border:`2px solid ${uc}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:uc,fontWeight:700 }}>{(names[u]||"?")[0]}</div>
                  <div>
                    <div style={{ fontSize:16,fontWeight:700,color:T.text }}>{names[u]}'s Report</div>
                    <div style={{ fontSize:12,color:T.textSub }}>{uLog.length} tasks completed</div>
                  </div>
                  <div style={{ marginLeft:"auto", fontSize:26, fontWeight:700, color:uc }}>{uLog.length}</div>
                </div>
                {uSec.length>0
                  ? uSec.map(s=>(
                    <div key={s.id} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                      <span style={{ fontSize:14 }}>{s.emoji}</span>
                      <span style={{ fontSize:13, color:T.text, flex:1 }}>{s.label}</span>
                      <div style={{ width:60,height:5,background:T.inputBg,borderRadius:5,overflow:"hidden" }}>
                        <div style={{ height:"100%",width:`${uLog.length?(s.count/uLog.length)*100:0}%`,background:s.color,borderRadius:5 }}/>
                      </div>
                      <span style={{ fontSize:12,fontWeight:700,color:s.color,minWidth:16 }}>{s.count}</span>
                    </div>
                  ))
                  : <div style={{ fontSize:13,color:T.textMuted,fontStyle:"italic" }}>No completions this period</div>
                }
              </div>
            );
          })}

          {/* Encouragement */}
          <div style={{ background:mode==="dark"?"rgba(61,191,138,0.08)":"rgba(61,191,138,0.06)", border:"1px solid #3DBF8A33", borderRadius:14, padding:"18px 20px", textAlign:"center" }}>
            <div style={{ fontSize:24, marginBottom:8 }}>{totalDone>=10?"🏆":totalDone>=5?"⭐":"💪"}</div>
            <div style={{ fontSize:15, fontWeight:600, color:"#3DBF8A", marginBottom:4 }}>
              {totalDone>=20?"You two are absolutely crushing it!":totalDone>=10?"Great teamwork this period!":totalDone>=5?"Solid progress together!":"Every step forward counts!"}
            </div>
            <div style={{ fontSize:13, color:T.textSub }}>Keep growing together, one task at a time. ♡</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── AppTour — interactive step-by-step guided tour ──────────────────────────
// Each step highlights a specific area with a spotlight overlay + tooltip card
function AppTour({ step, setStep, onClose, setView, setShowAdd, toggleMode, T, mode, names, activeUser }) {
  const safeUser = activeUser || "A";

  // Tour steps: each describes what to highlight and what to say
  const steps = [
    {
      title: "Welcome to the Tour! 🗺️",
      body: "This quick tour walks you through every major feature of Together. Use the arrows to go at your own pace, or press Skip any time.",
      target: null, // no spotlight — center modal
      action: null,
      tip: null,
    },
    {
      title: "Your Life Board ⊞",
      body: "This is your main board. Each card represents a life area — Faith, Health, Finance, School and more. Tasks live inside each card.",
      target: ".grid-board",
      action: () => setView("board"),
      tip: "Try dragging the ≡ handle on a card header to reorder your boards!",
    },
    {
      title: "Adding a Task ✚",
      body: "Tap '+ Task' in the top bar to add a new task. You can set a title, life area, type, priority, due date, and assign it to yourself, your partner, or both.",
      target: null,
      action: () => setView("board"),
      tip: "Press Enter in the title field to save quickly!",
      highlight: "add-task-btn",
    },
    {
      title: "Task Types 🔄",
      body: "Tasks come in 5 types: To-Do (one-off), Habit (manual streak), Daily (resets every morning), Weekly (resets every Monday), and Goal (long-term).",
      target: null,
      action: () => setView("board"),
      tip: "Daily and Weekly tasks automatically reset — perfect for routines like morning devotion or weekly budget review.",
    },
    {
      title: "Today's Focus ◎",
      body: "The Today tab shows your tasks for the day grouped by priority — Urgent, High, Medium, Low. Daily and Weekly habits appear at the top.",
      target: null,
      action: () => setView("today"),
      tip: "Switch between Amen and Gloria using the identity badge in the top bar.",
    },
    {
      title: "Accountability — Us ♡",
      body: "The Us tab shows both of your progress side by side — completion rates, active habits, streaks, and shared goals. Great for checking in on each other.",
      target: null,
      action: () => setView("accountability"),
      tip: "The urgency indicator (⚠) shows if someone has overdue or high-priority tasks.",
    },
    {
      title: "📊 Analytics",
      body: "Track your completions over time. Switch between Week, Month, Year or All Time. See a bar chart, category breakdown, head-to-head comparison, and a written report.",
      target: null,
      action: () => setView("analytics"),
      tip: "Every task you check off is recorded permanently — even after it's deleted from the board.",
    },
    {
      title: "💭 Reflections",
      body: "Add questions for each other, personal planning notes, career goals, pet peeves, compatibility prompts — anything you want to think through together.",
      target: null,
      action: () => setView("reflections"),
      tip: "Questions let both of you answer independently. Your answer stays private until saved.",
    },
    {
      title: "🙏 Prayer Requests",
      body: "Log prayer requests for yourself or each other. Mark them as Answered when God comes through — they stay in your answered list as a testimony.",
      target: null,
      action: () => setView("prayer"),
      tip: "Both of you can add and answer prayers. It all syncs in real time.",
    },
    {
      title: "🔴 Urgent & Timelines",
      body: "The Urgent tab surfaces overdue and due-soon tasks. The timeline tabs (This Week, Month, Year) let you plan ahead and see what's coming.",
      target: null,
      action: () => setView("urgent"),
      tip: "Add due dates to tasks to make the timeline views really powerful.",
    },
    {
      title: "Light & Dark Mode ☀☾",
      body: "Toggle between light and dark mode using the ☀/☾ button in the top bar. Your preference syncs to your partner's device too.",
      target: null,
      action: null,
      tip: "The mode even syncs between devices — if Amen switches to light, Gloria sees it too.",
    },
    {
      title: "Push Notifications 🔔",
      body: "Enable push notifications in Settings (⚙) to get alerts when tasks are due today, tomorrow, or overdue. Works on desktop and Android.",
      target: null,
      action: null,
      tip: "Tap ⚙ → Push Notifications → Enable. You'll get a test notification right away.",
    },
    {
      title: "You're all set! 🚀",
      body: `That's the full tour, ${names[safeUser]||safeUser}! You now know everything Together can do. Go ahead and start adding your tasks and reflections.`,
      target: null,
      action: () => setView("board"),
      tip: "You can restart this tour anytime from ⚙ Settings → Take the App Tour.",
    },
  ];

  const current = steps[step];
  const isLast  = step === steps.length - 1;
  const total   = steps.length;

  // Run the step's action when step changes
  useEffect(() => {
    if (current.action) current.action();
  }, [step]);

  const accentColors = ["#E8A838","#3DBF8A","#9B6EE8","#3B9EDB","#E84E8A","#E8704A","#3DBF8A","#9B6EE8","#C8B030","#E8883A","#E8A838","#3DBF8A","#E84E8A"];
  const accent = accentColors[step % accentColors.length];

  return (
    <>
      {/* Dim overlay — doesn't block interaction so user can see what we're pointing at */}
      <div style={{ position:"fixed", inset:0, zIndex:80, pointerEvents:"none", background:"rgba(0,0,0,0.55)", backdropFilter:"blur(2px)" }}/>

      {/* Tour card — bottom sheet on mobile, centered lower panel on desktop */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:81, display:"flex", justifyContent:"center", padding:"0 16px 16px", pointerEvents:"none" }}>
        <div style={{
          background:T.surface, border:`1px solid ${T.border}`,
          borderRadius:20, width:"100%", maxWidth:520,
          boxShadow:"0 -8px 40px rgba(0,0,0,0.4)",
          pointerEvents:"all",
          animation:"slideUp 0.3s ease",
        }}>
          {/* Progress bar */}
          <div style={{ height:3, background:T.inputBg, borderRadius:"20px 20px 0 0", overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${((step+1)/total)*100}%`, background:accent, transition:"width 0.4s ease", borderRadius:"20px 20px 0 0" }}/>
          </div>

          <div style={{ padding:"22px 22px 20px" }}>
            {/* Step counter + close */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:28, height:28, borderRadius:"50%", background:accent+"22", border:`2px solid ${accent}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:accent }}>{step+1}</div>
                <span style={{ fontSize:12, color:T.textMuted, fontFamily:"'DM Sans',sans-serif" }}>of {total}</span>
              </div>
              <button onClick={onClose} style={{ fontSize:13, color:T.textMuted, background:"none", border:`1px solid ${T.border}`, borderRadius:8, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", padding:"5px 12px" }}>✕ Exit Tour</button>
            </div>

            {/* Content */}
            <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:19, color:T.text, marginBottom:8, lineHeight:1.3 }}>{current.title}</div>
            <p style={{ fontSize:14, color:T.text, lineHeight:1.65, margin:"0 0 12px", fontFamily:"'DM Sans',sans-serif" }}>{current.body}</p>

            {/* Tip box */}
            {current.tip && (
              <div style={{ background:accent+"12", border:`1px solid ${accent}33`, borderRadius:10, padding:"10px 13px", marginBottom:16, display:"flex", gap:8, alignItems:"flex-start" }}>
                <span style={{ fontSize:15, flexShrink:0 }}>💡</span>
                <span style={{ fontSize:13, color:T.text, lineHeight:1.5, fontFamily:"'DM Sans',sans-serif" }}>{current.tip}</span>
              </div>
            )}

            {/* Dot indicators */}
            <div style={{ display:"flex", gap:4, marginBottom:16, flexWrap:"wrap" }}>
              {steps.map((_,i) => (
                <div key={i} onClick={()=>setStep(i)} style={{ width:i===step?16:6, height:6, borderRadius:3, background:i===step?accent:T.border, transition:"all 0.25s", cursor:"pointer" }}/>
              ))}
            </div>

            {/* Navigation */}
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <button onClick={onClose} style={{ fontSize:13, color:T.textMuted, background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", padding:"8px 0", flexShrink:0 }}>Skip</button>
              <div style={{ flex:1 }}/>
              {step > 0 && (
                <button onClick={()=>setStep(s=>s-1)} style={{ padding:"10px 20px", borderRadius:10, border:`1px solid ${T.border}`, background:T.inputBg, color:T.textSub, fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600, cursor:"pointer" }}>
                  ← Back
                </button>
              )}
              <button
                onClick={()=>{ if(isLast){setView("board");onClose();}else{setStep(s=>s+1);} }}
                style={{ padding:"10px 24px", borderRadius:10, border:"none", background:accent, color:"#fff", fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:700, cursor:"pointer" }}
              >
                {isLast ? "Finish 🎉" : "Next →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── OnboardingFlow ────────────────────────────────────────────────────────────
function OnboardingFlow({ names, onFinish, T, mode }) {
  const [step, setStep] = useState(0);

  const slides = [
    {
      emoji: "♡",
      title: "Welcome to Together",
      body: `Hey ${names.A} & ${names.B}! This app is your shared space to grow, plan, and stay connected — across every area of life.`,
      accent: "#E8A838",
      bg: mode==="dark" ? "linear-gradient(135deg,#1a1200 0%,#2a1800 100%)" : "linear-gradient(135deg,#fff8e6 0%,#fff0cc 100%)",
    },
    {
      emoji: "⊞",
      title: "Your Life Board",
      body: "Tasks are organized into life areas — Faith, School, Work, Health, Relationship and more. Drag cards to reorder your board. Each of you has your own layout.",
      accent: "#3DBF8A",
      bg: mode==="dark" ? "linear-gradient(135deg,#001a0e 0%,#002814 100%)" : "linear-gradient(135deg,#e6fff4 0%,#ccffe8 100%)",
    },
    {
      emoji: "💭",
      title: "Reflections",
      body: "Ask each other questions, store personal answers, plan your PhD, career, or relationship goals. A private-yet-shared journal space for the deep conversations.",
      accent: "#9B6EE8",
      bg: mode==="dark" ? "linear-gradient(135deg,#0e0014 0%,#180020 100%)" : "linear-gradient(135deg,#f3eeff 0%,#e8d8ff 100%)",
    },
    {
      emoji: "📱",
      title: "Two Devices, One App",
      body: "Open this app on your own device — it remembers who you are. Changes sync between you both in real time. Your boards, your order, your identity.",
      accent: "#3B9EDB",
      bg: mode==="dark" ? "linear-gradient(135deg,#001018 0%,#001a28 100%)" : "linear-gradient(135deg,#e6f4ff 0%,#cce8ff 100%)",
    },
    {
      emoji: "🚀",
      title: "You're all set!",
      body: "Start by setting your names in ⚙ Settings, then pick your identity when prompted. Add your first task and grow together — one day at a time.",
      accent: "#E84E8A",
      bg: mode==="dark" ? "linear-gradient(135deg,#1a0010 0%,#28001a 100%)" : "linear-gradient(135deg,#fff0f6 0%,#ffd6ea 100%)",
    },
  ];

  const slide = slides[step];
  const isLast = step === slides.length - 1;

  return (
    <div style={{ position:"fixed", inset:0, zIndex:70, display:"flex", alignItems:"center", justifyContent:"center", padding:20, background:"rgba(0,0,0,0.85)", backdropFilter:"blur(10px)" }}>
      <div style={{ width:"100%", maxWidth:460, background:T.surface, borderRadius:24, overflow:"hidden", boxShadow:"0 32px 80px rgba(0,0,0,0.5)", border:`1px solid ${T.border}` }}>
        {/* Slide hero */}
        <div style={{ background:slide.bg, padding:"44px 32px 36px", textAlign:"center", position:"relative" }}>
          <div style={{ fontSize:56, marginBottom:16, lineHeight:1 }}>{slide.emoji}</div>
          <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:26, color:slide.accent, lineHeight:1.2, marginBottom:0 }}>{slide.title}</div>
        </div>

        {/* Body */}
        <div style={{ padding:"28px 32px 24px" }}>
          <p style={{ fontSize:15, color:T.text, lineHeight:1.7, margin:"0 0 28px", fontFamily:"'DM Sans',sans-serif", textAlign:"center" }}>{slide.body}</p>

          {/* Step dots */}
          <div style={{ display:"flex", justifyContent:"center", gap:7, marginBottom:24 }}>
            {slides.map((_,i) => (
              <div key={i} onClick={()=>setStep(i)} style={{ width:i===step?20:7, height:7, borderRadius:4, background:i===step?slide.accent:T.border, transition:"all 0.3s", cursor:"pointer" }}/>
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            {/* Skip */}
            <button
              onClick={onFinish}
              style={{ fontSize:13, color:T.textMuted, background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", padding:"8px 4px", flexShrink:0 }}
            >
              Skip
            </button>
            <div style={{ flex:1 }}/>
            {/* Back */}
            {step > 0 && (
              <button
                onClick={()=>setStep(s=>s-1)}
                style={{ padding:"11px 22px", borderRadius:10, border:`1px solid ${T.border}`, background:T.inputBg, color:T.textSub, fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600, cursor:"pointer" }}
              >
                Back
              </button>
            )}
            {/* Next / Done */}
            <button
              onClick={()=>{ if(isLast) onFinish(); else setStep(s=>s+1); }}
              style={{ padding:"11px 28px", borderRadius:10, border:"none", background:slide.accent, color:"#fff", fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:700, cursor:"pointer", transition:"opacity 0.15s" }}
            >
              {isLast ? "Let's go! 🚀" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ReflectionsView ───────────────────────────────────────────────────────────
// Categories of reflections
const REFLECT_CATS = [
  { id:"relationship", label:"Relationship",    emoji:"♡",  color:"#E84E8A" },
  { id:"compatibility",label:"Compatibility",   emoji:"🧩", color:"#9B6EE8" },
  { id:"personal",     label:"Personal",        emoji:"🌱", color:"#3DBF8A" },
  { id:"career",       label:"Career & Purpose",emoji:"🎯", color:"#3B9EDB" },
  { id:"phd",          label:"PhD & School",    emoji:"🎓", color:"#7B61FF" },
  { id:"peeves",       label:"Pet Peeves",      emoji:"😬", color:"#E8883A" },
  { id:"goals",        label:"Shared Goals",    emoji:"⭐", color:"#E8A838" },
  { id:"planning",     label:"Life Planning",   emoji:"🗺️", color:"#20B2AA" },
  { id:"misc",         label:"Misc Thoughts",   emoji:"💡", color:"#C8B030" },
];

function ReflectionsView({ activeUser, names, T, mode, TODAY, genId }) {
  const [entries,    setEntriesState] = useState(null);
  const [catFilter,  setCatFilter]    = useState(null);
  const [showForm,   setShowForm]     = useState(false);
  const [editEntry,  setEditEntry]    = useState(null);
  const [expanded,   setExpanded]     = useState({}); // which entries are expanded
  const [newEntry,   setNewEntry]     = useState({ title:"", body:"", category:"relationship", isQuestion:false, answers:{} });

  useEffect(() => {
    (async () => {
      const stored = await dbGet("reflections");
      setEntriesState(stored ?? []);
    })();
  }, []);

  function save(list) { setEntriesState(list); dbSet("reflections", list); }

  function addEntry() {
    if (!newEntry.title.trim()) return;
    const e = { ...newEntry, id:genId(), createdBy:activeUser||"A", createdAt:TODAY, answers:{} };
    save([...(entries||[]), e]);
    setNewEntry({ title:"", body:"", category:"relationship", isQuestion:false, answers:{} });
    setShowForm(false);
  }

  function saveEdit() {
    save((entries||[]).map(e => e.id===editEntry.id ? editEntry : e));
    setEditEntry(null);
  }

  function deleteEntry(id) { save((entries||[]).filter(e=>e.id!==id)); }

  function saveAnswer(entryId, answer) {
    const user = activeUser || "A";
    save((entries||[]).map(e => e.id===entryId ? { ...e, answers:{ ...e.answers, [user]:answer } } : e));
  }

  const cat   = id => REFLECT_CATS.find(c=>c.id===id)||REFLECT_CATS[0];
  const inpSt = { width:"100%", background:T.inputBg, border:`1px solid ${T.border}`, borderRadius:9, padding:"10px 13px", color:T.text, fontFamily:"'DM Sans',sans-serif", fontSize:14, outline:"none", boxSizing:"border-box" };
  const selSt = { ...inpSt, background:mode==="dark"?"#181B23":"#fff", cursor:"pointer" };
  const lblSt = { fontSize:11, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", color:T.textMuted, display:"block", marginBottom:5, marginTop:14, fontFamily:"'DM Sans',sans-serif" };
  const card  = (x={}) => ({ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, boxShadow:"0 2px 8px rgba(0,0,0,0.08)", ...x });
  const btnSt = p => ({ padding:"9px 20px", borderRadius:9, border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600, background:p?"#9B6EE8":T.inputBg, color:p?"#fff":T.textSub });

  const filtered = (entries||[]).filter(e => !catFilter || e.category===catFilter);

  // EntryForm extracted to module level — see ReflectionEntryForm below

  // AnswerBox extracted to module level — see ReflectionAnswerBox below

  if (entries===null) return (
    <div style={{ padding:"40px 16px",textAlign:"center",color:T.textMuted,fontFamily:"'DM Sans',sans-serif" }}>Loading...</div>
  );

  return (
    <div style={{ padding:"24px 16px", maxWidth:820, margin:"0 auto" }}>
      {/* Header */}
      <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginBottom:6 }}>
        <div>
          <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:28,color:T.text }}>💭 Reflections</div>
          <div style={{ fontSize:13,color:T.textSub,marginTop:3 }}>Questions, plans, thoughts — yours and each other's</div>
        </div>
        <button onClick={()=>setShowForm(true)} style={{ height:36,padding:"0 16px",borderRadius:9,border:"none",background:"#9B6EE8",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,color:"#fff",whiteSpace:"nowrap" }}>
          + Add Reflection
        </button>
      </div>

      {/* Category filter pills */}
      <div className="pill-scroll" style={{ marginBottom:20,marginTop:16 }}>
        <button onClick={()=>setCatFilter(null)} style={{ padding:"5px 13px",borderRadius:20,cursor:"pointer",fontSize:12,fontFamily:"'DM Sans',sans-serif",fontWeight:500,border:"none",background:!catFilter?"#9B6EE8":"transparent",color:!catFilter?"#fff":T.textSub,outline:!catFilter?"none":`1px solid ${T.border}`,transition:"all 0.15s",flexShrink:0 }}>All</button>
        {REFLECT_CATS.map(rc=>(
          <button key={rc.id} onClick={()=>setCatFilter(catFilter===rc.id?null:rc.id)} style={{ padding:"5px 13px",borderRadius:20,cursor:"pointer",fontSize:12,fontFamily:"'DM Sans',sans-serif",fontWeight:500,border:"none",background:catFilter===rc.id?rc.color:"transparent",color:catFilter===rc.id?"#fff":T.textSub,outline:catFilter===rc.id?"none":`1px solid ${T.border}`,transition:"all 0.15s",whiteSpace:"nowrap",flexShrink:0 }}>
            {rc.emoji} {rc.label}
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div className="stats-row" style={{ marginBottom:20 }}>
        {[
          { l:"Total", v:entries.length, c:"#9B6EE8" },
          { l:"Questions", v:entries.filter(e=>e.isQuestion).length, c:"#E84E8A" },
          { l:"Notes", v:entries.filter(e=>!e.isQuestion).length, c:"#3DBF8A" },
          { l:"Answered", v:entries.filter(e=>e.isQuestion&&e.answers&&Object.keys(e.answers).length===2).length, c:"#E8A838" },
        ].map(s=>(
          <div key={s.l} style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,boxShadow:"0 2px 8px rgba(0,0,0,0.06)",padding:"12px 16px",flex:"1 1 90px",borderLeft:`3px solid ${s.c}` }}>
            <div style={{ fontSize:22,fontWeight:700,color:T.text,lineHeight:1 }}>{s.v}</div>
            <div style={{ fontSize:10,fontWeight:600,color:T.textSub,marginTop:3,textTransform:"uppercase",letterSpacing:"0.08em" }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Entries */}
      {filtered.length===0 ? (
        <div style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:"50px 20px",textAlign:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize:40,marginBottom:12 }}>💭</div>
          <div style={{ fontSize:17,fontWeight:600,color:T.text,fontFamily:"'DM Serif Display',serif" }}>Nothing here yet</div>
          <div style={{ fontSize:13,color:T.textSub,marginTop:6 }}>Add a question or reflection to get started.</div>
        </div>
      ) : (
        <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
          {[...filtered].reverse().map(e=>{
            const rc = cat(e.category);
            const isExp = expanded[e.id];
            const answeredCount = e.answers ? Object.keys(e.answers).length : 0;
            const bothAnswered = e.isQuestion && answeredCount===2;
            return (
              <div key={e.id} style={{ background:T.surface,border:`1px solid ${T.border}`,borderLeft:`3px solid ${rc.color}`,borderRadius:14,padding:"16px 18px",boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
                {/* Entry header */}
                <div style={{ display:"flex",alignItems:"flex-start",gap:10 }}>
                  <div style={{ width:34,height:34,borderRadius:10,background:rc.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0 }}>{rc.emoji}</div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:6,flexWrap:"wrap" }}>
                      {e.isQuestion && <span style={{ fontSize:10,padding:"2px 7px",borderRadius:5,background:"#9B6EE822",color:"#9B6EE8",fontWeight:700,flexShrink:0 }}>❓ Question</span>}
                      {bothAnswered && <span style={{ fontSize:10,padding:"2px 7px",borderRadius:5,background:"#3DBF8A22",color:"#3DBF8A",fontWeight:700,flexShrink:0 }}>✓ Both answered</span>}
                      {e.isQuestion && !bothAnswered && answeredCount===1 && <span style={{ fontSize:10,padding:"2px 7px",borderRadius:5,background:"#E8A83822",color:"#E8A838",fontWeight:700,flexShrink:0 }}>½ 1 answered</span>}
                    </div>
                    <div style={{ fontSize:15,fontWeight:600,color:T.text,lineHeight:1.4,marginTop:4,fontFamily:"'DM Sans',sans-serif" }}>{e.title}</div>
                    {e.body && !isExp && <div style={{ fontSize:13,color:T.textSub,marginTop:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"100%" }}>{e.body}</div>}
                    <div style={{ display:"flex",gap:5,marginTop:6,flexWrap:"wrap" }}>
                      <span style={{ fontSize:10,padding:"2px 7px",borderRadius:5,background:rc.color+"20",color:rc.color,fontWeight:600,fontFamily:"'DM Sans',sans-serif" }}>{rc.emoji} {rc.label}</span>
                      <span style={{ fontSize:10,color:T.textMuted }}>{e.createdAt} · by {names[e.createdBy]||e.createdBy}</span>
                    </div>
                  </div>
                  <div style={{ display:"flex",gap:2,flexShrink:0 }}>
                    <button onClick={()=>setEditEntry({...e})} style={{ background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:13,padding:"3px 5px",borderRadius:4 }}>✎</button>
                    <button onClick={()=>deleteEntry(e.id)} style={{ background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:13,padding:"3px 5px",borderRadius:4 }}>✕</button>
                  </div>
                </div>

                {/* Expand / collapse */}
                <button
                  onClick={()=>setExpanded(prev=>({...prev,[e.id]:!prev[e.id]}))}
                  style={{ marginTop:10,fontSize:12,color:"#9B6EE8",background:"none",border:`1px solid #9B6EE844`,borderRadius:8,padding:"5px 12px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,width:"100%" }}
                >
                  {isExp ? "▲ Collapse" : `▼ ${e.isQuestion?"View / Answer":"Read more"}`}
                </button>

                {/* Expanded content */}
                {isExp && (
                  <div style={{ marginTop:14 }}>
                    {e.body && (
                      <div style={{ background:T.inputBg,borderRadius:10,padding:"12px 14px",marginBottom:12 }}>
                        <div style={{ fontSize:13,color:T.textSub,marginBottom:4,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",fontSize:10 }}>Context</div>
                        <div style={{ fontSize:14,color:T.text,lineHeight:1.6,whiteSpace:"pre-wrap" }}>{e.body}</div>
                      </div>
                    )}
                    {e.isQuestion ? (
                      <ReflectionAnswerBox entry={e} activeUser={activeUser} names={names} T={T} saveAnswer={saveAnswer}/>
                    ) : (
                      <div style={{ fontSize:13,color:T.textMuted,fontStyle:"italic",textAlign:"center",padding:"8px 0" }}>This is a personal note. No answers needed.</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showForm && <ReflectionEntryForm data={newEntry} setData={setNewEntry} onSave={addEntry} onClose={()=>setShowForm(false)} title="New Reflection" T={T} mode={mode}/>}
      {editEntry && <ReflectionEntryForm data={editEntry} setData={setEditEntry} onSave={saveEdit} onClose={()=>setEditEntry(null)} title="Edit Reflection" T={T} mode={mode}/>}
    </div>
  );
}

// ── ReflectionAnswerBox — extracted to module level to prevent focus bugs ─────
function ReflectionAnswerBox({ entry, activeUser, names, T, saveAnswer }) {
  const user    = activeUser||"A";
  const partner = user==="A"?"B":"A";
  const [draft,   setDraft]   = useState(entry.answers?.[user]||"");
  const [editing, setEditing] = useState(!entry.answers?.[user]);
  const taRef = useRef(null);

  // Focus textarea only on first mount (when editing starts)
  useEffect(() => {
    if (editing && taRef.current) {
      const t = setTimeout(()=>{ if(taRef.current) taRef.current.focus(); }, 60);
      return ()=>clearTimeout(t);
    }
  }, [editing]);

  const inpSt = { width:"100%", background:T.inputBg, border:`1px solid ${T.border}`, borderRadius:9, padding:"10px 13px", color:T.text, fontFamily:"'DM Sans',sans-serif", fontSize:14, outline:"none", boxSizing:"border-box" };

  return (
    <div style={{ marginTop:14 }}>
      <div style={{ marginBottom:12 }}>
        <div style={{ fontSize:11,fontWeight:700,color:user==="A"?"#E8A838":"#E84E8A",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6 }}>
          {(names[user]||user)}'s Answer
        </div>
        {editing ? (
          <div>
            <textarea
              ref={taRef}
              value={draft}
              onChange={e=>setDraft(e.target.value)}
              placeholder="Write your answer here..."
              style={{...inpSt, minHeight:70, resize:"vertical", border:`1px solid ${user==="A"?"#E8A838":"#E84E8A"}44`}}
            />
            <div style={{ display:"flex",gap:8,marginTop:8,justifyContent:"flex-end" }}>
              {entry.answers?.[user]&&(
                <button onClick={()=>setEditing(false)} style={{ fontSize:12,padding:"5px 12px",borderRadius:8,border:`1px solid ${T.border}`,background:T.inputBg,color:T.textSub,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>Cancel</button>
              )}
              <button onClick={()=>{ saveAnswer(entry.id,draft); setEditing(false); }} style={{ fontSize:12,padding:"5px 14px",borderRadius:8,border:"none",background:"#9B6EE8",color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600 }}>
                Save Answer
              </button>
            </div>
          </div>
        ) : (
          <div style={{ background:T.inputBg,borderRadius:10,padding:"12px 14px",position:"relative" }}>
            <div style={{ fontSize:14,color:T.text,lineHeight:1.6,whiteSpace:"pre-wrap",fontFamily:"'DM Sans',sans-serif" }}>{entry.answers[user]}</div>
            <button onClick={()=>setEditing(true)} style={{ position:"absolute",top:8,right:8,fontSize:12,background:"none",border:"none",color:T.textMuted,cursor:"pointer" }}>✎</button>
          </div>
        )}
      </div>
      {entry.answers?.[partner] && (
        <div>
          <div style={{ fontSize:11,fontWeight:700,color:partner==="A"?"#E8A838":"#E84E8A",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6 }}>
            {(names[partner]||partner)}'s Answer
          </div>
          <div style={{ background:T.inputBg,borderRadius:10,padding:"12px 14px",border:`1px solid ${partner==="A"?"#E8A83822":"#E84E8A22"}` }}>
            <div style={{ fontSize:14,color:T.text,lineHeight:1.6,whiteSpace:"pre-wrap",fontFamily:"'DM Sans',sans-serif" }}>{entry.answers[partner]}</div>
          </div>
        </div>
      )}
      {entry.isQuestion && !entry.answers?.[partner] && (
        <div style={{ fontSize:12,color:T.textMuted,fontStyle:"italic",marginTop:4 }}>{(names[partner]||partner)} hasn't answered yet...</div>
      )}
    </div>
  );
}

// ── ReflectionEntryForm — extracted to module level to fix focus bug ─────────
function ReflectionEntryForm({ data, setData, onSave, onClose, title, T, mode }) {
  const ref = useRef(null);
  useEffect(() => {
    const t = setTimeout(() => { if (ref.current) ref.current.focus(); }, 80);
    return () => clearTimeout(t);
  }, []); // only on mount

  const inpSt = { width:"100%", background:T.inputBg, border:`1px solid ${T.border}`, borderRadius:9, padding:"10px 13px", color:T.text, fontFamily:"'DM Sans',sans-serif", fontSize:14, outline:"none", boxSizing:"border-box" };
  const selSt = { ...inpSt, background:mode==="dark"?"#181B23":"#fff", cursor:"pointer" };
  const lblSt = { fontSize:11, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", color:T.textMuted, display:"block", marginBottom:5, marginTop:14, fontFamily:"'DM Sans',sans-serif" };

  return (
    <div style={{ position:"fixed",inset:0,zIndex:40,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center" }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:"18px 18px 0 0",boxShadow:"0 -4px 32px rgba(0,0,0,0.3)",width:"100%",maxWidth:520,maxHeight:"92vh",overflowY:"auto",padding:"24px 20px 36px" }}>
        <div style={{ width:40,height:4,borderRadius:2,background:T.textMuted,margin:"0 auto 20px",opacity:0.4 }}/>
        <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:22,color:T.text,marginBottom:4 }}>{title}</div>
        <div style={{ height:2,width:40,background:"#9B6EE8",borderRadius:2,marginBottom:20 }}/>
        <label style={lblSt}>Title / Prompt</label>
        <input ref={ref} style={inpSt} value={data.title}
          onChange={e=>setData(p=>({...p,title:e.target.value}))}
          onKeyDown={e=>{ if(e.key==="Enter"&&data.title.trim()){e.preventDefault();onSave();} }}
          placeholder="e.g. What are your top 3 love languages? (Enter to save)"/>
        <label style={lblSt}>Category</label>
        <select style={selSt} value={data.category} onChange={e=>setData(p=>({...p,category:e.target.value}))}>
          {REFLECT_CATS.map(rc=><option key={rc.id} value={rc.id}>{rc.emoji} {rc.label}</option>)}
        </select>
        <label style={lblSt}>Type</label>
        <div style={{ display:"flex",gap:8 }}>
          {[{v:false,l:"📝 Note / Thought"},{v:true,l:"❓ Question (both answer)"}].map(opt=>(
            <button key={String(opt.v)} onClick={()=>setData(p=>({...p,isQuestion:opt.v}))}
              style={{ flex:1,padding:"10px",borderRadius:10,border:`1px solid ${data.isQuestion===opt.v?"#9B6EE8":T.border}`,background:data.isQuestion===opt.v?"#9B6EE822":"transparent",color:data.isQuestion===opt.v?"#9B6EE8":T.text,fontFamily:"'DM Sans',sans-serif",fontSize:13,cursor:"pointer",fontWeight:data.isQuestion===opt.v?700:400 }}>
              {opt.l}
            </button>
          ))}
        </div>
        <label style={lblSt}>{data.isQuestion?"Additional context (optional)":"Your thoughts / notes"}</label>
        <textarea style={{...inpSt,minHeight:90,resize:"vertical"}} value={data.body}
          onChange={e=>setData(p=>({...p,body:e.target.value}))}
          placeholder={data.isQuestion?"Any background or guidance for answering...":"Write freely here..."}/>
        <div style={{ display:"flex",gap:10,marginTop:24,justifyContent:"flex-end" }}>
          <button style={{ padding:"9px 20px",borderRadius:9,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,background:T.inputBg,color:T.textSub }} onClick={onClose}>Cancel</button>
          <button style={{ padding:"9px 20px",borderRadius:9,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,background:"#9B6EE8",color:"#fff" }} onClick={onSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ── Shared mini modal for all three new views ─────────────────────────────────
function MiniModal({ title, accent, onClose, onSave, children, T }) {
  return (
    <div style={{ position:"fixed",inset:0,zIndex:40,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center" }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:"18px 18px 0 0",boxShadow:"0 -4px 32px rgba(0,0,0,0.3)",width:"100%",maxWidth:540,maxHeight:"92vh",overflowY:"auto",padding:"24px 20px 36px" }}>
        <div style={{ width:40,height:4,borderRadius:2,background:T.textMuted,margin:"0 auto 20px",opacity:0.4 }}/>
        <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:22,color:T.text,marginBottom:4 }}>{title}</div>
        <div style={{ height:2,width:40,background:accent,borderRadius:2,marginBottom:20 }}/>
        {children}
        <div style={{ display:"flex",gap:10,marginTop:24,justifyContent:"flex-end" }}>
          <button style={{ padding:"9px 20px",borderRadius:9,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,background:T.inputBg,color:T.textSub }} onClick={onClose}>Cancel</button>
          <button style={{ padding:"9px 20px",borderRadius:9,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,background:accent,color:"#fff" }} onClick={onSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ── TrackerView — links + application tracking ────────────────────────────────
const TRACKER_CATS = [
  { id:"phd",    label:"PhD Programs",  emoji:"🎓", color:"#7B61FF" },
  { id:"opt",    label:"OPT / CPT",     emoji:"📋", color:"#3B9EDB" },
  { id:"jobs",   label:"Jobs",          emoji:"💼", color:"#9B6EE8" },
  { id:"grants", label:"Grants",        emoji:"💰", color:"#E8A838" },
  { id:"housing",label:"Housing",       emoji:"🏠", color:"#5BAD4E" },
  { id:"other",  label:"Other",         emoji:"🔗", color:"#888D9B" },
];
const TRACKER_STATUSES = [
  { id:"saved",    label:"Saved",     color:"#888D9B" },
  { id:"applied",  label:"Applied",   color:"#3B9EDB" },
  { id:"waiting",  label:"Waiting",   color:"#E8A838" },
  { id:"interview",label:"Interview", color:"#9B6EE8" },
  { id:"accepted", label:"Accepted",  color:"#3DBF8A" },
  { id:"rejected", label:"Rejected",  color:"#E84E8A" },
  { id:"withdrawn",label:"Withdrawn", color:"#888D9B" },
];

function TrackerView({ activeUser, names, T, mode, TODAY, genId }) {
  const [items,    setItemsState] = useState(null);
  const [catFilter,setCatFilter]  = useState(null);
  const [stFilter, setStFilter]   = useState(null);
  const [showAdd,  setShowAdd]    = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [expandedNotes, setExpandedNotes] = useState({});
  const [newNote, setNewNote] = useState({});
  const blankItem = { title:"", url:"", category:"phd", status:"saved", notes:[], deadline:"", notes_text:"", createdBy:"", createdAt:"" };
  const [newItem, setNewItem] = useState({...blankItem});

  useEffect(()=>{ (async()=>{ const s=await dbGet("tracker"); setItemsState(s??[]); })(); },[]);
  function save(list) { setItemsState(list); dbSet("tracker",list); }
  function addItem() {
    if (!newItem.title.trim()) return;
    save([...(items||[]), { ...newItem, id:genId(), createdBy:activeUser||"A", createdAt:TODAY, notes:[] }]);
    setNewItem({...blankItem}); setShowAdd(false);
  }
  function saveEdit() { save((items||[]).map(i=>i.id===editItem.id?editItem:i)); setEditItem(null); }
  function deleteItem(id) { save((items||[]).filter(i=>i.id!==id)); }
  function addNote(itemId) {
    const text = newNote[itemId]||"";
    if (!text.trim()) return;
    const note = { id:genId(), text, by:activeUser||"A", at:new Date().toLocaleString() };
    save((items||[]).map(i=>i.id===itemId?{...i,notes:[...(i.notes||[]),note]}:i));
    setNewNote(p=>({...p,[itemId]:""}));
  }
  function deleteNote(itemId, noteId) {
    save((items||[]).map(i=>i.id===itemId?{...i,notes:(i.notes||[]).filter(n=>n.id!==noteId)}:i));
  }
  function updateStatus(itemId, status) {
    save((items||[]).map(i=>i.id===itemId?{...i,status}:i));
  }

  const filtered = (items||[]).filter(i=> (!catFilter||i.category===catFilter) && (!stFilter||i.status===stFilter));
  const catOf = id => TRACKER_CATS.find(c=>c.id===id)||TRACKER_CATS[0];
  const stOf  = id => TRACKER_STATUS.find(s=>s.id===id)||TRACKER_STATUS[0];
  const inpSt = { width:"100%", background:T.inputBg, border:`1px solid ${T.border}`, borderRadius:9, padding:"10px 13px", color:T.text, fontFamily:"'DM Sans',sans-serif", fontSize:14, outline:"none", boxSizing:"border-box" };
  const selSt = { ...inpSt, background:mode==="dark"?"#181B23":"#fff", cursor:"pointer" };
  const lblSt = { fontSize:11,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",color:T.textMuted,display:"block",marginBottom:5,marginTop:14,fontFamily:"'DM Sans',sans-serif" };
  const card  = (x={})=>({ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, boxShadow:"0 2px 8px rgba(0,0,0,0.06)", ...x });

  function ItemForm({ data, setData, onSave, onClose, title }) {
    const ref = useRef(null);
    useEffect(()=>{ const t=setTimeout(()=>{ if(ref.current) ref.current.focus(); },80); return()=>clearTimeout(t); },[]);
    return (
      <div style={{ position:"fixed",inset:0,zIndex:40,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center" }}
        onClick={e=>e.target===e.currentTarget&&onClose()}>
        <div style={{ ...card(), borderRadius:"18px 18px 0 0", width:"100%", maxWidth:520, maxHeight:"92vh", overflowY:"auto", padding:"24px 20px 36px" }}>
          <div style={{ width:40,height:4,borderRadius:2,background:T.textMuted,margin:"0 auto 20px",opacity:0.4 }}/>
          <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:22,color:T.text,marginBottom:4 }}>{title}</div>
          <div style={{ height:2,width:40,background:"#3B9EDB",borderRadius:2,marginBottom:20 }}/>
          <label style={lblSt}>Name / Title</label>
          <input ref={ref} style={inpSt} value={data.title} onChange={e=>setData(p=>({...p,title:e.target.value}))} placeholder="e.g. MIT PhD Program, OPT Application..." onKeyDown={e=>{ if(e.key==="Enter"&&data.title.trim()){e.preventDefault();onSave();}}}/>
          <label style={lblSt}>URL / Link (optional)</label>
          <input style={inpSt} type="url" value={data.url||""} onChange={e=>setData(p=>({...p,url:e.target.value}))} placeholder="https://..."/>
          <label style={lblSt}>Category</label>
          <select style={selSt} value={data.category} onChange={e=>setData(p=>({...p,category:e.target.value}))}>
            {TRACKER_CATS.map(c=><option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
          </select>
          <label style={lblSt}>Status</label>
          <select style={selSt} value={data.status} onChange={e=>setData(p=>({...p,status:e.target.value}))}>
            {TRACKER_STATUS.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <label style={lblSt}>Deadline (optional)</label>
          <input type="date" style={selSt} value={data.deadline||""} onChange={e=>setData(p=>({...p,deadline:e.target.value}))}/>
          <label style={lblSt}>Initial Notes (optional)</label>
          <textarea style={{...inpSt,minHeight:70,resize:"vertical"}} value={data.notes_text||""} onChange={e=>setData(p=>({...p,notes_text:e.target.value}))} placeholder="Any details to start with..."/>
          <div style={{ display:"flex",gap:10,marginTop:24,justifyContent:"flex-end" }}>
            <button style={{ padding:"9px 20px",borderRadius:9,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,background:T.inputBg,color:T.textSub }} onClick={onClose}>Cancel</button>
            <button style={{ padding:"9px 20px",borderRadius:9,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,background:"#3B9EDB",color:"#fff" }} onClick={onSave}>Save</button>
          </div>
        </div>
      </div>
    );
  }

  if (items===null) return <div style={{ padding:"40px",textAlign:"center",color:T.textMuted,fontFamily:"'DM Sans',sans-serif" }}>Loading...</div>;

  return (
    <div style={{ padding:"24px 16px", maxWidth:860, margin:"0 auto" }}>
      <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginBottom:16 }}>
        <div>
          <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:28,color:T.text }}>🔗 Tracker</div>
          <div style={{ fontSize:13,color:T.textSub,marginTop:3 }}>Track applications, links, and their progress</div>
        </div>
        <button onClick={()=>setShowAdd(true)} style={{ height:36,padding:"0 16px",borderRadius:9,border:"none",background:"#3B9EDB",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,color:"#fff",whiteSpace:"nowrap" }}>+ Add Item</button>
      </div>

      {/* Stats */}
      <div className="stats-row" style={{ marginBottom:16 }}>
        {[{l:"Total",v:items.length,c:"#3B9EDB"},{l:"Accepted",v:items.filter(i=>i.status==="accepted").length,c:"#3DBF8A"},{l:"Waiting",v:items.filter(i=>["waiting","applied","interview"].includes(i.status)).length,c:"#E8A838"},{l:"Rejected",v:items.filter(i=>i.status==="rejected").length,c:"#E84E8A"}].map(s=>(
          <div key={s.l} style={{ ...card({padding:"12px 16px",flex:"1 1 90px",borderLeft:`3px solid ${s.c}`}) }}>
            <div style={{ fontSize:22,fontWeight:700,color:T.text,lineHeight:1 }}>{s.v}</div>
            <div style={{ fontSize:10,fontWeight:600,color:T.textSub,marginTop:3,textTransform:"uppercase",letterSpacing:"0.08em" }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="pill-scroll" style={{ marginBottom:14 }}>
        <button onClick={()=>{setCatFilter(null);setStFilter(null);}} style={{ padding:"4px 12px",borderRadius:20,cursor:"pointer",fontSize:12,border:"none",background:!catFilter&&!stFilter?"#3B9EDB":"transparent",color:!catFilter&&!stFilter?"#fff":T.textSub,outline:!catFilter&&!stFilter?"none":`1px solid ${T.border}`,flexShrink:0,fontFamily:"'DM Sans',sans-serif",fontWeight:500 }}>All</button>
        {TRACKER_CATS.map(cat=>(
          <button key={cat.id} onClick={()=>setCatFilter(catFilter===cat.id?null:cat.id)} style={{ padding:"4px 12px",borderRadius:20,cursor:"pointer",fontSize:12,border:"none",background:catFilter===cat.id?cat.color:"transparent",color:catFilter===cat.id?"#fff":T.textSub,outline:catFilter===cat.id?"none":`1px solid ${T.border}`,flexShrink:0,fontFamily:"'DM Sans',sans-serif",fontWeight:500,whiteSpace:"nowrap" }}>{cat.emoji} {cat.label}</button>
        ))}
        <div style={{ width:1,height:20,background:T.border,flexShrink:0,alignSelf:"center" }}/>
        {TRACKER_STATUS.map(st=>(
          <button key={st.id} onClick={()=>setStFilter(stFilter===st.id?null:st.id)} style={{ padding:"4px 12px",borderRadius:20,cursor:"pointer",fontSize:12,border:"none",background:stFilter===st.id?st.color+"33":"transparent",color:stFilter===st.id?st.color:T.textSub,outline:stFilter===st.id?`1px solid ${st.color}66`:`1px solid ${T.border}`,flexShrink:0,fontFamily:"'DM Sans',sans-serif",fontWeight:stFilter===st.id?700:500,whiteSpace:"nowrap" }}>{st.label}</button>
        ))}
      </div>

      {/* Items */}
      {filtered.length===0 ? (
        <div style={{ ...card({padding:"50px 20px",textAlign:"center"}) }}>
          <div style={{ fontSize:36,marginBottom:10 }}>🔗</div>
          <div style={{ fontSize:17,fontWeight:600,color:T.text,fontFamily:"'DM Serif Display',serif" }}>Nothing tracked yet</div>
          <div style={{ fontSize:13,color:T.textSub,marginTop:6 }}>Add PhD programs, OPT applications, jobs — anything you want to follow.</div>
        </div>
      ) : (
        <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
          {filtered.map(item=>{
            const cat = catOf(item.category);
            const st  = stOf(item.status);
            const isExp = expandedNotes[item.id];
            const deadline = item.deadline ? (() => { const d=new Date(item.deadline+"T00:00:00"); const diff=Math.ceil((d-new Date())/86400000); return {label:diff<0?`${Math.abs(diff)}d overdue`:diff===0?"Today":diff===1?"Tomorrow":`${diff}d left`,color:diff<0?"#E84E8A":diff<=3?"#E8A838":"#3DBF8A"}; })() : null;
            return (
              <div key={item.id} style={{ ...card({padding:"16px 18px"}), borderLeft:`3px solid ${cat.color}` }}>
                <div style={{ display:"flex",alignItems:"flex-start",gap:10 }}>
                  <div style={{ width:34,height:34,borderRadius:10,background:cat.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0 }}>{cat.emoji}</div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:4 }}>
                      <span style={{ fontSize:15,fontWeight:700,color:T.text,fontFamily:"'DM Sans',sans-serif" }}>{item.title}</span>
                      {item.url && <a href={item.url} target="_blank" rel="noreferrer" style={{ fontSize:11,color:"#3B9EDB",textDecoration:"none",padding:"1px 7px",borderRadius:5,border:"1px solid #3B9EDB44",background:"#3B9EDB11" }}>↗ Open</a>}
                    </div>
                    <div style={{ display:"flex",gap:6,flexWrap:"wrap",alignItems:"center" }}>
                      {/* Status selector */}
                      <select value={item.status} onChange={e=>updateStatus(item.id,e.target.value)} style={{ fontSize:11,padding:"2px 8px",borderRadius:6,border:`1px solid ${st.color}44`,background:st.color+"18",color:st.color,cursor:"pointer",fontWeight:700,fontFamily:"'DM Sans',sans-serif",outline:"none" }}>
                        {TRACKER_STATUS.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
                      </select>
                      <span style={{ fontSize:10,padding:"2px 7px",borderRadius:5,background:cat.color+"20",color:cat.color,fontWeight:600,fontFamily:"'DM Sans',sans-serif" }}>{cat.emoji} {cat.label}</span>
                      {deadline && <span style={{ fontSize:10,padding:"2px 7px",borderRadius:5,background:deadline.color+"20",color:deadline.color,fontWeight:700 }}>📅 {deadline.label}</span>}
                      <span style={{ fontSize:10,color:T.textMuted }}>{(item.notes||[]).length} update{(item.notes||[]).length!==1?"s":""}</span>
                    </div>
                  </div>
                  <div style={{ display:"flex",gap:2,flexShrink:0 }}>
                    <button onClick={()=>setEditItem({...item})} style={{ background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:13,padding:"3px 5px",borderRadius:4 }}>✎</button>
                    <button onClick={()=>deleteItem(item.id)} style={{ background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:13,padding:"3px 5px",borderRadius:4 }}>✕</button>
                  </div>
                </div>

                {/* Expand button */}
                <button onClick={()=>setExpandedNotes(p=>({...p,[item.id]:!p[item.id]}))} style={{ width:"100%",marginTop:10,fontSize:12,color:"#3B9EDB",background:"none",border:`1px solid #3B9EDB44`,borderRadius:8,padding:"5px 12px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600 }}>
                  {isExp ? "▲ Hide updates" : `▼ Updates & notes`}
                </button>

                {/* Updates section */}
                {isExp && (
                  <div style={{ marginTop:12 }}>
                    {(item.notes||[]).length===0 && <div style={{ fontSize:12,color:T.textMuted,fontStyle:"italic",marginBottom:10 }}>No updates yet. Add your first one below.</div>}
                    {(item.notes||[]).map(note=>(
                      <div key={note.id} style={{ display:"flex",gap:8,alignItems:"flex-start",marginBottom:8,padding:"10px 12px",background:T.inputBg,borderRadius:9 }}>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:13,color:T.text,lineHeight:1.5,whiteSpace:"pre-wrap",fontFamily:"'DM Sans',sans-serif" }}>{note.text}</div>
                          <div style={{ fontSize:10,color:T.textMuted,marginTop:3 }}>{note.at} · {names[note.by]||note.by}</div>
                        </div>
                        <button onClick={()=>deleteNote(item.id,note.id)} style={{ background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:12,padding:"2px 4px",borderRadius:4,flexShrink:0 }}>✕</button>
                      </div>
                    ))}
                    {/* Add update */}
                    <div style={{ display:"flex",gap:8,marginTop:6 }}>
                      <textarea value={newNote[item.id]||""} onChange={e=>setNewNote(p=>({...p,[item.id]:e.target.value}))} placeholder="Add an update..." style={{ flex:1,background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:9,padding:"8px 12px",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:13,outline:"none",resize:"none",minHeight:36 }} rows={2}/>
                      <button onClick={()=>addNote(item.id)} style={{ padding:"0 14px",borderRadius:9,border:"none",background:"#3B9EDB",color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,flexShrink:0 }}>+ Add</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showAdd && <ItemForm data={newItem} setData={setNewItem} onSave={addItem} onClose={()=>setShowAdd(false)} title="New Tracker Item"/>}
      {editItem && <ItemForm data={editItem} setData={setEditItem} onSave={saveEdit} onClose={()=>setEditItem(null)} title="Edit Item"/>}
    </div>
  );
}

// ── CookbookView ──────────────────────────────────────────────────────────────
const MEAL_CATS = [
  { id:"breakfast",label:"Breakfast", emoji:"🍳", color:"#E8A838" },
  { id:"lunch",    label:"Lunch",     emoji:"🥗", color:"#3DBF8A" },
  { id:"dinner",   label:"Dinner",    emoji:"🍽️", color:"#E84E8A" },
  { id:"snacks",   label:"Snacks",    emoji:"🍎", color:"#E8883A" },
  { id:"drinks",   label:"Drinks",    emoji:"🥤", color:"#3B9EDB" },
  { id:"dessert",  label:"Dessert",   emoji:"🍰", color:"#9B6EE8" },
  { id:"other",    label:"Other",     emoji:"🍴", color:"#C8B030" },
];

function CookbookView({ activeUser, names, T, mode, TODAY, genId }) {
  const [recipes,   setRecipesState] = useState(null);
  const [catFilter, setCatFilter]    = useState(null);
  const [search,    setSearch]       = useState("");
  const [showAdd,   setShowAdd]      = useState(false);
  const [editRecipe,setEditRecipe]   = useState(null);
  const [expanded,  setExpanded]     = useState({});
  const blank = { title:"", category:"dinner", ingredients:"", steps:"", notes:"", servings:"", time:"", url:"" };
  const [newRecipe, setNew] = useState({...blank});

  useEffect(()=>{ (async()=>{ const s=await dbGet("cookbook"); setRecipesState(s??[]); })(); },[]);
  function save(list) { setRecipesState(list); dbSet("cookbook",list); }
  function addRecipe() {
    if (!newRecipe.title.trim()) return;
    save([...(recipes||[]), { ...newRecipe, id:genId(), createdBy:activeUser||"A", createdAt:TODAY }]);
    setNew({...blank}); setShowAdd(false);
  }
  function saveEdit() { save((recipes||[]).map(r=>r.id===editRecipe.id?editRecipe:r)); setEditRecipe(null); }
  function deleteRecipe(id) { save((recipes||[]).filter(r=>r.id!==id)); }

  const filtered = (recipes||[]).filter(r=> (!catFilter||r.category===catFilter) && (!search||r.title.toLowerCase().includes(search.toLowerCase())||r.ingredients?.toLowerCase().includes(search.toLowerCase())));
  const catOf = id => MEAL_CATS.find(c=>c.id===id)||MEAL_CATS[0];
  const inpSt = { width:"100%", background:T.inputBg, border:`1px solid ${T.border}`, borderRadius:9, padding:"10px 13px", color:T.text, fontFamily:"'DM Sans',sans-serif", fontSize:14, outline:"none", boxSizing:"border-box" };
  const selSt = { ...inpSt, background:mode==="dark"?"#181B23":"#fff", cursor:"pointer" };
  const lblSt = { fontSize:11,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",color:T.textMuted,display:"block",marginBottom:5,marginTop:14,fontFamily:"'DM Sans',sans-serif" };
  const card  = (x={})=>({ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, boxShadow:"0 2px 8px rgba(0,0,0,0.06)", ...x });

  function RecipeForm({ data, setData, onSave, onClose, title }) {
    const ref = useRef(null);
    useEffect(()=>{ const t=setTimeout(()=>{ if(ref.current) ref.current.focus(); },80); return()=>clearTimeout(t); },[]);
    return (
      <div style={{ position:"fixed",inset:0,zIndex:40,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center" }}
        onClick={e=>e.target===e.currentTarget&&onClose()}>
        <div style={{ ...card(), borderRadius:"18px 18px 0 0", width:"100%", maxWidth:560, maxHeight:"94vh", overflowY:"auto", padding:"24px 20px 36px" }}>
          <div style={{ width:40,height:4,borderRadius:2,background:T.textMuted,margin:"0 auto 20px",opacity:0.4 }}/>
          <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:22,color:T.text,marginBottom:4 }}>{title}</div>
          <div style={{ height:2,width:40,background:"#E84E8A",borderRadius:2,marginBottom:20 }}/>
          <label style={lblSt}>Recipe Name</label>
          <input ref={ref} style={inpSt} value={data.title} onChange={e=>setData(p=>({...p,title:e.target.value}))} placeholder="e.g. Jollof Rice, Pasta Carbonara..." onKeyDown={e=>{ if(e.key==="Enter"&&data.title.trim()){e.preventDefault();onSave();}}}/>
          <label style={lblSt}>Category</label>
          <select style={selSt} value={data.category} onChange={e=>setData(p=>({...p,category:e.target.value}))}>
            {MEAL_CATS.map(c=><option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
          </select>
          <div style={{ display:"flex",gap:10 }}>
            <div style={{ flex:1 }}>
              <label style={lblSt}>Servings</label>
              <input style={inpSt} value={data.servings||""} onChange={e=>setData(p=>({...p,servings:e.target.value}))} placeholder="e.g. 2-4"/>
            </div>
            <div style={{ flex:1 }}>
              <label style={lblSt}>Time</label>
              <input style={inpSt} value={data.time||""} onChange={e=>setData(p=>({...p,time:e.target.value}))} placeholder="e.g. 45 mins"/>
            </div>
          </div>
          <label style={lblSt}>Ingredients (one per line)</label>
          <textarea style={{...inpSt,minHeight:100,resize:"vertical"}} value={data.ingredients||""} onChange={e=>setData(p=>({...p,ingredients:e.target.value}))} placeholder={"- 2 cups rice- 1 can tomatoes- 1 onion..."}/>
          <label style={lblSt}>Steps / Method</label>
          <textarea style={{...inpSt,minHeight:120,resize:"vertical"}} value={data.steps||""} onChange={e=>setData(p=>({...p,steps:e.target.value}))} placeholder={"1. Boil water2. Add rice3. ..."}/>
          <label style={lblSt}>Notes & Tips (optional)</label>
          <textarea style={{...inpSt,minHeight:60,resize:"vertical"}} value={data.notes||""} onChange={e=>setData(p=>({...p,notes:e.target.value}))} placeholder="Any tips, substitutions, or variations..."/>
          <label style={lblSt}>Source / Recipe URL (optional)</label>
          <input style={inpSt} type="url" value={data.url||""} onChange={e=>setData(p=>({...p,url:e.target.value}))} placeholder="https://..."/>
          <div style={{ display:"flex",gap:10,marginTop:24,justifyContent:"flex-end" }}>
            <button style={{ padding:"9px 20px",borderRadius:9,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,background:T.inputBg,color:T.textSub }} onClick={onClose}>Cancel</button>
            <button style={{ padding:"9px 20px",borderRadius:9,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,background:"#E84E8A",color:"#fff" }} onClick={onSave}>Save Recipe</button>
          </div>
        </div>
      </div>
    );
  }

  if (recipes===null) return <div style={{ padding:"40px",textAlign:"center",color:T.textMuted,fontFamily:"'DM Sans',sans-serif" }}>Loading...</div>;

  return (
    <div style={{ padding:"24px 16px", maxWidth:860, margin:"0 auto" }}>
      <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginBottom:16 }}>
        <div>
          <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:28,color:T.text }}>🍳 Cookbook</div>
          <div style={{ fontSize:13,color:T.textSub,marginTop:3 }}>Your shared recipe collection — meals you love and want to remember</div>
        </div>
        <button onClick={()=>setShowAdd(true)} style={{ height:36,padding:"0 16px",borderRadius:9,border:"none",background:"#E84E8A",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,color:"#fff",whiteSpace:"nowrap" }}>+ Add Recipe</button>
      </div>

      {/* Search */}
      <input style={{ ...inpSt, marginBottom:14 }} value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search recipes or ingredients..."/>

      {/* Category pills */}
      <div className="pill-scroll" style={{ marginBottom:16 }}>
        <button onClick={()=>setCatFilter(null)} style={{ padding:"4px 12px",borderRadius:20,cursor:"pointer",fontSize:12,border:"none",background:!catFilter?"#E84E8A":"transparent",color:!catFilter?"#fff":T.textSub,outline:!catFilter?"none":`1px solid ${T.border}`,flexShrink:0,fontFamily:"'DM Sans',sans-serif",fontWeight:500 }}>All</button>
        {MEAL_CATS.map(cat=>(
          <button key={cat.id} onClick={()=>setCatFilter(catFilter===cat.id?null:cat.id)} style={{ padding:"4px 12px",borderRadius:20,cursor:"pointer",fontSize:12,border:"none",background:catFilter===cat.id?cat.color:"transparent",color:catFilter===cat.id?"#fff":T.textSub,outline:catFilter===cat.id?"none":`1px solid ${T.border}`,flexShrink:0,fontFamily:"'DM Sans',sans-serif",fontWeight:500,whiteSpace:"nowrap" }}>{cat.emoji} {cat.label}</button>
        ))}
      </div>

      {/* Recipe grid */}
      {filtered.length===0 ? (
        <div style={{ ...card({padding:"50px 20px",textAlign:"center"}) }}>
          <div style={{ fontSize:36,marginBottom:10 }}>🍳</div>
          <div style={{ fontSize:17,fontWeight:600,color:T.text,fontFamily:"'DM Serif Display',serif" }}>{search?"No recipes match your search":"No recipes yet"}</div>
          <div style={{ fontSize:13,color:T.textSub,marginTop:6 }}>Start building your cookbook together!</div>
        </div>
      ) : (
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,340px),1fr))",gap:14 }}>
          {filtered.map(recipe=>{
            const cat  = catOf(recipe.category);
            const isExp= expanded[recipe.id];
            const ingredients = (recipe.ingredients||"").split("").filter(l=>l.trim());
            const steps = (recipe.steps||"").split("").filter(l=>l.trim());
            return (
              <div key={recipe.id} style={{ ...card({padding:"0",overflow:"hidden"}), borderTop:`3px solid ${cat.color}` }}>
                {/* Recipe card header */}
                <div style={{ padding:"16px 18px 12px" }}>
                  <div style={{ display:"flex",alignItems:"flex-start",gap:10 }}>
                    <div style={{ width:36,height:36,borderRadius:10,background:cat.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>{cat.emoji}</div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ fontSize:16,fontWeight:700,color:T.text,fontFamily:"'DM Sans',sans-serif",lineHeight:1.3 }}>{recipe.title}</div>
                      <div style={{ display:"flex",gap:6,marginTop:5,flexWrap:"wrap" }}>
                        <span style={{ fontSize:10,padding:"2px 7px",borderRadius:5,background:cat.color+"20",color:cat.color,fontWeight:600 }}>{cat.emoji} {cat.label}</span>
                        {recipe.time && <span style={{ fontSize:10,padding:"2px 7px",borderRadius:5,background:T.inputBg,color:T.textSub }}>⏱ {recipe.time}</span>}
                        {recipe.servings && <span style={{ fontSize:10,padding:"2px 7px",borderRadius:5,background:T.inputBg,color:T.textSub }}>👥 {recipe.servings}</span>}
                        {recipe.url && <a href={recipe.url} target="_blank" rel="noreferrer" style={{ fontSize:10,padding:"2px 7px",borderRadius:5,background:"#3B9EDB11",border:"1px solid #3B9EDB44",color:"#3B9EDB",textDecoration:"none" }}>↗ Source</a>}
                      </div>
                      <div style={{ fontSize:11,color:T.textMuted,marginTop:4 }}>By {names[recipe.createdBy]||recipe.createdBy} · {recipe.createdAt}</div>
                    </div>
                    <div style={{ display:"flex",gap:2,flexShrink:0 }}>
                      <button onClick={()=>setEditRecipe({...recipe})} style={{ background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:13,padding:"3px 5px" }}>✎</button>
                      <button onClick={()=>deleteRecipe(recipe.id)} style={{ background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:13,padding:"3px 5px" }}>✕</button>
                    </div>
                  </div>
                </div>

                {/* Quick preview */}
                {!isExp && ingredients.length>0 && (
                  <div style={{ padding:"0 18px 12px" }}>
                    <div style={{ fontSize:11,fontWeight:700,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4 }}>Ingredients preview</div>
                    <div style={{ fontSize:12,color:T.textSub }}>{ingredients.slice(0,3).join(" · ")}{ingredients.length>3?` + ${ingredients.length-3} more`:""}...</div>
                  </div>
                )}

                <button onClick={()=>setExpanded(p=>({...p,[recipe.id]:!p[recipe.id]}))} style={{ width:"100%",padding:"10px",border:"none",borderTop:`1px solid ${T.border}`,background:isExp?cat.color+"15":"transparent",color:cat.color,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,cursor:"pointer" }}>
                  {isExp?"▲ Close recipe":"▼ View full recipe"}
                </button>

                {isExp && (
                  <div style={{ padding:"16px 18px 18px",borderTop:`1px solid ${T.border}` }}>
                    {ingredients.length>0 && (
                      <div style={{ marginBottom:16 }}>
                        <div style={{ fontSize:12,fontWeight:700,color:cat.color,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8 }}>🛒 Ingredients</div>
                        <div style={{ display:"flex",flexDirection:"column",gap:4 }}>
                          {ingredients.map((ing,i)=>(
                            <div key={i} style={{ display:"flex",alignItems:"flex-start",gap:8,fontSize:13,color:T.text,fontFamily:"'DM Sans',sans-serif" }}>
                              <span style={{ color:cat.color,flexShrink:0,marginTop:1 }}>•</span>
                              <span>{ing.replace(/^[-•*\s]*/,"")}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {steps.length>0 && (
                      <div style={{ marginBottom:recipe.notes?16:0 }}>
                        <div style={{ fontSize:12,fontWeight:700,color:cat.color,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8 }}>👨‍🍳 Method</div>
                        <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                          {steps.map((step,i)=>(
                            <div key={i} style={{ display:"flex",gap:10,fontSize:13,color:T.text,fontFamily:"'DM Sans',sans-serif" }}>
                              <span style={{ width:22,height:22,borderRadius:"50%",background:cat.color+"22",color:cat.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0 }}>{i+1}</span>
                              <span style={{ lineHeight:1.5,paddingTop:2 }}>{step.replace(/^\d+[.)]\ */,"")}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {recipe.notes && (
                      <div style={{ marginTop:12,padding:"10px 12px",background:T.inputBg,borderRadius:9,border:`1px solid ${cat.color}33` }}>
                        <div style={{ fontSize:11,fontWeight:700,color:cat.color,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4 }}>💡 Notes & Tips</div>
                        <div style={{ fontSize:13,color:T.text,lineHeight:1.6,whiteSpace:"pre-wrap",fontFamily:"'DM Sans',sans-serif" }}>{recipe.notes}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showAdd && <RecipeForm data={newRecipe} setData={setNew} onSave={addRecipe} onClose={()=>setShowAdd(false)} title="New Recipe"/>}
      {editRecipe && <RecipeForm data={editRecipe} setData={setEditRecipe} onSave={saveEdit} onClose={()=>setEditRecipe(null)} title="Edit Recipe"/>}
    </div>
  );
}

// ── PrayerView — standalone prayer requests board ────────────────────────────
function PrayerView({ tasks, setTasks, names, activeUser, T, mode, aColor, aLabel, TODAY, genId, toasts, setToasts, SECTIONS }) {
  // showAdd is managed internally below
  const [prayers, setPrayersState] = useState(null);
  const [showForm, setShowForm]   = useState(false);
  const [editPrayer, setEditPrayer] = useState(null);
  const [newPrayer, setNewPrayer]  = useState({ title:"", body:"", assignee:"both", answered:false });
  const titleRef = useRef(null);

  useEffect(() => {
    (async () => {
      const stored = await dbGet("prayers");
      setPrayersState(stored ?? []);
    })();
  }, []);

  function savePrayers(list) {
    setPrayersState(list);
    dbSet("prayers", list);
  }

  function addPrayer() {
    if (!newPrayer.title.trim()) return;
    const p = { ...newPrayer, id: genId(), createdAt: TODAY, answeredAt: "", createdBy: activeUser };
    savePrayers([...(prayers||[]), p]);
    setNewPrayer({ title:"", body:"", assignee:"both", answered:false });
    setShowForm(false);
  }

  function toggleAnswered(id) {
    savePrayers((prayers||[]).map(p => p.id===id ? { ...p, answered:!p.answered, answeredAt:!p.answered?TODAY:"" } : p));
  }

  function deletePrayer(id) { savePrayers((prayers||[]).filter(p=>p.id!==id)); }

  function saveEdit() {
    savePrayers((prayers||[]).map(p=>p.id===editPrayer.id?editPrayer:p));
    setEditPrayer(null);
  }

  const aColor2 = a => a==="A"?"#E8A838":a==="B"?"#E84E8A":"#3DBF8A";
  const aLabel2 = a => a==="both"?`${names.A} & ${names.B}`:names[a]||a;
  const cardBase = (x={}) => ({ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, boxShadow:"0 2px 8px rgba(0,0,0,0.1)", ...x });
  const inpStyle = { width:"100%", background:T.inputBg, border:`1px solid ${T.border}`, borderRadius:9, padding:"10px 13px", color:T.text, fontFamily:"'DM Sans',sans-serif", fontSize:14, outline:"none", boxSizing:"border-box" };
  const lblStyle = { fontSize:11, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", color:T.textMuted, display:"block", marginBottom:5, marginTop:14, fontFamily:"'DM Sans',sans-serif" };
  const btnStyle = p => ({ padding:"9px 20px", borderRadius:9, border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600, background:p?T.accent:T.inputBg, color:p?T.accentFg:T.textSub });

  const open   = (prayers||[]).filter(p=>!p.answered);
  const answered = (prayers||[]).filter(p=>p.answered);

  function PrayerForm({ data, setData, onSave, onClose, title }) {
    const ref = useRef(null);
    useEffect(() => { const t = setTimeout(()=>{ if(ref.current) ref.current.focus(); },80); return ()=>clearTimeout(t); }, []);
    return (
      <div style={{ position:"fixed",inset:0,zIndex:40,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center" }}
        onClick={e=>e.target===e.currentTarget&&onClose()}>
        <div style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:"18px 18px 0 0",width:"100%",maxWidth:520,maxHeight:"90vh",overflowY:"auto",padding:"24px 20px 36px" }}>
          <div style={{ width:40,height:4,borderRadius:2,background:T.textMuted,margin:"0 auto 20px",opacity:0.4 }}/>
          <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:22,color:T.text,marginBottom:4 }}>{title}</div>
          <div style={{ height:2,width:40,background:"#9B6EE8",borderRadius:2,marginBottom:20 }}/>
          <label style={lblStyle}>Prayer Title</label>
          <input ref={ref} style={inpStyle} value={data.title} onChange={e=>setData(p=>({...p,title:e.target.value}))}
            onKeyDown={e=>{ if(e.key==="Enter"&&data.title.trim()){e.preventDefault();onSave();}}}
            placeholder="What are you praying for? (Enter to save)"/>
          <label style={lblStyle}>Details (optional)</label>
          <textarea style={{...inpStyle,minHeight:80,resize:"vertical"}} value={data.body} onChange={e=>setData(p=>({...p,body:e.target.value}))} placeholder="Share more details..."/>
          <label style={lblStyle}>For</label>
          <select style={{...inpStyle,background:mode==="dark"?"#181B23":"#fff",cursor:"pointer"}} value={data.assignee} onChange={e=>setData(p=>({...p,assignee:e.target.value}))}>
            <option value="A">{names.A}</option>
            <option value="B">{names.B}</option>
            <option value="both">{names.A} & {names.B}</option>
          </select>
          <div style={{ display:"flex",gap:10,marginTop:24,justifyContent:"flex-end" }}>
            <button style={btnStyle(false)} onClick={onClose}>Cancel</button>
            <button style={btnStyle(true)} onClick={onSave}>Save</button>
          </div>
        </div>
      </div>
    );
  }

  if (prayers === null) return (
    <div style={{ padding:"40px 16px",textAlign:"center",color:T.textMuted,fontFamily:"'DM Sans',sans-serif" }}>Loading prayers...</div>
  );

  return (
    <div style={{ padding:"24px 16px",maxWidth:780,margin:"0 auto" }}>
      {/* Header */}
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6,flexWrap:"wrap",gap:10 }}>
        <div>
          <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:28,color:T.text }}>🙏 Prayer Requests</div>
          <div style={{ fontSize:13,color:T.textSub,marginTop:3 }}>Bring your requests before God together</div>
        </div>
        <button onClick={()=>setShowForm(true)} style={{ height:36,padding:"0 16px",borderRadius:9,border:"none",background:"#9B6EE8",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,color:"#fff",whiteSpace:"nowrap" }}>
          + Add Prayer
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:"flex",gap:8,margin:"20px 0",flexWrap:"wrap" }}>
        {[{l:"Open",v:open.length,c:"#9B6EE8"},{l:"Answered 🙌",v:answered.length,c:"#3DBF8A"},{l:"Total",v:prayers.length,c:"#E8A838"}].map(s=>(
          <div key={s.l} style={cardBase({padding:"12px 16px",flex:"1 1 90px",borderLeft:`3px solid ${s.c}`})}>
            <div style={{fontSize:22,fontWeight:700,color:T.text,lineHeight:1}}>{s.v}</div>
            <div style={{fontSize:10,fontWeight:600,color:T.textSub,marginTop:3,textTransform:"uppercase",letterSpacing:"0.08em"}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Open requests */}
      {open.length>0&&(
        <div style={{marginBottom:28}}>
          <div style={{fontSize:12,fontWeight:700,color:"#9B6EE8",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:"#9B6EE8"}}/>
            Open Requests · {open.length}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {open.map(p=>(
              <div key={p.id} style={cardBase({padding:"16px",borderLeft:"3px solid #9B6EE8"})}>
                <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                  {/* Answered checkbox */}
                  <div onClick={()=>toggleAnswered(p.id)} title="Mark as answered" style={{width:22,height:22,borderRadius:6,border:"2px solid #9B6EE855",background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,marginTop:1,transition:"all 0.15s"}}>
                    <span style={{fontSize:12,color:"#9B6EE8"}}>🙏</span>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:15,fontWeight:600,color:T.text,fontFamily:"'DM Sans',sans-serif",lineHeight:1.3,marginBottom:4}}>{p.title}</div>
                    {p.body&&<div style={{fontSize:13,color:T.textSub,lineHeight:1.5,marginBottom:6}}>{p.body}</div>}
                    <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
                      <span style={{fontSize:10,padding:"2px 7px",borderRadius:5,background:aColor2(p.assignee)+"20",color:aColor2(p.assignee),fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>For {aLabel2(p.assignee)}</span>
                      {p.createdBy&&<span style={{fontSize:10,padding:"2px 7px",borderRadius:5,background:aColor2(p.createdBy)+"15",color:aColor2(p.createdBy),fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>By {names[p.createdBy]||p.createdBy}</span>}
                      <span style={{fontSize:10,color:T.textMuted}}>Added {p.createdAt}</span>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:2,flexShrink:0}}>
                    <button onClick={()=>setEditPrayer({...p})} style={{background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:13,padding:"3px 5px",borderRadius:4}}>✎</button>
                    <button onClick={()=>deletePrayer(p.id)} style={{background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:13,padding:"3px 5px",borderRadius:4}}>✕</button>
                  </div>
                </div>
                <div style={{marginTop:10}}>
                  <button onClick={()=>toggleAnswered(p.id)} style={{fontSize:11,padding:"5px 12px",borderRadius:8,border:"1px solid #3DBF8A44",background:"#3DBF8A12",color:"#3DBF8A",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>
                    ✓ Mark Answered
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Answered */}
      {answered.length>0&&(
        <div>
          <div style={{fontSize:12,fontWeight:700,color:"#3DBF8A",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:"#3DBF8A"}}/>
            Answered Prayers 🙌 · {answered.length}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {answered.map(p=>(
              <div key={p.id} style={cardBase({padding:"16px",borderLeft:"3px solid #3DBF8A",opacity:0.75})}>
                <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                  <div style={{width:22,height:22,borderRadius:6,background:"#3DBF8A22",border:"2px solid #3DBF8A",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                    <span style={{fontSize:12}}>✓</span>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:15,fontWeight:600,color:T.textSub,textDecoration:"line-through",fontFamily:"'DM Sans',sans-serif",lineHeight:1.3,marginBottom:4}}>{p.title}</div>
                    {p.body&&<div style={{fontSize:13,color:T.textMuted,lineHeight:1.5,marginBottom:6}}>{p.body}</div>}
                    <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
                      <span style={{fontSize:10,padding:"2px 7px",borderRadius:5,background:"#3DBF8A20",color:"#3DBF8A",fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>Answered {p.answeredAt||""}</span>
                      <span style={{fontSize:10,color:T.textMuted}}>Added {p.createdAt}</span>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:2,flexShrink:0}}>
                    <button onClick={()=>toggleAnswered(p.id)} title="Reopen" style={{background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:11,padding:"3px 5px",borderRadius:4}}>↩</button>
                    <button onClick={()=>deletePrayer(p.id)} style={{background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:13,padding:"3px 5px",borderRadius:4}}>✕</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {prayers.length===0&&(
        <div style={cardBase({padding:"60px 20px",textAlign:"center"})}>
          <div style={{fontSize:40,marginBottom:12}}>🙏</div>
          <div style={{fontSize:17,fontWeight:600,color:T.text,fontFamily:"'DM Serif Display',serif"}}>No prayer requests yet</div>
          <div style={{fontSize:13,color:T.textSub,marginTop:6}}>Add your first prayer request above.</div>
        </div>
      )}

      {showForm&&<PrayerForm data={newPrayer} setData={setNewPrayer} onSave={addPrayer} onClose={()=>setShowForm(false)} title="New Prayer Request"/>}
      {editPrayer&&<PrayerForm data={editPrayer} setData={setEditPrayer} onSave={saveEdit} onClose={()=>setEditPrayer(null)} title="Edit Prayer Request"/>}
    </div>
  );
}

// ── FormModal — defined OUTSIDE TogetherApp so it never remounts on parent re-render ──
// This is the fix for the autofocus stealing bug. When FormModal was defined
// inside TogetherApp, every keystroke caused a full remount, re-triggering autoFocus.
function FormModal({ data, setData, onSave, onClose, title, names, sections, taskTypes, priorities, T, mode }) {
  const titleRef = useRef(null);

  // Focus title input only on first mount — not on every re-render
  useEffect(() => {
    const t = setTimeout(() => { if (titleRef.current) titleRef.current.focus(); }, 80);
    return () => clearTimeout(t);
  }, []); // empty deps = runs once on mount only

  const inpStyle = { width:"100%", background:T.inputBg, border:`1px solid ${T.border}`, borderRadius:9, padding:"10px 13px", color:T.text, fontFamily:"'DM Sans',sans-serif", fontSize:15, outline:"none", boxSizing:"border-box" };
  const selStyle = { ...inpStyle, background:mode==="dark"?"#181B23":"#fff", cursor:"pointer" };
  const lblStyle = { fontSize:11, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", color:T.textMuted, display:"block", marginBottom:5, marginTop:14, fontFamily:"'DM Sans',sans-serif" };
  const btnStyle = p => ({ padding:"10px 20px", borderRadius:9, border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600, background:p?T.accent:T.inputBg, color:p?T.accentFg:T.textSub, transition:"all 0.15s" });

  return (
    <div style={{ position:"fixed",inset:0,zIndex:40,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"0" }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:"18px 18px 0 0", boxShadow:"0 -4px 32px rgba(0,0,0,0.3)", width:"100%", maxWidth:520, maxHeight:"92vh", overflowY:"auto", padding:"24px 20px 36px" }}>
        <div style={{ width:40,height:4,borderRadius:2,background:T.textMuted,margin:"0 auto 20px",opacity:0.4 }}/>
        <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:22,color:T.text,marginBottom:4 }}>{title}</div>
        <div style={{ height:2,width:40,background:T.accent,borderRadius:2,marginBottom:20 }}/>

        <label style={lblStyle}>Title</label>
        <input
          ref={titleRef}
          style={inpStyle}
          value={data.title}
          onChange={e=>setData(p=>({...p,title:e.target.value}))}
          onKeyDown={e=>{ if(e.key==="Enter" && data.title.trim()) { e.preventDefault(); onSave(); } }}
          placeholder="What needs to be done? (Enter to save)"
        />

        <label style={lblStyle}>Life Area</label>
        <select style={selStyle} value={data.section} onChange={e=>setData(p=>({...p,section:e.target.value}))}>
          {sections.map(s=><option key={s.id} value={s.id}>{s.emoji} {s.label}</option>)}
        </select>

        <label style={lblStyle}>Type</label>
        <select style={selStyle} value={data.type} onChange={e=>setData(p=>({...p,type:e.target.value}))}>
          {taskTypes.map(t=><option key={t.id} value={t.id}>{t.icon} {t.label}{t.id==="daily"?" — resets daily":t.id==="weekly"?" — resets every Monday":""}</option>)}
        </select>

        <label style={lblStyle}>Assigned To</label>
        <select style={selStyle} value={data.assignee} onChange={e=>setData(p=>({...p,assignee:e.target.value}))}>
          <option value="A">{names.A}</option>
          <option value="B">{names.B}</option>
          <option value="both">{names.A} & {names.B}</option>
        </select>

        <label style={lblStyle}>Priority</label>
        <select style={selStyle} value={data.priority} onChange={e=>setData(p=>({...p,priority:e.target.value}))}>
          {priorities.map(p=><option key={p} value={p}>{p}</option>)}
        </select>

        <label style={lblStyle}>Due Date (optional)</label>
        <input
          type="date"
          style={selStyle}
          value={data.dueDate||""}
          onChange={e=>setData(p=>({...p,dueDate:e.target.value}))}
        />

        <label style={lblStyle}>Notes (optional)</label>
        <input
          style={inpStyle}
          value={data.notes}
          onChange={e=>setData(p=>({...p,notes:e.target.value}))}
          placeholder="Any extra details..."
        />

        <div style={{ display:"flex",gap:10,marginTop:24,justifyContent:"flex-end" }}>
          <button style={btnStyle(false)} onClick={onClose}>Cancel</button>
          <button style={btnStyle(true)} onClick={onSave}>Save Task</button>
        </div>
      </div>
    </div>
  );
}

export default function TogetherApp() {
  const [tasks,      setTasksState] = useState(null);
  const [names,      setNamesState] = useState({ A:"Amen", B:"Gloria" });
  const [mode,       setMode]       = useState("dark");
  const [view,       setView]       = useState("board");

  // ── Identity: stored in localStorage so each device remembers who it is ───
  const [activeUser, setActiveUserState] = useState(() => {
    try { return localStorage.getItem("together_identity") || null; }
    catch { return null; }
  });
  const [showIdentityPicker, setShowIdentityPicker] = useState(!(() => {
    try { return localStorage.getItem("together_identity"); } catch { return false; }
  })());

  function setUser(u) {
    setActiveUserState(u);
    try { localStorage.setItem("together_identity", u); } catch {}
    setShowIdentityPicker(false);
  }

  const [filter,     setFilter]     = useState(null);
  const [showAdd,    setShowAdd]    = useState(false);
  const [addSection, setAddSec]     = useState(null);
  const [editTask,   setEdit]       = useState(null);
  const [showSett,   setShowSett]   = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try { return !localStorage.getItem("together_onboarded"); }
    catch { return false; }
  });
  function finishOnboarding() {
    try { localStorage.setItem("together_onboarded","1"); } catch {}
    setShowOnboarding(false);
  }
  const [showTour,   setShowTour]   = useState(false);
  const [tourStep,   setTourStep]   = useState(0);
  const [notifPerm,  setNotifPerm]  = useState(() => { try { return Notification?.permission||"default"; } catch { return "default"; } });
  const [showNav,    setShowNav]    = useState(false);
  const [toasts,     setToasts]     = useState([]);
  const seenIdsRef   = useRef(null);
  const [newTask,    setNew]        = useState({ title:"", section:"faith", type:"todo", assignee:"A", priority:"Medium", notes:"", dueDate:"" }); // assignee default stays "A" regardless of identity
  const [pulse,      setPulse]      = useState(false);
  const [completedLog, setCompletedLog] = useState([]);
  const completedLogRef = useRef([]);
  const [status,     setStatus]     = useState("connecting");
  const [loadMsg,    setLoadMsg]    = useState("Connecting to your board...");

  const dragTaskId    = useRef(null);
  const dragTargetCol = useRef(null);
  const dragType      = useRef(null);
  const dragBoardId   = useRef(null);
  const [highlightCol,  setHighlightCol]  = useState(null);
  const [highlightBoard,setHighlightBoard]= useState(null);
  // Per-user section order — each person has their own board layout
  const [sectionOrder,  setSectionOrder]  = useState(null);
  const sectionOrderRef = useRef(null);
  const tasksRef = useRef(null);
  const namesRef  = useRef({ A:"Amen", B:"Gloria" });
  const pollRef  = useRef(null);
  const T = THEMES[mode];

  // ── Greeting ────────────────────────────────────────────────────────────────
  const safeUser  = activeUser || "A";
  const greeting = mode === "dark"
    ? getGreeting(names[safeUser])
    : getGreetingLight(names[safeUser]);

  // ── setTasks write-through ───────────────────────────────────────────────
  function setTasks(fn) {
    setTasksState(prev => {
      const next = typeof fn === "function" ? fn(prev ?? []) : fn;
      tasksRef.current = next;
      dbSet("tasks", next);
      return next;
    });
  }

  // Which ISO week string is "this week" e.g. "2026-W11"
  const THIS_WEEK = (() => {
    const d = new Date();
    const thu = new Date(d); thu.setDate(d.getDate() - ((d.getDay()+6)%7) + 3);
    const y = thu.getFullYear();
    const w = Math.ceil(((thu - new Date(y,0,1)) / 86400000 + 1) / 7);
    return `${y}-W${String(w).padStart(2,"0")}`;
  })();

  function resetDailies(list) {
    return list.map(t => {
      if (t.type === "daily"  && t.lastReset !== TODAY)     return { ...t, done:false, lastReset:TODAY };
      if (t.type === "weekly" && t.lastReset !== THIS_WEEK) return { ...t, done:false, lastReset:THIS_WEEK };
      return t;
    });
  }

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const msgs = ["Syncing with Supabase...", "Loading your tasks...", "Almost ready..."];
    let i = 0;
    const ti = setInterval(() => { i++; if (msgs[i]) setLoadMsg(msgs[i]); }, 900);
    (async () => {
      try {
        const myId  = (() => { try { return localStorage.getItem("together_identity"); } catch { return null; } })();
        const soKey = myId ? `sectionOrder_${myId}` : "sectionOrder";
        const [t, n, m, so, cl] = await Promise.all([dbGet("tasks"), dbGet("names"), dbGet("mode"), dbGet(soKey), dbGet("completedLog")]);
        let loaded = (t ?? SAMPLES).map((tk, i) => ({ order:i, createdAt:TODAY, dueDate:"", lastReset:"", ...tk }));
        loaded = resetDailies(loaded);
        tasksRef.current = loaded;
        setTasksState(loaded);
        if (!t) await dbSet("tasks", loaded); else await dbSet("tasks", loaded);
        if (n) setNamesState(n);
        if (m) setMode(m);
        if (so) { setSectionOrder(so); sectionOrderRef.current = so; }
        else { const def = SECTIONS.map(s=>s.id); setSectionOrder(def); sectionOrderRef.current = def; await dbSet(soKey, def); }
        if (cl) { setCompletedLog(cl); completedLogRef.current = cl; }
        setStatus("live");
        // init seenIds AFTER first load so poll doesn't toast on startup
        seenIdsRef.current = (tasksRef.current || []).map(t => t.id);
      } catch {
        const fb = resetDailies(SAMPLES);
        seenIdsRef.current = fb.map(t => t.id);
        tasksRef.current = fb;
        setTasksState(fb);
        setStatus("error");
      }
      clearInterval(ti);
    })();
  }, []);

  // ── Poll ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    pollRef.current = setInterval(async () => {
      try {
        const t = await dbGet("tasks");
        if (t) {
          const r = resetDailies(t);
          setTasksState(prev => {
            if (JSON.stringify(prev) === JSON.stringify(r)) return prev;
            setPulse(true); setTimeout(() => setPulse(false), 900);

            // ── Detect brand-new tasks assigned to current user ──────────────
            // seenIdsRef starts null until first poll so we don't spam on load
            if (seenIdsRef.current !== null) {
              const prevIds = new Set(seenIdsRef.current);
              r.forEach(task => {
                const isNew      = !prevIds.has(task.id);
                const forme      = task.assignee === activeUser || task.assignee === "both";
                const byPartner  = task.createdBy && task.createdBy !== activeUser;
                if (isNew && forme && byPartner) {
                  // Read names from ref so closure is always fresh
                  const creatorName = namesRef.current?.[task.createdBy] || "Your partner";
                  showToast(task, creatorName);
                }
              });
            }
            seenIdsRef.current = r.map(t => t.id);
            tasksRef.current = r;
            return r;
          });
        }
        const n = await dbGet("names"); if (n) setNamesState(n);
        const m = await dbGet("mode");  if (m) setMode(m);
        const myIdP = (() => { try { return localStorage.getItem("together_identity"); } catch { return null; } })();
        const soKeyP = myIdP ? `sectionOrder_${myIdP}` : "sectionOrder";
        const so = await dbGet(soKeyP); if (so) { setSectionOrder(so); sectionOrderRef.current = so; }
        const cl = await dbGet("completedLog"); if (cl) { setCompletedLog(cl); completedLogRef.current = cl; }
        setStatus("live");
      } catch { setStatus("error"); }
    }, 4000);
    return () => clearInterval(pollRef.current);
  }, []);

  const setNames   = n => { setNamesState(n); namesRef.current = n; dbSet("names", n); };
  const toggleMode = () => { const m = mode==="dark"?"light":"dark"; setMode(m); dbSet("mode",m); };

  // ── Push Notifications ────────────────────────────────────────────────────
  async function requestNotifPermission() {
    try {
      const p = await Notification.requestPermission();
      setNotifPerm(p);
      if (p === "granted") {
        new Notification("Together ♡", { body:"Notifications enabled! You'll get reminders for tasks due soon.", icon:"/favicon.ico" });
        // Schedule check immediately
        checkDueNotifications();
      }
    } catch(e) { console.warn("Notifications not supported",e); }
  }

  function checkDueNotifications() {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const myUser = activeUser || "A";
    const myTasks = (tasksRef.current||[]).filter(t =>
      !t.done &&
      t.dueDate &&
      (t.assignee === myUser || t.assignee === "both")
    );
    myTasks.forEach(t => {
      const n = daysUntil(t.dueDate);
      if (n === 1) {
        new Notification(`Due tomorrow: ${t.title}`, {
          body: `📅 ${t.title} is due tomorrow. Tap to open Together.`,
          icon: "/favicon.ico", tag: `due-${t.id}`,
        });
      } else if (n === 0) {
        new Notification(`Due today: ${t.title}`, {
          body: `⚡ ${t.title} is due today!`,
          icon: "/favicon.ico", tag: `due-${t.id}`,
        });
      } else if (n < 0) {
        new Notification(`Overdue: ${t.title}`, {
          body: `🔴 ${t.title} is ${Math.abs(n)} day${Math.abs(n)>1?"s":""} overdue.`,
          icon: "/favicon.ico", tag: `due-${t.id}`,
        });
      }
    });
  }

  // Run notification check once on load and every hour
  useEffect(() => {
    const run = () => checkDueNotifications();
    const t = setTimeout(run, 3000); // 3s after load
    const i = setInterval(run, 3600000); // every hour
    return () => { clearTimeout(t); clearInterval(i); };
  }, []);

  // ── Toast notifications ────────────────────────────────────────────────────
  function showToast(task, creatorName) {
    const id = genId();
    const s  = SECTIONS.find(sec => sec.id === task.section) || SECTIONS[0];
    setToasts(prev => [...prev, { id, task, creatorName, section: s }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }
  function dismissToast(id) { setToasts(prev => prev.filter(t => t.id !== id)); }

  function toggleDone(id) {
    setTasks(prev => {
      const task = prev.find(t => t.id === id);
      if (!task) return prev;
      const nowDone = !task.done;
      // Log to permanent completion history when marking done
      if (nowDone) {
        const logEntry = {
          id: genId(),
          taskId: task.id,
          title: task.title,
          section: task.section,
          type: task.type,
          assignee: task.assignee,
          priority: task.priority,
          createdBy: task.createdBy || activeUser,
          completedBy: activeUser||"A",
          completedAt: new Date().toISOString(),
          completedDate: TODAY,
        };
        const newLog = [...completedLogRef.current, logEntry];
        completedLogRef.current = newLog;
        setCompletedLog(newLog);
        dbSet("completedLog", newLog);
      }
      return prev.map(t => {
        if (t.id !== id) return t;
        return { ...t, done:nowDone, streak:nowDone&&(t.type==="habit"||t.type==="daily"||t.type==="weekly")?t.streak+1:t.streak, lastReset:t.type==="daily"?TODAY:t.type==="weekly"?THIS_WEEK:t.lastReset };
      });
    });
  }
  function deleteTask(id) { setTasks(prev => prev.filter(t => t.id !== id)); }
  function saveEdit() {
    setTasks(prev => prev.map(t => t.id===editTask.id?editTask:t));
    const sid=genId(), sec=SECTIONS.find(s=>s.id===editTask.section)||SECTIONS[0];
    setToasts(prev=>[...prev,{id:sid,type:"success",title:editTask.title,section:sec}]);
    setTimeout(()=>setToasts(prev=>prev.filter(t=>t.id!==sid)),3500);
    setEdit(null);
  }
  function doAdd(taskData) {
    const data = taskData || newTask;
    if (!data.title.trim()) return;
    const lastReset = data.type==="daily" ? TODAY : data.type==="weekly" ? THIS_WEEK : "";
    const added = { ...data, id:genId(), done:false, streak:0, order:(tasksRef.current||[]).length, createdAt:TODAY, lastReset, createdBy:activeUser||"A" };
    setTasks(prev => [...prev, added]);
    // Success toast
    const sid = genId();
    const sec = SECTIONS.find(s=>s.id===data.section)||SECTIONS[0];
    setToasts(prev => [...prev, { id:sid, type:"success", title:data.title, section:sec }]);
    setTimeout(() => setToasts(prev => prev.filter(t=>t.id!==sid)), 3500);
    setNew({ title:"", section:"faith", type:"todo", assignee:"A", priority:"Medium", notes:"", dueDate:"" });
    setShowAdd(false); setAddSec(null);
  }

  // ── Drag handlers ──────────────────────────────────────────────────────────
  // -- TASK drag --
  function handleDragStart(e, taskId) {
    dragType.current    = "task";
    dragTaskId.current  = taskId;
    dragBoardId.current = null;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("dragtype", "task");
    e.dataTransfer.setData("text/plain", taskId);
  }

  // -- BOARD drag --
  function handleBoardDragStart(e, sectionId) {
    dragType.current    = "board";
    dragBoardId.current = sectionId;
    dragTaskId.current  = null;
    dragTargetCol.current = null;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("dragtype", "board");
    e.dataTransfer.setData("text/plain", sectionId);
    // Don't stopPropagation here — let it bubble so dragover on other cards fires
  }

  function handleDragOverCol(e, colId) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragType.current === "board") {
      if (highlightBoard !== colId) setHighlightBoard(colId);
      // clear task highlight when board dragging
      if (highlightCol !== null) setHighlightCol(null);
    } else {
      if (dragTargetCol.current !== colId) { dragTargetCol.current = colId; setHighlightCol(colId); }
      // clear board highlight when task dragging
      if (highlightBoard !== null) setHighlightBoard(null);
    }
  }

  function handleDropOnCol(e, colId) {
    e.preventDefault(); e.stopPropagation();

    if (dragType.current === "board") {
      // ── Reorder boards ────────────────────────────────────────────────────
      const fromId = dragBoardId.current;
      dragBoardId.current = null; dragType.current = null;
      setHighlightBoard(null);
      if (!fromId || fromId === colId || colId === DONE_COL) return;
      const cur = sectionOrderRef.current ?? SECTIONS.map(s=>s.id);
      const fi = cur.indexOf(fromId);
      const ti = cur.indexOf(colId);
      if (fi === -1 || ti === -1) return;
      const next = [...cur];
      next.splice(fi, 1);
      next.splice(ti, 0, fromId);
      sectionOrderRef.current = next;
      setSectionOrder(next);
      const myIdB = (() => { try { return localStorage.getItem("together_identity"); } catch { return null; } })();
      dbSet(myIdB ? `sectionOrder_${myIdB}` : "sectionOrder", next);
      return;
    }

    // ── Move/reorder tasks ────────────────────────────────────────────────
    const taskId    = dragTaskId.current;
    const targetCol = dragTargetCol.current ?? colId;
    dragTaskId.current = null; dragTargetCol.current = null;
    dragType.current = null; setHighlightCol(null);
    if (!taskId) return;
    const current = tasksRef.current ?? [];
    // Log if dragging to Done
    if (targetCol === DONE_COL) {
      const task = current.find(t => t.id === taskId);
      if (task && !task.done) {
        const logEntry = { id:genId(), taskId:task.id, title:task.title, section:task.section, type:task.type, assignee:task.assignee, priority:task.priority, createdBy:task.createdBy||activeUser, completedBy:activeUser||"A", completedAt:new Date().toISOString(), completedDate:TODAY };
        const newLog = [...completedLogRef.current, logEntry];
        completedLogRef.current = newLog; setCompletedLog(newLog); dbSet("completedLog", newLog);
      }
    }
    const updated = current.map(t => {
      if (t.id !== taskId) return t;
      if (targetCol === DONE_COL) return { ...t, done:true, streak:(t.type==="habit"||t.type==="daily"||t.type==="weekly")?t.streak+1:t.streak };
      return { ...t, section:targetCol, done:false };
    });
    const reordered = updated.map((t,i) => ({ ...t, order:i }));
    tasksRef.current = reordered; setTasksState(reordered); dbSet("tasks", reordered);
  }

  // -- Drop over a specific TASK (for reordering within a column) --
  function handleDropOnTask(e, overTaskId, colId) {
    e.preventDefault(); e.stopPropagation();
    if (dragType.current === "board") { handleDropOnCol(e, colId); return; }
    const taskId    = dragTaskId.current;
    const targetCol = dragTargetCol.current ?? colId;
    dragTaskId.current = null; dragTargetCol.current = null;
    dragType.current = null; setHighlightCol(null);
    if (!taskId || taskId === overTaskId) return;
    const current = tasksRef.current ?? [];
    // First update section/done
    let items = current.map(t => {
      if (t.id !== taskId) return t;
      if (targetCol === DONE_COL) return { ...t, done:true, streak:(t.type==="habit"||t.type==="daily"||t.type==="weekly")?t.streak+1:t.streak };
      return { ...t, section:targetCol, done:false };
    });
    // Then reorder: insert dragged task before the task it was dropped on
    const fi = items.findIndex(t => t.id === taskId);
    const ti = items.findIndex(t => t.id === overTaskId);
    if (fi !== -1 && ti !== -1) {
      const [moved] = items.splice(fi, 1);
      items.splice(ti, 0, moved);
    }
    const reordered = items.map((t,i) => ({ ...t, order:i }));
    tasksRef.current = reordered; setTasksState(reordered); dbSet("tasks", reordered);
  }

  function handleDragEnd() {
    dragTaskId.current = null; dragTargetCol.current = null;
    dragBoardId.current = null; dragType.current = null;
    setHighlightCol(null); setHighlightBoard(null);
  }

  const sec    = id => SECTIONS.find(s=>s.id===id)||SECTIONS[0];
  const aLabel = a  => a==="both"?`${names.A} & ${names.B}`:names[a]||a;
  const aColor = a  => a==="A"?"#E8A838":a==="B"?"#E84E8A":"#3DBF8A";

  // ── Loading screen ─────────────────────────────────────────────────────────
  if (!tasks) return (
    <div style={{ position:"fixed",inset:0,background:"#0F1117",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif",gap:20,padding:24 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      {/* Spinner */}
      <div style={{ position:"relative",width:72,height:72 }}>
        <div style={{ position:"absolute",inset:0,border:"3px solid rgba(232,168,56,0.15)",borderRadius:"50%" }}/>
        <div style={{ position:"absolute",inset:0,border:"3px solid transparent",borderTopColor:"#E8A838",borderRadius:"50%",animation:"spin 0.9s linear infinite" }}/>
        <div style={{ position:"absolute",inset:10,border:"3px solid transparent",borderTopColor:"#E8A838",opacity:0.4,borderRadius:"50%",animation:"spin 1.3s linear infinite reverse" }}/>
        <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,color:"#E8A838" }}>♡</div>
      </div>
      <div style={{ textAlign:"center" }}>
        <div style={{ color:"#E8A838",fontSize:22,fontWeight:700,letterSpacing:"0.04em",fontFamily:"'DM Serif Display',serif" }}>Together</div>
        <div style={{ color:"#888D9B",fontSize:14,marginTop:8,animation:"pulse 1.8s ease-in-out infinite" }}>{loadMsg}</div>
      </div>
      {/* Animated dots */}
      <div style={{ display:"flex",gap:6,marginTop:4 }}>
        {[0,1,2].map(i=>(
          <div key={i} style={{ width:6,height:6,borderRadius:"50%",background:"#E8A838",opacity:0.3,animation:`pulse 1.4s ease-in-out ${i*0.2}s infinite` }}/>
        ))}
      </div>
    </div>
  );

  const doneTasks   = tasks.filter(t=>t.done);
  const activeTasks = tasks.filter(t=>!t.done);
  const dailyTasks  = tasks.filter(t=>t.type==="daily");
  const weeklyTasks = tasks.filter(t=>t.type==="weekly");
  const compRate    = tasks.length?Math.round((doneTasks.length/tasks.length)*100):0;
  const urgentTasks = activeTasks.filter(t=>t.priority==="Urgent"||(daysUntil(t.dueDate)!==null&&daysUntil(t.dueDate)<=3)||t.priority==="High")
    .sort((a,b)=>{const da=daysUntil(a.dueDate)??999,db=daysUntil(b.dueDate)??999,pa=["Urgent","High","Medium","Low"].indexOf(a.priority),pb=["Urgent","High","Medium","Low"].indexOf(b.priority);return da!==db?da-db:pa-pb;});

  // ── Styles ────────────────────────────────────────────────────────────────
  const cardBase = (x={}) => ({ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, boxShadow:T.cardShadow, ...x });
  const inpStyle = { width:"100%", background:T.inputBg, border:`1px solid ${T.border}`, borderRadius:9, padding:"10px 13px", color:T.text, fontFamily:"'DM Sans',sans-serif", fontSize:15, outline:"none", boxSizing:"border-box" };
  const selStyle = { ...inpStyle, background:mode==="dark"?"#181B23":"#fff", cursor:"pointer" };
  const lblStyle = { fontSize:11, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", color:T.textMuted, display:"block", marginBottom:5, marginTop:14, fontFamily:"'DM Sans',sans-serif" };
  const btnStyle = p => ({ padding:"10px 20px", borderRadius:9, border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600, background:p?T.accent:T.inputBg, color:p?T.accentFg:T.textSub, transition:"all 0.15s" });

  // ── Task Pill ─────────────────────────────────────────────────────────────
  function TaskPill({ t, showSec=false, draggable=true }) {
    const s=sec(t.section), dCol=dueBadgeColor(t.dueDate), dLbl=dueBadgeLabel(t.dueDate), isDaily=t.type==="daily";
    return (
      <div
        draggable={draggable}
        onDragStart={draggable?e=>{e.stopPropagation();handleDragStart(e,t.id);}:undefined}
        onDragOver={draggable?e=>{e.stopPropagation();e.preventDefault();}:undefined}
        onDragEnd={draggable?e=>{e.stopPropagation();handleDragEnd();}:undefined}
        style={{ background:isDaily?(mode==="dark"?"rgba(61,191,138,0.06)":"rgba(61,191,138,0.05)"):(mode==="dark"?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.025)"), border:`1px solid ${isDaily?"#3DBF8A33":T.border}`, borderLeft:`3px solid ${t.done?T.textMuted:s.color}`, borderRadius:9, padding:"10px 12px", marginBottom:6, cursor:draggable?"grab":"default", opacity:t.done?0.55:1, userSelect:"none" }}
      >
        <div style={{ display:"flex", alignItems:"flex-start", gap:9 }}>
          <div onClick={e=>{e.stopPropagation();toggleDone(t.id);}} style={{ width:18,height:18,borderRadius:5,flexShrink:0,marginTop:2,border:`2px solid ${t.done?s.color:T.border}`,background:t.done?s.color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all 0.15s" }}>
            {t.done&&<span style={{ color:"#fff",fontSize:10,fontWeight:700,lineHeight:1 }}>✓</span>}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex",alignItems:"center",gap:6,flexWrap:"wrap" }}>
              <span style={{ fontSize:14,fontWeight:500,lineHeight:1.4,fontFamily:"'DM Sans',sans-serif",color:t.done?T.textMuted:T.text,textDecoration:t.done?"line-through":"none",wordBreak:"break-word" }}>{t.title}</span>
              {isDaily&&<span style={{ fontSize:10,padding:"1px 6px",borderRadius:5,background:"#3DBF8A22",color:"#3DBF8A",fontWeight:700,flexShrink:0 }}>⟳ Daily</span>}
              {t.type==="weekly"&&<span style={{ fontSize:10,padding:"1px 6px",borderRadius:5,background:"#3B9EDB22",color:"#3B9EDB",fontWeight:700,flexShrink:0 }}>⟲ Weekly</span>}
            </div>
            <div style={{ display:"flex",gap:4,marginTop:5,flexWrap:"wrap",alignItems:"center" }}>
              {showSec&&<span style={{ fontSize:10,padding:"2px 7px",borderRadius:5,background:s.color+"22",color:s.color,fontWeight:600,fontFamily:"'DM Sans',sans-serif" }}>{s.emoji} {s.label}</span>}
              <span style={{ fontSize:10,padding:"2px 7px",borderRadius:5,background:aColor(t.assignee)+"20",color:aColor(t.assignee),fontWeight:600,fontFamily:"'DM Sans',sans-serif" }}>{aLabel(t.assignee)}</span>
              <span style={{ fontSize:10,padding:"2px 7px",borderRadius:5,background:PRI_COLOR[t.priority]+"20",color:PRI_COLOR[t.priority],fontWeight:600,fontFamily:"'DM Sans',sans-serif" }}>{t.priority}</span>
              {(t.type==="habit"||t.type==="daily")&&t.streak>0&&<span style={{ fontSize:10,padding:"2px 7px",borderRadius:5,background:"#E8A83820",color:"#E8A838",fontWeight:600 }}>🔥 {t.streak}d</span>}
              {dLbl&&<span style={{ fontSize:10,padding:"2px 7px",borderRadius:5,background:dCol+"22",color:dCol,fontWeight:700 }}>📅 {dLbl}</span>}
            </div>
            <div style={{ display:"flex",gap:8,marginTop:3,flexWrap:"wrap",alignItems:"center" }}>
              {t.notes&&<span style={{ fontSize:11,color:T.textMuted,fontStyle:"italic",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:200 }}>{t.notes}</span>}
              {t.createdAt&&<span style={{ fontSize:10,color:T.textMuted }}>Created {formatDate(t.createdAt)}</span>}
              {t.createdBy&&<span style={{ fontSize:10,padding:"1px 6px",borderRadius:5,background:aColor(t.createdBy)+"18",color:aColor(t.createdBy),fontWeight:600,fontFamily:"'DM Sans',sans-serif",flexShrink:0 }}>by {names[t.createdBy]||t.createdBy}</span>}
            </div>
          </div>
          <div style={{ display:"flex",flexShrink:0,gap:1 }}>
            <button onClick={e=>{e.stopPropagation();setEdit({...t});}} style={{ background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:13,padding:"3px 5px",borderRadius:4,lineHeight:1 }}>✎</button>
            <button onClick={e=>{e.stopPropagation();deleteTask(t.id);}} style={{ background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:13,padding:"3px 5px",borderRadius:4,lineHeight:1 }}>✕</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Grid Card ─────────────────────────────────────────────────────────────
  function GridCard({ colId, label, emoji, color, colTasks, isDone=false }) {
    const isTaskOver  = highlightCol === colId;
    const isBoardOver = highlightBoard === colId && !isDone;
    const isOver      = isTaskOver;
    const allSec  = isDone ? [] : tasks.filter(t=>t.section===colId);
    const dnCount = isDone ? doneTasks.length : allSec.filter(t=>t.done).length;
    const total   = isDone ? tasks.length : allSec.length;
    const pct     = total ? Math.round((dnCount/total)*100) : 0;

    return (
      <div
        onDragOver={e=>handleDragOverCol(e, colId)}
        onDrop={e=>handleDropOnCol(e, colId)}
        style={{
          background:T.colBg,
          border:`1px solid ${isBoardOver?color+"cc":isTaskOver?color+"99":T.border}`,
          borderRadius:14, display:"flex", flexDirection:"column",
          boxShadow:isBoardOver?`0 0 0 3px ${color}66`:isTaskOver?`0 0 0 2px ${color}55`:"none",
          transition:"border 0.1s,box-shadow 0.1s,transform 0.1s",
          transform: isBoardOver ? "scale(1.02)" : "scale(1)",
          overflow:"hidden", minHeight:180,
        }}
      >
        {/* Header */}
        <div style={{ padding:"13px 14px 10px",borderBottom:`1px solid ${T.border}`,flexShrink:0 }}>
          <div style={{ display:"flex",alignItems:"center",gap:9 }}>
            {/* Dedicated board drag grip — ONLY this element is draggable for board reorder */}
            {!isDone && (
              <div
                draggable
                onDragStart={e=>{e.stopPropagation();handleBoardDragStart(e,colId);}}
                onDragEnd={e=>{e.stopPropagation();handleDragEnd();}}
                title="Drag to reorder board"
                style={{ display:"flex",flexDirection:"column",gap:2.5,flexShrink:0,opacity:0.35,cursor:"grab",padding:"4px 2px",borderRadius:4,transition:"opacity 0.15s" }}
                onMouseEnter={e=>e.currentTarget.style.opacity="0.8"}
                onMouseLeave={e=>e.currentTarget.style.opacity="0.35"}
              >
                <div style={{ width:14,height:2,borderRadius:1,background:T.text }}/>
                <div style={{ width:14,height:2,borderRadius:1,background:T.text }}/>
                <div style={{ width:14,height:2,borderRadius:1,background:T.text }}/>
              </div>
            )}
            <div style={{ width:32,height:32,borderRadius:9,background:color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0 }}>{emoji}</div>
            <div style={{ flex:1,minWidth:0 }}>
              <div style={{ fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:14,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{label}</div>
              <div style={{ fontSize:11,color:T.textSub,marginTop:1 }}>{isDone?`${dnCount} completed`:`${dnCount}/${total} done`}</div>
            </div>
            {!isDone&&<button
              onClick={e=>{e.stopPropagation();setAddSec(colId);setNew(p=>({...p,section:colId}));setShowAdd(true);}}
              onMouseDown={e=>e.stopPropagation()}
              style={{ width:26,height:26,borderRadius:7,background:T.inputBg,border:`1px solid ${T.border}`,cursor:"pointer",color:T.textSub,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontWeight:700 }}>+</button>}
          </div>
          {!isDone&&<div style={{ height:3,background:T.inputBg,borderRadius:3,marginTop:9,overflow:"hidden" }}><div style={{ height:"100%",width:`${pct}%`,background:color,borderRadius:3,transition:"width 0.4s" }}/></div>}
        </div>

        {/* Task list — each task wrapper is a drop zone for reordering */}
        <div
          style={{ flex:1,overflowY:"auto",padding:"10px 12px",minHeight:50 }}
          onDragOver={e=>{ e.preventDefault(); e.stopPropagation(); if(dragType.current==="task") handleDragOverCol(e,colId); }}
          onDrop={e=>{ e.stopPropagation(); handleDropOnCol(e,colId); }}
        >
          {colTasks.length===0 ? (
            <div style={{ border:`2px dashed ${isOver?color+"88":T.border}`,borderRadius:9,padding:"18px 10px",textAlign:"center",color:T.textMuted,fontSize:12,fontStyle:"italic",background:isOver?color+"0A":"transparent",transition:"all 0.1s" }}>
              {isDone?"✓ Drop tasks here to complete":"Drop tasks here"}
            </div>
          ) : colTasks.map((t) => (
            <div
              key={t.id}
              onDragOver={e=>{
                e.preventDefault(); e.stopPropagation();
                if(dragType.current==="task") handleDragOverCol(e,colId);
              }}
              onDrop={e=>{ e.stopPropagation(); handleDropOnTask(e, t.id, colId); }}
              style={{ position:"relative" }}
            >
              {/* Drop indicator line above this task */}
              {dragTaskId.current && dragTaskId.current!==t.id && highlightCol===colId && (
                <div style={{ height:2,background:color,borderRadius:2,marginBottom:3,opacity:0,transition:"opacity 0.1s" }}/>
              )}
              <TaskPill t={t} showSec={isDone}/>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // FormModal is defined outside TogetherApp (see below export) to prevent remounting

  // ── Timeline helpers ──────────────────────────────────────────────────────
  const now=new Date();
  const weekStart=new Date(now); weekStart.setDate(now.getDate()-((now.getDay()+6)%7)); weekStart.setHours(0,0,0,0);
  const weekEnd=new Date(weekStart); weekEnd.setDate(weekStart.getDate()+6); weekEnd.setHours(23,59,59,999);
  const monthStart=new Date(now.getFullYear(),now.getMonth(),1);
  const monthEnd=new Date(now.getFullYear(),now.getMonth()+1,0,23,59,59,999);
  const quarterEnd=new Date(now); quarterEnd.setDate(now.getDate()+90); quarterEnd.setHours(23,59,59,999);
  const yearStart=new Date(now.getFullYear(),0,1);
  const yearEnd=new Date(now.getFullYear(),11,31,23,59,59,999);

  function inRange(task,start,end) {
    const due=task.dueDate?new Date(task.dueDate+"T00:00:00"):null;
    const created=task.createdAt?new Date(task.createdAt+"T00:00:00"):null;
    if (due) return due>=start&&due<=end;
    if (created) return created>=start&&created<=end;
    return false;
  }
  function getTimelineTasks(start,end) {
    return activeTasks.filter(t=>t.type!=="daily"&&inRange(t,start,end)).sort((a,b)=>{
      const da=a.dueDate?new Date(a.dueDate+"T00:00:00"):new Date("9999-01-01");
      const db=b.dueDate?new Date(b.dueDate+"T00:00:00"):new Date("9999-01-01");
      return da-db;
    });
  }
  const timelineMap={
    week:   {tasks:getTimelineTasks(weekStart,weekEnd),    label:"This Week",     sub:weekStart.toLocaleDateString("en-US",{month:"short",day:"numeric"})+" – "+weekEnd.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})},
    month:  {tasks:getTimelineTasks(monthStart,monthEnd),  label:"This Month",    sub:now.toLocaleDateString("en-US",{month:"long",year:"numeric"})},
    quarter:{tasks:getTimelineTasks(now,quarterEnd),       label:"Next 3 Months", sub:now.toLocaleDateString("en-US",{month:"short",day:"numeric"})+" – "+quarterEnd.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})},
    year:   {tasks:getTimelineTasks(yearStart,yearEnd),    label:"This Year",     sub:String(now.getFullYear())},
  };

  // ── Board data ─────────────────────────────────────────────────────────────
  const userTasks=tasks.filter(t=>t.assignee===activeUser||t.assignee==="both");
  const userActive=userTasks.filter(t=>!t.done);
  const userDone=userTasks.filter(t=>t.done);

  // Apply custom section order — sections sorted by sectionOrder, filtered if needed
  const orderedSections = (() => {
    const order = sectionOrder ?? SECTIONS.map(s=>s.id);
    const base  = order.map(id=>SECTIONS.find(s=>s.id===id)).filter(Boolean);
    // Append any new sections not yet in order
    SECTIONS.forEach(s=>{ if (!base.find(b=>b.id===s.id)) base.push(s); });
    return filter ? base.filter(s=>s.id===filter) : base;
  })();

  // Sort tasks within each column by their order field
  const sortedActive = [...userActive].sort((a,b)=>a.order-b.order);

  const gridCols=[
    {colId:DONE_COL,label:"Done",emoji:"✓",color:"#3DBF8A",isDone:true,
      colTasks:[...userDone].sort((a,b)=>a.order-b.order).filter(t=>!filter||t.section===filter)},
    ...orderedSections.map(s=>({colId:s.id,label:s.label,emoji:s.emoji,color:s.color,isDone:false,
      colTasks:sortedActive.filter(t=>t.section===s.id)}))
  ];

  const navViews=[
    ["board","Board"],["today","Today"],["accountability","Us"],
    ["analytics","📊 Analytics"],
    ["reflections","💭 Reflections"],
    ["tracker","🔗 Tracker"],
    ["notes","📓 Notes"],
    ["cookbook","👨‍🍳 Cookbook"],
    ["prayer","🙏 Prayer"],
    ["urgent","🔴 Urgent"],["week","This Week"],["month","This Month"],
    ["quarter","Next 3 Months"],["year","This Year"],["aitools","AI Tools"],
  ];
  const isFullScreen=["today","accountability","aitools","urgent","week","month","quarter","year","prayer","analytics","reflections","tracker","notes","cookbook"].includes(view);
  const pad=isFullScreen?"0":"16px 16px";

  // ── Reusable timeline section renderer ────────────────────────────────────
  function TimelineSection({ tasks: tl, label, sub }) {
    const overdue=tl.filter(t=>{const n=daysUntil(t.dueDate);return n!==null&&n<0;});
    const dueToday=tl.filter(t=>{const n=daysUntil(t.dueDate);return n===0;});
    const upcoming=tl.filter(t=>{const n=daysUntil(t.dueDate);return n===null||n>0;});
    const groupByMonth=(label==="Next 3 Months"||label==="This Year");
    const monthGroups={};
    if (groupByMonth) upcoming.forEach(t=>{const key=t.dueDate?new Date(t.dueDate+"T00:00:00").toLocaleDateString("en-US",{month:"long",year:"numeric"}):"No Due Date";if(!monthGroups[key])monthGroups[key]=[];monthGroups[key].push(t);});
    return (
      <div style={{ padding:"24px 16px",maxWidth:780,margin:"0 auto" }}>
        <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:28,color:T.text,marginBottom:4 }}>{label}</div>
        <div style={{ fontSize:13,color:T.textSub,marginBottom:20 }}>{sub}</div>
        <div className="stats-row" style={{marginBottom:24}}>
          {[{l:"Total",v:tl.length,c:"#E8A838"},{l:"Overdue",v:overdue.length,c:"#E84E8A"},{l:"Due Today",v:dueToday.length,c:"#E8704A"},{l:"Upcoming",v:upcoming.length,c:"#3DBF8A"}].map(s=>(
            <div key={s.l} style={cardBase({padding:"10px 14px",flex:"1 1 80px",borderLeft:`3px solid ${s.c}`})}>
              <div style={{fontSize:20,fontWeight:700,color:T.text,lineHeight:1}}>{s.v}</div>
              <div style={{fontSize:10,fontWeight:600,color:T.textSub,marginTop:3,textTransform:"uppercase",letterSpacing:"0.08em"}}>{s.l}</div>
            </div>
          ))}
        </div>
        {tl.length===0?(
          <div style={cardBase({padding:"50px 20px",textAlign:"center"})}>
            <div style={{fontSize:36,marginBottom:10}}>📭</div>
            <div style={{fontSize:16,fontWeight:600,color:T.text}}>Nothing scheduled</div>
            <div style={{fontSize:13,color:T.textSub,marginTop:4}}>Add due dates to tasks to see them here.</div>
          </div>
        ):(
          <>
            {overdue.length>0&&<div style={{marginBottom:20}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><div style={{width:8,height:8,borderRadius:"50%",background:"#E84E8A"}}/><span style={{fontSize:12,fontWeight:700,color:"#E84E8A",textTransform:"uppercase",letterSpacing:"0.1em"}}>Overdue</span><span style={{fontSize:12,color:T.textMuted}}>· {overdue.length}</span></div><div style={cardBase({padding:"6px 12px",border:"1px solid #E84E8A33"})}>{overdue.map(t=><TaskPill key={t.id} t={t} showSec draggable={false}/>)}</div></div>}
            {dueToday.length>0&&<div style={{marginBottom:20}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><div style={{width:8,height:8,borderRadius:"50%",background:"#E8704A"}}/><span style={{fontSize:12,fontWeight:700,color:"#E8704A",textTransform:"uppercase",letterSpacing:"0.1em"}}>Due Today</span><span style={{fontSize:12,color:T.textMuted}}>· {dueToday.length}</span></div><div style={cardBase({padding:"6px 12px",border:"1px solid #E8704A33"})}>{dueToday.map(t=><TaskPill key={t.id} t={t} showSec draggable={false}/>)}</div></div>}
            {upcoming.length>0&&(groupByMonth?Object.entries(monthGroups).map(([ml,mt])=>(
              <div key={ml} style={{marginBottom:20}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><div style={{width:8,height:8,borderRadius:"50%",background:"#3B9EDB"}}/><span style={{fontSize:12,fontWeight:700,color:"#3B9EDB",textTransform:"uppercase",letterSpacing:"0.1em"}}>{ml}</span><span style={{fontSize:12,color:T.textMuted}}>· {mt.length}</span></div><div style={cardBase({padding:"6px 12px"})}>{mt.map(t=><TaskPill key={t.id} t={t} showSec draggable={false}/>)}</div></div>
            )):(
              <div style={{marginBottom:20}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><div style={{width:8,height:8,borderRadius:"50%",background:"#3DBF8A"}}/><span style={{fontSize:12,fontWeight:700,color:"#3DBF8A",textTransform:"uppercase",letterSpacing:"0.1em"}}>Upcoming</span><span style={{fontSize:12,color:T.textMuted}}>· {upcoming.length}</span></div><div style={cardBase({padding:"6px 12px"})}>{upcoming.map(t=><TaskPill key={t.id} t={t} showSec draggable={false}/>)}</div></div>
            ))}
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh",background:T.bg,color:T.text,fontFamily:"'DM Sans',sans-serif",transition:"background 0.2s,color 0.2s" }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideInRight{from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1}}
        @keyframes drainBar{from{width:100%}to{width:0%}}
        html,body,#root{width:100%;max-width:100%;overflow-x:hidden;margin:0;padding:0;}
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
        img,video,iframe{max-width:100%;}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${T.textMuted};border-radius:2px}
        input[type="date"]::-webkit-calendar-picker-indicator{filter:${mode==="dark"?"invert(1)":"none"}}
        button:active{transform:scale(0.97)}
        .grid-board{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr));gap:12px;align-items:start;}
        .stats-row{display:flex;gap:8px;width:100%;flex-wrap:wrap;}.stats-row>*{flex:1 1 120px;min-width:0;}
        .grid-tools{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,260px),1fr));gap:12px;}
        .grid-accountability{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr));gap:14px;}
        .pill-scroll{display:flex;gap:6px;overflow-x:auto;padding-bottom:6px;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
        .pill-scroll::-webkit-scrollbar{display:none;}
        .desktop-nav{display:flex;overflow-x:auto;scrollbar-width:none;}
        .desktop-nav::-webkit-scrollbar{display:none;}
        .mobile-tabs{display:none;}
        .topbar-desktop-actions{display:flex;align-items:center;gap:5px;}
        .topbar-menu-btn{display:none!important;}
        @media(max-width:768px){
          .desktop-nav{display:none!important;}
          .mobile-tabs{display:flex!important;}
          .page-content{padding-bottom:80px!important;}
          .topbar-desktop-actions{display:none!important;}
          .topbar-menu-btn{display:flex!important;}
        }
      `}</style>

      {/* ── TOP BAR ── */}
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",borderBottom:`1px solid ${T.border}`,position:"sticky",top:0,zIndex:20,background:T.topbar,backdropFilter:"blur(12px)",width:"100%" }}>
        <div style={{ display:"flex",alignItems:"center",gap:7,minWidth:0 }}>
          <span style={{ fontFamily:"'DM Serif Display',serif",fontSize:19,color:T.accent,whiteSpace:"nowrap" }}>Together ♡</span>
          <div style={{ width:6,height:6,borderRadius:"50%",background:status==="live"?(pulse?"#3DBF8A":"#2A6644"):status==="error"?"#E8704A":T.textMuted,transition:"background 0.4s",flexShrink:0 }} title={status}/>
        </div>
        {/* Desktop actions — hidden on mobile */}
        <div className="topbar-desktop-actions">
          {/* Identity badge — shows who this device is; tap to switch */}
          <div style={{ display:"flex",alignItems:"center",gap:6,background:T.inputBg,borderRadius:8,padding:"4px 10px",border:`1px solid ${T.border}`,cursor:"pointer" }}
            onClick={()=>setShowIdentityPicker(true)} title="Switch identity">
            <div style={{ width:22,height:22,borderRadius:"50%",background:(activeUser==="A"?"#E8A838":"#E84E8A")+"33",border:`2px solid ${activeUser==="A"?"#E8A838":"#E84E8A"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:activeUser==="A"?"#E8A838":"#E84E8A",flexShrink:0 }}>
              {activeUser?(names[activeUser]||"?")[0]:"?"}
            </div>
            <span style={{ fontSize:12,fontWeight:600,color:T.text }}>{activeUser?names[activeUser]:"Choose"}</span>
            <span style={{ fontSize:10,color:T.textMuted }}>▾</span>
          </div>
          <button onClick={toggleMode} style={{ width:32,height:32,borderRadius:8,border:`1px solid ${T.border}`,background:T.inputBg,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",color:T.textSub,flexShrink:0 }}>
            {mode==="dark"?"☀":"☾"}
          </button>
          <button onClick={()=>setShowSett(true)} style={{ width:32,height:32,borderRadius:8,border:`1px solid ${T.border}`,background:T.inputBg,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",color:T.textSub,flexShrink:0 }}>⚙</button>
          <button onClick={()=>setShowAdd(true)} style={{ height:32,padding:"0 12px",borderRadius:8,border:"none",background:T.accent,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,color:T.accentFg,display:"flex",alignItems:"center",gap:4,flexShrink:0,whiteSpace:"nowrap" }}>
            + Task
          </button>
        </div>

        {/* Mobile menu button — shown only on mobile */}
        <div style={{ display:"flex",alignItems:"center",gap:6,flexShrink:0 }} className="topbar-menu-btn">
          <button onClick={()=>setShowAdd(true)} style={{ height:32,padding:"0 12px",borderRadius:8,border:"none",background:T.accent,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,color:T.accentFg,display:"flex",alignItems:"center",gap:4,whiteSpace:"nowrap" }}>
            + Task
          </button>
          <button onClick={()=>setShowNav(true)} style={{ width:36,height:36,borderRadius:9,border:`1px solid ${T.border}`,background:T.inputBg,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,flexShrink:0,padding:"9px 8px" }}>
            <span style={{ width:16,height:2,borderRadius:1,background:T.textSub,display:"block" }}/>
            <span style={{ width:16,height:2,borderRadius:1,background:T.textSub,display:"block" }}/>
            <span style={{ width:16,height:2,borderRadius:1,background:T.textSub,display:"block" }}/>
          </button>
        </div>
      </div>

      {/* ── DESKTOP NAV TABS (hidden on mobile) ── */}
      <div style={{ display:"flex",gap:0,padding:"0 14px",borderBottom:`1px solid ${T.border}`,background:T.topbar,overflowX:"auto",scrollbarWidth:"none" }}
        className="desktop-nav">
        {navViews.map(([v,l])=>(
          <button key={v} onClick={()=>setView(v)} style={{ padding:"11px 14px 10px",border:"none",cursor:"pointer",background:"none",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:view===v?700:400,color:view===v?T.accent:T.textSub,borderBottom:view===v?`2px solid ${T.accent}`:"2px solid transparent",transition:"all 0.15s",whiteSpace:"nowrap",flexShrink:0 }}>
            {l}
          </button>
        ))}
      </div>

      {/* ── GREETING BANNER (board view only) ── */}
      {view==="board"&&activeUser&&(
        <div style={{ background:greeting.bg,padding:"18px 16px",borderBottom:`1px solid ${T.border}` }}>
          <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:22,color:greeting.accent }}>{greeting.text}</div>
          <div style={{ fontSize:13,color:T.textSub,marginTop:3 }}>{greeting.sub}</div>
        </div>
      )}

      {/* ── CONTENT ── */}
      <div className="page-content" style={{ padding:pad }}>

        {/* STATS */}
        {view==="board"&&(
          <div className="stats-row" style={{ margin:"16px 0" }}>
            {[{label:"Open",value:activeTasks.length,color:"#E8A838"},{label:"Done %",value:`${compRate}%`,color:"#3DBF8A"},{label:"Streaks",value:tasks.filter(t=>(t.type==="habit"||t.type==="daily")&&t.streak>0).reduce((a,t)=>a+t.streak,0),color:"#9B6EE8"},{label:"Urgent",value:urgentTasks.length,color:"#E84E8A"}].map(s=>(
              <div key={s.label} style={cardBase({padding:"12px 14px",flex:"1 1 80px",borderLeft:`3px solid ${s.color}`})}>
                <div style={{fontSize:22,fontWeight:700,color:T.text,lineHeight:1}}>{s.value}</div>
                <div style={{fontSize:10,fontWeight:600,color:T.textSub,marginTop:3,textTransform:"uppercase",letterSpacing:"0.08em"}}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── BOARD ── */}
        {view==="board"&&(
          <>
            <div className="pill-scroll" style={{marginBottom:14}}>
              <button onClick={()=>setFilter(null)} style={{ padding:"5px 12px",borderRadius:20,cursor:"pointer",fontSize:12,fontFamily:"'DM Sans',sans-serif",fontWeight:500,border:"none",background:!filter?T.accent:"transparent",color:!filter?T.accentFg:T.textSub,outline:!filter?"none":`1px solid ${T.border}`,transition:"all 0.15s",flexShrink:0 }}>All</button>
              {SECTIONS.map(s=>(
                <button key={s.id} onClick={()=>setFilter(filter===s.id?null:s.id)} style={{ padding:"5px 12px",borderRadius:20,cursor:"pointer",fontSize:12,fontFamily:"'DM Sans',sans-serif",fontWeight:500,border:"none",background:filter===s.id?s.color:"transparent",color:filter===s.id?"#fff":T.textSub,outline:filter===s.id?"none":`1px solid ${T.border}`,transition:"all 0.15s",whiteSpace:"nowrap",flexShrink:0 }}>
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}>
              <div style={{ width:28,height:28,borderRadius:"50%",background:(activeUser==="A"?"#E8A838":"#E84E8A")+"22",border:`2px solid ${activeUser==="A"?"#E8A838":"#E84E8A"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:activeUser==="A"?"#E8A838":"#E84E8A" }}>{(names[activeUser]||"?")[0]}</div>
              <span style={{ fontFamily:"'DM Serif Display',serif",fontSize:17,color:T.text }}>{(names[activeUser]||"…")}'s Board</span>
            </div>
            <div className="grid-board">
              {gridCols.map(c=><GridCard key={c.colId} {...c}/>)}
            </div>
          </>
        )}

        {/* ── TODAY ── */}
        {view==="today"&&(
          <div style={{ padding:"24px 16px",maxWidth:720,margin:"0 auto" }}>
            <div style={{ background:greeting.bg,borderRadius:14,padding:"20px",marginBottom:24,border:`1px solid ${T.border}` }}>
              <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:24,color:greeting.accent }}>{greeting.text}</div>
              <div style={{ fontSize:13,color:T.textSub,marginTop:3 }}>{greeting.sub}</div>
              <div style={{ fontSize:12,color:T.textMuted,marginTop:6 }}>{new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</div>
            </div>
            {dailyTasks.filter(t=>t.assignee===activeUser||t.assignee==="both").length>0&&(
              <div style={{marginBottom:20}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <span style={{fontSize:15}}>⟳</span>
                  <span style={{fontSize:12,fontWeight:700,color:"#3DBF8A",textTransform:"uppercase",letterSpacing:"0.1em"}}>Daily Habits</span>
                  <span style={{fontSize:12,color:T.textMuted}}>· resets every day</span>
                </div>
                <div style={cardBase({padding:"6px 12px",border:"1px solid #3DBF8A33"})}>
                  {dailyTasks.filter(t=>t.assignee===activeUser||t.assignee==="both").map(t=><TaskPill key={t.id} t={t} showSec draggable={false}/>)}
                </div>
              </div>
            )}
            {weeklyTasks.filter(t=>t.assignee===activeUser||t.assignee==="both").length>0&&(
              <div style={{marginBottom:20}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <span style={{fontSize:15}}>⟲</span>
                  <span style={{fontSize:12,fontWeight:700,color:"#3B9EDB",textTransform:"uppercase",letterSpacing:"0.1em"}}>Weekly Routines</span>
                  <span style={{fontSize:12,color:T.textMuted}}>· resets every Monday</span>
                </div>
                <div style={cardBase({padding:"6px 12px",border:"1px solid #3B9EDB33"})}>
                  {weeklyTasks.filter(t=>t.assignee===activeUser||t.assignee==="both").map(t=><TaskPill key={t.id} t={t} showSec draggable={false}/>)}
                </div>
              </div>
            )}
            {["Urgent","High","Medium","Low"].map(p=>{
              const pt=activeTasks.filter(t=>t.type!=="daily"&&t.priority===p&&(t.assignee===activeUser||t.assignee==="both"));
              if (!pt.length) return null;
              const pc=PRI_COLOR[p];
              return (
                <div key={p} style={{marginBottom:20}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                    <div style={{width:7,height:7,borderRadius:"50%",background:pc}}/>
                    <span style={{fontSize:12,fontWeight:700,color:pc,textTransform:"uppercase",letterSpacing:"0.1em"}}>{p}</span>
                    <span style={{fontSize:12,color:T.textMuted}}>· {pt.length} task{pt.length!==1?"s":""}</span>
                  </div>
                  <div style={cardBase({padding:"6px 12px"})}>{pt.map(t=><TaskPill key={t.id} t={t} showSec draggable={false}/>)}</div>
                </div>
              );
            })}
            {activeTasks.filter(t=>t.assignee===activeUser||t.assignee==="both").length===0&&(
              <div style={cardBase({padding:"50px 20px",textAlign:"center"})}>
                <div style={{fontSize:36,marginBottom:10}}>🎉</div>
                <div style={{fontSize:17,fontWeight:600,color:T.text}}>All caught up!</div>
                <div style={{fontSize:13,color:T.textSub,marginTop:4}}>Nothing left for today.</div>
              </div>
            )}
          </div>
        )}

        {/* ── URGENT ── */}
        {view==="urgent"&&(
          <div style={{padding:"24px 16px",maxWidth:720,margin:"0 auto"}}>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:28,color:T.text,marginBottom:4}}>🔴 Urgent & Due Soon</div>
            <div style={{fontSize:13,color:T.textSub,marginBottom:24}}>Overdue, due within 3 days, or High/Urgent priority</div>
            {urgentTasks.length===0?(
              <div style={cardBase({padding:"50px 20px",textAlign:"center"})}>
                <div style={{fontSize:36,marginBottom:10}}>✅</div>
                <div style={{fontSize:17,fontWeight:600,color:T.text}}>Nothing urgent!</div>
                <div style={{fontSize:13,color:T.textSub,marginTop:4}}>You're on top of everything.</div>
              </div>
            ):urgentTasks.map(t=><div key={t.id} style={{marginBottom:8}}><TaskPill t={t} showSec draggable={false}/></div>)}
          </div>
        )}

        {/* ── TIMELINE VIEWS ── */}
        {["week","month","quarter","year"].includes(view)&&(()=>{const tl=timelineMap[view];return <TimelineSection tasks={tl.tasks} label={tl.label} sub={tl.sub}/>;})()}

        {/* ── ACCOUNTABILITY ── */}
        {view==="accountability"&&(
          <div style={{padding:"24px 16px"}}>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:28,color:T.text,marginBottom:4}}>Accountability</div>
            <div style={{fontSize:13,color:T.textSub,marginBottom:24}}>{names.A} & {names.B} · Growing Together</div>
            <div className="grid-accountability" style={{marginBottom:14}}>
              {["A","B"].map(u=>{
                const ut=tasks.filter(t=>t.assignee===u||t.assignee==="both"),ud=ut.filter(t=>t.done).length,uc=u==="A"?"#E8A838":"#E84E8A",pct=ut.length?Math.round((ud/ut.length)*100):0,uu=urgentTasks.filter(t=>t.assignee===u||t.assignee==="both");
                return (
                  <div key={u} style={cardBase({padding:"20px"})}>
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                      <div style={{width:44,height:44,borderRadius:"50%",background:uc+"20",border:`2px solid ${uc}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:uc,fontWeight:700}}>{(names[u]||"?")[0]}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:16,fontWeight:700,color:T.text}}>{names[u]}</div>
                        <div style={{fontSize:12,color:T.textSub,marginTop:2}}>{ud}/{ut.length} done · {ut.filter(t=>(t.type==="habit"||t.type==="daily")&&t.streak>0).length} streaks</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:22,fontWeight:700,color:uc}}>{pct}%</div>
                        {uu.length>0&&<div style={{fontSize:11,color:"#E84E8A",fontWeight:600}}>⚠ {uu.length} urgent</div>}
                      </div>
                    </div>
                    <div style={{height:5,background:T.inputBg,borderRadius:5,marginBottom:14,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:uc,borderRadius:5,transition:"width 0.4s"}}/></div>
                    <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
                      {SECTIONS.map(s=>{const n=tasks.filter(t=>t.section===s.id&&(t.assignee===u||t.assignee==="both")).length;return n?<span key={s.id} style={{fontSize:10,padding:"2px 8px",borderRadius:5,background:s.color+"20",color:s.color,fontWeight:600}}>{s.emoji} {n}</span>:null;})}
                    </div>
                    <div style={{maxHeight:220,overflowY:"auto"}}>
                      {ut.filter(t=>!t.done).map(t=><TaskPill key={t.id} t={t} showSec draggable={false}/>)}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={cardBase({padding:"20px"})}>
              <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:14}}>
                <span style={{fontSize:18}}>♡</span>
                <span style={{fontSize:15,fontWeight:700,color:T.text}}>Shared Goals</span>
                <span style={{fontSize:12,color:T.textSub}}>· {tasks.filter(t=>t.assignee==="both"&&!t.done).length} active</span>
              </div>
              {tasks.filter(t=>t.assignee==="both"&&!t.done).length===0
                ?<div style={{fontSize:13,color:T.textMuted,fontStyle:"italic"}}>No shared tasks yet — add one!</div>
                :tasks.filter(t=>t.assignee==="both"&&!t.done).map(t=><TaskPill key={t.id} t={t} showSec draggable={false}/>)
              }
            </div>
          </div>
        )}

        {/* ── PRAYER REQUESTS ── */}
        {view==="prayer"&&(
          <PrayerView tasks={tasks} setTasks={setTasks} names={names} activeUser={activeUser} T={T} mode={mode} aColor={aColor} aLabel={aLabel} TODAY={TODAY} genId={genId} toasts={toasts} setToasts={setToasts} SECTIONS={SECTIONS}/>
        )}

        {/* ── ANALYTICS ── */}
        {view==="analytics"&&(
          <AnalyticsView log={completedLog} tasks={tasks} names={names} T={T} mode={mode} SECTIONS={SECTIONS} PRI_COLOR={PRI_COLOR} TODAY={TODAY}/>
        )}

        {/* ── TRACKER ── */}
        {view==="tracker"&&(
          <TrackerView activeUser={activeUser} names={names} T={T} mode={mode} TODAY={TODAY} genId={genId}/>
        )}

        {/* ── COOKBOOK ── */}
        {view==="cookbook"&&(
          <CookbookView activeUser={activeUser} names={names} T={T} mode={mode} TODAY={TODAY} genId={genId}/>
        )}

        {/* ── REFLECTIONS ── */}
        {view==="reflections"&&(
          <ReflectionsView activeUser={activeUser} names={names} T={T} mode={mode} TODAY={TODAY} genId={genId}/>
        )}

        {/* ── TRACKER ── */}
        {view==="tracker"&&<TrackerView activeUser={activeUser} names={names} T={T} mode={mode} TODAY={TODAY} genId={genId}/>}

        {/* ── NOTES ── */}
        {view==="notes"&&<NotesView activeUser={activeUser} names={names} T={T} mode={mode} TODAY={TODAY} genId={genId}/>}

        {/* ── COOKBOOK ── */}
        {view==="cookbook"&&<CookbookView activeUser={activeUser} names={names} T={T} mode={mode} TODAY={TODAY} genId={genId}/>}

        {/* ── AI TOOLS ── */}
        {view==="aitools"&&(
          <div style={{padding:"24px 16px"}}>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:28,color:T.text,marginBottom:4}}>AI Tools</div>
            <div style={{fontSize:13,color:T.textSub,marginBottom:24}}>Your curated toolkit — tap any card to open</div>
            <div className="grid-tools">
              {AI_TOOLS.map(tool=>(
                <a key={tool.name} href={tool.url} target="_blank" rel="noreferrer" style={{textDecoration:"none"}}>
                  <div style={{...cardBase(),padding:"16px",borderLeft:`3px solid ${tool.color}`,cursor:"pointer",transition:"transform 0.15s,box-shadow 0.15s",active:{transform:"scale(0.98)"}}}
                    onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 6px 20px ${tool.color}33`;}}
                    onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow=T.cardShadow;}}
                  >
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                      <div style={{width:38,height:38,borderRadius:10,background:tool.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{tool.emoji}</div>
                      <div>
                        <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:14,color:T.text}}>{tool.name}</div>
                        <div style={{fontSize:11,color:tool.color,fontWeight:600,marginTop:1}}>↗ Open</div>
                      </div>
                    </div>
                    <div style={{fontSize:12,color:T.textSub,lineHeight:1.5}}>{tool.desc}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── MOBILE BOTTOM TAB BAR ── */}
      <div className="mobile-tabs" style={{ position:"fixed",bottom:0,left:0,right:0,zIndex:30,background:T.topbar,borderTop:`1px solid ${T.border}`,backdropFilter:"blur(12px)",padding:"6px 0 max(6px,env(safe-area-inset-bottom))",display:"none",alignItems:"center",justifyContent:"space-around" }}>
        {[
          ["board","⊞","Board"],
          ["today","◎","Today"],
          ["accountability","♡","Us"],
          ["reflections","💭","Reflect"],
          ["more","•••","More"],
        ].map(([v,icon,label])=>(
          <button key={v} onClick={()=>{if(v==="more"){setShowNav(true);}else{setView(v);}}} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer",padding:"4px 8px",minWidth:52,color:view===v&&v!=="more"?T.accent:T.textSub,transition:"color 0.15s" }}>
            <span style={{ fontSize:v==="more"?18:17,lineHeight:1 }}>{icon}</span>
            <span style={{ fontSize:10,fontWeight:view===v&&v!=="more"?700:400,fontFamily:"'DM Sans',sans-serif",letterSpacing:"0.02em" }}>{label}</span>
          </button>
        ))}
      </div>

      {/* ── MORE DRAWER (mobile only) ── */}
      {showNav&&(
        <div style={{ position:"fixed",inset:0,zIndex:50 }} onClick={()=>setShowNav(false)}>
          <div style={{ background:"rgba(0,0,0,0.5)",backdropFilter:"blur(4px)",position:"absolute",inset:0 }}/>
          <div style={{ position:"absolute",bottom:0,left:0,right:0,background:T.surface,borderRadius:"18px 18px 0 0",padding:"16px 0 max(24px,env(safe-area-inset-bottom))",maxHeight:"75vh",overflowY:"auto",animation:"slideUp 0.22s ease" }} onClick={e=>e.stopPropagation()}>
            <div style={{ width:40,height:4,borderRadius:2,background:T.textMuted,margin:"0 auto 16px",opacity:0.4 }}/>
            <div style={{ padding:"0 16px 12px",borderBottom:`1px solid ${T.border}`,marginBottom:8,background:greeting.bg }}>
              <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:17,color:greeting.accent }}>{greeting.text}</div>
              <div style={{ fontSize:12,color:T.textSub,marginTop:2 }}>{greeting.sub}</div>
            </div>
            {/* Identity — tap to switch who this device is */}
            <div style={{ padding:"14px 20px 10px",borderBottom:`1px solid ${T.border}`,marginBottom:4 }}>
              <div style={{ fontSize:11,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",color:T.textMuted,marginBottom:8,fontFamily:"'DM Sans',sans-serif" }}>This device is</div>
              <div style={{ display:"flex",gap:8 }}>
                {["A","B"].map(u=>(
                  <button key={u} onClick={()=>{setUser(u);setShowNav(false);}} style={{ flex:1,padding:"10px",borderRadius:10,border:`1px solid ${activeUser===u?(u==="A"?"#E8A838":"#E84E8A"):T.border}`,background:activeUser===u?(u==="A"?"#E8A838":"#E84E8A")+"18":"transparent",color:activeUser===u?(u==="A"?"#E8A838":"#E84E8A"):T.text,fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,cursor:"pointer",transition:"all 0.15s" }}>
                    {u==="A"?"👤 ":""}{u==="B"?"👤 ":""}{names[u]}
                  </button>
                ))}
              </div>
              <div style={{ fontSize:11,color:T.textMuted,marginTop:6,textAlign:"center" }}>Each device remembers its identity</div>
            </div>

            {/* Nav items */}
            {navViews.filter(([v])=>!["board","today","accountability","urgent"].includes(v)).map(([v,l])=>(
              <button key={v} onClick={()=>{setView(v);setShowNav(false);}} style={{ display:"flex",alignItems:"center",width:"100%",padding:"14px 20px",border:"none",background:view===v?T.accent+"15":"transparent",color:view===v?T.accent:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:15,fontWeight:view===v?700:400,cursor:"pointer",textAlign:"left",borderLeft:view===v?`3px solid ${T.accent}`:"3px solid transparent",transition:"all 0.12s" }}>
                {l}
              </button>
            ))}

            {/* Bottom actions */}
            <div style={{ padding:"10px 20px 4px",borderTop:`1px solid ${T.border}`,marginTop:8,display:"flex",gap:10 }}>
              <button onClick={()=>{toggleMode();setShowNav(false);}} style={{ flex:1,padding:"10px",borderRadius:10,border:`1px solid ${T.border}`,background:T.inputBg,color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontWeight:500 }}>
                {mode==="dark"?"☀ Light Mode":"☾ Dark Mode"}
              </button>
              <button onClick={()=>{setShowSett(true);setShowNav(false);}} style={{ flex:1,padding:"10px",borderRadius:10,border:`1px solid ${T.border}`,background:T.inputBg,color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontWeight:500 }}>
                ⚙ Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST NOTIFICATIONS ── */}
      <div style={{ position:"fixed",top:70,right:16,zIndex:100,display:"flex",flexDirection:"column",gap:10,maxWidth:"calc(100vw - 32px)",width:340,pointerEvents:"none" }}>
        {toasts.map(toast => {
          // ── Success toast (task added) ───────────────────────────────────
          if (toast.type === "success") {
            const s = toast.section;
            return (
              <div key={toast.id} style={{ background:T.surface,border:`1px solid ${s.color}44`,borderLeft:`4px solid ${s.color}`,borderRadius:14,padding:"12px 16px",boxShadow:`0 8px 32px rgba(0,0,0,${mode==="dark"?0.4:0.12})`,pointerEvents:"all",animation:"slideInRight 0.3s ease",cursor:"pointer",display:"flex",alignItems:"center",gap:12 }}
                onClick={()=>dismissToast(toast.id)}>
                <div style={{ width:32,height:32,borderRadius:9,background:s.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0 }}>✓</div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontSize:12,fontWeight:700,color:"#3DBF8A",fontFamily:"'DM Sans',sans-serif",marginBottom:1 }}>Task added! 🎉</div>
                  <div style={{ fontSize:13,color:T.text,fontWeight:500,fontFamily:"'DM Sans',sans-serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{toast.title}</div>
                </div>
                <button onClick={e=>{e.stopPropagation();dismissToast(toast.id);}} style={{ background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:14,lineHeight:1,padding:"0 2px",flexShrink:0 }}>✕</button>
              </div>
            );
          }
          // ── Partner notification toast ───────────────────────────────────
          const s = toast.section;
          const assigneeLabel = toast.task.assignee==="both"
            ? `${names.A} & ${names.B}`
            : names[toast.task.assignee]||toast.task.assignee;
          return (
            <div key={toast.id} style={{ background:T.surface,border:`1px solid ${s.color}55`,borderLeft:`4px solid ${s.color}`,borderRadius:14,padding:"14px 16px",boxShadow:`0 8px 32px rgba(0,0,0,${mode==="dark"?0.5:0.15})`,pointerEvents:"all",animation:"slideInRight 0.3s ease",cursor:"pointer" }}
              onClick={()=>dismissToast(toast.id)}>
              <div style={{ display:"flex",alignItems:"flex-start",gap:10 }}>
                <div style={{ width:36,height:36,borderRadius:10,background:s.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>{s.emoji}</div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontSize:12,fontWeight:700,color:s.color,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:2,fontFamily:"'DM Sans',sans-serif" }}>New task from {toast.creatorName} ✨</div>
                  <div style={{ fontSize:14,fontWeight:600,color:T.text,lineHeight:1.3,marginBottom:4,fontFamily:"'DM Sans',sans-serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{toast.task.title}</div>
                  <div style={{ display:"flex",gap:5,flexWrap:"wrap" }}>
                    <span style={{ fontSize:10,padding:"2px 7px",borderRadius:5,background:s.color+"22",color:s.color,fontWeight:600,fontFamily:"'DM Sans',sans-serif" }}>{s.emoji} {s.label}</span>
                    <span style={{ fontSize:10,padding:"2px 7px",borderRadius:5,background:PRI_COLOR[toast.task.priority]+"20",color:PRI_COLOR[toast.task.priority],fontWeight:600,fontFamily:"'DM Sans',sans-serif" }}>{toast.task.priority}</span>
                    <span style={{ fontSize:10,padding:"2px 7px",borderRadius:5,background:aColor(toast.task.assignee)+"20",color:aColor(toast.task.assignee),fontWeight:600,fontFamily:"'DM Sans',sans-serif" }}>for {assigneeLabel}</span>
                  </div>
                </div>
                <button onClick={e=>{e.stopPropagation();dismissToast(toast.id);}} style={{ background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:14,lineHeight:1,padding:"0 2px",flexShrink:0 }}>✕</button>
              </div>
              {/* Progress bar that drains over 5s */}
              <div style={{ height:2,background:T.inputBg,borderRadius:2,marginTop:12,overflow:"hidden" }}>
                <div style={{ height:"100%",background:s.color,borderRadius:2,animation:"drainBar 5s linear forwards" }}/>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── APP TOUR ── */}
      {showTour && <AppTour step={tourStep} setStep={setTourStep} onClose={()=>setShowTour(false)} setView={setView} setShowAdd={setShowAdd} toggleMode={toggleMode} T={T} mode={mode} names={names} activeUser={activeUser}/>}

      {/* ── ONBOARDING ── */}
      {showOnboarding && <OnboardingFlow names={names} onFinish={finishOnboarding} T={T} mode={mode}/>}

      {/* ── IDENTITY PICKER (first time + on demand) ── */}
      {(showIdentityPicker || !activeUser) && tasks && (
        <div style={{ position:"fixed",inset:0,zIndex:60,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:24 }}>
          <div style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:20,padding:"36px 28px",width:"100%",maxWidth:400,textAlign:"center",boxShadow:"0 24px 64px rgba(0,0,0,0.5)" }}>
            <div style={{ fontSize:36,marginBottom:12 }}>♡</div>
            <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:26,color:T.accent,marginBottom:8 }}>Together</div>
            <div style={{ fontSize:14,color:T.textSub,marginBottom:28,lineHeight:1.6 }}>
              {!activeUser ? "Welcome! Who are you on this device?" : "Switch identity for this device"}
            </div>
            <div style={{ display:"flex",flexDirection:"column",gap:12,marginBottom:20 }}>
              {["A","B"].map(u=>{
                const uc = u==="A"?"#E8A838":"#E84E8A";
                return (
                  <button key={u} onClick={()=>setUser(u)} style={{ padding:"16px 20px",borderRadius:14,border:`2px solid ${uc}44`,background:uc+"12",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:16,fontWeight:700,color:uc,transition:"all 0.15s",display:"flex",alignItems:"center",gap:14 }}>
                    <div style={{ width:40,height:40,borderRadius:"50%",background:uc+"22",border:`2px solid ${uc}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:uc,flexShrink:0 }}>{(names[u]||"?")[0]}</div>
                    <div style={{ textAlign:"left" }}>
                      <div style={{ fontSize:16,fontWeight:700 }}>{names[u]}</div>
                      <div style={{ fontSize:12,color:T.textSub,fontWeight:400,marginTop:2 }}>This is my device</div>
                    </div>
                  </button>
                );
              })}
            </div>
            {activeUser && (
              <button onClick={()=>setShowIdentityPicker(false)} style={{ fontSize:13,color:T.textMuted,background:"none",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>
                Cancel
              </button>
            )}
            <div style={{ fontSize:11,color:T.textMuted,marginTop:16,lineHeight:1.5 }}>
              Each device remembers your identity. You won't need to switch again.
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAdd&&<FormModal data={newTask} setData={setNew} onSave={()=>doAdd(newTask)} onClose={()=>{setShowAdd(false);setAddSec(null);}} title="New Task" names={names} sections={SECTIONS} taskTypes={TASK_TYPES} priorities={PRIORITIES} T={T} mode={mode}/>}
      {editTask&&<FormModal data={editTask} setData={setEdit} onSave={saveEdit} onClose={()=>setEdit(null)} title="Edit Task" names={names} sections={SECTIONS} taskTypes={TASK_TYPES} priorities={PRIORITIES} T={T} mode={mode}/>}

      {/* Settings */}
      {showSett&&(
        <div style={{position:"fixed",inset:0,zIndex:40,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>e.target===e.currentTarget&&setShowSett(false)}>
          <div style={{...cardBase(),width:"100%",maxWidth:480,padding:"24px 20px 32px",borderRadius:"18px 18px 0 0",maxHeight:"85vh",overflowY:"auto"}}>
            <div style={{width:40,height:4,borderRadius:2,background:T.textMuted,margin:"0 auto 20px",opacity:0.4}}/>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:T.text,marginBottom:4}}>Settings</div>
            <div style={{height:2,width:40,background:T.accent,borderRadius:2,marginBottom:20}}/>
            <div style={{fontSize:13,color:T.textSub,marginBottom:18,lineHeight:1.7,background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:9,padding:"11px 14px"}}>
              <strong style={{color:"#3DBF8A"}}>🔄 Syncing via Supabase.</strong> Changes sync every 4 seconds. Daily tasks reset every morning automatically.
            </div>
            <label style={lblStyle}>Partner A Name</label>
            <input style={inpStyle} value={names.A} onChange={e=>setNames({...names,A:e.target.value})} placeholder="Name"/>
            <label style={lblStyle}>Partner B Name</label>
            <input style={inpStyle} value={names.B} onChange={e=>setNames({...names,B:e.target.value})} placeholder="Name"/>
            {/* Tour */}
            <div style={{marginTop:20,paddingTop:16,borderTop:`1px solid ${T.border}`}}>
              <div style={{fontSize:12,fontWeight:600,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>App Tour</div>
              <button onClick={()=>{setShowSett(false);setTourStep(0);setShowTour(true);}} style={{width:"100%",padding:"11px",borderRadius:10,border:`1px solid #9B6EE844`,background:"#9B6EE812",color:"#9B6EE8",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                🗺️ Take the App Tour
              </button>
            </div>

            {/* Push Notifications */}
            <div style={{marginTop:16,paddingTop:16,borderTop:`1px solid ${T.border}`}}>
              <div style={{fontSize:12,fontWeight:600,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>Push Notifications</div>
              {notifPerm==="granted" ? (
                <div style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderRadius:10,background:"#3DBF8A12",border:"1px solid #3DBF8A44"}}>
                  <span style={{fontSize:18}}>🔔</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,color:"#3DBF8A"}}>Notifications enabled</div>
                    <div style={{fontSize:11,color:T.textSub,marginTop:1}}>You'll get alerts for tasks due today, tomorrow, and overdue</div>
                  </div>
                  <button onClick={checkDueNotifications} style={{fontSize:11,padding:"4px 10px",borderRadius:7,border:"1px solid #3DBF8A44",background:"transparent",color:"#3DBF8A",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>Test</button>
                </div>
              ) : notifPerm==="denied" ? (
                <div style={{padding:"11px 14px",borderRadius:10,background:T.inputBg,border:`1px solid ${T.border}`,fontSize:13,color:T.textSub}}>
                  🔕 Notifications blocked. Please enable them in your browser settings.
                </div>
              ) : (
                <button onClick={requestNotifPermission} style={{width:"100%",padding:"11px",borderRadius:10,border:"1px solid #E8A83844",background:"#E8A83812",color:"#E8A838",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                  🔔 Enable Due Date Notifications
                </button>
              )}
            </div>

            <div style={{display:"flex",gap:10,marginTop:22,justifyContent:"flex-end"}}>
              <button style={btnStyle(true)} onClick={()=>setShowSett(false)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
