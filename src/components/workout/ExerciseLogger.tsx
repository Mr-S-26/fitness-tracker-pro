'use client';

import { useState } from 'react';
import { Plus, Trash2, Check, Clock } from 'lucide-react';
import AISetFeedback from '@/components/coaching/AISetFeedback';
import RestTimer from './RestTimer';

interface Exercise {
  id: string;
  name: string;
  category: string;
  equipment: string;
  is_compound: boolean;
}

interface Set {
  set_number: number;
  weight: number;
  target_reps: number;
  actual_reps: number;
  difficulty?: string;
  form?: string;
  rpe?: number;
  completed: boolean;
}

interface SelectedExercise {
  exercise: Exercise;
  sets: Set[];
}

interface ExerciseLoggerProps {
  exercise: SelectedExercise;
  onUpdateSet: (setIndex: number, updates: Partial<Set>) => void;
  onAddSet: () => void;
  onRemoveExercise: () => void;
}

export default function ExerciseLogger({
  exercise,
  onUpdateSet,
  onAddSet,
  onRemoveExercise,
}: ExerciseLoggerProps) {
  const [activeSetIndex, setActiveSetIndex] = useState<number | null>(null);
  const [showAIFeedback, setShowAIFeedback] = useState(false);
  const [completedSetIndex, setCompletedSetIndex] = useState<number | null>(null);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restDuration, setRestDuration] = useState(90);

  const handleCompleteSet = (setIndex: number) => {
    const set = exercise.sets[setIndex];
    
    if (set.weight === 0 || set.actual_reps === 0) {
      alert('Please enter weight and reps before completing the set');
      return;
    }

    onUpdateSet(setIndex, { completed: true });
    setCompletedSetIndex(setIndex);
    setShowAIFeedback(true);
  };

  const handleAIFeedbackComplete = (suggestion: {
    weight: number;
    reps: number;
    rest: number;
  }) => {
    setShowAIFeedback(false);
    setRestDuration(suggestion.rest);
    setShowRestTimer(true);
    
    // Apply suggestion to next set if it exists
    const nextSetIndex = (completedSetIndex ?? -1) + 1;
    if (nextSetIndex < exercise.sets.length && !exercise.sets[nextSetIndex].completed) {
      onUpdateSet(nextSetIndex, {
        weight: suggestion.weight,
        target_reps: suggestion.reps,
      });
    }
  };

  const handleRestComplete = () => {
    setShowRestTimer(false);
    
    // Auto-focus next incomplete set
    const nextIncompleteIndex = exercise.sets.findIndex(s => !s.completed);
    if (nextIncompleteIndex !== -1) {
      setActiveSetIndex(nextIncompleteIndex);
    }
  };

  return (
    <div className="space-y-4">
      {/* Exercise Info Card */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{exercise.exercise.name}</h2>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="capitalize">{exercise.exercise.category}</span>
              <span>•</span>
              <span className="capitalize">{exercise.exercise.equipment}</span>
              {exercise.exercise.is_compound && (
                <>
                  <span>•</span>
                  <span className="text-purple-600 font-medium">Compound</span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onRemoveExercise}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Remove exercise"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Sets Table */}
        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-600 px-2">
            <div className="col-span-1">Set</div>
            <div className="col-span-3">Weight (kg)</div>
            <div className="col-span-3">Target Reps</div>
            <div className="col-span-3">Actual Reps</div>
            <div className="col-span-2"></div>
          </div>

          {exercise.sets.map((set, index) => (
            <div
              key={index}
              className={`grid grid-cols-12 gap-2 p-3 rounded-lg transition-all ${
                set.completed
                  ? 'bg-green-50 border border-green-200'
                  : activeSetIndex === index
                  ? 'bg-purple-50 border-2 border-purple-500'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="col-span-1 flex items-center font-semibold text-gray-700">
                {set.set_number}
              </div>
              
              <div className="col-span-3">
                <input
                  type="number"
                  value={set.weight || ''}
                  onChange={(e) => onUpdateSet(index, { weight: parseFloat(e.target.value) || 0 })}
                  disabled={set.completed}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="0"
                  step="0.25"
                  min="0"
                />
              </div>
              
              <div className="col-span-3">
                <input
                  type="number"
                  value={set.target_reps || ''}
                  onChange={(e) => onUpdateSet(index, { target_reps: parseInt(e.target.value) || 0 })}
                  disabled={set.completed}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="0"
                  min="0"
                />
              </div>
              
              <div className="col-span-3">
                <input
                  type="number"
                  value={set.actual_reps || ''}
                  onChange={(e) => onUpdateSet(index, { actual_reps: parseInt(e.target.value) || 0 })}
                  disabled={set.completed}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="0"
                  min="0"
                />
              </div>
              
              <div className="col-span-2 flex items-center">
                {set.completed ? (
                  <div className="flex items-center gap-1 text-green-600 font-medium text-sm">
                    <Check className="w-4 h-4" />
                    Done
                  </div>
                ) : (
                  <button
                    onClick={() => handleCompleteSet(index)}
                    className="w-full bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
                  >
                    ✓
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Set Button */}
        <button
          onClick={onAddSet}
          className="w-full mt-3 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50 transition-all flex items-center justify-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Set
        </button>
      </div>

      {/* AI Feedback Modal */}
      {showAIFeedback && completedSetIndex !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <AISetFeedback
                exerciseName={exercise.exercise.name}
                setNumber={exercise.sets[completedSetIndex].set_number}
                weight={exercise.sets[completedSetIndex].weight}
                targetReps={exercise.sets[completedSetIndex].target_reps}
                actualReps={exercise.sets[completedSetIndex].actual_reps}
                onSuggestionReceived={handleAIFeedbackComplete}
              />
              <button
                onClick={() => setShowAIFeedback(false)}
                className="w-full mt-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Skip AI Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rest Timer */}
      {showRestTimer && (
        <RestTimer
          duration={restDuration}
          onComplete={handleRestComplete}
          onSkip={handleRestComplete}
        />
      )}
    </div>
  );
}