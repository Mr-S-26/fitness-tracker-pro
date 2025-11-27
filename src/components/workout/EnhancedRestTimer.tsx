'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Minus, Plus, Maximize2, Minimize2, Bell } from 'lucide-react';

interface Props {
  initialSeconds: number;
  onComplete: () => void;
  onClose: () => void;
}

export default function EnhancedRestTimer({ initialSeconds, onComplete, onClose }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Audio ref for beep sound (optional)
  // const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isPaused) return;

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          onComplete(); // Trigger parent callback
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, onComplete]);

  // Format time as MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const adjustTime = (amount: number) => {
    setSecondsLeft((prev) => Math.max(0, prev + amount));
  };

  // Minimized Floating View (Picture-in-Picture style)
  if (isMinimized) {
    return (
      <div className="fixed bottom-24 right-4 z-50 animate-slide-up">
        <div className="bg-gray-900 text-white p-3 rounded-full shadow-xl flex items-center gap-3 cursor-pointer border border-gray-700"
             onClick={() => setIsMinimized(false)}>
          <div className="relative w-10 h-10 flex items-center justify-center">
             {/* Progress Ring (SVG) */}
             <svg className="absolute inset-0 w-full h-full -rotate-90">
               <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-gray-700" />
               <circle cx="20" cy="20" r="18" stroke="#a855f7" strokeWidth="3" fill="transparent" 
                 strokeDasharray={113} 
                 strokeDashoffset={113 - (113 * (secondsLeft / initialSeconds))} 
                 className="transition-all duration-1000" 
               />
             </svg>
             <span className="text-xs font-bold">{secondsLeft}</span>
          </div>
          <div className="pr-2">
            <p className="text-xs font-medium text-gray-300">Resting...</p>
            <p className="text-sm font-bold font-mono">{formatTime(secondsLeft)}</p>
          </div>
        </div>
      </div>
    );
  }

  // Full Expanded Modal View
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col justify-end pointer-events-none">
      {/* Backdrop/Click-away area could go here if needed */}
      
      <div className="bg-white border-t border-gray-200 shadow-2xl p-6 rounded-t-3xl pointer-events-auto animate-slide-up">
        {/* Header controls */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <X className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Rest Timer</span>
          <button onClick={() => setIsMinimized(true)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <Minimize2 className="w-5 h-5" />
          </button>
        </div>

        {/* Main Timer Display */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="text-7xl font-black text-gray-900 font-mono tabular-nums tracking-tight">
            {formatTime(secondsLeft)}
          </div>
          <p className="text-gray-400 mt-2 font-medium">Next set coming up</p>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <button 
            onClick={() => adjustTime(-10)}
            className="flex items-center justify-center py-4 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors"
          >
            <Minus className="w-5 h-5 mr-1" /> 10s
          </button>
          
          <button 
            onClick={() => setIsPaused(!isPaused)}
            className={`flex items-center justify-center py-4 rounded-xl font-bold text-white transition-colors ${isPaused ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-900 hover:bg-gray-800'}`}
          >
            {isPaused ? 'RESUME' : 'PAUSE'}
          </button>

          <button 
            onClick={() => adjustTime(30)}
            className="flex items-center justify-center py-4 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors"
          >
            <Plus className="w-5 h-5 mr-1" /> 30s
          </button>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-3 text-purple-600 font-semibold hover:bg-purple-50 rounded-xl transition-colors"
        >
          Skip Rest & Start Set
        </button>
      </div>
    </div>
  );
}