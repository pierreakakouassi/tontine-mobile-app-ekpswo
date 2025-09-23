
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { User, Tontine, Payment, Notification } from '../types';

export interface StorageKeys {
  USER: 'user';
  TONTINES: 'tontines';
  PAYMENTS: 'payments';
  NOTIFICATIONS: 'notifications';
  SETTINGS: 'settings';
  LAST_SYNC: 'last_sync';
}

const STORAGE_KEYS: StorageKeys = {
  USER: 'user',
  TONTINES: 'tontines',
  PAYMENTS: 'payments',
  NOTIFICATIONS: 'notifications',
  SETTINGS: 'settings',
  LAST_SYNC: 'last_sync',
};

class StorageService {
  private encryptionKey: string | null = null;

  constructor() {
    this.initializeEncryption();
  }

  private async initializeEncryption() {
    try {
      let key = await SecureStore.getItemAsync('encryption_key');
      
      if (!key) {
        // Generate new encryption key
        key = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          `tontine_app_${Date.now()}_${Math.random()}`,
          { encoding: Crypto.CryptoEncoding.HEX }
        );
        
        await SecureStore.setItemAsync('encryption_key', key);
        console.log('New encryption key generated');
      }
      
      this.encryptionKey = key;
      console.log('Encryption initialized');
    } catch (error) {
      console.error('Encryption initialization failed:', error);
    }
  }

  private async encryptData(data: string): Promise<string> {
    try {
      if (!this.encryptionKey) {
        console.warn('Encryption key not available, storing data unencrypted');
        return data;
      }

      // Simple encryption using base64 encoding with key
      const combined = `${this.encryptionKey}:${data}`;
      const encrypted = Buffer.from(combined).toString('base64');
      return encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      return data; // Fallback to unencrypted
    }
  }

  private async decryptData(encryptedData: string): Promise<string> {
    try {
      if (!this.encryptionKey) {
        console.warn('Encryption key not available, assuming data is unencrypted');
        return encryptedData;
      }

      // Simple decryption
      const decoded = Buffer.from(encryptedData, 'base64').toString();
      const keyPrefix = `${this.encryptionKey}:`;
      
      if (decoded.startsWith(keyPrefix)) {
        return decoded.substring(keyPrefix.length);
      } else {
        // Data might be unencrypted
        return encryptedData;
      }
    } catch (error) {
      console.error('Decryption failed:', error);
      return encryptedData; // Fallback to original data
    }
  }

  // Generic storage methods
  async storeData<T>(key: string, data: T, encrypt: boolean = false): Promise<{ success: boolean; error?: string }> {
    try {
      const jsonData = JSON.stringify(data);
      const finalData = encrypt ? await this.encryptData(jsonData) : jsonData;
      
      await AsyncStorage.setItem(key, finalData);
      console.log(`Data stored successfully: ${key}`);
      
      return { success: true };
    } catch (error) {
      console.error(`Failed to store data for key ${key}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Storage failed',
      };
    }
  }

  async retrieveData<T>(key: string, decrypt: boolean = false): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      const storedData = await AsyncStorage.getItem(key);
      
      if (storedData === null) {
        return { success: false, error: 'Data not found' };
      }

      const finalData = decrypt ? await this.decryptData(storedData) : storedData;
      const parsedData = JSON.parse(finalData) as T;
      
      console.log(`Data retrieved successfully: ${key}`);
      return { success: true, data: parsedData };
    } catch (error) {
      console.error(`Failed to retrieve data for key ${key}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Retrieval failed',
      };
    }
  }

  async removeData(key: string): Promise<{ success: boolean; error?: string }> {
    try {
      await AsyncStorage.removeItem(key);
      console.log(`Data removed successfully: ${key}`);
      return { success: true };
    } catch (error) {
      console.error(`Failed to remove data for key ${key}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Removal failed',
      };
    }
  }

  // Specific data type methods
  async storeUser(user: User): Promise<{ success: boolean; error?: string }> {
    return this.storeData(STORAGE_KEYS.USER, user, true);
  }

  async getUser(): Promise<{ success: boolean; data?: User; error?: string }> {
    return this.retrieveData<User>(STORAGE_KEYS.USER, true);
  }

  async storeTontines(tontines: Tontine[]): Promise<{ success: boolean; error?: string }> {
    return this.storeData(STORAGE_KEYS.TONTINES, tontines, true);
  }

  async getTontines(): Promise<{ success: boolean; data?: Tontine[]; error?: string }> {
    return this.retrieveData<Tontine[]>(STORAGE_KEYS.TONTINES, true);
  }

  async storePayments(payments: Payment[]): Promise<{ success: boolean; error?: string }> {
    return this.storeData(STORAGE_KEYS.PAYMENTS, payments, true);
  }

  async getPayments(): Promise<{ success: boolean; data?: Payment[]; error?: string }> {
    return this.retrieveData<Payment[]>(STORAGE_KEYS.PAYMENTS, true);
  }

  async storeNotifications(notifications: Notification[]): Promise<{ success: boolean; error?: string }> {
    return this.storeData(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }

  async getNotifications(): Promise<{ success: boolean; data?: Notification[]; error?: string }> {
    return this.retrieveData<Notification[]>(STORAGE_KEYS.NOTIFICATIONS);
  }

  async storeSettings(settings: Record<string, any>): Promise<{ success: boolean; error?: string }> {
    return this.storeData(STORAGE_KEYS.SETTINGS, settings);
  }

  async getSettings(): Promise<{ success: boolean; data?: Record<string, any>; error?: string }> {
    return this.retrieveData<Record<string, any>>(STORAGE_KEYS.SETTINGS);
  }

  async updateLastSync(): Promise<{ success: boolean; error?: string }> {
    return this.storeData(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
  }

  async getLastSync(): Promise<{ success: boolean; data?: string; error?: string }> {
    return this.retrieveData<string>(STORAGE_KEYS.LAST_SYNC);
  }

  // Utility methods
  async clearAllData(): Promise<{ success: boolean; error?: string }> {
    try {
      await AsyncStorage.clear();
      console.log('All local data cleared');
      return { success: true };
    } catch (error) {
      console.error('Failed to clear all data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Clear failed',
      };
    }
  }

  async getStorageSize(): Promise<{ success: boolean; size?: number; error?: string }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;

      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }

      console.log(`Total storage size: ${totalSize} bytes`);
      return { success: true, size: totalSize };
    } catch (error) {
      console.error('Failed to calculate storage size:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Size calculation failed',
      };
    }
  }

  async exportData(): Promise<{ success: boolean; data?: string; error?: string }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const exportData: Record<string, any> = {};

      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          try {
            exportData[key] = JSON.parse(value);
          } catch {
            exportData[key] = value;
          }
        }
      }

      const exportString = JSON.stringify(exportData, null, 2);
      console.log('Data exported successfully');
      
      return { success: true, data: exportString };
    } catch (error) {
      console.error('Failed to export data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Export failed',
      };
    }
  }
}

export const storageService = new StorageService();
