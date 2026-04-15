// ── Together App — Data Migration Script ─────────────────────────────────────
// Run once with: node migrate.js
// Copies existing shared keys to per-user keys (_A and _B)
// Safe to run multiple times — only writes if old key has data

const SUPABASE_URL = "https://sonbphyeomzzcdyuiotl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvbmJwaHllb216emNkeXVpb3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMzkxMjksImV4cCI6MjA4ODgxNTEyOX0.CtcZAFtqCQUOrzPBfhSfN5BZ1EQDJFVxa-FsjMX5IRg";
const H = {
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
  "Prefer": "resolution=merge-duplicates",
};

async function get(key) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/together_data?key=eq.${key}&select=value`, { headers: H });
  const d = await r.json();
  return d[0]?.value ?? null;
}

async function set(key, value) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/together_data`, {
    method: "POST",
    headers: H,
    body: JSON.stringify({ key, value }),
  });
  if (!r.ok) throw new Error(`Failed to write ${key}: ${r.status}`);
}

const KEYS = [
  "budget_cats",
  "budget_txs",
  "budget_goals",
  "budget_assets",
  "budget_liabs",
  "budget_debts",
  "budget_consecration",
  "budget_splitplan",
  "people_list",
  "mg_templates",
  "mg_progress",
  "reflections",
  "prayers",
  "tracker",
  "cookbook",
];

async function migrate() {
  console.log("Starting migration...\n");
  let migrated = 0;
  let skipped  = 0;

  for (const key of KEYS) {
    try {
      const value = await get(key);
      if (!value) {
        console.log(`  — ${key} (no data, skipped)`);
        skipped++;
        continue;
      }
      const count = Array.isArray(value) ? value.length : "object";
      await set(`${key}_A`, value);
      await set(`${key}_B`, value);
      console.log(`  ✓ ${key} → ${key}_A and ${key}_B  (${count} items)`);
      migrated++;
    } catch (err) {
      console.error(`  ✗ ${key} failed: ${err.message}`);
    }
  }

  console.log(`\n✅ Done — ${migrated} keys migrated, ${skipped} skipped.`);
  console.log("Refresh your app and all existing data will be visible.");
}

migrate();