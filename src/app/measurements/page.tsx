import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import MeasurementsClient from './MeasurementsClient';

export default async function MeasurementsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Fetch measurement history
  const { data: history } = await supabase
    .from('measurements')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: true });

  return (
    <MeasurementsClient history={history || []} />
  );
}