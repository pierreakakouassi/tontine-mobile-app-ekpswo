
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
      clientSecret?: string;
      sandboxMode: boolean;
      webhookUrl?: string;
    };
    mtn: {
      enabled: boolean;
      subscriptionKey?: string;
      userId?: string;
      apiKey?: string;
      sandboxMode: boolean;
      webhookUrl?: string;
    };
    wave: {
      enabled: boolean;
      apiKey?: string;
      secretKey?: string;
      sandboxMode: boolean;
      webhookUrl?: string;
    };
  };
  notifications: {
    pushEnabled: boolean;
    firebaseProjectId?: string;
    expoPushToken?: string;
    vapidKey?: string;
  };
  security: {
    encryptionEnabled: boolean;
    auditLogsEnabled: boolean;
    rateLimitingEnabled: boolean;
    sslPinningEnabled: boolean;
  };
  monitoring: {
    crashReportingEnabled: boolean;
    analyticsEnabled: boolean;
    performanceMonitoringEnabled: boolean;
    errorTrackingEnabled: boolean;
  };
  features: {
    offlineModeEnabled: boolean;
    biometricAuthEnabled: boolean;
    multiLanguageEnabled: boolean;
    darkModeEnabled: boolean;
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
    sslPinningEnabled: false,
  },
  monitoring: {
    crashReportingEnabled: false,
    analyticsEnabled: false,
    performanceMonitoringEnabled: false,
    errorTrackingEnabled: false,
  },
  features: {
    offlineModeEnabled: true,
    biometricAuthEnabled: false,
    multiLanguageEnabled: false,
    darkModeEnabled: true,
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
      await this.updateApiService();
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

  private async updateApiService(): Promise<void> {
    // Update API service with current configuration
    apiService.updateApiBaseUrl(this.config.apiBaseUrl);
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
      await this.updateApiService();
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
  async configureOrangeMoney(config: {
    clientId: string;
    clientSecret: string;
    sandboxMode?: boolean;
    webhookUrl?: string;
  }): Promise<void> {
    await SecureStore.setItemAsync('orange_client_id', config.clientId);
    await SecureStore.setItemAsync('orange_client_secret', config.clientSecret);
    
    await this.updateConfig({
      paymentProviders: {
        ...this.config.paymentProviders,
        orange: {
          enabled: true,
          clientId: config.clientId,
          clientSecret: config.clientSecret,
          sandboxMode: config.sandboxMode ?? false,
          webhookUrl: config.webhookUrl,
        },
      },
    });
    console.log('Orange Money configured');
  }

  async configureMtnMomo(config: {
    subscriptionKey: string;
    userId: string;
    apiKey: string;
    sandboxMode?: boolean;
    webhookUrl?: string;
  }): Promise<void> {
    await SecureStore.setItemAsync('mtn_subscription_key', config.subscriptionKey);
    await SecureStore.setItemAsync('mtn_user_id', config.userId);
    await SecureStore.setItemAsync('mtn_api_key', config.apiKey);
    
    await this.updateConfig({
      paymentProviders: {
        ...this.config.paymentProviders,
        mtn: {
          enabled: true,
          subscriptionKey: config.subscriptionKey,
          userId: config.userId,
          apiKey: config.apiKey,
          sandboxMode: config.sandboxMode ?? false,
          webhookUrl: config.webhookUrl,
        },
      },
    });
    console.log('MTN MoMo configured');
  }

  async configureWave(config: {
    apiKey: string;
    secretKey: string;
    sandboxMode?: boolean;
    webhookUrl?: string;
  }): Promise<void> {
    await SecureStore.setItemAsync('wave_api_key', config.apiKey);
    await SecureStore.setItemAsync('wave_secret_key', config.secretKey);
    
    await this.updateConfig({
      paymentProviders: {
        ...this.config.paymentProviders,
        wave: {
          enabled: true,
          apiKey: config.apiKey,
          secretKey: config.secretKey,
          sandboxMode: config.sandboxMode ?? false,
          webhookUrl: config.webhookUrl,
        },
      },
    });
    console.log('Wave configured');
  }

  // Notification Configuration
  async configureNotifications(config: {
    firebaseProjectId?: string;
    vapidKey?: string;
  }): Promise<void> {
    await this.updateConfig({
      notifications: {
        ...this.config.notifications,
        pushEnabled: true,
        firebaseProjectId: config.firebaseProjectId,
        vapidKey: config.vapidKey,
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

  // Feature Configuration
  async configureFeatures(options: Partial<ProductionConfig['features']>): Promise<void> {
    await this.updateConfig({
      features: {
        ...this.config.features,
        ...options,
      },
    });
    console.log('Feature settings updated');
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
      const isConnected = await apiService.testConnection();
      if (!isConnected) {
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

    // Check required credentials
    for (const [provider, config] of enabledProviders) {
      if (provider === 'orange' && (!config.clientId || !config.clientSecret)) {
        issues.push('Orange Money credentials missing');
      }
      if (provider === 'mtn' && (!config.subscriptionKey || !config.userId || !config.apiKey)) {
        issues.push('MTN MoMo credentials missing');
      }
      if (provider === 'wave' && (!config.apiKey || !config.secretKey)) {
        issues.push('Wave credentials missing');
      }
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
    checks: {
      name: string;
      status: 'pass' | 'fail' | 'warn';
      message: string;
    }[];
  }> {
    const checks = [];
    let overallStatus: 'healthy' | 'warning' | 'error' = 'healthy';

    // API Health Check
    try {
      const isConnected = await apiService.testConnection();
      checks.push({
        name: 'API Connectivity',
        status: isConnected ? 'pass' : 'fail',
        message: isConnected ? 'API is accessible' : 'API connection failed',
      });
      if (!isConnected) overallStatus = 'error';
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

    // Security Check
    checks.push({
      name: 'Security Configuration',
      status: this.config.security.encryptionEnabled ? 'pass' : 'warn',
      message: this.config.security.encryptionEnabled ? 'Encryption enabled' : 'Encryption disabled',
    });

    // Environment Check
    checks.push({
      name: 'Environment',
      status: 'pass',
      message: `Running in ${this.config.environment} mode`,
    });

    return { status: overallStatus, checks };
  }

  // Configuration Templates
  getProductionTemplate(): Partial<ProductionConfig> {
    return {
      environment: 'production',
      security: {
        encryptionEnabled: true,
        auditLogsEnabled: true,
        rateLimitingEnabled: true,
        sslPinningEnabled: true,
      },
      monitoring: {
        crashReportingEnabled: true,
        analyticsEnabled: true,
        performanceMonitoringEnabled: true,
        errorTrackingEnabled: true,
      },
      features: {
        offlineModeEnabled: true,
        biometricAuthEnabled: true,
        multiLanguageEnabled: true,
        darkModeEnabled: true,
      },
    };
  }

  getStagingTemplate(): Partial<ProductionConfig> {
    return {
      environment: 'staging',
      security: {
        encryptionEnabled: true,
        auditLogsEnabled: true,
        rateLimitingEnabled: false,
        sslPinningEnabled: false,
      },
      monitoring: {
        crashReportingEnabled: true,
        analyticsEnabled: false,
        performanceMonitoringEnabled: true,
        errorTrackingEnabled: true,
      },
    };
  }

  // Export configuration for backup
  async exportConfig(): Promise<string> {
    const config = { ...this.config };
    
    // Remove sensitive data for export
    if (config.paymentProviders.orange.clientSecret) {
      config.paymentProviders.orange.clientSecret = '***HIDDEN***';
    }
    if (config.paymentProviders.mtn.apiKey) {
      config.paymentProviders.mtn.apiKey = '***HIDDEN***';
    }
    if (config.paymentProviders.wave.secretKey) {
      config.paymentProviders.wave.secretKey = '***HIDDEN***';
    }

    return JSON.stringify(config, null, 2);
  }

  // Import configuration
  async importConfig(configJson: string): Promise<void> {
    try {
      const importedConfig = JSON.parse(configJson);
      
      // Validate imported config structure
      if (!importedConfig.environment || !importedConfig.paymentProviders) {
        throw new Error('Invalid configuration format');
      }

      await this.updateConfig(importedConfig);
      console.log('Configuration imported successfully');
    } catch (error) {
      console.error('Failed to import configuration:', error);
      throw error;
    }
  }

  // Reset to defaults
  async resetConfig(): Promise<void> {
    this.config = { ...DEFAULT_CONFIG };
    await AsyncStorage.removeItem('production_config');
    console.log('Production config reset to defaults');
  }

  // Get deployment checklist
  getDeploymentChecklist(): {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    critical: boolean;
  }[] {
    return [
      {
        id: 'api-url',
        title: 'API URL configurée',
        description: 'URL de production configurée dans apiService',
        completed: !this.config.apiBaseUrl.includes('your-production-api.com'),
        critical: true,
      },
      {
        id: 'payment-providers',
        title: 'Fournisseurs de paiement',
        description: 'Au moins un fournisseur de paiement configuré',
        completed: Object.values(this.config.paymentProviders).some(p => p.enabled),
        critical: true,
      },
      {
        id: 'notifications',
        title: 'Notifications push',
        description: 'Service de notifications configuré',
        completed: this.config.notifications.pushEnabled,
        critical: false,
      },
      {
        id: 'security',
        title: 'Sécurité activée',
        description: 'Chiffrement et audit activés',
        completed: this.config.security.encryptionEnabled && this.config.security.auditLogsEnabled,
        critical: true,
      },
      {
        id: 'monitoring',
        title: 'Monitoring configuré',
        description: 'Suivi des erreurs et performances',
        completed: this.config.monitoring.errorTrackingEnabled,
        critical: false,
      },
    ];
  }
}

export const productionService = new ProductionService();
