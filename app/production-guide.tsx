
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { router } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/apiService';
import { notificationService } from '../services/notificationService';

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

  useEffect(() => {
    initializeSteps();
    checkCurrentStatus();
  }, []);

  const initializeSteps = () => {
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
        action: () => showApiUrlGuide(),
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
  };

  const checkCurrentStatus = async () => {
    // Check API connection
    try {
      const response = await apiService.getCurrentUser();
      updateStepStatus('api-url-update', response.success ? 'completed' : 'error');
    } catch (error) {
      console.log('API check failed:', error);
      updateStepStatus('api-url-update', 'error');
    }

    // Check notification permissions
    try {
      const result = await notificationService.initialize();
      updateStepStatus('expo-notifications', result.success ? 'completed' : 'error');
    } catch (error) {
      console.log('Notification check failed:', error);
      updateStepStatus('expo-notifications', 'error');
    }
  };

  const updateStepStatus = (stepId: string, status: ProductionStep['status']) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ));
  };

  const showBackendGuide = () => {
    Alert.alert(
      'Déploiement Backend',
      'Options de déploiement recommandées:\n\n' +
      '• Heroku (facile, payant)\n' +
      '• DigitalOcean (flexible, abordable)\n' +
      '• AWS/GCP (scalable, complexe)\n' +
      '• VPS local (contrôle total)\n\n' +
      'Assurez-vous d\'avoir:\n' +
      '• HTTPS activé\n' +
      '• Variables d\'environnement sécurisées\n' +
      '• Monitoring et logs\n' +
      '• Sauvegardes automatiques',
      [{ text: 'Compris' }]
    );
  };

  const showApiUrlGuide = () => {
    Alert.alert(
      'Configuration API URL',
      'Dans services/apiService.ts, remplacez:\n\n' +
      'const API_BASE_URL = __DEV__ \n' +
      '  ? \'http://localhost:3000/api\' \n' +
      '  : \'https://your-production-api.com/api\';\n\n' +
      'Par votre URL de production réelle.',
      [
        { text: 'Annuler' },
        { text: 'Ouvrir le fichier', onPress: () => router.push('/settings') }
      ]
    );
  };

  const showDatabaseGuide = () => {
    Alert.alert(
      'Configuration Base de Données',
      'Pour PostgreSQL en production:\n\n' +
      '• Utilisez un service managé (AWS RDS, DigitalOcean)\n' +
      '• Configurez les sauvegardes automatiques\n' +
      '• Activez SSL/TLS\n' +
      '• Configurez la réplication si nécessaire\n' +
      '• Surveillez les performances',
      [{ text: 'Compris' }]
    );
  };

  const showOrangeApiGuide = () => {
    Alert.alert(
      'API Orange Money',
      'Étapes pour intégrer Orange Money:\n\n' +
      '1. Contactez Orange Côte d\'Ivoire\n' +
      '2. Demandez l\'accès à l\'API Orange Money\n' +
      '3. Obtenez vos clés API (client_id, client_secret)\n' +
      '4. Testez en mode sandbox\n' +
      '5. Demandez l\'activation en production\n\n' +
      'Documentation: developer.orange.com',
      [
        { text: 'Annuler' },
        { text: 'Ouvrir le site', onPress: () => Linking.openURL('https://developer.orange.com') }
      ]
    );
  };

  const showMtnApiGuide = () => {
    Alert.alert(
      'API MTN Mobile Money',
      'Étapes pour intégrer MTN MoMo:\n\n' +
      '1. Visitez momodeveloper.mtn.com\n' +
      '2. Créez un compte développeur\n' +
      '3. Souscrivez au produit Collections\n' +
      '4. Obtenez vos clés API\n' +
      '5. Testez en sandbox\n' +
      '6. Demandez l\'accès production\n\n' +
      'Frais: ~2-3% par transaction',
      [
        { text: 'Annuler' },
        { text: 'Ouvrir le site', onPress: () => Linking.openURL('https://momodeveloper.mtn.com') }
      ]
    );
  };

  const showWaveApiGuide = () => {
    Alert.alert(
      'API Wave',
      'Étapes pour intégrer Wave:\n\n' +
      '1. Contactez Wave directement\n' +
      '2. Présentez votre projet tontine\n' +
      '3. Négociez les conditions\n' +
      '4. Obtenez l\'accès API\n' +
      '5. Intégrez et testez\n\n' +
      'Wave est généralement plus ouvert aux fintechs locales.',
      [{ text: 'Compris' }]
    );
  };

  const showPaymentSecurityGuide = () => {
    Alert.alert(
      'Sécurité des Paiements',
      'Mesures de sécurité essentielles:\n\n' +
      '• Chiffrement des données sensibles\n' +
      '• Validation côté serveur\n' +
      '• Logs d\'audit des transactions\n' +
      '• Détection de fraude\n' +
      '• Conformité PCI DSS\n' +
      '• Tests de pénétration',
      [{ text: 'Compris' }]
    );
  };

  const showFirebaseGuide = () => {
    Alert.alert(
      'Configuration Firebase',
      'Étapes pour Firebase Cloud Messaging:\n\n' +
      '1. Créez un projet Firebase\n' +
      '2. Ajoutez vos apps iOS/Android\n' +
      '3. Téléchargez google-services.json\n' +
      '4. Configurez les certificats push iOS\n' +
      '5. Testez les notifications\n\n' +
      'Alternative: Utilisez Expo Push Notifications',
      [
        { text: 'Annuler' },
        { text: 'Ouvrir Firebase', onPress: () => Linking.openURL('https://console.firebase.google.com') }
      ]
    );
  };

  const testNotifications = async () => {
    try {
      const result = await notificationService.initialize();
      if (result.success) {
        await notificationService.scheduleLocalNotification({
          title: 'Test de notification',
          body: 'Les notifications fonctionnent correctement!',
          trigger: { seconds: 2 }
        });
        updateStepStatus('expo-notifications', 'completed');
        Alert.alert('Succès', 'Notification de test programmée!');
      } else {
        updateStepStatus('expo-notifications', 'error');
        Alert.alert('Erreur', result.error || 'Échec du test de notification');
      }
    } catch (error) {
      updateStepStatus('expo-notifications', 'error');
      Alert.alert('Erreur', 'Échec du test de notification');
    }
  };

  const showAppStoreAssetsGuide = () => {
    Alert.alert(
      'Assets App Store',
      'Préparez ces éléments:\n\n' +
      '• Icône app (1024x1024px)\n' +
      '• Captures d\'écran (différentes tailles)\n' +
      '• Description de l\'app\n' +
      '• Mots-clés pour le SEO\n' +
      '• Politique de confidentialité\n' +
      '• Conditions d\'utilisation',
      [{ text: 'Compris' }]
    );
  };

  const showIosSubmissionGuide = () => {
    Alert.alert(
      'Soumission iOS',
      'Étapes pour l\'App Store:\n\n' +
      '1. Compte Apple Developer (99$/an)\n' +
      '2. Configurez App Store Connect\n' +
      '3. Créez l\'app record\n' +
      '4. Build avec EAS Build\n' +
      '5. Upload via Transporter\n' +
      '6. Soumettez pour review\n\n' +
      'Délai de review: 1-7 jours',
      [{ text: 'Compris' }]
    );
  };

  const showAndroidSubmissionGuide = () => {
    Alert.alert(
      'Soumission Android',
      'Étapes pour Google Play:\n\n' +
      '1. Compte Google Play Console (25$ unique)\n' +
      '2. Créez l\'app dans la console\n' +
      '3. Build AAB avec EAS Build\n' +
      '4. Upload et configurez\n' +
      '5. Soumettez pour review\n\n' +
      'Délai de review: quelques heures',
      [{ text: 'Compris' }]
    );
  };

  const showUserTestingGuide = () => {
    Alert.alert(
      'Tests Utilisateurs',
      'Plan de test recommandé:\n\n' +
      '• 5-10 cercles de test\n' +
      '• 50-100 utilisateurs beta\n' +
      '• Testez tous les scénarios\n' +
      '• Collectez les feedbacks\n' +
      '• Mesurez les performances\n' +
      '• Corrigez les bugs critiques',
      [{ text: 'Compris' }]
    );
  };

  const showPaymentTestingGuide = () => {
    Alert.alert(
      'Tests de Paiement',
      'Tests essentiels:\n\n' +
      '• Paiements réussis\n' +
      '• Paiements échoués\n' +
      '• Timeouts et reconnexions\n' +
      '• Remboursements\n' +
      '• Concurrence (plusieurs paiements)\n' +
      '• Montants limites\n\n' +
      'Utilisez les environnements sandbox!',
      [{ text: 'Compris' }]
    );
  };

  const showSecurityAuditGuide = () => {
    Alert.alert(
      'Audit de Sécurité',
      'Points à vérifier:\n\n' +
      '• Authentification sécurisée\n' +
      '• Chiffrement des données\n' +
      '• Protection contre OWASP Top 10\n' +
      '• Tests de pénétration\n' +
      '• Audit du code\n' +
      '• Conformité réglementaire',
      [{ text: 'Compris' }]
    );
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
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
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

        {/* Production Checklist */}
        <View style={styles.checklist}>
          <Text style={styles.sectionTitle}>Checklist Finale</Text>
          <Text style={styles.checklistDescription}>
            Avant le lancement en production, assurez-vous que:
          </Text>
          
          {[
            'Tous les tests sont passés avec succès',
            'Les API de paiement sont configurées et testées',
            'Les notifications push fonctionnent',
            'La base de données est sécurisée et sauvegardée',
            'L\'audit de sécurité est terminé',
            'Les conditions d\'utilisation sont prêtes',
            'Le support client est en place',
            'Le monitoring est configuré'
          ].map((item, index) => (
            <View key={index} style={styles.checklistItem}>
              <Icon name="checkmark-circle-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.checklistItemText}>{item}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
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
    marginBottom: 40,
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
};
