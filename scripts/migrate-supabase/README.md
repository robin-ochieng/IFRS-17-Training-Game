# Supabase Migration: legacy free project → ifrs-17-game-original

Migration performed on 2026-07-02.

| | Old (legacy, free account) | New |
|---|---|---|
| Project | `hgxzzpntciubxphuwqci` | `ifrs-17-game-original` (`abkiytgnbqfjlcesywwl`) |
| URL | `https://hgxzzpntciubxphuwqci.supabase.co` | `https://abkiytgnbqfjlcesywwl.supabase.co` |

## What was migrated

- **Schema** (via MCP migration `ifrs17_game_schema_from_legacy_project`): `users`,
  `game_progress`, `leaderboard`, `module_leaderboard`, `module_completions`,
  `user_progress`, `documents` (pgvector 1536), `overall_leaderboard` ranked view,
  `match_documents()` function, permissive RLS matching the legacy custom-auth model.
- **Data** (snapshot 2026-07-02): 323 users, 300 game_progress, 195 leaderboard,
  676 module_leaderboard, 2,183 document embeddings. All counts verified equal.

## Production cutover checklist

1. Re-run the delta sync to capture progress made on the old DB since the snapshot:
   ```bash
   node scripts/migrate-supabase/sync-data.js
   ```
2. **Vercel** (frontend): set `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY`
   to the new values (see `.env`), then redeploy.
3. **Render** (chatbot backend): set `SUPABASE_URL=https://abkiytgnbqfjlcesywwl.supabase.co`,
   plus `SUPABASE_SERVICE_KEY` and `SUPABASE_ANON_KEY` from the new project's dashboard
   (Settings → API keys). Redeploy.
4. Re-run step 1 once more immediately after the Vercel deploy goes live (last stragglers).
5. Pause or delete the legacy project once traffic is confirmed on the new one.

## Known caveats

- The delta sync upserts only; rows deleted on the old DB are not deleted on the new one.
- `documents` is not delta-synced (anon writes blocked by design); re-ingest via the
  backend `/api/ingest` if source PDFs change.
- RLS is intentionally permissive (anon read/write on game tables) because the app uses
  custom auth over the anon key — inherited from the legacy design. Tighten when moving
  to Supabase Auth.
