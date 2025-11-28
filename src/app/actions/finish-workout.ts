'use server'

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function finishWorkoutSession(
  sessionId: string | null, 
  durationSeconds: number,
  totalVolume: number,
  totalSets: number
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const today = new Date().toISOString().split('T')[0];

  // 1. Identify the Session to Update
  let targetSessionId = sessionId;

  // If frontend didn't pass ID, try to find today's latest session
  if (!targetSessionId) {
    const { data: existingLog } = await supabase
      .from('workout_logs')
      .select('id')
      .eq('user_id', user.id)
      .eq('date', today)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    targetSessionId = existingLog?.id;
  }

  // 2. Update the Session
  if (targetSessionId) {
    await supabase
      .from('workout_logs')
      .update({
        duration_seconds: durationSeconds,
        total_volume_kg: totalVolume,
        total_sets: totalSets,
        // We could also calculate volume here by summing exercise_sets if we wanted to be 100% accurate
      })
      .eq('id', targetSessionId);
  } else {
    // Edge case: User finished workout without logging any sets? 
    // Create a ghost log or just ignore.
    console.warn('No session found to finish');
  }

  // 3. Redirect
  const params = new URLSearchParams({
    duration: durationSeconds.toString(),
    volume: totalVolume.toString(),
    sets: totalSets.toString(),
  });

  redirect(`/workout/summary?${params.toString()}`);
}