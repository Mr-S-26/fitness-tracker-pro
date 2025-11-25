// src/lib/ai/fitness-coach-system.ts
/**
 * Advanced AI Fitness Coach System
 * A complete AI personal trainer that coaches like a human expert
 */

import { createClient } from '@/lib/supabase/client'

// =====================================================
// TYPE DEFINITIONS
// =====================================================

interface UserProfile {
  id: string;
  name?: string;
  age?: number;
  weight?: number;
  height?: number;
  experience_level?: 'beginner' | 'intermediate' | 'advanced' | 'elite';
  goals?: string[];
  injuries?: string[];
  recentWorkouts?: WorkoutSession[];
  activeInjuries?: Injury[];
}

interface WorkoutSession {
  id: string;
  user_id: string;
  started_at: string;
  ended_at?: string;
  workout_name?: string;
  notes?: string;
}

interface Injury {
  id: string;
  user_id: string;
  body_part: string;
  description: string;
  active: boolean;
  occurred_at: string;
}

interface WorkoutSet {
  set_number: number;
  target_reps: number;
  actual_reps: number;
  weight: number;
  rpe?: number;
  difficulty?: string;
  form_quality?: string;
  tempo?: string;
  notes?: string;
}

interface CoachMemoryItem {
  timestamp: string;
  type: string;
  data: unknown;
}

interface PerformanceMetrics {
  total_volume: number;
  average_rpe: number;
  completion_rate: number;
  form_quality_avg: number;
}

interface ChatContext {
  during_workout?: boolean;
  current_exercise?: string;
}

interface ProgramAdjustments {
  volume_change?: string;
  intensity_change?: string;
  frequency_change?: string;
  exercise_swaps?: Array<{ from: string; to: string; reason: string }>;
  deload_recommendation?: boolean;
}

// =====================================================
// AI COACH PERSONALITY & EXPERTISE
// =====================================================

const COACH_SYSTEM_PROMPT = `You are an elite personal fitness coach with 20+ years of experience. You have:

CREDENTIALS:
- CSCS (Certified Strength & Conditioning Specialist)
- NASM-CPT (Personal Trainer Certification)
- Precision Nutrition Level 2 Coach
- Physical Therapy background
- Experience training Olympic athletes and beginners

PERSONALITY:
- Motivating but honest
- Evidence-based approach
- Safety-first mindset
- Adaptive to user's experience level
- Encouraging without being cheesy
- Direct and actionable advice

KNOWLEDGE AREAS:
- Exercise biomechanics and form
- Progressive overload principles
- Periodization and programming
- Injury prevention and rehabilitation
- Nutrition for performance
- Recovery and sleep optimization
- Supplement science
- Mental aspects of training

COACHING STYLE:
- Ask clarifying questions when needed
- Provide specific, actionable advice
- Explain the "why" behind recommendations
- Adapt language to user's experience
- Celebrate wins appropriately
- Address concerns with empathy
- Push when appropriate, pull back when needed

Remember: You're not just logging workouts, you're actively coaching someone to achieve their goals safely and efficiently.`

// =====================================================
// COMPREHENSIVE AI COACH CLASS
// =====================================================

export class AIFitnessCoachSystem {
  private supabase = createClient()
  private conversationContext: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = []
  private userProfile: UserProfile | null = null
  private currentWorkout: WorkoutSession | null = null
  private coachMemory: Map<string, CoachMemoryItem> = new Map()

  constructor() {
    this.initializeCoach()
  }

  private async initializeCoach() {
    // Load user profile and history for context
    await this.loadUserContext()
  }

  private async loadUserContext() {
    // Load user's training history, goals, injuries, etc.
    const { data: { user } } = await this.supabase.auth.getUser()
    if (user) {
      const { data: profile } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      const { data: recentWorkouts } = await this.supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(10)

      const { data: injuries } = await this.supabase
        .from('user_injuries')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true)

      this.userProfile = {
        ...profile,
        recentWorkouts: recentWorkouts || [],
        activeInjuries: injuries || []
      } as UserProfile
    }
  }

  // =====================================================
  // MAIN COACHING INTERACTIONS
  // =====================================================

  /**
   * Initial consultation - like meeting a real trainer
   */
  async initialConsultation(): Promise<{
    questions: string[]
    assessments: string[]
    recommendations: string
  }> {
    const prompt = `A new client just signed up. Conduct an initial consultation to understand:
    1. Fitness goals (specific and measurable)
    2. Training experience and current fitness level
    3. Injury history and current limitations
    4. Available equipment and time commitment
    5. Nutrition habits and lifestyle factors
    6. Previous training programs (what worked/didn't work)
    
    Provide:
    - Key questions to ask (conversational, not form-like)
    - Physical assessments to recommend
    - Initial program recommendations based on common patterns`

    const response = await this.callAI(prompt, COACH_SYSTEM_PROMPT)
    return JSON.parse(response)
  }

  /**
   * Real-time workout coaching - like having a trainer beside you
   */
  async coachWorkoutInProgress(params: {
    exercise: string
    setNumber: number
    previousSets: WorkoutSet[]
    currentWeight: number
    targetReps: number
    videoTimestamp?: number
  }): Promise<{
    preSetCoaching: string      // What to focus on before starting
    duringSetCues: string[]      // Cues to think about during the set
    breathingPattern: string     // When to inhale/exhale
    motivationalCue: string      // Quick motivation
  }> {
    const prompt = `The athlete is about to perform:
    Exercise: ${params.exercise}
    Set ${params.setNumber} of their workout
    Target: ${params.targetReps} reps @ ${params.currentWeight}kg
    
    Previous sets today:
    ${params.previousSets.map((s, i) => 
      `Set ${i+1}: ${s.actual_reps}/${s.target_reps} reps @ ${s.weight}kg - ${s.difficulty}`
    ).join('\n')}
    
    Provide real-time coaching as if you're standing next to them:
    1. Pre-set coaching - What to think about before starting (setup, mental cues)
    2. During-set cues - 2-3 simple cues to focus on during the lift
    3. Breathing pattern - Specific to this exercise
    4. Motivational cue - Short, specific to their performance trend
    
    Consider fatigue accumulation and adjust coaching accordingly.`

    const response = await this.callAI(prompt, COACH_SYSTEM_PROMPT)
    return JSON.parse(response)
  }

  /**
   * Post-set analysis and adjustment - immediate feedback
   */
  async analyzeSetPerformance(params: {
    exercise: string
    setJustCompleted: {
      target_reps: number
      actual_reps: number
      weight: number
      rpe: number
      form_quality: string
      tempo: string
      notes?: string
    }
    allSets: WorkoutSet[]
    nextSetPlanned: WorkoutSet
  }): Promise<{
    performance_analysis: string
    form_feedback: string
    next_set_adjustment: {
      weight: number
      reps: number
      rest: number
      reasoning: string
    }
    technique_correction?: string
    warning_signs?: string
  }> {
    const prompt = `Analyze the set that was just completed:
    
    Exercise: ${params.exercise}
    Performance: ${params.setJustCompleted.actual_reps}/${params.setJustCompleted.target_reps} reps @ ${params.setJustCompleted.weight}kg
    RPE: ${params.setJustCompleted.rpe}/10
    Form: ${params.setJustCompleted.form_quality}
    
    All sets so far: ${JSON.stringify(params.allSets)}
    Next set planned: ${JSON.stringify(params.nextSetPlanned)}
    
    Provide expert analysis:
    1. Performance analysis - What this performance indicates
    2. Form feedback - Based on reported form quality
    3. Next set adjustment - Specific weight/rep/rest changes with reasoning
    4. Technique correction - If form issues detected
    5. Warning signs - If seeing concerning patterns (excessive fatigue, form breakdown, etc.)
    
    Be specific and actionable. Consider cumulative fatigue and safety.`

    const response = await this.callAI(prompt, COACH_SYSTEM_PROMPT)
    return JSON.parse(response)
  }

  /**
   * Live form check - analyze technique description or video
   */
  async checkForm(params: {
    exercise: string
    userDescription?: string
    commonIssues?: string[]
    videoFrameDescription?: string
    experience_level: string
  }): Promise<{
    form_analysis: string
    danger_points: string[]
    cues_to_fix: string[]
    drill_recommendations: string[]
    visual_demo?: string
  }> {
    const prompt = `Provide expert form analysis for ${params.exercise}:
    
    User's experience: ${params.experience_level}
    ${params.userDescription ? `User reports: ${params.userDescription}` : ''}
    ${params.commonIssues ? `Common issues observed: ${params.commonIssues.join(', ')}` : ''}
    
    Analyze and provide:
    1. Form analysis - What's likely happening
    2. Danger points - Specific injury risks
    3. Cues to fix - 2-3 actionable cues
    4. Drill recommendations - Exercises to improve form
    5. Visual demo description - How to practice the movement
    
    Focus on safety and progressive improvement.`

    const response = await this.callAI(prompt, COACH_SYSTEM_PROMPT)
    return JSON.parse(response)
  }

  /**
   * General chat with coach - conversational AI trainer
   */
  async chat(message: string, context?: ChatContext): Promise<string> {
    let fullPrompt = message

    if (context?.during_workout && context?.current_exercise) {
      fullPrompt = `[During workout - ${context.current_exercise}] ${message}`
    }

    // Add recent conversation context
    const recentContext = this.conversationContext.slice(-5)
    if (recentContext.length > 0) {
      const contextStr = recentContext
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n')
      fullPrompt = `${contextStr}\n\nuser: ${fullPrompt}`
    }

    const response = await this.callAI(fullPrompt, COACH_SYSTEM_PROMPT)

    // Store in conversation context
    this.conversationContext.push(
      { role: 'user', content: message },
      { role: 'assistant', content: response }
    )

    return response
  }

  /**
   * Design a complete program
   */
  async designProgram(params: {
    goal: string
    experience: string
    equipment: string[]
    frequency: number
    duration_weeks: number
    limitations?: string[]
  }): Promise<{
    program_name: string
    overview: string
    weeks: Array<{
      week_number: number
      focus: string
      workouts: Array<{
        day: string
        exercises: Array<{
          exercise: string
          sets: number
          reps: string
          rest: number
          notes?: string
        }>
      }>
    }>
    progression_strategy: string
    nutrition_guidelines: string
  }> {
    const prompt = `Design a complete ${params.duration_weeks}-week training program:
    
    Goal: ${params.goal}
    Experience: ${params.experience}
    Equipment: ${params.equipment.join(', ')}
    Training frequency: ${params.frequency} days/week
    ${params.limitations ? `Limitations: ${params.limitations.join(', ')}` : ''}
    
    Create a professional program with:
    1. Program name and overview
    2. Week-by-week breakdown
    3. Specific exercises, sets, reps, rest periods
    4. Progression strategy
    5. Basic nutrition guidelines
    
    Make it actionable and progressive.`

    const response = await this.callAI(prompt, COACH_SYSTEM_PROMPT)
    return JSON.parse(response)
  }

  /**
   * Nutrition coaching
   */
  async getNutritionAdvice(params: {
    goal: 'muscle_gain' | 'fat_loss' | 'performance' | 'maintenance'
    current_weight: number
    activity_level: string
    dietary_restrictions?: string[]
    meal_preferences?: string[]
  }): Promise<{
    daily_calories: number
    macros: {
      protein_grams: number
      carbs_grams: number
      fat_grams: number
    }
    meal_timing: string
    food_recommendations: string[]
    supplement_suggestions?: string[]
    hydration_guidelines: string
  }> {
    const prompt = `Provide nutrition coaching for:
    
    Goal: ${params.goal}
    Current weight: ${params.current_weight}kg
    Activity level: ${params.activity_level}
    ${params.dietary_restrictions ? `Dietary restrictions: ${params.dietary_restrictions.join(', ')}` : ''}
    ${params.meal_preferences ? `Meal preferences: ${params.meal_preferences.join(', ')}` : ''}
    
    Provide:
    1. Daily calorie target
    2. Macro breakdown (protein, carbs, fat in grams)
    3. Meal timing strategy
    4. Specific food recommendations
    5. Supplement suggestions (evidence-based only)
    6. Hydration guidelines
    
    Base recommendations on current science and practical application.`

    const response = await this.callAI(prompt, COACH_SYSTEM_PROMPT)
    return JSON.parse(response)
  }

  /**
   * Recovery and injury prevention
   */
  async getRecoveryAdvice(params: {
    recent_workouts: WorkoutSession[]
    soreness_level: number
    sleep_quality: number
    stress_level: number
    upcoming_workout?: string
  }): Promise<{
    recovery_status: 'excellent' | 'good' | 'moderate' | 'poor'
    recommendation: string
    active_recovery_suggestions: string[]
    sleep_optimization: string[]
    should_modify_workout: boolean
    modification_details?: string
  }> {
    const prompt = `Assess recovery status and provide guidance:
    
    Recent training: ${params.recent_workouts.length} workouts
    Soreness: ${params.soreness_level}/10
    Sleep quality: ${params.sleep_quality}/10
    Stress: ${params.stress_level}/10
    ${params.upcoming_workout ? `Next workout: ${params.upcoming_workout}` : ''}
    
    Analyze and recommend:
    1. Overall recovery status
    2. Training recommendation (proceed/modify/rest)
    3. Active recovery suggestions
    4. Sleep optimization tips
    5. Workout modifications if needed
    
    Prioritize long-term progress over short-term gains.`

    const response = await this.callAI(prompt, COACH_SYSTEM_PROMPT)
    return JSON.parse(response)
  }

  /**
   * Weekly check-in and program adjustments
   */
  async weeklyCheckIn(params: {
    week_number: number
    workouts_completed: WorkoutSession[]
    missed_sessions: number
    average_performance: PerformanceMetrics
    subjective_feedback?: string
    body_measurements?: Record<string, number>
  }): Promise<{
    week_summary: string
    performance_analysis: string
    program_adjustments: ProgramAdjustments
    next_week_focus: string[]
    celebration_points: string[]
    concern_areas?: string[]
    coach_questions: string[]
  }> {
    const prompt = `Conduct a thorough weekly training review:
    
    Week ${params.week_number} Summary:
    - Workouts completed: ${params.workouts_completed.length}
    - Missed sessions: ${params.missed_sessions}
    - Average performance: ${JSON.stringify(params.average_performance)}
    ${params.subjective_feedback ? `- Athlete feedback: ${params.subjective_feedback}` : ''}
    ${params.body_measurements ? `- Measurements: ${JSON.stringify(params.body_measurements)}` : ''}
    
    Provide professional weekly review:
    1. Week summary - Overall assessment
    2. Performance analysis - Detailed breakdown of progress
    3. Program adjustments - Specific changes for next week
    4. Next week focus - 3-5 key points
    5. Celebration points - Wins to acknowledge
    6. Concern areas - Issues to address
    7. Coach questions - Important questions to ask athlete
    
    Balance encouragement with honest assessment.`

    const response = await this.callAI(prompt, COACH_SYSTEM_PROMPT)
    return JSON.parse(response)
  }

  // =====================================================
  // AI PROVIDER METHODS
  // =====================================================

  private async callAI(prompt: string, systemPrompt: string): Promise<string> {
    // Try multiple providers with fallback
    const providers = [
      () => this.callGroq(prompt, systemPrompt),
      () => this.callGemini(prompt, systemPrompt),
      () => this.callOllama(prompt, systemPrompt),
    ]

    for (const provider of providers) {
      try {
        return await provider()
      } catch (error) {
        console.log('Provider failed, trying next...', error)
        continue
      }
    }

    // All providers failed - return a helpful response
    return JSON.stringify({
      error: "AI coaching temporarily unavailable",
      fallback: "Continue with your planned workout. Focus on good form and listen to your body.",
      suggestion: "Try enabling offline mode or checking your API keys."
    })
  }

 private async callGroq(prompt: string, systemPrompt: string): Promise<string> {
  if (!process.env.NEXT_PUBLIC_GROQ_API_KEY) {
    throw new Error('Groq API key not configured')
  }

  console.log('📡 Calling Groq API...');
  console.log('🔑 API Key present:', !!process.env.NEXT_PUBLIC_GROQ_API_KEY);
  console.log('📝 Prompt length:', prompt.length);

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      })
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response ok:', response.ok);

    if (!response.ok) {
      // ✅ FIX: Better error handling
      let errorMessage = `Groq API error: ${response.status}`;
      try {
        const errorData = await response.text(); // Use .text() instead of .json()
        console.error('❌ Groq API Error Response:', errorData);
        errorMessage += ` - ${errorData}`;
      } catch (parseError) {
        console.error('❌ Could not parse error response');
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('✅ Groq API Success');
    
    const content = data.choices[0].message.content;
    
    // Store in conversation context
    this.conversationContext.push(
      { role: 'user', content: prompt },
      { role: 'assistant', content: content }
    );

    return content;
  } catch (error) {
    console.error('❌ Groq API call failed:', error);
    throw error;
  }
}

  private async callGemini(prompt: string, systemPrompt: string): Promise<string> {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured')
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\n${prompt}\n\nProvide response as valid JSON.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000,
          }
        })
      }
    )

    if (!response.ok) {
      throw new Error('Gemini API error')
    }

    const data = await response.json()
    return data.candidates[0].content.parts[0].text
  }

  private async callOllama(prompt: string, systemPrompt: string): Promise<string> {
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.2', // or 'mistral' or 'phi'
          prompt: `${systemPrompt}\n\n${prompt}\n\nProvide response as valid JSON.`,
          stream: false,
          format: 'json'
        })
      })

      if (!response.ok) {
        throw new Error('Ollama not running')
      }

      const data = await response.json()
      return data.response
    } catch (error) {
      throw new Error('Ollama not available - run "ollama serve"')
    }
  }

  // =====================================================
  // VOICE COACHING (Future Feature)
  // =====================================================

  async generateVoiceCoaching(text: string): Promise<string> {
    // This could integrate with browser's speech synthesis
    // or external TTS services (ElevenLabs, etc.)
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.1
      utterance.pitch = 0.9
      window.speechSynthesis.speak(utterance)
      return 'Speaking...'
    }
    return 'Voice not available'
  }
}

// =====================================================
// EXPORTED HOOKS AND UTILITIES
// =====================================================

let coachInstance: AIFitnessCoachSystem | null = null

export function getAICoach(): AIFitnessCoachSystem {
  if (!coachInstance) {
    coachInstance = new AIFitnessCoachSystem()
  }
  return coachInstance
}

export function useAIFitnessCoach() {
  return getAICoach()
}

// Quick coaching functions for common needs
export const QuickCoach = {
  async shouldIWorkoutToday(params: {
    fatigue: number,
    soreness: number,
    lastWorkout: Date,
    plannedWorkout: string
  }): Promise<{ decision: boolean, reasoning: string, alternative?: string }> {
    const coach = getAICoach()
    const response = await coach.chat(
      `Fatigue: ${params.fatigue}/10, Soreness: ${params.soreness}/10. 
      Last workout: ${params.lastWorkout}. 
      Planned: ${params.plannedWorkout}. 
      Should I train today?`,
      { during_workout: false }
    )
    return JSON.parse(response)
  },

  async quickFormCheck(exercise: string, issue: string): Promise<string> {
    const coach = getAICoach()
    return await coach.chat(
      `Quick form check: ${exercise}. Issue: ${issue}. Give me one key cue to fix this.`,
      { during_workout: true, current_exercise: exercise }
    )
  },

  async getMotivation(context: string): Promise<string> {
    const coach = getAICoach()
    return await coach.chat(
      `Need motivation. Context: ${context}. Give me a short, powerful message.`,
      { during_workout: true }
    )
  }
}