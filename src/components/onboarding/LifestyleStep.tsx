'use client';

import { Moon, Zap, Apple, Leaf } from 'lucide-react';
import type { OnboardingFormData, DietaryPreference } from '@/types/database';

interface LifestyleStepProps {
  formData: OnboardingFormData;
  setFormData: (data: OnboardingFormData) => void;
}

const DIETARY_PREFERENCES: Array<{
  value: DietaryPreference;
  label: string;
  description: string;
}> = [
  { value: 'vegetarian', label: 'Vegetarian', description: 'No meat' },
  { value: 'vegan', label: 'Vegan', description: 'No animal products' },
  { value: 'keto', label: 'Keto', description: 'Low carb, high fat' },
  { value: 'paleo', label: 'Paleo', description: 'Whole foods' },
  { value: 'none', label: 'No Restrictions', description: 'I eat everything' },
];

export default function LifestyleStep({ formData, setFormData }: LifestyleStepProps) {
  const toggleDietaryPreference = (pref: DietaryPreference) => {
    const current = formData.dietary_preferences || [];
    
    // If selecting 'none', clear all others
    if (pref === 'none') {
      setFormData({ ...formData, dietary_preferences: ['none'] });
      return;
    }
    
    // If selecting anything else, remove 'none'
    let updated = current.filter(p => p !== 'none');
    
    if (updated.includes(pref)) {
      updated = updated.filter(p => p !== pref);
    } else {
      updated = [...updated, pref];
    }
    
    setFormData({ ...formData, dietary_preferences: updated });
  };

  const getStressColor = (level: number) => {
    if (level <= 2) return 'bg-green-500';
    if (level <= 3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStressLabel = (level: number) => {
    if (level === 1) return '😌 Very Low';
    if (level === 2) return '🙂 Low';
    if (level === 3) return '😐 Moderate';
    if (level === 4) return '😰 High';
    return '🤯 Very High';
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Lifestyle Factors
        </h2>
        <p className="text-gray-600">
          These factors affect your recovery, performance, and how aggressively I'll program your training.
        </p>
      </div>

      {/* Sleep */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
          <Moon className="w-5 h-5 text-purple-600" />
          Average Sleep Per Night
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="4"
            max="10"
            step="0.5"
            value={formData.average_sleep_hours}
            onChange={(e) => setFormData({ ...formData, average_sleep_hours: parseFloat(e.target.value) })}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
          <div className="w-24 text-center">
            <span className="text-2xl font-bold text-purple-600">
              {formData.average_sleep_hours}
            </span>
            <span className="text-sm text-gray-600 ml-1">hrs</span>
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>4 hours</span>
          <span>10 hours</span>
        </div>
        {formData.average_sleep_hours < 7 && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              💡 Less than 7 hours may affect recovery. I'll adjust your program volume accordingly.
            </p>
          </div>
        )}
      </div>

      {/* Stress Level */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-600" />
          Current Stress Level
        </label>
        <div className="grid grid-cols-5 gap-2 mb-3">
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              onClick={() => setFormData({ ...formData, stress_level: level })}
              className={`py-3 rounded-lg font-semibold transition-all ${
                formData.stress_level === level
                  ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 justify-center">
          <div className={`w-3 h-3 rounded-full ${getStressColor(formData.stress_level)}`} />
          <span className="text-sm font-medium text-gray-700">
            {getStressLabel(formData.stress_level)}
          </span>
        </div>
        {formData.stress_level >= 4 && (
          <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-xs text-orange-800">
              💡 High stress affects recovery. I'll program more deload weeks and lower volume.
            </p>
          </div>
        )}
      </div>

      {/* Nutrition Tracking */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
          <Apple className="w-5 h-5 text-purple-600" />
          Do you track your nutrition?
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setFormData({ ...formData, nutrition_tracking: true })}
            className={`p-4 border-2 rounded-xl transition-all ${
              formData.nutrition_tracking
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">✅</div>
              <div className="font-semibold text-gray-900">Yes</div>
              <div className="text-xs text-gray-600 mt-1">I track calories/macros</div>
            </div>
          </button>
          <button
            onClick={() => setFormData({ ...formData, nutrition_tracking: false })}
            className={`p-4 border-2 rounded-xl transition-all ${
              !formData.nutrition_tracking
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🤷</div>
              <div className="font-semibold text-gray-900">No</div>
              <div className="text-xs text-gray-600 mt-1">I eat intuitively</div>
            </div>
          </button>
        </div>
      </div>

      {/* Dietary Preferences */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
          <Leaf className="w-5 h-5 text-purple-600" />
          Dietary Preferences <span className="text-gray-400">(Select all that apply)</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {DIETARY_PREFERENCES.map((pref) => {
            const isSelected = formData.dietary_preferences?.includes(pref.value);

            return (
              <button
                key={pref.value}
                onClick={() => toggleDietaryPreference(pref.value)}
                className={`p-4 border-2 rounded-xl text-left transition-all ${
                  isSelected
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold text-gray-900 mb-1">{pref.label}</div>
                <div className="text-xs text-gray-600">{pref.description}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}