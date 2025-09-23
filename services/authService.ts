
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as SMS from 'expo-sms';
import { User } from '../types';
import { apiService } from './apiService';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

class AuthService {
  private listeners: ((state: AuthState) => void)[] = [];
  private currentState: AuthState = {
    isAuthenticated: false,
    user: null,
    isLoading: true,
  };

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      console.log('Initializing authentication...');
      const userJson = await AsyncStorage.getItem('user');
      const token = await SecureStore.getItemAsync('auth_token');

      if (userJson && token) {
        const user = JSON.parse(userJson);
        this.updateState({
          isAuthenticated: true,
          user,
          isLoading: false,
        });
        console.log('User restored from storage:', user.name);
      } else {
        this.updateState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
        });
        console.log('No stored authentication found');
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      this.updateState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
    }
  }

  private updateState(newState: Partial<AuthState>) {
    this.currentState = { ...this.currentState, ...newState };
    this.listeners.forEach(listener => listener(this.currentState));
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    // Immediately call with current state
    listener(this.currentState);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  getState(): AuthState {
    return this.currentState;
  }

  async sendOtp(phoneNumber: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Sending OTP to:', phoneNumber);
      
      // In development, use mock OTP
      if (__DEV__) {
        console.log('Development mode: Mock OTP sent');
        return { success: true };
      }

      // In production, call the API to send real OTP
      const response = await apiService.login(phoneNumber);
      
      if (response.success) {
        console.log('OTP sent successfully');
        return { success: true };
      } else {
        console.error('Failed to send OTP:', response.error);
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('OTP sending error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send OTP' 
      };
    }
  }

  async verifyOtp(phoneNumber: string, otp: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Verifying OTP for:', phoneNumber);
      
      this.updateState({ isLoading: true });

      // In development, accept any 4-digit OTP
      if (__DEV__ && otp.length === 4) {
        const mockUser: User = {
          id: '1',
          phoneNumber,
          name: 'Utilisateur Test',
          reliabilityScore: 95,
          createdAt: new Date(),
        };

        await AsyncStorage.setItem('user', JSON.stringify(mockUser));
        await SecureStore.setItemAsync('auth_token', 'mock_token_' + Date.now());

        this.updateState({
          isAuthenticated: true,
          user: mockUser,
          isLoading: false,
        });

        console.log('Development mode: OTP verified with mock user');
        return { success: true };
      }

      // In production, verify with API
      const response = await apiService.verifyOtp(phoneNumber, otp);
      
      if (response.success && response.data) {
        this.updateState({
          isAuthenticated: true,
          user: response.data.user,
          isLoading: false,
        });
        console.log('OTP verified successfully');
        return { success: true };
      } else {
        this.updateState({ isLoading: false });
        console.error('OTP verification failed:', response.error);
        return { success: false, error: response.error || 'Invalid OTP' };
      }
    } catch (error) {
      this.updateState({ isLoading: false });
      console.error('OTP verification error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Verification failed' 
      };
    }
  }

  async logout(): Promise<void> {
    try {
      console.log('Logging out user...');
      await apiService.logout();
      
      this.updateState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
      
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async updateUser(userData: Partial<User>): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.currentState.user) {
        return { success: false, error: 'No user logged in' };
      }

      const response = await apiService.updateProfile(userData);
      
      if (response.success && response.data) {
        const updatedUser = response.data;
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        
        this.updateState({
          user: updatedUser,
        });
        
        console.log('User profile updated');
        return { success: true };
      } else {
        console.error('Failed to update profile:', response.error);
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Update failed' 
      };
    }
  }

  // Check if SMS is available on device
  async isSmsAvailable(): Promise<boolean> {
    try {
      return await SMS.isAvailableAsync();
    } catch (error) {
      console.error('SMS availability check failed:', error);
      return false;
    }
  }

  // Send invitation SMS
  async sendInvitationSms(phoneNumbers: string[], tontineName: string): Promise<{ success: boolean; error?: string }> {
    try {
      const isAvailable = await this.isSmsAvailable();
      if (!isAvailable) {
        return { success: false, error: 'SMS not available on this device' };
      }

      const message = `Vous êtes invité(e) à rejoindre la tontine "${tontineName}". Téléchargez l'app TontineApp pour participer!`;
      
      const result = await SMS.sendSMSAsync(phoneNumbers, message);
      
      if (result.result === 'sent') {
        console.log('Invitation SMS sent successfully');
        return { success: true };
      } else {
        console.log('SMS sending cancelled or failed');
        return { success: false, error: 'SMS sending failed' };
      }
    } catch (error) {
      console.error('SMS sending error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send SMS' 
      };
    }
  }
}

export const authService = new AuthService();
