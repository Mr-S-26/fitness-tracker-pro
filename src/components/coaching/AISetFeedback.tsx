'use client';

import { useState } from 'react';
import { X, Check, Activity } from 'lucide-react';

interface Props {
  exerciseName: string;
  setNumber: number;
  targetWeight: number;
  targetReps: string;
  // ✅ NEW: Optional props to support ExerciseLogger
  actualReps?: string | number;
  onSuggestionReceived?: () => void;
  
  onSave: (data: any) => void;
  onCancel: () => void;
}

export default function AISetFeedback({ 
  exerciseName, 
  setNumber, 
  targetWeight, 
  targetReps,
  actualReps,           // ✅ Received
  onSuggestionReceived, // ✅ Received
  onSave, 
  onCancel 
}: Props) {
  const [weight, setWeight] = useState(targetWeight);
  
  // ✅ LOGIC: Use actualReps if provided (from logger), else fallback to target
  const initialReps = actualReps 
    ? Number(actualReps) 
    : (parseInt(targetReps) || 0);
    
  const [reps, setReps] = useState(initialReps);
  const [rpe, setRpe] = useState(8); // Default RPE
  const [difficulty, setDifficulty] = useState<'easy' | 'perfect' | 'hard' | 'failure' | null>(null);

  const handleSubmit = () => {
    if (!difficulty) return;
    
    // 1. Save the Feedback
    onSave({ weight, reps, rpe, difficulty });
    
    // 2. Trigger the "Next Step" logic (e.g. show Timer)
    if (onSuggestionReceived) {
      onSuggestionReceived();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-slide-up border border-gray-200 dark:border-gray-800">
        
        {/* Header */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">{exerciseName}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Set {setNumber} Feedback</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Performance Inputs */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Weight (kg)</label>
              <input 
                type="number" 
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full text-center text-2xl font-bold bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-3 focus:border-purple-500 focus:outline-none text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Reps</label>
              <input 
                type="number" 
                value={reps}
                onChange={(e) => setReps(Number(e.target.value))}
                className="w-full text-center text-2xl font-bold bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-3 focus:border-purple-500 focus:outline-none text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Difficulty Selector (The AI Brain Input) */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">How did it feel?</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'easy', label: 'Easy', emoji: '😌' },
                { id: 'perfect', label: 'Good', emoji: '💪' },
                { id: 'hard', label: 'Hard', emoji: '🥵' },
                { id: 'failure', label: 'Fail', emoji: '😵' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setDifficulty(opt.id as any)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                    difficulty === opt.id 
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300' 
                      : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <span className="text-lg mb-1">{opt.emoji}</span>
                  <span className="text-xs font-bold">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* RPE Slider */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-1">
                <Activity className="w-3 h-3" /> RPE (Intensity)
              </label>
              <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{rpe} / 10</span>
            </div>
            <input 
              type="range" min="1" max="10" step="0.5"
              value={rpe} onChange={(e) => setRpe(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mt-1">
              <span>Warmup</span>
              <span>Max Effort</span>
            </div>
          </div>

        </div>

        {/* Save Button */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
          <button 
            onClick={handleSubmit}
            disabled={!difficulty}
            className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Log Set & Rest
          </button>
        </div>

      </div>
    </div>
  );
}