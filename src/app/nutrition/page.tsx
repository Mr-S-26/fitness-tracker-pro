import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import NutritionClient from '@/components/nutrition/NutritionClient';

export default async function NutritionPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 1. Fetch Active Plan
  const { data: plan } = await supabase
    .from('nutrition_plans')
    .select('*')
    .eq('user_id', user.id)
    .eq('active', true)
    .single();

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Nutrition Plan Found</h2>
          <p className="text-gray-500">Please complete the onboarding process to generate your plan.</p>
        </div>
      </div>
    );
  }

  // 2. Fetch Today's Logs (Real Data!)
  const today = new Date().toISOString().split('T')[0];
  const { data: dailyLog } = await supabase
    .from('daily_nutrition_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single();

  // ✅ FIXED: Variable name is now 'initialConsumed' (no space)
  const initialConsumed = dailyLog || {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    water_oz: 0
  };

  return (
    <NutritionClient 
      plan={plan} 
      userName={user.user_metadata?.full_name || 'Athlete'} 
      initialConsumed={initialConsumed} 
    />
  );
}