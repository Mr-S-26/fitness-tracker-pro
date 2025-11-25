import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // ✅ IMPROVED: Better error handling for profile check
  try {
    const { data: profile, error } = await supabase
      .from('user_fitness_profiles')
      .select('onboarding_completed')
      .eq('user_id', user.id)
      .maybeSingle(); // Use maybeSingle() to avoid error if no rows found

    // If query failed (table doesn't exist or RLS issue)
    if (error) {
      console.error('❌ Profile query error:', error);
      
      // Check if it's a table not found error
      if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
        console.error('⚠️ user_fitness_profiles table does not exist!');
        console.error('👉 Run the database migration SQL in Supabase dashboard');
      }
      
      // Redirect to onboarding anyway since we can't check
      redirect('/onboarding');
    }

    // If no profile exists, user hasn't started onboarding
    if (!profile) {
      redirect('/onboarding');
    }

    // If profile exists but onboarding not completed
    if (!profile.onboarding_completed) {
      redirect('/onboarding');
    }

    // ✅ User has completed onboarding, allow access to dashboard
    
  } catch (error) {
    console.error('❌ Unexpected error checking profile:', error);
    // Fail-safe: redirect to onboarding
    redirect('/onboarding');
  }

  return <>{children}</>;
}