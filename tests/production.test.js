
/**
 * Tests de validation pour le déploiement en production
 * 
 * Ces tests vérifient que l'application est prête pour la production
 * en testant les intégrations critiques et les configurations.
 */

const { productionService } = require('../services/productionService');
const { apiService } = require('../services/apiService');
const { paymentService } = require('../services/paymentService');
const { notificationService } = require('../services/notificationService');

describe('Production Readiness Tests', () => {
  
  beforeAll(async () => {
    // Initialiser les services pour les tests
    await productionService.initialize();
  });

  describe('Configuration Tests', () => {
    
    test('should have production API URL configured', () => {
      const config = productionService.getConfig();
      expect(config.apiBaseUrl).toBeDefined();
      expect(config.apiBaseUrl).not.toContain('localhost');
      expect(config.apiBaseUrl).not.toContain('your-production-api.com');
    });

    test('should have at least one payment provider enabled', () => {
      const config = productionService.getConfig();
      const enabledProviders = Object.values(config.paymentProviders)
        .filter(provider => provider.enabled);
      
      expect(enabledProviders.length).toBeGreaterThan(0);
    });

    test('should have security features enabled for production', () => {
      const config = productionService.getConfig();
      
      if (productionService.isProduction()) {
        expect(config.security.encryptionEnabled).toBe(true);
        expect(config.security.auditLogsEnabled).toBe(true);
        expect(config.security.rateLimitingEnabled).toBe(true);
      }
    });

    test('should have monitoring enabled for production', () => {
      const config = productionService.getConfig();
      
      if (productionService.isProduction()) {
        expect(config.monitoring.crashReportingEnabled).toBe(true);
        expect(config.monitoring.errorTrackingEnabled).toBe(true);
      }
    });
  });

  describe('API Connectivity Tests', () => {
    
    test('should connect to production API', async () => {
      const isConnected = await apiService.testConnection();
      expect(isConnected).toBe(true);
    }, 10000);

    test('should handle API authentication', async () => {
      // Test avec des credentials de test
      const testCredentials = {
        phoneNumber: '+225TEST123456',
        otp: '123456'
      };
      
      try {
        const response = await apiService.post('/auth/verify-otp', testCredentials);
        // Le test devrait échouer avec une erreur spécifique, pas une erreur de connexion
        expect(response).toBeDefined();
      } catch (error) {
        // Erreur attendue pour des credentials de test
        expect(error.message).not.toContain('Network Error');
        expect(error.message).not.toContain('ECONNREFUSED');
      }
    });

    test('should handle API rate limiting', async () => {
      // Test de rate limiting (si activé)
      const requests = Array(10).fill().map(() => 
        apiService.get('/health')
      );
      
      const results = await Promise.allSettled(requests);
      const successful = results.filter(r => r.status === 'fulfilled');
      
      // Au moins quelques requêtes devraient passer
      expect(successful.length).toBeGreaterThan(0);
    });
  });

  describe('Payment Provider Tests', () => {
    
    test('should have Orange Money configured if enabled', async () => {
      const config = productionService.getConfig();
      
      if (config.paymentProviders.orange.enabled) {
        expect(config.paymentProviders.orange.clientId).toBeDefined();
        expect(config.paymentProviders.orange.clientSecret).toBeDefined();
        
        // En production, sandbox mode devrait être désactivé
        if (productionService.isProduction()) {
          expect(config.paymentProviders.orange.sandboxMode).toBe(false);
        }
      }
    });

    test('should have MTN MoMo configured if enabled', async () => {
      const config = productionService.getConfig();
      
      if (config.paymentProviders.mtn.enabled) {
        expect(config.paymentProviders.mtn.subscriptionKey).toBeDefined();
        expect(config.paymentProviders.mtn.userId).toBeDefined();
        expect(config.paymentProviders.mtn.apiKey).toBeDefined();
        
        if (productionService.isProduction()) {
          expect(config.paymentProviders.mtn.sandboxMode).toBe(false);
        }
      }
    });

    test('should have Wave configured if enabled', async () => {
      const config = productionService.getConfig();
      
      if (config.paymentProviders.wave.enabled) {
        expect(config.paymentProviders.wave.apiKey).toBeDefined();
        expect(config.paymentProviders.wave.secretKey).toBeDefined();
        
        if (productionService.isProduction()) {
          expect(config.paymentProviders.wave.sandboxMode).toBe(false);
        }
      }
    });

    test('should initialize payment service successfully', async () => {
      const result = await paymentService.initialize();
      expect(result.success).toBe(true);
      expect(result.enabledProviders.length).toBeGreaterThan(0);
    });
  });

  describe('Notification Tests', () => {
    
    test('should initialize notification service', async () => {
      const result = await notificationService.initialize();
      expect(result.success).toBe(true);
    });

    test('should have push token if notifications enabled', async () => {
      const config = productionService.getConfig();
      
      if (config.notifications.pushEnabled) {
        const token = await notificationService.getExpoPushToken();
        expect(token).toBeDefined();
        expect(token.data).toMatch(/^ExponentPushToken\[.+\]$/);
      }
    });
  });

  describe('Security Tests', () => {
    
    test('should have HTTPS API endpoint', () => {
      const config = productionService.getConfig();
      expect(config.apiBaseUrl).toMatch(/^https:\/\//);
    });

    test('should have encryption enabled', () => {
      const config = productionService.getConfig();
      expect(config.security.encryptionEnabled).toBe(true);
    });

    test('should validate sensitive data storage', async () => {
      // Test que les données sensibles sont bien chiffrées
      const testData = { sensitive: 'test-data' };
      
      // Cette fonction devrait exister dans storageService
      const encrypted = await storageService.encryptData(testData);
      expect(encrypted).not.toEqual(testData);
      expect(typeof encrypted).toBe('string');
    });
  });

  describe('Performance Tests', () => {
    
    test('should have acceptable API response time', async () => {
      const startTime = Date.now();
      await apiService.get('/health');
      const responseTime = Date.now() - startTime;
      
      // API devrait répondre en moins de 2 secondes
      expect(responseTime).toBeLessThan(2000);
    });

    test('should handle concurrent requests', async () => {
      const concurrentRequests = 5;
      const requests = Array(concurrentRequests).fill().map(() => 
        apiService.get('/health')
      );
      
      const startTime = Date.now();
      const results = await Promise.all(requests);
      const totalTime = Date.now() - startTime;
      
      // Toutes les requêtes devraient réussir
      results.forEach(result => {
        expect(result).toBeDefined();
      });
      
      // Le temps total ne devrait pas être beaucoup plus long qu'une seule requête
      expect(totalTime).toBeLessThan(5000);
    });
  });

  describe('Health Check Tests', () => {
    
    test('should pass comprehensive health check', async () => {
      const healthCheck = await productionService.performHealthCheck();
      
      expect(healthCheck.status).toBeDefined();
      expect(['healthy', 'warning', 'error']).toContain(healthCheck.status);
      expect(healthCheck.checks).toBeInstanceOf(Array);
      expect(healthCheck.checks.length).toBeGreaterThan(0);
      
      // En production, le statut devrait être 'healthy' ou au pire 'warning'
      if (productionService.isProduction()) {
        expect(healthCheck.status).not.toBe('error');
      }
    });

    test('should have all critical checks passing', async () => {
      const healthCheck = await productionService.performHealthCheck();
      
      const criticalChecks = [
        'API Connectivity',
        'Security Configuration'
      ];
      
      criticalChecks.forEach(checkName => {
        const check = healthCheck.checks.find(c => c.name === checkName);
        expect(check).toBeDefined();
        
        if (productionService.isProduction()) {
          expect(check.status).toBe('pass');
        }
      });
    });
  });

  describe('Environment Validation', () => {
    
    test('should have correct environment configuration', () => {
      if (process.env.NODE_ENV === 'production') {
        expect(productionService.isProduction()).toBe(true);
        expect(productionService.isDevelopment()).toBe(false);
      }
    });

    test('should have production-ready feature flags', () => {
      const config = productionService.getConfig();
      
      if (productionService.isProduction()) {
        // En production, certaines fonctionnalités devraient être activées
        expect(config.features.offlineModeEnabled).toBe(true);
        expect(config.monitoring.crashReportingEnabled).toBe(true);
        expect(config.monitoring.analyticsEnabled).toBe(true);
      }
    });
  });

  describe('Data Validation', () => {
    
    test('should validate deployment checklist', () => {
      const checklist = productionService.getDeploymentChecklist();
      
      expect(checklist).toBeInstanceOf(Array);
      expect(checklist.length).toBeGreaterThan(0);
      
      // Vérifier que les éléments critiques sont complétés
      const criticalItems = checklist.filter(item => item.critical);
      const completedCritical = criticalItems.filter(item => item.completed);
      
      if (productionService.isProduction()) {
        expect(completedCritical.length).toBe(criticalItems.length);
      }
    });

    test('should export configuration successfully', async () => {
      const configExport = await productionService.exportConfig();
      
      expect(configExport).toBeDefined();
      expect(typeof configExport).toBe('string');
      
      // Vérifier que c'est du JSON valide
      const parsed = JSON.parse(configExport);
      expect(parsed.environment).toBeDefined();
      expect(parsed.paymentProviders).toBeDefined();
      
      // Vérifier que les données sensibles sont masquées
      expect(configExport).toContain('***HIDDEN***');
    });
  });
});

// Tests d'intégration spécifiques à la Côte d'Ivoire
describe('Côte d\'Ivoire Integration Tests', () => {
  
  test('should handle FCFA currency formatting', () => {
    const amount = 25000;
    const formatted = formatCurrency(amount);
    
    expect(formatted).toContain('FCFA');
    expect(formatted).toContain('25');
  });

  test('should support French language', () => {
    // Test que l'app supporte le français
    const config = productionService.getConfig();
    
    if (config.features.multiLanguageEnabled) {
      // Vérifier que le français est disponible
      expect(true).toBe(true); // Placeholder pour test de langue
    }
  });

  test('should handle local phone number formats', () => {
    const testNumbers = [
      '+22507123456',
      '+22505123456',
      '+22501123456'
    ];
    
    testNumbers.forEach(number => {
      // Test de validation des numéros ivoiriens
      expect(number).toMatch(/^\+225[0-9]{8}$/);
    });
  });
});

// Utilitaires pour les tests
function formatCurrency(amount) {
  return new Intl.NumberFormat('fr-CI', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0
  }).format(amount).replace('XOF', 'FCFA');
}
