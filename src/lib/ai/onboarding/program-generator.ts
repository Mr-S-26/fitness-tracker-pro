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
 * Generate a personalized workout program using AI
 */
export async function generatePersonalizedProgram(
  formData: OnboardingFormData,
  userId: string
): Promise<WorkoutProgram> {
  try {
    // Build the prompt
    const prompt = buildProgramPrompt(formData);

    // Call AI
    const aiCoach = getAICoach();
    
    console.log('🤖 Generating program with AI...');
    
    // Use the AI coach to generate program
    const response = await aiCoach.chat(prompt, {
      during_workout: false,
    });

    console.log('✅ AI Response received');

    // Parse response (AI should return JSON)
    let program: WorkoutProgram;
    
    try {
      // Remove markdown code blocks if present
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
      console.log('Raw response:', response);
      
      // Fallback to rule-based program
      console.log('🔄 Using rule-based fallback program');
      program = generateFallbackProgram(formData);
    }

    // Validate program structure
    if (!program.weeks || program.weeks.length === 0) {
      console.warn('⚠️ Invalid program structure, using fallback');
      program = generateFallbackProgram(formData);
    }

    return program;

  } catch (error) {
    console.error('❌ Error generating program:', error);
    
    // Return fallback program
    return generateFallbackProgram(formData);
  }
}

/**
 * Fallback program generator (rule-based)
 * Used when AI fails or for guaranteed baseline
 */
function generateFallbackProgram(formData: OnboardingFormData): WorkoutProgram {
  const hasBarbell = formData.available_equipment?.includes('barbell');
  const hasDumbbells = formData.available_equipment?.includes('dumbbells');
  const hasBench = formData.available_equipment?.includes('bench');
  const hasRack = formData.available_equipment?.includes('squat_rack') || 
                  formData.available_equipment?.includes('power_rack');
  
  const isBodyweightOnly = formData.available_equipment?.includes('none') || 
                           formData.available_equipment?.length === 0;

  const daysPerWeek = formData.available_days_per_week;
  
  // Determine program type based on goal and equipment
  let programName = '';
  let exercises: any[] = [];

  if (isBodyweightOnly) {
    programName = `${daysPerWeek}-Day Bodyweight Training Program`;
    exercises = getBodyweightExercises(formData.primary_goal);
  } else if (hasBarbell && hasRack && hasBench) {
    programName = `${daysPerWeek}-Day Full Gym Program`;
    exercises = getFullGymExercises(formData.primary_goal);
  } else if (hasDumbbells) {
    programName = `${daysPerWeek}-Day Dumbbell Program`;
    exercises = getDumbbellExercises(formData.primary_goal);
  } else {
    programName = `${daysPerWeek}-Day Limited Equipment Program`;
    exercises = getMixedEquipmentExercises(formData);
  }

  // Build weeks
  const weeks = [];
  for (let weekNum = 1; weekNum <= 12; weekNum++) {
    let focus = '';
    if (weekNum <= 4) focus = 'Foundation Phase';
    else if (weekNum <= 8) focus = 'Progressive Overload';
    else if (weekNum === 9) focus = 'Deload Week';
    else focus = 'Peak Performance';

    const workouts = buildWeekWorkouts(
      daysPerWeek,
      exercises,
      weekNum === 9 // Is deload week
    );

    weeks.push({
      week_number: weekNum,
      focus,
      workouts,
    });
  }

  return {
    program_name: programName,
    program_overview: `A ${daysPerWeek}-day per week program designed for ${formData.primary_goal?.replace('_', ' ')} using your available equipment. Progressive overload built in with strategic deload.`,
    duration_weeks: 12,
    weeks,
    progression_notes: 'Add 2.5-5kg to compound lifts when you hit the top of the rep range with good form. For bodyweight, progress to harder variations.',
    deload_strategy: 'Week 9 is a deload: reduce volume by 50%, keep intensity moderate, focus on technique and recovery.',
  };
}

// Helper functions for fallback program
function getBodyweightExercises(goal: any) {
  return [
    { name: 'Push-ups', sets: 3, reps: '8-12', rest: 90 },
    { name: 'Bodyweight Squats', sets: 3, reps: '12-15', rest: 60 },
    { name: 'Pike Push-ups', sets: 3, reps: '8-12', rest: 90 },
    { name: 'Lunges', sets: 3, reps: '10-12 each', rest: 60 },
    { name: 'Plank', sets: 3, reps: '30-60 sec', rest: 60 },
  ];
}

function getFullGymExercises(goal: any) {
  return [
    { name: 'Barbell Back Squat', sets: 4, reps: '6-8', rest: 180 },
    { name: 'Barbell Bench Press', sets: 4, reps: '6-8', rest: 180 },
    { name: 'Barbell Deadlift', sets: 3, reps: '5-8', rest: 240 },
    { name: 'Barbell Row', sets: 3, reps: '8-10', rest: 120 },
    { name: 'Overhead Press', sets: 3, reps: '8-10', rest: 120 },
  ];
}

function getDumbbellExercises(goal: any) {
  return [
    { name: 'Dumbbell Goblet Squat', sets: 3, reps: '10-12', rest: 90 },
    { name: 'Dumbbell Bench Press', sets: 3, reps: '8-12', rest: 90 },
    { name: 'Dumbbell Romanian Deadlift', sets: 3, reps: '10-12', rest: 90 },
    { name: 'Dumbbell Row', sets: 3, reps: '10-12', rest: 90 },
    { name: 'Dumbbell Shoulder Press', sets: 3, reps: '8-12', rest: 90 },
  ];
}

function getMixedEquipmentExercises(formData: any) {
  // Build exercise list based on available equipment
  return [
    { name: 'Push-ups', sets: 3, reps: '8-12', rest: 90 },
    { name: 'Squats', sets: 3, reps: '12-15', rest: 90 },
    { name: 'Lunges', sets: 3, reps: '10-12', rest: 60 },
  ];
}

function buildWeekWorkouts(daysPerWeek: number, exercises: any[], isDeload: boolean) {
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