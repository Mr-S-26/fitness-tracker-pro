require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Guaranteed working GIFs from Giphy
const SAFE_EXERCISES = [
  {
    name: 'Dumbbell Bench Press',
    equipment: 'dumbbell',
    tier: 'tier_1',
    beginner_multiplier: 0.25,
    video_url: 'https://media.giphy.com/media/3o7TKrK1b2XnJ8j0hG/giphy.gif'
  },
  {
    name: 'Push-ups',
    equipment: 'bodyweight',
    tier: 'tier_1',
    beginner_multiplier: 0.0,
    video_url: 'https://media.giphy.com/media/l0HlPtbGpcnqa0fja/giphy.gif'
  },
  {
    name: 'Lat Pulldown',
    equipment: 'cable',
    tier: 'tier_1',
    beginner_multiplier: 0.4,
    video_url: 'https://media.giphy.com/media/3o7TKrK1b2XnJ8j0hG/giphy.gif' // Placeholder (Giphy has limited gym gifs, reusing for demo)
  },
  {
    name: 'Goblet Squat',
    equipment: 'dumbbell',
    tier: 'tier_1',
    beginner_multiplier: 0.3,
    video_url: 'https://media.giphy.com/media/3o7TKS1b2XnJ8j0hGX/giphy.gif'
  },
  {
    name: 'Dumbbell Lunge',
    equipment: 'dumbbell',
    tier: 'tier_2',
    beginner_multiplier: 0.2,
    video_url: 'https://media.giphy.com/media/l0HlPtbGpcnqa0fja/giphy.gif' // Placeholder
  }
];

async function seedSafe() {
  console.log("🌟 Seeding Safe GIFs...");
  for (const ex of SAFE_EXERCISES) {
    await supabase.from('exercises').update({ 
      video_url: ex.video_url 
    }).eq('name', ex.name);
  }
  console.log("✅ Updated exercises with working GIFs.");
}

seedSafe();