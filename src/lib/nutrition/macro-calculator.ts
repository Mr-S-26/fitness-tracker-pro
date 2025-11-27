import type { OnboardingFormData, NutritionPlan, NutritionGoal, PrimaryGoal } from '@/types/database';

export function calculateNutritionPlan(formData: OnboardingFormData): Partial<NutritionPlan> {
  // 1. Calculate BMR (Mifflin-St Jeor Equation)
  const weight = formData.weight_kg;
  const height = formData.height_cm;
  const age = formData.age;
  const isMale = formData.sex === 'male';

  let bmr = (10 * weight) + (6.25 * height) - (5 * age);
  bmr += isMale ? 5 : -161;

  // 2. Calculate TDEE (Activity Multiplier)
  let activityMultiplier = 1.2; // Sedentary base
  const days = formData.available_days_per_week;
  
  if (days <= 2) activityMultiplier = 1.375;      // Lightly active
  else if (days <= 4) activityMultiplier = 1.55;  // Moderately active
  else if (days <= 6) activityMultiplier = 1.725; // Very active
  else activityMultiplier = 1.9;                  // Extra active

  const tdee = Math.round(bmr * activityMultiplier);

  // 3. Get User Goal & Map to Nutrition Goal
  const primaryGoal = formData.primary_goal || 'general_fitness';
  const nutritionGoal = mapToNutritionGoal(primaryGoal);

  // 4. Adjust Calories based on Goal
  let targetCalories = tdee;

  switch (nutritionGoal) {
    case 'fat_loss':
      targetCalories = Math.round(tdee - 500); // 500 kcal deficit
      break;
    case 'muscle_gain':
      targetCalories = Math.round(tdee + 300); // 300 kcal surplus
      break;
    case 'maintenance':
    default:
      targetCalories = tdee; // Maintenance
      break;
  }

  // 5. Calculate Macros
  // Protein: 2g per kg (Standard for active individuals)
  const proteinGrams = Math.round(weight * 2.0);
  
  // Fat: ~0.9g per kg (Minimum for hormonal health)
  const fatGrams = Math.round(weight * 0.9);

  // Carbs: Remaining calories
  // 1g Protein = 4 cal, 1g Fat = 9 cal, 1g Carb = 4 cal
  const caloriesFromProtein = proteinGrams * 4;
  const caloriesFromFat = fatGrams * 9;
  const remainingCalories = targetCalories - (caloriesFromProtein + caloriesFromFat);
  const carbsGrams = Math.max(0, Math.round(remainingCalories / 4));

  // 6. Hydration (approx 35ml per kg)
  const hydrationOz = Math.round((weight * 35) * 0.033814);

  return {
    goal: nutritionGoal, // ✅ Now strictly typed as 'muscle_gain' | 'fat_loss' | 'maintenance'
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

// ✅ Helper to map PrimaryGoal (5 options) to NutritionGoal (3 options)
function mapToNutritionGoal(goal: PrimaryGoal | string): NutritionGoal {
  switch (goal) {
    case 'fat_loss':
      return 'fat_loss';
    case 'muscle_gain':
    case 'strength': // Strength needs surplus -> Muscle Gain
      return 'muscle_gain';
    case 'general_fitness':
    case 'athletic_performance': // Performance usually implies maintenance/slight surplus
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