import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ExerciseLibraryClient from './ExerciseLibraryClient';

export const metadata = {
  title: 'Exercise Library | FitTracker Pro',
  description: 'Browse and manage your exercise library',
};

export default async function ExerciseLibraryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch all exercises (public + user's custom)
  const { data: exercises, error } = await supabase
    .from('exercises')
    .select('*')
    .or(`is_public.eq.true,user_id.eq.${user.id}`)
    .order('name');

  if (error) {
    console.error('Error fetching exercises:', error);
  }

  // Fetch user's custom exercises count
  const { count: customCount } = await supabase
    .from('exercises')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  return (
    <ExerciseLibraryClient
      exercises={exercises || []}
      userId={user.id}
      customExercisesCount={customCount || 0}
    />
  );
}