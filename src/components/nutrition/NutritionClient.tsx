'use client';

import { useState } from 'react';
import { logDailyNutrition } from '@/app/actions/log-nutrition'; // Import Server Action
import { 
  Utensils, 
  Droplets, 
  Plus, 
  Flame,
  Zap,
  ChevronRight
} from 'lucide-react';

interface Props {
  plan: any;
  userName: string;
  initialConsumed: any; // Real data passed from server
}

export default function NutritionClient({ plan, userName, initialConsumed }: Props) {
  // Initialize state with real data from server (or 0s)
  const [consumed, setConsumed] = useState(initialConsumed);
  const [isLogging, setIsLogging] = useState(false);

  // Quick Log Function
  const handleQuickLog = async (type: 'snack' | 'meal' | 'water') => {
    setIsLogging(true);
    
    // Define quick add values (In a real app, this would be a form)
    let updateData: any = {};
    if (type === 'snack') updateData = { calories: 150, protein: 5, carbs: 20, fat: 5 };
    if (type === 'meal') updateData = { calories: 500, protein: 30, carbs: 50, fat: 15 };
    if (type === 'water') updateData = { water_oz: 8 };

    // Optimistic UI Update (Update instantly before server responds)
    setConsumed((prev: any) => ({
      ...prev,
      calories: (prev.calories || 0) + (updateData.calories || 0),
      protein: (prev.protein || 0) + (updateData.protein || 0),
      carbs: (prev.carbs || 0) + (updateData.carbs || 0),
      fat: (prev.fat || 0) + (updateData.fat || 0),
      water_oz: (prev.water_oz || 0) + (updateData.water_oz || 0),
    }));

    try {
      // Send to Server
      await logDailyNutrition(updateData);
    } catch (error) {
      console.error("Failed to log:", error);
      // Optionally revert state here on error
    } finally {
      setIsLogging(false);
    }
  };

  // Calculate Progress
  const currentCalories = consumed.calories || 0;
  const remainingCalories = Math.max(0, plan.daily_calories - currentCalories);
  const progress = Math.min((currentCalories / plan.daily_calories) * 100, 100);

  // Handle water field name difference (DB uses water_oz)
  const currentWater = consumed.water_oz || 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="font-bold text-xl text-gray-900">Nutrition</h1>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            {plan.goal.replace('_', ' ').toUpperCase()}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-6">

        {/* 1. Main Calorie Card */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Calories Remaining</p>
              <h2 className="text-5xl font-black tracking-tight">{remainingCalories}</h2>
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
              <Flame className="w-6 h-6 text-orange-400" />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-2 flex justify-between text-xs font-medium text-gray-400">
            <span>{currentCalories} eaten</span>
            <span>Goal: {plan.daily_calories}</span>
          </div>
          <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-1000" 
              style={{ width: `${progress}%` }} 
            />
          </div>

          {/* Quick Add Meal Button */}
          <div className="mt-6 flex gap-3">
            <button 
              onClick={() => handleQuickLog('meal')}
              disabled={isLogging}
              className="flex-1 bg-white/20 hover:bg-white/30 text-white py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Quick Meal
            </button>
            <button 
              onClick={() => handleQuickLog('snack')}
              disabled={isLogging}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
            >
              <Utensils className="w-4 h-4" /> Snack
            </button>
          </div>
        </div>

        {/* 2. Macro Targets */}
        <div className="grid grid-cols-3 gap-3">
          <MacroCard 
            label="Protein" 
            current={consumed.protein || 0} 
            target={plan.protein_grams} 
            color="text-blue-500" 
            bgColor="bg-blue-500" 
          />
          <MacroCard 
            label="Carbs" 
            current={consumed.carbs || 0} 
            target={plan.carbs_grams} 
            color="text-green-500" 
            bgColor="bg-green-500" 
          />
          <MacroCard 
            label="Fats" 
            current={consumed.fat || 0} 
            target={plan.fat_grams} 
            color="text-yellow-500" 
            bgColor="bg-yellow-500" 
          />
        </div>

        {/* 3. Hydration Tracker */}
        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <Droplets className="w-6 h-6 text-blue-500" />
              <h3 className="font-bold text-blue-900">Hydration</h3>
            </div>
            <span className="text-blue-700 font-bold">{currentWater} / {plan.hydration_oz} oz</span>
          </div>
          
          <div className="grid grid-cols-8 gap-2">
            {Array.from({ length: 8 }).map((_, i) => {
              const isFilled = i < (currentWater / plan.hydration_oz) * 8;
              return (
                <div 
                  key={i} 
                  className={`h-10 rounded-md transition-all ${
                    isFilled ? 'bg-blue-500' : 'bg-blue-200/50'
                  }`}
                />
              );
            })}
          </div>
          <button 
            onClick={() => handleQuickLog('water')}
            disabled={isLogging}
            className="mt-4 w-full bg-white text-blue-600 font-semibold py-3 rounded-xl shadow-sm hover:bg-blue-50 transition-colors"
          >
            + Log 8oz Water
          </button>
        </div>

        {/* 4. Strategy & Timing */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Zap className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900">Your Strategy</h3>
          </div>

          <div className="space-y-4">
            <StrategyItem label="Timing" value={plan.meal_timing_strategy} />
            <StrategyItem label="Pre-Workout" value={plan.pre_workout_meal} />
            <StrategyItem label="Post-Workout" value={plan.post_workout_meal} />
          </div>
        </div>

      </div>
    </div>
  );
}

function MacroCard({ label, current, target, color, bgColor }: any) {
  const progress = Math.min((current / target) * 100, 100);
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center">
      <p className="text-gray-500 text-xs font-bold uppercase mb-1">{label}</p>
      <div className={`text-xl font-black ${color} mb-2`}>
        {current}<span className="text-gray-300 text-sm font-medium">/{target}g</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${bgColor}`} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

function StrategyItem({ label, value }: { label: string, value: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 border-b border-gray-50 last:border-0 pb-3 last:pb-0">
      <span className="text-xs font-bold text-gray-400 uppercase min-w-[100px] pt-1">{label}</span>
      <p className="text-gray-700 font-medium text-sm">{value}</p>
    </div>
  );
}