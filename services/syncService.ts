
import { apiService } from './apiService';
import { storageService } from './storageService';
import { notificationService } from './notificationService';
import { User, Tontine, Payment, Notification } from '../types';

export interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  isSyncing: boolean;
  pendingChanges: number;
}

class SyncService {
  private syncListeners: ((status: SyncStatus) => void)[] = [];
  private currentStatus: SyncStatus = {
    isOnline: true,
    lastSync: null,
    isSyncing: false,
    pendingChanges: 0,
  };

  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeSync();
  }

  private async initializeSync() {
    try {
      // Get last sync time
      const lastSyncResult = await storageService.getLastSync();
      if (lastSyncResult.success && lastSyncResult.data) {
        this.currentStatus.lastSync = new Date(lastSyncResult.data);
      }

      // Start periodic sync
      this.startPeriodicSync();

      console.log('Sync service initialized');
    } catch (error) {
      console.error('Sync initialization failed:', error);
    }
  }

  private startPeriodicSync() {
    // Sync every 5 minutes
    this.syncInterval = setInterval(() => {
      this.performSync();
    }, 5 * 60 * 1000);

    // Initial sync
    setTimeout(() => this.performSync(), 1000);
  }

  private updateStatus(updates: Partial<SyncStatus>) {
    this.currentStatus = { ...this.currentStatus, ...updates };
    this.syncListeners.forEach(listener => listener(this.currentStatus));
  }

  async performSync(force: boolean = false): Promise<{ success: boolean; error?: string }> {
    if (this.currentStatus.isSyncing && !force) {
      console.log('Sync already in progress');
      return { success: false, error: 'Sync already in progress' };
    }

    try {
      console.log('Starting data sync...');
      this.updateStatus({ isSyncing: true });

      // Check network connectivity
      const isOnline = await this.checkConnectivity();
      this.updateStatus({ isOnline });

      if (!isOnline) {
        console.log('Device is offline, skipping sync');
        this.updateStatus({ isSyncing: false });
        return { success: false, error: 'Device is offline' };
      }

      // Sync user data
      await this.syncUserData();

      // Sync tontines
      await this.syncTontines();

      // Sync payments
      await this.syncPayments();

      // Sync notifications
      await this.syncNotifications();

      // Update last sync time
      await storageService.updateLastSync();
      this.updateStatus({ 
        lastSync: new Date(),
        isSyncing: false,
        pendingChanges: 0,
      });

      console.log('Data sync completed successfully');
      return { success: true };
    } catch (error) {
      console.error('Sync failed:', error);
      this.updateStatus({ isSyncing: false });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sync failed',
      };
    }
  }

  private async checkConnectivity(): Promise<boolean> {
    try {
      // Simple connectivity check
      const response = await fetch('https://www.google.com', {
        method: 'HEAD',
        timeout: 5000,
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private async syncUserData(): Promise<void> {
    try {
      console.log('Syncing user data...');
      
      const response = await apiService.getCurrentUser();
      if (response.success && response.data) {
        await storageService.storeUser(response.data);
        console.log('User data synced');
      }
    } catch (error) {
      console.error('User data sync failed:', error);
    }
  }

  private async syncTontines(): Promise<void> {
    try {
      console.log('Syncing tontines...');
      
      const response = await apiService.getUserTontines();
      if (response.success && response.data) {
        await storageService.storeTontines(response.data);
        
        // Schedule payment reminders for active tontines
        for (const tontine of response.data) {
          if (tontine.status === 'active' && tontine.nextPaymentDate) {
            const daysUntilDue = Math.ceil(
              (new Date(tontine.nextPaymentDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );
            
            if (daysUntilDue > 0 && daysUntilDue <= 3) {
              await notificationService.schedulePaymentReminder(
                tontine.id,
                tontine.name,
                daysUntilDue
              );
            }
          }
        }
        
        console.log('Tontines synced');
      }
    } catch (error) {
      console.error('Tontines sync failed:', error);
    }
  }

  private async syncPayments(): Promise<void> {
    try {
      console.log('Syncing payments...');
      
      const response = await apiService.getPaymentHistory();
      if (response.success && response.data) {
        await storageService.storePayments(response.data);
        console.log('Payments synced');
      }
    } catch (error) {
      console.error('Payments sync failed:', error);
    }
  }

  private async syncNotifications(): Promise<void> {
    try {
      console.log('Syncing notifications...');
      
      const response = await apiService.getNotifications();
      if (response.success && response.data) {
        await storageService.storeNotifications(response.data);
        
        // Update badge count
        const unreadCount = response.data.filter(n => !n.isRead).length;
        await notificationService.setBadgeCount(unreadCount);
        
        console.log('Notifications synced');
      }
    } catch (error) {
      console.error('Notifications sync failed:', error);
    }
  }

  async forceSyncTontine(tontineId: string): Promise<{ success: boolean; tontine?: Tontine; error?: string }> {
    try {
      console.log('Force syncing tontine:', tontineId);
      
      const response = await apiService.getTontineById(tontineId);
      if (response.success && response.data) {
        // Update local storage
        const tontinesResult = await storageService.getTontines();
        if (tontinesResult.success && tontinesResult.data) {
          const updatedTontines = tontinesResult.data.map(t => 
            t.id === tontineId ? response.data! : t
          );
          await storageService.storeTontines(updatedTontines);
        }
        
        console.log('Tontine force synced successfully');
        return { success: true, tontine: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Force sync tontine failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Force sync failed',
      };
    }
  }

  getStatus(): SyncStatus {
    return this.currentStatus;
  }

  onStatusChange(listener: (status: SyncStatus) => void): () => void {
    this.syncListeners.push(listener);
    
    // Immediately call with current status
    listener(this.currentStatus);
    
    return () => {
      const index = this.syncListeners.indexOf(listener);
      if (index > -1) {
        this.syncListeners.splice(index, 1);
      }
    };
  }

  async getOfflineData(): Promise<{
    tontines: Tontine[];
    payments: Payment[];
    notifications: Notification[];
  }> {
    try {
      const [tontinesResult, paymentsResult, notificationsResult] = await Promise.all([
        storageService.getTontines(),
        storageService.getPayments(),
        storageService.getNotifications(),
      ]);

      return {
        tontines: tontinesResult.data || [],
        payments: paymentsResult.data || [],
        notifications: notificationsResult.data || [],
      };
    } catch (error) {
      console.error('Failed to get offline data:', error);
      return {
        tontines: [],
        payments: [],
        notifications: [],
      };
    }
  }

  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.syncListeners = [];
    console.log('Sync service destroyed');
  }
}

export const syncService = new SyncService();
