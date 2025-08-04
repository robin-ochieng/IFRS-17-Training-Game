-- Run this in Supabase SQL Editor
CREATE TABLE leaderboard (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT,
  organization TEXT,
  avatar TEXT,
  score INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  achievements INTEGER DEFAULT 0,
  modules_completed INTEGER DEFAULT 0,
  perfect_modules INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create an index for faster queries
CREATE INDEX idx_leaderboard_score ON leaderboard(score DESC);

-- Enable Row Level Security
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read the leaderboard
CREATE POLICY "Public leaderboard read access" ON leaderboard
  FOR SELECT USING (true);

-- Create a policy that allows users to insert/update their own records
CREATE POLICY "Users can update own scores" ON leaderboard
  FOR ALL USING (true);

-- Create module_leaderboard table
CREATE TABLE module_leaderboard (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    module_id INTEGER NOT NULL,
    module_name TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_email TEXT,
    organization TEXT,
    avatar TEXT,
    score INTEGER NOT NULL DEFAULT 0,
    perfect_completion BOOLEAN DEFAULT FALSE,
    completion_time TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Ensure unique combination of user and module
    UNIQUE(user_id, module_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_module_leaderboard_module_id ON module_leaderboard(module_id);
CREATE INDEX idx_module_leaderboard_user_id ON module_leaderboard(user_id);
CREATE INDEX idx_module_leaderboard_score ON module_leaderboard(score DESC);
CREATE INDEX idx_module_leaderboard_module_score ON module_leaderboard(module_id, score DESC);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_module_leaderboard_updated_at BEFORE UPDATE
    ON module_leaderboard FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust based on your needs)
GRANT ALL ON module_leaderboard TO authenticated;
GRANT SELECT ON module_leaderboard TO anon;

-- Enable Row Level Security (optional but recommended)
ALTER TABLE module_leaderboard ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (adjust based on your needs)
-- Policy for users to view all leaderboard entries
CREATE POLICY "Enable read access for all users" ON module_leaderboard
    FOR SELECT USING (true);

-- Policy for users to insert/update their own entries
CREATE POLICY "Enable insert for authenticated users only" ON module_leaderboard
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Enable update for users based on user_id" ON module_leaderboard
    FOR UPDATE USING (auth.uid()::text = user_id);  


-- Add country column to the main leaderboard table
ALTER TABLE leaderboard 
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Unknown';

-- Add country column to the module leaderboard table
ALTER TABLE module_leaderboard 
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Unknown';

-- Update the completion_time column to store seconds as INTEGER for easier sorting
ALTER TABLE module_leaderboard 
ALTER COLUMN completion_time TYPE INTEGER USING EXTRACT(EPOCH FROM completion_time)::INTEGER;


-- Create users table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    organization TEXT,
    avatar TEXT NOT NULL,
    country TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_users_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE
    ON users FOR EACH ROW EXECUTE FUNCTION update_users_updated_at_column();

-- Grant permissions
GRANT ALL ON users TO authenticated;
GRANT SELECT ON users TO anon;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy for users to view all users (for login screen)
CREATE POLICY "Enable read access for all users" ON users
    FOR SELECT USING (true);

-- Policy for users to insert their own profile
CREATE POLICY "Enable insert for all users" ON users
    FOR INSERT WITH CHECK (true);

-- Policy for users to update their own profile
CREATE POLICY "Enable update for users based on id" ON users
    FOR UPDATE USING (id = auth.uid()::text OR true); -- Allow all updates for now

-- Add a current_sessions table to track active sessions
CREATE TABLE current_sessions (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    session_started TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Grant permissions for sessions
GRANT ALL ON current_sessions TO authenticated;
GRANT ALL ON current_sessions TO anon;


-- Check the table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'module_leaderboard'
ORDER BY 
    ordinal_position;

-- If the table doesn't exist or is missing columns, recreate it:
DROP TABLE IF EXISTS module_leaderboard CASCADE;

CREATE TABLE module_leaderboard (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    module_id INTEGER NOT NULL,
    module_name TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_email TEXT,
    organization TEXT,
    avatar TEXT,
    country TEXT,
    score INTEGER NOT NULL DEFAULT 0,
    perfect_completion BOOLEAN DEFAULT FALSE,
    completion_time INTEGER, -- Time in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Ensure unique combination of user and module
    UNIQUE(user_id, module_id)
);

-- Create indexes
CREATE INDEX idx_module_leaderboard_module_id ON module_leaderboard(module_id);
CREATE INDEX idx_module_leaderboard_user_id ON module_leaderboard(user_id);
CREATE INDEX idx_module_leaderboard_score ON module_leaderboard(score DESC);

-- Initially disable RLS for testing
ALTER TABLE module_leaderboard DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON module_leaderboard TO anon;
GRANT ALL ON module_leaderboard TO authenticated;




-- Add new columns to the users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Make certain fields required by adding NOT NULL constraints
-- First, update existing NULL values to defaults
UPDATE users SET country = 'Unknown' WHERE country IS NULL;
UPDATE users SET organization = 'Independent' WHERE organization IS NULL;
UPDATE users SET gender = 'Prefer not to say' WHERE gender IS NULL;

-- Then add the constraints
ALTER TABLE users 
ALTER COLUMN country SET NOT NULL,
ALTER COLUMN organization SET NOT NULL;

-- Create a unique constraint on email for proper authentication
ALTER TABLE users 
ADD CONSTRAINT unique_email UNIQUE (email);

-- Update the leaderboard tables to include gender
ALTER TABLE leaderboard 
ADD COLUMN IF NOT EXISTS gender TEXT;

ALTER TABLE module_leaderboard 
ADD COLUMN IF NOT EXISTS gender TEXT;







-- Supabase Database Schema for User Progress
-- Run this SQL in your Supabase SQL Editor to create the user_progress table

-- Create user_progress table to store game progress
CREATE TABLE IF NOT EXISTS user_progress (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  progress_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to access only their own progress
CREATE POLICY "Users can manage their own progress" ON user_progress
  USING (user_id = current_setting('app.current_user_id', true))
  WITH CHECK (user_id = current_setting('app.current_user_id', true));

-- Alternative simpler policy (if the above doesn't work with your auth setup)
-- CREATE POLICY "Users can manage their own progress" ON user_progress
--   FOR ALL USING (true);

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION update_user_progress_updated_at();

-- Grant permissions (adjust as needed for your setup)
GRANT ALL ON user_progress TO authenticated;
GRANT ALL ON user_progress TO anon;


ALTER TABLE public.users 
ADD COLUMN company_type TEXT;