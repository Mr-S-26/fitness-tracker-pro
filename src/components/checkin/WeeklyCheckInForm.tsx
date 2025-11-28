'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitWeeklyCheckIn } from '@/app/actions/submit-checkin';
import { 
  CheckCircle2, 
  TrendingUp, 
  Activity, 
  Brain,
  ArrowRight,
  Loader2
} from 'lucide-react';

interface WeeklyStats {
  startDate: string;
  endDate: string;
  workoutsCompleted: number;
  plannedWorkouts: number;
  adherence: number;
  totalVolume: number;
}

export default function WeeklyCheckInForm({ stats }: { stats: WeeklyStats }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [feedback, setFeedback] = useState({
    difficulty: 5, // 1-10
    recovery: 5, // 1-10
    enjoyment: 5, // 1-10
    stress: 3, // 1-5 (Life stress)
    notes: ''
  });

  const handleSubmit = async () => {
    setSubmitting(true);
    
    try {
      await submitWeeklyCheckIn(stats, feedback);
      // If successful, the server action will redirect. 
      // We don't need to do anything here.
    } catch (err: any) {
      // ✅ FIX: Ignore the error if it's just Next.js trying to redirect us
      if (err.message === 'NEXT_REDIRECT' || err.digest?.startsWith('NEXT_REDIRECT')) {
        return;
      }

      console.error(err);
      setSubmitting(false);
      alert("Something went wrong saving your check-in.");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      
      {/* Header Progress Bar */}
      <div className="h-2 bg-gray-100">
        <div 
          className="h-full bg-purple-600 transition-all duration-500" 
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      <div className="p-8">
        
        {/* Header Text */}
        <div className="mb-8">
          <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider rounded-full mb-3">
            Weekly Review
          </span>
          <h1 className="text-2xl font-bold text-gray-900">
            {step === 1 ? "Let's review your week" : 
             step === 2 ? "How does your body feel?" : 
             "Coach's Notes"}
          </h1>
          <p className="text-gray-500 mt-1">
            {stats.startDate} - {stats.endDate}
          </p>
        </div>

        {/* Step 1: Objective Data Review */}
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="grid grid-cols-2 gap-4">
              <StatBox 
                icon={<CheckCircle2 className="w-5 h-5 text-green-500" />}
                label="Adherence"
                value={`${stats.adherence}%`}
                subtext={`${stats.workoutsCompleted}/${stats.plannedWorkouts} workouts`}
              />
              <StatBox 
                icon={<TrendingUp className="w-5 h-5 text-blue-500" />}
                label="Volume"
                value={`${(stats.totalVolume / 1000).toFixed(1)}k`}
                subtext="Total Kg Moved"
              />
            </div>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3">
              <Brain className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-blue-900 text-sm">Coach's Observation</h4>
                <p className="text-blue-800 text-sm mt-1">
                  {stats.adherence >= 80 
                    ? "You were incredibly consistent this week! This is the key to long-term progress." 
                    : "You missed a few sessions. Let's see if we need to adjust your schedule."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Subjective Feedback */}
        {step === 2 && (
          <div className="space-y-8 animate-in slide-in-from-right duration-300">
            <Slider 
              label="How difficult were the workouts?" 
              minLabel="Too Easy" maxLabel="Impossible"
              value={feedback.difficulty} 
              onChange={(v: number) => setFeedback(prev => ({ ...prev, difficulty: v }))} 
            />
            <Slider 
              label="How well are you recovering?" 
              minLabel="Always Sore" maxLabel="Fresh"
              value={feedback.recovery} 
              onChange={(v: number) => setFeedback(prev => ({ ...prev, recovery: v }))} 
            />
            <Slider 
              label="External Life Stress?" 
              minLabel="Zen Mode" maxLabel="High Stress"
              max={5}
              value={feedback.stress} 
              onChange={(v: number) => setFeedback(prev => ({ ...prev, stress: v }))} 
            />
          </div>
        )}

        {/* Step 3: Notes & Submit */}
        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Anything else to report?</label>
              <textarea 
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none h-32 resize-none"
                placeholder="e.g., My left knee hurt during squats, or I have a vacation coming up..."
                value={feedback.notes}
                onChange={(e) => setFeedback(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 flex gap-3">
              <Activity className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-yellow-900 text-sm">What happens next?</h4>
                <p className="text-yellow-800 text-sm mt-1">
                  I will analyze your logs and this feedback to potentially <strong>adjust your weights, sets, or exercises</strong> for next week.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-10 flex gap-3">
          {step > 1 && (
            <button 
              onClick={() => setStep(s => s - 1)}
              className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Back
            </button>
          )}
          <button 
            onClick={step === 3 ? handleSubmit : () => setStep(s => s + 1)}
            disabled={submitting}
            className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Analyzing...
              </>
            ) : step === 3 ? (
              <>Complete Check-in</>
            ) : (
              <>Next <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

// Helper Components
function StatBox({ icon, label, value, subtext }: any) {
  return (
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-bold text-gray-500 uppercase">{label}</span>
      </div>
      <div className="text-2xl font-black text-gray-900">{value}</div>
      <div className="text-xs text-gray-400 font-medium mt-1">{subtext}</div>
    </div>
  );
}

function Slider({ label, minLabel, maxLabel, value, onChange, max = 10 }: any) {
  return (
    <div>
      <div className="flex justify-between mb-3">
        <label className="font-bold text-gray-700">{label}</label>
        <span className="text-purple-600 font-bold">{value}/{max}</span>
      </div>
      <input 
        type="range" min="1" max={max} step="1"
        value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}