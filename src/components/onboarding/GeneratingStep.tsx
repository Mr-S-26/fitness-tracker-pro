'use client';

import { useEffect, useState } from 'react';
import { Brain, CheckCircle, Loader2 } from 'lucide-react';
import type { OnboardingFormData } from '@/types/database';
import { generatePersonalizedProgram } from '@/lib/ai/onboarding/program-generator';
import { calculateNutritionPlan } from '@/lib/nutrition/macro-calculator';

interface GeneratingStepProps {
  formData: OnboardingFormData;
  userId: string;
  onComplete: (program: any, nutrition: any) => void;
}

const GENERATION_STEPS = [
  { label: 'Analyzing your profile', duration: 2000 },
  { label: 'Designing your program', duration: 5000 },
  { label: 'Calculating nutrition targets', duration: 2000 },
  { label: 'Creating week-by-week progression', duration: 3000 },
  { label: 'Finalizing recommendations', duration: 2000 },
];

export default function GeneratingStep({ formData, userId, onComplete }: GeneratingStepProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  const generate = async () => {
    try {
      // ✅ FIX: Validate required fields before generation
      if (!formData.primary_goal) {
        setError('Primary goal is required');
        return;
      }
      
      if (!formData.training_experience) {
        setError('Training experience is required');
        return;
      }
      
      if (!formData.available_equipment || formData.available_equipment.length === 0) {
        setError('Please select at least one equipment option');
        return;
      }

      // Simulate step progression
      for (let i = 0; i < GENERATION_STEPS.length; i++) {
        setCurrentStepIndex(i);
        await new Promise(resolve => setTimeout(resolve, GENERATION_STEPS[i].duration));
      }

      // ✅ FIX: Add try-catch around program generation
      console.log('🏋️ Generating workout program...');
      let program;
      try {
        program = await generatePersonalizedProgram(formData, userId);
        console.log('✅ Program generated:', program.program_name);
      } catch (programError) {
        console.error('❌ Program generation failed:', programError);
        throw new Error('Failed to generate workout program. Please try again.');
      }
      
      // ✅ FIX: Add try-catch around nutrition calculation
      console.log('🥗 Calculating nutrition plan...');
      let nutrition;
      try {
        nutrition = calculateNutritionPlan(formData);
        console.log('✅ Nutrition calculated:', nutrition.daily_calories, 'calories');
      } catch (nutritionError) {
        console.error('❌ Nutrition calculation failed:', nutritionError);
        throw new Error('Failed to calculate nutrition plan. Please try again.');
      }

      // Mark as complete
      setCurrentStepIndex(GENERATION_STEPS.length);
      
      // Wait a bit before proceeding
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onComplete(program, nutrition);
      
    } catch (err) {
      console.error('❌ Generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate program. Please try again.');
    }
  };

  generate();
}, [formData, userId, onComplete]);

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mb-6 animate-pulse">
          <Brain className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Creating Your Program...
        </h2>
        <p className="text-gray-600">
          This takes about 15-20 seconds. Hang tight!
        </p>
      </div>

      {/* Profile Summary */}
      <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl">
        <h3 className="font-semibold text-gray-900 mb-3">📋 Your Profile Summary</h3>
        <div className="grid md:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-600">Goal:</span>
            <span className="ml-2 font-semibold text-gray-900 capitalize">
              {formData.primary_goal?.replace('_', ' ')}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Experience:</span>
            <span className="ml-2 font-semibold text-gray-900 capitalize">
              {formData.training_experience?.replace('_', ' ')}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Schedule:</span>
            <span className="ml-2 font-semibold text-gray-900">
              {formData.available_days_per_week} days/week
            </span>
          </div>
          <div>
            <span className="text-gray-600">Equipment:</span>
            <span className="ml-2 font-semibold text-gray-900">
              {formData.available_equipment?.length || 0} items
            </span>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="space-y-3">
        {GENERATION_STEPS.map((step, index) => {
          const isComplete = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isPending = index > currentStepIndex;

          return (
            <div
              key={index}
              className={`flex items-center gap-3 p-4 rounded-lg transition-all ${
                isComplete
                  ? 'bg-green-50 border-2 border-green-200'
                  : isCurrent
                  ? 'bg-purple-50 border-2 border-purple-300 scale-105'
                  : 'bg-gray-50 border-2 border-gray-200'
              }`}
            >
              <div className="flex-shrink-0">
                {isComplete ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : isCurrent ? (
                  <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
                ) : (
                  <div className="w-6 h-6 bg-gray-300 rounded-full" />
                )}
              </div>
              <span
                className={`text-sm font-medium ${
                  isComplete
                    ? 'text-green-900'
                    : isCurrent
                    ? 'text-purple-900'
                    : 'text-gray-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Fun Facts */}
      <div className="mt-8 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
        <h4 className="font-semibold text-blue-900 text-sm mb-2">💡 Did you know?</h4>
        <p className="text-xs text-blue-800">
          I'm analyzing thousands of exercise combinations to find the perfect match for your equipment and goals. 
          Your program will be completely unique to you!
        </p>
      </div>
    </div>
  );
}