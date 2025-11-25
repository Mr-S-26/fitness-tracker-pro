'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { OnboardingFormData } from '@/types/database';

// Step Components (we'll create these next)
import WelcomeStep from '@/components/onboarding/WelcomeStep';
import GoalsStep from '@/components/onboarding/GoalsStep';
import ExperienceStep from '@/components/onboarding/ExperienceStep';
import ScheduleStep from '@/components/onboarding/ScheduleStep';
import EquipmentStep from '@/components/onboarding/EquipmentStep';
import LimitationsStep from '@/components/onboarding/LimitationsStep';
import BodyMetricsStep from '@/components/onboarding/BodyMetricsStep';
import LifestyleStep from '@/components/onboarding/LifestyleStep';
import PreferencesStep from '@/components/onboarding/PreferencesStep';
import GeneratingStep from '@/components/onboarding/GeneratingStep';
import ReviewStep from '@/components/onboarding/ReviewStep';

const ONBOARDING_STEPS = [
  'welcome',
  'goals',
  'experience',
  'schedule',
  'equipment',
  'limitations',
  'body_metrics',
  'lifestyle',
  'preferences',
  'generating',
  'review'
] as const;

type OnboardingStep = typeof ONBOARDING_STEPS[number];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Form data state
// Form data state
// Form data state
const [formData, setFormData] = useState<OnboardingFormData>({
  // Goals
  primary_goal: '',
  specific_goals: '',
  target_date: undefined,
  
  // Experience
  training_experience: '',
  years_training: 0,
  previous_programs: '',
  
  // Schedule
  available_days_per_week: 3,
  session_duration_minutes: 60,
  preferred_training_times: [],
  
  // Equipment
  training_location: '',
  available_equipment: [],
  
  // Injuries
  current_injuries: [],
  movement_restrictions: '',
  
  // Body Metrics
  height_cm: 170,
  weight_kg: 70,
  body_fat_percentage: undefined,
  age: 25,
  sex: 'male',
  
  // Lifestyle
  average_sleep_hours: 7,
  stress_level: 3,
  nutrition_tracking: false,
  dietary_preferences: [],
  
  // Preferences - ✅ FIXED
  coaching_style: 'balanced',
  motivation_type: 'analytical', // ✅ Changed from 'balanced' to 'analytical'
  wants_voice_coaching: true,
});

  // Generated program data
  const [generatedProgram, setGeneratedProgram] = useState<any>(null);
  const [generatedNutrition, setGeneratedNutrition] = useState<any>(null);

  // Check if user is authenticated and already completed onboarding
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }
      
      setUserId(user.id);
      
      // Check if already completed onboarding
      const { data: profile } = await supabase
        .from('user_fitness_profiles')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .single();
      
      if (profile?.onboarding_completed) {
        router.push('/dashboard');
        return;
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, [router, supabase]);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const canProceed = (): boolean => {
    const step = ONBOARDING_STEPS[currentStep];
    
    switch (step) {
      case 'welcome':
        return true;
      case 'goals':
        return formData.primary_goal !== '';
      case 'experience':
        return formData.training_experience !== '';
      case 'schedule':
        return formData.available_days_per_week > 0 && formData.session_duration_minutes > 0;
      case 'equipment':
        return formData.training_location !== '' && formData.available_equipment.length > 0;
      case 'limitations':
        return true; // Optional step
      case 'body_metrics':
        return formData.height_cm > 0 && formData.weight_kg > 0 && formData.age > 0;
      case 'lifestyle':
        return true;
      case 'preferences':
        return true;
      case 'generating':
        return generatedProgram !== null && generatedNutrition !== null;
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    const step = ONBOARDING_STEPS[currentStep];
    
    switch (step) {
      case 'welcome':
        return <WelcomeStep />;
      case 'goals':
        return <GoalsStep formData={formData} setFormData={setFormData} />;
      case 'experience':
        return <ExperienceStep formData={formData} setFormData={setFormData} />;
      case 'schedule':
        return <ScheduleStep formData={formData} setFormData={setFormData} />;
      case 'equipment':
        return <EquipmentStep formData={formData} setFormData={setFormData} />;
      case 'limitations':
        return <LimitationsStep formData={formData} setFormData={setFormData} />;
      case 'body_metrics':
        return <BodyMetricsStep formData={formData} setFormData={setFormData} />;
      case 'lifestyle':
        return <LifestyleStep formData={formData} setFormData={setFormData} />;
      case 'preferences':
        return <PreferencesStep formData={formData} setFormData={setFormData} />;
      case 'generating':
        return (
          <GeneratingStep 
            formData={formData}
            userId={userId!}
            onComplete={(program, nutrition) => {
              setGeneratedProgram(program);
              setGeneratedNutrition(nutrition);
            }}
          />
        );
      case 'review':
        return (
          <ReviewStep 
            formData={formData}
            program={generatedProgram}
            nutrition={generatedNutrition}
            userId={userId!}
            onComplete={() => router.push('/dashboard')}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;
  const isFirstStep = currentStep === 0;
  const isGeneratingStep = ONBOARDING_STEPS[currentStep] === 'generating';
  const isReviewStep = ONBOARDING_STEPS[currentStep] === 'review';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep + 1} of {ONBOARDING_STEPS.length}
            </span>
            <span className="text-sm font-medium text-purple-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        {!isGeneratingStep && !isReviewStep && (
          <div className="flex gap-4">
            {!isFirstStep && (
              <button
                onClick={handleBack}
                className="flex-1 bg-white border-2 border-gray-300 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
              >
                ← Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex-1 py-4 rounded-xl font-semibold transition-all shadow-lg ${
                canProceed()
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isFirstStep ? "Let's Go! →" : 'Next →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}