
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { User, Tontine, Payment, Notification, CreateTontineData } from '../types';

// API Configuration - will be updated by productionService
let API_BASE_URL = __DEV__ 
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

  // Allow production service to update the API base URL
  updateApiBaseUrl(url: string) {
    API_BASE_URL = url;
    console.log('API Base URL updated to:', url);
  }

  getApiBaseUrl(): string {
    return API_BASE_URL;
  }

  private async getHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Client-Version': '1.0.0',
      'X-Platform': 'mobile',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    // Add environment header for backend routing
    headers['X-Environment'] = __DEV__ ? 'development' : 'production';

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

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        console.error('API Error:', response.status, data);
        
        // Handle specific error codes
        if (response.status === 401) {
          // Token expired, clear auth
          await this.logout();
          return {
            success: false,
            error: 'Session expirée, veuillez vous reconnecter',
          };
        }
        
        return {
          success: false,
          error: data.message || data.error || `HTTP ${response.status}`,
        };
      }

      console.log('API Success:', endpoint);
      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      console.error('Network error:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Délai d\'attente dépassé',
          };
        }
        
        return {
          success: false,
          error: error.message,
        };
      }
      
      return {
        success: false,
        error: 'Erreur de connexion',
      };
    }
  }

  // Health check endpoint
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.makeRequest('/health');
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

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    const response = await this.makeRequest<{ token: string }>('/auth/refresh', {
      method: 'POST',
    });

    if (response.success && response.data) {
      this.authToken = response.data.token;
      await SecureStore.setItemAsync('auth_token', response.data.token);
      console.log('Token refreshed');
    }

    return response;
  }

  async logout(): Promise<void> {
    try {
      // Notify backend of logout
      if (this.authToken) {
        await this.makeRequest('/auth/logout', { method: 'POST' });
      }
      
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

  async deleteAccount(): Promise<ApiResponse<void>> {
    return this.makeRequest('/user/account', {
      method: 'DELETE',
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

  async updateTontine(id: string, updates: Partial<Tontine>): Promise<ApiResponse<Tontine>> {
    return this.makeRequest(`/tontines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteTontine(id: string): Promise<ApiResponse<void>> {
    return this.makeRequest(`/tontines/${id}`, {
      method: 'DELETE',
    });
  }

  async joinTontine(tontineId: string, inviteCode?: string): Promise<ApiResponse<Tontine>> {
    return this.makeRequest(`/tontines/${tontineId}/join`, {
      method: 'POST',
      body: JSON.stringify({ inviteCode }),
    });
  }

  async leaveTontine(tontineId: string): Promise<ApiResponse<void>> {
    return this.makeRequest(`/tontines/${tontineId}/leave`, {
      method: 'POST',
    });
  }

  async inviteToTontine(tontineId: string, phoneNumbers: string[]): Promise<ApiResponse<{ invitesSent: number }>> {
    return this.makeRequest(`/tontines/${tontineId}/invite`, {
      method: 'POST',
      body: JSON.stringify({ phoneNumbers }),
    });
  }

  async getTontineMembers(tontineId: string): Promise<ApiResponse<User[]>> {
    return this.makeRequest(`/tontines/${tontineId}/members`);
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

  async cancelPayment(transactionId: string): Promise<ApiResponse<void>> {
    return this.makeRequest(`/payments/${transactionId}/cancel`, {
      method: 'POST',
    });
  }

  async refundPayment(transactionId: string, reason: string): Promise<ApiResponse<void>> {
    return this.makeRequest(`/payments/${transactionId}/refund`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
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

  async deleteNotification(notificationId: string): Promise<ApiResponse<void>> {
    return this.makeRequest(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  }

  // Push Notification Token
  async updatePushToken(token: string): Promise<ApiResponse<void>> {
    return this.makeRequest('/user/push-token', {
      method: 'PUT',
      body: JSON.stringify({ pushToken: token }),
    });
  }

  // Analytics and Reporting
  async getTontineAnalytics(tontineId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/tontines/${tontineId}/analytics`);
  }

  async getUserAnalytics(): Promise<ApiResponse<any>> {
    return this.makeRequest('/user/analytics');
  }

  // Admin endpoints (if user has admin role)
  async getSystemStats(): Promise<ApiResponse<any>> {
    return this.makeRequest('/admin/stats');
  }

  async getAllUsers(): Promise<ApiResponse<User[]>> {
    return this.makeRequest('/admin/users');
  }

  async getAllTontines(): Promise<ApiResponse<Tontine[]>> {
    return this.makeRequest('/admin/tontines');
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.authToken;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.healthCheck();
      return response.success;
    } catch (error) {
      return false;
    }
  }
}

export const apiService = new ApiService();
