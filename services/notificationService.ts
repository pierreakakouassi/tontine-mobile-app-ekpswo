
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from './apiService';
import { Notification } from '../types';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface LocalNotification {
  title: string;
  body: string;
  data?: any;
  trigger?: Notifications.NotificationTriggerInput;
}

class NotificationService {
  private pushToken: string | null = null;
  private listeners: ((notification: Notifications.Notification) => void)[] = [];

  async initialize(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Initializing notification service...');

      // Check if device supports notifications
      if (!Device.isDevice) {
        console.log('Notifications not supported on simulator');
        return { success: false, error: 'Notifications not supported on simulator' };
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permissions denied');
        return { success: false, error: 'Notification permissions denied' };
      }

      // Get push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-expo-project-id', // Replace with your actual project ID
      });
      
      this.pushToken = tokenData.data;
      console.log('Push token obtained:', this.pushToken);

      // Store token locally
      await AsyncStorage.setItem('push_token', this.pushToken);

      // Send token to backend
      if (!__DEV__) {
        await apiService.updatePushToken(this.pushToken);
      }

      // Set up notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('tontine-notifications', {
          name: 'Tontine Notifications',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF6600',
        });
      }

      // Set up notification listeners
      this.setupNotificationListeners();

      console.log('Notification service initialized successfully');
      return { success: true };
    } catch (error) {
      console.error('Notification initialization error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Initialization failed',
      };
    }
  }

  private setupNotificationListeners() {
    // Handle notifications received while app is in foreground
    Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
      this.listeners.forEach(listener => listener(notification));
    });

    // Handle notification taps
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification tapped:', response);
      this.handleNotificationTap(response.notification);
    });
  }

  private handleNotificationTap(notification: Notifications.Notification) {
    const data = notification.request.content.data;
    
    // Handle different notification types
    if (data?.type === 'payment_reminder' && data?.tontineId) {
      // Navigate to tontine payment screen
      console.log('Navigate to payment for tontine:', data.tontineId);
    } else if (data?.type === 'payout_received' && data?.tontineId) {
      // Navigate to tontine dashboard
      console.log('Navigate to tontine dashboard:', data.tontineId);
    }
  }

  async scheduleLocalNotification(notification: LocalNotification): Promise<{ success: boolean; notificationId?: string; error?: string }> {
    try {
      console.log('Scheduling local notification:', notification.title);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: true,
        },
        trigger: notification.trigger || null,
      });

      console.log('Local notification scheduled:', notificationId);
      return { success: true, notificationId };
    } catch (error) {
      console.error('Local notification scheduling error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Scheduling failed',
      };
    }
  }

  async schedulePaymentReminder(tontineId: string, tontineName: string, daysUntilDue: number): Promise<void> {
    try {
      const triggerDate = new Date();
      triggerDate.setDate(triggerDate.getDate() + daysUntilDue - 1); // Remind 1 day before
      triggerDate.setHours(9, 0, 0, 0); // 9 AM

      await this.scheduleLocalNotification({
        title: 'Rappel de paiement',
        body: `Votre cotisation pour "${tontineName}" est due demain`,
        data: {
          type: 'payment_reminder',
          tontineId,
        },
        trigger: {
          date: triggerDate,
        },
      });

      console.log('Payment reminder scheduled for tontine:', tontineName);
    } catch (error) {
      console.error('Failed to schedule payment reminder:', error);
    }
  }

  async scheduleOverdueNotification(tontineId: string, tontineName: string): Promise<void> {
    try {
      await this.scheduleLocalNotification({
        title: 'Paiement en retard',
        body: `Votre cotisation pour "${tontineName}" est en retard`,
        data: {
          type: 'payment_overdue',
          tontineId,
        },
        trigger: {
          seconds: 60, // Immediate notification
        },
      });

      console.log('Overdue notification scheduled for tontine:', tontineName);
    } catch (error) {
      console.error('Failed to schedule overdue notification:', error);
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('Notification cancelled:', notificationId);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }

  async getBadgeCount(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Failed to get badge count:', error);
      return 0;
    }
  }

  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Failed to set badge count:', error);
    }
  }

  onNotificationReceived(listener: (notification: Notifications.Notification) => void): () => void {
    this.listeners.push(listener);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  getPushToken(): string | null {
    return this.pushToken;
  }
}

export const notificationService = new NotificationService();
