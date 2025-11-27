import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PreWorkoutCheckInClient from './PreWorkoutCheckInClient';

export default async function CheckInPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 1. Get today's active program data
  // (In a real app, we'd calculate the specific day based on the user's start date)
  // For now, we'll just fetch the active program
  const { data: program } = await supabase
    .from('ai_program_versions')
    .select('*')
    .eq('user_id', user.id)
    .eq('active', true)
    .single();

  if (!program) redirect('/dashboard');

  return (
    <PreWorkoutCheckInClient 
      userName={user.user_metadata?.full_name || 'Athlete'} 
      programId={program.id}
    />
  );
}