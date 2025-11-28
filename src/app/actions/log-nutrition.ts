'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface LogData {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  water_oz?: number;
}

export async function logDailyNutrition(data: LogData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const today = new Date().toISOString().split('T')[0];

  // 1. Get current log for today (if exists)
  const { data: currentLog } = await supabase
    .from('daily_nutrition_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single();

  // 2. Calculate new totals
  const newLog = {
    user_id: user.id,
    date: today,
    calories: (currentLog?.calories || 0) + (data.calories || 0),
    protein: (currentLog?.protein || 0) + (data.protein || 0),
    carbs: (currentLog?.carbs || 0) + (data.carbs || 0),
    fat: (currentLog?.fat || 0) + (data.fat || 0),
    water_oz: (currentLog?.water_oz || 0) + (data.water_oz || 0),
  };

  // 3. Upsert (Create or Update)
  const { error } = await supabase
    .from('daily_nutrition_logs')
    .upsert(newLog, { onConflict: 'user_id, date' });

  if (error) {
    console.error('Error logging nutrition:', error);
    throw new Error('Failed to log nutrition');
  }

  revalidatePath('/nutrition');
  return { success: true };
}