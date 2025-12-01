'use server';

import { createClient } from '@/lib/supabase/server';
import type { OnboardingFormData } from '@/types/database';
import { calculateNutritionPlan } from '@/lib/nutrition/macro-calculator';

// ... (Interfaces remain the same)
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
      warmups: string[];
      exercises: Array<{
        exercise_name: string;
        sets: number;
        reps: string;
        rest_seconds: number;
        notes?: string;
        rpe_target?: number;
        suggested_weight_kg?: number;
      }>;
      cool_down: string[];
    }>;
  }>;
  progression_notes: string;
  deload_strategy: string;
}

export interface GeneratedPlan {
  program: WorkoutProgram;
  nutrition: any;
}

export async function generatePersonalizedProgram(
  formData: OnboardingFormData,
  userId: string
): Promise<GeneratedPlan> {
  console.log('🤖 Starting Equipment-Prioritized Generation...');
  
  const supabase = await createClient();
  
  // 1. SMART EQUIPMENT DETECTION
  // We use .some() to check if ANY selected equipment string contains the keyword
  const userEquipment = formData.available_equipment || [];
  const hasDumbbells = userEquipment.some(e => e.includes('dumbbell'));
  const hasBarbell = userEquipment.some(e => e.includes('barbell'));
  const hasGym = userEquipment.some(e => e.includes('gym') || e.includes('commercial'));
  const hasPullUpBar = userEquipment.some(e => e.includes('pull_up') || e.includes('pullup'));
  const hasCables = userEquipment.some(e => e.includes('cable') || e.includes('bands')); // Treat bands as cables for now

  const allowedTypes = ['bodyweight']; 
  
  if (hasDumbbells) allowedTypes.push('dumbbell');
  if (hasBarbell) allowedTypes.push('barbell');
  if (hasCables) allowedTypes.push('cable');
  if (hasGym) {
      allowedTypes.push('machine', 'cable', 'barbell', 'dumbbell');
  }

  // 2. Fetch Exercises
  // Note: We don't filter by "pull_up_bar" type because Pull-ups are usually tagged as 'bodyweight'
  // We handle the "Pull-up" prioritization in the sorting logic later.
  const { data: dbExercises } = await supabase
    .from('exercises')
    .select('*')
    .in('equipment', allowedTypes);

  const exercisePool = dbExercises || [];
  
  // Filter specifically for Pull-up bar if the user has one (Ensure Pull-ups are included)
  // If user DOES NOT have a pull-up bar, we must remove "Pull-up" and "Chin-up" from bodyweight moves
  let filteredPool = exercisePool;
  if (!hasPullUpBar && !hasGym) {
      filteredPool = exercisePool.filter(ex => 
          !ex.name.toLowerCase().includes('pull-up') && 
          !ex.name.toLowerCase().includes('chin-up')
      );
  }

  console.log(`📚 Loaded ${filteredPool.length} exercises for ${userEquipment.join(', ')}`);

  const program = generateScientificProgram(formData, filteredPool, { hasDumbbells, hasBarbell, hasGym });
  const nutrition = calculateNutritionPlan(formData);

  return { program, nutrition };
}

function generateScientificProgram(
    formData: OnboardingFormData, 
    exercisePool: any[],
    equipmentFlags: { hasDumbbells: boolean; hasBarbell: boolean; hasGym: boolean }
): WorkoutProgram {
  
  const daysPerWeek = formData.available_days_per_week || 3;
  const selectedDays = formData.selected_days; 
  const goal = formData.primary_goal || 'general_fitness';
  const experience = formData.training_experience || 'beginner';
  const age = formData.age || 30;
  const sex = formData.sex || 'male';
  const injuries = formData.current_injuries?.map(i => i.body_part.toLowerCase()) || [];

  const safePool = filterExercisesForSafety(exercisePool, injuries);
  const splitPattern = getSplitPattern(daysPerWeek);

  const weeks = [];
  for (let weekNum = 1; weekNum <= 12; weekNum++) {
    const phase = getPhaseVariables(weekNum, goal);
    
    const workouts = buildWeekWorkouts(
      daysPerWeek,
      safePool,
      splitPattern,
      weekNum === 9,
      weekNum,
      formData.weight_kg || 70,
      experience,
      age,
      sex,
      goal,
      phase,
      equipmentFlags, // ✅ Pass flags to prioritize weights
      selectedDays
    );

    weeks.push({
      week_number: weekNum,
      focus: phase.name,
      workouts,
    });
  }

  return {
    program_name: `12-Week ${capitalize(experience)} ${splitPattern.name} Protocol`,
    program_overview: `Custom ${splitPattern.name} split for ${goal.replace('_', ' ')}. Equipment: ${equipmentFlags.hasGym ? 'Full Gym' : 'Home Setup'}.`,
    duration_weeks: 12,
    weeks,
    progression_notes: `2-for-2 Rule: Increase weight when you can hit 2 extra reps for 2 sets.`,
    deload_strategy: `Week 9 is Active Recovery. Reduce volume by 50%.`,
  };
}

// ==========================================
// 🏗️ WORKOUT BUILDER
// ==========================================

function buildWeekWorkouts(
  days: number, 
  masterPool: any[], 
  split: SplitPattern,
  isDeload: boolean, 
  week: number,
  userWeight: number,
  experience: string,
  age: number,
  sex: string,
  goal: string,
  phase: any,
  equipmentFlags: { hasDumbbells: boolean; hasBarbell: boolean; hasGym: boolean },
  selectedDays?: string[]
) {
  const workouts = [];
  const dayNames = selectedDays && selectedDays.length > 0 ? selectedDays : getDaySplit(days); 

  for (let i = 0; i < dayNames.length; i++) {
    const theme = split.schedule[i % split.schedule.length]; 
    let themePool = getExercisesForTheme(masterPool, theme);
    
    // ✅ NEW SORTING LOGIC: Prioritize Equipment
    themePool = themePool.sort((a, b) => {
       // 1. Priority: Tier (Compounds First)
       const tierA = parseInt(a.tier?.replace('tier_', '') || '3');
       const tierB = parseInt(b.tier?.replace('tier_', '') || '3');
       if (tierA !== tierB) return tierA - tierB;
       
       // 2. Priority: Equipment (Weighted > Bodyweight)
       // If user has weights, we want to push those exercises to the top
       const isWeightedA = a.equipment !== 'bodyweight';
       const isWeightedB = b.equipment !== 'bodyweight';
       
       if (isWeightedA && !isWeightedB) return -1; // A comes first
       if (!isWeightedA && isWeightedB) return 1;  // B comes first
       
       return 0;
    });

    const startIndex = (week % 2) * 2; 
    const dailyExercisesRaw = themePool.slice(startIndex, startIndex + 6);
    
    if (dailyExercisesRaw.length < 4) {
       const needed = 4 - dailyExercisesRaw.length;
       const fallbacks = getFallbackExercises(theme).slice(0, needed);
       dailyExercisesRaw.push(...fallbacks);
    }

    const dailyExercises = dailyExercisesRaw.map((ex) => {
      const dbMultiplier = ex.beginner_multiplier !== undefined ? Number(ex.beginner_multiplier) : undefined;
      const baseWeight = calculateStartingWeight(ex.name, userWeight, experience, age, sex, goal, dbMultiplier);
      
      const progression = Math.floor((week - 1) / 4) * 2.5;
      const finalWeight = baseWeight > 0 ? baseWeight + progression : 0;

      let baseSets = experience === 'beginner' ? 3 : 4; 
      if (isDeload) baseSets = 2;

      return {
        exercise_name: ex.name,
        sets: baseSets,
        reps: phase.reps,
        rest_seconds: phase.rest,
        notes: isDeload ? 'Deload: Focus on form' : `RPE ${phase.rpe}`,
        suggested_weight_kg: finalWeight,
        rpe_target: phase.rpe
      };
    });

    workouts.push({
      day: dayNames[i],
      workout_name: `${theme} Focus`,
      warmups: getWarmups(theme),
      exercises: dailyExercises,
      cool_down: getCooldowns(theme)
    });
  }
  return workouts;
}

// ... (Keep Helpers: getSplitPattern, getExercisesForTheme, getFallbackExercises, etc. EXACTLY as they were)
// Just ensure `calculateStartingWeight` handles the weight calculation we wrote previously.

// (Re-paste the helpers block from previous version if you need them, or just keep the file bottom intact)
// ==========================================
// 4. INTELLIGENCE ENGINES (Paste previous helpers here)
// ==========================================
type SplitDay = 'Full Body' | 'Upper' | 'Lower' | 'Push' | 'Pull' | 'Legs' | 'Core' | 'Cardio';

interface SplitPattern {
  name: string;
  schedule: SplitDay[];
}

function getSplitPattern(days: number): SplitPattern {
  if (days === 1) return { name: "Full Body", schedule: ['Full Body'] };
  if (days === 2) return { name: "Full Body", schedule: ['Full Body', 'Full Body'] };
  if (days === 3) return { name: "Full Body", schedule: ['Full Body', 'Full Body', 'Full Body'] };
  if (days === 4) return { name: "Upper/Lower", schedule: ['Upper', 'Lower', 'Upper', 'Lower'] };
  if (days === 5) return { name: "Hybrid PPL", schedule: ['Upper', 'Lower', 'Push', 'Pull', 'Legs'] }; 
  if (days === 6) return { name: "PPL", schedule: ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs'] };
  return { name: "Daily", schedule: ['Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Full Body', 'Cardio'] };
}

function getExercisesForTheme(pool: any[], theme: SplitDay): any[] {
  switch (theme) {
    case 'Upper':
      return pool.filter(e => ['chest', 'back', 'shoulders', 'biceps', 'triceps'].includes(e.primary_muscle));
    case 'Lower':
    case 'Legs':
      return pool.filter(e => ['quads', 'hamstrings', 'glutes', 'calves'].includes(e.primary_muscle));
    case 'Push':
      return pool.filter(e => ['push_horizontal', 'push_vertical'].includes(e.movement_pattern) || ['chest', 'shoulders', 'triceps'].includes(e.primary_muscle));
    case 'Pull':
      return pool.filter(e => ['pull_horizontal', 'pull_vertical'].includes(e.movement_pattern) || ['back', 'biceps'].includes(e.primary_muscle));
    case 'Core':
      return pool.filter(e => e.primary_muscle === 'abs');
    case 'Full Body':
    default:
      return pool;
  }
}

function filterExercisesForSafety(exercises: any[], injuries: string[]) {
  if (!injuries.length) return exercises;
  return exercises.filter(ex => {
    const name = ex.name.toLowerCase();
    if (injuries.includes('shoulder') && (name.includes('overhead') || name.includes('press') || name.includes('dip'))) return false;
    if (injuries.includes('knee') && (name.includes('jump') || name.includes('lunge') || name.includes('leg extension'))) return false;
    if ((injuries.includes('lower_back') || injuries.includes('back')) && (name.includes('deadlift') || name.includes('row'))) return false;
    return true;
  });
}

function calculateStartingWeight(
  exerciseName: string, 
  userWeight: number, 
  experience: string,
  age: number,
  sex: string,
  goal: string,
  dbMultiplier?: number
): number {
  let multiplier = dbMultiplier !== undefined ? Number(dbMultiplier) : 0.5;
  
  if (dbMultiplier === undefined) {
      const name = exerciseName.toLowerCase();
      if (name.includes('squat')) multiplier = 0.5;
      else if (name.includes('deadlift')) multiplier = 0.6;
      else if (name.includes('bench')) multiplier = 0.4;
      else if (name.includes('dumbbell')) multiplier = 0.15;
      else multiplier = 0;
  }
  
  const isFemale = sex === 'female';
  if (isFemale) {
    const name = exerciseName.toLowerCase();
    if (name.includes('bench') || name.includes('overhead') || name.includes('push')) {
      multiplier *= 0.6; 
    } else {
      multiplier *= 0.75;
    }
  }

  let ageFactor = 1.0;
  if (age >= 60) ageFactor = 0.5;
  else if (age >= 50) ageFactor = 0.75;
  else if (age >= 40) ageFactor = 0.9;

  let goalFactor = 1.0;
  if (goal === 'strength' || goal === 'athletic_performance') goalFactor = 1.15;
  else if (goal === 'fat_loss') goalFactor = 0.85;

  const finalWeight = userWeight * multiplier * ageFactor * goalFactor;
  
  if (multiplier > 0 && finalWeight < 2.5) return 2.5;
  return Math.round(finalWeight / 2.5) * 2.5;
}

function getPhaseVariables(week: number, goal: string) {
  const isStrength = goal === 'strength';
  const isAthletic = goal === 'athletic_performance';
  const isFatLoss = goal === 'fat_loss';

  if (week === 9) return { name: 'Active Recovery', setsMult: 0.6, reps: 'Deload', rest: 60, rpe: 5 };

  if (isAthletic) {
    if (week <= 4) return { name: 'Phase 1: GPP & Capacity', setsMult: 1.0, reps: '12-15', rest: 60, rpe: 7 };
    if (week <= 8) return { name: 'Phase 2: Max Strength', setsMult: 1.0, reps: '5-8', rest: 120, rpe: 8 };
    return { name: 'Phase 3: Power Conversion', setsMult: 1.0, reps: '3-5', rest: 180, rpe: 8.5 };
  }

  if (isStrength) {
    if (week <= 4) return { name: 'Phase 1: Hypertrophy Base', setsMult: 1.0, reps: '8-10', rest: 90, rpe: 7 };
    if (week <= 8) return { name: 'Phase 2: Strength Realization', setsMult: 1.0, reps: '5-6', rest: 180, rpe: 8.5 };
    return { name: 'Phase 3: Peak Strength', setsMult: 1.0, reps: '3-5', rest: 240, rpe: 9.5 };
  }

  if (isFatLoss) {
    if (week <= 4) return { name: 'Phase 1: Endurance', setsMult: 1.0, reps: '15-20', rest: 30, rpe: 7 };
    if (week <= 8) return { name: 'Phase 2: Metabolic Capacity', setsMult: 1.0, reps: '12-15', rest: 45, rpe: 8 };
    return { name: 'Phase 3: Lactate Threshold', setsMult: 1.0, reps: '10-12', rest: 45, rpe: 9 };
  }

  if (week <= 4) return { name: 'Phase 1: Volume Accumulation', setsMult: 1.0, reps: '10-12', rest: 60, rpe: 7 };
  if (week <= 8) return { name: 'Phase 2: Hypertrophy', setsMult: 1.0, reps: '8-10', rest: 90, rpe: 8 };
  return { name: 'Phase 3: Intensity', setsMult: 1.0, reps: '6-8', rest: 120, rpe: 9 };
}

function getWarmups(theme: SplitDay) {
  if (theme === 'Lower' || theme === 'Legs') return ["5 mins Bike", "Leg Swings", "Bodyweight Squats", "Glute Bridges"];
  if (theme === 'Upper' || theme === 'Push' || theme === 'Pull') return ["5 mins Row", "Arm Circles", "Band Pull-aparts", "Push-up Hold"];
  return ["5 mins Light Cardio", "Jumping Jacks", "World's Greatest Stretch"];
}

function getCooldowns(theme: SplitDay) {
  if (theme === 'Lower' || theme === 'Legs') return ["Hamstring Stretch", "Quad Stretch", "Pigeon Pose"];
  return ["Doorway Chest Stretch", "Child's Pose", "Tricep Stretch"];
}

function getFallbackExercises(theme: SplitDay) {
  switch (theme) {
    case 'Lower':
    case 'Legs':
      return [
        { name: 'Bodyweight Squats', beginner_multiplier: 0, tier: 'tier_1', equipment: 'bodyweight' },
        { name: 'Walking Lunges', beginner_multiplier: 0, tier: 'tier_2', equipment: 'bodyweight' },
        { name: 'Glute Bridges', beginner_multiplier: 0, tier: 'tier_2', equipment: 'bodyweight' },
        { name: 'Calf Raises', beginner_multiplier: 0, tier: 'tier_3', equipment: 'bodyweight' }
      ];
    case 'Push':
    case 'Upper':
      return [
        { name: 'Push-ups', beginner_multiplier: 0, tier: 'tier_1', equipment: 'bodyweight' },
        { name: 'Pike Push-ups', beginner_multiplier: 0, tier: 'tier_2', equipment: 'bodyweight' },
        { name: 'Tricep Dips (Chair)', beginner_multiplier: 0, tier: 'tier_2', equipment: 'bodyweight' },
        { name: 'Diamond Push-ups', beginner_multiplier: 0, tier: 'tier_3', equipment: 'bodyweight' }
      ];
    case 'Pull':
      return [
        { name: 'Doorframe Rows', beginner_multiplier: 0, tier: 'tier_1', equipment: 'bodyweight' },
        { name: 'Superman Hold', beginner_multiplier: 0, tier: 'tier_2', equipment: 'bodyweight' },
        { name: 'Scapular Retractions', beginner_multiplier: 0, tier: 'tier_3', equipment: 'bodyweight' },
        { name: 'Towel Bicep Curls', beginner_multiplier: 0, tier: 'tier_3', equipment: 'bodyweight' }
      ];
    case 'Core':
      return [
        { name: 'Plank', beginner_multiplier: 0, tier: 'tier_1', equipment: 'bodyweight' },
        { name: 'Crunches', beginner_multiplier: 0, tier: 'tier_1', equipment: 'bodyweight' },
        { name: 'Leg Raises', beginner_multiplier: 0, tier: 'tier_2', equipment: 'bodyweight' },
        { name: 'Russian Twists', beginner_multiplier: 0, tier: 'tier_3', equipment: 'bodyweight' }
      ];
    default:
      return [
        { name: 'Bodyweight Squats', beginner_multiplier: 0, equipment: 'bodyweight' },
        { name: 'Push-ups', beginner_multiplier: 0, equipment: 'bodyweight' },
        { name: 'Lunges', beginner_multiplier: 0, equipment: 'bodyweight' },
        { name: 'Plank', beginner_multiplier: 0, equipment: 'bodyweight' }
      ];
  }
}

function getDaySplit(days: number) {
  if (days === 3) return ['Monday', 'Wednesday', 'Friday'];
  if (days === 4) return ['Monday', 'Tuesday', 'Thursday', 'Friday'];
  return ['Monday', 'Tuesday', 'Wednesday', 'Friday', 'Saturday'];
}

function phaseFocus(goal: string) {
  if (goal.includes('muscle')) return "Hypertrophy";
  if (goal.includes('strength')) return "Strength";
  if (goal.includes('fat')) return "Metabolic Conditioning";
  if (goal.includes('athletic')) return "Power";
  return "General Fitness";
}

function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }