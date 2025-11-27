'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Battery, Moon, Activity, ArrowRight, AlertTriangle } from 'lucide-react';

interface Props {
  userName: string;
  programId: string;
}

export default function PreWorkoutCheckInClient({ userName, programId }: Props) {
  const router = useRouter();
  
  const [energy, setEnergy] = useState(5); // 1-10
  const [soreness, setSoreness] = useState(3); // 1-10 (10 is very sore)
  const [sleep, setSleep] = useState(7); // Hours

  // Simple Readiness Calculation
  const calculateReadiness = () => {
    // Normalize inputs to 0-10 scale where 10 is best
    const energyScore = energy; 
    const sleepScore = Math.min(sleep, 9) / 9 * 10; // Cap at 9 hours
    const sorenessScore = 10 - soreness; // Invert: low soreness is good

    // Weighted average: Sleep (40%), Energy (40%), Soreness (20%)
    const score = (sleepScore * 0.4) + (energyScore * 0.4) + (sorenessScore * 0.2);
    return Math.round(score * 10); // 0-100
  };

  const readiness = calculateReadiness();

  const handleStart = () => {
    // Save readiness score to local storage or DB context to use in the workout
    localStorage.setItem('workoutReadiness', JSON.stringify({
      score: readiness,
      energy,
      soreness,
      sleep
    }));
    
    router.push('/workout/active');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pre-Workout Check-In</h1>
          <p className="text-gray-500">Let's see how you're recovering, {userName}.</p>
        </div>

        {/* Metrics Sliders */}
        <div className="space-y-8">
          
          {/* Energy */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="flex items-center gap-2 font-medium text-gray-700">
                <Battery className="w-5 h-5 text-blue-500" /> Energy Level
              </label>
              <span className="text-blue-600 font-bold">{energy}/10</span>
            </div>
            <input 
              type="range" min="1" max="10" step="1"
              value={energy} onChange={(e) => setEnergy(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Exhausted</span>
              <span>Energized</span>
            </div>
          </div>

          {/* Sleep */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="flex items-center gap-2 font-medium text-gray-700">
                <Moon className="w-5 h-5 text-purple-500" /> Sleep Last Night
              </label>
              <span className="text-purple-600 font-bold">{sleep} hrs</span>
            </div>
            <input 
              type="range" min="0" max="12" step="0.5"
              value={sleep} onChange={(e) => setSleep(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          {/* Soreness */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="flex items-center gap-2 font-medium text-gray-700">
                <Activity className="w-5 h-5 text-red-500" /> Muscle Soreness
              </label>
              <span className="text-red-600 font-bold">{soreness}/10</span>
            </div>
            <input 
              type="range" min="1" max="10" step="1"
              value={soreness} onChange={(e) => setSoreness(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Fresh</span>
              <span>Very Sore</span>
            </div>
          </div>

        </div>

        {/* Readiness Score Display */}
        <div className="mt-10 p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
          <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">Daily Readiness</p>
          <div className={`text-4xl font-black mb-2 ${
            readiness > 80 ? 'text-green-500' : 
            readiness > 50 ? 'text-yellow-500' : 'text-red-500'
          }`}>
            {readiness}%
          </div>
          
          {readiness < 50 && (
            <div className="flex items-start gap-2 text-left bg-white p-3 rounded-lg border border-red-100">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-xs text-gray-600">
                Your readiness is low. I recommend <strong>reducing weights by 10%</strong> today to prevent injury.
              </p>
            </div>
          )}
          
          {readiness >= 80 && (
            <p className="text-xs text-green-600 font-medium">
              You're primed for a PR! Push hard today. 🚀
            </p>
          )}
        </div>

        {/* Start Button */}
        <button 
          onClick={handleStart}
          className="w-full mt-6 bg-gray-900 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition-all"
        >
          Start Workout <ArrowRight className="w-5 h-5" />
        </button>

      </div>
    </div>
  );
}