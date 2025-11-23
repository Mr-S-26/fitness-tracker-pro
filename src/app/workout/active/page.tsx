import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import WorkoutSessionManager from '@/components/workout/WorkoutSessionManager';

export default async function ActiveWorkoutPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user's exercises
  const { data: exercises } = await supabase
    .from('exercises')
    .select('*')
    .or(`is_public.eq.true,user_id.eq.${user.id}`)
    .order('name');

  return (
    <div className="min-h-screen bg-gray-50">
      <WorkoutSessionManager 
        userId={user.id} 
        exercises={exercises || []} 
      />
    </div>
  );
}