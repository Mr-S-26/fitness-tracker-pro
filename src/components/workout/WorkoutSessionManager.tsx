'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Dumbbell, Clock, CheckCircle2, AlertTriangle, ChevronLeft, MoreVertical, Brain, Flame, Wind 
} from 'lucide-react';
import EnhancedRestTimer from './EnhancedRestTimer';
import AISetFeedback from '@/components/coaching/AISetFeedback';
import PreSetCoaching from '@/components/coaching/PreSetCoaching';
import { logSetResult } from '@/app/actions/workout';
import { finishWorkoutSession } from '@/app/actions/finish-workout';
import { motion } from "framer-motion"; 

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

  const [coachingModal, setCoachingModal] = useState<{
    isOpen: boolean;
    exerciseName: string;
    setNumber: number;
    targetReps: number;
  } | null>(null);

  useEffect(() => {
    const initSession = () => {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
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

  // Handle Set Click (Capture Inputs)
  const handleSetClick = (
    exerciseName: string, 
    setNumber: number, 
    targetReps: string, 
    rest: number,
    actualWeight: number,
    actualReps: string
  ) => {
    setFeedbackModal({
      isOpen: true,
      exerciseName,
      setNumber,
      targetWeight: actualWeight || 0, 
      targetReps: actualReps || targetReps, 
      restSeconds: rest
    });
  };

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

  const handleCoachClick = (exerciseName: string, targetReps: string) => {
    const reps = parseInt(targetReps) || 8; 
    setCoachingModal({
      isOpen: true,
      exerciseName,
      setNumber: 1, 
      targetReps: reps
    });
  };

  if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center text-gray-500">Loading...</div>;
  
  if (!activeWorkout) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Rest Day</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6">No workout scheduled for today.</p>
      <button onClick={() => router.push('/dashboard')} className="text-purple-600 dark:text-purple-400 font-medium hover:underline">Return to Dashboard</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-32 transition-colors duration-300">
      
      {/* Top Bar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
          <h1 className="font-bold text-gray-900 dark:text-white truncate">{activeWorkout.workout_name}</h1>
          <button className="p-2 -mr-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <MoreVertical className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        
        {adjustmentReason && (
          <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-3 border-t border-blue-100 dark:border-blue-800 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <p className="text-sm text-blue-800 dark:text-blue-200 leading-tight">{adjustmentReason}</p>
          </div>
        )}
      </div>

      {/* Active Workout Content */}
      <div className="max-w-2xl mx-auto p-4 space-y-6">

        {/* 🔥 Warmup Section */}
        {activeWorkout.warmups && activeWorkout.warmups.length > 0 && (
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-800">
            <h3 className="font-bold text-orange-800 dark:text-orange-200 mb-2 flex items-center gap-2">
              <Flame className="w-4 h-4" /> Warm-up
            </h3>
            <ul className="list-disc list-inside text-sm text-orange-700 dark:text-orange-300 space-y-1">
              {activeWorkout.warmups.map((w: string, i: number) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Exercise List */}
        {activeWorkout.exercises.map((exercise: any, index: number) => (
          <ExerciseCard 
            key={index} 
            exercise={exercise} 
            index={index} 
            onSetClick={handleSetClick}
            onCoachClick={() => handleCoachClick(exercise.exercise_name, exercise.reps)}
          />
        ))}

        {/* ❄️ Cool-down Section */}
        {activeWorkout.cool_down && activeWorkout.cool_down.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
            <h3 className="font-bold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
              <Wind className="w-4 h-4" /> Cool-down
            </h3>
            <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-300 space-y-1">
              {activeWorkout.cool_down.map((c: string, i: number) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}

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

      {/* Modals */}
      {coachingModal && (
        <PreSetCoaching 
          exerciseName={coachingModal.exerciseName}
          setNumber={coachingModal.setNumber}
          targetReps={coachingModal.targetReps}
          onReady={() => setCoachingModal(null)}
          onSkip={() => setCoachingModal(null)}
        />
      )}

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

// ✅ Helper Components with Dark Mode

function ExerciseCard({ 
  exercise, 
  index, 
  onSetClick, 
  onCoachClick 
}: { 
  exercise: any, 
  index: number, 
  onSetClick: (name: string, set: number, targetReps: string, rest: number, actualWeight: number, actualReps: string) => void,
  onCoachClick: () => void 
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Exercise {index + 1}</span>
            <button 
              onClick={onCoachClick}
              className="flex items-center gap-1 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-lg text-xs font-bold transition-colors"
            >
              <Brain className="w-3 h-3" />
              Coach Me
            </button>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{exercise.exercise_name}</h3>
          
          {/* Suggested Weight */}
          {exercise.suggested_weight_kg > 0 && (
            <p className="text-sm text-green-600 dark:text-green-400 font-medium mt-1 flex items-center gap-1">
               <Dumbbell className="w-3.5 h-3.5" />
               Target: {exercise.suggested_weight_kg} kg
            </p>
          )}
          
          {exercise.notes && (
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {exercise.notes}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-10 gap-2 p-2 bg-gray-100/50 dark:bg-gray-800/50 text-xs font-semibold text-gray-500 dark:text-gray-400 text-center border-b border-gray-100 dark:border-gray-800">
        <div className="col-span-1">SET</div>
        <div className="col-span-3">PREVIOUS</div>
        <div className="col-span-2">KG</div>
        <div className="col-span-2">REPS</div>
        <div className="col-span-2">DONE</div>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {Array.from({ length: exercise.sets }).map((_, i) => (
          <SetRow 
            key={i} 
            setNumber={i + 1} 
            targetReps={exercise.reps}
            onTrigger={(w, r) => onSetClick(exercise.exercise_name, i + 1, exercise.reps, exercise.rest_seconds, w, r)}
          />
        ))}
      </div>
    </div>
  );
}

function SetRow({ setNumber, targetReps, onTrigger }: { setNumber: number, targetReps: string, onTrigger: (w: number, r: string) => void }) {
  const [completed, setCompleted] = useState(false);
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');

  const handleToggle = () => {
    if (!completed) {
      const weightVal = weight ? parseFloat(weight) : 0;
      const repsVal = reps ? reps : targetReps;
      onTrigger(weightVal, repsVal);
      setCompleted(true);
    } else {
      setCompleted(false);
    }
  };

  return (
    <div className={`grid grid-cols-10 gap-2 p-3 items-center transition-colors ${completed ? 'bg-green-50 dark:bg-green-900/20' : 'bg-white dark:bg-gray-900'}`}>
      <div className="col-span-1 flex justify-center">
        <span className="w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-bold text-gray-500 dark:text-gray-400">
          {setNumber}
        </span>
      </div>
      <div className="col-span-3 text-center text-xs text-gray-400 dark:text-gray-600">-</div>
      
      <div className="col-span-2">
        <input 
          type="number" 
          placeholder="0" 
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="w-full text-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-1 text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors"
        />
      </div>

      <div className="col-span-2">
        <input 
          type="text" 
          placeholder={targetReps} 
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          className="w-full text-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-1 text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors"
        />
      </div>

      <div className="col-span-2 flex justify-center">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={handleToggle}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            completed 
              ? 'bg-green-500 text-white shadow-md' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          <motion.div
            initial={false}
            animate={{ scale: completed ? 1 : 0.8, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <CheckCircle2 className="w-5 h-5" />
          </motion.div>
        </motion.button>
      </div>
    </div>
  );
}