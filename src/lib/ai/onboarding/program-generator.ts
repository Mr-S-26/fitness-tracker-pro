import type { OnboardingFormData } from '@/types/database';
// import { getAICoach } from '@/lib/ai/fitness-coach-system'; // Keep commented if not using AI yet
import { calculateNutritionPlan } from '@/lib/nutrition/macro-calculator';

// Define the structure of the workout program
export interface WorkoutProgram {
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

// Combined return type for the UI
export interface GeneratedPlan {
  program: WorkoutProgram;
  nutrition: any;
}

/**
 * Generate a personalized workout program AND nutrition plan
 */
export async function generatePersonalizedProgram(
  formData: OnboardingFormData,
  userId: string
): Promise<GeneratedPlan> {
  console.log('🤖 Starting full plan generation...');
  
  // 1. Generate Workout (Using the robust rule-based system)
  console.log('🛠️ Generating workout program...');
  const program = generateFallbackProgram(formData);

  // 2. Generate Nutrition (Using the new calculator)
  console.log('🥗 Calculating nutrition plan...');
  const nutrition = calculateNutritionPlan(formData);

  // 3. Return both to the UI
  return {
    program,
    nutrition
  };
}

/**
 * Rule-based program generator
 * HIGH-QUALITY programs based on proven training principles
 */
function generateFallbackProgram(formData: OnboardingFormData): WorkoutProgram {
  console.log('🛠️ Building evidence-based program...');
  
  const isBodyweightOnly = formData.available_equipment?.includes('none') || 
                           formData.available_equipment?.length === 0;
  const hasBarbell = formData.available_equipment?.includes('barbell');
  const hasDumbbells = formData.available_equipment?.includes('dumbbells');

  const daysPerWeek = formData.available_days_per_week || 3;
  const goal = formData.primary_goal || 'general_fitness';
  const experience = formData.training_experience || 'beginner';
  
  // Determine program type
  let programName = '';
  let programOverview = '';
  let exercises: any[] = [];

  if (isBodyweightOnly) {
    programName = `${daysPerWeek}-Day Bodyweight ${capitalizeGoal(goal)} Program`;
    programOverview = `A progressive bodyweight program designed for ${goal.replace('_', ' ')}. No equipment needed.`;
    exercises = getBodyweightExercises(goal, experience);
  } else if (hasBarbell) {
    programName = `${daysPerWeek}-Day Barbell ${capitalizeGoal(goal)} Program`;
    programOverview = `A comprehensive barbell program optimized for ${goal.replace('_', ' ')}.`;
    exercises = getFullGymExercises(goal, experience);
  } else if (hasDumbbells) {
    programName = `${daysPerWeek}-Day Dumbbell ${capitalizeGoal(goal)} Program`;
    programOverview = `An effective dumbbell program for ${goal.replace('_', ' ')}.`;
    exercises = getDumbbellExercises(goal, experience);
  } else {
    programName = `${daysPerWeek}-Day Mixed Equipment Program`;
    programOverview = `A balanced program using your available equipment.`;
    exercises = getMixedEquipmentExercises(formData);
  }

  // Build 12 weeks with proper periodization
  const weeks = [];
  for (let weekNum = 1; weekNum <= 12; weekNum++) {
    let focus = '';
    if (weekNum <= 4) focus = 'Foundation Phase';
    else if (weekNum <= 8) focus = 'Development Phase';
    else if (weekNum === 9) focus = 'Recovery Week';
    else focus = 'Realization Phase';

    const workouts = buildWeekWorkouts(
      daysPerWeek,
      exercises,
      weekNum === 9, // Is deload week
      weekNum
    );

    weeks.push({
      week_number: weekNum,
      focus,
      workouts,
    });
  }

  return {
    program_name: programName,
    program_overview: programOverview,
    duration_weeks: 12,
    weeks,
    progression_notes: `Increase weight by 2.5-5kg when you can complete all sets with good form.`,
    deload_strategy: `Week 9 is active recovery: reduce sets by 50%.`,
  };
}

// Helper functions
function capitalizeGoal(goal: string): string {
  return goal.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function getBodyweightExercises(goal: any, experience: string) {
  return [
    { name: 'Push-ups', sets: 3, reps: '10-15', rest: 60 },
    { name: 'Bodyweight Squats', sets: 3, reps: '15-20', rest: 60 },
    { name: 'Walking Lunges', sets: 3, reps: '12 each', rest: 60 },
    { name: 'Plank', sets: 3, reps: '45s', rest: 60 },
    { name: 'Glute Bridges', sets: 3, reps: '15', rest: 60 },
    { name: 'Mountain Climbers', sets: 3, reps: '30s', rest: 45 },
    { name: 'Burpees', sets: 3, reps: '10', rest: 90 },
  ];
}

function getFullGymExercises(goal: any, experience: string) {
  return [
    { name: 'Barbell Squat', sets: 4, reps: '6-8', rest: 180 },
    { name: 'Barbell Bench Press', sets: 4, reps: '6-8', rest: 180 },
    { name: 'Barbell Deadlift', sets: 3, reps: '5', rest: 240 },
    { name: 'Overhead Press', sets: 3, reps: '8-10', rest: 120 },
    { name: 'Barbell Row', sets: 3, reps: '8-10', rest: 120 },
    { name: 'Romanian Deadlift', sets: 3, reps: '10-12', rest: 120 },
    { name: 'Incline Bench Press', sets: 3, reps: '8-10', rest: 90 },
  ];
}

function getDumbbellExercises(goal: any, experience: string) {
  return [
    { name: 'Goblet Squat', sets: 3, reps: '10-12', rest: 90 },
    { name: 'DB Bench Press', sets: 3, reps: '10-12', rest: 90 },
    { name: 'DB Row', sets: 3, reps: '10-12', rest: 90 },
    { name: 'DB Shoulder Press', sets: 3, reps: '10-12', rest: 90 },
    { name: 'DB Lunges', sets: 3, reps: '12 each', rest: 60 },
    { name: 'DB RDL', sets: 3, reps: '10-12', rest: 90 },
    { name: 'DB Curl', sets: 3, reps: '12-15', rest: 60 },
    { name: 'DB Tricep Extension', sets: 3, reps: '12-15', rest: 60 },
  ];
}

function getMixedEquipmentExercises(formData: any) {
  return [
    { name: 'Squat Variation', sets: 3, reps: '10-15', rest: 90 },
    { name: 'Push Variation', sets: 3, reps: '10-15', rest: 90 },
    { name: 'Pull Variation', sets: 3, reps: '10-15', rest: 90 },
    { name: 'Hinge Movement', sets: 3, reps: '10-12', rest: 90 },
    { name: 'Core Stability', sets: 3, reps: '15', rest: 60 },
    { name: 'Carry/Locomotion', sets: 3, reps: '30s', rest: 60 },
  ];
}

/**
 * ✅ FIXED: Robust Workout Builder with Rotation Logic
 * This ensures we never run out of exercises, even for 7 days/week
 */
function buildWeekWorkouts(days: number, exercises: any[], isDeload: boolean, week: number) {
  const workouts = [];
  
  // Define explicit days mapping to handle 3, 4, 5, 6, 7 day splits correctly
  let dayNames: string[] = [];
  
  if (days === 1) dayNames = ['Monday'];
  else if (days === 2) dayNames = ['Monday', 'Thursday'];
  else if (days === 3) dayNames = ['Monday', 'Wednesday', 'Friday'];
  else if (days === 4) dayNames = ['Monday', 'Tuesday', 'Thursday', 'Friday'];
  else if (days === 5) dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Friday', 'Saturday'];
  else if (days === 6) dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  else dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']; // 7 Days

  for (let i = 0; i < days; i++) {
    // 🔄 ROTATION LOGIC: Use modulo (%) to cycle through exercises endlessly
    // Start index shifts by 2 each day to give variety
    const startIndex = (i * 2) % exercises.length;
    
    // Select 4-5 exercises per workout
    const dayExercisesRaw = [];
    for(let j = 0; j < 5; j++) {
      const exIndex = (startIndex + j) % exercises.length;
      dayExercisesRaw.push(exercises[exIndex]);
    }

    // Map to final format
    const dayExercises = dayExercisesRaw.map(ex => ({
      exercise_name: ex.name,
      sets: isDeload ? Math.max(1, Math.ceil(ex.sets / 2)) : ex.sets,
      reps: ex.reps,
      rest_seconds: ex.rest,
      notes: isDeload ? 'Deload: Focus on form' : ''
    }));

    workouts.push({
      day: dayNames[i],
      workout_name: getWorkoutName(days, i),
      exercises: dayExercises
    });
  }
  return workouts;
}

function getWorkoutName(totalDays: number, dayIndex: number): string {
  if (totalDays <= 3) return `Full Body ${String.fromCharCode(65 + dayIndex)}`;
  if (totalDays === 4) return dayIndex % 2 === 0 ? 'Upper Body' : 'Lower Body';
  return dayIndex % 2 === 0 ? 'Push/Pull' : 'Legs/Core';
}