import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';

export const useMobileFeatures = () => {
  const [isNative, setIsNative] = useState(false);
  const [pushPermission, setPushPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());

    if (Capacitor.isNativePlatform()) {
      initializePushNotifications();
    }
  }, []);

  const initializePushNotifications = async () => {
    try {
      // Request permission for push notifications
      const permission = await PushNotifications.requestPermissions();
      setPushPermission(permission.receive);

      if (permission.receive === 'granted') {
        // Register for push notifications
        await PushNotifications.register();

        // Listen for registration
        PushNotifications.addListener('registration', (token) => {
          console.log('Push registration success, token: ' + token.value);
          // Send token to your server
        });

        // Listen for push notifications
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Push received: ', notification);
          // Handle foreground notification
        });

        // Listen for notification actions
        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('Push action performed: ', notification);
          // Handle notification tap
        });
      }
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  };

  const scheduleLocalNotification = async (title: string, body: string, scheduleAt?: Date) => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: Date.now(),
            schedule: scheduleAt ? { at: scheduleAt } : undefined,
            sound: 'beep.wav',
            attachments: undefined,
            actionTypeId: '',
            extra: null
          }
        ]
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  const checkNotificationPermissions = async () => {
    if (!Capacitor.isNativePlatform()) return 'granted';

    try {
      const permission = await LocalNotifications.checkPermissions();
      return permission.display;
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return 'denied';
    }
  };

  return {
    isNative,
    pushPermission,
    scheduleLocalNotification,
    checkNotificationPermissions,
  };
};