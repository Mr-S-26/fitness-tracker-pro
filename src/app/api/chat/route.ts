import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { swapExerciseInProgram } from '@/lib/ai/program-modifier'; // ✅ Import the tool

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ✅ DEBUG: Check if API Key exists
  if (!process.env.GROQ_API_KEY) {
    console.error("❌ CRITICAL: GROQ_API_KEY is missing in .env.local");
    return NextResponse.json({ 
      role: 'assistant', 
      content: "System Error: My brain is missing (API Key not found). Please check server logs." 
    });
  }

  const { message, history } = await req.json();

  // 1. Fetch User Context
  const { data: profile } = await supabase
    .from('user_fitness_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const { data: recentLogs } = await supabase
    .from('workout_logs')
    .select('workout_name, date, total_volume_kg, readiness_score')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(3);

  const { data: injuries } = await supabase
    .from('user_injuries')
    .select('body_part, description')
    .eq('user_id', user.id)
    .eq('active', true);

  // 2. System Prompt (Updated with Tool Instructions)
  const systemPrompt = `
    You are Coach ${profile?.coaching_style || 'Pro'}, an elite Strength & Conditioning expert.
    User: ${profile?.full_name || 'Athlete'}
    Goal: ${profile?.primary_goal?.replace('_', ' ')}
    Stats: ${profile?.weight_kg}kg, ${profile?.height_cm}cm.
    Equipment: ${profile?.available_equipment?.join(', ') || 'Standard Gym'}
    
    **Current Context:**
    - Recent Workouts: ${JSON.stringify(recentLogs)}
    - Active Injuries: ${JSON.stringify(injuries)}
    
    **CAPABILITIES:**
    You have the power to modify the user's workout program directly.

    **INSTRUCTIONS:**
    1. If the user asks to **change, swap, or replace** an exercise, you must PERFORM THE ACTION.
    2. To perform the action, your response must be **ONLY** a JSON object in this format:
       { "action": "swap_exercise", "target": "EXERCISE_TO_REMOVE", "replacement": "EXERCISE_TO_ADD" }
    3. Determine the best replacement based on their available equipment and goal.
    4. If the user is just chatting, reply normally with text.
    5. Keep text responses short (max 2-3 sentences) and motivating.
  `;

  // 3. Call Real AI
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', 
        messages: [
          { role: 'system', content: systemPrompt },
          ...history,
          { role: 'user', content: message }
        ],
        temperature: 0.5, // Lower temperature to ensure valid JSON output
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Groq API Error:', errorText);
      throw new Error(`Groq API refused: ${response.status}`);
    }

    const data = await response.json();
    let aiContent = data.choices[0]?.message?.content || "I'm focusing on your form right now.";

    // 4. 🕵️‍♂️ Tool Execution Logic
    // If the AI output is JSON, it means it wants to run a tool
    if (aiContent.trim().startsWith('{') && aiContent.includes('"action": "swap_exercise"')) {
      try {
        const toolAction = JSON.parse(aiContent);
        console.log("🛠️ AI Executing Tool:", toolAction);
        
        // Run the Modifier
        const result = await swapExerciseInProgram(user.id, toolAction.target, toolAction.replacement);
        
        // Overwrite the AI response with the result
        if (result.success) {
          aiContent = result.message;
        } else {
          aiContent = `⚠️ I tried to swap it, but: ${result.message}`;
        }

      } catch (err) {
        console.error("Tool Execution Failed", err);
        aiContent = "I tried to update your program, but something went wrong with my database connection.";
      }
    }

    return NextResponse.json({ 
      role: 'assistant', 
      content: aiContent 
    });

  } catch (error) {
    console.error('Chat Route Error:', error);
    return NextResponse.json({ 
      role: 'assistant', 
      content: "I'm having trouble reaching the AI service. Please check the server logs." 
    });
  }
}