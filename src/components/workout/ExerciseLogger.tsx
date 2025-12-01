'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Timer, Dumbbell, ArrowRight, Save } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import EnhancedRestTimer from './EnhancedRestTimer';
import AISetFeedback from '@/components/coaching/AISetFeedback';

interface Set {
  set_number: number;
  weight: number;
  target_reps: number;
  actual_reps: number | null;
  rpe: number | null;
  completed: boolean;
}

interface Exercise {
  id: string;
  exercise_name: string;
  sets: Set[];
}

interface Props {
  sessionId: string;
  exercises: Exercise[];
}

export default function ExerciseLogger({ sessionId, exercises: initialExercises }: Props) {
  const [exercises, setExercises] = useState(initialExercises);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [completedSetIndex, setCompletedSetIndex] = useState<number | null>(null);

  const supabase = createClient();
  const activeExercise = exercises[activeExerciseIndex];

  const handleCompleteSet = async (setIndex: number, actualReps: number, weight: number) => {
    // 1. Optimistic Update
    const updatedExercises = [...exercises];
    const set = updatedExercises[activeExerciseIndex].sets[setIndex];
    set.completed = true;
    set.actual_reps = actualReps;
    set.weight = weight;
    setExercises(updatedExercises);

    setCompletedSetIndex(setIndex); // Track which set just finished

    // 2. DB Update (Background)
    await supabase
      .from('workout_logs')
      .update({ 
        reps: actualReps, 
        weight_kg: weight,
        completed: true 
      })
      .match({ 
        session_id: sessionId, 
        exercise_name: activeExercise.exercise_name,
        set_number: set.set_number 
      });

    // 3. Trigger Feedback Logic
    setShowFeedbackModal(true);
  };

  const handleAIFeedbackComplete = () => {
    setShowFeedbackModal(false);
    setShowRestTimer(true); // Start Timer AFTER feedback
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Exercise Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {activeExercise.exercise_name}
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {activeExerciseIndex + 1} / {exercises.length}
        </span>
      </div>

      {/* Sets List */}
      <div className="space-y-3">
        {activeExercise.sets.map((set, index) => (
          <SetInput 
            key={index} 
            set={set} 
            onComplete={(reps, weight) => handleCompleteSet(index, reps, weight)}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          disabled={activeExerciseIndex === 0}
          onClick={() => setActiveExerciseIndex(i => i - 1)}
          className="text-gray-500 disabled:opacity-30 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          Previous
        </button>
        
        {activeExerciseIndex < exercises.length - 1 ? (
          <button
            onClick={() => setActiveExerciseIndex(i => i + 1)}
            className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            Next Exercise <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => window.location.href = '/workout/summary'}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
          >
            Finish Workout <Save className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Modals */}
      {showFeedbackModal && completedSetIndex !== null && activeExercise && (
        <AISetFeedback
          exerciseName={activeExercise.exercise_name}
          setNumber={activeExercise.sets[completedSetIndex].set_number}
          
          // ✅ FIX 1: Correct Prop Name (weight -> targetWeight)
          targetWeight={activeExercise.sets[completedSetIndex].weight}
          
          // ✅ FIX 2: Convert to string to fix Type Error
          targetReps={String(activeExercise.sets[completedSetIndex].target_reps)}
          
          // ✅ FIX 3: Handle actualReps safely
          actualReps={activeExercise.sets[completedSetIndex].actual_reps || 0}
          
          onSuggestionReceived={handleAIFeedbackComplete}
          onCancel={() => setShowFeedbackModal(false)}
          onSave={() => {}} // Dummy handler if needed, logic is inside component
        />
      )}

      {showRestTimer && (
        <EnhancedRestTimer 
          initialSeconds={60} // Or fetch from exercise config
          onComplete={() => setShowRestTimer(false)}
          onClose={() => setShowRestTimer(false)}
        />
      )}
    </div>
  );
}

function SetInput({ set, onComplete }: { set: Set, onComplete: (r: number, w: number) => void }) {
  const [reps, setReps] = useState(set.target_reps);
  const [weight, setWeight] = useState(set.weight);

  if (set.completed) {
    return (
      <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
        <div className="flex gap-4">
          <span className="font-bold text-green-700 dark:text-green-400">Set {set.set_number}</span>
          <span className="text-gray-600 dark:text-gray-300">{set.actual_reps} x {set.weight}kg</span>
        </div>
        <CheckCircle2 className="w-5 h-5 text-green-600" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-2">
      <span className="w-8 font-bold text-gray-500 dark:text-gray-400">#{set.set_number}</span>
      <input 
        type="number" 
        value={weight} 
        onChange={e => setWeight(Number(e.target.value))}
        className="w-20 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
      />
      <span className="text-gray-400 text-sm">kg</span>
      <input 
        type="number" 
        value={reps} 
        onChange={e => setReps(Number(e.target.value))}
        className="w-16 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
      />
      <span className="text-gray-400 text-sm">reps</span>
      <button 
        onClick={() => onComplete(reps, weight)}
        className="ml-auto bg-gray-200 dark:bg-gray-700 p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900 hover:text-green-600 dark:hover:text-green-400 transition-colors"
      >
        <CheckCircle2 className="w-5 h-5" />
      </button>
    </div>
  );
}