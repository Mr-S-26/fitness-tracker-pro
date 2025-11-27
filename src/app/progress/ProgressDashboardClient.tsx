'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  Calendar,
  Award,
  Dumbbell,
  ChevronLeft,
  Target,
  Flame,
  Activity,
  BarChart3,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface WorkoutSession {
  id: string;
  name: string;
  started_at: string;
  completed_at: string;
  total_volume: number;
}

interface SetLog {
  id: string;
  weight: number;
  actual_reps: number;
  created_at: string;
  exercise: {
    id: string;
    name: string;
    category: string;
    is_compound: boolean;
  };
  session: {
    started_at: string;
  };
}

interface ProgressDashboardClientProps {
  userId: string;
  sessions: WorkoutSession[];
  setLogs: SetLog[];
}

interface PersonalRecord {
  exerciseId: string;  // ← ADDED: Need exercise ID for navigation
  exerciseName: string;
  weight: number;
  reps: number;
  date: string;
  category: string;
}

export default function ProgressDashboardClient({
  sessions,
  setLogs,
}: ProgressDashboardClientProps) {
  const router = useRouter();
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year'>('month');

  // Calculate total stats
  const totalStats = useMemo(() => {
    const totalWorkouts = sessions.length;
    const totalVolume = sessions.reduce((sum, s) => sum + (s.total_volume || 0), 0);
    const totalSets = setLogs.length;
    const totalReps = setLogs.reduce((sum, log) => sum + log.actual_reps, 0);

    return {
      totalWorkouts,
      totalVolume: Math.round(totalVolume),
      totalSets,
      totalReps,
    };
  }, [sessions, setLogs]);

  // Calculate personal records (1RM estimates)
  const personalRecords = useMemo(() => {
    const recordsByExercise = new Map<string, PersonalRecord>();

    setLogs.forEach((log) => {
      if (!log.exercise) return;

      const exerciseName = log.exercise.name;
      const exerciseId = log.exercise.id;  // ← ADDED: Get exercise ID
      const oneRepMax = calculateOneRepMax(log.weight, log.actual_reps);

      const existing = recordsByExercise.get(exerciseName);
      if (!existing || oneRepMax > existing.weight) {
        recordsByExercise.set(exerciseName, {
          exerciseId,  // ← ADDED: Store exercise ID
          exerciseName,
          weight: oneRepMax,
          reps: log.actual_reps,
          date: log.session?.started_at || log.created_at,
          category: log.exercise.category,
        });
      }
    });

    return Array.from(recordsByExercise.values())
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 10); // Top 10 PRs
  }, [setLogs]);

  // Calculate volume progression over time
  const volumeProgression = useMemo(() => {
    const sessionsByWeek = new Map<string, number>();

    sessions.forEach((session) => {
      const date = new Date(session.started_at);
      const weekStart = getWeekStart(date);
      const weekKey = weekStart.toISOString().split('T')[0];

      const current = sessionsByWeek.get(weekKey) || 0;
      sessionsByWeek.set(weekKey, current + (session.total_volume || 0));
    });

    return Array.from(sessionsByWeek.entries())
      .map(([week, volume]) => ({
        week: formatWeek(week),
        volume: Math.round(volume),
      }))
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-12); // Last 12 weeks
  }, [sessions]);

  // Calculate workout frequency by day of week
  const workoutFrequency = useMemo(() => {
    const dayCount: Record<string, number> = {
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
      Sun: 0,
    };

    sessions.forEach((session) => {
      const date = new Date(session.started_at);
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
      dayCount[dayName]++;
    });

    return Object.entries(dayCount).map(([day, count]) => ({
      day,
      count,
    }));
  }, [sessions]);

  // Calculate current streak
  const currentStreak = useMemo(() => {
    if (sessions.length === 0) return 0;

    const sortedSessions = [...sessions].sort(
      (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const session of sortedSessions) {
      const sessionDate = new Date(session.started_at);
      sessionDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor(
        (currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff <= 1) {
        streak++;
        currentDate = sessionDate;
      } else {
        break;
      }
    }

    return streak;
  }, [sessions]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Progress Tracking</h1>
              <p className="text-sm text-gray-600">Your fitness journey analytics</p>
            </div>
          </div>

          {/* Timeframe Selector */}
          <div className="flex gap-2">
            {(['week', 'month', 'year'] as const).map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  selectedTimeframe === timeframe
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Calendar}
            label="Total Workouts"
            value={totalStats.totalWorkouts}
            color="purple"
          />
          <StatCard
            icon={TrendingUp}
            label="Total Volume"
            value={`${totalStats.totalVolume.toLocaleString()}kg`}
            color="blue"
          />
          <StatCard
            icon={Dumbbell}
            label="Total Sets"
            value={totalStats.totalSets}
            color="green"
          />
          <StatCard
            icon={Flame}
            label="Current Streak"
            value={`${currentStreak} days`}
            color="orange"
          />
        </div>

        {/* Volume Progression Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Volume Progression (Last 12 Weeks)
          </h2>
          {volumeProgression.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p>Complete more workouts to see your progression</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={volumeProgression}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="volume"
                  stroke="#9333ea"
                  strokeWidth={2}
                  name="Volume (kg)"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Personal Records */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            Personal Records (Estimated 1RM)
          </h2>
          {personalRecords.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p>Complete workouts to set your first PRs</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Exercise
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Category
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                      Est. 1RM
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {personalRecords.map((pr, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      {/* ⬇️ UPDATED: Made exercise name clickable ⬇️ */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => router.push(`/progress/exercise/${pr.exerciseId}`)}
                          className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors text-left"
                          title="View detailed progress"
                        >
                          {pr.exerciseName}
                        </button>
                      </td>
                      {/* ⬆️ END UPDATE ⬆️ */}
                      <td className="py-3 px-4 text-sm text-gray-600 capitalize">
                        {pr.category}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-purple-600">
                        {pr.weight.toFixed(1)}kg
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-600">
                        {new Date(pr.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Workout Frequency by Day */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Workout Frequency by Day
          </h2>
          {sessions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p>Complete workouts to see patterns</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={workoutFrequency}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" name="Workouts" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper Components
function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: 'purple' | 'blue' | 'green' | 'orange';
}) {
  const colorClasses = {
    purple: 'bg-purple-50 text-purple-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

// Helper Functions
function calculateOneRepMax(weight: number, reps: number): number {
  if (reps === 1) return weight;
  // Epley Formula: 1RM = weight × (1 + reps/30)
  return weight * (1 + reps / 30);
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
  return new Date(d.setDate(diff));
}

function formatWeek(dateString: string): string {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}