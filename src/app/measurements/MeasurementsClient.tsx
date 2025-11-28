'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  Scale, 
  Plus, 
  TrendingDown, 
  TrendingUp, 
  Minus,
  // Minus 
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { logMeasurement } from '@/app/actions/log-measurements';

interface Measurement {
  id: string;
  date: string;
  body_weight?: number;
  body_fat_percentage?: number;
}

export default function MeasurementsClient({ history }: { history: Measurement[] }) {
  const router = useRouter();
  const [isLogging, setIsLogging] = useState(false);
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');

  // 1. Prepare Chart Data
  const data = history.map(m => ({
    date: new Date(m.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    weight: m.body_weight,
    fat: m.body_fat_percentage
  })).filter(d => d.weight); // Only show points with weight

  // 2. Calculate Trends
  const currentWeight = history[history.length - 1]?.body_weight || 0;
  const startWeight = history[0]?.body_weight || currentWeight;
  const change = currentWeight - startWeight;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await logMeasurement({
      weight: parseFloat(weight),
      bodyFat: bodyFat ? parseFloat(bodyFat) : undefined
    });
    setIsLogging(false);
    setWeight('');
    setBodyFat('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()} 
              className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Body Metrics</h1>
          </div>
          <button
            onClick={() => setIsLogging(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Log Today
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard 
            label="Current Weight" 
            value={`${currentWeight} kg`} 
            icon={<Scale className="w-5 h-5 text-blue-500" />} 
          />
          <StatCard 
            label="Total Change" 
            value={`${Math.abs(change).toFixed(1)} kg`} 
            icon={change < 0 ? <TrendingDown className="w-5 h-5 text-green-500" /> : change > 0 ? <TrendingUp className="w-5 h-5 text-red-500" /> : <Minus className="w-5 h-5 text-gray-500" />}
            subtext={change < 0 ? 'Lost' : change > 0 ? 'Gained' : 'No Change'}
          />
        </div>

        {/* Main Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-6">Weight Trend</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{fontSize: 12}} />
                <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Log Modal */}
        {isLogging && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm animate-in zoom-in-95">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Log Measurement</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                  <input 
                    type="number" step="0.1" required
                    value={weight} onChange={(e) => setWeight(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-lg"
                    placeholder="e.g. 75.5"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Body Fat % (Optional)</label>
                  <input 
                    type="number" step="0.1"
                    value={bodyFat} onChange={(e) => setBodyFat(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-lg"
                    placeholder="e.g. 15"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    type="button" onClick={() => setIsLogging(false)}
                    className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function StatCard({ label, value, icon, subtext }: any) {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs font-bold text-gray-500 uppercase">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-2xl font-black text-gray-900">{value}</div>
        {subtext && <span className="text-sm font-medium text-gray-500">{subtext}</span>}
      </div>
    </div>
  );
}