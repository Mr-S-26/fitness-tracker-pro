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
  addDays,
  parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, CheckCircle2, Dumbbell, X } from 'lucide-react';

interface Props {
  program: any;
  logs: any[];
}

export default function ProgramWorkoutClient({ program, logs }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // 1. Calculate Program Start Date (Monday of the creation week)
  const programStartDate = useMemo(() => {
    const created = new Date(program.created_at);
    return startOfWeek(created, { weekStartsOn: 1 }); // Monday start
  }, [program]);

  // 2. Generate Calendar Grid
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  // 3. Helper: Find "Planned Workout" for a specific date
  const getPlannedWorkout = (date: Date) => {
    // Calculate days since program start
    const diffTime = date.getTime() - programStartDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return null; // Before program started

    const weekIndex = Math.floor(diffDays / 7);
    const dayIndex = diffDays % 7; // 0 = Mon, 6 = Sun
    
    // Program is 12 weeks max
    if (weekIndex >= (program.program_data.duration_weeks || 12)) return null;

    // Find matching week and day
    const weekData = program.program_data.weeks.find((w: any) => w.week_number === weekIndex + 1);
    if (!weekData) return null;

    // Map 0-6 index to day name
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const targetDayName = dayNames[dayIndex];

    return weekData.workouts.find((w: any) => w.day === targetDayName);
  };

  // 4. Helper: Find "Actual Log" for a specific date
  const getLogForDate = (date: Date) => {
    return logs.find(log => isSameDay(parseISO(log.date), date));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{program.program_name}</h1>
            <p className="text-gray-500 text-sm">12-Week Progression • Phase {getPhase(currentMonth, programStartDate)}</p>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <span className="text-sm font-bold text-gray-900 min-w-[100px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Days Header */}
          <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-7 auto-rows-fr">
            {calendarDays.map((day, i) => {
              const planned = getPlannedWorkout(day);
              const logged = getLogForDate(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isTodayDate = isToday(day);

              return (
                <div 
                  key={day.toISOString()} 
                  onClick={() => planned && setSelectedDate(day)}
                  className={`
                    min-h-[120px] p-3 border-b border-r border-gray-100 relative transition-colors group
                    ${!isCurrentMonth ? 'bg-gray-50/30' : 'bg-white'}
                    ${planned ? 'cursor-pointer hover:bg-purple-50/30' : ''}
                  `}
                >
                  {/* Date Number */}
                  <span className={`
                    text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-2
                    ${isTodayDate ? 'bg-gray-900 text-white' : isCurrentMonth ? 'text-gray-700' : 'text-gray-300'}
                  `}>
                    {format(day, 'd')}
                  </span>

                  {/* Workout Indicators */}
                  {logged ? (
                    <div className="bg-green-100 border border-green-200 rounded-lg p-2 mb-1 animate-in fade-in">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-xs font-bold text-green-800 line-clamp-1">{logged.workout_name}</span>
                      </div>
                      <div className="text-[10px] text-green-600 font-medium pl-5">
                        {Math.round(logged.duration_seconds / 60)} mins
                      </div>
                    </div>
                  ) : planned ? (
                    <div className="bg-purple-50 border border-purple-100 rounded-lg p-2 group-hover:border-purple-200 transition-colors">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Dumbbell className="w-3.5 h-3.5 text-purple-500" />
                        <span className="text-xs font-bold text-purple-700 line-clamp-1">{planned.workout_name}</span>
                      </div>
                      <div className="text-[10px] text-purple-500 font-medium pl-5">
                        {planned.exercises.length} exercises
                      </div>
                    </div>
                  ) : null}

                </div>
              );
            })}
          </div>
        </div>

        {/* Workout Preview Modal */}
        {selectedDate && (
          <WorkoutPreviewModal 
            date={selectedDate}
            workout={getPlannedWorkout(selectedDate)}
            onClose={() => setSelectedDate(null)}
          />
        )}

      </div>
    </div>
  );
}

// Sub-component: Preview Modal
function WorkoutPreviewModal({ date, workout, onClose }: { date: Date, workout: any, onClose: () => void }) {
  if (!workout) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95">
        
        <div className="bg-purple-600 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-100 text-sm font-medium mb-1">{format(date, 'EEEE, MMMM do')}</p>
              <h3 className="text-2xl font-bold">{workout.workout_name}</h3>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-purple-500 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4">
            {workout.exercises.map((ex: any, i: number) => (
              <div key={i} className="flex items-start gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="w-6 h-6 flex items-center justify-center bg-white rounded-full text-xs font-bold text-gray-400 border border-gray-200 shadow-sm">
                  {i + 1}
                </span>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{ex.exercise_name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {ex.sets} sets × {ex.reps} reps • {ex.rest_seconds}s rest
                  </p>
                  {ex.notes && (
                    <p className="text-xs text-purple-600 mt-1 italic">
                      "{ex.notes}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
           <button onClick={onClose} className="text-gray-600 font-medium text-sm hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors">
             Close
           </button>
        </div>
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