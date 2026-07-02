// Delta-syncs game data from the LEGACY Supabase project to the NEW one.
// Upserts by natural key, so it is safe to re-run any number of times —
// run it right before switching production env vars to capture progress
// users made on the old database since the initial migration.
//
// Credentials are read from env files (no keys in this script):
//   OLD project: .env.pre-migration-backup   (repo root)
//   NEW project: .env                        (repo root)
//
// Usage (from repo root):
//   node scripts/migrate-supabase/sync-data.js
//
// Notes:
// - The `documents` (RAG embeddings) table is NOT synced here: anon writes are
//   intentionally blocked on the new project. Embeddings were copied once during
//   the initial migration; re-ingest via the backend /api/ingest if docs change.
// - Rows deleted on the old project after the initial migration are not deleted
//   on the new one (upsert-only).
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

function loadEnv(file) {
  const env = {};
  for (const line of fs.readFileSync(path.join(ROOT, file), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

const oldEnv = loadEnv('.env.pre-migration-backup');
const newEnv = loadEnv('.env');
const OLD = { url: oldEnv.REACT_APP_SUPABASE_URL, key: oldEnv.REACT_APP_SUPABASE_ANON_KEY };
const NEW = { url: newEnv.REACT_APP_SUPABASE_URL, key: newEnv.REACT_APP_SUPABASE_ANON_KEY };
if (!OLD.url || !NEW.url || OLD.url === NEW.url) {
  console.error('Env files missing or identical (.env.pre-migration-backup vs .env) — aborting.');
  process.exit(1);
}

// FK order matters: users first.
const TABLES = [
  { name: 'users', conflict: 'id', batch: 200 },
  { name: 'game_progress', conflict: 'user_id', batch: 200 },
  { name: 'leaderboard', conflict: 'user_id', batch: 200 },
  { name: 'module_leaderboard', conflict: 'user_id,module_id', batch: 200 },
];

async function fetchAll(table) {
  const pageSize = 500;
  let rows = [];
  for (let from = 0; ; from += pageSize) {
    const res = await fetch(`${OLD.url}/rest/v1/${table}?select=*&order=id.asc`, {
      headers: { apikey: OLD.key, Authorization: `Bearer ${OLD.key}`, Range: `${from}-${from + pageSize - 1}` },
    });
    if (!res.ok && res.status !== 206) throw new Error(`read ${table} HTTP ${res.status}`);
    const page = await res.json();
    rows = rows.concat(page);
    if (page.length < pageSize) return rows;
  }
}

async function upsertBatch(table, conflict, rows) {
  const res = await fetch(`${NEW.url}/rest/v1/${table}?on_conflict=${conflict}`, {
    method: 'POST',
    headers: {
      apikey: NEW.key,
      Authorization: `Bearer ${NEW.key}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(rows),
  });
  if (!res.ok) throw new Error(`upsert ${table} HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
}

(async () => {
  for (const t of TABLES) {
    const rows = await fetchAll(t.name);
    for (let i = 0; i < rows.length; i += t.batch) {
      await upsertBatch(t.name, t.conflict, rows.slice(i, i + t.batch));
      process.stdout.write(`\r${t.name}: ${Math.min(i + t.batch, rows.length)}/${rows.length}   `);
    }
    console.log(`\r${t.name}: synced ${rows.length} rows`);
  }
  console.log('Delta sync complete.');
})().catch(e => { console.error('\nFAILED:', e.message); process.exit(1); });
