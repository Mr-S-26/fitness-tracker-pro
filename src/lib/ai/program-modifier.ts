import { createClient } from '@/lib/supabase/server';

export async function swapExerciseInProgram(
  userId: string, 
  targetExerciseName: string, 
  newExerciseName: string
) {
  const supabase = await createClient();

  // 1. Fetch the Active Program
  const { data: programRecord } = await supabase
    .from('ai_program_versions')
    .select('*')
    .eq('user_id', userId)
    .eq('active', true)
    .single();

  if (!programRecord) return { success: false, message: "You don't have an active program to modify." };

  // 2. Fetch Details for the NEW Exercise (Video, Cues, etc.)
  const { data: newExerciseDetails } = await supabase
    .from('exercises')
    .select('*')
    .ilike('name', newExerciseName)
    .single();

  if (!newExerciseDetails) {
    return { success: false, message: `I couldn't find "${newExerciseName}" in the library. Try a different name?` };
  }

  // 3. Swap Logic
  const programData = programRecord.program_data;
  let swapCount = 0;

  programData.weeks.forEach((week: any) => {
    week.workouts.forEach((workout: any) => {
      workout.exercises.forEach((exercise: any, index: number) => {
        // Fuzzy match the name
        if (exercise.exercise_name.toLowerCase().includes(targetExerciseName.toLowerCase())) {
          
          // ✅ PERFORM THE SWAP
          workout.exercises[index] = {
            ...exercise, // Keep sets/reps/rest
            exercise_name: newExerciseDetails.name,
            video_url: newExerciseDetails.video_url,
            setup_cues: newExerciseDetails.setup_cues,
            execution_cues: newExerciseDetails.execution_cues,
            common_mistakes: newExerciseDetails.common_mistakes,
            // Recalculate weight roughly based on multipliers
            suggested_weight_kg: calculateNewWeight(exercise.suggested_weight_kg, newExerciseDetails.beginner_multiplier)
          };
          swapCount++;
        }
      });
    });
  });

  if (swapCount === 0) {
    return { success: false, message: `I couldn't find "${targetExerciseName}" in your current program.` };
  }

  // 4. Save Updates
  const { error } = await supabase
    .from('ai_program_versions')
    .update({ program_data: programData })
    .eq('id', programRecord.id);

  if (error) return { success: false, message: "Database error while updating program." };

  return { success: true, message: `Done! I swapped **${targetExerciseName}** for **${newExerciseDetails.name}** in ${swapCount} workouts.` };
}

function calculateNewWeight(oldWeight: number, newMultiplier: number) {
  if (!oldWeight || !newMultiplier) return 0;
  // Simple heuristic: adjust weight relative to the new exercise's "difficulty" (multiplier)
  // Realistically, we just return a safe bet or the same weight if similar tiers
  return Math.round(oldWeight * 0.8); // Drop weight slightly for safety on new move
}