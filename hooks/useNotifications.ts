
import { useState, useEffect } from 'react';
import { notificationService, LocalNotification } from '../services/notificationService';
import * as Notifications from 'expo-notifications';

export function useNotifications() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [badgeCount, setBadgeCount] = useState(0);

  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    try {
      console.log('Initializing notifications via hook');
      
      const result = await notificationService.initialize();
      if (result.success) {
        setIsInitialized(true);
        setPushToken(notificationService.getPushToken());
        
        // Get initial badge count
        const count = await notificationService.getBadgeCount();
        setBadgeCount(count);
        
        console.log('Notifications initialized successfully');
      } else {
        console.error('Notification initialization failed:', result.error);
      }
    } catch (error) {
      console.error('Notification initialization error:', error);
    }
  };

  const scheduleNotification = async (notification: LocalNotification) => {
    console.log('Scheduling notification via hook:', notification.title);
    return notificationService.scheduleLocalNotification(notification);
  };

  const schedulePaymentReminder = async (tontineId: string, tontineName: string, daysUntilDue: number) => {
    console.log('Scheduling payment reminder via hook:', tontineName);
    return notificationService.schedulePaymentReminder(tontineId, tontineName, daysUntilDue);
  };

  const scheduleOverdueNotification = async (tontineId: string, tontineName: string) => {
    console.log('Scheduling overdue notification via hook:', tontineName);
    return notificationService.scheduleOverdueNotification(tontineId, tontineName);
  };

  const updateBadgeCount = async (count: number) => {
    await notificationService.setBadgeCount(count);
    setBadgeCount(count);
  };

  const cancelNotification = async (notificationId: string) => {
    console.log('Cancelling notification via hook:', notificationId);
    return notificationService.cancelNotification(notificationId);
  };

  const cancelAllNotifications = async () => {
    console.log('Cancelling all notifications via hook');
    return notificationService.cancelAllNotifications();
  };

  // Set up notification listener
  useEffect(() => {
    if (!isInitialized) return;

    const unsubscribe = notificationService.onNotificationReceived((notification) => {
      console.log('Notification received via hook:', notification.request.content.title);
      // Handle notification received while app is open
    });

    return unsubscribe;
  }, [isInitialized]);

  return {
    isInitialized,
    pushToken,
    badgeCount,
    scheduleNotification,
    schedulePaymentReminder,
    scheduleOverdueNotification,
    updateBadgeCount,
    cancelNotification,
    cancelAllNotifications,
  };
}
