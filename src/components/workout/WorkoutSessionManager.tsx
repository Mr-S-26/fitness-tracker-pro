'use client';

import { useState, useEffect, useRef } from 'react';
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
  
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'logger' | 'form'>('logger');

  const [showTimer, setShowTimer] = useState(false);
  const [currentRestTime, setCurrentRestTime] = useState(60);
  const [coachMessage, setCoachMessage] = useState<string | null>(null);
  
  const [feedbackModal, setFeedbackModal] = useState<any>(null);
  const [coachingModal, setCoachingModal] = useState<any>(null);

  // Haptic Helper
  const vibrate = (ms = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(ms);
    }
  };

  useEffect(() => {
    const initSession = () => {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      const currentWeekData = programData.weeks.find((w: any) => w.week_number === 1);
      const scheduledWorkout = currentWeekData?.workouts.find((w: any) => w.day === today);

      if (scheduledWorkout) {
        let finalWorkout = { ...scheduledWorkout };
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

      const activeTimer = localStorage.getItem('fitness_pro_timer_target');
      const pausedTimer = localStorage.getItem('fitness_pro_timer_paused_left');
      if (activeTimer || pausedTimer) {
        setShowTimer(true);
      }
    };
    initSession();
  }, [programData]);

  const handleSetClick = (
    exerciseName: string, 
    setNumber: number, 
    targetReps: string, 
    rest: number,
    actualWeight: number,
    actualReps: string
  ) => {
    vibrate(15); // Light tap
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
    
    const { rpe, difficulty } = data;
    const isBodyweight = feedbackModal.targetWeight === 0;
    const goal = userProfile?.primary_goal || 'general_fitness';
    
    let feedback = "";
    let extraRest = 0;

    if (rpe >= 9 || difficulty === 'failure') {
      if (goal === 'strength') extraRest = 60;
      else extraRest = 30;
      feedback = `⚠️ Near failure! I added +${extraRest}s rest.`;
      feedback += isBodyweight 
        ? " Form breaking? Try an easier variation." 
        : " Consider dropping weight by 5%.";
    } else if (rpe >= 7 && rpe <= 8.5) {
      feedback = "🔥 Perfect intensity. Keep this pace.";
    } else if (rpe < 6) {
      feedback = isBodyweight 
        ? "🪶 Too easy? Slow down the tempo." 
        : "🪶 Looks light! Increase weight by 2.5kg.";
    } else {
      feedback = "👍 Solid set. Breathe and reset.";
    }

    setCoachMessage(feedback);
    setFeedbackModal(null);
    setCurrentRestTime(feedbackModal.restSeconds + extraRest);
    setShowTimer(true);

    logSetResult(null, feedbackModal.exerciseName, feedbackModal.setNumber, data)
      .catch(err => console.error('Failed to log set', err));
  };

  const handleNextExercise = () => {
    vibrate(20);
    if (currentExerciseIndex < activeWorkout.exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setActiveTab('logger');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const totalSets = activeWorkout.exercises.reduce((acc: number, ex: any) => acc + ex.sets, 0);
      finishWorkoutSession(null, 3600, 5000, totalSets);
    }
  };

  const handlePrevExercise = () => {
    vibrate(10);
    if (currentExerciseIndex > 0) setCurrentExerciseIndex(prev => prev - 1);
  };

  const handleCoachClick = (exerciseName: string, targetReps: string) => {
    vibrate(10);
    setCoachingModal({
      isOpen: true,
      exerciseName,
      setNumber: 1, 
      targetReps: parseInt(targetReps) || 8
    });
  };

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Loading...</div>;
  if (!activeWorkout) return <div className="min-h-screen p-6 text-center">Rest Day</div>;

  const currentExercise = activeWorkout.exercises[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === activeWorkout.exercises.length - 1;

  const renderMedia = () => {
    const url = currentExercise.video_url;
    if (!url) return <div className="text-gray-500 flex flex-col items-center justify-center h-full"><Dumbbell className="w-12 h-12 mb-2 opacity-20"/><p className="text-xs">No Visual</p></div>;
    
    if (url.includes('youtube') || url.includes('youtu.be')) {
       return <iframe src={url} title={currentExercise.exercise_name} className="w-full h-full object-cover" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />;
    }
    return <img src={url} alt={currentExercise.exercise_name} className="w-full h-full object-cover" onError={(e) => (e.target as HTMLImageElement).style.display='none'} />;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-safe-offset transition-colors select-none">
      
      {/* 1. Sticky Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20 px-4 h-14 flex items-center justify-between shadow-sm">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-transform">
          <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>
        <div className="flex flex-col items-center max-w-[60%]">
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            {currentExerciseIndex + 1} / {activeWorkout.exercises.length}
          </span>
          <h1 className="font-bold text-gray-900 dark:text-white text-sm truncate w-full text-center">
            {currentExercise.exercise_name}
          </h1>
        </div>
        <button onClick={() => handleCoachClick(currentExercise.exercise_name, currentExercise.reps)} className="p-2 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-transform">
          <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </button>
      </div>

      {/* 2. Media Area */}
      <div className="bg-black aspect-video w-full relative flex items-center justify-center overflow-hidden group shadow-inner">
        {renderMedia()}
      </div>

      {/* 3. Tabs (Segment Control) */}
      <div className="px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-14 z-10">
        <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <button 
            onClick={() => setActiveTab('logger')} 
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'logger' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
          >
            Logger
          </button>
          <button 
            onClick={() => setActiveTab('form')} 
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'form' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
          >
            Guide
          </button>
        </div>
      </div>

      {/* 4. Content Area */}
      <div className="p-4 pb-32">
        
        {/* Target Stats - Compact Mobile Grid */}
        <div className="grid grid-cols-3 gap-2 mb-6">
           <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-xl text-center">
              <Dumbbell className="w-4 h-4 mx-auto text-purple-500 mb-1" />
              <span className="block text-lg font-bold text-gray-900 dark:text-white leading-none">
                {currentExercise.suggested_weight_kg > 0 ? `${currentExercise.suggested_weight_kg}` : 'BW'}
              </span>
              <span className="text-[10px] text-gray-500 uppercase">Kg</span>
           </div>
           <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-xl text-center">
              <Repeat className="w-4 h-4 mx-auto text-blue-500 mb-1" />
              <span className="block text-lg font-bold text-gray-900 dark:text-white leading-none">
                {currentExercise.reps}
              </span>
              <span className="text-[10px] text-gray-500 uppercase">Reps</span>
           </div>
           <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-xl text-center">
              <Clock className="w-4 h-4 mx-auto text-orange-500 mb-1" />
              <span className="block text-lg font-bold text-gray-900 dark:text-white leading-none">
                {currentExercise.rest_seconds}
              </span>
              <span className="text-[10px] text-gray-500 uppercase">Sec</span>
           </div>
        </div>

        {adjustmentReason && (
          <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-3 mb-4 rounded-xl border border-blue-100 dark:border-blue-800 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <p className="text-xs text-blue-800 dark:text-blue-200 leading-tight font-medium">{adjustmentReason}</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'logger' ? (
            <motion.div 
              key="logger"
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              {currentExerciseIndex === 0 && activeWorkout.warmups?.length > 0 && (
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-800 mb-4">
                  <h3 className="font-bold text-orange-800 dark:text-orange-200 mb-2 flex items-center gap-2 text-xs uppercase tracking-wide"><Flame className="w-3 h-3" /> Warm-up</h3>
                  <ul className="list-disc list-inside text-xs text-orange-700 dark:text-orange-300 space-y-1">{activeWorkout.warmups.map((w: string, i: number) => <li key={i}>{w}</li>)}</ul>
                </div>
              )}

              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                <div className="grid grid-cols-10 gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 text-[10px] font-bold text-gray-500 dark:text-gray-400 text-center border-b border-gray-100 dark:border-gray-800 tracking-wider">
                  <div className="col-span-2">SET</div>
                  <div className="col-span-3">KG</div>
                  <div className="col-span-3">REPS</div>
                  <div className="col-span-2">DONE</div>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {Array.from({ length: currentExercise.sets }).map((_, i) => (
                    <SetRow 
                      key={`${currentExercise.exercise_name}-${i}`} 
                      setNumber={i + 1} 
                      targetReps={currentExercise.reps}
                      suggestedWeight={currentExercise.suggested_weight_kg}
                      onTrigger={(w, r) => handleSetClick(currentExercise.exercise_name, i, currentExercise.reps, currentExercise.rest_seconds, w, r)}
                    />
                  ))}
                </div>
              </div>
              
              {isLastExercise && activeWorkout.cool_down?.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 mt-6">
                  <h3 className="font-bold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2 text-xs uppercase tracking-wide"><Wind className="w-3 h-3" /> Cool-down</h3>
                  <ul className="list-disc list-inside text-xs text-blue-700 dark:text-blue-300 space-y-1">{activeWorkout.cool_down.map((c: string, i: number) => <li key={i}>{c}</li>)}</ul>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="form"
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2 text-xs uppercase tracking-wide"><CheckCircle2 className="w-4 h-4" /> Perfect Form</h3>
                <ul className="space-y-3">{currentExercise.execution_cues?.length > 0 ? currentExercise.execution_cues.map((cue: string, i: number) => <li key={i} className="text-sm text-blue-900 dark:text-blue-100 flex gap-3 items-start leading-snug"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />{cue}</li>) : <p className="text-sm text-gray-500 italic">No cues available.</p>}</ul>
              </div>
              <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-800">
                <h3 className="font-bold text-red-800 dark:text-red-300 mb-3 flex items-center gap-2 text-xs uppercase tracking-wide"><AlertCircle className="w-4 h-4" /> Common Mistakes</h3>
                <ul className="space-y-3">{currentExercise.common_mistakes?.length > 0 ? currentExercise.common_mistakes.map((mistake: string, i: number) => <li key={i} className="text-sm text-red-900 dark:text-red-100 flex gap-3 items-start leading-snug"><span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 flex-shrink-0" />{mistake}</li>) : <p className="text-sm text-gray-500 italic">No mistakes listed.</p>}</ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 5. Sticky Footer Navigation (Safe Area Aware) */}
      <div 
        className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex gap-3 z-30"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <button 
          onClick={handlePrevExercise} 
          disabled={currentExerciseIndex === 0} 
          className="w-14 h-14 rounded-2xl border-2 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-30 disabled:border-transparent flex items-center justify-center active:scale-95 transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={handleNextExercise} 
          className={`flex-1 h-14 rounded-2xl font-bold text-base shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all ${isLastExercise ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'}`}
        >
          {isLastExercise ? 'Finish Workout' : 'Next Exercise'} 
          {isLastExercise ? <CheckCircle2 className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>

      {coachingModal && <PreSetCoaching {...coachingModal} onReady={() => setCoachingModal(null)} onSkip={() => setCoachingModal(null)} />}
      {feedbackModal && <AISetFeedback {...feedbackModal} onSave={handleFeedbackSave} onCancel={() => setFeedbackModal(null)} />}
      {showTimer && <EnhancedRestTimer initialSeconds={currentRestTime} coachMessage={coachMessage} onComplete={() => setShowTimer(false)} onClose={() => setShowTimer(false)} />}
    </div>
  );
}

// Optimized Set Row for Touch
function SetRow({ setNumber, targetReps, suggestedWeight, onTrigger }: { setNumber: number, targetReps: string, suggestedWeight: number, onTrigger: (w: number, r: string) => void }) {
  const [completed, setCompleted] = useState(false);
  const [weight, setWeight] = useState(suggestedWeight ? String(suggestedWeight) : '');
  const [reps, setReps] = useState(targetReps?.split('-')[0] || '');

  const handleCheck = () => {
    if(!completed) onTrigger(Number(weight), reps);
    setCompleted(!completed);
  };

  return (
    <div className={`grid grid-cols-10 gap-3 p-3 items-center transition-colors ${completed ? 'bg-green-50 dark:bg-green-900/20' : ''}`}>
      <div className="col-span-2 flex justify-center">
        <span className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold ${completed ? 'bg-green-200 text-green-800' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
          {setNumber}
        </span>
      </div>
      <div className="col-span-3">
        <input 
          type="number" 
          inputMode="decimal" 
          pattern="[0-9]*"
          value={weight} 
          onChange={(e) => setWeight(e.target.value)}
          placeholder={String(suggestedWeight || 0)}
          className="w-full text-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 text-base font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
        />
      </div>
      <div className="col-span-3">
        <input 
          type="text"
          inputMode="decimal"
          value={reps} 
          onChange={(e) => setReps(e.target.value)}
          placeholder={targetReps}
          className="w-full text-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 text-base font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
        />
      </div>
      <div className="col-span-2 flex justify-center">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={handleCheck}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm ${
            completed ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
          }`}
        >
          <CheckCircle2 className="w-6 h-6" />
        </motion.button>
      </div>
    </div>
  );
}