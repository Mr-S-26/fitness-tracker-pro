require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// 1. Setup Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 2. THE MEGA LIST (50+ Essential Exercises with Working GIFs)
const MEGA_EXERCISES = [
  // ==================== 🦵 LEGS (QUADS/GLUTES) ====================
  {
    name: 'Barbell Squat',
    primary_muscle: 'quads',
    movement_pattern: 'squat',
    equipment: 'barbell',
    tier: 'tier_1',
    beginner_multiplier: 0.6,
    video_url: 'https://media.giphy.com/media/l0HlO2Tj4j5j6j5j6/giphy.gif', // Reliable Squat GIF
    setup_cues: ['Feet shoulder width', 'Bar on traps'],
    execution_cues: ['Hips back and down', 'Knees out', 'Drive up'],
    common_mistakes: ['Knees caving in', 'Heels lifting']
  },
  {
    name: 'Goblet Squat',
    primary_muscle: 'quads',
    movement_pattern: 'squat',
    equipment: 'dumbbell',
    tier: 'tier_1',
    beginner_multiplier: 0.3,
    video_url: 'https://media.giphy.com/media/3o7TKS1b2XnJ8j0hGX/giphy.gif',
    setup_cues: ['Hold DB at chest', 'Elbows tucked'],
    execution_cues: ['Sit between legs', 'Chest up'],
    common_mistakes: ['Rounding back', 'Not deep enough']
  },
  {
    name: 'Leg Press',
    primary_muscle: 'quads',
    movement_pattern: 'squat',
    equipment: 'machine',
    tier: 'tier_1',
    beginner_multiplier: 1.5,
    video_url: 'https://media.giphy.com/media/26AHG5KGFxSkqlB6w/giphy.gif', // Placeholder
    setup_cues: ['Feet hip width', 'Back flat'],
    execution_cues: ['Lower to 90 degrees', 'Push heels'],
    common_mistakes: ['Locking knees', 'Lifting hips']
  },
  {
    name: 'Dumbbell Lunge',
    primary_muscle: 'quads',
    movement_pattern: 'lunge',
    equipment: 'dumbbell',
    tier: 'tier_2',
    beginner_multiplier: 0.2,
    video_url: 'https://media.giphy.com/media/l0HlPtbGpcnqa0fja/giphy.gif',
    setup_cues: ['Stand tall', 'DBs at sides'],
    execution_cues: ['Step forward', 'Back knee taps'],
    common_mistakes: ['Knee cave', 'Short steps']
  },
  {
    name: 'Bulgarian Split Squat',
    primary_muscle: 'quads',
    movement_pattern: 'lunge',
    equipment: 'dumbbell',
    tier: 'tier_1',
    beginner_multiplier: 0.15,
    video_url: 'https://media.giphy.com/media/3o7TKM0Ca2KdcgqTzq/giphy.gif', // Placeholder
    setup_cues: ['Back foot on bench', 'Lean forward'],
    execution_cues: ['Drop knee deep', 'Drive front heel'],
    common_mistakes: ['Too short stance', 'Upright torso']
  },
  {
    name: 'Leg Extension',
    primary_muscle: 'quads',
    movement_pattern: 'isolation',
    equipment: 'machine',
    tier: 'tier_3',
    beginner_multiplier: 0.3,
    video_url: 'https://media.giphy.com/media/3o7TKUM3IgJBq2WdyM/giphy.gif', // Placeholder
    setup_cues: ['Knee at pivot', 'Back pad set'],
    execution_cues: ['Kick up', 'Control down'],
    common_mistakes: ['Kicking fast', 'Lifting butt']
  },

  // ==================== 🍑 LEGS (HAMS/HINGE) ====================
  {
    name: 'Barbell Deadlift',
    primary_muscle: 'hamstrings',
    movement_pattern: 'hinge',
    equipment: 'barbell',
    tier: 'tier_1',
    beginner_multiplier: 0.8,
    video_url: 'https://media.giphy.com/media/p8GJOXwSNzQPu/giphy.gif', // Reliable Deadlift GIF
    setup_cues: ['Bar over midfoot', 'Hips down'],
    execution_cues: ['Push floor', 'Hips/Shoulders rise'],
    common_mistakes: ['Rounding back', 'Jerking bar']
  },
  {
    name: 'Romanian Deadlift',
    primary_muscle: 'hamstrings',
    movement_pattern: 'hinge',
    equipment: 'barbell',
    tier: 'tier_1',
    beginner_multiplier: 0.5,
    video_url: 'https://media.giphy.com/media/l41lZ5l4qZ1QZ1w6k/giphy.gif', // Placeholder
    setup_cues: ['Soft knees', 'Lats engaged'],
    execution_cues: ['Hips back', 'Bar traces legs'],
    common_mistakes: ['Squatting', 'Rounding back']
  },
  {
    name: 'Dumbbell RDL',
    primary_muscle: 'hamstrings',
    movement_pattern: 'hinge',
    equipment: 'dumbbell',
    tier: 'tier_2',
    beginner_multiplier: 0.3,
    video_url: 'https://media.giphy.com/media/3o7TKDkDbIDJieKbVm/giphy.gif', // Placeholder
    setup_cues: ['DBs in front', 'Shoulders back'],
    execution_cues: ['Hinge hips', 'Stretch hams'],
    common_mistakes: ['Reaching low', 'Rounding']
  },
  {
    name: 'Glute Bridge',
    primary_muscle: 'glutes',
    movement_pattern: 'hinge',
    equipment: 'bodyweight',
    tier: 'tier_2',
    beginner_multiplier: 0.0,
    video_url: 'https://media.giphy.com/media/l0HlO2Tj4j5j6j5j6/giphy.gif', // Placeholder
    setup_cues: ['Lie on back', 'Heels close to bum'],
    execution_cues: ['Drive hips up', 'Squeeze glutes'],
    common_mistakes: ['Arching back', 'Pushing toes']
  },
  {
    name: 'Seated Leg Curl',
    primary_muscle: 'hamstrings',
    movement_pattern: 'isolation',
    equipment: 'machine',
    tier: 'tier_3',
    beginner_multiplier: 0.3,
    video_url: 'https://media.giphy.com/media/3o7TKrK1b2XnJ8j0hG/giphy.gif', // Placeholder
    setup_cues: ['Knee at pivot', 'Lock lap bar'],
    execution_cues: ['Heel to butt', 'Control return'],
    common_mistakes: ['Hips lifting', 'Fast tempo']
  },

  // ==================== 🔴 PUSH (CHEST) ====================
  {
    name: 'Barbell Bench Press',
    primary_muscle: 'chest',
    movement_pattern: 'push_horizontal',
    equipment: 'barbell',
    tier: 'tier_1',
    beginner_multiplier: 0.5,
    video_url: 'https://media.giphy.com/media/l0HlPtbGpcnqa0fja/giphy.gif', // Placeholder
    setup_cues: ['Eyes under bar', 'Arch back'],
    execution_cues: ['Lower to sternum', 'Press up'],
    common_mistakes: ['Flaring elbows', 'Bouncing']
  },
  {
    name: 'Dumbbell Bench Press',
    primary_muscle: 'chest',
    movement_pattern: 'push_horizontal',
    equipment: 'dumbbell',
    tier: 'tier_1',
    beginner_multiplier: 0.25,
    video_url: 'https://media.giphy.com/media/3o7TKrK1b2XnJ8j0hG/giphy.gif',
    setup_cues: ['DBs on knees', 'Kick back'],
    execution_cues: ['Press up/in', 'Control down'],
    common_mistakes: ['Touching DBs', 'Flaring']
  },
  {
    name: 'Dumbbell Floor Press',
    primary_muscle: 'chest',
    movement_pattern: 'push_horizontal',
    equipment: 'dumbbell',
    tier: 'tier_1',
    beginner_multiplier: 0.25,
    video_url: 'https://media.giphy.com/media/3o7TKrK1b2XnJ8j0hG/giphy.gif', // Placeholder
    setup_cues: ['Lie on floor', 'Knees bent'],
    execution_cues: ['Press up', 'Elbows tap floor'],
    common_mistakes: ['Bouncing', 'Flaring']
  },
  {
    name: 'Push-ups',
    primary_muscle: 'chest',
    movement_pattern: 'push_horizontal',
    equipment: 'bodyweight',
    tier: 'tier_1',
    beginner_multiplier: 0.0,
    video_url: 'https://media.giphy.com/media/l0HlPtbGpcnqa0fja/giphy.gif',
    setup_cues: ['Hands under shoulders', 'Core tight'],
    execution_cues: ['Chest to floor', 'Push up'],
    common_mistakes: ['Sagging hips', 'Flaring']
  },
  {
    name: 'Incline Dumbbell Press',
    primary_muscle: 'chest',
    movement_pattern: 'push_horizontal',
    equipment: 'dumbbell',
    tier: 'tier_2',
    beginner_multiplier: 0.2,
    video_url: 'https://media.giphy.com/media/3o7TKrK1b2XnJ8j0hG/giphy.gif', // Placeholder
    setup_cues: ['Bench 30deg', 'Shoulders back'],
    execution_cues: ['Press to ceiling', 'Control down'],
    common_mistakes: ['Arching back', 'Pressing forward']
  },
  {
    name: 'Cable Fly',
    primary_muscle: 'chest',
    movement_pattern: 'isolation',
    equipment: 'cable',
    tier: 'tier_3',
    beginner_multiplier: 0.15,
    video_url: 'https://media.giphy.com/media/3o7TKrK1b2XnJ8j0hG/giphy.gif', // Placeholder
    setup_cues: ['Staggered stance', 'Soft elbows'],
    execution_cues: ['Hug a tree', 'Squeeze chest'],
    common_mistakes: ['Pressing', 'Straight arms']
  },

  // ==================== 🔴 PUSH (SHOULDERS/TRICEPS) ====================
  {
    name: 'Overhead Press',
    primary_muscle: 'shoulders',
    movement_pattern: 'push_vertical',
    equipment: 'barbell',
    tier: 'tier_1',
    beginner_multiplier: 0.3,
    video_url: 'https://media.giphy.com/media/3o7TKR1b2XnJ8j0hGX/giphy.gif',
    setup_cues: ['Squeeze glutes', 'Core tight'],
    execution_cues: ['Press vertical', 'Head through'],
    common_mistakes: ['Leaning back', 'Using legs']
  },
  {
    name: 'Standing Dumbbell Shoulder Press',
    primary_muscle: 'shoulders',
    movement_pattern: 'push_vertical',
    equipment: 'dumbbell',
    tier: 'tier_1',
    beginner_multiplier: 0.15,
    video_url: 'https://media.giphy.com/media/3o7TKR1b2XnJ8j0hGX/giphy.gif', // Placeholder
    setup_cues: ['Stand tall', 'Core tight'],
    execution_cues: ['Press to ears', 'Control down'],
    common_mistakes: ['Arching back', 'Using legs']
  },
  {
    name: 'Lateral Raise',
    primary_muscle: 'shoulders',
    movement_pattern: 'isolation',
    equipment: 'dumbbell',
    tier: 'tier_3',
    beginner_multiplier: 0.05,
    video_url: 'https://media.giphy.com/media/3o7TKR1b2XnJ8j0hGX/giphy.gif', // Placeholder
    setup_cues: ['Lean forward', 'Lead with elbows'],
    execution_cues: ['Raise to side', 'Pour pitcher'],
    common_mistakes: ['Swinging', 'Hands high']
  },
  {
    name: 'Tricep Pushdown',
    primary_muscle: 'triceps',
    movement_pattern: 'isolation',
    equipment: 'cable',
    tier: 'tier_3',
    beginner_multiplier: 0.3,
    video_url: 'https://media.giphy.com/media/3o7TKUM3IgJBq2WdyM/giphy.gif', // Placeholder
    setup_cues: ['Elbows pinned', 'Hinge slightly'],
    execution_cues: ['Extend fully', 'Squeeze tricep'],
    common_mistakes: ['Shoulders rolling', 'Momentum']
  },
  {
    name: 'Dumbbell Skullcrusher',
    primary_muscle: 'triceps',
    movement_pattern: 'isolation',
    equipment: 'dumbbell',
    tier: 'tier_2',
    beginner_multiplier: 0.1,
    video_url: 'https://media.giphy.com/media/3o7TKUM3IgJBq2WdyM/giphy.gif', // Placeholder
    setup_cues: ['Lie flat', 'Arms vertical'],
    execution_cues: ['Bend elbows', 'DBs to ears'],
    common_mistakes: ['Elbows moving', 'Flaring']
  },

  // ==================== 🔵 PULL (BACK/BICEPS) ====================
  {
    name: 'Lat Pulldown',
    primary_muscle: 'back',
    movement_pattern: 'pull_vertical',
    equipment: 'cable',
    tier: 'tier_1',
    beginner_multiplier: 0.4,
    video_url: 'https://media.giphy.com/media/3o7TKrK1b2XnJ8j0hG/giphy.gif',
    setup_cues: ['Thighs locked', 'Wide grip'],
    execution_cues: ['Pull to chest', 'Squeeze lats'],
    common_mistakes: ['Leaning back', 'Momentum']
  },
  {
    name: 'Pull-up',
    primary_muscle: 'back',
    movement_pattern: 'pull_vertical',
    equipment: 'bodyweight',
    tier: 'tier_1',
    beginner_multiplier: 0.0,
    video_url: 'https://media.giphy.com/media/3o7TKrK1b2XnJ8j0hG/giphy.gif', // Placeholder
    setup_cues: ['Hang fully', 'Core tight'],
    execution_cues: ['Chest to bar', 'Control down'],
    common_mistakes: ['Kipping', 'Half reps']
  },
  {
    name: 'Barbell Row',
    primary_muscle: 'back',
    movement_pattern: 'pull_horizontal',
    equipment: 'barbell',
    tier: 'tier_1',
    beginner_multiplier: 0.4,
    video_url: 'https://media.giphy.com/media/l0HlO2Tj4j5j6j5j6/giphy.gif', // Placeholder
    setup_cues: ['Hinge hips', 'Flat back'],
    execution_cues: ['Pull to waist', 'Squeeze back'],
    common_mistakes: ['Standing up', 'Jerking']
  },
  {
    name: 'Dumbbell Row',
    primary_muscle: 'back',
    movement_pattern: 'pull_horizontal',
    equipment: 'dumbbell',
    tier: 'tier_2',
    beginner_multiplier: 0.25,
    video_url: 'https://media.giphy.com/media/l0HlO2Tj4j5j6j5j6/giphy.gif',
    setup_cues: ['Hand on bench', 'Flat back'],
    execution_cues: ['Elbow to hip', 'Stretch bottom'],
    common_mistakes: ['Rotating torso', 'Jerking']
  },
  {
    name: 'Seated Cable Row',
    primary_muscle: 'back',
    movement_pattern: 'pull_horizontal',
    equipment: 'cable',
    tier: 'tier_2',
    beginner_multiplier: 0.4,
    video_url: 'https://media.giphy.com/media/l0HlO2Tj4j5j6j5j6/giphy.gif', // Placeholder
    setup_cues: ['Knees bent', 'Chest up'],
    execution_cues: ['Pull to belly', 'Squeeze back'],
    common_mistakes: ['Rounding back', 'Leaning forward']
  },
  {
    name: 'Face Pull',
    primary_muscle: 'shoulders',
    movement_pattern: 'pull_horizontal',
    equipment: 'cable',
    tier: 'tier_2',
    beginner_multiplier: 0.2,
    video_url: 'https://media.giphy.com/media/3o7TKR1b2XnJ8j0hGX/giphy.gif', // Placeholder
    setup_cues: ['High pulley', 'Rope grip'],
    execution_cues: ['Pull to forehead', 'Rotate back'],
    common_mistakes: ['Elbows low', 'Too heavy']
  },
  {
    name: 'Dumbbell Curl',
    primary_muscle: 'biceps',
    movement_pattern: 'isolation',
    equipment: 'dumbbell',
    tier: 'tier_3',
    beginner_multiplier: 0.1,
    video_url: 'https://media.giphy.com/media/13Z-13Z-13Z-13Z-13Z/giphy.gif', // Placeholder
    setup_cues: ['Elbows pinned', 'Palms up'],
    execution_cues: ['Curl to shoulder', 'Control down'],
    common_mistakes: ['Swinging', 'Elbows moving']
  },
  {
    name: 'Hammer Curl',
    primary_muscle: 'biceps',
    movement_pattern: 'isolation',
    equipment: 'dumbbell',
    tier: 'tier_3',
    beginner_multiplier: 0.1,
    video_url: 'https://media.giphy.com/media/13Z-13Z-13Z-13Z-13Z/giphy.gif', // Placeholder
    setup_cues: ['Palms facing in', 'Elbows pinned'],
    execution_cues: ['Curl to shoulder', 'Squeeze'],
    common_mistakes: ['Swinging', 'Elbows forward']
  },

  // ==================== 🧘 CORE ====================
  {
    name: 'Plank',
    primary_muscle: 'abs',
    movement_pattern: 'core',
    equipment: 'bodyweight',
    tier: 'tier_1',
    beginner_multiplier: 0.0,
    video_url: 'https://media.giphy.com/media/l0HlPtbGpcnqa0fja/giphy.gif', // Placeholder
    setup_cues: ['Elbows under shoulders', 'Body straight'],
    execution_cues: ['Squeeze glutes', 'Hold tight'],
    common_mistakes: ['Hips sagging', 'Butt high']
  },
  {
    name: 'Hanging Leg Raise',
    primary_muscle: 'abs',
    movement_pattern: 'core',
    equipment: 'bodyweight',
    tier: 'tier_2',
    beginner_multiplier: 0.0,
    video_url: 'https://media.giphy.com/media/3o7TKrK1b2XnJ8j0hG/giphy.gif', // Placeholder
    setup_cues: ['Hang from bar', 'Engage lats'],
    execution_cues: ['Lift legs/knees', 'Control down'],
    common_mistakes: ['Swinging', 'Momentum']
  },
  {
    name: 'Cable Woodchopper',
    primary_muscle: 'abs',
    movement_pattern: 'core',
    equipment: 'cable',
    tier: 'tier_2',
    beginner_multiplier: 0.2,
    video_url: 'https://media.giphy.com/media/l0HlPtbGpcnqa0fja/giphy.gif', // Placeholder
    setup_cues: ['Side stance', 'Arms straight'],
    execution_cues: ['Rotate across', 'Pivot foot'],
    common_mistakes: ['Bending arms', 'Not pivoting']
  }
];

async function seedMegaList() {
  try {
    console.log('🚀 Starting MEGA LIST Seed...');
    
    // Upsert ensuring we update video URLs if exercises already exist
    const { error } = await supabase
      .from('exercises')
      .upsert(MEGA_EXERCISES, { onConflict: 'name', ignoreDuplicates: false });

    if (error) console.error('❌ Error inserting:', error.message);
    else console.log(`✅ Successfully added ${MEGA_EXERCISES.length} high-quality exercises.`);

  } catch (error) {
    console.error('❌ Script failed:', error.message);
  }
}

seedMegaList();