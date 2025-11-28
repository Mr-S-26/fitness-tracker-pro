'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function logMeasurement(data: {
  weight?: number;
  bodyFat?: number;
  notes?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const today = new Date().toISOString().split('T')[0];

  // Upsert measurement for today (one per day)
  const { error } = await supabase
    .from('measurements')
    .upsert({
      user_id: user.id,
      date: today,
      body_weight: data.weight,
      body_fat_percentage: data.bodyFat,
      notes: data.notes
    }, { onConflict: 'user_id, date' });

  if (error) {
    console.error('Error logging measurement:', error);
    throw new Error('Failed to save measurement');
  }

  // Update the user profile weight cache as well (for calorie calculations)
  if (data.weight) {
    await supabase
      .from('user_fitness_profiles')
      .update({ weight_kg: data.weight })
      .eq('user_id', user.id);
  }

  revalidatePath('/measurements');
  revalidatePath('/dashboard');
  return { success: true };
}