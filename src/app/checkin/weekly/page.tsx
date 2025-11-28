import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import WeeklyCheckInForm from '@/components/checkin/WeeklyCheckInForm';

export default async function WeeklyCheckInPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 1. Calculate "Last Week" Date Range
  const now = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(now.getDate() - 7);

  // 2. Fetch Workouts from last 7 days
  const { data: logs } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', oneWeekAgo.toISOString().split('T')[0]);

  // 3. Fetch User Profile (to get planned frequency)
  const { data: profile } = await supabase
    .from('user_fitness_profiles')
    .select('available_days_per_week')
    .eq('user_id', user.id)
    .single();

  // 4. Calculate Stats
  const workoutsCompleted = logs?.length || 0;
  const plannedWorkouts = profile?.available_days_per_week || 3;
  const adherence = Math.round((workoutsCompleted / plannedWorkouts) * 100);
  const totalVolume = logs?.reduce((sum, log) => sum + (log.total_volume_kg || 0), 0) || 0;

  // 5. Prepare Stats Object
  const weeklyStats = {
    startDate: oneWeekAgo.toLocaleDateString(),
    endDate: now.toLocaleDateString(),
    workoutsCompleted,
    plannedWorkouts,
    adherence,
    totalVolume
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <WeeklyCheckInForm stats={weeklyStats} />
      </div>
    </div>
  );
}