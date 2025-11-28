import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProgressDashboardClient from './ProgressDashboardClient';

export const metadata = {
  title: 'Progress | FitTracker Pro',
  description: 'Track your fitness progress and analytics',
};

export default async function ProgressPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 1. Fetch workout logs (The table we actually write to)
  const { data: logs } = await supabase
    .from('workout_logs')
    .select('id, workout_name, date, duration_seconds, total_volume_kg, total_sets')
    .eq('user_id', user.id)
    .order('date', { ascending: false });

  // 2. Fetch exercise sets (The table with the reps/weight data)
  const { data: sets } = await supabase
    .from('exercise_sets')
    .select('id, exercise_name, weight_kg, reps, created_at, workout_log_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1000);

  // 3. Map to the format the Client Component expects
  const formattedSessions = (logs || []).map(log => ({
    id: log.id,
    name: log.workout_name,
    started_at: log.date, // Use date as start time
    completed_at: log.date,
    total_volume: log.total_volume_kg
  }));

  const formattedSets = (sets || []).map(set => ({
    id: set.id,
    weight: set.weight_kg,
    actual_reps: set.reps,
    created_at: set.created_at,
    // Map flat structure to nested object expected by Client
    exercise: {
      id: set.exercise_name, // Use name as ID for grouping
      name: set.exercise_name,
      category: 'Strength', // Default category since we store simple logs
      is_compound: false
    },
    session: {
      started_at: set.created_at // Approximation
    }
  }));

  return (
    <ProgressDashboardClient
      userId={user.id}
      sessions={formattedSessions}
      setLogs={formattedSets}
    />
  );
}