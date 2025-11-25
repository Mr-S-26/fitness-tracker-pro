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

  // ✅ Check if user completed onboarding
  const { data: profile } = await supabase
    .from('user_fitness_profiles')
    .select('onboarding_completed')
    .eq('user_id', user.id)
    .single();

  if (!profile?.onboarding_completed) {
    redirect('/onboarding');
  }

  return <>{children}</>;
}