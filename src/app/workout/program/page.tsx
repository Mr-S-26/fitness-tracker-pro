import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProgramWorkoutClient from './ProgramWorkoutClient';

export default async function ProgramPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 1. Fetch Active Program (The Plan)
  const { data: program } = await supabase
    .from('ai_program_versions')
    .select('*')
    .eq('user_id', user.id)
    .eq('active', true)
    .single();

  // 2. Fetch Workout History (The Reality)
  // We only need dates and basic info to mark the calendar
  const { data: logs } = await supabase
    .from('workout_logs')
    .select('id, date, workout_name, duration_seconds')
    .eq('user_id', user.id);

  if (!program) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Program</h2>
          <p className="text-gray-500 mb-6">
            You don't have a training plan yet. Complete the onboarding to generate one!
          </p>
          <a href="/onboarding" className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors">
            Go to Onboarding
          </a>
        </div>
      </div>
    );
  }

  return (
    <ProgramWorkoutClient 
      program={program} 
      logs={logs || []} 
    />
  );
}