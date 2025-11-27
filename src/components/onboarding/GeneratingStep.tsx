'use client';

import { useEffect, useState, useRef } from 'react';
import { Brain, CheckCircle, Loader2 } from 'lucide-react';
import type { OnboardingFormData } from '@/types/database';
import { generatePersonalizedProgram } from '@/lib/ai/onboarding/program-generator';

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
  
  // Use ref to prevent multiple generations in React Strict Mode
  const hasGenerated = useRef(false);

  useEffect(() => {
    if (hasGenerated.current) {
      return;
    }

    const generate = async () => {
      hasGenerated.current = true;
      try {
        // Start the generation process
        console.log('🚀 Starting generation process...');
        
        // Call the generator (Program + Nutrition)
        const { program, nutrition } = await generatePersonalizedProgram(formData, userId);
        
        // Fast-forward the UI steps once data is ready
        setCurrentStepIndex(GENERATION_STEPS.length - 1);
        
        // Small delay to let the user see the "Finalizing" state
        setTimeout(() => {
          console.log('✅ Generation complete, passing data to ReviewStep');
          onComplete(program, nutrition);
        }, 1000);

      } catch (err) {
        console.error('❌ Generation failed:', err);
        setError('Failed to generate program. Please try again.');
        hasGenerated.current = false;
      }
    };

    // Start the visual progress bar timer independent of the API call
    const progressInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < GENERATION_STEPS.length - 2) {
          return prev + 1;
        }
        return prev;
      });
    }, 2500);

    generate();

    return () => clearInterval(progressInterval);
  }, [formData, userId, onComplete]);

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-block p-4 bg-purple-100 rounded-full mb-6 animate-pulse">
          <Brain className="w-12 h-12 text-purple-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Building Your Personal Plan
        </h2>
        <p className="text-gray-600">
          I'm analyzing your profile and designing a program that fits your schedule and goals.
        </p>
      </div>

      <div className="space-y-4">
        {GENERATION_STEPS.map((step, index) => {
          const isComplete = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          
          return (
            <div 
              key={index}
              className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-500 ${
                isComplete 
                  ? 'bg-green-50 border-2 border-green-200' 
                  : isCurrent 
                  ? 'bg-purple-50 border-2 border-purple-300 scale-105 shadow-md' 
                  : 'bg-gray-50 border-2 border-gray-100 opacity-50'
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
              <span className={`font-medium ${
                isComplete ? 'text-green-900' : isCurrent ? 'text-purple-900' : 'text-gray-500'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}