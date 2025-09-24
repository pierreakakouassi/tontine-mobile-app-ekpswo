
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Linking, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { router } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/apiService';
import { notificationService } from '../services/notificationService';
import { productionService } from '../services/productionService';

interface ProductionStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  priority: 'high' | 'medium' | 'low';
  category: 'backend' | 'payment' | 'notifications' | 'store' | 'testing';
  action?: () => void;
}

export default function ProductionGuideScreen() {
  const { authState } = useAuth();
  const [steps, setSteps] = useState<ProductionStep[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [apiUrl, setApiUrl] = useState('');
  const [showApiUrlInput, setShowApiUrlInput] = useState(false);
  const [healthStatus, setHealthStatus] = useState<any>(null);

  const loadCurrentApiUrl = useCallback(async () => {
    const config = productionService.getConfig();
    setApiUrl(config.apiBaseUrl);
  }, []);

  const updateStepStatus = useCallback((stepId: string, status: ProductionStep['status']) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ));
  }, []);

  const showBackendGuide = useCallback(() => {
    Alert.alert(
      'Déploiement Backend',
      '🚀 Options de déploiement recommandées:\n\n' +
      '• Heroku (facile, payant)\n' +
      '• DigitalOcean (flexible, abordable)\n' +
      '• Railway (moderne, simple)\n' +
      '• Render (gratuit pour commencer)\n' +
      '• AWS/GCP (scalable, complexe)\n\n' +
      '✅ Checklist obligatoire:\n' +
      '• HTTPS activé (SSL/TLS)\n' +
      '• Variables d\'environnement sécurisées\n' +
      '• Base de données PostgreSQL\n' +
      '• Monitoring et logs\n' +
      '• Sauvegardes automatiques\n' +
      '• Rate limiting\n' +
      '• CORS configuré',
      [
        { text: 'Annuler' },
        { text: 'Guide Heroku', onPress: () => Linking.openURL('https://devcenter.heroku.com/articles/deploying-nodejs') },
        { text: 'Guide Railway', onPress: () => Linking.openURL('https://docs.railway.app/deploy/deployments') }
      ]
    );
  }, []);

  const showDatabaseGuide = useCallback(() => {
    Alert.alert(
      'Configuration Base de Données',
      '🗄️ PostgreSQL en production:\n\n' +
      '📋 Services recommandés:\n' +
      '• Supabase (gratuit + payant)\n' +
      '• AWS RDS (scalable)\n' +
      '• DigitalOcean Managed DB\n' +
      '• Railway PostgreSQL\n' +
      '• Heroku Postgres\n\n' +
      '⚙️ Configuration requise:\n' +
      '• SSL/TLS activé\n' +
      '• Sauvegardes automatiques quotidiennes\n' +
      '• Monitoring des performances\n' +
      '• Connection pooling\n' +
      '• Réplication (optionnel)',
      [
        { text: 'Annuler' },
        { text: 'Supabase', onPress: () => Linking.openURL('https://supabase.com') }
      ]
    );
  }, []);

  const showOrangeApiGuide = useCallback(() => {
    Alert.alert(
      'API Orange Money',
      '🟠 Intégration Orange Money CI:\n\n' +
      '📞 Étapes d\'intégration:\n' +
      '1. Contactez Orange Côte d\'Ivoire\n' +
      '   📧 Email: api-support@orange.ci\n' +
      '   📱 Tel: +225 07 07 07 07\n\n' +
      '2. Présentez votre projet tontine\n' +
      '3. Demandez l\'accès API Orange Money\n' +
      '4. Obtenez vos clés (client_id, client_secret)\n' +
      '5. Testez en mode sandbox\n' +
      '6. Demandez l\'activation production\n\n' +
      '💰 Frais: ~2-3% par transaction\n' +
      '📚 Documentation: developer.orange.com',
      [
        { text: 'Annuler' },
        { text: 'Configurer', onPress: () => showOrangeConfig() },
        { text: 'Documentation', onPress: () => Linking.openURL('https://developer.orange.com') }
      ]
    );
  }, []);

  const showOrangeConfig = useCallback(() => {
    Alert.prompt(
      'Configuration Orange Money',
      'Entrez votre Client ID Orange Money:',
      [
        { text: 'Annuler' },
        { 
          text: 'Suivant', 
          onPress: (clientId) => {
            if (clientId) {
              Alert.prompt(
                'Configuration Orange Money',
                'Entrez votre Client Secret:',
                [
                  { text: 'Annuler' },
                  { 
                    text: 'Configurer', 
                    onPress: async (clientSecret) => {
                      if (clientSecret) {
                        try {
                          await productionService.configureOrangeMoney({
                            clientId,
                            clientSecret,
                            sandboxMode: !productionService.isProduction(),
                          });
                          updateStepStatus('orange-api', 'completed');
                          Alert.alert('Succès', 'Orange Money configuré!');
                        } catch (error) {
                          Alert.alert('Erreur', 'Configuration échouée');
                        }
                      }
                    }
                  }
                ]
              );
            }
          }
        }
      ]
    );
  }, [updateStepStatus]);

  const showMtnApiGuide = useCallback(() => {
    Alert.alert(
      'API MTN Mobile Money',
      '🟡 Intégration MTN MoMo CI:\n\n' +
      '🌐 Étapes d\'intégration:\n' +
      '1. Visitez momodeveloper.mtn.com\n' +
      '2. Créez un compte développeur\n' +
      '3. Souscrivez au produit "Collections"\n' +
      '4. Obtenez vos clés API\n' +
      '5. Testez en sandbox\n' +
      '6. Demandez l\'accès production\n\n' +
      '💰 Frais: ~2-3% par transaction\n' +
      '⏱️ Délai d\'approbation: 2-4 semaines',
      [
        { text: 'Annuler' },
        { text: 'Configurer', onPress: () => showMtnConfig() },
        { text: 'Site MTN', onPress: () => Linking.openURL('https://momodeveloper.mtn.com') }
      ]
    );
  }, []);

  const showMtnConfig = useCallback(() => {
    Alert.prompt(
      'Configuration MTN MoMo',
      'Entrez votre Subscription Key:',
      [
        { text: 'Annuler' },
        { 
          text: 'Suivant', 
          onPress: (subscriptionKey) => {
            if (subscriptionKey) {
              Alert.prompt(
                'Configuration MTN MoMo',
                'Entrez votre User ID:',
                [
                  { text: 'Annuler' },
                  { 
                    text: 'Suivant', 
                    onPress: (userId) => {
                      if (userId) {
                        Alert.prompt(
                          'Configuration MTN MoMo',
                          'Entrez votre API Key:',
                          [
                            { text: 'Annuler' },
                            { 
                              text: 'Configurer', 
                              onPress: async (apiKey) => {
                                if (apiKey) {
                                  try {
                                    await productionService.configureMtnMomo({
                                      subscriptionKey,
                                      userId,
                                      apiKey,
                                      sandboxMode: !productionService.isProduction(),
                                    });
                                    updateStepStatus('mtn-api', 'completed');
                                    Alert.alert('Succès', 'MTN MoMo configuré!');
                                  } catch (error) {
                                    Alert.alert('Erreur', 'Configuration échouée');
                                  }
                                }
                              }
                            }
                          ]
                        );
                      }
                    }
                  }
                ]
              );
            }
          }
        }
      ]
    );
  }, [updateStepStatus]);

  const showWaveApiGuide = useCallback(() => {
    Alert.alert(
      'API Wave',
      '🔵 Intégration Wave CI:\n\n' +
      '📞 Étapes d\'intégration:\n' +
      '1. Contactez Wave directement\n' +
      '   📧 Email: developers@wave.com\n' +
      '   📱 WhatsApp: +221 77 xxx xx xx\n\n' +
      '2. Présentez votre projet tontine\n' +
      '3. Négociez les conditions\n' +
      '4. Obtenez l\'accès API\n' +
      '5. Intégrez et testez\n\n' +
      '💡 Avantage: Wave est généralement plus ouvert aux fintechs locales\n' +
      '💰 Frais négociables selon le volume',
      [
        { text: 'Annuler' },
        { text: 'Configurer', onPress: () => showWaveConfig() },
        { text: 'Contacter Wave', onPress: () => Linking.openURL('mailto:developers@wave.com') }
      ]
    );
  }, []);

  const showWaveConfig = useCallback(() => {
    Alert.prompt(
      'Configuration Wave',
      'Entrez votre API Key Wave:',
      [
        { text: 'Annuler' },
        { 
          text: 'Suivant', 
          onPress: (apiKey) => {
            if (apiKey) {
              Alert.prompt(
                'Configuration Wave',
                'Entrez votre Secret Key:',
                [
                  { text: 'Annuler' },
                  { 
                    text: 'Configurer', 
                    onPress: async (secretKey) => {
                      if (secretKey) {
                        try {
                          await productionService.configureWave({
                            apiKey,
                            secretKey,
                            sandboxMode: !productionService.isProduction(),
                          });
                          updateStepStatus('wave-api', 'completed');
                          Alert.alert('Succès', 'Wave configuré!');
                        } catch (error) {
                          Alert.alert('Erreur', 'Configuration échouée');
                        }
                      }
                    }
                  }
                ]
              );
            }
          }
        }
      ]
    );
  }, [updateStepStatus]);

  const showFirebaseGuide = useCallback(() => {
    Alert.alert(
      'Configuration Firebase',
      '🔥 Firebase Cloud Messaging:\n\n' +
      '📋 Étapes de configuration:\n' +
      '1. Créez un projet Firebase\n' +
      '2. Ajoutez vos apps iOS/Android\n' +
      '3. Téléchargez google-services.json\n' +
      '4. Configurez les certificats push iOS\n' +
      '5. Testez les notifications\n\n' +
      '🔄 Alternative recommandée:\n' +
      'Utilisez Expo Push Notifications (plus simple)\n\n' +
      '💡 Expo Push est déjà intégré dans l\'app!',
      [
        { text: 'Annuler' },
        { text: 'Utiliser Expo Push', onPress: () => testNotifications() },
        { text: 'Firebase Console', onPress: () => Linking.openURL('https://console.firebase.google.com') }
      ]
    );
  }, []);

  const testNotifications = useCallback(async () => {
    try {
      updateStepStatus('expo-notifications', 'in-progress');
      
      const result = await notificationService.initialize();
      if (result.success) {
        await notificationService.scheduleLocalNotification({
          title: '🎉 Test de notification',
          body: 'Les notifications fonctionnent parfaitement!',
          trigger: { seconds: 2 }
        });
        
        // Configure notifications in production service
        await productionService.configureNotifications({
          firebaseProjectId: 'tontine-app-ci',
        });
        
        updateStepStatus('expo-notifications', 'completed');
        Alert.alert('✅ Succès', 'Notification de test programmée!\nLes notifications push sont configurées.');
      } else {
        updateStepStatus('expo-notifications', 'error');
        Alert.alert('❌ Erreur', result.error || 'Échec du test de notification');
      }
    } catch (error) {
      updateStepStatus('expo-notifications', 'error');
      Alert.alert('❌ Erreur', 'Échec du test de notification');
    }
  }, [updateStepStatus]);

  const initializeSteps = useCallback(() => {
    const productionSteps: ProductionStep[] = [
      // Backend Configuration
      {
        id: 'backend-deploy',
        title: 'Déployer le Backend',
        description: 'Déployez votre API NestJS/Laravel sur un serveur de production',
        status: 'pending',
        priority: 'high',
        category: 'backend',
        action: () => showBackendGuide(),
      },
      {
        id: 'api-url-update',
        title: 'Mettre à jour API_BASE_URL',
        description: 'Configurez l\'URL de production dans apiService.ts',
        status: 'pending',
        priority: 'high',
        category: 'backend',
        action: () => setShowApiUrlInput(true),
      },
      {
        id: 'database-setup',
        title: 'Configuration Base de Données',
        description: 'Configurez PostgreSQL en production avec sauvegardes',
        status: 'pending',
        priority: 'high',
        category: 'backend',
        action: () => showDatabaseGuide(),
      },

      // Mobile Money APIs
      {
        id: 'orange-api',
        title: 'API Orange Money',
        description: 'Obtenez les clés API Orange Money et intégrez-les',
        status: 'pending',
        priority: 'high',
        category: 'payment',
        action: () => showOrangeApiGuide(),
      },
      {
        id: 'mtn-api',
        title: 'API MTN MoMo',
        description: 'Obtenez les clés API MTN Mobile Money',
        status: 'pending',
        priority: 'high',
        category: 'payment',
        action: () => showMtnApiGuide(),
      },
      {
        id: 'wave-api',
        title: 'API Wave',
        description: 'Intégrez l\'API Wave pour les paiements',
        status: 'pending',
        priority: 'high',
        category: 'payment',
        action: () => showWaveApiGuide(),
      },
      {
        id: 'payment-security',
        title: 'Sécurité des Paiements',
        description: 'Implémentez le chiffrement et la validation des paiements',
        status: 'pending',
        priority: 'high',
        category: 'payment',
        action: () => showPaymentSecurityGuide(),
      },

      // Push Notifications
      {
        id: 'firebase-setup',
        title: 'Configuration Firebase',
        description: 'Configurez Firebase Cloud Messaging pour les notifications',
        status: 'pending',
        priority: 'medium',
        category: 'notifications',
        action: () => showFirebaseGuide(),
      },
      {
        id: 'expo-notifications',
        title: 'Notifications Expo',
        description: 'Configurez les notifications push Expo',
        status: 'pending',
        priority: 'medium',
        category: 'notifications',
        action: () => testNotifications(),
      },

      // App Store Preparation
      {
        id: 'app-store-assets',
        title: 'Assets App Store',
        description: 'Préparez icônes, captures d\'écran et descriptions',
        status: 'pending',
        priority: 'medium',
        category: 'store',
        action: () => showAppStoreAssetsGuide(),
      },
      {
        id: 'ios-submission',
        title: 'Soumission iOS',
        description: 'Préparez la soumission à l\'App Store iOS',
        status: 'pending',
        priority: 'medium',
        category: 'store',
        action: () => showIosSubmissionGuide(),
      },
      {
        id: 'android-submission',
        title: 'Soumission Android',
        description: 'Préparez la soumission au Google Play Store',
        status: 'pending',
        priority: 'medium',
        category: 'store',
        action: () => showAndroidSubmissionGuide(),
      },

      // Testing
      {
        id: 'user-testing',
        title: 'Tests Utilisateurs',
        description: 'Effectuez des tests avec de vrais utilisateurs',
        status: 'pending',
        priority: 'high',
        category: 'testing',
        action: () => showUserTestingGuide(),
      },
      {
        id: 'payment-testing',
        title: 'Tests de Paiement',
        description: 'Testez tous les flux de paiement avec de vraies transactions',
        status: 'pending',
        priority: 'high',
        category: 'testing',
        action: () => showPaymentTestingGuide(),
      },
      {
        id: 'security-audit',
        title: 'Audit de Sécurité',
        description: 'Effectuez un audit de sécurité complet',
        status: 'pending',
        priority: 'high',
        category: 'testing',
        action: () => showSecurityAuditGuide(),
      },
    ];

    setSteps(productionSteps);
  }, [showBackendGuide, showDatabaseGuide, showOrangeApiGuide, showMtnApiGuide, showWaveApiGuide, showFirebaseGuide, testNotifications]);

  const checkCurrentStatus = useCallback(async () => {
    try {
      // Perform health check
      const health = await productionService.performHealthCheck();
      setHealthStatus(health);

      // Update step statuses based on health check
      health.checks.forEach(check => {
        if (check.name === 'API Connectivity') {
          updateStepStatus('api-url-update', check.status === 'pass' ? 'completed' : 'error');
        }
        if (check.name === 'Push Notifications') {
          updateStepStatus('expo-notifications', check.status === 'pass' ? 'completed' : 'error');
        }
        if (check.name === 'Payment Providers') {
          const status = check.status === 'pass' ? 'completed' : 'pending';
          updateStepStatus('orange-api', status);
          updateStepStatus('mtn-api', status);
          updateStepStatus('wave-api', status);
        }
      });

      // Check deployment checklist
      const checklist = productionService.getDeploymentChecklist();
      checklist.forEach(item => {
        if (item.id === 'api-url') {
          updateStepStatus('api-url-update', item.completed ? 'completed' : 'pending');
        }
        if (item.id === 'payment-providers') {
          const status = item.completed ? 'completed' : 'pending';
          updateStepStatus('orange-api', status);
          updateStepStatus('mtn-api', status);
          updateStepStatus('wave-api', status);
        }
        if (item.id === 'notifications') {
          updateStepStatus('expo-notifications', item.completed ? 'completed' : 'pending');
        }
      });
    } catch (error) {
      console.error('Status check failed:', error);
    }
  }, [updateStepStatus]);

  useEffect(() => {
    initializeSteps();
    checkCurrentStatus();
    loadCurrentApiUrl();
  }, [initializeSteps, checkCurrentStatus, loadCurrentApiUrl]);

  const updateApiUrl = async () => {
    try {
      if (!apiUrl || !apiUrl.startsWith('http')) {
        Alert.alert('Erreur', 'Veuillez entrer une URL valide (http:// ou https://)');
        return;
      }

      await productionService.setApiBaseUrl(apiUrl);
      setShowApiUrlInput(false);
      
      // Test the new API URL
      const isConnected = await apiService.testConnection();
      updateStepStatus('api-url-update', isConnected ? 'completed' : 'error');
      
      Alert.alert(
        'Succès', 
        `URL API mise à jour: ${apiUrl}\nConnexion: ${isConnected ? 'Réussie' : 'Échec'}`
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour l\'URL API');
    }
  };

  const showPaymentSecurityGuide = () => {
    Alert.alert(
      'Sécurité des Paiements',
      '🔒 Mesures de sécurité essentielles:\n\n' +
      '🛡️ Chiffrement:\n' +
      '• Données sensibles chiffrées (AES-256)\n' +
      '• Communications HTTPS/TLS 1.3\n' +
      '• Clés API sécurisées\n\n' +
      '✅ Validation:\n' +
      '• Validation côté serveur\n' +
      '• Vérification des signatures\n' +
      '• Timeouts appropriés\n\n' +
      '📊 Monitoring:\n' +
      '• Logs d\'audit des transactions\n' +
      '• Détection de fraude\n' +
      '• Alertes en temps réel\n\n' +
      '📋 Conformité:\n' +
      '• Standards PCI DSS\n' +
      '• Réglementations locales BCEAO',
      [{ text: 'Compris' }]
    );
  };

  const showAppStoreAssetsGuide = () => {
    Alert.alert(
      'Assets App Store',
      '📱 Préparez ces éléments:\n\n' +
      '🎨 Visuels obligatoires:\n' +
      '• Icône app (1024x1024px, PNG)\n' +
      '• Captures d\'écran iPhone (plusieurs tailles)\n' +
      '• Captures d\'écran iPad (si supporté)\n' +
      '• Captures d\'écran Android (plusieurs densités)\n\n' +
      '📝 Textes requis:\n' +
      '• Nom de l\'app (30 caractères max)\n' +
      '• Description courte (80 caractères)\n' +
      '• Description complète (4000 caractères)\n' +
      '• Mots-clés pour le SEO\n' +
      '• Notes de version\n\n' +
      '⚖️ Documents légaux:\n' +
      '• Politique de confidentialité\n' +
      '• Conditions d\'utilisation\n' +
      '• Mentions légales',
      [
        { text: 'Compris' },
        { text: 'Template Assets', onPress: () => Linking.openURL('https://www.figma.com/templates/app-store-assets/') }
      ]
    );
  };

  const showIosSubmissionGuide = () => {
    Alert.alert(
      'Soumission iOS',
      '🍎 App Store iOS:\n\n' +
      '💳 Prérequis:\n' +
      '• Compte Apple Developer (99$/an)\n' +
      '• Certificats de développement\n' +
      '• Profils de provisioning\n\n' +
      '📋 Étapes de soumission:\n' +
      '1. Configurez App Store Connect\n' +
      '2. Créez l\'app record\n' +
      '3. Build avec EAS Build\n' +
      '4. Upload via Transporter ou Xcode\n' +
      '5. Remplissez les métadonnées\n' +
      '6. Soumettez pour review\n\n' +
      '⏱️ Délai de review: 1-7 jours\n' +
      '📊 Taux d\'approbation: ~85%',
      [
        { text: 'Annuler' },
        { text: 'Guide EAS', onPress: () => Linking.openURL('https://docs.expo.dev/submit/ios/') },
        { text: 'App Store Connect', onPress: () => Linking.openURL('https://appstoreconnect.apple.com') }
      ]
    );
  };

  const showAndroidSubmissionGuide = () => {
    Alert.alert(
      'Soumission Android',
      '🤖 Google Play Store:\n\n' +
      '💳 Prérequis:\n' +
      '• Compte Google Play Console (25$ unique)\n' +
      '• Certificat de signature d\'app\n\n' +
      '📋 Étapes de soumission:\n' +
      '1. Créez l\'app dans Play Console\n' +
      '2. Build AAB avec EAS Build\n' +
      '3. Upload et configurez\n' +
      '4. Remplissez les métadonnées\n' +
      '5. Configurez la distribution\n' +
      '6. Soumettez pour review\n\n' +
      '⏱️ Délai de review: quelques heures\n' +
      '📊 Taux d\'approbation: ~95%',
      [
        { text: 'Annuler' },
        { text: 'Guide EAS', onPress: () => Linking.openURL('https://docs.expo.dev/submit/android/') },
        { text: 'Play Console', onPress: () => Linking.openURL('https://play.google.com/console') }
      ]
    );
  };

  const showUserTestingGuide = () => {
    Alert.alert(
      'Tests Utilisateurs',
      '👥 Plan de test recommandé:\n\n' +
      '🎯 Objectifs de test:\n' +
      '• 5-10 cercles de test\n' +
      '• 50-100 utilisateurs beta\n' +
      '• Tous les scénarios couverts\n\n' +
      '📋 Scénarios à tester:\n' +
      '• Inscription et vérification OTP\n' +
      '• Création de tontine\n' +
      '• Invitation de membres\n' +
      '• Paiements réels (petits montants)\n' +
      '• Notifications et rappels\n' +
      '• Gestion des retards\n\n' +
      '📊 Métriques à suivre:\n' +
      '• Taux de conversion\n' +
      '• Temps de réponse\n' +
      '• Taux d\'erreur\n' +
      '• Satisfaction utilisateur',
      [{ text: 'Compris' }]
    );
  };

  const showPaymentTestingGuide = () => {
    Alert.alert(
      'Tests de Paiement',
      '💳 Tests essentiels:\n\n' +
      '✅ Scénarios de succès:\n' +
      '• Paiements Orange Money\n' +
      '• Paiements MTN MoMo\n' +
      '• Paiements Wave\n' +
      '• Montants variés (min/max)\n\n' +
      '❌ Scénarios d\'échec:\n' +
      '• Solde insuffisant\n' +
      '• Timeouts réseau\n' +
      '• Annulations utilisateur\n' +
      '• Erreurs serveur\n\n' +
      '🔄 Tests de robustesse:\n' +
      '• Paiements simultanés\n' +
      '• Reconnexions automatiques\n' +
      '• Gestion des doublons\n\n' +
      '⚠️ Important: Utilisez les environnements sandbox!',
      [{ text: 'Compris' }]
    );
  };

  const showSecurityAuditGuide = () => {
    Alert.alert(
      'Audit de Sécurité',
      '🔒 Points à vérifier:\n\n' +
      '🔐 Authentification:\n' +
      '• OTP sécurisé\n' +
      '• Tokens JWT\n' +
      '• Sessions expirantes\n\n' +
      '🛡️ Protection des données:\n' +
      '• Chiffrement AES-256\n' +
      '• HTTPS obligatoire\n' +
      '• Stockage sécurisé\n\n' +
      '🚨 Tests de sécurité:\n' +
      '• Injection SQL\n' +
      '• XSS/CSRF\n' +
      '• Tests de pénétration\n\n' +
      '📋 Conformité:\n' +
      '• RGPD/Protection des données\n' +
      '• Réglementations BCEAO\n' +
      '• Standards PCI DSS',
      [
        { text: 'Compris' },
        { text: 'OWASP Guide', onPress: () => Linking.openURL('https://owasp.org/www-project-mobile-top-10/') }
      ]
    );
  };

  const performHealthCheck = async () => {
    try {
      const health = await productionService.performHealthCheck();
      setHealthStatus(health);
      
      const statusEmoji = health.status === 'healthy' ? '✅' : 
                         health.status === 'warning' ? '⚠️' : '❌';
      
      const message = health.checks.map(check => 
        `${check.status === 'pass' ? '✅' : check.status === 'warn' ? '⚠️' : '❌'} ${check.name}: ${check.message}`
      ).join('\n');
      
      Alert.alert(
        `${statusEmoji} État du Système`,
        `Statut global: ${health.status}\n\n${message}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de vérifier l\'état du système');
    }
  };

  const getStatusColor = (status: ProductionStep['status']) => {
    switch (status) {
      case 'completed': return colors.success;
      case 'in-progress': return colors.warning;
      case 'error': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: ProductionStep['status']) => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'in-progress': return 'time';
      case 'error': return 'close-circle';
      default: return 'ellipse-outline';
    }
  };

  const getPriorityColor = (priority: ProductionStep['priority']) => {
    switch (priority) {
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      case 'low': return colors.success;
      default: return colors.textSecondary;
    }
  };

  const categories = [
    { id: 'all', name: 'Tout', icon: 'list' },
    { id: 'backend', name: 'Backend', icon: 'server' },
    { id: 'payment', name: 'Paiements', icon: 'card' },
    { id: 'notifications', name: 'Notifications', icon: 'notifications' },
    { id: 'store', name: 'App Store', icon: 'storefront' },
    { id: 'testing', name: 'Tests', icon: 'bug' },
  ];

  const filteredSteps = selectedCategory === 'all' 
    ? steps 
    : steps.filter(step => step.category === selectedCategory);

  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={commonStyles.headerTitle}>Guide de Production</Text>
        <TouchableOpacity onPress={performHealthCheck}>
          <Icon name="pulse" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Health Status */}
        {healthStatus && (
          <View style={[styles.healthCard, { 
            borderColor: healthStatus.status === 'healthy' ? colors.success : 
                        healthStatus.status === 'warning' ? colors.warning : colors.error 
          }]}>
            <View style={styles.healthHeader}>
              <Icon 
                name={healthStatus.status === 'healthy' ? 'checkmark-circle' : 
                     healthStatus.status === 'warning' ? 'warning' : 'close-circle'} 
                size={20} 
                color={healthStatus.status === 'healthy' ? colors.success : 
                       healthStatus.status === 'warning' ? colors.warning : colors.error} 
              />
              <Text style={styles.healthTitle}>
                État: {healthStatus.status === 'healthy' ? 'Sain' : 
                       healthStatus.status === 'warning' ? 'Attention' : 'Erreur'}
              </Text>
            </View>
          </View>
        )}

        {/* API URL Configuration */}
        {showApiUrlInput && (
          <View style={styles.configCard}>
            <Text style={styles.configTitle}>Configuration API URL</Text>
            <TextInput
              style={styles.configInput}
              value={apiUrl}
              onChangeText={setApiUrl}
              placeholder="https://votre-api-production.com/api"
              placeholderTextColor={colors.textSecondary}
            />
            <View style={styles.configActions}>
              <TouchableOpacity 
                style={[styles.configButton, styles.configButtonSecondary]}
                onPress={() => setShowApiUrlInput(false)}
              >
                <Text style={styles.configButtonTextSecondary}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.configButton}
                onPress={updateApiUrl}
              >
                <Text style={styles.configButtonText}>Mettre à jour</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Progress Overview */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Progression Globale</Text>
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              {completedSteps} / {totalSteps} étapes complétées
            </Text>
            <Text style={styles.progressPercentage}>
              {Math.round(progressPercentage)}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${progressPercentage}%` }
              ]} 
            />
          </View>
        </View>

        {/* Category Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryFilter}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Icon 
                name={category.icon} 
                size={16} 
                color={selectedCategory === category.id ? colors.background : colors.text} 
              />
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === category.id && styles.categoryButtonTextActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Production Steps */}
        <View style={styles.stepsContainer}>
          {filteredSteps.map(step => (
            <TouchableOpacity
              key={step.id}
              style={styles.stepCard}
              onPress={step.action}
            >
              <View style={styles.stepHeader}>
                <View style={styles.stepInfo}>
                  <Icon 
                    name={getStatusIcon(step.status)} 
                    size={20} 
                    color={getStatusColor(step.status)} 
                  />
                  <View style={styles.stepTitleContainer}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <View style={styles.stepMeta}>
                      <View style={[
                        styles.priorityBadge,
                        { backgroundColor: getPriorityColor(step.priority) + '20' }
                      ]}>
                        <Text style={[
                          styles.priorityText,
                          { color: getPriorityColor(step.priority) }
                        ]}>
                          {step.priority === 'high' ? 'Haute' : 
                           step.priority === 'medium' ? 'Moyenne' : 'Basse'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                <Icon name="chevron-forward" size={16} color={colors.textSecondary} />
              </View>
              <Text style={styles.stepDescription}>{step.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Actions Rapides</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => checkCurrentStatus()}
          >
            <Icon name="refresh" size={20} color={colors.primary} />
            <Text style={styles.actionButtonText}>Vérifier le Statut</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Linking.openURL('https://docs.expo.dev/build/setup/')}
          >
            <Icon name="build" size={20} color={colors.primary} />
            <Text style={styles.actionButtonText}>Guide EAS Build</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Linking.openURL('https://docs.expo.dev/submit/introduction/')}
          >
            <Icon name="cloud-upload" size={20} color={colors.primary} />
            <Text style={styles.actionButtonText}>Guide EAS Submit</Text>
          </TouchableOpacity>
        </View>

        {/* Final Checklist */}
        <View style={styles.checklist}>
          <Text style={styles.sectionTitle}>✅ Checklist Finale de Lancement</Text>
          <Text style={styles.checklistDescription}>
            Avant le lancement en production, vérifiez que:
          </Text>
          
          {[
            'Backend déployé et accessible via HTTPS',
            'Base de données PostgreSQL configurée et sécurisée',
            'Au moins un fournisseur de paiement intégré et testé',
            'Notifications push fonctionnelles',
            'Tests utilisateurs terminés avec succès',
            'Audit de sécurité effectué',
            'Assets App Store préparés',
            'Politique de confidentialité et CGU rédigées',
            'Support client mis en place',
            'Monitoring et alertes configurés'
          ].map((item, index) => (
            <View key={index} style={styles.checklistItem}>
              <Icon name="checkmark-circle-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.checklistItemText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Contact Support */}
        <View style={styles.supportCard}>
          <Text style={styles.supportTitle}>🚀 Prêt pour le lancement ?</Text>
          <Text style={styles.supportDescription}>
            Une fois toutes les étapes complétées, votre app Tontine sera prête pour la production !
          </Text>
          <TouchableOpacity 
            style={styles.supportButton}
            onPress={() => Alert.alert(
              'Félicitations! 🎉', 
              'Votre app Tontine est maintenant prête pour le lancement en production!\n\nBonne chance avec votre projet!'
            )}
          >
            <Icon name="rocket" size={20} color={colors.background} />
            <Text style={styles.supportButtonText}>Lancer en Production</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  healthCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
  },
  healthHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  healthTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
  },
  configCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  configTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 12,
  },
  configInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  configActions: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
  },
  configButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center' as const,
    marginLeft: 8,
  },
  configButtonSecondary: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    marginLeft: 0,
    marginRight: 8,
  },
  configButtonText: {
    color: colors.background,
    fontWeight: '600' as const,
  },
  configButtonTextSecondary: {
    color: colors.text,
    fontWeight: '600' as const,
  },
  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: colors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden' as const,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  categoryFilter: {
    marginBottom: 20,
  },
  categoryButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: colors.text,
  },
  categoryButtonTextActive: {
    color: colors.background,
  },
  stepsContainer: {
    marginBottom: 20,
  },
  stepCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 8,
  },
  stepInfo: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  },
  stepTitleContainer: {
    marginLeft: 12,
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 4,
  },
  stepMeta: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  stepDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  quickActions: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionButtonText: {
    marginLeft: 12,
    fontSize: 16,
    color: colors.text,
  },
  checklist: {
    marginBottom: 20,
  },
  checklistDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  checklistItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  checklistItemText: {
    marginLeft: 12,
    fontSize: 14,
    color: colors.text,
    flex: 1,
    lineHeight: 20,
  },
  supportCard: {
    backgroundColor: colors.primary + '10',
    borderRadius: 12,
    padding: 20,
    marginBottom: 40,
    alignItems: 'center' as const,
  },
  supportTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  supportDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 20,
    marginBottom: 20,
  },
  supportButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  supportButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.background,
  },
};
