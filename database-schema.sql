-- =====================================================
-- FitTracker Pro - Enhanced Database Schema
-- Includes intelligent coaching and progression tracking
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- =====================================================
-- ENUM TYPES
-- =====================================================

-- Exercise categories
CREATE TYPE exercise_category AS ENUM (
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'legs',
  'glutes',
  'core',
  'cardio',
  'full_body',
  'olympic',
  'powerlifting',
  'other'
);

-- Equipment types
CREATE TYPE equipment_type AS ENUM (
  'barbell',
  'dumbbell',
  'machine',
  'cable',
  'bodyweight',
  'band',
  'kettlebell',
  'plate',
  'smith_machine',
  'ez_bar',
  'trap_bar',
  'other',
  'none'
);

-- Set difficulty feedback
CREATE TYPE set_difficulty AS ENUM (
  'too_easy',      -- Could do 5+ more reps
  'easy',          -- Could do 2-3 more reps
  'perfect',       -- Had 1-2 reps left in tank
  'challenging',   -- Barely finished
  'failure'        -- Couldn't complete all reps
);

-- Form quality feedback
CREATE TYPE form_quality AS ENUM (
  'perfect',       -- Form felt great
  'good',          -- Minor form breakdown
  'poor'           -- Major form breakdown
);

-- Progression preference
CREATE TYPE progression_type AS ENUM (
  'weight',        -- Prefer adding weight
  'reps',          -- Prefer adding reps
  'both',          -- Alternate between weight and reps
  'volume'         -- Add sets
);

-- Suggestion types
CREATE TYPE suggestion_type AS ENUM (
  'weight_increase',
  'weight_decrease',
  'rep_increase',
  'rep_decrease',
  'rest_increase',
  'rest_decrease',
  'form_focus',
  'deload',
  'maintain'
);

-- Experience levels
CREATE TYPE experience_level AS ENUM (
  'beginner',      -- < 6 months
  'novice',        -- 6-12 months
  'intermediate',  -- 1-3 years
  'advanced',      -- 3-5 years
  'expert'         -- 5+ years
);

-- =====================================================
-- TABLES
-- =====================================================

-- User profiles (extended user data)
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  full_name VARCHAR(255),
  avatar_url TEXT,
  height_cm INTEGER,
  weight_kg DECIMAL(5,2),
  date_of_birth DATE,
  fitness_goal TEXT,
  experience experience_level DEFAULT 'beginner',
  preferred_units VARCHAR(10) DEFAULT 'metric', -- 'metric' or 'imperial'
  coaching_enabled BOOLEAN DEFAULT true,
  auto_progression BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Exercises table (both system and user-created)
CREATE TABLE exercises (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category exercise_category NOT NULL,
  equipment equipment_type DEFAULT 'none',
  primary_muscles TEXT[] DEFAULT '{}',
  secondary_muscles TEXT[] DEFAULT '{}',
  instructions TEXT,
  tips TEXT[],
  common_mistakes TEXT[],
  video_url TEXT,
  image_url TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT false,
  is_compound BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(name, user_id)
);

-- Workout templates
CREATE TABLE workout_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  exercises JSONB DEFAULT '[]', -- Array of exercise configs
  estimated_duration INTEGER, -- in minutes
  difficulty_level experience_level,
  is_public BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  times_used INTEGER DEFAULT 0,
  rating DECIMAL(3,2), -- Average rating from users
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Workout sessions (actual workouts)
CREATE TABLE workout_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES workout_templates(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  total_volume DECIMAL(10,2), -- Total weight moved
  total_reps INTEGER,
  total_sets INTEGER,
  calories_burned INTEGER,
  overall_difficulty set_difficulty,
  notes TEXT,
  mood_before INTEGER CHECK (mood_before >= 1 AND mood_before <= 10),
  mood_after INTEGER CHECK (mood_after >= 1 AND mood_after <= 10),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Exercise logs (sets performed in a workout)
CREATE TABLE exercise_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  order_in_workout INTEGER NOT NULL,
  sets JSONB NOT NULL DEFAULT '[]', -- Enhanced set data with feedback
  total_volume DECIMAL(10,2),
  avg_difficulty set_difficulty,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Individual set tracking (normalized for better querying)
CREATE TABLE set_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  exercise_log_id UUID REFERENCES exercise_logs(id) ON DELETE CASCADE NOT NULL,
  set_number INTEGER NOT NULL,
  target_reps INTEGER,
  actual_reps INTEGER,
  weight DECIMAL(10,2),
  rest_seconds INTEGER,
  difficulty set_difficulty,
  form form_quality,
  rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10), -- Rate of Perceived Exertion
  tempo VARCHAR(20), -- e.g., "2-1-2-1" (eccentric-pause-concentric-pause)
  notes TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(exercise_log_id, set_number)
);

-- Workout suggestions and coaching
CREATE TABLE workout_suggestions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_log_id UUID REFERENCES exercise_logs(id) ON DELETE CASCADE,
  set_log_id UUID REFERENCES set_logs(id) ON DELETE CASCADE,
  suggestion_type suggestion_type NOT NULL,
  suggestion_text TEXT NOT NULL,
  suggested_value JSONB, -- {weight: 150, reps: 8, rest: 120}
  reason TEXT,
  was_followed BOOLEAN,
  outcome set_difficulty,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Progression rules per exercise per user
CREATE TABLE progression_rules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  progression_type progression_type DEFAULT 'weight',
  weight_increment_kg DECIMAL(5,2) DEFAULT 2.5,
  rep_increment INTEGER DEFAULT 1,
  min_reps_for_progression INTEGER DEFAULT 5, -- Must hit this many reps to progress
  max_reps_before_weight INTEGER DEFAULT 12, -- Add weight if hitting this many reps
  deload_threshold INTEGER DEFAULT 3, -- Failed attempts before deload
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, exercise_id)
);

-- Personal records
CREATE TABLE personal_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  record_type VARCHAR(50) NOT NULL, -- '1rm', 'max_reps', 'max_volume', 'max_weight'
  value DECIMAL(10,2) NOT NULL,
  reps INTEGER,
  unit VARCHAR(20) DEFAULT 'kg',
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  session_id UUID REFERENCES workout_sessions(id) ON DELETE SET NULL,
  previous_value DECIMAL(10,2),
  improvement_percentage DECIMAL(5,2),
  video_url TEXT,
  verified BOOLEAN DEFAULT false,
  notes TEXT
);

-- Body measurements
CREATE TABLE measurements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  body_weight DECIMAL(5,2),
  body_fat_percentage DECIMAL(4,2),
  muscle_mass_kg DECIMAL(5,2),
  measurements JSONB DEFAULT '{}', -- {chest, waist, hips, thighs, arms, etc.}
  photos TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);

-- Exercise performance trends (aggregated data for analysis)
CREATE TABLE performance_trends (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  avg_weight DECIMAL(10,2),
  avg_reps DECIMAL(5,2),
  avg_difficulty set_difficulty,
  total_volume DECIMAL(10,2),
  total_sets INTEGER,
  progression_rate DECIMAL(5,2), -- % improvement from previous week
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, exercise_id, week_start)
);

-- Rest time recommendations based on exercise and difficulty
CREATE TABLE rest_recommendations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  exercise_category exercise_category,
  is_compound BOOLEAN,
  difficulty set_difficulty,
  min_rest_seconds INTEGER,
  max_rest_seconds INTEGER,
  recommended_rest_seconds INTEGER
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_exercises_user_id ON exercises(user_id);
CREATE INDEX idx_exercises_category ON exercises(category);
CREATE INDEX idx_exercises_name_trgm ON exercises USING gin(name gin_trgm_ops);
CREATE INDEX idx_workout_sessions_user_id ON workout_sessions(user_id);
CREATE INDEX idx_workout_sessions_started_at ON workout_sessions(started_at DESC);
CREATE INDEX idx_exercise_logs_session_id ON exercise_logs(session_id);
CREATE INDEX idx_set_logs_exercise_log_id ON set_logs(exercise_log_id);
CREATE INDEX idx_set_logs_difficulty ON set_logs(difficulty);
CREATE INDEX idx_suggestions_user_id ON workout_suggestions(user_id);
CREATE INDEX idx_personal_records_user_exercise ON personal_records(user_id, exercise_id);
CREATE INDEX idx_measurements_user_date ON measurements(user_id, date DESC);
CREATE INDEX idx_performance_trends_user_exercise ON performance_trends(user_id, exercise_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE set_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE progression_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_trends ENABLE ROW LEVEL SECURITY;

-- User Profiles policies
CREATE POLICY "Users can view all profiles" ON user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR ALL USING (auth.uid() = id);

-- Exercises policies
CREATE POLICY "View public exercises and own" ON exercises
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users manage own exercises" ON exercises
  FOR ALL USING (auth.uid() = user_id);

-- Workout templates policies
CREATE POLICY "View public templates and own" ON workout_templates
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users manage own templates" ON workout_templates
  FOR ALL USING (auth.uid() = user_id);

-- Workout sessions policies
CREATE POLICY "Users manage own sessions" ON workout_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Exercise logs policies
CREATE POLICY "Users manage own exercise logs" ON exercise_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE workout_sessions.id = exercise_logs.session_id
      AND workout_sessions.user_id = auth.uid()
    )
  );

-- Set logs policies
CREATE POLICY "Users manage own set logs" ON set_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM exercise_logs
      JOIN workout_sessions ON workout_sessions.id = exercise_logs.session_id
      WHERE exercise_logs.id = set_logs.exercise_log_id
      AND workout_sessions.user_id = auth.uid()
    )
  );

-- Other table policies
CREATE POLICY "Users manage own suggestions" ON workout_suggestions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own progression rules" ON progression_rules
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own records" ON personal_records
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own measurements" ON measurements
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users view own trends" ON performance_trends
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, username, full_name)
  VALUES (
    NEW.id,
    LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), ' ', '_')),
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to calculate 1RM from weight and reps
CREATE OR REPLACE FUNCTION calculate_1rm(weight DECIMAL, reps INTEGER)
RETURNS DECIMAL AS $$
BEGIN
  -- Epley Formula: 1RM = weight × (1 + reps/30)
  IF reps = 1 THEN
    RETURN weight;
  ELSE
    RETURN ROUND(weight * (1 + reps::DECIMAL / 30), 2);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to generate smart suggestions based on set feedback
CREATE OR REPLACE FUNCTION generate_set_suggestion(
  p_difficulty set_difficulty,
  p_form form_quality,
  p_current_weight DECIMAL,
  p_current_reps INTEGER,
  p_exercise_type BOOLEAN -- is_compound
)
RETURNS JSONB AS $$
DECLARE
  v_suggestion JSONB;
  v_weight_change DECIMAL;
  v_rep_change INTEGER;
BEGIN
  v_suggestion := '{}'::JSONB;
  
  -- Weight suggestions based on difficulty
  CASE p_difficulty
    WHEN 'too_easy' THEN
      v_weight_change := CASE WHEN p_exercise_type THEN 5.0 ELSE 2.5 END;
      v_rep_change := 2;
    WHEN 'easy' THEN
      v_weight_change := CASE WHEN p_exercise_type THEN 2.5 ELSE 1.25 END;
      v_rep_change := 1;
    WHEN 'perfect' THEN
      v_weight_change := 0;
      v_rep_change := 0;
    WHEN 'challenging' THEN
      v_weight_change := CASE WHEN p_exercise_type THEN -2.5 ELSE -1.25 END;
      v_rep_change := -1;
    WHEN 'failure' THEN
      v_weight_change := CASE WHEN p_exercise_type THEN -5.0 ELSE -2.5 END;
      v_rep_change := -2;
  END CASE;
  
  -- Adjust for form quality
  IF p_form = 'poor' THEN
    v_weight_change := GREATEST(v_weight_change - 5.0, -10.0);
  ELSIF p_form = 'good' AND p_difficulty IN ('too_easy', 'easy') THEN
    v_weight_change := v_weight_change + 2.5;
  END IF;
  
  -- Build suggestion JSON
  v_suggestion := jsonb_build_object(
    'weight', p_current_weight + v_weight_change,
    'reps', GREATEST(p_current_reps + v_rep_change, 1),
    'weight_change', v_weight_change,
    'rep_change', v_rep_change
  );
  
  RETURN v_suggestion;
END;
$$ LANGUAGE plpgsql;

-- Function to update performance trends weekly
CREATE OR REPLACE FUNCTION update_performance_trends()
RETURNS void AS $$
BEGIN
  INSERT INTO performance_trends (
    user_id, exercise_id, week_start, avg_weight, avg_reps, 
    avg_difficulty, total_volume, total_sets
  )
  SELECT 
    ws.user_id,
    el.exercise_id,
    DATE_TRUNC('week', ws.started_at)::DATE as week_start,
    AVG(sl.weight) as avg_weight,
    AVG(sl.actual_reps) as avg_reps,
    MODE() WITHIN GROUP (ORDER BY sl.difficulty) as avg_difficulty,
    SUM(sl.weight * sl.actual_reps) as total_volume,
    COUNT(sl.id) as total_sets
  FROM workout_sessions ws
  JOIN exercise_logs el ON el.session_id = ws.id
  JOIN set_logs sl ON sl.exercise_log_id = el.id
  WHERE ws.started_at >= CURRENT_DATE - INTERVAL '7 days'
    AND sl.completed = true
  GROUP BY ws.user_id, el.exercise_id, DATE_TRUNC('week', ws.started_at)
  ON CONFLICT (user_id, exercise_id, week_start) 
  DO UPDATE SET
    avg_weight = EXCLUDED.avg_weight,
    avg_reps = EXCLUDED.avg_reps,
    avg_difficulty = EXCLUDED.avg_difficulty,
    total_volume = EXCLUDED.total_volume,
    total_sets = EXCLUDED.total_sets,
    created_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- DEFAULT DATA
-- =====================================================

-- Insert default rest recommendations
INSERT INTO rest_recommendations (exercise_category, is_compound, difficulty, min_rest_seconds, max_rest_seconds, recommended_rest_seconds) VALUES
  ('chest', true, 'too_easy', 60, 90, 75),
  ('chest', true, 'easy', 90, 120, 105),
  ('chest', true, 'perfect', 120, 180, 150),
  ('chest', true, 'challenging', 180, 240, 210),
  ('chest', true, 'failure', 240, 300, 270),
  ('back', true, 'too_easy', 60, 90, 75),
  ('back', true, 'easy', 90, 120, 105),
  ('back', true, 'perfect', 120, 180, 150),
  ('back', true, 'challenging', 180, 240, 210),
  ('back', true, 'failure', 240, 300, 270),
  ('legs', true, 'too_easy', 90, 120, 105),
  ('legs', true, 'easy', 120, 150, 135),
  ('legs', true, 'perfect', 150, 210, 180),
  ('legs', true, 'challenging', 210, 300, 255),
  ('legs', true, 'failure', 300, 360, 330),
  ('biceps', false, 'too_easy', 30, 60, 45),
  ('biceps', false, 'easy', 60, 90, 75),
  ('biceps', false, 'perfect', 90, 120, 105),
  ('biceps', false, 'challenging', 120, 150, 135),
  ('biceps', false, 'failure', 150, 180, 165);

-- Insert default exercises with enhanced data
INSERT INTO exercises (
  name, category, equipment, primary_muscles, secondary_muscles, 
  instructions, tips, common_mistakes, is_compound, is_public
) VALUES
  ('Barbell Bench Press', 'chest', 'barbell', 
   ARRAY['chest'], ARRAY['triceps', 'front deltoids'],
   'Lie on bench, grip bar slightly wider than shoulders, lower to chest, press up',
   ARRAY['Keep feet flat on floor', 'Maintain arch in lower back', 'Drive through legs'],
   ARRAY['Bouncing bar off chest', 'Flaring elbows too wide', 'Lifting hips off bench'],
   true, true),
   
  ('Barbell Back Squat', 'legs', 'barbell',
   ARRAY['quadriceps', 'glutes'], ARRAY['hamstrings', 'core', 'lower back'],
   'Bar on upper back, feet shoulder-width, squat down until thighs parallel, stand up',
   ARRAY['Keep chest up', 'Drive knees out', 'Maintain neutral spine'],
   ARRAY['Knees caving inward', 'Heels rising', 'Excessive forward lean'],
   true, true),
   
  ('Conventional Deadlift', 'back', 'barbell',
   ARRAY['glutes', 'hamstrings', 'lower back'], ARRAY['traps', 'lats', 'core'],
   'Bar over mid-foot, hinge at hips, grip bar, stand up pulling shoulders back',
   ARRAY['Keep bar close to body', 'Engage lats', 'Drive through heels'],
   ARRAY['Rounding back', 'Bar drifting forward', 'Hyperextending at top'],
   true, true),
   
  ('Pull-ups', 'back', 'bodyweight',
   ARRAY['lats', 'middle back'], ARRAY['biceps', 'rear deltoids'],
   'Hang from bar with overhand grip, pull chin over bar, lower with control',
   ARRAY['Full range of motion', 'Engage core', 'Control the negative'],
   ARRAY['Kipping', 'Partial reps', 'Using too much momentum'],
   true, true),
   
  ('Overhead Press', 'shoulders', 'barbell',
   ARRAY['front deltoids'], ARRAY['triceps', 'upper chest', 'core'],
   'Bar at shoulders, press overhead, lock out arms, lower with control',
   ARRAY['Squeeze glutes', 'Keep core tight', 'Press slightly back'],
   ARRAY['Excessive back arch', 'Press going forward', 'Not locking out'],
   true, true),
   
  ('Barbell Row', 'back', 'barbell',
   ARRAY['middle back', 'lats'], ARRAY['biceps', 'rear deltoids'],
   'Hinge forward, pull bar to lower chest/upper abdomen, squeeze shoulder blades',
   ARRAY['Keep back neutral', 'Pull elbows back', 'Pause at top'],
   ARRAY['Using momentum', 'Standing too upright', 'Not retracting shoulder blades'],
   true, true),
   
  ('Dumbbell Bicep Curl', 'biceps', 'dumbbell',
   ARRAY['biceps'], ARRAY['forearms'],
   'Hold dumbbells at sides, curl up rotating palms, squeeze at top, lower slowly',
   ARRAY['Keep elbows stationary', 'Full range of motion', 'Control the weight'],
   ARRAY['Swinging weights', 'Partial reps', 'Moving elbows forward'],
   false, true),
   
  ('Tricep Dips', 'triceps', 'bodyweight',
   ARRAY['triceps'], ARRAY['chest', 'front deltoids'],
   'Support body on dip bars, lower until shoulders below elbows, press up',
   ARRAY['Lean slightly forward', 'Keep elbows close', 'Full range of motion'],
   ARRAY['Going too deep', 'Flaring elbows', 'Using momentum'],
   false, true),
   
  ('Romanian Deadlift', 'legs', 'barbell',
   ARRAY['hamstrings', 'glutes'], ARRAY['lower back', 'core'],
   'Bar at hips, push hips back keeping legs slightly bent, feel stretch in hamstrings, return',
   ARRAY['Keep bar close', 'Maintain neutral spine', 'Focus on hip hinge'],
   ARRAY['Bending knees too much', 'Rounding back', 'Not going deep enough'],
   true, true),
   
  ('Leg Press', 'legs', 'machine',
   ARRAY['quadriceps', 'glutes'], ARRAY['hamstrings', 'calves'],
   'Sit in machine, place feet shoulder-width on plate, lower until 90 degrees, press up',
   ARRAY['Full range of motion', 'Dont lock knees', 'Keep core engaged'],
   ARRAY['Placing feet too high/low', 'Partial reps', 'Knees caving in'],
   true, true);

-- Create a sample workout template
INSERT INTO workout_templates (user_id, name, description, exercises, estimated_duration, difficulty_level, is_public, tags)
SELECT 
  NULL as user_id,
  'Push Day - Beginner' as name,
  'Chest, shoulders, and triceps workout for beginners' as description,
  '[
    {"exercise_name": "Barbell Bench Press", "sets": 3, "reps": 8, "rest_seconds": 150},
    {"exercise_name": "Overhead Press", "sets": 3, "reps": 8, "rest_seconds": 120},
    {"exercise_name": "Tricep Dips", "sets": 3, "reps": 10, "rest_seconds": 90}
  ]'::jsonb as exercises,
  45 as estimated_duration,
  'beginner' as difficulty_level,
  true as is_public,
  ARRAY['push', 'beginner', 'upper body'] as tags
WHERE NOT EXISTS (
  SELECT 1 FROM workout_templates WHERE name = 'Push Day - Beginner'
);

-- =====================================================
-- VIEWS FOR EASIER QUERYING
-- =====================================================

-- View for exercise statistics per user
CREATE OR REPLACE VIEW user_exercise_stats AS
SELECT 
  ws.user_id,
  el.exercise_id,
  e.name as exercise_name,
  COUNT(DISTINCT ws.id) as total_sessions,
  COUNT(sl.id) as total_sets,
  SUM(sl.actual_reps) as total_reps,
  AVG(sl.weight) as avg_weight,
  MAX(sl.weight) as max_weight,
  SUM(sl.weight * sl.actual_reps) as total_volume,
  MAX(ws.started_at) as last_performed
FROM workout_sessions ws
JOIN exercise_logs el ON el.session_id = ws.id
JOIN exercises e ON e.id = el.exercise_id
JOIN set_logs sl ON sl.exercise_log_id = el.id
WHERE sl.completed = true
GROUP BY ws.user_id, el.exercise_id, e.name;

-- View for recent workout performance
CREATE OR REPLACE VIEW recent_performance AS
SELECT 
  ws.user_id,
  ws.id as session_id,
  ws.name as workout_name,
  ws.started_at,
  ws.duration_seconds,
  ws.total_volume,
  ws.overall_difficulty,
  COUNT(DISTINCT el.exercise_id) as exercises_count,
  COUNT(sl.id) as total_sets,
  AVG(CASE WHEN sl.difficulty IS NOT NULL THEN 
    CASE sl.difficulty
      WHEN 'too_easy' THEN 1
      WHEN 'easy' THEN 2
      WHEN 'perfect' THEN 3
      WHEN 'challenging' THEN 4
      WHEN 'failure' THEN 5
    END
  END) as avg_difficulty_score
FROM workout_sessions ws
JOIN exercise_logs el ON el.session_id = ws.id
JOIN set_logs sl ON sl.exercise_log_id = el.id
WHERE ws.started_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY ws.user_id, ws.id, ws.name, ws.started_at, ws.duration_seconds, ws.total_volume, ws.overall_difficulty
ORDER BY ws.started_at DESC;

-- =====================================================
-- SCHEDULED JOBS (Run these as cron jobs or triggers)
-- =====================================================

-- Weekly performance trends update (can be scheduled as a cron job)
-- SELECT update_performance_trends();

COMMENT ON SCHEMA public IS 'FitTracker Pro - Intelligent Fitness Coaching Database';