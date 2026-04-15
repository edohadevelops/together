// ── Together App — Fix Data Separation ───────────────────────────────────────
// Run AFTER migrate.js with: node fix_separation.js
//
// The migration copied all shared data into both _A and _B keys.
// This script filters each key so:
//   people_list_A  → only owner:"A" or owner:"shared" records
//   people_list_B  → only owner:"B" or owner:"shared" records
//   mg_templates_A → only owner:"A" or owner:"shared" records
//   etc.
// Tasks are NOT touched — they stay as the shared "tasks" key.

const SUPABASE_URL = "https://sonbphyeomzzcdyuiotl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvbmJwaHllb216emNkeXVpb3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMzkxMjksImV4cCI6MjA4ODgxNTEyOX0.CtcZAFtqCQUOrzPBfhSfN5BZ1EQDJFVxa-FsjMX5IRg";
const H = {
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
  "Prefer": "resolution=merge-duplicates",
};

async function dbGet(key) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/together_data?key=eq.${encodeURIComponent(key)}&select=value`, { headers: H });
  const d = await r.json();
  return d[0]?.value ?? null;
}

async function dbSet(key, value) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/together_data`, {
    method: "POST", headers: H,
    body: JSON.stringify({ key, value }),
  });
  if (!r.ok) throw new Error(`Write failed for ${key}: ${r.status}`);
}

// Keys that are arrays of objects with an "owner" field
const OWNED_KEYS = [
  "people_list",
  "mg_templates",
  "budget_cats",
  "budget_txs",
  "budget_goals",
  "budget_assets",
  "budget_liabs",
  "budget_debts",
];

// Keys that are entirely per-user (no owner field — just objects/arrays)
// These are already isolated, nothing to filter
const SOLO_KEYS = [
  "budget_consecration",
  "budget_splitplan",
  "mg_progress",
  "reflections",
  "prayers",
  "tracker",
  "cookbook",
];

async function run() {
  console.log("Fixing data separation...\n");

  // ── Fix owned keys (filter by owner field) ──────────────────────────────
  for (const key of OWNED_KEYS) {
    for (const user of ["A", "B"]) {
      const fullKey = `${key}_${user}`;
      process.stdout.write(`  Checking ${fullKey}... `);
      const data = await dbGet(fullKey);

      if (!data || !Array.isArray(data)) {
        console.log("empty, skipped");
        continue;
      }

      const before = data.length;
      // Keep only records that belong to this user or are shared
      const filtered = data.filter(r => {
        if (!r.owner) return true; // no owner field — keep it
        return r.owner === user || r.owner === "shared";
      });
      const removed = before - filtered.length;

      if (removed === 0) {
        console.log(`${before} records, already clean`);
        continue;
      }

      await dbSet(fullKey, filtered);
      console.log(`${before} → ${filtered.length} records (removed ${removed} that belonged to other user)`);
    }
  }

  // ── Solo keys — no filtering needed, just report ────────────────────────
  console.log(`\n  Solo keys (no filtering needed):`);
  for (const key of SOLO_KEYS) {
    for (const user of ["A", "B"]) {
      const data = await dbGet(`${key}_${user}`);
      const count = data ? (Array.isArray(data) ? data.length : "object") : "empty";
      console.log(`    ${key}_${user}: ${count}`);
    }
  }

  console.log("\n✅ Separation fix complete.");
  console.log("   Hard refresh the app (Ctrl+Shift+R) — each user now only sees their own data.");
}

run().catch(e => console.error("Error:", e.message));