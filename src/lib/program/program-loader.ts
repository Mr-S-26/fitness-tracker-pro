// src/lib/program/program-loader.ts
/**
 * Program Loader - Bridges AI-generated programs with workout execution
 * Handles fetching active programs, tracking progress, and determining current workout
 */

import { createClient } from '@/lib/supabase/client';

// =====================================================
// TYPE DEFINITIONS
// =====================================================

interface WorkoutDay {
  day: string;
  workout_name: string;
  exercises: Array<{
    exercise_name: string;
    sets: number;
    reps: string;
    rest_seconds: number;
    notes?: string;
    rpe_target?: number;
  }>;
}

interface WorkoutWeek {
  week_number: number;
  focus: string;
  workouts: WorkoutDay[];
}

interface WorkoutProgram {
  program_name: string;
  program_overview: string;
  duration_weeks: number;
  weeks: WorkoutWeek[];
  progression_notes?: string;
  deload_strategy?: string;
}

interface ActiveProgram {
  id: string;
  user_id: string;
  version_number: number;
  program_name: string;
  program_overview: string;
  duration_weeks: number;
  program_data: {
    weeks: WorkoutWeek[];
    progression_notes?: string;
    deload_strategy?: string;
  };
  created_at: string;
}

interface ProgramProgress {
  id?: string;
  user_id: string;
  program_id: string;
  current_week: number;
  current_day: number;
  workouts_completed_this_week: number;
  last_workout_date?: string;
  started_at: string;
}

interface TodaysWorkout {
  workout: WorkoutDay;
  week_number: number;
  week_focus: string;
  program_name: string;
  is_deload_week: boolean;
}

// =====================================================
// PROGRAM LOADER CLASS
// =====================================================

export class ProgramLoader {
  private supabase = createClient();
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Get the user's active training program
   */
  async getActiveProgram(): Promise<ActiveProgram | null> {
    try {
      const { data, error } = await this.supabase
        .from('ai_program_versions')
        .select('*')
        .eq('user_id', this.userId)
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(); // Use maybeSingle() to avoid 406 if no results

      if (error) {
        console.error('❌ Error fetching active program:', error);
        return null;
      }

      if (!data) {
        console.log('ℹ️ No active program found');
        return null;
      }

      console.log('✅ Active program found:', data.program_name);
      return data;
    } catch (error) {
      console.error('Error in getActiveProgram:', error);
      return null;
    }
  }

  /**
   * Get or create program progress tracking
   */
  async getProgramProgress(programId: string): Promise<ProgramProgress | null> {
    try {
      // Try to fetch existing progress (don't use .single() to avoid 406 if not found)
      const { data: existingProgress, error: fetchError } = await this.supabase
        .from('program_progress')
        .select('*')
        .eq('user_id', this.userId)
        .eq('program_id', programId)
        .maybeSingle(); // Use maybeSingle() instead of single()

      if (fetchError) {
        console.error('Error fetching program progress:', fetchError);
        return null;
      }

      // If progress exists, return it
      if (existingProgress) {
        console.log('📊 Existing progress found:', existingProgress);
        return existingProgress;
      }

      // If no progress exists, create it
      console.log('🆕 No progress found, creating new record...');
      const newProgress: Omit<ProgramProgress, 'id'> = {
        user_id: this.userId,
        program_id: programId,
        current_week: 1,
        current_day: 0, // 0-indexed
        workouts_completed_this_week: 0,
        started_at: new Date().toISOString(),
      };

      const { data: createdProgress, error: createError } = await this.supabase
        .from('program_progress')
        .insert(newProgress)
        .select()
        .maybeSingle(); // Use maybeSingle() here too

      if (createError) {
        console.error('❌ Error creating program progress:', createError);
        
        // If it's a unique constraint violation, try fetching again
        if (createError.code === '23505') {
          console.log('⚠️ Record already exists, fetching it...');
          const { data: retryData, error: retryError } = await this.supabase
            .from('program_progress')
            .select('*')
            .eq('user_id', this.userId)
            .eq('program_id', programId)
            .maybeSingle();
          
          if (retryError) {
            console.error('❌ Retry fetch failed:', retryError);
            return null;
          }
          
          return retryData;
        }
        
        return null;
      }

      console.log('✅ Progress created:', createdProgress);
      return createdProgress;
    } catch (error) {
      console.error('Error in getProgramProgress:', error);
      return null;
    }
  }

  /**
   * Get today's workout based on program progress
   */
  async getTodaysWorkout(): Promise<TodaysWorkout | null> {
    try {
      // 1. Get active program
      const program = await this.getActiveProgram();
      if (!program) {
        console.log('No active program found');
        return null;
      }

      // 2. Get progress
      const progress = await this.getProgramProgress(program.id);
      if (!progress) {
        console.log('Could not load program progress');
        return null;
      }

      // 3. Get current week data
      const currentWeek = program.program_data.weeks.find(
        (week) => week.week_number === progress.current_week
      );

      if (!currentWeek) {
        console.log('Current week not found in program');
        return null;
      }

      // 4. Get current workout (current_day is 0-indexed)
      const workout = currentWeek.workouts[progress.current_day];
      if (!workout) {
        console.log('Workout not found for current day');
        return null;
      }

      // 5. Check if this is a deload week (typically week 9 or every 4th week)
      const isDeloadWeek = currentWeek.focus.toLowerCase().includes('deload') ||
                           currentWeek.focus.toLowerCase().includes('recovery');

      return {
        workout,
        week_number: currentWeek.week_number,
        week_focus: currentWeek.focus,
        program_name: program.program_name,
        is_deload_week: isDeloadWeek,
      };
    } catch (error) {
      console.error('Error in getTodaysWorkout:', error);
      return null;
    }
  }

  /**
   * Mark a workout as completed and advance progress
   */
  async completeWorkout(programId: string): Promise<boolean> {
    try {
      const progress = await this.getProgramProgress(programId);
      if (!progress) return false;

      const program = await this.getActiveProgram();
      if (!program) return false;

      const currentWeek = program.program_data.weeks.find(
        (w) => w.week_number === progress.current_week
      );
      if (!currentWeek) return false;

      // Update progress
      const workoutsCompletedThisWeek = progress.workouts_completed_this_week + 1;
      const totalWorkoutsInWeek = currentWeek.workouts.length;

      let newWeek = progress.current_week;
      let newDay = progress.current_day + 1;
      let newWorkoutsCompleted = workoutsCompletedThisWeek;

      // Check if we've completed all workouts for this week
      if (newDay >= totalWorkoutsInWeek) {
        // Move to next week
        newWeek = progress.current_week + 1;
        newDay = 0;
        newWorkoutsCompleted = 0;

        // Check if program is complete
        if (newWeek > program.duration_weeks) {
          console.log('🎉 Program completed!');
          // TODO: Handle program completion (show celebration, generate new program, etc.)
          return true;
        }
      }

      // Update database
      const { error } = await this.supabase
        .from('program_progress')
        .update({
          current_week: newWeek,
          current_day: newDay,
          workouts_completed_this_week: newWorkoutsCompleted,
          last_workout_date: new Date().toISOString(),
        })
        .eq('id', progress.id!);

      if (error) {
        console.error('Error updating progress:', error);
        return false;
      }

      console.log('✅ Progress updated:', { newWeek, newDay, newWorkoutsCompleted });
      return true;
    } catch (error) {
      console.error('Error in completeWorkout:', error);
      return false;
    }
  }

  /**
   * Get program overview stats
   */
  async getProgramStats(): Promise<{
    totalWeeks: number;
    currentWeek: number;
    workoutsCompleted: number;
    totalWorkouts: number;
    progressPercentage: number;
  } | null> {
    try {
      const program = await this.getActiveProgram();
      if (!program) return null;

      const progress = await this.getProgramProgress(program.id);
      if (!progress) return null;

      // Calculate total workouts in program
      const totalWorkouts = program.program_data.weeks.reduce(
        (sum, week) => sum + week.workouts.length,
        0
      );

      // Calculate workouts completed so far
      let workoutsCompleted = 0;
      for (let i = 1; i < progress.current_week; i++) {
        const week = program.program_data.weeks.find((w) => w.week_number === i);
        if (week) {
          workoutsCompleted += week.workouts.length;
        }
      }
      workoutsCompleted += progress.current_day;

      const progressPercentage = Math.round(
        (workoutsCompleted / totalWorkouts) * 100
      );

      return {
        totalWeeks: program.duration_weeks,
        currentWeek: progress.current_week,
        workoutsCompleted,
        totalWorkouts,
        progressPercentage,
      };
    } catch (error) {
      console.error('Error in getProgramStats:', error);
      return null;
    }
  }

  /**
   * Get the full week's workout schedule
   */
  async getWeekSchedule(): Promise<{
    week_number: number;
    week_focus: string;
    workouts: WorkoutDay[];
    current_day: number;
  } | null> {
    try {
      const program = await this.getActiveProgram();
      if (!program) return null;

      const progress = await this.getProgramProgress(program.id);
      if (!progress) return null;

      const currentWeek = program.program_data.weeks.find(
        (week) => week.week_number === progress.current_week
      );

      if (!currentWeek) return null;

      return {
        week_number: currentWeek.week_number,
        week_focus: currentWeek.focus,
        workouts: currentWeek.workouts,
        current_day: progress.current_day,
      };
    } catch (error) {
      console.error('Error in getWeekSchedule:', error);
      return null;
    }
  }

  /**
   * Reset progress (for testing or starting over)
   */
  async resetProgress(programId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('program_progress')
        .update({
          current_week: 1,
          current_day: 0,
          workouts_completed_this_week: 0,
          last_workout_date: null,
        })
        .eq('user_id', this.userId)
        .eq('program_id', programId);

      if (error) {
        console.error('Error resetting progress:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in resetProgress:', error);
      return false;
    }
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Find exercises in the database that match program exercise names
 */
export async function matchProgramExercises(
  programExercises: Array<{ exercise_name: string }>,
  userId: string
): Promise<Map<string, any>> {
  const supabase = createClient();
  const exerciseMap = new Map();

  try {
    // Get all exercises user has access to (public + custom)
    const { data: allExercises } = await supabase
      .from('exercises')
      .select('*')
      .or(`is_public.eq.true,user_id.eq.${userId}`);

    if (!allExercises) return exerciseMap;

    // Match by name (fuzzy matching)
    for (const programEx of programExercises) {
      const match = allExercises.find((ex) => {
        const programName = programEx.exercise_name.toLowerCase().trim();
        const exerciseName = ex.name.toLowerCase().trim();
        
        // Exact match
        if (programName === exerciseName) return true;
        
        // Contains match (e.g., "Barbell Bench Press" matches "Bench Press")
        if (programName.includes(exerciseName) || exerciseName.includes(programName)) {
          return true;
        }
        
        return false;
      });

      if (match) {
        exerciseMap.set(programEx.exercise_name, match);
      }
    }

    return exerciseMap;
  } catch (error) {
    console.error('Error matching exercises:', error);
    return exerciseMap;
  }
}

/**
 * Create a singleton instance
 */
let loaderInstance: ProgramLoader | null = null;

export function getProgramLoader(userId: string): ProgramLoader {
  if (!loaderInstance || loaderInstance['userId'] !== userId) {
    loaderInstance = new ProgramLoader(userId);
  }
  return loaderInstance;
}