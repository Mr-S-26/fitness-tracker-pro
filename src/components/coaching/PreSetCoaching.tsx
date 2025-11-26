'use client';

import { useState, useEffect } from 'react';
import { findExerciseCues, ExerciseCue } from '@/lib/coaching/exercise-cues';
import { 
  CheckCircle, 
  AlertCircle, 
  Wind, 
  Eye,
  Target,
  XCircle
} from 'lucide-react';

interface PreSetCoachingProps {
  exerciseName: string;
  setNumber: number;
  targetReps: number;
  rpeTarget?: number;
  onReady: () => void;
  onSkip: () => void;
}

export default function PreSetCoaching({
  exerciseName,
  setNumber,
  targetReps,
  rpeTarget,
  onReady,
  onSkip,
}: PreSetCoachingProps) {
  const [cues, setCues] = useState<ExerciseCue | null>(null);
  const [focusCue, setFocusCue] = useState<string>('');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    // Load exercise cues
    const exerciseCues = findExerciseCues(exerciseName);
    setCues(exerciseCues);

    // Select a focus cue for this set
    if (exerciseCues) {
      // Rotate through execution cues based on set number
      const cueIndex = (setNumber - 1) % exerciseCues.execution.length;
      setFocusCue(exerciseCues.execution[cueIndex]);
    }
  }, [exerciseName, setNumber]);

  // If no cues available, show simple ready screen
  if (!cues) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Target className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {exerciseName}
            </h2>
            <p className="text-gray-600 mb-6">
              Set {setNumber} • {targetReps} reps
              {rpeTarget && <span className="ml-2">• RPE {rpeTarget}</span>}
            </p>

            <div className="space-y-3">
              <button
                onClick={onReady}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-600 transition-all shadow-lg"
              >
                I'm Ready 💪
              </button>

              <button
                onClick={onSkip}
                className="w-full bg-gray-100 text-gray-600 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mx-auto mb-3 flex items-center justify-center">
            <Target className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {exerciseName}
          </h2>
          <p className="text-gray-600">
            Set {setNumber} • {targetReps} reps
            {rpeTarget && <span className="ml-2">• RPE {rpeTarget}</span>}
          </p>
        </div>

        {/* Focus Cue - Main Emphasis */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <Eye className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-purple-900 mb-2">Focus on This Set:</h3>
              <p className="text-purple-900 text-lg font-medium">{focusCue}</p>
            </div>
          </div>
        </div>

        {/* Breathing Pattern */}
        <div className="bg-blue-50 rounded-xl p-4 mb-4 flex items-start gap-3">
          <Wind className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 text-sm mb-1">Breathing:</h4>
            <p className="text-blue-800 text-sm">{cues.breathing}</p>
          </div>
        </div>

        {/* Tempo (if available) */}
        {cues.tempo && (
          <div className="bg-green-50 rounded-xl p-4 mb-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-900 text-sm mb-1">Tempo:</h4>
              <p className="text-green-800 text-sm">
                {cues.tempo} (down-pause-up-pause)
              </p>
            </div>
          </div>
        )}

        {/* Show All Cues Toggle */}
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full text-center text-purple-600 font-medium text-sm mb-4 hover:text-purple-700"
        >
          {showAll ? '▼ Hide Details' : '► Show All Form Cues'}
        </button>

        {/* Expandable Details */}
        {showAll && (
          <div className="space-y-4 mb-6 pt-4 border-t border-gray-200">
            {/* Setup Cues */}
            <div>
              <h4 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Setup:
              </h4>
              <ul className="space-y-1 ml-6">
                {cues.setup.map((cue, idx) => (
                  <li key={idx} className="text-gray-700 text-sm">• {cue}</li>
                ))}
              </ul>
            </div>

            {/* Execution Cues */}
            <div>
              <h4 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-600" />
                Execution:
              </h4>
              <ul className="space-y-1 ml-6">
                {cues.execution.map((cue, idx) => (
                  <li 
                    key={idx} 
                    className={`text-gray-700 text-sm ${cue === focusCue ? 'font-semibold text-purple-700' : ''}`}
                  >
                    • {cue}
                  </li>
                ))}
              </ul>
            </div>

            {/* Common Mistakes */}
            <div>
              <h4 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                Avoid:
              </h4>
              <ul className="space-y-1 ml-6">
                {cues.common_mistakes.slice(0, 3).map((mistake, idx) => (
                  <li key={idx} className="text-red-700 text-sm">• {mistake}</li>
                ))}
              </ul>
            </div>

            {/* RPE Guidance */}
            {cues.rpe_guidance && (
              <div className="bg-orange-50 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-orange-900 text-xs mb-1">Intensity:</h4>
                  <p className="text-orange-800 text-xs">{cues.rpe_guidance}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onReady}
            className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-600 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-6 h-6" />
            I'm Ready to Lift
          </button>

          <button
            onClick={onSkip}
            className="w-full bg-gray-100 text-gray-600 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Skip Coaching
          </button>
        </div>

        {/* Quick Tip */}
        <p className="text-center text-xs text-gray-500 mt-4">
          💡 Focus on one cue at a time for best results
        </p>
      </div>
    </div>
  );
}