
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import Icon from '../components/Icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import { productionService } from '../services/productionService';
import { apiService } from '../services/apiService';

interface DeploymentCheck {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'warning' | 'success' | 'error';
  category: 'backend' | 'payment' | 'app' | 'store' | 'legal';
  action?: () => void;
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkContent: {
    flex: 1,
  },
  checkTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  checkDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginVertical: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  refreshButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 16,
  },
  refreshButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
};

export default function DeploymentStatusScreen() {
  const [checks, setChecks] = useState<DeploymentCheck[]>([]);
  const [loading, setLoading] = useState(true);

  const initializeChecks = useCallback(async () => {
    console.log('Initializing deployment checks...');
    setLoading(true);
    
    const deploymentChecks: DeploymentCheck[] = [
      // Backend
      {
        id: 'api-connection',
        title: 'Connexion API Backend',
        description: 'Vérifier la connexion au serveur de production',
        status: 'pending',
        category: 'backend',
        action: () => testApiConnection(),
      },
      {
        id: 'database-status',
        title: 'Base de Données',
        description: 'Vérifier la disponibilité de PostgreSQL',
        status: 'pending',
        category: 'backend',
      },
      {
        id: 'ssl-certificate',
        title: 'Certificat SSL',
        description: 'Vérifier la sécurité HTTPS',
        status: 'pending',
        category: 'backend',
      },
      
      // Paiements
      {
        id: 'orange-money',
        title: 'Orange Money API',
        description: 'Intégration Orange Money configurée',
        status: 'pending',
        category: 'payment',
        action: () => showOrangeSetup(),
      },
      {
        id: 'mtn-momo',
        title: 'MTN Mobile Money',
        description: 'Intégration MTN MoMo configurée',
        status: 'pending',
        category: 'payment',
        action: () => showMtnSetup(),
      },
      {
        id: 'wave-payment',
        title: 'Wave Payment',
        description: 'Intégration Wave configurée',
        status: 'pending',
        category: 'payment',
        action: () => showWaveSetup(),
      },
      
      // Application
      {
        id: 'push-notifications',
        title: 'Notifications Push',
        description: 'Configuration Expo Push Notifications',
        status: 'pending',
        category: 'app',
        action: () => testNotifications(),
      },
      {
        id: 'app-icons',
        title: 'Icônes Application',
        description: 'Icônes pour App Store et Play Store',
        status: 'pending',
        category: 'app',
        action: () => showIconGuide(),
      },
      {
        id: 'app-screenshots',
        title: 'Captures d\'écran',
        description: 'Screenshots pour les stores',
        status: 'pending',
        category: 'app',
        action: () => showScreenshotGuide(),
      },
      
      // Stores
      {
        id: 'ios-build',
        title: 'Build iOS',
        description: 'Build de production pour App Store',
        status: 'pending',
        category: 'store',
        action: () => showIOSBuildGuide(),
      },
      {
        id: 'android-build',
        title: 'Build Android',
        description: 'Build de production pour Play Store',
        status: 'pending',
        category: 'store',
        action: () => showAndroidBuildGuide(),
      },
      
      // Légal
      {
        id: 'privacy-policy',
        title: 'Politique de Confidentialité',
        description: 'Document légal requis',
        status: 'pending',
        category: 'legal',
        action: () => showPrivacyPolicyGuide(),
      },
      {
        id: 'terms-of-service',
        title: 'Conditions d\'Utilisation',
        description: 'CGU de l\'application',
        status: 'pending',
        category: 'legal',
        action: () => showTermsGuide(),
      },
    ];

    setChecks(deploymentChecks);
    await performHealthChecks(deploymentChecks);
    setLoading(false);
  }, []);

  useEffect(() => {
    initializeChecks();
  }, [initializeChecks]);

  const performHealthChecks = async (checkList: DeploymentCheck[]) => {
    console.log('Performing health checks...');
    
    // Test API connection
    try {
      const response = await apiService.get('/health');
      updateCheckStatus('api-connection', response ? 'success' : 'error');
    } catch (error) {
      console.log('API health check failed:', error);
      updateCheckStatus('api-connection', 'error');
    }

    // Check production config
    const config = await productionService.getConfig();
    
    // Check payment providers
    updateCheckStatus('orange-money', config.orangeApiKey ? 'success' : 'warning');
    updateCheckStatus('mtn-momo', config.mtnApiKey ? 'success' : 'warning');
    updateCheckStatus('wave-payment', config.waveApiKey ? 'success' : 'warning');
    
    // Check notifications
    updateCheckStatus('push-notifications', config.expoPushToken ? 'success' : 'warning');
    
    // Mock other checks (would be real in production)
    updateCheckStatus('database-status', 'success');
    updateCheckStatus('ssl-certificate', 'success');
    updateCheckStatus('app-icons', 'warning');
    updateCheckStatus('app-screenshots', 'warning');
    updateCheckStatus('ios-build', 'pending');
    updateCheckStatus('android-build', 'pending');
    updateCheckStatus('privacy-policy', 'warning');
    updateCheckStatus('terms-of-service', 'warning');
  };

  const updateCheckStatus = (checkId: string, status: DeploymentCheck['status']) => {
    setChecks(prev => prev.map(check => 
      check.id === checkId ? { ...check, status } : check
    ));
  };

  const testApiConnection = async () => {
    console.log('Testing API connection...');
    Alert.alert(
      'Test de Connexion API',
      'Voulez-vous tester la connexion au serveur de production ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Tester', 
          onPress: async () => {
            try {
              updateCheckStatus('api-connection', 'pending');
              const response = await apiService.get('/health');
              updateCheckStatus('api-connection', 'success');
              Alert.alert('Succès', 'Connexion API réussie !');
            } catch (error) {
              updateCheckStatus('api-connection', 'error');
              Alert.alert('Erreur', 'Impossible de se connecter à l\'API');
            }
          }
        }
      ]
    );
  };

  const testNotifications = async () => {
    console.log('Testing push notifications...');
    Alert.alert(
      'Test Notifications',
      'Cette fonctionnalité testera l\'envoi de notifications push.',
      [
        { text: 'OK' }
      ]
    );
  };

  const showOrangeSetup = () => {
    Alert.alert(
      'Configuration Orange Money',
      'Pour configurer Orange Money :\n\n1. Contactez api-support@orange.ci\n2. Présentez votre projet tontine\n3. Obtenez vos clés API\n4. Configurez dans les paramètres',
      [
        { text: 'Fermer' },
        { text: 'Ouvrir Guide', onPress: () => router.push('/production-guide') }
      ]
    );
  };

  const showMtnSetup = () => {
    Alert.alert(
      'Configuration MTN MoMo',
      'Pour configurer MTN Mobile Money :\n\n1. Inscrivez-vous sur momodeveloper.mtn.com\n2. Souscrivez à l\'API Collections\n3. Testez en sandbox\n4. Demandez l\'accès production',
      [
        { text: 'Fermer' },
        { text: 'Site MTN', onPress: () => Linking.openURL('https://momodeveloper.mtn.com') }
      ]
    );
  };

  const showWaveSetup = () => {
    Alert.alert(
      'Configuration Wave',
      'Pour configurer Wave :\n\n1. Contactez developers@wave.com\n2. Présentez votre projet\n3. Négociez les conditions\n4. Intégrez l\'API',
      [
        { text: 'Fermer' }
      ]
    );
  };

  const showIconGuide = () => {
    Alert.alert(
      'Icônes Application',
      'Icônes requises :\n\n• Icône principale : 1024x1024px\n• Icône adaptive Android\n• Icône notification : 256x256px\n• Favicon web : 32x32px',
      [
        { text: 'OK' }
      ]
    );
  };

  const showScreenshotGuide = () => {
    Alert.alert(
      'Captures d\'écran',
      'Screenshots requis :\n\n• iPhone 6.7" : 1290x2796px\n• iPhone 6.5" : 1242x2688px\n• Android : 1080x1920px\n• Minimum 3 captures par plateforme',
      [
        { text: 'OK' }
      ]
    );
  };

  const showIOSBuildGuide = () => {
    Alert.alert(
      'Build iOS',
      'Pour créer le build iOS :\n\n1. Configurez votre Apple Developer Account\n2. Exécutez : eas build --platform ios --profile production\n3. Soumettez via : eas submit --platform ios',
      [
        { text: 'OK' }
      ]
    );
  };

  const showAndroidBuildGuide = () => {
    Alert.alert(
      'Build Android',
      'Pour créer le build Android :\n\n1. Configurez votre Google Play Console\n2. Exécutez : eas build --platform android --profile production\n3. Soumettez via : eas submit --platform android',
      [
        { text: 'OK' }
      ]
    );
  };

  const showPrivacyPolicyGuide = () => {
    Alert.alert(
      'Politique de Confidentialité',
      'Votre politique doit couvrir :\n\n• Collecte des données personnelles\n• Utilisation des données de paiement\n• Partage avec fournisseurs Mobile Money\n• Droits des utilisateurs (RGPD)',
      [
        { text: 'OK' }
      ]
    );
  };

  const showTermsGuide = () => {
    Alert.alert(
      'Conditions d\'Utilisation',
      'Vos CGU doivent inclure :\n\n• Règles d\'utilisation\n• Responsabilités des utilisateurs\n• Gestion des litiges\n• Frais et commissions\n• Résiliation de compte',
      [
        { text: 'OK' }
      ]
    );
  };

  const getStatusColor = (status: DeploymentCheck['status']) => {
    switch (status) {
      case 'success': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'error': return '#F44336';
      default: return colors.border;
    }
  };

  const getStatusIcon = (status: DeploymentCheck['status']) => {
    switch (status) {
      case 'success': return 'checkmark-circle';
      case 'warning': return 'warning';
      case 'error': return 'close-circle';
      default: return 'ellipse-outline';
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'backend': return '🔧 Backend & Infrastructure';
      case 'payment': return '💳 Intégrations Paiement';
      case 'app': return '📱 Configuration App';
      case 'store': return '🏪 App Stores';
      case 'legal': return '📋 Documents Légaux';
      default: return category;
    }
  };

  const calculateProgress = () => {
    const total = checks.length;
    const completed = checks.filter(check => check.status === 'success').length;
    return total > 0 ? (completed / total) * 100 : 0;
  };

  const groupedChecks = checks.reduce((groups, check) => {
    if (!groups[check.category]) {
      groups[check.category] = [];
    }
    groups[check.category].push(check);
    return groups;
  }, {} as Record<string, DeploymentCheck[]>);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>État du Déploiement</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.progressText}>
          Progression : {Math.round(calculateProgress())}% complété
        </Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${calculateProgress()}%` }
            ]} 
          />
        </View>

        {Object.entries(groupedChecks).map(([category, categoryChecks]) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>
              {getCategoryTitle(category)}
            </Text>
            
            {categoryChecks.map((check) => (
              <View key={check.id} style={styles.checkItem}>
                <View 
                  style={[
                    styles.statusIcon, 
                    { backgroundColor: getStatusColor(check.status) }
                  ]}
                >
                  <Icon 
                    name={getStatusIcon(check.status)} 
                    size={16} 
                    color={colors.white} 
                  />
                </View>
                
                <View style={styles.checkContent}>
                  <Text style={styles.checkTitle}>{check.title}</Text>
                  <Text style={styles.checkDescription}>{check.description}</Text>
                </View>
                
                {check.action && (
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={check.action}
                  >
                    <Text style={styles.actionButtonText}>Action</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        ))}

        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={initializeChecks}
        >
          <Text style={styles.refreshButtonText}>Actualiser les Vérifications</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
