import type { OnboardingFormData, PrimaryGoal } from '@/types/database';

interface NutritionPlan {
  goal: string;
  bmr: number;
  tdee: number;
  daily_calories: number;
  protein_grams: number;
  carbs_grams: number;
  fat_grams: number;
  meal_timing_strategy: string;
  pre_workout_meal: string;
  post_workout_meal: string;
  hydration_oz: number;
  recommended_supplements: Array<{
    name: string;
    dosage: string;
    timing: string;
    reason: string;
  }>;
}

/**
 * Calculate BMR using Mifflin-St Jeor Equation
 */
function calculateBMR(
  weight_kg: number,
  height_cm: number,
  age: number,
  sex: 'male' | 'female' | 'other'
): number {
  if (sex === 'male' || sex === 'other') {
    return Math.round(10 * weight_kg + 6.25 * height_cm - 5 * age + 5);
  } else {
    return Math.round(10 * weight_kg + 6.25 * height_cm - 5 * age - 161);
  }
}

/**
 * Calculate TDEE based on activity level
 */
function calculateTDEE(bmr: number, daysPerWeek: number, sessionDuration: number): number {
  // Activity multiplier based on training frequency and duration
  let activityMultiplier = 1.2; // Sedentary baseline

  if (daysPerWeek >= 6 && sessionDuration >= 75) {
    activityMultiplier = 1.725; // Very active
  } else if (daysPerWeek >= 5 && sessionDuration >= 60) {
    activityMultiplier = 1.55; // Active
  } else if (daysPerWeek >= 3 && sessionDuration >= 45) {
    activityMultiplier = 1.465; // Moderately active
  } else if (daysPerWeek >= 2) {
    activityMultiplier = 1.375; // Lightly active
  }

  return Math.round(bmr * activityMultiplier);
}

/**
 * Adjust calories based on goal
 */
function adjustCaloriesForGoal(tdee: number, goal: PrimaryGoal): number {
  switch (goal) {
    case 'muscle_gain':
      return Math.round(tdee + 300); // Moderate surplus
    case 'fat_loss':
      return Math.round(tdee - 500); // Moderate deficit
    case 'strength':
      return Math.round(tdee + 200); // Small surplus
    case 'athletic_performance':
      return Math.round(tdee + 100); // Slight surplus
    case 'general_fitness':
    default:
      return tdee; // Maintenance
  }
}

/**
 * Calculate macro split based on goal and body weight
 */
function calculateMacros(
  dailyCalories: number,
  weight_kg: number,
  goal: PrimaryGoal
): { protein_grams: number; carbs_grams: number; fat_grams: number } {
  // Protein calculation (in grams)
  let proteinMultiplier = 2.0; // Default: 2g per kg bodyweight
  
  switch (goal) {
    case 'muscle_gain':
      proteinMultiplier = 2.2; // Higher protein for muscle growth
      break;
    case 'strength':
      proteinMultiplier = 2.0;
      break;
    case 'fat_loss':
      proteinMultiplier = 2.4; // Higher protein to preserve muscle
      break;
    case 'athletic_performance':
      proteinMultiplier = 1.8;
      break;
    case 'general_fitness':
      proteinMultiplier = 1.6;
      break;
  }

  const protein_grams = Math.round(weight_kg * proteinMultiplier);
  const protein_calories = protein_grams * 4;

  // Fat calculation (percentage of total calories)
  let fatPercentage = 0.25; // Default: 25% of calories

  switch (goal) {
    case 'muscle_gain':
      fatPercentage = 0.25;
      break;
    case 'strength':
      fatPercentage = 0.30;
      break;
    case 'fat_loss':
      fatPercentage = 0.25;
      break;
    case 'athletic_performance':
      fatPercentage = 0.25;
      break;
    case 'general_fitness':
      fatPercentage = 0.30;
      break;
  }

  const fat_calories = Math.round(dailyCalories * fatPercentage);
  const fat_grams = Math.round(fat_calories / 9);

  // Carbs = remaining calories
  const remaining_calories = dailyCalories - protein_calories - fat_calories;
  const carbs_grams = Math.round(remaining_calories / 4);

  return {
    protein_grams,
    carbs_grams: Math.max(carbs_grams, 50), // Minimum 50g carbs
    fat_grams: Math.max(fat_grams, 40), // Minimum 40g fat
  };
}

/**
 * Generate meal timing strategy
 */
function getMealTimingStrategy(
  goal: PrimaryGoal,
  trainingTime: string[]
): string {
  const hasEarlyTraining = trainingTime.includes('morning');
  const hasEveningTraining = trainingTime.includes('evening');

  let strategy = '';

  switch (goal) {
    case 'muscle_gain':
      strategy = 'Eat 4-5 meals spread throughout the day to maintain an anabolic state. ';
      if (hasEarlyTraining) {
        strategy += 'Have a small carb+protein snack before your morning workout.';
      }
      break;
    case 'fat_loss':
      strategy = 'Focus on 3-4 filling meals with adequate protein at each meal. ';
      strategy += 'Consider a slightly larger post-workout meal to aid recovery.';
      break;
    case 'strength':
      strategy = 'Prioritize pre- and post-workout nutrition. ';
      strategy += 'Consume 30-40g protein within 2 hours of training.';
      break;
    case 'athletic_performance':
      strategy = 'Time carbs around training for optimal performance. ';
      if (hasEveningTraining) {
        strategy += 'Save most carbs for afternoon and evening meals.';
      }
      break;
    default:
      strategy = 'Eat 3-4 balanced meals throughout the day. Focus on whole foods and adequate protein.';
  }

  return strategy;
}

/**
 * Get pre-workout meal suggestion
 */
function getPreWorkoutMeal(goal: PrimaryGoal): string {
  switch (goal) {
    case 'muscle_gain':
      return '40-50g carbs + 20-30g protein (e.g., oatmeal with protein shake, banana with Greek yogurt) 60-90 min before training.';
    case 'strength':
      return '30-40g carbs + 20g protein (e.g., rice cakes with peanut butter, banana with whey shake) 45-60 min before training.';
    case 'fat_loss':
      return 'Light meal: 20-30g carbs + 15-20g protein (e.g., apple with protein shake) 60 min before training if needed.';
    case 'athletic_performance':
      return '50-60g carbs + 20g protein (e.g., bagel with jam and protein shake) 90 min before training.';
    default:
      return 'Light snack: 20-30g carbs + 10-15g protein (e.g., banana, energy bar) if training over 60 min.';
  }
}

/**
 * Get post-workout meal suggestion
 */
function getPostWorkoutMeal(goal: PrimaryGoal): string {
  switch (goal) {
    case 'muscle_gain':
      return '40-50g protein + 60-80g carbs within 2 hours (e.g., chicken with rice, protein shake with banana and oats).';
    case 'strength':
      return '30-40g protein + 40-50g carbs within 2 hours (e.g., steak with sweet potato, salmon with rice).';
    case 'fat_loss':
      return '30-40g protein + 30-40g carbs (e.g., grilled chicken with vegetables and small portion of rice).';
    case 'athletic_performance':
      return '30-40g protein + 50-70g carbs immediately after (e.g., protein shake with fruit, turkey sandwich).';
    default:
      return '25-35g protein + 30-40g carbs within 2 hours (e.g., any balanced meal with protein and carbs).';
  }
}

/**
 * Get evidence-based supplement recommendations
 */
function getSupplementRecommendations(goal: PrimaryGoal): Array<{
  name: string;
  dosage: string;
  timing: string;
  reason: string;
}> {
  const baseSupplements = [
    {
      name: 'Creatine Monohydrate',
      dosage: '5g daily',
      timing: 'Any time (with meal)',
      reason: 'Most researched supplement. Improves strength, power, and muscle growth.',
    },
    {
      name: 'Whey Protein',
      dosage: 'As needed to hit protein target',
      timing: 'Post-workout or between meals',
      reason: 'Convenient way to meet daily protein requirements.',
    },
  ];

  if (goal === 'strength' || goal === 'athletic_performance') {
    baseSupplements.push({
      name: 'Caffeine',
      dosage: '3-6mg per kg bodyweight',
      timing: '30-60 min pre-workout',
      reason: 'Enhances focus, strength, and endurance.',
    });
  }

  if (goal === 'fat_loss') {
    // For fat loss, keep it minimal
    return [
      {
        name: 'Whey Protein',
        dosage: 'As needed to hit protein target',
        timing: 'Between meals',
        reason: 'Helps preserve muscle during calorie deficit.',
      },
      {
        name: 'Creatine Monohydrate',
        dosage: '5g daily',
        timing: 'Any time',
        reason: 'Maintains strength during a cut.',
      },
    ];
  }

  return baseSupplements;
}

/**
 * Calculate hydration needs
 */
function calculateHydration(weight_kg: number, daysPerWeek: number): number {
  // Base hydration: 35ml per kg bodyweight
  const baseOz = Math.round((weight_kg * 35) / 29.5735); // Convert ml to oz
  
  // Add 12-16oz per training day
  const trainingOz = daysPerWeek * 14;
  
  return baseOz + trainingOz;
}

/**
 * Main function to calculate complete nutrition plan
 */
export function calculateNutritionPlan(formData: OnboardingFormData): NutritionPlan {
  // ✅ FIX: Default to 'general_fitness' if no goal set
  const primaryGoal = formData.primary_goal || 'general_fitness';
  
  // Calculate BMR
  const bmr = calculateBMR(
    formData.weight_kg,
    formData.height_cm,
    formData.age,
    formData.sex
  );

  // Calculate TDEE
  const tdee = calculateTDEE(
    bmr,
    formData.available_days_per_week,
    formData.session_duration_minutes
  );

  // Adjust calories for goal
  const daily_calories = adjustCaloriesForGoal(tdee, primaryGoal);

  // Calculate macros
  const macros = calculateMacros(daily_calories, formData.weight_kg, primaryGoal);

  // Get meal timing
  const meal_timing_strategy = getMealTimingStrategy(
    primaryGoal,
    formData.preferred_training_times || []
  );

  // Get meal suggestions
  const pre_workout_meal = getPreWorkoutMeal(primaryGoal);
  const post_workout_meal = getPostWorkoutMeal(primaryGoal);

  // Get supplements
  const recommended_supplements = getSupplementRecommendations(primaryGoal);

  // Calculate hydration
  const hydration_oz = calculateHydration(
    formData.weight_kg,
    formData.available_days_per_week
  );

  return {
    goal: primaryGoal, // ✅ Use the validated goal
    bmr,
    tdee,
    daily_calories,
    protein_grams: macros.protein_grams,
    carbs_grams: macros.carbs_grams,
    fat_grams: macros.fat_grams,
    meal_timing_strategy,
    pre_workout_meal,
    post_workout_meal,
    hydration_oz,
    recommended_supplements,
  };
}