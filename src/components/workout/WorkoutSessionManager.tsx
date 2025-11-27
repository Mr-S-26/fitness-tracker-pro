'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Dumbbell, Clock, CheckCircle2, AlertTriangle, ChevronLeft, MoreVertical, Brain 
} from 'lucide-react';
import EnhancedRestTimer from './EnhancedRestTimer';
import AISetFeedback from '@/components/coaching/AISetFeedback';
import PreSetCoaching from '@/components/coaching/PreSetCoaching'; // ✅ Import Pre-Set Coach
import { logSetResult } from '@/app/actions/workout';
import { finishWorkoutSession } from '@/app/actions/finish-workout';

interface Props {
  userProfile: any;
  programData: any;
}

export default function WorkoutSessionManager({ userProfile, programData }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [adjustmentReason, setAdjustmentReason] = useState<string | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<any>(null);
  
  const [showTimer, setShowTimer] = useState(false);
  const [currentRestTime, setCurrentRestTime] = useState(60);

  // Modal States
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    exerciseName: string;
    setNumber: number;
    targetWeight: number;
    targetReps: string;
    restSeconds: number;
  } | null>(null);

  // ✅ NEW: Coaching Modal State
  const [coachingModal, setCoachingModal] = useState<{
    isOpen: boolean;
    exerciseName: string;
    setNumber: number;
    targetReps: number;
  } | null>(null);

  useEffect(() => {
    const initSession = () => {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      // In a real app, calculate current week dynamically
      const week1 = programData.weeks.find((w: any) => w.week_number === 1);
      const scheduledWorkout = week1?.workouts.find((w: any) => w.day === today);

      if (!scheduledWorkout) {
        setLoading(false);
        return;
      }

      let finalWorkout = { ...scheduledWorkout };
      const readinessData = localStorage.getItem('workoutReadiness');
      
      if (readinessData) {
        const { score } = JSON.parse(readinessData);
        if (score < 50) {
          setAdjustmentReason("Coach Note: Readiness is low. I've reduced weight by 10% and removed 1 set per exercise to prioritize recovery.");
          finalWorkout.exercises = finalWorkout.exercises.map((ex: any) => ({
            ...ex,
            sets: Math.max(1, ex.sets - 1),
            notes: `${ex.notes || ''} (Deloaded)`.trim()
          }));
        }
      }

      setActiveWorkout(finalWorkout);
      setLoading(false);
    };

    initSession();
  }, [programData]);

  // Handle Opening Feedback
  const handleSetClick = (exerciseName: string, setNumber: number, reps: string, rest: number) => {
    setFeedbackModal({
      isOpen: true,
      exerciseName,
      setNumber,
      targetWeight: 0,
      targetReps: reps,
      restSeconds: rest
    });
  };

  // Handle Saving Feedback
  const handleFeedbackSave = async (data: any) => {
    if (!feedbackModal) return;
    setFeedbackModal(null);
    setCurrentRestTime(feedbackModal.restSeconds);
    setShowTimer(true);

    logSetResult(
      null, 
      feedbackModal.exerciseName,
      feedbackModal.setNumber,
      data
    ).catch(err => console.error('Failed to log set', err));
  };

  // ✅ NEW: Handle Opening Coach
  const handleCoachClick = (exerciseName: string, targetReps: string) => {
    // Parse reps string "8-10" to number 8 for simplicity, or 10
    const reps = parseInt(targetReps) || 8; 
    
    setCoachingModal({
      isOpen: true,
      exerciseName,
      setNumber: 1, // Default to set 1 cues, or calculate next open set
      targetReps: reps
    });
  };

  if (loading) return <div>Loading...</div>;
  if (!activeWorkout) return <div>Rest Day</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="font-bold text-gray-900 truncate">{activeWorkout.workout_name}</h1>
          <button className="p-2 -mr-2 hover:bg-gray-100 rounded-full">
            <MoreVertical className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        
        {adjustmentReason && (
          <div className="bg-blue-50 px-4 py-3 border-t border-blue-100 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <p className="text-sm text-blue-800 leading-tight">{adjustmentReason}</p>
          </div>
        )}
      </div>

      {/* Active Workout Content */}
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {activeWorkout.exercises.map((exercise: any, index: number) => (
          <ExerciseCard 
            key={index} 
            exercise={exercise} 
            index={index} 
            onSetClick={handleSetClick}
            onCoachClick={() => handleCoachClick(exercise.exercise_name, exercise.reps)} // ✅ Pass Coach Handler
          />
        ))}

        <button 
          onClick={() => {
            const totalSets = activeWorkout.exercises.reduce((acc: number, ex: any) => acc + ex.sets, 0);
            const volume = 5000; 
            const duration = 3600;
            finishWorkoutSession(null, duration, volume, totalSets);
          }}
          className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-6 h-6" />
          Complete Workout
        </button>
      </div>

      {/* ✅ Render Pre-Set Coaching Modal */}
      {coachingModal && (
        <PreSetCoaching 
          exerciseName={coachingModal.exerciseName}
          setNumber={coachingModal.setNumber}
          targetReps={coachingModal.targetReps}
          onReady={() => setCoachingModal(null)}
          onSkip={() => setCoachingModal(null)}
        />
      )}

      {/* Render Feedback Modal */}
      {feedbackModal && (
        <AISetFeedback 
          exerciseName={feedbackModal.exerciseName}
          setNumber={feedbackModal.setNumber}
          targetWeight={feedbackModal.targetWeight}
          targetReps={feedbackModal.targetReps}
          onSave={handleFeedbackSave}
          onCancel={() => setFeedbackModal(null)}
        />
      )}

      {/* Render Timer Overlay */}
      {showTimer && (
        <EnhancedRestTimer 
          initialSeconds={currentRestTime} 
          onComplete={() => setShowTimer(false)}
          onClose={() => setShowTimer(false)}
        />
      )}
    </div>
  );
}

// Updated ExerciseCard to include Coach Button
function ExerciseCard({ 
  exercise, 
  index, 
  onSetClick, 
  onCoachClick 
}: { 
  exercise: any, 
  index: number, 
  onSetClick: (name: string, set: number, reps: string, rest: number) => void,
  onCoachClick: () => void 
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Exercise {index + 1}</span>
            {/* ✅ Coach Button */}
            <button 
              onClick={onCoachClick}
              className="flex items-center gap-1 bg-purple-100 hover:bg-purple-200 text-purple-700 px-2 py-1 rounded-lg text-xs font-bold transition-colors"
            >
              <Brain className="w-3 h-3" />
              Coach Me
            </button>
          </div>
          <h3 className="text-lg font-bold text-gray-900">{exercise.exercise_name}</h3>
          
          {exercise.notes && (
            <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {exercise.notes}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-10 gap-2 p-2 bg-gray-100/50 text-xs font-semibold text-gray-500 text-center border-b border-gray-100">
        <div className="col-span-1">SET</div>
        <div className="col-span-3">PREVIOUS</div>
        <div className="col-span-2">KG</div>
        <div className="col-span-2">REPS</div>
        <div className="col-span-2">DONE</div>
      </div>

      <div className="divide-y divide-gray-100">
        {Array.from({ length: exercise.sets }).map((_, i) => (
          <SetRow 
            key={i} 
            setNumber={i + 1} 
            targetReps={exercise.reps}
            onTrigger={() => onSetClick(exercise.exercise_name, i + 1, exercise.reps, exercise.rest_seconds)}
          />
        ))}
      </div>
    </div>
  );
}

function SetRow({ setNumber, targetReps, onTrigger }: { setNumber: number, targetReps: string, onTrigger: () => void }) {
  const [completed, setCompleted] = useState(false);

  const handleToggle = () => {
    if (!completed) {
      onTrigger();
      setCompleted(true);
    } else {
      setCompleted(false);
    }
  };

  return (
    <div className={`grid grid-cols-10 gap-2 p-3 items-center transition-colors ${completed ? 'bg-green-50' : 'bg-white'}`}>
      <div className="col-span-1 flex justify-center">
        <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-xs font-bold text-gray-500">
          {setNumber}
        </span>
      </div>
      <div className="col-span-3 text-center text-xs text-gray-400">-</div>
      <div className="col-span-2">
        <input type="number" placeholder="0" className="w-full text-center bg-gray-50 border border-gray-200 rounded p-1 text-sm font-semibold focus:outline-none" />
      </div>
      <div className="col-span-2">
        <input type="text" placeholder={targetReps} className="w-full text-center bg-gray-50 border border-gray-200 rounded p-1 text-sm font-semibold focus:outline-none" />
      </div>
      <div className="col-span-2 flex justify-center">
        <button 
          onClick={handleToggle}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            completed ? 'bg-green-500 text-white shadow-md' : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
          }`}
        >
          <CheckCircle2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}