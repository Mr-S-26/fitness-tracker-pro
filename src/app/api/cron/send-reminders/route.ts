import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import webpush from 'web-push';

// Configure Web Push with your keys
webpush.setVapidDetails(
  'mailto:support@fitnesstracker.pro', // Put a real email here eventually
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function GET(req: Request) {
  const supabase = await createClient();
  
  // 1. Get Current Time (e.g., "09:00")
  // In production, this runs every hour. For testing, we can override it.
  const url = new URL(req.url);
  const testTime = url.searchParams.get('time'); // Allow manual testing like ?time=09:00
  
  const now = new Date();
  const currentHour = testTime || now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  
  console.log(`⏰ Cron waking up for time slot: ${currentHour}`);

  // 2. Find Users who want reminders at this time
  const { data: users } = await supabase
    .from('user_fitness_profiles')
    .select('user_id, push_subscription_data, full_name')
    .eq('reminders_enabled', true)
    // We use "starts with" to catch 09:00, 09:00:00, etc.
    .ilike('preferred_workout_time', `${currentHour}%`)
    .not('push_subscription_data', 'is', null);

  if (!users || users.length === 0) {
    return NextResponse.json({ message: `No users scheduled for ${currentHour}` });
  }

  console.log(`Found ${users.length} users to remind.`);

  // 3. Send Notifications
  const results = await Promise.all(users.map(async (user) => {
    const subscription = typeof user.push_subscription_data === 'string' 
      ? JSON.parse(user.push_subscription_data) 
      : user.push_subscription_data;

    const payload = JSON.stringify({
      title: `Time to Train, ${user.full_name?.split(' ')[0] || 'Athlete'}!`,
      body: "Your workout is ready. Let's crush it. 💪",
      url: "/workout/check-in"
    });

    try {
      await webpush.sendNotification(subscription, payload);
      return { user: user.user_id, status: 'success' };
    } catch (error) {
      console.error(`Failed to send to ${user.user_id}`, error);
      return { user: user.user_id, status: 'failed' };
    }
  }));

  return NextResponse.json({ 
    message: `Processed ${users.length} reminders`, 
    results 
  });
}