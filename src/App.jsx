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


// ══════════════════════════════════════════════════════════════════════════════
// ── BudgetApp ─────────────────────────────────────────────────────────────────
// Full-featured budget tracker with income, expenses, savings goals,
// per-user views, shared view, pie chart, and history.
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
  { id:"other",     label:"Other",          emoji:"📦", color:"#888D9B" },
];

const BUDGET_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function PieChart({ slices, size=180, T }) {
  const total = slices.reduce((s,x)=>s+x.value,0);
  if (total===0) return <div style={{ width:size,height:size,borderRadius:"50%",background:T.inputBg,display:"flex",alignItems:"center",justifyContent:"center",color:T.textMuted,fontSize:12 }}>No data</div>;
  let cum = 0;
  const paths = slices.filter(s=>s.value>0).map(s=>{
    const pct = s.value/total;
    const start = cum*2*Math.PI - Math.PI/2;
    cum += pct;
    const end = cum*2*Math.PI - Math.PI/2;
    const r = size/2-4;
    const cx = size/2, cy = size/2;
    const x1=cx+r*Math.cos(start), y1=cy+r*Math.sin(start);
    const x2=cx+r*Math.cos(end),   y2=cy+r*Math.sin(end);
    const large = pct>0.5?1:0;
    return { ...s, d:`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`, pct };
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={size/2-4} fill={T.inputBg}/>
      {paths.map((p,i)=><path key={i} d={p.d} fill={p.color} stroke={T.surface} strokeWidth={1.5} opacity={0.9}/>)}
      <circle cx={size/2} cy={size/2} r={size/4} fill={T.surface}/>
    </svg>
  );
}

function BudgetEntryForm({ data, setData, onSave, onClose, T, mode, owner }) {
  const ref = useRef(null);
  useEffect(()=>{ const t=setTimeout(()=>{ if(ref.current) ref.current.focus(); },80); return()=>clearTimeout(t); },[]);
  const inpSt = { width:"100%",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:9,padding:"9px 12px",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:14,outline:"none",boxSizing:"border-box" };
  const selSt = { ...inpSt,background:mode==="dark"?"#181B23":"#fff",cursor:"pointer" };
  const lblSt = { fontSize:11,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",color:T.textMuted,display:"block",marginBottom:4,marginTop:12,fontFamily:"'DM Sans',sans-serif" };
  const now = new Date();
  return (
    <div style={{ position:"fixed",inset:0,zIndex:40,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center" }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:"18px 18px 0 0",width:"100%",maxWidth:520,maxHeight:"92vh",overflowY:"auto",padding:"24px 20px 36px",boxShadow:"0 -4px 32px rgba(0,0,0,0.3)" }}>
        <div style={{ width:40,height:4,borderRadius:2,background:T.textMuted,margin:"0 auto 20px",opacity:0.4 }}/>
        <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:22,color:T.text,marginBottom:4 }}>{data.id?"Edit":"New"} {data.type==="income"?"Income":"Expense"}</div>
        <div style={{ height:2,width:40,background:data.type==="income"?"#3DBF8A":"#E84E8A",borderRadius:2,marginBottom:18 }}/>

        <label style={lblSt}>Type</label>
        <div style={{ display:"flex",gap:8 }}>
          {[["income","💚 Income"],["expense","💸 Expense"]].map(([v,l])=>(
            <button key={v} onClick={()=>setData(p=>({...p,type:v}))}
              style={{ flex:1,padding:"9px",borderRadius:10,border:`1px solid ${data.type===v?(v==="income"?"#3DBF8A":"#E84E8A"):T.border}`,background:data.type===v?(v==="income"?"#3DBF8A":"#E84E8A")+"18":"transparent",color:data.type===v?(v==="income"?"#3DBF8A":"#E84E8A"):T.text,fontFamily:"'DM Sans',sans-serif",fontSize:13,cursor:"pointer",fontWeight:data.type===v?700:400 }}>
              {l}
            </button>
          ))}
        </div>

        <label style={lblSt}>Description</label>
        <input ref={ref} style={inpSt} value={data.description||""} onChange={e=>setData(p=>({...p,description:e.target.value}))} placeholder="e.g. TA Stipend, Rent, Groceries..." onKeyDown={e=>{ if(e.key==="Enter"&&data.description?.trim()&&data.amount){e.preventDefault();onSave();}}}/>

        <label style={lblSt}>Amount ($)</label>
        <input style={inpSt} type="number" min="0" step="0.01" value={data.amount||""} onChange={e=>setData(p=>({...p,amount:e.target.value}))} placeholder="0.00"/>

        <label style={lblSt}>Category</label>
        <select style={selSt} value={data.category||"other"} onChange={e=>setData(p=>({...p,category:e.target.value}))}>
          {BUDGET_CATS.map(c=><option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
        </select>

        <label style={lblSt}>Date</label>
        <input type="date" style={selSt} value={data.date||new Date().toISOString().slice(0,10)} onChange={e=>setData(p=>({...p,date:e.target.value}))}/>

        <label style={lblSt}>Notes (optional)</label>
        <input style={inpSt} value={data.notes||""} onChange={e=>setData(p=>({...p,notes:e.target.value}))} placeholder="Any extra details..."/>

        <label style={lblSt}>Recurring?</label>
        <div style={{ display:"flex",gap:8 }}>
          {[["none","One-time"],["monthly","Monthly"],["weekly","Weekly"]].map(([v,l])=>(
            <button key={v} onClick={()=>setData(p=>({...p,recurring:v}))}
              style={{ flex:1,padding:"8px",borderRadius:9,border:`1px solid ${(data.recurring||"none")===v?"#9B6EE8":T.border}`,background:(data.recurring||"none")===v?"#9B6EE822":"transparent",color:(data.recurring||"none")===v?"#9B6EE8":T.text,fontFamily:"'DM Sans',sans-serif",fontSize:12,cursor:"pointer",fontWeight:(data.recurring||"none")===v?700:400 }}>
              {l}
            </button>
          ))}
        </div>

        <div style={{ display:"flex",gap:10,marginTop:22,justifyContent:"flex-end" }}>
          <button style={{ padding:"9px 20px",borderRadius:9,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,background:T.inputBg,color:T.textSub }} onClick={onClose}>Cancel</button>
          <button style={{ padding:"9px 22px",borderRadius:9,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,background:data.type==="income"?"#3DBF8A":"#E84E8A",color:"#fff" }} onClick={onSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

function GoalForm({ data, setData, onSave, onClose, T, mode }) {
  const ref = useRef(null);
  useEffect(()=>{ const t=setTimeout(()=>{ if(ref.current) ref.current.focus(); },80); return()=>clearTimeout(t); },[]);
  const inpSt = { width:"100%",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:9,padding:"9px 12px",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:14,outline:"none",boxSizing:"border-box" };
  const selSt = { ...inpSt,background:mode==="dark"?"#181B23":"#fff",cursor:"pointer" };
  const lblSt = { fontSize:11,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",color:T.textMuted,display:"block",marginBottom:4,marginTop:12,fontFamily:"'DM Sans',sans-serif" };
  return (
    <div style={{ position:"fixed",inset:0,zIndex:40,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center" }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:"18px 18px 0 0",width:"100%",maxWidth:520,maxHeight:"92vh",overflowY:"auto",padding:"24px 20px 36px",boxShadow:"0 -4px 32px rgba(0,0,0,0.3)" }}>
        <div style={{ width:40,height:4,borderRadius:2,background:T.textMuted,margin:"0 auto 20px",opacity:0.4 }}/>
        <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:22,color:T.text,marginBottom:4 }}>{data.id?"Edit":"New"} Savings Goal</div>
        <div style={{ height:2,width:40,background:"#20B2AA",borderRadius:2,marginBottom:18 }}/>
        <label style={lblSt}>Goal Name</label>
        <input ref={ref} style={inpSt} value={data.name||""} onChange={e=>setData(p=>({...p,name:e.target.value}))} placeholder="e.g. Emergency Fund, PhD Move, Engagement Ring..."/>
        <label style={lblSt}>Target Amount ($)</label>
        <input style={inpSt} type="number" min="0" step="1" value={data.target||""} onChange={e=>setData(p=>({...p,target:e.target.value}))} placeholder="5000"/>
        <label style={lblSt}>Current Saved ($)</label>
        <input style={inpSt} type="number" min="0" step="0.01" value={data.saved||""} onChange={e=>setData(p=>({...p,saved:e.target.value}))} placeholder="0"/>
        <label style={lblSt}>Target Date (optional)</label>
        <input type="date" style={selSt} value={data.deadline||""} onChange={e=>setData(p=>({...p,deadline:e.target.value}))}/>
        <label style={lblSt}>Emoji / Icon</label>
        <input style={inpSt} value={data.emoji||"💰"} onChange={e=>setData(p=>({...p,emoji:e.target.value}))} placeholder="💰"/>
        <div style={{ display:"flex",gap:10,marginTop:22,justifyContent:"flex-end" }}>
          <button style={{ padding:"9px 20px",borderRadius:9,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,background:T.inputBg,color:T.textSub }} onClick={onClose}>Cancel</button>
          <button style={{ padding:"9px 22px",borderRadius:9,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,background:"#20B2AA",color:"#fff" }} onClick={onSave}>Save Goal</button>
        </div>
      </div>
    </div>
  );
}

function BudgetApp({ names, mode, T, activeUser, onBack }) {
  const [entries,    setEntriesState] = useState(null);
  const [goals,      setGoalsState]   = useState(null);
  const [view,       setBView]        = useState("overview"); // overview | transactions | goals | shared
  const [focus,      setFocus]        = useState(activeUser||"A"); // A | B | shared
  const [month,      setMonth]        = useState(new Date().getMonth());
  const [year,       setYear]         = useState(new Date().getFullYear());
  const [showAdd,    setShowAdd]      = useState(false);
  const [showGoal,   setShowGoal]     = useState(false);
  const [editEntry,  setEditEntry]    = useState(null);
  const [editGoal,   setEditGoal]     = useState(null);
  const blankEntry = { type:"expense", description:"", amount:"", category:"other", date:new Date().toISOString().slice(0,10), notes:"", recurring:"none", owner:focus };
  const blankGoal  = { name:"", target:"", saved:"", deadline:"", emoji:"💰", owner:focus };
  const [newEntry,   setNewEntry]     = useState({...blankEntry});
  const [newGoal,    setNewGoal]      = useState({...blankGoal});

  function genBId() { return "b"+Date.now().toString(36)+Math.random().toString(36).slice(2,5); }

  useEffect(()=>{
    (async()=>{
      const [e,g] = await Promise.all([dbGet("budget_entries"),dbGet("budget_goals")]);
      setEntriesState(e??[]); setGoalsState(g??[]);
    })();
  },[]);

  function saveEntries(list) { setEntriesState(list); dbSet("budget_entries",list); }
  function saveGoals(list)   { setGoalsState(list);   dbSet("budget_goals",list);   }

  function addEntry() {
    if (!newEntry.description?.trim()||!newEntry.amount) return;
    const e = { ...newEntry, id:genBId(), amount:parseFloat(newEntry.amount), owner:focus==="shared"?focus:focus, createdAt:new Date().toISOString() };
    saveEntries([...(entries||[]),e]);
    setNewEntry({...blankEntry,owner:focus}); setShowAdd(false);
  }
  function saveEditEntry() {
    saveEntries((entries||[]).map(e=>e.id===editEntry.id?{...editEntry,amount:parseFloat(editEntry.amount)}:e));
    setEditEntry(null);
  }
  function deleteEntry(id) { saveEntries((entries||[]).filter(e=>e.id!==id)); }

  function addGoal() {
    if (!newGoal.name?.trim()||!newGoal.target) return;
    saveGoals([...(goals||[]),{ ...newGoal,id:genBId(),target:parseFloat(newGoal.target),saved:parseFloat(newGoal.saved||0),owner:focus==="shared"?"shared":focus }]);
    setNewGoal({...blankGoal,owner:focus}); setShowGoal(false);
  }
  function saveEditGoal() {
    saveGoals((goals||[]).map(g=>g.id===editGoal.id?{...editGoal,target:parseFloat(editGoal.target),saved:parseFloat(editGoal.saved||0)}:g));
    setEditGoal(null);
  }
  function deleteGoal(id) { saveGoals((goals||[]).filter(g=>g.id!==id)); }
  function updateGoalSaved(id, amount) { saveGoals((goals||[]).map(g=>g.id===id?{...g,saved:Math.max(0,parseFloat(amount)||0)}:g)); }

  const fmt = (n) => "$"+n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
  const catOf = id => BUDGET_CATS.find(c=>c.id===id)||BUDGET_CATS[BUDGET_CATS.length-1];

  // Filter entries by focus and month
  function filterEntries(list) {
    if (!list) return [];
    return list.filter(e=>{
      const d = new Date(e.date);
      const inMonth = d.getMonth()===month && d.getFullYear()===year;
      const inFocus = focus==="shared" ? e.owner==="shared" : e.owner===focus || e.owner==="shared";
      return inMonth && inFocus;
    });
  }

  const periodEntries = filterEntries(entries||[]);
  const income  = periodEntries.filter(e=>e.type==="income").reduce((s,e)=>s+e.amount,0);
  const expenses= periodEntries.filter(e=>e.type==="expense").reduce((s,e)=>s+e.amount,0);
  const balance = income - expenses;
  const savingsRate = income>0 ? Math.round(((income-expenses)/income)*100) : 0;

  // Category breakdown for pie
  const byCategory = BUDGET_CATS.map(cat=>({
    ...cat,
    value: periodEntries.filter(e=>e.type==="expense"&&e.category===cat.id).reduce((s,e)=>s+e.amount,0)
  })).filter(c=>c.value>0).sort((a,b)=>b.value-a.value);

  // Goals filter
  const myGoals = (goals||[]).filter(g=> focus==="shared" ? g.owner==="shared" : g.owner===focus || g.owner==="shared");

  // All-time net
  const allEntries = filterEntries(entries||[]).concat(); // same focus, all months
  function allTimeForFocus() {
    if (!entries) return {income:0,expenses:0};
    const all = (entries||[]).filter(e=> focus==="shared" ? e.owner==="shared" : e.owner===focus || e.owner==="shared");
    return { income:all.filter(e=>e.type==="income").reduce((s,e)=>s+e.amount,0), expenses:all.filter(e=>e.type==="expense").reduce((s,e)=>s+e.amount,0) };
  }

  const focusColor = focus==="A"?"#E8A838":focus==="B"?"#E84E8A":"#9B6EE8";
  const focusName  = focus==="shared"?"Shared":names[focus]||focus;
  const inpSt = { width:"100%",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:9,padding:"9px 12px",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:13,outline:"none",boxSizing:"border-box" };

  if (entries===null||goals===null) return (
    <div style={{ minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ textAlign:"center",color:T.textSub }}>
        <div style={{ fontSize:32,marginBottom:12 }}>💰</div>
        <div>Loading budget...</div>
      </div>
    </div>
  );

  const navTabs = [["overview","Overview"],["transactions","Transactions"],["goals","Goals"]];

  return (
    <div style={{ minHeight:"100vh",background:T.bg,color:T.text,fontFamily:"'DM Sans',sans-serif" }}>
      {/* Top bar */}
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 16px",borderBottom:`1px solid ${T.border}`,position:"sticky",top:0,zIndex:20,background:T.topbar,backdropFilter:"blur(12px)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <button onClick={onBack} style={{ width:32,height:32,borderRadius:8,border:`1px solid ${T.border}`,background:T.inputBg,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",color:T.textSub }}>←</button>
          <span style={{ fontFamily:"'DM Serif Display',serif",fontSize:19,color:"#20B2AA" }}>Budget 💰</span>
        </div>
        {/* Focus selector */}
        <div style={{ display:"flex",background:T.inputBg,borderRadius:9,padding:2,border:`1px solid ${T.border}`,gap:2 }}>
          {[["A",names.A],["B",names.B],["shared","Shared"]].map(([f,l])=>(
            <button key={f} onClick={()=>setFocus(f)} style={{ padding:"4px 10px",borderRadius:7,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,background:focus===f?(f==="A"?"#E8A838":f==="B"?"#E84E8A":"#9B6EE8"):"transparent",color:focus===f?"#fff":T.textSub,transition:"all 0.15s",whiteSpace:"nowrap" }}>{l}</button>
          ))}
        </div>
        {/* Add button */}
        <button onClick={()=>setShowAdd(true)} style={{ height:32,padding:"0 12px",borderRadius:8,border:"none",background:"#20B2AA",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,color:"#fff" }}>+ Add</button>
      </div>

      {/* Nav tabs */}
      <div style={{ display:"flex",gap:0,padding:"0 14px",borderBottom:`1px solid ${T.border}`,background:T.topbar,overflowX:"auto" }}>
        {navTabs.map(([v,l])=>(
          <button key={v} onClick={()=>setBView(v)} style={{ padding:"10px 16px",border:"none",cursor:"pointer",background:"none",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:view===v?700:400,color:view===v?"#20B2AA":T.textSub,borderBottom:view===v?"2px solid #20B2AA":"2px solid transparent",transition:"all 0.15s",whiteSpace:"nowrap" }}>{l}</button>
        ))}
      </div>

      {/* Month navigator */}
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",borderBottom:`1px solid ${T.border}` }}>
        <button onClick={()=>{ let m=month-1,y=year; if(m<0){m=11;y--;} setMonth(m);setYear(y); }} style={{ width:32,height:32,borderRadius:8,border:`1px solid ${T.border}`,background:T.inputBg,cursor:"pointer",color:T.textSub,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center" }}>‹</button>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:18,color:T.text }}>{BUDGET_MONTHS[month]} {year}</div>
          <div style={{ fontSize:11,color:focusColor,fontWeight:600 }}>{focusName}'s View</div>
        </div>
        <button onClick={()=>{ let m=month+1,y=year; if(m>11){m=0;y++;} setMonth(m);setYear(y); }} style={{ width:32,height:32,borderRadius:8,border:`1px solid ${T.border}`,background:T.inputBg,cursor:"pointer",color:T.textSub,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center" }}>›</button>
      </div>

      <div style={{ padding:"20px 16px",maxWidth:900,margin:"0 auto" }}>

        {/* ── OVERVIEW ── */}
        {view==="overview"&&(
          <>
            {/* Summary cards */}
            <div className="stats-row" style={{ marginBottom:20 }}>
              {[
                { l:"Income",   v:fmt(income),   c:"#3DBF8A", sub:"This month" },
                { l:"Expenses", v:fmt(expenses), c:"#E84E8A", sub:"This month" },
                { l:"Balance",  v:fmt(balance),  c:balance>=0?"#3DBF8A":"#E84E8A", sub:balance>=0?"Surplus":"Deficit" },
                { l:"Savings Rate", v:`${savingsRate}%`, c:"#20B2AA", sub:"of income saved" },
              ].map(s=>(
                <div key={s.l} style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:"14px 16px",flex:"1 1 110px",borderLeft:`3px solid ${s.c}`,boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
                  <div style={{ fontSize:20,fontWeight:700,color:T.text,lineHeight:1 }}>{s.v}</div>
                  <div style={{ fontSize:10,fontWeight:600,color:T.textSub,marginTop:3,textTransform:"uppercase",letterSpacing:"0.08em" }}>{s.l}</div>
                  <div style={{ fontSize:10,color:T.textMuted,marginTop:2 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Pie chart + category breakdown */}
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,340px),1fr))",gap:16,marginBottom:20 }}>
              {/* Pie */}
              <div style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:"20px",boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
                <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:17,color:T.text,marginBottom:16 }}>Spending Breakdown</div>
                {byCategory.length===0
                  ? <div style={{ textAlign:"center",padding:"30px",color:T.textMuted,fontSize:13,fontStyle:"italic" }}>No expenses this month</div>
                  : <div style={{ display:"flex",alignItems:"center",gap:16,flexWrap:"wrap" }}>
                      <PieChart slices={byCategory} T={T} size={160}/>
                      <div style={{ flex:1,minWidth:120 }}>
                        {byCategory.slice(0,6).map(cat=>(
                          <div key={cat.id} style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8 }}>
                            <div style={{ width:10,height:10,borderRadius:2,background:cat.color,flexShrink:0 }}/>
                            <span style={{ fontSize:12,color:T.text,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{cat.label}</span>
                            <span style={{ fontSize:12,fontWeight:700,color:cat.color }}>{fmt(cat.value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                }
              </div>

              {/* Category bars */}
              <div style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:"20px",boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
                <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:17,color:T.text,marginBottom:16 }}>By Category</div>
                {byCategory.length===0
                  ? <div style={{ textAlign:"center",padding:"20px",color:T.textMuted,fontSize:13,fontStyle:"italic" }}>No data yet</div>
                  : byCategory.map(cat=>(
                    <div key={cat.id} style={{ marginBottom:11 }}>
                      <div style={{ display:"flex",justifyContent:"space-between",marginBottom:3 }}>
                        <span style={{ fontSize:12,color:T.text }}>{cat.emoji} {cat.label}</span>
                        <span style={{ fontSize:12,fontWeight:700,color:cat.color }}>{fmt(cat.value)}</span>
                      </div>
                      <div style={{ height:5,background:T.inputBg,borderRadius:5,overflow:"hidden" }}>
                        <div style={{ height:"100%",width:`${expenses>0?(cat.value/expenses)*100:0}%`,background:cat.color,borderRadius:5 }}/>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Recent transactions */}
            <div style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:"18px 20px",boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14 }}>
                <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:17,color:T.text }}>Recent</div>
                <button onClick={()=>setBView("transactions")} style={{ fontSize:12,color:"#20B2AA",background:"none",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600 }}>View all →</button>
              </div>
              {periodEntries.length===0
                ? <div style={{ fontSize:13,color:T.textMuted,fontStyle:"italic",textAlign:"center",padding:"20px 0" }}>No transactions this month</div>
                : [...periodEntries].sort((a,b)=>b.date<a.date?-1:1).slice(0,6).map(e=>{
                    const cat=catOf(e.category);
                    return (
                      <div key={e.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:`1px solid ${T.border}` }}>
                        <div style={{ width:34,height:34,borderRadius:9,background:cat.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0 }}>{cat.emoji}</div>
                        <div style={{ flex:1,minWidth:0 }}>
                          <div style={{ fontSize:13,fontWeight:600,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{e.description}</div>
                          <div style={{ fontSize:11,color:T.textMuted }}>{e.date} · {cat.label}</div>
                        </div>
                        <div style={{ fontSize:14,fontWeight:700,color:e.type==="income"?"#3DBF8A":"#E84E8A",flexShrink:0 }}>{e.type==="income"?"+":"-"}{fmt(e.amount)}</div>
                      </div>
                    );
                  })
              }
            </div>
          </>
        )}

        {/* ── TRANSACTIONS ── */}
        {view==="transactions"&&(
          <div>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:8 }}>
              <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:22,color:T.text }}>Transactions</div>
              <div style={{ fontSize:13,color:T.textSub }}>{periodEntries.length} this month</div>
            </div>
            {periodEntries.length===0
              ? <div style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:"50px 20px",textAlign:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
                  <div style={{ fontSize:36,marginBottom:10 }}>💸</div>
                  <div style={{ fontSize:16,fontWeight:600,color:T.text }}>No transactions yet</div>
                  <div style={{ fontSize:13,color:T.textSub,marginTop:4 }}>Tap + Add to record income or expenses.</div>
                </div>
              : [...periodEntries].sort((a,b)=>b.date<a.date?-1:1).map(e=>{
                  const cat=catOf(e.category);
                  return (
                    <div key={e.id} style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"14px 16px",marginBottom:8,boxShadow:"0 2px 6px rgba(0,0,0,0.05)",borderLeft:`3px solid ${e.type==="income"?"#3DBF8A":"#E84E8A"}` }}>
                      <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                        <div style={{ width:36,height:36,borderRadius:9,background:cat.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0 }}>{cat.emoji}</div>
                        <div style={{ flex:1,minWidth:0 }}>
                          <div style={{ fontSize:14,fontWeight:600,color:T.text }}>{e.description}</div>
                          <div style={{ display:"flex",gap:6,marginTop:3,flexWrap:"wrap" }}>
                            <span style={{ fontSize:10,padding:"1px 6px",borderRadius:5,background:cat.color+"20",color:cat.color,fontWeight:600 }}>{cat.emoji} {cat.label}</span>
                            <span style={{ fontSize:10,color:T.textMuted }}>{e.date}</span>
                            {e.recurring&&e.recurring!=="none"&&<span style={{ fontSize:10,padding:"1px 6px",borderRadius:5,background:"#9B6EE822",color:"#9B6EE8",fontWeight:600 }}>🔄 {e.recurring}</span>}
                            {e.notes&&<span style={{ fontSize:10,color:T.textMuted,fontStyle:"italic" }}>{e.notes}</span>}
                          </div>
                        </div>
                        <div style={{ textAlign:"right",flexShrink:0 }}>
                          <div style={{ fontSize:16,fontWeight:700,color:e.type==="income"?"#3DBF8A":"#E84E8A" }}>{e.type==="income"?"+":"-"}{fmt(e.amount)}</div>
                          <div style={{ display:"flex",gap:4,marginTop:4,justifyContent:"flex-end" }}>
                            <button onClick={()=>setEditEntry({...e})} style={{ background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:12,padding:"2px 4px",borderRadius:4 }}>✎</button>
                            <button onClick={()=>deleteEntry(e.id)} style={{ background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:12,padding:"2px 4px",borderRadius:4 }}>✕</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
            }
          </div>
        )}

        {/* ── GOALS ── */}
        {view==="goals"&&(
          <div>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:8 }}>
              <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:22,color:T.text }}>Savings Goals</div>
              <button onClick={()=>setShowGoal(true)} style={{ height:34,padding:"0 14px",borderRadius:9,border:"none",background:"#20B2AA",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,color:"#fff" }}>+ New Goal</button>
            </div>
            {myGoals.length===0
              ? <div style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:"50px 20px",textAlign:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
                  <div style={{ fontSize:36,marginBottom:10 }}>🎯</div>
                  <div style={{ fontSize:16,fontWeight:600,color:T.text }}>No goals yet</div>
                  <div style={{ fontSize:13,color:T.textSub,marginTop:4 }}>Set a savings goal — emergency fund, travel, or a future together.</div>
                </div>
              : <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,300px),1fr))",gap:14 }}>
                  {myGoals.map(g=>{
                    const pct = g.target>0?Math.min(100,Math.round((g.saved/g.target)*100)):0;
                    const left = Math.max(0,g.target-g.saved);
                    const daysLeft = g.deadline ? Math.ceil((new Date(g.deadline)-new Date())/86400000) : null;
                    const [editing,setEditing] = useState(false);
                    const [newSaved,setNewSaved] = useState(String(g.saved));
                    return (
                      <div key={g.id} style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:"18px",boxShadow:"0 2px 8px rgba(0,0,0,0.06)",borderTop:`3px solid #20B2AA` }}>
                        <div style={{ display:"flex",alignItems:"flex-start",gap:10,marginBottom:14 }}>
                          <div style={{ fontSize:28,lineHeight:1 }}>{g.emoji||"💰"}</div>
                          <div style={{ flex:1,minWidth:0 }}>
                            <div style={{ fontSize:15,fontWeight:700,color:T.text }}>{g.name}</div>
                            {daysLeft!==null&&<div style={{ fontSize:11,color:daysLeft<30?"#E84E8A":"#E8A838",marginTop:2 }}>📅 {daysLeft>0?`${daysLeft}d left`:"Past deadline"}</div>}
                          </div>
                          <div style={{ display:"flex",gap:4 }}>
                            <button onClick={()=>setEditGoal({...g})} style={{ background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:13,padding:"2px 4px" }}>✎</button>
                            <button onClick={()=>deleteGoal(g.id)} style={{ background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:13,padding:"2px 4px" }}>✕</button>
                          </div>
                        </div>
                        {/* Progress */}
                        <div style={{ marginBottom:10 }}>
                          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5,fontSize:12 }}>
                            <span style={{ color:T.textSub }}>Saved: <strong style={{ color:T.text }}>{fmt(g.saved)}</strong></span>
                            <span style={{ color:"#20B2AA",fontWeight:700 }}>{pct}%</span>
                          </div>
                          <div style={{ height:8,background:T.inputBg,borderRadius:8,overflow:"hidden" }}>
                            <div style={{ height:"100%",width:`${pct}%`,background:pct>=100?"#3DBF8A":"#20B2AA",borderRadius:8,transition:"width 0.4s" }}/>
                          </div>
                          <div style={{ fontSize:11,color:T.textMuted,marginTop:4 }}>Target: {fmt(g.target)} · {fmt(left)} to go</div>
                        </div>
                        {/* Update saved amount */}
                        {editing ? (
                          <div style={{ display:"flex",gap:6 }}>
                            <input type="number" style={{ ...inpSt,padding:"6px 10px",fontSize:12,flex:1 }} value={newSaved} onChange={e=>setNewSaved(e.target.value)}/>
                            <button onClick={()=>{ updateGoalSaved(g.id,newSaved); setEditing(false); }} style={{ padding:"6px 12px",borderRadius:8,border:"none",background:"#20B2AA",color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600 }}>Save</button>
                            <button onClick={()=>setEditing(false)} style={{ padding:"6px 10px",borderRadius:8,border:`1px solid ${T.border}`,background:T.inputBg,color:T.textSub,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12 }}>✕</button>
                          </div>
                        ) : (
                          <button onClick={()=>{ setNewSaved(String(g.saved)); setEditing(true); }} style={{ width:"100%",padding:"7px",borderRadius:9,border:"1px solid #20B2AA44",background:"#20B2AA0D",color:"#20B2AA",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600 }}>
                            ✏️ Update saved amount
                          </button>
                        )}
                        {pct>=100&&<div style={{ marginTop:8,textAlign:"center",fontSize:13,color:"#3DBF8A",fontWeight:700 }}>🎉 Goal reached!</div>}
                      </div>
                    );
                  })}
                </div>
            }
          </div>
        )}
      </div>

      {/* Forms */}
      {showAdd&&<BudgetEntryForm data={newEntry} setData={setNewEntry} onSave={addEntry} onClose={()=>setShowAdd(false)} T={T} mode={mode} owner={focus}/>}
      {editEntry&&<BudgetEntryForm data={editEntry} setData={setEditEntry} onSave={saveEditEntry} onClose={()=>setEditEntry(null)} T={T} mode={mode} owner={focus}/>}
      {showGoal&&<GoalForm data={newGoal} setData={setNewGoal} onSave={addGoal} onClose={()=>setShowGoal(false)} T={T} mode={mode}/>}
      {editGoal&&<GoalForm data={editGoal} setData={setEditGoal} onSave={saveEditGoal} onClose={()=>setEditGoal(null)} T={T} mode={mode}/>}
    </div>
  );
}


// ── BulkImportModal ───────────────────────────────────────────────────────────
// Parses pasted task lists with smart date & section detection.
// Supported formats (one task per line):
//   Buy groceries
//   Finish thesis draft | 2025-04-15
//   Review budget @finance high
//   Morning devotion @faith daily both
//   Call parents | tomorrow | medium | social | B
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
  const isDaily = t.type==="daily";
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
  const [showBulk,      setShowBulk]      = useState(false);
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
    ["board","Board"],["today","Today"],["accountability","Us"],
    ["analytics","📊 Analytics"],
    ["reflections","💭 Reflections"],
    ["tracker","🔗 Tracker"],
    ["cookbook","👨‍🍳 Cookbook"],
    ["prayer","🙏 Prayer"],
    ["urgent","🔴 Urgent"],["week","This Week"],["month","This Month"],
    ["quarter","Next 3 Months"],["year","This Year"],["aitools","AI Tools"],
  ];
  const isFullScreen=["today","accountability","aitools","urgent","week","month","quarter","year","prayer","analytics","reflections","tracker","cookbook"].includes(view);
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
            {overdue.length>0&&<div style={{marginBottom:20}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><div style={{width:8,height:8,borderRadius:"50%",background:"#E84E8A"}}/><span style={{fontSize:12,fontWeight:700,color:"#E84E8A",textTransform:"uppercase",letterSpacing:"0.1em"}}>Overdue</span><span style={{fontSize:12,color:T.textMuted}}>· {overdue.length}</span></div><div style={cardBase({padding:"6px 12px",border:"1px solid #E84E8A33"})}>{overdue.map(t=><TaskPill key={t.id} t={t} showSec draggable={false} pill={pillCtx}/>)}</div></div>}
            {dueToday.length>0&&<div style={{marginBottom:20}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><div style={{width:8,height:8,borderRadius:"50%",background:"#E8704A"}}/><span style={{fontSize:12,fontWeight:700,color:"#E8704A",textTransform:"uppercase",letterSpacing:"0.1em"}}>Due Today</span><span style={{fontSize:12,color:T.textMuted}}>· {dueToday.length}</span></div><div style={cardBase({padding:"6px 12px",border:"1px solid #E8704A33"})}>{dueToday.map(t=><TaskPill key={t.id} t={t} showSec draggable={false} pill={pillCtx}/>)}</div></div>}
            {upcoming.length>0&&(groupByMonth?Object.entries(monthGroups).map(([ml,mt])=>(
              <div key={ml} style={{marginBottom:20}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><div style={{width:8,height:8,borderRadius:"50%",background:"#3B9EDB"}}/><span style={{fontSize:12,fontWeight:700,color:"#3B9EDB",textTransform:"uppercase",letterSpacing:"0.1em"}}>{ml}</span><span style={{fontSize:12,color:T.textMuted}}>· {mt.length}</span></div><div style={cardBase({padding:"6px 12px"})}>{mt.map(t=><TaskPill key={t.id} t={t} showSec draggable={false} pill={pillCtx}/>)}</div></div>
            )):(
              <div style={{marginBottom:20}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><div style={{width:8,height:8,borderRadius:"50%",background:"#3DBF8A"}}/><span style={{fontSize:12,fontWeight:700,color:"#3DBF8A",textTransform:"uppercase",letterSpacing:"0.1em"}}>Upcoming</span><span style={{fontSize:12,color:T.textMuted}}>· {upcoming.length}</span></div><div style={cardBase({padding:"6px 12px"})}>{upcoming.map(t=><TaskPill key={t.id} t={t} showSec draggable={false} pill={pillCtx}/>)}</div></div>
            ))}
          </>
        )}
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
        </div>

        {/* Mobile menu button — shown only on mobile */}
        <div style={{ display:"flex",alignItems:"center",gap:6,flexShrink:0 }} className="topbar-menu-btn">
          <button onClick={()=>setShowAdd(true)} style={{ height:32,padding:"0 12px",borderRadius:8,border:"none",background:T.accent,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,color:T.accentFg,display:"flex",alignItems:"center",gap:4,whiteSpace:"nowrap" }}>
            + Task
          </button>
          <button onClick={()=>setShowBulk(true)} style={{ height:32,width:32,borderRadius:8,border:`1px solid ${T.border}`,background:T.inputBg,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",color:T.textSub,flexShrink:0 }} title="Bulk import">
            ⇪
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
