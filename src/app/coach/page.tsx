import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AICoachInterface from '@/components/AICoach/AICoachInterface';

export default async function CoachPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return (
    <div className="min-h-screen bg-gray-50">
      <AICoachInterface userName={user.user_metadata?.full_name || 'Athlete'} />
    </div>
  );
}