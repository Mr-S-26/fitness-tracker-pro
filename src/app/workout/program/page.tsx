import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProgramWorkoutClient from './ProgramWorkoutClient';

export default async function ProgramWorkoutPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user's exercises for the workout
  const { data: exercises } = await supabase
    .from('exercises')
    .select('*')
    .or(`is_public.eq.true,user_id.eq.${user.id}`)
    .order('name');

  return <ProgramWorkoutClient userId={user.id} exercises={exercises || []} />;
}