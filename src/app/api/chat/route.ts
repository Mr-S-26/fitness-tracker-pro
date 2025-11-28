import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

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

  // 2. System Prompt
  const systemPrompt = `
    You are Coach ${profile?.coaching_style || 'Pro'}, an elite Strength & Conditioning expert.
    User: ${profile?.full_name || 'Athlete'}
    Goal: ${profile?.primary_goal?.replace('_', ' ')}
    Stats: ${profile?.weight_kg}kg, ${profile?.height_cm}cm.
    
    **Current Context:**
    - Recent Workouts: ${JSON.stringify(recentLogs)}
    - Active Injuries: ${JSON.stringify(injuries)}
    
    **Instructions:**
    - Keep answers short (max 2-3 sentences).
    - Be motivating but factual.
  `;

  // 3. Call Real AI (Updated Model)
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // ✅ FIX: Use the latest stable model
        model: 'llama-3.3-70b-versatile', 
        messages: [
          { role: 'system', content: systemPrompt },
          ...history,
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Groq API Error:', errorText); // This will print the REAL reason in your terminal
      throw new Error(`Groq API refused: ${response.status}`);
    }

    const data = await response.json();
    const aiContent = data.choices[0]?.message?.content || "I'm focusing on your form right now.";

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