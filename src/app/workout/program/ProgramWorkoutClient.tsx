'use client';

import { useState, useMemo } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths, 
  isToday,
  isBefore,        // ✅ NEW
  startOfToday,    // ✅ NEW
  parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight, CheckCircle2, Dumbbell, X, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';

interface Props {
  program: any;
  logs: any[];
}

export default function ProgramWorkoutClient({ program, logs }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // 1. Calculate Program Start
  const programStartDate = useMemo(() => {
    const created = new Date(program.created_at);
    return startOfWeek(created, { weekStartsOn: 1 });
  }, [program]);

  // 2. Generate Calendar Grid
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  // 3. Helpers
  const getPlannedWorkout = (date: Date) => {
    const diffTime = date.getTime() - programStartDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return null;

    const weekIndex = Math.floor(diffDays / 7);
    const dayIndex = diffDays % 7;
    
    if (weekIndex >= (program.program_data.duration_weeks || 12)) return null;

    const weekData = program.program_data.weeks.find((w: any) => w.week_number === weekIndex + 1);
    if (!weekData) return null;

    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const targetDayName = dayNames[dayIndex];

    return weekData.workouts.find((w: any) => w.day === targetDayName);
  };

  const getLogForDate = (date: Date) => {
    return logs.find(log => isSameDay(parseISO(log.date), date));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8 pb-24">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
               <CalendarIcon className="w-6 h-6 text-purple-600" />
               {program.program_name}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm mt-1">
              Phase {getPhase(currentMonth, programStartDate)} • 12-Week Protocol
            </p>
          </div>
          
          <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-1 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm w-full md:w-auto">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <span className="text-sm font-bold text-gray-900 dark:text-white min-w-[120px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          
          {/* Days Header */}
          <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="py-3 text-center text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                <span className="md:hidden">{day.charAt(0)}</span>
                <span className="hidden md:block">{day}</span>
              </div>
            ))}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-7 auto-rows-fr bg-gray-100/50 dark:bg-gray-800/50 gap-px border-b border-gray-200 dark:border-gray-800">
            {calendarDays.map((day) => {
              const planned = getPlannedWorkout(day);
              const logged = getLogForDate(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isTodayDate = isToday(day);
              
              // ✅ Logic: Missed = Planned exists + No Log + Date is in the past (before today)
              const isMissed = planned && !logged && isBefore(day, startOfToday());

              return (
                <div 
                  key={day.toISOString()} 
                  onClick={() => (planned || logged) && setSelectedDate(day)}
                  className={`
                    min-h-[85px] md:min-h-[140px] p-1 md:p-3 relative transition-all group
                    ${!isCurrentMonth ? 'bg-gray-50/30 dark:bg-gray-900/30' : 'bg-white dark:bg-gray-900'}
                    ${(planned || logged) ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''}
                    ${isMissed ? 'bg-red-50/30 dark:bg-red-900/10' : ''} 
                  `}
                >
                  {/* Date Number */}
                  <div className="flex justify-center md:justify-start mb-1 md:mb-2">
                    <span className={`
                      text-[10px] md:text-sm font-bold w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full
                      ${isTodayDate 
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' 
                        : isCurrentMonth ? 'text-gray-700 dark:text-gray-300' : 'text-gray-300 dark:text-gray-700'}
                    `}>
                      {format(day, 'd')}
                    </span>
                  </div>

                  {/* Mobile Indicators (Dots) */}
                  <div className="flex flex-col gap-1 items-center md:hidden mt-1">
                    {logged ? (
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.5)]" />
                    ) : isMissed ? (
                      // 🔴 Red dot for missed
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    ) : planned ? (
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    ) : null}
                  </div>

                  {/* Desktop Cards (Full Info) */}
                  <div className="hidden md:flex flex-col gap-1.5">
                    {logged ? (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900 rounded-lg p-2 animate-in fade-in">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                          <span className="text-xs font-bold text-green-800 dark:text-green-300 line-clamp-1">{logged.workout_name}</span>
                        </div>
                        <div className="text-[10px] text-green-600 dark:text-green-400 font-medium pl-5 opacity-80">
                          {Math.round(logged.duration_seconds / 60)} mins
                        </div>
                      </div>
                    ) : isMissed ? (
                      // 🔴 Red Card for Missed
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 rounded-lg p-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                          <span className="text-xs font-bold text-red-800 dark:text-red-300 line-clamp-1">Missed</span>
                        </div>
                        <div className="text-[10px] text-red-600 dark:text-red-400 font-medium pl-5 opacity-80 line-through">
                          {planned.workout_name}
                        </div>
                      </div>
                    ) : planned ? (
                      <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900 rounded-lg p-2 group-hover:border-purple-200 dark:group-hover:border-purple-800 transition-colors">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Dumbbell className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
                          <span className="text-xs font-bold text-purple-700 dark:text-purple-300 line-clamp-1">{planned.workout_name}</span>
                        </div>
                        <div className="text-[10px] text-purple-500 dark:text-purple-400 font-medium pl-5 opacity-80">
                          {planned.exercises.length} exercises
                        </div>
                      </div>
                    ) : null}
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Workout Preview Modal */}
        {selectedDate && (
          <WorkoutPreviewModal 
            date={selectedDate}
            planned={getPlannedWorkout(selectedDate)}
            logged={getLogForDate(selectedDate)}
            onClose={() => setSelectedDate(null)}
          />
        )}

      </div>
    </div>
  );
}

// Sub-component: Preview Modal (Enhanced for Mobile)
function WorkoutPreviewModal({ date, planned, logged, onClose }: { date: Date, planned: any, logged: any, onClose: () => void }) {
  const workout = logged || planned;
  if (!workout) return null;

  const isCompleted = !!logged;
  const isMissed = !isCompleted && isBefore(date, startOfToday());

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 md:zoom-in-95 flex flex-col max-h-[85vh]">
        
        {/* Header - Dynamic Color */}
        <div className={`${isCompleted ? 'bg-green-600' : isMissed ? 'bg-red-600' : 'bg-purple-600'} p-6 text-white flex-shrink-0`}>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                 <p className="text-white/90 text-xs font-bold uppercase tracking-wider">{format(date, 'EEEE, MMMM do')}</p>
                 {isCompleted && <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-bold">COMPLETED</span>}
                 {isMissed && <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-bold">MISSED</span>}
              </div>
              <h3 className="text-2xl font-black leading-tight">{isCompleted ? workout.workout_name : planned.workout_name}</h3>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors -mr-2 -mt-2">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto bg-gray-50 dark:bg-gray-950">
          {isCompleted ? (
             <div className="text-center py-4 space-y-2">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                   <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">Great Job!</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">You completed this workout in {Math.round(logged.duration_seconds / 60)} minutes.</p>
             </div>
          ) : (
            <>
               <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Planned Exercises</h4>
               <div className="space-y-3">
                {planned.exercises.map((ex: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
                    <span className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-bold text-gray-500 dark:text-gray-400">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">{ex.exercise_name}</h4>
                      <div className="flex gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
                         <span>{ex.sets} Sets</span>
                         <span>•</span>
                         <span>{ex.reps} Reps</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer Action */}
        {!isCompleted && (
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0 safe-area-pb">
            <a href="/workout/check-in" className="flex items-center justify-center w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-4 rounded-xl hover:opacity-90 transition-opacity">
                {isMissed ? 'Do Workout Now' : 'Start Workout'}
            </a>
            </div>
        )}
      </div>
    </div>
  );
}

function getPhase(current: Date, start: Date) {
  const diffTime = current.getTime() - start.getTime();
  const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
  
  if (diffWeeks < 4) return "1 (Foundation)";
  if (diffWeeks < 8) return "2 (Development)";
  return "3 (Peaking)";
}