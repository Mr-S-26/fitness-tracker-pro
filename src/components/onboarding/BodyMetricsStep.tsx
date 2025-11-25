'use client';

import React from 'react';
import { Ruler, Scale, User, Calendar } from 'lucide-react';
import type { OnboardingFormData } from '@/types/database';

interface BodyMetricsStepProps {
  formData: OnboardingFormData;
  setFormData: (data: OnboardingFormData) => void;
}

export default function BodyMetricsStep({ formData, setFormData }: BodyMetricsStepProps) {
  const [heightUnit, setHeightUnit] = React.useState<'cm' | 'ft'>('cm');
  const [weightUnit, setWeightUnit] = React.useState<'kg' | 'lbs'>('kg');

  // Convert height
  const heightInFt = Math.floor(formData.height_cm / 30.48);
  const heightInInches = Math.round((formData.height_cm / 2.54) % 12);

  const setHeightInFt = (ft: number, inches: number) => {
    const totalCm = Math.round(ft * 30.48 + inches * 2.54);
    setFormData({ ...formData, height_cm: totalCm });
  };

  // Convert weight
  const weightInLbs = Math.round(formData.weight_kg * 2.205);

  const setWeightInLbs = (lbs: number) => {
    const kg = Math.round((lbs / 2.205) * 10) / 10;
    setFormData({ ...formData, weight_kg: kg });
  };

  const calculateBMI = () => {
    const heightM = formData.height_cm / 100;
    return (formData.weight_kg / (heightM * heightM)).toFixed(1);
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Tell Me About Your Body
        </h2>
        <p className="text-gray-600">
          This helps me calculate your nutrition needs and track your progress over time.
        </p>
      </div>

      {/* Height */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
            <Ruler className="w-5 h-5 text-purple-600" />
            Height *
          </label>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setHeightUnit('cm')}
              className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                heightUnit === 'cm'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              cm
            </button>
            <button
              onClick={() => setHeightUnit('ft')}
              className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                heightUnit === 'ft'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              ft/in
            </button>
          </div>
        </div>

        {heightUnit === 'cm' ? (
          <div>
            <input
              type="number"
              value={formData.height_cm}
              onChange={(e) => setFormData({ ...formData, height_cm: parseInt(e.target.value) || 0 })}
              min="120"
              max="250"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-lg font-semibold"
              placeholder="170"
            />
            <p className="text-xs text-gray-500 mt-2">
              {heightInFt}' {heightInInches}" ({formData.height_cm} cm)
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Feet</label>
              <input
                type="number"
                value={heightInFt}
                onChange={(e) => setHeightInFt(parseInt(e.target.value) || 0, heightInInches)}
                min="4"
                max="8"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-lg font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Inches</label>
              <input
                type="number"
                value={heightInInches}
                onChange={(e) => setHeightInFt(heightInFt, parseInt(e.target.value) || 0)}
                min="0"
                max="11"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-lg font-semibold"
              />
            </div>
          </div>
        )}
      </div>

      {/* Weight */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
            <Scale className="w-5 h-5 text-purple-600" />
            Current Weight *
          </label>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setWeightUnit('kg')}
              className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                weightUnit === 'kg'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              kg
            </button>
            <button
              onClick={() => setWeightUnit('lbs')}
              className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                weightUnit === 'lbs'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              lbs
            </button>
          </div>
        </div>

        {weightUnit === 'kg' ? (
          <div>
            <input
              type="number"
              value={formData.weight_kg}
              onChange={(e) => setFormData({ ...formData, weight_kg: parseFloat(e.target.value) || 0 })}
              min="30"
              max="200"
              step="0.1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-lg font-semibold"
              placeholder="70"
            />
            <p className="text-xs text-gray-500 mt-2">
              {weightInLbs} lbs
            </p>
          </div>
        ) : (
          <div>
            <input
              type="number"
              value={weightInLbs}
              onChange={(e) => setWeightInLbs(parseInt(e.target.value) || 0)}
              min="66"
              max="440"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-lg font-semibold"
              placeholder="154"
            />
            <p className="text-xs text-gray-500 mt-2">
              {formData.weight_kg} kg
            </p>
          </div>
        )}
      </div>

      {/* Age */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          Age *
        </label>
        <input
          type="number"
          value={formData.age}
          onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
          min="13"
          max="100"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-lg font-semibold"
          placeholder="25"
        />
      </div>

      {/* Sex */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <User className="w-5 h-5 text-purple-600" />
          Biological Sex * <span className="text-xs text-gray-500 font-normal">(for TDEE calculation)</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(['male', 'female', 'other'] as const).map((sex) => (
            <button
              key={sex}
              onClick={() => setFormData({ ...formData, sex })}
              className={`py-3 px-4 border-2 rounded-xl font-medium capitalize transition-all ${
                formData.sex === sex
                  ? 'border-purple-600 bg-purple-50 text-purple-700'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              {sex}
            </button>
          ))}
        </div>
      </div>

      {/* Body Fat % (Optional) */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Body Fat Percentage <span className="text-gray-400">(Optional)</span>
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={formData.body_fat_percentage || ''}
            onChange={(e) => setFormData({ ...formData, body_fat_percentage: parseFloat(e.target.value) || undefined })}
            min="5"
            max="50"
            step="0.1"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="Leave blank if unknown"
          />
          <span className="text-gray-600 font-semibold">%</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          If you don't know this, that's totally fine! I'll help you track it over time.
        </p>
      </div>

      {/* BMI Display */}
      {formData.height_cm > 0 && formData.weight_kg > 0 && (
        <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">📊 Quick Stats</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">BMI:</span>
              <span className="ml-2 font-bold text-gray-900">{calculateBMI()}</span>
            </div>
            <div>
              <span className="text-gray-600">Age:</span>
              <span className="ml-2 font-bold text-gray-900">{formData.age} years</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}