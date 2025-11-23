'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Play, Save, X, Plus, Clock, TrendingUp, Dumbbell } from 'lucide-react';
import ExerciseSelector from './ExerciseSelector';
import ExerciseLogger from './ExerciseLogger';
import WorkoutSummary from './WorkoutSummary';

interface Exercise {
  id: string;
  name: string;
  category: string;
  equipment: string;
  primary_muscles: string[];
  is_compound: boolean;
}

interface SelectedExercise {
  exercise: Exercise;
  sets: Array<{
    set_number: number;
    weight: number;
    target_reps: number;
    actual_reps: number;
    difficulty?: string;
    form?: string;
    rpe?: number;
    completed: boolean;
  }>;
}

interface WorkoutSessionManagerProps {
  userId: string;
  exercises: Exercise[];
}

export default function WorkoutSessionManager({ userId, exercises }: WorkoutSessionManagerProps) {
  const router = useRouter();
  const supabase = createClient();
  
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [workoutName, setWorkoutName] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Start workout session
  const handleStartWorkout = async () => {
    const name = workoutName || `Workout - ${new Date().toLocaleDateString()}`;
    
    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: userId,
          name: name,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setSessionId(data.id);
      setWorkoutStarted(true);
      setStartTime(new Date());
      setShowExerciseSelector(true);
    } catch (error) {
      console.error('Error starting workout:', error);
      alert('Failed to start workout');
    }
  };

  // Add exercise to workout
  const handleAddExercise = (exercise: Exercise) => {
    const newExercise: SelectedExercise = {
      exercise,
      sets: [
        {
          set_number: 1,
          weight: 0,
          target_reps: 8,
          actual_reps: 0,
          completed: false,
        },
      ],
    };
    setSelectedExercises([...selectedExercises, newExercise]);
    setShowExerciseSelector(false);
  };

  // Remove exercise from workout
  const handleRemoveExercise = (index: number) => {
    const updated = selectedExercises.filter((_, i) => i !== index);
    setSelectedExercises(updated);
    if (currentExerciseIndex >= updated.length && updated.length > 0) {
      setCurrentExerciseIndex(updated.length - 1);
    }
  };

  // Add set to current exercise
  const handleAddSet = () => {
    if (selectedExercises.length === 0) return;
    
    const updated = [...selectedExercises];
    const currentExercise = updated[currentExerciseIndex];
    const lastSet = currentExercise.sets[currentExercise.sets.length - 1];
    
    currentExercise.sets.push({
      set_number: currentExercise.sets.length + 1,
      weight: lastSet.weight,
      target_reps: lastSet.target_reps,
      actual_reps: 0,
      completed: false,
    });
    
    setSelectedExercises(updated);
  };

  // Update set data
  const handleUpdateSet = (exerciseIndex: number, setIndex: number, updates: Partial<SelectedExercise['sets'][0]>) => {
    const updated = [...selectedExercises];
    updated[exerciseIndex].sets[setIndex] = {
      ...updated[exerciseIndex].sets[setIndex],
      ...updates,
    };
    setSelectedExercises(updated);
  };

  // Complete workout
  const handleCompleteWorkout = async () => {
    if (!sessionId) return;

    try {
      // Calculate total volume
      let totalVolume = 0;
      let totalSets = 0;

      for (const exercise of selectedExercises) {
        for (const set of exercise.sets) {
          if (set.completed) {
            totalVolume += set.weight * set.actual_reps;
            totalSets++;

            // Save set to database
            await supabase.from('set_logs').insert({
              session_id: sessionId,
              exercise_id: exercise.exercise.id,
              set_number: set.set_number,
              weight: set.weight,
              target_reps: set.target_reps,
              actual_reps: set.actual_reps,
              difficulty: set.difficulty,
              form: set.form,
              rpe: set.rpe,
            });
          }
        }
      }

      // Update workout session
      await supabase
        .from('workout_sessions')
        .update({
          completed_at: new Date().toISOString(),
          total_volume: totalVolume,
        })
        .eq('id', sessionId);

      setShowSummary(true);
    } catch (error) {
      console.error('Error completing workout:', error);
      alert('Failed to save workout');
    }
  };

  // Cancel workout
  const handleCancelWorkout = async () => {
    if (!sessionId) {
      router.push('/dashboard');
      return;
    }

    if (confirm('Are you sure you want to cancel this workout? All progress will be lost.')) {
      try {
        await supabase.from('workout_sessions').delete().eq('id', sessionId);
        router.push('/dashboard');
      } catch (error) {
        console.error('Error canceling workout:', error);
        router.push('/dashboard');
      }
    }
  };

  // Calculate stats
  const completedSets = selectedExercises.reduce(
    (acc, ex) => acc + ex.sets.filter(s => s.completed).length,
    0
  );
  const totalSets = selectedExercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const totalVolume = selectedExercises.reduce(
    (acc, ex) =>
      acc +
      ex.sets
        .filter(s => s.completed)
        .reduce((sum, s) => sum + s.weight * s.actual_reps, 0),
    0
  );

  // Show summary
  if (showSummary && sessionId) {
    return (
      <WorkoutSummary
        sessionId={sessionId}
        exercises={selectedExercises}
        totalVolume={totalVolume}
        duration={startTime ? Math.floor((new Date().getTime() - startTime.getTime()) / 1000 / 60) : 0}
        onClose={() => router.push('/dashboard')}
      />
    );
  }

  // Pre-workout screen
  if (!workoutStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Dumbbell className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Start Workout</h1>
            <p className="text-gray-600">Let&apos;s crush it today! 💪</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Workout Name (Optional)
              </label>
              <input
                type="text"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                placeholder="e.g., Push Day, Leg Day"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <button
              onClick={handleStartWorkout}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-6 h-6" />
              Start Workout
            </button>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active workout screen
  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{workoutName || 'Active Workout'}</h1>
            <div className="flex items-center gap-4 text-sm text-purple-100 mt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {startTime && Math.floor((new Date().getTime() - startTime.getTime()) / 1000 / 60)}m
              </span>
              <span>{completedSets}/{totalSets} sets</span>
              <span className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {totalVolume.toFixed(0)}kg
              </span>
            </div>
          </div>
          <button
            onClick={handleCancelWorkout}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4">
        {selectedExercises.length === 0 ? (
          <div className="text-center py-20">
            <Dumbbell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No Exercises Yet</h2>
            <p className="text-gray-500 mb-6">Add your first exercise to get started</p>
            <button
              onClick={() => setShowExerciseSelector(true)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Exercise
            </button>
          </div>
        ) : (
          <>
            {/* Exercise Tabs */}
            <div className="flex gap-2 overflow-x-auto mb-4 pb-2">
              {selectedExercises.map((ex, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentExerciseIndex(index)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    currentExerciseIndex === index
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {ex.exercise.name}
                  <span className="ml-2 text-xs">
                    {ex.sets.filter(s => s.completed).length}/{ex.sets.length}
                  </span>
                </button>
              ))}
              <button
                onClick={() => setShowExerciseSelector(true)}
                className="px-4 py-2 rounded-lg font-medium bg-white text-purple-600 hover:bg-purple-50 transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {/* Current Exercise Logger */}
            {selectedExercises[currentExerciseIndex] && (
              <ExerciseLogger
                exercise={selectedExercises[currentExerciseIndex]}
                onUpdateSet={(setIndex, updates) =>
                  handleUpdateSet(currentExerciseIndex, setIndex, updates)
                }
                onAddSet={handleAddSet}
                onRemoveExercise={() => handleRemoveExercise(currentExerciseIndex)}
              />
            )}
          </>
        )}

        {/* Action Buttons */}
        {selectedExercises.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
            <div className="max-w-4xl mx-auto flex gap-3">
              <button
                onClick={handleCompleteWorkout}
                disabled={completedSets === 0}
                className="flex-1 bg-green-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Complete Workout ({completedSets} sets)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Exercise Selector Modal */}
      {showExerciseSelector && (
        <ExerciseSelector
          exercises={exercises}
          onSelect={handleAddExercise}
          onClose={() => setShowExerciseSelector(false)}
        />
      )}
    </div>
  );
}