'use client';

import { Brain, Dumbbell, TrendingUp, Heart } from 'lucide-react';

export default function WelcomeStep() {
  return (
    <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mb-6">
          <Brain className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to FitTracker Pro! 🏋️
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Your AI-powered personal trainer that adapts to <span className="text-purple-600 font-semibold">your</span> equipment, 
          <span className="text-purple-600 font-semibold"> your</span> schedule, and <span className="text-purple-600 font-semibold">your</span> goals.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
          <Dumbbell className="w-8 h-8 text-purple-600 mb-3" />
          <h3 className="font-bold text-gray-900 mb-2">Personalized Programs</h3>
          <p className="text-sm text-gray-600">
            AI designs workout programs based on your available equipment, experience level, and goals.
          </p>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <TrendingUp className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="font-bold text-gray-900 mb-2">Real-Time Coaching</h3>
          <p className="text-sm text-gray-600">
            Get immediate feedback after each set with smart weight and rep adjustments.
          </p>
        </div>

        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
          <Brain className="w-8 h-8 text-green-600 mb-3" />
          <h3 className="font-bold text-gray-900 mb-2">Adaptive Training</h3>
          <p className="text-sm text-gray-600">
            Your program evolves as you progress, with automatic adjustments based on performance.
          </p>
        </div>

        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <Heart className="w-8 h-8 text-red-600 mb-3" />
          <h3 className="font-bold text-gray-900 mb-2">Nutrition Guidance</h3>
          <p className="text-sm text-gray-600">
            Get personalized macro targets and meal timing strategies for your goals.
          </p>
        </div>
      </div>

      {/* What to Expect */}
      <div className="bg-gradient-to-r from-purple-100 to-blue-100 border-2 border-purple-300 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 mb-3">What to Expect:</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-purple-600 font-bold">•</span>
            <span>10 quick questions about your goals, experience, and available equipment</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 font-bold">•</span>
            <span>AI will design a complete 12-week training program just for you</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 font-bold">•</span>
            <span>You'll get personalized nutrition targets based on your body and goals</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 font-bold">•</span>
            <span>Takes about 3-5 minutes to complete</span>
          </li>
        </ul>
      </div>

      <div className="text-center mt-8">
        <p className="text-sm text-gray-500">
          Ready to start your fitness journey? Let's go! 🚀
        </p>
      </div>
    </div>
  );
}