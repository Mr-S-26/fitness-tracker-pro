const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

export async function registerPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn("Push notifications not supported");
    return null;
  }

  // 1. Register Service Worker (if not already)
  const registration = await navigator.serviceWorker.ready;

  // 2. Check if already subscribed
  let subscription = await registration.pushManager.getSubscription();

  // 3. If not, ask for permission & subscribe
  if (!subscription) {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(PUBLIC_KEY)
    });
  }

  return subscription;
}

// Helper to convert VAPID key for the browser
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
 
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
 
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}