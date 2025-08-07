-- MANUAL TABLE CREATION FOR IFRS 17 LEADERBOARD
-- Copy and paste this into your Supabase SQL Editor and run it

-- Create leaderboard table
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  user_name TEXT NOT NULL,
  user_email TEXT DEFAULT '',
  organization TEXT DEFAULT 'Independent',
  avatar TEXT DEFAULT '',
  country TEXT DEFAULT 'Unknown',
  gender TEXT DEFAULT 'Prefer not to say',
  score INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  achievements INTEGER NOT NULL DEFAULT 0,
  modules_completed INTEGER NOT NULL DEFAULT 0,
  perfect_modules INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create module leaderboard table
CREATE TABLE IF NOT EXISTS public.module_leaderboard (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  module_id INTEGER NOT NULL,
  module_name TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT DEFAULT '',
  organization TEXT DEFAULT 'Independent',
  avatar TEXT DEFAULT '',
  country TEXT DEFAULT 'Unknown',
  gender TEXT DEFAULT 'Prefer not to say',
  score INTEGER NOT NULL DEFAULT 0,
  perfect_completion BOOLEAN NOT NULL DEFAULT FALSE,
  completion_time INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

-- Enable Row Level Security
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_leaderboard ENABLE ROW LEVEL SECURITY;

-- Create policies for leaderboard table
CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.leaderboard
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY IF NOT EXISTS "Enable insert access for all users" ON public.leaderboard
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Enable update access for all users" ON public.leaderboard
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Create policies for module_leaderboard table
CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON public.module_leaderboard
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY IF NOT EXISTS "Enable insert access for all users" ON public.module_leaderboard
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Enable update access for all users" ON public.module_leaderboard
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON public.leaderboard (score DESC);
CREATE INDEX IF NOT EXISTS idx_module_leaderboard_module_score ON public.module_leaderboard (module_id, score DESC);

-- Insert test data to verify everything works
INSERT INTO public.leaderboard (user_id, user_name, score, level) 
VALUES ('test-user', 'Test User', 100, 1) 
ON CONFLICT (user_id) DO NOTHING;

-- Verify tables were created
SELECT 'leaderboard table created' as status, count(*) as row_count FROM public.leaderboard
UNION ALL
SELECT 'module_leaderboard table created' as status, count(*) as row_count FROM public.module_leaderboard;
