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

// AI Suggestion structure - what the AI coach recommends for the next set
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

export interface SetLog {
  id: string
  weight: number
  target_reps: number
  actual_reps: number
  difficulty: SetDifficulty
  form: FormQuality
  rpe: number
  ai_suggestion?: AISuggestion  // ✅ Now properly typed instead of 'any'
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