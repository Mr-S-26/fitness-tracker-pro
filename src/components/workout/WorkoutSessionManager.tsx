'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, ChevronRight, MoreVertical, CheckCircle2, 
  AlertTriangle, Info, AlertCircle, Dumbbell, Clock, Repeat, Flame, Wind, Brain
} from 'lucide-react';
import EnhancedRestTimer from './EnhancedRestTimer';
import AISetFeedback from '@/components/coaching/AISetFeedback';
import PreSetCoaching from '@/components/coaching/PreSetCoaching';
import { logSetResult } from '@/app/actions/workout';
import { finishWorkoutSession } from '@/app/actions/finish-workout';
import { motion, AnimatePresence } from "framer-motion"; 

interface Props {
  userProfile: any;
  programData: any;
}

export default function WorkoutSessionManager({ userProfile, programData }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeWorkout, setActiveWorkout] = useState<any>(null);
  const [activeFocus, setActiveFocus] = useState<string>('');
  const [adjustmentReason, setAdjustmentReason] = useState<string | null>(null);
  
  // Focus Mode State
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'logger' | 'form'>('logger');

  const [showTimer, setShowTimer] = useState(false);
  const [currentRestTime, setCurrentRestTime] = useState(60);
  
  const [feedbackModal, setFeedbackModal] = useState<any>(null);
  const [coachingModal, setCoachingModal] = useState<any>(null);

  useEffect(() => {
    const initSession = () => {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      // Logic to find the correct week based on start date (Defaulting to W1 for MVP)
      const currentWeekData = programData.weeks.find((w: any) => w.week_number === 1);
      const scheduledWorkout = currentWeekData?.workouts.find((w: any) => w.day === today);

      if (scheduledWorkout) {
        let finalWorkout = { ...scheduledWorkout };
        
        // Readiness Check Logic
        const readinessData = localStorage.getItem('workoutReadiness');
        if (readinessData) {
          const { score } = JSON.parse(readinessData);
          if (score < 50) {
            setAdjustmentReason("Coach Note: Low readiness. Volume reduced.");
            finalWorkout.exercises = finalWorkout.exercises.map((ex: any) => ({
              ...ex,
              sets: Math.max(1, ex.sets - 1),
              notes: `${ex.notes || ''} (Deloaded)`.trim()
            }));
          }
        }

        setActiveWorkout(finalWorkout);
        setActiveFocus(currentWeekData?.focus || 'General Fitness');
      }
      setLoading(false);
    };
    initSession();
  }, [programData]);

  // Handlers
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
      setNumber: setNumber + 1,
      targetWeight: actualWeight,
      targetReps: actualReps,
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

  const handleNextExercise = () => {
    if (currentExerciseIndex < activeWorkout.exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setActiveTab('logger');
      window.scrollTo(0,0);
    } else {
      // Finish Workout Logic
      const totalSets = activeWorkout.exercises.reduce((acc: number, ex: any) => acc + ex.sets, 0);
      finishWorkoutSession(null, 3600, 5000, totalSets);
    }
  };

  const handlePrevExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
    }
  };

  const handleCoachClick = (exerciseName: string, targetReps: string) => {
    setCoachingModal({
      isOpen: true,
      exerciseName,
      setNumber: 1, 
      targetReps: parseInt(targetReps) || 8
    });
  };

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Loading...</div>;
  
  if (!activeWorkout) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Rest Day</h2>
      <button onClick={() => router.push('/dashboard')} className="text-purple-600 dark:text-purple-400 font-medium hover:underline">Return to Dashboard</button>
    </div>
  );

  const currentExercise = activeWorkout.exercises[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === activeWorkout.exercises.length - 1;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24 transition-colors">
      
      {/* 1. Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 px-4 h-16 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            {currentExerciseIndex + 1} / {activeWorkout.exercises.length}
          </span>
          <h1 className="font-bold text-gray-900 dark:text-white text-sm truncate max-w-[200px]">
            {currentExercise.exercise_name}
          </h1>
        </div>
        <button onClick={() => handleCoachClick(currentExercise.exercise_name, currentExercise.reps)} className="p-2 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </button>
      </div>

      {/* 2. Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <button 
          onClick={() => setActiveTab('logger')}
          className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-colors ${
            activeTab === 'logger' ? 'border-purple-600 text-purple-600 dark:text-purple-400' : 'border-transparent text-gray-500 dark:text-gray-400'
          }`}
        >
          Logger
        </button>
        <button 
          onClick={() => setActiveTab('form')}
          className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-colors ${
            activeTab === 'form' ? 'border-purple-600 text-purple-600 dark:text-purple-400' : 'border-transparent text-gray-500 dark:text-gray-400'
          }`}
        >
          Form Guide
        </button>
      </div>

      {/* 3. Content Area */}
      <div className="p-4 min-h-[300px]">
        
        {/* ✅ NEW: Stats Card (Replaces the Video) */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 mb-6 shadow-sm flex justify-between items-center">
           <div className="text-center flex-1 border-r border-gray-100 dark:border-gray-800">
              <span className="block text-xs text-gray-400 uppercase font-bold mb-1 flex items-center justify-center gap-1">
                <Dumbbell className="w-3 h-3" /> Weight
              </span>
              <span className="text-xl font-black text-gray-900 dark:text-white">
                {currentExercise.suggested_weight_kg > 0 ? `${currentExercise.suggested_weight_kg}kg` : 'BW'}
              </span>
           </div>
           <div className="text-center flex-1 border-r border-gray-100 dark:border-gray-800">
              <span className="block text-xs text-gray-400 uppercase font-bold mb-1 flex items-center justify-center gap-1">
                <Repeat className="w-3 h-3" /> Reps
              </span>
              <span className="text-xl font-black text-gray-900 dark:text-white">
                {currentExercise.reps}
              </span>
           </div>
           <div className="text-center flex-1">
              <span className="block text-xs text-gray-400 uppercase font-bold mb-1 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" /> Rest
              </span>
              <span className="text-xl font-black text-gray-900 dark:text-white">
                {currentExercise.rest_seconds}s
              </span>
           </div>
        </div>

        {adjustmentReason && (
          <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-3 mb-4 rounded-xl border border-blue-100 dark:border-blue-800 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <p className="text-sm text-blue-800 dark:text-blue-200 leading-tight">{adjustmentReason}</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'logger' ? (
            <motion.div 
              key="logger"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Warmups (First Exercise Only) */}
              {currentExerciseIndex === 0 && activeWorkout.warmups?.length > 0 && (
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-800 mb-4">
                  <h3 className="font-bold text-orange-800 dark:text-orange-200 mb-2 flex items-center gap-2 text-sm">
                    <Flame className="w-4 h-4" /> Warm-up Routine
                  </h3>
                  <ul className="list-disc list-inside text-xs text-orange-700 dark:text-orange-300 space-y-1">
                    {activeWorkout.warmups.map((w: string, i: number) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              )}

              {/* Set Logger */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                <div className="grid grid-cols-10 gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 text-xs font-bold text-gray-500 dark:text-gray-400 text-center border-b border-gray-100 dark:border-gray-800">
                  <div className="col-span-2">SET</div>
                  <div className="col-span-3">KG</div>
                  <div className="col-span-3">REPS</div>
                  <div className="col-span-2">DONE</div>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {Array.from({ length: currentExercise.sets }).map((_, i) => (
                    <SetRow 
                      key={i} 
                      setNumber={i + 1} 
                      targetReps={currentExercise.reps}
                      suggestedWeight={currentExercise.suggested_weight_kg}
                      onTrigger={(w, r) => handleSetClick(currentExercise.exercise_name, i, currentExercise.reps, currentExercise.rest_seconds, w, r)}
                    />
                  ))}
                </div>
              </div>
              
              {currentExercise.notes && (
                <div className="bg-purple-50 dark:bg-purple-900/10 p-3 rounded-lg flex gap-3 items-start border border-purple-100 dark:border-purple-800">
                  <Info className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-purple-800 dark:text-purple-200">{currentExercise.notes}</p>
                </div>
              )}

              {/* Cooldown (Last Exercise Only) */}
              {isLastExercise && activeWorkout.cool_down?.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 mt-6">
                  <h3 className="font-bold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2 text-sm">
                    <Wind className="w-4 h-4" /> Cool-down
                  </h3>
                  <ul className="list-disc list-inside text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    {activeWorkout.cool_down.map((c: string, i: number) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="form"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4" /> Perfect Form
                </h3>
                <ul className="space-y-2">
                  {currentExercise.execution_cues?.length > 0 ? (
                    currentExercise.execution_cues.map((cue: string, i: number) => (
                      <li key={i} className="text-sm text-blue-700 dark:text-blue-200 flex gap-2 items-start">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />
                        {cue}
                      </li>
                    ))
                  ) : <p className="text-sm text-gray-500 italic">No cues available.</p>}
                </ul>
              </div>

              <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-800">
                <h3 className="font-bold text-red-800 dark:text-red-300 mb-2 flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4" /> Common Mistakes
                </h3>
                <ul className="space-y-2">
                  {currentExercise.common_mistakes?.length > 0 ? (
                    currentExercise.common_mistakes.map((mistake: string, i: number) => (
                      <li key={i} className="text-sm text-red-700 dark:text-red-200 flex gap-2 items-start">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 flex-shrink-0" />
                        {mistake}
                      </li>
                    ))
                  ) : <p className="text-sm text-gray-500 italic">No mistakes listed.</p>}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 5. Sticky Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex gap-4 z-20 safe-area-pb">
        <button 
          onClick={handlePrevExercise}
          disabled={currentExerciseIndex === 0}
          className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={handleNextExercise}
          className={`flex-1 py-3 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-colors ${
            isLastExercise 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
          }`}
        >
          {isLastExercise ? 'Finish Workout' : 'Next Exercise'} 
          {isLastExercise ? <CheckCircle2 className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>

      {/* Modals */}
      {coachingModal && (
        <PreSetCoaching 
          {...coachingModal}
          onReady={() => setCoachingModal(null)}
          onSkip={() => setCoachingModal(null)}
        />
      )}

      {feedbackModal && (
        <AISetFeedback 
          {...feedbackModal}
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

// Sub-component: Set Row
function SetRow({ setNumber, targetReps, suggestedWeight, onTrigger }: { setNumber: number, targetReps: string, suggestedWeight: number, onTrigger: (w: number, r: string) => void }) {
  const [completed, setCompleted] = useState(false);
  const [weight, setWeight] = useState(suggestedWeight ? String(suggestedWeight) : '');
  const [reps, setReps] = useState(targetReps?.split('-')[0] || '');

  const handleCheck = () => {
    if(!completed) onTrigger(Number(weight), reps);
    setCompleted(!completed);
  };

  return (
    <div className={`grid grid-cols-10 gap-2 p-3 items-center transition-colors ${completed ? 'bg-green-50 dark:bg-green-900/20' : ''}`}>
      <div className="col-span-2 flex justify-center">
        <span className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-bold text-gray-500 dark:text-gray-400">
          {setNumber}
        </span>
      </div>
      <div className="col-span-3">
        <input 
          type="number" 
          value={weight} 
          onChange={(e) => setWeight(e.target.value)}
          placeholder={String(suggestedWeight || 0)}
          className="w-full text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg py-2 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
        />
      </div>
      <div className="col-span-3">
        <input 
          type="text" 
          value={reps} 
          onChange={(e) => setReps(e.target.value)}
          placeholder={targetReps}
          className="w-full text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg py-2 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
        />
      </div>
      <div className="col-span-2 flex justify-center">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={handleCheck}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            completed ? 'bg-green-500 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          <CheckCircle2 className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
}