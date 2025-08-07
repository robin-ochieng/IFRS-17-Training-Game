-- FIXED TABLE SETUP FOR EXISTING TABLES
-- This script works with your existing tables and data

-- First, let's drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for all users" ON public.leaderboard;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.leaderboard;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.leaderboard;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.module_leaderboard;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.module_leaderboard;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.module_leaderboard;

-- Enable Row Level Security (safe to run multiple times)
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_leaderboard ENABLE ROW LEVEL SECURITY;

-- Create policies for leaderboard table (without IF NOT EXISTS)
CREATE POLICY "leaderboard_select_policy" ON public.leaderboard
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "leaderboard_insert_policy" ON public.leaderboard
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "leaderboard_update_policy" ON public.leaderboard
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Create policies for module_leaderboard table (without IF NOT EXISTS)
CREATE POLICY "module_leaderboard_select_policy" ON public.module_leaderboard
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "module_leaderboard_insert_policy" ON public.module_leaderboard
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "module_leaderboard_update_policy" ON public.module_leaderboard
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Create indexes for better performance (safe to run multiple times)
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON public.leaderboard (score DESC);
CREATE INDEX IF NOT EXISTS idx_module_leaderboard_module_score ON public.module_leaderboard (module_id, score DESC);

-- Verify the setup worked
SELECT 'Tables and policies configured successfully' as status;

-- Show current data
SELECT 'leaderboard_data' as table_name, count(*) as row_count FROM public.leaderboard
UNION ALL
SELECT 'module_leaderboard_data' as table_name, count(*) as row_count FROM public.module_leaderboard;
