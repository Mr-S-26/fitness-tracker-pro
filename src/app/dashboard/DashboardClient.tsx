'use client';

import { useState, useMemo } from 'react';
import { 
  Activity, 
  Flame, 
  Dumbbell, 
  Calendar, 
  ChevronRight,
  Utensils
} from 'lucide-react';
import Link from 'next/link';
import { resetUserProfile } from '@/app/actions/reset-profile';
import { ThemeToggle } from '@/components/ThemeToggle';
import { differenceInWeeks } from 'date-fns';

interface DashboardClientProps {
  profile: any;
  nutrition: any;
  program: any;
  user: any;
}

export default function DashboardClient({ profile, nutrition, program, user }: DashboardClientProps) {
  // 1. Calculate "Live" Week & Phase
  const { currentWeek, currentPhase, phaseName } = useMemo(() => {
    if (!program) return { currentWeek: 1, currentPhase: 'N/A', phaseName: 'No Program' };
    
    const startDate = new Date(program.created_at);
    const weeksSinceStart = Math.max(0, differenceInWeeks(new Date(), startDate));
    const currentWeekNum = weeksSinceStart + 1; // 0-index to 1-index
    
    // Get the actual week data from the AI plan
    // Safety check: If past week 12, just show week 12 data for now (or loop)
    const weekData = program.program_data?.weeks?.find((w: any) => w.week_number === currentWeekNum) 
                     || program.program_data?.weeks?.[program.program_data.weeks.length - 1];

    return {
      currentWeek: currentWeekNum,
      currentPhase: weekData?.focus || 'General Fitness',
      phaseName: `Week ${currentWeekNum}-${Math.min(currentWeekNum + 3, 12)}` 
    };
  }, [program]);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  
  // Find today's workout in the *correct* week
  // Use safe access for weeks in case currentWeek > 12
  const currentWeekData = program?.program_data?.weeks?.find((w: any) => w.week_number === currentWeek) 
                          || program?.program_data?.weeks?.[program?.program_data?.weeks?.length - 1];
                          
  const todaysWorkout = currentWeekData?.workouts?.find((w: any) => w.day === today);

  // 3. Dynamic User Title
  const userTitle = useMemo(() => {
    if (profile?.full_name) return profile.full_name.split(' ')[0]; 
    
    const goal = profile?.primary_goal;
    if (goal === 'strength') return 'Lifter';
    if (goal === 'muscle_gain') return 'Bodybuilder';
    if (goal === 'fat_loss') return 'Warrior';
    if (goal === 'athletic_performance') return 'Athlete';
    return 'Friend'; 
  }, [profile]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {userTitle} 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Week {currentWeek} • {currentPhase}
              </p>
            </div>
            <div className="md:hidden">
                <ThemeToggle />
            </div>
          </div>

          <div className="flex gap-3 items-center">
             <div className="hidden md:block">
                <ThemeToggle />
             </div>

             <Link href="/workout/check-in" className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
               Daily Check-in
             </Link>
             <Link href="/workout/check-in" className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-lg shadow-purple-500/20">
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
            bg="bg-orange-50 dark:bg-orange-900/20"
          />
           <StatCard 
            icon={<Activity className="w-6 h-6 text-blue-500" />}
            label="Workouts Completed"
            value="0" 
            subValue={`/ ${profile?.available_days_per_week || 3} this week`}
            bg="bg-blue-50 dark:bg-blue-900/20"
          />
           
           <StatCard 
            icon={<Dumbbell className="w-6 h-6 text-purple-500" />}
            label="Current Phase"
            value={currentPhase.split(':')[0]} 
            subValue={currentPhase.split(':')[1] || 'Training'} 
            bg="bg-purple-50 dark:bg-purple-900/20"
          />
           
           <StatCard 
            icon={<Calendar className="w-6 h-6 text-green-500" />}
            label="Streak"
            value="1"
            subValue="Day Active"
            bg="bg-green-50 dark:bg-green-900/20"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Today's Workout Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Today's Training</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{today}</p>
                  </div>
                </div>
                {todaysWorkout && (
                   <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
                     Scheduled
                   </span>
                )}
              </div>

              {todaysWorkout ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{todaysWorkout.workout_name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{todaysWorkout.exercises?.length || 0} Exercises • ~{profile?.session_duration_minutes || 60} Min</p>
                    
                    <div className="space-y-2">
                      {todaysWorkout.exercises?.slice(0, 3).map((ex: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-sm p-2 bg-white dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-700">
                          <span className="font-medium text-gray-700 dark:text-gray-200">{ex.exercise_name}</span>
                          <span className="text-gray-500 dark:text-gray-400">{ex.sets} x {ex.reps}</span>
                        </div>
                      ))}
                      {todaysWorkout.exercises?.length > 3 && (
                        <p className="text-xs text-center text-gray-500 dark:text-gray-500 pt-2">+ {todaysWorkout.exercises.length - 3} more exercises</p>
                      )}
                    </div>
                  </div>

                  <Link href="/workout/check-in" className="w-full block text-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
                    Start Workout Now
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex p-4 bg-gray-50 dark:bg-gray-800 rounded-full mb-3">
                    <Utensils className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Rest Day</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Focus on recovery and nutrition today.</p>
                  <Link href="/workout/program" className="text-purple-600 dark:text-purple-400 font-medium hover:text-purple-700 dark:hover:text-purple-300 text-sm">
                    View Full Schedule →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            
            {/* Nutrition Snapshot */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Utensils className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="font-bold text-gray-900 dark:text-white">Nutrition Goals</h2>
              </div>

              <div className="space-y-4">
                <MacroRow label="Protein" current={0} target={nutrition?.protein_grams || 150} color="bg-blue-500" />
                <MacroRow label="Carbs" current={0} target={nutrition?.carbs_grams || 200} color="bg-orange-500" />
                <MacroRow label="Fats" current={0} target={nutrition?.fat_grams || 60} color="bg-yellow-500" />
              </div>
              
              <Link href="/nutrition" className="block mt-4 text-center text-sm text-green-600 dark:text-green-400 font-medium hover:text-green-700 dark:hover:text-green-300">
                View Nutrition Plan →
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
               <h3 className="font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
               <div className="space-y-2">
                 
                 <Link href="/workout/program" className="w-full">
                    <QuickAction label="View Full Schedule" />
                 </Link>

                 <Link href="/measurements" className="w-full">
                    <QuickAction label="Log Body Weight" />
                 </Link>

                 <Link href="/checkin/weekly" className="w-full">
                    <QuickAction label="Weekly Check-in" />
                 </Link>

                 <Link href="/coach" className="w-full">
                    <QuickAction label="Chat with AI Coach" />
                 </Link>

                 {/* Reset Button */}
                 <form action={resetUserProfile}>
                    <button 
                      type="submit"
                      className="w-full flex items-center justify-between p-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors group"
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
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
      <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">{subValue}</span>
      </div>
    </div>
  );
}

function MacroRow({ label, current, target, color }: any) {
  const progress = Math.min((current / target) * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-gray-500 dark:text-gray-400">{current} / {target}g</span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

function QuickAction({ label }: { label: string }) {
  return (
    <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors group">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
      <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-600 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
    </button>
  );
}