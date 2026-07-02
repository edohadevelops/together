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

// ── Exercise Database ─────────────────────────────────────────────────────────
const EXERCISE_DB = [
  // CHEST
  {name:"Bench Press",muscle:"Chest",equip:"Barbell"},{name:"Incline Bench Press",muscle:"Chest",equip:"Barbell"},{name:"Decline Bench Press",muscle:"Chest",equip:"Barbell"},{name:"Dumbbell Fly",muscle:"Chest",equip:"Dumbbell"},{name:"Incline Dumbbell Fly",muscle:"Chest",equip:"Dumbbell"},{name:"Cable Fly",muscle:"Chest",equip:"Cable"},{name:"Low-to-High Cable Fly",muscle:"Chest",equip:"Cable"},{name:"High-to-Low Cable Fly",muscle:"Chest",equip:"Cable"},{name:"Pec Deck",muscle:"Chest",equip:"Machine"},{name:"Push-ups",muscle:"Chest",equip:"Bodyweight"},{name:"Weighted Push-ups",muscle:"Chest",equip:"Bodyweight"},{name:"Wide Push-ups",muscle:"Chest",equip:"Bodyweight"},{name:"Diamond Push-ups",muscle:"Chest",equip:"Bodyweight"},{name:"Dips",muscle:"Chest",equip:"Bodyweight"},{name:"Chest Press Machine",muscle:"Chest",equip:"Machine"},{name:"Smith Machine Bench Press",muscle:"Chest",equip:"Machine"},{name:"Champagne Press",muscle:"Chest",equip:"Dumbbell"},{name:"Landmine Press",muscle:"Chest",equip:"Barbell"},{name:"Svend Press",muscle:"Chest",equip:"Plate"},
  // BACK
  {name:"Deadlift",muscle:"Back",equip:"Barbell"},{name:"Sumo Deadlift",muscle:"Back",equip:"Barbell"},{name:"Trap Bar Deadlift",muscle:"Back",equip:"Barbell"},{name:"Pull-ups",muscle:"Back",equip:"Bodyweight"},{name:"Chin-ups",muscle:"Back",equip:"Bodyweight"},{name:"Weighted Pull-ups",muscle:"Back",equip:"Bodyweight"},{name:"Lat Pulldown",muscle:"Back",equip:"Cable"},{name:"Close Grip Lat Pulldown",muscle:"Back",equip:"Cable"},{name:"Single Arm Lat Pulldown",muscle:"Back",equip:"Cable"},{name:"Bent Over Row",muscle:"Back",equip:"Barbell"},{name:"Pendlay Row",muscle:"Back",equip:"Barbell"},{name:"T-Bar Row",muscle:"Back",equip:"Machine"},{name:"Single Arm Dumbbell Row",muscle:"Back",equip:"Dumbbell"},{name:"Seated Cable Row",muscle:"Back",equip:"Cable"},{name:"Cable Pullover",muscle:"Back",equip:"Cable"},{name:"Straight Arm Pulldown",muscle:"Back",equip:"Cable"},{name:"Barbell Shrug",muscle:"Back",equip:"Barbell"},{name:"Dumbbell Shrug",muscle:"Back",equip:"Dumbbell"},{name:"Hyperextension",muscle:"Back",equip:"Machine"},{name:"Good Mornings",muscle:"Back",equip:"Barbell"},{name:"Reverse Fly",muscle:"Back",equip:"Dumbbell"},{name:"Face Pull",muscle:"Back",equip:"Cable"},{name:"Rack Pull",muscle:"Back",equip:"Barbell"},{name:"Inverted Row",muscle:"Back",equip:"Bodyweight"},
  // SHOULDERS
  {name:"Overhead Press",muscle:"Shoulders",equip:"Barbell"},{name:"Push Press",muscle:"Shoulders",equip:"Barbell"},{name:"Seated Dumbbell Press",muscle:"Shoulders",equip:"Dumbbell"},{name:"Arnold Press",muscle:"Shoulders",equip:"Dumbbell"},{name:"Seated Arnold Press",muscle:"Shoulders",equip:"Dumbbell"},{name:"Lateral Raise",muscle:"Shoulders",equip:"Dumbbell"},{name:"Cable Lateral Raise",muscle:"Shoulders",equip:"Cable"},{name:"Front Raise",muscle:"Shoulders",equip:"Dumbbell"},{name:"Plate Front Raise",muscle:"Shoulders",equip:"Plate"},{name:"Bent-Over Lateral Raise",muscle:"Shoulders",equip:"Dumbbell"},{name:"High Pull",muscle:"Shoulders",equip:"Barbell"},{name:"Upright Row",muscle:"Shoulders",equip:"Barbell"},{name:"Shoulder Press Machine",muscle:"Shoulders",equip:"Machine"},{name:"Smith Machine OHP",muscle:"Shoulders",equip:"Machine"},{name:"Cable Front Raise",muscle:"Shoulders",equip:"Cable"},{name:"Band Pull-Apart",muscle:"Shoulders",equip:"Band"},
  // BICEPS
  {name:"Barbell Curl",muscle:"Biceps",equip:"Barbell"},{name:"EZ Bar Curl",muscle:"Biceps",equip:"Barbell"},{name:"Straight Bar Curl",muscle:"Biceps",equip:"Barbell"},{name:"Dumbbell Curl",muscle:"Biceps",equip:"Dumbbell"},{name:"Hammer Curl",muscle:"Biceps",equip:"Dumbbell"},{name:"Heavy Hammer Curl",muscle:"Biceps",equip:"Dumbbell"},{name:"Incline Dumbbell Curl",muscle:"Biceps",equip:"Dumbbell"},{name:"Concentration Curl",muscle:"Biceps",equip:"Dumbbell"},{name:"Preacher Curl",muscle:"Biceps",equip:"Machine"},{name:"Cable Curl",muscle:"Biceps",equip:"Cable"},{name:"Rope Hammer Curl",muscle:"Biceps",equip:"Cable"},{name:"Spider Curl",muscle:"Biceps",equip:"Dumbbell"},{name:"Reverse Curl",muscle:"Biceps",equip:"Barbell"},{name:"Zottman Curl",muscle:"Biceps",equip:"Dumbbell"},{name:"One-Arm Strict Curl",muscle:"Biceps",equip:"Dumbbell"},{name:"21s",muscle:"Biceps",equip:"Barbell"},
  // TRICEPS
  {name:"Skull Crusher",muscle:"Triceps",equip:"Barbell"},{name:"Close Grip Bench Press",muscle:"Triceps",equip:"Barbell"},{name:"Tricep Rope Pushdown",muscle:"Triceps",equip:"Cable"},{name:"Tricep Bar Pushdown",muscle:"Triceps",equip:"Cable"},{name:"Overhead Tricep Extension",muscle:"Triceps",equip:"Dumbbell"},{name:"Overhead Tricep Press",muscle:"Triceps",equip:"Cable"},{name:"Tricep Kickback",muscle:"Triceps",equip:"Dumbbell"},{name:"Weighted Dips",muscle:"Triceps",equip:"Bodyweight"},{name:"Bench Dips",muscle:"Triceps",equip:"Bodyweight"},{name:"JM Press",muscle:"Triceps",equip:"Barbell"},{name:"Tate Press",muscle:"Triceps",equip:"Dumbbell"},
  // QUADS
  {name:"Back Squat",muscle:"Quads",equip:"Barbell"},{name:"Front Squat",muscle:"Quads",equip:"Barbell"},{name:"Goblet Squat",muscle:"Quads",equip:"Dumbbell"},{name:"Hack Squat",muscle:"Quads",equip:"Machine"},{name:"Leg Press",muscle:"Quads",equip:"Machine"},{name:"Leg Extension",muscle:"Quads",equip:"Machine"},{name:"Bulgarian Split Squat",muscle:"Quads",equip:"Dumbbell"},{name:"Walking Lunges",muscle:"Quads",equip:"Bodyweight"},{name:"Reverse Lunges",muscle:"Quads",equip:"Bodyweight"},{name:"Step-ups",muscle:"Quads",equip:"Dumbbell"},{name:"Smith Machine Squat",muscle:"Quads",equip:"Machine"},{name:"Sissy Squat",muscle:"Quads",equip:"Bodyweight"},{name:"Pistol Squat",muscle:"Quads",equip:"Bodyweight"},
  // HAMSTRINGS / GLUTES
  {name:"Romanian Deadlift",muscle:"Hamstrings",equip:"Barbell"},{name:"Leg Curl (Lying)",muscle:"Hamstrings",equip:"Machine"},{name:"Leg Curl (Seated)",muscle:"Hamstrings",equip:"Machine"},{name:"Nordic Hamstring Curl",muscle:"Hamstrings",equip:"Bodyweight"},{name:"Good Mornings",muscle:"Hamstrings",equip:"Barbell"},{name:"Hip Thrust",muscle:"Glutes",equip:"Barbell"},{name:"Glute Bridge",muscle:"Glutes",equip:"Bodyweight"},{name:"Cable Kickback",muscle:"Glutes",equip:"Cable"},{name:"Sumo Squat",muscle:"Glutes",equip:"Dumbbell"},{name:"Abductor Machine",muscle:"Glutes",equip:"Machine"},{name:"Adductor Machine",muscle:"Glutes",equip:"Machine"},
  // CALVES
  {name:"Standing Calf Raise",muscle:"Calves",equip:"Machine"},{name:"Seated Calf Raise",muscle:"Calves",equip:"Machine"},{name:"Leg Press Calf Raise",muscle:"Calves",equip:"Machine"},{name:"Donkey Calf Raise",muscle:"Calves",equip:"Bodyweight"},{name:"Single-leg Calf Raise",muscle:"Calves",equip:"Bodyweight"},{name:"Calf Raises",muscle:"Calves",equip:"Bodyweight"},
  // CORE / ABS
  {name:"Plank",muscle:"Core",equip:"Bodyweight"},{name:"Side Plank",muscle:"Core",equip:"Bodyweight"},{name:"Hanging Leg Raise",muscle:"Core",equip:"Bodyweight"},{name:"Hanging Knee Raise",muscle:"Core",equip:"Bodyweight"},{name:"Ab Wheel Rollout",muscle:"Core",equip:"Bodyweight"},{name:"Cable Crunch",muscle:"Core",equip:"Cable"},{name:"Russian Twist",muscle:"Core",equip:"Bodyweight"},{name:"Decline Sit-up",muscle:"Core",equip:"Bodyweight"},{name:"V-up",muscle:"Core",equip:"Bodyweight"},{name:"L-sit",muscle:"Core",equip:"Bodyweight"},{name:"Dragon Flag",muscle:"Core",equip:"Bodyweight"},{name:"Windshield Wiper",muscle:"Core",equip:"Bodyweight"},{name:"Pallof Press",muscle:"Core",equip:"Cable"},{name:"Landmine Rotation",muscle:"Core",equip:"Barbell"},{name:"Bicycle Crunch",muscle:"Core",equip:"Bodyweight"},{name:"Dead Bug",muscle:"Core",equip:"Bodyweight"},{name:"Hollow Body Hold",muscle:"Core",equip:"Bodyweight"},{name:"Toes to Bar",muscle:"Core",equip:"Bodyweight"},
  // CARDIO / HIIT
  {name:"Treadmill Sprint",muscle:"Cardio",equip:"Machine"},{name:"Rowing Machine",muscle:"Cardio",equip:"Machine"},{name:"Assault Bike",muscle:"Cardio",equip:"Machine"},{name:"Stationary Bike",muscle:"Cardio",equip:"Machine"},{name:"Stair Climber",muscle:"Cardio",equip:"Machine"},{name:"Jump Rope",muscle:"Cardio",equip:"Bodyweight"},{name:"Box Jumps",muscle:"Cardio",equip:"Bodyweight"},{name:"Burpees",muscle:"Cardio",equip:"Bodyweight"},{name:"Battle Ropes",muscle:"Cardio",equip:"Machine"},{name:"Mountain Climbers",muscle:"Cardio",equip:"Bodyweight"},{name:"Jump Squats",muscle:"Cardio",equip:"Bodyweight"},{name:"Kettlebell Swings",muscle:"Cardio",equip:"Kettlebell"},{name:"Sled Push",muscle:"Cardio",equip:"Machine"},{name:"Bear Crawl",muscle:"Cardio",equip:"Bodyweight"},{name:"Tuck Jumps",muscle:"Cardio",equip:"Bodyweight"},{name:"Sprint",muscle:"Cardio",equip:"Bodyweight"},
  // FULL BODY
  {name:"Thruster",muscle:"Full Body",equip:"Barbell"},{name:"Clean and Press",muscle:"Full Body",equip:"Barbell"},{name:"Power Clean",muscle:"Full Body",equip:"Barbell"},{name:"Snatch",muscle:"Full Body",equip:"Barbell"},{name:"Turkish Get-up",muscle:"Full Body",equip:"Kettlebell"},{name:"Farmers Walk",muscle:"Full Body",equip:"Dumbbell"},{name:"Tire Flip",muscle:"Full Body",equip:"Bodyweight"},{name:"Sandbag Carry",muscle:"Full Body",equip:"Bodyweight"},{name:"Kettlebell Clean and Press",muscle:"Full Body",equip:"Kettlebell"},{name:"Man Makers",muscle:"Full Body",equip:"Dumbbell"},
];

const MUSCLE_GROUPS = ["All",...[...new Set(EXERCISE_DB.map(e=>e.muscle))]];
const MUSCLE_COLORS = {Chest:"#E8704A",Back:"#3B9EDB",Shoulders:"#E8A838",Biceps:"#3DBF8A",Triceps:"#9B6EE8",Quads:"#E84E8A",Hamstrings:"#20B2AA",Glutes:"#E8704A",Calves:"#7B61FF",Core:"#E8A838",Cardio:"#E84E8A","Full Body":"#888"};

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
function ActiveWorkout({ day, customExercises, onExit }) {
  const allExercises = [
    ...day.sections.flatMap(s => s.exercises.map(e => ({ ...e, section: s.name }))),
    ...(customExercises||[]).map(e => ({ ...e, section:"CUSTOM ✦" })),
  ];
  const [exIdx, setExIdx] = useState(0);
  const [setIdx, setSetIdx] = useState(0);
  const [logs, setLogs] = useState({});
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const startRef = useRef(Date.now());

  const ex = allExercises[exIdx];
  const done = exIdx >= allExercises.length;

  function logSet() {
    const key = `${exIdx}-${setIdx}`;
    setLogs(p => ({ ...p, [key]: { weight, reps, exName: ex.name } }));
    if (setIdx + 1 < ex.sets) { setSetIdx(s => s + 1); }
    else if (exIdx + 1 < allExercises.length) { setExIdx(i => i + 1); setSetIdx(0); }
    else { setExIdx(allExercises.length); }
    setWeight(""); setReps("");
  }

  function finishWorkout() {
    const durationMins = Math.max(1, Math.round((Date.now() - startRef.current) / 60000));
    onExit({ logs, durationMins, dayLabel: day.label, dayColor: day.color, isHiit: day.day.startsWith("HIIT") });
  }

  const ytUrl = ex ? `https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + " form tutorial")}` : "";

  if (done) return (
    <div style={{ padding:"40px 20px",textAlign:"center" }}>
      <div style={{ fontSize:48,marginBottom:12 }}>🏆</div>
      <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:24,color:"#3DBF8A",marginBottom:8 }}>Workout Complete!</div>
      <div style={{ fontSize:14,color:"#888",marginBottom:6 }}>Great work today. Rest, eat, recover.</div>
      <div style={{ fontSize:13,color:"#555",marginBottom:24 }}>Duration: ~{Math.max(1,Math.round((Date.now()-startRef.current)/60000))} min</div>
      <button onClick={finishWorkout} style={{ padding:"12px 28px",borderRadius:12,border:"none",background:"#3DBF8A",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:15,fontWeight:700,cursor:"pointer" }}>Save Session ✓</button>
    </div>
  );

  return (
    <div style={{ padding:"0 0 100px" }}>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,padding:"0 4px" }}>
        <div>
          <div style={{ fontSize:11,color:day.color,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em" }}>{ex.section}</div>
          <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:22,color:"#fff" }}>{ex.name}</div>
        </div>
        <button onClick={()=>onExit(null)} style={{ background:"rgba(255,255,255,0.08)",border:"none",color:"#888",cursor:"pointer",fontSize:13,padding:"6px 12px",borderRadius:8,fontFamily:"'DM Sans',sans-serif" }}>✕ Exit</button>
      </div>

      <div style={{ height:4,background:"rgba(255,255,255,0.08)",borderRadius:4,overflow:"hidden",marginBottom:16 }}>
        <div style={{ height:"100%",width:`${Math.round((exIdx/allExercises.length)*100)}%`,background:day.color,borderRadius:4,transition:"width 0.4s" }}/>
      </div>
      <div style={{ fontSize:12,color:"#555",marginBottom:20,textAlign:"center" }}>Exercise {exIdx+1} of {allExercises.length} · Set {setIdx+1} of {ex.sets}</div>

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

      <RestTimer color={day.color}/>

      <a href={ytUrl} target="_blank" rel="noreferrer"
        style={{ display:"flex",alignItems:"center",gap:10,background:"rgba(255,0,0,0.1)",border:"1px solid rgba(255,0,0,0.25)",borderRadius:12,padding:"12px 16px",textDecoration:"none",marginBottom:14 }}>
        <div style={{ width:32,height:32,background:"#FF0000",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0 }}>▶</div>
        <div>
          <div style={{ fontSize:13,fontWeight:700,color:"#FF4444" }}>Watch Tutorial on YouTube</div>
          <div style={{ fontSize:11,color:"#555",marginTop:1 }}>{ex.name} — form &amp; technique</div>
        </div>
      </a>

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
const WORKOUT_METS = { weights: 4.0, hiit: 10.0, cardio: 7.0, other: 3.5 };
const INTENSITY_MULTS = { low: 0.7, medium: 1.0, high: 1.3, max: 1.6 };

function calcCals(bodyWeightLbs, durationMins, workoutType, intensity) {
  const met = WORKOUT_METS[workoutType] || 4.0;
  const mult = INTENSITY_MULTS[intensity] || 1.0;
  const kg = (parseFloat(bodyWeightLbs) || 185) / 2.205;
  return Math.round(met * mult * kg * (durationMins / 60));
}

export function GymView({ T, data, save, today, isMobile }) {
  const [gymDay, setGymDay] = useState(0);
  const [gymTab, setGymTab] = useState("plan");
  const [activeWorkout, setActiveWorkout] = useState(false);
  const [viewSession, setViewSession] = useState(null);
  const [gwf, setGwf] = useState({ weight:"", sessions:"", prs:"", nutrition:5, notes:"" });
  const [manualForm, setManualForm] = useState(false);
  const [mf, setMf] = useState({ date:today, type:"weights", duration:"", intensity:"high", bodyWeight:"", notes:"" });
  const [showAddEx, setShowAddEx] = useState(false);
  const [exSearch, setExSearch] = useState("");
  const [exMuscle, setExMuscle] = useState("All");
  const [exPicked, setExPicked] = useState(null);
  const [exForm, setExForm] = useState({ sets:"3", reps:"10", target:"", notes:"" });

  const thisMonday = (()=>{ const d=new Date(); d.setDate(d.getDate()-((d.getDay()+6)%7)); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; })();
  const gymWeekly = data.gymWeekly||[];
  const gymSessions = [...(data.gymSessions||[])].sort((a,b)=>b.date.localeCompare(a.date));

  const latestWeight = [...gymWeekly].sort((a,b)=>b.week.localeCompare(a.week))[0]?.weight || "";

  const cs = (ex={}) => ({ background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,boxShadow:"0 2px 10px rgba(0,0,0,0.08)",...ex });
  const inp = { width:"100%",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:9,padding:"9px 12px",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:14,outline:"none",boxSizing:"border-box" };
  const lbl = { fontSize:11,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",color:T.textMuted,display:"block",marginBottom:4,marginTop:10,fontFamily:"'DM Sans',sans-serif" };

  function handleWorkoutDone(result) {
    setActiveWorkout(false);
    if (!result) return;
    const wType = result.isHiit ? "hiit" : "weights";
    const bw = latestWeight;
    const cals = calcCals(bw, result.durationMins, wType, "high");
    const session = {
      id: "gs_" + Math.random().toString(36).slice(2,8),
      date: today,
      dayLabel: result.dayLabel,
      dayColor: result.dayColor,
      workoutType: wType,
      duration: result.durationMins,
      bodyWeight: bw,
      intensity: "high",
      calsBurned: cals,
      logs: result.logs,
      notes: "",
    };
    save(p => ({ ...p, gymSessions: [...(p.gymSessions||[]), session] }));
    setGymTab("sessions");
  }

  function saveManualSession() {
    if (!mf.duration) return;
    const cals = calcCals(mf.bodyWeight||latestWeight, parseFloat(mf.duration)||0, mf.type, mf.intensity);
    const session = {
      id: "gs_" + Math.random().toString(36).slice(2,8),
      date: mf.date||today,
      dayLabel: mf.type==="hiit"?"HIIT Conditioning":mf.type==="cardio"?"Cardio":"Weight Training",
      dayColor: mf.type==="hiit"?"#E84E8A":mf.type==="cardio"?"#3DBF8A":"#E8704A",
      workoutType: mf.type,
      duration: parseFloat(mf.duration)||0,
      bodyWeight: mf.bodyWeight||latestWeight,
      intensity: mf.intensity,
      calsBurned: cals,
      logs: {},
      notes: mf.notes,
    };
    save(p => ({ ...p, gymSessions: [...(p.gymSessions||[]), session] }));
    setManualForm(false);
    setMf({ date:today, type:"weights", duration:"", intensity:"high", bodyWeight:"", notes:"" });
  }

  function saveCustomEx() {
    if (!exPicked) return;
    const entry = { ...exPicked, ...exForm, id:"cx_"+Math.random().toString(36).slice(2,8), sets:parseInt(exForm.sets)||3 };
    save(p => ({ ...p, gymCustom: { ...(p.gymCustom||{}), [gymDay]: [...(p.gymCustom?.[gymDay]||[]), entry] } }));
    setShowAddEx(false); setExPicked(null); setExSearch(""); setExMuscle("All"); setExForm({ sets:"3", reps:"10", target:"", notes:"" });
  }
  function delCustomEx(id) {
    save(p => ({ ...p, gymCustom: { ...(p.gymCustom||{}), [gymDay]: (p.gymCustom?.[gymDay]||[]).filter(e=>e.id!==id) } }));
  }

  if (activeWorkout) return (
    <div style={{ background:"#0d0f14",minHeight:"100vh",padding:"20px 16px",fontFamily:"'DM Sans',sans-serif" }}>
      <ActiveWorkout day={GYM_PLAN[gymDay]} customExercises={data.gymCustom?.[gymDay]||[]} onExit={handleWorkoutDone}/>
    </div>
  );

  // Session detail overlay
  if (viewSession) {
    const s = viewSession;
    const logEntries = Object.entries(s.logs||{});
    const byEx = {};
    logEntries.forEach(([k,v])=>{ const ei=k.split("-")[0]; (byEx[ei]=byEx[ei]||[]).push({setNum:parseInt(k.split("-")[1])+1,...v}); });
    return (
      <div>
        <button onClick={()=>setViewSession(null)} style={{ background:"none",border:"none",color:T.textSub,cursor:"pointer",fontSize:13,padding:"0 0 16px",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:6 }}>← Back to Sessions</button>
        <div style={{ ...cs({padding:"18px 20px",marginBottom:14,borderTop:`4px solid ${s.dayColor||"#E8704A"}` }) }}>
          <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:20,color:s.dayColor||"#E8704A",marginBottom:4 }}>{s.dayLabel||"Workout"}</div>
          <div style={{ fontSize:12,color:T.textSub,marginBottom:14 }}>{s.date}</div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8 }}>
            {[{l:"Duration",v:`${s.duration} min`},{l:"Calories",v:`~${s.calsBurned} kcal`},{l:"Body Weight",v:s.bodyWeight?`${s.bodyWeight} lbs`:"—"},{l:"Intensity",v:s.intensity||"—"}].map(x=>(
              <div key={x.l} style={{ background:T.inputBg,borderRadius:10,padding:"10px",textAlign:"center" }}>
                <div style={{ fontSize:15,fontWeight:800,color:s.dayColor||"#E8704A" }}>{x.v}</div>
                <div style={{ fontSize:10,color:T.textMuted,textTransform:"uppercase",marginTop:2 }}>{x.l}</div>
              </div>
            ))}
          </div>
        </div>
        {Object.keys(byEx).length>0&&(
          <div style={{ ...cs({padding:"16px 18px"}) }}>
            <div style={{ fontSize:12,fontWeight:700,color:T.textSub,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:12 }}>Logged Exercises</div>
            {Object.entries(byEx).map(([ei,sets])=>(
              <div key={ei} style={{ marginBottom:12 }}>
                <div style={{ fontSize:13,fontWeight:700,color:T.text,marginBottom:6 }}>{sets[0]?.exName||`Exercise ${parseInt(ei)+1}`}</div>
                {sets.map((st,i)=>(
                  <div key={i} style={{ display:"flex",justifyContent:"space-between",fontSize:12,color:T.textSub,padding:"3px 0",borderBottom:`1px solid ${T.border}` }}>
                    <span>Set {st.setNum}</span>
                    <span style={{ color:T.text,fontWeight:600 }}>{st.weight} × {st.reps}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        {s.notes&&<div style={{ ...cs({padding:"14px 16px",marginTop:10}) }}><div style={{ fontSize:12,color:T.textSub,fontStyle:"italic" }}>{s.notes}</div></div>}
        <button onClick={()=>{ save(p=>({...p,gymSessions:(p.gymSessions||[]).filter(x=>x.id!==s.id)})); setViewSession(null); }} style={{ marginTop:14,padding:"10px 20px",borderRadius:10,border:"1px solid rgba(232,78,138,0.3)",background:"none",color:"#E84E8A",fontFamily:"'DM Sans',sans-serif",fontSize:13,cursor:"pointer" }}>Delete Session</button>
      </div>
    );
  }

  const currentDay = GYM_PLAN[gymDay];

  return (
    <div>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:8 }}>
        <div>
          <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:isMobile?20:26,color:"#E8704A",marginBottom:2 }}>🏋 Gym</div>
          <div style={{ fontSize:12,color:T.textSub }}>6-Day Split + HIIT · Session logging + calorie tracking</div>
        </div>
        <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
          {[["plan","📋 Plan"],["sessions","📸 Sessions"],["weekly","📊 Weekly"]].map(([t,l])=>(
            <button key={t} onClick={()=>setGymTab(t)}
              style={{ padding:"6px 12px",borderRadius:20,border:`1px solid ${gymTab===t?"#E8704A":T.border}`,background:gymTab===t?"#E8704A20":"transparent",color:gymTab===t?"#E8704A":T.textSub,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:gymTab===t?700:400,cursor:"pointer" }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* ── Plan tab ── */}
      {gymTab==="plan"&&(
        <div>
          <div style={{ display:"flex",gap:6,overflowX:"auto",paddingBottom:6,marginBottom:14,scrollbarWidth:"none" }}>
            {GYM_PLAN.map((d,i)=>(
              <button key={i} onClick={()=>setGymDay(i)}
                style={{ flexShrink:0,padding:"7px 12px",borderRadius:20,border:`1px solid ${gymDay===i?d.color:T.border}`,background:gymDay===i?d.color+"20":"transparent",color:gymDay===i?d.color:T.textSub,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:gymDay===i?700:400,cursor:"pointer",whiteSpace:"nowrap" }}>
                {d.icon} {d.day}
              </button>
            ))}
          </div>

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

          {/* ── Custom exercises for this day ── */}
          {(()=>{
            const custom = data.gymCustom?.[gymDay]||[];
            const mc = MUSCLE_COLORS[custom[0]?.muscle]||currentDay.color;
            return (
              <div>
                {custom.length>0&&(
                  <div style={{ ...cs({padding:"14px 16px"}),marginBottom:10,borderLeft:`3px solid #9B6EE8` }}>
                    <div style={{ fontSize:11,fontWeight:700,color:"#9B6EE8",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10 }}>CUSTOM ✦</div>
                    {custom.map((ex,ei)=>(
                      <div key={ex.id} style={{ borderBottom:ei<custom.length-1?`1px solid ${T.border}`:"none",paddingBottom:10,marginBottom:10 }}>
                        <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8 }}>
                          <div style={{ flex:1 }}>
                            <div style={{ display:"flex",alignItems:"center",gap:6,flexWrap:"wrap" }}>
                              <span style={{ fontSize:14,fontWeight:600,color:T.text }}>{ex.name}</span>
                              <span style={{ fontSize:10,background:(MUSCLE_COLORS[ex.muscle]||"#888")+"20",color:MUSCLE_COLORS[ex.muscle]||"#888",padding:"2px 6px",borderRadius:5,fontWeight:700 }}>{ex.muscle}</span>
                              <span style={{ fontSize:10,color:T.textMuted,background:T.inputBg,padding:"2px 6px",borderRadius:5 }}>{ex.equip}</span>
                            </div>
                            <div style={{ fontSize:12,color:T.textSub,marginTop:2 }}>{ex.sets} sets × {ex.reps}{ex.target?` · ${ex.target}`:""}</div>
                            {ex.notes&&<div style={{ fontSize:11,color:T.textMuted,fontStyle:"italic",marginTop:1 }}>{ex.notes}</div>}
                          </div>
                          <div style={{ display:"flex",gap:4,flexShrink:0 }}>
                            <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name+" form tutorial")}`} target="_blank" rel="noreferrer"
                              style={{ width:28,height:28,borderRadius:7,background:"rgba(255,0,0,0.12)",border:"1px solid rgba(255,0,0,0.2)",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",fontSize:13,color:"#FF4444",flexShrink:0 }}>
                              ▶
                            </a>
                            <button onClick={()=>delCustomEx(ex.id)} style={{ width:28,height:28,borderRadius:7,background:"none",border:"1px solid rgba(232,78,138,0.3)",color:"#E84E8A",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center" }}>✕</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Exercise button */}
                <button onClick={()=>{ setShowAddEx(true); setExPicked(null); setExSearch(""); setExMuscle("All"); setExForm({sets:"3",reps:"10",target:"",notes:""}); }}
                  style={{ width:"100%",padding:"12px",borderRadius:12,border:`2px dashed ${currentDay.color}55`,background:currentDay.color+"08",color:currentDay.color,fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:4 }}>
                  + Add Custom Exercise to {currentDay.day}
                </button>
              </div>
            );
          })()}

          {/* ── Add Exercise Modal ── */}
          {showAddEx&&(()=>{
            const q = exSearch.toLowerCase();
            const filtered = EXERCISE_DB.filter(e=>(exMuscle==="All"||e.muscle===exMuscle)&&(!q||e.name.toLowerCase().includes(q)||e.muscle.toLowerCase().includes(q)||e.equip.toLowerCase().includes(q)));
            const inpM = { width:"100%",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:9,padding:"9px 12px",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:13,outline:"none",boxSizing:"border-box" };
            const lblM = { fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:"#555",display:"block",marginBottom:4,marginTop:10,fontFamily:"'DM Sans',sans-serif" };
            return (
              <div style={{ position:"fixed",inset:0,zIndex:80,background:"rgba(0,0,0,0.8)",backdropFilter:"blur(8px)",display:"flex",alignItems:"flex-end",justifyContent:"center" }} onClick={e=>e.target===e.currentTarget&&setShowAddEx(false)}>
                <div style={{ background:"#161820",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"20px 20px 0 0",width:"100%",maxWidth:520,maxHeight:"92vh",display:"flex",flexDirection:"column",padding:"0 0 env(safe-area-inset-bottom,0)" }}>
                  {/* Handle */}
                  <div style={{ padding:"14px 20px 0",flexShrink:0 }}>
                    <div style={{ width:40,height:4,borderRadius:2,background:"rgba(255,255,255,0.15)",margin:"0 auto 16px" }}/>
                    <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:20,color:currentDay.color,marginBottom:12 }}>
                      {exPicked ? `Configure: ${exPicked.name}` : `Add Exercise — ${currentDay.day}`}
                    </div>

                    {!exPicked&&(
                      <>
                        {/* Search input */}
                        <div style={{ position:"relative",marginBottom:10 }}>
                          <span style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:16,pointerEvents:"none" }}>🔍</span>
                          <input
                            autoFocus
                            value={exSearch}
                            onChange={e=>setExSearch(e.target.value)}
                            placeholder="Search exercises, muscles, equipment..."
                            style={{ ...inpM,paddingLeft:38 }}
                          />
                        </div>
                        {/* Muscle group filter chips */}
                        <div style={{ display:"flex",gap:5,overflowX:"auto",scrollbarWidth:"none",paddingBottom:6,marginBottom:8 }}>
                          {MUSCLE_GROUPS.map(m=>{
                            const mc2 = MUSCLE_COLORS[m]||currentDay.color;
                            return (
                              <button key={m} onClick={()=>setExMuscle(m)} style={{ flexShrink:0,padding:"4px 10px",borderRadius:16,border:`1px solid ${exMuscle===m?mc2:"rgba(255,255,255,0.1)"}`,background:exMuscle===m?mc2+"25":"transparent",color:exMuscle===m?mc2:"#666",fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:exMuscle===m?700:400,cursor:"pointer",whiteSpace:"nowrap" }}>
                                {m}
                              </button>
                            );
                          })}
                        </div>
                        <div style={{ fontSize:11,color:"#444",marginBottom:6 }}>{filtered.length} exercise{filtered.length!==1?"s":""} found</div>
                      </>
                    )}
                  </div>

                  {/* Scrollable body */}
                  <div style={{ flex:1,overflowY:"auto",padding:"0 20px 20px" }}>
                    {!exPicked ? (
                      /* Exercise list */
                      filtered.length===0?(
                        <div style={{ textAlign:"center",padding:"30px 0",color:"#444",fontSize:13 }}>No exercises match your search</div>
                      ):(
                        <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                          {filtered.map(ex=>{
                            const mc2 = MUSCLE_COLORS[ex.muscle]||"#888";
                            return (
                              <button key={ex.name} onClick={()=>setExPicked(ex)}
                                style={{ display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderRadius:11,border:"1px solid rgba(255,255,255,0.07)",background:"rgba(255,255,255,0.03)",cursor:"pointer",textAlign:"left",width:"100%" }}>
                                <div style={{ width:8,height:8,borderRadius:"50%",background:mc2,flexShrink:0 }}/>
                                <div style={{ flex:1,minWidth:0 }}>
                                  <div style={{ fontSize:13,fontWeight:600,color:"#fff" }}>{ex.name}</div>
                                  <div style={{ fontSize:11,color:"#555",marginTop:1 }}>{ex.muscle} · {ex.equip}</div>
                                </div>
                                <div style={{ fontSize:18,color:"#333",flexShrink:0 }}>›</div>
                              </button>
                            );
                          })}
                        </div>
                      )
                    ) : (
                      /* Configure form */
                      <div>
                        <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:16,padding:"10px 12px",borderRadius:10,background:currentDay.color+"15",border:`1px solid ${currentDay.color}30` }}>
                          <div style={{ width:10,height:10,borderRadius:"50%",background:MUSCLE_COLORS[exPicked.muscle]||currentDay.color,flexShrink:0 }}/>
                          <div>
                            <div style={{ fontSize:14,fontWeight:700,color:"#fff" }}>{exPicked.name}</div>
                            <div style={{ fontSize:11,color:"#555" }}>{exPicked.muscle} · {exPicked.equip}</div>
                          </div>
                          <button onClick={()=>setExPicked(null)} style={{ marginLeft:"auto",background:"none",border:"none",color:"#555",cursor:"pointer",fontSize:13,padding:"4px 8px",borderRadius:6,fontFamily:"'DM Sans',sans-serif" }}>← Change</button>
                        </div>

                        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                          <div>
                            <label style={lblM}>Sets</label>
                            <input type="number" style={inpM} value={exForm.sets} onChange={e=>setExForm(p=>({...p,sets:e.target.value}))} placeholder="3"/>
                          </div>
                          <div>
                            <label style={lblM}>Reps / Time</label>
                            <input style={inpM} value={exForm.reps} onChange={e=>setExForm(p=>({...p,reps:e.target.value}))} placeholder="10"/>
                          </div>
                        </div>

                        <label style={lblM}>Target Weight / Intensity</label>
                        <input style={inpM} value={exForm.target} onChange={e=>setExForm(p=>({...p,target:e.target.value}))} placeholder="e.g. 135 lbs, BW, Max speed"/>

                        <label style={lblM}>Notes (optional)</label>
                        <input style={inpM} value={exForm.notes} onChange={e=>setExForm(p=>({...p,notes:e.target.value}))} placeholder="e.g. pause at bottom, superset with..."/>

                        <div style={{ display:"flex",gap:8,marginTop:18 }}>
                          <button onClick={()=>setShowAddEx(false)} style={{ flex:1,padding:"11px",borderRadius:10,border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"#555",fontFamily:"'DM Sans',sans-serif",fontSize:13,cursor:"pointer" }}>Cancel</button>
                          <button onClick={saveCustomEx} style={{ flex:2,padding:"11px",borderRadius:10,border:"none",background:currentDay.color,color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:700,cursor:"pointer" }}>Add to {currentDay.day}</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ── Sessions tab ── */}
      {gymTab==="sessions"&&(
        <div>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
            <div style={{ fontSize:13,color:T.textSub }}>{gymSessions.length} session{gymSessions.length!==1?"s":""} logged</div>
            <button onClick={()=>setManualForm(true)} style={{ padding:"8px 16px",borderRadius:9,border:"none",background:"#E8704A",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,cursor:"pointer" }}>+ Log Session</button>
          </div>

          {gymSessions.length===0?(
            <div style={{ ...cs({padding:"40px 20px",textAlign:"center"}) }}>
              <div style={{ fontSize:40,marginBottom:10 }}>🏋</div>
              <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:18,color:T.text,marginBottom:8 }}>No sessions yet</div>
              <div style={{ fontSize:13,color:T.textSub,marginBottom:16,lineHeight:1.6 }}>Start a workout from the Plan tab or log one manually. Each session tracks duration, exercises, and estimated calories burned.</div>
              <button onClick={()=>setManualForm(true)} style={{ padding:"10px 22px",borderRadius:10,border:"none",background:"#E8704A",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,cursor:"pointer" }}>Log First Session</button>
            </div>
          ):(
            <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
              {gymSessions.map(s=>(
                <button key={s.id} onClick={()=>setViewSession(s)}
                  style={{ ...cs({padding:"14px 16px"}),display:"flex",alignItems:"center",gap:12,borderLeft:`4px solid ${s.dayColor||"#E8704A"}`,textAlign:"left",cursor:"pointer",width:"100%",background:T.surface }}>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap" }}>
                      <span style={{ fontSize:14,fontWeight:700,color:T.text }}>{s.dayLabel||"Workout"}</span>
                      <span style={{ fontSize:10,background:(s.dayColor||"#E8704A")+"20",color:s.dayColor||"#E8704A",padding:"2px 7px",borderRadius:5,fontWeight:700 }}>{s.workoutType}</span>
                    </div>
                    <div style={{ fontSize:12,color:T.textSub }}>{s.date} · {s.duration} min</div>
                  </div>
                  <div style={{ textAlign:"right",flexShrink:0 }}>
                    <div style={{ fontSize:16,fontWeight:800,color:"#E8704A" }}>~{s.calsBurned}</div>
                    <div style={{ fontSize:10,color:T.textMuted,textTransform:"uppercase" }}>kcal</div>
                  </div>
                </button>
              ))}
              {/* Weekly summary bar */}
              {(()=>{
                const weekCals = gymSessions.filter(s=>s.date>=thisMonday).reduce((sum,s)=>sum+s.calsBurned,0);
                const weekMins = gymSessions.filter(s=>s.date>=thisMonday).reduce((sum,s)=>sum+s.duration,0);
                return weekCals>0&&(
                  <div style={{ ...cs({padding:"14px 16px",background:"#E8704A10",borderTop:"2px solid #E8704A30"}) }}>
                    <div style={{ fontSize:11,fontWeight:700,color:"#E8704A",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6 }}>This Week</div>
                    <div style={{ display:"flex",gap:16 }}>
                      <div><span style={{ fontSize:18,fontWeight:800,color:"#E8704A" }}>{weekCals}</span> <span style={{ fontSize:11,color:T.textSub }}>kcal burned</span></div>
                      <div><span style={{ fontSize:18,fontWeight:800,color:"#3DBF8A" }}>{weekMins}</span> <span style={{ fontSize:11,color:T.textSub }}>min trained</span></div>
                      <div><span style={{ fontSize:18,fontWeight:800,color:"#9B6EE8" }}>{gymSessions.filter(s=>s.date>=thisMonday).length}</span> <span style={{ fontSize:11,color:T.textSub }}>sessions</span></div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Manual log form */}
          {manualForm&&(
            <div style={{ position:"fixed",inset:0,zIndex:60,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center" }} onClick={e=>e.target===e.currentTarget&&setManualForm(false)}>
              <div style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:500,maxHeight:"90vh",overflowY:"auto",padding:"24px 20px 40px" }}>
                <div style={{ width:40,height:4,borderRadius:2,background:T.textMuted,margin:"0 auto 18px",opacity:0.4 }}/>
                <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:20,color:"#E8704A",marginBottom:14 }}>Log Session</div>
                <label style={lbl}>Date</label>
                <input type="date" style={inp} value={mf.date||today} onChange={e=>setMf(p=>({...p,date:e.target.value}))}/>
                <label style={lbl}>Workout Type</label>
                <div style={{ display:"flex",gap:6 }}>
                  {[["weights","🏋 Weights"],["hiit","⚡ HIIT"],["cardio","🏃 Cardio"],["other","🤸 Other"]].map(([v,l])=>(
                    <button key={v} onClick={()=>setMf(p=>({...p,type:v}))} style={{ flex:1,padding:"8px 4px",borderRadius:8,border:`1px solid ${mf.type===v?"#E8704A":T.border}`,background:mf.type===v?"#E8704A20":"transparent",color:mf.type===v?"#E8704A":T.text,fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:mf.type===v?700:400,cursor:"pointer" }}>{l}</button>
                  ))}
                </div>
                <label style={lbl}>Duration (minutes) *</label>
                <input type="number" style={inp} value={mf.duration||""} onChange={e=>setMf(p=>({...p,duration:e.target.value}))} placeholder="e.g. 75"/>
                <label style={lbl}>Intensity</label>
                <div style={{ display:"flex",gap:6 }}>
                  {["low","medium","high","max"].map(v=>(
                    <button key={v} onClick={()=>setMf(p=>({...p,intensity:v}))} style={{ flex:1,padding:"8px 4px",borderRadius:8,border:`1px solid ${mf.intensity===v?"#E8704A":T.border}`,background:mf.intensity===v?"#E8704A20":"transparent",color:mf.intensity===v?"#E8704A":T.text,fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:mf.intensity===v?700:400,cursor:"pointer" }}>{v}</button>
                  ))}
                </div>
                <label style={lbl}>Body Weight (lbs)</label>
                <input type="number" style={inp} value={mf.bodyWeight||""} onChange={e=>setMf(p=>({...p,bodyWeight:e.target.value}))} placeholder={latestWeight||"e.g. 205"}/>
                {mf.duration&&(
                  <div style={{ marginTop:10,padding:"10px 14px",borderRadius:10,background:"#E8704A15",border:"1px solid #E8704A30" }}>
                    <div style={{ fontSize:12,color:"#E8704A",fontWeight:700 }}>Estimated: ~{calcCals(mf.bodyWeight||latestWeight,parseFloat(mf.duration)||0,mf.type,mf.intensity)} kcal burned</div>
                    <div style={{ fontSize:11,color:T.textMuted,marginTop:2 }}>Based on MET values · {mf.intensity} intensity</div>
                  </div>
                )}
                <label style={lbl}>Notes</label>
                <input style={inp} value={mf.notes||""} onChange={e=>setMf(p=>({...p,notes:e.target.value}))} placeholder="How did it go? PRs, energy, etc."/>
                <div style={{ display:"flex",gap:8,marginTop:18 }}>
                  <button onClick={()=>setManualForm(false)} style={{ flex:1,padding:"11px",borderRadius:10,border:`1px solid ${T.border}`,background:"transparent",color:T.textSub,fontFamily:"'DM Sans',sans-serif",fontSize:13,cursor:"pointer" }}>Cancel</button>
                  <button onClick={saveManualSession} style={{ flex:2,padding:"11px",borderRadius:10,border:"none",background:"#E8704A",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:700,cursor:"pointer" }}>Save Session</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Weekly log tab ── */}
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
              const entry={...gwf,week:thisMonday,id:"gw"+Math.random().toString(36).slice(2,8)};
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
function SchoolCard({ school, T, STATUS_COLORS, onEdit, onDelete, onAddProgress, onStatusChange, onAddEmail, onUpdateField, today }) {
  const [note, setNote] = useState("");
  const [emailInput, setEmailInput] = useState({ type:"cold", to:"", subject:"", notes:"" });
  const [activeTab, setActiveTab] = useState("progress");
  const c = STATUS_COLORS[school.status]||"#888";
  const cs = (ex={}) => ({ background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,...ex });
  const DOCS = ["CV / Resume","Statement of Purpose","Transcripts","Reference Letters","Writing Sample","GRE / GMAT","Application Form","Application Fee"];
  const docs = school.docs||{};
  const docsDone = DOCS.filter(d=>docs[d]).length;

  const claudeResearchUrl = encodeURIComponent(
    `I'm applying to ${school.name} for a ${school.degree} program. Please help me:
1. Find potential professors whose research aligns with machine learning / AI / data science
2. Draft a cold email introduction to a professor for potential supervision
3. Summarize what makes this school's program strong and what I should highlight in my SOP
4. List the typical application requirements

School notes: ${school.notes||"N/A"}`
  );

  return (
    <div style={{ ...cs(),overflow:"hidden",borderTop:`4px solid ${c}` }}>
      <div style={{ padding:"14px 16px" }}>
        {/* Header */}
        <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,marginBottom:10 }}>
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ fontSize:14,fontWeight:700,color:T.text,lineHeight:1.3 }}>{school.name}</div>
            <div style={{ display:"flex",gap:6,marginTop:5,flexWrap:"wrap" }}>
              <span style={{ fontSize:11,color:c,fontWeight:700,background:c+"15",padding:"2px 8px",borderRadius:8 }}>{school.status}</span>
              <span style={{ fontSize:11,color:"#3B9EDB",fontWeight:600,background:"#3B9EDB15",padding:"2px 8px",borderRadius:8 }}>{school.degree}</span>
              <span style={{ fontSize:11,color:T.textMuted }}>{school.country==="canada"?"🇨🇦":"🇺🇸"}</span>
              {school.feePaid&&<span style={{ fontSize:11,color:"#3DBF8A",fontWeight:700 }}>✓ Fee Paid</span>}
            </div>
          </div>
          <div style={{ display:"flex",gap:3 }}>
            <a href={`https://claude.ai/new?q=${claudeResearchUrl}`} target="_blank" rel="noreferrer"
              title="Research this school with Claude AI"
              style={{ background:"rgba(123,97,255,0.15)",border:"1px solid rgba(123,97,255,0.3)",color:"#7B61FF",cursor:"pointer",fontSize:11,padding:"4px 8px",borderRadius:7,textDecoration:"none",fontFamily:"'DM Sans',sans-serif",fontWeight:700,whiteSpace:"nowrap" }}>
              🤖 Ask Claude
            </a>
            <button onClick={onEdit} style={{ background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:13,padding:"3px" }}>✎</button>
            <button onClick={onDelete} style={{ background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:13,padding:"3px" }}>✕</button>
          </div>
        </div>

        {school.deadline&&<div style={{ fontSize:12,color:"#E8A838",fontWeight:600,marginBottom:8 }}>📅 Deadline: {school.deadline}</div>}
        {school.feeAmount&&<div style={{ fontSize:12,color:school.feePaid?"#3DBF8A":"#E8704A",fontWeight:600,marginBottom:8 }}>💳 App Fee: ${school.feeAmount} {school.feePaid?"(Paid)":"(Unpaid)"}</div>}

        {/* Status toggle */}
        <div style={{ display:"flex",gap:4,flexWrap:"wrap",marginBottom:10 }}>
          {["researching","preparing","applied","interview","offer","rejected"].map(st=>(
            <button key={st} onClick={()=>onStatusChange(school.id,st)}
              style={{ padding:"3px 8px",borderRadius:8,border:`1px solid ${school.status===st?(STATUS_COLORS[st]||"#888"):T.border}`,background:school.status===st?(STATUS_COLORS[st]||"#888")+"20":"transparent",color:school.status===st?(STATUS_COLORS[st]||"#888"):T.textMuted,fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:school.status===st?700:400,cursor:"pointer" }}>
              {st}
            </button>
          ))}
        </div>

        {/* Inner tabs */}
        <div style={{ display:"flex",gap:5,marginBottom:10 }}>
          {[["progress","Progress"],["docs","Docs"],["emails","Emails"]].map(([v,l])=>(
            <button key={v} onClick={()=>setActiveTab(v)} style={{ padding:"3px 10px",borderRadius:8,border:`1px solid ${activeTab===v?"#7B61FF":T.border}`,background:activeTab===v?"#7B61FF15":"transparent",color:activeTab===v?"#7B61FF":T.textMuted,fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:activeTab===v?700:400,cursor:"pointer" }}>{l}</button>
          ))}
        </div>

        {/* Progress tab */}
        {activeTab==="progress"&&(
          <div>
            {(school.progress||[]).length>0&&(
              <div style={{ maxHeight:120,overflowY:"auto",marginBottom:8 }}>
                {[...(school.progress||[])].reverse().slice(0,8).map(p=>(
                  <div key={p.id} style={{ display:"flex",gap:8,fontSize:12,padding:"4px 0",borderBottom:`1px solid ${T.border}` }}>
                    <span style={{ color:T.textMuted,flexShrink:0,fontSize:11 }}>{p.date}</span>
                    <span style={{ color:T.text }}>{p.note}</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display:"flex",gap:6 }}>
              <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Log progress, contact made, update..." onKeyDown={e=>{ if(e.key==="Enter"&&note){onAddProgress(school.id,note);setNote("");} }}
                style={{ flex:1,background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:8,padding:"7px 10px",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none" }}/>
              <button onClick={()=>{ if(note){onAddProgress(school.id,note);setNote("");} }} style={{ padding:"7px 12px",borderRadius:8,border:"none",background:"#7B61FF",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,cursor:"pointer" }}>+</button>
            </div>
          </div>
        )}

        {/* Docs checklist tab */}
        {activeTab==="docs"&&(
          <div>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
              <span style={{ fontSize:12,color:T.textSub }}>{docsDone}/{DOCS.length} documents ready</span>
              <div style={{ height:5,width:80,background:T.inputBg,borderRadius:4,overflow:"hidden" }}><div style={{ height:"100%",width:`${Math.round(docsDone/DOCS.length*100)}%`,background:"#7B61FF",borderRadius:4 }}/></div>
            </div>
            {DOCS.map(d=>(
              <div key={d} onClick={()=>onUpdateField(school.id,"docs",{...docs,[d]:!docs[d]})}
                style={{ display:"flex",alignItems:"center",gap:8,padding:"6px 0",cursor:"pointer",borderBottom:`1px solid ${T.border}` }}>
                <div style={{ width:16,height:16,borderRadius:4,border:`2px solid ${docs[d]?"#7B61FF":T.border}`,background:docs[d]?"#7B61FF":"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff",flexShrink:0 }}>{docs[d]?"✓":""}</div>
                <span style={{ fontSize:12,color:docs[d]?T.text:T.textSub,textDecoration:docs[d]?"none":"none" }}>{d}</span>
              </div>
            ))}
          </div>
        )}

        {/* Emails tab */}
        {activeTab==="emails"&&(
          <div>
            {(school.emails||[]).length>0&&(
              <div style={{ maxHeight:130,overflowY:"auto",marginBottom:10 }}>
                {[...(school.emails||[])].reverse().map(e=>(
                  <div key={e.id} style={{ fontSize:12,padding:"6px 0",borderBottom:`1px solid ${T.border}` }}>
                    <div style={{ display:"flex",gap:6,alignItems:"center",marginBottom:2 }}>
                      <span style={{ fontSize:10,fontWeight:700,color:"#7B61FF",background:"#7B61FF15",padding:"1px 6px",borderRadius:5,textTransform:"uppercase" }}>{e.type}</span>
                      <span style={{ color:T.textMuted,fontSize:10 }}>{e.date}</span>
                    </div>
                    {e.to&&<div style={{ color:T.textSub,fontSize:11 }}>To: {e.to}</div>}
                    <div style={{ color:T.text }}>{e.subject}</div>
                    {e.notes&&<div style={{ color:T.textMuted,fontStyle:"italic",fontSize:11 }}>{e.notes}</div>}
                  </div>
                ))}
              </div>
            )}
            <div style={{ fontSize:11,color:T.textMuted,marginBottom:6,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em" }}>Log Email / Contact</div>
            <div style={{ display:"flex",gap:5,marginBottom:6 }}>
              {["cold","follow-up","reply","funding","SOP feedback"].map(t=>(
                <button key={t} onClick={()=>setEmailInput(p=>({...p,type:t}))} style={{ padding:"3px 8px",borderRadius:6,border:`1px solid ${emailInput.type===t?"#7B61FF":T.border}`,background:emailInput.type===t?"#7B61FF15":"transparent",color:emailInput.type===t?"#7B61FF":T.textMuted,fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:emailInput.type===t?700:400,cursor:"pointer" }}>{t}</button>
              ))}
            </div>
            <input value={emailInput.to||""} onChange={e=>setEmailInput(p=>({...p,to:e.target.value}))} placeholder="To (professor / admissions office)"
              style={{ width:"100%",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:7,padding:"6px 10px",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none",boxSizing:"border-box",marginBottom:5 }}/>
            <input value={emailInput.subject||""} onChange={e=>setEmailInput(p=>({...p,subject:e.target.value}))} placeholder="Subject / what it was about"
              style={{ width:"100%",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:7,padding:"6px 10px",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none",boxSizing:"border-box",marginBottom:5 }}/>
            <input value={emailInput.notes||""} onChange={e=>setEmailInput(p=>({...p,notes:e.target.value}))} placeholder="Notes / outcome"
              style={{ width:"100%",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:7,padding:"6px 10px",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none",boxSizing:"border-box",marginBottom:8 }}/>
            <button onClick={()=>{
              if(!emailInput.subject?.trim()) return;
              onAddEmail(school.id,{...emailInput,id:"em"+Date.now().toString(36),date:today});
              setEmailInput({type:"cold",to:"",subject:"",notes:""});
            }} style={{ width:"100%",padding:"8px",borderRadius:8,border:"none",background:"#7B61FF",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,cursor:"pointer" }}>Log Email</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── SchoolsView ───────────────────────────────────────────────────────────────
export function SchoolsView({ T, data, save, today, isMobile }) {
  const [tab, setTab] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [sf, setSf] = useState({ name:"",degree:"PhD",country:"usa",status:"researching",deadline:"",feeAmount:"",feePaid:false,notes:"" });

  const STATUS_COLORS = { researching:"#888D9B",preparing:"#E8A838",applied:"#3B9EDB",interview:"#9B6EE8",offer:"#3DBF8A",rejected:"#E84E8A",withdrawn:"#E8704A" };
  const schools = data.schools||[];
  const inp = { width:"100%",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:9,padding:"9px 12px",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:14,outline:"none",boxSizing:"border-box" };
  const lbl = { fontSize:11,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",color:T.textMuted,display:"block",marginBottom:4,marginTop:10,fontFamily:"'DM Sans',sans-serif" };
  const cs = (ex={}) => ({ background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,...ex });

  function saveSchool() {
    if (!sf.name?.trim()) return;
    if (editItem) { save(p=>({...p,schools:(p.schools||[]).map(s=>s.id===editItem.id?{...sf,id:editItem.id}:s)})); }
    else { save(p=>({...p,schools:[...(p.schools||[]),{...sf,id:"sc"+Date.now().toString(36),progress:[],emails:[],docs:{}}]})); }
    setShowForm(false); setEditItem(null);
    setSf({name:"",degree:"PhD",country:"usa",status:"researching",deadline:"",feeAmount:"",feePaid:false,notes:""});
  }

  const visible = schools.filter(s=>tab==="all"||s.country===tab);

  return (
    <div>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:8 }}>
        <div>
          <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:isMobile?20:26,color:"#7B61FF",marginBottom:2 }}>🎓 School Applications</div>
          <div style={{ fontSize:12,color:T.textSub }}>PhD &amp; Masters · Canada &amp; USA · Claude AI research built-in</div>
        </div>
        <button onClick={()=>{ setSf({name:"",degree:"PhD",country:"usa",status:"researching",deadline:"",feeAmount:"",feePaid:false,notes:""}); setEditItem(null); setShowForm(true); }}
          style={{ padding:"8px 16px",borderRadius:9,border:"none",background:"#7B61FF",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,cursor:"pointer" }}>
          + Add School
        </button>
      </div>

      {schools.length>0&&(
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,110px),1fr))",gap:8,marginBottom:14 }}>
          {[{l:"Total",v:schools.length,c:"#7B61FF"},{l:"Canada",v:schools.filter(s=>s.country==="canada").length,c:"#E84E8A"},{l:"USA",v:schools.filter(s=>s.country==="usa").length,c:"#3B9EDB"},{l:"Offers",v:schools.filter(s=>s.status==="offer").length,c:"#3DBF8A"},{l:"Applied",v:schools.filter(s=>["applied","interview"].includes(s.status)).length,c:"#E8A838"}].map(s=>(
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
          <div style={{ fontSize:13,color:T.textSub,marginBottom:14,lineHeight:1.6 }}>Add a school and use the <strong style={{ color:"#7B61FF" }}>🤖 Ask Claude</strong> button on each card to research professors, draft cold emails, and get SOP tips.</div>
          <button onClick={()=>setShowForm(true)} style={{ padding:"10px 20px",borderRadius:10,border:"none",background:"#7B61FF",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,cursor:"pointer" }}>+ Add First School</button>
        </div>
      ):(
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,300px),1fr))",gap:12 }}>
          {visible.map(s=>(
            <SchoolCard key={s.id} school={s} T={T} STATUS_COLORS={STATUS_COLORS} today={today}
              onEdit={()=>{ setSf({...s}); setEditItem(s); setShowForm(true); }}
              onDelete={()=>save(p=>({...p,schools:(p.schools||[]).filter(x=>x.id!==s.id)}))}
              onAddProgress={(id,note)=>save(p=>({...p,schools:(p.schools||[]).map(x=>x.id===id?{...x,progress:[...(x.progress||[]),{date:today,note,id:"p"+Date.now().toString(36)}]}:x)}))}
              onAddEmail={(id,em)=>save(p=>({...p,schools:(p.schools||[]).map(x=>x.id===id?{...x,emails:[...(x.emails||[]),em]}:x)}))}
              onUpdateField={(id,field,val)=>save(p=>({...p,schools:(p.schools||[]).map(x=>x.id===id?{...x,[field]:val}:x)}))}
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
            <label style={lbl}>Application Fee ($)</label>
            <div style={{ display:"flex",gap:8 }}>
              <input type="number" style={{ ...inp,flex:1 }} value={sf.feeAmount||""} onChange={e=>setSf(p=>({...p,feeAmount:e.target.value}))} placeholder="e.g. 100"/>
              <button onClick={()=>setSf(p=>({...p,feePaid:!p.feePaid}))} style={{ padding:"9px 14px",borderRadius:9,border:`1px solid ${sf.feePaid?"#3DBF8A":T.border}`,background:sf.feePaid?"#3DBF8A18":"transparent",color:sf.feePaid?"#3DBF8A":T.textSub,fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap" }}>{sf.feePaid?"✓ Paid":"Unpaid"}</button>
            </div>
            <label style={lbl}>Notes / Research Areas / Requirements</label>
            <input style={inp} value={sf.notes||""} onChange={e=>setSf(p=>({...p,notes:e.target.value}))} placeholder="Program details, professors of interest, requirements..."/>
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

// ── SiblingSchoolCard ─────────────────────────────────────────────────────────
function SiblingSchoolCard({ school, T, siblingId, save, today }) {
  const [note, setNote] = useState("");
  const STATUS = { shortlisted:"#888D9B", researching:"#E8A838", preparing:"#9B6EE8", applied:"#3B9EDB", offer:"#3DBF8A", enrolled:"#20B2AA", rejected:"#E84E8A", "not pursuing":"#888" };
  const c = STATUS[school.status]||"#888";
  const claudeUrl = encodeURIComponent(`Help me do a school application for ${school.name} (${school.degree||"undergraduate/graduate"}, ${school.country==="canada"?"Canada":"USA"}). The applicant is my sibling. Please: 1) Research the program requirements 2) Draft a personal statement outline 3) List required documents 4) Suggest professors or contacts if applicable. Notes: ${school.notes||"N/A"}`);
  function setStatus(st){ save(p=>({...p,siblings:(p.siblings||[]).map(sib=>sib.id===siblingId?{...sib,schools:(sib.schools||[]).map(sc=>sc.id===school.id?{...sc,status:st}:sc)}:sib)})); }
  function addNote(){ if(!note.trim()) return; save(p=>({...p,siblings:(p.siblings||[]).map(sib=>sib.id===siblingId?{...sib,schools:(sib.schools||[]).map(sc=>sc.id===school.id?{...sc,progress:[...(sc.progress||[]),{date:today,note,id:"sp"+Date.now().toString(36)}]}:sc)}:sib)})); setNote(""); }
  function del(){ save(p=>({...p,siblings:(p.siblings||[]).map(sib=>sib.id===siblingId?{...sib,schools:(sib.schools||[]).filter(sc=>sc.id!==school.id)}:sib)})); }

  return (
    <div style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden",borderLeft:`4px solid ${c}` }}>
      <div style={{ padding:"12px 14px" }}>
        <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,marginBottom:8 }}>
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ fontSize:13,fontWeight:700,color:T.text,lineHeight:1.3 }}>{school.name}</div>
            <div style={{ display:"flex",gap:5,marginTop:4,flexWrap:"wrap" }}>
              {school.degree&&<span style={{ fontSize:10,color:"#3B9EDB",fontWeight:600,background:"#3B9EDB15",padding:"2px 7px",borderRadius:6 }}>{school.degree}</span>}
              <span style={{ fontSize:10,color:T.textMuted }}>{school.country==="canada"?"🇨🇦":"🇺🇸"}</span>
              <span style={{ fontSize:10,color:c,fontWeight:700,background:c+"15",padding:"2px 7px",borderRadius:6 }}>{school.status||"shortlisted"}</span>
              {school.feePaid&&<span style={{ fontSize:10,color:"#3DBF8A",fontWeight:700 }}>✓ Fee</span>}
            </div>
          </div>
          <div style={{ display:"flex",gap:3,flexShrink:0 }}>
            <a href={`https://claude.ai/new?q=${claudeUrl}`} target="_blank" rel="noreferrer"
              style={{ fontSize:10,fontWeight:700,color:"#7B61FF",background:"#7B61FF12",border:"1px solid #7B61FF30",padding:"3px 7px",borderRadius:6,textDecoration:"none",fontFamily:"'DM Sans',sans-serif" }}>
              🤖
            </a>
            <button onClick={del} style={{ background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:12,padding:"2px 4px" }}>✕</button>
          </div>
        </div>

        {school.deadline&&<div style={{ fontSize:11,color:"#E8A838",fontWeight:600,marginBottom:6 }}>📅 {school.deadline}</div>}

        <div style={{ display:"flex",gap:3,flexWrap:"wrap",marginBottom:8 }}>
          {Object.keys(STATUS).map(st=>(
            <button key={st} onClick={()=>setStatus(st)}
              style={{ padding:"2px 7px",borderRadius:6,border:`1px solid ${school.status===st?(STATUS[st]||"#888"):T.border}`,background:school.status===st?(STATUS[st]||"#888")+"20":"transparent",color:school.status===st?(STATUS[st]||"#888"):T.textMuted,fontFamily:"'DM Sans',sans-serif",fontSize:9,fontWeight:school.status===st?700:400,cursor:"pointer" }}>
              {st}
            </button>
          ))}
        </div>

        {(school.progress||[]).length>0&&(
          <div style={{ maxHeight:80,overflowY:"auto",marginBottom:6 }}>
            {[...(school.progress||[])].reverse().slice(0,4).map(p=>(
              <div key={p.id} style={{ display:"flex",gap:6,fontSize:11,padding:"3px 0",borderBottom:`1px solid ${T.border}` }}>
                <span style={{ color:T.textMuted,flexShrink:0,fontSize:10 }}>{p.date}</span>
                <span style={{ color:T.text }}>{p.note}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display:"flex",gap:5 }}>
          <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Log update..." onKeyDown={e=>e.key==="Enter"&&addNote()}
            style={{ flex:1,background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:7,padding:"5px 9px",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:11,outline:"none" }}/>
          <button onClick={addNote} style={{ padding:"5px 10px",borderRadius:7,border:"none",background:"#7B61FF",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700,cursor:"pointer" }}>+</button>
        </div>
        {school.notes&&<div style={{ fontSize:11,color:T.textSub,fontStyle:"italic",marginTop:5 }}>{school.notes}</div>}
      </div>
    </div>
  );
}

// ── SiblingCard ───────────────────────────────────────────────────────────────
function SiblingCard({ sibling, T, save, today, isMobile }) {
  const [expanded, setExpanded] = useState(false);
  const [showSchoolForm, setShowSchoolForm] = useState(false);
  const [sf, setSf] = useState({ name:"",degree:"Undergraduate",country:"canada",status:"shortlisted",deadline:"",feeAmount:"",feePaid:false,notes:"" });
  const inp = { width:"100%",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:9,padding:"9px 12px",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:13,outline:"none",boxSizing:"border-box" };
  const lbl = { fontSize:11,fontWeight:600,letterSpacing:"0.07em",textTransform:"uppercase",color:T.textMuted,display:"block",marginBottom:4,marginTop:10,fontFamily:"'DM Sans',sans-serif" };

  const schools = sibling.schools||[];
  const applied = schools.filter(s=>["applied","offer","enrolled"].includes(s.status)).length;
  const offers  = schools.filter(s=>s.status==="offer"||s.status==="enrolled").length;
  const SIBLING_COLORS = ["#E84E8A","#9B6EE8","#3B9EDB","#3DBF8A","#E8A838"];
  const color = sibling.color || SIBLING_COLORS[0];

  function addSchool(){
    if(!sf.name?.trim()) return;
    save(p=>({...p,siblings:(p.siblings||[]).map(sib=>sib.id===sibling.id?{...sib,schools:[...(sib.schools||[]),{...sf,id:"ss"+Date.now().toString(36),progress:[]}]}:sib)}));
    setShowSchoolForm(false);
    setSf({name:"",degree:"Undergraduate",country:"canada",status:"shortlisted",deadline:"",feeAmount:"",feePaid:false,notes:""});
  }

  return (
    <div style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:16,overflow:"hidden",marginBottom:14 }}>
      {/* Header */}
      <div style={{ padding:"16px 18px",borderBottom:expanded?`1px solid ${T.border}`:"none",display:"flex",alignItems:"center",gap:12,cursor:"pointer" }} onClick={()=>setExpanded(p=>!p)}>
        <div style={{ width:44,height:44,borderRadius:12,background:color+"22",border:`2px solid ${color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Serif Display',serif",fontSize:18,color:color,flexShrink:0 }}>
          {sibling.name[0]}
        </div>
        <div style={{ flex:1,minWidth:0 }}>
          <div style={{ fontSize:16,fontWeight:700,color:T.text }}>{sibling.name}</div>
          <div style={{ fontSize:12,color:T.textSub,marginTop:2 }}>{sibling.relation||"Sibling"} · {schools.length} school{schools.length!==1?"s":""} shortlisted{applied>0?` · ${applied} applied`:""}
          {offers>0&&<span style={{ color:"#3DBF8A",fontWeight:700 }}> · {offers} offer{offers!==1?"s":""} 🎉</span>}
          </div>
        </div>
        <div style={{ display:"flex",gap:6,alignItems:"center" }}>
          <button onClick={e=>{ e.stopPropagation(); setShowSchoolForm(true); }}
            style={{ padding:"6px 12px",borderRadius:8,border:"none",background:color,color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap" }}>
            + School
          </button>
          <span style={{ color:T.textMuted,fontSize:16,transform:expanded?"rotate(180deg)":"none",transition:"transform 0.2s",display:"inline-block" }}>▾</span>
        </div>
      </div>

      {/* Expanded body */}
      {expanded&&(
        <div style={{ padding:"14px 16px" }}>
          {/* Stats row */}
          {schools.length>0&&(
            <div style={{ display:"flex",gap:8,marginBottom:14,flexWrap:"wrap" }}>
              {[{l:"Shortlisted",v:schools.length,c:color},{l:"Applied",v:applied,c:"#3B9EDB"},{l:"Offers",v:offers,c:"#3DBF8A"}].map(s=>(
                <div key={s.l} style={{ flex:1,minWidth:70,background:s.c+"12",border:`1px solid ${s.c}30`,borderRadius:10,padding:"8px 10px",textAlign:"center" }}>
                  <div style={{ fontSize:20,fontWeight:800,color:s.c }}>{s.v}</div>
                  <div style={{ fontSize:10,color:T.textSub,textTransform:"uppercase",letterSpacing:"0.06em" }}>{s.l}</div>
                </div>
              ))}
            </div>
          )}

          {schools.length===0?(
            <div style={{ textAlign:"center",padding:"24px 16px",background:T.inputBg,borderRadius:12,marginBottom:10 }}>
              <div style={{ fontSize:28,marginBottom:8 }}>🎓</div>
              <div style={{ fontSize:13,color:T.textSub,lineHeight:1.6,marginBottom:12 }}>No schools shortlisted yet for {sibling.name}. Start researching programs in Canada 🇨🇦 and USA 🇺🇸.</div>
              <button onClick={()=>setShowSchoolForm(true)} style={{ padding:"8px 18px",borderRadius:9,border:"none",background:color,color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,cursor:"pointer" }}>+ Add First School</button>
            </div>
          ):(
            <div style={{ display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(auto-fill,minmax(260px,1fr))",gap:10 }}>
              {schools.map(sc=>(
                <SiblingSchoolCard key={sc.id} school={sc} T={T} siblingId={sibling.id} save={save} today={today}/>
              ))}
            </div>
          )}

          {sibling.notes&&<div style={{ fontSize:12,color:T.textSub,fontStyle:"italic",marginTop:10,padding:"8px 10px",background:T.inputBg,borderRadius:8 }}>{sibling.notes}</div>}
        </div>
      )}

      {/* Add School Modal */}
      {showSchoolForm&&(
        <div style={{ position:"fixed",inset:0,zIndex:60,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center" }} onClick={e=>e.target===e.currentTarget&&setShowSchoolForm(false)}>
          <div style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:500,maxHeight:"90vh",overflowY:"auto",padding:"24px 20px 40px" }}>
            <div style={{ width:40,height:4,borderRadius:2,background:T.textMuted,margin:"0 auto 18px",opacity:0.4 }}/>
            <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:19,color,marginBottom:14 }}>Add School for {sibling.name}</div>
            <label style={lbl}>School Name *</label>
            <input style={inp} value={sf.name} onChange={e=>setSf(p=>({...p,name:e.target.value}))} placeholder="e.g. University of British Columbia"/>
            <label style={lbl}>Level</label>
            <div style={{ display:"flex",gap:5,flexWrap:"wrap",marginBottom:4 }}>
              {["Undergraduate","Masters","PhD","College/Community","Bootcamp","Other"].map(d=>(
                <button key={d} onClick={()=>setSf(p=>({...p,degree:d}))} style={{ padding:"6px 10px",borderRadius:7,border:`1px solid ${sf.degree===d?color:T.border}`,background:sf.degree===d?color+"18":"transparent",color:sf.degree===d?color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:sf.degree===d?700:400,cursor:"pointer" }}>{d}</button>
              ))}
            </div>
            <label style={lbl}>Country</label>
            <div style={{ display:"flex",gap:6,marginBottom:4 }}>
              {[["canada","🇨🇦 Canada"],["usa","🇺🇸 USA"],["uk","🇬🇧 UK"],["other","Other"]].map(([v,l])=>(
                <button key={v} onClick={()=>setSf(p=>({...p,country:v}))} style={{ flex:1,padding:"7px",borderRadius:8,border:`1px solid ${sf.country===v?color:T.border}`,background:sf.country===v?color+"18":"transparent",color:sf.country===v?color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:sf.country===v?700:400,cursor:"pointer" }}>{l}</button>
              ))}
            </div>
            <label style={lbl}>Application Deadline</label>
            <input type="date" style={{ ...inp,marginBottom:4 }} value={sf.deadline} onChange={e=>setSf(p=>({...p,deadline:e.target.value}))}/>
            <label style={lbl}>Application Fee ($)</label>
            <div style={{ display:"flex",gap:8,marginBottom:4 }}>
              <input type="number" style={{ ...inp,flex:1 }} value={sf.feeAmount} onChange={e=>setSf(p=>({...p,feeAmount:e.target.value}))} placeholder="e.g. 80"/>
              <button onClick={()=>setSf(p=>({...p,feePaid:!p.feePaid}))} style={{ padding:"9px 12px",borderRadius:9,border:`1px solid ${sf.feePaid?"#3DBF8A":T.border}`,background:sf.feePaid?"#3DBF8A18":"transparent",color:sf.feePaid?"#3DBF8A":T.textSub,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap" }}>{sf.feePaid?"✓ Paid":"Unpaid"}</button>
            </div>
            <label style={lbl}>Notes / Requirements</label>
            <input style={inp} value={sf.notes} onChange={e=>setSf(p=>({...p,notes:e.target.value}))} placeholder="Entry requirements, contact, English test, etc."/>
            <div style={{ display:"flex",gap:8,marginTop:16 }}>
              <button onClick={()=>setShowSchoolForm(false)} style={{ flex:1,padding:"11px",borderRadius:10,border:`1px solid ${T.border}`,background:"transparent",color:T.textSub,fontFamily:"'DM Sans',sans-serif",fontSize:13,cursor:"pointer" }}>Cancel</button>
              <button onClick={addSchool} style={{ flex:2,padding:"11px",borderRadius:10,border:"none",background:color,color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:700,cursor:"pointer" }}>Add School</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── LifeView ──────────────────────────────────────────────────────────────────
export function LifeView({ T, data, save, today, isMobile }) {
  const [tab, setTab] = useState("siblings");
  const [showHelperForm, setShowHelperForm] = useState(false);
  const [showFamilyForm, setShowFamilyForm] = useState(false);
  const [showSiblingForm, setShowSiblingForm] = useState(false);
  const [hf, setHf] = useState({ name:"",how:"",giveBack:"",notes:"" });
  const [ff, setFf] = useState({ name:"",relation:"",goals:"",timeline:"",notes:"" });
  const [sibf, setSibf] = useState({ name:"",relation:"Sibling",notes:"",color:"#E84E8A" });

  const helpers = data.helpers||[];
  const family  = data.family||[];
  const siblings= data.siblings||[];
  const inp = { width:"100%",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:9,padding:"9px 12px",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:14,outline:"none",boxSizing:"border-box" };
  const lbl = { fontSize:11,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",color:T.textMuted,display:"block",marginBottom:4,marginTop:10,fontFamily:"'DM Sans',sans-serif" };
  const cs = (ex={}) => ({ background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,...ex });

  const QUICK_SIBLINGS = [
    { name:"Peace",  relation:"Sister", color:"#E84E8A" },
    { name:"Favour", relation:"Sister", color:"#9B6EE8" },
    { name:"Gentle", relation:"Brother", color:"#3B9EDB" },
  ];

  function addSibling(s){ save(p=>({...p,siblings:[...(p.siblings||[]),{...s,id:"sib"+Date.now().toString(36),schools:[]}]})); }
  function quickAddSibling(qs){ if(siblings.some(s=>s.name===qs.name)) return; addSibling(qs); }

  return (
    <div>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:8 }}>
        <div>
          <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:isMobile?20:26,color:"#E84E8A",marginBottom:2 }}>❤ Life & Legacy</div>
          <div style={{ fontSize:12,color:T.textSub }}>Family · Siblings' Applications · People Who Helped</div>
        </div>
      </div>

      <div style={{ display:"flex",gap:5,marginBottom:16,overflowX:"auto",paddingBottom:2,scrollbarWidth:"none" }}>
        {[["siblings","🎓 Siblings"],["family","👨‍👩‍👧 Family"],["helpers","🤝 Helpers"]].map(([v,l])=>(
          <button key={v} onClick={()=>setTab(v)} style={{ flexShrink:0,padding:"7px 16px",borderRadius:20,border:`1px solid ${tab===v?"#E84E8A":T.border}`,background:tab===v?"#E84E8A20":"transparent",color:tab===v?"#E84E8A":T.textSub,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:tab===v?700:400,cursor:"pointer" }}>{l}</button>
        ))}
      </div>

      {/* ── SIBLINGS TAB ── */}
      {tab==="siblings"&&(
        <div>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,flexWrap:"wrap",gap:8 }}>
            <div style={{ fontSize:13,color:T.textSub,lineHeight:1.5 }}>Track school shortlists and applications for each sibling. Tap a card to expand.</div>
            <button onClick={()=>setShowSiblingForm(true)} style={{ padding:"7px 14px",borderRadius:9,border:"1px dashed #E84E8A",background:"#E84E8A08",color:"#E84E8A",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap" }}>+ Add Sibling</button>
          </div>

          {/* Quick-add Peace, Favour, Gentle if not already added */}
          {QUICK_SIBLINGS.some(qs=>!siblings.some(s=>s.name===qs.name))&&(
            <div style={{ ...cs({padding:"14px 16px"}),marginBottom:14 }}>
              <div style={{ fontSize:11,fontWeight:700,color:T.textSub,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10 }}>Quick Add</div>
              <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                {QUICK_SIBLINGS.filter(qs=>!siblings.some(s=>s.name===qs.name)).map(qs=>(
                  <button key={qs.name} onClick={()=>quickAddSibling(qs)}
                    style={{ padding:"8px 16px",borderRadius:10,border:`2px dashed ${qs.color}`,background:qs.color+"10",color:qs.color,fontFamily:"'DM Serif Display',serif",fontSize:14,fontWeight:700,cursor:"pointer" }}>
                    + {qs.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Overall stats */}
          {siblings.length>0&&(()=>{
            const allSchools = siblings.flatMap(s=>s.schools||[]);
            const totalApplied = allSchools.filter(s=>["applied","offer","enrolled"].includes(s.status)).length;
            const totalOffers = allSchools.filter(s=>["offer","enrolled"].includes(s.status)).length;
            return allSchools.length>0?(
              <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14 }}>
                {[{l:"Schools",v:allSchools.length,c:"#7B61FF"},{l:"Applied",v:totalApplied,c:"#3B9EDB"},{l:"Offers",v:totalOffers,c:"#3DBF8A"}].map(s=>(
                  <div key={s.l} style={{ ...cs({padding:"10px 12px"}),borderLeft:`3px solid ${s.c}` }}>
                    <div style={{ fontSize:22,fontWeight:800,color:T.text }}>{s.v}</div>
                    <div style={{ fontSize:10,color:T.textSub,textTransform:"uppercase",letterSpacing:"0.06em" }}>{s.l}</div>
                  </div>
                ))}
              </div>
            ):null;
          })()}

          {siblings.length===0?(
            <div style={{ ...cs({padding:"40px 20px"}),textAlign:"center" }}>
              <div style={{ fontSize:36,marginBottom:10 }}>🎓</div>
              <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:17,color:T.text,marginBottom:6 }}>No siblings added yet</div>
              <div style={{ fontSize:13,color:T.textSub,marginBottom:14,lineHeight:1.6 }}>Add Peace, Favour, and Gentle to start tracking their school applications.</div>
              <div style={{ display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap" }}>
                {QUICK_SIBLINGS.map(qs=>(
                  <button key={qs.name} onClick={()=>quickAddSibling(qs)} style={{ padding:"9px 18px",borderRadius:10,border:"none",background:qs.color,color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,cursor:"pointer" }}>+ {qs.name}</button>
                ))}
              </div>
            </div>
          ):(
            siblings.map(sib=>(
              <SiblingCard key={sib.id} sibling={sib} T={T} save={save} today={today} isMobile={isMobile}/>
            ))
          )}

          {/* Remove sibling */}
          {siblings.length>0&&(
            <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginTop:8 }}>
              {siblings.map(sib=>(
                <button key={sib.id} onClick={()=>{ if(window.confirm(`Remove ${sib.name} and all their schools?`)) save(p=>({...p,siblings:(p.siblings||[]).filter(s=>s.id!==sib.id)})); }}
                  style={{ fontSize:11,color:T.textMuted,background:"none",border:`1px solid ${T.border}`,padding:"3px 8px",borderRadius:6,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>
                  Remove {sib.name}
                </button>
              ))}
            </div>
          )}

          {showSiblingForm&&(
            <div style={{ position:"fixed",inset:0,zIndex:60,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center" }} onClick={e=>e.target===e.currentTarget&&setShowSiblingForm(false)}>
              <div style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:480,padding:"24px 20px 40px" }}>
                <div style={{ width:40,height:4,borderRadius:2,background:T.textMuted,margin:"0 auto 18px",opacity:0.4 }}/>
                <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:19,color:"#E84E8A",marginBottom:14 }}>Add Sibling</div>
                <label style={lbl}>Name *</label>
                <input style={inp} value={sibf.name} onChange={e=>setSibf(p=>({...p,name:e.target.value}))} placeholder="e.g. Peace"/>
                <label style={lbl}>Relation</label>
                <div style={{ display:"flex",gap:6,marginBottom:4 }}>
                  {["Brother","Sister"].map(r=>(
                    <button key={r} onClick={()=>setSibf(p=>({...p,relation:r}))} style={{ flex:1,padding:"8px",borderRadius:8,border:`1px solid ${sibf.relation===r?"#E84E8A":T.border}`,background:sibf.relation===r?"#E84E8A18":"transparent",color:sibf.relation===r?"#E84E8A":T.text,fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:sibf.relation===r?700:400,cursor:"pointer" }}>{r}</button>
                  ))}
                </div>
                <label style={lbl}>Notes</label>
                <input style={inp} value={sibf.notes} onChange={e=>setSibf(p=>({...p,notes:e.target.value}))} placeholder="Current school, grade, interests..."/>
                <div style={{ display:"flex",gap:8,marginTop:16 }}>
                  <button onClick={()=>setShowSiblingForm(false)} style={{ flex:1,padding:"11px",borderRadius:10,border:`1px solid ${T.border}`,background:"transparent",color:T.textSub,fontFamily:"'DM Sans',sans-serif",fontSize:13,cursor:"pointer" }}>Cancel</button>
                  <button onClick={()=>{ if(!sibf.name?.trim()) return; addSibling(sibf); setSibf({name:"",relation:"Sibling",notes:"",color:"#E84E8A"}); setShowSiblingForm(false); }} style={{ flex:2,padding:"11px",borderRadius:10,border:"none",background:"#E84E8A",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:700,cursor:"pointer" }}>Add</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── FAMILY TAB ── */}
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
                {[{l:"Name",k:"name",ph:"e.g. Mum, Dad"},{l:"Relation",k:"relation",ph:"e.g. Mother, Father"},{l:"What I Want To Do For Them",k:"goals",ph:"Get them to the US/Canada, settle with a house, car..."},{l:"Timeline",k:"timeline",ph:"e.g. Within 5 years, by 2027"},{l:"Notes",k:"notes",ph:"Any other context..."}].map(fl=>(
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

      {/* ── HELPERS TAB ── */}
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
    </div>
  );
}
