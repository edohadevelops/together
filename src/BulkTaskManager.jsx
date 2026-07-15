import { useState, useRef } from "react";

export default function BulkTaskManager({ tasks, archivedTasks, onDelete, onComplete, onArchive, onRestore, onDeleteArchived, onClose, T, mode, names, SECTIONS, TODAY }) {
  const [tab, setTab]           = useState("ai");       // "ai" | "manual" | "archive"
  const [exportText, setExportText] = useState("");
  const [importText, setImportText] = useState("");
  const [preview, setPreview]   = useState(null);       // {delete:[...], complete:[...]}
  const [previewError, setPreviewError] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [titleFilter, setTitleFilter] = useState("");
  const [secFilter, setSecFilter] = useState("");
  const [doneFilter, setDoneFilter] = useState("all"); // "all" | "active" | "done"
  const [copied, setCopied]     = useState(false);
  const [applied, setApplied]   = useState(false);
  const importRef = useRef();

  const [archSel, setArchSel] = useState(new Set());
  const [archSearch, setArchSearch] = useState("");
  const [archSec, setArchSec] = useState("");

  const allTasks = tasks || [];
  const allArchived = archivedTasks || [];

  // ── Export ────────────────────────────────────────────────────────────────
  function generateExport() {
    const lines = [
      "TASK LIST — Together App",
      `Total: ${allTasks.length} tasks  |  Exported: ${TODAY}`,
      "",
      "HOW TO USE:",
      "  Review the list below. Reply with a JSON object like:",
      '  {"delete": ["ID1", "ID2"], "complete": ["ID3"]}',
      "  Use the task IDs exactly as shown. You can include both arrays, one, or neither.",
      "",
      "=".repeat(64),
      "",
      ...allTasks.map((t, i) => {
        const sec = SECTIONS.find(s => s.id === t.section);
        const parts = [
          `[${i + 1}] ID: ${t.id}`,
          `    Title   : ${t.title}`,
          `    Section : ${sec?.label || t.section || "—"}`,
          `    Type    : ${t.type || "todo"}`,
          `    Done    : ${t.done ? "YES" : "no"}`,
          `    Priority: ${t.priority || "—"}`,
        ];
        if (t.notes)   parts.push(`    Notes   : ${t.notes}`);
        if (t.dueDate) parts.push(`    Due     : ${t.dueDate}`);
        parts.push("");
        return parts.join("\n");
      }),
    ].join("\n");
    return lines;
  }

  function handleExport() {
    const text = generateExport();
    setExportText(text);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {});
  }

  // ── Parse AI response ─────────────────────────────────────────────────────
  function parseImport() {
    setPreviewError("");
    setPreview(null);
    try {
      const text = importText.trim();
      if (!text) { setPreviewError("Paste the AI's response first."); return; }
      // Extract JSON from the text (AI might wrap it in prose)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found. AI response should contain {"delete": [...], "complete": [...]}');
      const parsed = JSON.parse(jsonMatch[0]);
      const toDeleteIds   = (parsed.delete   || []).map(id => String(id).trim());
      const toCompleteIds = (parsed.complete || []).map(id => String(id).trim());
      const idMap = new Map(allTasks.map(t => [t.id, t]));
      const deleteItems   = toDeleteIds.map(id => idMap.get(id)).filter(Boolean);
      const completeItems = toCompleteIds.map(id => idMap.get(id)).filter(Boolean);
      const missingD = toDeleteIds.filter(id => !idMap.has(id));
      const missingC = toCompleteIds.filter(id => !idMap.has(id));
      const warnings = [];
      if (missingD.length) warnings.push(`${missingD.length} delete ID(s) not found`);
      if (missingC.length) warnings.push(`${missingC.length} complete ID(s) not found`);
      setPreview({ delete: deleteItems, complete: completeItems, warnings });
    } catch (e) {
      setPreviewError(e.message);
    }
  }

  function applyActions() {
    if (!preview) return;
    if (preview.complete.length > 0) onComplete(preview.complete.map(t => t.id));
    if (preview.delete.length > 0)   onDelete(preview.delete.map(t => t.id));
    setApplied(true);
    setPreview(null);
    setImportText("");
    setExportText("");
    setTimeout(() => { setApplied(false); }, 2000);
  }

  // ── Manual selection ──────────────────────────────────────────────────────
  const filteredTasks = allTasks.filter(t => {
    if (secFilter && t.section !== secFilter) return false;
    if (doneFilter === "active" && t.done)    return false;
    if (doneFilter === "done"   && !t.done)   return false;
    if (titleFilter && !t.title.toLowerCase().includes(titleFilter.toLowerCase())) return false;
    return true;
  });

  function toggleSelect(id) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }
  function selectAll()    { setSelected(new Set(filteredTasks.map(t => t.id))); }
  function clearSel()     { setSelected(new Set()); }

  function bulkComplete() {
    onComplete([...selected]);
    clearSel();
  }
  function bulkDelete() {
    onDelete([...selected]);
    clearSel();
  }

  // ── Styles ────────────────────────────────────────────────────────────────
  const inp  = { width:"100%", padding:"9px 12px", borderRadius:9, border:`1px solid ${T.border}`, background:T.inputBg, color:T.text, fontFamily:"'DM Sans',sans-serif", fontSize:13, outline:"none", boxSizing:"border-box" };
  const card = (col) => ({ padding:"12px 14px", borderRadius:10, background:col+"12", border:`1px solid ${col}33`, marginBottom:12 });

  return (
    <div style={{ position:"fixed", inset:0, zIndex:60, background:"rgba(0,0,0,0.72)", backdropFilter:"blur(8px)", display:"flex", alignItems:"flex-end", justifyContent:"center" }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:"20px 20px 0 0", width:"100%", maxWidth:660, maxHeight:"92vh", overflowY:"auto", padding:"24px 20px 44px", boxShadow:"0 -8px 48px rgba(0,0,0,0.45)" }}>

        {/* Drag handle */}
        <div style={{ width:40, height:4, borderRadius:2, background:T.textMuted, margin:"0 auto 20px", opacity:0.4 }}/>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
          <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:22, color:T.text }}>⚡ Bulk Task Manager</div>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:T.textMuted, fontSize:24, lineHeight:1, padding:"2px 6px" }}>×</button>
        </div>
        <div style={{ height:2, width:44, background:"#9B6EE8", borderRadius:2, marginBottom:6 }}/>
        <div style={{ fontSize:12, color:T.textMuted, marginBottom:20 }}>{allTasks.length} total tasks in your board</div>

        {applied && (
          <div style={{ padding:"10px 14px", borderRadius:10, background:"#3DBF8A15", border:"1px solid #3DBF8A44", fontSize:13, color:"#3DBF8A", fontWeight:600, marginBottom:16, textAlign:"center" }}>
            ✓ Actions applied successfully!
          </div>
        )}

        {/* Tab switcher */}
        <div style={{ display:"flex", gap:6, marginBottom:24, background:T.inputBg, borderRadius:10, padding:4 }}>
          {[["ai","🤖 AI-Assisted"],["manual","☑ Manual Select"],["archive",`📦 Archive${allArchived.length>0?" ("+allArchived.length+")":""}`]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ flex:1, padding:"8px 4px", borderRadius:8, border:"none", background:tab===id?T.surface:"transparent", color:tab===id?T.text:T.textSub, fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:tab===id?700:400, cursor:"pointer", transition:"all 0.15s", boxShadow:tab===id?T.cardShadow:"none" }}>
              {label}
            </button>
          ))}
        </div>

        {/* ── AI TAB ── */}
        {tab === "ai" && (
          <div>

            {/* Step 1 — Export */}
            <div style={{ marginBottom:24 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                <StepBadge n={1} color="#9B6EE8"/>
                <span style={{ fontSize:14, fontWeight:600, color:T.text }}>Export your tasks</span>
              </div>
              <div style={{ fontSize:12, color:T.textSub, marginBottom:12, lineHeight:1.65 }}>
                Click to copy all {allTasks.length} tasks as formatted text. Paste into Claude or any AI and say something like <em>"delete all completed tasks"</em> or <em>"mark these specific tasks complete."</em>
              </div>
              <button onClick={handleExport} style={{ width:"100%", padding:"12px", borderRadius:10, border:"1px solid #9B6EE844", background:copied?"#3DBF8A15":"#9B6EE812", color:copied?"#3DBF8A":"#9B6EE8", fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:700, cursor:"pointer", transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                {copied ? "✓ Copied to clipboard!" : `📋 Copy ${allTasks.length} Tasks for AI`}
              </button>
              {exportText && (
                <textarea readOnly value={exportText}
                  style={{ ...inp, marginTop:10, height:110, fontSize:10, fontFamily:"'Courier New',monospace", resize:"vertical", opacity:0.7 }}/>
              )}
            </div>

            {/* Step 2 — Paste AI response */}
            <div style={{ marginBottom:24 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                <StepBadge n={2} color="#E8A838"/>
                <span style={{ fontSize:14, fontWeight:600, color:T.text }}>Paste AI's response</span>
              </div>
              <div style={{ fontSize:12, color:T.textSub, marginBottom:10, lineHeight:1.65 }}>
                The AI should reply with a JSON object. Example:
              </div>
              <div style={{ background:T.inputBg, border:`1px solid ${T.border}`, borderRadius:8, padding:"8px 12px", fontFamily:"'Courier New',monospace", fontSize:11, color:T.text, marginBottom:12 }}>
                {'{"delete": ["abc123", "def456"], "complete": ["ghi789"]}'}
              </div>
              <textarea ref={importRef} value={importText}
                onChange={e => { setImportText(e.target.value); setPreview(null); setPreviewError(""); }}
                placeholder="Paste the AI's full response here — it will extract the JSON automatically..."
                rows={5}
                style={{ ...inp, resize:"vertical", fontFamily:"'DM Sans',sans-serif", fontSize:12 }}/>
              {previewError && (
                <div style={{ fontSize:12, color:"#E84E8A", marginTop:6, lineHeight:1.5 }}>{previewError}</div>
              )}
              <button onClick={parseImport} disabled={!importText.trim()}
                style={{ width:"100%", marginTop:10, padding:"11px", borderRadius:10, border:`1px solid ${importText.trim()?"#E8A83844":T.border}`, background:importText.trim()?"#E8A83812":T.inputBg, color:importText.trim()?"#E8A838":T.textMuted, fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600, cursor:importText.trim()?"pointer":"not-allowed", transition:"all 0.15s" }}>
                Preview Actions
              </button>
            </div>

            {/* Step 3 — Preview & apply */}
            {preview && (
              <div style={{ marginBottom:20 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                  <StepBadge n={3} color="#3DBF8A"/>
                  <span style={{ fontSize:14, fontWeight:600, color:T.text }}>Review & Apply</span>
                </div>

                {preview.warnings?.length > 0 && (
                  <div style={{ ...card("#E8A838"), fontSize:12, color:"#E8A838" }}>
                    ⚠ {preview.warnings.join(" · ")}
                  </div>
                )}

                {preview.delete.length > 0 && (
                  <div style={card("#E84E8A")}>
                    <div style={{ fontSize:12, fontWeight:700, color:"#E84E8A", marginBottom:8 }}>🗑 Delete ({preview.delete.length})</div>
                    {preview.delete.map(t => (
                      <TaskPreviewRow key={t.id} task={t} SECTIONS={SECTIONS} T={T}/>
                    ))}
                  </div>
                )}

                {preview.complete.length > 0 && (
                  <div style={card("#3DBF8A")}>
                    <div style={{ fontSize:12, fontWeight:700, color:"#3DBF8A", marginBottom:8 }}>✓ Mark Complete ({preview.complete.length})</div>
                    {preview.complete.map(t => (
                      <TaskPreviewRow key={t.id} task={t} SECTIONS={SECTIONS} T={T}/>
                    ))}
                  </div>
                )}

                {preview.delete.length === 0 && preview.complete.length === 0 ? (
                  <div style={{ fontSize:13, color:T.textSub, padding:"16px", textAlign:"center", background:T.inputBg, borderRadius:10 }}>
                    No matching task IDs found in the response.
                  </div>
                ) : (
                  <button onClick={applyActions} style={{ width:"100%", padding:"14px", borderRadius:10, border:"none", background:"#3DBF8A", color:"#fff", fontFamily:"'DM Sans',sans-serif", fontSize:15, fontWeight:700, cursor:"pointer", marginTop:4 }}>
                    Apply {preview.delete.length + preview.complete.length} Action{preview.delete.length + preview.complete.length !== 1 ? "s" : ""}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── ARCHIVE TAB ── */}
        {tab === "archive" && (()=>{
          const filteredArch = allArchived.filter(t => {
            if (archSec && t.section !== archSec) return false;
            if (archSearch && !t.title.toLowerCase().includes(archSearch.toLowerCase())) return false;
            return true;
          });
          function toggleArch(id) { setArchSel(prev => { const n=new Set(prev); if(n.has(id))n.delete(id);else n.add(id); return n; }); }
          function selectAllArch() { setArchSel(new Set(filteredArch.map(t=>t.id))); }
          function clearArchSel() { setArchSel(new Set()); }
          return (
            <div>
              <div style={{ fontSize:12, color:T.textSub, marginBottom:14, lineHeight:1.6 }}>
                Archived tasks are hidden from your board but never lost. Restore them any time or delete permanently.
              </div>

              {/* Filters */}
              <div style={{ display:"flex", gap:8, marginBottom:10, flexWrap:"wrap" }}>
                <input value={archSearch} onChange={e=>setArchSearch(e.target.value)} placeholder="Search archived…" style={{ ...inp, flex:"1 1 140px" }}/>
                <select value={archSec} onChange={e=>setArchSec(e.target.value)} style={{ ...inp, flex:"1 1 130px", cursor:"pointer" }}>
                  <option value="">All sections</option>
                  {SECTIONS.map(s=><option key={s.id} value={s.id}>{s.emoji} {s.label}</option>)}
                </select>
              </div>

              {/* Selection bar */}
              {archSel.size > 0 && (
                <div style={{ display:"flex", gap:8, marginBottom:12, alignItems:"center", padding:"10px 12px", borderRadius:10, background:T.inputBg, border:`1px solid ${T.border}`, flexWrap:"wrap" }}>
                  <span style={{ fontSize:13, color:T.text, fontWeight:600, flex:1 }}>{archSel.size} selected</span>
                  <button onClick={()=>{ if(onRestore) onRestore([...archSel]); clearArchSel(); }} style={{ padding:"6px 14px", borderRadius:8, border:"none", background:"#3DBF8A", color:"#fff", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:700, cursor:"pointer" }}>
                    ↩ Restore to Board
                  </button>
                  <button onClick={()=>{ if(window.confirm(`Permanently delete ${archSel.size} task(s)? This cannot be undone.`)){ if(onDeleteArchived) onDeleteArchived([...archSel]); clearArchSel(); } }} style={{ padding:"6px 14px", borderRadius:8, border:"none", background:"#E84E8A", color:"#fff", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:700, cursor:"pointer" }}>
                    🗑 Delete Permanently
                  </button>
                  <button onClick={clearArchSel} style={{ padding:"6px 10px", borderRadius:8, border:`1px solid ${T.border}`, background:"none", color:T.textSub, fontFamily:"'DM Sans',sans-serif", fontSize:12, cursor:"pointer" }}>Clear</button>
                </div>
              )}

              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <span style={{ fontSize:12, color:T.textMuted }}>{filteredArch.length} archived task{filteredArch.length!==1?"s":""}</span>
                <div style={{ display:"flex", gap:10 }}>
                  {filteredArch.length>0&&<button onClick={selectAllArch} style={{ fontSize:12, color:"#E8A838", background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Select all</button>}
                  {archSel.size>0&&<button onClick={clearArchSel} style={{ fontSize:12, color:T.textMuted, background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Clear</button>}
                </div>
              </div>

              {filteredArch.length === 0 ? (
                <div style={{ textAlign:"center", padding:"40px 20px", color:T.textMuted, fontSize:13, background:T.inputBg, borderRadius:10 }}>
                  {allArchived.length===0 ? "No archived tasks yet. Archive tasks from the Manual tab to store them here without deleting." : "No tasks match your filter."}
                </div>
              ) : (
                <div style={{ maxHeight:420, overflowY:"auto", borderRadius:10, border:`1px solid ${T.border}` }}>
                  {filteredArch.map((t,i)=>{
                    const sec=SECTIONS.find(s=>s.id===t.section);
                    const sel=archSel.has(t.id);
                    return (
                      <div key={t.id} onClick={()=>toggleArch(t.id)}
                        style={{ display:"flex", alignItems:"flex-start", gap:11, padding:"10px 14px", background:sel?"#E8A83814":i%2===0?T.inputBg:"transparent", borderBottom:`1px solid ${T.border}`, cursor:"pointer" }}>
                        <div style={{ width:17,height:17,borderRadius:4,border:`2px solid ${sel?"#E8A838":T.border}`,background:sel?"#E8A838":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2 }}>
                          {sel&&<span style={{ color:"#fff",fontSize:10,fontWeight:700,lineHeight:1 }}>✓</span>}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:13, color:T.textSub, fontWeight:500, lineHeight:1.4 }}>{t.title}</div>
                          <div style={{ display:"flex", gap:6, marginTop:3, flexWrap:"wrap" }}>
                            {sec&&<span style={{ fontSize:10, color:sec.color, fontWeight:600 }}>{sec.emoji} {sec.label}</span>}
                            <span style={{ fontSize:10, color:T.textMuted }}>{t.type||"todo"}</span>
                            {t.priority&&<span style={{ fontSize:10, color:t.priority==="Urgent"?"#E84E8A":t.priority==="High"?"#E8704A":T.textMuted }}>{t.priority}</span>}
                            {t.archivedAt&&<span style={{ fontSize:10, color:T.textMuted }}>archived {t.archivedAt}</span>}
                          </div>
                        </div>
                        <div style={{ display:"flex", gap:4, flexShrink:0 }}>
                          <button onClick={e=>{e.stopPropagation();if(onRestore)onRestore([t.id]);}} style={{ padding:"4px 8px",borderRadius:6,border:"1px solid #3DBF8A44",background:"#3DBF8A12",color:"#3DBF8A",fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,cursor:"pointer" }}>↩</button>
                          <button onClick={e=>{e.stopPropagation();if(window.confirm("Delete permanently?"))if(onDeleteArchived)onDeleteArchived([t.id]);}} style={{ padding:"4px 8px",borderRadius:6,border:"1px solid #E84E8A44",background:"#E84E8A12",color:"#E84E8A",fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,cursor:"pointer" }}>🗑</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* ── MANUAL TAB ── */}
        {tab === "manual" && (
          <div>
            {/* Filters */}
            <div style={{ display:"flex", gap:8, marginBottom:10, flexWrap:"wrap" }}>
              <input value={titleFilter} onChange={e => setTitleFilter(e.target.value)} placeholder="Search by title…" style={{ ...inp, flex:"1 1 160px" }}/>
              <select value={secFilter} onChange={e => setSecFilter(e.target.value)} style={{ ...inp, flex:"1 1 140px", cursor:"pointer" }}>
                <option value="">All sections</option>
                {SECTIONS.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.label}</option>)}
              </select>
            </div>
            <div style={{ display:"flex", gap:6, marginBottom:14 }}>
              {[["all","All"],["active","Active"],["done","Done"]].map(([v,l]) => (
                <button key={v} onClick={() => setDoneFilter(v)} style={{ flex:1, padding:"6px", borderRadius:8, border:`1px solid ${doneFilter===v?T.accent:T.border}`, background:doneFilter===v?T.accent+"18":"transparent", color:doneFilter===v?T.accent:T.textSub, fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:doneFilter===v?700:400, cursor:"pointer" }}>
                  {l}
                </button>
              ))}
            </div>

            {/* Selection bar */}
            {selected.size > 0 && (
              <div style={{ display:"flex", gap:8, marginBottom:12, alignItems:"center", padding:"10px 12px", borderRadius:10, background:T.inputBg, border:`1px solid ${T.border}`, flexWrap:"wrap" }}>
                <span style={{ fontSize:13, color:T.text, fontWeight:600, flex:1 }}>{selected.size} selected</span>
                <button onClick={bulkComplete} style={{ padding:"6px 14px", borderRadius:8, border:"none", background:"#3DBF8A", color:"#fff", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:700, cursor:"pointer" }}>
                  ✓ Complete
                </button>
                <button onClick={()=>{ if(onArchive){onArchive([...selected]);} clearSel(); }} style={{ padding:"6px 14px", borderRadius:8, border:"none", background:"#E8A838", color:"#fff", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:700, cursor:"pointer" }}>
                  📦 Archive
                </button>
                <button onClick={bulkDelete} style={{ padding:"6px 14px", borderRadius:8, border:"none", background:"#E84E8A", color:"#fff", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:700, cursor:"pointer" }}>
                  🗑 Delete
                </button>
                <button onClick={clearSel} style={{ padding:"6px 10px", borderRadius:8, border:`1px solid ${T.border}`, background:"none", color:T.textSub, fontFamily:"'DM Sans',sans-serif", fontSize:12, cursor:"pointer" }}>
                  Clear
                </button>
              </div>
            )}

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
              <span style={{ fontSize:12, color:T.textMuted }}>{filteredTasks.length} tasks</span>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={selectAll} style={{ fontSize:12, color:T.accent, background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Select all</button>
                {selected.size > 0 && <button onClick={clearSel} style={{ fontSize:12, color:T.textMuted, background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Clear</button>}
              </div>
            </div>

            {/* Task list */}
            <div style={{ maxHeight:400, overflowY:"auto", borderRadius:10, border:`1px solid ${T.border}` }}>
              {filteredTasks.length === 0 && (
                <div style={{ textAlign:"center", padding:"30px 20px", color:T.textMuted, fontSize:13 }}>No tasks match your filter</div>
              )}
              {filteredTasks.map((t, i) => {
                const sec = SECTIONS.find(s => s.id === t.section);
                const sel = selected.has(t.id);
                return (
                  <div key={t.id} onClick={() => toggleSelect(t.id)}
                    style={{ display:"flex", alignItems:"flex-start", gap:11, padding:"10px 14px", background:sel?T.accent+"14":i%2===0?T.inputBg:"transparent", borderBottom:`1px solid ${T.border}`, cursor:"pointer", transition:"background 0.1s" }}>
                    <div style={{ width:17, height:17, borderRadius:4, border:`2px solid ${sel?T.accent:T.border}`, background:sel?T.accent:"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:2 }}>
                      {sel && <span style={{ color:T.accentFg, fontSize:10, fontWeight:700, lineHeight:1 }}>✓</span>}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, color:t.done?T.textMuted:T.text, textDecoration:t.done?"line-through":"none", fontWeight:500, lineHeight:1.4 }}>{t.title}</div>
                      <div style={{ display:"flex", gap:6, marginTop:3, flexWrap:"wrap" }}>
                        {sec && <span style={{ fontSize:10, color:sec.color, fontWeight:600 }}>{sec.emoji} {sec.label}</span>}
                        <span style={{ fontSize:10, color:T.textMuted }}>{t.type || "todo"}</span>
                        {t.done && <span style={{ fontSize:10, color:"#3DBF8A", fontWeight:600 }}>✓ done</span>}
                        {t.priority && <span style={{ fontSize:10, color:t.priority==="Urgent"?"#E84E8A":t.priority==="High"?"#E8704A":T.textMuted }}>{t.priority}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StepBadge({ n, color }) {
  return (
    <div style={{ width:24, height:24, borderRadius:"50%", background:color+"22", border:`1px solid ${color}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color, flexShrink:0 }}>
      {n}
    </div>
  );
}

function TaskPreviewRow({ task, SECTIONS, T }) {
  const sec = SECTIONS.find(s => s.id === task.section);
  return (
    <div style={{ fontSize:12, color:T.text, padding:"5px 0", borderBottom:`1px solid rgba(255,255,255,0.05)`, display:"flex", alignItems:"center", gap:8 }}>
      <span style={{ flex:1 }}>{task.title}</span>
      {sec && <span style={{ fontSize:10, color:sec.color, fontWeight:600, flexShrink:0 }}>{sec.emoji} {sec.label}</span>}
    </div>
  );
}
