'use client';

import React, { useMemo } from 'react';
import { Ruler, Scale, User, Calendar, Target, Info } from 'lucide-react';
import type { OnboardingFormData } from '@/types/database';

interface BodyMetricsStepProps {
  formData: OnboardingFormData;
  setFormData: (data: OnboardingFormData) => void;
}

export default function BodyMetricsStep({ formData, setFormData }: BodyMetricsStepProps) {
  const [heightUnit, setHeightUnit] = React.useState<'cm' | 'ft'>('cm');
  const [weightUnit, setWeightUnit] = React.useState<'kg' | 'lbs'>('kg');

  // Conversions
  const heightInFt = Math.floor(formData.height_cm / 30.48);
  const heightInInches = Math.round((formData.height_cm / 2.54) % 12);
  const weightInLbs = Math.round(formData.weight_kg * 2.205);
  const targetWeightInLbs = formData.target_weight_kg ? Math.round(formData.target_weight_kg * 2.205) : 0;

  // Handlers
  const setHeightInFt = (ft: number, inches: number) => {
    const totalCm = Math.round(ft * 30.48 + inches * 2.54);
    setFormData({ ...formData, height_cm: totalCm });
  };

  const setWeightInLbs = (lbs: number) => {
    const kg = Math.round((lbs / 2.205) * 10) / 10;
    setFormData({ ...formData, weight_kg: kg });
  };

  const setTargetWeightInLbs = (lbs: number) => {
    const kg = Math.round((lbs / 2.205) * 10) / 10;
    setFormData({ ...formData, target_weight_kg: kg });
  };

  // 🧠 SMART BMI LOGIC
  const { bmi, bmiCategory, healthyRange, suggestion } = useMemo(() => {
    if (!formData.height_cm || !formData.weight_kg) return { bmi: 0, bmiCategory: '', healthyRange: '', suggestion: '' };

    const h = formData.height_cm / 100; // meters
    const bmiVal = parseFloat((formData.weight_kg / (h * h)).toFixed(1));
    
    // Calculate Healthy Range (BMI 18.5 - 24.9)
    const minHealthy = (18.5 * h * h).toFixed(1);
    const maxHealthy = (24.9 * h * h).toFixed(1);
    
    let category = 'Normal';
    let msg = '';

    if (bmiVal < 18.5) {
      category = 'Underweight';
      msg = `Your BMI indicates you are underweight. Consider a target around ${minHealthy}kg to build strength.`;
    } else if (bmiVal >= 25 && bmiVal < 30) {
      category = 'Overweight';
      msg = `You are slightly above the standard range. A sustainable target might be ${maxHealthy}kg.`;
    } else if (bmiVal >= 30) {
      category = 'Obese';
      msg = `For long-term health, aiming towards ${maxHealthy}kg is recommended. Let's take it one step at a time!`;
    } else {
      msg = `You are in a healthy range! Maintaining this or building muscle is a great goal.`;
    }

    return { 
      bmi: bmiVal, 
      bmiCategory: category, 
      healthyRange: `${minHealthy}kg - ${maxHealthy}kg`,
      suggestion: msg 
    };
  }, [formData.height_cm, formData.weight_kg]);

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
            <Ruler className="w-5 h-5 text-purple-600" /> Height *
          </label>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button onClick={() => setHeightUnit('cm')} className={`px-3 py-1 text-xs font-medium rounded transition-all ${heightUnit === 'cm' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}>cm</button>
            <button onClick={() => setHeightUnit('ft')} className={`px-3 py-1 text-xs font-medium rounded transition-all ${heightUnit === 'ft' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}>ft/in</button>
          </div>
        </div>
        {heightUnit === 'cm' ? (
          <input type="number" value={formData.height_cm || ''} onChange={(e) => setFormData({ ...formData, height_cm: parseInt(e.target.value) || 0 })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="170" />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <input type="number" value={heightInFt} onChange={(e) => setHeightInFt(parseInt(e.target.value) || 0, heightInInches)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="Ft" />
            <input type="number" value={heightInInches} onChange={(e) => setHeightInFt(heightInFt, parseInt(e.target.value) || 0)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="In" />
          </div>
        )}
      </div>

      {/* Current Weight */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
            <Scale className="w-5 h-5 text-purple-600" /> Current Weight *
          </label>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button onClick={() => setWeightUnit('kg')} className={`px-3 py-1 text-xs font-medium rounded transition-all ${weightUnit === 'kg' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}>kg</button>
            <button onClick={() => setWeightUnit('lbs')} className={`px-3 py-1 text-xs font-medium rounded transition-all ${weightUnit === 'lbs' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}>lbs</button>
          </div>
        </div>
        <input 
          type="number" 
          value={weightUnit === 'kg' ? (formData.weight_kg || '') : (weightInLbs || '')} 
          onChange={(e) => weightUnit === 'kg' ? setFormData({ ...formData, weight_kg: parseFloat(e.target.value) || 0 }) : setWeightInLbs(parseFloat(e.target.value) || 0)} 
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" 
          placeholder={weightUnit === 'kg' ? '70' : '150'}
        />
      </div>

      {/* 📊 BMI Smart Feedback */}
      {formData.height_cm > 0 && formData.weight_kg > 0 && (
        <div className={`p-4 rounded-xl border-2 mb-6 animate-in fade-in slide-in-from-top-2 ${
          bmiCategory === 'Normal' ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'
        }`}>
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider opacity-70">Your Analysis</span>
              <h4 className="font-bold text-gray-900 text-lg">BMI: {bmi} ({bmiCategory})</h4>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500 block">Healthy Range</span>
              <span className="font-mono font-medium text-gray-700">{healthyRange}</span>
            </div>
          </div>
          <p className="text-sm text-gray-700 flex gap-2 items-start">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-70" />
            {suggestion}
          </p>
        </div>
      )}

      {/* ✅ NEW: Target Weight Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-600" /> Target Weight <span className="text-gray-400 font-normal">(Optional)</span>
        </label>
        <input 
          type="number" 
          value={weightUnit === 'kg' ? (formData.target_weight_kg || '') : (targetWeightInLbs || '')} 
          onChange={(e) => weightUnit === 'kg' ? setFormData({ ...formData, target_weight_kg: parseFloat(e.target.value) || undefined }) : setTargetWeightInLbs(parseFloat(e.target.value) || 0)} 
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" 
          placeholder={weightUnit === 'kg' ? 'e.g. 75' : 'e.g. 165'}
        />
        {formData.target_weight_kg && (
          <p className="text-xs text-purple-600 mt-2 font-medium">
            {formData.target_weight_kg < formData.weight_kg ? '📉 Aiming to lose weight' : formData.target_weight_kg > formData.weight_kg ? '📈 Aiming to gain mass' : '⚖️ Maintenance Goal'}
          </p>
        )}
      </div>

      {/* Age & Sex */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" /> Age *
          </label>
          <input type="number" value={formData.age || ''} onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })} className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="25" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-purple-600" /> Sex *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['male', 'female'] as const).map((sex) => (
              <button key={sex} onClick={() => setFormData({ ...formData, sex })} className={`py-3 px-4 border-2 rounded-xl font-medium capitalize ${formData.sex === sex ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200'}`}>{sex}</button>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}