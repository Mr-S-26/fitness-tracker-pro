'use client';

import { CheckCircle, TrendingUp, Clock, Dumbbell, Award } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
}

interface Set {
  set_number: number;
  weight: number;
  actual_reps: number;
  completed: boolean;
}

interface SelectedExercise {
  exercise: Exercise;
  sets: Set[];
}

interface WorkoutSummaryProps {
  sessionId: string;
  exercises: SelectedExercise[];
  totalVolume: number;
  duration: number; // in minutes
  onClose: () => void;
}

export default function WorkoutSummary({
  exercises,
  totalVolume,
  duration,
  onClose,
}: WorkoutSummaryProps) {
  const totalSets = exercises.reduce(
    (acc, ex) => acc + ex.sets.filter(s => s.completed).length,
    0
  );

  const totalReps = exercises.reduce(
    (acc, ex) =>
      acc +
      ex.sets
        .filter(s => s.completed)
        .reduce((sum, s) => sum + s.actual_reps, 0),
    0
  );

  const achievements = [];
  if (totalSets >= 20) achievements.push({ icon: '🔥', text: 'High Volume Crusher!' });
  if (duration < 45) achievements.push({ icon: '⚡', text: 'Speed Demon!' });
  if (totalVolume > 5000) achievements.push({ icon: '💪', text: 'Heavy Lifter!' });
  if (exercises.length >= 5) achievements.push({ icon: '🎯', text: 'Exercise Variety!' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4">
            <CheckCircle className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Workout Complete! 🎉</h1>
          <p className="text-purple-100">Great job crushing it today!</p>
        </div>

        {/* Stats Grid */}
        <div className="p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{duration}</div>
              <div className="text-sm text-gray-600">Minutes</div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <Dumbbell className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{totalSets}</div>
              <div className="text-sm text-gray-600">Sets</div>
            </div>

            <div className="bg-green-50 rounded-xl p-4 text-center">
              <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{totalReps}</div>
              <div className="text-sm text-gray-600">Reps</div>
            </div>

            <div className="bg-orange-50 rounded-xl p-4 text-center">
              <Award className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(totalVolume)}
              </div>
              <div className="text-sm text-gray-600">kg Volume</div>
            </div>
          </div>

          {/* Achievements */}
          {achievements.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                🏆 Achievements Unlocked
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-3"
                  >
                    <span className="text-3xl">{achievement.icon}</span>
                    <span className="font-medium text-gray-800">{achievement.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exercise Breakdown */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Exercise Breakdown
            </h3>
            <div className="space-y-3">
              {exercises.map((ex, index) => {
                const completedSets = ex.sets.filter(s => s.completed);
                const exerciseVolume = completedSets.reduce(
                  (sum, s) => sum + s.weight * s.actual_reps,
                  0
                );

                return (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{ex.exercise.name}</h4>
                        <p className="text-sm text-gray-600">
                          {completedSets.length} sets • {Math.round(exerciseVolume)}kg volume
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {completedSets.map((set, setIndex) => (
                        <div
                          key={setIndex}
                          className="text-xs bg-white px-2 py-1 rounded border border-gray-200"
                        >
                          {set.weight}kg × {set.actual_reps}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Motivational Message */}
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-6 mb-6">
            <p className="text-center text-gray-800 font-medium">
              &quot;Consistency is key! Every workout brings you closer to your goals. 💪&quot;
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}