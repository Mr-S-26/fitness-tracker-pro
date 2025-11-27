'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function logSetResult(
  sessionId: string | null, // If null, we create a new session on the fly
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

  // Note: In a full production app, you would ensure a 'workout_sessions' row exists first.
  // For this portfolio MVP, we'll assume we are just logging to a raw logs table or 
  // you can expand this to create the session row if missing.
  
  // For now, let's simulate the DB delay to show UI optimism
  await new Promise(resolve => setTimeout(resolve, 500));

  console.log(`📝 Logged Set ${setNumber} for ${exerciseName}:`, data);
  
  // In the real implementation (Phase 2.3), you'd run:
  /*
  await supabase.from('set_logs').insert({
    user_id: user.id,
    session_id: sessionId,
    exercise_name: exerciseName,
    set_number: setNumber,
    ...data
  })
  */

  return { success: true };
}