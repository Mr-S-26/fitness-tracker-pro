import type { OnboardingFormData, NutritionPlan, NutritionGoal, PrimaryGoal } from '@/types/database';

export function calculateNutritionPlan(formData: OnboardingFormData): Partial<NutritionPlan> {
  // 1. Calculate BMR (Mifflin-St Jeor)
  const weight = formData.weight_kg;
  const height = formData.height_cm;
  const age = formData.age;
  const isMale = formData.sex === 'male';

  let bmr = (10 * weight) + (6.25 * height) - (5 * age);
  bmr += isMale ? 5 : -161;

  // 2. Activity Multiplier
  let activityMultiplier = 1.2; 
  const days = formData.available_days_per_week;
  if (days <= 2) activityMultiplier = 1.375;
  else if (days <= 4) activityMultiplier = 1.55;
  else if (days <= 6) activityMultiplier = 1.725;
  else activityMultiplier = 1.9;

  const tdee = Math.round(bmr * activityMultiplier);

  // 3. Goal Mapping
  const primaryGoal = formData.primary_goal || 'general_fitness';
  const nutritionGoal = mapToNutritionGoal(primaryGoal);

  // 4. ✅ SMART ADJUSTMENT: Use Target Weight Difference
  let targetCalories = tdee;
  let adjustment = 0;

  if (formData.target_weight_kg) {
    const diff = formData.target_weight_kg - weight;
    
    // If goal says "Fat Loss" but Target Weight > Current Weight, warn/adjust?
    // For now, we trust the primary_goal but scale the deficit/surplus based on urgency
    if (nutritionGoal === 'fat_loss') {
       // Aggressive cut if >10kg to lose, Moderate if <5kg
       adjustment = diff < -10 ? -750 : -500; 
    } else if (nutritionGoal === 'muscle_gain') {
       adjustment = 300; // Standard lean bulk
    }
  } else {
    // Fallback standard adjustments
    if (nutritionGoal === 'fat_loss') adjustment = -500;
    if (nutritionGoal === 'muscle_gain') adjustment = 300;
  }

  // Safety cap: Don't go below BMR for men/women excessively
  const minCalories = isMale ? 1600 : 1300;
  targetCalories = Math.max(minCalories, tdee + adjustment);

  // 5. Macros
  const proteinGrams = Math.round(weight * 2.0); // 2g/kg
  const fatGrams = Math.round(weight * 0.9); // 0.9g/kg
  
  const caloriesFromProtein = proteinGrams * 4;
  const caloriesFromFat = fatGrams * 9;
  const remainingCalories = targetCalories - (caloriesFromProtein + caloriesFromFat);
  const carbsGrams = Math.max(0, Math.round(remainingCalories / 4));

  const hydrationOz = Math.round((weight * 35) * 0.033814);

  return {
    goal: nutritionGoal,
    bmr: Math.round(bmr),
    tdee: tdee,
    daily_calories: targetCalories,
    protein_grams: proteinGrams,
    carbs_grams: carbsGrams,
    fat_grams: fatGrams,
    hydration_oz: hydrationOz,
    meal_timing_strategy: getMealStrategy(nutritionGoal),
    pre_workout_meal: getPreWorkout(nutritionGoal),
    post_workout_meal: "25-30g Protein + 40-60g Carbs within 1 hour",
  };
}

// ... (Keep existing helpers: mapToNutritionGoal, getMealStrategy, getPreWorkout)
function mapToNutritionGoal(goal: PrimaryGoal | string): NutritionGoal {
  switch (goal) {
    case 'fat_loss':
      return 'fat_loss';
    case 'muscle_gain':
    case 'strength': 
      return 'muscle_gain';
    case 'general_fitness':
    case 'athletic_performance':
    default:
      return 'maintenance';
  }
}

function getMealStrategy(goal: NutritionGoal): string {
  if (goal === 'fat_loss') return "3 meals + 1 snack, taper carbs in evening";
  if (goal === 'muscle_gain') return "4-5 meals, evenly spaced protein every 3-4 hours";
  return "3 balanced meals + pre/post workout nutrition";
}

function getPreWorkout(goal: NutritionGoal): string {
  if (goal === 'fat_loss') return "Light protein + fruit 45 mins before";
  return "Complex carbs + protein 60-90 mins before";
}