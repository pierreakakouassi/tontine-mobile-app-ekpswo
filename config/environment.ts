
import Constants from 'expo-constants';

export interface EnvironmentConfig {
  API_BASE_URL: string;
  ENVIRONMENT: 'development' | 'staging' | 'production';
  EXPO_PROJECT_ID: string;
  
  // Payment Providers
  ORANGE_API_URL: string;
  MTN_API_URL: string;
  WAVE_API_URL: string;
  
  // Features
  ENABLE_ANALYTICS: boolean;
  ENABLE_CRASH_REPORTING: boolean;
  ENABLE_PUSH_NOTIFICATIONS: boolean;
  ENABLE_BIOMETRIC_AUTH: boolean;
  
  // Security
  ENABLE_SSL_PINNING: boolean;
  ENABLE_ENCRYPTION: boolean;
  ENABLE_AUDIT_LOGS: boolean;
  
  // Debug
  DEBUG_MODE: boolean;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
}

const isDevelopment = __DEV__;
const isStaging = Constants.expoConfig?.extra?.environment === 'staging';
const isProduction = Constants.expoConfig?.extra?.environment === 'production';

export const environment: EnvironmentConfig = {
  // API Configuration
  API_BASE_URL: isDevelopment 
    ? 'http://localhost:3000/api'
    : isStaging 
    ? 'https://staging-api.tontine-ci.com/api'
    : 'https://api.tontine-ci.com/api',
  
  ENVIRONMENT: isDevelopment ? 'development' : isStaging ? 'staging' : 'production',
  
  EXPO_PROJECT_ID: Constants.expoConfig?.extra?.eas?.projectId || 'your-expo-project-id',
  
  // Payment Provider URLs
  ORANGE_API_URL: isProduction 
    ? 'https://api.orange.com/orange-money-webpay/ci/v1'
    : 'https://api.orange.com/orange-money-webpay/dev/v1',
  
  MTN_API_URL: isProduction
    ? 'https://ericssonbasicapi2.azure-api.net'
    : 'https://sandbox.momodeveloper.mtn.com',
  
  WAVE_API_URL: isProduction
    ? 'https://api.wave.com/v1'
    : 'https://sandbox-api.wave.com/v1',
  
  // Features
  ENABLE_ANALYTICS: isProduction,
  ENABLE_CRASH_REPORTING: !isDevelopment,
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_BIOMETRIC_AUTH: !isDevelopment,
  
  // Security
  ENABLE_SSL_PINNING: isProduction,
  ENABLE_ENCRYPTION: true,
  ENABLE_AUDIT_LOGS: !isDevelopment,
  
  // Debug
  DEBUG_MODE: isDevelopment,
  LOG_LEVEL: isDevelopment ? 'debug' : isProduction ? 'error' : 'info',
};

// Helper functions
export const isDevEnvironment = () => environment.ENVIRONMENT === 'development';
export const isStagingEnvironment = () => environment.ENVIRONMENT === 'staging';
export const isProductionEnvironment = () => environment.ENVIRONMENT === 'production';

// Configuration validation
export const validateEnvironment = (): string[] => {
  const issues: string[] = [];
  
  if (!environment.API_BASE_URL || environment.API_BASE_URL.includes('localhost') && isProduction) {
    issues.push('Production API URL not configured');
  }
  
  if (!environment.EXPO_PROJECT_ID || environment.EXPO_PROJECT_ID.includes('your-expo-project-id')) {
    issues.push('Expo Project ID not configured');
  }
  
  if (isProduction && environment.DEBUG_MODE) {
    issues.push('Debug mode should be disabled in production');
  }
  
  if (isProduction && !environment.ENABLE_SSL_PINNING) {
    issues.push('SSL pinning should be enabled in production');
  }
  
  return issues;
};

// Environment info for debugging
export const getEnvironmentInfo = () => {
  return {
    environment: environment.ENVIRONMENT,
    apiUrl: environment.API_BASE_URL,
    projectId: environment.EXPO_PROJECT_ID,
    features: {
      analytics: environment.ENABLE_ANALYTICS,
      crashReporting: environment.ENABLE_CRASH_REPORTING,
      pushNotifications: environment.ENABLE_PUSH_NOTIFICATIONS,
      biometricAuth: environment.ENABLE_BIOMETRIC_AUTH,
    },
    security: {
      sslPinning: environment.ENABLE_SSL_PINNING,
      encryption: environment.ENABLE_ENCRYPTION,
      auditLogs: environment.ENABLE_AUDIT_LOGS,
    },
    debug: {
      debugMode: environment.DEBUG_MODE,
      logLevel: environment.LOG_LEVEL,
    },
  };
};

export default environment;
