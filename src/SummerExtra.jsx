import { useState, useEffect, useRef } from "react";

// ── Workout plan data ─────────────────────────────────────────────────────────
const GYM_PLAN = [
  { day:"Day 1", label:"Chest & Triceps", icon:"💪", color:"#E8704A", sections:[
    { name:"CHEST", exercises:[
      {name:"Bench Press",sets:4,reps:"6-8",target:"225 lbs",superset:null},
      {name:"Incline DB Press",sets:4,reps:"6-8",target:"80 lb DBs",superset:null},
      {name:"Fly",sets:4,reps:"10",target:"45 lb DBs",superset:"Champagne Press"},
      {name:"Weighted Dip",sets:3,reps:"10",target:"2 plates",superset:"Weighted Push-ups"},
    ]},
    { name:"TRICEPS", exercises:[
      {name:"Skull Crusher",sets:4,reps:"12",target:"85 lbs",superset:null},
      {name:"Overhead Tricep Press",sets:4,reps:"10",target:"57.5 lbs",superset:"Tricep Rope Pulldown"},
    ]},
    { name:"FINISHER", exercises:[
      {name:"Hanging Leg Raise",sets:3,reps:"15",target:"BW",superset:null},
      {name:"Calf Raises",sets:3,reps:"20",target:"2 plates",superset:null},
    ]},
  ]},
  { day:"Day 2", label:"Back & Biceps", icon:"🦾", color:"#3B9EDB", sections:[
    { name:"BACK", exercises:[
      {name:"Lat Pulldown",sets:4,reps:"6",target:"190 lbs",superset:"Pull-overs 110 lbs"},
      {name:"Bent Over Row",sets:4,reps:"12",target:"135 lbs",superset:"Single Arm Row"},
      {name:"Barbell Shrug",sets:3,reps:"10",target:"185 lbs",superset:"DB Shrug 80 lbs"},
      {name:"Reverse Fly",sets:3,reps:"15",target:"25 lb DBs",superset:"Curl-ups"},
    ]},
    { name:"BICEPS", exercises:[
      {name:"Straight Bar Curl",sets:3,reps:"15",target:"85 lbs",superset:"Spider Curl"},
      {name:"Heavy Hammer Curl",sets:3,reps:"8",target:"40-50 lb DBs",superset:null},
      {name:"Preacher Curl",sets:5,reps:"12",target:"80 lbs",superset:"One-Arm Strict Curl"},
    ]},
    { name:"FINISHER", exercises:[
      {name:"Abs of choice",sets:3,reps:"15",target:"BW",superset:null},
      {name:"Dips",sets:3,reps:"12",target:"BW",superset:null},
    ]},
  ]},
  { day:"Day 3", label:"Legs (Quads) & Triceps", icon:"🦵", color:"#9B6EE8", sections:[
    { name:"LEGS", exercises:[
      {name:"Squat",sets:4,reps:"6",target:"315 lbs",superset:null},
      {name:"Leg Extension",sets:4,reps:"12",target:"235 lbs Drop Set",superset:null},
      {name:"Goblet Squat",sets:4,reps:"12",target:"90 lb DB",superset:"Calf Raises"},
    ]},
    { name:"TRICEPS", exercises:[
      {name:"Skull Crusher",sets:4,reps:"12",target:"85 lbs",superset:null},
      {name:"Overhead Tricep Press",sets:4,reps:"10",target:"130 lbs",superset:"Tricep Rope Pulldown"},
    ]},
    { name:"FINISHER", exercises:[
      {name:"Weighted Push-ups",sets:3,reps:"10",target:"1 plate",superset:null},
      {name:"Abs of choice",sets:3,reps:"15",target:"BW",superset:null},
    ]},
  ]},
  { day:"Day 4", label:"Chest & Shoulders", icon:"🏋", color:"#E8A838", sections:[
    { name:"CHEST", exercises:[
      {name:"Bench Press",sets:4,reps:"8-10",target:"225 lbs",superset:null},
      {name:"Incline DB Press",sets:4,reps:"8-10",target:"80 lb DBs",superset:null},
      {name:"Fly",sets:4,reps:"15",target:"55 lb DBs",superset:"Champagne Press"},
      {name:"Weighted Dip",sets:3,reps:"10",target:"2 plates",superset:"Weighted Push-ups"},
    ]},
    { name:"SHOULDERS", exercises:[
      {name:"Push Press",sets:4,reps:"10",target:"95+ lbs",superset:"Lateral Raise"},
      {name:"Seated Arnold Press",sets:4,reps:"12",target:"55 lb DBs",superset:"Bent-Over Lateral Raise"},
      {name:"Frontal Raise",sets:3,reps:"10",target:"45 lbs",superset:null},
      {name:"High Pull",sets:4,reps:"12",target:"Varies",superset:"Face Pull"},
    ]},
    { name:"FINISHER", exercises:[
      {name:"Abs of choice",sets:3,reps:"15",target:"BW",superset:null},
      {name:"Weighted Dips",sets:3,reps:"10",target:"2 plates",superset:null},
    ]},
  ]},
  { day:"Day 5", label:"Biceps & Triceps", icon:"💥", color:"#3DBF8A", sections:[
    { name:"BICEPS", exercises:[
      {name:"Straight Bar Curl",sets:3,reps:"15",target:"85 lbs",superset:"Spider Curl"},
      {name:"Heavy Hammer Curl",sets:3,reps:"8",target:"45-55 lb DBs",superset:null},
      {name:"Preacher Curl",sets:5,reps:"12",target:"80 lbs",superset:"One-Arm Strict Curl"},
    ]},
    { name:"TRICEPS", exercises:[
      {name:"Skull Crusher",sets:4,reps:"12",target:"85 lbs",superset:null},
      {name:"Overhead Tricep Press",sets:4,reps:"10",target:"130 lbs",superset:"Tricep Rope Pulldown"},
    ]},
    { name:"FINISHER", exercises:[
      {name:"Abs of choice",sets:3,reps:"15",target:"BW",superset:null},
      {name:"Weighted Dips",sets:3,reps:"10",target:"2 plates",superset:null},
    ]},
  ]},
  { day:"Day 6", label:"Legs (Hamstrings)", icon:"🦿", color:"#20B2AA", sections:[
    { name:"LEGS", exercises:[
      {name:"Leg Press",sets:4,reps:"10",target:"8-12 plates",superset:null},
      {name:"RDLs",sets:3,reps:"12",target:"225 lbs",superset:null},
      {name:"Deadlift",sets:3,reps:"5",target:"405 lbs",superset:null},
    ]},
    { name:"FINISHER", exercises:[
      {name:"Abs x2",sets:4,reps:"15",target:"BW",superset:null},
      {name:"Weighted Push-ups + Dips",sets:3,reps:"10",target:"1 plate",superset:null},
    ]},
  ]},
  { day:"HIIT A", label:"Sprint & Power", icon:"⚡", color:"#E84E8A", sections:[
    { name:"WARM-UP", exercises:[
      {name:"Jump Rope",sets:1,reps:"3 min",target:"BW",superset:null},
      {name:"Dynamic Stretches",sets:1,reps:"2 min",target:"BW",superset:null},
    ]},
    { name:"CIRCUITS (3 rounds)", exercises:[
      {name:"Treadmill Sprints",sets:10,reps:"30s on / 30s off",target:"Max speed",superset:null},
      {name:"Box Jumps",sets:3,reps:"10",target:"BW",superset:null},
      {name:"Burpees",sets:3,reps:"15",target:"BW",superset:null},
      {name:"Battle Ropes",sets:4,reps:"30s",target:"BW",superset:null},
    ]},
    { name:"CORE", exercises:[
      {name:"Hanging Leg Raise",sets:3,reps:"15",target:"BW",superset:null},
      {name:"Plank",sets:3,reps:"60s",target:"BW",superset:null},
    ]},
  ]},
  { day:"HIIT B", label:"Tabata Conditioning", icon:"🔥", color:"#E8704A", sections:[
    { name:"TABATA (20s on / 10s off × 8 rounds)", exercises:[
      {name:"Jump Squats",sets:8,reps:"20s",target:"BW",superset:null},
      {name:"Push-up Variations",sets:8,reps:"20s",target:"BW",superset:null},
      {name:"Mountain Climbers",sets:8,reps:"20s",target:"BW",superset:null},
      {name:"Kettlebell Swings",sets:8,reps:"20s",target:"35-55 lbs",superset:null},
    ]},
    { name:"CARDIO", exercises:[
      {name:"Bike Intervals",sets:6,reps:"1 min hard / 1 min easy",target:"BW",superset:null},
      {name:"Rowing",sets:4,reps:"500m",target:"BW",superset:null},
    ]},
  ]},
];

// ── Rest Timer ────────────────────────────────────────────────────────────────
function RestTimer({ color }) {
  const [secs, setSecs] = useState(90);
  const [running, setRunning] = useState(false);
  const [preset, setPreset] = useState(90);
  const ref = useRef(null);

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => {
        setSecs(s => {
          if (s <= 1) { clearInterval(ref.current); setRunning(false); return 0; }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(ref.current);
  }, [running]);

  const pct = Math.round((secs / preset) * 100);
  const m = Math.floor(secs / 60);
  const s = secs % 60;

  return (
    <div style={{ background:"rgba(0,0,0,0.25)",borderRadius:14,padding:"14px 16px",marginBottom:14 }}>
      <div style={{ fontSize:11,fontWeight:700,color:color,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10 }}>Rest Timer</div>
      <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:10 }}>
        <div style={{ position:"relative",width:64,height:64,flexShrink:0 }}>
          <svg width="64" height="64" style={{ transform:"rotate(-90deg)" }}>
            <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5"/>
            <circle cx="32" cy="32" r="28" fill="none" stroke={color} strokeWidth="5"
              strokeDasharray={`${2*Math.PI*28}`}
              strokeDashoffset={`${2*Math.PI*28*(1-pct/100)}`}
              style={{ transition:"stroke-dashoffset 1s linear" }}/>
          </svg>
          <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800,color:"#fff" }}>{m}:{String(s).padStart(2,"0")}</div>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex",gap:5,marginBottom:6 }}>
            {[60,90,120,180].map(t => (
              <button key={t} onClick={() => { setPreset(t); setSecs(t); setRunning(false); }}
                style={{ flex:1,padding:"5px 2px",borderRadius:7,border:`1px solid ${preset===t?color:"rgba(255,255,255,0.1)"}`,background:preset===t?color+"30":"transparent",color:preset===t?color:"#666",fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,cursor:"pointer" }}>
                {t}s
              </button>
            ))}
          </div>
          <div style={{ display:"flex",gap:6 }}>
            <button onClick={() => { setSecs(preset); setRunning(true); }}
              style={{ flex:1,padding:"8px",borderRadius:8,border:"none",background:color,color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,cursor:"pointer" }}>
              {running ? "Restart" : "Start"}
            </button>
            <button onClick={() => { setRunning(false); setSecs(preset); }}
              style={{ padding:"8px 12px",borderRadius:8,border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"#888",fontFamily:"'DM Sans',sans-serif",fontSize:12,cursor:"pointer" }}>
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Active Workout Mode ───────────────────────────────────────────────────────
function ActiveWorkout({ day, onExit }) {
  const allExercises = day.sections.flatMap(s => s.exercises.map(e => ({ ...e, section: s.name })));
  const [exIdx, setExIdx] = useState(0);
  const [setIdx, setSetIdx] = useState(0);
  const [logs, setLogs] = useState({});
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");

  const ex = allExercises[exIdx];
  const done = exIdx >= allExercises.length;

  function logSet() {
    const key = `${exIdx}-${setIdx}`;
    setLogs(p => ({ ...p, [key]: { weight, reps } }));
    if (setIdx + 1 < ex.sets) { setSetIdx(s => s + 1); }
    else if (exIdx + 1 < allExercises.length) { setExIdx(i => i + 1); setSetIdx(0); }
    else { setExIdx(allExercises.length); }
    setWeight(""); setReps("");
  }

  const ytUrl = ex ? `https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + " form tutorial")}` : "";

  if (done) return (
    <div style={{ padding:"40px 20px",textAlign:"center" }}>
      <div style={{ fontSize:48,marginBottom:12 }}>🏆</div>
      <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:24,color:"#3DBF8A",marginBottom:8 }}>Workout Complete!</div>
      <div style={{ fontSize:14,color:"#888",marginBottom:24 }}>Great work today. Rest, eat, recover.</div>
      <button onClick={onExit} style={{ padding:"12px 28px",borderRadius:12,border:"none",background:"#3DBF8A",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:15,fontWeight:700,cursor:"pointer" }}>Done</button>
    </div>
  );

  return (
    <div style={{ padding:"0 0 100px" }}>
      {/* Header */}
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,padding:"0 4px" }}>
        <div>
          <div style={{ fontSize:11,color:day.color,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em" }}>{ex.section}</div>
          <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:22,color:"#fff" }}>{ex.name}</div>
        </div>
        <button onClick={onExit} style={{ background:"rgba(255,255,255,0.08)",border:"none",color:"#888",cursor:"pointer",fontSize:13,padding:"6px 12px",borderRadius:8,fontFamily:"'DM Sans',sans-serif" }}>✕ Exit</button>
      </div>

      {/* Progress bar */}
      <div style={{ height:4,background:"rgba(255,255,255,0.08)",borderRadius:4,overflow:"hidden",marginBottom:16 }}>
        <div style={{ height:"100%",width:`${Math.round((exIdx/allExercises.length)*100)}%`,background:day.color,borderRadius:4,transition:"width 0.4s" }}/>
      </div>
      <div style={{ fontSize:12,color:"#555",marginBottom:20,textAlign:"center" }}>Exercise {exIdx+1} of {allExercises.length} · Set {setIdx+1} of {ex.sets}</div>

      {/* Exercise card */}
      <div style={{ background:"rgba(255,255,255,0.04)",border:`1px solid ${day.color}44`,borderRadius:16,padding:"20px",marginBottom:14 }}>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16 }}>
          {[{l:"Sets",v:`${setIdx+1}/${ex.sets}`},{l:"Target Reps",v:ex.reps},{l:"Target Weight",v:ex.target}].map(s=>(
            <div key={s.l} style={{ background:"rgba(0,0,0,0.3)",borderRadius:10,padding:"10px",textAlign:"center" }}>
              <div style={{ fontSize:18,fontWeight:800,color:day.color,lineHeight:1 }}>{s.v}</div>
              <div style={{ fontSize:10,color:"#555",marginTop:3,textTransform:"uppercase",letterSpacing:"0.06em" }}>{s.l}</div>
            </div>
          ))}
        </div>
        {ex.superset && <div style={{ fontSize:12,color:"#9B6EE8",fontWeight:600,marginBottom:12 }}>⟲ Superset with: {ex.superset}</div>}

        {/* Log actual weight + reps */}
        <div style={{ display:"flex",gap:8,marginBottom:12 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4 }}>Actual Weight</div>
            <input value={weight} onChange={e=>setWeight(e.target.value)} placeholder={ex.target}
              style={{ width:"100%",background:"rgba(255,255,255,0.07)",border:`1px solid ${day.color}55`,borderRadius:9,padding:"10px 12px",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:14,outline:"none",boxSizing:"border-box" }}/>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4 }}>Actual Reps</div>
            <input value={reps} onChange={e=>setReps(e.target.value)} placeholder={ex.reps}
              style={{ width:"100%",background:"rgba(255,255,255,0.07)",border:`1px solid ${day.color}55`,borderRadius:9,padding:"10px 12px",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:14,outline:"none",boxSizing:"border-box" }}/>
          </div>
        </div>

        <button onClick={logSet}
          style={{ width:"100%",padding:"14px",borderRadius:12,border:"none",background:day.color,color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:16,fontWeight:700,cursor:"pointer" }}>
          ✓ Log Set {setIdx+1}
        </button>
      </div>

      {/* Rest Timer */}
      <RestTimer color={day.color}/>

      {/* YouTube tutorial link */}
      <a href={ytUrl} target="_blank" rel="noreferrer"
        style={{ display:"flex",alignItems:"center",gap:10,background:"rgba(255,0,0,0.1)",border:"1px solid rgba(255,0,0,0.25)",borderRadius:12,padding:"12px 16px",textDecoration:"none",marginBottom:14 }}>
        <div style={{ width:32,height:32,background:"#FF0000",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0 }}>▶</div>
        <div>
          <div style={{ fontSize:13,fontWeight:700,color:"#FF4444" }}>Watch Tutorial on YouTube</div>
          <div style={{ fontSize:11,color:"#555",marginTop:1 }}>{ex.name} — form &amp; technique</div>
        </div>
      </a>

      {/* Completed sets for this exercise */}
      {Object.entries(logs).filter(([k])=>k.startsWith(`${exIdx}-`)).length>0&&(
        <div style={{ background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"12px 14px" }}>
          <div style={{ fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:8 }}>Logged Sets</div>
          {Object.entries(logs).filter(([k])=>k.startsWith(`${exIdx}-`)).map(([k,v])=>(
            <div key={k} style={{ display:"flex",justifyContent:"space-between",fontSize:13,color:"#3DBF8A",padding:"3px 0" }}>
              <span>Set {parseInt(k.split("-")[1])+1}</span>
              <span>{v.weight||ex.target} × {v.reps||ex.reps} ✓</span>
            </div>
          ))}
        </div>
      )}

      {/* Navigation */}
      <div style={{ display:"flex",gap:8,marginTop:14 }}>
        {exIdx>0&&<button onClick={()=>{ setExIdx(i=>i-1); setSetIdx(0); }} style={{ flex:1,padding:"10px",borderRadius:10,border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"#888",fontFamily:"'DM Sans',sans-serif",fontSize:13,cursor:"pointer" }}>← Back</button>}
        <button onClick={()=>{ if(exIdx+1<allExercises.length){setExIdx(i=>i+1);setSetIdx(0);}else{setExIdx(allExercises.length);} }}
          style={{ flex:1,padding:"10px",borderRadius:10,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.05)",color:"#888",fontFamily:"'DM Sans',sans-serif",fontSize:13,cursor:"pointer" }}>
          Skip →
        </button>
      </div>
    </div>
  );
}

// ── GymView ───────────────────────────────────────────────────────────────────
export function GymView({ T, data, save, today, isMobile }) {
  const [gymDay, setGymDay] = useState(0);
  const [gymTab, setGymTab] = useState("plan");
  const [activeWorkout, setActiveWorkout] = useState(false);
  const [gwf, setGwf] = useState({ weight:"", sessions:"", prs:"", nutrition:5, notes:"" });

  const thisMonday = (()=>{ const d=new Date(); d.setDate(d.getDate()-((d.getDay()+6)%7)); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; })();
  const gymWeekly = data.gymWeekly||[];
  const cs = (ex={}) => ({ background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,boxShadow:"0 2px 10px rgba(0,0,0,0.08)",...ex });
  const inp = { width:"100%",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:9,padding:"9px 12px",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:14,outline:"none",boxSizing:"border-box" };
  const lbl = { fontSize:11,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",color:T.textMuted,display:"block",marginBottom:4,marginTop:10,fontFamily:"'DM Sans',sans-serif" };

  if (activeWorkout) return (
    <div style={{ background:"#0d0f14",minHeight:"100vh",padding:"20px 16px",fontFamily:"'DM Sans',sans-serif" }}>
      <ActiveWorkout day={GYM_PLAN[gymDay]} onExit={()=>setActiveWorkout(false)}/>
    </div>
  );

  const currentDay = GYM_PLAN[gymDay];

  return (
    <div>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:8 }}>
        <div>
          <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:isMobile?20:26,color:"#E8704A",marginBottom:2 }}>🏋 Gym</div>
          <div style={{ fontSize:12,color:T.textSub }}>6-Day Split + HIIT · Active workout mode available</div>
        </div>
        <div style={{ display:"flex",gap:6 }}>
          {["plan","weekly"].map(t=>(
            <button key={t} onClick={()=>setGymTab(t)}
              style={{ padding:"6px 12px",borderRadius:20,border:`1px solid ${gymTab===t?"#E8704A":T.border}`,background:gymTab===t?"#E8704A20":"transparent",color:gymTab===t?"#E8704A":T.textSub,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:gymTab===t?700:400,cursor:"pointer" }}>
              {t==="plan"?"📋 Plan":"📊 Log"}
            </button>
          ))}
        </div>
      </div>

      {gymTab==="plan"&&(
        <div>
          {/* Day tabs */}
          <div style={{ display:"flex",gap:6,overflowX:"auto",paddingBottom:6,marginBottom:14,scrollbarWidth:"none" }}>
            {GYM_PLAN.map((d,i)=>(
              <button key={i} onClick={()=>setGymDay(i)}
                style={{ flexShrink:0,padding:"7px 12px",borderRadius:20,border:`1px solid ${gymDay===i?d.color:T.border}`,background:gymDay===i?d.color+"20":"transparent",color:gymDay===i?d.color:T.textSub,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:gymDay===i?700:400,cursor:"pointer",whiteSpace:"nowrap" }}>
                {d.icon} {d.day}
              </button>
            ))}
          </div>

          {/* Day header */}
          <div style={{ background:currentDay.color+"15",border:`1px solid ${currentDay.color}33`,borderRadius:14,padding:"14px 16px",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap" }}>
            <div>
              <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:18,color:currentDay.color }}>{currentDay.icon} {currentDay.day}: {currentDay.label}</div>
              {currentDay.day.startsWith("HIIT")&&<div style={{ fontSize:12,color:T.textSub,marginTop:3 }}>High-intensity conditioning day</div>}
            </div>
            <button onClick={()=>setActiveWorkout(true)}
              style={{ padding:"10px 18px",borderRadius:10,border:"none",background:currentDay.color,color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap" }}>
              ▶ Start Workout
            </button>
          </div>

          {/* Sections */}
          {currentDay.sections.map((sec,si)=>(
            <div key={si} style={{ ...cs({padding:"14px 16px"}),marginBottom:10 }}>
              <div style={{ fontSize:11,fontWeight:700,color:currentDay.color,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10 }}>{sec.name}</div>
              {sec.exercises.map((ex,ei)=>(
                <div key={ei} style={{ borderBottom:ei<sec.exercises.length-1?`1px solid ${T.border}`:"none",paddingBottom:10,marginBottom:10 }}>
                  <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14,fontWeight:600,color:T.text }}>{ex.name}</div>
                      <div style={{ fontSize:12,color:T.textSub,marginTop:2 }}>{ex.sets} sets × {ex.reps} · <span style={{ color:currentDay.color,fontWeight:600 }}>{ex.target}</span></div>
                      {ex.superset&&<div style={{ fontSize:11,color:"#9B6EE8",marginTop:2,fontWeight:600 }}>⟲ Superset: {ex.superset}</div>}
                    </div>
                    <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name+" form tutorial")}`} target="_blank" rel="noreferrer"
                      style={{ flexShrink:0,width:28,height:28,borderRadius:7,background:"rgba(255,0,0,0.12)",border:"1px solid rgba(255,0,0,0.2)",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",fontSize:13,color:"#FF4444" }}>
                      ▶
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {gymTab==="weekly"&&(
        <div>
          <div style={{ ...cs({padding:"16px 18px"}),marginBottom:14 }}>
            <div style={{ fontSize:14,fontWeight:700,color:T.text,marginBottom:12 }}>📝 Week of {thisMonday}</div>
            {[{l:"Body Weight (lbs)",k:"weight",ph:"e.g. 205"},{l:"Gym Sessions This Week",k:"sessions",ph:"e.g. 5"},{l:"New PRs (describe them)",k:"prs",ph:"e.g. Bench 250 lbs, Squat 315×5 clean"}].map(f=>(
              <div key={f.k} style={{ marginBottom:10 }}>
                <label style={lbl}>{f.l}</label>
                <input style={inp} value={gwf[f.k]||""} onChange={e=>setGwf(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph}/>
              </div>
            ))}
            <label style={lbl}>Nutrition Compliance (1–5)</label>
            <div style={{ display:"flex",gap:6,marginBottom:10 }}>
              {[1,2,3,4,5].map(n=>(
                <button key={n} onClick={()=>setGwf(p=>({...p,nutrition:n}))}
                  style={{ flex:1,padding:"9px",borderRadius:9,border:`2px solid ${gwf.nutrition>=n?"#3DBF8A":T.border}`,background:gwf.nutrition>=n?"#3DBF8A15":"transparent",color:gwf.nutrition>=n?"#3DBF8A":T.textSub,fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:700,cursor:"pointer" }}>
                  {n}
                </button>
              ))}
            </div>
            <label style={lbl}>Notes / How You Felt</label>
            <input style={inp} value={gwf.notes||""} onChange={e=>setGwf(p=>({...p,notes:e.target.value}))} placeholder="Sleep quality, energy levels, injuries, wins..."/>
            <button onClick={()=>{
              if(!gwf.weight&&!gwf.sessions) return;
              const entry={...gwf,week:thisMonday,id:"gw"+Date.now().toString(36)};
              save(p=>({...p,gymWeekly:[...(p.gymWeekly||[]).filter(w=>w.week!==thisMonday),entry]}));
              setGwf({weight:"",sessions:"",prs:"",nutrition:5,notes:""});
            }} style={{ width:"100%",marginTop:14,padding:"12px",borderRadius:10,border:"none",background:"#E8704A",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:700,cursor:"pointer" }}>
              Save Week
            </button>
          </div>

          {gymWeekly.length>0&&(
            <div>
              <div style={{ fontSize:11,fontWeight:700,color:T.textSub,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.07em" }}>History</div>
              {[...gymWeekly].sort((a,b)=>b.week.localeCompare(a.week)).slice(0,8).map(w=>(
                <div key={w.id||w.week} style={{ ...cs({padding:"14px 16px"}),marginBottom:10 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
                    <div style={{ fontSize:13,fontWeight:700,color:T.text }}>Week of {w.week}</div>
                    <button onClick={()=>save(p=>({...p,gymWeekly:(p.gymWeekly||[]).filter(x=>(x.id||x.week)!==(w.id||w.week))}))} style={{ background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:14 }}>✕</button>
                  </div>
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8 }}>
                    {w.weight&&<div style={{ background:T.inputBg,borderRadius:8,padding:"8px 10px" }}><div style={{ fontSize:16,fontWeight:800,color:"#E8704A" }}>{w.weight} lbs</div><div style={{ fontSize:10,color:T.textMuted,textTransform:"uppercase" }}>Weight</div></div>}
                    {w.sessions&&<div style={{ background:T.inputBg,borderRadius:8,padding:"8px 10px" }}><div style={{ fontSize:16,fontWeight:800,color:"#3DBF8A" }}>{w.sessions}×</div><div style={{ fontSize:10,color:T.textMuted,textTransform:"uppercase" }}>Sessions</div></div>}
                    {w.nutrition&&<div style={{ background:T.inputBg,borderRadius:8,padding:"8px 10px" }}><div style={{ fontSize:16,fontWeight:800,color:"#E8A838" }}>{w.nutrition}/5</div><div style={{ fontSize:10,color:T.textMuted,textTransform:"uppercase" }}>Nutrition</div></div>}
                  </div>
                  {w.prs&&<div style={{ fontSize:12,color:"#7B61FF",marginTop:8,fontWeight:600 }}>🏆 PRs: {w.prs}</div>}
                  {w.notes&&<div style={{ fontSize:12,color:T.textSub,marginTop:4,fontStyle:"italic" }}>{w.notes}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── SchoolCard ────────────────────────────────────────────────────────────────
function SchoolCard({ school, T, STATUS_COLORS, onEdit, onDelete, onAddProgress, onStatusChange }) {
  const [note, setNote] = useState("");
  const [showLog, setShowLog] = useState(false);
  const c = STATUS_COLORS[school.status]||"#888";
  const cs = (ex={}) => ({ background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,...ex });

  return (
    <div style={{ ...cs(),overflow:"hidden",borderTop:`4px solid ${c}` }}>
      <div style={{ padding:"14px 16px" }}>
        <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,marginBottom:10 }}>
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ fontSize:14,fontWeight:700,color:T.text,lineHeight:1.3 }}>{school.name}</div>
            <div style={{ display:"flex",gap:6,marginTop:5,flexWrap:"wrap" }}>
              <span style={{ fontSize:11,color:c,fontWeight:700,background:c+"15",padding:"2px 8px",borderRadius:8 }}>{school.status}</span>
              <span style={{ fontSize:11,color:"#3B9EDB",fontWeight:600,background:"#3B9EDB15",padding:"2px 8px",borderRadius:8 }}>{school.degree}</span>
              <span style={{ fontSize:11,color:T.textMuted }}>{school.country==="canada"?"🇨🇦":"🇺🇸"}</span>
            </div>
          </div>
          <div style={{ display:"flex",gap:4 }}>
            <button onClick={onEdit} style={{ background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:13,padding:"3px" }}>✎</button>
            <button onClick={onDelete} style={{ background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:13,padding:"3px" }}>✕</button>
          </div>
        </div>

        {school.deadline&&<div style={{ fontSize:12,color:"#E8A838",fontWeight:600,marginBottom:8 }}>📅 Deadline: {school.deadline}</div>}

        {/* Status toggle */}
        <div style={{ display:"flex",gap:4,flexWrap:"wrap",marginBottom:10 }}>
          {["researching","preparing","applied","interview","offer","rejected"].map(st=>(
            <button key={st} onClick={()=>onStatusChange(school.id,st)}
              style={{ padding:"3px 8px",borderRadius:8,border:`1px solid ${school.status===st?(STATUS_COLORS[st]||"#888"):T.border}`,background:school.status===st?(STATUS_COLORS[st]||"#888")+"20":"transparent",color:school.status===st?(STATUS_COLORS[st]||"#888"):T.textMuted,fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:school.status===st?700:400,cursor:"pointer" }}>
              {st}
            </button>
          ))}
        </div>

        {/* Progress log */}
        {(school.progress||[]).length>0&&(
          <div style={{ marginBottom:10 }}>
            <button onClick={()=>setShowLog(p=>!p)} style={{ background:"none",border:"none",color:"#7B61FF",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,padding:0 }}>
              {showLog?"▲":"▼"} {(school.progress||[]).length} progress note{(school.progress||[]).length!==1?"s":""}
            </button>
            {showLog&&[...(school.progress||[])].reverse().slice(0,5).map(p=>(
              <div key={p.id} style={{ display:"flex",gap:8,fontSize:12,padding:"4px 0",borderBottom:`1px solid ${T.border}` }}>
                <span style={{ color:T.textMuted,flexShrink:0 }}>{p.date}</span>
                <span style={{ color:T.text }}>{p.note}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display:"flex",gap:6 }}>
          <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Log progress..." onKeyDown={e=>{ if(e.key==="Enter"&&note){onAddProgress(school.id,note);setNote("");} }}
            style={{ flex:1,background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:8,padding:"7px 10px",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none" }}/>
          <button onClick={()=>{ if(note){onAddProgress(school.id,note);setNote("");} }} style={{ padding:"7px 12px",borderRadius:8,border:"none",background:"#7B61FF",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,cursor:"pointer" }}>+</button>
        </div>
      </div>
    </div>
  );
}

// ── SchoolsView ───────────────────────────────────────────────────────────────
export function SchoolsView({ T, data, save, today, isMobile }) {
  const [tab, setTab] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [sf, setSf] = useState({ name:"",degree:"PhD",country:"usa",status:"researching",deadline:"",notes:"" });

  const STATUS_COLORS = { researching:"#888D9B",preparing:"#E8A838",applied:"#3B9EDB",interview:"#9B6EE8",offer:"#3DBF8A",rejected:"#E84E8A",withdrawn:"#E8704A" };
  const schools = data.schools||[];
  const inp = { width:"100%",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:9,padding:"9px 12px",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:14,outline:"none",boxSizing:"border-box" };
  const lbl = { fontSize:11,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",color:T.textMuted,display:"block",marginBottom:4,marginTop:10,fontFamily:"'DM Sans',sans-serif" };
  const cs = (ex={}) => ({ background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,...ex });

  function saveSchool() {
    if (!sf.name?.trim()) return;
    if (editItem) { save(p=>({...p,schools:(p.schools||[]).map(s=>s.id===editItem.id?{...sf,id:editItem.id}:s)})); }
    else { save(p=>({...p,schools:[...(p.schools||[]),{...sf,id:"sc"+Date.now().toString(36),progress:[]}]})); }
    setShowForm(false); setEditItem(null);
    setSf({name:"",degree:"PhD",country:"usa",status:"researching",deadline:"",notes:""});
  }

  const visible = schools.filter(s=>tab==="all"||s.country===tab);

  return (
    <div>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:8 }}>
        <div>
          <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:isMobile?20:26,color:"#7B61FF",marginBottom:2 }}>🎓 School Applications</div>
          <div style={{ fontSize:12,color:T.textSub }}>PhD &amp; Masters · Canada &amp; USA</div>
        </div>
        <button onClick={()=>{ setSf({name:"",degree:"PhD",country:"usa",status:"researching",deadline:"",notes:""}); setEditItem(null); setShowForm(true); }}
          style={{ padding:"8px 16px",borderRadius:9,border:"none",background:"#7B61FF",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,cursor:"pointer" }}>
          + Add School
        </button>
      </div>

      {schools.length>0&&(
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,110px),1fr))",gap:8,marginBottom:14 }}>
          {[{l:"Total",v:schools.length,c:"#7B61FF"},{l:"Canada",v:schools.filter(s=>s.country==="canada").length,c:"#E84E8A"},{l:"USA",v:schools.filter(s=>s.country==="usa").length,c:"#3B9EDB"},{l:"Offers",v:schools.filter(s=>s.status==="offer").length,c:"#3DBF8A"}].map(s=>(
            <div key={s.l} style={{ ...cs({padding:"12px 14px"}),borderLeft:`3px solid ${s.c}` }}>
              <div style={{ fontSize:20,fontWeight:800,color:T.text }}>{s.v}</div>
              <div style={{ fontSize:10,color:T.textSub,textTransform:"uppercase",letterSpacing:"0.07em" }}>{s.l}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display:"flex",gap:6,marginBottom:14 }}>
        {[["all","All"],["usa","🇺🇸 USA"],["canada","🇨🇦 Canada"]].map(([v,l])=>(
          <button key={v} onClick={()=>setTab(v)} style={{ padding:"6px 14px",borderRadius:20,border:`1px solid ${tab===v?"#7B61FF":T.border}`,background:tab===v?"#7B61FF20":"transparent",color:tab===v?"#7B61FF":T.textSub,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:tab===v?700:400,cursor:"pointer" }}>{l}</button>
        ))}
      </div>

      {visible.length===0?(
        <div style={{ ...cs({padding:"40px 20px"}),textAlign:"center" }}>
          <div style={{ fontSize:40,marginBottom:10 }}>🎓</div>
          <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:18,color:T.text,marginBottom:6 }}>No schools yet</div>
          <button onClick={()=>setShowForm(true)} style={{ padding:"10px 20px",borderRadius:10,border:"none",background:"#7B61FF",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,cursor:"pointer" }}>+ Add First School</button>
        </div>
      ):(
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,300px),1fr))",gap:12 }}>
          {visible.map(s=>(
            <SchoolCard key={s.id} school={s} T={T} STATUS_COLORS={STATUS_COLORS}
              onEdit={()=>{ setSf({...s}); setEditItem(s); setShowForm(true); }}
              onDelete={()=>save(p=>({...p,schools:(p.schools||[]).filter(x=>x.id!==s.id)}))}
              onAddProgress={(id,note)=>save(p=>({...p,schools:(p.schools||[]).map(x=>x.id===id?{...x,progress:[...(x.progress||[]),{date:today,note,id:"p"+Date.now().toString(36)}]}:x)}))}
              onStatusChange={(id,st)=>save(p=>({...p,schools:(p.schools||[]).map(x=>x.id===id?{...x,status:st}:x)}))}
            />
          ))}
        </div>
      )}

      {showForm&&(
        <div style={{ position:"fixed",inset:0,zIndex:50,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center" }} onClick={e=>e.target===e.currentTarget&&setShowForm(false)}>
          <div style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:500,maxHeight:"90vh",overflowY:"auto",padding:"24px 20px 40px" }}>
            <div style={{ width:40,height:4,borderRadius:2,background:T.textMuted,margin:"0 auto 20px",opacity:0.4 }}/>
            <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:20,color:"#7B61FF",marginBottom:14 }}>{editItem?"Edit":"Add"} School</div>
            <label style={lbl}>School Name *</label>
            <input style={inp} value={sf.name||""} onChange={e=>setSf(p=>({...p,name:e.target.value}))} placeholder="e.g. University of Toronto"/>
            <label style={lbl}>Degree</label>
            <div style={{ display:"flex",gap:6,marginBottom:4 }}>
              {["PhD","Masters","Both"].map(d=>(
                <button key={d} onClick={()=>setSf(p=>({...p,degree:d}))} style={{ flex:1,padding:"8px",borderRadius:8,border:`1px solid ${sf.degree===d?"#7B61FF":T.border}`,background:sf.degree===d?"#7B61FF18":"transparent",color:sf.degree===d?"#7B61FF":T.text,fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:sf.degree===d?700:400,cursor:"pointer" }}>{d}</button>
              ))}
            </div>
            <label style={lbl}>Country</label>
            <div style={{ display:"flex",gap:6,marginBottom:4 }}>
              {[["usa","🇺🇸 USA"],["canada","🇨🇦 Canada"],["both","Both"]].map(([v,l])=>(
                <button key={v} onClick={()=>setSf(p=>({...p,country:v}))} style={{ flex:1,padding:"8px",borderRadius:8,border:`1px solid ${sf.country===v?"#7B61FF":T.border}`,background:sf.country===v?"#7B61FF18":"transparent",color:sf.country===v?"#7B61FF":T.text,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:sf.country===v?700:400,cursor:"pointer" }}>{l}</button>
              ))}
            </div>
            <label style={lbl}>Deadline</label>
            <input type="date" style={{ ...inp,background:T.inputBg }} value={sf.deadline||""} onChange={e=>setSf(p=>({...p,deadline:e.target.value}))}/>
            <label style={lbl}>Notes</label>
            <input style={inp} value={sf.notes||""} onChange={e=>setSf(p=>({...p,notes:e.target.value}))} placeholder="Contact, program details, requirements..."/>
            <div style={{ display:"flex",gap:8,marginTop:16 }}>
              <button onClick={()=>setShowForm(false)} style={{ flex:1,padding:"11px",borderRadius:10,border:`1px solid ${T.border}`,background:"transparent",color:T.textSub,fontFamily:"'DM Sans',sans-serif",fontSize:13,cursor:"pointer" }}>Cancel</button>
              <button onClick={saveSchool} style={{ flex:2,padding:"11px",borderRadius:10,border:"none",background:"#7B61FF",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:700,cursor:"pointer" }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── LifeView ──────────────────────────────────────────────────────────────────
export function LifeView({ T, data, save, isMobile }) {
  const [tab, setTab] = useState("helpers");
  const [showHelperForm, setShowHelperForm] = useState(false);
  const [showFamilyForm, setShowFamilyForm] = useState(false);
  const [hf, setHf] = useState({ name:"",how:"",giveBack:"",notes:"" });
  const [ff, setFf] = useState({ name:"",relation:"",goals:"",timeline:"",notes:"" });

  const helpers = data.helpers||[];
  const family = data.family||[];
  const inp = { width:"100%",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:9,padding:"9px 12px",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:14,outline:"none",boxSizing:"border-box" };
  const lbl = { fontSize:11,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",color:T.textMuted,display:"block",marginBottom:4,marginTop:10,fontFamily:"'DM Sans',sans-serif" };
  const cs = (ex={}) => ({ background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,...ex });

  return (
    <div>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:8 }}>
        <div>
          <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:isMobile?20:26,color:"#E84E8A",marginBottom:2 }}>❤ Life & Legacy</div>
          <div style={{ fontSize:12,color:T.textSub }}>People who helped you · Family goals</div>
        </div>
      </div>

      <div style={{ display:"flex",gap:6,marginBottom:16 }}>
        {["helpers","family"].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{ padding:"7px 16px",borderRadius:20,border:`1px solid ${tab===t?"#E84E8A":T.border}`,background:tab===t?"#E84E8A20":"transparent",color:tab===t?"#E84E8A":T.textSub,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:tab===t?700:400,cursor:"pointer" }}>
            {t==="helpers"?"🤝 People Who Helped":"👨‍👩‍👧 Family Goals"}
          </button>
        ))}
      </div>

      {tab==="helpers"&&(
        <div>
          <button onClick={()=>setShowHelperForm(true)} style={{ width:"100%",padding:"11px",borderRadius:10,border:"1px dashed #E84E8A",background:"#E84E8A08",color:"#E84E8A",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,cursor:"pointer",marginBottom:14 }}>+ Add Person Who Helped</button>
          {helpers.length===0&&(
            <div style={{ ...cs({padding:"40px 20px"}),textAlign:"center" }}>
              <div style={{ fontSize:36,marginBottom:10 }}>🤝</div>
              <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:17,color:T.text,marginBottom:6 }}>Document your helpers</div>
              <div style={{ fontSize:13,color:T.textSub,lineHeight:1.6 }}>Record everyone who poured into your life. Track how you will give back.</div>
            </div>
          )}
          {helpers.map(h=>(
            <div key={h.id} style={{ ...cs({padding:"16px 18px"}),marginBottom:10,borderLeft:"4px solid #E84E8A" }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8 }}>
                <div style={{ fontSize:15,fontWeight:700,color:T.text }}>🤝 {h.name}</div>
                <button onClick={()=>save(p=>({...p,helpers:(p.helpers||[]).filter(x=>x.id!==h.id)}))} style={{ background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:14 }}>✕</button>
              </div>
              {h.how&&<div style={{ fontSize:13,color:T.text,lineHeight:1.6,marginBottom:6 }}><span style={{ color:T.textSub,fontWeight:600 }}>How they helped: </span>{h.how}</div>}
              {h.giveBack&&<div style={{ fontSize:13,color:"#3DBF8A",lineHeight:1.6 }}><span style={{ fontWeight:600 }}>Give back: </span>{h.giveBack}</div>}
              {h.notes&&<div style={{ fontSize:12,color:T.textSub,fontStyle:"italic",marginTop:4 }}>{h.notes}</div>}
            </div>
          ))}
          {showHelperForm&&(
            <div style={{ position:"fixed",inset:0,zIndex:50,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center" }} onClick={e=>e.target===e.currentTarget&&setShowHelperForm(false)}>
              <div style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:500,maxHeight:"90vh",overflowY:"auto",padding:"24px 20px 40px" }}>
                <div style={{ width:40,height:4,borderRadius:2,background:T.textMuted,margin:"0 auto 20px",opacity:0.4 }}/>
                <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:20,color:"#E84E8A",marginBottom:14 }}>Add Person Who Helped</div>
                {[{l:"Their Name",k:"name",ph:"e.g. Dr. Adeyemi"},{l:"How They Helped",k:"how",ph:"What did they do for you?"},{l:"How I Will Give Back",k:"giveBack",ph:"What will you do in return?"},{l:"Notes",k:"notes",ph:"Any other context..."}].map(f=>(
                  <div key={f.k} style={{ marginBottom:10 }}>
                    <label style={lbl}>{f.l}</label>
                    <input style={inp} value={hf[f.k]||""} onChange={e=>setHf(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph}/>
                  </div>
                ))}
                <div style={{ display:"flex",gap:8,marginTop:16 }}>
                  <button onClick={()=>setShowHelperForm(false)} style={{ flex:1,padding:"11px",borderRadius:10,border:`1px solid ${T.border}`,background:"transparent",color:T.textSub,fontFamily:"'DM Sans',sans-serif",fontSize:13,cursor:"pointer" }}>Cancel</button>
                  <button onClick={()=>{ if(!hf.name?.trim()) return; save(p=>({...p,helpers:[...(p.helpers||[]),{...hf,id:"h"+Date.now().toString(36)}]})); setHf({name:"",how:"",giveBack:"",notes:""}); setShowHelperForm(false); }} style={{ flex:2,padding:"11px",borderRadius:10,border:"none",background:"#E84E8A",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:700,cursor:"pointer" }}>Save</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab==="family"&&(
        <div>
          <button onClick={()=>setShowFamilyForm(true)} style={{ width:"100%",padding:"11px",borderRadius:10,border:"1px dashed #E8A838",background:"#E8A83808",color:"#E8A838",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,cursor:"pointer",marginBottom:14 }}>+ Add Family Member & Goal</button>
          {family.length===0&&(
            <div style={{ ...cs({padding:"40px 20px"}),textAlign:"center" }}>
              <div style={{ fontSize:36,marginBottom:10 }}>👨‍👩‍👧</div>
              <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:17,color:T.text,marginBottom:6 }}>Document family goals</div>
              <div style={{ fontSize:13,color:T.textSub,lineHeight:1.6 }}>Write what you want to do for your siblings, parents — make it concrete and dated.</div>
            </div>
          )}
          {family.map(f=>(
            <div key={f.id} style={{ ...cs({padding:"16px 18px"}),marginBottom:10,borderLeft:"4px solid #E8A838" }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8 }}>
                <div>
                  <div style={{ fontSize:15,fontWeight:700,color:T.text }}>👤 {f.name}</div>
                  {f.relation&&<div style={{ fontSize:12,color:"#E8A838",fontWeight:600,marginTop:2 }}>{f.relation}</div>}
                </div>
                <button onClick={()=>save(p=>({...p,family:(p.family||[]).filter(x=>x.id!==f.id)}))} style={{ background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:14 }}>✕</button>
              </div>
              {f.goals&&<div style={{ fontSize:13,color:T.text,lineHeight:1.7,background:T.inputBg,borderRadius:8,padding:"10px 12px",marginBottom:6 }}>{f.goals}</div>}
              {f.timeline&&<div style={{ fontSize:12,color:"#3DBF8A",fontWeight:600 }}>🗓 Timeline: {f.timeline}</div>}
              {f.notes&&<div style={{ fontSize:12,color:T.textSub,fontStyle:"italic",marginTop:4 }}>{f.notes}</div>}
            </div>
          ))}
          {showFamilyForm&&(
            <div style={{ position:"fixed",inset:0,zIndex:50,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center" }} onClick={e=>e.target===e.currentTarget&&setShowFamilyForm(false)}>
              <div style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:500,maxHeight:"90vh",overflowY:"auto",padding:"24px 20px 40px" }}>
                <div style={{ width:40,height:4,borderRadius:2,background:T.textMuted,margin:"0 auto 20px",opacity:0.4 }}/>
                <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:20,color:"#E8A838",marginBottom:14 }}>Add Family Goal</div>
                {[{l:"Name",k:"name",ph:"e.g. Mum, Dad, Sister"},{l:"Relation",k:"relation",ph:"e.g. Mother, Brother"},{l:"What I Want To Do For Them",k:"goals",ph:"Get them to the US/Canada, settle with a house, car..."},{l:"Timeline",k:"timeline",ph:"e.g. Within 5 years, by 2027"},{l:"Notes",k:"notes",ph:"Any other context..."}].map(fl=>(
                  <div key={fl.k} style={{ marginBottom:10 }}>
                    <label style={lbl}>{fl.l}</label>
                    <input style={inp} value={ff[fl.k]||""} onChange={e=>setFf(p=>({...p,[fl.k]:e.target.value}))} placeholder={fl.ph}/>
                  </div>
                ))}
                <div style={{ display:"flex",gap:8,marginTop:16 }}>
                  <button onClick={()=>setShowFamilyForm(false)} style={{ flex:1,padding:"11px",borderRadius:10,border:`1px solid ${T.border}`,background:"transparent",color:T.textSub,fontFamily:"'DM Sans',sans-serif",fontSize:13,cursor:"pointer" }}>Cancel</button>
                  <button onClick={()=>{ if(!ff.name?.trim()) return; save(p=>({...p,family:[...(p.family||[]),{...ff,id:"fm"+Date.now().toString(36)}]})); setFf({name:"",relation:"",goals:"",timeline:"",notes:""}); setShowFamilyForm(false); }} style={{ flex:2,padding:"11px",borderRadius:10,border:"none",background:"#E8A838",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:700,cursor:"pointer" }}>Save</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
