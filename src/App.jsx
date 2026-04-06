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
  { id: "todo",     label: "To-Do",       icon: "☐" },
  { id: "habit",    label: "Habit",        icon: "↺" },
  { id: "daily",    label: "Daily",        icon: "⟳" },
  { id: "weekly",   label: "Weekly",       icon: "⟲" },
  { id: "schedule", label: "Class/Schedule",icon: "📅" },
  { id: "progress", label: "Progress",     icon: "◉" },
  { id: "monthly",  label: "Monthly",      icon: "🗓" },
  { id: "goal",     label: "Goal",         icon: "◎" },
];
const WEEK_DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const WEEK_DAY_FULL = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

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


// ══════════════════════════════════════════════════════════════════════════════
// ── BudgetApp ─────────────────────────────────────────────────────────────────
// Full-featured budget tracker with income, expenses, savings goals,
// per-user views, shared view, pie chart, and history.
// ══════════════════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════════════════
// ── BUDGET SYSTEM v2 — Plan → Track → Net Worth ───────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const BUDGET_CATS = [
  { id:"housing",   label:"Housing",        emoji:"🏠", color:"#3B9EDB" },
  { id:"food",      label:"Food & Dining",  emoji:"🍽️", color:"#E8A838" },
  { id:"transport", label:"Transport",      emoji:"🚗", color:"#9B6EE8" },
  { id:"health",    label:"Health",         emoji:"💊", color:"#3DBF8A" },
  { id:"education", label:"Education",      emoji:"🎓", color:"#7B61FF" },
  { id:"faith",     label:"Faith & Giving", emoji:"✦",  color:"#E8C050" },
  { id:"savings",   label:"Savings",        emoji:"💰", color:"#20B2AA" },
  { id:"shopping",  label:"Shopping",       emoji:"🛍️", color:"#E84E8A" },
  { id:"utilities", label:"Utilities",      emoji:"⚡", color:"#E8883A" },
  { id:"invest",    label:"Investing",      emoji:"📈", color:"#5BAD4E" },
  { id:"personal",  label:"Personal",       emoji:"🌱", color:"#C8B030" },
  { id:"sub",       label:"Subscriptions",  emoji:"📱", color:"#8B5CF6" },
  { id:"other",     label:"Other",          emoji:"📦", color:"#888D9B" },
];

const BUDGET_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const ASSET_CATS = [
  { id:"cash",      label:"Cash & Savings",  emoji:"💵", color:"#3DBF8A" },
  { id:"invest",    label:"Investments",     emoji:"📈", color:"#5BAD4E" },
  { id:"vehicle",   label:"Vehicle",         emoji:"🚗", color:"#9B6EE8" },
  { id:"property",  label:"Property",        emoji:"🏠", color:"#3B9EDB" },
  { id:"device",    label:"Electronics",     emoji:"📱", color:"#8B5CF6" },
  { id:"other",     label:"Other Asset",     emoji:"💎", color:"#E8A838" },
];
const LIAB_CATS = [
  { id:"loan",      label:"Loan",            emoji:"🏦", color:"#E84E8A" },
  { id:"credit",    label:"Credit Card",     emoji:"💳", color:"#E8704A" },
  { id:"mortgage",  label:"Mortgage",        emoji:"🏠", color:"#E8883A" },
  { id:"other",     label:"Other Debt",      emoji:"📋", color:"#888D9B" },
];

// ── SVG Pie ───────────────────────────────────────────────────────────────────
function PieChart({ slices, size=180, T }) {
  const total = slices.reduce((s,x)=>s+x.value,0);
  if (!total) return <div style={{ width:size,height:size,borderRadius:"50%",background:T.inputBg,display:"flex",alignItems:"center",justifyContent:"center",color:T.textMuted,fontSize:11 }}>No data</div>;
  let cum=0;
  const paths = slices.filter(s=>s.value>0).map(s=>{
    const pct=s.value/total, a1=cum*2*Math.PI-Math.PI/2, a2=(cum+pct)*2*Math.PI-Math.PI/2;
    cum+=pct;
    const r=size/2-6,cx=size/2,cy=size/2;
    const x1=cx+r*Math.cos(a1),y1=cy+r*Math.sin(a1),x2=cx+r*Math.cos(a2),y2=cy+r*Math.sin(a2);
    return {...s,d:`M${cx},${cy}L${x1},${y1}A${r},${r} 0 ${pct>.5?1:0},1 ${x2},${y2}Z`,pct};
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ filter:"drop-shadow(0 4px 12px rgba(0,0,0,0.15))",flexShrink:0 }}>
      {paths.map((p,i)=><path key={i} d={p.d} fill={p.color} stroke={T.surface} strokeWidth={2}/>)}
      <circle cx={size/2} cy={size/2} r={size/4.2} fill={T.surface}/>
    </svg>
  );
}

// ── Budget Line Item Form ─────────────────────────────────────────────────────
// A budget *line* = a planned item with allocated amount, category, notes
// You then log actual spending against it
function BudgetLineForm({ data, setData, onSave, onClose, T, mode }) {
  const ref = useRef(null);
  useEffect(()=>{ const t=setTimeout(()=>{ if(ref.current) ref.current.focus(); },80); return()=>clearTimeout(t); },[]);
  const inp = { width:"100%",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 12px",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:14,outline:"none",boxSizing:"border-box" };
  const sel = { ...inp,background:mode==="dark"?"#181B23":"#fff",cursor:"pointer" };
  const lbl = { fontSize:11,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",color:T.textMuted,display:"block",marginBottom:4,marginTop:12,fontFamily:"'DM Sans',sans-serif" };
  return (
    <div style={{ position:"fixed",inset:0,zIndex:50,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center" }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:520,maxHeight:"92vh",overflowY:"auto",padding:"24px 20px 40px",boxShadow:"0 -8px 40px rgba(0,0,0,0.3)" }}>
        <div style={{ width:40,height:4,borderRadius:2,background:T.textMuted,margin:"0 auto 20px",opacity:0.4 }}/>
        <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:22,color:T.text,marginBottom:4 }}>{data.id?"Edit":"New"} Budget Item</div>
        <div style={{ height:2,width:40,background:"#20B2AA",borderRadius:2,marginBottom:18 }}/>

        <label style={lbl}>Item Name</label>
        <input ref={ref} style={inp} value={data.name||""} onChange={e=>setData(p=>({...p,name:e.target.value}))} placeholder="e.g. Rent, Groceries, Spotify..." onKeyDown={e=>{ if(e.key==="Enter"&&data.name?.trim()&&data.allocated){e.preventDefault();onSave();}}}/>

        <label style={lbl}>Category</label>
        <select style={sel} value={data.category||"other"} onChange={e=>setData(p=>({...p,category:e.target.value}))}>
          {BUDGET_CATS.map(c=><option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
        </select>

        <label style={lbl}>Allocated Budget ($)</label>
        <input style={inp} type="number" min="0" step="0.01" value={data.allocated||""} onChange={e=>setData(p=>({...p,allocated:e.target.value}))} placeholder="0.00"/>

        <label style={lbl}>Amount Spent So Far ($)</label>
        <input style={inp} type="number" min="0" step="0.01" value={data.spent||""} onChange={e=>setData(p=>({...p,spent:e.target.value}))} placeholder="0.00"/>

        <label style={lbl}>Notes (optional)</label>
        <input style={inp} value={data.notes||""} onChange={e=>setData(p=>({...p,notes:e.target.value}))} placeholder="Any context..."/>

        <label style={lbl}>Recurring</label>
        <div style={{ display:"flex",gap:6 }}>
          {[["none","One-time"],["monthly","Monthly"],["weekly","Weekly"]].map(([v,l])=>(
            <button key={v} onClick={()=>setData(p=>({...p,recurring:v}))}
              style={{ flex:1,padding:"8px",borderRadius:9,border:`1px solid ${(data.recurring||"none")===v?"#9B6EE8":T.border}`,background:(data.recurring||"none")===v?"#9B6EE822":"transparent",color:(data.recurring||"none")===v?"#9B6EE8":T.text,fontFamily:"'DM Sans',sans-serif",fontSize:12,cursor:"pointer",fontWeight:(data.recurring||"none")===v?700:400 }}>
              {l}
            </button>
          ))}
        </div>

        <div style={{ display:"flex",gap:10,marginTop:22,justifyContent:"flex-end" }}>
          <button style={{ padding:"10px 20px",borderRadius:10,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,background:T.inputBg,color:T.textSub }} onClick={onClose}>Cancel</button>
          <button style={{ padding:"10px 24px",borderRadius:10,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:700,background:"#20B2AA",color:"#fff" }} onClick={onSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ── Log Spending Form (quick modal to update how much spent on a budget item) ─
function LogSpendForm({ item, onSave, onClose, T, mode }) {
  const [amt, setAmt] = useState("");
  const [mode2, setMode2] = useState("add"); // add | set
  const ref = useRef(null);
  useEffect(()=>{ const t=setTimeout(()=>{ if(ref.current) ref.current.focus(); },80); return()=>clearTimeout(t); },[]);
  const inp = { width:"100%",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 12px",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:14,outline:"none",boxSizing:"border-box" };
  const cat = BUDGET_CATS.find(c=>c.id===item.category)||BUDGET_CATS[BUDGET_CATS.length-1];
  const remaining = Math.max(0, (item.allocated||0) - (item.spent||0));
  return (
    <div style={{ position:"fixed",inset:0,zIndex:50,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center" }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:480,padding:"24px 20px 40px",boxShadow:"0 -8px 40px rgba(0,0,0,0.3)" }}>
        <div style={{ width:40,height:4,borderRadius:2,background:T.textMuted,margin:"0 auto 20px",opacity:0.4 }}/>
        <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:16 }}>
          <div style={{ width:40,height:40,borderRadius:10,background:cat.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20 }}>{cat.emoji}</div>
          <div>
            <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:18,color:T.text }}>Log Spending</div>
            <div style={{ fontSize:12,color:T.textSub }}>{item.name} · {remaining>0?`$${remaining.toFixed(2)} remaining`:"Budget used up"}</div>
          </div>
        </div>
        <div style={{ display:"flex",gap:8,marginBottom:14 }}>
          {[["add","Add to spent"],["set","Set total spent"]].map(([v,l])=>(
            <button key={v} onClick={()=>setMode2(v)} style={{ flex:1,padding:"8px",borderRadius:9,border:`1px solid ${mode2===v?"#20B2AA":T.border}`,background:mode2===v?"#20B2AA18":"transparent",color:mode2===v?"#20B2AA":T.text,fontFamily:"'DM Sans',sans-serif",fontSize:12,cursor:"pointer",fontWeight:mode2===v?700:400 }}>{l}</button>
          ))}
        </div>
        <input ref={ref} type="number" min="0" step="0.01" style={inp}
          value={amt} onChange={e=>setAmt(e.target.value)}
          placeholder={mode2==="add"?"Amount spent now...":"Total spent so far..."}
          onKeyDown={e=>{ if(e.key==="Enter"&&amt){ onSave(parseFloat(amt)||0, mode2); }}}/>
        <div style={{ display:"flex",gap:10,marginTop:16,justifyContent:"flex-end" }}>
          <button style={{ padding:"9px 18px",borderRadius:9,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,background:T.inputBg,color:T.textSub }} onClick={onClose}>Cancel</button>
          <button style={{ padding:"9px 22px",borderRadius:9,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:700,background:"#20B2AA",color:"#fff" }} onClick={()=>onSave(parseFloat(amt)||0, mode2)}>Log It</button>
        </div>
      </div>
    </div>
  );
}

// ── Asset / Liability Form ────────────────────────────────────────────────────
function AssetForm({ data, setData, onSave, onClose, T, mode, type }) {
  const ref = useRef(null);
  useEffect(()=>{ const t=setTimeout(()=>{ if(ref.current) ref.current.focus(); },80); return()=>clearTimeout(t); },[]);
  const cats = type==="asset" ? ASSET_CATS : LIAB_CATS;
  const inp = { width:"100%",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 12px",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:14,outline:"none",boxSizing:"border-box" };
  const sel = { ...inp,background:mode==="dark"?"#181B23":"#fff",cursor:"pointer" };
  const lbl = { fontSize:11,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",color:T.textMuted,display:"block",marginBottom:4,marginTop:12,fontFamily:"'DM Sans',sans-serif" };
  const ac = type==="asset"?"#3DBF8A":"#E84E8A";
  return (
    <div style={{ position:"fixed",inset:0,zIndex:50,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center" }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:480,maxHeight:"90vh",overflowY:"auto",padding:"24px 20px 40px",boxShadow:"0 -8px 40px rgba(0,0,0,0.3)" }}>
        <div style={{ width:40,height:4,borderRadius:2,background:T.textMuted,margin:"0 auto 20px",opacity:0.4 }}/>
        <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:22,color:T.text,marginBottom:4 }}>{data.id?"Edit":"Add"} {type==="asset"?"Asset":"Liability"}</div>
        <div style={{ height:2,width:40,background:ac,borderRadius:2,marginBottom:18 }}/>
        <label style={lbl}>Name</label>
        <input ref={ref} style={inp} value={data.name||""} onChange={e=>setData(p=>({...p,name:e.target.value}))} placeholder={type==="asset"?"e.g. MacBook Pro, Toyota Camry...":"e.g. Student Loan, Credit Card..."}/>
        <label style={lbl}>Category</label>
        <select style={sel} value={data.category||cats[0].id} onChange={e=>setData(p=>({...p,category:e.target.value}))}>
          {cats.map(c=><option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
        </select>
        <label style={lbl}>{type==="asset"?"Current Value ($)":"Amount Owed ($)"}</label>
        <input style={inp} type="number" min="0" step="0.01" value={data.value||""} onChange={e=>setData(p=>({...p,value:e.target.value}))} placeholder="0.00"/>
        <label style={lbl}>Notes (optional)</label>
        <input style={inp} value={data.notes||""} onChange={e=>setData(p=>({...p,notes:e.target.value}))} placeholder="Any details..."/>
        <div style={{ display:"flex",gap:10,marginTop:22,justifyContent:"flex-end" }}>
          <button style={{ padding:"10px 20px",borderRadius:10,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,background:T.inputBg,color:T.textSub }} onClick={onClose}>Cancel</button>
          <button style={{ padding:"10px 24px",borderRadius:10,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:700,background:ac,color:"#fff" }} onClick={onSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ── Goal Form ─────────────────────────────────────────────────────────────────
function GoalForm({ data, setData, onSave, onClose, T, mode }) {
  const ref = useRef(null);
  useEffect(()=>{ const t=setTimeout(()=>{ if(ref.current) ref.current.focus(); },80); return()=>clearTimeout(t); },[]);
  const inp = { width:"100%",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 12px",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:14,outline:"none",boxSizing:"border-box" };
  const sel = { ...inp,background:mode==="dark"?"#181B23":"#fff",cursor:"pointer" };
  const lbl = { fontSize:11,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",color:T.textMuted,display:"block",marginBottom:4,marginTop:12,fontFamily:"'DM Sans',sans-serif" };
  return (
    <div style={{ position:"fixed",inset:0,zIndex:50,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center" }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:520,maxHeight:"92vh",overflowY:"auto",padding:"24px 20px 40px",boxShadow:"0 -8px 40px rgba(0,0,0,0.3)" }}>
        <div style={{ width:40,height:4,borderRadius:2,background:T.textMuted,margin:"0 auto 20px",opacity:0.4 }}/>
        <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:22,color:T.text,marginBottom:4 }}>{data.id?"Edit":"New"} Savings Goal</div>
        <div style={{ height:2,width:40,background:"#20B2AA",borderRadius:2,marginBottom:18 }}/>
        <label style={lbl}>Goal Name</label>
        <input ref={ref} style={inp} value={data.name||""} onChange={e=>setData(p=>({...p,name:e.target.value}))} placeholder="e.g. Emergency Fund, Move to KC..."/>
        <label style={lbl}>Emoji</label>
        <input style={{...inp,maxWidth:80}} value={data.emoji||"💰"} onChange={e=>setData(p=>({...p,emoji:e.target.value}))}/>
        <label style={lbl}>Target Amount ($)</label>
        <input style={inp} type="number" min="0" step="1" value={data.target||""} onChange={e=>setData(p=>({...p,target:e.target.value}))} placeholder="5000"/>
        <label style={lbl}>Currently Saved ($)</label>
        <input style={inp} type="number" min="0" step="0.01" value={data.saved||""} onChange={e=>setData(p=>({...p,saved:e.target.value}))} placeholder="0"/>
        <label style={lbl}>Target Date (optional)</label>
        <input type="date" style={sel} value={data.deadline||""} onChange={e=>setData(p=>({...p,deadline:e.target.value}))}/>
        <div style={{ display:"flex",gap:10,marginTop:22,justifyContent:"flex-end" }}>
          <button style={{ padding:"10px 20px",borderRadius:10,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,background:T.inputBg,color:T.textSub }} onClick={onClose}>Cancel</button>
          <button style={{ padding:"10px 24px",borderRadius:10,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:700,background:"#20B2AA",color:"#fff" }} onClick={onSave}>Save Goal</button>
        </div>
      </div>
    </div>
  );
}

// ── GoalCard ──────────────────────────────────────────────────────────────────
function GoalCard({ g, T, fmt, setEditGoal, delGoal, addToGoal }) {
  const [adding, setAdding] = useState(false);
  const [addAmt, setAddAmt] = useState("");
  const pct   = g.target>0?Math.min(100,Math.round((g.saved/g.target)*100)):0;
  const left  = Math.max(0,g.target-g.saved);
  const dLeft = g.deadline?Math.ceil((new Date(g.deadline+"T00:00:00")-new Date())/86400000):null;
  return (
    <div style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:16,padding:"20px",boxShadow:"0 2px 12px rgba(0,0,0,0.07)",borderTop:`4px solid ${pct>=100?"#3DBF8A":"#20B2AA"}`,position:"relative",boxSizing:"border-box" }}>
      {pct>=100&&<div style={{ position:"absolute",top:10,right:14,fontSize:22 }}>🏆</div>}
      <div style={{ display:"flex",gap:10,alignItems:"flex-start",marginBottom:14 }}>
        <div style={{ fontSize:30,lineHeight:1 }}>{g.emoji||"💰"}</div>
        <div style={{ flex:1,minWidth:0 }}>
          <div style={{ fontSize:15,fontWeight:700,color:T.text,lineHeight:1.3 }}>{g.name}</div>
          {dLeft!==null&&<div style={{ fontSize:11,marginTop:2,color:dLeft<0?"#E84E8A":dLeft<30?"#E8A838":"#3DBF8A",fontWeight:600 }}>📅 {dLeft>0?`${dLeft}d left`:dLeft===0?"Due today":"Past deadline"}</div>}
        </div>
        <div style={{ display:"flex",gap:3,flexShrink:0 }}>
          <button onClick={()=>setEditGoal({...g})} style={{ background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:14,padding:"3px" }}>✎</button>
          <button onClick={()=>delGoal(g.id)}       style={{ background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:14,padding:"3px" }}>✕</button>
        </div>
      </div>
      <div style={{ textAlign:"center",marginBottom:10 }}>
        <div style={{ fontSize:34,fontWeight:800,color:pct>=100?"#3DBF8A":"#20B2AA",lineHeight:1 }}>{pct}%</div>
        <div style={{ fontSize:12,color:T.textSub,marginTop:2 }}>{fmt(g.saved)} of {fmt(g.target)}</div>
      </div>
      <div style={{ height:12,background:T.inputBg,borderRadius:10,overflow:"hidden",marginBottom:8 }}>
        <div style={{ height:"100%",width:`${pct}%`,background:pct>=100?"linear-gradient(90deg,#3DBF8A,#20B2AA)":"linear-gradient(90deg,#20B2AA,#3B9EDB)",borderRadius:10,transition:"width 0.6s" }}/>
      </div>
      <div style={{ fontSize:11,color:T.textMuted,marginBottom:12 }}>{left>0?`${fmt(left)} to go`:"Goal reached! 🎉"}</div>
      {adding ? (
        <div style={{ display:"flex",gap:6 }}>
          <input autoFocus type="number" min="0" step="0.01" placeholder="Amount..."
            style={{ flex:1,background:T.inputBg,border:"1px solid #20B2AA",borderRadius:8,padding:"7px 10px",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:13,outline:"none",boxSizing:"border-box" }}
            value={addAmt} onChange={e=>setAddAmt(e.target.value)}
            onKeyDown={e=>{ if(e.key==="Enter"&&addAmt){addToGoal(g.id,addAmt);setAdding(false);setAddAmt("");} }}/>
          <button onClick={()=>{ addToGoal(g.id,addAmt); setAdding(false); setAddAmt(""); }}
            style={{ padding:"7px 12px",borderRadius:8,border:"none",background:"#20B2AA",color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700 }}>Add</button>
          <button onClick={()=>setAdding(false)}
            style={{ padding:"7px 9px",borderRadius:8,border:`1px solid ${T.border}`,background:T.inputBg,color:T.textSub,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12 }}>✕</button>
        </div>
      ) : (
        <button onClick={()=>setAdding(true)}
          style={{ width:"100%",padding:"8px",borderRadius:10,border:"1px solid #20B2AA44",background:"#20B2AA0D",color:"#20B2AA",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600 }}>
          + Add deposit
        </button>
      )}
    </div>
  );
}

// ── DebtForm ──────────────────────────────────────────────────────────────────
function DebtForm({ data, setData, onSave, onClose, T, mode }) {
  const ref = useRef(null);
  useEffect(()=>{ const t=setTimeout(()=>{ if(ref.current) ref.current.focus(); },80); return()=>clearTimeout(t); },[]);
  const inp = { width:"100%",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 12px",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:14,outline:"none",boxSizing:"border-box" };
  const sel = { ...inp,background:mode==="dark"?"#181B23":"#fff",cursor:"pointer" };
  const lbl = { fontSize:11,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",color:T.textMuted,display:"block",marginBottom:4,marginTop:12,fontFamily:"'DM Sans',sans-serif" };
  const DEBT_TYPES = [
    { id:"credit_card", label:"Credit Card",   emoji:"💳" },
    { id:"student_loan",label:"Student Loan",  emoji:"🎓" },
    { id:"personal",    label:"Personal Loan", emoji:"🏦" },
    { id:"car_loan",    label:"Car Loan",       emoji:"🚗" },
    { id:"mortgage",    label:"Mortgage",      emoji:"🏠" },
    { id:"medical",     label:"Medical Debt",  emoji:"💊" },
    { id:"other",       label:"Other",         emoji:"📋" },
  ];
  return (
    <div style={{ position:"fixed",inset:0,zIndex:50,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center" }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:540,maxHeight:"94vh",overflowY:"auto",padding:"24px 20px 40px",boxShadow:"0 -8px 40px rgba(0,0,0,0.3)" }}>
        <div style={{ width:40,height:4,borderRadius:2,background:T.textMuted,margin:"0 auto 20px",opacity:0.4 }}/>
        <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:22,color:T.text,marginBottom:4 }}>{data.id?"Edit":"Add"} Debt</div>
        <div style={{ height:2,width:40,background:"#E84E8A",borderRadius:2,marginBottom:18 }}/>

        <label style={lbl}>Name</label>
        <input ref={ref} style={inp} value={data.name||""} onChange={e=>setData(p=>({...p,name:e.target.value}))} placeholder="e.g. Chase Sapphire, Federal Student Loan..." onKeyDown={e=>{ if(e.key==="Enter"&&data.name?.trim()){e.preventDefault();onSave();}}}/>

        <label style={lbl}>Type</label>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,130px),1fr))",gap:6 }}>
          {DEBT_TYPES.map(dt=>(
            <button key={dt.id} onClick={()=>setData(p=>({...p,type:dt.id}))}
              style={{ padding:"8px 10px",borderRadius:9,border:`1px solid ${data.type===dt.id?"#E84E8A":T.border}`,background:data.type===dt.id?"#E84E8A18":"transparent",color:data.type===dt.id?"#E84E8A":T.text,fontFamily:"'DM Sans',sans-serif",fontSize:12,cursor:"pointer",fontWeight:data.type===dt.id?700:400,textAlign:"left" }}>
              {dt.emoji} {dt.label}
            </button>
          ))}
        </div>

        <label style={lbl}>Current Balance ($)</label>
        <input style={inp} type="number" min="0" step="0.01" value={data.balance||""} onChange={e=>setData(p=>({...p,balance:e.target.value}))} placeholder="0.00"/>

        <label style={lbl}>Credit Limit ($) — if applicable</label>
        <input style={inp} type="number" min="0" step="1" value={data.limit||""} onChange={e=>setData(p=>({...p,limit:e.target.value}))} placeholder="Leave blank if not a credit card"/>

        <label style={lbl}>APR / Interest Rate (%)</label>
        <input style={inp} type="number" min="0" step="0.01" value={data.apr||""} onChange={e=>setData(p=>({...p,apr:e.target.value}))} placeholder="e.g. 19.99"/>

        <label style={lbl}>Minimum Monthly Payment ($)</label>
        <input style={inp} type="number" min="0" step="0.01" value={data.minPayment||""} onChange={e=>setData(p=>({...p,minPayment:e.target.value}))} placeholder="0.00"/>

        <label style={lbl}>Payment Due Day (1–31)</label>
        <input style={inp} type="number" min="1" max="31" value={data.dueDay||""} onChange={e=>setData(p=>({...p,dueDay:e.target.value}))} placeholder="e.g. 15"/>

        <label style={lbl}>Notes (optional)</label>
        <input style={inp} value={data.notes||""} onChange={e=>setData(p=>({...p,notes:e.target.value}))} placeholder="Lender, account number last 4, etc."/>

        <div style={{ display:"flex",gap:10,marginTop:22,justifyContent:"flex-end" }}>
          <button style={{ padding:"10px 20px",borderRadius:10,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,background:T.inputBg,color:T.textSub }} onClick={onClose}>Cancel</button>
          <button style={{ padding:"10px 24px",borderRadius:10,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:700,background:"#E84E8A",color:"#fff" }} onClick={onSave}>Save Debt</button>
        </div>
      </div>
    </div>
  );
}

// ── DebtCard — module-level to avoid hooks-in-map ─────────────────────────────
function DebtCard({ debt, T, fmt, onEdit, onDelete, onPayment }) {
  const [showPay, setShowPay] = useState(false);
  const [payAmt,  setPayAmt]  = useState("");
  const DEBT_TYPE_INFO = {
    credit_card:  { emoji:"💳", label:"Credit Card",   color:"#E8704A" },
    student_loan: { emoji:"🎓", label:"Student Loan",  color:"#9B6EE8" },
    personal:     { emoji:"🏦", label:"Personal Loan", color:"#3B9EDB" },
    car_loan:     { emoji:"🚗", label:"Car Loan",      color:"#5BAD4E" },
    mortgage:     { emoji:"🏠", label:"Mortgage",      color:"#20B2AA" },
    medical:      { emoji:"💊", label:"Medical Debt",  color:"#E84E8A" },
    other:        { emoji:"📋", label:"Other Debt",    color:"#888D9B" },
  };
  const info = DEBT_TYPE_INFO[debt.type]||DEBT_TYPE_INFO.other;
  const utilization = debt.limit>0 ? Math.round((debt.balance/debt.limit)*100) : null;
  const highUtil = utilization!==null && utilization>30;
  // Monthly interest cost
  const monthlyInterest = debt.apr>0 ? Math.round((debt.balance*(debt.apr/100/12))*100)/100 : 0;
  // Months to payoff at min payment
  const payoffMonths = (()=>{
    if (!debt.minPayment||debt.minPayment<=0||!debt.balance) return null;
    if (debt.apr<=0) return Math.ceil(debt.balance/debt.minPayment);
    const r = debt.apr/100/12;
    if (debt.minPayment<=debt.balance*r) return null; // never pays off
    return Math.ceil(Math.log(debt.minPayment/(debt.minPayment-debt.balance*r))/Math.log(1+r));
  })();
  const totalPayments = (debt.payments||[]);
  const totalPaid = totalPayments.reduce((s,p)=>s+p.amount,0);

  return (
    <div style={{ background:"var(--surface,#181B23)",border:`1px solid var(--border,rgba(255,255,255,0.07))`,borderRadius:16,overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,0.1)" }}>
      {/* Header stripe */}
      <div style={{ background:`${info.color}18`,borderBottom:`1px solid ${info.color}33`,padding:"14px 18px",display:"flex",alignItems:"center",gap:10 }}>
        <div style={{ width:40,height:40,borderRadius:10,background:info.color+"22",border:`2px solid ${info.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0 }}>{info.emoji}</div>
        <div style={{ flex:1,minWidth:0 }}>
          <div style={{ fontSize:15,fontWeight:700,color:"var(--text,#EEEAE3)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{debt.name}</div>
          <div style={{ fontSize:11,color:info.color,fontWeight:600 }}>{info.label}{debt.apr>0?` · ${debt.apr}% APR`:""}</div>
        </div>
        <div style={{ display:"flex",gap:4,flexShrink:0 }}>
          <button onClick={()=>onEdit(debt)} style={{ background:"none",border:"none",color:"var(--textMuted,#3E424E)",cursor:"pointer",fontSize:14,padding:"3px" }}>✎</button>
          <button onClick={()=>onDelete(debt.id)} style={{ background:"none",border:"none",color:"var(--textMuted,#3E424E)",cursor:"pointer",fontSize:14,padding:"3px" }}>✕</button>
        </div>
      </div>

      <div style={{ padding:"16px 18px" }}>
        {/* Balance + utilization */}
        <div style={{ display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:12 }}>
          <div>
            <div style={{ fontSize:11,color:"var(--textSub,#888D9B)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:2 }}>Balance</div>
            <div style={{ fontSize:28,fontWeight:800,color:"#E84E8A",lineHeight:1 }}>{fmt(debt.balance)}</div>
            {debt.limit>0&&<div style={{ fontSize:11,color:"var(--textMuted,#3E424E)",marginTop:2 }}>of {fmt(debt.limit)} limit</div>}
          </div>
          {utilization!==null&&(
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:22,fontWeight:800,color:highUtil?"#E8704A":"#3DBF8A" }}>{utilization}%</div>
              <div style={{ fontSize:11,color:"var(--textSub,#888D9B)" }}>utilization</div>
              {highUtil&&<div style={{ fontSize:10,color:"#E8704A",fontWeight:600,marginTop:2 }}>⚠ Keep below 30%</div>}
            </div>
          )}
        </div>

        {/* Credit utilization bar */}
        {debt.limit>0&&(
          <div style={{ height:8,background:"var(--inputBg,rgba(255,255,255,0.05))",borderRadius:8,overflow:"hidden",marginBottom:14 }}>
            <div style={{ height:"100%",width:`${Math.min(100,utilization)}%`,background:utilization>80?"#E84E8A":utilization>30?"#E8704A":"#3DBF8A",borderRadius:8,transition:"width 0.5s" }}/>
          </div>
        )}

        {/* Stats grid */}
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14 }}>
          {[
            { l:"Min Payment",    v:debt.minPayment>0?fmt(debt.minPayment):"—",        c:"#E8A838" },
            { l:"Monthly Interest",v:monthlyInterest>0?fmt(monthlyInterest):"$0.00",   c:"#E84E8A" },
            { l:"Total Paid",     v:totalPaid>0?fmt(totalPaid):"$0.00",               c:"#3DBF8A" },
            { l:"Payoff Est.",    v:payoffMonths?`~${payoffMonths} mo`:"∞",            c:payoffMonths&&payoffMonths<36?"#3DBF8A":"#E8704A" },
          ].map(s=>(
            <div key={s.l} style={{ background:"var(--inputBg,rgba(255,255,255,0.05))",borderRadius:9,padding:"8px 10px" }}>
              <div style={{ fontSize:14,fontWeight:700,color:s.c }}>{s.v}</div>
              <div style={{ fontSize:10,color:"var(--textMuted,#3E424E)",textTransform:"uppercase",letterSpacing:"0.06em" }}>{s.l}</div>
            </div>
          ))}
        </div>

        {debt.dueDay&&<div style={{ fontSize:12,color:"#E8A838",marginBottom:12,fontWeight:600 }}>📅 Due on the {debt.dueDay}{["st","nd","rd"][((debt.dueDay%100)-11)%10<3?(debt.dueDay%10)-1:-1]||"th"} each month</div>}
        {debt.notes&&<div style={{ fontSize:12,color:"var(--textSub,#888D9B)",fontStyle:"italic",marginBottom:12 }}>{debt.notes}</div>}

        {/* Payment history (last 3) */}
        {totalPayments.length>0&&(
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:11,fontWeight:700,color:"var(--textSub,#888D9B)",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6 }}>Recent Payments</div>
            {[...totalPayments].reverse().slice(0,3).map(p=>(
              <div key={p.id} style={{ display:"flex",justifyContent:"space-between",fontSize:12,padding:"4px 0",borderBottom:"1px solid var(--border,rgba(255,255,255,0.07))" }}>
                <span style={{ color:"var(--textSub,#888D9B)" }}>{p.date}</span>
                <span style={{ color:"#3DBF8A",fontWeight:600 }}>-{fmt(p.amount)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Log payment */}
        {showPay ? (
          <div style={{ display:"flex",gap:6 }}>
            <input autoFocus type="number" min="0" step="0.01" placeholder={`Min: ${fmt(debt.minPayment||0)}`}
              style={{ flex:1,background:"var(--inputBg,rgba(255,255,255,0.05))",border:"1px solid #3DBF8A",borderRadius:8,padding:"8px 10px",color:"var(--text,#EEEAE3)",fontFamily:"'DM Sans',sans-serif",fontSize:13,outline:"none",boxSizing:"border-box" }}
              value={payAmt} onChange={e=>setPayAmt(e.target.value)}
              onKeyDown={e=>{ if(e.key==="Enter"&&payAmt){onPayment(debt.id,payAmt);setShowPay(false);setPayAmt("");} }}/>
            <button onClick={()=>{ onPayment(debt.id,payAmt); setShowPay(false); setPayAmt(""); }}
              style={{ padding:"8px 12px",borderRadius:8,border:"none",background:"#3DBF8A",color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700 }}>Pay</button>
            <button onClick={()=>setShowPay(false)}
              style={{ padding:"8px 10px",borderRadius:8,border:"1px solid var(--border,rgba(255,255,255,0.07))",background:"transparent",color:"var(--textSub,#888D9B)",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12 }}>✕</button>
          </div>
        ) : (
          <button onClick={()=>setShowPay(true)}
            style={{ width:"100%",padding:"9px",borderRadius:10,border:"1px solid #3DBF8A44",background:"#3DBF8A0D",color:"#3DBF8A",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700 }}>
            💳 Log a Payment
          </button>
        )}
      </div>
    </div>
  );
}

// ── DebtView ──────────────────────────────────────────────────────────────────
function DebtView({ debts, T, mode, focus, fmt, names, onAdd, onEdit, onDelete, onPayment }) {
  const totalBalance  = debts.reduce((s,d)=>s+d.balance,0);
  const totalMin      = debts.reduce((s,d)=>s+(d.minPayment||0),0);
  const totalInterest = debts.reduce((s,d)=>s+(d.apr>0?d.balance*(d.apr/100/12):0),0);
  const creditCards   = debts.filter(d=>d.type==="credit_card");
  const totalCCBalance= creditCards.reduce((s,d)=>s+d.balance,0);
  const totalCCLimit  = creditCards.reduce((s,d)=>s+(d.limit||0),0);
  const overallUtil   = totalCCLimit>0?Math.round((totalCCBalance/totalCCLimit)*100):null;

  const card = (ex={}) => ({ background:T.surface,border:`1px solid ${T.border}`,borderRadius:16,boxShadow:"0 2px 12px rgba(0,0,0,0.07)",...ex });

  return (
    <div>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:8 }}>
        <div>
          <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:24,color:T.text }}>Debt Tracker 💳</div>
          <div style={{ fontSize:13,color:T.textSub,marginTop:2 }}>{debts.length} account{debts.length!==1?"s":""} · Track balances, payments & payoff progress</div>
        </div>
        <button onClick={onAdd} style={{ height:36,padding:"0 16px",borderRadius:9,border:"none",background:"#E84E8A",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,color:"#fff" }}>+ Add Debt</button>
      </div>

      {/* Summary cards */}
      <div className="ba-g4">
        {[
          { l:"Total Debt",         v:fmt(totalBalance),           c:"#E84E8A", icon:"💳", sub:`${debts.length} accounts` },
          { l:"Monthly Minimums",   v:fmt(totalMin),               c:"#E8704A", icon:"📅", sub:"minimum payments" },
          { l:"Monthly Interest",   v:fmt(Math.round(totalInterest*100)/100), c:"#E8883A", icon:"📈", sub:"interest cost" },
          { l:"CC Utilization",     v:overallUtil!==null?`${overallUtil}%`:"—", c:overallUtil>30?"#E8704A":"#3DBF8A", icon:"📊", sub:overallUtil>30?"Keep below 30%":"Looking good!" },
        ].map(s=>(
          <div key={s.l} style={{ ...card(),padding:"16px 18px",borderLeft:`4px solid ${s.c}`,position:"relative",overflow:"hidden" }}>
            <div style={{ position:"absolute",top:10,right:12,fontSize:22,opacity:0.1 }}>{s.icon}</div>
            <div style={{ fontSize:20,fontWeight:800,color:T.text,lineHeight:1 }}>{s.v}</div>
            <div style={{ fontSize:10,fontWeight:700,color:T.textSub,marginTop:3,textTransform:"uppercase",letterSpacing:"0.08em" }}>{s.l}</div>
            <div style={{ fontSize:11,color:s.c,marginTop:2,fontWeight:600 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Debt avalanche tip */}
      {debts.length>1&&(
        <div style={{ ...card(),padding:"14px 18px",marginBottom:20,borderLeft:"4px solid #9B6EE8",background:"#9B6EE808" }}>
          <div style={{ display:"flex",gap:10,alignItems:"flex-start" }}>
            <span style={{ fontSize:18,flexShrink:0 }}>💡</span>
            <div>
              <div style={{ fontSize:13,fontWeight:700,color:"#9B6EE8",marginBottom:3 }}>Debt Avalanche Strategy</div>
              <div style={{ fontSize:12,color:T.textSub,lineHeight:1.6 }}>
                Pay minimums on all debts, then put every extra dollar toward the <strong style={{ color:T.text }}>{[...debts].sort((a,b)=>b.apr-a.apr)[0]?.name}</strong> ({[...debts].sort((a,b)=>b.apr-a.apr)[0]?.apr}% APR) first — this saves the most in interest over time.
              </div>
            </div>
          </div>
        </div>
      )}

      {debts.length===0 ? (
        <div style={{ ...card(),padding:"60px 20px",textAlign:"center" }}>
          <div style={{ fontSize:44,marginBottom:12 }}>💳</div>
          <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:20,color:T.text,marginBottom:6 }}>No debts tracked</div>
          <div style={{ fontSize:13,color:T.textSub,lineHeight:1.6,marginBottom:16 }}>Add your credit cards, student loans, or any other debts<br/>to track balances and payoff progress.</div>
          <button onClick={onAdd} style={{ padding:"10px 20px",borderRadius:10,border:"none",background:"#E84E8A",color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:700 }}>+ Add First Debt</button>
        </div>
      ) : (
        <div className="ba-debt">
          {[...debts].sort((a,b)=>b.apr-a.apr).map(d=>(
            <div key={d.id} style={{ "--surface":T.surface,"--border":T.border,"--text":T.text,"--textSub":T.textSub,"--textMuted":T.textMuted,"--inputBg":T.inputBg }}>
              <DebtCard debt={d} T={T} fmt={fmt} onEdit={onEdit} onDelete={onDelete} onPayment={onPayment}/>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ReportView ────────────────────────────────────────────────────────────────
function ReportView({ lines, goals, debts, assets, liabs, month, year, focus, focusName, names,
  T, mode, fmt, BUDGET_MONTHS, reportPeriod, setReportPeriod, totalAssets, totalLiabs, totalDebtBalance, netWorth }) {

  const totalAllocated = lines.reduce((s,l)=>s+l.allocated,0);
  const totalSpent     = lines.reduce((s,l)=>s+l.spent,0);
  const remaining      = totalAllocated - totalSpent;
  const overBudget     = remaining < 0;
  const savingsRate    = totalAllocated>0 ? Math.round(((totalAllocated-totalSpent)/totalAllocated)*100) : 0;

  const BUDGET_CATS_MAP = Object.fromEntries(
    [{ id:"housing",emoji:"🏠",label:"Housing",color:"#3B9EDB"},{ id:"food",emoji:"🍽️",label:"Food & Dining",color:"#E8A838"},{ id:"transport",emoji:"🚗",label:"Transport",color:"#9B6EE8"},{ id:"health",emoji:"💊",label:"Health",color:"#3DBF8A"},{ id:"education",emoji:"🎓",label:"Education",color:"#7B61FF"},{ id:"faith",emoji:"✦",label:"Faith & Giving",color:"#E8C050"},{ id:"savings",emoji:"💰",label:"Savings",color:"#20B2AA"},{ id:"shopping",emoji:"🛍️",label:"Shopping",color:"#E84E8A"},{ id:"utilities",emoji:"⚡",label:"Utilities",color:"#E8883A"},{ id:"invest",emoji:"📈",label:"Investing",color:"#5BAD4E"},{ id:"personal",emoji:"🌱",label:"Personal",color:"#C8B030"},{ id:"sub",emoji:"📱",label:"Subscriptions",color:"#8B5CF6"},{ id:"other",emoji:"📦",label:"Other",color:"#888D9B"}]
    .map(c=>[c.id,c])
  );

  // Category analysis
  const catRollup = Object.values(
    lines.reduce((acc,l)=>{ if(!acc[l.category]) acc[l.category]={...BUDGET_CATS_MAP[l.category]||{id:l.category,label:l.category,emoji:"📦",color:"#888"},allocated:0,spent:0,items:[]}; acc[l.category].allocated+=l.allocated; acc[l.category].spent+=l.spent; acc[l.category].items.push(l); return acc; },{})
  ).sort((a,b)=>b.spent-a.spent);

  const overCategories = catRollup.filter(c=>c.spent>c.allocated&&c.allocated>0);
  const underCategories= catRollup.filter(c=>c.spent<c.allocated&&c.allocated>0);
  const goalsReached   = goals.filter(g=>g.saved>=g.target);
  const goalsInProgress= goals.filter(g=>g.saved<g.target);
  const totalMonthlyMin= debts.reduce((s,d)=>s+(d.minPayment||0),0);

  // Scorecard
  const scores = [
    { label:"Stayed in budget",    pass:!overBudget,                           icon:!overBudget?"✅":"❌" },
    { label:"Savings rate ≥ 20%",  pass:savingsRate>=20,                       icon:savingsRate>=20?"✅":"⚠️" },
    { label:"No overspent categories", pass:overCategories.length===0,         icon:overCategories.length===0?"✅":"❌" },
    { label:"Goals on track",      pass:goalsInProgress.every(g=>{ if(!g.deadline) return true; const d=Math.ceil((new Date(g.deadline+"T00:00:00")-new Date())/86400000); return d>0; }), icon:"📊" },
    { label:"Debt decreasing",     pass:debts.every(d=>(d.payments||[]).length>0), icon:debts.length>0&&debts.every(d=>(d.payments||[]).length>0)?"✅":"📋" },
  ];
  const passed = scores.filter(s=>s.pass).length;

  const gradeColor = passed>=4?"#3DBF8A":passed>=3?"#E8A838":"#E84E8A";
  const gradeLabel = passed>=4?"Excellent 🏆":passed>=3?"Good Work ⭐":passed>=2?"Needs Work 📈":"Let's Improve 💪";

  const card = (ex={}) => ({ background:T.surface,border:`1px solid ${T.border}`,borderRadius:16,boxShadow:"0 2px 12px rgba(0,0,0,0.07)",...ex });

  return (
    <div>
      {/* Header + period toggle */}
      <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:12 }}>
        <div>
          <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:24,color:T.text }}>📄 Financial Report</div>
          <div style={{ fontSize:13,color:T.textSub,marginTop:2 }}>{focusName} · {BUDGET_MONTHS[month]} {year}</div>
        </div>
        <div style={{ display:"flex",background:T.inputBg,borderRadius:9,padding:2,border:`1px solid ${T.border}`,gap:2 }}>
          {[["month","Monthly"],["year","Yearly"]].map(([v,l])=>(
            <button key={v} onClick={()=>setReportPeriod(v)} style={{ padding:"5px 14px",borderRadius:7,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,background:reportPeriod===v?"#20B2AA":"transparent",color:reportPeriod===v?"#fff":T.textSub,transition:"all 0.15s" }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Overall scorecard */}
      <div style={{ ...card(),padding:"24px",marginBottom:20,borderTop:`4px solid ${gradeColor}`,background:gradeColor+"08" }}>
        <div style={{ display:"flex",alignItems:"center",gap:16,flexWrap:"wrap" }}>
          <div style={{ textAlign:"center",flexShrink:0 }}>
            <div style={{ fontSize:48,fontWeight:900,color:gradeColor,lineHeight:1 }}>{passed}/{scores.length}</div>
            <div style={{ fontSize:11,color:T.textSub,marginTop:4,textTransform:"uppercase",letterSpacing:"0.08em" }}>Score</div>
          </div>
          <div style={{ flex:1,minWidth:200 }}>
            <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:20,color:T.text,marginBottom:8 }}>{gradeLabel}</div>
            <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
              {scores.map((s,i)=>(
                <div key={i} style={{ display:"flex",alignItems:"center",gap:8,fontSize:13 }}>
                  <span style={{ fontSize:14,flexShrink:0 }}>{s.icon}</span>
                  <span style={{ color:s.pass?T.text:T.textSub,textDecoration:s.pass?"none":"none" }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Key numbers */}
      <div className="ba-g4">
        {[
          { l:"Total Budgeted",   v:fmt(totalAllocated), c:"#3B9EDB" },
          { l:"Total Spent",      v:fmt(totalSpent),     c:"#E84E8A" },
          { l:overBudget?"Over Budget":"Saved",  v:fmt(Math.abs(remaining)), c:overBudget?"#E84E8A":"#3DBF8A" },
          { l:"Savings Rate",     v:`${savingsRate}%`,   c:savingsRate>=20?"#3DBF8A":"#E8A838" },
          { l:"Net Worth",        v:fmt(netWorth),       c:netWorth>=0?"#3DBF8A":"#E84E8A" },
          { l:"Total Debt",       v:fmt(totalDebtBalance), c:"#E8704A" },
        ].map(s=>(
          <div key={s.l} style={{ ...card(),padding:"14px 16px",borderLeft:`3px solid ${s.c}` }}>
            <div style={{ fontSize:18,fontWeight:800,color:T.text,lineHeight:1 }}>{s.v}</div>
            <div style={{ fontSize:10,fontWeight:700,color:T.textSub,marginTop:3,textTransform:"uppercase",letterSpacing:"0.08em" }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Written narrative */}
      <div style={{ ...card(),padding:"24px",marginBottom:20,background:mode==="dark"?"linear-gradient(135deg,#0d1a14,#0a1220)":"linear-gradient(135deg,#f0fff8,#e8f4ff)" }}>
        <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:18,color:T.text,marginBottom:16 }}>📝 Your {BUDGET_MONTHS[month]} {year} Summary</div>
        <div style={{ fontSize:14,color:T.text,lineHeight:1.9,fontFamily:"'DM Sans',sans-serif" }}>
          <p style={{ margin:"0 0 10px" }}>
            In <strong>{BUDGET_MONTHS[month]} {year}</strong>, <strong style={{ color:"#20B2AA" }}>{focusName}</strong> {overBudget
              ? <span>went <strong style={{ color:"#E84E8A" }}>over budget by {fmt(Math.abs(remaining))}</strong>. Total spending was {fmt(totalSpent)} against a planned budget of {fmt(totalAllocated)}.</span>
              : <span><strong style={{ color:"#3DBF8A" }}>stayed within budget</strong>, spending {fmt(totalSpent)} out of a planned {fmt(totalAllocated)} — leaving <strong style={{ color:"#3DBF8A" }}>{fmt(remaining)}</strong> unspent.</span>
            }
          </p>

          {overCategories.length>0&&(
            <p style={{ margin:"0 0 10px",color:"#E84E8A" }}>
              ⚠️ Categories that went over: {overCategories.map(c=>`${c.emoji} ${c.label} (over by ${fmt(c.spent-c.allocated)})`).join(", ")}.
            </p>
          )}

          {underCategories.length>0&&(
            <p style={{ margin:"0 0 10px",color:"#3DBF8A" }}>
              ✅ Categories with budget left: {underCategories.slice(0,3).map(c=>`${c.emoji} ${c.label} (${fmt(c.allocated-c.spent)} remaining)`).join(", ")}{underCategories.length>3?` and ${underCategories.length-3} more`:"" }.
            </p>
          )}

          {savingsRate>0&&(
            <p style={{ margin:"0 0 10px" }}>
              💰 Savings rate this month: <strong style={{ color:savingsRate>=20?"#3DBF8A":"#E8A838" }}>{savingsRate}%</strong>
              {savingsRate>=20?" — great job, above the 20% target!":" — aim for 20% or more to build financial security."}
            </p>
          )}

          {goalsReached.length>0&&(
            <p style={{ margin:"0 0 10px",color:"#3DBF8A" }}>
              🏆 Goals reached: {goalsReached.map(g=>`${g.emoji||"💰"} ${g.name}`).join(", ")}. Amazing work!
            </p>
          )}

          {goalsInProgress.length>0&&(
            <p style={{ margin:"0 0 10px" }}>
              🎯 Goals still in progress: {goalsInProgress.slice(0,3).map(g=>`${g.emoji||"💰"} ${g.name} (${g.target>0?Math.round((g.saved/g.target)*100):0}%)`).join(", ")}.
            </p>
          )}

          {debts.length>0&&(
            <p style={{ margin:"0 0 10px" }}>
              💳 You have <strong>{debts.length}</strong> active debt{debts.length!==1?"s":""} with a total balance of <strong style={{ color:"#E84E8A" }}>{fmt(totalDebtBalance)}</strong>. Monthly minimum payments total <strong>{fmt(totalMonthlyMin)}</strong>.
            </p>
          )}

          {netWorth>=0
            ? <p style={{ margin:0,color:"#3DBF8A" }}>📈 Net worth: <strong>{fmt(netWorth)}</strong> — you own more than you owe. Keep building!</p>
            : <p style={{ margin:0,color:"#E84E8A" }}>📉 Net worth: <strong>{fmt(netWorth)}</strong> — your debts currently exceed your assets. Focus on paying down debt and building savings.</p>
          }
        </div>
      </div>

      {/* Category breakdown table */}
      {catRollup.length>0&&(
        <div style={{ ...card(),padding:"20px",marginBottom:20 }}>
          <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:17,color:T.text,marginBottom:14 }}>Category Breakdown</div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 80px 80px 70px",gap:8,padding:"6px 8px",background:T.inputBg,borderRadius:8,marginBottom:8,fontSize:10,fontWeight:700,color:T.textMuted,textTransform:"uppercase" }}>
            <span>Category</span><span style={{ textAlign:"right" }}>Budget</span><span style={{ textAlign:"right" }}>Spent</span><span style={{ textAlign:"right" }}>Status</span>
          </div>
          {catRollup.map(cat=>{
            const over=cat.spent>cat.allocated&&cat.allocated>0;
            const diff=cat.allocated-cat.spent;
            return (
              <div key={cat.id} style={{ display:"grid",gridTemplateColumns:"1fr 80px 80px 70px",gap:8,padding:"8px",borderBottom:`1px solid ${T.border}`,alignItems:"center" }}>
                <span style={{ fontSize:13,color:T.text }}>{cat.emoji||"📦"} {cat.label||cat.id}</span>
                <span style={{ fontSize:12,color:T.textSub,textAlign:"right" }}>{fmt(cat.allocated)}</span>
                <span style={{ fontSize:12,fontWeight:600,color:over?"#E84E8A":"#3DBF8A",textAlign:"right" }}>{fmt(cat.spent)}</span>
                <span style={{ fontSize:11,fontWeight:700,color:over?"#E84E8A":"#3DBF8A",textAlign:"right",whiteSpace:"nowrap" }}>{over?"⚠ -":"✓ +"}{fmt(Math.abs(diff))}</span>
              </div>
            );
          })}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 80px 80px 70px",gap:8,padding:"8px",background:T.inputBg,borderRadius:8,marginTop:6,fontSize:13,fontWeight:700 }}>
            <span style={{ color:T.text }}>Total</span>
            <span style={{ textAlign:"right",color:T.text }}>{fmt(totalAllocated)}</span>
            <span style={{ textAlign:"right",color:overBudget?"#E84E8A":"#3DBF8A" }}>{fmt(totalSpent)}</span>
            <span style={{ textAlign:"right",color:overBudget?"#E84E8A":"#3DBF8A" }}>{overBudget?"❌":"✅"}</span>
          </div>
        </div>
      )}

      {/* Goals status */}
      {goals.length>0&&(
        <div style={{ ...card(),padding:"20px",marginBottom:20 }}>
          <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:17,color:T.text,marginBottom:14 }}>Goals Status</div>
          {goals.map(g=>{
            const pct=g.target>0?Math.min(100,Math.round((g.saved/g.target)*100)):0;
            const reached=g.saved>=g.target;
            const dLeft=g.deadline?Math.ceil((new Date(g.deadline+"T00:00:00")-new Date())/86400000):null;
            return (
              <div key={g.id} style={{ marginBottom:14 }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5,flexWrap:"wrap",gap:4 }}>
                  <span style={{ fontSize:13,color:T.text,fontWeight:600 }}>{g.emoji||"💰"} {g.name}</span>
                  <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                    {reached&&<span style={{ fontSize:12,color:"#3DBF8A",fontWeight:700 }}>🏆 Reached!</span>}
                    {!reached&&dLeft!==null&&<span style={{ fontSize:11,color:dLeft<30?"#E84E8A":"#E8A838" }}>📅 {dLeft>0?`${dLeft}d left`:"Past deadline"}</span>}
                    <span style={{ fontSize:12,fontWeight:700,color:reached?"#3DBF8A":"#20B2AA" }}>{pct}%</span>
                  </div>
                </div>
                <div style={{ height:8,background:T.inputBg,borderRadius:8,overflow:"hidden" }}>
                  <div style={{ height:"100%",width:`${pct}%`,background:reached?"linear-gradient(90deg,#3DBF8A,#20B2AA)":"linear-gradient(90deg,#20B2AA,#3B9EDB)",borderRadius:8,transition:"width 0.5s" }}/>
                </div>
                <div style={{ fontSize:11,color:T.textMuted,marginTop:3 }}>{fmt(g.saved)} saved of {fmt(g.target)} target</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recommendations */}
      <div style={{ ...card(),padding:"20px",borderTop:"4px solid #9B6EE8" }}>
        <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:17,color:T.text,marginBottom:14 }}>💡 Recommendations</div>
        <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
          {overBudget&&<div style={{ padding:"10px 14px",background:"#E84E8A10",borderRadius:10,borderLeft:"3px solid #E84E8A",fontSize:13,color:T.text,lineHeight:1.6 }}>🔴 <strong>You overspent this month.</strong> Review {overCategories.map(c=>c.emoji+" "+c.label).join(", ")} and set stricter limits next month.</div>}
          {savingsRate<20&&totalAllocated>0&&<div style={{ padding:"10px 14px",background:"#E8A83810",borderRadius:10,borderLeft:"3px solid #E8A838",fontSize:13,color:T.text,lineHeight:1.6 }}>⚠️ <strong>Savings rate below 20%.</strong> Try to reduce discretionary spending or increase income to hit the 20% target.</div>}
          {debts.length>0&&<div style={{ padding:"10px 14px",background:"#9B6EE810",borderRadius:10,borderLeft:"3px solid #9B6EE8",fontSize:13,color:T.text,lineHeight:1.6 }}>💳 <strong>Debt strategy:</strong> Pay minimums on all debts, then attack <strong>{[...debts].sort((a,b)=>b.apr-a.apr)[0]?.name}</strong> first (highest APR at {[...debts].sort((a,b)=>b.apr-a.apr)[0]?.apr}%).</div>}
          {goalsInProgress.length>0&&<div style={{ padding:"10px 14px",background:"#20B2AA10",borderRadius:10,borderLeft:"3px solid #20B2AA",fontSize:13,color:T.text,lineHeight:1.6 }}>🎯 <strong>Keep saving!</strong> {goalsInProgress.length} goal{goalsInProgress.length!==1?"s":""} in progress. Even small consistent deposits add up.</div>}
          {!overBudget&&savingsRate>=20&&<div style={{ padding:"10px 14px",background:"#3DBF8A10",borderRadius:10,borderLeft:"3px solid #3DBF8A",fontSize:13,color:T.text,lineHeight:1.6 }}>✅ <strong>Great month!</strong> You stayed in budget and hit your savings target. Consider investing any extra surplus.</div>}
        </div>
      </div>
    </div>
  );
}


// ── IncomeForm ────────────────────────────────────────────────────────────────
function IncomeForm({ data, onSave, onClose, T, mode }) {
  const [d, setD] = useState({...data});
  const ref = useRef(null);
  useEffect(()=>{ const t=setTimeout(()=>{ if(ref.current) ref.current.focus(); },80); return()=>clearTimeout(t); },[]);
  const inp = { width:"100%",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 12px",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:14,outline:"none",boxSizing:"border-box" };
  const sel = { ...inp,background:mode==="dark"?"#181B23":"#fff",cursor:"pointer" };
  const lbl = { fontSize:11,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",color:T.textMuted,display:"block",marginBottom:4,marginTop:12,fontFamily:"'DM Sans',sans-serif" };
  return (
    <div style={{ position:"fixed",inset:0,zIndex:50,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center" }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:480,maxHeight:"90vh",overflowY:"auto",padding:"24px 20px 40px",boxShadow:"0 -8px 40px rgba(0,0,0,0.3)" }}>
        <div style={{ width:40,height:4,borderRadius:2,background:T.textMuted,margin:"0 auto 20px",opacity:0.4 }}/>
        <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:22,color:T.text,marginBottom:4 }}>{d.id?"Edit":"Add"} Income 💵</div>
        <div style={{ height:2,width:40,background:"#3DBF8A",borderRadius:2,marginBottom:18 }}/>
        <label style={lbl}>Source Name</label>
        <input ref={ref} style={inp} value={d.name||""} onChange={e=>setD(p=>({...p,name:e.target.value}))} placeholder="e.g. TA Stipend, Salary, Freelance..." onKeyDown={e=>{ if(e.key==="Enter"&&d.name?.trim()&&d.amount){e.preventDefault();onSave(d);}}}/>
        <label style={lbl}>Amount ($)</label>
        <input style={inp} type="number" min="0" step="0.01" value={d.amount||""} onChange={e=>setD(p=>({...p,amount:e.target.value}))} placeholder="0.00"/>
        <label style={lbl}>Date Received</label>
        <input type="date" style={sel} value={d.date||new Date().toISOString().slice(0,10)} onChange={e=>setD(p=>({...p,date:e.target.value}))}/>
        <label style={lbl}>Recurring</label>
        <div style={{ display:"flex",gap:6 }}>
          {[["none","One-time"],["monthly","Monthly"],["biweekly","Bi-weekly"],["weekly","Weekly"]].map(([v,l])=>(
            <button key={v} onClick={()=>setD(p=>({...p,recurring:v}))}
              style={{ flex:1,padding:"7px 4px",borderRadius:8,border:`1px solid ${(d.recurring||"none")===v?"#3DBF8A":T.border}`,background:(d.recurring||"none")===v?"#3DBF8A18":"transparent",color:(d.recurring||"none")===v?"#3DBF8A":T.text,fontFamily:"'DM Sans',sans-serif",fontSize:11,cursor:"pointer",fontWeight:(d.recurring||"none")===v?700:400 }}>
              {l}
            </button>
          ))}
        </div>
        <label style={lbl}>Notes (optional)</label>
        <input style={inp} value={d.notes||""} onChange={e=>setD(p=>({...p,notes:e.target.value}))} placeholder="Any details..."/>
        <div style={{ display:"flex",gap:10,marginTop:22,justifyContent:"flex-end" }}>
          <button style={{ padding:"10px 20px",borderRadius:10,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,background:T.inputBg,color:T.textSub }} onClick={onClose}>Cancel</button>
          <button style={{ padding:"10px 24px",borderRadius:10,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:700,background:"#3DBF8A",color:"#fff" }} onClick={()=>onSave(d)}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ── TxForm — log an actual expense transaction ────────────────────────────────
function TxForm({ data, onSave, onClose, T, mode }) {
  const [d, setD] = useState({...data});
  const ref = useRef(null);
  useEffect(()=>{ const t=setTimeout(()=>{ if(ref.current) ref.current.focus(); },80); return()=>clearTimeout(t); },[]);
  const inp = { width:"100%",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 12px",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:14,outline:"none",boxSizing:"border-box" };
  const sel = { ...inp,background:mode==="dark"?"#181B23":"#fff",cursor:"pointer" };
  const lbl = { fontSize:11,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",color:T.textMuted,display:"block",marginBottom:4,marginTop:12,fontFamily:"'DM Sans',sans-serif" };
  return (
    <div style={{ position:"fixed",inset:0,zIndex:50,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center" }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:480,maxHeight:"90vh",overflowY:"auto",padding:"24px 20px 40px",boxShadow:"0 -8px 40px rgba(0,0,0,0.3)" }}>
        <div style={{ width:40,height:4,borderRadius:2,background:T.textMuted,margin:"0 auto 20px",opacity:0.4 }}/>
        <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:22,color:T.text,marginBottom:4 }}>{d.id?"Edit":"Log"} Expense 💸</div>
        <div style={{ height:2,width:40,background:"#E84E8A",borderRadius:2,marginBottom:18 }}/>
        <label style={lbl}>What did you spend on?</label>
        <input ref={ref} style={inp} value={d.name||""} onChange={e=>setD(p=>({...p,name:e.target.value}))} placeholder="e.g. Groceries, Rent, Gas, Giving..." onKeyDown={e=>{ if(e.key==="Enter"&&d.name?.trim()&&d.amount){e.preventDefault();onSave(d);}}}/>
        <label style={lbl}>Amount ($)</label>
        <input style={inp} type="number" min="0" step="0.01" value={d.amount||""} onChange={e=>setD(p=>({...p,amount:e.target.value}))} placeholder="0.00"/>
        <label style={lbl}>Category</label>
        <select style={sel} value={d.category||"other"} onChange={e=>setD(p=>({...p,category:e.target.value}))}>
          {[
            {id:"housing",label:"🏠 Housing"},{id:"food",label:"🍽️ Food & Dining"},
            {id:"transport",label:"🚗 Transport"},{id:"health",label:"💊 Health"},
            {id:"education",label:"🎓 Education"},{id:"faith",label:"✦ Faith & Giving"},
            {id:"savings",label:"💰 Savings"},{id:"shopping",label:"🛍️ Shopping"},
            {id:"utilities",label:"⚡ Utilities"},{id:"invest",label:"📈 Investing"},
            {id:"sub",label:"📱 Subscriptions"},{id:"personal",label:"🌱 Personal"},
            {id:"other",label:"📦 Other"},
          ].map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <label style={lbl}>Date</label>
        <input type="date" style={sel} value={d.date||new Date().toISOString().slice(0,10)} onChange={e=>setD(p=>({...p,date:e.target.value}))}/>
        <label style={lbl}>Notes (optional)</label>
        <input style={inp} value={d.notes||""} onChange={e=>setD(p=>({...p,notes:e.target.value}))} placeholder="Any details..."/>
        <div style={{ display:"flex",gap:10,marginTop:22,justifyContent:"flex-end" }}>
          <button style={{ padding:"10px 20px",borderRadius:10,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,background:T.inputBg,color:T.textSub }} onClick={onClose}>Cancel</button>
          <button style={{ padding:"10px 24px",borderRadius:10,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:700,background:"#E84E8A",color:"#fff" }} onClick={()=>onSave(d)}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ── BudgetCatForm — set a budget limit for a category ────────────────────────
function BudgetCatForm({ data, onSave, onClose, T, mode }) {
  const [d, setD] = useState(data || { name:"",category:"other",limit:"",notes:"" });
  const ref = useRef(null);
  useEffect(()=>{ const t=setTimeout(()=>{ if(ref.current) ref.current.focus(); },80); return()=>clearTimeout(t); },[]);
  const inp = { width:"100%",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 12px",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:14,outline:"none",boxSizing:"border-box" };
  const sel = { ...inp,background:mode==="dark"?"#181B23":"#fff",cursor:"pointer" };
  const lbl = { fontSize:11,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",color:T.textMuted,display:"block",marginBottom:4,marginTop:12,fontFamily:"'DM Sans',sans-serif" };
  const CATS = [{id:"housing",l:"🏠 Housing"},{id:"food",l:"🍽️ Food & Dining"},{id:"transport",l:"🚗 Transport"},{id:"health",l:"💊 Health"},{id:"education",l:"🎓 Education"},{id:"faith",l:"✦ Faith & Giving"},{id:"savings",l:"💰 Savings"},{id:"shopping",l:"🛍️ Shopping"},{id:"utilities",l:"⚡ Utilities"},{id:"invest",l:"📈 Investing"},{id:"sub",l:"📱 Subscriptions"},{id:"personal",l:"🌱 Personal"},{id:"other",l:"📦 Other"}];
  return (
    <div style={{ position:"fixed",inset:0,zIndex:50,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center" }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:480,maxHeight:"90vh",overflowY:"auto",padding:"24px 20px 40px",boxShadow:"0 -8px 40px rgba(0,0,0,0.3)" }}>
        <div style={{ width:40,height:4,borderRadius:2,background:T.textMuted,margin:"0 auto 20px",opacity:0.4 }}/>
        <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:22,color:T.text,marginBottom:4 }}>{d.id?"Edit":"New"} Budget Category</div>
        <div style={{ height:2,width:40,background:"#20B2AA",borderRadius:2,marginBottom:6 }}/>
        <div style={{ fontSize:13,color:T.textSub,marginBottom:18,lineHeight:1.6 }}>
          Set a monthly spending limit for a category. As you log expenses in that category, the app tracks how much you've used.
        </div>
        <label style={lbl}>Name (e.g. Rent, Groceries, Giving)</label>
        <input ref={ref} style={inp} value={d.name||""} onChange={e=>setD(p=>({...p,name:e.target.value}))} placeholder="e.g. Rent, Groceries, Church Giving..." onKeyDown={e=>{ if(e.key==="Enter"&&d.name?.trim()&&d.limit){e.preventDefault();onSave(d);}}}/>
        <label style={lbl}>Category</label>
        <select style={sel} value={d.category||"other"} onChange={e=>setD(p=>({...p,category:e.target.value}))}>
          {CATS.map(c=><option key={c.id} value={c.id}>{c.l}</option>)}
        </select>
        <label style={lbl}>Monthly Limit ($)</label>
        <input style={inp} type="number" min="0" step="0.01" value={d.limit||""} onChange={e=>setD(p=>({...p,limit:e.target.value}))} placeholder="e.g. 850"/>
        <label style={lbl}>Notes (optional)</label>
        <input style={inp} value={d.notes||""} onChange={e=>setD(p=>({...p,notes:e.target.value}))} placeholder="Any context..."/>
        <div style={{ display:"flex",gap:10,marginTop:22,justifyContent:"flex-end" }}>
          <button style={{ padding:"10px 20px",borderRadius:10,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,background:T.inputBg,color:T.textSub }} onClick={onClose}>Cancel</button>
          <button style={{ padding:"10px 24px",borderRadius:10,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:700,background:"#20B2AA",color:"#fff" }} onClick={()=>onSave(d)}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ── UnifiedTxForm — logs income OR expense, one simple form ───────────────────
function UnifiedTxForm({ data, prefill, onSave, onClose, T, mode }) {
  const defaultType = prefill?.type || data?.type || "expense";
  const defaultCat  = prefill?.category || data?.category || "other";
  const defaultCatId= prefill?.catId || data?.catId || null;
  const [d, setD] = useState(data || { type:defaultType, name:"", amount:"", category:defaultCat, catId:defaultCatId, date:new Date().toISOString().slice(0,10), notes:"" });
  const ref = useRef(null);
  useEffect(()=>{ const t=setTimeout(()=>{ if(ref.current) ref.current.focus(); },80); return()=>clearTimeout(t); },[]);
  const isIncome = d.type==="income";
  const inp = { width:"100%",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 12px",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:14,outline:"none",boxSizing:"border-box" };
  const sel = { ...inp,background:mode==="dark"?"#181B23":"#fff",cursor:"pointer" };
  const lbl = { fontSize:11,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",color:T.textMuted,display:"block",marginBottom:4,marginTop:12,fontFamily:"'DM Sans',sans-serif" };
  const CATS = [{id:"housing",l:"🏠 Housing"},{id:"food",l:"🍽️ Food & Dining"},{id:"transport",l:"🚗 Transport"},{id:"health",l:"💊 Health"},{id:"education",l:"🎓 Education"},{id:"faith",l:"✦ Faith & Giving"},{id:"savings",l:"💰 Savings"},{id:"shopping",l:"🛍️ Shopping"},{id:"utilities",l:"⚡ Utilities"},{id:"invest",l:"📈 Investing"},{id:"sub",l:"📱 Subscriptions"},{id:"personal",l:"🌱 Personal"},{id:"other",l:"📦 Other"}];
  return (
    <div style={{ position:"fixed",inset:0,zIndex:50,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center" }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:480,maxHeight:"90vh",overflowY:"auto",padding:"24px 20px 40px",boxShadow:"0 -8px 40px rgba(0,0,0,0.3)" }}>
        <div style={{ width:40,height:4,borderRadius:2,background:T.textMuted,margin:"0 auto 20px",opacity:0.4 }}/>
        {/* Type toggle */}
        <div style={{ display:"flex",gap:8,marginBottom:18 }}>
          {[["income","💵 Income","#3DBF8A"],["expense","💸 Expense","#E84E8A"]].map(([v,l,col])=>(
            <button key={v} onClick={()=>setD(p=>({...p,type:v}))}
              style={{ flex:1,padding:"11px",borderRadius:12,border:`2px solid ${d.type===v?col:T.border}`,background:d.type===v?col+"15":"transparent",color:d.type===v?col:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:14,cursor:"pointer",fontWeight:d.type===v?700:400,transition:"all 0.15s" }}>
              {l}
            </button>
          ))}
        </div>
        {d.catId&&d.catName&&(
          <div style={{ background:T.inputBg,borderRadius:9,padding:"8px 12px",marginBottom:4,display:"flex",alignItems:"center",gap:8,border:`1px solid ${T.border}` }}>
            <span style={{ fontSize:13,color:T.textSub }}>Logging against:</span>
            <span style={{ fontSize:13,fontWeight:700,color:"#20B2AA" }}>{d.catName}</span>
          </div>
        )}
        <label style={lbl}>{isIncome?"Source":"Description (what exactly did you buy?)"}</label>
        <input ref={ref} style={inp} value={d.name||""} onChange={e=>setD(p=>({...p,name:e.target.value}))} placeholder={isIncome?"e.g. TA Stipend, Salary, Freelance...":"e.g. Walmart groceries, Shell gas, Sunday offering..."} onKeyDown={e=>{ if(e.key==="Enter"&&d.name?.trim()&&d.amount){e.preventDefault();onSave(d);}}}/>
        <label style={lbl}>Amount ($)</label>
        <input style={inp} type="number" min="0" step="0.01" value={d.amount||""} onChange={e=>setD(p=>({...p,amount:e.target.value}))} placeholder="0.00"/>
        {!isIncome&&(
          <>
            <label style={lbl}>Category</label>
            {d.catId ? (
              <div style={{ ...inp,color:T.textSub,cursor:"default",opacity:0.7 }}>
                {CATS.find(c=>c.id===d.category)?.l||d.category} (locked to budget line)
              </div>
            ) : (
              <select style={sel} value={d.category||"other"} onChange={e=>setD(p=>({...p,category:e.target.value}))}>
                {CATS.map(c=><option key={c.id} value={c.id}>{c.l}</option>)}
              </select>
            )}
          </>
        )}
        <label style={lbl}>Date</label>
        <input type="date" style={sel} value={d.date||new Date().toISOString().slice(0,10)} onChange={e=>setD(p=>({...p,date:e.target.value}))}/>
        <label style={lbl}>Notes (optional)</label>
        <input style={inp} value={d.notes||""} onChange={e=>setD(p=>({...p,notes:e.target.value}))} placeholder="Any details..."/>
        <div style={{ display:"flex",gap:10,marginTop:22,justifyContent:"flex-end" }}>
          <button style={{ padding:"10px 20px",borderRadius:10,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,background:T.inputBg,color:T.textSub }} onClick={onClose}>Cancel</button>
          <button style={{ padding:"10px 24px",borderRadius:10,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:700,background:isIncome?"#3DBF8A":"#E84E8A",color:"#fff" }} onClick={()=>onSave(d)}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ── Budget Bulk Import ────────────────────────────────────────────────────────
function BudgetBulkImport({ onClose, onImport, T, mode, focus }) {
  const [text,   setText]   = useState("");
  const [parsed, setParsed] = useState([]);
  const [step,   setStep]   = useState("input");
  const ref = useRef(null);
  useEffect(()=>{ const t=setTimeout(()=>{ if(ref.current) ref.current.focus(); },80); return()=>clearTimeout(t); },[]);

  function detectCat(title) {
    const t = title.toLowerCase();
    const map = [
      ["housing",   ["rent","mortgage","apartment","house","landlord","lease"]],
      ["food",      ["grocery","groceries","food","restaurant","eat","lunch","dinner","breakfast","coffee","starbucks","mcdonald","chipotle","pizza","uber eats","doordash"]],
      ["transport", ["gas","fuel","car","uber","lyft","bus","train","metro","parking","toll","insurance","auto"]],
      ["health",    ["doctor","dentist","pharmacy","medicine","hospital","gym","fitness","health","medical","prescription","therapy"]],
      ["education", ["tuition","school","university","course","textbook","study","class","fee","exam"]],
      ["faith",     ["church","tithe","offering","donation","charity","giving","ministry"]],
      ["savings",   ["savings","emergency fund","save"]],
      ["shopping",  ["amazon","walmart","target","mall","clothes","shoes","clothing","fashion"]],
      ["utilities", ["electric","electricity","water","internet","wifi","cable","phone bill","utility","gas bill"]],
      ["invest",    ["invest","stock","crypto","etf","fidelity","vanguard","robinhood","401k","ira","brokerage"]],
      ["sub",       ["spotify","netflix","hulu","disney","apple","youtube","subscription","prime","software","app","adobe","notion"]],
      ["personal",  ["haircut","salon","barber","personal","hygiene","toiletry","clothing"]],
    ];
    for (const [cat,kws] of map) if (kws.some(k=>t.includes(k))) return cat;
    return "other";
  }

  function parseLine(line) {
    const raw = line.trim();
    if (!raw || raw.startsWith("#")) return null;
    const parts = raw.split("|").map(p=>p.trim());
    let name=parts[0], allocated="", spent="", category="other", notes="";
    for (let i=1;i<parts.length;i++) {
      const p=parts[i].trim();
      const amtMatch=p.match(/^\$?([\d,.]+)(?:\s*\/?\s*(\$?[\d,.]+))?$/);
      if (amtMatch) {
        if (!allocated) allocated=amtMatch[1].replace(/,/g,"");
        else if (!spent) spent=p.replace(/[$,]/g,"");
        continue;
      }
      const catMatch=BUDGET_CATS.find(c=>c.id===p.toLowerCase()||c.label.toLowerCase()===p.toLowerCase());
      if (catMatch) { category=catMatch.id; continue; }
      if (p.startsWith("@")) {
        const tag=p.slice(1).toLowerCase();
        const c2=BUDGET_CATS.find(c=>c.id===tag||c.label.toLowerCase()===tag);
        if (c2) { category=c2.id; continue; }
      }
      notes=p;
    }
    // Extract @tags from name
    const atRe=/@([\w]+)/g; let m;
    while ((m=atRe.exec(name))!==null) {
      const tag=m[1].toLowerCase();
      const c2=BUDGET_CATS.find(c=>c.id===tag);
      if (c2) category=c2.id;
    }
    name=name.replace(/@[\w]+/g,"").trim();
    // Extract inline amount from name: "Rent 850" or "Rent: $850"
    const inlineAmt=name.match(/[:\s]\$?([\d,.]+)$/);
    if (inlineAmt&&!allocated) { allocated=inlineAmt[1].replace(/,/g,""); name=name.replace(inlineAmt[0],"").trim(); }
    if (!name) return null;
    if (!category||category==="other") category=detectCat(name);
    return { name, category, allocated:allocated||"", spent:spent||"", notes, recurring:"monthly", owner:focus };
  }

  function handleParse() {
    const lines = text.split("\n").map(l=>l.trim()).filter(Boolean);
    setParsed(lines.map(parseLine).filter(Boolean));
    setStep("review");
  }

  function updateRow(idx, field, val) { setParsed(prev=>prev.map((r,i)=>i===idx?{...r,[field]:val}:r)); }
  function removeRow(idx) { setParsed(prev=>prev.filter((_,i)=>i!==idx)); }

  const inp = { background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:7,padding:"5px 8px",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none",width:"100%",boxSizing:"border-box" };

  return (
    <div style={{ position:"fixed",inset:0,zIndex:50,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center" }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:700,maxHeight:"94vh",overflowY:"auto",padding:"24px 20px 40px",boxShadow:"0 -8px 40px rgba(0,0,0,0.35)" }}>
        <div style={{ width:40,height:4,borderRadius:2,background:T.textMuted,margin:"0 auto 20px",opacity:0.4 }}/>
        <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:22,color:T.text,marginBottom:4 }}>⇪ Bulk Import Budget Items</div>
        <div style={{ height:2,width:40,background:"#20B2AA",borderRadius:2,marginBottom:16 }}/>

        {step==="input"&&(
          <>
            <div style={{ background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:10,padding:"12px 14px",marginBottom:16,fontSize:12,color:T.textSub,lineHeight:1.9 }}>
              <div style={{ fontWeight:700,color:T.text,marginBottom:6,fontSize:13 }}>📋 Supported formats (one item per line):</div>
              {[
                ["Simple",         "Rent"],
                ["With budget",    "Rent | 850"],
                ["Budget & spent", "Groceries | 400 | 280"],
                ["With category",  "Netflix | 15.99 | @sub"],
                ["With note",      "Spotify | 10 | sub | Monthly music"],
                ["Dollar sign ok", "Car Insurance | $180"],
              ].map(([l,e])=>(
                <div key={l} style={{ display:"flex",gap:8 }}>
                  <span style={{ color:T.textMuted,flexShrink:0,minWidth:120 }}>{l}:</span>
                  <code style={{ color:"#20B2AA",fontSize:11,background:"#20B2AA11",padding:"1px 6px",borderRadius:4 }}>{e}</code>
                </div>
              ))}
            </div>
            <textarea ref={ref} value={text} onChange={e=>setText(e.target.value)}
              placeholder={"Paste budget items here, one per line:\n\nRent | 850\nGroceries | 400\nSpotify | 10 | @sub\nCar Insurance | 180 | transport\nElectricity | 120 | utilities\nNetflix | 15.99 | sub\nGas | 80 | transport\nPhone Bill | 65 | utilities"}
              style={{ width:"100%",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:9,padding:"12px 14px",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:13,outline:"none",resize:"vertical",minHeight:200,lineHeight:1.7,boxSizing:"border-box" }}/>
            <div style={{ fontSize:11,color:T.textMuted,marginTop:6 }}>{text.split("\n").filter(l=>l.trim()&&!l.trim().startsWith("#")).length} items detected</div>
            <div style={{ display:"flex",gap:10,marginTop:16,justifyContent:"flex-end" }}>
              <button style={{ padding:"9px 20px",borderRadius:9,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,background:T.inputBg,color:T.textSub }} onClick={onClose}>Cancel</button>
              <button style={{ padding:"9px 20px",borderRadius:9,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,background:"#20B2AA",color:"#fff" }} onClick={handleParse} disabled={!text.trim()}>Parse Items →</button>
            </div>
          </>
        )}

        {step==="review"&&(
          <>
            <div style={{ fontSize:13,color:T.textSub,marginBottom:12 }}>Review {parsed.length} items. Adjust anything then import.</div>
            {/* Table header */}
            <div style={{ display:"grid",gridTemplateColumns:"1fr 80px 80px 90px 24px",gap:6,padding:"5px 8px",background:T.inputBg,borderRadius:7,marginBottom:6 }}>
              {["Name","Budget","Spent","Category",""].map(h=><div key={h} style={{ fontSize:10,fontWeight:700,color:T.textMuted,textTransform:"uppercase" }}>{h}</div>)}
            </div>
            <div style={{ maxHeight:360,overflowY:"auto",display:"flex",flexDirection:"column",gap:5 }}>
              {parsed.map((row,idx)=>(
                <div key={idx} style={{ display:"grid",gridTemplateColumns:"1fr 80px 80px 90px 24px",gap:6,padding:"5px 8px",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:8,alignItems:"center" }}>
                  <input style={inp} value={row.name} onChange={e=>updateRow(idx,"name",e.target.value)}/>
                  <input style={inp} type="number" value={row.allocated} onChange={e=>updateRow(idx,"allocated",e.target.value)} placeholder="0.00"/>
                  <input style={inp} type="number" value={row.spent} onChange={e=>updateRow(idx,"spent",e.target.value)} placeholder="0.00"/>
                  <select style={{...inp,cursor:"pointer"}} value={row.category} onChange={e=>updateRow(idx,"category",e.target.value)}>
                    {BUDGET_CATS.map(c=><option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
                  </select>
                  <button onClick={()=>removeRow(idx)} style={{ background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:14 }}>✕</button>
                </div>
              ))}
            </div>
            {parsed.length===0&&<div style={{ textAlign:"center",padding:"24px",color:T.textMuted,fontSize:13,fontStyle:"italic" }}>All items removed. Go back to paste more.</div>}
            <div style={{ display:"flex",gap:10,marginTop:16,justifyContent:"space-between",flexWrap:"wrap" }}>
              <button style={{ padding:"9px 16px",borderRadius:9,border:`1px solid ${T.border}`,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,background:T.inputBg,color:T.textSub }} onClick={()=>setStep("input")}>← Back</button>
              <div style={{ display:"flex",gap:10 }}>
                <button style={{ padding:"9px 20px",borderRadius:9,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,background:T.inputBg,color:T.textSub }} onClick={onClose}>Cancel</button>
                <button style={{ padding:"9px 22px",borderRadius:9,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:700,background:"#20B2AA",color:"#fff" }}
                  onClick={()=>{ onImport(parsed); onClose(); }} disabled={parsed.length===0}>
                  ⇪ Import {parsed.length} Item{parsed.length!==1?"s":""}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Budget Tour ───────────────────────────────────────────────────────────────
function BudgetTour({ step, setStep, onClose, T, mode }) {
  const steps = [
    { title:"Welcome to Budget! 💰", body:"Plan what you want to spend, track what you actually spend, and watch your net worth grow — all in one place.", tip:null },
    { title:"Plan vs Actual 📋", body:"Every budget item has an Allocated amount (what you plan to spend) and a Spent amount (what you actually spent). The difference shows instantly in green (under) or red (over).", tip:"Tap 'Log Spend' on any item to quickly record what you spent." },
    { title:"Bulk Import ⇪", body:"Paste an entire month's budget in one go — name, amount, category. The parser auto-detects categories from keywords like 'Spotify' → Subscriptions, 'Rent' → Housing.", tip:"Use the ⇪ Import button in the top bar." },
    { title:"Subscriptions Section 📱", body:"The Budget view has a dedicated Subscriptions section so you can see every recurring service — Spotify, Netflix, iCloud, Adobe — and exactly what you're paying monthly.", tip:"Add them with category @sub or select 'Subscriptions' in the form." },
    { title:"Net Worth Tracker 💎", body:"In the Net Worth tab, log your assets (laptop, car, savings account) and liabilities (student loan, credit card debt). Your net worth = Assets − Liabilities.", tip:"Update asset values anytime as they change." },
    { title:"Savings Goals 🎯", body:"Set goals with a target amount and deadline. Log deposits as you save. The progress bar and percentage update live. You get a 🏆 when you hit your goal.", tip:"Shared goals appear for both Amen and Gloria in the Shared view." },
    { title:"Switch Views 👤", body:"Use Amen / Gloria / Shared buttons at the top to see each person's budget separately, or switch to Shared for joint expenses and goals.", tip:"Each person's budget items are completely private to their view." },
    { title:"You're all set! 🚀", body:"Start by adding your monthly income expectation, then list all your planned expenses. As you spend, tap 'Log Spend' to track actuals. The dashboard updates instantly.", tip:"You can replay this tour anytime via the ⓘ button." },
  ];
  const s=steps[step], isLast=step===steps.length-1;
  const colors=["#20B2AA","#3DBF8A","#9B6EE8","#E8A838","#3B9EDB","#E84E8A","#8B5CF6","#20B2AA"];
  const accent=colors[step];
  return (
    <>
      <div style={{ position:"fixed",inset:0,zIndex:80,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(3px)",pointerEvents:"none" }}/>
      <div style={{ position:"fixed",bottom:0,left:0,right:0,zIndex:81,display:"flex",justifyContent:"center",padding:"0 16px 16px" }}>
        <div style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:20,width:"100%",maxWidth:540,boxShadow:"0 -8px 40px rgba(0,0,0,0.4)" }}>
          <div style={{ height:3,background:T.inputBg,borderRadius:"20px 20px 0 0",overflow:"hidden" }}>
            <div style={{ height:"100%",width:`${((step+1)/steps.length)*100}%`,background:accent,transition:"width 0.4s" }}/>
          </div>
          <div style={{ padding:"20px 22px 18px" }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12 }}>
              <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                <div style={{ width:26,height:26,borderRadius:"50%",background:accent+"22",border:`2px solid ${accent}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:accent }}>{step+1}</div>
                <span style={{ fontSize:11,color:T.textMuted }}>of {steps.length}</span>
              </div>
              <button onClick={onClose} style={{ fontSize:12,color:T.textMuted,background:"none",border:`1px solid ${T.border}`,borderRadius:7,cursor:"pointer",padding:"4px 10px",fontFamily:"'DM Sans',sans-serif" }}>✕ Exit</button>
            </div>
            <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:18,color:T.text,marginBottom:8 }}>{s.title}</div>
            <p style={{ fontSize:13,color:T.text,lineHeight:1.7,margin:"0 0 10px",fontFamily:"'DM Sans',sans-serif" }}>{s.body}</p>
            {s.tip&&<div style={{ background:accent+"12",border:`1px solid ${accent}33`,borderRadius:9,padding:"9px 12px",marginBottom:12,display:"flex",gap:8 }}>
              <span>💡</span><span style={{ fontSize:12,color:T.text,lineHeight:1.5,fontFamily:"'DM Sans',sans-serif" }}>{s.tip}</span>
            </div>}
            <div style={{ display:"flex",gap:3,marginBottom:14 }}>
              {steps.map((_,i)=><div key={i} onClick={()=>setStep(i)} style={{ height:5,flex:i===step?3:1,borderRadius:3,background:i===step?accent:T.border,transition:"all 0.25s",cursor:"pointer" }}/>)}
            </div>
            <div style={{ display:"flex",gap:8,alignItems:"center" }}>
              <button onClick={onClose} style={{ fontSize:12,color:T.textMuted,background:"none",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>Skip</button>
              <div style={{ flex:1 }}/>
              {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{ padding:"9px 18px",borderRadius:9,border:`1px solid ${T.border}`,background:T.inputBg,color:T.textSub,fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,cursor:"pointer" }}>← Back</button>}
              <button onClick={()=>{ if(isLast) onClose(); else setStep(s=>s+1); }} style={{ padding:"9px 22px",borderRadius:9,border:"none",background:accent,color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,cursor:"pointer" }}>
                {isLast?"Let's go! 🚀":"Next →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── BudgetApp ─────────────────────────────────────────────────────────────────
function BudgetApp({ names, mode, T, activeUser, onBack }) {
  // ── All hooks first (Rules of Hooks) ─────────────────────────────────────
  const [cats,      setCatsState]    = useState(null);  // budget category limits
  const [txs,       setTxsState]     = useState(null);  // all transactions (income + expense)
  const [goals,     setGoalsState]   = useState(null);
  const [assets,    setAssetsState]  = useState(null);
  const [liabs,     setLiabsState]   = useState(null);
  const [debts,     setDebtsState]   = useState(null);
  const [view,      setBView]        = useState("budget");
  const [focus,     setFocus]        = useState(activeUser||"A");
  const [month,     setMonth]        = useState(new Date().getMonth());
  const [year,      setYear]         = useState(new Date().getFullYear());
  const [catFilter, setCatFilter]    = useState(null);
  const [logItem,   setLogItem]      = useState(null);
  const [tourStep,  setTourStep]     = useState(0);
  const [showTour,  setShowTour]     = useState(()=>{ try{ return !localStorage.getItem("budget_toured3"); }catch{ return false; } });
  const [reportPeriod, setReportPeriod] = useState("month");
  const [bShowNav,  setBShowNav]     = useState(false);
  const [showCat,   setShowCat]      = useState(false);
  const [showReset, setShowReset]    = useState(false);
  const [editCat,   setEditCat]      = useState(null);
  const [showTx,    setShowTx]       = useState(false);
  const [editTx,    setEditTx]       = useState(null);
  const [showGoal,  setShowGoal]     = useState(false);
  const [editGoal,  setEditGoal]     = useState(null);
  const [showAsset, setShowAsset]    = useState(false);
  const [editAsset, setEditAsset]    = useState(null);
  const [showLiab,  setShowLiab]     = useState(false);
  const [editLiab,  setEditLiab]     = useState(null);
  const [showDebt,  setShowDebt]     = useState(false);
  const [editDebt,  setEditDebt]     = useState(null);
  const [showBulk,  setShowBulk]     = useState(false);
  const [consecration, setConsecrationState] = useState(null); // { mum, dad, offering, giving } — fixed amounts
  const [splitPlan, setSplitPlanState] = useState(null);       // { needs, wants, savings } — percentages

  function saveConsecration(data){ setConsecrationState(data); dbSet("budget_consecration", data); }
  function saveSplitPlan(data){ setSplitPlanState(data); dbSet("budget_splitplan", data); }
  const [newGoal,  setNewGoal]  = useState({ name:"",target:"",saved:"",deadline:"",emoji:"💰",owner:"A" });
  const [newAsset, setNewAsset] = useState({ name:"",category:"cash",value:"",notes:"",owner:"A" });
  const [newLiab,  setNewLiab]  = useState({ name:"",category:"loan",value:"",notes:"",owner:"A" });
  const [newDebt,  setNewDebt]  = useState({ name:"",type:"credit_card",balance:"",limit:"",apr:"",minPayment:"",dueDay:"",notes:"",owner:"A" });

  function finishTour(){ try{ localStorage.setItem("budget_toured3","1"); }catch{} setShowTour(false); }
  function gid(){ return "b"+Date.now().toString(36)+Math.random().toString(36).slice(2,5); }
  const monthKey = `${new Date(year, month, 1).getFullYear()}-${String(month+1).padStart(2,"0")}`;

  useEffect(()=>{
    (async()=>{
      const [ca,tx,g,a,li,d,con,sp] = await Promise.all([dbGet("budget_cats"),dbGet("budget_txs"),dbGet("budget_goals"),dbGet("budget_assets"),dbGet("budget_liabs"),dbGet("budget_debts"),dbGet("budget_consecration"),dbGet("budget_splitplan")]);
      const loadedCats = ca??[]; const loadedTxs = tx??[];
      setCatsState(loadedCats); setTxsState(loadedTxs); setGoalsState(g??[]); setAssetsState(a??[]); setLiabsState(li??[]); setDebtsState(d??[]);
      setConsecrationState(con ?? { mum:0, dad:0, offering:25, giving:20, mumPct:5, dadPct:5, mumMode:"pct", dadMode:"pct" });
      setSplitPlanState(sp ?? { needs:50, wants:30, savings:20 });
      // Show reset banner if there are old-style transactions (no catId) mixed with budget cats
      const hasOldTxs = loadedTxs.some(t=>t.type==="expense"&&!t.catId);
      if (hasOldTxs && loadedCats.length>0) setShowReset(true);
    })();
  },[]);

  const saveCats = list => { setCatsState(list); dbSet("budget_cats",list); };
  const saveTxs  = list => { setTxsState(list);  dbSet("budget_txs",list);  };
  const saveG    = list => { setGoalsState(list); dbSet("budget_goals",list);};
  const saveA    = list => { setAssetsState(list);dbSet("budget_assets",list);};
  const saveLi   = list => { setLiabsState(list); dbSet("budget_liabs",list);};
  const saveD    = list => { setDebtsState(list); dbSet("budget_debts",list);};

  // Budget category limits (the plan: Rent $850, Groceries $400 etc)
  function addCat(data){ if(!data.name?.trim()) return; saveCats([...(cats||[]),{...data,id:gid(),limit:parseFloat(data.limit||0),owner:focus}]); setShowCat(false); }
  function saveEditCat(data){ saveCats((cats||[]).map(c=>c.id===data.id?{...data,limit:parseFloat(data.limit||0)}:c)); setEditCat(null); }
  function delCat(id){ saveCats((cats||[]).filter(c=>c.id!==id)); }

  // Single transactions list — type:"income" or type:"expense"
  function addTx(data){ if(!data.name?.trim()||!data.amount) return; saveTxs([...(txs||[]),{...data,id:gid(),amount:parseFloat(data.amount),owner:focus,month:monthKey}]); setShowTx(false); setLogItem(null); }
  function saveEditTx(data){ saveTxs((txs||[]).map(t=>t.id===data.id?{...data,amount:parseFloat(data.amount)}:t)); setEditTx(null); }
  function delTx(id){ saveTxs((txs||[]).filter(t=>t.id!==id)); }

  function addGoal(){ if(!newGoal.name?.trim()||!newGoal.target) return; saveG([...(goals||[]),{...newGoal,id:gid(),target:parseFloat(newGoal.target),saved:parseFloat(newGoal.saved||0),owner:focus==="shared"?"shared":focus}]); setNewGoal({name:"",target:"",saved:"",deadline:"",emoji:"💰",owner:focus}); setShowGoal(false); }
  function saveEditGoal(){ saveG((goals||[]).map(g=>g.id===editGoal.id?{...editGoal,target:parseFloat(editGoal.target),saved:parseFloat(editGoal.saved||0)}:g)); setEditGoal(null); }
  function delGoal(id){ saveG((goals||[]).filter(g=>g.id!==id)); }
  function addToGoal(id,amt){ saveG((goals||[]).map(g=>g.id===id?{...g,saved:Math.max(0,Math.round((g.saved+parseFloat(amt||0))*100)/100)}:g)); }
  function addAsset(){ if(!newAsset.name?.trim()) return; saveA([...(assets||[]),{...newAsset,id:gid(),value:parseFloat(newAsset.value||0),owner:focus}]); setNewAsset({name:"",category:"cash",value:"",notes:"",owner:focus}); setShowAsset(false); }
  function saveEditAsset(){ saveA((assets||[]).map(a=>a.id===editAsset.id?{...editAsset,value:parseFloat(editAsset.value||0)}:a)); setEditAsset(null); }
  function delAsset(id){ saveA((assets||[]).filter(a=>a.id!==id)); }
  function addLiab(){ if(!newLiab.name?.trim()) return; saveLi([...(liabs||[]),{...newLiab,id:gid(),value:parseFloat(newLiab.value||0),owner:focus}]); setNewLiab({name:"",category:"loan",value:"",notes:"",owner:focus}); setShowLiab(false); }
  function saveEditLiab(){ saveLi((liabs||[]).map(l=>l.id===editLiab.id?{...editLiab,value:parseFloat(editLiab.value||0)}:l)); setEditLiab(null); }
  function delLiab(id){ saveLi((liabs||[]).filter(l=>l.id!==id)); }
  function addDebt(){ if(!newDebt.name?.trim()) return; saveD([...(debts||[]),{...newDebt,id:gid(),balance:parseFloat(newDebt.balance||0),limit:parseFloat(newDebt.limit||0),apr:parseFloat(newDebt.apr||0),minPayment:parseFloat(newDebt.minPayment||0),owner:focus,payments:[]}]); setNewDebt({name:"",type:"credit_card",balance:"",limit:"",apr:"",minPayment:"",dueDay:"",notes:"",owner:focus}); setShowDebt(false); }
  function saveEditDebt(){ saveD((debts||[]).map(d=>d.id===editDebt.id?{...editDebt,balance:parseFloat(editDebt.balance||0),limit:parseFloat(editDebt.limit||0),apr:parseFloat(editDebt.apr||0),minPayment:parseFloat(editDebt.minPayment||0)}:d)); setEditDebt(null); }
  function delDebt(id){ saveD((debts||[]).filter(d=>d.id!==id)); }
  function makeDebtPayment(id,amt){ saveD((debts||[]).map(d=>{ if(d.id!==id) return d; const payment={id:gid(),amount:parseFloat(amt),date:new Date().toISOString().slice(0,10)}; return {...d,balance:Math.max(0,Math.round((d.balance-parseFloat(amt))*100)/100),payments:[...(d.payments||[]),payment]}; })); }
  function bulkImportCats(items){ saveCats([...(cats||[]),...items.map(i=>({...i,id:gid(),limit:parseFloat(i.allocated||i.limit||0),owner:focus}))]); }


  const fmt    = n => "$"+Math.abs(n).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
  const catOf  = id => BUDGET_CATS.find(c=>c.id===id)||BUDGET_CATS[BUDGET_CATS.length-1];
  const asCatOf= id => ASSET_CATS.find(c=>c.id===id)||ASSET_CATS[0];
  const liCatOf= id => LIAB_CATS.find(c=>c.id===id)||LIAB_CATS[0];

  // This month's transactions for current focus
  const myTxs = (txs||[]).filter(t=>
    t.month===monthKey && (focus==="shared"?t.owner==="shared":t.owner===focus||t.owner==="shared")
  );
  const myIncomeTxs  = myTxs.filter(t=>t.type==="income");
  const myExpenseTxs = myTxs.filter(t=>t.type==="expense");
  const totalIncome  = myIncomeTxs.reduce((s,t)=>s+t.amount,0);
  const totalSpent   = myExpenseTxs.reduce((s,t)=>s+t.amount,0);
  const cashLeft     = totalIncome - totalSpent;

  // Budget category limits for this focus (the plan)
  const myCats       = (cats||[]).filter(c=>focus==="shared"?c.owner==="shared":c.owner===focus||c.owner==="shared");
  const totalBudgeted= myCats.reduce((s,c)=>s+c.limit,0);
  const overBudget   = totalSpent > totalBudgeted && totalBudgeted > 0;

  // Per-category: always match by catId (unique budget line ID on each transaction)
  // Transactions without a catId are unlinked and don't count toward any budget line.
  const catRollup = myCats.map(cat=>{
    const info  = BUDGET_CATS.find(c=>c.id===cat.category)||BUDGET_CATS[BUDGET_CATS.length-1];
    const spent = myExpenseTxs
      .filter(t=>t.catId===cat.id)
      .reduce((s,t)=>s+t.amount,0);
    return { ...cat, info, spent, over: spent>cat.limit && cat.limit>0 };
  });
  const subCats  = myCats.filter(c=>c.category==="sub");
  const subTotal = subCats.reduce((s,c)=>s+c.limit,0);

  // Goals
  const myGoals = (goals||[]).filter(g=> focus==="shared"?g.owner==="shared":g.owner===focus||g.owner==="shared");

  // ── Early return while data loads ───────────────────────────────────────────
  if (!cats||!txs||!goals||!assets||!liabs||!debts||!consecration||!splitPlan) return (
    <div style={{ minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ textAlign:"center",color:T.textSub }}><div style={{ fontSize:40,marginBottom:12,animation:"pulse 1.5s infinite" }}>💰</div><div style={{ fontSize:14 }}>Loading your budget...</div></div>
    </div>
  );

  // Net Worth (safe — all arrays guaranteed non-null after guard)
  const myAssets = assets.filter(a=>a.owner===focus);
  const myLiabs  = liabs.filter(l=>l.owner===focus);
  const myDebts  = debts.filter(d=>d.owner===focus);
  const totalDebtBalance = myDebts.reduce((s,d)=>s+d.balance,0);
  const totalAssets = myAssets.reduce((s,a)=>s+a.value,0);
  const totalLiabs  = myLiabs.reduce((s,l)=>s+l.value,0);
  const netWorth    = totalAssets - totalLiabs - totalDebtBalance;

  // Filtered lines for budget view
  const displayCats = catFilter ? catRollup.filter(c=>c.category===catFilter) : catRollup;

  const focusColor = focus==="A"?"#E8A838":focus==="B"?"#E84E8A":"#9B6EE8";
  const focusName  = focus==="shared"?"Shared":names[focus]||focus;

  const card = (ex={}) => ({ background:T.surface,border:`1px solid ${T.border}`,borderRadius:16,boxShadow:"0 2px 12px rgba(0,0,0,0.07)",...ex });
  const navViews=[["budget","📋 Budget"],["consecration","🕊 Consecration"],["goals","🎯 Goals"],["debt","💳 Debts"],["networth","💎 Net Worth"],["analytics","📈 Analytics"],["report","📄 Report"]];

  return (
    <div style={{ position:"fixed",inset:0,background:T.bg,color:T.text,fontFamily:"'DM Sans',sans-serif",display:"flex",flexDirection:"column",overflow:"hidden" }}>
      <style>{`
        .ba *{box-sizing:border-box}
        .ba-scroll{flex:1;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch}
        .ba-pad{padding:20px 24px}
        .ba-g4{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:16px}
        .ba-g2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-bottom:16px}
        .ba-g3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
        .ba-goals{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
        .ba-debt{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
        .ba-nav{display:flex;overflow-x:auto;scrollbar-width:none;border-bottom:1px solid ${T.border};background:${T.topbar}}
        .ba-nav::-webkit-scrollbar{display:none}
        .ba-ham{display:none}
        @media(max-width:1100px){
          .ba-g4{grid-template-columns:repeat(2,minmax(0,1fr))}
          .ba-goals{grid-template-columns:repeat(2,minmax(0,1fr))}
          .ba-debt{grid-template-columns:repeat(2,minmax(0,1fr))}
        }
        @media(max-width:700px){
          .ba-pad{padding:12px}
          .ba-g4{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
          .ba-g2{grid-template-columns:1fr}
          .ba-g3{grid-template-columns:1fr}
          .ba-goals{grid-template-columns:1fr}
          .ba-debt{grid-template-columns:1fr}
          .ba-nav{display:none}
          .ba-ham{display:flex!important}
          .ba-import-txt{display:none}
        }
      `}</style>

      {/* TOP BAR */}
      <div className="ba" style={{ display:"flex",alignItems:"center",gap:8,padding:"10px 16px",borderBottom:`1px solid ${T.border}`,background:T.topbar,backdropFilter:"blur(12px)",flexShrink:0,minWidth:0,flexWrap:"nowrap" }}>
        <button onClick={onBack} style={{ width:34,height:34,borderRadius:9,border:`1px solid ${T.border}`,background:T.inputBg,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",color:T.textSub,flexShrink:0 }}>←</button>
        <span style={{ fontFamily:"'DM Serif Display',serif",fontSize:19,color:"#20B2AA",whiteSpace:"nowrap",flexShrink:0 }}>Budget 💰</span>
        <div style={{ flex:1,minWidth:0 }}/>
        {/* Focus switcher */}
        <div style={{ display:"flex",background:T.inputBg,borderRadius:9,padding:2,border:`1px solid ${T.border}`,gap:2,flexShrink:0 }}>
          {[["A",(names.A||"A")[0]],["B",(names.B||"B")[0]],["shared","S"]].map(([f,l])=>(
            <button key={f} onClick={()=>setFocus(f)} title={f==="shared"?"Shared":names[f]} style={{ padding:"4px 8px",borderRadius:7,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,background:focus===f?(f==="A"?"#E8A838":f==="B"?"#E84E8A":"#9B6EE8"):"transparent",color:focus===f?"#fff":T.textSub,transition:"all 0.15s",whiteSpace:"nowrap" }}>
              <span className="b-full-name" style={{ display:"inline" }}>{f==="shared"?"Shared":names[f]}</span>
            </button>
          ))}
        </div>
        <button onClick={()=>{setTourStep(0);setShowTour(true);}} style={{ width:34,height:34,borderRadius:9,border:`1px solid ${T.border}`,background:T.inputBg,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",color:T.textSub,flexShrink:0 }} title="Tour">ⓘ</button>
        <button onClick={()=>{
          if(window.confirm("Clear all budget transactions and categories for a fresh start?\n\nThis will delete all your budget lines, expenses, and income for this account. Goals, assets, and debts are kept.\n\nThis cannot be undone.")) {
            saveCats([]); saveTxs([]);
          }
        }} style={{ width:34,height:34,borderRadius:9,border:`1px solid ${T.border}`,background:T.inputBg,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",color:T.textMuted,flexShrink:0 }} title="Reset budget data">🗑</button>
        <button onClick={()=>setShowBulk(true)} style={{ height:34,padding:"0 12px",borderRadius:9,border:`1px solid ${T.border}`,background:T.inputBg,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,color:T.textSub,flexShrink:0 }} title="Bulk Import">
          <span>⇪</span><span className="ba-import-txt"> Import</span>
        </button>
        <button onClick={()=>setShowTx(true)} style={{ height:34,padding:"0 14px",borderRadius:9,border:"none",background:"#20B2AA",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,color:"#fff",whiteSpace:"nowrap",flexShrink:0 }}>+ Add</button>
        {/* Mobile hamburger for nav */}
        <button onClick={()=>setBShowNav(v=>!v)} className="ba-ham ba" style={{ width:34,height:34,borderRadius:9,border:`1px solid ${T.border}`,background:T.inputBg,cursor:"pointer",alignItems:"center",justifyContent:"center",flexShrink:0,flexDirection:"column",gap:4,padding:"9px 8px" }}>
          <span style={{ width:16,height:2,borderRadius:1,background:T.textSub,display:"block" }}/>
          <span style={{ width:16,height:2,borderRadius:1,background:T.textSub,display:"block" }}/>
          <span style={{ width:16,height:2,borderRadius:1,background:T.textSub,display:"block" }}/>
        </button>
      </div>

      {/* NAV TABS — desktop: tab strip | mobile: slide-down drawer */}
      <div className="bnav b-desktop-nav" style={{ display:"flex",padding:"0 16px",borderBottom:`1px solid ${T.border}`,background:T.topbar,overflowX:"auto",scrollbarWidth:"none" }}>
        {navViews.map(([v,l])=>(
          <button key={v} onClick={()=>setBView(v)} style={{ padding:"10px 14px",border:"none",cursor:"pointer",background:"none",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:view===v?700:400,color:view===v?"#20B2AA":T.textSub,borderBottom:view===v?"2px solid #20B2AA":"2px solid transparent",whiteSpace:"nowrap",transition:"all 0.15s" }}>{l}</button>
        ))}
      </div>
      {/* Mobile nav drawer */}
      {bShowNav&&(
        <div style={{ position:"fixed",inset:0,zIndex:50 }} onClick={()=>setBShowNav(false)}>
          <div style={{ position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(3px)" }}/>
          <div style={{ position:"absolute",top:0,right:0,bottom:0,width:240,background:T.surface,borderLeft:`1px solid ${T.border}`,padding:"16px 0",display:"flex",flexDirection:"column",gap:2,overflowY:"auto" }} onClick={e=>e.stopPropagation()}>
            <div style={{ padding:"8px 20px 16px",borderBottom:`1px solid ${T.border}`,marginBottom:8 }}>
              <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:17,color:"#20B2AA" }}>Budget 💰</div>
              <div style={{ fontSize:11,color:T.textSub,marginTop:2 }}>{focus==="shared"?"Shared":names[focus]||focus}'s view</div>
            </div>
            {navViews.map(([v,l])=>(
              <button key={v} onClick={()=>{setBView(v);setBShowNav(false);}} style={{ padding:"13px 20px",border:"none",cursor:"pointer",background:view===v?"#20B2AA18":"transparent",color:view===v?"#20B2AA":T.text,fontFamily:"'DM Sans',sans-serif",fontSize:15,fontWeight:view===v?700:400,textAlign:"left",borderLeft:view===v?"3px solid #20B2AA":"3px solid transparent" }}>{l}</button>
            ))}
            <div style={{ flex:1 }}/>
            <div style={{ padding:"16px 20px",borderTop:`1px solid ${T.border}`,display:"flex",gap:8 }}>
              <button onClick={()=>{setShowBulk(true);setBShowNav(false);}} style={{ flex:1,padding:"9px",borderRadius:9,border:`1px solid ${T.border}`,background:T.inputBg,color:T.textSub,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13 }}>⇪ Import</button>
              <button onClick={()=>{setTourStep(0);setShowTour(true);setBShowNav(false);}} style={{ flex:1,padding:"9px",borderRadius:9,border:`1px solid ${T.border}`,background:T.inputBg,color:T.textSub,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13 }}>ⓘ Tour</button>
            </div>
          </div>
        </div>
      )}

      {/* MONTH NAV */}
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 20px",background:T.surface,borderBottom:`1px solid ${T.border}`,flexShrink:0 }}>
        <button onClick={()=>{ let m=month-1,y=year; if(m<0){m=11;y--;} setMonth(m);setYear(y); }} style={{ width:34,height:34,borderRadius:9,border:`1px solid ${T.border}`,background:T.inputBg,cursor:"pointer",fontSize:17,color:T.textSub,display:"flex",alignItems:"center",justifyContent:"center" }}>‹</button>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:20,color:T.text }}>{BUDGET_MONTHS[month]} {year}</div>
          <div style={{ fontSize:11,fontWeight:600,color:focusColor,marginTop:1 }}>{focusName}'s Budget</div>
        </div>
        <button onClick={()=>{ let m=month+1,y=year; if(m>11){m=0;y++;} setMonth(m);setYear(y); }} style={{ width:34,height:34,borderRadius:9,border:`1px solid ${T.border}`,background:T.inputBg,cursor:"pointer",fontSize:17,color:T.textSub,display:"flex",alignItems:"center",justifyContent:"center" }}>›</button>
      </div>

      {/* CONTENT */}
      <div className="ba-scroll">
        <div className="ba-pad">

        {/* ════ BUDGET VIEW ════ */}
        {view==="budget"&&(
          <>
            {/* ── STALE DATA RESET BANNER ── */}
            {showReset&&(
              <div style={{ background:"#E8A83812",border:"1px solid #E8A83855",borderRadius:12,padding:"14px 18px",marginBottom:20,display:"flex",alignItems:"flex-start",gap:12 }}>
                <span style={{ fontSize:20,flexShrink:0 }}>⚠️</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14,fontWeight:700,color:"#E8A838",marginBottom:4 }}>Old budget data detected</div>
                  <div style={{ fontSize:13,color:T.text,lineHeight:1.6,marginBottom:10 }}>
                    Your existing expenses were created before the budget linking fix, so they can't be correctly matched to budget categories. Clear them to start fresh — your goals, assets, and debts are kept.
                  </div>
                  <div style={{ display:"flex",gap:8 }}>
                    <button onClick={()=>{ saveCats([]); saveTxs([]); setShowReset(false); }} style={{ padding:"8px 16px",borderRadius:8,border:"none",background:"#E84E8A",color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700 }}>🗑 Clear & Start Fresh</button>
                    <button onClick={()=>setShowReset(false)} style={{ padding:"8px 14px",borderRadius:8,border:`1px solid ${T.border}`,background:T.inputBg,color:T.textSub,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13 }}>Dismiss</button>
                  </div>
                </div>
              </div>
            )}
            {/* ── HERO SUMMARY CARDS ── */}
            <div className="ba-g4" style={{ marginBottom:20 }}>
              {[
                { l:"Income",     v:fmt(totalIncome),   c:"#3DBF8A", icon:"💵", sub:`${myIncomeTxs.length} source${myIncomeTxs.length!==1?"s":""}` },
                { l:"Spent",      v:fmt(totalSpent),    c:"#E84E8A", icon:"💸", sub:`${myExpenseTxs.length} expense${myExpenseTxs.length!==1?"s":""}` },
                { l:"Cash Left",  v:(cashLeft<0?"-":"")+fmt(Math.abs(cashLeft)), c:cashLeft<0?"#E84E8A":"#3DBF8A", icon:cashLeft<0?"⚠️":"✅", sub:cashLeft<0?"Overspent":"Available" },
                { l:"Budgeted",   v:fmt(totalBudgeted), c:"#3B9EDB", icon:"📋", sub:`${myCats.length} categories` },
              ].map(s=>(
                <div key={s.l} style={{ ...card(),padding:"14px 16px",borderLeft:`4px solid ${s.c}`,position:"relative",overflow:"hidden" }}>
                  <div style={{ position:"absolute",top:8,right:10,fontSize:20,opacity:0.1 }}>{s.icon}</div>
                  <div style={{ fontSize:20,fontWeight:800,color:T.text,lineHeight:1 }}>{s.v}</div>
                  <div style={{ fontSize:10,fontWeight:700,color:T.textSub,marginTop:3,textTransform:"uppercase",letterSpacing:"0.08em" }}>{s.l}</div>
                  <div style={{ fontSize:11,color:s.c,marginTop:2,fontWeight:600 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* ── SUB-TABS ── */}
            <div style={{ display:"flex",gap:0,borderBottom:`1px solid ${T.border}`,marginBottom:20 }}>
              {[["plan","📋 Budget Plan"],["income","💵 Income"],["expenses","💸 Expenses"]].map(([s,l])=>(
                <button key={s} onClick={()=>setCatFilter(s==="plan"?null:s==="income"?"__income__":"__expense__")}
                  style={{ padding:"9px 16px",border:"none",cursor:"pointer",background:"none",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:(s==="plan"&&!catFilter)||(catFilter==="__income__"&&s==="income")||(catFilter==="__expense__"&&s==="expenses")?700:400,color:(s==="plan"&&!catFilter)||(catFilter==="__income__"&&s==="income")||(catFilter==="__expense__"&&s==="expenses")?"#20B2AA":T.textSub,borderBottom:(s==="plan"&&!catFilter)||(catFilter==="__income__"&&s==="income")||(catFilter==="__expense__"&&s==="expenses")?"2px solid #20B2AA":"2px solid transparent",whiteSpace:"nowrap",transition:"all 0.15s" }}>{l}</button>
              ))}
            </div>

            {/* ════ BUDGET PLAN ════ */}
            {(catFilter!=="__income__"&&catFilter!=="__expense__")&&(
              <>
                {/* Progress bar */}
                {totalBudgeted>0&&(
                  <div style={{ ...card(),padding:"14px 18px",marginBottom:16 }}>
                    <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:13 }}>
                      <span style={{ fontWeight:700,color:T.text }}>Budget used</span>
                      <span style={{ fontWeight:700,color:overBudget?"#E84E8A":"#3DBF8A" }}>{Math.min(Math.round(totalBudgeted>0?(totalSpent/totalBudgeted)*100:0),999)}%</span>
                    </div>
                    <div style={{ height:10,background:T.inputBg,borderRadius:8,overflow:"hidden" }}>
                      <div style={{ height:"100%",width:`${Math.min(100,totalBudgeted>0?(totalSpent/totalBudgeted)*100:0)}%`,background:overBudget?"#E84E8A":"#20B2AA",borderRadius:8,transition:"width 0.5s" }}/>
                    </div>
                    <div style={{ display:"flex",justifyContent:"space-between",marginTop:5,fontSize:11,color:T.textMuted }}>
                      <span>Budgeted: {fmt(totalBudgeted)}</span><span>Spent: {fmt(totalSpent)}</span>
                    </div>
                  </div>
                )}

                <div style={{ display:"flex",gap:8,marginBottom:16,flexWrap:"wrap" }}>
                  <button onClick={()=>setShowCat(true)} style={{ height:34,padding:"0 14px",borderRadius:9,border:"none",background:"#20B2AA",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,color:"#fff" }}>+ Budget Category</button>
                  <button onClick={()=>setShowBulk(true)} style={{ height:34,padding:"0 12px",borderRadius:9,border:`1px solid ${T.border}`,background:T.inputBg,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:T.textSub }}>⇪ Import</button>
                </div>

                {catRollup.length===0 ? (
                  <div style={{ ...card(),padding:"48px 20px",textAlign:"center" }}>
                    <div style={{ fontSize:40,marginBottom:10 }}>📋</div>
                    <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:18,color:T.text,marginBottom:6 }}>Set up your budget categories</div>
                    <div style={{ fontSize:13,color:T.textSub,marginBottom:16,lineHeight:1.7 }}>
                      Add categories like <strong>Rent $850</strong>, <strong>Groceries $400</strong>, <strong>Giving $100</strong>.<br/>
                      Then log your actual expenses — the app shows you how much you've spent vs your limit.
                    </div>
                    <button onClick={()=>setShowCat(true)} style={{ padding:"10px 20px",borderRadius:9,border:"none",background:"#20B2AA",color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700 }}>+ Add First Category</button>
                  </div>
                ) : (
                  <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                    {catRollup.map(cat=>{
                      const pct  = cat.limit>0?Math.min(100,Math.round((cat.spent/cat.limit)*100)):cat.spent>0?100:0;
                      const diff = cat.limit - cat.spent;
                      return (
                        <div key={cat.id} style={{ ...card(),padding:"13px 16px",borderLeft:`4px solid ${cat.over?"#E84E8A":cat.info.color}` }}>
                          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                            <div style={{ width:36,height:36,borderRadius:9,background:cat.info.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>{cat.info.emoji}</div>
                            <div style={{ flex:1,minWidth:0 }}>
                              <div style={{ display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:6 }}>
                                <span style={{ fontSize:14,fontWeight:700,color:T.text }}>{cat.name}</span>
                                <span style={{ fontSize:10,padding:"1px 6px",borderRadius:5,background:cat.info.color+"20",color:cat.info.color,fontWeight:600 }}>{cat.info.emoji} {cat.info.label}</span>
                                {cat.over&&<span style={{ fontSize:10,padding:"1px 6px",borderRadius:5,background:"#E84E8A22",color:"#E84E8A",fontWeight:700 }}>⚠️ Over</span>}
                              </div>
                              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:7 }}>
                                <div style={{ background:T.inputBg,borderRadius:7,padding:"5px 8px",textAlign:"center" }}>
                                  <div style={{ fontSize:13,fontWeight:700,color:T.text }}>{fmt(cat.limit)}</div>
                                  <div style={{ fontSize:9,color:T.textMuted,textTransform:"uppercase" }}>Limit</div>
                                </div>
                                <div style={{ background:T.inputBg,borderRadius:7,padding:"5px 8px",textAlign:"center" }}>
                                  <div style={{ fontSize:13,fontWeight:700,color:cat.over?"#E84E8A":"#E8704A" }}>{fmt(cat.spent)}</div>
                                  <div style={{ fontSize:9,color:T.textMuted,textTransform:"uppercase" }}>Spent</div>
                                </div>
                                <div style={{ background:cat.over?"#E84E8A12":"#3DBF8A12",borderRadius:7,padding:"5px 8px",textAlign:"center" }}>
                                  <div style={{ fontSize:13,fontWeight:700,color:cat.over?"#E84E8A":"#3DBF8A" }}>{cat.over?"-":""}{fmt(Math.abs(diff))}</div>
                                  <div style={{ fontSize:9,color:T.textMuted,textTransform:"uppercase" }}>{cat.over?"Over":"Left"}</div>
                                </div>
                              </div>
                              <div style={{ height:5,background:T.inputBg,borderRadius:5,overflow:"hidden" }}>
                                <div style={{ height:"100%",width:`${pct}%`,background:cat.over?"#E84E8A":pct>80?"#E8A838":"#20B2AA",borderRadius:5,transition:"width 0.4s" }}/>
                              </div>
                            </div>
                            <div style={{ display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end",flexShrink:0 }}>
                              <button onClick={()=>{ setLogItem({catId:cat.id,category:cat.category,catName:cat.name}); setShowTx(true); }} style={{ padding:"4px 10px",borderRadius:7,border:"none",background:"#E84E8A",color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700 }}>+ Expense</button>
                              <div style={{ display:"flex",gap:2 }}>
                                <button onClick={()=>setEditCat(cat)} style={{ background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:13 }}>✎</button>
                                <button onClick={()=>delCat(cat.id)} style={{ background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:13 }}>✕</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Subscriptions summary */}
                {subCats.length>0&&(
                  <div style={{ ...card(),padding:"16px",marginTop:16 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}>
                      <span style={{ fontSize:16 }}>📱</span>
                      <span style={{ fontFamily:"'DM Serif Display',serif",fontSize:16,color:T.text }}>Subscriptions</span>
                      <span style={{ fontSize:12,color:"#8B5CF6",fontWeight:700,marginLeft:"auto" }}>{fmt(subTotal)}/mo · {fmt(subTotal*12)}/yr</span>
                    </div>
                    {subCats.map(s=>(
                      <div key={s.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"6px 8px",background:T.inputBg,borderRadius:8,marginBottom:5 }}>
                        <span style={{ fontSize:14 }}>📱</span>
                        <span style={{ flex:1,fontSize:13,color:T.text }}>{s.name}</span>
                        <span style={{ fontSize:13,fontWeight:700,color:"#8B5CF6" }}>{fmt(s.limit)}/mo</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ════ INCOME ════ */}
            {catFilter==="__income__"&&(
              <div>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:8 }}>
                  <div>
                    <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:20,color:T.text }}>Income — {BUDGET_MONTHS[month]} {year}</div>
                    <div style={{ fontSize:13,color:"#3DBF8A",fontWeight:700,marginTop:2 }}>Total: {fmt(totalIncome)}</div>
                  </div>
                  <button onClick={()=>{ setLogItem({type:"income"}); setShowTx(true); }} style={{ height:34,padding:"0 14px",borderRadius:9,border:"none",background:"#3DBF8A",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,color:"#fff" }}>+ Add Income</button>
                </div>
                {myIncomeTxs.length===0 ? (
                  <div style={{ ...card(),padding:"48px 20px",textAlign:"center" }}>
                    <div style={{ fontSize:40,marginBottom:10 }}>💵</div>
                    <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:18,color:T.text,marginBottom:6 }}>No income logged yet</div>
                    <div style={{ fontSize:13,color:T.textSub,marginBottom:16 }}>Log your TA stipend, salary, freelance work, gifts — anything that comes in this month.</div>
                    <button onClick={()=>{ setLogItem({type:"income"}); setShowTx(true); }} style={{ padding:"9px 18px",borderRadius:9,border:"none",background:"#3DBF8A",color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700 }}>+ Log Income</button>
                  </div>
                ) : (
                  <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                    {[...myIncomeTxs].sort((a,b)=>b.date<a.date?-1:1).map(t=>(
                      <div key={t.id} style={{ ...card(),padding:"12px 16px",borderLeft:"4px solid #3DBF8A",display:"flex",alignItems:"center",gap:12 }}>
                        <div style={{ width:34,height:34,borderRadius:9,background:"#3DBF8A22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0 }}>💵</div>
                        <div style={{ flex:1,minWidth:0 }}>
                          <div style={{ fontSize:14,fontWeight:700,color:T.text }}>{t.name}</div>
                          <div style={{ fontSize:11,color:T.textMuted,marginTop:2 }}>{t.date}{t.notes?` · ${t.notes}`:""}</div>
                        </div>
                        <div style={{ fontSize:16,fontWeight:800,color:"#3DBF8A",flexShrink:0 }}>+{fmt(t.amount)}</div>
                        <div style={{ display:"flex",gap:3 }}>
                          <button onClick={()=>setEditTx(t)} style={{ background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:13 }}>✎</button>
                          <button onClick={()=>delTx(t.id)} style={{ background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:13 }}>✕</button>
                        </div>
                      </div>
                    ))}
                    <div style={{ ...card(),padding:"11px 16px",background:"#3DBF8A08",border:"1px solid #3DBF8A33",display:"flex",justifyContent:"space-between" }}>
                      <span style={{ fontSize:13,fontWeight:600,color:T.text }}>Total Income</span>
                      <span style={{ fontSize:17,fontWeight:800,color:"#3DBF8A" }}>{fmt(totalIncome)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ════ EXPENSES ════ */}
            {catFilter==="__expense__"&&(
              <div>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:8 }}>
                  <div>
                    <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:20,color:T.text }}>Expenses — {BUDGET_MONTHS[month]} {year}</div>
                    <div style={{ fontSize:13,color:"#E84E8A",fontWeight:700,marginTop:2 }}>Total: {fmt(totalSpent)} {cashLeft>=0?`· ${fmt(cashLeft)} left`:`· ${fmt(Math.abs(cashLeft))} over`}</div>
                  </div>
                  <button onClick={()=>{ setLogItem({type:"expense"}); setShowTx(true); }} style={{ height:34,padding:"0 14px",borderRadius:9,border:"none",background:"#E84E8A",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,color:"#fff" }}>+ Log Expense</button>
                </div>
                {/* Income vs spend bar */}
                {(totalIncome>0||totalSpent>0)&&(
                  <div style={{ ...card(),padding:"13px 16px",marginBottom:16,borderLeft:`4px solid ${cashLeft>=0?"#3DBF8A":"#E84E8A"}` }}>
                    <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:12,fontWeight:600 }}>
                      <span style={{ color:"#3DBF8A" }}>In: {fmt(totalIncome)}</span>
                      <span style={{ color:"#E84E8A" }}>Out: {fmt(totalSpent)}</span>
                      <span style={{ color:cashLeft>=0?"#3DBF8A":"#E84E8A" }}>{cashLeft>=0?"Left: ":"Over: "}{fmt(Math.abs(cashLeft))}</span>
                    </div>
                    <div style={{ height:8,background:T.inputBg,borderRadius:8,overflow:"hidden" }}>
                      <div style={{ height:"100%",width:`${totalIncome>0?Math.min(100,(totalSpent/totalIncome)*100):0}%`,background:cashLeft>=0?"#20B2AA":"#E84E8A",borderRadius:8,transition:"width 0.5s" }}/>
                    </div>
                  </div>
                )}
                {myExpenseTxs.length===0 ? (
                  <div style={{ ...card(),padding:"48px 20px",textAlign:"center" }}>
                    <div style={{ fontSize:40,marginBottom:10 }}>💸</div>
                    <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:18,color:T.text,marginBottom:6 }}>No expenses logged yet</div>
                    <div style={{ fontSize:13,color:T.textSub,marginBottom:16 }}>Log every purchase — groceries, rent, gas, giving. This is how you track what actually went out.</div>
                    <button onClick={()=>{ setLogItem({type:"expense"}); setShowTx(true); }} style={{ padding:"9px 18px",borderRadius:9,border:"none",background:"#E84E8A",color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700 }}>+ Log First Expense</button>
                  </div>
                ) : (
                  <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                    {[...myExpenseTxs].sort((a,b)=>b.date<a.date?-1:1).map(t=>{
                      const info = catOf(t.category||"other");
                      return (
                        <div key={t.id} style={{ ...card(),padding:"12px 14px",borderLeft:`4px solid ${info.color}`,display:"flex",alignItems:"center",gap:10 }}>
                          <div style={{ width:34,height:34,borderRadius:8,background:info.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0 }}>{info.emoji}</div>
                          <div style={{ flex:1,minWidth:0 }}>
                            <div style={{ fontSize:13,fontWeight:700,color:T.text }}>{t.name}</div>
                            <div style={{ display:"flex",gap:5,marginTop:2,flexWrap:"wrap" }}>
                              <span style={{ fontSize:10,padding:"1px 6px",borderRadius:5,background:info.color+"20",color:info.color,fontWeight:600 }}>{info.emoji} {info.label}</span>
                              <span style={{ fontSize:10,color:T.textMuted }}>{t.date}</span>
                              {t.notes&&<span style={{ fontSize:10,color:T.textMuted,fontStyle:"italic" }}>{t.notes}</span>}
                            </div>
                          </div>
                          <div style={{ fontSize:15,fontWeight:800,color:"#E84E8A",flexShrink:0 }}>-{fmt(t.amount)}</div>
                          <div style={{ display:"flex",gap:2,flexShrink:0 }}>
                            <button onClick={()=>setEditTx(t)} style={{ background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:13 }}>✎</button>
                            <button onClick={()=>delTx(t.id)} style={{ background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:13 }}>✕</button>
                          </div>
                        </div>
                      );
                    })}
                    <div style={{ ...card(),padding:"11px 16px",background:"#E84E8A08",border:"1px solid #E84E8A33",display:"flex",justifyContent:"space-between" }}>
                      <span style={{ fontSize:13,fontWeight:600,color:T.text }}>Total Spent</span>
                      <span style={{ fontSize:17,fontWeight:800,color:"#E84E8A" }}>-{fmt(totalSpent)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ════ GOALS ════ */}
        {view==="goals"&&(
          <div>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:8 }}>
              <div>
                <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:24,color:T.text }}>Savings Goals 🎯</div>
                <div style={{ fontSize:13,color:T.textSub,marginTop:2 }}>{myGoals.filter(g=>g.saved>=g.target).length}/{myGoals.length} goals reached</div>
              </div>
              <button onClick={()=>{setNewGoal({...blankG,owner:focus});setShowGoal(true);}} style={{ height:36,padding:"0 16px",borderRadius:9,border:"none",background:"#20B2AA",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,color:"#fff" }}>+ New Goal</button>
            </div>
            {myGoals.length===0
              ? <div style={{ ...card(),padding:"60px 20px",textAlign:"center" }}>
                  <div style={{ fontSize:44,marginBottom:12 }}>🎯</div>
                  <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:20,color:T.text,marginBottom:6 }}>No goals yet</div>
                  <div style={{ fontSize:13,color:T.textSub,lineHeight:1.6 }}>Set a goal — Emergency Fund, Move to KC,<br/>or something you're saving for together.</div>
                </div>
              : <div className="ba-goals">{myGoals.map(g=><GoalCard key={g.id} g={g} T={T} fmt={fmt} setEditGoal={setEditGoal} delGoal={delGoal} addToGoal={addToGoal}/>)}</div>
            }
          </div>
        )}

        {/* ════ NET WORTH ════ */}
        {view==="networth"&&(
          <div>
            <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:24,color:T.text,marginBottom:4 }}>Net Worth 💎</div>
            <div style={{ fontSize:13,color:T.textSub,marginBottom:20 }}>Assets − Liabilities = Your wealth</div>

            {/* Net worth hero */}
            <div style={{ ...card(),padding:"28px 24px",marginBottom:20,textAlign:"center",background:netWorth>=0?"linear-gradient(135deg,rgba(61,191,138,0.08),rgba(32,178,170,0.08))":"linear-gradient(135deg,rgba(232,78,138,0.08),rgba(232,112,74,0.08))",borderTop:`4px solid ${netWorth>=0?"#3DBF8A":"#E84E8A"}` }}>
              <div style={{ fontSize:11,fontWeight:700,color:T.textSub,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8 }}>Net Worth</div>
              <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:42,fontWeight:800,color:netWorth>=0?"#3DBF8A":"#E84E8A",lineHeight:1 }}>{netWorth<0?"-":""}{fmt(netWorth)}</div>
              <div style={{ display:"flex",justifyContent:"center",gap:24,marginTop:16,flexWrap:"wrap" }}>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:18,fontWeight:700,color:"#3DBF8A" }}>{fmt(totalAssets)}</div>
                  <div style={{ fontSize:11,color:T.textSub }}>Assets</div>
                </div>
                <div style={{ width:1,background:T.border }}/>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:18,fontWeight:700,color:"#E84E8A" }}>{fmt(totalLiabs)}</div>
                  <div style={{ fontSize:11,color:T.textSub }}>Liabilities</div>
                </div>
                <div style={{ width:1,background:T.border }}/>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:18,fontWeight:700,color:"#E8704A" }}>{fmt(totalDebtBalance)}</div>
                  <div style={{ fontSize:11,color:T.textSub }}>Debt Balances</div>
                </div>
              </div>
            </div>

            <div className="ba-g2">
              {/* Assets */}
              <div style={{ ...card(),padding:"20px" }}>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16 }}>
                  <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:17,color:"#3DBF8A" }}>Assets 📈</div>
                  <button onClick={()=>{setNewAsset({...blankA,owner:focus});setShowAsset(true);}} style={{ height:28,padding:"0 10px",borderRadius:7,border:"none",background:"#3DBF8A",color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700 }}>+ Add</button>
                </div>
                {myAssets.length===0 ? <div style={{ fontSize:13,color:T.textMuted,fontStyle:"italic",textAlign:"center",padding:"20px 0" }}>No assets yet. Add your savings, devices, vehicles...</div>
                  : myAssets.map(a=>{
                      const cat=asCatOf(a.category);
                      return (
                        <div key={a.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:`1px solid ${T.border}` }}>
                          <div style={{ width:32,height:32,borderRadius:8,background:cat.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0 }}>{cat.emoji}</div>
                          <div style={{ flex:1,minWidth:0 }}>
                            <div style={{ fontSize:13,fontWeight:600,color:T.text }}>{a.name}</div>
                            <div style={{ fontSize:11,color:T.textMuted }}>{cat.label}{a.notes?` · ${a.notes}`:""}</div>
                          </div>
                          <div style={{ fontSize:14,fontWeight:700,color:"#3DBF8A",flexShrink:0 }}>{fmt(a.value)}</div>
                          <div style={{ display:"flex",gap:2 }}>
                            <button onClick={()=>setEditAsset({...a,value:String(a.value)})} style={{ background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:13 }}>✎</button>
                            <button onClick={()=>delAsset(a.id)} style={{ background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:13 }}>✕</button>
                          </div>
                        </div>
                      );
                    })
                }
                {myAssets.length>0&&<div style={{ marginTop:10,padding:"8px 10px",background:"#3DBF8A12",borderRadius:8,display:"flex",justifyContent:"space-between",fontSize:13,fontWeight:700 }}><span style={{ color:T.textSub }}>Total Assets</span><span style={{ color:"#3DBF8A" }}>{fmt(totalAssets)}</span></div>}
              </div>

              {/* Liabilities */}
              <div style={{ ...card(),padding:"20px" }}>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16 }}>
                  <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:17,color:"#E84E8A" }}>Liabilities 📋</div>
                  <button onClick={()=>{setNewLiab({...blankL,owner:focus});setShowLiab(true);}} style={{ height:28,padding:"0 10px",borderRadius:7,border:"none",background:"#E84E8A",color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700 }}>+ Add</button>
                </div>
                {myLiabs.length===0 ? <div style={{ fontSize:13,color:T.textMuted,fontStyle:"italic",textAlign:"center",padding:"20px 0" }}>No liabilities. Great — or add loans, credit cards...</div>
                  : myLiabs.map(l=>{
                      const cat=liCatOf(l.category);
                      return (
                        <div key={l.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:`1px solid ${T.border}` }}>
                          <div style={{ width:32,height:32,borderRadius:8,background:cat.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0 }}>{cat.emoji}</div>
                          <div style={{ flex:1,minWidth:0 }}>
                            <div style={{ fontSize:13,fontWeight:600,color:T.text }}>{l.name}</div>
                            <div style={{ fontSize:11,color:T.textMuted }}>{cat.label}{l.notes?` · ${l.notes}`:""}</div>
                          </div>
                          <div style={{ fontSize:14,fontWeight:700,color:"#E84E8A",flexShrink:0 }}>-{fmt(l.value)}</div>
                          <div style={{ display:"flex",gap:2 }}>
                            <button onClick={()=>setEditLiab({...l,value:String(l.value)})} style={{ background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:13 }}>✎</button>
                            <button onClick={()=>delLiab(l.id)} style={{ background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:13 }}>✕</button>
                          </div>
                        </div>
                      );
                    })
                }
                {myLiabs.length>0&&<div style={{ marginTop:10,padding:"8px 10px",background:"#E84E8A12",borderRadius:8,display:"flex",justifyContent:"space-between",fontSize:13,fontWeight:700 }}><span style={{ color:T.textSub }}>Total Owed</span><span style={{ color:"#E84E8A" }}>{fmt(totalLiabs)}</span></div>}
              </div>
            </div>
          </div>
        )}

        {/* ════ ANALYTICS ════ */}
        {view==="analytics"&&(
          <div>
            <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:24,color:T.text,marginBottom:4 }}>Analytics 📈</div>
            <div style={{ fontSize:13,color:T.textSub,marginBottom:20 }}>Budget vs Actual · {focusName} · {BUDGET_MONTHS[month]} {year}</div>

            {/* Summary stat cards */}
            <div className="ba-g4" style={{ marginBottom:20 }}>
              {[
                { l:"Total Income",       v:fmt(totalIncome),  c:"#3DBF8A" },
                { l:"Total Spent",        v:fmt(totalSpent),   c:"#E84E8A" },
                { l:"Budget Utilization", v:`${totalBudgeted>0?Math.min(999,Math.round((totalSpent/totalBudgeted)*100)):0}%`, c:overBudget?"#E84E8A":"#20B2AA" },
                { l:"Cash Left",          v:(cashLeft<0?"-":"")+fmt(Math.abs(cashLeft)), c:cashLeft<0?"#E84E8A":"#3DBF8A" },
              ].map(s=>(
                <div key={s.l} style={{ ...card(),padding:"14px 16px",borderLeft:`4px solid ${s.c}` }}>
                  <div style={{ fontSize:20,fontWeight:800,color:T.text,lineHeight:1 }}>{s.v}</div>
                  <div style={{ fontSize:10,fontWeight:700,color:T.textSub,marginTop:3,textTransform:"uppercase",letterSpacing:"0.08em" }}>{s.l}</div>
                </div>
              ))}
            </div>

            {/* Pie + budget vs actual bars */}
            <div className="ba-g2" style={{ marginBottom:20 }}>
              <div style={{ ...card(),padding:"20px" }}>
                <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:17,color:T.text,marginBottom:16 }}>Spending by Category</div>
                {catRollup.filter(c=>c.spent>0).length===0
                  ? <div style={{ textAlign:"center",padding:"30px",color:T.textMuted,fontSize:13,fontStyle:"italic" }}>No expenses logged this month</div>
                  : <div style={{ display:"flex",alignItems:"center",gap:16,flexWrap:"wrap" }}>
                      <PieChart slices={catRollup.filter(c=>c.spent>0).map(c=>({ value:c.spent, color:c.info.color, label:c.info.label }))} T={T} size={150}/>
                      <div style={{ flex:1,minWidth:120 }}>
                        {catRollup.filter(c=>c.spent>0).sort((a,b)=>b.spent-a.spent).slice(0,8).map(cat=>(
                          <div key={cat.id} style={{ display:"flex",alignItems:"center",gap:8,marginBottom:7 }}>
                            <div style={{ width:8,height:8,borderRadius:2,background:cat.info.color,flexShrink:0 }}/>
                            <span style={{ fontSize:11,color:T.text,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{cat.info.emoji} {cat.name||cat.info.label}</span>
                            <span style={{ fontSize:11,fontWeight:700,color:cat.info.color,flexShrink:0 }}>{fmt(cat.spent)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                }
              </div>

              <div style={{ ...card(),padding:"20px" }}>
                <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:17,color:T.text,marginBottom:16 }}>Budget vs Actual</div>
                {catRollup.length===0
                  ? <div style={{ textAlign:"center",padding:"20px",color:T.textMuted,fontSize:13,fontStyle:"italic" }}>No budget categories yet</div>
                  : catRollup.sort((a,b)=>b.spent-a.spent).map(cat=>{
                      const over = cat.spent>cat.limit && cat.limit>0;
                      const pct  = cat.limit>0 ? Math.min(120,Math.round((cat.spent/cat.limit)*100)) : 0;
                      return (
                        <div key={cat.id} style={{ marginBottom:12 }}>
                          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:3,fontSize:12 }}>
                            <span style={{ color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"55%" }}>{cat.info.emoji} {cat.name||cat.info.label}</span>
                            <span style={{ color:over?"#E84E8A":"#3DBF8A",fontWeight:700,flexShrink:0 }}>
                              {fmt(cat.spent)}{cat.limit>0?` / ${fmt(cat.limit)}`:""}
                            </span>
                          </div>
                          <div style={{ height:6,background:T.inputBg,borderRadius:6,overflow:"hidden" }}>
                            <div style={{ height:"100%",width:`${Math.min(100,pct)}%`,background:over?"#E84E8A":pct>80?"#E8A838":"#20B2AA",borderRadius:6,transition:"width 0.4s" }}/>
                          </div>
                          {over && <div style={{ fontSize:10,color:"#E84E8A",marginTop:2 }}>Over by {fmt(cat.spent-cat.limit)}</div>}
                        </div>
                      );
                    })
                }
              </div>
            </div>

            {/* Monthly expense log */}
            <div style={{ ...card(),padding:"20px",marginBottom:20 }}>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:8 }}>
                <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:17,color:T.text }}>
                  Expense Log — {BUDGET_MONTHS[month]} {year}
                </div>
                <div style={{ fontSize:13,color:T.textSub }}>
                  {myExpenseTxs.length} transaction{myExpenseTxs.length!==1?"s":""} · Total: <strong style={{ color:"#E84E8A" }}>{fmt(totalSpent)}</strong>
                </div>
              </div>
              {myExpenseTxs.length===0
                ? <div style={{ textAlign:"center",padding:"30px",color:T.textMuted,fontSize:13,fontStyle:"italic" }}>No expenses logged this month yet</div>
                : <>
                    {/* Table header */}
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 110px 90px 60px",gap:8,padding:"7px 10px",background:T.inputBg,borderRadius:8,marginBottom:6,fontSize:10,fontWeight:700,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.06em" }}>
                      <span>Description</span>
                      <span>Category</span>
                      <span style={{ textAlign:"right" }}>Amount</span>
                      <span style={{ textAlign:"center" }}>Date</span>
                    </div>
                    {[...myExpenseTxs].sort((a,b)=>b.date<a.date?-1:1).map(tx=>{
                      const cat = catOf(tx.category||"other");
                      const budCat = catRollup.find(c=>c.id===tx.catId);
                      return (
                        <div key={tx.id} style={{ display:"grid",gridTemplateColumns:"1fr 110px 90px 60px",gap:8,padding:"9px 10px",borderBottom:`1px solid ${T.border}`,alignItems:"center" }}>
                          <div style={{ minWidth:0 }}>
                            <div style={{ fontSize:13,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontWeight:500 }}>{tx.name}</div>
                            {budCat && <div style={{ fontSize:10,color:T.textMuted,marginTop:1 }}>→ {budCat.name}</div>}
                          </div>
                          <div style={{ display:"flex",alignItems:"center",gap:5 }}>
                            <span style={{ fontSize:14 }}>{cat.emoji}</span>
                            <span style={{ fontSize:11,color:cat.color,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{cat.label}</span>
                          </div>
                          <div style={{ textAlign:"right",fontSize:13,fontWeight:700,color:"#E84E8A" }}>-{fmt(tx.amount)}</div>
                          <div style={{ textAlign:"center",fontSize:11,color:T.textMuted }}>{tx.date?.slice(5)||""}</div>
                        </div>
                      );
                    })}
                    {/* Total row */}
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 110px 90px 60px",gap:8,padding:"9px 10px",background:T.inputBg,borderRadius:8,marginTop:6,fontSize:13,fontWeight:800 }}>
                      <span style={{ color:T.text }}>Total</span>
                      <span/>
                      <span style={{ textAlign:"right",color:"#E84E8A" }}>-{fmt(totalSpent)}</span>
                      <span/>
                    </div>
                  </>
              }
            </div>

            {/* Income log */}
            {myIncomeTxs.length>0&&(
              <div style={{ ...card(),padding:"20px" }}>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:8 }}>
                  <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:17,color:T.text }}>
                    Income Log — {BUDGET_MONTHS[month]} {year}
                  </div>
                  <div style={{ fontSize:13,color:T.textSub }}>
                    {myIncomeTxs.length} source{myIncomeTxs.length!==1?"s":""} · Total: <strong style={{ color:"#3DBF8A" }}>{fmt(totalIncome)}</strong>
                  </div>
                </div>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 90px 60px",gap:8,padding:"7px 10px",background:T.inputBg,borderRadius:8,marginBottom:6,fontSize:10,fontWeight:700,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.06em" }}>
                  <span>Source</span><span style={{ textAlign:"right" }}>Amount</span><span style={{ textAlign:"center" }}>Date</span>
                </div>
                {[...myIncomeTxs].sort((a,b)=>b.date<a.date?-1:1).map(tx=>(
                  <div key={tx.id} style={{ display:"grid",gridTemplateColumns:"1fr 90px 60px",gap:8,padding:"9px 10px",borderBottom:`1px solid ${T.border}`,alignItems:"center" }}>
                    <span style={{ fontSize:13,color:T.text,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{tx.name}</span>
                    <span style={{ textAlign:"right",fontSize:13,fontWeight:700,color:"#3DBF8A" }}>+{fmt(tx.amount)}</span>
                    <span style={{ textAlign:"center",fontSize:11,color:T.textMuted }}>{tx.date?.slice(5)||""}</span>
                  </div>
                ))}
                <div style={{ display:"grid",gridTemplateColumns:"1fr 90px 60px",gap:8,padding:"9px 10px",background:T.inputBg,borderRadius:8,marginTop:6,fontSize:13,fontWeight:800 }}>
                  <span style={{ color:T.text }}>Total</span>
                  <span style={{ textAlign:"right",color:"#3DBF8A" }}>+{fmt(totalIncome)}</span>
                  <span/>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════ CONSECRATION ════ */}
        {view==="consecration"&&(()=>{
          const income = totalIncome;

          // Compute dollar amount for each item based on its mode
          function itemAmt(item){
            return item.mode==="pct" ? income*(parseFloat(item.pct)||0)/100 : parseFloat(item.fixed)||0;
          }

          const items = consecration.items || [
            { id:"mum",      label:"Mum",                     emoji:"🤱", color:"#E8A838", mode:"pct", pct:5,  fixed:0,  desc:"Honour your mother" },
            { id:"dad",      label:"Dad",                     emoji:"👨", color:"#3B9EDB", mode:"pct", pct:5,  fixed:0,  desc:"Honour your father" },
            { id:"offering", label:"Offering & Thanksgiving", emoji:"🙏", color:"#9B6EE8", mode:"fixed",pct:0, fixed:25, desc:"Returning to God" },
            { id:"giving",   label:"Giving to Others",        emoji:"💝", color:"#3DBF8A", mode:"fixed",pct:0, fixed:20, desc:"Give expecting nothing back" },
          ];

          const totalCon     = items.reduce((s,it)=>s+itemAmt(it),0);
          const pctOfIncome  = income>0 ? ((totalCon/income)*100).toFixed(1) : "—";

          const [editing,    setEditing]    = useState(null);   // id of item being edited
          const [draft,      setDraft]      = useState({});     // draft values while editing
          const [addingNew,  setAddingNew]  = useState(false);
          const [newItem,    setNewItem]    = useState({ label:"", emoji:"✨", color:"#E8A838", mode:"fixed", pct:0, fixed:0, desc:"" });

          function startEdit(item){ setEditing(item.id); setDraft({ label:item.label, emoji:item.emoji, color:item.color, mode:item.mode, pct:item.pct, fixed:item.fixed, desc:item.desc }); }
          function cancelEdit(){ setEditing(null); setDraft({}); }

          function saveEdit(id){
            const upd = items.map(it=> it.id===id ? {...it, ...draft, pct:parseFloat(draft.pct)||0, fixed:parseFloat(draft.fixed)||0 } : it);
            saveConsecration({...consecration, items:upd}); setEditing(null);
          }
          function deleteItem(id){
            saveConsecration({...consecration, items:items.filter(it=>it.id!==id)});
          }
          function addItem(){
            if(!newItem.label.trim()) return;
            const id = "con_"+Date.now().toString(36);
            saveConsecration({...consecration, items:[...items,{...newItem,id,pct:parseFloat(newItem.pct)||0,fixed:parseFloat(newItem.fixed)||0}]});
            setNewItem({ label:"", emoji:"✨", color:"#E8A838", mode:"fixed", pct:0, fixed:0, desc:"" });
            setAddingNew(false);
          }

          const inp = { background:T.inputBg, border:`1px solid ${T.border}`, borderRadius:8, padding:"7px 10px", color:T.text, fontFamily:"'DM Sans',sans-serif", fontSize:13, outline:"none", boxSizing:"border-box" };

          // SVG Pie chart — same helper used in analytics
          function ConPie({ slices, size=180 }){
            const total = slices.reduce((s,x)=>s+x.value,0);
            if(!total) return <div style={{ width:size,height:size,borderRadius:"50%",background:T.inputBg,display:"flex",alignItems:"center",justifyContent:"center",color:T.textMuted,fontSize:11 }}>No data</div>;
            let cum=0;
            const paths = slices.filter(s=>s.value>0).map(s=>{
              const pct=s.value/total, a1=cum*2*Math.PI-Math.PI/2, a2=(cum+pct)*2*Math.PI-Math.PI/2;
              cum+=pct;
              const r=size/2-8, cx=size/2, cy=size/2;
              const x1=cx+r*Math.cos(a1),y1=cy+r*Math.sin(a1),x2=cx+r*Math.cos(a2),y2=cy+r*Math.sin(a2);
              return {...s, d:`M${cx},${cy}L${x1},${y1}A${r},${r} 0 ${pct>.5?1:0},1 ${x2},${y2}Z`, pct};
            });
            return (
              <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ filter:"drop-shadow(0 4px 16px rgba(0,0,0,0.13))", flexShrink:0 }}>
                {paths.map((p,i)=><path key={i} d={p.d} fill={p.color} stroke={T.surface} strokeWidth={3}/>)}
                <circle cx={size/2} cy={size/2} r={size/4} fill={T.surface}/>
                <text x={size/2} y={size/2-6}  textAnchor="middle" fill={T.text}      fontSize={size*0.09} fontWeight="800" fontFamily="Arial">{income>0?((totalCon/income)*100).toFixed(0)+"%":"$0"}</text>
                <text x={size/2} y={size/2+12} textAnchor="middle" fill={T.textMuted} fontSize={size*0.07} fontFamily="Arial">consecrated</text>
              </svg>
            );
          }

          const COLORS = ["#E8A838","#3B9EDB","#9B6EE8","#3DBF8A","#E84E8A","#E8704A","#20B2AA","#8B5CF6","#5BAD4E","#E8C050"];

          return (
            <div>
              {/* Header */}
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:10 }}>
                <div>
                  <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:26, color:T.text, marginBottom:4 }}>🕊 Consecration</div>
                  <div style={{ fontSize:13, color:T.textSub, lineHeight:1.7, maxWidth:480 }}>
                    Set aside a portion of your income before you spend anything. These commitments are honoured first — every month, without negotiation.
                  </div>
                </div>
                <button onClick={()=>setAddingNew(true)} style={{ height:36, padding:"0 16px", borderRadius:9, border:"none", background:"#9B6EE8", color:"#fff", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:700, flexShrink:0 }}>+ Add Consecration</button>
              </div>

              {/* Hero — pie + total */}
              <div style={{ ...card(), padding:"20px 24px", marginBottom:24, display:"flex", alignItems:"center", gap:24, flexWrap:"wrap", background:`linear-gradient(135deg,${T.surface},${T.inputBg})`, borderTop:"4px solid #9B6EE8" }}>
                <ConPie size={160} slices={items.map(it=>({ value:itemAmt(it), color:it.color, label:it.label }))}/>
                <div style={{ flex:1, minWidth:160 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:T.textMuted, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6 }}>Total Consecrated</div>
                  <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:40, fontWeight:800, color:"#9B6EE8", lineHeight:1, marginBottom:6 }}>{fmt(totalCon)}</div>
                  <div style={{ fontSize:13, color:T.textSub, marginBottom:14 }}>
                    {income>0 ? `${pctOfIncome}% of your ${fmt(income)} income this month` : "Log income in Budget → Income to see live amounts"}
                  </div>
                  {/* Legend */}
                  <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                    {items.map(it=>{
                      const amt = itemAmt(it);
                      return (
                        <div key={it.id} style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <div style={{ width:10, height:10, borderRadius:2, background:it.color, flexShrink:0 }}/>
                          <span style={{ fontSize:12, color:T.text, flex:1 }}>{it.emoji} {it.label}</span>
                          <span style={{ fontSize:12, fontWeight:700, color:it.color }}>{fmt(amt)}</span>
                          {income>0 && <span style={{ fontSize:11, color:T.textMuted }}>({((amt/income)*100).toFixed(1)}%)</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* No income warning */}
              {income===0 && (
                <div style={{ background:"#E8A83812", border:"1px solid #E8A83844", borderRadius:10, padding:"12px 16px", marginBottom:16, fontSize:13, color:"#E8A838", display:"flex", gap:10, alignItems:"center" }}>
                  <span>⚠️</span>
                  <span>No income logged this month yet — go to <strong>Budget → Income</strong> to add your income first. Percentage-based consecrations will calculate automatically.</span>
                </div>
              )}

              {/* Consecration items */}
              <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:24 }}>
                {items.map((item,idx)=>{
                  const amt  = itemAmt(item);
                  const isEditing = editing===item.id;
                  return (
                    <div key={item.id} style={{ ...card(), padding:"16px 18px", borderLeft:`4px solid ${item.color}` }}>
                      {isEditing ? (
                        /* ── EDIT MODE ── */
                        <div>
                          <div style={{ fontSize:12, fontWeight:700, color:item.color, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>Editing — {item.label}</div>
                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
                            <div>
                              <div style={{ fontSize:11, color:T.textMuted, marginBottom:4 }}>Label</div>
                              <input style={{ ...inp, width:"100%" }} value={draft.label} onChange={e=>setDraft(d=>({...d,label:e.target.value}))}/>
                            </div>
                            <div>
                              <div style={{ fontSize:11, color:T.textMuted, marginBottom:4 }}>Emoji</div>
                              <input style={{ ...inp, width:"100%" }} value={draft.emoji} onChange={e=>setDraft(d=>({...d,emoji:e.target.value}))}/>
                            </div>
                          </div>
                          <div style={{ marginBottom:10 }}>
                            <div style={{ fontSize:11, color:T.textMuted, marginBottom:4 }}>Description (optional)</div>
                            <input style={{ ...inp, width:"100%" }} value={draft.desc} onChange={e=>setDraft(d=>({...d,desc:e.target.value}))} placeholder="e.g. Honour your mother"/>
                          </div>
                          {/* Color picker */}
                          <div style={{ marginBottom:10 }}>
                            <div style={{ fontSize:11, color:T.textMuted, marginBottom:6 }}>Color</div>
                            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                              {COLORS.map(col=>(
                                <div key={col} onClick={()=>setDraft(d=>({...d,color:col}))} style={{ width:24, height:24, borderRadius:6, background:col, cursor:"pointer", border:draft.color===col?`3px solid ${T.text}`:"3px solid transparent", boxSizing:"border-box" }}/>
                              ))}
                            </div>
                          </div>
                          {/* Mode toggle */}
                          <div style={{ marginBottom:10 }}>
                            <div style={{ fontSize:11, color:T.textMuted, marginBottom:6 }}>Amount type</div>
                            <div style={{ display:"flex", gap:6 }}>
                              {[["pct","% of income"],["fixed","Fixed $"]].map(([v,l])=>(
                                <button key={v} onClick={()=>setDraft(d=>({...d,mode:v}))} style={{ flex:1, padding:"7px", borderRadius:8, border:`1px solid ${draft.mode===v?item.color:T.border}`, background:draft.mode===v?item.color+"22":"transparent", color:draft.mode===v?item.color:T.textSub, fontFamily:"'DM Sans',sans-serif", fontSize:13, cursor:"pointer", fontWeight:draft.mode===v?700:400 }}>{l}</button>
                              ))}
                            </div>
                          </div>
                          {/* Value input */}
                          {draft.mode==="pct" ? (
                            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                              <input type="number" min="0" max="100" step="0.5" style={{ ...inp, width:80 }} value={draft.pct} onChange={e=>setDraft(d=>({...d,pct:e.target.value}))}/>
                              <span style={{ fontSize:13, color:T.textSub }}>% of income = <strong style={{ color:item.color }}>{fmt(income*(parseFloat(draft.pct||0)/100))}</strong>/mo</span>
                            </div>
                          ) : (
                            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                              <span style={{ fontSize:13, color:T.textSub }}>$</span>
                              <input type="number" min="0" step="1" style={{ ...inp, width:100 }} value={draft.fixed} onChange={e=>setDraft(d=>({...d,fixed:e.target.value}))}/>
                              <span style={{ fontSize:12, color:T.textMuted }}>fixed/month</span>
                            </div>
                          )}
                          <div style={{ display:"flex", gap:8 }}>
                            <button onClick={cancelEdit} style={{ flex:1, padding:"8px", borderRadius:8, border:`1px solid ${T.border}`, background:T.inputBg, color:T.textSub, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:13 }}>Cancel</button>
                            <button onClick={()=>saveEdit(item.id)} style={{ flex:2, padding:"8px", borderRadius:8, border:"none", background:item.color, color:"#fff", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:700 }}>Save</button>
                          </div>
                        </div>
                      ) : (
                        /* ── VIEW MODE ── */
                        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                          <div style={{ width:44, height:44, borderRadius:12, background:item.color+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{item.emoji}</div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:15, fontWeight:700, color:T.text }}>{item.label}</div>
                            {item.desc && <div style={{ fontSize:12, color:T.textMuted, fontStyle:"italic" }}>{item.desc}</div>}
                            <div style={{ display:"flex", alignItems:"baseline", gap:8, marginTop:4 }}>
                              <span style={{ fontSize:22, fontWeight:800, color:item.color }}>{fmt(amt)}</span>
                              <span style={{ fontSize:12, color:T.textMuted }}>
                                {item.mode==="pct" ? `${item.pct}% of income` : "fixed/month"}
                              </span>
                              {income>0 && item.mode==="fixed" && <span style={{ fontSize:11, color:T.textMuted }}>({((amt/income)*100).toFixed(1)}% of income)</span>}
                            </div>
                          </div>
                          <div style={{ display:"flex", gap:4, flexShrink:0 }}>
                            <button onClick={()=>startEdit(item)} style={{ background:"none", border:"none", color:T.textMuted, cursor:"pointer", fontSize:15, padding:"4px 6px", borderRadius:6 }}>✎</button>
                            <button onClick={()=>deleteItem(item.id)} style={{ background:"none", border:"none", color:T.textMuted, cursor:"pointer", fontSize:15, padding:"4px 6px", borderRadius:6 }}>✕</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add new consecration */}
              {addingNew && (
                <div style={{ ...card(), padding:"18px 20px", marginBottom:24, borderLeft:"4px solid #9B6EE8" }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"#9B6EE8", marginBottom:14 }}>New Consecration</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
                    <div>
                      <div style={{ fontSize:11, color:T.textMuted, marginBottom:4 }}>Label *</div>
                      <input style={{ ...inp, width:"100%" }} value={newItem.label} onChange={e=>setNewItem(n=>({...n,label:e.target.value}))} placeholder="e.g. Church, Sibling..."/>
                    </div>
                    <div>
                      <div style={{ fontSize:11, color:T.textMuted, marginBottom:4 }}>Emoji</div>
                      <input style={{ ...inp, width:"100%" }} value={newItem.emoji} onChange={e=>setNewItem(n=>({...n,emoji:e.target.value}))}/>
                    </div>
                  </div>
                  <div style={{ marginBottom:10 }}>
                    <div style={{ fontSize:11, color:T.textMuted, marginBottom:4 }}>Description</div>
                    <input style={{ ...inp, width:"100%" }} value={newItem.desc} onChange={e=>setNewItem(n=>({...n,desc:e.target.value}))} placeholder="e.g. Supporting a sibling's education"/>
                  </div>
                  <div style={{ marginBottom:10 }}>
                    <div style={{ fontSize:11, color:T.textMuted, marginBottom:6 }}>Color</div>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                      {COLORS.map(col=>(
                        <div key={col} onClick={()=>setNewItem(n=>({...n,color:col}))} style={{ width:24, height:24, borderRadius:6, background:col, cursor:"pointer", border:newItem.color===col?`3px solid ${T.text}`:"3px solid transparent", boxSizing:"border-box" }}/>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom:10 }}>
                    <div style={{ fontSize:11, color:T.textMuted, marginBottom:6 }}>Amount type</div>
                    <div style={{ display:"flex", gap:6 }}>
                      {[["pct","% of income"],["fixed","Fixed $"]].map(([v,l])=>(
                        <button key={v} onClick={()=>setNewItem(n=>({...n,mode:v}))} style={{ flex:1, padding:"7px", borderRadius:8, border:`1px solid ${newItem.mode===v?"#9B6EE8":T.border}`, background:newItem.mode===v?"#9B6EE822":"transparent", color:newItem.mode===v?"#9B6EE8":T.textSub, fontFamily:"'DM Sans',sans-serif", fontSize:13, cursor:"pointer", fontWeight:newItem.mode===v?700:400 }}>{l}</button>
                      ))}
                    </div>
                  </div>
                  {newItem.mode==="pct" ? (
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                      <input type="number" min="0" max="100" step="0.5" style={{ ...inp, width:80 }} value={newItem.pct} onChange={e=>setNewItem(n=>({...n,pct:e.target.value}))}/>
                      <span style={{ fontSize:13, color:T.textSub }}>% = <strong style={{ color:"#9B6EE8" }}>{fmt(income*(parseFloat(newItem.pct||0)/100))}</strong>/mo</span>
                    </div>
                  ) : (
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                      <span style={{ fontSize:13, color:T.textSub }}>$</span>
                      <input type="number" min="0" step="1" style={{ ...inp, width:100 }} value={newItem.fixed} onChange={e=>setNewItem(n=>({...n,fixed:e.target.value}))}/>
                      <span style={{ fontSize:12, color:T.textMuted }}>fixed/month</span>
                    </div>
                  )}
                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={()=>setAddingNew(false)} style={{ flex:1, padding:"9px", borderRadius:9, border:`1px solid ${T.border}`, background:T.inputBg, color:T.textSub, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:13 }}>Cancel</button>
                    <button onClick={addItem} disabled={!newItem.label.trim()} style={{ flex:2, padding:"9px", borderRadius:9, border:"none", background:newItem.label.trim()?"#9B6EE8":"#888", color:"#fff", cursor:newItem.label.trim()?"pointer":"not-allowed", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:700 }}>Add Consecration</button>
                  </div>
                </div>
              )}

              {/* 50/30/20 Split Plan */}
              {(()=>{
                const afterCon = Math.max(0, income - totalCon);
                const needsAmt   = afterCon * (splitPlan.needs/100);
                const wantsAmt   = afterCon * (splitPlan.wants/100);
                const savingsAmt = afterCon * (splitPlan.savings/100);
                const total3     = (splitPlan.needs||0)+(splitPlan.wants||0)+(splitPlan.savings||0);
                const balanced   = Math.round(total3)===100;
                const [editSplit, setEditSplit]   = useState(false);
                const [splitDraft, setSplitDraft] = useState({...splitPlan});
                const needsCatIds   = ["housing","food","transport","health","utilities","education"];
                const savingsCatIds = ["savings","invest"];
                const catBucket = cat => savingsCatIds.includes(cat.category)?"savings":needsCatIds.includes(cat.category)?"needs":"wants";
                const needsSpent   = catRollup.filter(c=>catBucket(c)==="needs").reduce((s,c)=>s+c.spent,0);
                const wantsSpent   = catRollup.filter(c=>catBucket(c)==="wants").reduce((s,c)=>s+c.spent,0);
                const savingsSpent = catRollup.filter(c=>catBucket(c)==="savings").reduce((s,c)=>s+c.spent,0);
                const buckets = [
                  { key:"needs",   label:"Needs",   emoji:"🏠", color:"#3B9EDB", amt:needsAmt,   spent:needsSpent,   desc:"Rent, groceries, transport, bills" },
                  { key:"wants",   label:"Wants",   emoji:"🎮", color:"#E84E8A", amt:wantsAmt,   spent:wantsSpent,   desc:"Dining out, entertainment, shopping" },
                  { key:"savings", label:"Savings", emoji:"💰", color:"#3DBF8A", amt:savingsAmt, spent:savingsSpent, desc:"Emergency fund, goals, investments" },
                ];
                const inp2 = { background:T.inputBg, border:`1px solid ${T.border}`, borderRadius:8, padding:"7px 10px", color:T.text, fontFamily:"'DM Sans',sans-serif", fontSize:13, outline:"none", boxSizing:"border-box" };
                return (
                  <div>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                      <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:20, color:T.text }}>📊 Budget Split Plan</div>
                      <button onClick={()=>{ setSplitDraft({...splitPlan}); setEditSplit(e=>!e); }} style={{ background:"none", border:`1px solid ${T.border}`, borderRadius:7, padding:"4px 12px", color:T.textSub, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:12 }}>
                        {editSplit?"Cancel":"✎ Edit"}
                      </button>
                    </div>
                    <div style={{ fontSize:13, color:T.textSub, marginBottom:14, lineHeight:1.6 }}>
                      After consecration ({fmt(totalCon)}), you have <strong style={{ color:"#3DBF8A" }}>{fmt(afterCon)}</strong> left to split across your budget.
                    </div>
                    {editSplit && (
                      <div style={{ ...card(), padding:"16px 18px", marginBottom:14 }}>
                        <div style={{ fontSize:12, color:T.textSub, marginBottom:10 }}>Percentages must total 100%</div>
                        {[["needs","Needs 🏠","#3B9EDB"],["wants","Wants 🎮","#E84E8A"],["savings","Savings 💰","#3DBF8A"]].map(([k,l,col])=>(
                          <div key={k} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                            <span style={{ fontSize:13, color:T.text, minWidth:90, fontWeight:600 }}>{l}</span>
                            <input type="number" min="0" max="100" style={{ ...inp2, width:70 }} value={splitDraft[k]} onChange={e=>setSplitDraft(d=>({...d,[k]:parseFloat(e.target.value)||0}))}/>
                            <span style={{ fontSize:12, color:col, fontWeight:600 }}>% = {fmt(afterCon*(splitDraft[k]/100))}</span>
                          </div>
                        ))}
                        <div style={{ fontSize:12, marginBottom:10, fontWeight:600, color:(splitDraft.needs+splitDraft.wants+splitDraft.savings)===100?"#3DBF8A":"#E84E8A" }}>
                          Total: {splitDraft.needs+splitDraft.wants+splitDraft.savings}% {(splitDraft.needs+splitDraft.wants+splitDraft.savings)===100?"✓ Balanced":"— needs to equal 100"}
                        </div>
                        <button onClick={()=>{ saveSplitPlan(splitDraft); setEditSplit(false); }} disabled={!balanced && (splitDraft.needs+splitDraft.wants+splitDraft.savings)!==100}
                          style={{ width:"100%", padding:"9px", borderRadius:8, border:"none", background:(splitDraft.needs+splitDraft.wants+splitDraft.savings)===100?"#20B2AA":"#888", color:"#fff", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:700 }}>
                          Save Split Plan
                        </button>
                      </div>
                    )}
                    <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:8 }}>
                      {buckets.map(b=>{
                        const over  = b.spent > b.amt && b.amt > 0;
                        const pct   = b.amt>0 ? Math.min(100,Math.round((b.spent/b.amt)*100)) : 0;
                        return (
                          <div key={b.key} style={{ ...card(), padding:"14px 16px", borderLeft:`4px solid ${b.color}` }}>
                            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                              <div>
                                <span style={{ fontSize:15, fontWeight:700, color:T.text }}>{b.emoji} {b.label} </span>
                                <span style={{ fontSize:12, color:T.textMuted }}>({splitPlan[b.key]}% — {fmt(b.amt)}/mo)</span>
                                <div style={{ fontSize:11, color:T.textMuted, marginTop:2 }}>{b.desc}</div>
                              </div>
                              <div style={{ textAlign:"right", flexShrink:0 }}>
                                <div style={{ fontSize:14, fontWeight:800, color:over?"#E84E8A":b.color }}>{fmt(b.spent)}</div>
                                <div style={{ fontSize:11, color:T.textMuted }}>spent</div>
                              </div>
                            </div>
                            <div style={{ height:7, background:T.inputBg, borderRadius:7, overflow:"hidden" }}>
                              <div style={{ height:"100%", width:`${pct}%`, background:over?"#E84E8A":b.color, borderRadius:7, transition:"width 0.4s" }}/>
                            </div>
                            {over && <div style={{ fontSize:11, color:"#E84E8A", marginTop:5, fontWeight:600 }}>⚠ Over budget by {fmt(b.spent-b.amt)}</div>}
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ fontSize:11, color:T.textMuted, lineHeight:1.8, padding:"10px 14px", background:T.inputBg, borderRadius:8 }}>
                      🏠 <strong style={{ color:"#3B9EDB" }}>Needs</strong>: Housing, Food, Transport, Health, Utilities, Education &nbsp;·&nbsp;
                      💰 <strong style={{ color:"#3DBF8A" }}>Savings</strong>: Savings, Investing &nbsp;·&nbsp;
                      🎮 <strong style={{ color:"#E84E8A" }}>Wants</strong>: Everything else
                    </div>
                  </div>
                );
              })()}
            </div>
          );
        })()}

        {/* ════ DEBTS ════ */}
        {view==="debt"&&(
          <DebtView debts={myDebts} T={T} mode={mode} focus={focus} fmt={fmt} names={names}
            onAdd={()=>{setNewDebt({...blankD,owner:focus});setShowDebt(true);}}
            onEdit={(d)=>setEditDebt({...d,balance:String(d.balance),limit:String(d.limit),apr:String(d.apr),minPayment:String(d.minPayment)})}
            onDelete={delDebt} onPayment={makeDebtPayment}/>
        )}

        {/* ════ REPORT ════ */}
        {view==="report"&&(
          <ReportView lines={catRollup} goals={myGoals} debts={myDebts} assets={myAssets} liabs={myLiabs}
            month={month} year={year} focus={focus} focusName={focusName} names={names}
            T={T} mode={mode} fmt={fmt} BUDGET_MONTHS={BUDGET_MONTHS} reportPeriod={reportPeriod} setReportPeriod={setReportPeriod}
            totalAssets={totalAssets} totalLiabs={totalLiabs} totalDebtBalance={totalDebtBalance} netWorth={netWorth}/>
        )}
        </div>{/* end ba-pad */}
      </div>{/* end ba-scroll */}

      {/* Forms */}
      {showCat&&<BudgetCatForm onSave={addCat} onClose={()=>setShowCat(false)} T={T} mode={mode}/>}
      {editCat&&<BudgetCatForm data={editCat} onSave={saveEditCat} onClose={()=>setEditCat(null)} T={T} mode={mode}/>}
      {showTx&&<UnifiedTxForm prefill={logItem} onSave={addTx} onClose={()=>{setShowTx(false);setLogItem(null);}} T={T} mode={mode}/>}
      {editTx&&<UnifiedTxForm data={editTx} onSave={saveEditTx} onClose={()=>setEditTx(null)} T={T} mode={mode}/>}
      {showGoal&&<GoalForm data={newGoal} setData={setNewGoal} onSave={addGoal} onClose={()=>setShowGoal(false)} T={T} mode={mode}/>}
      {editGoal&&<GoalForm data={editGoal} setData={setEditGoal} onSave={saveEditGoal} onClose={()=>setEditGoal(null)} T={T} mode={mode}/>}
      {showAsset&&<AssetForm data={newAsset} setData={setNewAsset} onSave={addAsset} onClose={()=>setShowAsset(false)} T={T} mode={mode} type="asset"/>}
      {editAsset&&<AssetForm data={editAsset} setData={setEditAsset} onSave={saveEditAsset} onClose={()=>setEditAsset(null)} T={T} mode={mode} type="asset"/>}
      {showLiab&&<AssetForm data={newLiab} setData={setNewLiab} onSave={addLiab} onClose={()=>setShowLiab(false)} T={T} mode={mode} type="liability"/>}
      {editLiab&&<AssetForm data={editLiab} setData={setEditLiab} onSave={saveEditLiab} onClose={()=>setEditLiab(null)} T={T} mode={mode} type="liability"/>}
      {showBulk&&<BudgetBulkImport onClose={()=>setShowBulk(false)} onImport={bulkImportCats} T={T} mode={mode} focus={focus}/>}
      {showDebt&&<DebtForm data={newDebt} setData={setNewDebt} onSave={addDebt} onClose={()=>setShowDebt(false)} T={T} mode={mode}/>}
      {editDebt&&<DebtForm data={editDebt} setData={setEditDebt} onSave={saveEditDebt} onClose={()=>setEditDebt(null)} T={T} mode={mode}/>}
      {showTour&&<BudgetTour step={tourStep} setStep={setTourStep} onClose={finishTour} T={T} mode={mode}/>}
    </div>
  );
}


// ── DedupModal ─────────────────────────────────────────────────────────────
// Finds tasks with identical titles (case-insensitive), shows them grouped,
// and lets the user delete all duplicates keeping only the first occurrence.
function DedupModal({ onClose, tasks, onDelete, T, mode }) {
  // Group tasks by normalised title
  const groups = Object.values(
    tasks.reduce((acc, t) => {
      const key = t.title.trim().toLowerCase();
      if (!acc[key]) acc[key] = [];
      acc[key].push(t);
      return acc;
    }, {})
  ).filter(g => g.length > 1);

  // For each group, keep the first (oldest by index), mark the rest as dupes
  const dupeIds = groups.flatMap(g => g.slice(1).map(t => t.id));
  const [confirmed, setConfirmed] = useState(false);

  function handleDelete() {
    onDelete(dupeIds);
    onClose();
  }

  return (
    <div style={{ position:"fixed",inset:0,zIndex:40,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center" }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:"18px 18px 0 0",width:"100%",maxWidth:520,maxHeight:"80vh",overflowY:"auto",padding:"24px 20px 36px",boxShadow:"0 -4px 32px rgba(0,0,0,0.3)" }}>
        <div style={{ width:40,height:4,borderRadius:2,background:T.textMuted,margin:"0 auto 20px",opacity:0.4 }}/>
        <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:22,color:T.text,marginBottom:4 }}>🗂 Remove Duplicates</div>
        <div style={{ height:2,width:40,background:"#E84E8A",borderRadius:2,marginBottom:18 }}/>

        {groups.length === 0 ? (
          <>
            <div style={{ textAlign:"center",padding:"30px 0" }}>
              <div style={{ fontSize:36,marginBottom:12 }}>✅</div>
              <div style={{ fontSize:16,fontWeight:600,color:T.text,marginBottom:6 }}>No duplicates found</div>
              <div style={{ fontSize:13,color:T.textSub }}>All your tasks have unique titles.</div>
            </div>
            <button onClick={onClose} style={{ width:"100%",padding:"10px",borderRadius:10,border:"none",background:T.inputBg,color:T.textSub,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600 }}>Close</button>
          </>
        ) : (
          <>
            <div style={{ fontSize:13,color:T.textSub,marginBottom:16,lineHeight:1.6 }}>
              Found <strong style={{ color:"#E84E8A" }}>{dupeIds.length} duplicate{dupeIds.length!==1?"s":""}</strong> across <strong style={{ color:T.text }}>{groups.length} group{groups.length!==1?"s":""}</strong>. The first version of each task will be kept. All copies after that will be deleted.
            </div>

            {/* List each group */}
            <div style={{ display:"flex",flexDirection:"column",gap:10,marginBottom:20 }}>
              {groups.map((g, i) => (
                <div key={i} style={{ background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:10,padding:"12px 14px" }}>
                  <div style={{ fontSize:12,fontWeight:700,color:"#E84E8A",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6 }}>
                    {g.length} copies
                  </div>
                  <div style={{ fontSize:13,fontWeight:600,color:T.text,marginBottom:8 }}>"{g[0].title}"</div>
                  <div style={{ display:"flex",flexDirection:"column",gap:4 }}>
                    {g.map((t, j) => (
                      <div key={t.id} style={{ display:"flex",alignItems:"center",gap:8,fontSize:12,color:j===0?T.textSub:"#E84E8A" }}>
                        <span style={{ fontSize:10,padding:"1px 6px",borderRadius:4,background:j===0?"#3DBF8A22":"#E84E8A22",color:j===0?"#3DBF8A":"#E84E8A",fontWeight:700,flexShrink:0 }}>
                          {j===0?"KEEP":"DELETE"}
                        </span>
                        <span style={{ overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",textDecoration:j>0?"line-through":"none",opacity:j>0?0.6:1 }}>
                          {t.title} {t.dueDate?`· ${t.dueDate}`:""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {!confirmed ? (
              <button
                onClick={()=>setConfirmed(true)}
                style={{ width:"100%",padding:"11px",borderRadius:10,border:"none",background:"#E84E8A",color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:700 }}>
                Delete {dupeIds.length} Duplicate{dupeIds.length!==1?"s":""}
              </button>
            ) : (
              <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                <div style={{ background:"#E84E8A18",border:"1px solid #E84E8A44",borderRadius:10,padding:"12px 14px",fontSize:13,color:T.text,textAlign:"center",lineHeight:1.6 }}>
                  Are you sure? This will permanently delete <strong style={{ color:"#E84E8A" }}>{dupeIds.length} task{dupeIds.length!==1?"s":""}</strong> and cannot be undone.
                </div>
                <div style={{ display:"flex",gap:10 }}>
                  <button onClick={()=>setConfirmed(false)} style={{ flex:1,padding:"10px",borderRadius:10,border:`1px solid ${T.border}`,background:T.inputBg,color:T.textSub,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600 }}>Cancel</button>
                  <button onClick={handleDelete} style={{ flex:1,padding:"10px",borderRadius:10,border:"none",background:"#E84E8A",color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:700 }}>Yes, Delete All</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function BulkImportModal({ onClose, onImport, T, mode, names, activeUser, SECTIONS, TASK_TYPES, PRIORITIES, TODAY }) {
  const [text,      setText]      = useState("");
  const [parsed,    setParsed]    = useState([]);
  const [step,      setStep]      = useState("input"); // "input" | "review"
  const [defaults,  setDefaults]  = useState({ section:"faith", type:"todo", assignee:activeUser||"A", priority:"Medium" });
  const titleRef = useRef(null);

  useEffect(()=>{ const t=setTimeout(()=>{ if(titleRef.current) titleRef.current.focus(); },80); return()=>clearTimeout(t); },[]);

  // ── Smart date parser ────────────────────────────────────────────────────
  function parseDate(str) {
    if (!str) return "";
    const s = str.trim().toLowerCase();
    const now = new Date();
    if (s === "today")     return TODAY;
    if (s === "tomorrow")  { const d=new Date(now); d.setDate(d.getDate()+1); return d.toISOString().slice(0,10); }
    if (s === "next week") { const d=new Date(now); d.setDate(d.getDate()+7); return d.toISOString().slice(0,10); }
    // "in N days/weeks"
    const inMatch = s.match(/^in (\d+) (day|week)s?$/);
    if (inMatch) {
      const n = parseInt(inMatch[1]);
      const d = new Date(now);
      d.setDate(d.getDate() + (inMatch[2]==="week" ? n*7 : n));
      return d.toISOString().slice(0,10);
    }
    // "this friday/monday/..."
    const days = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
    const dayMatch = s.match(/^(this |next )?(sunday|monday|tuesday|wednesday|thursday|friday|saturday)$/);
    if (dayMatch) {
      const target = days.indexOf(dayMatch[2]);
      const d = new Date(now);
      let diff = target - d.getDay();
      if (diff <= 0 || dayMatch[1]==="next ") diff += 7;
      d.setDate(d.getDate() + diff);
      return d.toISOString().slice(0,10);
    }
    // ISO or MM/DD/YYYY or DD/MM/YYYY
    const isoMatch = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (isoMatch) return s;
    const slashMatch = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
    if (slashMatch) {
      const y = slashMatch[3].length===2?"20"+slashMatch[3]:slashMatch[3];
      return `${y}-${slashMatch[1].padStart(2,"0")}-${slashMatch[2].padStart(2,"0")}`;
    }
    // "April 15" or "15 April"
    const months = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
    const mMatch1 = s.match(/^([a-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s+(\d{4}))?$/);
    const mMatch2 = s.match(/^(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)(?:\s+(\d{4}))?$/);
    const mMatch  = mMatch1 || mMatch2;
    if (mMatch) {
      const monthStr = mMatch1 ? mMatch[1] : mMatch[2];
      const dayNum   = mMatch1 ? mMatch[2] : mMatch[1];
      const year     = mMatch[3] || now.getFullYear();
      const mi = months.findIndex(m => monthStr.startsWith(m));
      if (mi !== -1) return `${year}-${String(mi+1).padStart(2,"0")}-${String(dayNum).padStart(2,"0")}`;
    }
    return "";
  }

  // ── Smart section detector ───────────────────────────────────────────────
  function detectSection(text) {
    const t = text.toLowerCase();
    const map = [
      ["faith",     ["pray","devotion","bible","church","worship","faith","god","sermon","tithe"]],
      ["health",    ["workout","gym","exercise","run","walk","yoga","health","diet","sleep","doctor","medical"]],
      ["finance",   ["budget","money","bank","invest","savings","pay","bill","tax","finance","rent","loan"]],
      ["school",    ["study","class","lecture","assignment","exam","thesis","phd","homework","grade","school","university"]],
      ["work",      ["work","job","meeting","email","client","project","deadline","report","career","office"]],
      ["relation",  ["date","partner","anniversary","love","relationship","dinner","couple","wife","husband","boyfriend","girlfriend"]],
      ["home",      ["clean","cook","groceries","laundry","chores","dishes","vacuum","trash","home","house"]],
      ["health",    ["meditat","mental","therapy","mindful"]],
      ["hobbies",   ["read","book","game","music","hobby","art","draw","paint","movie","watch","listen"]],
      ["social",    ["call","text","friend","family","parents","visit","party","social","birthday"]],
      ["growth",    ["learn","course","skill","habit","goal","growth","personal","develop","journal"]],
      ["church",    ["church","fellowship","impact","ministry","volunteer","service","worship","praise"]],
      ["finance",   ["stock","crypto","insurance","401k","emergency fund"]],
    ];
    for (const [sec, keywords] of map) {
      if (keywords.some(k => t.includes(k))) return sec;
    }
    return null;
  }

  // ── Smart priority detector ──────────────────────────────────────────────
  function detectPriority(text) {
    const t = text.toLowerCase();
    if (t.includes("urgent") || t.includes("asap") || t.includes("critical")) return "Urgent";
    if (t.includes(" high") || t.includes("important")) return "High";
    if (t.includes(" low") || t.includes("someday") || t.includes("eventually")) return "Low";
    return null;
  }

  // ── Parse a single line ──────────────────────────────────────────────────
  function parseLine(line) {
    const raw = line.trim();
    if (!raw || raw.startsWith("#") || raw.startsWith("//")) return null;

    // Split on | delimiter for structured format
    const parts = raw.split("|").map(p => p.trim());
    let title = parts[0];
    let dueDate = "";
    let section = defaults.section;
    let type = defaults.type;
    let assignee = defaults.assignee;
    let priority = defaults.priority;

    // Parse remaining pipe-separated fields
    for (let i = 1; i < parts.length; i++) {
      const p = parts[i].trim().toLowerCase();
      // Date?
      const dateAttempt = parseDate(p);
      if (dateAttempt) { dueDate = dateAttempt; continue; }
      // Section?
      const secMatch = SECTIONS.find(s => s.id===p || s.label.toLowerCase()===p);
      if (secMatch) { section = secMatch.id; continue; }
      // Type?
      const typeMatch = TASK_TYPES.find(t => t.id===p || t.label.toLowerCase()===p);
      if (typeMatch) { type = typeMatch.id; continue; }
      // Priority?
      const priMatch = PRIORITIES.find(pr => pr.toLowerCase()===p);
      if (priMatch) { priority = priMatch; continue; }
      // Assignee?
      if (p==="a" || p===names.A.toLowerCase()) { assignee="A"; continue; }
      if (p==="b" || p===names.B.toLowerCase()) { assignee="B"; continue; }
      if (p==="both") { assignee="both"; continue; }
    }

    // Extract @mentions from title: @faith, @high, @both, @daily, @2024-05-01
    const atRegex = /@([\w-]+)/g;
    let match;
    while ((match = atRegex.exec(title)) !== null) {
      const tag = match[1].toLowerCase();
      const dateAttempt = parseDate(tag);
      if (dateAttempt) { dueDate = dateAttempt; }
      else {
        const secM = SECTIONS.find(s => s.id===tag || s.label.toLowerCase()===tag);
        if (secM) { section = secM.id; }
        const priM = PRIORITIES.find(p => p.toLowerCase()===tag);
        if (priM) { priority = priM; }
        const typeM = TASK_TYPES.find(t => t.id===tag);
        if (typeM) { type = typeM.id; }
        if (tag==="a" || tag===names.A.toLowerCase()) assignee="A";
        if (tag==="b" || tag===names.B.toLowerCase()) assignee="B";
        if (tag==="both") assignee="both";
      }
    }
    // Clean @mentions from title
    title = title.replace(/@[\w-]+/g, "").replace(/\s+/g," ").trim();

    // Auto-detect section from title keywords if still at default
    if (section === defaults.section) {
      const detected = detectSection(title);
      if (detected) section = detected;
    }
    // Auto-detect priority from title
    if (priority === defaults.priority) {
      const detected = detectPriority(title);
      if (detected) priority = detected;
    }

    if (!title) return null;
    return { title, section, type, assignee, priority, dueDate, notes:"" };
  }

  function handleParse() {
    const lines = text.split("\n").map(l=>l.trim()).filter(Boolean);
    const results = lines.map(parseLine).filter(Boolean);
    setParsed(results);
    setStep("review");
  }

  function handleImport() {
    onImport(parsed);
    onClose();
  }

  function updateParsed(idx, field, val) {
    setParsed(prev => prev.map((t,i) => i===idx ? {...t,[field]:val} : t));
  }
  function removeRow(idx) { setParsed(prev=>prev.filter((_,i)=>i!==idx)); }

  const inpSt = { width:"100%", background:T.inputBg, border:`1px solid ${T.border}`, borderRadius:9, padding:"9px 12px", color:T.text, fontFamily:"'DM Sans',sans-serif", fontSize:13, outline:"none", boxSizing:"border-box" };
  const selSt = { ...inpSt, background:mode==="dark"?"#181B23":"#fff", cursor:"pointer", padding:"7px 10px" };
  const aColor = u => u==="A"?"#E8A838":u==="B"?"#E84E8A":"#3DBF8A";

  return (
    <div style={{ position:"fixed",inset:0,zIndex:40,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center" }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:"18px 18px 0 0",boxShadow:"0 -4px 40px rgba(0,0,0,0.4)",width:"100%",maxWidth:680,maxHeight:"94vh",overflowY:"auto",padding:"24px 20px 36px" }}>
        <div style={{ width:40,height:4,borderRadius:2,background:T.textMuted,margin:"0 auto 20px",opacity:0.4 }}/>
        <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:22,color:T.text,marginBottom:4 }}>⇪ Bulk Import Tasks</div>
        <div style={{ height:2,width:40,background:"#9B6EE8",borderRadius:2,marginBottom:16 }}/>

        {step==="input" && (
          <>
            {/* Format guide */}
            <div style={{ background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:10,padding:"12px 14px",marginBottom:16,fontSize:12,color:T.textSub,lineHeight:1.8 }}>
              <div style={{ fontWeight:700,color:T.text,marginBottom:6,fontSize:13 }}>📋 Supported formats (one task per line):</div>
              {[
                ["Simple",          "Buy groceries"],
                ["With due date",   "Finish assignment | April 15"],
                ["With section",    "Morning devotion | @faith | daily"],
                ["Full detail",     "Review budget | 2025-04-30 | high | @finance | both"],
                ["Natural dates",   "Call parents | tomorrow  or  next friday  or  in 3 days"],
                ["@Tags in title",  "Study for exam @school @high | next monday"],
              ].map(([label,example])=>(
                <div key={label} style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                  <span style={{ color:T.textMuted,flexShrink:0,minWidth:110 }}>{label}:</span>
                  <code style={{ color:"#9B6EE8",fontSize:11,background:"#9B6EE811",padding:"1px 6px",borderRadius:4 }}>{example}</code>
                </div>
              ))}
            </div>

            {/* Default settings */}
            <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:12 }}>
              <div style={{ flex:"1 1 120px" }}>
                <div style={{ fontSize:10,fontWeight:600,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4 }}>Default Section</div>
                <select style={selSt} value={defaults.section} onChange={e=>setDefaults(p=>({...p,section:e.target.value}))}>
                  {SECTIONS.map(s=><option key={s.id} value={s.id}>{s.emoji} {s.label}</option>)}
                </select>
              </div>
              <div style={{ flex:"1 1 100px" }}>
                <div style={{ fontSize:10,fontWeight:600,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4 }}>Default Type</div>
                <select style={selSt} value={defaults.type} onChange={e=>setDefaults(p=>({...p,type:e.target.value}))}>
                  {TASK_TYPES.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
              <div style={{ flex:"1 1 100px" }}>
                <div style={{ fontSize:10,fontWeight:600,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4 }}>Default Assign</div>
                <select style={selSt} value={defaults.assignee} onChange={e=>setDefaults(p=>({...p,assignee:e.target.value}))}>
                  <option value="A">{names.A}</option>
                  <option value="B">{names.B}</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div style={{ flex:"1 1 100px" }}>
                <div style={{ fontSize:10,fontWeight:600,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4 }}>Default Priority</div>
                <select style={selSt} value={defaults.priority} onChange={e=>setDefaults(p=>({...p,priority:e.target.value}))}>
                  {PRIORITIES.map(p=><option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            {/* Paste area */}
            <textarea
              ref={titleRef}
              value={text}
              onChange={e=>setText(e.target.value)}
              placeholder={"Paste your task list here, one per line:\n\nMorning devotion\nFinish thesis chapter 3 | April 30 | high\nCall parents | tomorrow | @social\nReview budget @finance | next monday | both\nWorkout | daily | @health"}
              style={{ ...inpSt, minHeight:200, resize:"vertical", fontSize:13, lineHeight:1.7 }}
            />
            <div style={{ fontSize:11,color:T.textMuted,marginTop:6 }}>
              {text.split("\n").filter(l=>l.trim()&&!l.trim().startsWith("#")).length} tasks detected
            </div>
            <div style={{ display:"flex",gap:10,marginTop:16,justifyContent:"flex-end" }}>
              <button style={{ padding:"9px 20px",borderRadius:9,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,background:T.inputBg,color:T.textSub }} onClick={onClose}>Cancel</button>
              <button style={{ padding:"9px 20px",borderRadius:9,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,background:"#9B6EE8",color:"#fff" }}
                onClick={handleParse} disabled={!text.trim()}>
                Parse Tasks →
              </button>
            </div>
          </>
        )}

        {step==="review" && (
          <>
            <div style={{ fontSize:13,color:T.textSub,marginBottom:14 }}>
              Review and tweak {parsed.length} task{parsed.length!==1?"s":""} before importing. Click ✕ to remove any you don't want.
            </div>

            {/* Table header */}
            <div style={{ display:"grid",gridTemplateColumns:"1fr 90px 80px 80px 80px 28px",gap:6,padding:"6px 8px",borderRadius:8,background:T.inputBg,marginBottom:6 }}>
              {["Title","Section","Type","Assign","Due",""].map(h=>(
                <div key={h} style={{ fontSize:10,fontWeight:700,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.08em" }}>{h}</div>
              ))}
            </div>

            <div style={{ display:"flex",flexDirection:"column",gap:6,maxHeight:380,overflowY:"auto",paddingRight:2 }}>
              {parsed.map((t,idx)=>(
                <div key={idx} style={{ display:"grid",gridTemplateColumns:"1fr 90px 80px 80px 80px 28px",gap:6,padding:"6px 8px",borderRadius:9,background:T.inputBg,border:`1px solid ${T.border}`,alignItems:"center" }}>
                  {/* Title */}
                  <input style={{ ...inpSt,padding:"5px 8px",fontSize:12 }} value={t.title} onChange={e=>updateParsed(idx,"title",e.target.value)}/>
                  {/* Section */}
                  <select style={{ ...selSt,padding:"4px 6px",fontSize:11 }} value={t.section} onChange={e=>updateParsed(idx,"section",e.target.value)}>
                    {SECTIONS.map(s=><option key={s.id} value={s.id}>{s.emoji} {s.label}</option>)}
                  </select>
                  {/* Type */}
                  <select style={{ ...selSt,padding:"4px 6px",fontSize:11 }} value={t.type} onChange={e=>updateParsed(idx,"type",e.target.value)}>
                    {TASK_TYPES.map(tp=><option key={tp.id} value={tp.id}>{tp.label}</option>)}
                  </select>
                  {/* Assignee */}
                  <select style={{ ...selSt,padding:"4px 6px",fontSize:11,color:aColor(t.assignee) }} value={t.assignee} onChange={e=>updateParsed(idx,"assignee",e.target.value)}>
                    <option value="A">{names.A}</option>
                    <option value="B">{names.B}</option>
                    <option value="both">Both</option>
                  </select>
                  {/* Due date */}
                  <input type="date" style={{ ...selSt,padding:"4px 6px",fontSize:11 }} value={t.dueDate||""} onChange={e=>updateParsed(idx,"dueDate",e.target.value)}/>
                  {/* Remove */}
                  <button onClick={()=>removeRow(idx)} style={{ background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:14,padding:"2px",display:"flex",alignItems:"center",justifyContent:"center" }}>✕</button>
                </div>
              ))}
            </div>

            {parsed.length===0 && (
              <div style={{ textAlign:"center",padding:"30px",color:T.textMuted,fontSize:13,fontStyle:"italic" }}>All tasks removed. Go back to paste more.</div>
            )}

            <div style={{ display:"flex",gap:10,marginTop:16,justifyContent:"space-between",flexWrap:"wrap" }}>
              <button style={{ padding:"9px 16px",borderRadius:9,border:`1px solid ${T.border}`,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,background:T.inputBg,color:T.textSub }} onClick={()=>setStep("input")}>
                ← Back
              </button>
              <div style={{ display:"flex",gap:10 }}>
                <button style={{ padding:"9px 20px",borderRadius:9,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,background:T.inputBg,color:T.textSub }} onClick={onClose}>Cancel</button>
                <button style={{ padding:"9px 24px",borderRadius:9,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:700,background:"#9B6EE8",color:"#fff" }}
                  onClick={handleImport} disabled={parsed.length===0}>
                  ⇪ Import {parsed.length} Task{parsed.length!==1?"s":""}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── TrackerItemForm ───────────────────────────────────────────────────────────
function TrackerItemForm({ data, setData, onSave, onClose, title, T, mode }) {
  const ref = useRef(null);
  useEffect(()=>{ const t=setTimeout(()=>{ if(ref.current) ref.current.focus(); },80); return()=>clearTimeout(t); },[]);
  const inpSt = { width:"100%", background:T.inputBg, border:`1px solid ${T.border}`, borderRadius:9, padding:"10px 13px", color:T.text, fontFamily:"'DM Sans',sans-serif", fontSize:14, outline:"none", boxSizing:"border-box" };
  const selSt = { ...inpSt, background:mode==="dark"?"#181B23":"#fff", cursor:"pointer" };
  const lblSt = { fontSize:11,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",color:T.textMuted,display:"block",marginBottom:5,marginTop:14,fontFamily:"'DM Sans',sans-serif" };
  return (
    <div style={{ position:"fixed",inset:0,zIndex:40,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center" }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:"18px 18px 0 0",boxShadow:"0 -4px 32px rgba(0,0,0,0.3)",width:"100%",maxWidth:520,maxHeight:"92vh",overflowY:"auto",padding:"24px 20px 36px" }}>
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
// ── CookbookRecipeForm ────────────────────────────────────────────────────────
function CookbookRecipeForm({ data, setData, onSave, onClose, title, T, mode }) {
  const ref = useRef(null);
  useEffect(()=>{ const t=setTimeout(()=>{ if(ref.current) ref.current.focus(); },80); return()=>clearTimeout(t); },[]);
  const inpSt = { width:"100%", background:T.inputBg, border:`1px solid ${T.border}`, borderRadius:9, padding:"10px 13px", color:T.text, fontFamily:"'DM Sans',sans-serif", fontSize:14, outline:"none", boxSizing:"border-box" };
  const selSt = { ...inpSt, background:mode==="dark"?"#181B23":"#fff", cursor:"pointer" };
  const lblSt = { fontSize:11,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",color:T.textMuted,display:"block",marginBottom:5,marginTop:14,fontFamily:"'DM Sans',sans-serif" };
  return (
    <div style={{ position:"fixed",inset:0,zIndex:40,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center" }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:"18px 18px 0 0",boxShadow:"0 -4px 32px rgba(0,0,0,0.3)",width:"100%",maxWidth:560,maxHeight:"94vh",overflowY:"auto",padding:"24px 20px 36px" }}>
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
          <div style={{ flex:1 }}><label style={lblSt}>Servings</label><input style={inpSt} value={data.servings||""} onChange={e=>setData(p=>({...p,servings:e.target.value}))} placeholder="e.g. 2-4"/></div>
          <div style={{ flex:1 }}><label style={lblSt}>Time</label><input style={inpSt} value={data.time||""} onChange={e=>setData(p=>({...p,time:e.target.value}))} placeholder="e.g. 45 mins"/></div>
        </div>
        <label style={lblSt}>Ingredients (one per line)</label>
        <textarea style={{...inpSt,minHeight:100,resize:"vertical"}} value={data.ingredients||""} onChange={e=>setData(p=>({...p,ingredients:e.target.value}))} placeholder="- 2 cups rice&#10;- 1 can tomatoes&#10;- 1 onion"/>
        <label style={lblSt}>Steps / Method</label>
        <textarea style={{...inpSt,minHeight:120,resize:"vertical"}} value={data.steps||""} onChange={e=>setData(p=>({...p,steps:e.target.value}))} placeholder="1. Boil water&#10;2. Add rice"/>
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

// ── TrackerView — links + application tracking ────────────────────────────────
const TRACKER_CATS = [
  { id:"phd",    label:"PhD Programs",  emoji:"🎓", color:"#7B61FF" },
  { id:"opt",    label:"OPT / CPT",     emoji:"📋", color:"#3B9EDB" },
  { id:"jobs",   label:"Jobs",          emoji:"💼", color:"#9B6EE8" },
  { id:"grants", label:"Grants",        emoji:"💰", color:"#E8A838" },
  { id:"housing",label:"Housing",       emoji:"🏠", color:"#5BAD4E" },
  { id:"other",  label:"Other",         emoji:"🔗", color:"#888D9B" },
];
const TRACKER_STATUS = [
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

  // ItemForm extracted to module level — see TrackerItemForm below

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

      {showAdd && <TrackerItemForm data={newItem} setData={setNewItem} onSave={addItem} onClose={()=>setShowAdd(false)} title="New Tracker Item" T={T} mode={mode}/>}
      {editItem && <TrackerItemForm data={editItem} setData={setEditItem} onSave={saveEdit} onClose={()=>setEditItem(null)} title="Edit Item" T={T} mode={mode}/>}
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

  // RecipeForm extracted to module level — see CookbookRecipeForm below

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
                              <span style={{ lineHeight:1.5,paddingTop:2 }}>{step.replace(/^\d+[.)]\s*/,"")}</span>
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

      {showAdd && <CookbookRecipeForm data={newRecipe} setData={setNew} onSave={addRecipe} onClose={()=>setShowAdd(false)} title="New Recipe" T={T} mode={mode}/>}
      {editRecipe && <CookbookRecipeForm data={editRecipe} setData={setEditRecipe} onSave={saveEdit} onClose={()=>setEditRecipe(null)} title="Edit Recipe" T={T} mode={mode}/>}
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

// ── TaskPill — module-level so GridCard and all views can use it ──────────────
function TaskPill({ t, showSec=false, draggable=true, pill }) {
  const { T, mode, names, SECTIONS, PRI_COLOR, toggleDone, setEdit, deleteTask,
          handleDragStart, handleDragEnd, aColor, aLabel, sec } = pill;
  const s    = sec(t.section);
  const dCol = (() => { const n = !t.dueDate?null:Math.ceil((new Date(t.dueDate+"T00:00:00")-new Date())/86400000); if(n===null)return null; if(n<0)return "#E84E8A"; if(n===0)return "#E8704A"; if(n<=3)return "#E8A838"; return "#3DBF8A"; })();
  const dLbl = (() => { const n = !t.dueDate?null:Math.ceil((new Date(t.dueDate+"T00:00:00")-new Date())/86400000); if(n===null)return null; if(n<0)return `${Math.abs(n)}d overdue`; if(n===0)return "Due today"; if(n===1)return "Due tomorrow"; return `Due in ${n}d`; })();
  const isDaily    = t.type==="daily";
  const isProgress = t.type==="progress";
  const progCount  = t.progressCount||0;
  const progTarget = t.progressTarget||1;
  const progPct    = Math.min(100,Math.round((progCount/progTarget)*100));
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
            {t.type==="monthly"&&<span style={{ fontSize:10,padding:"1px 6px",borderRadius:5,background:"#9B6EE822",color:"#9B6EE8",fontWeight:700,flexShrink:0 }}>🗓 Monthly</span>}
            {t.type==="schedule"&&t.recurDays?.length>0&&(
              <span style={{ fontSize:10,padding:"1px 6px",borderRadius:5,background:"#20B2AA22",color:"#20B2AA",fontWeight:700,flexShrink:0 }}>
                📅 {t.recurDays.map(i=>["M","T","W","Th","F","Sa","Su"][i]).join("/")}
              </span>
            )}
            {t.type==="progress"&&(
              <span style={{ fontSize:10,padding:"1px 6px",borderRadius:5,background:"#E8A83822",color:"#E8A838",fontWeight:700,flexShrink:0 }}>
                ◉ {t.progressCount||0}/{t.progressTarget||1}
              </span>
            )}
          </div>
          <div style={{ display:"flex",gap:4,marginTop:5,flexWrap:"wrap",alignItems:"center" }}>
            {showSec&&<span style={{ fontSize:10,padding:"2px 7px",borderRadius:5,background:s.color+"22",color:s.color,fontWeight:600,fontFamily:"'DM Sans',sans-serif" }}>{s.emoji} {s.label}</span>}
            <span style={{ fontSize:10,padding:"2px 7px",borderRadius:5,background:aColor(t.assignee)+"20",color:aColor(t.assignee),fontWeight:600,fontFamily:"'DM Sans',sans-serif" }}>{aLabel(t.assignee)}</span>
            <span style={{ fontSize:10,padding:"2px 7px",borderRadius:5,background:PRI_COLOR[t.priority]+"20",color:PRI_COLOR[t.priority],fontWeight:600,fontFamily:"'DM Sans',sans-serif" }}>{t.priority}</span>
            {(t.type==="habit"||t.type==="daily"||t.type==="schedule")&&t.streak>0&&<span style={{ fontSize:10,padding:"2px 7px",borderRadius:5,background:"#E8A83820",color:"#E8A838",fontWeight:600 }}>🔥 {t.streak}d</span>}
          </div>
          {/* Progress bar for progress-type tasks */}
          {isProgress&&(
            <div style={{ marginTop:5 }}>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:2,fontSize:10,color:T.textMuted }}>
                <span>{progCount} of {progTarget} done</span>
                <span>{progPct}%</span>
              </div>
              <div style={{ height:4,background:T.inputBg,borderRadius:4,overflow:"hidden" }}>
                <div style={{ height:"100%",width:`${progPct}%`,background:progPct>=100?"#3DBF8A":"#E8A838",borderRadius:4,transition:"width 0.3s" }}/>
              </div>
            </div>
          )}
          <div style={{ display:"flex",gap:5,flexWrap:"wrap",alignItems:"center" }}>
            {dLbl&&<span style={{ fontSize:10,padding:"2px 7px",borderRadius:5,background:dCol+"22",color:dCol,fontWeight:700 }}>📅 {dLbl}</span>}
          </div>
          <div style={{ display:"flex",gap:8,marginTop:3,flexWrap:"wrap",alignItems:"center" }}>
            {t.notes&&<span style={{ fontSize:11,color:T.textMuted,fontStyle:"italic",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:200 }}>{t.notes}</span>}
            {t.createdAt&&<span style={{ fontSize:10,color:T.textMuted }}>Created {new Date(t.createdAt+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</span>}
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

// ── GridCard — module-level to prevent remount/expand-collapse bug ─────────────
function GridCard({ colId, label, emoji, color, colTasks, isDone=false, T, mode,
  onAddTask, onViewAll, onDeleteTasks, dragHandlers, pillCtx }) {
  const [expanded,      setExpanded]      = useState(false);
  const [showClearMenu, setShowClearMenu] = useState(false);
  const [confirmClear,  setConfirmClear]  = useState(false);
  const PREVIEW_COUNT = 5;

  const { handleDragOverCol, handleDropOnCol, handleBoardDragStart, handleDragEnd,
          handleDropOnTask, dragType, dragTaskId, highlightCol, highlightBoard } = dragHandlers;

  const isTaskOver  = highlightCol === colId;
  const isBoardOver = highlightBoard === colId && !isDone;
  const visibleTasks = expanded ? colTasks : colTasks.slice(0, PREVIEW_COUNT);
  const hasMore = colTasks.length > PREVIEW_COUNT;

  // Sort colTasks by dueDate ascending (soonest first, no date last)
  const sortedVisible = [...visibleTasks].sort((a,b)=>{
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate < b.dueDate ? -1 : 1;
  });
  const sortedAll = [...colTasks].sort((a,b)=>{
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate < b.dueDate ? -1 : 1;
  });
  const displayTasks = expanded ? sortedAll : sortedAll.slice(0, PREVIEW_COUNT);

  return (
    <div
      onDragOver={e=>handleDragOverCol(e, colId)}
      onDrop={e=>handleDropOnCol(e, colId)}
      style={{
        background: mode==="dark"?"#13161E":"#E4E6ED",
        border:`1px solid ${isBoardOver?color+"cc":isTaskOver?color+"99":"rgba(255,255,255,0.07)"}`,
        borderRadius:14, display:"flex", flexDirection:"column",
        boxShadow:isBoardOver?`0 0 0 3px ${color}66`:isTaskOver?`0 0 0 2px ${color}55`:"none",
        transition:"border 0.1s,box-shadow 0.1s,transform 0.1s",
        transform: isBoardOver ? "scale(1.02)" : "scale(1)",
        overflow:"hidden", minHeight:180, position:"relative",
      }}
    >
      {/* Header */}
      <div style={{ padding:"12px 12px 9px", borderBottom:`1px solid ${mode==="dark"?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.08)"}`, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {/* Drag grip */}
          {!isDone && (
            <div
              draggable
              onDragStart={e=>{e.stopPropagation();handleBoardDragStart(e,colId);}}
              onDragEnd={e=>{e.stopPropagation();handleDragEnd();}}
              title="Drag to reorder"
              style={{ display:"flex",flexDirection:"column",gap:2.5,flexShrink:0,opacity:0.3,cursor:"grab",padding:"4px 2px",borderRadius:4,transition:"opacity 0.15s" }}
              onMouseEnter={e=>e.currentTarget.style.opacity="0.8"}
              onMouseLeave={e=>e.currentTarget.style.opacity="0.3"}
            >
              <div style={{ width:13,height:2,borderRadius:1,background:T.text }}/>
              <div style={{ width:13,height:2,borderRadius:1,background:T.text }}/>
              <div style={{ width:13,height:2,borderRadius:1,background:T.text }}/>
            </div>
          )}
          <div style={{ width:30,height:30,borderRadius:8,background:color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0 }}>{emoji}</div>
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ display:"flex",alignItems:"center",gap:5 }}>
              <span style={{ fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:13,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{label}</span>
              {colTasks.length>0&&<span style={{ fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:10,background:color+"22",color:color,flexShrink:0,lineHeight:1.4 }}>{colTasks.length}</span>}
            </div>
            <div style={{ fontSize:10,color:T.textSub,marginTop:1 }}>{isDone?`${colTasks.length} completed`:`${colTasks.filter(t=>t.done).length}/${colTasks.length} done`}</div>
          </div>
          {/* Buttons */}
          <div style={{ display:"flex",gap:4,flexShrink:0 }}>
            {!isDone&&<button
              onClick={e=>{e.stopPropagation();onAddTask(colId);}}
              onMouseDown={e=>e.stopPropagation()}
              style={{ width:24,height:24,borderRadius:6,background:T.inputBg,border:`1px solid ${T.border}`,cursor:"pointer",color:T.textSub,fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700 }}>+</button>}
            {/* 👁 Eye — view all modal */}
            <button
              onClick={e=>{e.stopPropagation();onViewAll({colId,label,emoji,color,tasks:sortedAll});}}
              onMouseDown={e=>e.stopPropagation()}
              title="View all tasks"
              style={{ width:24,height:24,borderRadius:6,background:T.inputBg,border:`1px solid ${T.border}`,cursor:"pointer",color:T.textSub,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center" }}
            >👁</button>
            {/* ⋯ menu */}
            <div style={{ position:"relative" }}>
              <button
                onClick={e=>{e.stopPropagation();setShowClearMenu(v=>!v);setConfirmClear(false);}}
                onMouseDown={e=>e.stopPropagation()}
                style={{ width:24,height:24,borderRadius:6,background:T.inputBg,border:`1px solid ${T.border}`,cursor:"pointer",color:T.textSub,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1 }}
                title="Options"
              >⋯</button>
              {showClearMenu&&(
                <div style={{ position:"absolute",top:28,right:0,zIndex:30,background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,boxShadow:"0 4px 20px rgba(0,0,0,0.25)",minWidth:170,overflow:"hidden" }} onClick={e=>e.stopPropagation()}>
                  {!confirmClear ? (
                    <>
                      <button onClick={()=>setConfirmClear("active")} style={{ display:"block",width:"100%",padding:"10px 14px",border:"none",background:"none",textAlign:"left",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#E84E8A",fontWeight:600 }}>🗑 Clear active tasks</button>
                      <button onClick={()=>setConfirmClear("done")} style={{ display:"block",width:"100%",padding:"10px 14px",border:"none",background:"none",textAlign:"left",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:T.textSub,borderTop:`1px solid ${T.border}` }}>✓ Clear completed</button>
                      <button onClick={()=>setShowClearMenu(false)} style={{ display:"block",width:"100%",padding:"8px 14px",border:"none",background:"none",textAlign:"left",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,color:T.textMuted,borderTop:`1px solid ${T.border}` }}>Cancel</button>
                    </>
                  ) : (
                    <div style={{ padding:"12px 14px" }}>
                      <div style={{ fontSize:12,color:T.text,marginBottom:10,fontFamily:"'DM Sans',sans-serif",lineHeight:1.5 }}>
                        {confirmClear==="active"?`Delete all active tasks in ${label}?`:`Delete completed tasks in ${label}?`}
                        <br/><span style={{ color:"#E84E8A",fontWeight:600 }}>Cannot be undone.</span>
                      </div>
                      <div style={{ display:"flex",gap:6 }}>
                        <button onClick={()=>setConfirmClear(false)} style={{ flex:1,padding:"6px",borderRadius:7,border:`1px solid ${T.border}`,background:T.inputBg,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,color:T.textSub }}>Keep</button>
                        <button onClick={()=>{onDeleteTasks(colId,confirmClear);setConfirmClear(false);setShowClearMenu(false);}} style={{ flex:1,padding:"6px",borderRadius:7,border:"none",background:"#E84E8A",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,color:"#fff" }}>Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Progress bar */}
        {!isDone&&(
          <div style={{ height:3,background:T.inputBg,borderRadius:3,marginTop:8,overflow:"hidden" }}>
            <div style={{ height:"100%",width:`${colTasks.length?Math.round((colTasks.filter(t=>t.done).length/colTasks.length)*100):0}%`,background:color,borderRadius:3,transition:"width 0.4s" }}/>
          </div>
        )}
      </div>

      {/* Task list */}
      <div
        style={{ padding:"10px 12px",minHeight:50 }}
        onDragOver={e=>{ e.preventDefault(); e.stopPropagation(); if(dragType.current==="task") handleDragOverCol(e,colId); }}
        onDrop={e=>{ e.stopPropagation(); handleDropOnCol(e,colId); }}
        onClick={()=>{ if(showClearMenu) setShowClearMenu(false); }}
      >
        {colTasks.length===0 ? (
          <div style={{ border:`2px dashed ${isTaskOver?color+"88":T.border}`,borderRadius:9,padding:"18px 10px",textAlign:"center",color:T.textMuted,fontSize:12,fontStyle:"italic",background:isTaskOver?color+"0A":"transparent",transition:"all 0.1s" }}>
            {isDone?"✓ Drop tasks here to complete":"Drop tasks here"}
          </div>
        ) : (
          <>
            {displayTasks.map(t=>(
              <div key={t.id}
                onDragOver={e=>{ e.preventDefault(); e.stopPropagation(); if(dragType.current==="task") handleDragOverCol(e,colId); }}
                onDrop={e=>{ e.stopPropagation(); handleDropOnTask(e, t.id, colId); }}
                style={{ position:"relative" }}
              >
                {dragTaskId.current && dragTaskId.current!==t.id && highlightCol===colId && (
                  <div style={{ height:2,background:color,borderRadius:2,marginBottom:3,opacity:0 }}/>
                )}
                <TaskPill t={t} showSec={isDone} pill={pillCtx}/>
              </div>
            ))}
            {hasMore&&(
              <button
                onClick={e=>{ e.stopPropagation(); setExpanded(v=>!v); }}
                style={{ width:"100%",marginTop:4,padding:"7px 10px",borderRadius:8,border:`1px solid ${color}44`,background:color+"0D",color:color,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:5 }}
                onMouseEnter={e=>e.currentTarget.style.background=color+"1A"}
                onMouseLeave={e=>e.currentTarget.style.background=color+"0D"}
              >
                {expanded?`▲ Show less`:`▼ View all ${colTasks.length} tasks (${colTasks.length-PREVIEW_COUNT} more)`}
              </button>
            )}
          </>
        )}
      </div>
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
          {taskTypes.map(t=><option key={t.id} value={t.id}>{t.icon} {t.label}{
            t.id==="daily"?" — resets daily":t.id==="weekly"?" — resets Monday":
            t.id==="schedule"?" — pick days below":t.id==="progress"?" — track count":
            t.id==="monthly"?" — monthly checkbox":""
          }</option>)}
        </select>

        {/* Schedule: pick days of week */}
        {data.type==="schedule"&&(
          <>
            <label style={lblStyle}>Repeat on days</label>
            <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
              {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d,i)=>(
                <button key={i} type="button"
                  onClick={()=>setData(p=>{ const days=p.recurDays||[]; return {...p,recurDays:days.includes(i)?days.filter(x=>x!==i):[...days,i].sort()}; })}
                  style={{ padding:"6px 12px",borderRadius:8,border:`1px solid ${(data.recurDays||[]).includes(i)?T.accent:T.border}`,background:(data.recurDays||[]).includes(i)?T.accent+"22":"transparent",color:(data.recurDays||[]).includes(i)?T.accent:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:13,cursor:"pointer",fontWeight:(data.recurDays||[]).includes(i)?700:400 }}>
                  {d}
                </button>
              ))}
            </div>
            <div style={{ fontSize:11,color:T.textMuted,marginTop:4 }}>Task resets each selected day — great for class schedules.</div>
          </>
        )}

        {/* Progress: set a target count */}
        {data.type==="progress"&&(
          <>
            <label style={lblStyle}>Target count</label>
            <input type="number" min="1" max="999" style={inpStyle} value={data.progressTarget||""} onChange={e=>setData(p=>({...p,progressTarget:parseInt(e.target.value)||1}))} placeholder="e.g. 3 (read 3 books)"/>
            <div style={{ fontSize:11,color:T.textMuted,marginTop:4 }}>Tap the task to increment. Auto-completes when you hit the target.</div>
          </>
        )}

        {/* Monthly: no extra fields needed, just explain */}
        {data.type==="monthly"&&(
          <div style={{ marginTop:6,padding:"8px 12px",background:T.inputBg,borderRadius:8,fontSize:12,color:T.textSub,lineHeight:1.6 }}>
            📅 This task resets each month. Use it for things you plan to do or complete sometime this month — just tick it off when done.
          </div>
        )}

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
  const [showBulk,      setShowBulk]      = useState(false);
  const [showDedup,     setShowDedup]     = useState(false);
  const [taskModal,     setTaskModal]     = useState(null); // {colId,label,emoji,color,tasks}
  const [appMode,       setAppMode]       = useState(() => { try { return localStorage.getItem("together_appMode")||"tasks"; } catch { return "tasks"; } });
  function switchApp(mode) { setAppMode(mode); try { localStorage.setItem("together_appMode",mode); } catch {} }
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
      if (t.type === "monthly" && t.lastReset !== TODAY.slice(0,7)) return { ...t, done:false, progressCount:0, lastReset:TODAY.slice(0,7) };
      // Schedule task: reset only on the days it's scheduled for
      if (t.type === "schedule" && Array.isArray(t.recurDays) && t.recurDays.length > 0) {
        const todayIdx = (new Date().getDay()+6)%7; // 0=Mon…6=Sun
        if (t.recurDays.includes(todayIdx) && t.lastReset !== TODAY) return { ...t, done:false, lastReset:TODAY };
      }
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
        let loaded = t
          ? t.map((tk, i) => ({ order:i, ...tk, createdAt:tk.createdAt||TODAY, dueDate:tk.dueDate||"", lastReset:tk.lastReset||"" }))
          : SAMPLES.map((tk, i) => ({ order:i, createdAt:TODAY, dueDate:"", lastReset:"", ...tk }));
        const afterReset = resetDailies(loaded);
        tasksRef.current = afterReset;
        setTasksState(afterReset);
        // Only write to Supabase if: (a) no tasks existed yet, or (b) resetDailies actually changed something
        const resetChanged = JSON.stringify(afterReset) !== JSON.stringify(loaded);
        if (!t) await dbSet("tasks", afterReset);
        else if (resetChanged) await dbSet("tasks", afterReset);
        if (n) setNamesState(n);
        if (m) setMode(m);
        if (so) { setSectionOrder(so); sectionOrderRef.current = so; }
        else { const def = SECTIONS.map(s=>s.id); setSectionOrder(def); sectionOrderRef.current = def; await dbSet(soKey, def); }
        if (cl) { setCompletedLog(cl); completedLogRef.current = cl; }
        setStatus("live");
        // init seenIds AFTER first load so poll doesn't toast on startup
        seenIdsRef.current = (tasksRef.current || []).map(t => t.id);
        // ── Daily backup — save snapshot once per day so data is recoverable ──
        if (t && t.length > 0) {
          const backupKey = `tasks_backup_${TODAY}`;
          try {
            const existing = await dbGet(backupKey);
            if (!existing) await dbSet(backupKey, t); // save original (pre-reset) data
          } catch {}
        }
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
        // Progress task: increment count, auto-complete when target reached
        if (t.type === "progress" && !t.done) {
          const newCount = (t.progressCount||0) + 1;
          const nowDoneProgress = newCount >= (t.progressTarget||1);
          return { ...t, progressCount:newCount, done:nowDoneProgress, streak:nowDoneProgress?t.streak+1:t.streak };
        }
        return { ...t, done:nowDone, streak:nowDone&&(t.type==="habit"||t.type==="daily"||t.type==="weekly"||t.type==="schedule")?t.streak+1:t.streak, lastReset:t.type==="daily"?TODAY:t.type==="weekly"?THIS_WEEK:t.type==="monthly"?TODAY.slice(0,7):t.lastReset };
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
    const lastReset = data.type==="daily" ? TODAY : data.type==="weekly" ? THIS_WEEK : data.type==="monthly" ? TODAY.slice(0,7) : data.type==="schedule" ? TODAY : "";
    const added = { ...data, id:genId(), done:false, streak:0, progressCount:0, recurDays:data.recurDays||[], order:(tasksRef.current||[]).length, createdAt:TODAY, lastReset, createdBy:activeUser||"A" };
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

  const doneTasks   = tasks.filter(t=>t.done && (t.assignee===activeUser||t.assignee==="both"));
  const myAllTasks  = tasks.filter(t=>t.assignee===activeUser||t.assignee==="both");
  const activeTasks = tasks.filter(t=>!t.done && (t.assignee===activeUser||t.assignee==="both"));
  const dailyTasks  = tasks.filter(t=>t.type==="daily" && (t.assignee===activeUser||t.assignee==="both"));
  const weeklyTasks = tasks.filter(t=>t.type==="weekly" && (t.assignee===activeUser||t.assignee==="both"));
  const compRate    = myAllTasks.length?Math.round((doneTasks.length/myAllTasks.length)*100):0;
  const urgentTasks = activeTasks.filter(t=>t.priority==="Urgent"||(daysUntil(t.dueDate)!==null&&daysUntil(t.dueDate)<=3)||t.priority==="High")
    .sort((a,b)=>{const da=daysUntil(a.dueDate)??999,db=daysUntil(b.dueDate)??999,pa=["Urgent","High","Medium","Low"].indexOf(a.priority),pb=["Urgent","High","Medium","Low"].indexOf(b.priority);return da!==db?da-db:pa-pb;});

  // ── Styles ────────────────────────────────────────────────────────────────
  const cardBase = (x={}) => ({ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, boxShadow:T.cardShadow, ...x });
  const inpStyle = { width:"100%", background:T.inputBg, border:`1px solid ${T.border}`, borderRadius:9, padding:"10px 13px", color:T.text, fontFamily:"'DM Sans',sans-serif", fontSize:15, outline:"none", boxSizing:"border-box" };
  const selStyle = { ...inpStyle, background:mode==="dark"?"#181B23":"#fff", cursor:"pointer" };
  const lblStyle = { fontSize:11, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", color:T.textMuted, display:"block", marginBottom:5, marginTop:14, fontFamily:"'DM Sans',sans-serif" };
  const btnStyle = p => ({ padding:"10px 20px", borderRadius:9, border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600, background:p?T.accent:T.inputBg, color:p?T.accentFg:T.textSub, transition:"all 0.15s" });

  // ── Task Pill ─────────────────────────────────────────────────────────────
  // TaskPill is defined outside TogetherApp — see below

  // ── Grid Card ─────────────────────────────────────────────────────────────
  // GridCard is defined outside TogetherApp — fixes the expand/collapse remount bug

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
    ["board","Board"],["today","Today"],["someday","Someday"],["accountability","Us"],
    ["analytics","📊 Analytics"],
    ["reflections","💭 Reflections"],
    ["tracker","🔗 Tracker"],
    ["cookbook","👨‍🍳 Cookbook"],
    ["prayer","🙏 Prayer"],
    ["urgent","🔴 Urgent"],["week","This Week"],["month","This Month"],
    ["quarter","Next 3 Months"],["year","This Year"],["aitools","AI Tools"],
  ];
  const isFullScreen=["today","someday","accountability","aitools","urgent","week","month","quarter","year","prayer","analytics","reflections","tracker","cookbook"].includes(view);
  const pad=isFullScreen?"0":"16px 16px";

  // ── Reusable timeline section renderer ────────────────────────────────────
  function TimelineSection({ periodTasks, allActive, label, sub }) {
    // For each section, collect tasks due in this period + tasks with no due date
    const sectionData = SECTIONS.map(sec => {
      const inPeriod  = periodTasks.filter(t => t.section === sec.id);
      const noDueDate = allActive.filter(t => t.section === sec.id && !t.dueDate);
      // Merge: tasks in period first (sorted by date), then no-due-date tasks
      const merged = [
        ...[...inPeriod].sort((a,b)=> a.dueDate < b.dueDate ? -1 : 1),
        ...noDueDate,
      ];
      return { ...sec, colTasks: merged };
    });

    // Stats
    const overdue  = periodTasks.filter(t=>{ const n=daysUntil(t.dueDate); return n!==null&&n<0; });
    const dueToday = periodTasks.filter(t=>{ const n=daysUntil(t.dueDate); return n===0; });

    // No-op drag handlers — timeline cards aren't draggable
    const noDrag = {
      handleDragOverCol:()=>{}, handleDropOnCol:()=>{},
      handleBoardDragStart:()=>{}, handleDragEnd:()=>{},
      handleDropOnTask:()=>{}, dragType:{current:null},
      dragTaskId:{current:null}, highlightCol:null, highlightBoard:null,
    };

    return (
      <div style={{ padding:"20px 16px", maxWidth:1200, margin:"0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:26,color:T.text,marginBottom:2 }}>{label}</div>
          <div style={{ fontSize:13,color:T.textSub }}>{sub}</div>
        </div>

        {/* Stats bar */}
        <div className="stats-row" style={{marginBottom:24}}>
          {[
            {l:"In Period",   v:periodTasks.length,                             c:"#E8A838"},
            {l:"Overdue",     v:overdue.length,                                 c:"#E84E8A"},
            {l:"Due Today",   v:dueToday.length,                                c:"#E8704A"},
            {l:"No Due Date", v:allActive.filter(t=>!t.dueDate).length,         c:"#888D9B"},
          ].map(s=>(
            <div key={s.l} style={cardBase({padding:"10px 14px",flex:"1 1 80px",borderLeft:`3px solid ${s.c}`})}>
              <div style={{fontSize:20,fontWeight:700,color:T.text,lineHeight:1}}>{s.v}</div>
              <div style={{fontSize:10,fontWeight:600,color:T.textSub,marginTop:3,textTransform:"uppercase",letterSpacing:"0.08em"}}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Section cards — same GridCard as the board */}
        <div className="grid-board">
          {sectionData.map(sec => (
            <GridCard
              key={sec.id}
              colId={sec.id}
              label={sec.label}
              emoji={sec.emoji}
              color={sec.color}
              colTasks={sec.colTasks}
              isDone={false}
              T={T}
              mode={mode}
              pillCtx={pillCtx}
              dragHandlers={noDrag}
              onAddTask={(secId)=>{ setAddSec(secId); setNew(p=>({...p,section:secId})); setShowAdd(true); }}
              onViewAll={(data)=>setTaskModal(data)}
              onDeleteTasks={(secId,type)=>{
                if(type==="active") setTasks(prev=>prev.filter(t=>!(t.section===secId&&!t.done)));
                else setTasks(prev=>prev.filter(t=>!(t.section===secId&&t.done)));
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // ── Pill context — passed to all TaskPill instances ─────────────────────────
  const pillCtx = { T, mode, names, SECTIONS, PRI_COLOR,
    toggleDone, setEdit, deleteTask, handleDragStart, handleDragEnd,
    aColor: a => a==="A"?"#E8A838":a==="B"?"#E84E8A":"#3DBF8A",
    aLabel: a => a==="both"?`${names.A} & ${names.B}`:names[a]||a,
    sec:    id => SECTIONS.find(s=>s.id===id)||SECTIONS[0],
  };

  // ── Budget app mode ─────────────────────────────────────────────────────────
  if (appMode === "budget") {
    return <BudgetApp names={names} mode={mode} T={T} activeUser={activeUser} onBack={()=>switchApp("tasks")}/>;
  }

  // ── App home selector (shown once per session if not yet chosen after load) ─
  if (appMode === "home") {
    return (
      <div style={{ position:"fixed",inset:0,background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'DM Sans',sans-serif" }}>
        <div style={{ width:"100%",maxWidth:420,textAlign:"center" }}>
          <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:32,color:T.accent,marginBottom:6 }}>Together ♡</div>
          <div style={{ fontSize:14,color:T.textSub,marginBottom:36 }}>What would you like to open?</div>
          <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
            <button onClick={()=>switchApp("tasks")} style={{ padding:"22px 20px",borderRadius:16,border:`1px solid ${T.border}`,background:T.surface,cursor:"pointer",textAlign:"left",boxShadow:"0 2px 12px rgba(0,0,0,0.1)",transition:"transform 0.15s" }}
              onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
              onMouseLeave={e=>e.currentTarget.style.transform="none"}>
              <div style={{ fontSize:28,marginBottom:8 }}>⊞</div>
              <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:19,color:T.text,marginBottom:4 }}>Task Manager</div>
              <div style={{ fontSize:13,color:T.textSub,lineHeight:1.5 }}>Your life board, habits, reflections, prayers, tracker and more.</div>
            </button>
            <button onClick={()=>switchApp("budget")} style={{ padding:"22px 20px",borderRadius:16,border:"1px solid #20B2AA44",background:T.surface,cursor:"pointer",textAlign:"left",boxShadow:"0 2px 12px rgba(0,0,0,0.1)",transition:"transform 0.15s" }}
              onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
              onMouseLeave={e=>e.currentTarget.style.transform="none"}>
              <div style={{ fontSize:28,marginBottom:8 }}>💰</div>
              <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:19,color:T.text,marginBottom:4 }}>Budget Tracker</div>
              <div style={{ fontSize:13,color:T.textSub,lineHeight:1.5 }}>Track income, expenses, savings goals — per person and shared.</div>
            </button>
          </div>
          <div style={{ marginTop:20,display:"flex",gap:10,justifyContent:"center" }}>
            <button onClick={toggleMode} style={{ fontSize:12,color:T.textMuted,background:"none",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>{mode==="dark"?"☀ Light mode":"☾ Dark mode"}</button>
          </div>
        </div>
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
          <button onClick={()=>setShowBulk(true)} style={{ height:32,padding:"0 12px",borderRadius:8,border:`1px solid ${T.border}`,background:T.inputBg,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,color:T.textSub,display:"flex",alignItems:"center",gap:4,flexShrink:0,whiteSpace:"nowrap" }} title="Bulk import tasks">
            ⇪ Import
          </button>
          <button onClick={()=>setShowDedup(true)} style={{ height:32,padding:"0 12px",borderRadius:8,border:`1px solid ${T.border}`,background:T.inputBg,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,color:T.textSub,display:"flex",alignItems:"center",gap:4,flexShrink:0,whiteSpace:"nowrap" }} title="Remove duplicate tasks">
            🗂 Dedup
          </button>
        </div>

        {/* Mobile menu button — shown only on mobile */}
        <div style={{ display:"flex",alignItems:"center",gap:6,flexShrink:0 }} className="topbar-menu-btn">
          <button onClick={()=>setShowAdd(true)} style={{ height:32,padding:"0 12px",borderRadius:8,border:"none",background:T.accent,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,color:T.accentFg,display:"flex",alignItems:"center",gap:4,whiteSpace:"nowrap" }}>
            + Task
          </button>
          <button onClick={()=>setShowBulk(true)} style={{ height:32,width:32,borderRadius:8,border:`1px solid ${T.border}`,background:T.inputBg,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",color:T.textSub,flexShrink:0 }} title="Bulk import">
            ⇪
          </button>
          <button onClick={()=>setShowDedup(true)} style={{ height:32,width:32,borderRadius:8,border:`1px solid ${T.border}`,background:T.inputBg,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",color:T.textSub,flexShrink:0 }} title="Remove duplicates">
            🗂
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
            {[{label:"Open",value:activeTasks.length,color:"#E8A838"},{label:"Done %",value:`${compRate}%`,color:"#3DBF8A"},{label:"Streaks",value:myAllTasks.filter(t=>(t.type==="habit"||t.type==="daily")&&t.streak>0).reduce((a,t)=>a+t.streak,0),color:"#9B6EE8"},{label:"Urgent",value:urgentTasks.length,color:"#E84E8A"}].map(s=>(
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
              {gridCols.map(col=><GridCard key={col.colId} {...col} T={T} mode={mode} pillCtx={pillCtx} onAddTask={(secId)=>{setAddSec(secId);setNew(p=>({...p,section:secId}));setShowAdd(true);}} onViewAll={(data)=>setTaskModal(data)} onDeleteTasks={(secId,type)=>{ if(type==='active') setTasks(prev=>prev.filter(t=>!(t.section===secId&&!t.done))); else setTasks(prev=>prev.filter(t=>!(t.section===secId&&t.done))); }} dragHandlers={{handleDragOverCol,handleDropOnCol,handleBoardDragStart,handleDragEnd,handleDropOnTask,dragType,dragTaskId,highlightCol,highlightBoard}}/>)}
            </div>
          </>
        )}

        {/* ── TODAY ── */}
        {view==="today"&&(
          <div style={{ padding:"24px 16px",maxWidth:720,margin:"0 auto" }}>
            {/* Greeting card */}
            <div style={{ background:greeting.bg,borderRadius:14,padding:"20px",marginBottom:24,border:`1px solid ${T.border}` }}>
              <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:24,color:greeting.accent }}>{greeting.text}</div>
              <div style={{ fontSize:13,color:T.textSub,marginTop:3 }}>{greeting.sub}</div>
              <div style={{ fontSize:12,color:T.textMuted,marginTop:6 }}>{new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</div>
            </div>

            {(()=>{
              const myUser = activeUser || "A";

              // ── 1. Daily habits for today ──────────────────────────────
              const myDailies = dailyTasks.filter(t=>
                (t.assignee===myUser||t.assignee==="both") && !t.done
              );

              // ── 2. Weekly routines for this week ──────────────────────
              const myWeeklies = weeklyTasks.filter(t=>
                (t.assignee===myUser||t.assignee==="both") && !t.done
              );

              // ── 3. Tasks due strictly TODAY (dueDate === TODAY) ───────
              const dueToday = activeTasks.filter(t=>
                t.type !== "daily" && t.type !== "weekly" &&
                (t.assignee===myUser||t.assignee==="both") &&
                t.dueDate === TODAY
              ).sort((a,b)=>{
                const order = ["Urgent","High","Medium","Low"];
                return order.indexOf(a.priority) - order.indexOf(b.priority);
              });

              // ── 4. Overdue tasks (dueDate < TODAY, not done) ──────────
              const overdue = activeTasks.filter(t=>
                t.type !== "daily" && t.type !== "weekly" &&
                (t.assignee===myUser||t.assignee==="both") &&
                t.dueDate && t.dueDate < TODAY
              ).sort((a,b)=> a.dueDate < b.dueDate ? -1 : 1);

              const hasAnything = myDailies.length||myWeeklies.length||dueToday.length||overdue.length;

              return (
                <>
                  {/* Overdue */}
                  {overdue.length>0&&(
                    <div style={{marginBottom:20}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                        <div style={{width:8,height:8,borderRadius:"50%",background:"#E84E8A"}}/>
                        <span style={{fontSize:12,fontWeight:700,color:"#E84E8A",textTransform:"uppercase",letterSpacing:"0.1em"}}>Overdue</span>
                        <span style={{fontSize:12,color:T.textMuted}}>· {overdue.length} task{overdue.length!==1?"s":""}</span>
                      </div>
                      <div style={cardBase({padding:"6px 12px",border:"1px solid #E84E8A33"})}>
                        {overdue.map(t=><TaskPill key={t.id} t={t} showSec draggable={false} pill={pillCtx}/>)}
                      </div>
                    </div>
                  )}

                  {/* Due today */}
                  {dueToday.length>0&&(
                    <div style={{marginBottom:20}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                        <div style={{width:8,height:8,borderRadius:"50%",background:"#E8A838"}}/>
                        <span style={{fontSize:12,fontWeight:700,color:"#E8A838",textTransform:"uppercase",letterSpacing:"0.1em"}}>Due Today</span>
                        <span style={{fontSize:12,color:T.textMuted}}>· {dueToday.length} task{dueToday.length!==1?"s":""}</span>
                      </div>
                      <div style={cardBase({padding:"6px 12px",border:"1px solid #E8A83833"})}>
                        {dueToday.map(t=><TaskPill key={t.id} t={t} showSec draggable={false} pill={pillCtx}/>)}
                      </div>
                    </div>
                  )}

                  {/* Daily habits */}
                  {myDailies.length>0&&(
                    <div style={{marginBottom:20}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                        <span style={{fontSize:14}}>⟳</span>
                        <span style={{fontSize:12,fontWeight:700,color:"#3DBF8A",textTransform:"uppercase",letterSpacing:"0.1em"}}>Daily Habits</span>
                        <span style={{fontSize:12,color:T.textMuted}}>· resets every day</span>
                      </div>
                      <div style={cardBase({padding:"6px 12px",border:"1px solid #3DBF8A33"})}>
                        {myDailies.map(t=><TaskPill key={t.id} t={t} showSec draggable={false} pill={pillCtx}/>)}
                      </div>
                    </div>
                  )}

                  {/* Weekly routines */}
                  {myWeeklies.length>0&&(
                    <div style={{marginBottom:20}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                        <span style={{fontSize:14}}>⟲</span>
                        <span style={{fontSize:12,fontWeight:700,color:"#3B9EDB",textTransform:"uppercase",letterSpacing:"0.1em"}}>Weekly Routines</span>
                        <span style={{fontSize:12,color:T.textMuted}}>· resets every Monday</span>
                      </div>
                      <div style={cardBase({padding:"6px 12px",border:"1px solid #3B9EDB33"})}>
                        {myWeeklies.map(t=><TaskPill key={t.id} t={t} showSec draggable={false} pill={pillCtx}/>)}
                      </div>
                    </div>
                  )}

                  {/* Empty state */}
                  {!hasAnything&&(
                    <div style={cardBase({padding:"50px 20px",textAlign:"center"})}>
                      <div style={{fontSize:36,marginBottom:10}}>🎉</div>
                      <div style={{fontSize:17,fontWeight:600,color:T.text}}>All clear for today!</div>
                      <div style={{fontSize:13,color:T.textSub,marginTop:4,lineHeight:1.6}}>
                        Nothing due today and no habits pending.<br/>
                        Check <strong>Urgent</strong> or <strong>This Week</strong> for upcoming tasks.
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* ── URGENT ── */}
        {/* ════ SOMEDAY — tasks without a due date ════ */}
        {view==="someday"&&(
          <div style={{ padding:"20px 16px",maxWidth:1200,margin:"0 auto" }}>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:26,color:T.text,marginBottom:2 }}>Someday ☁️</div>
              <div style={{ fontSize:13,color:T.textSub }}>All tasks without a due date — things you'll get to eventually.</div>
            </div>
            <div className="stats-row" style={{marginBottom:24}}>
              {[
                {l:"Total",    v:activeTasks.filter(t=>!t.dueDate).length,                                    c:"#E8A838"},
                {l:"Progress", v:activeTasks.filter(t=>!t.dueDate&&t.type==="progress").length,               c:"#E8A838"},
                {l:"Monthly",  v:activeTasks.filter(t=>!t.dueDate&&t.type==="monthly").length,                c:"#9B6EE8"},
                {l:"Goals",    v:activeTasks.filter(t=>!t.dueDate&&t.type==="goal").length,                   c:"#3DBF8A"},
              ].map(s=>(
                <div key={s.l} style={cardBase({padding:"10px 14px",flex:"1 1 80px",borderLeft:`3px solid ${s.c}`})}>
                  <div style={{fontSize:20,fontWeight:700,color:T.text,lineHeight:1}}>{s.v}</div>
                  <div style={{fontSize:10,fontWeight:600,color:T.textSub,marginTop:3,textTransform:"uppercase",letterSpacing:"0.08em"}}>{s.l}</div>
                </div>
              ))}
            </div>
            <div className="grid-board">
              {SECTIONS.map(sec=>{
                const secTasks = activeTasks.filter(t=>t.section===sec.id&&!t.dueDate);
                return (
                  <GridCard
                    key={sec.id}
                    colId={sec.id}
                    label={sec.label}
                    emoji={sec.emoji}
                    color={sec.color}
                    colTasks={secTasks}
                    isDone={false}
                    T={T}
                    mode={mode}
                    pillCtx={pillCtx}
                    dragHandlers={{ handleDragOverCol:()=>{},handleDropOnCol:()=>{},handleBoardDragStart:()=>{},handleDragEnd:()=>{},handleDropOnTask:()=>{},dragType:{current:null},dragTaskId:{current:null},highlightCol:null,highlightBoard:null }}
                    onAddTask={(secId)=>{ setAddSec(secId); setNew(p=>({...p,section:secId})); setShowAdd(true); }}
                    onViewAll={(data)=>setTaskModal(data)}
                    onDeleteTasks={(secId,type)=>{ if(type==="active") setTasks(prev=>prev.filter(t=>!(t.section===secId&&!t.done))); else setTasks(prev=>prev.filter(t=>!(t.section===secId&&t.done))); }}
                  />
                );
              })}
            </div>
          </div>
        )}

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
            ):urgentTasks.map(t=><div key={t.id} style={{marginBottom:8}}><TaskPill t={t} showSec draggable={false} pill={pillCtx}/></div>)}
          </div>
        )}

        {/* ── TIMELINE VIEWS ── */}
        {["week","month","quarter","year"].includes(view)&&(()=>{const tl=timelineMap[view];return <TimelineSection periodTasks={tl.tasks} allActive={userActive} label={tl.label} sub={tl.sub}/>;})()}

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
                      {ut.filter(t=>!t.done).map(t=><TaskPill key={t.id} t={t} showSec draggable={false} pill={pillCtx}/>)}
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
                :tasks.filter(t=>t.assignee==="both"&&!t.done).map(t=><TaskPill key={t.id} t={t} showSec draggable={false} pill={pillCtx}/>)
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

      {/* ── TASK VIEW MODAL ── */}
      {taskModal&&(
        <div style={{ position:"fixed",inset:0,zIndex:50,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16 }} onClick={()=>setTaskModal(null)}>
          <div style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:18,width:"100%",maxWidth:640,maxHeight:"85vh",overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:"0 24px 64px rgba(0,0,0,0.4)" }} onClick={e=>e.stopPropagation()}>
            {/* Modal header */}
            <div style={{ padding:"16px 20px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:10,flexShrink:0 }}>
              <div style={{ width:36,height:36,borderRadius:10,background:taskModal.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>{taskModal.emoji}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:18,color:T.text }}>{taskModal.label}</div>
                <div style={{ fontSize:12,color:T.textSub }}>{taskModal.tasks.length} task{taskModal.tasks.length!==1?"s":""}</div>
              </div>
              <button onClick={()=>{setTaskModal(null);setAddSec(taskModal.colId);setNew(p=>({...p,section:taskModal.colId}));setShowAdd(true);}} style={{ height:32,padding:"0 12px",borderRadius:8,border:"none",background:taskModal.color,color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700 }}>+ Add</button>
              <button onClick={()=>setTaskModal(null)} style={{ width:32,height:32,borderRadius:8,border:`1px solid ${T.border}`,background:T.inputBg,cursor:"pointer",fontSize:16,color:T.textSub,display:"flex",alignItems:"center",justifyContent:"center" }}>✕</button>
            </div>
            {/* Modal task list */}
            <div style={{ overflowY:"auto",padding:"12px 16px",flex:1 }}>
              {taskModal.tasks.length===0
                ? <div style={{ textAlign:"center",padding:"40px",color:T.textMuted,fontSize:13,fontStyle:"italic" }}>No tasks in this section yet.</div>
                : taskModal.tasks.map(t=>(
                  <TaskPill key={t.id} t={t} showSec={false} draggable={false} pill={pillCtx}/>
                ))
              }
            </div>
          </div>
        </div>
      )}

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
      {showBulk&&<BulkImportModal onClose={()=>setShowBulk(false)} onImport={(tasks)=>{tasks.forEach(t=>doAdd(t));}} T={T} mode={mode} names={names} activeUser={activeUser} SECTIONS={SECTIONS} TASK_TYPES={TASK_TYPES} PRIORITIES={PRIORITIES} TODAY={TODAY}/>}
      {showDedup&&<DedupModal onClose={()=>setShowDedup(false)} tasks={tasks} onDelete={(ids)=>{ const next=tasks.filter(t=>!ids.includes(t.id)); setTasks(next); dbSet("tasks",next); }} T={T} mode={mode}/>}
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
            {/* App switcher */}
            <div style={{marginTop:20,paddingTop:16,borderTop:`1px solid ${T.border}`}}>
              <div style={{fontSize:12,fontWeight:600,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>Switch App</div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>{setShowSett(false);switchApp("tasks");}} style={{flex:1,padding:"10px",borderRadius:10,border:`1px solid ${appMode==="tasks"?T.accent:T.border}`,background:appMode==="tasks"?T.accent+"15":T.inputBg,color:appMode==="tasks"?T.accent:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:13,cursor:"pointer",fontWeight:appMode==="tasks"?700:400}}>⊞ Tasks</button>
                <button onClick={()=>{setShowSett(false);switchApp("budget");}} style={{flex:1,padding:"10px",borderRadius:10,border:`1px solid ${appMode==="budget"?"#20B2AA":T.border}`,background:appMode==="budget"?"#20B2AA15":T.inputBg,color:appMode==="budget"?"#20B2AA":T.text,fontFamily:"'DM Sans',sans-serif",fontSize:13,cursor:"pointer",fontWeight:appMode==="budget"?700:400}}>💰 Budget</button>
              </div>
            </div>

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
