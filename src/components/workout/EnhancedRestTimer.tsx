'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, Plus, Minus, Clock } from 'lucide-react';

interface EnhancedRestTimerProps {
  initialSeconds: number;
  onComplete: () => void;
  onSkip: () => void;
  exerciseName?: string;
  setNumber?: number;
}

export default function EnhancedRestTimer({
  initialSeconds,
  onComplete,
  onSkip,
  exerciseName,
  setNumber,
}: EnhancedRestTimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const [targetSeconds, setTargetSeconds] = useState(initialSeconds);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, seconds, onComplete]);

  const togglePause = () => {
    setIsRunning(!isRunning);
  };

  const adjustTime = (adjustment: number) => {
    const newTime = Math.max(0, seconds + adjustment);
    setSeconds(newTime);
    setTargetSeconds(newTime);
    if (newTime > 0 && !isRunning) {
      setIsRunning(true);
    }
  };

  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressColor = (): string => {
    const percentage = (seconds / targetSeconds) * 100;
    if (percentage > 50) return 'from-green-500 to-green-600';
    if (percentage > 25) return 'from-yellow-500 to-orange-500';
    return 'from-orange-500 to-red-500';
  };

  const getTimeRemaining = (): string => {
    if (seconds === 0) return 'Rest Complete!';
    if (seconds <= 10) return 'Almost there!';
    if (seconds <= 30) return 'Final 30 seconds';
    if (seconds <= 60) return 'One minute left';
    return 'Take your time';
  };

  const progressPercentage = ((targetSeconds - seconds) / targetSeconds) * 100;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        {/* Header */}
        {exerciseName && (
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">{exerciseName}</h3>
            {setNumber && (
              <p className="text-gray-600 text-sm mt-1">Rest before Set {setNumber}</p>
            )}
          </div>
        )}

        {/* Main Timer Display */}
        <div className="relative mb-8">
          {/* Circular Progress */}
          <div className="relative w-64 h-64 mx-auto">
            {/* Background Circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="#E5E7EB"
                strokeWidth="8"
                fill="none"
              />
              {/* Progress Circle */}
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 120}`}
                strokeDashoffset={`${2 * Math.PI * 120 * (1 - progressPercentage / 100)}`}
                className="transition-all duration-1000 ease-linear"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" className={`${seconds <= 10 ? 'text-red-500' : seconds <= 30 ? 'text-orange-500' : 'text-green-500'}`} stopColor="currentColor" />
                  <stop offset="100%" className={`${seconds <= 10 ? 'text-red-600' : seconds <= 30 ? 'text-orange-600' : 'text-green-600'}`} stopColor="currentColor" />
                </linearGradient>
              </defs>
            </svg>

            {/* Time Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Clock className={`w-8 h-8 mb-2 ${seconds <= 10 ? 'text-red-500' : seconds <= 30 ? 'text-orange-500' : 'text-gray-400'}`} />
              <div className={`text-6xl font-bold ${seconds <= 10 ? 'text-red-600 animate-pulse' : 'text-gray-900'}`}>
                {formatTime(seconds)}
              </div>
              <p className={`text-sm font-medium mt-2 ${seconds <= 10 ? 'text-red-600' : 'text-gray-600'}`}>
                {getTimeRemaining()}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Adjust Buttons */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <button
            onClick={() => adjustTime(-30)}
            disabled={seconds <= 30}
            className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-semibold hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <Minus className="w-4 h-4" />
            30s
          </button>

          <button
            onClick={() => adjustTime(-15)}
            disabled={seconds <= 15}
            className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg font-semibold hover:bg-orange-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <Minus className="w-4 h-4" />
            15s
          </button>

          <button
            onClick={togglePause}
            className="bg-gray-200 text-gray-700 p-3 rounded-lg hover:bg-gray-300 transition-colors"
          >
            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>

          <button
            onClick={() => adjustTime(15)}
            className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-semibold hover:bg-blue-200 transition-colors flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            15s
          </button>

          <button
            onClick={() => adjustTime(30)}
            className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-semibold hover:bg-green-200 transition-colors flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            30s
          </button>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {seconds === 0 ? (
            <button
              onClick={onComplete}
              className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-600 transition-all shadow-lg"
            >
              Next Set 💪
            </button>
          ) : (
            <button
              onClick={onSkip}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <SkipForward className="w-5 h-5" />
              Skip Rest
            </button>
          )}

          {seconds > 0 && (
            <button
              onClick={onComplete}
              className="w-full bg-gray-100 text-gray-600 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              I'm Ready Now
            </button>
          )}
        </div>

        {/* Rest Tips */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            During Rest:
          </h4>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>• Breathe deeply to recover</li>
            <li>• Shake out muscles</li>
            <li>• Stay hydrated</li>
            <li>• Visualize next set</li>
          </ul>
        </div>
      </div>
    </div>
  );
}