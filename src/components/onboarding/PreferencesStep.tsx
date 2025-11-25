'use client';

import { Shield, TrendingUp, Heart, Mic, Volume2 } from 'lucide-react';
import type { OnboardingFormData, CoachingStyle, MotivationType } from '@/types/database';

interface PreferencesStepProps {
  formData: OnboardingFormData;
  setFormData: (data: OnboardingFormData) => void;
}

const COACHING_STYLES: Array<{
  value: CoachingStyle;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  example: string;
}> = [
  {
    value: 'strict',
    label: 'Strict',
    description: 'No excuses, push hard every session',
    icon: Shield,
    example: '"You can do 2 more reps. Let\'s go!"',
  },
  {
    value: 'balanced',
    label: 'Balanced',
    description: 'Mix of pushing and understanding',
    icon: Heart,
    example: '"Good effort! Let\'s try one more set."',
  },
  {
    value: 'supportive',
    label: 'Supportive',
    description: 'Encouraging and understanding',
    icon: Heart,
    example: '"Great job today! Listen to your body."',
  },
];

const MOTIVATION_TYPES: Array<{
  value: MotivationType;
  label: string;
  description: string;
  example: string;
}> = [
  {
    value: 'hype',
    label: 'Hype Me Up!',
    description: 'High energy, motivational',
    example: '"LET\'S GO! YOU GOT THIS! 💪🔥"',
  },
  {
    value: 'analytical',
    label: 'Data & Science',
    description: 'Numbers, facts, explanations',
    example: '"Your volume is up 12% from last week."',
  },
  {
    value: 'calm',
    label: 'Calm & Focused',
    description: 'Professional, measured approach',
    example: '"Solid set. Maintain this intensity."',
  },
];

export default function PreferencesStep({ formData, setFormData }: PreferencesStepProps) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          How Should I Coach You?
        </h2>
        <p className="text-gray-600">
          Customize my personality and coaching style to match your preferences.
        </p>
      </div>

      {/* Coaching Style */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Coaching Style
        </label>
        <div className="space-y-3">
          {COACHING_STYLES.map((style) => {
            const Icon = style.icon;
            const isSelected = formData.coaching_style === style.value;

            return (
              <button
                key={style.value}
                onClick={() => setFormData({ ...formData, coaching_style: style.value })}
                className={`w-full p-4 border-2 rounded-xl text-left transition-all ${
                  isSelected
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${isSelected ? 'bg-white' : 'bg-gray-50'}`}>
                    <Icon className={`w-6 h-6 ${isSelected ? 'text-purple-600' : 'text-gray-400'}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">{style.label}</h4>
                    <p className="text-sm text-gray-600 mb-2">{style.description}</p>
                    <p className="text-xs italic text-gray-500">"{style.example}"</p>
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
      </div>

      {/* Motivation Type */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          How do you want motivation?
        </label>
        <div className="space-y-3">
          {MOTIVATION_TYPES.map((type) => {
            const isSelected = formData.motivation_type === type.value;

            return (
              <button
                key={type.value}
                onClick={() => setFormData({ ...formData, motivation_type: type.value })}
                className={`w-full p-4 border-2 rounded-xl text-left transition-all ${
                  isSelected
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">{type.label}</h4>
                    <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                    <p className="text-xs italic text-gray-500">{type.example}</p>
                  </div>
                  {isSelected && (
                    <div className="flex-shrink-0 ml-3">
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
      </div>

      {/* Voice Coaching */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
          <Mic className="w-5 h-5 text-purple-600" />
          Voice Coaching
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setFormData({ ...formData, wants_voice_coaching: true })}
            className={`p-6 border-2 rounded-xl transition-all ${
              formData.wants_voice_coaching
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Volume2 className={`w-8 h-8 mx-auto mb-3 ${formData.wants_voice_coaching ? 'text-purple-600' : 'text-gray-400'}`} />
            <h4 className="font-bold text-gray-900 mb-1">Voice On</h4>
            <p className="text-xs text-gray-600">I'll speak during rest timers and give audio cues</p>
          </button>
          <button
            onClick={() => setFormData({ ...formData, wants_voice_coaching: false })}
            className={`p-6 border-2 rounded-xl transition-all ${
              !formData.wants_voice_coaching
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Volume2 className={`w-8 h-8 mx-auto mb-3 ${!formData.wants_voice_coaching ? 'text-purple-600' : 'text-gray-400'} opacity-50`} />
            <h4 className="font-bold text-gray-900 mb-1">Text Only</h4>
            <p className="text-xs text-gray-600">Silent mode, I'll only show text feedback</p>
          </button>
        </div>
      </div>

      {/* Preview Box */}
      <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl">
        <h4 className="font-semibold text-gray-900 mb-2">🤖 Your AI Coach Preview</h4>
        <p className="text-sm text-gray-700">
          <strong>Style:</strong> {formData.coaching_style} •{' '}
          <strong>Motivation:</strong> {formData.motivation_type} •{' '}
          <strong>Voice:</strong> {formData.wants_voice_coaching ? 'Enabled' : 'Disabled'}
        </p>
      </div>
    </div>
  );
}