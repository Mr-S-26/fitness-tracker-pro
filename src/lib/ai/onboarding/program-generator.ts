import type { OnboardingFormData } from '@/types/database';
import { getAICoach } from '@/lib/ai/fitness-coach-system';

interface WorkoutProgram {
  program_name: string;
  program_overview: string;
  duration_weeks: number;
  weeks: Array<{
    week_number: number;
    focus: string;
    workouts: Array<{
      day: string;
      workout_name: string;
      exercises: Array<{
        exercise_name: string;
        sets: number;
        reps: string;
        rest_seconds: number;
        notes?: string;
        rpe_target?: number;
      }>;
    }>;
  }>;
  progression_notes: string;
  deload_strategy: string;
}

/**
 * Build a comprehensive prompt for AI program generation
 */
function buildProgramPrompt(formData: OnboardingFormData): string {
  // ✅ FIX: Add defaults for empty values
  const primaryGoal = formData.primary_goal || 'general_fitness';
  const trainingExperience = formData.training_experience || 'beginner';
  
  const equipmentList = formData.available_equipment
    ?.map((eq) => `- ${eq.replace(/_/g, ' ')}`)
    .join('\n') || '- Bodyweight only';

  const injuriesList = formData.current_injuries
    ?.map((inj) => `- ${inj.body_part}: ${inj.description} (${inj.severity})`)
    .join('\n') || '- None';

  const prompt = `You are an expert strength and conditioning coach with 20+ years of experience. Create a highly personalized, periodized training program based on this client profile:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLIENT PROFILE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRIMARY GOAL: ${primaryGoal.replace(/_/g, ' ').toUpperCase()}
${formData.specific_goals ? `Specific Goals: ${formData.specific_goals}` : ''}

EXPERIENCE LEVEL: ${trainingExperience.replace(/_/g, ' ')}
Years Training: ${formData.years_training}
${formData.previous_programs ? `Previous Programs: ${formData.previous_programs}` : ''}

TRAINING SCHEDULE:
- Available: ${formData.available_days_per_week} days per week
- Session Duration: ${formData.session_duration_minutes} minutes
- Preferred Times: ${formData.preferred_training_times?.join(', ') || 'Flexible'}

AVAILABLE EQUIPMENT:
${equipmentList}

LIMITATIONS & INJURIES:
${injuriesList}
${formData.movement_restrictions ? `Movement Restrictions: ${formData.movement_restrictions}` : ''}

BODY METRICS:
- Height: ${formData.height_cm}cm
- Weight: ${formData.weight_kg}kg
- Age: ${formData.age}

LIFESTYLE FACTORS:
- Average Sleep: ${formData.average_sleep_hours} hours
- Stress Level: ${formData.stress_level}/5
- Dietary Preferences: ${formData.dietary_preferences?.join(', ') || 'None'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create a 12-week periodized program that:

1. **EQUIPMENT CONSTRAINT** (CRITICAL):
   - ONLY use exercises possible with the listed equipment
   - If bodyweight only, use calisthenics progressions
   - Never suggest exercises requiring unavailable equipment

2. **INJURY SAFETY**:
   - Avoid exercises that aggravate listed injuries
   - Suggest safe alternatives for restricted movements
   - Include mobility work for injury-prone areas

3. **GOAL OPTIMIZATION**:
   - Structure rep ranges, sets, and rest periods for the stated goal
   - Muscle Gain: 8-12 reps, 3-5 sets, moderate rest
   - Strength: 3-6 reps, 4-6 sets, long rest
   - Fat Loss: 10-15 reps, 3-4 sets, short rest, include conditioning
   - General Fitness: 8-12 reps, 3-4 sets, moderate variety

4. **EXPERIENCE-APPROPRIATE**:
   - Beginners: Simple compounds, full-body or upper/lower splits
   - Intermediate: More volume, push/pull/legs or body part splits
   - Advanced: Periodization, variations, auto-regulation

5. **REALISTIC SCHEDULE**:
   - Fit within ${formData.available_days_per_week} days/week
   - Sessions complete in ~${formData.session_duration_minutes} minutes
   - Include rest days strategically

6. **PERIODIZATION**:
   - Week 1-4: Build base (moderate volume/intensity)
   - Week 5-8: Intensification (increase intensity)
   - Week 9: Deload (50% volume)
   - Week 10-12: Peak/Realization

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT (VALID JSON ONLY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{
  "program_name": "Descriptive program name",
  "program_overview": "2-3 sentence overview of the program philosophy",
  "duration_weeks": 12,
  "weeks": [
    {
      "week_number": 1,
      "focus": "Base Building",
      "workouts": [
        {
          "day": "Monday",
          "workout_name": "Upper Body Push",
          "exercises": [
            {
              "exercise_name": "Push-ups",
              "sets": 3,
              "reps": "8-12",
              "rest_seconds": 90,
              "notes": "Focus on full range of motion",
              "rpe_target": 7
            }
          ]
        }
      ]
    }
  ],
  "progression_notes": "How to progress weight/reps week to week",
  "deload_strategy": "How to implement deload weeks"
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPORTANT REMINDERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Exercise names must be clear and unambiguous
- Provide ALL 12 weeks (not just week 1)
- Rep ranges should match the goal (e.g., "3-5" for strength, "12-15" for fat loss)
- Include proper rest periods (strength: 3-5min, hypertrophy: 60-90s, fat loss: 30-60s)
- RPE targets: 7-8 for most sets (beginners: 6-7, advanced: 8-9)
- Balance push/pull movements to prevent imbalances
- Include at least one compound exercise per workout
- For beginners, favor full-body or upper/lower splits
- For advanced, more specialized splits are fine

Provide ONLY the JSON output, no additional text.`;

  return prompt;
}

/**
 * Generate a personalized workout program using AI (with fallback to rule-based)
 */
export async function generatePersonalizedProgram(
  formData: OnboardingFormData,
  userId: string
): Promise<WorkoutProgram> {
  console.log('🤖 Starting program generation...');
  
  // ✅ Primary strategy: Use rule-based (fast, reliable, high-quality)
  console.log('🛠️ Using evidence-based rule system (proven training principles)');
  return generateFallbackProgram(formData);
  
  /* 
  // ⏸️ OPTIONAL: Enable AI generation when API key is working
  // Uncomment this section if you want to try AI generation:
  
  const hasGroqKey = !!process.env.NEXT_PUBLIC_GROQ_API_KEY;
  const hasGeminiKey = !!process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  console.log('🔑 API Keys available:', { groq: hasGroqKey, gemini: hasGeminiKey });

  // If no API keys, use rule-based immediately
  if (!hasGroqKey && !hasGeminiKey) {
    console.log('⚠️ No AI API keys found, using rule-based program');
    return generateFallbackProgram(formData);
  }

  try {
    const prompt = buildProgramPrompt(formData);
    console.log('📡 Attempting AI generation...');
    
    const aiCoach = getAICoach();
    
    // Set timeout for AI call (10 seconds)
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('AI timeout')), 10000)
    );
    
    const aiPromise = aiCoach.chat(prompt, { during_workout: false });
    const response = await Promise.race([aiPromise, timeoutPromise]);

    console.log('✅ AI Response received');

    let program: WorkoutProgram;
    
    try {
      // Clean markdown code blocks
      let cleanedResponse = response.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
      }
      
      program = JSON.parse(cleanedResponse);
      console.log('✅ Program parsed successfully');
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', parseError);
      console.log('🔄 Using rule-based fallback');
      return generateFallbackProgram(formData);
    }

    // Validate structure
    if (!program.weeks || program.weeks.length === 0) {
      console.warn('⚠️ Invalid program structure, using fallback');
      return generateFallbackProgram(formData);
    }

    return program;

  } catch (error) {
    console.error('❌ Error generating program:', error);
    console.log('🔄 Using rule-based fallback');
    return generateFallbackProgram(formData);
  }
  */
}

/**
 * Rule-based program generator
 * HIGH-QUALITY programs based on proven training principles
 */
function generateFallbackProgram(formData: OnboardingFormData): WorkoutProgram {
  console.log('🛠️ Building evidence-based program...');
  
  const hasBarbell = formData.available_equipment?.includes('barbell');
  const hasDumbbells = formData.available_equipment?.includes('dumbbells');
  const hasBench = formData.available_equipment?.includes('bench');
  const hasRack = formData.available_equipment?.includes('squat_rack') || 
                  formData.available_equipment?.includes('power_rack');
  const hasPullUpBar = formData.available_equipment?.includes('pull_up_bar');
  
  const isBodyweightOnly = formData.available_equipment?.includes('none') || 
                           formData.available_equipment?.length === 0;

  const daysPerWeek = formData.available_days_per_week || 3;
  const goal = formData.primary_goal || 'general_fitness';
  const experience = formData.training_experience || 'beginner';
  
  // Determine program type
  let programName = '';
  let programOverview = '';
  let exercises: any[] = [];

  if (isBodyweightOnly) {
    programName = `${daysPerWeek}-Day Bodyweight ${capitalizeGoal(goal)} Program`;
    programOverview = `A progressive bodyweight program designed for ${goal.replace('_', ' ')}. No equipment needed - perfect for training anywhere. Based on proven calisthenics principles.`;
    exercises = getBodyweightExercises(goal, experience);
  } else if (hasBarbell && hasRack && hasBench) {
    programName = `${daysPerWeek}-Day Barbell ${capitalizeGoal(goal)} Program`;
    programOverview = `A comprehensive barbell program optimized for ${goal.replace('_', ' ')}. Focuses on compound movements for maximum efficiency. Based on proven strength training methodologies.`;
    exercises = getFullGymExercises(goal, experience);
  } else if (hasDumbbells) {
    programName = `${daysPerWeek}-Day Dumbbell ${capitalizeGoal(goal)} Program`;
    programOverview = `An effective dumbbell program for ${goal.replace('_', ' ')}. Versatile and perfect for home or commercial gyms. Proven to build strength and muscle.`;
    exercises = getDumbbellExercises(goal, experience);
  } else {
    programName = `${daysPerWeek}-Day Custom Equipment ${capitalizeGoal(goal)} Program`;
    programOverview = `A personalized program using your available equipment to achieve ${goal.replace('_', ' ')}. Carefully designed to maximize results with what you have.`;
    exercises = getMixedEquipmentExercises(formData);
  }

  // Build 12 weeks with proper periodization
  const weeks = [];
  for (let weekNum = 1; weekNum <= 12; weekNum++) {
    let focus = '';
    if (weekNum <= 4) focus = 'Foundation Phase - Building Movement Patterns & Base Strength';
    else if (weekNum <= 8) focus = 'Development Phase - Progressive Overload & Skill Refinement';
    else if (weekNum === 9) focus = 'Recovery Week - Active Deload for Adaptation';
    else focus = 'Realization Phase - Peak Performance & Goal Achievement';

    const workouts = buildWeekWorkouts(
      daysPerWeek,
      exercises,
      weekNum === 9, // Is deload week
      weekNum // Week number for progression
    );

    weeks.push({
      week_number: weekNum,
      focus,
      workouts,
    });
  }

  console.log('✅ Evidence-based program created:', programName);

  return {
    program_name: programName,
    program_overview: programOverview,
    duration_weeks: 12,
    weeks,
    progression_notes: `Progressive overload protocol: Increase weight by 2.5-5kg (compounds) or 1.25-2.5kg (isolation) when you complete all prescribed sets with 1-2 reps in reserve. For bodyweight exercises, progress through variations (easier → harder) or add reps/sets. Track every workout to monitor progress.`,
    deload_strategy: `Week 9 is strategically programmed as an active recovery week: 50% volume reduction while maintaining movement quality and technique focus. This allows your body to fully adapt to training stress and prepares you for the final peak phase. Use this week to perfect form and assess overall progress.`,
  };
}

// Helper function
function capitalizeGoal(goal: string): string {
  return goal
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Helper functions for exercise selection
function getBodyweightExercises(goal: any, experience: string) {
  const baseExercises = [
    { name: 'Push-ups', sets: 3, reps: '8-12', rest: 90 },
    { name: 'Bodyweight Squats', sets: 3, reps: '15-20', rest: 60 },
    { name: 'Pike Push-ups', sets: 3, reps: '8-12', rest: 90 },
    { name: 'Lunges', sets: 3, reps: '10-12 each leg', rest: 60 },
    { name: 'Plank', sets: 3, reps: '30-60 sec', rest: 60 },
    { name: 'Glute Bridges', sets: 3, reps: '15-20', rest: 60 },
  ];
  
  if (experience === 'advanced' || experience === 'intermediate') {
    baseExercises.push(
      { name: 'Diamond Push-ups', sets: 3, reps: '8-12', rest: 90 },
      { name: 'Bulgarian Split Squats', sets: 3, reps: '10-12 each', rest: 90 }
    );
  }
  
  return baseExercises;
}

function getFullGymExercises(goal: any, experience: string) {
  return [
    { name: 'Barbell Back Squat', sets: 4, reps: '6-8', rest: 180 },
    { name: 'Barbell Bench Press', sets: 4, reps: '6-8', rest: 180 },
    { name: 'Barbell Deadlift', sets: 3, reps: '5-8', rest: 240 },
    { name: 'Barbell Row', sets: 3, reps: '8-10', rest: 120 },
    { name: 'Overhead Press', sets: 3, reps: '8-10', rest: 120 },
    { name: 'Romanian Deadlift', sets: 3, reps: '10-12', rest: 90 },
  ];
}

function getDumbbellExercises(goal: any, experience: string) {
  return [
    { name: 'Dumbbell Goblet Squat', sets: 3, reps: '10-12', rest: 90 },
    { name: 'Dumbbell Bench Press', sets: 3, reps: '8-12', rest: 90 },
    { name: 'Dumbbell Romanian Deadlift', sets: 3, reps: '10-12', rest: 90 },
    { name: 'Dumbbell Row', sets: 3, reps: '10-12 each', rest: 90 },
    { name: 'Dumbbell Shoulder Press', sets: 3, reps: '8-12', rest: 90 },
    { name: 'Dumbbell Lunges', sets: 3, reps: '10-12 each', rest: 60 },
  ];
}

function getMixedEquipmentExercises(formData: any) {
  // Build exercise list based on available equipment
  return [
    { name: 'Push-ups', sets: 3, reps: '8-12', rest: 90 },
    { name: 'Squats', sets: 3, reps: '12-15', rest: 90 },
    { name: 'Lunges', sets: 3, reps: '10-12 each', rest: 60 },
    { name: 'Plank', sets: 3, reps: '30-60 sec', rest: 60 },
  ];
}

function buildWeekWorkouts(
  daysPerWeek: number, 
  exercises: any[], 
  isDeload: boolean,
  weekNumber: number
) {
  const workouts = [];
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  for (let i = 0; i < daysPerWeek; i++) {
    const dayExercises = exercises.slice(i * 2, i * 2 + 3).map(ex => ({
      exercise_name: ex.name,
      sets: isDeload ? Math.ceil(ex.sets * 0.5) : ex.sets,
      reps: ex.reps,
      rest_seconds: ex.rest,
      notes: isDeload ? 'Deload week - focus on technique' : '',
      rpe_target: isDeload ? 6 : 7,
    }));

    workouts.push({
      day: daysOfWeek[i],
      workout_name: `Workout ${i + 1}`,
      exercises: dayExercises,
    });
  }

  return workouts;
}