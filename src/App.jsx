import { useState, useEffect, useCallback, useRef } from "react";

// ── Google Fonts ──────────────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap";
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
  { id: "faith",    label: "Faith & Spirit",      emoji: "✦", color: "#E8A838" },
  { id: "health",   label: "Health & Fitness",     emoji: "◈", color: "#3DBF8A" },
  { id: "finance",  label: "Finance & Money",      emoji: "◆", color: "#3B9EDB" },
  { id: "work",     label: "Work & Career",        emoji: "▣", color: "#9B6EE8" },
  { id: "growth",   label: "Personal Growth",      emoji: "◉", color: "#E8704A" },
  { id: "relation", label: "Relationship & Dates", emoji: "♡", color: "#E84E8A" },
  { id: "social",   label: "Social & Friends",     emoji: "◎", color: "#C8B030" },
  { id: "home",     label: "Home & Chores",        emoji: "⌂", color: "#5BAD4E" },
  { id: "hobbies",  label: "Hobbies & Fun",        emoji: "◐", color: "#E8883A" },
];
const TASK_TYPES = [{ id:"todo",label:"To-Do",icon:"☐"},{id:"habit",label:"Habit",icon:"↺"},{id:"goal",label:"Goal",icon:"◎"}];
const PRIORITIES = ["Low","Medium","High"];
const PRI_COLOR  = { High:"#E8704A", Medium:"#E8A838", Low:"#3DBF8A" };
const DONE_COL   = "__done__";

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }

const SAMPLES = [
  { id:genId(), section:"faith",    title:"Morning devotion together", type:"habit", assignee:"both", priority:"High",   done:false, streak:3,  notes:"", order:0 },
  { id:genId(), section:"health",   title:"30-min workout",             type:"habit", assignee:"A",    priority:"Medium", done:false, streak:7,  notes:"", order:1 },
  { id:genId(), section:"finance",  title:"Review monthly budget",      type:"todo",  assignee:"both", priority:"High",   done:false, streak:0,  notes:"", order:2 },
  { id:genId(), section:"relation", title:"Plan date night",            type:"todo",  assignee:"B",    priority:"High",   done:true,  streak:0,  notes:"Dinner at the Italian place 🍝", order:3 },
  { id:genId(), section:"growth",   title:"Read 20 pages",              type:"habit", assignee:"A",    priority:"Medium", done:false, streak:12, notes:"", order:4 },
  { id:genId(), section:"home",     title:"Deep clean kitchen",         type:"todo",  assignee:"B",    priority:"Low",    done:false, streak:0,  notes:"", order:5 },
  { id:genId(), section:"work",     title:"Update resume / portfolio",  type:"goal",  assignee:"A",    priority:"Medium", done:false, streak:0,  notes:"Due end of month", order:6 },
  { id:genId(), section:"hobbies",  title:"Try a new recipe together",  type:"goal",  assignee:"both", priority:"Low",    done:false, streak:0,  notes:"", order:7 },
  { id:genId(), section:"social",   title:"Call parents this week",     type:"todo",  assignee:"B",    priority:"Medium", done:false, streak:0,  notes:"", order:8 },
];

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
  const [newTask,    setNew]        = useState({ title:"", section:"faith", type:"todo", assignee:"A", priority:"Medium", notes:"" });
  const [pulse,      setPulse]      = useState(false);
  const [status,     setStatus]     = useState("connecting");

  // ── Drag state — all refs, no state, to avoid stale closures ──────────────
  // We use a single "dragColOver" state just for visual highlight feedback
  const dragTaskId   = useRef(null);  // id of task being dragged
  const dragTargetCol= useRef(null);  // colId currently hovered
  const [highlightCol, setHighlightCol] = useState(null); // visual only

  // Keep a live ref to tasks so drop handler always sees fresh data
  const tasksRef = useRef(null);

  const T = THEMES[mode];
  const pollRef = useRef(null);

  // ── Persist tasks ref in sync with state ──────────────────────────────────
  // This is the key fix: drop handler reads from ref, never from stale closure
  function setTasks(fn) {
    setTasksState(prev => {
      const next = typeof fn === "function" ? fn(prev ?? []) : fn;
      tasksRef.current = next;
      dbSet("tasks", next);
      return next;
    });
  }

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [t, n, m] = await Promise.all([dbGet("tasks"), dbGet("names"), dbGet("mode")]);
        const loaded = (t ?? SAMPLES).map((tk, i) => ({ order: i, ...tk }));
        tasksRef.current = loaded;
        setTasksState(loaded);
        if (!t) await dbSet("tasks", loaded);
        if (n) setNamesState(n);
        if (m) setMode(m);
        setStatus("live");
      } catch { 
        tasksRef.current = SAMPLES;
        setTasksState(SAMPLES);
        setStatus("error");
      }
    })();
  }, []);

  // ── Poll ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    pollRef.current = setInterval(async () => {
      try {
        const t = await dbGet("tasks");
        if (t) {
          setTasksState(prev => {
            if (JSON.stringify(prev) === JSON.stringify(t)) return prev;
            setPulse(true); setTimeout(() => setPulse(false), 900);
            tasksRef.current = t;
            return t;
          });
        }
        const n = await dbGet("names"); if (n) setNamesState(n);
        const m = await dbGet("mode");  if (m) setMode(m);
        setStatus("live");
      } catch { setStatus("error"); }
    }, 4000);
    return () => clearInterval(pollRef.current);
  }, []);

  const setNames = n => { setNamesState(n); dbSet("names", n); };
  const toggleMode = () => { const m = mode === "dark" ? "light" : "dark"; setMode(m); dbSet("mode", m); };

  function toggleDone(id) {
    setTasks(prev => prev.map(t => t.id === id
      ? { ...t, done: !t.done, streak: !t.done && t.type==="habit" ? t.streak+1 : t.streak }
      : t
    ));
  }
  function deleteTask(id) { setTasks(prev => prev.filter(t => t.id !== id)); }
  function saveEdit() { setTasks(prev => prev.map(t => t.id === editTask.id ? editTask : t)); setEdit(null); }
  function doAdd() {
    if (!newTask.title.trim()) return;
    setTasks(prev => [...prev, { ...newTask, id:genId(), done:false, streak:0, order:prev.length }]);
    setNew({ title:"", section:"faith", type:"todo", assignee:"A", priority:"Medium", notes:"" });
    setShowAdd(false); setAddSec(null);
  }

  // ── Drag handlers — use refs throughout, never closures over state ─────────
  function handleDragStart(e, taskId) {
    dragTaskId.current = taskId;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", taskId);
  }

  function handleDragOverCol(e, colId) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    if (dragTargetCol.current !== colId) {
      dragTargetCol.current = colId;
      setHighlightCol(colId);
    }
  }

  function handleDropOnCol(e, colId) {
    e.preventDefault();
    e.stopPropagation();

    const taskId    = dragTaskId.current;
    const targetCol = dragTargetCol.current ?? colId;

    // Clear drag state immediately
    dragTaskId.current    = null;
    dragTargetCol.current = null;
    setHighlightCol(null);

    if (!taskId) return;

    // Read from ref — always fresh, no stale closure
    const current = tasksRef.current ?? [];
    const updated = current.map(t => {
      if (t.id !== taskId) return t;
      if (targetCol === DONE_COL) {
        return { ...t, done: true, streak: t.type==="habit" ? t.streak+1 : t.streak };
      }
      // Moving to a section col — update section, mark not done
      return { ...t, section: targetCol, done: false };
    });
    const reordered = updated.map((t, i) => ({ ...t, order: i }));
    tasksRef.current = reordered;
    setTasksState(reordered);
    dbSet("tasks", reordered);
  }

  function handleDragEnd() {
    dragTaskId.current    = null;
    dragTargetCol.current = null;
    setHighlightCol(null);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  const sec    = id => SECTIONS.find(s => s.id === id);
  const aLabel = a  => a === "both" ? `${names.A} & ${names.B}` : names[a] || a;
  const aColor = a  => a === "A" ? "#E8A838" : a === "B" ? "#E84E8A" : "#3DBF8A";

  if (!tasks) return (
    <div style={{ minHeight:"100vh", background:"#0F1117", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif", color:"#E8A838", fontSize:18, gap:10 }}>
      ♡ Loading Together...
    </div>
  );

  const doneTasks   = tasks.filter(t => t.done);
  const activeTasks = tasks.filter(t => !t.done);
  const compRate    = tasks.length ? Math.round((doneTasks.length / tasks.length) * 100) : 0;

  // ── Styles ────────────────────────────────────────────────────────────────
  const cardBase = (extra={}) => ({ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, boxShadow:T.cardShadow, ...extra });
  const inpStyle = { width:"100%", background:T.inputBg, border:`1px solid ${T.border}`, borderRadius:9, padding:"9px 13px", color:T.text, fontFamily:"'DM Sans',sans-serif", fontSize:14, outline:"none", boxSizing:"border-box" };
  const selStyle = { ...inpStyle, background:mode==="dark"?"#181B23":"#fff", cursor:"pointer" };
  const lblStyle = { fontSize:11, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", color:T.textMuted, display:"block", marginBottom:5, marginTop:14, fontFamily:"'DM Sans',sans-serif" };
  const btnStyle = p => ({ padding:"9px 20px", borderRadius:9, border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600, background:p?T.accent:T.inputBg, color:p?T.accentFg:T.textSub, transition:"all 0.15s" });

  // ── Task Pill ─────────────────────────────────────────────────────────────
  function TaskPill({ t, showSec=false }) {
    const s = sec(t.section);
    return (
      <div
        draggable
        onDragStart={e => handleDragStart(e, t.id)}
        onDragEnd={handleDragEnd}
        style={{
          background: mode==="dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.025)",
          border: `1px solid ${T.border}`,
          borderLeft: `3px solid ${t.done ? T.textMuted : s.color}`,
          borderRadius: 9,
          padding: "9px 11px",
          marginBottom: 6,
          cursor: "grab",
          opacity: t.done ? 0.55 : 1,
          userSelect: "none",
        }}
      >
        <div style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
          <div
            onClick={e => { e.stopPropagation(); toggleDone(t.id); }}
            style={{
              width:17, height:17, borderRadius:5, flexShrink:0, marginTop:2,
              border:`2px solid ${t.done ? s.color : T.border}`,
              background: t.done ? s.color : "transparent",
              display:"flex", alignItems:"center", justifyContent:"center",
              cursor:"pointer", transition:"all 0.15s",
            }}
          >
            {t.done && <span style={{ color:"#fff", fontSize:9, fontWeight:700, lineHeight:1 }}>✓</span>}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:13, fontWeight:500, lineHeight:1.4, fontFamily:"'DM Sans',sans-serif", color:t.done?T.textMuted:T.text, textDecoration:t.done?"line-through":"none" }}>
              {t.title}
            </div>
            <div style={{ display:"flex", gap:4, marginTop:5, flexWrap:"wrap" }}>
              {showSec && <span style={{ fontSize:10, padding:"1px 6px", borderRadius:5, background:s.color+"22", color:s.color, fontWeight:600, fontFamily:"'DM Sans',sans-serif" }}>{s.emoji} {s.label}</span>}
              <span style={{ fontSize:10, padding:"1px 6px", borderRadius:5, background:aColor(t.assignee)+"20", color:aColor(t.assignee), fontWeight:600, fontFamily:"'DM Sans',sans-serif" }}>{aLabel(t.assignee)}</span>
              <span style={{ fontSize:10, padding:"1px 6px", borderRadius:5, background:PRI_COLOR[t.priority]+"20", color:PRI_COLOR[t.priority], fontWeight:600, fontFamily:"'DM Sans',sans-serif" }}>{t.priority}</span>
              {t.type==="habit" && t.streak>0 && <span style={{ fontSize:10, padding:"1px 6px", borderRadius:5, background:"#E8A83820", color:"#E8A838", fontWeight:600, fontFamily:"'DM Sans',sans-serif" }}>🔥 {t.streak}d</span>}
            </div>
            {t.notes && <div style={{ fontSize:11, color:T.textMuted, marginTop:3, fontStyle:"italic", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.notes}</div>}
          </div>
          <div style={{ display:"flex", flexShrink:0, gap:1 }}>
            <button onClick={e => { e.stopPropagation(); setEdit({...t}); }} style={{ background:"none", border:"none", color:T.textMuted, cursor:"pointer", fontSize:12, padding:"2px 4px", borderRadius:4 }}>✎</button>
            <button onClick={e => { e.stopPropagation(); deleteTask(t.id); }} style={{ background:"none", border:"none", color:T.textMuted, cursor:"pointer", fontSize:12, padding:"2px 4px", borderRadius:4 }}>✕</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Grid Card ─────────────────────────────────────────────────────────────
  function GridCard({ colId, label, emoji, color, colTasks, isDone=false }) {
    const isOver  = highlightCol === colId;
    const allSec  = isDone ? [] : tasks.filter(t => t.section===colId);
    const dnCount = isDone ? doneTasks.length : allSec.filter(t=>t.done).length;
    const total   = isDone ? tasks.length : allSec.length;
    const pct     = total ? Math.round((dnCount/total)*100) : 0;

    return (
      <div
        onDragOver={e => handleDragOverCol(e, colId)}
        onDrop={e => handleDropOnCol(e, colId)}
        style={{
          background: T.colBg,
          border: `1px solid ${isOver ? color+"99" : T.border}`,
          borderRadius: 14,
          display: "flex",
          flexDirection: "column",
          boxShadow: isOver ? `0 0 0 2px ${color}55` : "none",
          transition: "border 0.1s, box-shadow 0.1s",
          overflow: "hidden",
          minHeight: 200,
        }}
      >
        {/* Header */}
        <div style={{ padding:"13px 14px 10px", borderBottom:`1px solid ${T.border}`, flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:9 }}>
            <div style={{ width:32, height:32, borderRadius:9, background:color+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, flexShrink:0 }}>{emoji}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:14, color:T.text }}>{label}</div>
              <div style={{ fontSize:11, color:T.textSub, marginTop:1 }}>{isDone ? `${dnCount} completed` : `${dnCount}/${total} done`}</div>
            </div>
            {!isDone && (
              <button
                onClick={() => { setAddSec(colId); setNew(p=>({...p,section:colId})); setShowAdd(true); }}
                style={{ width:24, height:24, borderRadius:7, background:T.inputBg, border:`1px solid ${T.border}`, cursor:"pointer", color:T.textSub, fontSize:16, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontWeight:700 }}
              >+</button>
            )}
          </div>
          {!isDone && (
            <div style={{ height:3, background:T.inputBg, borderRadius:3, marginTop:9, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${pct}%`, background:color, borderRadius:3, transition:"width 0.4s" }}/>
            </div>
          )}
        </div>

        {/* Task list */}
        <div style={{ flex:1, overflowY:"auto", padding:"10px 12px 10px", minHeight:60 }}>
          {colTasks.length === 0 ? (
            <div style={{
              border:`2px dashed ${isOver ? color+"88" : T.border}`,
              borderRadius:9, padding:"20px 10px",
              textAlign:"center", color:T.textMuted,
              fontSize:12, fontStyle:"italic",
              background: isOver ? color+"0A" : "transparent",
              transition:"all 0.1s",
            }}>
              {isDone ? "✓ Drop tasks here to complete" : "Drop tasks here"}
            </div>
          ) : (
            colTasks.map(t => <TaskPill key={t.id} t={t} showSec={isDone} />)
          )}
        </div>
      </div>
    );
  }

  // ── Form Modal ────────────────────────────────────────────────────────────
  function FormModal({ data, setData, onSave, onClose, title }) {
    return (
      <div style={{ position:"fixed", inset:0, zIndex:30, background:"rgba(0,0,0,0.55)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
        onClick={e => e.target===e.currentTarget && onClose()}>
        <div style={cardBase({ padding:"28px 30px", width:"100%", maxWidth:480, maxHeight:"88vh", overflowY:"auto" })}>
          <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:22, color:T.text, marginBottom:4 }}>{title}</div>
          <div style={{ height:2, width:40, background:T.accent, borderRadius:2, marginBottom:20 }}/>
          <label style={lblStyle}>Title</label>
          <input style={inpStyle} value={data.title} onChange={e=>setData(p=>({...p,title:e.target.value}))} placeholder="What needs to be done?" autoFocus/>
          <label style={lblStyle}>Life Area</label>
          <select style={selStyle} value={data.section} onChange={e=>setData(p=>({...p,section:e.target.value}))}>
            {SECTIONS.map(s=><option key={s.id} value={s.id}>{s.emoji} {s.label}</option>)}
          </select>
          <label style={lblStyle}>Type</label>
          <select style={selStyle} value={data.type} onChange={e=>setData(p=>({...p,type:e.target.value}))}>
            {TASK_TYPES.map(t=><option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
          </select>
          <label style={lblStyle}>Assigned To</label>
          <select style={selStyle} value={data.assignee} onChange={e=>setData(p=>({...p,assignee:e.target.value}))}>
            <option value="A">{names.A}</option>
            <option value="B">{names.B}</option>
            <option value="both">{names.A} & {names.B} (Shared)</option>
          </select>
          <label style={lblStyle}>Priority</label>
          <select style={selStyle} value={data.priority} onChange={e=>setData(p=>({...p,priority:e.target.value}))}>
            {PRIORITIES.map(p=><option key={p} value={p}>{p}</option>)}
          </select>
          <label style={lblStyle}>Notes (optional)</label>
          <input style={inpStyle} value={data.notes} onChange={e=>setData(p=>({...p,notes:e.target.value}))} placeholder="Any extra details..."/>
          <div style={{ display:"flex", gap:10, marginTop:24, justifyContent:"flex-end" }}>
            <button style={btnStyle(false)} onClick={onClose}>Cancel</button>
            <button style={btnStyle(true)} onClick={onSave}>Save Task</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Board for a user ──────────────────────────────────────────────────────
  const userTasks   = tasks.filter(t => t.assignee === activeUser || t.assignee === "both");
  const userActive  = userTasks.filter(t => !t.done);
  const userDone    = userTasks.filter(t => t.done);
  const filteredSec = filter ? SECTIONS.filter(s => s.id === filter) : SECTIONS;

  const gridCols = [
    { colId:DONE_COL, label:"Done", emoji:"✓", color:"#3DBF8A", isDone:true,
      colTasks: filter ? userDone.filter(t=>t.section===filter) : userDone },
    ...filteredSec.map(s => ({
      colId:s.id, label:s.label, emoji:s.emoji, color:s.color, isDone:false,
      colTasks: userActive.filter(t => t.section===s.id),
    }))
  ];

  const navViews = [["board","Board"],["today","Today"],["accountability","Us"]];

  return (
    <div style={{ minHeight:"100vh", background:T.bg, color:T.text, fontFamily:"'DM Sans',sans-serif", transition:"background 0.2s,color 0.2s" }}>

      {/* TOP BAR */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 24px", borderBottom:`1px solid ${T.border}`, position:"sticky", top:0, zIndex:10, background:T.topbar, backdropFilter:"blur(12px)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <span style={{ fontFamily:"'DM Serif Display',serif", fontSize:22, color:T.accent }}>Together</span>
          <span style={{ fontSize:15, color:T.accent }}>♡</span>
          <div style={{ width:7, height:7, borderRadius:"50%", background:status==="live"?(pulse?"#3DBF8A":"#2A6644"):status==="error"?"#E8704A":T.textMuted, transition:"background 0.4s" }} title={status}/>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ display:"flex", background:T.inputBg, borderRadius:9, padding:3, border:`1px solid ${T.border}` }}>
            {["A","B"].map(u=>(
              <button key={u} onClick={()=>setUser(u)} style={{ padding:"5px 16px", borderRadius:7, border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600, background:activeUser===u?T.accent:"transparent", color:activeUser===u?T.accentFg:T.textSub, transition:"all 0.15s" }}>
                {names[u]}
              </button>
            ))}
          </div>
          <button onClick={toggleMode} style={{ width:36, height:36, borderRadius:9, border:`1px solid ${T.border}`, background:T.inputBg, cursor:"pointer", fontSize:17, display:"flex", alignItems:"center", justifyContent:"center", color:T.textSub }}>
            {mode==="dark"?"☀":"☾"}
          </button>
          <button onClick={()=>setShowSett(true)} style={{ width:36, height:36, borderRadius:9, border:`1px solid ${T.border}`, background:T.inputBg, cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center", color:T.textSub }}>⚙</button>
          <button onClick={()=>setShowAdd(true)} style={{ height:36, padding:"0 16px", borderRadius:9, border:"none", background:T.accent, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:700, color:T.accentFg, display:"flex", alignItems:"center", gap:6 }}>
            + New Task
          </button>
        </div>
      </div>

      {/* NAV */}
      <div style={{ display:"flex", gap:2, padding:"0 24px", borderBottom:`1px solid ${T.border}`, background:T.topbar }}>
        {navViews.map(([v,l])=>(
          <button key={v} onClick={()=>setView(v)} style={{ padding:"12px 18px 11px", border:"none", cursor:"pointer", background:"none", fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:view===v?700:400, color:view===v?T.accent:T.textSub, borderBottom:view===v?`2px solid ${T.accent}`:"2px solid transparent", transition:"all 0.15s", whiteSpace:"nowrap" }}>
            {l}
          </button>
        ))}
      </div>

      <div style={{ padding:"20px 24px" }}>

        {/* STATS */}
        <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap" }}>
          {[
            { label:"Open",     value:activeTasks.length,  color:"#E8A838" },
            { label:"Complete", value:`${compRate}%`,      color:"#3DBF8A" },
            { label:"Streaks",  value:tasks.filter(t=>t.type==="habit"&&t.streak>0).reduce((a,t)=>a+t.streak,0), color:"#9B6EE8" },
            { label:"Done",     value:doneTasks.length,    color:"#3B9EDB" },
          ].map(s=>(
            <div key={s.label} style={cardBase({ padding:"14px 20px", flex:"1 1 110px", borderLeft:`3px solid ${s.color}` })}>
              <div style={{ fontSize:26, fontWeight:700, color:T.text, lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:11, fontWeight:600, color:T.textSub, marginTop:4, textTransform:"uppercase", letterSpacing:"0.08em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── BOARD ── */}
        {view==="board" && (
          <>
            {/* Section filter */}
            <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:16 }}>
              <button onClick={()=>setFilter(null)} style={{ padding:"5px 14px", borderRadius:20, cursor:"pointer", fontSize:13, fontFamily:"'DM Sans',sans-serif", fontWeight:500, border:"none", background:!filter?T.accent:"transparent", color:!filter?T.accentFg:T.textSub, outline:!filter?"none":`1px solid ${T.border}`, transition:"all 0.15s" }}>All</button>
              {SECTIONS.map(s=>(
                <button key={s.id} onClick={()=>setFilter(filter===s.id?null:s.id)} style={{ padding:"5px 14px", borderRadius:20, cursor:"pointer", fontSize:13, fontFamily:"'DM Sans',sans-serif", fontWeight:500, border:"none", background:filter===s.id?s.color:"transparent", color:filter===s.id?"#fff":T.textSub, outline:filter===s.id?"none":`1px solid ${T.border}`, transition:"all 0.15s", whiteSpace:"nowrap" }}>
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>

            {/* Board label */}
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
              <div style={{ width:30, height:30, borderRadius:"50%", background:(activeUser==="A"?"#E8A838":"#E84E8A")+"22", border:`2px solid ${activeUser==="A"?"#E8A838":"#E84E8A"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:activeUser==="A"?"#E8A838":"#E84E8A" }}>
                {names[activeUser][0]}
              </div>
              <span style={{ fontFamily:"'DM Serif Display',serif", fontSize:19, color:T.text }}>{names[activeUser]}'s Board</span>
              <span style={{ fontSize:12, color:T.textSub }}>· drag tasks between cards to move them</span>
            </div>

            {/* Grid */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:14, alignItems:"start" }}>
              {gridCols.map(c => <GridCard key={c.colId} {...c} />)}
            </div>
          </>
        )}

        {/* ── TODAY ── */}
        {view==="today" && (
          <div style={{ maxWidth:680 }}>
            <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:28, color:T.text, marginBottom:4 }}>Today's Focus</div>
            <div style={{ fontSize:14, color:T.textSub, marginBottom:24 }}>
              {new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})} · {names[activeUser]}
            </div>
            {["High","Medium","Low"].map(p=>{
              const pt = activeTasks.filter(t=>t.priority===p&&(t.assignee===activeUser||t.assignee==="both"));
              if (!pt.length) return null;
              const pc = PRI_COLOR[p];
              return (
                <div key={p} style={{ marginBottom:22 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:pc }}/>
                    <span style={{ fontSize:12, fontWeight:700, color:pc, textTransform:"uppercase", letterSpacing:"0.1em" }}>{p} Priority</span>
                    <span style={{ fontSize:12, color:T.textMuted }}>· {pt.length} task{pt.length!==1?"s":""}</span>
                  </div>
                  <div style={cardBase({ padding:"8px 12px" })}>
                    {pt.map(t=><TaskPill key={t.id} t={t} showSec/>)}
                  </div>
                </div>
              );
            })}
            {activeTasks.filter(t=>t.assignee===activeUser||t.assignee==="both").length===0&&(
              <div style={cardBase({ padding:"44px 20px", textAlign:"center" })}>
                <div style={{ fontSize:32, marginBottom:10 }}>🎉</div>
                <div style={{ fontSize:16, fontWeight:600, color:T.text }}>All caught up!</div>
                <div style={{ fontSize:14, color:T.textSub, marginTop:4 }}>Nothing left for today. Great work!</div>
              </div>
            )}
          </div>
        )}

        {/* ── ACCOUNTABILITY ── */}
        {view==="accountability" && (
          <div>
            <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:28, color:T.text, marginBottom:4 }}>Accountability</div>
            <div style={{ fontSize:14, color:T.textSub, marginBottom:24 }}>{names.A} & {names.B} · Growing Together</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:14, marginBottom:14 }}>
              {["A","B"].map(u=>{
                const ut  = tasks.filter(t=>t.assignee===u||t.assignee==="both");
                const ud  = ut.filter(t=>t.done).length;
                const uc  = u==="A"?"#E8A838":"#E84E8A";
                const pct = ut.length?Math.round((ud/ut.length)*100):0;
                return (
                  <div key={u} style={cardBase({ padding:"20px 22px" })}>
                    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                      <div style={{ width:42, height:42, borderRadius:"50%", background:uc+"20", border:`2px solid ${uc}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, color:uc, fontWeight:700 }}>{names[u][0]}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:16, fontWeight:700, color:T.text }}>{names[u]}</div>
                        <div style={{ fontSize:12, color:T.textSub, marginTop:2 }}>{ud}/{ut.length} done · {ut.filter(t=>t.type==="habit"&&t.streak>0).length} habits</div>
                      </div>
                      <div style={{ fontSize:22, fontWeight:700, color:uc }}>{pct}%</div>
                    </div>
                    <div style={{ height:5, background:T.inputBg, borderRadius:5, marginBottom:14, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${pct}%`, background:uc, borderRadius:5, transition:"width 0.4s" }}/>
                    </div>
                    <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:12 }}>
                      {SECTIONS.map(s=>{ const n=tasks.filter(t=>t.section===s.id&&(t.assignee===u||t.assignee==="both")).length; return n?<span key={s.id} style={{ fontSize:11, padding:"2px 8px", borderRadius:5, background:s.color+"20", color:s.color, fontWeight:600 }}>{s.emoji} {n}</span>:null; })}
                    </div>
                    <div style={{ maxHeight:200, overflowY:"auto" }}>
                      {ut.filter(t=>!t.done).map(t=><TaskPill key={t.id} t={t} showSec/>)}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={cardBase({ padding:"20px 22px" })}>
              <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:14 }}>
                <span style={{ fontSize:18 }}>♡</span>
                <span style={{ fontSize:15, fontWeight:700, color:T.text }}>Shared Goals</span>
                <span style={{ fontSize:12, color:T.textSub }}>· {tasks.filter(t=>t.assignee==="both"&&!t.done).length} active</span>
              </div>
              {tasks.filter(t=>t.assignee==="both"&&!t.done).length===0
                ?<div style={{ fontSize:13, color:T.textMuted, fontStyle:"italic" }}>No shared tasks yet — add one!</div>
                :tasks.filter(t=>t.assignee==="both"&&!t.done).map(t=><TaskPill key={t.id} t={t} showSec/>)
              }
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAdd && <FormModal data={newTask} setData={setNew} onSave={doAdd} onClose={()=>{setShowAdd(false);setAddSec(null);}} title="New Task"/>}
      {editTask && <FormModal data={editTask} setData={setEdit} onSave={saveEdit} onClose={()=>setEdit(null)} title="Edit Task"/>}

      {/* Settings */}
      {showSett && (
        <div style={{ position:"fixed", inset:0, zIndex:30, background:"rgba(0,0,0,0.55)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
          onClick={e=>e.target===e.currentTarget&&setShowSett(false)}>
          <div style={cardBase({ padding:"28px 30px", width:"100%", maxWidth:420 })}>
            <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:22, color:T.text, marginBottom:4 }}>Settings</div>
            <div style={{ height:2, width:40, background:T.accent, borderRadius:2, marginBottom:20 }}/>
            <div style={{ fontSize:13, color:T.textSub, marginBottom:18, lineHeight:1.7, background:T.inputBg, border:`1px solid ${T.border}`, borderRadius:9, padding:"11px 14px" }}>
              <strong style={{ color:"#3DBF8A" }}>🔄 Syncing via Supabase.</strong> Both of you run the app independently — changes sync every 4 seconds. Light/dark mode also syncs.
            </div>
            <label style={lblStyle}>Partner A Name</label>
            <input style={inpStyle} value={names.A} onChange={e=>setNames({...names,A:e.target.value})} placeholder="Name"/>
            <label style={lblStyle}>Partner B Name</label>
            <input style={inpStyle} value={names.B} onChange={e=>setNames({...names,B:e.target.value})} placeholder="Name"/>
            <div style={{ display:"flex", gap:10, marginTop:22, justifyContent:"flex-end" }}>
              <button style={btnStyle(true)} onClick={()=>setShowSett(false)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
