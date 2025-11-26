// src/lib/coaching/exercise-cues.ts
/**
 * Exercise-Specific Coaching Cues Database
 * Contains form cues, breathing patterns, and common mistakes for top exercises
 */

export interface ExerciseCue {
  exercise_name: string;
  aliases: string[]; // Alternative names for matching
  setup: string[];
  execution: string[];
  breathing: string;
  common_mistakes: string[];
  rpe_guidance?: string;
  tempo?: string; // e.g., "3-1-1-0" (eccentric-pause-concentric-pause)
}

// =====================================================
// COMPOUND MOVEMENTS - BARBELL
// =====================================================

const BARBELL_SQUAT: ExerciseCue = {
  exercise_name: "Barbell Squat",
  aliases: ["Back Squat", "Squat", "Barbell Back Squat", "BB Squat"],
  setup: [
    "Bar on upper traps (high bar) or rear delts (low bar)",
    "Feet shoulder-width apart, toes slightly out",
    "Grip slightly wider than shoulders",
    "Chest up, core braced, neutral spine"
  ],
  execution: [
    "Initiate by pushing hips back and bending knees",
    "Descend until thighs parallel or below",
    "Keep knees tracking over toes",
    "Drive through midfoot to stand",
    "Squeeze glutes at top"
  ],
  breathing: "Inhale at top, brace core, descend. Exhale forcefully through sticking point.",
  common_mistakes: [
    "Knees caving inward",
    "Rising on toes/losing balance forward",
    "Rounding lower back",
    "Not reaching depth",
    "Looking up (hyperextending neck)"
  ],
  rpe_guidance: "RPE 7-8 for hypertrophy, RPE 9+ for strength",
  tempo: "3-0-1-0"
};

const BARBELL_BENCH_PRESS: ExerciseCue = {
  exercise_name: "Barbell Bench Press",
  aliases: ["Bench Press", "Flat Bench Press", "BB Bench", "Bench"],
  setup: [
    "Lie flat, eyes under bar",
    "Feet flat on floor, drive through heels",
    "Arch upper back, shoulder blades retracted",
    "Grip slightly wider than shoulders",
    "Unrack with straight arms"
  ],
  execution: [
    "Lower bar to mid-chest in controlled arc",
    "Elbows at 45-degree angle to body",
    "Touch chest lightly (don't bounce)",
    "Press bar up and slightly back",
    "Lock out arms at top"
  ],
  breathing: "Inhale during descent, hold at bottom, exhale during press.",
  common_mistakes: [
    "Flaring elbows out 90 degrees",
    "Bouncing bar off chest",
    "Lifting hips off bench",
    "Uneven bar path",
    "Not touching chest"
  ],
  rpe_guidance: "RPE 7-8 for volume, RPE 9+ for heavy singles",
  tempo: "2-1-1-0"
};

const BARBELL_DEADLIFT: ExerciseCue = {
  exercise_name: "Barbell Deadlift",
  aliases: ["Deadlift", "Conventional Deadlift", "DL", "BB Deadlift"],
  setup: [
    "Bar over midfoot (1 inch from shins)",
    "Feet hip-width apart",
    "Grip just outside legs (mixed or double overhand)",
    "Hips higher than knees, shoulders over bar",
    "Neutral spine, chest up, lats engaged"
  ],
  execution: [
    "Push floor away with legs to initiate",
    "Bar stays close to shins/thighs",
    "Hips and shoulders rise together",
    "Full hip extension at top",
    "Reverse motion under control"
  ],
  breathing: "Deep breath before lift, brace core, hold until lockout.",
  common_mistakes: [
    "Rounding lower back",
    "Bar drifting away from body",
    "Hitching at lockout",
    "Starting with hips too low/high",
    "Not engaging lats"
  ],
  rpe_guidance: "RPE 8-9 for strength, keep perfect form",
  tempo: "1-0-2-0"
};

const BARBELL_ROW: ExerciseCue = {
  exercise_name: "Barbell Row",
  aliases: ["Bent Over Row", "BB Row", "Pendlay Row", "Barbell Bent Over Row"],
  setup: [
    "Feet hip-width, slight knee bend",
    "Hip hinge to ~45 degrees",
    "Grip shoulder-width or slightly wider",
    "Neutral spine, core braced",
    "Bar hangs at arms' length"
  ],
  execution: [
    "Pull bar to lower chest/upper abs",
    "Drive elbows back, not up",
    "Squeeze shoulder blades together",
    "Pause at top",
    "Lower under control"
  ],
  breathing: "Exhale during pull, inhale during lowering.",
  common_mistakes: [
    "Using momentum/body English",
    "Rounding back",
    "Pulling to neck instead of chest",
    "Not keeping core tight",
    "Standing too upright"
  ],
  tempo: "1-1-2-0"
};

const OVERHEAD_PRESS: ExerciseCue = {
  exercise_name: "Overhead Press",
  aliases: ["Military Press", "OHP", "Standing Press", "Barbell Press", "Shoulder Press"],
  setup: [
    "Bar at collarbone level",
    "Feet hip-width apart",
    "Grip just outside shoulders",
    "Elbows slightly in front of bar",
    "Core and glutes engaged"
  ],
  execution: [
    "Press bar straight up, close to face",
    "Move head back slightly as bar passes",
    "Lock out overhead, bar over midfoot",
    "Shrug shoulders at top",
    "Lower under control to start"
  ],
  breathing: "Inhale at bottom, hold breath during press, exhale at top.",
  common_mistakes: [
    "Leaning back excessively",
    "Pressing bar forward",
    "Not locking out fully",
    "Flaring elbows out",
    "Not engaging core"
  ],
  rpe_guidance: "RPE 7-8 for volume, strict form required",
  tempo: "1-0-2-0"
};

// =====================================================
// COMPOUND MOVEMENTS - DUMBBELL
// =====================================================

const DUMBBELL_BENCH_PRESS: ExerciseCue = {
  exercise_name: "Dumbbell Bench Press",
  aliases: ["DB Bench Press", "Dumbbell Press", "DB Bench"],
  setup: [
    "Sit on bench with DBs on thighs",
    "Lie back, bringing DBs to shoulders",
    "Feet flat, upper back arched",
    "Palms forward, DBs at chest level"
  ],
  execution: [
    "Press DBs up and slightly together",
    "Don't touch DBs at top",
    "Lower until DBs reach chest level",
    "Elbows at 45 degrees",
    "Maintain control throughout"
  ],
  breathing: "Inhale on descent, exhale on press.",
  common_mistakes: [
    "Bouncing DBs off chest",
    "Banging DBs together at top",
    "Losing shoulder retraction",
    "Pressing straight up (not arc)",
    "Flaring elbows excessively"
  ],
  tempo: "2-0-1-0"
};

const DUMBBELL_ROW: ExerciseCue = {
  exercise_name: "Dumbbell Row",
  aliases: ["DB Row", "One-Arm Row", "Single-Arm DB Row", "Dumbbell One-Arm Row"],
  setup: [
    "Knee and hand on bench",
    "Other foot on floor, slight bend",
    "Neutral spine, parallel to ground",
    "DB hangs at arm's length"
  ],
  execution: [
    "Pull DB to hip, not shoulder",
    "Drive elbow back and up",
    "Squeeze lat at top",
    "Don't rotate torso",
    "Lower under control"
  ],
  breathing: "Exhale during pull, inhale during lower.",
  common_mistakes: [
    "Rotating torso excessively",
    "Pulling to shoulder instead of hip",
    "Using momentum/swinging",
    "Rounding back",
    "Not pulling high enough"
  ],
  tempo: "1-1-2-0"
};

const GOBLET_SQUAT: ExerciseCue = {
  exercise_name: "Goblet Squat",
  aliases: ["DB Goblet Squat", "Kettlebell Goblet Squat"],
  setup: [
    "Hold DB vertically at chest",
    "Elbows point down",
    "Feet shoulder-width, toes out",
    "Chest up, core braced"
  ],
  execution: [
    "Sit back and down between legs",
    "Elbows track inside knees",
    "Go as deep as mobility allows",
    "Drive through midfoot to stand",
    "Keep weight at chest level"
  ],
  breathing: "Inhale at top, descend, exhale on way up.",
  common_mistakes: [
    "Rounding lower back",
    "Weight drifting away from chest",
    "Heels lifting off ground",
    "Not going deep enough",
    "Knees caving in"
  ],
  tempo: "3-1-1-0"
};

const DUMBBELL_SHOULDER_PRESS: ExerciseCue = {
  exercise_name: "Dumbbell Shoulder Press",
  aliases: ["DB Shoulder Press", "Seated DB Press", "DB OHP"],
  setup: [
    "Sit on bench with back support",
    "DBs at shoulder height",
    "Palms forward or neutral",
    "Feet flat, core engaged"
  ],
  execution: [
    "Press DBs up and slightly together",
    "Don't bang DBs at top",
    "Full lockout overhead",
    "Lower under control",
    "Keep core tight throughout"
  ],
  breathing: "Exhale on press, inhale on descent.",
  common_mistakes: [
    "Arching back excessively",
    "Pressing DBs straight up (not arc)",
    "Not achieving full lockout",
    "Using legs to help",
    "Losing core tension"
  ],
  tempo: "1-0-2-0"
};

// =====================================================
// ISOLATION - UPPER BODY
// =====================================================

const DUMBBELL_CURL: ExerciseCue = {
  exercise_name: "Dumbbell Curl",
  aliases: ["DB Curl", "Bicep Curl", "Dumbbell Bicep Curl", "Standing DB Curl"],
  setup: [
    "Stand with feet hip-width",
    "DBs at sides, palms forward",
    "Elbows close to torso",
    "Slight knee bend, core engaged"
  ],
  execution: [
    "Curl DBs up, keeping elbows stationary",
    "Squeeze biceps at top",
    "Don't swing or use momentum",
    "Lower under control",
    "Maintain tension throughout"
  ],
  breathing: "Exhale on curl, inhale on lower.",
  common_mistakes: [
    "Swinging weight/using momentum",
    "Moving elbows forward",
    "Not achieving full range",
    "Arching back",
    "Dropping weights too fast"
  ],
  tempo: "1-1-2-0"
};

const TRICEP_EXTENSION: ExerciseCue = {
  exercise_name: "Tricep Extension",
  aliases: ["Overhead Tricep Extension", "DB Tricep Extension", "Skull Crusher"],
  setup: [
    "Lie on bench or stand/sit",
    "Hold DB/barbell overhead",
    "Elbows pointing forward/up",
    "Upper arms stationary"
  ],
  execution: [
    "Lower weight behind head",
    "Keep elbows stationary",
    "Stretch triceps fully",
    "Extend back to start",
    "Squeeze triceps at top"
  ],
  breathing: "Inhale during lower, exhale during extension.",
  common_mistakes: [
    "Flaring elbows out",
    "Moving upper arms",
    "Not getting full stretch",
    "Using too much weight",
    "Arching back excessively"
  ],
  tempo: "2-1-1-0"
};

const LATERAL_RAISE: ExerciseCue = {
  exercise_name: "Lateral Raise",
  aliases: ["DB Lateral Raise", "Side Raise", "Dumbbell Side Raise"],
  setup: [
    "Stand with feet hip-width",
    "DBs at sides, slight elbow bend",
    "Slight forward lean",
    "Core engaged"
  ],
  execution: [
    "Raise DBs out to sides",
    "Lead with elbows, not hands",
    "Stop at shoulder height",
    "Pause at top",
    "Lower under control"
  ],
  breathing: "Exhale on raise, inhale on lower.",
  common_mistakes: [
    "Swinging weights up",
    "Shrugging shoulders",
    "Raising above shoulder height",
    "Locking out elbows",
    "Leaning back"
  ],
  tempo: "1-1-2-0"
};

// =====================================================
// ISOLATION - LOWER BODY
// =====================================================

const ROMANIAN_DEADLIFT: ExerciseCue = {
  exercise_name: "Romanian Deadlift",
  aliases: ["RDL", "Stiff Leg Deadlift", "DB RDL"],
  setup: [
    "Stand with feet hip-width",
    "Hold barbell/DBs at thighs",
    "Slight knee bend",
    "Neutral spine, chest up"
  ],
  execution: [
    "Push hips back, maintaining knee angle",
    "Lower weight down thighs/shins",
    "Feel stretch in hamstrings",
    "Stop when back would round",
    "Drive hips forward to return"
  ],
  breathing: "Inhale during descent, exhale on way up.",
  common_mistakes: [
    "Rounding lower back",
    "Bending knees too much",
    "Weight drifting away from body",
    "Not feeling hamstring stretch",
    "Going too low without mobility"
  ],
  tempo: "3-1-1-0"
};

const BULGARIAN_SPLIT_SQUAT: ExerciseCue = {
  exercise_name: "Bulgarian Split Squat",
  aliases: ["Rear Foot Elevated Split Squat", "Single Leg Squat"],
  setup: [
    "Rear foot elevated on bench",
    "Front foot 2-3 feet forward",
    "Torso upright, core braced",
    "Hold DBs at sides or barbell on back"
  ],
  execution: [
    "Lower back knee toward ground",
    "Keep front shin vertical",
    "Descend until thigh parallel",
    "Drive through front heel",
    "Maintain balance throughout"
  ],
  breathing: "Inhale on descent, exhale on ascent.",
  common_mistakes: [
    "Front knee caving inward",
    "Leaning too far forward",
    "Not going deep enough",
    "Front foot too close to bench",
    "Losing balance"
  ],
  tempo: "3-0-1-0"
};

const LEG_CURL: ExerciseCue = {
  exercise_name: "Leg Curl",
  aliases: ["Hamstring Curl", "Lying Leg Curl", "Seated Leg Curl"],
  setup: [
    "Adjust pad to just above heels",
    "Lie face down or sit",
    "Grip handles for stability",
    "Align knee with machine pivot"
  ],
  execution: [
    "Curl heels toward glutes",
    "Squeeze hamstrings at top",
    "Don't lift hips off pad",
    "Lower under control",
    "Maintain tension throughout"
  ],
  breathing: "Exhale during curl, inhale during lower.",
  common_mistakes: [
    "Lifting hips off pad",
    "Using momentum",
    "Not achieving full contraction",
    "Dropping weight too fast",
    "Hyperextending at bottom"
  ],
  tempo: "1-1-2-0"
};

const LEG_EXTENSION: ExerciseCue = {
  exercise_name: "Leg Extension",
  aliases: ["Quad Extension", "Machine Leg Extension"],
  setup: [
    "Adjust back pad for knee alignment",
    "Pad on lower shins",
    "Grip handles",
    "Back flat against pad"
  ],
  execution: [
    "Extend legs to full lockout",
    "Squeeze quads at top",
    "Pause briefly",
    "Lower under control",
    "Don't slam weight stack"
  ],
  breathing: "Exhale during extension, inhale during lower.",
  common_mistakes: [
    "Not achieving full extension",
    "Using momentum/jerking",
    "Arching back off pad",
    "Going too heavy",
    "Rushing through reps"
  ],
  tempo: "1-1-2-0"
};

const CALF_RAISE: ExerciseCue = {
  exercise_name: "Calf Raise",
  aliases: ["Standing Calf Raise", "Seated Calf Raise"],
  setup: [
    "Balls of feet on platform",
    "Heels hanging off edge",
    "Knees straight (standing) or bent (seated)",
    "Hold DBs or use machine"
  ],
  execution: [
    "Rise up onto toes as high as possible",
    "Pause at peak contraction",
    "Lower heels below platform",
    "Full stretch at bottom",
    "Control the movement"
  ],
  breathing: "Exhale on raise, inhale on lower.",
  common_mistakes: [
    "Not achieving full range",
    "Bouncing at bottom",
    "Bending knees (standing version)",
    "Rushing reps",
    "Not pausing at top"
  ],
  tempo: "1-2-2-1"
};

// =====================================================
// CORE & ACCESSORIES
// =====================================================

const PLANK: ExerciseCue = {
  exercise_name: "Plank",
  aliases: ["Front Plank", "Forearm Plank"],
  setup: [
    "Forearms on ground, elbows under shoulders",
    "Body in straight line",
    "Feet together or hip-width",
    "Core braced, glutes engaged"
  ],
  execution: [
    "Hold position without sagging",
    "Don't let hips drop or pike up",
    "Breathe normally",
    "Maintain neutral spine",
    "Engage entire core"
  ],
  breathing: "Breathe normally, don't hold breath.",
  common_mistakes: [
    "Hips sagging",
    "Hips too high (piking)",
    "Not engaging core",
    "Holding breath",
    "Looking up (neck strain)"
  ],
  rpe_guidance: "Hold until form breaks"
};

const PUSH_UP: ExerciseCue = {
  exercise_name: "Push-up",
  aliases: ["Pushup", "Press-up"],
  setup: [
    "Hands slightly wider than shoulders",
    "Body in straight line",
    "Feet together, core braced",
    "Shoulders over wrists"
  ],
  execution: [
    "Lower chest to ground",
    "Elbows at 45 degrees",
    "Touch chest to ground",
    "Press back to start",
    "Maintain plank throughout"
  ],
  breathing: "Inhale on descent, exhale on press.",
  common_mistakes: [
    "Hips sagging",
    "Flaring elbows out",
    "Not going low enough",
    "Head down/looking forward",
    "Losing core tension"
  ],
  tempo: "2-0-1-0"
};

const PULL_UP: ExerciseCue = {
  exercise_name: "Pull-up",
  aliases: ["Pullup", "Wide Grip Pull-up"],
  setup: [
    "Grip bar slightly wider than shoulders",
    "Hang with arms fully extended",
    "Engage lats, retract shoulders",
    "Slight hollow body position"
  ],
  execution: [
    "Pull until chin over bar",
    "Lead with chest",
    "Squeeze shoulder blades",
    "Lower under control",
    "Full extension at bottom"
  ],
  breathing: "Exhale during pull, inhale during lower.",
  common_mistakes: [
    "Not achieving full range",
    "Using momentum/kipping",
    "Shrugging shoulders",
    "Not engaging lats",
    "Partial reps"
  ],
  tempo: "1-0-2-0"
};

// =====================================================
// EXERCISE CUE DATABASE
// =====================================================

export const EXERCISE_CUE_DATABASE: ExerciseCue[] = [
  // Barbell Compounds
  BARBELL_SQUAT,
  BARBELL_BENCH_PRESS,
  BARBELL_DEADLIFT,
  BARBELL_ROW,
  OVERHEAD_PRESS,
  
  // Dumbbell Compounds
  DUMBBELL_BENCH_PRESS,
  DUMBBELL_ROW,
  GOBLET_SQUAT,
  DUMBBELL_SHOULDER_PRESS,
  
  // Upper Body Isolation
  DUMBBELL_CURL,
  TRICEP_EXTENSION,
  LATERAL_RAISE,
  
  // Lower Body Isolation
  ROMANIAN_DEADLIFT,
  BULGARIAN_SPLIT_SQUAT,
  LEG_CURL,
  LEG_EXTENSION,
  CALF_RAISE,
  
  // Core & Bodyweight
  PLANK,
  PUSH_UP,
  PULL_UP,
];

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Find exercise cues by name (fuzzy matching)
 */
export function findExerciseCues(exerciseName: string): ExerciseCue | null {
  const searchName = exerciseName.toLowerCase().trim();
  
  // Exact match
  let match = EXERCISE_CUE_DATABASE.find(
    cue => cue.exercise_name.toLowerCase() === searchName
  );
  
  if (match) return match;
  
  // Alias match
  match = EXERCISE_CUE_DATABASE.find(
    cue => cue.aliases.some(alias => alias.toLowerCase() === searchName)
  );
  
  if (match) return match;
  
  // Partial match
  match = EXERCISE_CUE_DATABASE.find(
    cue => 
      cue.exercise_name.toLowerCase().includes(searchName) ||
      searchName.includes(cue.exercise_name.toLowerCase()) ||
      cue.aliases.some(alias => 
        alias.toLowerCase().includes(searchName) ||
        searchName.includes(alias.toLowerCase())
      )
  );
  
  return match || null;
}

/**
 * Get random setup cue
 */
export function getRandomSetupCue(exerciseName: string): string | null {
  const cues = findExerciseCues(exerciseName);
  if (!cues || cues.setup.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * cues.setup.length);
  return cues.setup[randomIndex];
}

/**
 * Get random execution cue
 */
export function getRandomExecutionCue(exerciseName: string): string | null {
  const cues = findExerciseCues(exerciseName);
  if (!cues || cues.execution.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * cues.execution.length);
  return cues.execution[randomIndex];
}

/**
 * Get breathing pattern
 */
export function getBreathingPattern(exerciseName: string): string | null {
  const cues = findExerciseCues(exerciseName);
  return cues?.breathing || null;
}

/**
 * Get all cues for an exercise
 */
export function getAllCues(exerciseName: string): ExerciseCue | null {
  return findExerciseCues(exerciseName);
}