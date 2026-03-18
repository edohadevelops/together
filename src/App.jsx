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
  const [activeUser, setUser]       = useState("A");
  const [filter,     setFilter]     = useState(null);
  const [showAdd,    setShowAdd]    = useState(false);
  const [addSection, setAddSec]     = useState(null);
  const [editTask,   setEdit]       = useState(null);
  const [showSett,   setShowSett]   = useState(false);
  const [showNav,    setShowNav]    = useState(false); // mobile nav drawer
  const [toasts,     setToasts]     = useState([]);   // notification toasts
  const seenIdsRef   = useRef(null); // track task ids we've already seen
  const [newTask,    setNew]        = useState({ title:"", section:"faith", type:"todo", assignee:"A", priority:"Medium", notes:"", dueDate:"" });
  const [pulse,      setPulse]      = useState(false);
  const [status,     setStatus]     = useState("connecting");
  const [loadMsg,    setLoadMsg]    = useState("Connecting to your board...");

  const dragTaskId    = useRef(null);
  const dragTargetCol = useRef(null);
  const [highlightCol, setHighlightCol] = useState(null);
  const tasksRef = useRef(null);
  const namesRef  = useRef({ A:"Amen", B:"Gloria" }); // always-fresh ref for poll closure
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
        const [t, n, m] = await Promise.all([dbGet("tasks"), dbGet("names"), dbGet("mode")]);
        let loaded = (t ?? SAMPLES).map((tk, i) => ({ order:i, createdAt:TODAY, dueDate:"", lastReset:"", ...tk }));
        loaded = resetDailies(loaded);
        tasksRef.current = loaded;
        setTasksState(loaded);
        if (!t) await dbSet("tasks", loaded); else await dbSet("tasks", loaded);
        if (n) setNamesState(n);
        if (m) setMode(m);
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
        setStatus("live");
      } catch { setStatus("error"); }
    }, 4000);
    return () => clearInterval(pollRef.current);
  }, []);

  const setNames   = n => { setNamesState(n); namesRef.current = n; dbSet("names", n); };
  const toggleMode = () => { const m = mode==="dark"?"light":"dark"; setMode(m); dbSet("mode",m); };

  // ── Toast notifications ────────────────────────────────────────────────────
  function showToast(task, creatorName) {
    const id = genId();
    const s  = SECTIONS.find(sec => sec.id === task.section) || SECTIONS[0];
    setToasts(prev => [...prev, { id, task, creatorName, section: s }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }
  function dismissToast(id) { setToasts(prev => prev.filter(t => t.id !== id)); }

  function toggleDone(id) {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const nowDone = !t.done;
      return { ...t, done:nowDone, streak:nowDone&&(t.type==="habit"||t.type==="daily"||t.type==="weekly")?t.streak+1:t.streak, lastReset:t.type==="daily"?TODAY:t.type==="weekly"?THIS_WEEK:t.lastReset };
    }));
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
    const added = { ...data, id:genId(), done:false, streak:0, order:(tasksRef.current||[]).length, createdAt:TODAY, lastReset, createdBy:activeUser };
    setTasks(prev => [...prev, added]);
    // Success toast
    const sid = genId();
    const sec = SECTIONS.find(s=>s.id===data.section)||SECTIONS[0];
    setToasts(prev => [...prev, { id:sid, type:"success", title:data.title, section:sec }]);
    setTimeout(() => setToasts(prev => prev.filter(t=>t.id!==sid)), 3500);
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
  const filteredSec=filter?SECTIONS.filter(s=>s.id===filter):SECTIONS;
  const gridCols=[
    {colId:DONE_COL,label:"Done",emoji:"✓",color:"#3DBF8A",isDone:true,colTasks:filter?userDone.filter(t=>t.section===filter):userDone},
    ...filteredSec.map(s=>({colId:s.id,label:s.label,emoji:s.emoji,color:s.color,isDone:false,colTasks:userActive.filter(t=>t.section===s.id)}))
  ];

  const navViews=[
    ["board","Board"],["today","Today"],["accountability","Us"],
    ["prayer","🙏 Prayer"],
    ["urgent","🔴 Urgent"],["week","This Week"],["month","This Month"],
    ["quarter","Next 3 Months"],["year","This Year"],["aitools","AI Tools"],
  ];
  const isFullScreen=["today","accountability","aitools","urgent","week","month","quarter","year","prayer"].includes(view);
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
          <div style={{ display:"flex",background:T.inputBg,borderRadius:8,padding:2,border:`1px solid ${T.border}` }}>
            {["A","B"].map(u=>(
              <button key={u} onClick={()=>setUser(u)} style={{ padding:"4px 10px",borderRadius:6,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,background:activeUser===u?T.accent:"transparent",color:activeUser===u?T.accentFg:T.textSub,transition:"all 0.15s",whiteSpace:"nowrap" }}>
                {names[u]}
              </button>
            ))}
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
      {view==="board"&&(
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
              <div style={{ width:28,height:28,borderRadius:"50%",background:(activeUser==="A"?"#E8A838":"#E84E8A")+"22",border:`2px solid ${activeUser==="A"?"#E8A838":"#E84E8A"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:activeUser==="A"?"#E8A838":"#E84E8A" }}>{names[activeUser][0]}</div>
              <span style={{ fontFamily:"'DM Serif Display',serif",fontSize:17,color:T.text }}>{names[activeUser]}'s Board</span>
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

        {/* ── PRAYER REQUESTS ── */}
        {view==="prayer"&&(
          <PrayerView tasks={tasks} setTasks={setTasks} names={names} activeUser={activeUser} T={T} mode={mode} aColor={aColor} aLabel={aLabel} TODAY={TODAY} genId={genId} toasts={toasts} setToasts={setToasts} SECTIONS={SECTIONS}/>
        )}

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
          ["prayer","🙏","Prayer"],
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
            {/* User switch */}
            <div style={{ padding:"14px 20px 10px",borderBottom:`1px solid ${T.border}`,marginBottom:4 }}>
              <div style={{ fontSize:11,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",color:T.textMuted,marginBottom:8,fontFamily:"'DM Sans',sans-serif" }}>Viewing as</div>
              <div style={{ display:"flex",gap:8 }}>
                {["A","B"].map(u=>(
                  <button key={u} onClick={()=>{setUser(u);setShowNav(false);}} style={{ flex:1,padding:"10px",borderRadius:10,border:`1px solid ${activeUser===u?T.accent:T.border}`,background:activeUser===u?T.accent+"18":"transparent",color:activeUser===u?T.accent:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,cursor:"pointer",transition:"all 0.15s" }}>
                    {names[u]}
                  </button>
                ))}
              </div>
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
            <div style={{display:"flex",gap:10,marginTop:22,justifyContent:"flex-end"}}>
              <button style={btnStyle(true)} onClick={()=>setShowSett(false)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
