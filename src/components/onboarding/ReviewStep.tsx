'use client';

import { useState } from 'react';
import { CheckCircle, Calendar, Dumbbell, Apple, TrendingUp, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { OnboardingFormData } from '@/types/database';

interface ReviewStepProps {
  formData: OnboardingFormData;
  program: any;
  nutrition: any;
  userId: string;
  onComplete: () => void;
}

export default function ReviewStep({ formData, program, nutrition, userId, onComplete }: ReviewStepProps) {
  const supabase = createClient();
  const [saving, setSaving] = useState(false);

  const handleComplete = async () => {
    setSaving(true);
    
    try {
      // Save fitness profile
      const { error: profileError } = await supabase
        .from('user_fitness_profiles')
        .upsert({
          user_id: userId,
          ...formData,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;

      // Save injuries if any
      if (formData.current_injuries.length > 0) {
        const { error: injuriesError } = await supabase
          .from('user_injuries')
          .insert(
            formData.current_injuries.map(injury => ({
              user_id: userId,
              ...injury,
              active: true,
            }))
          );

        if (injuriesError) throw injuriesError;
      }

      // Save nutrition plan
      const { error: nutritionError } = await supabase
        .from('nutrition_plans')
        .insert({
          user_id: userId,
          ...nutrition,
          active: true,
        });

      if (nutritionError) throw nutritionError;

      // Save program version
      const { error: programError } = await supabase
        .from('ai_program_versions')
        .insert({
          user_id: userId,
          version_number: 1,
          program_name: program.program_name,
          program_overview: program.program_overview,
          duration_weeks: program.duration_weeks,
          program_data: program,
          reason_for_change: 'Initial onboarding program',
          change_type: 'initial',
          active: true,
        });

      if (programError) throw programError;

      // Success!
      onComplete();
      
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      alert('Failed to save your data. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mb-6">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Your Program is Ready! 🎉
        </h2>
        <p className="text-gray-600">
          Here's what I've created for you based on your profile.
        </p>
      </div>

      {/* Program Overview */}
      <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <Dumbbell className="w-6 h-6 text-purple-600" />
          <h3 className="font-bold text-gray-900 text-lg">{program.program_name}</h3>
        </div>
        <p className="text-sm text-gray-700 mb-4">{program.program_overview}</p>
        
        <div className="grid md:grid-cols-3 gap-3 text-sm">
          <div className="bg-white p-3 rounded-lg">
            <Calendar className="w-4 h-4 text-purple-600 mb-1" />
            <div className="font-semibold text-gray-900">{program.duration_weeks} weeks</div>
            <div className="text-xs text-gray-600">Duration</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <TrendingUp className="w-4 h-4 text-purple-600 mb-1" />
            <div className="font-semibold text-gray-900">{formData.available_days_per_week} days/week</div>
            <div className="text-xs text-gray-600">Training Frequency</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <Dumbbell className="w-4 h-4 text-purple-600 mb-1" />
            <div className="font-semibold text-gray-900">{program.weeks?.[0]?.workouts?.length || 0} workouts</div>
            <div className="text-xs text-gray-600">Per Week</div>
          </div>
        </div>
      </div>

      {/* Sample Week */}
      {program.weeks && program.weeks[0] && (
        <div className="mb-6 p-6 bg-gray-50 border-2 border-gray-200 rounded-xl">
          <h4 className="font-bold text-gray-900 mb-3">📅 Week 1 - {program.weeks[0].focus}</h4>
          <div className="space-y-2">
            {program.weeks[0].workouts.slice(0, 3).map((workout: any, index: number) => (
              <div key={index} className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="font-semibold text-gray-900 text-sm mb-1">{workout.workout_name}</div>
                <div className="text-xs text-gray-600">
                  {workout.exercises.length} exercises • ~{formData.session_duration_minutes} min
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nutrition Plan */}
      <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <Apple className="w-6 h-6 text-green-600" />
          <h3 className="font-bold text-gray-900 text-lg">Your Nutrition Plan</h3>
        </div>
        
        <div className="grid md:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {nutrition.daily_calories}
            </div>
            <div className="text-xs text-gray-600">Calories/day</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {nutrition.protein_grams}g
            </div>
            <div className="text-xs text-gray-600">Protein</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {nutrition.carbs_grams}g
            </div>
            <div className="text-xs text-gray-600">Carbs</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {nutrition.fat_grams}g
            </div>
            <div className="text-xs text-gray-600">Fat</div>
          </div>
        </div>

        {nutrition.meal_timing_strategy && (
          <div className="mt-4 p-3 bg-white rounded-lg">
            <h5 className="text-xs font-semibold text-gray-900 mb-1">Meal Timing Strategy:</h5>
            <p className="text-xs text-gray-700">{nutrition.meal_timing_strategy}</p>
          </div>
        )}
      </div>

      {/* Complete Button */}
      <button
        onClick={handleComplete}
        disabled={saving}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        {saving ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            Saving Your Program...
          </>
        ) : (
          <>
            <CheckCircle className="w-6 h-6" />
            Let's Start Training! 🚀
          </>
        )}
      </button>

      <p className="text-center text-xs text-gray-500 mt-4">
        You can always modify your program later from the dashboard
      </p>
    </div>
  );
}