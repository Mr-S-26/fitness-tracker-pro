'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import AICoachInterface from '@/components/AICoach/AICoachInterface';
import { Play, MessageSquare, TrendingUp, Calendar, Award, Dumbbell } from 'lucide-react';

interface DashboardClientProps {
  user: User;
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const [loading, setLoading] = useState(false);
  const [showAICoach, setShowAICoach] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const handleStartWorkout = () => {
  router.push('/workout/program'); 
};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🏋️ FitTracker Pro</h1>
            <p className="text-sm text-gray-600">Welcome back, {user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section - Start Workout */}
        <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-8 text-white mb-8 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">Ready to Train?</h2>
              <p className="text-purple-100 mb-6">
                Start a new workout session with AI-powered coaching
              </p>
              <button
                onClick={handleStartWorkout}
                className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-purple-50 transition-all shadow-lg flex items-center gap-3"
              >
                <Play className="w-6 h-6" />
                Start Workout
              </button>
            </div>
            <div className="hidden md:block">
              <Dumbbell className="w-32 h-32 text-white/20" />
            </div>
          </div>
        </div>

        {/* Quick Actions Grid - CHANGED FROM 3 TO 4 COLUMNS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Quick Stats */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Workouts</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">This Week</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Volume</span>
                <span className="font-semibold">0 kg</span>
              </div>
            </div>
          </div>

          {/* AI Coach */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">AI Coach</h3>
            </div>
            <p className="text-gray-600 mb-4 text-sm">
              Get personalized advice, form tips, and training programs
            </p>
            <button
              onClick={() => setShowAICoach(!showAICoach)}
              className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showAICoach ? 'Hide Coach' : 'Chat with Coach'}
            </button>
          </div>

          {/* Exercise Library - ✅ NOW IN THE GRID */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Dumbbell className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Exercise Library</h3>
            </div>
            <p className="text-gray-600 mb-4 text-sm">
              Browse exercises, view details, and create custom exercises
            </p>
            <button
              onClick={() => router.push('/exercises')}
              className="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Browse Library
            </button>
          </div>

          {/* Personal Records */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Records</h3>
            </div>
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm">
                Complete workouts to track your personal records
              </p>
            </div>
          </div>
        </div>

        {/* AI Coach Interface */}
        {showAICoach && (
          <div className="mb-8">
            <AICoachInterface />
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="text-center py-12 text-gray-500">
            <Dumbbell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No workouts yet</p>
            <p className="text-sm mt-2">Start your first workout to see your progress here!</p>
          </div>
        </div>

        {/* Progress Chart Placeholder */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Progress Tracking</h3>
          <div className="text-center py-12 text-gray-500">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>Your progress charts will appear here once you start tracking workouts</p>
          </div>
        </div>
      </main>
    </div>
  );
}