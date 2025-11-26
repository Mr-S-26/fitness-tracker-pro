'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getProgramLoader, matchProgramExercises } from '@/lib/program/program-loader';
import { 
  Play, 
  Calendar, 
  TrendingUp, 
  Dumbbell, 
  Clock, 
  Target,
  AlertCircle,
  Loader2,
  CheckCircle,
  ChevronRight
} from 'lucide-react';
import ExerciseLogger from '@/components/workout/ExerciseLogger';
import WorkoutSummary from '@/components/workout/WorkoutSummary';

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

interface ProgramWorkoutClientProps {
  userId: string;
  exercises: Exercise[];
}

export default function ProgramWorkoutClient({ userId, exercises }: ProgramWorkoutClientProps) {
  const router = useRouter();
  const supabase = createClient();
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Workout states
  const [todaysWorkout, setTodaysWorkout] = useState<any>(null);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  // Load today's workout
  useEffect(() => {
    loadTodaysWorkout();
  }, [userId]);

  const loadTodaysWorkout = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Loading today\'s workout for user:', userId);
      const programLoader = getProgramLoader(userId);
      
      console.log('📋 Fetching active program...');
      const workout = await programLoader.getTodaysWorkout();

      if (!workout) {
        console.log('⚠️ No workout returned from program loader');
        setError('no_program');
        setLoading(false);
        return;
      }

      console.log('✅ Today\'s workout loaded:', workout);
      setTodaysWorkout(workout);
      setLoading(false);
    } catch (err) {
      console.error('❌ Error loading workout:', err);
      setError('load_error');
      setLoading(false);
    }
  };

  // Start workout session
  const handleStartWorkout = async () => {
    if (!todaysWorkout) return;

    try {
      // Create workout session
      const { data: session, error: sessionError } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: userId,
          name: `${todaysWorkout.program_name} - Week ${todaysWorkout.week_number}`,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      setSessionId(session.id);
      setStartTime(new Date());

      // Match program exercises with database exercises
      const exerciseMap = await matchProgramExercises(
        todaysWorkout.workout.exercises,
        userId
      );

      // Build selected exercises with prescribed sets/reps
      const programExercises: SelectedExercise[] = [];

      for (const programEx of todaysWorkout.workout.exercises) {
        const dbExercise = exerciseMap.get(programEx.exercise_name);

        if (dbExercise) {
          // Parse reps (e.g., "8-10" → target = 10, "12" → target = 12)
          const repsStr = programEx.reps.toString();
          let targetReps = 10; // default
          if (repsStr.includes('-')) {
            const parts = repsStr.split('-');
            targetReps = parseInt(parts[1]) || 10;
          } else {
            targetReps = parseInt(repsStr) || 10;
          }

          programExercises.push({
            exercise: dbExercise,
            sets: Array.from({ length: programEx.sets }, (_, i) => ({
              set_number: i + 1,
              weight: 0,
              target_reps: targetReps,
              actual_reps: 0,
              completed: false,
              rpe: programEx.rpe_target,
            })),
          });
        } else {
          console.warn(`Could not find exercise: ${programEx.exercise_name}`);
        }
      }

      setSelectedExercises(programExercises);
      setWorkoutStarted(true);
    } catch (err) {
      console.error('Error starting workout:', err);
      alert('Failed to start workout');
    }
  };

  // Update set
  const handleUpdateSet = (
    exerciseIndex: number,
    setIndex: number,
    updates: Partial<SelectedExercise['sets'][0]>
  ) => {
    const updated = [...selectedExercises];
    updated[exerciseIndex].sets[setIndex] = {
      ...updated[exerciseIndex].sets[setIndex],
      ...updates,
    };
    setSelectedExercises(updated);
  };

  // Add set
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

  // Complete workout
  const handleCompleteWorkout = async () => {
    if (!sessionId || !todaysWorkout) return;

    try {
      // Calculate stats
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

      // Update session
      await supabase
        .from('workout_sessions')
        .update({
          completed_at: new Date().toISOString(),
          total_volume: totalVolume,
        })
        .eq('id', sessionId);

      // Update program progress
      const programLoader = getProgramLoader(userId);
      const program = await programLoader.getActiveProgram();
      if (program) {
        await programLoader.completeWorkout(program.id);
      }

      setShowSummary(true);
    } catch (err) {
      console.error('Error completing workout:', err);
      alert('Failed to save workout');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your workout...</p>
        </div>
      </div>
    );
  }

  // Error states
  if (error === 'no_program') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Program</h2>
          <p className="text-gray-600 mb-6">
            You don't have an active training program yet. Complete onboarding to get your personalized program!
          </p>
          <button
            onClick={() => router.push('/onboarding')}
            className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Complete Onboarding
          </button>
        </div>
      </div>
    );
  }

  if (error === 'load_error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Workout</h2>
          <p className="text-gray-600 mb-6">
            Something went wrong while loading your workout. Please try again.
          </p>
          <button
            onClick={loadTodaysWorkout}
            className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show summary after workout
  if (showSummary && sessionId) {
    const totalVolume = selectedExercises.reduce(
      (acc, ex) =>
        acc +
        ex.sets
          .filter((s) => s.completed)
          .reduce((sum, s) => sum + s.weight * s.actual_reps, 0),
      0
    );
    const duration = startTime
      ? Math.floor((new Date().getTime() - startTime.getTime()) / 1000 / 60)
      : 0;

    return (
      <WorkoutSummary
        sessionId={sessionId}
        exercises={selectedExercises}
        totalVolume={totalVolume}
        duration={duration}
        onClose={() => router.push('/dashboard')}
      />
    );
  }

  // Pre-workout screen
  if (!workoutStarted && todaysWorkout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Program Header */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Dumbbell className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Today's Workout
              </h1>
              <p className="text-gray-600">{todaysWorkout.program_name}</p>
            </div>

            {/* Week Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Week</p>
                <p className="text-2xl font-bold text-gray-900">
                  {todaysWorkout.week_number}
                </p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Focus</p>
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {todaysWorkout.week_focus.split('-')[0].trim()}
                </p>
              </div>
            </div>

            {/* Deload Warning */}
            {todaysWorkout.is_deload_week && (
              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-orange-900 mb-1">
                      Deload Week
                    </h4>
                    <p className="text-sm text-orange-800">
                      This is a recovery week. Focus on perfect form and use lighter weights.
                      Listen to your body and don't push for PRs.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Workout Details */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                {todaysWorkout.workout.workout_name}
              </h3>

              <div className="space-y-3">
                {todaysWorkout.workout.exercises.map((ex: any, index: number) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{ex.exercise_name}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {ex.sets} sets × {ex.reps} reps
                        {ex.rest_seconds && (
                          <span className="ml-2">
                            • {Math.floor(ex.rest_seconds / 60)}min rest
                          </span>
                        )}
                      </p>
                      {ex.notes && (
                        <p className="text-xs text-purple-600 mt-1 italic">{ex.notes}</p>
                      )}
                    </div>
                    <CheckCircle className="w-5 h-5 text-gray-300" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleStartWorkout}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg flex items-center justify-center gap-3"
            >
              <Play className="w-6 h-6" />
              Start Workout
            </button>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-white text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-50 transition-colors border-2 border-gray-200"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active workout screen
  if (workoutStarted && selectedExercises.length > 0) {
    const completedSets = selectedExercises.reduce(
      (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
      0
    );
    const totalSets = selectedExercises.reduce((acc, ex) => acc + ex.sets.length, 0);
    const totalVolume = selectedExercises.reduce(
      (acc, ex) =>
        acc +
        ex.sets
          .filter((s) => s.completed)
          .reduce((sum, s) => sum + s.weight * s.actual_reps, 0),
      0
    );

    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Sticky Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 sticky top-0 z-10 shadow-lg">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-xl font-bold">
              Week {todaysWorkout.week_number} - {todaysWorkout.workout.workout_name}
            </h1>
            <div className="flex items-center gap-4 text-sm text-purple-100 mt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {startTime &&
                  Math.floor((new Date().getTime() - startTime.getTime()) / 1000 / 60)}
                m
              </span>
              <span>
                {completedSets}/{totalSets} sets
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {totalVolume.toFixed(0)}kg
              </span>
            </div>
          </div>
        </div>

        {/* Exercise Tabs */}
        <div className="bg-white border-b border-gray-200 sticky top-[72px] z-10">
          <div className="max-w-4xl mx-auto px-4 py-2">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {selectedExercises.map((ex, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentExerciseIndex(index)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    currentExerciseIndex === index
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {ex.exercise.name}
                  <span className="ml-2 text-xs">
                    {ex.sets.filter((s) => s.completed).length}/{ex.sets.length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Exercise Logger */}
        <div className="max-w-4xl mx-auto p-4">
          <ExerciseLogger
            exercise={selectedExercises[currentExerciseIndex]}
            onUpdateSet={(setIndex, updates) =>
              handleUpdateSet(currentExerciseIndex, setIndex, updates)
            }
            onAddSet={handleAddSet}
            onRemoveExercise={() => {
              /* Don't allow removing exercises from program */
            }}
          />
        </div>

        {/* Complete Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={handleCompleteWorkout}
              disabled={completedSets === 0}
              className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Complete Workout ({completedSets} sets)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}