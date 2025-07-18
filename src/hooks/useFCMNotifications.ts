import { useState, useEffect } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../config/firebase';

export const useFCMNotifications = () => {
  const [user] = useAuthState(auth);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check if Service Workers are supported (not available in StackBlitz)
    if (!user || !('serviceWorker' in navigator) || 
        window.location.host.includes('stackblitz.io') || 
        window.location.host.includes('webcontainer.io') ||
        window.location.host.includes('webcontainer-api.io')) {
      return;
    }

    const initializeFCM = async () => {
      try {
        // Request notification permission
        const permission = await Notification.requestPermission();
        setPermission(permission);

        if (permission === 'granted') {
          const messaging = getMessaging();
          
          // Explicitly register the service worker
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
            type: 'module'
          });
          
          // Get FCM token
          const token = await getToken(messaging, {
            vapidKey: '7JUQQzjPHeuK846Xa9kHeV45FFCYuGgOUxlIbs-KKCE', // Replace with your VAPID key
            serviceWorkerRegistration: registration
          });
          
          if (token) {
            setFcmToken(token);
            
            // Save token to user document
            await updateDoc(doc(db, 'users', user.uid), {
              fcmToken: token,
              updatedAt: new Date(),
            });
          }

          // Listen for foreground messages
          onMessage(messaging, (payload) => {
            console.log('Foreground message received:', payload);
            
            // Show notification
            if (payload.notification) {
              new Notification(payload.notification.title || 'SmartPedi', {
                body: payload.notification.body,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
              });
            }
          });
        }
      } catch (error) {
        console.error('Error initializing FCM:', error);
      }
    };

    initializeFCM();
  }, [user]);

  const sendTestNotification = async () => {
    if (!fcmToken) return;

    try {
      // This would typically be done from your backend
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: fcmToken,
          title: 'Test Notification',
          body: 'This is a test notification from SmartPedi',
        }),
      });

      if (response.ok) {
        console.log('Test notification sent successfully');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  return {
    fcmToken,
    permission,
    sendTestNotification,
  };
};