
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { 
  User, 
  Circle, 
  CircleMember, 
  Cycle, 
  Payment, 
  Payout, 
  Penalty, 
  Invite, 
  Event, 
  Notification,
  CreateCircleForm,
  JoinCircleForm,
  PaymentForm,
  ApiResponse
} from '../types';

// API Configuration - will be updated by productionService
let API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api' 
  : 'https://your-production-api.com/api';

const API_TIMEOUT = 15000; // 15 seconds for production

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

  // Authentication - OTP based
  async sendOtp(phone: string): Promise<ApiResponse<{ otp_sent: boolean; expires_in: number }>> {
    return this.makeRequest('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  }

  async verifyOtp(phone: string, otp: string): Promise<ApiResponse<{ user: User; token: string; refresh_token: string }>> {
    const response = await this.makeRequest<{ user: User; token: string; refresh_token: string }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    });

    if (response.success && response.data) {
      this.authToken = response.data.token;
      await SecureStore.setItemAsync('auth_token', response.data.token);
      await SecureStore.setItemAsync('refresh_token', response.data.refresh_token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      console.log('✅ User authenticated and stored');
    }

    return response;
  }

  async refreshToken(): Promise<ApiResponse<{ token: string; refresh_token: string }>> {
    try {
      const refreshToken = await SecureStore.getItemAsync('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await this.makeRequest<{ token: string; refresh_token: string }>('/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${refreshToken}`,
        },
      });

      if (response.success && response.data) {
        this.authToken = response.data.token;
        await SecureStore.setItemAsync('auth_token', response.data.token);
        await SecureStore.setItemAsync('refresh_token', response.data.refresh_token);
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
    return this.makeRequest('/users/profile');
  }

  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.makeRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async uploadAvatar(imageUri: string): Promise<ApiResponse<{ avatar_url: string }>> {
    const formData = new FormData();
    formData.append('avatar', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    } as any);

    return this.makeRequest('/users/avatar', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Circle Management
  async getUserCircles(): Promise<ApiResponse<Circle[]>> {
    return this.makeRequest('/circles');
  }

  async getCircleById(id: string): Promise<ApiResponse<Circle & { members: (CircleMember & { user: User })[] }>> {
    return this.makeRequest(`/circles/${id}`);
  }

  async createCircle(circleData: CreateCircleForm): Promise<ApiResponse<Circle>> {
    return this.makeRequest('/circles', {
      method: 'POST',
      body: JSON.stringify(circleData),
    });
  }

  async updateCircle(id: string, updates: Partial<Circle>): Promise<ApiResponse<Circle>> {
    return this.makeRequest(`/circles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteCircle(id: string): Promise<ApiResponse<void>> {
    return this.makeRequest(`/circles/${id}`, {
      method: 'DELETE',
    });
  }

  async joinCircle(circleId: string, inviteCode: string): Promise<ApiResponse<CircleMember>> {
    return this.makeRequest(`/circles/${circleId}/join`, {
      method: 'POST',
      body: JSON.stringify({ invite_code: inviteCode }),
    });
  }

  async leaveCircle(circleId: string): Promise<ApiResponse<void>> {
    return this.makeRequest(`/circles/${circleId}/leave`, {
      method: 'POST',
    });
  }

  async getCircleMembers(circleId: string): Promise<ApiResponse<(CircleMember & { user: User })[]>> {
    return this.makeRequest(`/circles/${circleId}/members`);
  }

  async updateMemberOrder(circleId: string, memberOrders: { member_id: string; order_index: number }[]): Promise<ApiResponse<void>> {
    return this.makeRequest(`/circles/${circleId}/member-order`, {
      method: 'PUT',
      body: JSON.stringify({ member_orders: memberOrders }),
    });
  }

  // Invitation Management
  async createInvite(circleId: string, channel: 'LINK' | 'WHATSAPP' | 'SMS'): Promise<ApiResponse<Invite>> {
    return this.makeRequest(`/circles/${circleId}/invites`, {
      method: 'POST',
      body: JSON.stringify({ channel }),
    });
  }

  async getCircleInvites(circleId: string): Promise<ApiResponse<Invite[]>> {
    return this.makeRequest(`/circles/${circleId}/invites`);
  }

  async sendWhatsAppInvite(circleId: string, phoneNumbers: string[]): Promise<ApiResponse<{ invites_sent: number }>> {
    return this.makeRequest(`/circles/${circleId}/invite-whatsapp`, {
      method: 'POST',
      body: JSON.stringify({ phone_numbers: phoneNumbers }),
    });
  }

  async sendSmsInvite(circleId: string, phoneNumbers: string[]): Promise<ApiResponse<{ invites_sent: number }>> {
    return this.makeRequest(`/circles/${circleId}/invite-sms`, {
      method: 'POST',
      body: JSON.stringify({ phone_numbers: phoneNumbers }),
    });
  }

  // Cycle Management
  async getCircleCycles(circleId: string): Promise<ApiResponse<Cycle[]>> {
    return this.makeRequest(`/circles/${circleId}/cycles`);
  }

  async getCurrentCycle(circleId: string): Promise<ApiResponse<Cycle>> {
    return this.makeRequest(`/circles/${circleId}/current-cycle`);
  }

  async startNextCycle(circleId: string): Promise<ApiResponse<Cycle>> {
    return this.makeRequest(`/circles/${circleId}/start-cycle`, {
      method: 'POST',
    });
  }

  // Payment Management
  async initiatePayment(paymentData: PaymentForm): Promise<ApiResponse<{ payment_url: string; tx_ref: string }>> {
    return this.makeRequest('/payments/initiate', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async verifyPayment(txRef: string): Promise<ApiResponse<Payment>> {
    return this.makeRequest(`/payments/verify/${txRef}`);
  }

  async getCirclePayments(circleId: string, cycleId?: string): Promise<ApiResponse<Payment[]>> {
    const endpoint = cycleId 
      ? `/circles/${circleId}/payments?cycle_id=${cycleId}`
      : `/circles/${circleId}/payments`;
    return this.makeRequest(endpoint);
  }

  async getUserPayments(): Promise<ApiResponse<Payment[]>> {
    return this.makeRequest('/payments/my-payments');
  }

  async recordCashPayment(circleId: string, cycleId: string, memberId: string, amount: number): Promise<ApiResponse<Payment>> {
    return this.makeRequest('/payments/cash', {
      method: 'POST',
      body: JSON.stringify({
        circle_id: circleId,
        cycle_id: cycleId,
        member_id: memberId,
        amount,
      }),
    });
  }

  // Payout Management
  async initiatePayout(circleId: string, cycleId: string, provider: 'ORANGE' | 'MTN' | 'WAVE'): Promise<ApiResponse<Payout>> {
    return this.makeRequest('/payouts/initiate', {
      method: 'POST',
      body: JSON.stringify({
        circle_id: circleId,
        cycle_id: cycleId,
        provider,
      }),
    });
  }

  async verifyPayout(txRef: string): Promise<ApiResponse<Payout>> {
    return this.makeRequest(`/payouts/verify/${txRef}`);
  }

  async getCirclePayouts(circleId: string): Promise<ApiResponse<Payout[]>> {
    return this.makeRequest(`/circles/${circleId}/payouts`);
  }

  // Penalty Management
  async createPenalty(paymentId: string, amount: number, reason: string): Promise<ApiResponse<Penalty>> {
    return this.makeRequest('/penalties', {
      method: 'POST',
      body: JSON.stringify({
        payment_id: paymentId,
        amount,
        reason,
      }),
    });
  }

  async getCirclePenalties(circleId: string): Promise<ApiResponse<Penalty[]>> {
    return this.makeRequest(`/circles/${circleId}/penalties`);
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

  // Events & Audit Log
  async getCircleEvents(circleId: string): Promise<ApiResponse<Event[]>> {
    return this.makeRequest(`/circles/${circleId}/events`);
  }

  // Analytics
  async getCircleAnalytics(circleId: string): Promise<ApiResponse<{
    total_collected: number;
    total_paid_out: number;
    completion_rate: number;
    average_payment_time: number;
    member_reliability_scores: { user_id: string; score: number }[];
  }>> {
    return this.makeRequest(`/circles/${circleId}/analytics`);
  }

  async getUserAnalytics(): Promise<ApiResponse<{
    total_circles: number;
    active_circles: number;
    total_contributed: number;
    total_received: number;
    reliability_score: number;
    payment_history: { on_time: number; late: number; missed: number };
  }>> {
    return this.makeRequest('/users/analytics');
  }

  // Push Notification Token
  async updatePushToken(token: string): Promise<ApiResponse<void>> {
    return this.makeRequest('/users/push-token', {
      method: 'PUT',
      body: JSON.stringify({ push_token: token }),
    });
  }

  // Payment Methods
  async getAvailablePaymentMethods(): Promise<ApiResponse<{
    id: string;
    name: string;
    provider: 'ORANGE' | 'MTN' | 'WAVE';
    enabled: boolean;
    fees: number;
  }[]>> {
    return this.makeRequest('/payments/methods');
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
