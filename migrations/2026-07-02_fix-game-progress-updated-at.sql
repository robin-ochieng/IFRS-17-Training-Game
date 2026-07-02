-- Fix: Sync Progress fails with `record "new" has no field "updated_at"`
--
-- Root cause: complete-persistence-setup.sql creates a BEFORE UPDATE trigger
-- on game_progress that sets NEW.updated_at, but its CREATE TABLE IF NOT EXISTS
-- was a no-op on databases where game_progress already existed, and the
-- ADD COLUMN IF NOT EXISTS backfill list omitted updated_at (and last_saved).
-- Result: every UPDATE on game_progress — including the ON CONFLICT path of the
-- save/sync upsert — aborts inside the trigger.
--
-- Run on any project that has (or may get) the updated_at trigger:
--   * OLD/legacy project hgxzzpntciubxphuwqci: REQUIRED — confirmed broken
--     (column missing, trigger present). Run in Dashboard > SQL Editor.
--   * NEW project abkiytgnbqfjlcesywwl (ifrs-17-game-original): recommended for
--     parity — column and trigger are both absent there today, so syncing works,
--     but re-running complete-persistence-setup.sql would recreate the trigger
--     and reintroduce the bug unless this column exists.

ALTER TABLE public.game_progress
  ADD COLUMN IF NOT EXISTS last_saved TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.game_progress
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- New project only (function ifrs17_set_updated_at lives there): keep
-- game_progress consistent with users/user_progress/leaderboard/
-- module_leaderboard/documents, which all have this touch trigger.
-- On the old project, skip this block — its trigger already exists
-- (update_game_progress_updated_at) and works once the column is added.
DO $$
BEGIN
  IF to_regprocedure('public.ifrs17_set_updated_at()') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS trg_game_progress_updated_at ON public.game_progress;
    CREATE TRIGGER trg_game_progress_updated_at
      BEFORE UPDATE ON public.game_progress
      FOR EACH ROW
      EXECUTE FUNCTION public.ifrs17_set_updated_at();
  END IF;
END $$;
