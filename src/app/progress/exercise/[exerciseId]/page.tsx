import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ExerciseProgressClient from './ExerciseProgressClient';

export default async function ExerciseProgressPage({
  params,
}: {
  params: Promise<{ exerciseId: string }>;
}) {
  const supabase = await createClient();
  const { exerciseId } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch exercise details
  const { data: exercise } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', exerciseId)
    .single();

  if (!exercise) {
    redirect('/progress');
  }

  // Fetch all set logs for this exercise with workout session details
  const { data: setLogs } = await supabase
    .from('set_logs')
    .select(`
      *,
      workout_sessions!inner(
        id,
        started_at,
        completed_at,
        workout_name
      )
    `)
    .eq('exercise_id', exerciseId)
    .eq('workout_sessions.user_id', user.id)
    .order('workout_sessions.started_at', { ascending: false });

  return (
    <ExerciseProgressClient
      exercise={exercise}
      setLogs={setLogs || []}
    />
  );
}