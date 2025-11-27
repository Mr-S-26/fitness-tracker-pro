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

  // 1. Update (or Create) the Session entry
  // In a real app, you'd update the existing session row.
  // For this MVP, we'll simulate a successful save.
  
  console.log('✅ Workout Finished:', {
    user: user.email,
    duration: durationSeconds,
    volume: totalVolume,
    sets: totalSets
  });

  // 2. Redirect to the Summary Page
  // Pass stats via query params for simplicity (or fetch ID in real app)
  const params = new URLSearchParams({
    duration: durationSeconds.toString(),
    volume: totalVolume.toString(),
    sets: totalSets.toString(),
  });

  redirect(`/workout/summary?${params.toString()}`);
}