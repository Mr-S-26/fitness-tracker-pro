'use client';

import { Target, Zap, TrendingDown, Heart, Trophy } from 'lucide-react';
import type { OnboardingFormData, PrimaryGoal } from '@/types/database';

interface GoalsStepProps {
  formData: OnboardingFormData;
  setFormData: (data: OnboardingFormData) => void;
}

const GOAL_OPTIONS: Array<{
  value: PrimaryGoal;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = [
  {
    value: 'muscle_gain',
    label: 'Build Muscle',
    description: 'Gain lean muscle mass and size',
    icon: Trophy,
    color: 'purple',
  },
  {
    value: 'strength',
    label: 'Get Stronger',
    description: 'Increase your lifts and overall strength',
    icon: Zap,
    color: 'yellow',
  },
  {
    value: 'fat_loss',
    label: 'Lose Fat',
    description: 'Reduce body fat while maintaining muscle',
    icon: TrendingDown,
    color: 'red',
  },
  {
    value: 'general_fitness',
    label: 'General Fitness',
    description: 'Improve overall health and wellness',
    icon: Heart,
    color: 'green',
  },
  {
    value: 'athletic_performance',
    label: 'Athletic Performance',
    description: 'Enhance sport-specific performance',
    icon: Target,
    color: 'blue',
  },
];

export default function GoalsStep({ formData, setFormData }: GoalsStepProps) {
  const handleGoalSelect = (goal: PrimaryGoal) => {
    setFormData({ ...formData, primary_goal: goal });
  };

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors = {
      purple: isSelected
        ? 'border-purple-600 bg-purple-50'
        : 'border-gray-200 hover:border-purple-300',
      yellow: isSelected
        ? 'border-yellow-600 bg-yellow-50'
        : 'border-gray-200 hover:border-yellow-300',
      red: isSelected
        ? 'border-red-600 bg-red-50'
        : 'border-gray-200 hover:border-red-300',
      green: isSelected
        ? 'border-green-600 bg-green-50'
        : 'border-gray-200 hover:border-green-300',
      blue: isSelected
        ? 'border-blue-600 bg-blue-50'
        : 'border-gray-200 hover:border-blue-300',
    };
    return colors[color as keyof typeof colors];
  };

  const getIconColor = (color: string) => {
    const colors = {
      purple: 'text-purple-600',
      yellow: 'text-yellow-600',
      red: 'text-red-600',
      green: 'text-green-600',
      blue: 'text-blue-600',
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          What's Your Main Goal?
        </h2>
        <p className="text-gray-600">
          This helps me design the right program structure, rep ranges, and progression strategy for you.
        </p>
      </div>

      {/* Goal Selection Grid */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {GOAL_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = formData.primary_goal === option.value;

          return (
            <button
              key={option.value}
              onClick={() => handleGoalSelect(option.value)}
              className={`text-left p-6 border-2 rounded-xl transition-all ${getColorClasses(
                option.color,
                isSelected
              )}`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-lg ${
                    isSelected ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <Icon className={`w-6 h-6 ${getIconColor(option.color)}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">
                    {option.label}
                  </h3>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
                {isSelected && (
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Specific Goals (Optional) */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Any Specific Goals? <span className="text-gray-400">(Optional)</span>
          </label>
          <textarea
            value={formData.specific_goals}
            onChange={(e) =>
              setFormData({ ...formData, specific_goals: e.target.value })
            }
            placeholder="e.g., 'Bench press 100kg by June' or 'Lose 10kg while maintaining strength'"
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Date? <span className="text-gray-400">(Optional)</span>
          </label>
          <input
            type="date"
            value={formData.target_date || ''}
            onChange={(e) =>
              setFormData({ ...formData, target_date: e.target.value })
            }
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
      </div>
    </div>
  );
}