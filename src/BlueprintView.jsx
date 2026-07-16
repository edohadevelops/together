import { useState, useEffect } from "react";

const SUPABASE_URL = "https://sonbphyeomzzcdyuiotl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvbmJwaHllb216emNkeXVpb3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMzkxMjksImV4cCI6MjA4ODgxNTEyOX0.CtcZAFtqCQUOrzPBfhSfN5BZ1EQDJFVxa-FsjMX5IRg";
const HDRS = { "Content-Type":"application/json","apikey":SUPABASE_KEY,"Authorization":`Bearer ${SUPABASE_KEY}`,"Prefer":"resolution=merge-duplicates" };
async function bGet(key) { try { const r=await fetch(`${SUPABASE_URL}/rest/v1/together_data?key=eq.${key}&select=value`,{headers:HDRS}); const d=await r.json(); return d.length?JSON.parse(d[0].value):null; } catch{return null;} }
async function bSet(key,val) { try { await fetch(`${SUPABASE_URL}/rest/v1/together_data`,{method:"POST",headers:HDRS,body:JSON.stringify({key,value:JSON.stringify(val),updated_at:new Date().toISOString()})}); } catch{} }

function getWeekKey(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() + 4 - day);
  const y = d.getFullYear();
  const yStart = new Date(y, 0, 1);
  const wn = Math.ceil((((d - yStart) / 86400000) + 1) / 7);
  return `${y}-W${String(wn).padStart(2,"0")}`;
}
function getMonthKey(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
}
function fmtDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month:"short", year:"numeric" });
}
function genId() { return "bp" + Math.random().toString(36).slice(2,9); }

const PILLAR_COLORS = {
  "Faith":            "#E8A838",
  "Gloria & Marriage":"#E84E8A",
  "Career":           "#3DBF8A",
  "Masters":          "#3B9EDB",
  "Financial":        "#9B6EE8",
};

const PILLARS = ["Faith","Gloria & Marriage","Career","Masters","Financial"];

const DEFAULT_MILESTONES_A = [
  {id:"f1",  pillar:"Faith",            title:"Daily devotion — real, not routine",              date:"2026-12-31", status:"in-progress"},
  {id:"f2",  pillar:"Faith",            title:"Monthly accountability with Brother Dammy",        date:"2026-12-31", status:"in-progress"},
  {id:"f3",  pillar:"Faith",            title:"Generosity even when tight",                       date:"2027-12-31", status:"not-started"},
  {id:"g1",  pillar:"Gloria & Marriage",title:"Ask her father properly",                          date:"2026-12-31", status:"not-started"},
  {id:"g2",  pillar:"Gloria & Marriage",title:"Pre-marital counselling begins",                   date:"2027-01-31", status:"not-started"},
  {id:"g3",  pillar:"Gloria & Marriage",title:"Financial conversation done together",             date:"2026-10-31", status:"not-started"},
  {id:"g4",  pillar:"Gloria & Marriage",title:"All personal debts cleared before proposing",     date:"2026-08-31", status:"in-progress"},
  {id:"g5",  pillar:"Gloria & Marriage",title:"Married",                                          date:"2027-12-31", status:"not-started"},
  {id:"c1",  pillar:"Career",           title:"Portfolio live with 3 strong projects",            date:"2026-10-31", status:"not-started"},
  {id:"c2",  pillar:"Career",           title:"OPT application submitted",                        date:"2026-11-30", status:"not-started"},
  {id:"c3",  pillar:"Career",           title:"10 job applications sent",                         date:"2026-12-31", status:"not-started"},
  {id:"c4",  pillar:"Career",           title:"2 people in my field contacted every month",       date:"2026-12-31", status:"not-started"},
  {id:"c5",  pillar:"Career",           title:"Credit score above 650",                           date:"2026-12-31", status:"not-started"},
  {id:"m1",  pillar:"Masters",          title:"U of R applications submitted",                    date:"2026-07-31", status:"in-progress"},
  {id:"m2",  pillar:"Masters",          title:"2 more Canadian schools applied",                  date:"2026-09-30", status:"not-started"},
  {id:"m3",  pillar:"Masters",          title:"2 US PhD programs applied",                        date:"2026-11-30", status:"not-started"},
  {id:"m4",  pillar:"Masters",          title:"Thesis defended",                                  date:"2026-11-30", status:"in-progress"},
  {id:"m5",  pillar:"Masters",          title:"Graduated — MSc Mathematics",                      date:"2026-12-31", status:"in-progress"},
  {id:"fi1", pillar:"Financial",        title:"Personal debts fully cleared",                     date:"2026-08-31", status:"in-progress"},
  {id:"fi2", pillar:"Financial",        title:"Savings started and growing",                      date:"2026-09-30", status:"not-started"},
  {id:"fi3", pillar:"Financial",        title:"Financial stability achieved",                     date:"2027-12-31", status:"not-started"},
  {id:"fi4", pillar:"Financial",        title:"First business idea researched",                   date:"2028-12-31", status:"not-started"},
  {id:"fi5", pillar:"Financial",        title:"Business started",                                 date:"2030-12-31", status:"not-started"},
  {id:"fi6", pillar:"Financial",        title:"Children begin",                                   date:"2030-12-31", status:"not-started"},
];

const STATUS_CYCLE  = {"not-started":"in-progress","in-progress":"done","done":"not-started"};
const STATUS_LABEL  = {"not-started":"Not started","in-progress":"In progress","done":"Done ✓"};
const STATUS_COLOR  = (t, s) => s==="done"?"#3DBF8A":s==="in-progress"?"#E8A838":t.textMuted;

const DAILY_A = [
  {key:"faith",  icon:"✝",  label:"Open Bible & Pray",             sub:"5 minutes minimum. One verse. Talk to God."},
  {key:"future", icon:"🎯", label:"One Thing for My Future",        sub:"20+ min — thesis, job apps, portfolio, or Canada application."},
  {key:"gloria", icon:"❤", label:"Invest in Gloria & I",           sub:"Intentional time together, purity, or evening devotion."},
];
const DAILY_B = [
  {key:"faith",  icon:"✝",  label:"Open Bible & Pray",             sub:"5 minutes minimum. One verse. Talk to God."},
  {key:"future", icon:"🎯", label:"One Thing for My Future",        sub:"20+ min toward any personal goal."},
  {key:"amen",   icon:"❤", label:"Invest in Amen & I",            sub:"Intentional time together, purity, or evening devotion."},
];

const MONTHLY_QA = (U) => [
  {key:"q1", q:"What was I consistent in this month?"},
  {key:"q2", q:"Where did I drift and why?"},
  {key:"q3", q:"One thing I will do differently next month."},
  {key:"q4", q: U==="A" ? "Am I the man Gloria deserves right now?" : "Am I the woman Amen deserves right now?"},
  {key:"q5", q: U==="A" ? "Am I the man God is calling me to be?"  : "Am I the woman God is calling me to be?"},
];

const EMPTY_MONTH = {q1:"",q2:"",q3:"",q4:"",q5:""};

export default function BlueprintView({ T, mode, activeUser, TODAY }) {
  const U = activeUser || "A";
  const weekKey  = getWeekKey(TODAY);
  const monthKey = getMonthKey(TODAY);
  const now      = new Date();
  const dow      = now.getDay();
  const isSunday = dow === 0;

  const dailyKey     = `blueprint_daily_${TODAY}_${U}`;
  const weeklyKey    = `blueprint_weekly_${weekKey}_${U}`;
  const milestonesKey= `blueprint_milestones_${U}`;
  const monthlyKey   = `blueprint_monthly_${U}`;
  const streakKey    = `blueprint_streak_${U}`;

  const [tab,       setTab]       = useState("pulse");
  const [loading,   setLoading]   = useState(true);
  const [daily,     setDailyRaw]  = useState({faith:false,future:false,[U==="A"?"gloria":"amen"]:false});
  const [streak,    setStreakRaw]  = useState({count:0,lastCompleteDate:""});
  const [weekly,    setWeeklyRaw] = useState({gym:[],spark:"",tutoring:[],sunday:{}});
  const [sparkInp,  setSparkInp]  = useState("");
  const [milestones,setMilesRaw]  = useState(null);
  const [monthly,   setMonthAll]  = useState({});
  const [monthEntry,setMonthEntry]= useState(EMPTY_MONTH);
  const [monthView, setMonthView] = useState("current");
  const [addForm,   setAddForm]   = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [d,w,m,mo,s] = await Promise.all([
        bGet(dailyKey), bGet(weeklyKey), bGet(milestonesKey),
        bGet(monthlyKey), bGet(streakKey),
      ]);
      if (d)  setDailyRaw(d);
      if (w)  { setWeeklyRaw(w); setSparkInp(w.spark||""); }
      setMilesRaw(m || (U==="A" ? DEFAULT_MILESTONES_A : []));
      const moData = mo || {};
      setMonthAll(moData);
      setMonthEntry(moData[monthKey] || EMPTY_MONTH);
      if (s)  setStreakRaw(s);
      setLoading(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [U, TODAY]);

  function saveDaily(next) {
    setDailyRaw(next);
    bSet(dailyKey, next);
    const thirdKey = U==="A" ? "gloria" : "amen";
    const allDone = next.faith && next.future && next[thirdKey];
    if (allDone) {
      const yest = new Date(now); yest.setDate(yest.getDate()-1);
      const yStr = `${yest.getFullYear()}-${String(yest.getMonth()+1).padStart(2,"0")}-${String(yest.getDate()).padStart(2,"0")}`;
      if (streak.lastCompleteDate !== TODAY) {
        const ns = { count: streak.lastCompleteDate===yStr ? streak.count+1 : 1, lastCompleteDate: TODAY };
        setStreakRaw(ns); bSet(streakKey, ns);
      }
    }
  }
  function saveWeekly(next) { setWeeklyRaw(next); bSet(weeklyKey, next); }
  function saveMiles(next)  { setMilesRaw(next);  bSet(milestonesKey, next); }
  function saveMonthEntry(e) {
    setMonthEntry(e);
    const next = { ...monthly, [monthKey]: e };
    setMonthAll(next); bSet(monthlyKey, next);
  }

  const DAILY_ITEMS = U==="A" ? DAILY_A : DAILY_B;
  const thirdKey    = U==="A" ? "gloria" : "amen";
  const doneCount   = [daily.faith, daily.future, daily[thirdKey]].filter(Boolean).length;
  const allDone     = doneCount === 3;

  const gymDays   = ["Mon","Tue","Wed","Thu","Fri"];
  const gymCount  = (weekly.gym||[]).length;
  const tutCount  = (weekly.tutoring||[]).length;
  const sparkVal  = parseFloat(weekly.spark||"0") || 0;

  const weekProg = Math.min(1, (
    (gymCount  >= 4    ? 1 : gymCount  / 4)    +
    (sparkVal  >= 1000 ? 1 : sparkVal  / 1000) +
    (tutCount  >= 3    ? 1 : tutCount  / 3)
  ) / 3);

  const card = (ex={}) => ({ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16, padding:"18px 20px", marginBottom:14, ...ex });
  const inp  = { padding:"8px 12px", borderRadius:9, border:`1px solid ${T.border}`, background:T.inputBg, color:T.text, fontFamily:"'DM Sans',sans-serif", fontSize:13, outline:"none" };
  const btn  = (bg,fg,ex={}) => ({ padding:"8px 18px", borderRadius:9, border:"none", background:bg, color:fg, fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:700, cursor:"pointer", ...ex });

  const TABS = [["pulse","✦ Daily"],["week","📅 Week"],["milestones","🧭 Milestones"],["monthly","📓 Monthly"]];

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"60vh", color:T.textSub, fontFamily:"'DM Sans',sans-serif" }}>
      Loading your blueprint…
    </div>
  );

  return (
    <div style={{ maxWidth:680, margin:"0 auto", padding:"20px 16px 80px", fontFamily:"'DM Sans',sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ marginBottom:22 }}>
        <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:28, color:T.text, lineHeight:1.2 }}>Your Blueprint</div>
        <div style={{ fontSize:13, color:T.textSub, marginTop:4 }}>Who you are becoming — one day at a time.</div>
        {streak.count > 0 && (
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, marginTop:10, background:"#E8A83812", border:"1px solid #E8A83840", borderRadius:20, padding:"4px 14px" }}>
            <span>🔥</span>
            <span style={{ fontSize:12, fontWeight:700, color:"#E8A838" }}>{streak.count}-day non-negotiable streak</span>
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <div style={{ display:"flex", gap:6, marginBottom:20, flexWrap:"wrap" }}>
        {TABS.map(([id,label]) => (
          <button key={id} onClick={()=>setTab(id)}
            style={{ padding:"7px 18px", borderRadius:20, border:`1px solid ${tab===id?"#E8A838":T.border}`, background:tab===id?"#E8A83818":"transparent", color:tab===id?"#E8A838":T.textSub, fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:tab===id?700:400, cursor:"pointer" }}>
            {label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════
          DAILY PULSE
      ════════════════════════════════════════════ */}
      {tab==="pulse" && (
        <div>
          <div style={card()}>
            <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:18, color:T.text, marginBottom:3 }}>Daily Non-Negotiables</div>
            <div style={{ fontSize:12, color:T.textSub, marginBottom:18 }}>
              {allDone ? "All three done. The chain lives. ✦" : `${doneCount} of 3 done today.`}
            </div>
            {DAILY_ITEMS.map(({key, icon, label, sub}, i) => {
              const done = !!daily[key];
              return (
                <button key={key} onClick={()=>saveDaily({...daily,[key]:!done})}
                  style={{ width:"100%", display:"flex", alignItems:"center", gap:14, padding:"12px 0", background:"none", border:"none", borderBottom: i<DAILY_ITEMS.length-1 ? `1px solid ${T.border}` : "none", cursor:"pointer", textAlign:"left" }}>
                  <div style={{ width:38,height:38,borderRadius:"50%",flexShrink:0,background:done?"#3DBF8A1A":"transparent",border:`2px solid ${done?"#3DBF8A":T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:done?14:18,color:done?"#3DBF8A":T.textSub,transition:"all 0.15s" }}>
                    {done ? "✓" : icon}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14,fontWeight:600,color:done?"#3DBF8A":T.text,textDecoration:done?"line-through":"none" }}>{label}</div>
                    <div style={{ fontSize:11,color:T.textSub,marginTop:2,lineHeight:1.5 }}>{sub}</div>
                  </div>
                </button>
              );
            })}
            <div style={{ marginTop:16,fontSize:11,color:T.textMuted,fontStyle:"italic",lineHeight:1.7 }}>
              The minimum version keeps the chain alive. One verse. One thing. One moment together.
            </div>
          </div>

          {/* Streak card */}
          <div style={{ ...card({paddingBottom:20}), textAlign:"center" }}>
            <div style={{ fontSize:42, marginBottom:6 }}>{allDone?"🔥":streak.count>0?"✦":"○"}</div>
            <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:24, color:T.text }}>
              {streak.count>0 ? `${streak.count} day${streak.count!==1?"s":""}` : "Start your streak today"}
            </div>
            <div style={{ fontSize:12,color:T.textSub,marginTop:6,lineHeight:1.6 }}>
              {streak.count===0
                ? "Check all three non-negotiables to begin."
                : streak.lastCompleteDate===TODAY
                  ? "Today counted. See you tomorrow."
                  : "An unbroken chain of minimums builds more character than perfect weeks followed by drift."}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
          WEEKLY SNAPSHOT
      ════════════════════════════════════════════ */}
      {tab==="week" && (
        <div>
          {/* Progress bar */}
          <div style={card({paddingBottom:16})}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
              <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:16,color:T.text }}>This Week</div>
              <div style={{ fontSize:12,color:T.textSub }}>{Math.round(weekProg*100)}% on track</div>
            </div>
            <div style={{ height:7,borderRadius:4,background:T.inputBg,overflow:"hidden" }}>
              <div style={{ height:"100%",width:`${weekProg*100}%`,background:weekProg>=1?"#3DBF8A":weekProg>=0.6?"#E8A838":"#E84E8A",borderRadius:4,transition:"width 0.4s" }}/>
            </div>
          </div>

          {/* Gym */}
          <div style={card()}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
              <div>
                <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:16,color:T.text }}>Gym</div>
                <div style={{ fontSize:11,color:T.textSub }}>Show up 4 of 5 weekdays. Showing up counts.</div>
              </div>
              <div style={{ fontSize:14,fontWeight:800,color:gymCount>=4?"#3DBF8A":T.text }}>{gymCount}/4</div>
            </div>
            <div style={{ display:"flex",gap:8 }}>
              {gymDays.map(day => {
                const on = (weekly.gym||[]).includes(day);
                return (
                  <button key={day} onClick={()=>{ const g=weekly.gym||[]; saveWeekly({...weekly,gym:on?g.filter(x=>x!==day):[...g,day]}); }}
                    style={{ flex:1,padding:"10px 4px",borderRadius:10,border:`1px solid ${on?"#3DBF8A":T.border}`,background:on?"#3DBF8A1A":T.inputBg,color:on?"#3DBF8A":T.textSub,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:on?700:400 }}>
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Spark */}
          <div style={card()}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
              <div>
                <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:16,color:T.text }}>Spark Driving</div>
                <div style={{ fontSize:11,color:T.textSub }}>Weekly target: $1,000</div>
              </div>
              <div style={{ fontSize:14,fontWeight:800,color:sparkVal>=1000?"#3DBF8A":T.text }}>${sparkVal.toFixed(0)} / $1,000</div>
            </div>
            <div style={{ height:6,borderRadius:3,background:T.inputBg,overflow:"hidden",marginBottom:12 }}>
              <div style={{ height:"100%",width:`${Math.min(100,sparkVal/10)}%`,background:"#3DBF8A",borderRadius:3,transition:"width 0.4s" }}/>
            </div>
            <div style={{ display:"flex",gap:8 }}>
              <input type="number" value={sparkInp} onChange={e=>setSparkInp(e.target.value)}
                placeholder="e.g. 340" style={{ ...inp, flex:1 }}/>
              <button onClick={()=>saveWeekly({...weekly,spark:sparkInp})} style={btn("#3DBF8A","#fff")}>Save</button>
            </div>
          </div>

          {/* Tutoring */}
          <div style={card()}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
              <div>
                <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:16,color:T.text }}>Tutoring</div>
                <div style={{ fontSize:11,color:T.textSub }}>3 sessions per week · 7pm–9pm</div>
              </div>
              <div style={{ fontSize:14,fontWeight:800,color:tutCount>=3?"#3DBF8A":T.text }}>{tutCount}/3</div>
            </div>
            <div style={{ display:"flex",gap:8 }}>
              {[1,2,3].map(idx => {
                const on = (weekly.tutoring||[]).includes(idx);
                return (
                  <button key={idx} onClick={()=>{ const t=weekly.tutoring||[]; saveWeekly({...weekly,tutoring:on?t.filter(x=>x!==idx):[...t,idx]}); }}
                    style={{ flex:1,padding:"12px 8px",borderRadius:10,border:`1px solid ${on?"#3B9EDB":T.border}`,background:on?"#3B9EDB1A":T.inputBg,color:on?"#3B9EDB":T.textSub,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:on?700:400 }}>
                    Session {idx}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sunday Review */}
          <div style={{ ...card(), opacity:isSunday?1:0.6, pointerEvents:isSunday?"auto":"none" }}>
            <div style={{ marginBottom:12 }}>
              <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:16,color:T.text }}>Sunday Evening Review</div>
              <div style={{ fontSize:11,color:T.textSub }}>{isSunday?"Tonight is Sunday. Answer honestly.":"Unlocks on Sundays."}</div>
            </div>
            {[
              {key:"q1",q:"Did I show up to God this week — even minimally?"},
              {key:"q2",q:"Did I move toward my future at least 4 of 7 days?"},
              {key:"q3",q:U==="A"?"Did I love Gloria well and protect what we have?":"Did I love Amen well and protect what we have?"},
            ].map(({key,q},i) => {
              const val = weekly.sunday?.[key];
              return (
                <div key={key} style={{ padding:"10px 0",borderBottom:i<2?`1px solid ${T.border}`:"none" }}>
                  <div style={{ fontSize:13,color:T.text,marginBottom:8,lineHeight:1.5 }}>{q}</div>
                  <div style={{ display:"flex",gap:8 }}>
                    {["yes","no"].map(v => (
                      <button key={v} onClick={()=>saveWeekly({...weekly,sunday:{...(weekly.sunday||{}),[key]:v}})}
                        style={{ padding:"6px 20px",borderRadius:8,border:`1px solid ${val===v?(v==="yes"?"#3DBF8A":"#E84E8A"):T.border}`,background:val===v?(v==="yes"?"#3DBF8A1A":"#E84E8A1A"):"transparent",color:val===v?(v==="yes"?"#3DBF8A":"#E84E8A"):T.textSub,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,cursor:"pointer" }}>
                        {v==="yes"?"Yes":"No"}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
          MILESTONES
      ════════════════════════════════════════════ */}
      {tab==="milestones" && (
        <div>
          <div style={{ fontSize:13,color:T.textSub,marginBottom:18,lineHeight:1.7 }}>
            Your compass, not a checklist. Each milestone is a marker on the road to who you are becoming.
            Click the circle to cycle through status.
          </div>
          {PILLARS.map(pillar => {
            const color = PILLAR_COLORS[pillar]||"#E8A838";
            const items = (milestones||[]).filter(m=>m.pillar===pillar);
            return (
              <div key={pillar} style={card()}>
                <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:14 }}>
                  <div style={{ width:10,height:10,borderRadius:"50%",background:color,flexShrink:0 }}/>
                  <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:17,color }}>{pillar}</div>
                  <div style={{ fontSize:11,color:T.textMuted,marginLeft:"auto" }}>
                    {items.filter(m=>m.status==="done").length}/{items.length} done
                  </div>
                </div>
                {items.length===0 && (
                  <div style={{ fontSize:12,color:T.textMuted,fontStyle:"italic",padding:"4px 0 8px" }}>No milestones yet.</div>
                )}
                {items.map((m,i) => {
                  const sc = STATUS_COLOR(T,m.status);
                  return (
                    <div key={m.id} style={{ display:"flex",alignItems:"flex-start",gap:10,padding:"10px 0",borderTop:i>0?`1px solid ${T.border}`:"none" }}>
                      <button title="Click to cycle status"
                        onClick={()=>saveMiles((milestones||[]).map(x=>x.id===m.id?{...x,status:STATUS_CYCLE[x.status]}:x))}
                        style={{ width:20,height:20,borderRadius:"50%",border:`2px solid ${sc}`,background:m.status==="done"?sc:"transparent",flexShrink:0,cursor:"pointer",marginTop:1,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff",transition:"all 0.15s" }}>
                        {m.status==="done"?"✓":m.status==="in-progress"?"·":""}
                      </button>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ fontSize:13,fontWeight:500,color:m.status==="done"?T.textSub:T.text,textDecoration:m.status==="done"?"line-through":"none",lineHeight:1.4 }}>{m.title}</div>
                        <div style={{ fontSize:10,color:sc,marginTop:3,display:"flex",gap:8 }}>
                          <span>{STATUS_LABEL[m.status]}</span>
                          {m.date&&<span style={{ color:T.textMuted }}>· {fmtDate(m.date)}</span>}
                        </div>
                      </div>
                      <button onClick={()=>saveMiles((milestones||[]).filter(x=>x.id!==m.id))}
                        style={{ background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:16,padding:"0 2px",flexShrink:0,lineHeight:1 }}>×</button>
                    </div>
                  );
                })}
                {/* Add milestone to this pillar */}
                {addForm?.pillar===pillar ? (
                  <div style={{ marginTop:10,paddingTop:10,borderTop:`1px solid ${T.border}` }}>
                    <input autoFocus value={addForm.title} onChange={e=>setAddForm(f=>({...f,title:e.target.value}))}
                      placeholder="Milestone title…" style={{ ...inp,width:"100%",boxSizing:"border-box",marginBottom:8 }}/>
                    <div style={{ display:"flex",gap:8,marginBottom:8 }}>
                      <input type="date" value={addForm.date} onChange={e=>setAddForm(f=>({...f,date:e.target.value}))}
                        style={{ ...inp,flex:1 }}/>
                      <select value={addForm.status} onChange={e=>setAddForm(f=>({...f,status:e.target.value}))}
                        style={{ ...inp,flex:1,cursor:"pointer" }}>
                        <option value="not-started">Not started</option>
                        <option value="in-progress">In progress</option>
                        <option value="done">Done</option>
                      </select>
                    </div>
                    <div style={{ display:"flex",gap:8 }}>
                      <button onClick={()=>{
                        if (!addForm.title.trim()) return;
                        saveMiles([...(milestones||[]),{id:genId(),pillar,title:addForm.title.trim(),date:addForm.date,status:addForm.status}]);
                        setAddForm(null);
                      }} style={btn(color,"#fff",{flex:1})}>Add</button>
                      <button onClick={()=>setAddForm(null)} style={btn(T.inputBg,T.textSub,{flex:1})}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={()=>setAddForm({pillar,title:"",date:"",status:"not-started"})}
                    style={{ marginTop:8,padding:"6px 0",background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,width:"100%",textAlign:"left" }}>
                    + Add milestone
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ════════════════════════════════════════════
          MONTHLY CHARACTER CHECK
      ════════════════════════════════════════════ */}
      {tab==="monthly" && (
        <div>
          {/* Month selector */}
          <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:16 }}>
            {["current",...Object.keys(monthly).filter(k=>k!==monthKey).sort().reverse()].map(k => {
              const label = k==="current" ? `${monthKey} (now)` : k;
              return (
                <button key={k} onClick={()=>{
                  setMonthView(k);
                  setMonthEntry(k==="current" ? (monthly[monthKey]||EMPTY_MONTH) : (monthly[k]||EMPTY_MONTH));
                }} style={{ padding:"5px 14px",borderRadius:16,border:`1px solid ${monthView===k?"#E84E8A":T.border}`,background:monthView===k?"#E84E8A18":"transparent",color:monthView===k?"#E84E8A":T.textSub,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:monthView===k?700:400,cursor:"pointer" }}>
                  {label}
                </button>
              );
            })}
          </div>

          {!isSunday && new Date().getDate()>7 && monthView==="current" && !(monthly[monthKey]) && (
            <div style={{ ...card({padding:"12px 16px",marginBottom:12}), background:"#E8A83808",border:"1px solid #E8A83830" }}>
              <div style={{ fontSize:12,color:"#E8A838",lineHeight:1.6 }}>✦ This check is designed for the first Sunday of each month. You can write now and it will be saved.</div>
            </div>
          )}

          <div style={card()}>
            <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:18,color:T.text,marginBottom:4 }}>Monthly Character Check</div>
            <div style={{ fontSize:12,color:T.textSub,marginBottom:20 }}>
              {monthView==="current" ? "An honest look at who you were this month." : `Looking back at ${monthView}.`}
            </div>
            {MONTHLY_QA(U).map(({key,q},i) => (
              <div key={key} style={{ marginBottom:18 }}>
                <div style={{ fontSize:13,fontWeight:600,color:T.text,marginBottom:7,lineHeight:1.5 }}>
                  <span style={{ color:"#E84E8A",marginRight:6 }}>{i+1}.</span>{q}
                </div>
                <textarea rows={3} value={monthEntry[key]||""} readOnly={monthView!=="current"}
                  onChange={e=>setMonthEntry(prev=>({...prev,[key]:e.target.value}))}
                  placeholder="Write honestly…"
                  style={{ ...inp,width:"100%",boxSizing:"border-box",resize:"vertical",lineHeight:1.6,opacity:monthView!=="current"?0.65:1 }}/>
              </div>
            ))}
            {monthView==="current" && (
              <button onClick={()=>saveMonthEntry(monthEntry)}
                style={btn("#E84E8A","#fff",{width:"100%",padding:"12px",borderRadius:10,fontSize:14})}>
                Save This Month's Check
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
