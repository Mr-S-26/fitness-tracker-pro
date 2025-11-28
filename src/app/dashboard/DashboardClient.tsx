'use client';

import { useState } from 'react';
import { resetUserProfile } from '@/app/actions/reset-profile';
import { 
  Activity, 
  Flame, 
  Dumbbell, 
  Calendar, 
  ChevronRight,
  Utensils
} from 'lucide-react';
import Link from 'next/link';

interface DashboardClientProps {
  profile: any;
  nutrition: any;
  program: any;
  user: any;
}

export default function DashboardClient({ profile, nutrition, program, user }: DashboardClientProps) {
  const [currentWeek] = useState(1); // In a real app, calculate this based on start date

  // Get current day of the week (e.g., "Monday")
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  
  // Find today's workout from the program
  const currentWeekData = program?.program_data?.weeks?.find((w: any) => w.week_number === currentWeek);
  const todaysWorkout = currentWeekData?.workouts?.find((w: any) => w.day === today);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {profile?.full_name?.split(' ')[0] || 'Athlete'} 👋
            </h1>
            <p className="text-gray-600 mt-1">
              Week {currentWeek} • {currentWeekData?.focus || 'Building Consistency'}
            </p>
          </div>
          <div className="flex gap-3">
             <Link href="/workout/check-in" className="bg-white text-gray-700 px-4 py-2 rounded-lg font-medium border border-gray-200 hover:bg-gray-50 transition-colors">
               Daily Check-in
             </Link>
             <Link href="/workout/active" className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2">
               <Dumbbell className="w-4 h-4" />
               Start Workout
             </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            icon={<Flame className="w-6 h-6 text-orange-500" />}
            label="Daily Calorie Target"
            value={`${nutrition?.daily_calories || 0}`}
            subValue="kcal"
            bg="bg-orange-50"
          />
           <StatCard 
            icon={<Activity className="w-6 h-6 text-blue-500" />}
            label="Workouts Completed"
            value="0"
            subValue={`/ ${profile?.available_days_per_week || 3} this week`}
            bg="bg-blue-50"
          />
           <StatCard 
            icon={<Dumbbell className="w-6 h-6 text-purple-500" />}
            label="Current Phase"
            value="Hypertrophy"
            subValue="Week 1-4"
            bg="bg-purple-50"
          />
           <StatCard 
            icon={<Calendar className="w-6 h-6 text-green-500" />}
            label="Streak"
            value="1"
            subValue="Day Active"
            bg="bg-green-50"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Today's Workout Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Today's Training</h2>
                    <p className="text-sm text-gray-500">{today}</p>
                  </div>
                </div>
                {todaysWorkout && (
                   <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                     Scheduled
                   </span>
                )}
              </div>

              {todaysWorkout ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{todaysWorkout.workout_name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{todaysWorkout.exercises?.length || 0} Exercises • ~{profile?.session_duration_minutes || 60} Min</p>
                    
                    <div className="space-y-2">
                      {todaysWorkout.exercises?.slice(0, 3).map((ex: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-sm p-2 bg-white rounded border border-gray-100">
                          <span className="font-medium text-gray-700">{ex.exercise_name}</span>
                          <span className="text-gray-500">{ex.sets} x {ex.reps}</span>
                        </div>
                      ))}
                      {todaysWorkout.exercises?.length > 3 && (
                        <p className="text-xs text-center text-gray-500 pt-2">+ {todaysWorkout.exercises.length - 3} more exercises</p>
                      )}
                    </div>
                  </div>

                  <Link href="/workout/active" className="w-full block text-center bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors">
                    Start Workout Now
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex p-4 bg-gray-50 rounded-full mb-3">
                    <Utensils className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="font-medium text-gray-900">Rest Day</h3>
                  <p className="text-sm text-gray-500 mb-4">Focus on recovery and nutrition today.</p>
                  <button className="text-purple-600 font-medium hover:text-purple-700 text-sm">
                    View Full Schedule →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            
            {/* Nutrition Snapshot */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Utensils className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="font-bold text-gray-900">Nutrition Goals</h2>
              </div>

              <div className="space-y-4">
                <MacroRow label="Protein" current={0} target={nutrition?.protein_grams || 150} color="bg-blue-500" />
                <MacroRow label="Carbs" current={0} target={nutrition?.carbs_grams || 200} color="bg-orange-500" />
                <MacroRow label="Fats" current={0} target={nutrition?.fat_grams || 60} color="bg-yellow-500" />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
               <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
               <div className="space-y-2">
                 <Link href="/measurements" className="w-full">
  <QuickAction label="Log Body Weight" />
</Link>
<Link href="/checkin/weekly" className="w-full">
  <QuickAction label="Weekly Check-in" />
</Link>
                 <QuickAction label="Update Goals" />
                 
                 {/* 🔴 Add this Reset Button */}
                 <form action={resetUserProfile}>
                    <button 
                      type="submit"
                      className="w-full flex items-center justify-between p-3 hover:bg-red-50 text-red-600 rounded-lg transition-colors group"
                    >
                      <span className="text-sm font-medium">Reset & Re-Generate Program</span>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </button>
                 </form>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function StatCard({ icon, label, value, subValue, bg }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        <span className="text-xs text-gray-400 font-medium">{subValue}</span>
      </div>
    </div>
  );
}

function MacroRow({ label, current, target, color }: any) {
  const progress = Math.min((current / target) * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500">{current} / {target}g</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

function QuickAction({ label }: { label: string }) {
  return (
    <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
    </button>
  );
}