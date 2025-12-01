import type { Metadata, Viewport } from "next";
import WorkoutSessionManager from "@/components/workout/WorkoutSessionManager";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// ✅ FIX: Separate Viewport Export (Next.js 14+ Standard)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents zooming on inputs for "App-like" feel
  themeColor: "#0a0a0a",
};

export const metadata: Metadata = {
  title: "Active Workout | Fitness Tracker Pro",
  description: "Track your current workout session",
};

export default async function ActiveWorkoutPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch Profile & Active Program
  const { data: profile } = await supabase
    .from('user_fitness_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const { data: program } = await supabase
    .from('ai_program_versions')
    .select('*')
    .eq('user_id', user.id)
    .eq('active', true)
    .single();

  if (!program) {
    redirect("/dashboard");
  }

  return (
    <WorkoutSessionManager 
      userProfile={profile} 
      programData={program.program_data} 
    />
  );
}