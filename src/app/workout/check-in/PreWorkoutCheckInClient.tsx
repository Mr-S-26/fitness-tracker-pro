'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Battery,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  AlertTriangle,
  Moon,
  Activity,
  TrendingUp,
  CheckCircle,
  Zap,
} from 'lucide-react';

interface PreWorkoutCheckInClientProps {
  userId: string;
}

export default function PreWorkoutCheckInClient({ userId }: PreWorkoutCheckInClientProps) {
  const router = useRouter();

  // Assessment states
  const [energyLevel, setEnergyLevel] = useState<number | null>(null);
  const [sleepQuality, setSleepQuality] = useState<number | null>(null);
  const [sleepHours, setSleepHours] = useState<number | null>(null);
  const [soreness, setSoreness] = useState<number | null>(null);
  const [stress, setStress] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  // AI Analysis
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysis, setAnalysis] = useState<{
    recommendation: string;
    adjustments: string[];
    proceed: boolean;
  } | null>(null);

  const canProceed = energyLevel !== null && sleepQuality !== null && soreness !== null;

  const handleAnalyze = () => {
    // Generate AI-style analysis based on inputs
    const avgScore = ((energyLevel! + sleepQuality! + (5 - soreness!) + (5 - stress!)) / 4);
    
    let recommendation = '';
    let adjustments: string[] = [];
    let proceed = true;

    if (avgScore >= 4) {
      // Great condition
      recommendation = "You're in great shape today! Your energy, sleep, and recovery are all optimal. This is a perfect day for a strong workout. Consider pushing yourself a bit harder on the main lifts.";
      adjustments = [
        "✅ Proceed with workout as planned",
        "💪 Consider adding 2.5-5% to working weights if feeling strong",
        "⚡ Great day for intensity - aim for top end of rep ranges",
      ];
    } else if (avgScore >= 3) {
      // Good condition
      recommendation = "You're ready to train effectively. Your readiness is solid, though not peak. Stick to the program as written and focus on quality reps with good form.";
      adjustments = [
        "✅ Proceed with normal workout",
        "🎯 Stick to prescribed weights and reps",
        "⚠️ Monitor form closely - don't push beyond technical failure",
      ];
    } else if (avgScore >= 2) {
      // Moderate concern
      recommendation = "Your readiness is below optimal today. You can still train productively, but consider reducing intensity or volume. Focus on movement quality over performance.";
      adjustments = [
        "⚠️ Reduce working weights by 10-15%",
        "📉 Consider stopping 1-2 reps short of failure",
        "💡 Focus on perfect form and mind-muscle connection",
        "🔄 Option: Convert to technique/pump day",
      ];
      
      if (soreness! >= 4) {
        adjustments.push("🩹 High soreness detected - consider active recovery instead");
      }
      if (sleepHours !== null && sleepHours < 6) {
        adjustments.push("😴 Low sleep detected - avoid maximal lifts");
      }
    } else {
      // Poor condition - recommend rest
      recommendation = "Your body is showing significant signs of fatigue. Training hard today could increase injury risk and impair recovery. I recommend either taking a rest day or doing light active recovery instead.";
      adjustments = [
        "🛑 Consider taking a rest day",
        "🚶 Alternative: Light cardio or stretching (20-30 min)",
        "💆 Alternative: Mobility work and foam rolling",
        "⏸️ Your body needs recovery to grow stronger",
      ];
      proceed = false;
      
      if (energyLevel! <= 2 && sleepQuality! <= 2) {
        adjustments.push("⚠️ Very low energy + poor sleep = high injury risk");
      }
    }

    // Specific adjustments based on individual factors
    if (soreness! >= 4) {
      adjustments.push("🔥 High soreness: Extra warm-up recommended (10 min)");
    }
    if (stress! >= 4) {
      adjustments.push("😰 High stress: Keep rest periods longer, focus on breathing");
    }
    if (sleepHours !== null && sleepHours < 6) {
      adjustments.push("💤 Sleep debt: Avoid PRs, focus on technique");
    }

    setAnalysis({ recommendation, adjustments, proceed });
    setShowAnalysis(true);
  };

  const handleProceed = () => {
    // TODO: Save check-in data to database
    router.push('/workout/program');
  };

  const handleRest = () => {
    router.push('/dashboard');
  };

  const getEnergyIcon = (level: number) => {
    if (level >= 4) return <BatteryFull className="w-6 h-6" />;
    if (level >= 3) return <BatteryMedium className="w-6 h-6" />;
    return <BatteryLow className="w-6 h-6" />;
  };

  const getEnergyColor = (level: number) => {
    if (level >= 4) return 'from-green-500 to-green-600';
    if (level >= 3) return 'from-yellow-500 to-orange-500';
    return 'from-orange-500 to-red-500';
  };

  if (showAnalysis && analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Analysis Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="text-center mb-6">
              <div className={`w-20 h-20 bg-gradient-to-br ${analysis.proceed ? 'from-green-500 to-green-600' : 'from-orange-500 to-red-500'} rounded-full mx-auto mb-4 flex items-center justify-center`}>
                {analysis.proceed ? (
                  <CheckCircle className="w-10 h-10 text-white" />
                ) : (
                  <AlertTriangle className="w-10 h-10 text-white" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Readiness Analysis
              </h2>
            </div>

            {/* AI Recommendation */}
            <div className="bg-purple-50 rounded-xl p-6 mb-6">
              <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                AI Coach Recommendation:
              </h3>
              <p className="text-purple-900 leading-relaxed">
                {analysis.recommendation}
              </p>
            </div>

            {/* Adjustments */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="font-bold text-gray-900 mb-4">Suggested Adjustments:</h3>
              <ul className="space-y-3">
                {analysis.adjustments.map((adjustment, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-700">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xs">
                      {idx + 1}
                    </span>
                    <span>{adjustment}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {analysis.proceed ? (
                <>
                  <button
                    onClick={handleProceed}
                    className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-600 transition-all shadow-lg"
                  >
                    Start Workout 💪
                  </button>
                  <button
                    onClick={handleRest}
                    className="w-full bg-gray-100 text-gray-600 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Rest Instead
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleRest}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
                  >
                    Take Rest Day
                  </button>
                  <button
                    onClick={handleProceed}
                    className="w-full bg-gray-100 text-gray-600 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Train Anyway (Not Recommended)
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pre-Workout Check-In
          </h1>
          <p className="text-gray-600">
            Help me assess your readiness to train today
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          {/* Energy Level */}
          <div>
            <label className="block font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Battery className="w-5 h-5 text-purple-600" />
              Energy Level
            </label>
            <p className="text-sm text-gray-600 mb-4">
              How energetic do you feel right now?
            </p>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => setEnergyLevel(level)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    energyLevel === level
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    {getEnergyIcon(level)}
                    <span className="text-xs font-medium text-gray-700">{level}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2 px-2">
              <span>Exhausted</span>
              <span>Energized</span>
            </div>
          </div>

          {/* Sleep Quality */}
          <div>
            <label className="block font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Moon className="w-5 h-5 text-purple-600" />
              Sleep Quality
            </label>
            <p className="text-sm text-gray-600 mb-4">
              How well did you sleep last night?
            </p>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => setSleepQuality(level)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    sleepQuality === level
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-2xl mb-1">
                    {level === 1 ? '😫' : level === 2 ? '😔' : level === 3 ? '😐' : level === 4 ? '🙂' : '😴'}
                  </div>
                  <span className="text-xs font-medium text-gray-700">{level}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2 px-2">
              <span>Terrible</span>
              <span>Excellent</span>
            </div>

            {/* Sleep Hours */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hours of sleep:
              </label>
              <input
                type="number"
                min="0"
                max="14"
                step="0.5"
                value={sleepHours || ''}
                onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-600 focus:outline-none"
                placeholder="e.g., 7.5"
              />
            </div>
          </div>

          {/* Soreness */}
          <div>
            <label className="block font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              Overall Soreness
            </label>
            <p className="text-sm text-gray-600 mb-4">
              How sore are your muscles today?
            </p>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => setSoreness(level)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    soreness === level
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-2xl mb-1">
                    {level === 1 ? '😊' : level === 2 ? '🙂' : level === 3 ? '😐' : level === 4 ? '😣' : '😵'}
                  </div>
                  <span className="text-xs font-medium text-gray-700">{level}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2 px-2">
              <span>Not Sore</span>
              <span>Very Sore</span>
            </div>
          </div>

          {/* Stress Level */}
          <div>
            <label className="block font-bold text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Stress Level
            </label>
            <p className="text-sm text-gray-600 mb-4">
              How stressed do you feel today?
            </p>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => setStress(level)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    stress === level
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-2xl mb-1">
                    {level === 1 ? '😌' : level === 2 ? '🙂' : level === 3 ? '😐' : level === 4 ? '😰' : '😫'}
                  </div>
                  <span className="text-xs font-medium text-gray-700">{level}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2 px-2">
              <span>Relaxed</span>
              <span>Very Stressed</span>
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block font-bold text-gray-900 mb-3">
              Additional Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-600 focus:outline-none resize-none"
              placeholder="Any specific concerns? (e.g., knee feels off, lower back tight, etc.)"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleAnalyze}
            disabled={!canProceed}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Analyze Readiness
          </button>

          <button
            onClick={() => router.push('/workout/program')}
            className="w-full bg-gray-100 text-gray-600 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Skip Check-In
          </button>
        </div>
      </div>
    </div>
  );
}