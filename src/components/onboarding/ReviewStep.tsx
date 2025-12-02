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
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async () => {
    setSaving(true);
    setError(null);
    
    console.log('💾 Starting to save onboarding data...');
    console.log('👤 User ID:', userId);
    console.log('📋 Form Data:', formData);
    
    try {
      // ✅ Step 1: Save fitness profile
      console.log('📝 Saving fitness profile...');
      
      const profileData = {
        user_id: userId,
        
        // Goals
        primary_goal: formData.primary_goal || null,
        specific_goals: formData.specific_goals || null,
        target_date: formData.target_date || null,
        
        // Experience
        training_experience: formData.training_experience || null,
        years_training: formData.years_training || 0,
        previous_programs: formData.previous_programs || null,
        
        // Schedule
        available_days_per_week: formData.available_days_per_week || 3,
        session_duration_minutes: formData.session_duration_minutes || 60,
        
        // ✅ FIX: Use new fields and map to DB structure
        preferred_workout_time: formData.preferred_workout_time || null,
        reminders_enabled: formData.reminders_enabled || false,
        // Backward compatibility: map single time to array
        preferred_training_times: formData.preferred_workout_time ? [formData.preferred_workout_time] : [],
        
        // Equipment
        training_location: formData.training_location || null,
        available_equipment: formData.available_equipment || [],
        
        // Limitations
        movement_restrictions: formData.movement_restrictions || null,
        
        // Body Metrics
        height_cm: formData.height_cm || 170,
        weight_kg: formData.weight_kg || 70,
        body_fat_percentage: formData.body_fat_percentage || null,
        age: formData.age || 25, // ✅ CRITICAL: Include age
        sex: formData.sex || 'male', // ✅ CRITICAL: Include sex
        
        // Lifestyle
        average_sleep_hours: formData.average_sleep_hours || 7,
        stress_level: formData.stress_level || 3,
        nutrition_tracking: formData.nutrition_tracking || false,
        dietary_preferences: formData.dietary_preferences || [],
        
        // AI Preferences
        coaching_style: formData.coaching_style || 'balanced',
        motivation_type: formData.motivation_type || 'analytical',
        wants_voice_coaching: formData.wants_voice_coaching !== undefined ? formData.wants_voice_coaching : true,
        
        // Status
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
      };
      
      console.log('📤 Profile data to save:', profileData);

      const { error: profileError } = await supabase
        .from('user_fitness_profiles')
        .upsert(profileData, {
          onConflict: 'user_id'
        });

      if (profileError) {
        console.error('❌ Profile save error:', profileError);
        throw new Error(`Failed to save profile: ${profileError.message}`);
      }
      console.log('✅ Profile saved successfully');

      // ✅ Step 2: Save injuries if any
      if (formData.current_injuries && formData.current_injuries.length > 0) {
        console.log('🩹 Saving injuries...');
        
        const injuriesToSave = formData.current_injuries.map(injury => ({
          user_id: userId,
          body_part: injury.body_part,
          description: injury.description || null,
          severity: injury.severity,
          active: true,
          occurred_at: injury.occurred_at,
        }));

        const { error: injuriesError } = await supabase
          .from('user_injuries')
          .insert(injuriesToSave);

        if (injuriesError) {
          console.error('⚠️ Injuries save error (non-critical):', injuriesError);
          // Don't fail the whole process for injuries
        } else {
          console.log('✅ Injuries saved successfully');
        }
      }

      // ✅ Step 3: Save nutrition plan
      if (nutrition) {
        console.log('🥗 Saving nutrition plan...');
        
        const nutritionData = {
          user_id: userId,
          goal: nutrition.goal || formData.primary_goal || 'general_fitness',
          bmr: nutrition.bmr || 1500,
          tdee: nutrition.tdee || 2000,
          daily_calories: nutrition.daily_calories || 2000,
          protein_grams: nutrition.protein_grams || 150,
          carbs_grams: nutrition.carbs_grams || 200,
          fat_grams: nutrition.fat_grams || 60,
          meal_timing_strategy: nutrition.meal_timing_strategy || null,
          pre_workout_meal: nutrition.pre_workout_meal || null,
          post_workout_meal: nutrition.post_workout_meal || null,
          hydration_oz: nutrition.hydration_oz || 64,
          recommended_supplements: nutrition.recommended_supplements || null,
          active: true,
        };

        const { error: nutritionError } = await supabase
          .from('nutrition_plans')
          .insert(nutritionData);

        if (nutritionError) {
          console.error('❌ Nutrition save error:', nutritionError);
          throw new Error(`Failed to save nutrition: ${nutritionError.message}`);
        }
        console.log('✅ Nutrition plan saved successfully');
      }

      // ✅ Step 4: Save program version
      if (program) {
        console.log('💪 Saving program...');
        
        const programData = {
          user_id: userId,
          version_number: 1,
          program_name: program.program_name || 'Initial Program',
          program_overview: program.program_overview || '',
          duration_weeks: program.duration_weeks || 12,
          program_data: program,
          reason_for_change: 'Initial onboarding program',
          change_type: 'initial',
          active: true,
        };

        const { error: programError } = await supabase
          .from('ai_program_versions')
          .insert(programData);

        if (programError) {
          console.error('❌ Program save error:', programError);
          throw new Error(`Failed to save program: ${programError.message}`);
        }
        console.log('✅ Program saved successfully');
      }

      console.log('🎉 All data saved successfully!');
      
      // Success!
      onComplete();
      
    } catch (err) {
      console.error('❌ Error saving onboarding data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save your data. Please try again.';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Save Failed
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={handleComplete}
              className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300"
            >
              Restart Onboarding
            </button>
          </div>
        </div>
      </div>
    );
  }

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
      {program && (
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
      )}

      {/* Sample Week */}
      {program?.weeks && program.weeks[0] && (
        <div className="mb-6 p-6 bg-gray-50 border-2 border-gray-200 rounded-xl">
          <h4 className="font-bold text-gray-900 mb-3">📅 Week 1 - {program.weeks[0].focus}</h4>
          <div className="space-y-2">
            {program.weeks[0].workouts.slice(0, 3).map((workout: any, index: number) => (
              <div key={index} className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="font-semibold text-gray-900 text-sm mb-1">{workout.workout_name}</div>
                <div className="text-xs text-gray-600">
                  {workout.exercises?.length || 0} exercises • ~{formData.session_duration_minutes} min
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nutrition Plan */}
      {nutrition && (
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
      )}

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