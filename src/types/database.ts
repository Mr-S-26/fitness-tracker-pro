// =====================================================
// EXISTING TYPES (Keep these)
// =====================================================

export type SetDifficulty = 'too_easy' | 'easy' | 'perfect' | 'challenging' | 'failure'
export type FormQuality = 'perfect' | 'good' | 'poor'

export interface Exercise {
  id: string
  name: string
  category: string
  equipment: string
  primary_muscles: string[]
  is_compound: boolean
}

export interface SetLog {
  id: string
  weight: number
  target_reps: number
  actual_reps: number
  difficulty: SetDifficulty
  form: FormQuality
  rpe: number
  ai_suggestion?: AISuggestion
}

export interface AISuggestion {
  next_weight: number
  next_reps: number
  rest_seconds: number
  reasoning: string
  form_tips?: string[]
  warnings?: string[]
  motivation?: string
  timestamp: string
}

export interface WorkoutSession {
  id: string
  user_id: string
  name: string
  started_at: string
  completed_at?: string
  total_volume?: number
}

export interface UserProfile {
  id: string
  full_name: string
  fitness_goal: string
  experience: string
  coaching_enabled: boolean
}

// =====================================================
// NEW TYPES FOR PHASE 0
// =====================================================

// Onboarding & User Profile
export type PrimaryGoal = 'muscle_gain' | 'strength' | 'fat_loss' | 'general_fitness' | 'athletic_performance'
export type TrainingExperience = 'complete_beginner' | 'beginner' | 'intermediate' | 'advanced'
export type TrainingLocation = 'home' | 'commercial_gym' | 'garage_gym' | 'outdoor' | 'hotel'
export type CoachingStyle = 'strict' | 'supportive' | 'balanced'
export type MotivationType = 'hype' | 'analytical' | 'calm'
export type InjurySeverity = 'minor' | 'moderate' | 'severe'
export type DietaryPreference = 'vegetarian' | 'vegan' | 'keto' | 'paleo' | 'none'

export interface UserFitnessProfile {
  id: string
  user_id: string
  
  // Goals
  primary_goal?: PrimaryGoal
  specific_goals?: string
  target_date?: string
  
  // Experience
  training_experience?: TrainingExperience
  years_training?: number
  previous_programs?: string
  
  // Schedule
  available_days_per_week?: number
  session_duration_minutes?: number
  preferred_training_times?: string[] // Keep optional for backward compat if needed
  
  // ✅ NEW: Reminder Fields
  preferred_workout_time?: string; 
  reminders_enabled?: boolean;
  push_subscription_data?: any; // Stores the JSON subscription
  
  // Equipment
  training_location?: TrainingLocation
  available_equipment?: string[]
  
  // Limitations
  movement_restrictions?: string
  
  // Body Metrics
  height_cm?: number
  weight_kg?: number
  target_weight_kg?: number;
  body_fat_percentage?: number
  
  // Lifestyle
  average_sleep_hours?: number
  stress_level?: number
  nutrition_tracking?: boolean
  dietary_preferences?: DietaryPreference[]
  
  // AI Preferences
  coaching_style?: CoachingStyle
  motivation_type?: MotivationType
  wants_voice_coaching?: boolean
  
  // Status
  onboarding_completed?: boolean
  onboarding_completed_at?: string
  
  // Metadata
  created_at: string
  updated_at: string
  last_assessment_date?: string
}

// Injuries
export interface UserInjury {
  id: string
  user_id: string
  body_part: string
  description?: string
  severity: InjurySeverity
  active: boolean
  occurred_at: string
  resolved_at?: string
  notes?: string
  created_at: string
  updated_at: string
}

// Nutrition
export type NutritionGoal = 'muscle_gain' | 'fat_loss' | 'maintenance'

export interface NutritionPlan {
  id: string
  user_id: string
  goal: NutritionGoal
  target_weight_kg?: number
  
  // Calculated Values
  bmr: number
  tdee: number
  daily_calories: number
  protein_grams: number
  carbs_grams: number
  fat_grams: number
  
  // Meal Strategy
  meal_timing_strategy?: string
  pre_workout_meal?: string
  post_workout_meal?: string
  
  // Hydration
  hydration_oz?: number
  
  // Supplements
  recommended_supplements?: Array<{
    name: string
    dosage: string
    timing: string
    reason: string
  }>
  
  // Metadata
  created_at: string
  updated_at: string
  active: boolean
}

// AI Programs
export type ChangeType = 'initial' | 'progression' | 'deload' | 'injury_adjustment' | 'user_request' | 'plateau_break'

export interface WorkoutProgramWeek {
  week_number: number
  focus: string
  workouts: WorkoutDay[]
}

export interface WorkoutDay {
  day: string
  workout_name: string
  exercises: ProgramExercise[]
}

export interface ProgramExercise {
  exercise_name: string
  sets: number
  reps: string // e.g., "8-10" or "AMRAP"
  rest_seconds: number
  notes?: string
  rpe_target?: number
}

export interface AIProgramVersion {
  id: string
  user_id: string
  version_number: number
  
  program_name: string
  program_overview?: string
  duration_weeks: number
  program_data: {
    weeks: WorkoutProgramWeek[]
    progression_notes?: string
    deload_strategy?: string
  }
  
  reason_for_change?: string
  change_type: ChangeType
  
  created_at: string
  active: boolean
}

// Weekly Check-ins
export interface WeeklyCheckin {
  id: string
  user_id: string
  week_start_date: string
  week_end_date: string
  
  // Objective Data
  workouts_completed: number
  workouts_planned?: number
  total_volume?: number
  total_sets?: number
  total_reps?: number
  
  // Subjective Feedback
  overall_feeling?: number // 1-10
  recovery_quality?: number // 1-10
  energy_level?: number // 1-10
  sleep_quality?: number // 1-10
  nutrition_adherence?: number // 1-10
  stress_level?: number // 1-5
  
  // Issues
  injuries_reported?: string[]
  pain_areas?: string[]
  user_notes?: string
  
  // AI Response
  ai_feedback?: string
  program_adjustments?: {
    volume_change?: string
    intensity_change?: string
    exercise_swaps?: Array<{
      from: string
      to: string
      reason: string
    }>
    deload_recommended?: boolean
  }
  adjustment_applied: boolean
  
  created_at: string
  completed_at?: string
}

// Exercise Performance History
export interface ExercisePerformanceHistory {
  id: string
  user_id: string
  exercise_id: string
  session_id: string
  date: string
  
  best_set_weight?: number
  best_set_reps?: number
  total_volume?: number
  total_sets?: number
  average_rpe?: number
  
  form_quality_avg?: FormQuality
  difficulty_avg?: SetDifficulty
  compared_to_last_week?: 'improved' | 'maintained' | 'declined'
  
  created_at: string
}

// AI Conversations
export type ConversationRole = 'user' | 'assistant' | 'system'
export type ContextType = 'general_chat' | 'form_check' | 'injury_consultation' | 'program_modification' | 'nutrition'

export interface AIConversation {
  id: string
  user_id: string
  role: ConversationRole
  content: string
  
  context_type?: ContextType
  related_exercise_id?: string
  related_session_id?: string
  
  created_at: string
}

// Equipment Reference
export type EquipmentCategory = 'free_weights' | 'bodyweight' | 'equipment' | 'machines' | 'accessories'

export interface EquipmentTypeReference {
  id: string
  label: string
  icon: string
  category: EquipmentCategory
}

// =====================================================
// ONBOARDING FORM DATA (for UI state management)
// =====================================================

export interface OnboardingFormData {
  // Step 2: Goals
  primary_goal: PrimaryGoal | ''
  specific_goals: string
  target_date?: string
  
  // Step 3: Experience
  training_experience: TrainingExperience | ''
  years_training: number
  previous_programs: string
  
  // Step 4: Schedule
  available_days_per_week: number;
  selected_days?: string[];
  session_duration_minutes: number;
  
  // ✅ UPDATED: Removed preferred_training_times, added new fields
  preferred_workout_time?: string; // e.g. "07:00"
  reminders_enabled?: boolean;
  push_subscription_data?: any; // Optional JSON
  
  // Step 5: Equipment
  training_location: TrainingLocation | ''
  available_equipment: string[]
  
  // Step 6: Injuries
  current_injuries: Array<{
    body_part: string
    description: string
    severity: InjurySeverity
    occurred_at: string
  }>
  movement_restrictions: string
  
  // Step 7: Body Metrics
  height_cm: number
  weight_kg: number
  target_weight_kg?: number; // ✅ NEW
  body_fat_percentage?: number
  
  // Strength Stats (Optional)
  estimated_1rm?: {
    bench_press?: number;
    squat?: number;
    deadlift?: number;
    overhead_press?: number;
  };
  
  age: number
  sex: 'male' | 'female' | 'other'
  
  // Step 8: Lifestyle
  average_sleep_hours: number
  stress_level: number
  nutrition_tracking: boolean
  dietary_preferences: DietaryPreference[]
  
  // Step 9: Preferences
  coaching_style: CoachingStyle; 
  motivation_type: MotivationType;
  wants_voice_coaching: boolean;
}

export interface BodyMeasurement {
  id: string;
  user_id: string;
  measured_at: string;
  weight_kg?: number;
  body_fat_percentage?: number;
  neck_cm?: number;
  shoulders_cm?: number;
  chest_cm?: number;
  waist_cm?: number;
  hips_cm?: number;
  bicep_left_cm?: number;
  bicep_right_cm?: number;
  forearm_left_cm?: number;
  forearm_right_cm?: number;
  thigh_left_cm?: number;
  thigh_right_cm?: number;
  calf_left_cm?: number;
  calf_right_cm?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}