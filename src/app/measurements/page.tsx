import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import MeasurementsClient from './MeasurementsClient';

export const metadata = {
  title: 'Body Measurements | FitTracker Pro',
  description: 'Track your body measurements and progress over time',
};

export default async function MeasurementsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user's measurements
  const { data: measurements } = await supabase
    .from('body_measurements')
    .select('*')
    .eq('user_id', user.id)
    .order('measured_at', { ascending: false });

  return (
    <MeasurementsClient
      userId={user.id}
      measurements={measurements || []}
    />
  );
}