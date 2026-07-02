-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. USERS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    name TEXT,
    avatar TEXT,
    organization TEXT,
    country TEXT,
    gender TEXT,
    last_module_id INTEGER DEFAULT 0,
    last_question_index INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    combo INTEGER DEFAULT 0,
    completed_modules INTEGER[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist (Robustness)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS organization TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_module_id INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_question_index INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS combo INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS completed_modules INTEGER[] DEFAULT '{}';

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile" 
    ON public.users FOR SELECT 
    USING (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" 
    ON public.users FOR UPDATE 
    USING (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
CREATE POLICY "Users can insert their own profile" 
    ON public.users FOR INSERT 
    WITH CHECK (auth.uid()::text = id::text);

-- ==========================================
-- 2. GAME PROGRESS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.game_progress (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    current_module INTEGER DEFAULT 0,
    current_question INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    combo INTEGER DEFAULT 0,
    perfect_modules_count INTEGER DEFAULT 0,
    completed_modules INTEGER[] DEFAULT '{}',
    unlocked_modules INTEGER[] DEFAULT '{0}',
    answered_questions JSONB DEFAULT '{}'::jsonb,
    achievements JSONB DEFAULT '[]'::jsonb,
    power_ups JSONB DEFAULT '{"skip": 3, "hint": 3, "eliminate": 3}'::jsonb,
    shuffled_questions JSONB DEFAULT '{}'::jsonb,
    module_completion_times JSONB DEFAULT '{}'::jsonb,
    last_saved TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist
ALTER TABLE public.game_progress ADD COLUMN IF NOT EXISTS current_module INTEGER DEFAULT 0;
ALTER TABLE public.game_progress ADD COLUMN IF NOT EXISTS current_question INTEGER DEFAULT 0;
ALTER TABLE public.game_progress ADD COLUMN IF NOT EXISTS total_score INTEGER DEFAULT 0;
ALTER TABLE public.game_progress ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE public.game_progress ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE public.game_progress ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;
ALTER TABLE public.game_progress ADD COLUMN IF NOT EXISTS combo INTEGER DEFAULT 0;
ALTER TABLE public.game_progress ADD COLUMN IF NOT EXISTS perfect_modules_count INTEGER DEFAULT 0;
ALTER TABLE public.game_progress ADD COLUMN IF NOT EXISTS completed_modules INTEGER[] DEFAULT '{}';
ALTER TABLE public.game_progress ADD COLUMN IF NOT EXISTS unlocked_modules INTEGER[] DEFAULT '{0}';
ALTER TABLE public.game_progress ADD COLUMN IF NOT EXISTS answered_questions JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.game_progress ADD COLUMN IF NOT EXISTS achievements JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.game_progress ADD COLUMN IF NOT EXISTS power_ups JSONB DEFAULT '{"skip": 3, "hint": 3, "eliminate": 3}'::jsonb;
ALTER TABLE public.game_progress ADD COLUMN IF NOT EXISTS shuffled_questions JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.game_progress ADD COLUMN IF NOT EXISTS module_completion_times JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.game_progress ADD COLUMN IF NOT EXISTS last_saved TIMESTAMPTZ DEFAULT NOW();
-- updated_at is required by the update_game_progress_updated_at trigger below;
-- without it every UPDATE fails with: record "new" has no field "updated_at"
ALTER TABLE public.game_progress ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Enable RLS
ALTER TABLE public.game_progress ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view their own game progress" ON public.game_progress;
CREATE POLICY "Users can view their own game progress" 
    ON public.game_progress FOR SELECT 
    USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can update their own game progress" ON public.game_progress;
CREATE POLICY "Users can update their own game progress" 
    ON public.game_progress FOR UPDATE 
    USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can insert their own game progress" ON public.game_progress;
CREATE POLICY "Users can insert their own game progress" 
    ON public.game_progress FOR INSERT 
    WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can delete their own game progress" ON public.game_progress;
CREATE POLICY "Users can delete their own game progress" 
    ON public.game_progress FOR DELETE 
    USING (auth.uid()::text = user_id::text);

-- ==========================================
-- 3. LEADERBOARD TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.leaderboard (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    user_name TEXT,
    user_email TEXT,
    organization TEXT,
    avatar TEXT,
    country TEXT,
    gender TEXT,
    score INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    achievements INTEGER DEFAULT 0,
    modules_completed INTEGER DEFAULT 0,
    perfect_modules INTEGER DEFAULT 0,
    average_completion_time INTEGER DEFAULT 0,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist
ALTER TABLE public.leaderboard ADD COLUMN IF NOT EXISTS user_name TEXT;
ALTER TABLE public.leaderboard ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE public.leaderboard ADD COLUMN IF NOT EXISTS organization TEXT;
ALTER TABLE public.leaderboard ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE public.leaderboard ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.leaderboard ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.leaderboard ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;
ALTER TABLE public.leaderboard ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE public.leaderboard ADD COLUMN IF NOT EXISTS achievements INTEGER DEFAULT 0;
ALTER TABLE public.leaderboard ADD COLUMN IF NOT EXISTS modules_completed INTEGER DEFAULT 0;
ALTER TABLE public.leaderboard ADD COLUMN IF NOT EXISTS perfect_modules INTEGER DEFAULT 0;
ALTER TABLE public.leaderboard ADD COLUMN IF NOT EXISTS average_completion_time INTEGER DEFAULT 0;

-- Enable RLS
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Anyone can view leaderboard" ON public.leaderboard;
CREATE POLICY "Anyone can view leaderboard" 
    ON public.leaderboard FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Users can update their own leaderboard entry" ON public.leaderboard;
CREATE POLICY "Users can update their own leaderboard entry" 
    ON public.leaderboard FOR UPDATE 
    USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can insert their own leaderboard entry" ON public.leaderboard;
CREATE POLICY "Users can insert their own leaderboard entry" 
    ON public.leaderboard FOR INSERT 
    WITH CHECK (auth.uid()::text = user_id::text);

-- ==========================================
-- 4. MODULE LEADERBOARD TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.module_leaderboard (
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    module_id INTEGER,
    module_name TEXT,
    user_name TEXT,
    user_email TEXT,
    organization TEXT,
    avatar TEXT,
    country TEXT,
    gender TEXT,
    score INTEGER DEFAULT 0,
    perfect_completion BOOLEAN DEFAULT FALSE,
    completion_time INTEGER, -- in seconds
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, module_id)
);

-- Ensure columns exist
ALTER TABLE public.module_leaderboard ADD COLUMN IF NOT EXISTS module_name TEXT;
ALTER TABLE public.module_leaderboard ADD COLUMN IF NOT EXISTS user_name TEXT;
ALTER TABLE public.module_leaderboard ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE public.module_leaderboard ADD COLUMN IF NOT EXISTS organization TEXT;
ALTER TABLE public.module_leaderboard ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE public.module_leaderboard ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.module_leaderboard ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.module_leaderboard ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;
ALTER TABLE public.module_leaderboard ADD COLUMN IF NOT EXISTS perfect_completion BOOLEAN DEFAULT FALSE;
ALTER TABLE public.module_leaderboard ADD COLUMN IF NOT EXISTS completion_time INTEGER;

-- Enable RLS
ALTER TABLE public.module_leaderboard ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Anyone can view module leaderboard" ON public.module_leaderboard;
CREATE POLICY "Anyone can view module leaderboard" 
    ON public.module_leaderboard FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Users can update their own module leaderboard entry" ON public.module_leaderboard;
CREATE POLICY "Users can update their own module leaderboard entry" 
    ON public.module_leaderboard FOR UPDATE 
    USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can insert their own module leaderboard entry" ON public.module_leaderboard;
CREATE POLICY "Users can insert their own module leaderboard entry" 
    ON public.module_leaderboard FOR INSERT 
    WITH CHECK (auth.uid()::text = user_id::text);

-- ==========================================
-- 5. USER PROGRESS TABLE (Legacy/Lightweight)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.user_progress (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    progress_data JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist
ALTER TABLE public.user_progress ADD COLUMN IF NOT EXISTS progress_data JSONB DEFAULT '{}'::jsonb;

-- Enable RLS
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view their own user_progress" ON public.user_progress;
CREATE POLICY "Users can view their own user_progress" 
    ON public.user_progress FOR SELECT 
    USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can update their own user_progress" ON public.user_progress;
CREATE POLICY "Users can update their own user_progress" 
    ON public.user_progress FOR UPDATE 
    USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can insert their own user_progress" ON public.user_progress;
CREATE POLICY "Users can insert their own user_progress" 
    ON public.user_progress FOR INSERT 
    WITH CHECK (auth.uid()::text = user_id::text);

-- ==========================================
-- 6. MODULE COMPLETIONS TABLE (Log)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.module_completions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    module_id INTEGER,
    score INTEGER,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist
ALTER TABLE public.module_completions ADD COLUMN IF NOT EXISTS module_id INTEGER;
ALTER TABLE public.module_completions ADD COLUMN IF NOT EXISTS score INTEGER;

-- Enable RLS
ALTER TABLE public.module_completions ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view their own module completions" ON public.module_completions;
CREATE POLICY "Users can view their own module completions" 
    ON public.module_completions FOR SELECT 
    USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can insert their own module completions" ON public.module_completions;
CREATE POLICY "Users can insert their own module completions" 
    ON public.module_completions FOR INSERT 
    WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can delete their own module completions" ON public.module_completions;
CREATE POLICY "Users can delete their own module completions" 
    ON public.module_completions FOR DELETE 
    USING (auth.uid()::text = user_id::text);

-- ==========================================
-- FUNCTIONS & TRIGGERS
-- ==========================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_game_progress_updated_at ON public.game_progress;
CREATE TRIGGER update_game_progress_updated_at
    BEFORE UPDATE ON public.game_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leaderboard_updated_at ON public.leaderboard;
CREATE TRIGGER update_leaderboard_updated_at
    BEFORE UPDATE ON public.leaderboard
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_module_leaderboard_updated_at ON public.module_leaderboard;
CREATE TRIGGER update_module_leaderboard_updated_at
    BEFORE UPDATE ON public.module_leaderboard
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
