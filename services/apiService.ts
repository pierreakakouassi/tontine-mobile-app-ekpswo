
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { User, Tontine, Payment, Notification, CreateTontineData } from '../types';

// API Configuration
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api' 
  : 'https://your-production-api.com/api';

const API_TIMEOUT = 10000; // 10 seconds

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private authToken: string | null = null;

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      this.authToken = await SecureStore.getItemAsync('auth_token');
      console.log('Auth token initialized:', !!this.authToken);
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    }
  }

  private async getHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const headers = await this.getHeaders();

      console.log(`Making API request to: ${url}`);

      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
        timeout: API_TIMEOUT,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('API Error:', response.status, data);
        return {
          success: false,
          error: data.message || `HTTP ${response.status}`,
        };
      }

      console.log('API Success:', endpoint);
      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      console.error('Network error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Authentication
  async login(phoneNumber: string): Promise<ApiResponse<{ otpSent: boolean }>> {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber }),
    });
  }

  async verifyOtp(phoneNumber: string, otp: string): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.makeRequest<{ user: User; token: string }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, otp }),
    });

    if (response.success && response.data) {
      this.authToken = response.data.token;
      await SecureStore.setItemAsync('auth_token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      console.log('User authenticated and stored');
    }

    return response;
  }

  async logout(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync('auth_token');
      await AsyncStorage.removeItem('user');
      this.authToken = null;
      console.log('User logged out');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // User Management
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.makeRequest('/user/profile');
  }

  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.makeRequest('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Tontine Management
  async getUserTontines(): Promise<ApiResponse<Tontine[]>> {
    return this.makeRequest('/tontines');
  }

  async getTontineById(id: string): Promise<ApiResponse<Tontine>> {
    return this.makeRequest(`/tontines/${id}`);
  }

  async createTontine(tontineData: CreateTontineData): Promise<ApiResponse<Tontine>> {
    return this.makeRequest('/tontines', {
      method: 'POST',
      body: JSON.stringify(tontineData),
    });
  }

  async joinTontine(tontineId: string, inviteCode?: string): Promise<ApiResponse<Tontine>> {
    return this.makeRequest(`/tontines/${tontineId}/join`, {
      method: 'POST',
      body: JSON.stringify({ inviteCode }),
    });
  }

  async inviteToTontine(tontineId: string, phoneNumbers: string[]): Promise<ApiResponse<{ invitesSent: number }>> {
    return this.makeRequest(`/tontines/${tontineId}/invite`, {
      method: 'POST',
      body: JSON.stringify({ phoneNumbers }),
    });
  }

  // Payment Management
  async initiatePayment(tontineId: string, paymentMethod: 'orange' | 'mtn' | 'wave'): Promise<ApiResponse<{ paymentUrl: string; transactionId: string }>> {
    return this.makeRequest('/payments/initiate', {
      method: 'POST',
      body: JSON.stringify({ tontineId, paymentMethod }),
    });
  }

  async verifyPayment(transactionId: string): Promise<ApiResponse<Payment>> {
    return this.makeRequest(`/payments/verify/${transactionId}`);
  }

  async getPaymentHistory(tontineId?: string): Promise<ApiResponse<Payment[]>> {
    const endpoint = tontineId ? `/payments?tontineId=${tontineId}` : '/payments';
    return this.makeRequest(endpoint);
  }

  // Notifications
  async getNotifications(): Promise<ApiResponse<Notification[]>> {
    return this.makeRequest('/notifications');
  }

  async markNotificationRead(notificationId: string): Promise<ApiResponse<void>> {
    return this.makeRequest(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsRead(): Promise<ApiResponse<void>> {
    return this.makeRequest('/notifications/read-all', {
      method: 'PUT',
    });
  }

  // Push Notification Token
  async updatePushToken(token: string): Promise<ApiResponse<void>> {
    return this.makeRequest('/user/push-token', {
      method: 'PUT',
      body: JSON.stringify({ pushToken: token }),
    });
  }
}

export const apiService = new ApiService();
