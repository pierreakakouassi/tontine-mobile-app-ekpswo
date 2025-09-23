
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { User, Tontine, Payment, Notification, CreateTontineData } from '../types';

// API Configuration - will be updated by productionService
let API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api' 
  : 'https://your-production-api.com/api';

const API_TIMEOUT = 15000; // 15 seconds for production

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private authToken: string | null = null;
  private isInitialized = false;

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      this.authToken = await SecureStore.getItemAsync('auth_token');
      this.isInitialized = true;
      console.log('Auth token initialized:', !!this.authToken);
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      this.isInitialized = true;
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

  private async waitForInitialization(): Promise<void> {
    while (!this.isInitialized) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  private async getHeaders(): Promise<Record<string, string>> {
    await this.waitForInitialization();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Client-Version': '1.0.0',
      'X-Platform': 'mobile',
      'X-App-Name': 'TontineApp',
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

      console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);

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
        console.error('❌ API Error:', response.status, data);
        
        // Handle specific error codes
        if (response.status === 401) {
          // Token expired, clear auth
          await this.logout();
          return {
            success: false,
            error: 'Session expirée, veuillez vous reconnecter',
          };
        }
        
        if (response.status === 403) {
          return {
            success: false,
            error: 'Accès non autorisé',
          };
        }
        
        if (response.status === 404) {
          return {
            success: false,
            error: 'Ressource non trouvée',
          };
        }
        
        if (response.status >= 500) {
          return {
            success: false,
            error: 'Erreur serveur, veuillez réessayer plus tard',
          };
        }
        
        return {
          success: false,
          error: data.message || data.error || `Erreur HTTP ${response.status}`,
        };
      }

      console.log('✅ API Success:', endpoint);
      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      console.error('🔥 Network error:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Délai d\'attente dépassé. Vérifiez votre connexion.',
          };
        }
        
        if (error.message.includes('Network request failed')) {
          return {
            success: false,
            error: 'Pas de connexion internet. Vérifiez votre réseau.',
          };
        }
        
        return {
          success: false,
          error: error.message,
        };
      }
      
      return {
        success: false,
        error: 'Erreur de connexion inconnue',
      };
    }
  }

  // Health check endpoint
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string; version: string }>> {
    return this.makeRequest('/health');
  }

  // Test connection with timeout
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing API connection...');
      const response = await this.healthCheck();
      console.log('🔍 Connection test result:', response.success);
      return response.success;
    } catch (error) {
      console.error('🔍 Connection test failed:', error);
      return false;
    }
  }

  // Authentication
  async login(phoneNumber: string): Promise<ApiResponse<{ otpSent: boolean; expiresIn: number }>> {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber }),
    });
  }

  async verifyOtp(phoneNumber: string, otp: string): Promise<ApiResponse<{ user: User; token: string; refreshToken: string }>> {
    const response = await this.makeRequest<{ user: User; token: string; refreshToken: string }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, otp }),
    });

    if (response.success && response.data) {
      this.authToken = response.data.token;
      await SecureStore.setItemAsync('auth_token', response.data.token);
      await SecureStore.setItemAsync('refresh_token', response.data.refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      console.log('✅ User authenticated and stored');
    }

    return response;
  }

  async refreshToken(): Promise<ApiResponse<{ token: string; refreshToken: string }>> {
    try {
      const refreshToken = await SecureStore.getItemAsync('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await this.makeRequest<{ token: string; refreshToken: string }>('/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${refreshToken}`,
        },
      });

      if (response.success && response.data) {
        this.authToken = response.data.token;
        await SecureStore.setItemAsync('auth_token', response.data.token);
        await SecureStore.setItemAsync('refresh_token', response.data.refreshToken);
        console.log('✅ Token refreshed successfully');
      }

      return response;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      return {
        success: false,
        error: 'Impossible de renouveler la session',
      };
    }
  }

  async logout(): Promise<void> {
    try {
      // Notify backend of logout
      if (this.authToken) {
        await this.makeRequest('/auth/logout', { method: 'POST' });
      }
      
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('refresh_token');
      await AsyncStorage.removeItem('user');
      this.authToken = null;
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('❌ Logout error:', error);
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

  async uploadProfilePicture(imageUri: string): Promise<ApiResponse<{ imageUrl: string }>> {
    const formData = new FormData();
    formData.append('profile_picture', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    } as any);

    return this.makeRequest('/user/profile-picture', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
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

  async generateInviteLink(tontineId: string): Promise<ApiResponse<{ inviteLink: string; inviteCode: string }>> {
    return this.makeRequest(`/tontines/${tontineId}/invite-link`, {
      method: 'POST',
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

  async getPaymentMethods(): Promise<ApiResponse<Array<{ id: string; name: string; enabled: boolean }>>> {
    return this.makeRequest('/payments/methods');
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

  async getSystemAnalytics(): Promise<ApiResponse<any>> {
    return this.makeRequest('/analytics/system');
  }

  // Admin endpoints (if user has admin role)
  async getSystemStats(): Promise<ApiResponse<any>> {
    return this.makeRequest('/admin/stats');
  }

  async getAllUsers(page = 1, limit = 50): Promise<ApiResponse<{ users: User[]; total: number; page: number }>> {
    return this.makeRequest(`/admin/users?page=${page}&limit=${limit}`);
  }

  async getAllTontines(page = 1, limit = 50): Promise<ApiResponse<{ tontines: Tontine[]; total: number; page: number }>> {
    return this.makeRequest(`/admin/tontines?page=${page}&limit=${limit}`);
  }

  async suspendUser(userId: string, reason: string): Promise<ApiResponse<void>> {
    return this.makeRequest(`/admin/users/${userId}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async unsuspendUser(userId: string): Promise<ApiResponse<void>> {
    return this.makeRequest(`/admin/users/${userId}/unsuspend`, {
      method: 'POST',
    });
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.authToken;
  }

  async getConnectionQuality(): Promise<'excellent' | 'good' | 'poor' | 'offline'> {
    try {
      const startTime = Date.now();
      const response = await this.healthCheck();
      const endTime = Date.now();
      const latency = endTime - startTime;

      if (!response.success) return 'offline';
      if (latency < 200) return 'excellent';
      if (latency < 500) return 'good';
      return 'poor';
    } catch (error) {
      return 'offline';
    }
  }

  // Configuration for production
  async validateApiConfiguration(): Promise<{
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check if using placeholder URL
    if (API_BASE_URL.includes('your-production-api.com')) {
      issues.push('API URL is still using placeholder');
      recommendations.push('Update API_BASE_URL to your actual production server');
    }

    // Check if using localhost in production
    if (!__DEV__ && API_BASE_URL.includes('localhost')) {
      issues.push('Using localhost URL in production build');
      recommendations.push('Use a public domain for production API');
    }

    // Check HTTPS in production
    if (!__DEV__ && !API_BASE_URL.startsWith('https://')) {
      issues.push('API URL is not using HTTPS in production');
      recommendations.push('Use HTTPS for secure communication');
    }

    // Test connection
    try {
      const isConnected = await this.testConnection();
      if (!isConnected) {
        issues.push('Cannot connect to API server');
        recommendations.push('Verify server is running and accessible');
      }
    } catch (error) {
      issues.push('API connection test failed');
      recommendations.push('Check network connectivity and server status');
    }

    return {
      isValid: issues.length === 0,
      issues,
      recommendations,
    };
  }
}

export const apiService = new ApiService();
