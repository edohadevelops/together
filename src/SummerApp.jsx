import { useState, useEffect } from "react";

const SUPABASE_URL = "https://sonbphyeomzzcdyuiotl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvbmJwaHllb216emNkeXVpb3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMzkxMjksImV4cCI6MjA4ODgxNTEyOX0.CtcZAFtqCQUOrzPBfhSfN5BZ1EQDJFVxa-FsjMX5IRg";
const HDRS = {
  "Content-Type": "application/json",
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Prefer": "resolution=merge-duplicates",
};
async function sGet(key) {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/together_data?key=eq.${key}&select=value`, { headers: HDRS });
    const d = await r.json();
    return d.length ? JSON.parse(d[0].value) : null;
  } catch { return null; }
}
async function sSet(key, value) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/together_data`, {
      method: "POST", headers: HDRS,
      body: JSON.stringify({ key, value: JSON.stringify(value), updated_at: new Date().toISOString() }),
    });
  } catch {}
}

const PCOL = { faith:"#E8C050", fitness:"#3DBF8A", thesis:"#9B6EE8", reading:"#3B9EDB", gloria:"#E84E8A", sidegig:"#20B2AA" };
const CAT_COL = { faith:"#E8C050", fitness:"#3DBF8A", reading:"#3B9EDB", thesis:"#9B6EE8", gloria:"#E84E8A", sidegig:"#20B2AA", morning:"#E8704A", evening:"#9B6EE8", nutrition:"#3DBF8A", work:"#888", planning:"#C8B030" };

const WD_ITEMS = [
  { id:"wake",       label:"Wake up + hydrate (4:30am)",                 cat:"morning"   },
  { id:"devotion",   label:"Morning devotion — prayer + Bible + worship", cat:"faith"     },
  { id:"run",        label:"Warm-up + run 20–25 min",                    cat:"fitness"   },
  { id:"strength",   label:"Strength workout 30–40 min",                 cat:"fitness"   },
  { id:"breakfast",  label:"Shower + high-protein breakfast",            cat:"morning"   },
  { id:"commute_ab", label:"Audiobook on commute (7:30am)",              cat:"reading"   },
  { id:"camp",       label:"Camp work (8am–5pm)",                        cat:"work"      },
  { id:"lunch_ab",   label:"Audiobook/reading at lunch",                 cat:"reading"   },
  { id:"thesis",     label:"Thesis 80 min (5:30pm)",                     cat:"thesis"    },
  { id:"dinner",     label:"Dinner + rest (7pm)",                        cat:"evening"   },
  { id:"evening_r",  label:"Evening wind-down reading (9pm)",            cat:"reading"   },
  { id:"gloria",     label:"Time with Gloria — 30–60 min (10:30pm)",     cat:"gloria"    },
  { id:"night_p",    label:"Night prayer (11:15pm)",                     cat:"faith"     },
  { id:"protein",    label:"Protein every meal",                         cat:"nutrition" },
  { id:"water",      label:"3–4L water",                                 cat:"nutrition" },
  { id:"no_sugar",   label:"No sugar / fried food",                      cat:"nutrition" },
];
const SAT_ITEMS = [
  { id:"devotion",  label:"Morning devotion (4:30am)",          cat:"faith"    },
  { id:"long_run",  label:"Long run + full body workout",        cat:"fitness"  },
  { id:"meal_prep", label:"Meal prep for the week",             cat:"morning"  },
  { id:"gig1",      label:"Side gig — client work 3 hrs (8am)", cat:"sidegig"  },
  { id:"content",   label:"Content batch — 2 hrs (11am)",       cat:"sidegig"  },
  { id:"gig2",      label:"Side gig — client work 3 hrs (2pm)", cat:"sidegig"  },
  { id:"thesis",    label:"Thesis 80 min (5pm)",                cat:"thesis"   },
  { id:"gloria",    label:"Gloria time + night prayer (10:30pm)",cat:"gloria"  },
  { id:"protein",   label:"Protein every meal",                 cat:"nutrition"},
  { id:"water",     label:"3–4L water",                         cat:"nutrition"},
];
const SUN_ITEMS = [
  { id:"long_dev",  label:"Long devotion + reflection (5:30am)", cat:"faith"   },
  { id:"rest_morn", label:"Slow morning + breakfast (7am)",      cat:"morning" },
  { id:"gig",       label:"Side gig — 4 hrs (9am)",              cat:"sidegig" },
  { id:"phys_book", label:"Physical book — 1 hr (3pm)",          cat:"reading" },
  { id:"wk_plan",   label:"Weekly planning — all 6 pillars (4pm)",cat:"planning"},
  { id:"gloria",    label:"Gloria time + night prayer (10:30pm)", cat:"gloria" },
  { id:"protein",   label:"Protein every meal",                  cat:"nutrition"},
  { id:"water",     label:"3–4L water",                          cat:"nutrition"},
];

const PILLARS = [
  { id:"overview",  label:"Overview",  icon:"◉", color:"#E8A838"     },
  { id:"checklist", label:"Checklist", icon:"☐", color:"#E8704A"     },
  { id:"faith",     label:"Faith",     icon:"✦", color:PCOL.faith    },
  { id:"fitness",   label:"Fitness",   icon:"◈", color:PCOL.fitness  },
  { id:"thesis",    label:"Thesis",    icon:"✎", color:PCOL.thesis   },
  { id:"reading",   label:"Reading",   icon:"◐", color:PCOL.reading  },
  { id:"gloria",    label:"Gloria",    icon:"♡", color:PCOL.gloria   },
  { id:"sidegig",   label:"Side Gig",  icon:"◆", color:PCOL.sidegig  },
];

function weekStr(d = new Date()) {
  const thu = new Date(d); thu.setDate(d.getDate() - ((d.getDay() + 6) % 7) + 3);
  const y = thu.getFullYear(), w = Math.ceil(((thu - new Date(y, 0, 1)) / 86400000 + 1) / 7);
  return `${y}-W${String(w).padStart(2, "0")}`;
}

function calcStreak(arr) {
  if (!arr?.length) return 0;
  const today = new Date().toISOString().slice(0, 10);
  const dates = [...new Set(arr.map(e => e.date))].sort().reverse();
  let s = 0; const d = new Date(today);
  for (const dt of dates) {
    if (dt === d.toISOString().slice(0, 10)) { s++; d.setDate(d.getDate() - 1); } else break;
  }
  return s;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PBar({ value, max = 100, color = "#E8A838", h = 6, inputBg }) {
  return (
    <div style={{ height:h, background:inputBg||"rgba(255,255,255,0.05)", borderRadius:h, overflow:"hidden" }}>
      <div style={{ height:"100%", width:`${Math.min((value / max) * 100, 100)}%`, background:color, borderRadius:h, transition:"width 0.4s" }}/>
    </div>
  );
}

function StatCard({ label, value, sub, color, T }) {
  return (
    <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, padding:"14px 16px", flex:"1 1 130px", borderLeft:`3px solid ${color}` }}>
      <div style={{ fontSize:24, fontWeight:700, color:T.text, lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:10, fontWeight:600, color:T.textSub, marginTop:3, textTransform:"uppercase", letterSpacing:"0.08em" }}>{label}</div>
      {sub && <div style={{ fontSize:11, color:T.textMuted, marginTop:3 }}>{sub}</div>}
    </div>
  );
}

function Modal({ title, accent, onClose, onSave, children, T, mode }) {
  const inp = { width:"100%", background:T.inputBg, border:`1px solid ${T.border}`, borderRadius:9, padding:"10px 13px", color:T.text, fontFamily:"'DM Sans',sans-serif", fontSize:14, outline:"none", boxSizing:"border-box" };
  const lbl = { fontSize:11, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", color:T.textMuted, display:"block", marginBottom:5, marginTop:14, fontFamily:"'DM Sans',sans-serif" };
  return (
    <div style={{ position:"fixed", inset:0, zIndex:50, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(6px)", display:"flex", alignItems:"flex-end", justifyContent:"center" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:"18px 18px 0 0", boxShadow:"0 -4px 32px rgba(0,0,0,0.3)", width:"100%", maxWidth:540, maxHeight:"92vh", overflowY:"auto", padding:"24px 20px 36px" }}>
        <div style={{ width:40, height:4, borderRadius:2, background:T.textMuted, margin:"0 auto 20px", opacity:0.4 }}/>
        <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:22, color:T.text, marginBottom:4 }}>{title}</div>
        <div style={{ height:2, width:40, background:accent, borderRadius:2, marginBottom:20 }}/>
        {children({ inp, lbl })}
        <div style={{ display:"flex", gap:10, marginTop:24, justifyContent:"flex-end" }}>
          <button style={{ padding:"9px 20px", borderRadius:9, border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600, background:T.inputBg, color:T.textSub }} onClick={onClose}>Cancel</button>
          <button style={{ padding:"9px 20px", borderRadius:9, border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600, background:accent, color:"#fff" }} onClick={onSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

function ToggleBtn({ active, color, onClick, label, T }) {
  return (
    <button onClick={onClick} style={{ flex:1, padding:"10px", borderRadius:9, border:`1px solid ${active ? color : T.border}`, background:active ? color+"22" : T.inputBg, color:active ? color : T.textSub, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:active ? 700 : 400 }}>
      {label}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SummerApp({ mode, T, onBack }) {
  const today = new Date().toISOString().slice(0, 10);
  const dow = new Date().getDay();
  const isSat = dow === 6, isSun = dow === 0;
  const thisWeek = weekStr();

  const [pillar, setPillar] = useState("overview");
  const [data, setDataState] = useState(null);
  const [showForm, setShowForm] = useState(null);

  // form states
  const [df, setDf] = useState({ passage:"", insight:"", prayer:false, worship:false });
  const [tf, setTf] = useState({ notes:"", duration:80 });
  const [rf, setRf] = useState({ title:"", format:"audiobook", amount:"", completed:false });
  const [gf, setGf] = useState({ appreciation:"", highlight:"", prayed:false });
  const [sf, setSf] = useState({ project:"", hours:"", revenue:"", contentBatched:false });
  const [ff, setFf] = useState({ runDist:"", runTime:"", workoutType:"Upper Body" });
  const [wf, setWf] = useState({ faith:"", fitness:"", thesis:"", reading:"", gloria:"", sidegig:"" });

  useEffect(() => {
    (async () => {
      const stored = await sGet("summer_amen");
      setDataState(stored ?? { checklist:{}, devotion:[], thesis:[], reading:[], fitness:[], gloria:[], sidegig:[], intentions:{} });
    })();
  }, []);

  function save(fn) {
    setDataState(prev => {
      const next = typeof fn === "function" ? fn(prev) : fn;
      sSet("summer_amen", next);
      return next;
    });
  }

  if (!data) return (
    <div style={{ display:"flex", height:"100vh", alignItems:"center", justifyContent:"center", background:"#111", color:"#E8A838", fontFamily:"'DM Sans',sans-serif", fontSize:16 }}>
      Loading summer OS...
    </div>
  );

  // ── Derived values ────────────────────────────────────────────────────────
  const todayItems = isSat ? SAT_ITEMS : isSun ? SUN_ITEMS : WD_ITEMS;
  const checks = data.checklist[today] || {};
  const doneCount = todayItems.filter(i => checks[i.id]).length;
  const pct = Math.round((doneCount / todayItems.length) * 100);

  function toggleCheck(id) {
    save(p => ({ ...p, checklist: { ...p.checklist, [today]: { ...(p.checklist[today] || {}), [id]: !p.checklist[today]?.[id] } } }));
  }

  function thesisWeekHrs() {
    const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const mon = d.toISOString().slice(0, 10);
    return data.thesis.filter(s => s.date >= mon).reduce((sum, s) => sum + (Number(s.duration) || 80), 0) / 60;
  }
  function gigMonthRevenue() {
    return data.sidegig.filter(s => s.date?.startsWith(today.slice(0, 7))).reduce((sum, s) => sum + (Number(s.revenue) || 0), 0);
  }
  function booksThisMonth() {
    return data.reading.filter(r => r.completed && r.date?.startsWith(today.slice(0, 7))).length;
  }

  const weekHrs = thesisWeekHrs();
  const monthRev = gigMonthRevenue();
  const monthBooks = booksThisMonth();
  const devStreak = calcStreak(data.devotion);
  const fitStreak = calcStreak(data.fitness);
  const gloriaStreak = calcStreak(data.gloria);
  const savedIntentions = data.intentions[thisWeek] || {};
  const currentBook = [...data.reading].reverse().find(r => !r.completed)?.title || "—";

  // ── Style helpers ─────────────────────────────────────────────────────────
  const cs = (x = {}) => ({ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, padding:"18px 20px", ...x });
  const inp = { width:"100%", background:T.inputBg, border:`1px solid ${T.border}`, borderRadius:9, padding:"10px 13px", color:T.text, fontFamily:"'DM Sans',sans-serif", fontSize:14, outline:"none", boxSizing:"border-box" };
  const lbl = { fontSize:11, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", color:T.textMuted, display:"block", marginBottom:5, marginTop:14, fontFamily:"'DM Sans',sans-serif" };
  const sel = { ...inp, background:mode==="dark"?"#181B23":"#fff", cursor:"pointer" };

  const last7 = Array.from({length:7}, (_, i) => { const d = new Date(today); d.setDate(d.getDate() - (6 - i)); return d.toISOString().slice(0, 10); });

  // ── Sidebar ───────────────────────────────────────────────────────────────
  return (
    <div style={{ display:"flex", height:"100vh", fontFamily:"'DM Sans',sans-serif", background:T.bg, overflow:"hidden" }}>
      <style>{`
        .sum-sb { width:190px; min-width:190px; }
        .sum-mob { display:none!important; }
        @media(max-width:640px) { .sum-sb{display:none!important} .sum-mob{display:flex!important} }
      `}</style>

      {/* Left sidebar */}
      <div className="sum-sb" style={{ background:"#111418", borderRight:"1px solid rgba(255,255,255,0.07)", display:"flex", flexDirection:"column", overflowY:"auto" }}>
        <div style={{ padding:"18px 14px 10px" }}>
          <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:16, color:"#E8A838" }}>Summer OS ☀️</div>
          <div style={{ fontSize:10, color:"#555", marginTop:2 }}>Amen · {new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"})}</div>
        </div>

        <div style={{ padding:"8px 14px 12px", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
            <span style={{ fontSize:10, color:"#555", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>Today</span>
            <span style={{ fontSize:12, fontWeight:700, color:pct>=80?"#3DBF8A":"#E8A838" }}>{pct}%</span>
          </div>
          <div style={{ height:4, background:"rgba(255,255,255,0.07)", borderRadius:2, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${pct}%`, background:pct>=80?"#3DBF8A":"#E8A838", borderRadius:2, transition:"width 0.4s" }}/>
          </div>
          <div style={{ fontSize:9, color:"#444", marginTop:3 }}>{doneCount}/{todayItems.length} blocks done</div>
        </div>

        <div style={{ padding:"8px 6px", flex:1 }}>
          {PILLARS.map(p => (
            <button key={p.id} onClick={() => setPillar(p.id)}
              style={{ width:"100%", display:"flex", alignItems:"center", gap:8, padding:"8px 10px", borderRadius:9, border:"none", background:pillar===p.id ? p.color+"20":"transparent", cursor:"pointer", textAlign:"left", marginBottom:2, outline:pillar===p.id?`1px solid ${p.color}33`:"none", transition:"all 0.15s" }}>
              <span style={{ fontSize:15, width:18, textAlign:"center", color:pillar===p.id?p.color:"#555" }}>{p.icon}</span>
              <span style={{ fontSize:12, fontWeight:pillar===p.id?700:400, color:pillar===p.id?p.color:"#888" }}>{p.label}</span>
            </button>
          ))}
        </div>

        <div style={{ padding:"10px 6px", borderTop:"1px solid rgba(255,255,255,0.07)" }}>
          <button onClick={onBack} style={{ width:"100%", padding:"8px 10px", borderRadius:9, border:"1px solid rgba(255,255,255,0.07)", background:"transparent", color:"#555", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:600 }}>
            {"← Back to Tasks"}
          </button>
        </div>
      </div>

      {/* Mobile bottom tab bar */}
      <div className="sum-mob" style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:10, background:"#111418", borderTop:"1px solid rgba(255,255,255,0.07)", flexWrap:"nowrap", overflowX:"auto" }}>
        {PILLARS.map(p => (
          <button key={p.id} onClick={() => setPillar(p.id)} style={{ flex:"1 0 auto", padding:"8px 6px", border:"none", background:"transparent", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:9, color:pillar===p.id?p.color:"#555", borderTop:`2px solid ${pillar===p.id?p.color:"transparent"}` }}>
            <div style={{ fontSize:14 }}>{p.icon}</div>
            <div>{p.label}</div>
          </button>
        ))}
      </div>

      {/* Main content */}
      <div style={{ flex:1, overflowY:"auto", padding:"28px 24px 80px", maxHeight:"100vh" }}>

        {/* ═══ OVERVIEW ═══ */}
        {pillar==="overview" && (
          <div>
            <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:30, color:T.text, marginBottom:4 }}>{"Amen's Summer ☀️"}</div>
            <div style={{ fontSize:13, color:T.textSub, marginBottom:24 }}>{"Your summer at a glance — "}{new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</div>

            {Object.values(savedIntentions).some(Boolean) && (
              <div style={{ background:mode==="dark"?"linear-gradient(135deg,#1a1200,#1a0a18)":"linear-gradient(135deg,#fff8e6,#f0e6ff)", border:"1px solid #E8A83833", borderRadius:14, padding:"18px 20px", marginBottom:24 }}>
                <div style={{ fontSize:11, fontWeight:700, color:"#E8A838", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12 }}>{"✦ This Week's Intentions"}</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:8 }}>
                  {Object.entries(savedIntentions).map(([k,v]) => v ? (
                    <div key={k} style={{ fontSize:12, color:T.text }}><span style={{ color:PCOL[k]||"#888", fontWeight:700, textTransform:"capitalize" }}>{k}{": "}</span>{v}</div>
                  ) : null)}
                </div>
              </div>
            )}

            <div style={{ display:"flex", flexWrap:"wrap", gap:12, marginBottom:20 }}>
              <StatCard T={T} label="Thesis hrs/wk" value={`${weekHrs.toFixed(1)}`} sub="Target: 8 hrs" color={PCOL.thesis}/>
              <StatCard T={T} label="Books/month" value={`${monthBooks}/3`} sub="Target: 3 books" color={PCOL.reading}/>
              <StatCard T={T} label="Devotion streak" value={`${devStreak}d`} sub="Days in a row" color={PCOL.faith}/>
              <StatCard T={T} label="Fitness streak" value={`${fitStreak}d`} sub="Mon–Sat" color={PCOL.fitness}/>
              <StatCard T={T} label="Gloria streak" value={`${gloriaStreak}d`} sub="Every evening" color={PCOL.gloria}/>
              <StatCard T={T} label="Month revenue" value={`$${monthRev}`} sub="Target: $2,000" color={PCOL.sidegig}/>
            </div>

            <div style={{ ...cs({marginBottom:16}) }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <div style={{ fontWeight:700, color:T.text, fontSize:15 }}>{"✎ Thesis This Week"}</div>
                <div style={{ fontSize:13, fontWeight:700, color:PCOL.thesis }}>{weekHrs.toFixed(1)}{" / 8 hrs"}</div>
              </div>
              <PBar value={weekHrs} max={8} color={PCOL.thesis} h={8} inputBg={T.inputBg}/>
              <div style={{ fontSize:11, color:T.textMuted, marginTop:6 }}>{"6 days × 80 min = 8 hrs · Mon–Sat at 5:30pm"}</div>
            </div>

            <div style={{ ...cs({marginBottom:16}) }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <div style={{ fontWeight:700, color:T.text, fontSize:15 }}>{"◆ Monthly Revenue"}</div>
                <div style={{ fontSize:13, fontWeight:700, color:PCOL.sidegig }}>{"$"}{monthRev}{" / $2,000"}</div>
              </div>
              <PBar value={monthRev} max={2000} color={PCOL.sidegig} h={8} inputBg={T.inputBg}/>
            </div>

            <div style={{ ...cs() }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <div style={{ fontWeight:700, color:T.text, fontSize:15 }}>{"☐ Today's Checklist"}</div>
                <div style={{ fontSize:13, fontWeight:700, color:pct>=80?"#3DBF8A":"#E8A838" }}>{pct}{"%"}</div>
              </div>
              <PBar value={pct} color={pct>=80?"#3DBF8A":"#E8A838"} inputBg={T.inputBg}/>
              <div style={{ fontSize:11, color:T.textMuted, marginTop:6 }}>{doneCount}{"/"}{todayItems.length}{" blocks · "}{isSat?"Saturday":isSun?"Sunday":"Weekday"}{" schedule"}</div>
              <button onClick={() => setPillar("checklist")} style={{ marginTop:10, fontSize:12, color:"#E8A838", background:"none", border:"1px solid #E8A83844", borderRadius:8, padding:"5px 12px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>
                {"View full checklist →"}
              </button>
            </div>
          </div>
        )}

        {/* ═══ CHECKLIST ═══ */}
        {pillar==="checklist" && (
          <div>
            <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:28, color:T.text, marginBottom:4 }}>{"☐ Today's Checklist"}</div>
            <div style={{ fontSize:13, color:T.textSub, marginBottom:20 }}>{isSat?"Saturday":isSun?"Sunday":"Weekday"}{" · "}{doneCount}{"/"}{todayItems.length}{" done · "}{pct}{"%"}</div>
            <div style={{ ...cs({marginBottom:20}) }}><PBar value={pct} color={pct>=80?"#3DBF8A":"#E8A838"} h={8} inputBg={T.inputBg}/></div>

            <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:24 }}>
              {todayItems.map(item => {
                const done = !!checks[item.id];
                const cc = CAT_COL[item.cat] || "#888";
                return (
                  <button key={item.id} onClick={() => toggleCheck(item.id)}
                    style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px", borderRadius:12, border:`1px solid ${done?cc+"44":T.border}`, background:done?cc+"11":T.surface, cursor:"pointer", textAlign:"left", width:"100%", transition:"all 0.15s" }}>
                    <div style={{ width:22, height:22, borderRadius:6, border:`2px solid ${done?cc:T.border}`, background:done?cc:"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.15s" }}>
                      {done && <span style={{ color:"#fff", fontSize:13, fontWeight:700 }}>{"✓"}</span>}
                    </div>
                    <span style={{ fontSize:14, color:done?T.textSub:T.text, fontFamily:"'DM Sans',sans-serif", textDecoration:done?"line-through":"none", flex:1 }}>{item.label}</span>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:cc, flexShrink:0 }}/>
                  </button>
                );
              })}
            </div>

            {Object.values(savedIntentions).some(Boolean) ? (
              <div style={{ ...cs() }}>
                <div style={{ fontWeight:700, color:T.text, marginBottom:12, fontSize:15 }}>{"This Week's Intentions"}</div>
                {Object.entries(savedIntentions).map(([k,v]) => v ? (
                  <div key={k} style={{ fontSize:13, color:T.text, padding:"6px 0", borderBottom:`1px solid ${T.border}`, display:"flex", gap:10 }}>
                    <span style={{ color:PCOL[k]||"#888", fontWeight:700, textTransform:"capitalize", minWidth:70 }}>{k}</span>
                    <span style={{ color:T.textSub }}>{v}</span>
                  </div>
                ) : null)}
                <button onClick={() => { setWf({...savedIntentions}); setShowForm("intentions"); }} style={{ marginTop:12, fontSize:12, color:"#E8A838", background:"none", border:"1px solid #E8A83844", borderRadius:8, padding:"5px 12px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>
                  {"Edit intentions →"}
                </button>
              </div>
            ) : (
              <div style={{ textAlign:"center" }}>
                <button onClick={() => { setWf({faith:"",fitness:"",thesis:"",reading:"",gloria:"",sidegig:""}); setShowForm("intentions"); }} style={{ padding:"11px 22px", borderRadius:10, border:"1px solid #E8A83844", background:"#E8A83811", color:"#E8A838", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600 }}>
                  {"✦ Set This Week's Intentions"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══ FAITH ═══ */}
        {pillar==="faith" && (
          <div>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24, gap:12 }}>
              <div>
                <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:28, color:PCOL.faith }}>{"✦ Faith & Devotion"}</div>
                <div style={{ fontSize:13, color:T.textSub, marginTop:2 }}>{"Prayer · Bible · Worship · Night prayer"}</div>
              </div>
              <button onClick={() => { const e = data.devotion.find(d => d.date===today); setDf({passage:e?.passage||"",insight:e?.insight||"",prayer:e?.prayer||false,worship:e?.worship||false}); setShowForm("devotion"); }}
                style={{ padding:"9px 16px", borderRadius:9, border:"none", background:PCOL.faith, color:"#111", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:700, flexShrink:0 }}>
                {"+ Log Today"}
              </button>
            </div>

            <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
              <StatCard T={T} label="Streak" value={`${devStreak}d`} sub="Consecutive days" color={PCOL.faith}/>
              <StatCard T={T} label="Total logged" value={data.devotion.length} sub="All sessions" color="#E8A838"/>
              <StatCard T={T} label="Today" value={data.devotion.find(d=>d.date===today)?"✓ Done":"Pending"} sub="" color={data.devotion.find(d=>d.date===today)?"#3DBF8A":"#888"}/>
            </div>

            <div style={{ ...cs({marginBottom:20}) }}>
              <div style={{ fontWeight:700, color:T.text, marginBottom:14, fontSize:15 }}>{"Last 7 Days"}</div>
              <div style={{ display:"flex", gap:8 }}>
                {last7.map(d => {
                  const entry = data.devotion.find(e => e.date===d);
                  return (
                    <div key={d} style={{ flex:1, textAlign:"center" }}>
                      <div style={{ fontSize:10, color:T.textMuted, marginBottom:6 }}>{new Date(d+"T12:00:00").toLocaleDateString("en-US",{weekday:"short"})}</div>
                      <div style={{ width:32, height:32, borderRadius:9, margin:"0 auto", background:entry?PCOL.faith+"33":T.inputBg, border:`2px solid ${entry?PCOL.faith:T.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, color:entry?PCOL.faith:T.textMuted }}>
                        {entry?"✦":"·"}
                      </div>
                      {entry?.passage && <div style={{ fontSize:8, color:T.textMuted, marginTop:3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{entry.passage.slice(0,8)}</div>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {[...data.devotion].reverse().slice(0,12).map((e,i) => (
                <div key={i} style={{ ...cs({padding:"14px 16px",borderLeft:`3px solid ${PCOL.faith}`}) }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:PCOL.faith }}>{e.passage||"Devotion"}</div>
                    <div style={{ fontSize:11, color:T.textMuted }}>{e.date}</div>
                  </div>
                  {e.insight && <div style={{ fontSize:13, color:T.text, lineHeight:1.5, marginBottom:8 }}>{e.insight}</div>}
                  <div style={{ display:"flex", gap:6 }}>
                    {e.prayer && <span style={{ fontSize:10, padding:"2px 7px", borderRadius:5, background:PCOL.faith+"22", color:PCOL.faith, fontWeight:600 }}>{"🙏 Prayed"}</span>}
                    {e.worship && <span style={{ fontSize:10, padding:"2px 7px", borderRadius:5, background:"#E8A83822", color:"#E8A838", fontWeight:600 }}>{"🎵 Worship"}</span>}
                  </div>
                </div>
              ))}
              {!data.devotion.length && (
                <div style={{ ...cs({textAlign:"center",padding:"50px 20px"}) }}>
                  <div style={{ fontSize:40, marginBottom:10 }}>{"✦"}</div>
                  <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:18, color:T.text }}>{"Start your streak"}</div>
                  <div style={{ fontSize:13, color:T.textSub, marginTop:6 }}>{"Log your first devotion session."}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ FITNESS ═══ */}
        {pillar==="fitness" && (
          <div>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24, gap:12 }}>
              <div>
                <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:28, color:PCOL.fitness }}>{"◈ Fitness"}</div>
                <div style={{ fontSize:13, color:T.textSub, marginTop:2 }}>{"Run · Strength · Mon–Sat · Rest Sunday"}</div>
              </div>
              <button onClick={() => { setFf({runDist:"",runTime:"",workoutType:"Upper Body"}); setShowForm("fitness"); }}
                style={{ padding:"9px 16px", borderRadius:9, border:"none", background:PCOL.fitness, color:"#111", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:700, flexShrink:0 }}>
                {"+ Log Workout"}
              </button>
            </div>

            <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
              <StatCard T={T} label="Streak" value={`${fitStreak}d`} sub="Mon–Sat" color={PCOL.fitness}/>
              <StatCard T={T} label="Month miles" value={`${data.fitness.filter(f=>f.date?.startsWith(today.slice(0,7))).reduce((s,f)=>s+(Number(f.runDist)||0),0).toFixed(1)} mi`} sub="Running total" color="#3B9EDB"/>
              <StatCard T={T} label="This week" value={(() => { const d=new Date(); d.setDate(d.getDate()-((d.getDay()+6)%7)); const m=d.toISOString().slice(0,10); return data.fitness.filter(f=>f.date>=m).length; })()+(" sessions")} sub="Target: 6" color="#E8A838"/>
            </div>

            <div style={{ ...cs({marginBottom:20}) }}>
              <div style={{ fontWeight:700, color:T.text, marginBottom:12, fontSize:15 }}>{"Weekly Split"}</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                {[["Mon","Push"],["Tue","Pull"],["Wed","Legs"],["Thu","Push"],["Fri","Pull"],["Sat","Full Body"]].map(([d,w]) => (
                  <div key={d} style={{ background:T.inputBg, borderRadius:8, padding:"8px 10px" }}>
                    <div style={{ fontSize:11, fontWeight:700, color:PCOL.fitness }}>{d}</div>
                    <div style={{ fontSize:11, color:T.textSub, marginTop:2 }}>{w}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {[...data.fitness].reverse().slice(0,15).map((f,i) => (
                <div key={i} style={{ ...cs({padding:"12px 16px",borderLeft:`3px solid ${PCOL.fitness}`}) }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <div style={{ fontSize:14, fontWeight:600, color:T.text }}>{f.workoutType}</div>
                    <div style={{ fontSize:11, color:T.textMuted }}>{f.date}</div>
                  </div>
                  {(f.runDist || f.runTime) && (
                    <div style={{ display:"flex", gap:6, marginTop:6 }}>
                      <span style={{ fontSize:11, padding:"2px 8px", borderRadius:5, background:PCOL.fitness+"22", color:PCOL.fitness, fontWeight:600 }}>{"🏃 "}{f.runDist||"?"}{" mi · "}{f.runTime||"?"}{" min"}</span>
                    </div>
                  )}
                </div>
              ))}
              {!data.fitness.length && (
                <div style={{ ...cs({textAlign:"center",padding:"50px 20px"}) }}>
                  <div style={{ fontSize:40, marginBottom:10 }}>{"◈"}</div>
                  <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:18, color:T.text }}>{"No workouts logged yet"}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ THESIS ═══ */}
        {pillar==="thesis" && (
          <div>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24, gap:12 }}>
              <div>
                <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:28, color:PCOL.thesis }}>{"✎ Thesis Work"}</div>
                <div style={{ fontSize:13, color:T.textSub, marginTop:2 }}>{"80 min · Mon–Sat · 5:30pm · 8 hrs/week"}</div>
              </div>
              <button onClick={() => { setTf({notes:"",duration:80}); setShowForm("thesis"); }}
                style={{ padding:"9px 16px", borderRadius:9, border:"none", background:PCOL.thesis, color:"#fff", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:700, flexShrink:0 }}>
                {"+ Log Session"}
              </button>
            </div>

            <div style={{ ...cs({marginBottom:20}) }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <div style={{ fontWeight:700, color:T.text, fontSize:15 }}>{"This Week"}</div>
                <div style={{ fontSize:14, fontWeight:700, color:PCOL.thesis }}>{weekHrs.toFixed(1)}{" / 8 hrs"}</div>
              </div>
              <PBar value={weekHrs} max={8} color={PCOL.thesis} h={10} inputBg={T.inputBg}/>
              <div style={{ display:"flex", gap:4, marginTop:12 }}>
                {["Mon","Tue","Wed","Thu","Fri","Sat"].map((d, i) => {
                  const dd = new Date(); dd.setDate(dd.getDate() - ((dd.getDay()+6)%7) + i);
                  const dateStr = dd.toISOString().slice(0,10);
                  const done = data.thesis.some(t => t.date===dateStr);
                  return (
                    <div key={d} style={{ flex:1, textAlign:"center" }}>
                      <div style={{ fontSize:10, color:T.textMuted, marginBottom:4 }}>{d}</div>
                      <div style={{ height:28, borderRadius:6, background:done?PCOL.thesis+"33":T.inputBg, border:`1px solid ${done?PCOL.thesis:T.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:done?PCOL.thesis:T.textMuted }}>
                        {done?"✓":"·"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
              <StatCard T={T} label="This week" value={`${weekHrs.toFixed(1)} hrs`} sub="Target 8 hrs" color={PCOL.thesis}/>
              <StatCard T={T} label="All-time" value={`${(data.thesis.reduce((s,e)=>s+(Number(e.duration)||80),0)/60).toFixed(1)} hrs`} sub="Total hours" color="#E8A838"/>
              <StatCard T={T} label="Sessions" value={data.thesis.length} sub="Total sessions" color="#3DBF8A"/>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {[...data.thesis].reverse().slice(0,15).map((s,i) => (
                <div key={i} style={{ ...cs({padding:"14px 16px",borderLeft:`3px solid ${PCOL.thesis}`}) }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:PCOL.thesis }}>{s.duration||80}{" min session"}</div>
                    <div style={{ fontSize:11, color:T.textMuted }}>{s.date}</div>
                  </div>
                  {s.notes && <div style={{ fontSize:13, color:T.text, lineHeight:1.5 }}>{s.notes}</div>}
                </div>
              ))}
              {!data.thesis.length && (
                <div style={{ ...cs({textAlign:"center",padding:"50px 20px"}) }}>
                  <div style={{ fontSize:40, marginBottom:10 }}>{"✎"}</div>
                  <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:18, color:T.text }}>{"No sessions logged yet"}</div>
                  <div style={{ fontSize:13, color:T.textSub, marginTop:6 }}>{"Log your first 80-min deep work block."}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ READING ═══ */}
        {pillar==="reading" && (
          <div>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24, gap:12 }}>
              <div>
                <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:28, color:PCOL.reading }}>{"◐ Reading"}</div>
                <div style={{ fontSize:13, color:T.textSub, marginTop:2 }}>{"Audiobook + physical · 3 books/month"}</div>
              </div>
              <button onClick={() => { setRf({title:currentBook==="—"?"":currentBook,format:"audiobook",amount:"",completed:false}); setShowForm("reading"); }}
                style={{ padding:"9px 16px", borderRadius:9, border:"none", background:PCOL.reading, color:"#fff", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:700, flexShrink:0 }}>
                {"+ Log Reading"}
              </button>
            </div>

            <div style={{ ...cs({marginBottom:20}) }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <div style={{ fontWeight:700, color:T.text, fontSize:15 }}>{"Books This Month"}</div>
                <div style={{ fontSize:13, fontWeight:700, color:PCOL.reading }}>{monthBooks}{" / 3"}</div>
              </div>
              <PBar value={monthBooks} max={3} color={PCOL.reading} h={8} inputBg={T.inputBg}/>
              <div style={{ fontSize:11, color:T.textMuted, marginTop:8, lineHeight:1.6 }}>
                {"Commute (20–30 min) + lunch (15 min) + wind-down (20 min) + Sunday (1 hr) = ~8 hrs/week"}
              </div>
            </div>

            <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
              <StatCard T={T} label="Books/month" value={`${monthBooks}/3`} sub="Target 3" color={PCOL.reading}/>
              <StatCard T={T} label="Current book" value={currentBook.length>14?currentBook.slice(0,14)+"…":currentBook} sub="" color="#3DBF8A"/>
              <StatCard T={T} label="Total sessions" value={data.reading.length} sub="All reading" color="#E8A838"/>
            </div>

            <div style={{ ...cs({marginBottom:20}) }}>
              <div style={{ fontWeight:700, color:T.text, marginBottom:12, fontSize:15 }}>{"Reading Windows"}</div>
              {[
                ["🚶 Commute","20–30 min audiobook — 3.5 hrs/week just from this"],
                ["☕ Lunch","15–20 min audiobook/book · 5 days/week adds 1.5 hrs"],
                ["🌙 Wind-down","20–30 min physical book before Gloria time"],
                ["📖 Sunday","1 dedicated hour — uninterrupted, fully focused"],
              ].map(([l,d]) => (
                <div key={l} style={{ padding:"8px 0", borderBottom:`1px solid ${T.border}`, display:"flex", gap:10 }}>
                  <span style={{ fontSize:13, fontWeight:600, color:PCOL.reading, flexShrink:0 }}>{l}</span>
                  <span style={{ fontSize:12, color:T.textSub }}>{d}</span>
                </div>
              ))}
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {[...data.reading].reverse().slice(0,15).map((r,i) => (
                <div key={i} style={{ ...cs({padding:"12px 16px",borderLeft:`3px solid ${r.completed?"#3DBF8A":PCOL.reading}`}) }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <div style={{ fontSize:14, fontWeight:600, color:T.text }}>{r.title||"Unnamed book"}</div>
                    <div style={{ fontSize:11, color:T.textMuted }}>{r.date}</div>
                  </div>
                  <div style={{ display:"flex", gap:6, marginTop:6 }}>
                    <span style={{ fontSize:11, padding:"2px 7px", borderRadius:5, background:PCOL.reading+"22", color:PCOL.reading, fontWeight:600 }}>{r.format==="audiobook"?"🎧":"📖"}{" "}{r.amount}{" "}{r.format==="audiobook"?"min":"pages"}</span>
                    {r.completed && <span style={{ fontSize:11, padding:"2px 7px", borderRadius:5, background:"#3DBF8A22", color:"#3DBF8A", fontWeight:600 }}>{"✓ Completed"}</span>}
                  </div>
                </div>
              ))}
              {!data.reading.length && (
                <div style={{ ...cs({textAlign:"center",padding:"50px 20px"}) }}>
                  <div style={{ fontSize:40, marginBottom:10 }}>{"📚"}</div>
                  <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:18, color:T.text }}>{"No reading logged yet"}</div>
                  <div style={{ fontSize:13, color:T.textSub, marginTop:6 }}>{"Start with today's commute audiobook."}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ GLORIA ═══ */}
        {pillar==="gloria" && (
          <div>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24, gap:12 }}>
              <div>
                <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:28, color:PCOL.gloria }}>{"♡ Gloria"}</div>
                <div style={{ fontSize:13, color:T.textSub, marginTop:2 }}>{"30–60 min · every evening · fully present"}</div>
              </div>
              <button onClick={() => { const e = data.gloria.find(g => g.date===today); setGf({appreciation:e?.appreciation||"",highlight:e?.highlight||"",prayed:e?.prayed||false}); setShowForm("gloria"); }}
                style={{ padding:"9px 16px", borderRadius:9, border:"none", background:PCOL.gloria, color:"#fff", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:700, flexShrink:0 }}>
                {"+ Log Today"}
              </button>
            </div>

            <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
              <StatCard T={T} label="Streak" value={`${gloriaStreak}d`} sub="Every day counts" color={PCOL.gloria}/>
              <StatCard T={T} label="Total logged" value={data.gloria.length} sub="All sessions" color="#E8A838"/>
              <StatCard T={T} label="Today" value={data.gloria.find(g=>g.date===today)?"✓ Logged":"Not yet"} sub="" color={data.gloria.find(g=>g.date===today)?"#3DBF8A":"#888"}/>
            </div>

            <div style={{ ...cs({marginBottom:20}) }}>
              <div style={{ fontWeight:700, color:T.text, marginBottom:14, fontSize:15 }}>{"Last 7 Days"}</div>
              <div style={{ display:"flex", gap:8 }}>
                {last7.map(d => {
                  const entry = data.gloria.find(e => e.date===d);
                  return (
                    <div key={d} style={{ flex:1, textAlign:"center" }}>
                      <div style={{ fontSize:10, color:T.textMuted, marginBottom:6 }}>{new Date(d+"T12:00:00").toLocaleDateString("en-US",{weekday:"short"})}</div>
                      <div style={{ width:32, height:32, borderRadius:"50%", margin:"0 auto", background:entry?PCOL.gloria+"33":T.inputBg, border:`2px solid ${entry?PCOL.gloria:T.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, color:entry?PCOL.gloria:T.textMuted }}>
                        {entry?"♡":"·"}
                      </div>
                      {entry?.prayed && <div style={{ fontSize:8, color:PCOL.gloria, marginTop:3 }}>{"prayed"}</div>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ ...cs({marginBottom:20, borderLeft:`3px solid ${PCOL.gloria}`}) }}>
              <div style={{ fontWeight:700, color:T.text, marginBottom:10, fontSize:13, textTransform:"uppercase", letterSpacing:"0.08em" }}>{"Conversation Starters"}</div>
              {["What was the best part of your day?","What is on your heart right now?","What made you smile today?","What are you looking forward to?","What do you need most from me right now?"].map((q,i) => (
                <div key={i} style={{ fontSize:13, color:T.textSub, padding:"6px 0", borderBottom:i<4?`1px solid ${T.border}`:"none" }}>{'"'}{q}{'"'}</div>
              ))}
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {[...data.gloria].reverse().slice(0,10).map((g,i) => (
                <div key={i} style={{ ...cs({padding:"14px 16px",borderLeft:`3px solid ${PCOL.gloria}`}) }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:PCOL.gloria }}>{"♡ "}{g.date}</div>
                    {g.prayed && <span style={{ fontSize:10, padding:"2px 7px", borderRadius:5, background:PCOL.gloria+"22", color:PCOL.gloria, fontWeight:600 }}>{"🙏 Prayed together"}</span>}
                  </div>
                  {g.appreciation && <div style={{ fontSize:13, color:T.text, marginBottom:4 }}><strong style={{ color:T.textSub }}>{"Appreciated: "}</strong>{g.appreciation}</div>}
                  {g.highlight && <div style={{ fontSize:13, color:T.text }}><strong style={{ color:T.textSub }}>{"Highlight: "}</strong>{g.highlight}</div>}
                </div>
              ))}
              {!data.gloria.length && (
                <div style={{ ...cs({textAlign:"center",padding:"50px 20px"}) }}>
                  <div style={{ fontSize:40, marginBottom:10 }}>{"♡"}</div>
                  <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:18, color:T.text }}>{"Start logging"}</div>
                  <div style={{ fontSize:13, color:T.textSub, marginTop:6 }}>{"30–60 intentional minutes. Phones away."}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ SIDE GIG ═══ */}
        {pillar==="sidegig" && (
          <div>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24, gap:12 }}>
              <div>
                <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:28, color:PCOL.sidegig }}>{"◆ Side Gig"}</div>
                <div style={{ fontSize:13, color:T.textSub, marginTop:2 }}>{"Web dev · Sat 6hrs + Sun 4hrs · $2k/month goal"}</div>
              </div>
              <button onClick={() => { setSf({project:"",hours:"",revenue:"",contentBatched:false}); setShowForm("sidegig"); }}
                style={{ padding:"9px 16px", borderRadius:9, border:"none", background:PCOL.sidegig, color:"#fff", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:700, flexShrink:0 }}>
                {"+ Log Work"}
              </button>
            </div>

            <div style={{ ...cs({marginBottom:20}) }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <div style={{ fontWeight:700, color:T.text, fontSize:15 }}>{"Monthly Revenue"}</div>
                <div style={{ fontSize:14, fontWeight:700, color:PCOL.sidegig }}>{"$"}{monthRev}{" / $2,000"}</div>
              </div>
              <PBar value={monthRev} max={2000} color={PCOL.sidegig} h={10} inputBg={T.inputBg}/>
            </div>

            <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
              <StatCard T={T} label="Month revenue" value={`$${monthRev}`} sub="Target $2,000" color={PCOL.sidegig}/>
              <StatCard T={T} label="Month hours" value={`${data.sidegig.filter(s=>s.date?.startsWith(today.slice(0,7))).reduce((s,e)=>s+(Number(e.hours)||0),0)} hrs`} sub="Sat+Sun" color="#E8A838"/>
              <StatCard T={T} label="Content batch" value={(() => { const d=new Date(); d.setDate(d.getDate()-((d.getDay()+6)%7)); const m=d.toISOString().slice(0,10); return data.sidegig.some(s=>s.date>=m&&s.contentBatched)?"✓ Done":"Pending"; })()} sub="This week" color={(() => { const d=new Date(); d.setDate(d.getDate()-((d.getDay()+6)%7)); const m=d.toISOString().slice(0,10); return data.sidegig.some(s=>s.date>=m&&s.contentBatched)?"#3DBF8A":"#888"; })()}/>
            </div>

            <div style={{ ...cs({marginBottom:20}) }}>
              <div style={{ fontWeight:700, color:T.text, marginBottom:12, fontSize:15 }}>{"Weekend Schedule"}</div>
              {[["Sat","8:00am — Client work block 1 (3 hrs)"],["Sat","11:00am — Content batch for Instagram (2 hrs)"],["Sat","2:00pm — Client work block 2 (3 hrs)"],["Sun","9:00am — Side gig work (4 hrs)"]].map(([d,t],i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:i<3?`1px solid ${T.border}`:"none" }}>
                  <span style={{ fontSize:10, padding:"2px 8px", borderRadius:5, background:PCOL.sidegig+"22", color:PCOL.sidegig, fontWeight:700, flexShrink:0 }}>{d}</span>
                  <span style={{ fontSize:13, color:T.text }}>{t}</span>
                </div>
              ))}
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {[...data.sidegig].reverse().slice(0,15).map((s,i) => (
                <div key={i} style={{ ...cs({padding:"12px 16px",borderLeft:`3px solid ${PCOL.sidegig}`}) }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <div style={{ fontSize:14, fontWeight:600, color:T.text }}>{s.project||"Client work"}</div>
                    <div style={{ fontSize:11, color:T.textMuted }}>{s.date}</div>
                  </div>
                  <div style={{ display:"flex", gap:6, marginTop:6, flexWrap:"wrap" }}>
                    {s.hours && <span style={{ fontSize:11, padding:"2px 7px", borderRadius:5, background:PCOL.sidegig+"22", color:PCOL.sidegig, fontWeight:600 }}>{"⏱ "}{s.hours}{" hrs"}</span>}
                    {s.revenue && <span style={{ fontSize:11, padding:"2px 7px", borderRadius:5, background:"#3DBF8A22", color:"#3DBF8A", fontWeight:600 }}>{"💵 $"}{s.revenue}</span>}
                    {s.contentBatched && <span style={{ fontSize:11, padding:"2px 7px", borderRadius:5, background:"#E8A83822", color:"#E8A838", fontWeight:600 }}>{"📸 Content batched"}</span>}
                  </div>
                </div>
              ))}
              {!data.sidegig.length && (
                <div style={{ ...cs({textAlign:"center",padding:"50px 20px"}) }}>
                  <div style={{ fontSize:40, marginBottom:10 }}>{"◆"}</div>
                  <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:18, color:T.text }}>{"No work logged yet"}</div>
                  <div style={{ fontSize:13, color:T.textSub, marginTop:6 }}>{"Saturday and Sunday are your money-making engine."}</div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>{/* end main content */}

      {/* ═══ MODALS ═══ */}

      {showForm==="devotion" && (
        <Modal T={T} mode={mode} title={"Log Devotion"} accent={PCOL.faith} onClose={() => setShowForm(null)}
          onSave={() => { const ex = data.devotion.filter(d => d.date!==today); save(p => ({...p,devotion:[...ex,{...df,date:today}]})); setShowForm(null); }}>
          {({inp,lbl}) => (
            <>
              <label style={lbl}>{"Bible Passage"}</label>
              <input style={inp} value={df.passage} onChange={e => setDf(p => ({...p,passage:e.target.value}))} placeholder={"e.g. Psalm 23:1–6"}/>
              <label style={lbl}>{"Key Insight"}</label>
              <textarea style={{...inp,minHeight:80,resize:"vertical"}} value={df.insight} onChange={e => setDf(p => ({...p,insight:e.target.value}))} placeholder={"What stood out to you today?"}/>
              <div style={{display:"flex",gap:10,marginTop:14}}>
                <ToggleBtn T={T} active={df.prayer} color={PCOL.faith} onClick={() => setDf(p => ({...p,prayer:!p.prayer}))} label={"🙏 Prayed"}/>
                <ToggleBtn T={T} active={df.worship} color={PCOL.faith} onClick={() => setDf(p => ({...p,worship:!p.worship}))} label={"🎵 Worship"}/>
              </div>
            </>
          )}
        </Modal>
      )}

      {showForm==="fitness" && (
        <Modal T={T} mode={mode} title={"Log Workout"} accent={PCOL.fitness} onClose={() => setShowForm(null)}
          onSave={() => { save(p => ({...p,fitness:[...p.fitness,{...ff,date:today}]})); setShowForm(null); }}>
          {({inp,lbl,sel:s}) => (
            <>
              <label style={lbl}>{"Workout Type"}</label>
              <select style={sel} value={ff.workoutType} onChange={e => setFf(p => ({...p,workoutType:e.target.value}))}>
                {["Upper Body","Lower Body","Full Body","Push","Pull","Legs","Cardio Only"].map(w => <option key={w}>{w}</option>)}
              </select>
              <label style={lbl}>{"Run Distance (miles)"}</label>
              <input style={inp} type={"number"} step={"0.1"} value={ff.runDist} onChange={e => setFf(p => ({...p,runDist:e.target.value}))} placeholder={"e.g. 3.2"}/>
              <label style={lbl}>{"Run Time (minutes)"}</label>
              <input style={inp} type={"number"} value={ff.runTime} onChange={e => setFf(p => ({...p,runTime:e.target.value}))} placeholder={"e.g. 25"}/>
            </>
          )}
        </Modal>
      )}

      {showForm==="thesis" && (
        <Modal T={T} mode={mode} title={"Log Thesis Session"} accent={PCOL.thesis} onClose={() => setShowForm(null)}
          onSave={() => { save(p => ({...p,thesis:[...p.thesis,{...tf,date:today}]})); setShowForm(null); }}>
          {({inp,lbl}) => (
            <>
              <label style={lbl}>{"Duration (minutes)"}</label>
              <input style={inp} type={"number"} value={tf.duration} onChange={e => setTf(p => ({...p,duration:Number(e.target.value)}))} placeholder={"80"}/>
              <label style={lbl}>{"What did you work on?"}</label>
              <textarea style={{...inp,minHeight:100,resize:"vertical"}} value={tf.notes} onChange={e => setTf(p => ({...p,notes:e.target.value}))} placeholder={"Writing, research, proofs — what did you tackle?"}/>
            </>
          )}
        </Modal>
      )}

      {showForm==="reading" && (
        <Modal T={T} mode={mode} title={"Log Reading"} accent={PCOL.reading} onClose={() => setShowForm(null)}
          onSave={() => { save(p => ({...p,reading:[...p.reading,{...rf,date:today,unit:rf.format==="audiobook"?"min":"pages"}]})); setShowForm(null); }}>
          {({inp,lbl}) => (
            <>
              <label style={lbl}>{"Book Title"}</label>
              <input style={inp} value={rf.title} onChange={e => setRf(p => ({...p,title:e.target.value}))} placeholder={"Book title"}/>
              <label style={lbl}>{"Format"}</label>
              <div style={{display:"flex",gap:8,marginTop:6}}>
                <ToggleBtn T={T} active={rf.format==="audiobook"} color={PCOL.reading} onClick={() => setRf(p => ({...p,format:"audiobook"}))} label={"🎧 Audiobook"}/>
                <ToggleBtn T={T} active={rf.format==="physical"} color={PCOL.reading} onClick={() => setRf(p => ({...p,format:"physical"}))} label={"📖 Physical"}/>
              </div>
              <label style={lbl}>{rf.format==="audiobook"?"Minutes listened":"Pages read"}</label>
              <input style={inp} type={"number"} value={rf.amount} onChange={e => setRf(p => ({...p,amount:e.target.value}))} placeholder={rf.format==="audiobook"?"e.g. 30":"e.g. 25"}/>
              <button onClick={() => setRf(p => ({...p,completed:!p.completed}))} style={{marginTop:12,width:"100%",padding:"10px",borderRadius:9,border:`1px solid ${rf.completed?"#3DBF8A":T.border}`,background:rf.completed?"#3DBF8A22":T.inputBg,color:rf.completed?"#3DBF8A":T.textSub,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:rf.completed?700:400}}>
                {rf.completed?"✓ Finished this book":"Mark as finished?"}
              </button>
            </>
          )}
        </Modal>
      )}

      {showForm==="gloria" && (
        <Modal T={T} mode={mode} title={"Log Gloria Time"} accent={PCOL.gloria} onClose={() => setShowForm(null)}
          onSave={() => { const ex = data.gloria.filter(g => g.date!==today); save(p => ({...p,gloria:[...ex,{...gf,date:today}]})); setShowForm(null); }}>
          {({inp,lbl}) => (
            <>
              <label style={lbl}>{"One thing you appreciated about her today"}</label>
              <input style={inp} value={gf.appreciation} onChange={e => setGf(p => ({...p,appreciation:e.target.value}))} placeholder={"e.g. She listened without judgement"}/>
              <label style={lbl}>{"Conversation highlight"}</label>
              <textarea style={{...inp,minHeight:80,resize:"vertical"}} value={gf.highlight} onChange={e => setGf(p => ({...p,highlight:e.target.value}))} placeholder={"What did you two talk about?"}/>
              <button onClick={() => setGf(p => ({...p,prayed:!p.prayed}))} style={{marginTop:14,width:"100%",padding:"11px",borderRadius:9,border:`1px solid ${gf.prayed?PCOL.gloria:T.border}`,background:gf.prayed?PCOL.gloria+"22":T.inputBg,color:gf.prayed?PCOL.gloria:T.textSub,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:gf.prayed?700:400}}>
                {gf.prayed?"🙏 Prayed together ✓":"🙏 Prayed together?"}
              </button>
            </>
          )}
        </Modal>
      )}

      {showForm==="sidegig" && (
        <Modal T={T} mode={mode} title={"Log Side Gig Work"} accent={PCOL.sidegig} onClose={() => setShowForm(null)}
          onSave={() => { save(p => ({...p,sidegig:[...p.sidegig,{...sf,date:today}]})); setShowForm(null); }}>
          {({inp,lbl}) => (
            <>
              <label style={lbl}>{"Project / Client"}</label>
              <input style={inp} value={sf.project} onChange={e => setSf(p => ({...p,project:e.target.value}))} placeholder={"e.g. Client website — Jones Landscaping"}/>
              <label style={lbl}>{"Hours worked"}</label>
              <input style={inp} type={"number"} step={"0.5"} value={sf.hours} onChange={e => setSf(p => ({...p,hours:e.target.value}))} placeholder={"e.g. 3"}/>
              <label style={lbl}>{"Revenue earned ($)"}</label>
              <input style={inp} type={"number"} value={sf.revenue} onChange={e => setSf(p => ({...p,revenue:e.target.value}))} placeholder={"e.g. 500"}/>
              <button onClick={() => setSf(p => ({...p,contentBatched:!p.contentBatched}))} style={{marginTop:14,width:"100%",padding:"11px",borderRadius:9,border:`1px solid ${sf.contentBatched?PCOL.sidegig:T.border}`,background:sf.contentBatched?PCOL.sidegig+"22":T.inputBg,color:sf.contentBatched?PCOL.sidegig:T.textSub,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:sf.contentBatched?700:400}}>
                {sf.contentBatched?"📸 Content batched this session ✓":"📸 Content batched?"}
              </button>
            </>
          )}
        </Modal>
      )}

      {showForm==="intentions" && (
        <Modal T={T} mode={mode} title={"Weekly Intentions"} accent={"#E8A838"} onClose={() => setShowForm(null)}
          onSave={() => { save(p => ({...p,intentions:{...p.intentions,[thisWeek]:wf}})); setShowForm(null); }}>
          {({inp,lbl}) => (
            <>
              <div style={{fontSize:13,color:T.textSub,marginBottom:14,lineHeight:1.6}}>{"One sentence of intention per pillar — displayed all week as your anchor."}</div>
              {[["faith","✦ Faith",PCOL.faith],["fitness","◈ Fitness",PCOL.fitness],["thesis","✎ Thesis",PCOL.thesis],["reading","◐ Reading",PCOL.reading],["gloria","♡ Gloria",PCOL.gloria],["sidegig","◆ Side Gig",PCOL.sidegig]].map(([k,l,c]) => (
                <div key={k}>
                  <label style={{...lbl,color:c}}>{l}</label>
                  <input style={{...inp,outline:`1px solid ${c}33`}} value={wf[k]||""} onChange={e => setWf(p => ({...p,[k]:e.target.value}))} placeholder={`One intention for ${k} this week...`}/>
                </div>
              ))}
            </>
          )}
        </Modal>
      )}

    </div>
  );
}
