import type { OnboardingFormData } from '@/types/database';
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

// ✅ NEW: Combined return type for the UI
export interface GeneratedPlan {
  program: WorkoutProgram;
  nutrition: any; // Typed as 'any' or Partial<NutritionPlan>
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
 * (This contains your existing logic for creating workouts)
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

  // Build 12 weeks
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
    { name: 'Push-ups', sets: 3, reps: '8-12', rest: 60 },
    { name: 'Squats', sets: 3, reps: '15-20', rest: 60 },
    { name: 'Lunges', sets: 3, reps: '12 each', rest: 60 },
    { name: 'Plank', sets: 3, reps: '45s', rest: 60 },
  ];
}

function getFullGymExercises(goal: any, experience: string) {
  return [
    { name: 'Barbell Squat', sets: 4, reps: '6-8', rest: 180 },
    { name: 'Bench Press', sets: 4, reps: '6-8', rest: 180 },
    { name: 'Deadlift', sets: 3, reps: '5', rest: 240 },
    { name: 'Overhead Press', sets: 3, reps: '8-10', rest: 120 },
  ];
}

function getDumbbellExercises(goal: any, experience: string) {
  return [
    { name: 'Goblet Squat', sets: 3, reps: '10-12', rest: 90 },
    { name: 'DB Bench Press', sets: 3, reps: '10-12', rest: 90 },
    { name: 'DB Row', sets: 3, reps: '10-12', rest: 90 },
    { name: 'DB Lunges', sets: 3, reps: '12 each', rest: 60 },
  ];
}

function getMixedEquipmentExercises(formData: any) {
  return [
    { name: 'Squat Variation', sets: 3, reps: '10-15', rest: 90 },
    { name: 'Push Variation', sets: 3, reps: '10-15', rest: 90 },
    { name: 'Pull Variation', sets: 3, reps: '10-15', rest: 90 },
    { name: 'Core', sets: 3, reps: '15', rest: 60 },
  ];
}

function buildWeekWorkouts(days: number, exercises: any[], isDeload: boolean, week: number) {
  const workouts = [];
  const daysOfWeek = ['Monday', 'Wednesday', 'Friday', 'Saturday', 'Sunday'].slice(0, days);

  for (let i = 0; i < days; i++) {
    workouts.push({
      day: daysOfWeek[i] || `Day ${i + 1}`,
      workout_name: `Full Body ${String.fromCharCode(65 + i)}`,
      exercises: exercises.map(ex => ({
        exercise_name: ex.name,
        sets: isDeload ? Math.max(1, Math.ceil(ex.sets / 2)) : ex.sets,
        reps: ex.reps,
        rest_seconds: ex.rest,
        notes: isDeload ? 'Deload: Focus on form' : ''
      }))
    });
  }
  return workouts;
}