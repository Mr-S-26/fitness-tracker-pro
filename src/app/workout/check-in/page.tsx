// src/app/workout/check-in/page.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PreWorkoutCheckInClient from './PreWorkoutCheckInClient';

export default async function PreWorkoutCheckInPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <PreWorkoutCheckInClient userId={user.id} />;
}