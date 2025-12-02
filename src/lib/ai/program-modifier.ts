import { createClient } from '@/lib/supabase/server';

export async function swapExerciseInProgram(
  userId: string, 
  targetExerciseName: string, 
  newExerciseName: string
) {
  const supabase = await createClient();

  // 1. Fetch Active Program
  const { data: programRecord } = await supabase
    .from('ai_program_versions')
    .select('*')
    .eq('user_id', userId)
    .eq('active', true)
    .single();

  if (!programRecord) return { success: false, message: "No active program found." };

  // 2. Fetch Details for New Exercise (Video, Cues)
  const { data: newExerciseDetails } = await supabase
    .from('exercises')
    .select('*')
    .ilike('name', newExerciseName)
    .single();

  if (!newExerciseDetails) return { success: false, message: `I couldn't find "${newExerciseName}" in the library.` };

  // 3. Swap Logic (Deep Search & Replace)
  const programData = programRecord.program_data;
  let swapCount = 0;

  programData.weeks.forEach((week: any) => {
    week.workouts.forEach((workout: any) => {
      workout.exercises.forEach((exercise: any, index: number) => {
        // Fuzzy match
        if (exercise.exercise_name.toLowerCase().includes(targetExerciseName.toLowerCase())) {
          
          workout.exercises[index] = {
            ...exercise, // Keep sets/reps
            exercise_name: newExerciseDetails.name,
            video_url: newExerciseDetails.video_url,
            setup_cues: newExerciseDetails.setup_cues,
            execution_cues: newExerciseDetails.execution_cues,
            common_mistakes: newExerciseDetails.common_mistakes,
            suggested_weight_kg: calculateNewWeight(exercise.suggested_weight_kg, newExerciseDetails.beginner_multiplier)
          };
          swapCount++;
        }
      });
    });
  });

  if (swapCount === 0) return { success: false, message: `I couldn't find "${targetExerciseName}" in your program.` };

  // 4. Save
  const { error } = await supabase
    .from('ai_program_versions')
    .update({ program_data: programData })
    .eq('id', programRecord.id);

  if (error) return { success: false, message: "Database error." };

  return { success: true, message: `✅ Success! I swapped **${targetExerciseName}** for **${newExerciseDetails.name}** in ${swapCount} workouts.` };
}

function calculateNewWeight(oldWeight: number, newMultiplier: number) {
  if (!oldWeight || !newMultiplier) return 0;
  return Math.round(oldWeight * 0.8); // Conservative reduction for new movement
}