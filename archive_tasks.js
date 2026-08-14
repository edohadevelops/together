// Run with: node inspect_tasks.js
// Shows exactly what is stored in every tasks-related key

const SUPABASE_URL = "https://sonbphyeomzzcdyuiotl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvbmJwaHllb216emNkeXVpb3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMzkxMjksImV4cCI6MjA4ODgxNTEyOX0.CtcZAFtqCQUOrzPBfhSfN5BZ1EQDJFVxa-FsjMX5IRg";
const H = { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` };

async function run() {
  // List ALL keys in the database
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/together_data?select=key,value&order=key.asc&limit=500`,
    { headers: H }
  );
  const rows = await r.json();

  console.log(`Total keys in Supabase: ${rows.length}\n`);

  for (const row of rows) {
    const v = row.value;
    const type = Array.isArray(v) ? `array[${v.length}]`
               : v === null       ? "null"
               : typeof v === "object" ? `object(${Object.keys(v).length} keys)`
               : `${typeof v}: ${String(v).slice(0,40)}`;

    // For task arrays, show first item structure
    let sample = "";
    if (Array.isArray(v) && v.length > 0 && v[0]?.title) {
      sample = ` | first: "${v[0].title}"`;
    }

    console.log(`  ${row.key.padEnd(45)} ${type}${sample}`);
  }
}

run().catch(e => console.error("Error:", e.message));