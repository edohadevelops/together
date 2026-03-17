import { useState, useEffect, useRef } from "react";

// ── Google Fonts ──────────────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Serif+Display:ital@0;1&display=swap";
document.head.appendChild(fontLink);

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
];

const TASK_TYPES = [
  { id: "todo",  label: "To-Do",  icon: "☐" },
  { id: "habit", label: "Habit",  icon: "↺" },
  { id: "daily", label: "Daily",  icon: "⟳" },
  { id: "goal",  label: "Goal",   icon: "◎" },
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
export default function TogetherApp() {
  const [tasks,      setTasksState] = useState(null);
  const [names,      setNamesState] = useState({ A:"Amen", B:"Gloria" });
  const [mode,       setMode]       = useState("dark");
  const [view,       setView]       = useState("board");
  const [activeUser, setUser]       = useState("A");
  const [filter,     setFilter]     = useState(null);
  const [showAdd,    setShowAdd]    = useState(false);
  const [addSection, setAddSec]     = useState(null);
  const [editTask,   setEdit]       = useState(null);
  const [showSett,   setShowSett]   = useState(false);
  const [showNav,    setShowNav]    = useState(false); // mobile nav drawer
  const [newTask,    setNew]        = useState({ title:"", section:"faith", type:"todo", assignee:"A", priority:"Medium", notes:"", dueDate:"" });
  const [pulse,      setPulse]      = useState(false);
  const [status,     setStatus]     = useState("connecting");
  const [loadMsg,    setLoadMsg]    = useState("Connecting to your board...");

  const dragTaskId    = useRef(null);
  const dragTargetCol = useRef(null);
  const [highlightCol, setHighlightCol] = useState(null);
  const tasksRef = useRef(null);
  const pollRef  = useRef(null);
  const T = THEMES[mode];

  // ── Greeting ────────────────────────────────────────────────────────────────
  const greeting = mode === "dark"
    ? getGreeting(names[activeUser])
    : getGreetingLight(names[activeUser]);

  // ── setTasks write-through ───────────────────────────────────────────────
  function setTasks(fn) {
    setTasksState(prev => {
      const next = typeof fn === "function" ? fn(prev ?? []) : fn;
      tasksRef.current = next;
      dbSet("tasks", next);
      return next;
    });
  }

  function resetDailies(list) {
    return list.map(t => t.type === "daily" && t.lastReset !== TODAY ? { ...t, done:false, lastReset:TODAY } : t);
  }

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const msgs = ["Syncing with Supabase...", "Loading your tasks...", "Almost ready..."];
    let i = 0;
    const ti = setInterval(() => { i++; if (msgs[i]) setLoadMsg(msgs[i]); }, 900);
    (async () => {
      try {
        const [t, n, m] = await Promise.all([dbGet("tasks"), dbGet("names"), dbGet("mode")]);
        let loaded = (t ?? SAMPLES).map((tk, i) => ({ order:i, createdAt:TODAY, dueDate:"", lastReset:"", ...tk }));
        loaded = resetDailies(loaded);
        tasksRef.current = loaded;
        setTasksState(loaded);
        if (!t) await dbSet("tasks", loaded); else await dbSet("tasks", loaded);
        if (n) setNamesState(n);
        if (m) setMode(m);
        setStatus("live");
      } catch {
        const fb = resetDailies(SAMPLES);
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
            tasksRef.current = r;
            return r;
          });
        }
        const n = await dbGet("names"); if (n) setNamesState(n);
        const m = await dbGet("mode");  if (m) setMode(m);
        setStatus("live");
      } catch { setStatus("error"); }
    }, 4000);
    return () => clearInterval(pollRef.current);
  }, []);

  const setNames   = n => { setNamesState(n); dbSet("names", n); };
  const toggleMode = () => { const m = mode==="dark"?"light":"dark"; setMode(m); dbSet("mode",m); };

  function toggleDone(id) {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const nowDone = !t.done;
      return { ...t, done:nowDone, streak:nowDone&&(t.type==="habit"||t.type==="daily")?t.streak+1:t.streak, lastReset:t.type==="daily"?TODAY:t.lastReset };
    }));
  }
  function deleteTask(id) { setTasks(prev => prev.filter(t => t.id !== id)); }
  function saveEdit()     { setTasks(prev => prev.map(t => t.id===editTask.id?editTask:t)); setEdit(null); }
  function doAdd() {
    if (!newTask.title.trim()) return;
    setTasks(prev => [...prev, { ...newTask, id:genId(), done:false, streak:0, order:prev.length, createdAt:TODAY, lastReset:newTask.type==="daily"?TODAY:"" }]);
    setNew({ title:"", section:"faith", type:"todo", assignee:"A", priority:"Medium", notes:"", dueDate:"" });
    setShowAdd(false); setAddSec(null);
  }

  // ── Drag ──────────────────────────────────────────────────────────────────
  function handleDragStart(e, id) { dragTaskId.current=id; e.dataTransfer.effectAllowed="move"; e.dataTransfer.setData("text/plain",id); }
  function handleDragOverCol(e, colId) {
    e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect="move";
    if (dragTargetCol.current!==colId) { dragTargetCol.current=colId; setHighlightCol(colId); }
  }
  function handleDropOnCol(e, colId) {
    e.preventDefault(); e.stopPropagation();
    const taskId=dragTaskId.current; const targetCol=dragTargetCol.current??colId;
    dragTaskId.current=null; dragTargetCol.current=null; setHighlightCol(null);
    if (!taskId) return;
    const updated=(tasksRef.current??[]).map(t=>{
      if (t.id!==taskId) return t;
      if (targetCol===DONE_COL) return {...t,done:true,streak:(t.type==="habit"||t.type==="daily")?t.streak+1:t.streak};
      return {...t,section:targetCol,done:false};
    });
    const reordered=updated.map((t,i)=>({...t,order:i}));
    tasksRef.current=reordered; setTasksState(reordered); dbSet("tasks",reordered);
  }
  function handleDragEnd() { dragTaskId.current=null; dragTargetCol.current=null; setHighlightCol(null); }

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
        onDragStart={draggable?e=>handleDragStart(e,t.id):undefined}
        onDragEnd={draggable?handleDragEnd:undefined}
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
            </div>
            <div style={{ display:"flex",gap:4,marginTop:5,flexWrap:"wrap",alignItems:"center" }}>
              {showSec&&<span style={{ fontSize:10,padding:"2px 7px",borderRadius:5,background:s.color+"22",color:s.color,fontWeight:600,fontFamily:"'DM Sans',sans-serif" }}>{s.emoji} {s.label}</span>}
              <span style={{ fontSize:10,padding:"2px 7px",borderRadius:5,background:aColor(t.assignee)+"20",color:aColor(t.assignee),fontWeight:600,fontFamily:"'DM Sans',sans-serif" }}>{aLabel(t.assignee)}</span>
              <span style={{ fontSize:10,padding:"2px 7px",borderRadius:5,background:PRI_COLOR[t.priority]+"20",color:PRI_COLOR[t.priority],fontWeight:600,fontFamily:"'DM Sans',sans-serif" }}>{t.priority}</span>
              {(t.type==="habit"||t.type==="daily")&&t.streak>0&&<span style={{ fontSize:10,padding:"2px 7px",borderRadius:5,background:"#E8A83820",color:"#E8A838",fontWeight:600 }}>🔥 {t.streak}d</span>}
              {dLbl&&<span style={{ fontSize:10,padding:"2px 7px",borderRadius:5,background:dCol+"22",color:dCol,fontWeight:700 }}>📅 {dLbl}</span>}
            </div>
            <div style={{ display:"flex",gap:8,marginTop:3,flexWrap:"wrap" }}>
              {t.notes&&<span style={{ fontSize:11,color:T.textMuted,fontStyle:"italic",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:200 }}>{t.notes}</span>}
              {t.createdAt&&<span style={{ fontSize:10,color:T.textMuted }}>Created {formatDate(t.createdAt)}</span>}
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
    const isOver=highlightCol===colId, allSec=isDone?[]:tasks.filter(t=>t.section===colId), dnCount=isDone?doneTasks.length:allSec.filter(t=>t.done).length, total=isDone?tasks.length:allSec.length, pct=total?Math.round((dnCount/total)*100):0;
    return (
      <div onDragOver={e=>handleDragOverCol(e,colId)} onDrop={e=>handleDropOnCol(e,colId)} style={{ background:T.colBg,border:`1px solid ${isOver?color+"99":T.border}`,borderRadius:14,display:"flex",flexDirection:"column",boxShadow:isOver?`0 0 0 2px ${color}55`:"none",transition:"border 0.1s,box-shadow 0.1s",overflow:"hidden",minHeight:180 }}>
        <div style={{ padding:"13px 14px 10px",borderBottom:`1px solid ${T.border}`,flexShrink:0 }}>
          <div style={{ display:"flex",alignItems:"center",gap:9 }}>
            <div style={{ width:32,height:32,borderRadius:9,background:color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0 }}>{emoji}</div>
            <div style={{ flex:1,minWidth:0 }}>
              <div style={{ fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:14,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{label}</div>
              <div style={{ fontSize:11,color:T.textSub,marginTop:1 }}>{isDone?`${dnCount} completed`:`${dnCount}/${total} done`}</div>
            </div>
            {!isDone&&<button onClick={()=>{setAddSec(colId);setNew(p=>({...p,section:colId}));setShowAdd(true);}} style={{ width:26,height:26,borderRadius:7,background:T.inputBg,border:`1px solid ${T.border}`,cursor:"pointer",color:T.textSub,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontWeight:700 }}>+</button>}
          </div>
          {!isDone&&<div style={{ height:3,background:T.inputBg,borderRadius:3,marginTop:9,overflow:"hidden" }}><div style={{ height:"100%",width:`${pct}%`,background:color,borderRadius:3,transition:"width 0.4s" }}/></div>}
        </div>
        <div style={{ flex:1,overflowY:"auto",padding:"10px 12px",minHeight:50 }}>
          {colTasks.length===0?<div style={{ border:`2px dashed ${isOver?color+"88":T.border}`,borderRadius:9,padding:"18px 10px",textAlign:"center",color:T.textMuted,fontSize:12,fontStyle:"italic",background:isOver?color+"0A":"transparent",transition:"all 0.1s" }}>{isDone?"✓ Drop tasks here to complete":"Drop tasks here"}</div>:colTasks.map(t=><TaskPill key={t.id} t={t} showSec={isDone}/>)}
        </div>
      </div>
    );
  }

  // ── Form Modal ────────────────────────────────────────────────────────────
  function FormModal({ data, setData, onSave, onClose, title }) {
    return (
      <div style={{ position:"fixed",inset:0,zIndex:40,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"0" }} onClick={e=>e.target===e.currentTarget&&onClose()}>
        {/* Sheet slides up from bottom on mobile, centered on desktop */}
        <div style={{ ...cardBase(), width:"100%", maxWidth:520, maxHeight:"92vh", overflowY:"auto", borderRadius:"18px 18px 0 0", padding:"24px 20px 32px" }}>
          {/* Handle */}
          <div style={{ width:40,height:4,borderRadius:2,background:T.textMuted,margin:"0 auto 20px",opacity:0.4 }}/>
          <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:22,color:T.text,marginBottom:4 }}>{title}</div>
          <div style={{ height:2,width:40,background:T.accent,borderRadius:2,marginBottom:20 }}/>
          <label style={lblStyle}>Title</label>
          <input style={inpStyle} value={data.title} onChange={e=>setData(p=>({...p,title:e.target.value}))} placeholder="What needs to be done?" autoFocus/>
          <label style={lblStyle}>Life Area</label>
          <select style={selStyle} value={data.section} onChange={e=>setData(p=>({...p,section:e.target.value}))}>
            {SECTIONS.map(s=><option key={s.id} value={s.id}>{s.emoji} {s.label}</option>)}
          </select>
          <label style={lblStyle}>Type</label>
          <select style={selStyle} value={data.type} onChange={e=>setData(p=>({...p,type:e.target.value}))}>
            {TASK_TYPES.map(t=><option key={t.id} value={t.id}>{t.icon} {t.label}{t.id==="daily"?" — resets daily":""}</option>)}
          </select>
          <label style={lblStyle}>Assigned To</label>
          <select style={selStyle} value={data.assignee} onChange={e=>setData(p=>({...p,assignee:e.target.value}))}>
            <option value="A">{names.A}</option>
            <option value="B">{names.B}</option>
            <option value="both">{names.A} & {names.B}</option>
          </select>
          <label style={lblStyle}>Priority</label>
          <select style={selStyle} value={data.priority} onChange={e=>setData(p=>({...p,priority:e.target.value}))}>
            {PRIORITIES.map(p=><option key={p} value={p}>{p}</option>)}
          </select>
          <label style={lblStyle}>Due Date (optional)</label>
          <input type="date" style={selStyle} value={data.dueDate||""} onChange={e=>setData(p=>({...p,dueDate:e.target.value}))}/>
          <label style={lblStyle}>Notes (optional)</label>
          <input style={inpStyle} value={data.notes} onChange={e=>setData(p=>({...p,notes:e.target.value}))} placeholder="Any extra details..."/>
          <div style={{ display:"flex",gap:10,marginTop:24,justifyContent:"flex-end" }}>
            <button style={btnStyle(false)} onClick={onClose}>Cancel</button>
            <button style={btnStyle(true)} onClick={onSave}>Save Task</button>
          </div>
        </div>
      </div>
    );
  }

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
  const filteredSec=filter?SECTIONS.filter(s=>s.id===filter):SECTIONS;
  const gridCols=[
    {colId:DONE_COL,label:"Done",emoji:"✓",color:"#3DBF8A",isDone:true,colTasks:filter?userDone.filter(t=>t.section===filter):userDone},
    ...filteredSec.map(s=>({colId:s.id,label:s.label,emoji:s.emoji,color:s.color,isDone:false,colTasks:userActive.filter(t=>t.section===s.id)}))
  ];

  const navViews=[
    ["board","Board"],["today","Today"],["accountability","Us"],
    ["urgent","🔴 Urgent"],["week","This Week"],["month","This Month"],
    ["quarter","Next 3 Months"],["year","This Year"],["aitools","AI Tools"],
  ];
  const isFullScreen=["today","accountability","aitools","urgent","week","month","quarter","year"].includes(view);
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
        <div style={{ display:"flex",gap:8,marginBottom:24,flexWrap:"wrap" }}>
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
        * { box-sizing: border-box; }
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${T.textMuted};border-radius:2px}
        input[type="date"]::-webkit-calendar-picker-indicator{filter:${mode==="dark"?"invert(1)":"none"}}
        button:active{transform:scale(0.97)}
      `}</style>

      {/* ── TOP BAR ── */}
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",borderBottom:`1px solid ${T.border}`,position:"sticky",top:0,zIndex:20,background:T.topbar,backdropFilter:"blur(12px)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          {/* Hamburger on mobile */}
          <button onClick={()=>setShowNav(true)} style={{ width:36,height:36,borderRadius:9,border:`1px solid ${T.border}`,background:T.inputBg,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",color:T.textSub,flexShrink:0 }}>☰</button>
          <span style={{ fontFamily:"'DM Serif Display',serif",fontSize:20,color:T.accent }}>Together</span>
          <span style={{ fontSize:14,color:T.accent }}>♡</span>
          <div style={{ width:7,height:7,borderRadius:"50%",background:status==="live"?(pulse?"#3DBF8A":"#2A6644"):status==="error"?"#E8704A":T.textMuted,transition:"background 0.4s",flexShrink:0 }} title={status}/>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:6 }}>
          {/* User toggle */}
          <div style={{ display:"flex",background:T.inputBg,borderRadius:9,padding:2,border:`1px solid ${T.border}` }}>
            {["A","B"].map(u=>(
              <button key={u} onClick={()=>setUser(u)} style={{ padding:"5px 12px",borderRadius:7,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,background:activeUser===u?T.accent:"transparent",color:activeUser===u?T.accentFg:T.textSub,transition:"all 0.15s",whiteSpace:"nowrap" }}>
                {names[u]}
              </button>
            ))}
          </div>
          <button onClick={toggleMode} style={{ width:34,height:34,borderRadius:9,border:`1px solid ${T.border}`,background:T.inputBg,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",color:T.textSub }}>
            {mode==="dark"?"☀":"☾"}
          </button>
          <button onClick={()=>setShowSett(true)} style={{ width:34,height:34,borderRadius:9,border:`1px solid ${T.border}`,background:T.inputBg,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",color:T.textSub }}>⚙</button>
          <button onClick={()=>setShowAdd(true)} style={{ height:34,padding:"0 14px",borderRadius:9,border:"none",background:T.accent,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:700,color:T.accentFg,display:"flex",alignItems:"center",gap:5,whiteSpace:"nowrap" }}>
            + Task
          </button>
        </div>
      </div>

      {/* ── MOBILE NAV DRAWER ── */}
      {showNav&&(
        <div style={{ position:"fixed",inset:0,zIndex:50,display:"flex" }} onClick={()=>setShowNav(false)}>
          <div style={{ background:"rgba(0,0,0,0.5)",backdropFilter:"blur(4px)",position:"absolute",inset:0 }}/>
          <div style={{ position:"relative",background:T.surface,width:"80%",maxWidth:280,height:"100%",overflowY:"auto",padding:"20px 0",animation:"slideUp 0.25s ease",boxShadow:"4px 0 24px rgba(0,0,0,0.3)" }} onClick={e=>e.stopPropagation()}>
            {/* Greeting inside drawer */}
            <div style={{ padding:"16px 20px 20px",borderBottom:`1px solid ${T.border}`,marginBottom:8,background:greeting.bg }}>
              <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:17,color:greeting.accent,lineHeight:1.3 }}>{greeting.text}</div>
              <div style={{ fontSize:12,color:T.textSub,marginTop:4 }}>{greeting.sub}</div>
            </div>
            {navViews.map(([v,l])=>(
              <button key={v} onClick={()=>{setView(v);setShowNav(false);}} style={{ display:"flex",alignItems:"center",gap:12,width:"100%",padding:"13px 20px",border:"none",background:view===v?T.accent+"18":"transparent",color:view===v?T.accent:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:15,fontWeight:view===v?700:400,cursor:"pointer",textAlign:"left",borderLeft:view===v?`3px solid ${T.accent}`:"3px solid transparent",transition:"all 0.15s" }}>
                {l}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── GREETING BANNER (board view only) ── */}
      {view==="board"&&(
        <div style={{ background:greeting.bg,padding:"18px 16px",borderBottom:`1px solid ${T.border}` }}>
          <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:22,color:greeting.accent }}>{greeting.text}</div>
          <div style={{ fontSize:13,color:T.textSub,marginTop:3 }}>{greeting.sub}</div>
        </div>
      )}

      {/* ── CONTENT ── */}
      <div style={{ padding:pad }}>

        {/* STATS */}
        {view==="board"&&(
          <div style={{ display:"flex",gap:8,margin:"16px 0",flexWrap:"wrap" }}>
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
            <div style={{ display:"flex",gap:6,overflowX:"auto",paddingBottom:8,marginBottom:14,WebkitOverflowScrolling:"touch" }}>
              <button onClick={()=>setFilter(null)} style={{ padding:"5px 12px",borderRadius:20,cursor:"pointer",fontSize:12,fontFamily:"'DM Sans',sans-serif",fontWeight:500,border:"none",background:!filter?T.accent:"transparent",color:!filter?T.accentFg:T.textSub,outline:!filter?"none":`1px solid ${T.border}`,transition:"all 0.15s",flexShrink:0 }}>All</button>
              {SECTIONS.map(s=>(
                <button key={s.id} onClick={()=>setFilter(filter===s.id?null:s.id)} style={{ padding:"5px 12px",borderRadius:20,cursor:"pointer",fontSize:12,fontFamily:"'DM Sans',sans-serif",fontWeight:500,border:"none",background:filter===s.id?s.color:"transparent",color:filter===s.id?"#fff":T.textSub,outline:filter===s.id?"none":`1px solid ${T.border}`,transition:"all 0.15s",whiteSpace:"nowrap",flexShrink:0 }}>
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}>
              <div style={{ width:28,height:28,borderRadius:"50%",background:(activeUser==="A"?"#E8A838":"#E84E8A")+"22",border:`2px solid ${activeUser==="A"?"#E8A838":"#E84E8A"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:activeUser==="A"?"#E8A838":"#E84E8A" }}>{names[activeUser][0]}</div>
              <span style={{ fontFamily:"'DM Serif Display',serif",fontSize:17,color:T.text }}>{names[activeUser]}'s Board</span>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12,alignItems:"start" }}>
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
              <div style={{marginBottom:24}}>
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
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14,marginBottom:14}}>
              {["A","B"].map(u=>{
                const ut=tasks.filter(t=>t.assignee===u||t.assignee==="both"),ud=ut.filter(t=>t.done).length,uc=u==="A"?"#E8A838":"#E84E8A",pct=ut.length?Math.round((ud/ut.length)*100):0,uu=urgentTasks.filter(t=>t.assignee===u||t.assignee==="both");
                return (
                  <div key={u} style={cardBase({padding:"20px"})}>
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                      <div style={{width:44,height:44,borderRadius:"50%",background:uc+"20",border:`2px solid ${uc}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:uc,fontWeight:700}}>{names[u][0]}</div>
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

        {/* ── AI TOOLS ── */}
        {view==="aitools"&&(
          <div style={{padding:"24px 16px"}}>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:28,color:T.text,marginBottom:4}}>AI Tools</div>
            <div style={{fontSize:13,color:T.textSub,marginBottom:24}}>Your curated toolkit — tap any card to open</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
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

      {/* Modals */}
      {showAdd&&<FormModal data={newTask} setData={setNew} onSave={doAdd} onClose={()=>{setShowAdd(false);setAddSec(null);}} title="New Task"/>}
      {editTask&&<FormModal data={editTask} setData={setEdit} onSave={saveEdit} onClose={()=>setEdit(null)} title="Edit Task"/>}

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
            <div style={{display:"flex",gap:10,marginTop:22,justifyContent:"flex-end"}}>
              <button style={btnStyle(true)} onClick={()=>setShowSett(false)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}