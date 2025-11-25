'use client';

import { Calendar, Clock, Sun, Sunset, Moon } from 'lucide-react';
import type { OnboardingFormData } from '@/types/database';

interface ScheduleStepProps {
  formData: OnboardingFormData;
  setFormData: (data: OnboardingFormData) => void;
}

const TRAINING_TIMES = [
  { value: 'morning', label: 'Morning', icon: Sun, time: '6am - 12pm' },
  { value: 'afternoon', label: 'Afternoon', icon: Sunset, time: '12pm - 6pm' },
  { value: 'evening', label: 'Evening', icon: Moon, time: '6pm - 12am' },
];

const DURATION_OPTIONS = [
  { value: 30, label: '30-45 min', description: 'Quick & efficient' },
  { value: 60, label: '45-60 min', description: 'Standard sessions' },
  { value: 75, label: '60-90 min', description: 'Full workouts' },
  { value: 90, label: '90+ min', description: 'Extended training' },
];

export default function ScheduleStep({ formData, setFormData }: ScheduleStepProps) {
  const toggleTrainingTime = (time: string) => {
    const times = formData.preferred_training_times || [];
    if (times.includes(time)) {
      setFormData({
        ...formData,
        preferred_training_times: times.filter((t) => t !== time),
      });
    } else {
      setFormData({
        ...formData,
        preferred_training_times: [...times, time],
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          What's Your Training Schedule?
        </h2>
        <p className="text-gray-600">
          I'll design a program that fits your lifestyle and time availability.
        </p>
      </div>

      {/* Days Per Week */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          How many days per week can you train?
        </label>
        <div className="grid grid-cols-7 gap-2">
          {[2, 3, 4, 5, 6, 7].map((days) => (
            <button
              key={days}
              onClick={() => setFormData({ ...formData, available_days_per_week: days })}
              className={`py-4 rounded-xl font-semibold transition-all ${
                formData.available_days_per_week === days
                  ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {days}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          {formData.available_days_per_week <= 3 && 'Perfect for full-body or upper/lower splits'}
          {formData.available_days_per_week === 4 && 'Great for upper/lower or push/pull splits'}
          {formData.available_days_per_week === 5 && 'Ideal for push/pull/legs or body part splits'}
          {formData.available_days_per_week >= 6 && 'Advanced training frequency - we\'ll include proper recovery'}
        </p>
      </div>

      {/* Session Duration */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-600" />
          How long are your typical sessions?
        </label>
        <div className="grid md:grid-cols-2 gap-3">
          {DURATION_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setFormData({ ...formData, session_duration_minutes: option.value })}
              className={`p-4 border-2 rounded-xl text-left transition-all ${
                formData.session_duration_minutes === option.value
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold text-gray-900 mb-1">{option.label}</div>
              <div className="text-sm text-gray-600">{option.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Preferred Training Times */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          When do you prefer to train? <span className="text-gray-400">(Select all that apply)</span>
        </label>
        <div className="grid md:grid-cols-3 gap-3">
          {TRAINING_TIMES.map((timeOption) => {
            const Icon = timeOption.icon;
            const isSelected = formData.preferred_training_times?.includes(timeOption.value);

            return (
              <button
                key={timeOption.value}
                onClick={() => toggleTrainingTime(timeOption.value)}
                className={`p-4 border-2 rounded-xl transition-all ${
                  isSelected
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-purple-600' : 'text-gray-400'}`} />
                  <span className="font-semibold text-gray-900">{timeOption.label}</span>
                </div>
                <div className="text-xs text-gray-600">{timeOption.time}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary Box */}
      <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl">
        <h4 className="font-semibold text-gray-900 mb-2">📅 Your Training Schedule</h4>
        <p className="text-sm text-gray-700">
          <strong>{formData.available_days_per_week} days/week</strong> •{' '}
          <strong>{formData.session_duration_minutes} min sessions</strong>
          {formData.preferred_training_times && formData.preferred_training_times.length > 0 && (
            <span> • Preferred: {formData.preferred_training_times.join(', ')}</span>
          )}
        </p>
      </div>
    </div>
  );
}