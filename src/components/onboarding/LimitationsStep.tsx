'use client';

import { Plus, X, AlertCircle } from 'lucide-react';
import type { OnboardingFormData, InjurySeverity } from '@/types/database';

interface LimitationsStepProps {
  formData: OnboardingFormData;
  setFormData: (data: OnboardingFormData) => void;
}

const BODY_PARTS = [
  'Shoulder', 'Elbow', 'Wrist', 'Lower Back', 'Upper Back', 'Hip', 'Knee', 'Ankle', 'Neck', 'Other'
];

const SEVERITY_OPTIONS: Array<{ value: InjurySeverity; label: string; color: string }> = [
  { value: 'minor', label: 'Minor', color: 'green' },
  { value: 'moderate', label: 'Moderate', color: 'yellow' },
  { value: 'severe', label: 'Severe', color: 'red' },
];

export default function LimitationsStep({ formData, setFormData }: LimitationsStepProps) {
  const addInjury = () => {
    const newInjury = {
      body_part: '',
      description: '',
      severity: 'moderate' as InjurySeverity,
      occurred_at: new Date().toISOString().split('T')[0],
    };
    setFormData({
      ...formData,
      current_injuries: [...formData.current_injuries, newInjury],
    });
  };

  const removeInjury = (index: number) => {
    setFormData({
      ...formData,
      current_injuries: formData.current_injuries.filter((_, i) => i !== index),
    });
  };

  const updateInjury = (index: number, field: string, value: string) => {
    const updated = [...formData.current_injuries];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, current_injuries: updated });
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Any Injuries or Limitations?
        </h2>
        <p className="text-gray-600">
          This helps me design a safe program that works around your limitations and prevents further injury.
        </p>
      </div>

      {/* Current Injuries */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            Current Injuries or Pain
          </label>
          <button
            onClick={addInjury}
            className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Injury
          </button>
        </div>

        {formData.current_injuries.length === 0 ? (
          <div className="p-6 border-2 border-dashed border-gray-300 rounded-xl text-center">
            <p className="text-gray-500 mb-3">No injuries reported</p>
            <button
              onClick={addInjury}
              className="text-purple-600 hover:text-purple-700 font-medium text-sm"
            >
              + Add an injury or limitation
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {formData.current_injuries.map((injury, index) => (
              <div key={index} className="p-4 border-2 border-gray-200 rounded-xl">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="text-sm font-semibold text-gray-900">Injury #{index + 1}</h4>
                  <button
                    onClick={() => removeInjury(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Body Part */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Body Part *
                    </label>
                    <select
                      value={injury.body_part}
                      onChange={(e) => updateInjury(index, 'body_part', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                      required
                    >
                      <option value="">Select...</option>
                      {BODY_PARTS.map((part) => (
                        <option key={part} value={part}>{part}</option>
                      ))}
                    </select>
                  </div>

                  {/* Severity */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Severity *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {SEVERITY_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => updateInjury(index, 'severity', option.value)}
                          className={`py-2 px-3 text-xs font-medium rounded-lg border-2 transition-all ${
                            injury.severity === option.value
                              ? `border-${option.color}-600 bg-${option.color}-50 text-${option.color}-700`
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* When */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      When did it happen?
                    </label>
                    <input
                      type="date"
                      value={injury.occurred_at}
                      onChange={(e) => updateInjury(index, 'occurred_at', e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={injury.description}
                      onChange={(e) => updateInjury(index, 'description', e.target.value)}
                      placeholder="e.g., 'Pain when reaching overhead' or 'Clicking in knee during squats'"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm resize-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Movement Restrictions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Any movements you can't do? <span className="text-gray-400">(Optional)</span>
        </label>
        <textarea
          value={formData.movement_restrictions}
          onChange={(e) => setFormData({ ...formData, movement_restrictions: e.target.value })}
          placeholder="e.g., 'Can't do overhead press due to shoulder impingement' or 'No jumping movements'"
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
        />
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 text-sm mb-1">Important</h4>
            <p className="text-xs text-blue-800">
              I'll design your program to work around these injuries and suggest safe alternatives. 
              However, always consult with a medical professional for serious or persistent injuries.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}