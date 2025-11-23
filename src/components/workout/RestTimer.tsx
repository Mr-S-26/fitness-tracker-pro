'use client';

import { useState, useEffect } from 'react';
import { Clock, Play, Pause, SkipForward, Plus, Minus } from 'lucide-react';

interface RestTimerProps {
  duration: number; // in seconds
  onComplete: () => void;
  onSkip: () => void;
}

export default function RestTimer({ duration, onComplete, onSkip }: RestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(true);
  const [initialDuration, setInitialDuration] = useState(duration);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Play notification sound (optional)
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Rest Complete!', {
              body: 'Time for your next set 💪',
              icon: '/fitness-icon.png',
            });
          }
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, onComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const addTime = (seconds: number) => {
    setTimeLeft((prev) => prev + seconds);
    setInitialDuration((prev) => prev + seconds);
  };

  const progress = ((initialDuration - timeLeft) / initialDuration) * 100;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-3">
            <Clock className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Rest Timer</h2>
          <p className="text-gray-600 mt-1">Recover before your next set</p>
        </div>

        {/* Timer Display */}
        <div className="relative mb-8">
          {/* Progress Circle */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="90"
              stroke="#E5E7EB"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="100"
              cy="100"
              r="90"
              stroke="#9333EA"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 90}`}
              strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>

          {/* Time Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900">
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {timeLeft === 0 ? 'Ready!' : 'remaining'}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-3">
          {/* Play/Pause */}
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="w-full bg-purple-600 text-white py-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Resume
              </>
            )}
          </button>

          {/* Time Adjustments */}
          <div className="flex gap-2">
            <button
              onClick={() => addTime(-15)}
              disabled={timeLeft < 15}
              className="flex-1 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:border-purple-500 hover:text-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 font-medium"
            >
              <Minus className="w-4 h-4" />
              15s
            </button>
            <button
              onClick={() => addTime(15)}
              className="flex-1 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:border-purple-500 hover:text-purple-600 transition-colors flex items-center justify-center gap-1 font-medium"
            >
              <Plus className="w-4 h-4" />
              15s
            </button>
            <button
              onClick={() => addTime(30)}
              className="flex-1 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:border-purple-500 hover:text-purple-600 transition-colors flex items-center justify-center gap-1 font-medium"
            >
              <Plus className="w-4 h-4" />
              30s
            </button>
          </div>

          {/* Skip Rest */}
          <button
            onClick={onSkip}
            className="w-full py-3 text-gray-600 hover:text-gray-800 font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <SkipForward className="w-5 h-5" />
            Skip Rest
          </button>
        </div>

        {/* Tips */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">💡 Tip:</span> Use this time to hydrate, 
            check your form, or prepare mentally for the next set.
          </p>
        </div>
      </div>
    </div>
  );
}