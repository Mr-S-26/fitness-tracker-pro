interface CheckInStats {
  adherence: number; // 0-100
  totalVolume: number;
  difficulty: number; // 1-10
  recovery: number; // 1-10
  stress: number; // 1-5
}

export type ProgramAction = 'PROGRESS' | 'MAINTAIN' | 'DELOAD' | 'REBUILD';

interface AnalysisResult {
  action: ProgramAction;
  feedback: string;
  reason: string;
}

export function analyzeWeeklyProgress(stats: CheckInStats): AnalysisResult {
  // 1. Detect "Life Happens" (Low Adherence)
  if (stats.adherence < 60) {
    return {
      action: 'MAINTAIN',
      feedback: "It looks like a busy week! Let's repeat this week's schedule to build consistency before adding more load.",
      reason: 'Adherence < 60%'
    };
  }

  // 2. Detect Burnout/Overreaching (High Stress + Poor Recovery)
  if (stats.stress >= 4 && stats.recovery <= 4) {
    return {
      action: 'DELOAD',
      feedback: "Your stress is high and recovery is low. I've scheduled a deload week to help your nervous system recover.",
      reason: 'High Stress + Low Recovery'
    };
  }

  // 3. Detect "Too Easy" (High Adherence + Low Difficulty + Good Recovery)
  if (stats.adherence >= 90 && stats.difficulty <= 6 && stats.recovery >= 7) {
    return {
      action: 'PROGRESS',
      feedback: "You're crushing it! I've increased the intensity for next week to keep the gains coming.",
      reason: 'High Performance'
    };
  }

  // 4. Default: Steady Progress
  return {
    action: 'PROGRESS', // Default to small progression
    feedback: "Solid week. Let's keep the momentum going with some small progressive overload.",
    reason: 'Steady Consistency'
  };
}

/**
 * Mutates the current program based on the decision
 */
export function generateNextWeekProgram(currentProgram: any, action: ProgramAction) {
  const newProgram = JSON.parse(JSON.stringify(currentProgram)); // Deep copy
  
  // Increment Version
  newProgram.version_number = (newProgram.version_number || 1) + 1;

  // Apply Logic
  newProgram.weeks.forEach((week: any) => {
    week.workouts.forEach((workout: any) => {
      workout.exercises.forEach((ex: any) => {
        
        if (action === 'PROGRESS') {
          // Increase weight or reps
          if (typeof ex.reps === 'string' && ex.reps.includes('-')) {
            // Keep rep range, maybe prompt for weight increase in notes
            ex.notes = "Aim for top of rep range or +2.5kg";
          }
        } 
        
        else if (action === 'DELOAD') {
          // Reduce volume by 40-50%
          ex.sets = Math.max(1, Math.ceil(ex.sets * 0.6));
          ex.notes = "Deload: Focus on perfect technique, easy RPE";
        }

        // MAINTAIN just keeps it as is
      });
    });
  });

  return newProgram;
}