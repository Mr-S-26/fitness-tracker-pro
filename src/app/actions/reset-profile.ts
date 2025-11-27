'use server'

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function resetUserProfile() {
  // 1. Initialize Supabase (Await is critical here)
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  console.log('🗑️ STARTING RESET for user:', user.id);

  // 2. Delete in correct order (Child tables first)
  
  // Delete Injuries
  const { error: injuryError } = await supabase
    .from('user_injuries')
    .delete()
    .eq('user_id', user.id);
  if (injuryError) console.error('⚠️ Error deleting injuries:', injuryError);

  // Delete Check-ins
  const { error: checkinError } = await supabase
    .from('weekly_checkins')
    .delete()
    .eq('user_id', user.id);
  if (checkinError) console.error('⚠️ Error deleting checkins:', checkinError);

  // Delete Program Versions
  const { error: programError } = await supabase
    .from('ai_program_versions')
    .delete()
    .eq('user_id', user.id);
  if (programError) console.error('⚠️ Error deleting programs:', programError);
  
  // Delete Nutrition Plans
  const { error: nutritionError } = await supabase
    .from('nutrition_plans')
    .delete()
    .eq('user_id', user.id);
  if (nutritionError) console.error('⚠️ Error deleting nutrition:', nutritionError);
  
  // 3. Delete User Profile (The Trigger for Onboarding)
  const { error: profileError } = await supabase
    .from('user_fitness_profiles')
    .delete()
    .eq('user_id', user.id);
    
  if (profileError) {
      console.error('❌ CRITICAL: Failed to delete profile:', profileError);
      throw new Error('Failed to reset profile. Check database permissions.');
  }

  console.log('✅ Profile reset successful. Clearing cache...');

  // 4. Clear Server Cache to prevent "Ghost" redirects
  revalidatePath('/', 'layout'); 
  
  // 5. Redirect to Onboarding
  redirect('/onboarding');
}