import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ExerciseProgressClient from './ExerciseProgressClient';

// Decodes URL (e.g. "Bench%20Press" -> "Bench Press")
export default async function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ exerciseId: string }>;
}) {
  const { exerciseId } = await params;
  const exerciseName = decodeURIComponent(exerciseId);
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // ✅ FIX: Fetch from 'exercise_sets' (New Table) instead of 'set_logs' (Old Table)
  const { data: history } = await supabase
    .from('exercise_sets')
    .select('*')
    .eq('user_id', user.id)
    .eq('exercise_name', exerciseName)
    .order('created_at', { ascending: true }); // Oldest first for charts

  return (
    <ExerciseProgressClient 
      exerciseName={exerciseName} 
      history={history || []} 
    />
  );
}