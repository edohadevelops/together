import { useState, useEffect } from "react";

const SUPABASE_URL = "https://sonbphyeomzzcdyuiotl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvbmJwaHllb216emNkeXVpb3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMzkxMjksImV4cCI6MjA4ODgxNTEyOX0.CtcZAFtqCQUOrzPBfhSfN5BZ1EQDJFVxa-FsjMX5IRg";
const HDRS = { "Content-Type":"application/json","apikey":SUPABASE_KEY,"Authorization":`Bearer ${SUPABASE_KEY}`,"Prefer":"resolution=merge-duplicates" };
async function sGet(key) { try { const r=await fetch(`${SUPABASE_URL}/rest/v1/together_data?key=eq.${key}&select=value`,{headers:HDRS}); const d=await r.json(); return d.length?JSON.parse(d[0].value):null; } catch{return null;} }
async function sSet(key,value) { try { await fetch(`${SUPABASE_URL}/rest/v1/together_data`,{method:"POST",headers:HDRS,body:JSON.stringify({key,value:JSON.stringify(value),updated_at:new Date().toISOString()})}); } catch{} }

// ── Palette ────────────────────────────────────────────────────────────────
const P = { faith:"#E8C050", fitness:"#3DBF8A", thesis:"#9B6EE8", reading:"#3B9EDB", gloria:"#E84E8A", sidegig:"#20B2AA", nutrition:"#F97316" };
const CAT = { faith:"#E8C050",fitness:"#3DBF8A",reading:"#3B9EDB",thesis:"#9B6EE8",gloria:"#E84E8A",sidegig:"#20B2AA",nutrition:"#F97316",morning:"#E8704A",evening:"#9B6EE8",work:"#888",planning:"#C8B030" };

const PILLARS = [
  {id:"overview",  label:"Overview",   icon:"◉", color:"#E8A838"},
  {id:"schedule",  label:"Schedule",   icon:"📅", color:"#C8B030"},
  {id:"checklist", label:"Checklist",  icon:"☐", color:"#E8704A"},
  {id:"faith",     label:"Faith",      icon:"✦", color:P.faith},
  {id:"fitness",   label:"Fitness",    icon:"◈", color:P.fitness},
  {id:"nutrition", label:"Nutrition",  icon:"🥗", color:P.nutrition},
  {id:"thesis",    label:"Thesis",     icon:"✎", color:P.thesis},
  {id:"reading",   label:"Reading",    icon:"◐", color:P.reading},
  {id:"gloria",    label:"Gloria",     icon:"♡", color:P.gloria},
  {id:"sidegig",   label:"Side Gig",   icon:"◆", color:P.sidegig},
];

// ── Checklist items ────────────────────────────────────────────────────────
const WD = [
  {id:"wake",       label:"Wake up + hydrate 500ml (5:00am)",                      cat:"morning"  },
  {id:"devotion",   label:"Morning devotion — prayer + Bible (5:00–5:30am)",       cat:"faith"    },
  {id:"breakfast",  label:"Shower + quick breakfast, out by 6:00am",               cat:"nutrition"},
  {id:"audiobook",  label:"Audiobook during morning delivery routes",               cat:"reading"  },
  {id:"delivery",   label:"Delivery routes 6am–6pm ($150–$200 goal)",             cat:"work"     },
  {id:"lunch_eat",  label:"Packed whole-food lunch on route (1–2pm)",              cat:"nutrition"},
  {id:"music_pm",   label:"Music during afternoon routes",                          cat:"morning"  },
  {id:"podcast",    label:"Podcast or sermon on the evening commute home",          cat:"faith"    },
  {id:"gym",        label:"Gym 45–60 min (7pm) — Mon / Wed / Fri only",           cat:"fitness"  },
  {id:"dinner",     label:"Dinner — protein + whole food (no eating after 9:30pm)",cat:"nutrition"},
  {id:"gloria_dev", label:"Evening devotion with Gloria (10pm)",                    cat:"faith"    },
  {id:"gloria_talk",label:"Brief conversation with Gloria (10:30–11pm)",            cat:"gloria"   },
  {id:"night_p",    label:"Night prayer (11pm) → sleep by 11:30pm",               cat:"faith"    },
  {id:"water",      label:"3–4L water today",                                       cat:"nutrition"},
  {id:"no_sugar",   label:"Zero sugar · zero fast food · zero junk today",          cat:"nutrition"},
];
const SAT = [
  {id:"devotion",   label:"Morning devotion — prayer + Bible (5:00–5:30am)",       cat:"faith"    },
  {id:"breakfast",  label:"Shower + breakfast",                                     cat:"nutrition"},
  {id:"gloria_am",  label:"Morning time with Gloria (6:00–8:00am)",                cat:"gloria"   },
  {id:"gym",        label:"Gym — upper body / full body (8:00–9:00am)",             cat:"fitness"  },
  {id:"cleaning",   label:"Church cleaning 1 hour (9:30–10:30am)",                 cat:"faith"    },
  {id:"thesis",     label:"Thesis work 1 hour (10:30–11:30am)",                    cat:"thesis"   },
  {id:"lunch_pack", label:"Pack lunch + head out for deliveries by 12pm",          cat:"nutrition"},
  {id:"delivery",   label:"Delivery routes 12pm–6pm ($80–$120 goal)",             cat:"work"     },
  {id:"audiobook",  label:"Audiobook during delivery routes",                       cat:"reading"  },
  {id:"lunch_eat",  label:"Packed lunch on route (2pm)",                            cat:"nutrition"},
  {id:"gloria_pm",  label:"4 hours with Gloria (6pm–10pm)",                         cat:"gloria"   },
  {id:"friend",     label:"Reach out to at least 1 friend today",                  cat:"morning"  },
  {id:"gloria_dev", label:"Evening devotion with Gloria (10pm)",                    cat:"faith"    },
  {id:"gloria_talk",label:"Brief conversation (10:30–11pm) → sleep by 11:30pm",   cat:"gloria"   },
  {id:"water",      label:"3–4L water today",                                       cat:"nutrition"},
  {id:"no_sugar",   label:"Zero sugar · zero fast food · zero junk today",          cat:"nutrition"},
];
const SUN = [
  {id:"long_dev",   label:"Extended devotion — prayer, worship, reflection (5am)", cat:"faith"   },
  {id:"cardio",     label:"Cardio — 30–40 min run or HIIT (7am)",                  cat:"fitness" },
  {id:"breakfast",  label:"Post-cardio breakfast — eggs or chicken + whole food",  cat:"nutrition"},
  {id:"thesis1",    label:"Thesis deep work — block 1 (9:00–11:00am)",             cat:"thesis"  },
  {id:"thesis2",    label:"Thesis deep work — block 2 (11:00am–1:00pm)",           cat:"thesis"  },
  {id:"lunch",      label:"Lunch — chicken or eggs + rice, beans, or spaghetti",   cat:"nutrition"},
  {id:"rest",       label:"Rest + physical book reading (2–4pm)",                  cat:"reading" },
  {id:"wk_plan",    label:"Weekly planning — 1 intention per pillar (4pm)",        cat:"planning"},
  {id:"gig",        label:"Side gig — client work / content / outreach (5–7pm)",   cat:"sidegig" },
  {id:"dinner",     label:"Dinner — protein + whole food",                          cat:"nutrition"},
  {id:"gloria_dev", label:"Evening devotion with Gloria (10pm)",                    cat:"faith"   },
  {id:"gloria_talk",label:"Brief conversation (10:30–11pm) → sleep by 11:30pm",   cat:"gloria"  },
  {id:"water",      label:"3–4L water today",                                       cat:"nutrition"},
  {id:"no_sugar",   label:"Zero sugar · zero fast food · zero junk today",          cat:"nutrition"},
];

// ── Schedule data ─────────────────────────────────────────────────────────
const WD_SCHEDULE = [
  {time:"5:00am", label:"Wake up + hydrate",         detail:"500ml water the moment you wake. No phone — 10 min quiet. You're up earlier than everyone around you. Use these quiet moments as fuel.",                                                       cat:"morning",  dur:"10 min"},
  {time:"5:00am", label:"Morning devotion",           detail:"30 min with God before you touch anything else. Prayer → Bible study → one worship song. This is your foundation. Protect it like your income depends on it — because it does.",              cat:"faith",    dur:"30 min"},
  {time:"5:30am", label:"Shower + breakfast",         detail:"Quick shower to fully wake up. Then a fast high-protein breakfast: 3 eggs + oats OR 2 eggs + whole wheat bread. Pack your lunch. Walk out the door by 6am.",                                 cat:"nutrition",dur:"25 min"},
  {time:"6:00am", label:"Deliveries start",           detail:"Audiobook on from minute one. Run your routes efficiently. Every delivery is one step closer to the target. $150–$200 today — stay focused and move with purpose.",                          cat:"work",     dur:"7 hrs"},
  {time:"1:00pm", label:"Lunch on route",             detail:"Pull over and eat your packed meal: chicken + rice + beans + hot sauce. This is the mid-day refuel. No fast food. If you didn't pack lunch, you will — this happens once.",                   cat:"nutrition",dur:"45 min"},
  {time:"1:45pm", label:"Afternoon routes",           detail:"Switch from audiobook to music. Afternoon routes need a different energy — music keeps you moving without taxing your brain. Save the podcast for the commute home.",                          cat:"work",     dur:"4 hrs"},
  {time:"6:00pm", label:"Last drop + home",           detail:"Wrap it up. Turn on a podcast or sermon for the commute home — wind-down listening. You've earned the evening. Let yourself transition.",                                                       cat:"work",     dur:"30 min"},
  {time:"6:30pm", label:"Home — shower + rest",       detail:"Change out of work clothes. Sit down and rest for 20–30 min. Eat a light snack only if genuinely hungry. Dinner comes after gym on gym days (Mon/Wed/Fri), or at 7pm on rest days.",        cat:"morning",  dur:"30 min"},
  {time:"7:00pm", label:"GYM (Mon/Wed/Fri only)",     detail:"45–60 min strength session. Warm up 10 min, lift, cool down + stretch. On Tue/Thu this is your rest window — walk, read, or just breathe. Those rest days are part of the plan.",            cat:"fitness",  dur:"60 min"},
  {time:"8:00pm", label:"Dinner",                     detail:"High protein: chicken breast or eggs + rice, beans, or spaghetti. Spice it how you like — cayenne, hot sauce, garlic. Make it something you look forward to. No eating after 9:30pm.",       cat:"nutrition",dur:"30 min"},
  {time:"8:30pm", label:"Wind-down",                  detail:"Decompress. No heavy screens. Read a physical book, journal, or just sit in low stimulation. Let your nervous system come down fully before you go to sleep.",                                 cat:"evening",  dur:"90 min"},
  {time:"10:00pm",label:"Evening devotion with Gloria",detail:"Short devotion together. A verse, a prayer, maybe a worship song. Even 10 min together before God builds something no conversation can replicate.",                                           cat:"faith",    dur:"20 min"},
  {time:"10:20pm",label:"Conversation with Gloria",   detail:"30–40 min — present, phones away, real talk. How was the day? What's on your mind? What are you grateful for? These small daily moments are the whole relationship.",                         cat:"gloria",   dur:"40 min"},
  {time:"11:00pm",label:"Night prayer",               detail:"Close the day in prayer. Alone. Thanksgiving, surrender, peace. What you surrender tonight you won't carry into tomorrow.",                                                                     cat:"faith",    dur:"10 min"},
  {time:"11:30pm",label:"Sleep",                      detail:"In bed by 11:30pm. Protect 5.5 hours minimum. Deliveries + weight loss + growth — all of it is built in sleep. This is non-negotiable.",                                                      cat:"morning",  dur:"5.5 hrs"},
];
const SAT_SCHEDULE = [
  {time:"5:00am", label:"Wake up + devotion",        detail:"Morning devotion 5:00–5:30am. Prayer, Bible, worship. Saturday is your most packed day — the devotion is what makes it possible. Don't skip the foundation.",      cat:"faith",    dur:"30 min"},
  {time:"5:30am", label:"Shower + breakfast",         detail:"Quick shower. High-protein breakfast: 3–4 eggs + oats or whole wheat toast. Get ready — Gloria arrives at 6am.",                                                  cat:"nutrition",dur:"30 min"},
  {time:"6:00am", label:"Morning with Gloria",        detail:"2 full hours with Gloria — walk, sit, talk, pray, whatever you both need. This is protected time before the world pulls you in different directions. Be present.", cat:"gloria",   dur:"2 hrs"},
  {time:"8:00am", label:"Gym — upper body",           detail:"1 hour at the gym: Push press, bench, incline dumbbell, lateral raises, tricep dips. Clean and focused. You're home by 9am.",                                     cat:"fitness",  dur:"60 min"},
  {time:"9:00am", label:"Transition + travel",        detail:"Head out toward church. Hydrate. Light snack if needed.",                                                                                                           cat:"morning",  dur:"30 min"},
  {time:"9:30am", label:"Church cleaning",            detail:"One hour of service. Show up, clean, give back. This is character built in the small unseen moments.",                                                             cat:"faith",    dur:"60 min"},
  {time:"10:30am",label:"Thesis — 1 hour",            detail:"One focused thesis hour right after church cleaning. You're already in service mode — channel it into your academic work. Writing, reading, or editing.",          cat:"thesis",   dur:"60 min"},
  {time:"11:30am",label:"Pack lunch + prep",          detail:"Get your packed lunch and water ready. Leave for deliveries by 12pm.",                                                                                              cat:"nutrition",dur:"30 min"},
  {time:"12:00pm",label:"Deliveries — start",         detail:"Audiobook on from minute one. Saturday routes 12pm–6pm. Target $80–$120. Efficient pace — you've already put in a full morning.",                                 cat:"work",     dur:"6 hrs"},
  {time:"2:00pm", label:"Lunch on route",             detail:"Packed meal: chicken + rice or beans + hot sauce. Eat in the car or at a stop. Fuel the afternoon push.",                                                         cat:"nutrition",dur:"30 min"},
  {time:"6:00pm", label:"Last drop + home",           detail:"Wrap it up. Switch to a podcast or sermon for the commute home. Good work today.",                                                                                 cat:"work",     dur:"30 min"},
  {time:"6:30pm", label:"Freshen up",                 detail:"Quick shower and change. Get ready for the evening with Gloria.",                                                                                                   cat:"morning",  dur:"30 min"},
  {time:"7:00pm", label:"4 hours with Gloria",        detail:"Gloria time 7pm–11pm (approximate). Dinner together, conversation, rest, walks — whatever you both want. This is the heart of Saturday. Fully present.",          cat:"gloria",   dur:"4 hrs"},
  {time:"10:00pm",label:"Evening devotion with Gloria",detail:"10 min devotion together before the night ends. Pray for the week ahead. Gratitude over everything.",                                                             cat:"faith",    dur:"20 min"},
  {time:"10:20pm",label:"Brief conversation",         detail:"Wind down together. 10:30–11pm light conversation before sleep.",                                                                                                   cat:"gloria",   dur:"30 min"},
  {time:"11:30pm",label:"Sleep",                      detail:"You've done a full day — Gloria, gym, church, thesis, deliveries, Gloria again. Sleep is your reward.",                                                            cat:"morning",  dur:"5.5 hrs"},
];
const SUN_SCHEDULE = [
  {time:"5:00am", label:"Extended devotion",          detail:"Your longest devotion of the week. Prayer, worship, word, reflection. Journal what God has been doing. No rush — you have no deliveries today.",                  cat:"faith",    dur:"45 min"},
  {time:"5:45am", label:"Breakfast",                  detail:"Post-devotion breakfast: 3–4 eggs + oats or whole wheat toast. Fuel up before cardio.",                                                                           cat:"nutrition",dur:"30 min"},
  {time:"7:00am", label:"Cardio — run or HIIT",       detail:"30–40 min outdoor run or HIIT at home. Zone 2 pace — you should be able to speak in sentences. Sunday cardio is your reset for the week ahead.",                 cat:"fitness",  dur:"40 min"},
  {time:"7:40am", label:"Stretch + cool-down",        detail:"10–15 min full body stretch while still warm. Hip flexors, hamstrings, calves. After 6 days of delivery driving + lifting, your body needs this.",              cat:"fitness",  dur:"15 min"},
  {time:"8:00am", label:"Slow morning",               detail:"Rest. Shower, breathe, read, prepare. No urgency. Let the morning be genuinely restful before the thesis blocks start at 9am.",                                   cat:"morning",  dur:"60 min"},
  {time:"9:00am", label:"Thesis deep work — block 1", detail:"2 hours of focused writing or research. Phone on DND. This is your most important intellectual output of the week. Protect it absolutely.",                       cat:"thesis",   dur:"2 hrs"},
  {time:"11:00am",label:"Thesis deep work — block 2", detail:"Second 2-hour thesis block. Take a 5 min break then continue. You will produce meaningful work in these 4 hours combined.",                                       cat:"thesis",   dur:"2 hrs"},
  {time:"1:00pm", label:"Lunch + rest",               detail:"Chicken or eggs + rice, beans, or spaghetti. Spice it up. Rest for 30–45 min — no screen, no pressure. Physical book or just sit.",                             cat:"nutrition",dur:"90 min"},
  {time:"2:30pm", label:"Physical book reading",       detail:"60–90 min with a real book. Sunday afternoon is your reading window. Sit with it fully.",                                                                         cat:"reading",  dur:"90 min"},
  {time:"4:00pm", label:"Weekly planning",             detail:"30 min. Review thesis goals, side gig pipeline, delivery week ahead, meals, Gloria time. Set one intention per pillar.",                                          cat:"planning", dur:"30 min"},
  {time:"5:00pm", label:"Side gig work",               detail:"2 hours of focused side income work. Client projects, content, cold outreach, invoicing. This is your $500+/month builder.",                                     cat:"sidegig",  dur:"2 hrs"},
  {time:"7:00pm", label:"Dinner",                      detail:"Nourishing Sunday dinner. Chicken + rice or beans. Meal prep a little for the week while you're at it — boil eggs, pack lunches for Monday.",                   cat:"nutrition",dur:"60 min"},
  {time:"8:00pm", label:"Rest + wind-down",            detail:"Free time. Walk, watch something, decompress fully. Tomorrow is a full delivery day. Let Sunday evening be genuinely light.",                                     cat:"evening",  dur:"2 hrs"},
  {time:"10:00pm",label:"Evening devotion with Gloria",detail:"Short Sunday night devotion. Thank God for the week, pray over the week ahead. This is a powerful ritual — two people aligned before Monday.",                   cat:"faith",    dur:"20 min"},
  {time:"10:20pm",label:"Brief conversation",          detail:"10:30–11pm. Unhurried Sunday night conversation. Close the week together.",                                                                                        cat:"gloria",   dur:"40 min"},
  {time:"11:30pm",label:"Sleep",                       detail:"End the week in peace. You've rested, worked, worshipped, and planned. Tomorrow starts a new cycle. Sleep well.",                                                 cat:"morning",  dur:"5.5 hrs"},
];

// ── Workout data ──────────────────────────────────────────────────────────
const WARMUP = [
  {move:"Leg Swings (forward)",  reps:"10 each leg"},
  {move:"Leg Swings (lateral)",  reps:"10 each leg"},
  {move:"Arm Circles",           reps:"10 each direction"},
  {move:"Hip Circles",           reps:"10 each direction"},
  {move:"High Knees",            reps:"30 seconds"},
  {move:"Butt Kicks",            reps:"30 seconds"},
  {move:"Jumping Jacks",         reps:"30 seconds"},
  {move:"Walking Lunges",        reps:"10 each leg"},
  {move:"Inchworms",             reps:"5 reps"},
  {move:"Shoulder Dislocations", reps:"10 reps (use band or towel)"},
];
const SPLITS = {
  Mon: { label:"Push — Chest, Shoulders, Triceps", exercises:[
    {name:"Barbell Bench Press",      sets:"4",reps:"8–10",rest:"90 sec",note:"Control the descent, full range of motion"},
    {name:"Dumbbell Incline Press",   sets:"3",reps:"10–12",rest:"75 sec",note:"45° incline, squeeze at top"},
    {name:"Dumbbell Shoulder Press",  sets:"3",reps:"10–12",rest:"75 sec",note:"Seated or standing"},
    {name:"Lateral Raises",           sets:"3",reps:"12–15",rest:"60 sec",note:"Light weight, controlled — no swinging"},
    {name:"Tricep Dips",              sets:"3",reps:"10–12",rest:"75 sec",note:"Bodyweight or weighted"},
    {name:"Tricep Pushdown",          sets:"3",reps:"12–15",rest:"60 sec",note:"Cable or resistance band"},
  ]},
  Wed: { label:"Pull — Back, Biceps, Rear Delts", exercises:[
    {name:"Pull-ups",                 sets:"4",reps:"Max reps",rest:"90 sec",note:"Full hang, chin over bar — add weight if 10+ easy"},
    {name:"Barbell Bent-Over Row",    sets:"4",reps:"8–10",rest:"90 sec",note:"Brace core, pull to lower chest"},
    {name:"Dumbbell Single-Arm Row",  sets:"3",reps:"10–12 each",rest:"60 sec",note:"Full range, elbow drives back"},
    {name:"Face Pulls",               sets:"3",reps:"15",rest:"60 sec",note:"Resistance band or cable — rear delt focus"},
    {name:"Barbell Curl",             sets:"3",reps:"10–12",rest:"75 sec",note:"No body English — strict form"},
    {name:"Hammer Curl",              sets:"3",reps:"12",rest:"60 sec",note:"Neutral grip, both arms alternating"},
  ]},
  Fri: { label:"Legs — Quads, Hamstrings, Glutes, Calves", exercises:[
    {name:"Barbell Back Squat",       sets:"4",reps:"8–10",rest:"2 min",note:"Depth below parallel, drive through heels"},
    {name:"Romanian Deadlift",        sets:"3",reps:"10–12",rest:"90 sec",note:"Feel the hamstring stretch, hinge at hips"},
    {name:"Bulgarian Split Squat",    sets:"3",reps:"10 each leg",rest:"90 sec",note:"Rear foot elevated, knee tracks over toes"},
    {name:"Leg Press",                sets:"3",reps:"12–15",rest:"75 sec",note:"Full range, don't lock knees at top"},
    {name:"Leg Curl",                 sets:"3",reps:"12–15",rest:"60 sec",note:"Machine or Nordic curl"},
    {name:"Standing Calf Raise",      sets:"4",reps:"20",rest:"45 sec",note:"Full stretch at bottom, peak contraction at top"},
  ]},
  Sat: { label:"Upper Body — Chest, Back, Shoulders (AM session)", exercises:[
    {name:"Barbell Bench Press",      sets:"4",reps:"8–10",rest:"90 sec",note:"Primary push movement — lead with this fresh"},
    {name:"Pull-ups",                 sets:"4",reps:"Max reps",rest:"90 sec",note:"Superset-ready with bench if time is tight"},
    {name:"Dumbbell Shoulder Press",  sets:"3",reps:"10–12",rest:"75 sec",note:"Seated or standing"},
    {name:"Seated Cable Row",         sets:"3",reps:"10–12",rest:"75 sec",note:"Elbows in, squeeze shoulder blades"},
    {name:"Lateral Raises",           sets:"3",reps:"12–15",rest:"60 sec",note:"Light weight, strict control"},
    {name:"Plank",                    sets:"3",reps:"45–60 sec",rest:"45 sec",note:"Full body tension — core finisher"},
  ]},
  Sun: { label:"Cardio — Run or HIIT", exercises:[
    {name:"Warm-up walk",             sets:"1",reps:"5 min",rest:"—",note:"Easy pace to get the blood moving"},
    {name:"Zone 2 run (outdoor)",     sets:"1",reps:"25–35 min",rest:"—",note:"Conversational pace — you should be able to speak in sentences"},
    {name:"OR: HIIT intervals",       sets:"6",reps:"30 sec sprint / 90 sec walk",rest:"—",note:"If shorter on time — more intense, same fat-burning effect"},
    {name:"Cool-down walk",           sets:"1",reps:"5 min",rest:"—",note:"Easy pace, let heart rate come all the way down"},
    {name:"Full body stretch",        sets:"1",reps:"10–15 min",rest:"—",note:"Hip flexors, hamstrings, calves, lower back — delivery drivers need this"},
  ]},
};

// ── Nutrition data ────────────────────────────────────────────────────────
const NUTRITION_PLAN = {
  targets: { calories:1900, protein:150, carbs:200, fat:55 },
  weightLossRules:[
    "Zero sugar — no sweets, candy, soda, juice, or sweetened coffee until end of summer",
    "Zero fast food — pack your lunch every single day, no exceptions",
    "Zero junk snacks — chips, crackers, cookies, anything processed",
    "Stop eating by 9:30pm — late eating stores fat and wrecks sleep",
    "3–4L water every day — hunger is often thirst in disguise",
    "Every meal must have a protein source (eggs or chicken) + a whole food carb",
    "Make your food spicy — cayenne, hot sauce, garlic boost metabolism and satiety",
    "No liquid calories except water and black coffee (no sugar)",
  ],
  meals: [
    {
      name:"Breakfast — Pre-Route",
      time:"5:30am — quick before leaving by 6am",
      kcal:420, protein:38, carbs:35, fat:14,
      why:"Fast to prep, high protein, sustains energy for the first half of a long delivery day. If you skip breakfast you will buy fast food — don't skip breakfast.",
      foods:[
        {item:"3 large eggs (scrambled in non-stick or air-fried)", kcal:210, protein:21, carbs:2,  fat:14},
        {item:"1 cup rolled oats (cooked with water, no sugar)",     kcal:150, protein:5,  carbs:27, fat:3},
        {item:"1 medium banana or apple",                            kcal:80,  protein:1,  carbs:21, fat:0},
        {item:"Black coffee (no sugar)",                             kcal:5,   protein:0,  carbs:1,  fat:0},
      ],
    },
    {
      name:"Lunch on Route (Packed)",
      time:"1:00–2:00pm — packed from home, eaten on a delivery break",
      kcal:520, protein:55, carbs:48, fat:10,
      why:"The most important meal to prep. If you didn't pack lunch you will buy fast food. Cook chicken in batches on Sunday. Spice it heavily — make it a meal you look forward to.",
      foods:[
        {item:"6oz grilled chicken breast (seasoned + cayenne)",     kcal:280, protein:52, carbs:0,  fat:6},
        {item:"1 cup cooked rice, beans, or spaghetti",              kcal:200, protein:5,  carbs:42, fat:1},
        {item:"Hot sauce, garlic powder, spices (as much as you want)", kcal:10, protein:0, carbs:2, fat:0},
        {item:"Water — 500ml minimum",                               kcal:0,   protein:0,  carbs:0,  fat:0},
      ],
    },
    {
      name:"Dinner (Gym Days: Post-Workout)",
      time:"8:00–8:30pm — after gym on Mon/Wed/Fri, 7:30pm on rest days",
      kcal:600, protein:52, carbs:55, fat:16,
      why:"Your biggest meal. After deliveries + gym your body is starving for protein and carbs. Eat fully here. This is recovery fuel — not the place to under-eat.",
      foods:[
        {item:"6–8oz chicken breast or 4 eggs (your choice)",        kcal:320, protein:48, carbs:2,  fat:12},
        {item:"1.5 cups rice, beans, or spaghetti (whole grain if available)", kcal:250, protein:7, carbs:50, fat:2},
        {item:"1 cup steamed or stir-fried vegetables (broccoli, peppers, spinach)", kcal:60, protein:4, carbs:12, fat:0},
        {item:"Spices, hot sauce, garlic — make it taste good",      kcal:10,  protein:0,  carbs:2,  fat:0},
      ],
    },
    {
      name:"Optional Small Snack (Gym Days Only)",
      time:"6:30pm — light pre-workout fuel if genuinely hungry",
      kcal:120, protein:12, carbs:10, fat:3,
      why:"Only if you need it before gym on Mon/Wed/Fri. If not hungry, skip it — let the deficit work.",
      foods:[
        {item:"2 hard-boiled eggs OR 1 cup Greek yogurt (plain, no sugar)", kcal:120, protein:12, carbs:10, fat:3},
      ],
    },
  ],
  avoid:[
    {item:"Fast food",           reason:"You will pass 10 fast food restaurants a day — pack your lunch or you will stop"},
    {item:"Sweets + candy",      reason:"Pure sugar, zero satiety, zero protein — directly stored as fat"},
    {item:"Sugary drinks",       reason:"Soda, juice, sweetened coffee — liquid sugar is the #1 hidden calorie source"},
    {item:"Junk snacks",         reason:"Chips, crackers, cookies — engineered to make you eat past full"},
    {item:"Fried foods",         reason:"High calorie density, spike inflammation, slow digestion"},
    {item:"Eating after 9:30pm", reason:"Disrupts sleep and pushes calories past your daily budget"},
    {item:"Skipping breakfast",  reason:"You will make bad decisions on route — prep and eat before 6am"},
  ],
  supplements:[
    {name:"Creatine Monohydrate",dose:"5g daily with breakfast",note:"Improves strength and muscle preservation during weight loss — take daily."},
    {name:"Vitamin D3",          dose:"2,000 IU with breakfast",note:"Supports energy, mood, and immunity. Most people are deficient."},
    {name:"Magnesium Glycinate", dose:"400mg before bed",note:"Better sleep and faster muscle recovery — non-negotiable."},
    {name:"Protein Powder",      dose:"1 scoop only if below 130g protein from food",note:"Whey isolate preferred. Food first always."},
  ],
  hydration: "500ml water the moment you wake up. Keep a large 1.5–2L bottle in your delivery vehicle — you're physically active all day and will lose more water than you think. Aim for 3–4L total by 9pm. Reduce after 9:30pm to protect sleep. Black coffee is fine. No sugary drinks. Hunger often means you're dehydrated — drink water first.",
};

// ── Helpers ───────────────────────────────────────────────────────────────
function weekStr(d=new Date()) {
  const thu=new Date(d); thu.setDate(d.getDate()-((d.getDay()+6)%7)+3);
  const y=thu.getFullYear(), w=Math.ceil(((thu-new Date(y,0,1))/86400000+1)/7);
  return `${y}-W${String(w).padStart(2,"0")}`;
}
function calcStreak(arr) {
  if (!arr?.length) return 0;
  const today=new Date().toISOString().slice(0,10);
  const dates=[...new Set(arr.map(e=>e.date))].sort().reverse();
  let s=0; const d=new Date(today);
  for (const dt of dates) { if(dt===d.toISOString().slice(0,10)){s++;d.setDate(d.getDate()-1);}else break; }
  return s;
}

// ── Reusable UI ───────────────────────────────────────────────────────────
function PBar({value,max=100,color="#E8A838",h=6,bg="rgba(255,255,255,0.08)"}) {
  return <div style={{height:h,background:bg,borderRadius:h,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min((value/max)*100,100)}%`,background:color,borderRadius:h,transition:"width 0.4s"}}/></div>;
}
function Chip({label,color}) {
  return <span style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:color+"22",color,fontWeight:700,flexShrink:0}}>{label}</span>;
}
function SCard({label,value,sub,color,T}) {
  return (
    <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:"14px 16px",flex:"1 1 120px",borderLeft:`3px solid ${color}`}}>
      <div style={{fontSize:22,fontWeight:700,color:T.text,lineHeight:1}}>{value}</div>
      <div style={{fontSize:10,fontWeight:600,color:T.textSub,marginTop:3,textTransform:"uppercase",letterSpacing:"0.08em"}}>{label}</div>
      {sub&&<div style={{fontSize:11,color:T.textMuted,marginTop:3}}>{sub}</div>}
    </div>
  );
}
function Section({title,color,children}) {
  return (
    <div style={{marginBottom:24}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
        <div style={{width:3,height:18,borderRadius:2,background:color,flexShrink:0}}/>
        <div style={{fontSize:13,fontWeight:700,color,textTransform:"uppercase",letterSpacing:"0.1em"}}>{title}</div>
      </div>
      {children}
    </div>
  );
}
function InfoRow({label,value,T,indent=false}) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"7px 0",borderBottom:`1px solid ${T.border}`,gap:16,paddingLeft:indent?12:0}}>
      <span style={{fontSize:13,color:T.textSub,flex:1}}>{label}</span>
      <span style={{fontSize:13,fontWeight:600,color:T.text,textAlign:"right",flexShrink:0}}>{value}</span>
    </div>
  );
}

function Modal({title,accent,onClose,onSave,children,T}) {
  return (
    <div style={{position:"fixed",inset:0,zIndex:60,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:"20px 20px 0 0",boxShadow:"0 -8px 40px rgba(0,0,0,0.4)",width:"100%",maxWidth:560,maxHeight:"92vh",overflowY:"auto",padding:"24px 20px 40px"}}>
        <div style={{width:40,height:4,borderRadius:2,background:T.textMuted,margin:"0 auto 20px",opacity:0.4}}/>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:T.text,marginBottom:4}}>{title}</div>
        <div style={{height:2,width:40,background:accent,borderRadius:2,marginBottom:22}}/>
        {children}
        <div style={{display:"flex",gap:10,marginTop:28,justifyContent:"flex-end"}}>
          <button style={{padding:"10px 22px",borderRadius:10,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,background:T.inputBg,color:T.textSub}} onClick={onClose}>Cancel</button>
          <button style={{padding:"10px 22px",borderRadius:10,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,background:accent,color:"#fff"}} onClick={onSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function SummerApp({mode,T,onBack}) {
  const today=new Date().toISOString().slice(0,10);
  const dow=new Date().getDay();
  const isSat=dow===6, isSun=dow===0;
  const thisWeek=weekStr();

  const [isMobile,setIsMobile]=useState(()=>window.innerWidth<700);
  useEffect(()=>{const h=()=>setIsMobile(window.innerWidth<700); window.addEventListener("resize",h); return()=>window.removeEventListener("resize",h);},[]);

  const [pillar,setPillar]=useState("overview");
  const [data,setDataState]=useState(null);
  const [showForm,setShowForm]=useState(null);
  const [schedTab,setSchedTab]=useState("weekday");

  const [df,setDf]=useState({passage:"",insight:"",prayer:false,worship:false});
  const [tf,setTf]=useState({notes:"",duration:80});
  const [rf,setRf]=useState({title:"",format:"audiobook",amount:"",completed:false});
  const [gf,setGf]=useState({appreciation:"",highlight:"",prayed:false});
  const [sf,setSf]=useState({project:"",hours:"",revenue:"",contentBatched:false});
  const [ff,setFf]=useState({runDist:"",runTime:"",workoutType:"Push"});
  const [wf,setWf]=useState({faith:"",fitness:"",thesis:"",reading:"",gloria:"",sidegig:""});


  useEffect(()=>{
    (async()=>{
      const stored=await sGet("summer_amen");
      setDataState(stored??{checklist:{},devotion:[],thesis:[],reading:[],fitness:[],gloria:[],sidegig:[],intentions:{},nutrition:[]});
    })();
  },[]);

  function save(fn) {
    setDataState(prev=>{
      const next=typeof fn==="function"?fn(prev):fn;
      sSet("summer_amen",next);
      return next;
    });
  }

  if (!data) return (
    <div style={{display:"flex",height:"100vh",alignItems:"center",justifyContent:"center",background:"#111",color:"#E8A838",fontFamily:"'DM Sans',sans-serif",fontSize:16}}>
      Loading summer OS...
    </div>
  );

  // ── Computed ──────────────────────────────────────────────────────────
  const todayItems=isSat?SAT:isSun?SUN:WD;
  const checks=data.checklist[today]||{};
  const doneCount=todayItems.filter(i=>checks[i.id]).length;
  const pct=Math.round((doneCount/todayItems.length)*100);

  function toggleCheck(id) {
    save(p=>({...p,checklist:{...p.checklist,[today]:{...(p.checklist[today]||{}),[id]:!p.checklist[today]?.[id]}}}));
  }
  function thesisWeekHrs() {
    const d=new Date(); d.setDate(d.getDate()-((d.getDay()+6)%7));
    return data.thesis.filter(s=>s.date>=d.toISOString().slice(0,10)).reduce((s,e)=>s+(Number(e.duration)||80),0)/60;
  }
  const weekHrs=thesisWeekHrs();
  const monthRev=data.sidegig.filter(s=>s.date?.startsWith(today.slice(0,7))).reduce((s,e)=>s+(Number(e.revenue)||0),0);
  const monthBooks=data.reading.filter(r=>r.completed&&r.date?.startsWith(today.slice(0,7))).length;
  const devStreak=calcStreak(data.devotion);
  const fitStreak=calcStreak(data.fitness);
  const gloriaStreak=calcStreak(data.gloria);
  const savedIntentions=data.intentions[thisWeek]||{};
  const currentBook=[...data.reading].reverse().find(r=>!r.completed)?.title||"—";
  const last7=Array.from({length:7},(_,i)=>{const d=new Date(today);d.setDate(d.getDate()-(6-i));return d.toISOString().slice(0,10);});

  // ── Styles ────────────────────────────────────────────────────────────
  const cs=(x={})=>({background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:"18px 20px",...x});
  const inp={width:"100%",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 13px",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:14,outline:"none",boxSizing:"border-box"};
  const lbl={fontSize:11,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",color:T.textMuted,display:"block",marginBottom:5,marginTop:14,fontFamily:"'DM Sans',sans-serif"};
  const sel={...inp,background:mode==="dark"?"#181B23":"#fff",cursor:"pointer"};
  const tog=(active,color)=>({flex:1,padding:"10px",borderRadius:9,border:`1px solid ${active?color:T.border}`,background:active?color+"22":T.inputBg,color:active?color:T.textSub,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:active?700:400,transition:"all 0.15s"});

  const SIDEBAR_W=isMobile?0:200;

  // ── Views ──────────────────────────────────────────────────────────────

  const viewOverview=(
    <div>
      <div style={{fontFamily:"'DM Serif Display',serif",fontSize:isMobile?24:30,color:T.text,marginBottom:4}}>{"Amen's Summer ☀️"}</div>
      <div style={{fontSize:13,color:T.textSub,marginBottom:24}}>{new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</div>

      {Object.values(savedIntentions).some(Boolean)&&(
        <div style={{...cs({marginBottom:24,borderLeft:"3px solid #E8A838"})}}>
          <div style={{fontSize:11,fontWeight:700,color:"#E8A838",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12}}>{"✦ This Week's Intentions"}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:8}}>
            {Object.entries(savedIntentions).map(([k,v])=>v?(
              <div key={k} style={{fontSize:12,color:T.text}}><span style={{color:P[k]||"#888",fontWeight:700,textTransform:"capitalize"}}>{k}{": "}</span>{v}</div>
            ):null)}
          </div>
          <button onClick={()=>{setWf({...savedIntentions});setShowForm("intentions");}} style={{marginTop:12,fontSize:11,color:"#E8A838",background:"none",border:"1px solid #E8A83844",borderRadius:8,padding:"4px 10px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>{"Edit →"}</button>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:10,marginBottom:20}}>
        <SCard T={T} label="Thesis hrs/wk" value={weekHrs.toFixed(1)} sub="Target: 5 hrs" color={P.thesis}/>
        <SCard T={T} label="Books/month" value={`${monthBooks}/3`} sub="Target: 3" color={P.reading}/>
        <SCard T={T} label="Devotion streak" value={`${devStreak}d`} sub="Days in a row" color={P.faith}/>
        <SCard T={T} label="Fitness streak" value={`${fitStreak}d`} sub="Mon–Sat" color={P.fitness}/>
        <SCard T={T} label="Gloria streak" value={`${gloriaStreak}d`} sub="Every evening" color={P.gloria}/>
        <SCard T={T} label="Side gig revenue" value={`$${monthRev}`} sub="Target: $500+/mo" color={P.sidegig}/>
      </div>

      <div style={{...cs({marginBottom:14})}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontWeight:700,color:T.text}}>{"✎ Thesis This Week"}</span><span style={{fontWeight:700,color:P.thesis}}>{weekHrs.toFixed(1)}{"/5 hrs"}</span></div>
        <PBar value={weekHrs} max={5} color={P.thesis} h={8} bg={T.inputBg}/>
        <div style={{fontSize:11,color:T.textMuted,marginTop:6}}>{"Sat 1hr (10:30am) + Sun 4hrs (9am–1pm) = 5 hrs/week"}</div>
      </div>

      <div style={{...cs({marginBottom:14})}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontWeight:700,color:T.text}}>{"◆ Side Gig Revenue"}</span><span style={{fontWeight:700,color:P.sidegig}}>{"$"}{monthRev}{" / $500"}</span></div>
        <PBar value={monthRev} max={500} color={P.sidegig} h={8} bg={T.inputBg}/>
      </div>

      <div style={{...cs({marginBottom:14})}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontWeight:700,color:T.text}}>{"◐ Books This Month"}</span><span style={{fontWeight:700,color:P.reading}}>{monthBooks}{" / 3"}</span></div>
        <PBar value={monthBooks} max={3} color={P.reading} h={8} bg={T.inputBg}/>
      </div>

      <div style={{...cs()}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontWeight:700,color:T.text}}>{"☐ Today's Checklist"}</span><span style={{fontWeight:700,color:pct>=80?"#3DBF8A":"#E8A838"}}>{pct}{"%"}</span></div>
        <PBar value={pct} color={pct>=80?"#3DBF8A":"#E8A838"} bg={T.inputBg}/>
        <div style={{fontSize:11,color:T.textMuted,marginTop:6}}>{doneCount}{"/"}{todayItems.length}{" blocks · "}{isSat?"Saturday":isSun?"Sunday":"Weekday"}{" schedule"}</div>
        <button onClick={()=>setPillar("checklist")} style={{marginTop:10,fontSize:12,color:"#E8A838",background:"none",border:"1px solid #E8A83844",borderRadius:8,padding:"5px 12px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>{"View checklist →"}</button>
      </div>

      {!Object.values(savedIntentions).some(Boolean)&&(
        <div style={{textAlign:"center",marginTop:20}}>
          <button onClick={()=>{setWf({faith:"",fitness:"",thesis:"",reading:"",gloria:"",sidegig:""});setShowForm("intentions");}} style={{padding:"11px 24px",borderRadius:10,border:"1px solid #E8A83844",background:"#E8A83811",color:"#E8A838",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600}}>
            {"✦ Set This Week's Intentions"}
          </button>
        </div>
      )}
    </div>
  );

  const viewSchedule=(
    <div>
      <div style={{fontFamily:"'DM Serif Display',serif",fontSize:isMobile?22:28,color:T.text,marginBottom:4}}>{"📅 Full Daily Schedule"}</div>
      <div style={{fontSize:13,color:T.textSub,marginBottom:20}}>{"Every block, every time — color-coded by pillar"}</div>

      <div style={{display:"flex",gap:6,marginBottom:24,background:T.inputBg,borderRadius:10,padding:4,border:`1px solid ${T.border}`}}>
        {[["weekday","Mon–Fri"],["saturday","Saturday"],["sunday","Sunday"]].map(([k,l])=>(
          <button key={k} onClick={()=>setSchedTab(k)} style={{flex:1,padding:"8px",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:schedTab===k?700:400,background:schedTab===k?"#E8A838":"transparent",color:schedTab===k?"#111":T.textSub,transition:"all 0.15s"}}>{l}</button>
        ))}
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {(schedTab==="weekday"?WD_SCHEDULE:schedTab==="saturday"?SAT_SCHEDULE:SUN_SCHEDULE).map((block,i)=>(
          <div key={i} style={{...cs({padding:"14px 16px",borderLeft:`3px solid ${CAT[block.cat]||"#888"}`})}}>
            <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:6}}>
              <span style={{fontSize:13,fontWeight:700,color:CAT[block.cat]||"#888",minWidth:52,fontFamily:"'DM Sans',sans-serif"}}>{block.time}</span>
              <span style={{fontSize:14,fontWeight:700,color:T.text}}>{block.label}</span>
              <Chip label={block.dur} color={CAT[block.cat]||"#888"}/>
            </div>
            <div style={{fontSize:13,color:T.textSub,lineHeight:1.6,paddingLeft:62}}>{block.detail}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const viewChecklist=(
    <div>
      <div style={{fontFamily:"'DM Serif Display',serif",fontSize:isMobile?22:28,color:T.text,marginBottom:4}}>{"☐ Today's Checklist"}</div>
      <div style={{fontSize:13,color:T.textSub,marginBottom:20}}>{isSat?"Saturday":isSun?"Sunday":"Weekday"}{" · "}{doneCount}{"/"}{todayItems.length}{" done · "}{pct}{"%"}</div>
      <div style={{...cs({marginBottom:20})}}><PBar value={pct} color={pct>=80?"#3DBF8A":"#E8A838"} h={8} bg={T.inputBg}/></div>

      {["faith","fitness","nutrition","reading","thesis","gloria","work","evening","morning","planning"].map(cat=>{
        const items=todayItems.filter(i=>i.cat===cat);
        if (!items.length) return null;
        const catLabel={faith:"Faith",fitness:"Fitness",nutrition:"Nutrition",reading:"Reading",thesis:"Thesis",gloria:"Gloria",work:"Camp Work",evening:"Evening",morning:"Morning",planning:"Planning"}[cat]||cat;
        return (
          <div key={cat} style={{marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:700,color:CAT[cat]||"#888",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>{catLabel}</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {items.map(item=>{
                const done=!!checks[item.id];
                const cc=CAT[item.cat]||"#888";
                return (
                  <button key={item.id} onClick={()=>toggleCheck(item.id)}
                    style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:11,border:`1px solid ${done?cc+"44":T.border}`,background:done?cc+"11":T.surface,cursor:"pointer",textAlign:"left",width:"100%",transition:"all 0.15s"}}>
                    <div style={{width:20,height:20,borderRadius:5,border:`2px solid ${done?cc:T.border}`,background:done?cc:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.15s"}}>
                      {done&&<span style={{color:"#fff",fontSize:11,fontWeight:700,lineHeight:1}}>{"✓"}</span>}
                    </div>
                    <span style={{fontSize:13,color:done?T.textSub:T.text,fontFamily:"'DM Sans',sans-serif",textDecoration:done?"line-through":"none",flex:1,lineHeight:1.4}}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {Object.values(savedIntentions).some(Boolean)&&(
        <div style={{...cs({marginTop:8})}}>
          <div style={{fontWeight:700,color:T.text,marginBottom:10,fontSize:14}}>{"This Week's Intentions"}</div>
          {Object.entries(savedIntentions).map(([k,v])=>v?(
            <div key={k} style={{fontSize:13,color:T.text,padding:"5px 0",borderBottom:`1px solid ${T.border}`,display:"flex",gap:10}}>
              <span style={{color:P[k]||"#888",fontWeight:700,textTransform:"capitalize",minWidth:64}}>{k}</span>
              <span style={{color:T.textSub}}>{v}</span>
            </div>
          ):null)}
        </div>
      )}
    </div>
  );

  const viewFaith=(
    <div>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20,gap:12,flexWrap:"wrap"}}>
        <div>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:isMobile?22:28,color:P.faith}}>{"✦ Faith & Devotion"}</div>
          <div style={{fontSize:13,color:T.textSub,marginTop:2}}>{"Prayer · Bible · Worship · Night prayer"}</div>
        </div>
        <button onClick={()=>{const e=data.devotion.find(d=>d.date===today);setDf({passage:e?.passage||"",insight:e?.insight||"",prayer:e?.prayer||false,worship:e?.worship||false});setShowForm("devotion");}}
          style={{padding:"9px 16px",borderRadius:9,border:"none",background:P.faith,color:"#111",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,flexShrink:0}}>{"+ Log Today"}</button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:10,marginBottom:20}}>
        <SCard T={T} label="Streak" value={`${devStreak}d`} sub="Consecutive days" color={P.faith}/>
        <SCard T={T} label="Total logged" value={data.devotion.length} sub="All sessions" color="#E8A838"/>
        <SCard T={T} label="Today" value={data.devotion.find(d=>d.date===today)?"✓ Done":"Pending"} sub="" color={data.devotion.find(d=>d.date===today)?"#3DBF8A":"#888"}/>
      </div>

      <Section title="Devotion Structure" color={P.faith}>
        <div style={{...cs()}}>
          {[["4:40–4:45am","Prayer (5 min)","Speak to God about your day, your fears, your gratitude. Be honest, not performative."],["4:45–4:55am","Bible Study (10 min)","Read one passage with focus. Ask: What does this say? What does it mean? What do I do with this?"],["4:55–5:00am","Worship (5 min)","One song. Sing or listen with full attention. Let worship shift your posture before the day begins."],["11:15pm","Night prayer (10 min)","Close the day the same way you opened it. Thanksgiving, surrender, peace."]].map(([t,l,d])=>(
            <div key={t} style={{padding:"10px 0",borderBottom:`1px solid ${T.border}`,display:"flex",gap:12}}>
              <span style={{fontSize:11,fontWeight:700,color:P.faith,minWidth:90,flexShrink:0}}>{t}</span>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:3}}>{l}</div>
                <div style={{fontSize:12,color:T.textSub,lineHeight:1.5}}>{d}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Last 7 Days" color={P.faith}>
        <div style={{...cs()}}>
          <div style={{display:"flex",gap:8}}>
            {last7.map(d=>{
              const entry=data.devotion.find(e=>e.date===d);
              return (
                <div key={d} style={{flex:1,textAlign:"center"}}>
                  <div style={{fontSize:10,color:T.textMuted,marginBottom:6}}>{new Date(d+"T12:00:00").toLocaleDateString("en-US",{weekday:"short"})}</div>
                  <div style={{width:32,height:32,borderRadius:9,margin:"0 auto",background:entry?P.faith+"33":T.inputBg,border:`2px solid ${entry?P.faith:T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:entry?P.faith:T.textMuted}}>
                    {entry?"✦":"·"}
                  </div>
                  {entry?.passage&&<div style={{fontSize:8,color:T.textMuted,marginTop:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{entry.passage.slice(0,8)}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {[...data.devotion].reverse().slice(0,12).map((e,i)=>(
          <div key={i} style={{...cs({padding:"14px 16px",borderLeft:`3px solid ${P.faith}`})}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
              <div style={{fontSize:13,fontWeight:700,color:P.faith}}>{e.passage||"Devotion"}</div>
              <div style={{fontSize:11,color:T.textMuted}}>{e.date}</div>
            </div>
            {e.insight&&<div style={{fontSize:13,color:T.text,lineHeight:1.5,marginBottom:8}}>{e.insight}</div>}
            <div style={{display:"flex",gap:6}}>
              {e.prayer&&<Chip label="🙏 Prayed" color={P.faith}/>}
              {e.worship&&<Chip label="🎵 Worship" color="#E8A838"/>}
            </div>
          </div>
        ))}
        {!data.devotion.length&&<div style={{...cs({textAlign:"center",padding:"50px 20px"})}}>
          <div style={{fontSize:36,marginBottom:10}}>{"✦"}</div>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:18,color:T.text}}>{"Start your streak"}</div>
          <div style={{fontSize:13,color:T.textSub,marginTop:6}}>{"Log your first devotion today."}</div>
        </div>}
      </div>
    </div>
  );

  const viewFitness=(
    <div>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20,gap:12,flexWrap:"wrap"}}>
        <div>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:isMobile?22:28,color:P.fitness}}>{"◈ Fitness"}</div>
          <div style={{fontSize:13,color:T.textSub,marginTop:2}}>{"Gym Mon/Wed/Fri (eve) + Sat AM · Cardio Sunday · Rest Tue/Thu"}</div>
        </div>
        <button onClick={()=>{setFf({runDist:"",runTime:"",workoutType:"Push"});setShowForm("fitness");}}
          style={{padding:"9px 16px",borderRadius:9,border:"none",background:P.fitness,color:"#111",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,flexShrink:0}}>{"+ Log Workout"}</button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:10,marginBottom:20}}>
        <SCard T={T} label="Streak" value={`${fitStreak}d`} sub="Mon–Sat" color={P.fitness}/>
        <SCard T={T} label="Month miles" value={`${data.fitness.filter(f=>f.date?.startsWith(today.slice(0,7))).reduce((s,f)=>s+(Number(f.runDist)||0),0).toFixed(1)} mi`} sub="Running total" color="#3B9EDB"/>
        <SCard T={T} label="This week" value={`${(()=>{const d=new Date();d.setDate(d.getDate()-((d.getDay()+6)%7));return data.fitness.filter(f=>f.date>=d.toISOString().slice(0,10)).length;})()} sessions`} sub="Target: 5" color="#E8A838"/>
      </div>

      <Section title="Cardio Guide (Sundays)" color={P.fitness}>
        <div style={{...cs()}}>
          {[["When","Sunday only — one dedicated cardio day per week. Tue/Thu are full rest from training."],["Option A — Run","25–35 min easy outdoor run. Conversational pace (Zone 2, 120–140 bpm). Burns fat, builds aerobic base."],["Option B — HIIT","6–8 rounds of 30 sec sprint / 90 sec walk. Better for time, same fat-burning effect."],["After cardio","10–15 min full body stretch. Hip flexors, hamstrings, calves — delivery driving tightens all of these."],["Weight loss note","Cardio supports fat loss. The real work is done in the kitchen — stick to the nutrition rules."]].map(([l,d])=>(
            <InfoRow key={l} label={l} value={d} T={T}/>
          ))}
        </div>
      </Section>

      <Section title="Dynamic Warm-Up — 10 min (every session)" color={P.fitness}>
        <div style={{...cs()}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:8}}>
            {WARMUP.map((w,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,background:T.inputBg,borderRadius:8,padding:"8px 12px"}}>
                <div style={{width:22,height:22,borderRadius:"50%",background:P.fitness+"33",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:P.fitness,flexShrink:0}}>{i+1}</div>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:T.text,lineHeight:1.3}}>{w.move}</div>
                  <div style={{fontSize:11,color:T.textSub}}>{w.reps}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Weekly Training Split" color={P.fitness}>
        {Object.entries(SPLITS).map(([day,split])=>(
          <div key={day} style={{...cs({marginBottom:10})}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <div style={{background:P.fitness+"22",border:`1px solid ${P.fitness}55`,borderRadius:8,padding:"4px 12px",fontSize:12,fontWeight:700,color:P.fitness}}>{day}</div>
              <div style={{fontSize:14,fontWeight:700,color:T.text}}>{split.label}</div>
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,fontFamily:"'DM Sans',sans-serif"}}>
                <thead>
                  <tr style={{borderBottom:`1px solid ${T.border}`}}>
                    {["Exercise","Sets","Reps","Rest","Note"].map(h=>(
                      <th key={h} style={{textAlign:"left",padding:"5px 8px",color:T.textMuted,fontWeight:600,fontSize:10,textTransform:"uppercase",letterSpacing:"0.08em",whiteSpace:"nowrap"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {split.exercises.map((ex,i)=>(
                    <tr key={i} style={{borderBottom:`1px solid ${T.border}`,background:i%2===0?"transparent":T.inputBg+"55"}}>
                      <td style={{padding:"8px",color:T.text,fontWeight:600}}>{ex.name}</td>
                      <td style={{padding:"8px",color:P.fitness,fontWeight:700,textAlign:"center"}}>{ex.sets}</td>
                      <td style={{padding:"8px",color:T.text,whiteSpace:"nowrap"}}>{ex.reps}</td>
                      <td style={{padding:"8px",color:T.textSub,whiteSpace:"nowrap"}}>{ex.rest}</td>
                      <td style={{padding:"8px",color:T.textMuted,fontSize:11}}>{ex.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </Section>

      <Section title="Workout Log" color={P.fitness}>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[...data.fitness].reverse().slice(0,15).map((f,i)=>(
            <div key={i} style={{...cs({padding:"12px 16px",borderLeft:`3px solid ${P.fitness}`})}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:6}}>
                <div style={{fontSize:14,fontWeight:600,color:T.text}}>{f.workoutType}</div>
                <div style={{fontSize:11,color:T.textMuted}}>{f.date}</div>
              </div>
              {(f.runDist||f.runTime)&&(
                <div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
                  <Chip label={`🏃 ${f.runDist||"?"} mi`} color={P.fitness}/>
                  <Chip label={`⏱ ${f.runTime||"?"} min run`} color="#3B9EDB"/>
                </div>
              )}
            </div>
          ))}
          {!data.fitness.length&&<div style={{...cs({textAlign:"center",padding:"40px 20px"})}}>
            <div style={{fontSize:36,marginBottom:10}}>{"◈"}</div>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:18,color:T.text}}>{"No workouts logged yet"}</div>
          </div>}
        </div>
      </Section>
    </div>
  );

  const viewNutrition=(
    <div>
      <div style={{fontFamily:"'DM Serif Display',serif",fontSize:isMobile?22:28,color:P.nutrition,marginBottom:4}}>{"🥗 Nutrition"}</div>
      <div style={{fontSize:13,color:T.textSub,marginBottom:20}}>{"Full meal plan · calories · macros · what to eat and avoid"}</div>

      <Section title="Weight Loss Rules" color="#E84E8A">
        <div style={{...cs()}}>
          {NUTRITION_PLAN.weightLossRules.map((rule,i)=>(
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"7px 0",borderBottom:i<NUTRITION_PLAN.weightLossRules.length-1?`1px solid ${T.border}`:"none"}}>
              <span style={{fontSize:14,flexShrink:0,color:"#E84E8A"}}>{"→"}</span>
              <div style={{fontSize:13,color:T.text,lineHeight:1.5}}>{rule}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Daily Targets" color={P.nutrition}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:10,marginBottom:14}}>
          {[["Calories","~1,900 kcal","Weight loss deficit"],["Protein","150g","High protein to preserve muscle"],["Carbs","~200g","Whole foods only"],["Fat","~55g","Healthy fats only"]].map(([l,v,s])=>(
            <SCard key={l} T={T} label={l} value={v} sub={s} color={P.nutrition}/>
          ))}
        </div>
        <div style={{...cs({borderLeft:`3px solid ${P.nutrition}`})}}>
          <div style={{fontSize:13,color:T.text,lineHeight:1.7}}>{"Hydration: "}<strong style={{color:P.nutrition}}>{"3–4L water daily."}</strong>{" 500ml immediately upon waking. Large bottle in your delivery vehicle — you lose more water than you think while driving and lifting. Reduce after 9:30pm. No sugary drinks."}</div>
        </div>
      </Section>

      {NUTRITION_PLAN.meals.map((meal,mi)=>(
        <Section key={mi} title={meal.name} color={P.nutrition}>
          <div style={{...cs()}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:8}}>
              <div style={{fontSize:12,color:T.textSub}}>{meal.time}</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                <Chip label={`${meal.kcal} kcal`} color={P.nutrition}/>
                <Chip label={`${meal.protein}g protein`} color={P.fitness}/>
                <Chip label={`${meal.carbs}g carbs`} color="#E8A838"/>
                <Chip label={`${meal.fat}g fat`} color="#E8704A"/>
              </div>
            </div>
            <div style={{background:P.nutrition+"11",border:`1px solid ${P.nutrition}33`,borderRadius:9,padding:"10px 13px",marginBottom:12,fontSize:12,color:T.text,lineHeight:1.5}}>{meal.why}</div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,fontFamily:"'DM Sans',sans-serif"}}>
                <thead>
                  <tr style={{borderBottom:`1px solid ${T.border}`}}>
                    {["Food","kcal","Protein","Carbs","Fat"].map(h=>(
                      <th key={h} style={{textAlign:"left",padding:"5px 8px",color:T.textMuted,fontWeight:600,fontSize:10,textTransform:"uppercase",letterSpacing:"0.08em",whiteSpace:"nowrap"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {meal.foods.map((f,i)=>(
                    <tr key={i} style={{borderBottom:`1px solid ${T.border}`,background:i%2===0?"transparent":T.inputBg+"55"}}>
                      <td style={{padding:"8px",color:T.text}}>{f.item}</td>
                      <td style={{padding:"8px",color:P.nutrition,fontWeight:700,textAlign:"center"}}>{f.kcal}</td>
                      <td style={{padding:"8px",color:P.fitness,fontWeight:600,textAlign:"center"}}>{f.protein}{"g"}</td>
                      <td style={{padding:"8px",color:"#E8A838",textAlign:"center"}}>{f.carbs}{"g"}</td>
                      <td style={{padding:"8px",color:"#E8704A",textAlign:"center"}}>{f.fat}{"g"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Section>
      ))}

      <Section title="Foods to Avoid" color="#E84E8A">
        <div style={{...cs()}}>
          {NUTRITION_PLAN.avoid.map((a,i)=>(
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"8px 0",borderBottom:i<NUTRITION_PLAN.avoid.length-1?`1px solid ${T.border}`:"none"}}>
              <span style={{fontSize:16,flexShrink:0}}>{"🚫"}</span>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:"#E84E8A"}}>{a.item}</div>
                <div style={{fontSize:12,color:T.textSub,marginTop:2}}>{a.reason}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Supplements" color="#C8B030">
        <div style={{...cs()}}>
          {NUTRITION_PLAN.supplements.map((s,i)=>(
            <div key={i} style={{padding:"10px 0",borderBottom:i<NUTRITION_PLAN.supplements.length-1?`1px solid ${T.border}`:"none"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:6,marginBottom:4}}>
                <div style={{fontSize:13,fontWeight:700,color:T.text}}>{s.name}</div>
                <Chip label={s.dose} color="#C8B030"/>
              </div>
              <div style={{fontSize:12,color:T.textSub}}>{s.note}</div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );

  const viewThesis=(
    <div>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20,gap:12,flexWrap:"wrap"}}>
        <div>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:isMobile?22:28,color:P.thesis}}>{"✎ Thesis Work"}</div>
          <div style={{fontSize:13,color:T.textSub,marginTop:2}}>{"Weekend only · Sat 1hr + Sun 4hrs · ~5 hrs/week"}</div>
        </div>
        <button onClick={()=>{setTf({notes:"",duration:80});setShowForm("thesis");}}
          style={{padding:"9px 16px",borderRadius:9,border:"none",background:P.thesis,color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,flexShrink:0}}>{"+ Log Session"}</button>
      </div>

      <div style={{...cs({marginBottom:20})}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{fontWeight:700,color:T.text,fontSize:15}}>{"This Week"}</div>
          <div style={{fontSize:14,fontWeight:700,color:P.thesis}}>{weekHrs.toFixed(1)}{" / 5 hrs"}</div>
        </div>
        <PBar value={weekHrs} max={5} color={P.thesis} h={10} bg={T.inputBg}/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:4,marginTop:12}}>
          {["Mon","Tue","Wed","Thu","Fri","Sat"].map((d,i)=>{
            const dd=new Date(); dd.setDate(dd.getDate()-((dd.getDay()+6)%7)+i);
            const dateStr=dd.toISOString().slice(0,10);
            const done=data.thesis.some(t=>t.date===dateStr);
            return (
              <div key={d} style={{textAlign:"center"}}>
                <div style={{fontSize:10,color:T.textMuted,marginBottom:4}}>{d}</div>
                <div style={{height:28,borderRadius:6,background:done?P.thesis+"33":T.inputBg,border:`1px solid ${done?P.thesis:T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:done?P.thesis:T.textMuted}}>
                  {done?"✓":"·"}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{fontSize:11,color:T.textMuted,marginTop:10}}>{"6 days × 80 min = 480 min = exactly 8 hours. No single day feels crushing."}</div>
      </div>

      <Section title="How Your 8 Hours Land" color={P.thesis}>
        <div style={{...cs()}}>
          {[["Mon–Fri","80 min each day · 5:30pm slot · after camp, before dinner"],["Saturday","80 min · 5:00pm slot · even on busy weekends — consistency over intensity"],["Sunday","Rest · No thesis · let your brain recover"],["Why 5:30pm?","Mind is still fresh but physical camp work is done. Deep work window before evening."]].map(([l,d])=>(
            <InfoRow key={l} label={l} value={d} T={T}/>
          ))}
        </div>
      </Section>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:10,marginBottom:20}}>
        <SCard T={T} label="This week" value={`${weekHrs.toFixed(1)} hrs`} sub="Target 5 hrs" color={P.thesis}/>
        <SCard T={T} label="All-time" value={`${(data.thesis.reduce((s,e)=>s+(Number(e.duration)||80),0)/60).toFixed(1)} hrs`} sub="Total focused" color="#E8A838"/>
        <SCard T={T} label="Sessions" value={data.thesis.length} sub="Total logged" color="#3DBF8A"/>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {[...data.thesis].reverse().slice(0,15).map((s,i)=>(
          <div key={i} style={{...cs({padding:"14px 16px",borderLeft:`3px solid ${P.thesis}`})}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
              <Chip label={`${s.duration||80} min`} color={P.thesis}/>
              <div style={{fontSize:11,color:T.textMuted}}>{s.date}</div>
            </div>
            {s.notes&&<div style={{fontSize:13,color:T.text,lineHeight:1.5,marginTop:6}}>{s.notes}</div>}
          </div>
        ))}
        {!data.thesis.length&&<div style={{...cs({textAlign:"center",padding:"50px 20px"})}}>
          <div style={{fontSize:36,marginBottom:10}}>{"✎"}</div>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:18,color:T.text}}>{"No sessions logged yet"}</div>
          <div style={{fontSize:13,color:T.textSub,marginTop:6}}>{"Log your first 80-min deep work block."}</div>
        </div>}
      </div>
    </div>
  );

  const viewReading=(
    <div>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20,gap:12,flexWrap:"wrap"}}>
        <div>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:isMobile?22:28,color:P.reading}}>{"◐ Reading"}</div>
          <div style={{fontSize:13,color:T.textSub,marginTop:2}}>{"Audiobook + physical · 3 books/month"}</div>
        </div>
        <button onClick={()=>{setRf({title:currentBook==="—"?"":currentBook,format:"audiobook",amount:"",completed:false});setShowForm("reading");}}
          style={{padding:"9px 16px",borderRadius:9,border:"none",background:P.reading,color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,flexShrink:0}}>{"+ Log Reading"}</button>
      </div>

      <div style={{...cs({marginBottom:20})}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><span style={{fontWeight:700,color:T.text}}>{"Books This Month"}</span><span style={{fontWeight:700,color:P.reading}}>{monthBooks}{" / 3"}</span></div>
        <PBar value={monthBooks} max={3} color={P.reading} h={8} bg={T.inputBg}/>
      </div>

      <Section title="Reading Windows — ~8 hrs/week total" color={P.reading}>
        <div style={{...cs()}}>
          {[["🚶 Morning commute","20–30 min · audiobook · 3.5 hrs/week just from this alone"],["☕ Lunch break","15–20 min · audiobook or physical · 5 days/week → 1.5 hrs/week"],["🌙 Evening wind-down","20–30 min · physical book before Gloria time · 5 nights → 2 hrs/week"],["📖 Sunday afternoon","1 dedicated hour · physical book · sit with a chapter, no rushing"]].map(([l,d])=>(
            <div key={l} style={{padding:"8px 0",borderBottom:`1px solid ${T.border}`,display:"flex",gap:12,alignItems:"flex-start"}}>
              <span style={{fontSize:13,fontWeight:700,color:P.reading,minWidth:120,flexShrink:0}}>{l}</span>
              <span style={{fontSize:12,color:T.textSub,lineHeight:1.5}}>{d}</span>
            </div>
          ))}
          <div style={{marginTop:12,background:P.reading+"11",borderRadius:9,padding:"10px 13px",fontSize:12,color:T.text}}>{"At average audiobook speed (~240 words/min), 8 hrs/week = roughly 1 book per week. 3 books per month is very achievable without carving out extra time."}</div>
        </div>
      </Section>

      <Section title="Where to Get Audiobooks" color={P.reading}>
        <div style={{...cs()}}>
          {[["Audible","Best selection. ~$15/month for 1 credit. Use for must-read titles."],["Libby (free)","Connect your library card. Huge catalog. Borrow for free — waiting lists for popular books."],["Spotify","Audiobooks included in Premium. Growing library."],["Physical books","Keep one on your nightstand, one at your desk. Mix genres."]].map(([l,d])=>(
            <InfoRow key={l} label={l} value={d} T={T}/>
          ))}
        </div>
      </Section>

      <Section title="Book Mix Strategy (per month)" color={P.reading}>
        <div style={{...cs()}}>
          {[["Book 1 — Faith/Growth","Spiritual, character, or mindset book. Feeds your devotion life."],["Book 2 — Business/Skill","Web dev, marketing, entrepreneurship, or a hard skill. Builds the side gig."],["Book 3 — Story/Biography","A biography or narrative. Rest for your analytical mind."]].map(([l,d])=>(
            <div key={l} style={{padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
              <div style={{fontSize:13,fontWeight:700,color:P.reading,marginBottom:3}}>{l}</div>
              <div style={{fontSize:12,color:T.textSub}}>{d}</div>
            </div>
          ))}
        </div>
      </Section>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:10,marginBottom:20}}>
        <SCard T={T} label="Books/month" value={`${monthBooks}/3`} sub="Target 3" color={P.reading}/>
        <SCard T={T} label="Current book" value={currentBook.length>14?currentBook.slice(0,14)+"…":currentBook} sub="" color="#3DBF8A"/>
        <SCard T={T} label="Total sessions" value={data.reading.length} sub="All reading" color="#E8A838"/>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {[...data.reading].reverse().slice(0,15).map((r,i)=>(
          <div key={i} style={{...cs({padding:"12px 16px",borderLeft:`3px solid ${r.completed?"#3DBF8A":P.reading}`})}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:6}}>
              <div style={{fontSize:14,fontWeight:600,color:T.text}}>{r.title||"Unnamed book"}</div>
              <div style={{fontSize:11,color:T.textMuted}}>{r.date}</div>
            </div>
            <div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
              <Chip label={`${r.format==="audiobook"?"🎧":"📖"} ${r.amount} ${r.format==="audiobook"?"min":"pages"}`} color={P.reading}/>
              {r.completed&&<Chip label="✓ Completed" color="#3DBF8A"/>}
            </div>
          </div>
        ))}
        {!data.reading.length&&<div style={{...cs({textAlign:"center",padding:"50px 20px"})}}>
          <div style={{fontSize:36,marginBottom:10}}>{"📚"}</div>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:18,color:T.text}}>{"No reading logged yet"}</div>
          <div style={{fontSize:13,color:T.textSub,marginTop:6}}>{"Start with today's commute audiobook."}</div>
        </div>}
      </div>
    </div>
  );

  const viewGloria=(
    <div>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20,gap:12,flexWrap:"wrap"}}>
        <div>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:isMobile?22:28,color:P.gloria}}>{"♡ Gloria"}</div>
          <div style={{fontSize:13,color:T.textSub,marginTop:2}}>{"30–60 min · every evening · fully present"}</div>
        </div>
        <button onClick={()=>{const e=data.gloria.find(g=>g.date===today);setGf({appreciation:e?.appreciation||"",highlight:e?.highlight||"",prayed:e?.prayed||false});setShowForm("gloria");}}
          style={{padding:"9px 16px",borderRadius:9,border:"none",background:P.gloria,color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,flexShrink:0}}>{"+ Log Today"}</button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:10,marginBottom:20}}>
        <SCard T={T} label="Streak" value={`${gloriaStreak}d`} sub="Every day counts" color={P.gloria}/>
        <SCard T={T} label="Total logged" value={data.gloria.length} sub="All sessions" color="#E8A838"/>
        <SCard T={T} label="Today" value={data.gloria.find(g=>g.date===today)?"✓ Logged":"Not yet"} sub="" color={data.gloria.find(g=>g.date===today)?"#3DBF8A":"#888"}/>
      </div>

      <Section title="Last 7 Days" color={P.gloria}>
        <div style={{...cs()}}>
          <div style={{display:"flex",gap:8}}>
            {last7.map(d=>{
              const entry=data.gloria.find(e=>e.date===d);
              return (
                <div key={d} style={{flex:1,textAlign:"center"}}>
                  <div style={{fontSize:10,color:T.textMuted,marginBottom:6}}>{new Date(d+"T12:00:00").toLocaleDateString("en-US",{weekday:"short"})}</div>
                  <div style={{width:32,height:32,borderRadius:"50%",margin:"0 auto",background:entry?P.gloria+"33":T.inputBg,border:`2px solid ${entry?P.gloria:T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:entry?P.gloria:T.textMuted}}>
                    {entry?"♡":"·"}
                  </div>
                  {entry?.prayed&&<div style={{fontSize:8,color:P.gloria,marginTop:3}}>{"prayed"}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      <Section title="Conversation Starters" color={P.gloria}>
        <div style={{...cs({borderLeft:`3px solid ${P.gloria}`})}}>
          {["What was the best part of your day?","What is on your heart right now?","What made you smile today?","What are you looking forward to this week?","What do you need most from me right now?","What's something you've been thinking about lately?","What can I pray for you about?"].map((q,i,arr)=>(
            <div key={i} style={{fontSize:13,color:T.textSub,padding:"8px 0",borderBottom:i<arr.length-1?`1px solid ${T.border}`:"none",lineHeight:1.5}}>{`"${q}"`}</div>
          ))}
        </div>
      </Section>

      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {[...data.gloria].reverse().slice(0,10).map((g,i)=>(
          <div key={i} style={{...cs({padding:"14px 16px",borderLeft:`3px solid ${P.gloria}`})}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
              <span style={{fontSize:12,fontWeight:700,color:P.gloria}}>{"♡ "}{g.date}</span>
              {g.prayed&&<Chip label="🙏 Prayed together" color={P.gloria}/>}
            </div>
            {g.appreciation&&<div style={{fontSize:13,color:T.text,marginBottom:4}}><strong style={{color:T.textSub}}>{"Appreciated: "}</strong>{g.appreciation}</div>}
            {g.highlight&&<div style={{fontSize:13,color:T.text}}><strong style={{color:T.textSub}}>{"Highlight: "}</strong>{g.highlight}</div>}
          </div>
        ))}
        {!data.gloria.length&&<div style={{...cs({textAlign:"center",padding:"50px 20px"})}}>
          <div style={{fontSize:36,marginBottom:10}}>{"♡"}</div>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:18,color:T.text}}>{"Start logging"}</div>
          <div style={{fontSize:13,color:T.textSub,marginTop:6}}>{"30–60 intentional minutes. Phones away."}</div>
        </div>}
      </div>
    </div>
  );

  const viewSidegig=(
    <div>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20,gap:12,flexWrap:"wrap"}}>
        <div>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:isMobile?22:28,color:P.sidegig}}>{"◆ Side Gig"}</div>
          <div style={{fontSize:13,color:T.textSub,marginTop:2}}>{"Web dev · Sat 6hrs + Sun 4hrs · $2k/month goal"}</div>
        </div>
        <button onClick={()=>{setSf({project:"",hours:"",revenue:"",contentBatched:false});setShowForm("sidegig");}}
          style={{padding:"9px 16px",borderRadius:9,border:"none",background:P.sidegig,color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,flexShrink:0}}>{"+ Log Work"}</button>
      </div>

      <div style={{...cs({marginBottom:20})}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><span style={{fontWeight:700,color:T.text}}>{"Side Gig Revenue"}</span><span style={{fontWeight:700,color:P.sidegig}}>{"$"}{monthRev}{" / $500"}</span></div>
        <PBar value={monthRev} max={500} color={P.sidegig} h={10} bg={T.inputBg}/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:10,marginBottom:20}}>
        <SCard T={T} label="Side gig rev" value={`$${monthRev}`} sub="Target $500+/mo" color={P.sidegig}/>
        <SCard T={T} label="Month hours" value={`${data.sidegig.filter(s=>s.date?.startsWith(today.slice(0,7))).reduce((s,e)=>s+(Number(e.hours)||0),0)} hrs`} sub="Sunday block" color="#E8A838"/>
        <SCard T={T} label="Content batch" value={data.sidegig.some(s=>{const d=new Date();d.setDate(d.getDate()-((d.getDay()+6)%7));return s.date>=d.toISOString().slice(0,10)&&s.contentBatched;})?"✓ Done":"Pending"} sub="This week" color={data.sidegig.some(s=>{const d=new Date();d.setDate(d.getDate()-((d.getDay()+6)%7));return s.date>=d.toISOString().slice(0,10)&&s.contentBatched;})?"#3DBF8A":"#888"}/>
      </div>

      <Section title="Side Gig Schedule" color={P.sidegig}>
        <div style={{...cs()}}>
          {[["Sun · 9:00am","Client website work: build, design, deliver — your primary side gig block","2 hrs"],["Sun · 11:00am","Content batch: captions, carousels, reels — schedule full week in Meta Suite","1 hr"],["Sun · 12:00pm","Cold DMs, client comms, project finishing, portfolio, invoicing","1 hr"],["Evenings","Brief admin, emails, quick comms if needed after wind-down (9:15pm)","15–30 min"]].map(([t,d,dur])=>(
            <div key={t} style={{padding:"10px 0",borderBottom:`1px solid ${T.border}`,display:"flex",gap:12,alignItems:"flex-start"}}>
              <div style={{minWidth:100,flexShrink:0}}>
                <div style={{fontSize:11,fontWeight:700,color:P.sidegig}}>{t}</div>
                <Chip label={dur} color={P.sidegig}/>
              </div>
              <div style={{fontSize:13,color:T.text,lineHeight:1.5}}>{d}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Weekly Commitments" color={P.sidegig}>
        <div style={{...cs()}}>
          {[["Side gig hours","4 hrs/week","Sunday main block + brief evenings"],["Monthly side gig target","$500+","Growing alongside delivery income"],["Content batching","Once per Sunday","Full week of content in 1 hr"],["Cold outreach","Sunday","DMs, emails, follow-ups"],["Portfolio","Ongoing","Document every project you ship"],["Delivery income","$150–200/day","Mon–Sat routes — your primary income now"]].map(([l,v,n])=>(
            <div key={l} style={{padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:6}}>
                <span style={{fontSize:13,color:T.text,fontWeight:600}}>{l}</span>
                <Chip label={v} color={P.sidegig}/>
              </div>
              <div style={{fontSize:11,color:T.textMuted,marginTop:3}}>{n}</div>
            </div>
          ))}
        </div>
      </Section>

      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {[...data.sidegig].reverse().slice(0,15).map((s,i)=>(
          <div key={i} style={{...cs({padding:"12px 16px",borderLeft:`3px solid ${P.sidegig}`})}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:6}}>
              <div style={{fontSize:14,fontWeight:600,color:T.text}}>{s.project||"Client work"}</div>
              <div style={{fontSize:11,color:T.textMuted}}>{s.date}</div>
            </div>
            <div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
              {s.hours&&<Chip label={`⏱ ${s.hours} hrs`} color={P.sidegig}/>}
              {s.revenue&&<Chip label={`💵 $${s.revenue}`} color="#3DBF8A"/>}
              {s.contentBatched&&<Chip label="📸 Content batched" color="#E8A838"/>}
            </div>
          </div>
        ))}
        {!data.sidegig.length&&<div style={{...cs({textAlign:"center",padding:"50px 20px"})}}>
          <div style={{fontSize:36,marginBottom:10}}>{"◆"}</div>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:18,color:T.text}}>{"No work logged yet"}</div>
          <div style={{fontSize:13,color:T.textSub,marginTop:6}}>{"Sunday is your side gig block. Log each session to track income."}</div>
        </div>}
      </div>
    </div>
  );

  return (
    <div style={{display:"flex",height:"100vh",fontFamily:"'DM Sans',sans-serif",background:T.bg,overflow:"hidden"}}>

      {/* ── Desktop sidebar ── */}
      {!isMobile&&(
        <div style={{width:SIDEBAR_W,minWidth:SIDEBAR_W,background:"#111418",borderRight:"1px solid rgba(255,255,255,0.07)",display:"flex",flexDirection:"column",overflowY:"auto",flexShrink:0}}>
          <div style={{padding:"18px 14px 10px"}}>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:16,color:"#E8A838"}}>{"Summer OS ☀️"}</div>
            <div style={{fontSize:10,color:"#555",marginTop:2}}>{"Amen · "}{new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"})}</div>
          </div>

          <div style={{padding:"8px 14px 12px",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
              <span style={{fontSize:10,color:"#555",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em"}}>{"Today"}</span>
              <span style={{fontSize:12,fontWeight:700,color:pct>=80?"#3DBF8A":"#E8A838"}}>{pct}{"%"}</span>
            </div>
            <div style={{height:4,background:"rgba(255,255,255,0.07)",borderRadius:2,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${pct}%`,background:pct>=80?"#3DBF8A":"#E8A838",borderRadius:2,transition:"width 0.4s"}}/>
            </div>
            <div style={{fontSize:9,color:"#444",marginTop:3}}>{doneCount}{"/"}{todayItems.length}{" blocks done"}</div>
          </div>

          <div style={{padding:"8px 6px",flex:1}}>
            {PILLARS.map(p=>(
              <button key={p.id} onClick={()=>setPillar(p.id)}
                style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:9,border:"none",background:pillar===p.id?p.color+"20":"transparent",cursor:"pointer",textAlign:"left",marginBottom:2,outline:pillar===p.id?`1px solid ${p.color}33`:"none",transition:"all 0.15s"}}>
                <span style={{fontSize:14,width:18,textAlign:"center",color:pillar===p.id?p.color:"#555"}}>{p.icon}</span>
                <span style={{fontSize:12,fontWeight:pillar===p.id?700:400,color:pillar===p.id?p.color:"#888"}}>{p.label}</span>
              </button>
            ))}
          </div>

          <div style={{padding:"10px 6px",borderTop:"1px solid rgba(255,255,255,0.07)"}}>
            <button onClick={onBack} style={{width:"100%",padding:"8px 10px",borderRadius:9,border:"1px solid rgba(255,255,255,0.07)",background:"transparent",color:"#555",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600}}>{"← Back to Tasks"}</button>
          </div>
        </div>
      )}

      {/* ── Mobile header ── */}
      {isMobile&&(
        <div style={{position:"fixed",top:0,left:0,right:0,zIndex:20,background:"#111418",borderBottom:"1px solid rgba(255,255,255,0.07)",padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:15,color:"#E8A838"}}>{"Summer OS ☀️"}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{fontSize:12,fontWeight:700,color:pct>=80?"#3DBF8A":"#E8A838"}}>{pct}{"%"}</div>
            <button onClick={onBack} style={{fontSize:11,color:"#666",background:"none",border:"1px solid rgba(255,255,255,0.1)",borderRadius:7,padding:"5px 10px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>{"← Back"}</button>
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <div style={{flex:1,overflowY:"auto",padding:isMobile?"76px 16px 90px":"28px 28px 40px",maxHeight:"100vh"}}>
        {pillar==="overview"  && viewOverview}
        {pillar==="schedule"  && viewSchedule}
        {pillar==="checklist" && viewChecklist}
        {pillar==="faith"     && viewFaith}
        {pillar==="fitness"   && viewFitness}
        {pillar==="nutrition" && viewNutrition}
        {pillar==="thesis"    && viewThesis}
        {pillar==="reading"   && viewReading}
        {pillar==="gloria"    && viewGloria}
        {pillar==="sidegig"   && viewSidegig}
      </div>

      {/* ── Mobile bottom tabs ── */}
      {isMobile&&(
        <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:20,background:"#111418",borderTop:"1px solid rgba(255,255,255,0.07)",display:"flex",overflowX:"auto",paddingBottom:"env(safe-area-inset-bottom)"}}>
          {PILLARS.map(p=>(
            <button key={p.id} onClick={()=>setPillar(p.id)} style={{flex:"1 0 auto",minWidth:60,padding:"8px 4px",border:"none",background:"transparent",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:9,color:pillar===p.id?p.color:"#555",borderTop:`2px solid ${pillar===p.id?p.color:"transparent"}`,transition:"all 0.15s",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
              <span style={{fontSize:15}}>{p.icon}</span>
              <span style={{whiteSpace:"nowrap"}}>{p.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* ══ MODALS ══ */}
      {showForm==="devotion"&&(
        <Modal T={T} title="Log Devotion" accent={P.faith} onClose={()=>setShowForm(null)}
          onSave={()=>{const ex=data.devotion.filter(d=>d.date!==today);save(p=>({...p,devotion:[...ex,{...df,date:today}]}));setShowForm(null);}}>
          <label style={lbl}>{"Bible Passage"}</label>
          <input style={inp} value={df.passage} onChange={e=>setDf(p=>({...p,passage:e.target.value}))} placeholder="e.g. Psalm 23:1–6"/>
          <label style={lbl}>{"Key Insight"}</label>
          <textarea style={{...inp,minHeight:80,resize:"vertical"}} value={df.insight} onChange={e=>setDf(p=>({...p,insight:e.target.value}))} placeholder="What stood out to you today?"/>
          <div style={{display:"flex",gap:8,marginTop:14}}>
            <button onClick={()=>setDf(p=>({...p,prayer:!p.prayer}))} style={tog(df.prayer,P.faith)}>{"🙏 Prayed"}</button>
            <button onClick={()=>setDf(p=>({...p,worship:!p.worship}))} style={tog(df.worship,P.faith)}>{"🎵 Worship"}</button>
          </div>
        </Modal>
      )}

      {showForm==="fitness"&&(
        <Modal T={T} title="Log Workout" accent={P.fitness} onClose={()=>setShowForm(null)}
          onSave={()=>{save(p=>({...p,fitness:[...p.fitness,{...ff,date:today}]}));setShowForm(null);}}>
          <label style={lbl}>{"Workout Type"}</label>
          <select style={sel} value={ff.workoutType} onChange={e=>setFf(p=>({...p,workoutType:e.target.value}))}>
            {["Push","Pull","Legs","Full Body","Cardio Only"].map(w=><option key={w}>{w}</option>)}
          </select>
          <label style={lbl}>{"Run Distance (miles)"}</label>
          <input style={inp} type="number" step="0.1" value={ff.runDist} onChange={e=>setFf(p=>({...p,runDist:e.target.value}))} placeholder="e.g. 3.2"/>
          <label style={lbl}>{"Run Time (minutes)"}</label>
          <input style={inp} type="number" value={ff.runTime} onChange={e=>setFf(p=>({...p,runTime:e.target.value}))} placeholder="e.g. 25"/>
        </Modal>
      )}

      {showForm==="thesis"&&(
        <Modal T={T} title="Log Thesis Session" accent={P.thesis} onClose={()=>setShowForm(null)}
          onSave={()=>{save(p=>({...p,thesis:[...p.thesis,{...tf,date:today}]}));setShowForm(null);}}>
          <label style={lbl}>{"Duration (minutes)"}</label>
          <input style={inp} type="number" value={tf.duration} onChange={e=>setTf(p=>({...p,duration:Number(e.target.value)}))} placeholder="80"/>
          <label style={lbl}>{"What did you work on?"}</label>
          <textarea style={{...inp,minHeight:100,resize:"vertical"}} value={tf.notes} onChange={e=>setTf(p=>({...p,notes:e.target.value}))} placeholder="Writing, research, proofs — what did you tackle today?"/>
        </Modal>
      )}

      {showForm==="reading"&&(
        <Modal T={T} title="Log Reading" accent={P.reading} onClose={()=>setShowForm(null)}
          onSave={()=>{save(p=>({...p,reading:[...p.reading,{...rf,date:today,unit:rf.format==="audiobook"?"min":"pages"}]}));setShowForm(null);}}>
          <label style={lbl}>{"Book Title"}</label>
          <input style={inp} value={rf.title} onChange={e=>setRf(p=>({...p,title:e.target.value}))} placeholder="Book title"/>
          <label style={lbl}>{"Format"}</label>
          <div style={{display:"flex",gap:8,marginTop:6}}>
            <button onClick={()=>setRf(p=>({...p,format:"audiobook"}))} style={tog(rf.format==="audiobook",P.reading)}>{"🎧 Audiobook"}</button>
            <button onClick={()=>setRf(p=>({...p,format:"physical"}))} style={tog(rf.format==="physical",P.reading)}>{"📖 Physical"}</button>
          </div>
          <label style={lbl}>{rf.format==="audiobook"?"Minutes listened":"Pages read"}</label>
          <input style={inp} type="number" value={rf.amount} onChange={e=>setRf(p=>({...p,amount:e.target.value}))} placeholder={rf.format==="audiobook"?"e.g. 30":"e.g. 25"}/>
          <button onClick={()=>setRf(p=>({...p,completed:!p.completed}))} style={{...tog(rf.completed,"#3DBF8A"),width:"100%",marginTop:12}}>
            {rf.completed?"✓ Finished this book":"Mark as finished?"}
          </button>
        </Modal>
      )}

      {showForm==="gloria"&&(
        <Modal T={T} title="Log Gloria Time" accent={P.gloria} onClose={()=>setShowForm(null)}
          onSave={()=>{const ex=data.gloria.filter(g=>g.date!==today);save(p=>({...p,gloria:[...ex,{...gf,date:today}]}));setShowForm(null);}}>
          <label style={lbl}>{"One thing you appreciated about her today"}</label>
          <input style={inp} value={gf.appreciation} onChange={e=>setGf(p=>({...p,appreciation:e.target.value}))} placeholder="e.g. She listened without judgement"/>
          <label style={lbl}>{"Conversation highlight"}</label>
          <textarea style={{...inp,minHeight:80,resize:"vertical"}} value={gf.highlight} onChange={e=>setGf(p=>({...p,highlight:e.target.value}))} placeholder="What did you two talk about?"/>
          <button onClick={()=>setGf(p=>({...p,prayed:!p.prayed}))} style={{...tog(gf.prayed,P.gloria),width:"100%",marginTop:14}}>
            {gf.prayed?"🙏 Prayed together ✓":"🙏 Prayed together?"}
          </button>
        </Modal>
      )}

      {showForm==="sidegig"&&(
        <Modal T={T} title="Log Side Gig Work" accent={P.sidegig} onClose={()=>setShowForm(null)}
          onSave={()=>{save(p=>({...p,sidegig:[...p.sidegig,{...sf,date:today}]}));setShowForm(null);}}>
          <label style={lbl}>{"Project / Client"}</label>
          <input style={inp} value={sf.project} onChange={e=>setSf(p=>({...p,project:e.target.value}))} placeholder="e.g. Client website — Jones Landscaping"/>
          <label style={lbl}>{"Hours worked"}</label>
          <input style={inp} type="number" step="0.5" value={sf.hours} onChange={e=>setSf(p=>({...p,hours:e.target.value}))} placeholder="e.g. 3"/>
          <label style={lbl}>{"Revenue earned ($)"}</label>
          <input style={inp} type="number" value={sf.revenue} onChange={e=>setSf(p=>({...p,revenue:e.target.value}))} placeholder="e.g. 500"/>
          <button onClick={()=>setSf(p=>({...p,contentBatched:!p.contentBatched}))} style={{...tog(sf.contentBatched,P.sidegig),width:"100%",marginTop:14}}>
            {sf.contentBatched?"📸 Content batched this session ✓":"📸 Content batched?"}
          </button>
        </Modal>
      )}

      {showForm==="intentions"&&(
        <Modal T={T} title="Weekly Intentions" accent="#E8A838" onClose={()=>setShowForm(null)}
          onSave={()=>{save(p=>({...p,intentions:{...p.intentions,[thisWeek]:wf}}));setShowForm(null);}}>
          <div style={{fontSize:13,color:T.textSub,marginBottom:14,lineHeight:1.6}}>{"One sentence of intention per pillar — displayed all week as your anchor."}</div>
          {[["faith","✦ Faith",P.faith],["fitness","◈ Fitness",P.fitness],["thesis","✎ Thesis",P.thesis],["reading","◐ Reading",P.reading],["gloria","♡ Gloria",P.gloria],["sidegig","◆ Side Gig",P.sidegig]].map(([k,l,c])=>(
            <div key={k}>
              <label style={{...lbl,color:c}}>{l}</label>
              <input style={{...inp,outline:`1px solid ${c}33`}} value={wf[k]||""} onChange={e=>setWf(p=>({...p,[k]:e.target.value}))} placeholder={`One intention for ${k} this week...`}/>
            </div>
          ))}
        </Modal>
      )}

    </div>
  );
}
