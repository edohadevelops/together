/**
 * Together App — Supabase Backup Script
 *
 * Run with:  node backup.js
 * Restore:   node backup.js --restore src/backup/2026-03-30.json
 */

import fs   from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const SUPABASE_URL = "https://sonbphyeomzzcdyuiotl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvbmJwaHllb216emNkeXVpb3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMzkxMjksImV4cCI6MjA4ODgxNTEyOX0.CtcZAFtqCQUOrzPBfhSfN5BZ1EQDJFVxa-FsjMX5IRg";

const HEADERS = {
  "apikey":        SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Content-Type":  "application/json",
  "Prefer":        "resolution=merge-duplicates",
};

const TODAY = new Date().toISOString().slice(0, 10);
const BACKUP_DIR = path.join(__dirname, "src", "backup");

// ── All keys we want to back up ─────────────────────────────────────────────
const KEYS = [
  "tasks",
  "names",
  "mode",
  "completedLog",
  "prayers",
  "reflections",
  "tracker",
  "cookbook",
  "sectionOrder_A",
  "sectionOrder_B",
  "budget_cats",
  "budget_txs",
  "budget_goals",
  "budget_assets",
  "budget_liabs",
  "budget_debts",
];

async function fetchAll() {
  const url = `${SUPABASE_URL}/rest/v1/together_data?select=key,value`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function restoreFromFile(filePath) {
  const raw     = fs.readFileSync(filePath, "utf8");
  const backup  = JSON.parse(raw);
  const entries = Object.entries(backup.data);

  console.log(`\n🔄 Restoring ${entries.length} keys from ${path.basename(filePath)}...\n`);

  for (const [key, value] of entries) {
    const body = JSON.stringify({ key, value: JSON.stringify(value), updated_at: new Date().toISOString() });
    const res  = await fetch(`${SUPABASE_URL}/rest/v1/together_data`, {
      method: "POST", headers: HEADERS, body,
    });
    if (res.ok) {
      console.log(`  ✅ Restored: ${key}`);
    } else {
      console.log(`  ❌ Failed:   ${key} — ${await res.text()}`);
    }
  }

  console.log("\n✅ Restore complete! Hard refresh your app to see the data.\n");
}

async function backup() {
  console.log("\n📦 Together App — Supabase Backup");
  console.log("──────────────────────────────────");
  console.log(`Date: ${TODAY}`);
  console.log(`URL:  ${SUPABASE_URL}\n`);

  // Fetch all rows
  console.log("Fetching data from Supabase...");
  const rows = await fetchAll();

  if (!rows || rows.length === 0) {
    console.log("⚠️  No data found in Supabase. Nothing to backup.");
    return;
  }

  // Parse into a clean object
  const data = {};
  for (const row of rows) {
    try {
      data[row.key] = JSON.parse(row.value);
    } catch {
      data[row.key] = row.value; // keep as string if not valid JSON
    }
  }

  // Build the backup file
  const snapshot = {
    createdAt:  new Date().toISOString(),
    date:       TODAY,
    keyCount:   Object.keys(data).length,
    taskCount:  Array.isArray(data.tasks) ? data.tasks.length : 0,
    data,
  };

  // Ensure backup directory exists
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`Created backup directory: ${BACKUP_DIR}`);
  }

  // Save timestamped file
  const filename  = `${TODAY}.json`;
  const filepath  = path.join(BACKUP_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(snapshot, null, 2), "utf8");

  // Also save a "latest.json" that always has the most recent backup
  const latestPath = path.join(BACKUP_DIR, "latest.json");
  fs.writeFileSync(latestPath, JSON.stringify(snapshot, null, 2), "utf8");

  // Summary
  console.log(`\n✅ Backup saved!`);
  console.log(`   File:   src/backup/${filename}`);
  console.log(`   Keys:   ${snapshot.keyCount}`);
  console.log(`   Tasks:  ${snapshot.taskCount}`);
  if (Array.isArray(data.completedLog)) {
    console.log(`   Completed log: ${data.completedLog.length} entries`);
  }
  if (Array.isArray(data.budget_txs)) {
    console.log(`   Budget transactions: ${data.budget_txs.length}`);
  }

  console.log(`\n💡 Commit this to GitHub:\n`);
  console.log(`   git add src/backup/`);
  console.log(`   git commit -m "backup: ${TODAY}"`);
  console.log(`   git push\n`);

  console.log(`🔄 To restore this backup later:\n`);
  console.log(`   node backup.js --restore src/backup/${filename}\n`);
}

// ── Entry point ──────────────────────────────────────────────────────────────
const args = process.argv.slice(2);

if (args[0] === "--restore" && args[1]) {
  const filePath = path.resolve(args[1]);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }
  restoreFromFile(filePath).catch(err => {
    console.error("❌ Restore failed:", err.message);
    process.exit(1);
  });
} else {
  backup().catch(err => {
    console.error("❌ Backup failed:", err.message);
    process.exit(1);
  });
}