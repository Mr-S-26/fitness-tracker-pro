'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft, TrendingUp, Calendar, ArrowUp } from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';

interface ExerciseSet {
  id: string;
  weight_kg: number;
  reps: number;
  created_at: string;
}

export default function ExerciseProgressClient({ exerciseName, history }: { exerciseName: string, history: ExerciseSet[] }) {
  const router = useRouter();

  // 1. Calculate Estimated 1RM for every set
  const chartData = history.map(set => {
    // Epley Formula: 1RM = Weight * (1 + Reps/30)
    const oneRepMax = Math.round(set.weight_kg * (1 + set.reps / 30));
    return {
      date: new Date(set.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      weight: set.weight_kg,
      reps: set.reps,
      orm: oneRepMax,
    };
  });

  // 2. Best Stats
  const bestLift = Math.max(...history.map(h => h.weight_kg), 0);
  const bestORM = Math.max(...chartData.map(d => d.orm), 0);
  const totalSets = history.length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()} 
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{exerciseName} Progress</h1>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <StatBox label="Best Weight" value={`${bestLift} kg`} icon={<ArrowUp className="w-4 h-4 text-green-500" />} />
          <StatBox label="Est. 1RM" value={`${bestORM} kg`} icon={<TrendingUp className="w-4 h-4 text-purple-500" />} />
          <StatBox label="Total Sets" value={totalSets} icon={<Calendar className="w-4 h-4 text-blue-500" />} />
        </div>

        {/* Main Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-6">Estimated 1 Rep Max Trend</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorOrm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{fontSize: 12}} />
                <YAxis domain={['auto', 'auto']} tick={{fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="orm" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorOrm)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

function StatBox({ label, value, icon }: any) {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs font-bold text-gray-500 uppercase">{label}</span>
      </div>
      <div className="text-2xl font-black text-gray-900">{value}</div>
    </div>
  );
}