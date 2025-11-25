'use client';

import { Sprout, User, Trophy, Crown } from 'lucide-react';
import type { OnboardingFormData, TrainingExperience } from '@/types/database';

interface ExperienceStepProps {
  formData: OnboardingFormData;
  setFormData: (data: OnboardingFormData) => void;
}

const EXPERIENCE_OPTIONS: Array<{
  value: TrainingExperience;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = [
  {
    value: 'complete_beginner',
    label: 'Complete Beginner',
    description: 'Never trained before or just starting out',
    icon: Sprout,
    color: 'green',
  },
  {
    value: 'beginner',
    label: 'Beginner',
    description: 'Less than 6 months of consistent training',
    icon: User,
    color: 'blue',
  },
  {
    value: 'intermediate',
    label: 'Intermediate',
    description: '6 months to 2 years of consistent training',
    icon: Trophy,
    color: 'purple',
  },
  {
    value: 'advanced',
    label: 'Advanced',
    description: '2+ years of consistent, structured training',
    icon: Crown,
    color: 'yellow',
  },
];

export default function ExperienceStep({ formData, setFormData }: ExperienceStepProps) {
  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors = {
      green: isSelected ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-green-300',
      blue: isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300',
      purple: isSelected ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-purple-300',
      yellow: isSelected ? 'border-yellow-600 bg-yellow-50' : 'border-gray-200 hover:border-yellow-300',
    };
    return colors[color as keyof typeof colors];
  };

  const getIconColor = (color: string) => {
    const colors = {
      green: 'text-green-600',
      blue: 'text-blue-600',
      purple: 'text-purple-600',
      yellow: 'text-yellow-600',
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          What's Your Training Experience?
        </h2>
        <p className="text-gray-600">
          This helps me set the right difficulty level and progression speed for your program.
        </p>
      </div>

      {/* Experience Level Selection */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {EXPERIENCE_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = formData.training_experience === option.value;

          return (
            <button
              key={option.value}
              onClick={() => setFormData({ ...formData, training_experience: option.value })}
              className={`text-left p-6 border-2 rounded-xl transition-all ${getColorClasses(
                option.color,
                isSelected
              )}`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${isSelected ? 'bg-white' : 'bg-gray-50'}`}>
                  <Icon className={`w-6 h-6 ${getIconColor(option.color)}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">{option.label}</h3>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
                {isSelected && (
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Years Training */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          How many years have you been training consistently?
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={formData.years_training}
            onChange={(e) => setFormData({ ...formData, years_training: parseFloat(e.target.value) })}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
          <div className="w-20 text-center">
            <span className="text-2xl font-bold text-purple-600">
              {formData.years_training}
            </span>
            <span className="text-sm text-gray-600 ml-1">
              {formData.years_training === 1 ? 'year' : 'years'}
            </span>
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Just started</span>
          <span>10+ years</span>
        </div>
      </div>

      {/* Previous Programs */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Any previous programs you've tried? <span className="text-gray-400">(Optional)</span>
        </label>
        <textarea
          value={formData.previous_programs}
          onChange={(e) => setFormData({ ...formData, previous_programs: e.target.value })}
          placeholder="e.g., 'StrongLifts 5x5 for 3 months' or 'Push/Pull/Legs split'"
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
        />
        <p className="text-xs text-gray-500 mt-2">
          This helps me understand what has or hasn't worked for you in the past.
        </p>
      </div>
    </div>
  );
}