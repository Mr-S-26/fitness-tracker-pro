'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function logSetResult(
  existingSessionId: string | null, 
  exerciseName: string,
  setNumber: number,
  data: {
    weight: number;
    reps: number;
    rpe: number;
    difficulty: 'easy' | 'perfect' | 'hard' | 'failure';
  }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Unauthorized');

  let workoutLogId = existingSessionId;

  // 1. If no session ID provided, find or create an active session for today
  if (!workoutLogId) {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if one exists for today (that isn't finished/locked?)
    // For MVP, we'll just check for a log created today
    const { data: existingLog } = await supabase
      .from('workout_logs')
      .select('id')
      .eq('user_id', user.id)
      .eq('date', today)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existingLog) {
      workoutLogId = existingLog.id;
    } else {
      // Create a new Workout Log
      const { data: newLog, error } = await supabase
        .from('workout_logs')
        .insert({
          user_id: user.id,
          workout_name: 'Daily Workout', // You could pass the real name if available
          date: today,
          duration_seconds: 0, // Will update on finish
        })
        .select()
        .single();
      
      if (error) throw new Error('Failed to create session');
      workoutLogId = newLog.id;
    }
  }

  // 2. Insert the Set
  const { error: setError } = await supabase
    .from('exercise_sets')
    .insert({
      workout_log_id: workoutLogId,
      user_id: user.id,
      exercise_name: exerciseName,
      set_number: setNumber,
      weight_kg: data.weight,
      reps: data.reps,
      rpe: data.rpe,
      difficulty: data.difficulty
    });

  if (setError) {
    console.error('Error logging set:', setError);
    throw new Error('Failed to save set');
  }

  return { success: true, sessionId: workoutLogId };
}