import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { swapExerciseInProgram } from '@/lib/ai/program-modifier'; // ✅ Tool Import

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  if (!process.env.GROQ_API_KEY) {
    console.error("❌ CRITICAL: GROQ_API_KEY is missing");
    return NextResponse.json({ role: 'assistant', content: "System Error: Brain missing." });
  }

  const { message, history } = await req.json();

  // 1. Fetch User Profile & Injuries (Your existing logic)
  const { data: profile } = await supabase
    .from('user_fitness_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const { data: injuries } = await supabase
    .from('user_injuries')
    .select('body_part, description')
    .eq('user_id', user.id)
    .eq('active', true);

  // 2. ✅ NEW: Fetch Deep Logs (Last 50 sets) for better context
  const { data: rawLogs } = await supabase
    .from('workout_logs')
    .select('workout_name, exercise_name, weight_kg, reps, rpe, date')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  const workoutSummary = groupLogsBySession(rawLogs || []);

  // 3. ✅ NEW: Fetch & Filter Valid Exercises (Smart Library)
  // Only shows exercises that match the user's equipment to prevent hallucinations
  const userEquipment = profile?.available_equipment || [];
  const has = (keyword: string) => userEquipment.some((e: string) => e.toLowerCase().includes(keyword));

  const allowedTypes = ['bodyweight']; 
  if (has('dumbbell')) allowedTypes.push('dumbbell');
  if (has('barbell')) allowedTypes.push('barbell');
  if (has('cable') || has('band')) allowedTypes.push('cable');
  if (has('gym') || has('commercial')) {
      allowedTypes.push('machine', 'cable', 'barbell', 'dumbbell');
  }

  const { data: exerciseList } = await supabase
    .from('exercises')
    .select('name')
    .in('equipment', allowedTypes)
    .order('name');
  
  const validExerciseNames = exerciseList?.map(e => e.name).join(', ');

  // 4. System Prompt (Enhanced)
  const systemPrompt = `
    You are Coach ${profile?.coaching_style || 'Pro'}, an elite Strength & Conditioning expert.
    User: ${profile?.full_name || 'Athlete'}
    Goal: ${profile?.primary_goal?.replace('_', ' ')}
    Stats: ${profile?.weight_kg}kg
    
    **YOUR KNOWLEDGE BASE:**
    - **Valid Exercises:** You must ONLY suggest exercises from this list: [${validExerciseNames}]. Do not invent names.
    - **Recent Performance:** ${workoutSummary}
    - **Injuries:** ${JSON.stringify(injuries)}

    **CAPABILITIES:**
    You can modify the workout program using the "swap_exercise" tool.

    **INSTRUCTIONS:**
    1. If the user asks to swap/change an exercise, you MUST pick a replacement from the **Valid Exercises** list above.
    2. To swap, output JSON: { "action": "swap_exercise", "target": "EXERCISE_TO_REMOVE", "replacement": "EXERCISE_TO_ADD" }
    3. If analyzing workouts, refer to specific weights and reps from "Recent Performance".
    4. Keep text responses short and motivating.
  `;

  // 5. Call AI
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: systemPrompt }, ...history, { role: 'user', content: message }],
        temperature: 0.5,
        max_tokens: 500,
      }),
    });

    if (!response.ok) throw new Error(`Groq API refused: ${response.status}`);

    const data = await response.json();
    let aiContent = data.choices[0]?.message?.content || "";

    // 6. ✅ NEW: Tool Execution Logic
    if (aiContent.trim().startsWith('{') && aiContent.includes('"action": "swap_exercise"')) {
      try {
        const toolAction = JSON.parse(aiContent);
        const result = await swapExerciseInProgram(user.id, toolAction.target, toolAction.replacement);
        aiContent = result.success ? result.message : `⚠️ I tried to swap it, but: ${result.message}`;
      } catch (err) {
        aiContent = "I tried to update your program, but I ran into a system error.";
      }
    }

    return NextResponse.json({ role: 'assistant', content: aiContent });

  } catch (error) {
    console.error("Chat Error", error);
    return NextResponse.json({ role: 'assistant', content: "I'm having trouble connecting. Please try again." });
  }
}

// Helper: Format logs for the AI
function groupLogsBySession(logs: any[]) {
  if (!logs || logs.length === 0) return "No recent workouts found.";
  const sessions: Record<string, string[]> = {};
  
  logs.forEach(log => {
    const key = `${log.date} - ${log.workout_name}`;
    if (!sessions[key]) sessions[key] = [];
    sessions[key].push(`${log.exercise_name} (${log.weight_kg}kg x ${log.reps})`);
  });

  return Object.entries(sessions).map(([name, exercises]) => {
    const uniqueExercises = Array.from(new Set(exercises));
    return `Workout: ${name}\nExercises: ${uniqueExercises.join(', ')}`;
  }).join('\n\n');
}