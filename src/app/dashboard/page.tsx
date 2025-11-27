import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  // ✅ FIX: Add 'await' here because createClient is async
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 1. Fetch User Profile
  const { data: profile } = await supabase
    .from('user_fitness_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // If no profile or onboarding not done, redirect to onboarding
  if (!profile || !profile.onboarding_completed) {
    redirect('/onboarding');
  }

  // 2. Fetch Active Nutrition Plan
  const { data: nutrition } = await supabase
    .from('nutrition_plans')
    .select('*')
    .eq('user_id', user.id)
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // 3. Fetch Active Program
  const { data: program } = await supabase
    .from('ai_program_versions')
    .select('*')
    .eq('user_id', user.id)
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return (
    <DashboardClient 
      profile={profile}
      nutrition={nutrition}
      program={program}
      user={user}
    />
  );
}