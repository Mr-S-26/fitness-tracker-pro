'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { analyzeWeeklyProgress, generateNextWeekProgram } from '@/lib/ai/weekly-analyzer';

export async function submitWeeklyCheckIn(
  stats: any,
  feedback: any
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  // 1. Calculate Dates
  // We strip time to ensure the date string matches the DB Date type consistently
  const now = new Date();
  const startDate = new Date();
  startDate.setDate(now.getDate() - 7);
  
  const weekStartStr = startDate.toISOString().split('T')[0]; // YYYY-MM-DD
  const weekEndStr = now.toISOString().split('T')[0];     // YYYY-MM-DD

  // 2. Save the Check-in Record (Upsert)
  // Changed from .insert() to .upsert() to handle duplicates gracefully
  const { error: checkInError } = await supabase
    .from('weekly_checkins')
    .upsert({
      user_id: user.id,
      week_start_date: weekStartStr,
      week_end_date: weekEndStr,
      workouts_completed: stats.workoutsCompleted,
      total_volume: stats.totalVolume,
      overall_feeling: feedback.difficulty,
      recovery_quality: feedback.recovery,
      ai_feedback: 'Analyzed and Program Updated', 
    }, {
      onConflict: 'user_id, week_start_date'
    });

  if (checkInError) {
    console.error('Check-in Error:', checkInError);
    throw new Error(`Failed to save check-in: ${checkInError.message}`);
  }

  // 3. Run Analysis Logic
  const analysis = analyzeWeeklyProgress({
    adherence: stats.adherence,
    totalVolume: stats.totalVolume,
    difficulty: feedback.difficulty,
    recovery: feedback.recovery,
    stress: feedback.stress
  });

  // 4. Fetch Current Program to Mutate
  const { data: currentProgramRow } = await supabase
    .from('ai_program_versions')
    .select('*')
    .eq('user_id', user.id)
    .eq('active', true)
    .single();

  // Only generate a new program if we found an active one
  if (currentProgramRow) {
    // 5. Generate New Program Version
    const nextProgram = generateNextWeekProgram(currentProgramRow.program_data, analysis.action);

    // 6. Archive Old Program
    await supabase
      .from('ai_program_versions')
      .update({ active: false })
      .eq('id', currentProgramRow.id);

    // 7. Save New Program
    await supabase
      .from('ai_program_versions')
      .insert({
        user_id: user.id,
        version_number: (currentProgramRow.version_number || 1) + 1,
        program_data: nextProgram,
        reason_for_change: analysis.reason,
        change_type: analysis.action.toLowerCase(),
        active: true
      });
  }

  console.log("✅ Program Updated:", analysis.action);
  redirect('/dashboard');
}