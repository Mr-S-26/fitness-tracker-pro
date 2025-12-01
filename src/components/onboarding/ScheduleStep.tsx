'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Check } from 'lucide-react';

interface Props {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const DAYS = [
  { id: 'Monday', label: 'M' },
  { id: 'Tuesday', label: 'T' },
  { id: 'Wednesday', label: 'W' },
  { id: 'Thursday', label: 'T' },
  { id: 'Friday', label: 'F' },
  { id: 'Saturday', label: 'S' },
  { id: 'Sunday', label: 'S' },
];

// ✅ FIX 1: Add default value for data prop
export default function ScheduleStep({ data = {}, onUpdate, onNext, onBack }: Props) {
  
  // ✅ FIX 2: Safely check for data existence before accessing properties
  const initialDays = (data?.selected_days && data.selected_days.length > 0)
    ? data.selected_days 
    : ['Monday', 'Wednesday', 'Friday'];

  const [selectedDays, setSelectedDays] = useState<string[]>(initialDays);
  
  // ✅ FIX 3: Safe access for duration
  const [duration, setDuration] = useState(data?.session_duration_minutes || 60);

  // Update parent state whenever local state changes
  useEffect(() => {
    onUpdate({
      ...data,
      available_days_per_week: selectedDays.length,
      selected_days: selectedDays,
      session_duration_minutes: duration
    });
  }, [selectedDays, duration]);

  const toggleDay = (dayId: string) => {
    if (selectedDays.includes(dayId)) {
      // Don't allow deselecting if it's the last day (min 1 day required)
      if (selectedDays.length > 1) {
        setSelectedDays(prev => prev.filter(d => d !== dayId));
      }
    } else {
      // Add day and sort them to keep order
      setSelectedDays(prev => {
        const newDays = [...prev, dayId];
        // Sort based on original DAYS order
        return DAYS.filter(d => newDays.includes(d.id)).map(d => d.id);
      });
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Training Schedule</h2>
        <p className="text-gray-500">Select the specific days you want to workout.</p>
      </div>

      <div className="space-y-8">
        
        {/* Day Selector */}
        <div className="space-y-4">
          <label className="block text-sm font-bold text-gray-700">
            Which days are you available?
          </label>
          <div className="grid grid-cols-7 gap-2">
            {DAYS.map((day) => {
              const isSelected = selectedDays.includes(day.id);
              return (
                <button
                  key={day.id}
                  onClick={() => toggleDay(day.id)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-lg font-bold">{day.label}</span>
                  {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full mt-1" />}
                </button>
              );
            })}
          </div>
          <p className="text-center text-sm font-medium text-purple-600">
            {selectedDays.length} workouts per week
          </p>
        </div>

        {/* Duration Slider */}
        <div className="space-y-4">
          <div className="flex justify-between">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Session Duration
            </label>
            <span className="text-purple-600 font-bold">{duration} min</span>
          </div>
          <input 
            type="range" 
            min="30" max="120" step="15"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>Quick (30m)</span>
            <span>Standard (60m)</span>
            <span>Epic (120m)</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 pt-4">
          <button 
            onClick={onBack}
            className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
          >
            Back
          </button>
          <button 
            onClick={onNext}
            disabled={selectedDays.length === 0}
            className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            Next <Check className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
}