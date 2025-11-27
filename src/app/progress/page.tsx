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

  // Fetch user's workout history
  const { data: sessions } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false });

  // Fetch user's set logs for PR calculations
  const { data: setLogs } = await supabase
    .from('set_logs')
    .select(`
      *,
      exercise:exercises(id, name, category, is_compound),
      session:workout_sessions(started_at)
    `)
    .eq('session_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1000);

  return (
    <ProgressDashboardClient
      userId={user.id}
      sessions={sessions || []}
      setLogs={setLogs || []}
    />
  );
}