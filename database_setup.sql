-- Users table for authentication and profile
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  organization TEXT,
  country TEXT DEFAULT 'Unknown',
  gender TEXT DEFAULT 'Prefer not to say',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_users_email ON users(email);


-- Store complete game state for each user
CREATE TABLE game_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  current_module INTEGER DEFAULT 0,
  current_question INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  combo INTEGER DEFAULT 0,
  perfect_modules_count INTEGER DEFAULT 0,
  completed_modules JSONB DEFAULT '[]'::jsonb,
  unlocked_modules JSONB DEFAULT '[0]'::jsonb,
  answered_questions JSONB DEFAULT '{}'::jsonb,
  achievements JSONB DEFAULT '[]'::jsonb,
  power_ups JSONB DEFAULT '{"skip": 3, "hint": 3, "eliminate": 3}'::jsonb,
  shuffled_questions JSONB DEFAULT '{}'::jsonb,
  last_saved TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for user lookups
CREATE INDEX idx_game_progress_user_id ON game_progress(user_id);




-- Track individual module completions
CREATE TABLE module_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  module_id INTEGER NOT NULL,
  module_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  perfect_completion BOOLEAN DEFAULT FALSE,
  completion_time INTEGER, -- in seconds
  questions_answered INTEGER,
  questions_correct INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

-- Create composite index for leaderboard queries
CREATE INDEX idx_module_completions_module_score ON module_completions(module_id, score DESC);
CREATE INDEX idx_module_completions_user ON module_completions(user_id);




-- Create a materialized view for the overall leaderboard
CREATE MATERIALIZED VIEW overall_leaderboard AS
SELECT 
  u.id as user_id,
  u.name as user_name,
  u.email,
  u.avatar,
  u.organization,
  u.country,
  u.gender,
  COALESCE(gp.total_score, 0) as score,
  COALESCE(gp.level, 1) as level,
  COALESCE(jsonb_array_length(gp.achievements), 0) as achievements,
  COALESCE(jsonb_array_length(gp.completed_modules), 0) as modules_completed,
  COALESCE(gp.perfect_modules_count, 0) as perfect_modules,
  RANK() OVER (ORDER BY COALESCE(gp.total_score, 0) DESC) as rank,
  gp.last_saved as last_active
FROM users u
LEFT JOIN game_progress gp ON u.id = gp.user_id
WHERE gp.total_score > 0
ORDER BY score DESC;

-- Create index for faster queries
CREATE UNIQUE INDEX idx_overall_leaderboard_user ON overall_leaderboard(user_id);
CREATE INDEX idx_overall_leaderboard_rank ON overall_leaderboard(rank);




-- Create a view for module-specific leaderboards
CREATE VIEW module_leaderboard AS
SELECT 
  mc.id,
  mc.user_id,
  u.name as user_name,
  u.avatar,
  u.organization,
  u.country,
  mc.module_id,
  mc.module_name,
  mc.score,
  mc.perfect_completion,
  mc.completion_time,
  mc.completed_at,
  RANK() OVER (PARTITION BY mc.module_id ORDER BY mc.score DESC, mc.completion_time ASC) as rank
FROM module_completions mc
JOIN users u ON mc.user_id = u.id
ORDER BY mc.module_id, rank;



-- Store session tokens for authenticated users
CREATE TABLE session_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_session_tokens_token ON session_tokens(token);
CREATE INDEX idx_session_tokens_user ON session_tokens(user_id);




-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_tokens ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all profiles" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Game progress policies
CREATE POLICY "Users can view own progress" ON game_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON game_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON game_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Module completions policies
CREATE POLICY "Anyone can view module completions" ON module_completions
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own completions" ON module_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own completions" ON module_completions
  FOR UPDATE USING (auth.uid() = user_id);



CREATE OR REPLACE FUNCTION save_game_progress(
  p_user_id UUID,
  p_progress JSONB
) RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  INSERT INTO game_progress (
    user_id,
    current_module,
    current_question,
    total_score,
    level,
    xp,
    streak,
    combo,
    perfect_modules_count,
    completed_modules,
    unlocked_modules,
    answered_questions,
    achievements,
    power_ups,
    shuffled_questions,
    last_saved
  ) VALUES (
    p_user_id,
    (p_progress->>'currentModule')::INTEGER,
    (p_progress->>'currentQuestion')::INTEGER,
    (p_progress->>'score')::INTEGER,
    (p_progress->>'level')::INTEGER,
    (p_progress->>'xp')::INTEGER,
    (p_progress->>'streak')::INTEGER,
    (p_progress->>'combo')::INTEGER,
    (p_progress->>'perfectModulesCount')::INTEGER,
    p_progress->'completedModules',
    p_progress->'unlockedModules',
    p_progress->'answeredQuestions',
    p_progress->'achievements',
    p_progress->'powerUps',
    p_progress->'shuffledQuestions',
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    current_module = EXCLUDED.current_module,
    current_question = EXCLUDED.current_question,
    total_score = EXCLUDED.total_score,
    level = EXCLUDED.level,
    xp = EXCLUDED.xp,
    streak = EXCLUDED.streak,
    combo = EXCLUDED.combo,
    perfect_modules_count = EXCLUDED.perfect_modules_count,
    completed_modules = EXCLUDED.completed_modules,
    unlocked_modules = EXCLUDED.unlocked_modules,
    answered_questions = EXCLUDED.answered_questions,
    achievements = EXCLUDED.achievements,
    power_ups = EXCLUDED.power_ups,
    shuffled_questions = EXCLUDED.shuffled_questions,
    last_saved = NOW()
  RETURNING to_jsonb(game_progress.*) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;  





CREATE OR REPLACE FUNCTION submit_module_score(
  p_user_id UUID,
  p_module_id INTEGER,
  p_module_name TEXT,
  p_score INTEGER,
  p_perfect BOOLEAN DEFAULT FALSE,
  p_time INTEGER DEFAULT NULL,
  p_questions_answered INTEGER DEFAULT NULL,
  p_questions_correct INTEGER DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  INSERT INTO module_completions (
    user_id,
    module_id,
    module_name,
    score,
    perfect_completion,
    completion_time,
    questions_answered,
    questions_correct,
    completed_at
  ) VALUES (
    p_user_id,
    p_module_id,
    p_module_name,
    p_score,
    p_perfect,
    p_time,
    p_questions_answered,
    p_questions_correct,
    NOW()
  )
  ON CONFLICT (user_id, module_id) DO UPDATE SET
    score = GREATEST(module_completions.score, EXCLUDED.score),
    perfect_completion = module_completions.perfect_completion OR EXCLUDED.perfect_completion,
    completion_time = LEAST(
      COALESCE(module_completions.completion_time, EXCLUDED.completion_time),
      COALESCE(EXCLUDED.completion_time, module_completions.completion_time)
    ),
    questions_answered = EXCLUDED.questions_answered,
    questions_correct = EXCLUDED.questions_correct,
    completed_at = NOW()
  RETURNING to_jsonb(module_completions.*) INTO v_result;
  
  -- Refresh the materialized view
  REFRESH MATERIALIZED VIEW CONCURRENTLY overall_leaderboard;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;





CREATE OR REPLACE FUNCTION get_leaderboard_with_position(
  p_user_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
) RETURNS JSONB AS $$
DECLARE
  v_leaderboard JSONB;
  v_user_position JSONB;
BEGIN
  -- Get top players
  SELECT jsonb_agg(row_to_json(t.*))
  INTO v_leaderboard
  FROM (
    SELECT * FROM overall_leaderboard
    LIMIT p_limit
  ) t;
  
  -- Get user's position if user_id provided
  IF p_user_id IS NOT NULL THEN
    SELECT to_jsonb(t.*)
    INTO v_user_position
    FROM (
      SELECT * FROM overall_leaderboard
      WHERE user_id = p_user_id
    ) t;
  END IF;
  
  RETURN jsonb_build_object(
    'leaderboard', COALESCE(v_leaderboard, '[]'::jsonb),
    'userPosition', v_user_position
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;




CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();




CREATE OR REPLACE FUNCTION refresh_leaderboard()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY overall_leaderboard;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_leaderboard_on_progress
  AFTER INSERT OR UPDATE ON game_progress
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_leaderboard();  




-- Additional indexes for better query performance
CREATE INDEX idx_module_completions_completed_at ON module_completions(completed_at DESC);
CREATE INDEX idx_game_progress_last_saved ON game_progress(last_saved DESC);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Partial indexes for active users
CREATE INDEX idx_active_users ON game_progress(user_id) 
  WHERE last_saved > NOW() - INTERVAL '30 days';  



-- Run this after creating all tables and before using the application
-- This ensures the materialized view is populated
REFRESH MATERIALIZED VIEW overall_leaderboard;

-- Create a scheduled job to refresh the leaderboard every 5 minutes (optional)
-- This requires pg_cron extension
-- SELECT cron.schedule('refresh-leaderboard', '*/5 * * * *', 
--   'REFRESH MATERIALIZED VIEW CONCURRENTLY overall_leaderboard;');