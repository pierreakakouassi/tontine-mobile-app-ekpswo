
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

  async sendOtp(phone: string): Promise<{ success: boolean; error?: string; expiresIn?: number }> {
    try {
      console.log('Sending OTP to:', phone);
      
      // Validate phone number format
      const phoneRegex = /^(\+225)?[0-9]{8,10}$/;
      if (!phoneRegex.test(phone)) {
        return { 
          success: false, 
          error: 'Numéro de téléphone invalide. Format attendu: +225XXXXXXXX ou XXXXXXXX' 
        };
      }

      // Normalize phone number (add +225 if not present)
      const normalizedPhone = phone.startsWith('+225') ? phone : `+225${phone}`;
      
      // In development, use mock OTP
      if (__DEV__) {
        console.log('Development mode: Mock OTP sent');
        return { success: true, expiresIn: 300 }; // 5 minutes
      }

      // In production, call the API to send real OTP
      const response = await apiService.sendOtp(normalizedPhone);
      
      if (response.success && response.data) {
        console.log('OTP sent successfully');
        return { 
          success: true, 
          expiresIn: response.data.expires_in 
        };
      } else {
        console.error('Failed to send OTP:', response.error);
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('OTP sending error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Échec de l\'envoi de l\'OTP' 
      };
    }
  }

  async verifyOtp(phone: string, otp: string): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      console.log('Verifying OTP for:', phone);
      
      this.updateState({ isLoading: true });

      // Validate OTP format
      if (!/^\d{4,6}$/.test(otp)) {
        this.updateState({ isLoading: false });
        return { success: false, error: 'Code OTP invalide. Doit contenir 4 à 6 chiffres.' };
      }

      // Normalize phone number
      const normalizedPhone = phone.startsWith('+225') ? phone : `+225${phone}`;

      // In development, accept any 4-digit OTP
      if (__DEV__ && otp.length >= 4) {
        const mockUser: User = {
          id: '1',
          phone: normalizedPhone,
          name: 'Utilisateur Test',
          reliability_score: 95,
          lang: 'fr',
          created_at: new Date().toISOString(),
        };

        await AsyncStorage.setItem('user', JSON.stringify(mockUser));
        await SecureStore.setItemAsync('auth_token', 'mock_token_' + Date.now());

        this.updateState({
          isAuthenticated: true,
          user: mockUser,
          isLoading: false,
        });

        console.log('Development mode: OTP verified with mock user');
        return { success: true, user: mockUser };
      }

      // In production, verify with API
      const response = await apiService.verifyOtp(normalizedPhone, otp);
      
      if (response.success && response.data) {
        this.updateState({
          isAuthenticated: true,
          user: response.data.user,
          isLoading: false,
        });
        console.log('OTP verified successfully');
        return { success: true, user: response.data.user };
      } else {
        this.updateState({ isLoading: false });
        console.error('OTP verification failed:', response.error);
        return { success: false, error: response.error || 'Code OTP invalide' };
      }
    } catch (error) {
      this.updateState({ isLoading: false });
      console.error('OTP verification error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Échec de la vérification' 
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
        return { success: false, error: 'Aucun utilisateur connecté' };
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
        error: error instanceof Error ? error.message : 'Échec de la mise à jour' 
      };
    }
  }

  async uploadAvatar(imageUri: string): Promise<{ success: boolean; error?: string; avatarUrl?: string }> {
    try {
      if (!this.currentState.user) {
        return { success: false, error: 'Aucun utilisateur connecté' };
      }

      const response = await apiService.uploadAvatar(imageUri);
      
      if (response.success && response.data) {
        const updatedUser = {
          ...this.currentState.user,
          avatar_url: response.data.avatar_url,
        };
        
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        
        this.updateState({
          user: updatedUser,
        });
        
        console.log('Avatar uploaded successfully');
        return { success: true, avatarUrl: response.data.avatar_url };
      } else {
        console.error('Failed to upload avatar:', response.error);
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Échec du téléchargement' 
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
  async sendInvitationSms(phoneNumbers: string[], circleName: string, inviteCode: string): Promise<{ success: boolean; error?: string }> {
    try {
      const isAvailable = await this.isSmsAvailable();
      if (!isAvailable) {
        return { success: false, error: 'SMS non disponible sur cet appareil' };
      }

      const message = `Vous êtes invité(e) à rejoindre la tontine "${circleName}". Code d'invitation: ${inviteCode}. Téléchargez l'app TontineApp pour participer!`;
      
      const result = await SMS.sendSMSAsync(phoneNumbers, message);
      
      if (result.result === 'sent') {
        console.log('Invitation SMS sent successfully');
        return { success: true };
      } else {
        console.log('SMS sending cancelled or failed');
        return { success: false, error: 'Échec de l\'envoi du SMS' };
      }
    } catch (error) {
      console.error('SMS sending error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Échec de l\'envoi du SMS' 
      };
    }
  }

  // Validate phone number format for Côte d'Ivoire
  validatePhoneNumber(phone: string): { isValid: boolean; error?: string; normalized?: string } {
    // Remove spaces and special characters
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    
    // Check for valid Côte d'Ivoire phone number patterns
    const patterns = [
      /^(\+225)?[0-9]{8}$/, // Standard 8-digit format
      /^(\+225)?[0-9]{10}$/, // 10-digit format with area code
    ];

    const isValid = patterns.some(pattern => pattern.test(cleaned));
    
    if (!isValid) {
      return {
        isValid: false,
        error: 'Format de numéro invalide. Utilisez le format: +225XXXXXXXX ou XXXXXXXX'
      };
    }

    // Normalize to international format
    const normalized = cleaned.startsWith('+225') ? cleaned : `+225${cleaned}`;
    
    return {
      isValid: true,
      normalized,
    };
  }

  // Get user reliability score details
  async getUserReliabilityDetails(): Promise<{
    score: number;
    factors: {
      on_time_payments: number;
      completed_circles: number;
      missed_payments: number;
      penalties: number;
    };
  }> {
    try {
      const response = await apiService.getUserAnalytics();
      
      if (response.success && response.data) {
        return {
          score: response.data.reliability_score,
          factors: {
            on_time_payments: response.data.payment_history.on_time,
            completed_circles: response.data.total_circles,
            missed_payments: response.data.payment_history.missed,
            penalties: response.data.payment_history.late,
          },
        };
      }
      
      // Fallback to current user score
      return {
        score: this.currentState.user?.reliability_score || 0,
        factors: {
          on_time_payments: 0,
          completed_circles: 0,
          missed_payments: 0,
          penalties: 0,
        },
      };
    } catch (error) {
      console.error('Failed to get reliability details:', error);
      return {
        score: this.currentState.user?.reliability_score || 0,
        factors: {
          on_time_payments: 0,
          completed_circles: 0,
          missed_payments: 0,
          penalties: 0,
        },
      };
    }
  }

  // Check if user needs to complete profile
  isProfileComplete(): boolean {
    const user = this.currentState.user;
    if (!user) return false;
    
    return !!(user.name && user.phone);
  }

  // Get user's preferred language
  getUserLanguage(): string {
    return this.currentState.user?.lang || 'fr';
  }

  // Update user language preference
  async updateLanguage(lang: string): Promise<{ success: boolean; error?: string }> {
    return this.updateUser({ lang });
  }
}

export const authService = new AuthService();
