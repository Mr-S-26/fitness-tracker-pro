'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, SkipForward, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  initialSeconds: number;
  coachMessage?: string | null;
  onComplete: () => void;
  onClose: () => void;
}

export default function EnhancedRestTimer({ initialSeconds, coachMessage, onComplete, onClose }: Props) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // 🎵 Play Sound Function (Synthetic Beep)
  const playBeep = (frequency: number = 800, duration: number = 0.1) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      
      // Force resume context (fixes "no sound" on Chrome/iOS)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.value = frequency;
      // ✅ CHANGED: 'triangle' is much sharper and easier to hear on phones than 'sine'
      osc.type = 'triangle'; 
      
      // ✅ CHANGED: Set Volume to 4.0 (400% Gain)
      gain.gain.setValueAtTime(4.0, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.error("Audio play failed", e);
    }
  };

  useEffect(() => {
    // Play a "start" beep when timer opens
    playBeep(600, 0.1);
  }, []);

  useEffect(() => {
    // 🚨 Completion Logic
    if (timeLeft <= 0) {
      playBeep(1200, 0.5); // High pitch finished beep
      
      const timeout = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(timeout);
    }

    if (isPaused) return;

    // 🔊 Countdown Sound (3, 2, 1)
    if (timeLeft <= 3 && timeLeft > 0) {
      playBeep(600, 0.1); 
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isPaused, onComplete]);

  const progress = ((initialSeconds - timeLeft) / initialSeconds) * 100;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-6 relative text-center border border-gray-200 dark:border-gray-800">
        
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>

        {/* 🧠 Coach Message Overlay */}
        {coachMessage && (
          <motion.div 
            initial={{ y: -20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }}
            className="mb-6 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-2xl border border-purple-100 dark:border-purple-800"
          >
            <div className="flex items-center gap-2 justify-center text-purple-600 dark:text-purple-400 font-bold text-xs uppercase tracking-wider mb-1">
              <Brain className="w-4 h-4" /> Coach Says
            </div>
            <p className="text-gray-900 dark:text-white font-medium text-sm leading-relaxed">
              "{coachMessage}"
            </p>
          </motion.div>
        )}

        {/* Timer Circle */}
        <div className="relative w-48 h-48 mx-auto mb-8">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="96" cy="96" r="88" fill="none" stroke="currentColor" strokeWidth="12" className="text-gray-100 dark:text-gray-800" />
            <circle cx="96" cy="96" r="88" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeDasharray={2 * Math.PI * 88} strokeDashoffset={2 * Math.PI * 88 * (progress / 100)} className="text-purple-600 transition-all duration-1000 ease-linear" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl font-black tabular-nums tracking-tighter text-gray-900 dark:text-white">{timeLeft}</span>
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Seconds</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => setTimeLeft(prev => prev + 10)} className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-white font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">+10</button>
          <button onClick={() => setIsPaused(!isPaused)} className="w-16 h-16 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 flex items-center justify-center hover:scale-105 transition-transform shadow-lg">{isPaused ? <Play className="w-8 h-8 ml-1" /> : <Pause className="w-8 h-8" />}</button>
          <button onClick={onComplete} className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"><SkipForward className="w-5 h-5" /></button>
        </div>

      </div>
    </div>
  );
}