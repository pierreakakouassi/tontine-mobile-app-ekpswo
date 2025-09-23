
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { apiService } from './apiService';
import { notificationService } from './notificationService';
import { paymentService } from './paymentService';

export interface ProductionConfig {
  apiBaseUrl: string;
  environment: 'development' | 'staging' | 'production';
  paymentProviders: {
    orange: {
      enabled: boolean;
      clientId?: string;
      sandboxMode: boolean;
    };
    mtn: {
      enabled: boolean;
      subscriptionKey?: string;
      sandboxMode: boolean;
    };
    wave: {
      enabled: boolean;
      apiKey?: string;
      sandboxMode: boolean;
    };
  };
  notifications: {
    pushEnabled: boolean;
    firebaseProjectId?: string;
    expoPushToken?: string;
  };
  security: {
    encryptionEnabled: boolean;
    auditLogsEnabled: boolean;
    rateLimitingEnabled: boolean;
  };
  monitoring: {
    crashReportingEnabled: boolean;
    analyticsEnabled: boolean;
    performanceMonitoringEnabled: boolean;
  };
}

const DEFAULT_CONFIG: ProductionConfig = {
  apiBaseUrl: __DEV__ ? 'http://localhost:3000/api' : 'https://your-production-api.com/api',
  environment: __DEV__ ? 'development' : 'production',
  paymentProviders: {
    orange: {
      enabled: false,
      sandboxMode: true,
    },
    mtn: {
      enabled: false,
      sandboxMode: true,
    },
    wave: {
      enabled: false,
      sandboxMode: true,
    },
  },
  notifications: {
    pushEnabled: false,
  },
  security: {
    encryptionEnabled: true,
    auditLogsEnabled: true,
    rateLimitingEnabled: true,
  },
  monitoring: {
    crashReportingEnabled: false,
    analyticsEnabled: false,
    performanceMonitoringEnabled: false,
  },
};

class ProductionService {
  private config: ProductionConfig = DEFAULT_CONFIG;
  private configLoaded = false;

  async initialize(): Promise<void> {
    try {
      console.log('Initializing production service...');
      await this.loadConfig();
      await this.validateConfig();
      console.log('Production service initialized');
    } catch (error) {
      console.error('Failed to initialize production service:', error);
    }
  }

  private async loadConfig(): Promise<void> {
    try {
      const storedConfig = await AsyncStorage.getItem('production_config');
      if (storedConfig) {
        this.config = { ...DEFAULT_CONFIG, ...JSON.parse(storedConfig) };
      }
      this.configLoaded = true;
      console.log('Production config loaded:', this.config.environment);
    } catch (error) {
      console.error('Failed to load production config:', error);
      this.config = DEFAULT_CONFIG;
    }
  }

  private async validateConfig(): Promise<void> {
    const issues: string[] = [];

    // Validate API URL
    if (!this.config.apiBaseUrl || this.config.apiBaseUrl.includes('your-production-api.com')) {
      issues.push('API Base URL not configured for production');
    }

    // Validate payment providers
    const enabledProviders = Object.values(this.config.paymentProviders).filter(p => p.enabled);
    if (enabledProviders.length === 0) {
      issues.push('No payment providers enabled');
    }

    // Validate production environment settings
    if (this.config.environment === 'production') {
      if (this.config.paymentProviders.orange.enabled && this.config.paymentProviders.orange.sandboxMode) {
        issues.push('Orange Money still in sandbox mode for production');
      }
      if (this.config.paymentProviders.mtn.enabled && this.config.paymentProviders.mtn.sandboxMode) {
        issues.push('MTN MoMo still in sandbox mode for production');
      }
      if (this.config.paymentProviders.wave.enabled && this.config.paymentProviders.wave.sandboxMode) {
        issues.push('Wave still in sandbox mode for production');
      }
    }

    if (issues.length > 0) {
      console.warn('Production config validation issues:', issues);
    }
  }

  async updateConfig(updates: Partial<ProductionConfig>): Promise<void> {
    try {
      this.config = { ...this.config, ...updates };
      await AsyncStorage.setItem('production_config', JSON.stringify(this.config));
      console.log('Production config updated');
    } catch (error) {
      console.error('Failed to update production config:', error);
      throw error;
    }
  }

  getConfig(): ProductionConfig {
    return { ...this.config };
  }

  isProduction(): boolean {
    return this.config.environment === 'production';
  }

  isStaging(): boolean {
    return this.config.environment === 'staging';
  }

  isDevelopment(): boolean {
    return this.config.environment === 'development';
  }

  // API Configuration
  getApiBaseUrl(): string {
    return this.config.apiBaseUrl;
  }

  async setApiBaseUrl(url: string): Promise<void> {
    await this.updateConfig({ apiBaseUrl: url });
  }

  // Payment Provider Configuration
  async configureOrangeMoney(clientId: string, sandboxMode = false): Promise<void> {
    await SecureStore.setItemAsync('orange_client_id', clientId);
    await this.updateConfig({
      paymentProviders: {
        ...this.config.paymentProviders,
        orange: {
          enabled: true,
          clientId,
          sandboxMode,
        },
      },
    });
    console.log('Orange Money configured');
  }

  async configureMtnMomo(subscriptionKey: string, sandboxMode = false): Promise<void> {
    await SecureStore.setItemAsync('mtn_subscription_key', subscriptionKey);
    await this.updateConfig({
      paymentProviders: {
        ...this.config.paymentProviders,
        mtn: {
          enabled: true,
          subscriptionKey,
          sandboxMode,
        },
      },
    });
    console.log('MTN MoMo configured');
  }

  async configureWave(apiKey: string, sandboxMode = false): Promise<void> {
    await SecureStore.setItemAsync('wave_api_key', apiKey);
    await this.updateConfig({
      paymentProviders: {
        ...this.config.paymentProviders,
        wave: {
          enabled: true,
          apiKey,
          sandboxMode,
        },
      },
    });
    console.log('Wave configured');
  }

  // Notification Configuration
  async configureNotifications(firebaseProjectId?: string): Promise<void> {
    await this.updateConfig({
      notifications: {
        ...this.config.notifications,
        pushEnabled: true,
        firebaseProjectId,
      },
    });
    console.log('Notifications configured');
  }

  // Security Configuration
  async enableSecurity(options: Partial<ProductionConfig['security']>): Promise<void> {
    await this.updateConfig({
      security: {
        ...this.config.security,
        ...options,
      },
    });
    console.log('Security settings updated');
  }

  // Monitoring Configuration
  async enableMonitoring(options: Partial<ProductionConfig['monitoring']>): Promise<void> {
    await this.updateConfig({
      monitoring: {
        ...this.config.monitoring,
        ...options,
      },
    });
    console.log('Monitoring settings updated');
  }

  // Environment Management
  async switchToProduction(): Promise<void> {
    console.log('Switching to production environment...');
    
    // Validate production readiness
    const issues = await this.validateProductionReadiness();
    if (issues.length > 0) {
      throw new Error(`Cannot switch to production: ${issues.join(', ')}`);
    }

    await this.updateConfig({
      environment: 'production',
      paymentProviders: {
        ...this.config.paymentProviders,
        orange: { ...this.config.paymentProviders.orange, sandboxMode: false },
        mtn: { ...this.config.paymentProviders.mtn, sandboxMode: false },
        wave: { ...this.config.paymentProviders.wave, sandboxMode: false },
      },
    });

    console.log('Switched to production environment');
  }

  async switchToStaging(): Promise<void> {
    await this.updateConfig({ environment: 'staging' });
    console.log('Switched to staging environment');
  }

  private async validateProductionReadiness(): Promise<string[]> {
    const issues: string[] = [];

    // Check API connectivity
    try {
      const response = await apiService.getCurrentUser();
      if (!response.success) {
        issues.push('API not accessible');
      }
    } catch (error) {
      issues.push('API connection failed');
    }

    // Check payment providers
    const enabledProviders = Object.entries(this.config.paymentProviders)
      .filter(([_, config]) => config.enabled);
    
    if (enabledProviders.length === 0) {
      issues.push('No payment providers configured');
    }

    // Check notifications
    if (this.config.notifications.pushEnabled) {
      try {
        const result = await notificationService.initialize();
        if (!result.success) {
          issues.push('Push notifications not working');
        }
      } catch (error) {
        issues.push('Notification service failed');
      }
    }

    return issues;
  }

  // Health Check
  async performHealthCheck(): Promise<{
    status: 'healthy' | 'warning' | 'error';
    checks: Array<{
      name: string;
      status: 'pass' | 'fail' | 'warn';
      message: string;
    }>;
  }> {
    const checks = [];
    let overallStatus: 'healthy' | 'warning' | 'error' = 'healthy';

    // API Health Check
    try {
      const response = await apiService.getCurrentUser();
      checks.push({
        name: 'API Connectivity',
        status: response.success ? 'pass' : 'fail',
        message: response.success ? 'API is accessible' : 'API connection failed',
      });
      if (!response.success) overallStatus = 'error';
    } catch (error) {
      checks.push({
        name: 'API Connectivity',
        status: 'fail',
        message: 'API connection error',
      });
      overallStatus = 'error';
    }

    // Payment Providers Check
    const enabledProviders = Object.entries(this.config.paymentProviders)
      .filter(([_, config]) => config.enabled);
    
    checks.push({
      name: 'Payment Providers',
      status: enabledProviders.length > 0 ? 'pass' : 'warn',
      message: `${enabledProviders.length} provider(s) enabled`,
    });

    if (enabledProviders.length === 0 && overallStatus === 'healthy') {
      overallStatus = 'warning';
    }

    // Notifications Check
    if (this.config.notifications.pushEnabled) {
      try {
        const result = await notificationService.initialize();
        checks.push({
          name: 'Push Notifications',
          status: result.success ? 'pass' : 'fail',
          message: result.success ? 'Notifications working' : 'Notification setup failed',
        });
        if (!result.success) overallStatus = 'error';
      } catch (error) {
        checks.push({
          name: 'Push Notifications',
          status: 'fail',
          message: 'Notification service error',
        });
        overallStatus = 'error';
      }
    }

    // Environment Check
    checks.push({
      name: 'Environment',
      status: 'pass',
      message: `Running in ${this.config.environment} mode`,
    });

    return { status: overallStatus, checks };
  }

  // Export configuration for backup
  async exportConfig(): Promise<string> {
    const config = { ...this.config };
    
    // Remove sensitive data
    if (config.paymentProviders.orange.clientId) {
      config.paymentProviders.orange.clientId = '***';
    }
    if (config.paymentProviders.mtn.subscriptionKey) {
      config.paymentProviders.mtn.subscriptionKey = '***';
    }
    if (config.paymentProviders.wave.apiKey) {
      config.paymentProviders.wave.apiKey = '***';
    }

    return JSON.stringify(config, null, 2);
  }

  // Reset to defaults
  async resetConfig(): Promise<void> {
    this.config = { ...DEFAULT_CONFIG };
    await AsyncStorage.removeItem('production_config');
    console.log('Production config reset to defaults');
  }
}

export const productionService = new ProductionService();
