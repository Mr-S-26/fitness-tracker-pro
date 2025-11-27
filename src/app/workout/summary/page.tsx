import Link from 'next/link';
import { Trophy, Clock, Dumbbell, CheckCircle, ArrowRight } from 'lucide-react';

export default async function WorkoutSummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ duration: string; volume: string; sets: string }>
}) {
  const params = await searchParams;
  const duration = Math.round(Number(params.duration) / 60);
  const volume = Number(params.volume);
  const sets = Number(params.sets);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        
        {/* Trophy Animation */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-500 blur-2xl opacity-20 rounded-full" />
            <div className="relative bg-gradient-to-b from-yellow-300 to-yellow-600 p-6 rounded-full shadow-2xl border-4 border-yellow-200">
              <Trophy className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>

        <div className="text-center space-y-2 mb-10">
          <h1 className="text-4xl font-black text-white tracking-tight">WORKOUT CRUSHED!</h1>
          <p className="text-purple-200 font-medium">You're getting stronger every day.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <StatBox 
            icon={<Clock className="w-5 h-5 text-blue-400" />} 
            label="Duration" 
            value={`${duration} min`} 
          />
          <StatBox 
            icon={<Dumbbell className="w-5 h-5 text-purple-400" />} 
            label="Volume" 
            value={`${volume} kg`} 
          />
          <StatBox 
            icon={<CheckCircle className="w-5 h-5 text-green-400" />} 
            label="Sets Done" 
            value={sets} 
            fullWidth
          />
        </div>

        {/* AI Feedback Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-bold text-green-400 uppercase tracking-wider">AI Coach Feedback</span>
          </div>
          <p className="text-gray-200 leading-relaxed">
            "Excellent work hitting your volume targets. Your recovery score was low today, so I'm glad you stuck to the adjusted weights. Make sure to eat 30g of protein in the next hour!"
          </p>
        </div>

        <Link 
          href="/dashboard" 
          className="w-full bg-white text-purple-900 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition-all shadow-xl"
        >
          Back to Dashboard <ArrowRight className="w-5 h-5" />
        </Link>

      </div>
    </div>
  );
}

function StatBox({ icon, label, value, fullWidth }: any) {
  return (
    <div className={`bg-slate-800/50 border border-slate-700 p-4 rounded-2xl ${fullWidth ? 'col-span-2' : ''}`}>
      <div className="flex items-center gap-2 mb-2 text-gray-400 text-sm font-medium">
        {icon} {label}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );
}