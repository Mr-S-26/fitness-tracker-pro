import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import WorkoutSessionManager from '@/components/workout/WorkoutSessionManager';

export default async function ActiveWorkoutPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 1. Fetch User Profile (for preferences/equipment)
  const { data: profile } = await supabase
    .from('user_fitness_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // 2. Fetch Active Program
  const { data: programVersion } = await supabase
    .from('ai_program_versions')
    .select('*')
    .eq('user_id', user.id)
    .eq('active', true)
    .single();

  if (!programVersion) {
    redirect('/dashboard'); // No program found
  }

  return (
    <WorkoutSessionManager 
      userProfile={profile}
      programData={programVersion.program_data}
    />
  );
}