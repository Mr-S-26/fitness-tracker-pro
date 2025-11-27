'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ArrowLeft, TrendingUp, Calendar, Dumbbell } from 'lucide-react';

interface WorkoutSession {
  id: string;
  started_at: string;
  completed_at: string;
  workout_name: string;
}

interface SetLog {
  id: string;
  exercise_id: string;
  weight_kg: number;
  reps: number;
  set_number: number;
  created_at: string;
  workout_sessions: WorkoutSession;
}

interface Exercise {
  id: string;
  name: string;
  category: string;
  equipment: string;
}

interface Props {
  exercise: Exercise;
  setLogs: SetLog[];
}

export default function ExerciseProgressClient({ exercise, setLogs }: Props) {
  const router = useRouter();

  // Calculate estimated 1RM using Epley formula
  const calculate1RM = (weight: number, reps: number) => {
    return weight * (1 + reps / 30);
  };

  // Calculate statistics
  const stats = useMemo(() => {
    if (setLogs.length === 0) {
      return {
        totalSets: 0,
        totalVolume: 0,
        allTimePR: 0,
        bestVolume: 0,
        best1RM: 0,
        totalSessions: 0,
      };
    }

    const totalSets = setLogs.length;
    const totalVolume = setLogs.reduce((sum, log) => sum + (log.weight_kg * log.reps), 0);
    const allTimePR = Math.max(...setLogs.map(log => log.weight_kg));
    const bestVolume = Math.max(...setLogs.map(log => log.weight_kg * log.reps));
    const best1RM = Math.max(...setLogs.map(log => calculate1RM(log.weight_kg, log.reps)));
    
    // Count unique sessions
    const uniqueSessions = new Set(setLogs.map(log => log.workout_sessions.id));
    const totalSessions = uniqueSessions.size;

    return {
      totalSets,
      totalVolume,
      allTimePR,
      bestVolume,
      best1RM,
      totalSessions,
    };
  }, [setLogs]);

  // Group sets by session and calculate session metrics
  const sessionData = useMemo(() => {
    const sessionMap = new Map<string, {
      id: string;
      date: string;
      workoutName: string;
      sets: SetLog[];
      maxWeight: number;
      totalVolume: number;
      max1RM: number;
      avgWeight: number;
    }>();

    setLogs.forEach(log => {
      const sessionId = log.workout_sessions.id;
      if (!sessionMap.has(sessionId)) {
        sessionMap.set(sessionId, {
          id: sessionId,
          date: log.workout_sessions.started_at,
          workoutName: log.workout_sessions.workout_name,
          sets: [],
          maxWeight: 0,
          totalVolume: 0,
          max1RM: 0,
          avgWeight: 0,
        });
      }

      const session = sessionMap.get(sessionId)!;
      session.sets.push(log);
      session.maxWeight = Math.max(session.maxWeight, log.weight_kg);
      session.totalVolume += log.weight_kg * log.reps;
      session.max1RM = Math.max(session.max1RM, calculate1RM(log.weight_kg, log.reps));
    });

    // Calculate average weight for each session
    sessionMap.forEach(session => {
      session.avgWeight = session.sets.reduce((sum, set) => sum + set.weight_kg, 0) / session.sets.length;
    });

    return Array.from(sessionMap.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [setLogs]);

  // Chart data
  const chartData = useMemo(() => {
    return sessionData.map(session => ({
      date: new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      maxWeight: session.maxWeight,
      totalVolume: session.totalVolume,
      max1RM: Math.round(session.max1RM * 10) / 10,
      avgWeight: Math.round(session.avgWeight * 10) / 10,
    }));
  }, [sessionData]);

  // Best sets (top 10 by estimated 1RM)
  const bestSets = useMemo(() => {
    return [...setLogs]
      .map(log => ({
        ...log,
        estimated1RM: calculate1RM(log.weight_kg, log.reps),
        volume: log.weight_kg * log.reps,
      }))
      .sort((a, b) => b.estimated1RM - a.estimated1RM)
      .slice(0, 10);
  }, [setLogs]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/progress')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Progress
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{exercise.name}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                  {exercise.category}
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                  {exercise.equipment}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">All-Time PR</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.allTimePR}</p>
            <p className="text-xs text-gray-500 mt-1">kg</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Dumbbell className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">Best 1RM</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{Math.round(stats.best1RM)}</p>
            <p className="text-xs text-gray-500 mt-1">kg (estimated)</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-600">Total Sessions</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalSessions}</p>
            <p className="text-xs text-gray-500 mt-1">{stats.totalSets} sets</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <span className="text-sm text-gray-600">Total Volume</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{Math.round(stats.totalVolume)}</p>
            <p className="text-xs text-gray-500 mt-1">kg</p>
          </div>
        </div>

        {/* Charts */}
        {chartData.length >= 2 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Weight Progression */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Weight Progression</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="maxWeight"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Max Weight (kg)"
                    dot={{ fill: '#3b82f6', r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgWeight"
                    stroke="#93c5fd"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Avg Weight (kg)"
                    dot={{ fill: '#93c5fd', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Volume Progression */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Volume Progression</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="totalVolume"
                    fill="#10b981"
                    name="Total Volume (kg)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Estimated 1RM Progression */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estimated 1RM Progression</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="max1RM"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    name="Estimated 1RM (kg)"
                    dot={{ fill: '#8b5cf6', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <p className="text-blue-800 text-center">
              Complete at least 2 sessions with this exercise to see progression charts! 📊
            </p>
          </div>
        )}

        {/* Best Sets */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Top 10 Best Sets</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reps</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Est. 1RM</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bestSets.map((set, index) => (
                  <tr key={set.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-bold ${index === 0 ? 'text-yellow-600' : 'text-gray-900'}`}>
                        #{index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(set.workout_sessions.started_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {set.weight_kg} kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {set.reps}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-purple-600">
                      {Math.round(set.estimated1RM * 10) / 10} kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {set.volume} kg
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Session History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Session History</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {sessionData.slice().reverse().map(session => (
              <div key={session.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{session.workoutName}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(session.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Max Weight</p>
                    <p className="text-2xl font-bold text-blue-600">{session.maxWeight} kg</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Total Volume</p>
                    <p className="text-lg font-semibold text-gray-900">{Math.round(session.totalVolume)} kg</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Max 1RM</p>
                    <p className="text-lg font-semibold text-gray-900">{Math.round(session.max1RM)} kg</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Total Sets</p>
                    <p className="text-lg font-semibold text-gray-900">{session.sets.length}</p>
                  </div>
                </div>

                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Set</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Weight</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Reps</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Volume</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {session.sets.map(set => (
                      <tr key={set.id}>
                        <td className="px-4 py-2 text-gray-600">Set {set.set_number}</td>
                        <td className="px-4 py-2 font-semibold text-gray-900">{set.weight_kg} kg</td>
                        <td className="px-4 py-2 text-gray-900">{set.reps}</td>
                        <td className="px-4 py-2 text-gray-600">{set.weight_kg * set.reps} kg</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}