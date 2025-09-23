
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { router } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { useSync } from '../hooks/useSync';
import { storageService } from '../services/storageService';
import { productionService } from '../services/productionService';
import { commonStyles, colors } from '../styles/commonStyles';

export default function SettingsScreen() {
  const { authState, logout } = useAuth();
  const { scheduleNotification, cancelNotification } = useNotifications();
  const { syncStatus, syncData } = useSync();
  const [notifications, setNotifications] = useState({
    paymentReminders: true,
    tontineUpdates: true,
    payoutNotifications: true,
    marketingEmails: false,
  });
  const [preferences, setPreferences] = useState({
    darkMode: false,
    biometricAuth: false,
    autoSync: true,
    offlineMode: false,
  });
  const [storageInfo, setStorageInfo] = useState({
    totalSize: 0,
    cacheSize: 0,
    userDataSize: 0,
  });
  const [isProduction, setIsProduction] = useState(false);

  useEffect(() => {
    loadSettings();
    getStorageSize();
    checkProductionStatus();
  }, []);

  const loadSettings = async () => {
    try {
      const savedNotifications = await storageService.getItem('notification_settings');
      const savedPreferences = await storageService.getItem('user_preferences');
      
      if (savedNotifications) {
        setNotifications(savedNotifications);
      }
      if (savedPreferences) {
        setPreferences(savedPreferences);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      await storageService.setItem('notification_settings', notifications);
      await storageService.setItem('user_preferences', preferences);
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const getStorageSize = async () => {
    try {
      const totalSize = await storageService.getTotalStorageSize();
      const cacheSize = await storageService.getCacheSize();
      const userDataSize = totalSize - cacheSize;
      
      setStorageInfo({
        totalSize,
        cacheSize,
        userDataSize,
      });
    } catch (error) {
      console.error('Failed to get storage size:', error);
    }
  };

  const checkProductionStatus = async () => {
    try {
      await productionService.initialize();
      setIsProduction(productionService.isProduction());
    } catch (error) {
      console.error('Failed to check production status:', error);
    }
  };

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    const newNotifications = { ...notifications, [key]: !notifications[key] };
    setNotifications(newNotifications);
    saveSettings();
  };

  const handlePreferenceToggle = (key: keyof typeof preferences) => {
    const newPreferences = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPreferences);
    saveSettings();
  };

  const handleForceSync = async () => {
    try {
      Alert.alert(
        'Synchronisation forcée',
        'Voulez-vous synchroniser toutes les données maintenant ?',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Synchroniser',
            onPress: async () => {
              await syncData();
              Alert.alert('Succès', 'Synchronisation terminée');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Échec de la synchronisation');
    }
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Vider le cache',
      'Cette action supprimera les données temporaires. Continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Vider',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.clearCache();
              await getStorageSize();
              Alert.alert('Succès', 'Cache vidé avec succès');
            } catch (error) {
              Alert.alert('Erreur', 'Échec du vidage du cache');
            }
          },
        },
      ]
    );
  };

  const handleExportData = async () => {
    try {
      const userData = await storageService.exportUserData();
      Alert.alert(
        'Données exportées',
        'Vos données ont été préparées pour l\'exportation.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Échec de l\'exportation des données');
    }
  };

  const handleResetApp = () => {
    Alert.alert(
      'Réinitialiser l\'application',
      'Cette action supprimera toutes les données locales. Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réinitialiser',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.clearAll();
              await logout();
              router.replace('/welcome');
            } catch (error) {
              Alert.alert('Erreur', 'Échec de la réinitialisation');
            }
          },
        },
      ]
    );
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={commonStyles.headerTitle}>Paramètres</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Production Status */}
        {isProduction && (
          <View style={styles.productionBanner}>
            <Icon name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.productionText}>Mode Production Actif</Text>
          </View>
        )}

        {/* Production Guide */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Déploiement</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/production-guide')}
          >
            <View style={styles.settingLeft}>
              <Icon name="rocket" size={20} color={colors.primary} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Guide de Production</Text>
                <Text style={styles.settingDescription}>
                  Préparez votre app pour le déploiement
                </Text>
              </View>
            </View>
            <Icon name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={async () => {
              try {
                const health = await productionService.performHealthCheck();
                Alert.alert(
                  'État du Système',
                  `Statut: ${health.status}\n\n` +
                  health.checks.map(check => 
                    `${check.name}: ${check.status === 'pass' ? '✅' : check.status === 'warn' ? '⚠️' : '❌'} ${check.message}`
                  ).join('\n'),
                  [{ text: 'OK' }]
                );
              } catch (error) {
                Alert.alert('Erreur', 'Impossible de vérifier l\'état du système');
              }
            }}
          >
            <View style={styles.settingLeft}>
              <Icon name="pulse" size={20} color={colors.warning} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Vérification Système</Text>
                <Text style={styles.settingDescription}>
                  Vérifiez l'état de tous les services
                </Text>
              </View>
            </View>
            <Icon name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="notifications" size={20} color={colors.primary} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Rappels de paiement</Text>
                <Text style={styles.settingDescription}>
                  Notifications avant les échéances
                </Text>
              </View>
            </View>
            <Switch
              value={notifications.paymentReminders}
              onValueChange={() => handleNotificationToggle('paymentReminders')}
              trackColor={{ false: colors.border, true: colors.primary + '40' }}
              thumbColor={notifications.paymentReminders ? colors.primary : colors.textSecondary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="people" size={20} color={colors.primary} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Mises à jour tontine</Text>
                <Text style={styles.settingDescription}>
                  Nouveaux membres, paiements reçus
                </Text>
              </View>
            </View>
            <Switch
              value={notifications.tontineUpdates}
              onValueChange={() => handleNotificationToggle('tontineUpdates')}
              trackColor={{ false: colors.border, true: colors.primary + '40' }}
              thumbColor={notifications.tontineUpdates ? colors.primary : colors.textSecondary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="cash" size={20} color={colors.primary} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Notifications de gain</Text>
                <Text style={styles.settingDescription}>
                  Quand vous recevez la cagnotte
                </Text>
              </View>
            </View>
            <Switch
              value={notifications.payoutNotifications}
              onValueChange={() => handleNotificationToggle('payoutNotifications')}
              trackColor={{ false: colors.border, true: colors.primary + '40' }}
              thumbColor={notifications.payoutNotifications ? colors.primary : colors.textSecondary}
            />
          </View>
        </View>

        {/* Préférences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Préférences</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="sync" size={20} color={colors.primary} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Synchronisation auto</Text>
                <Text style={styles.settingDescription}>
                  Synchroniser automatiquement les données
                </Text>
              </View>
            </View>
            <Switch
              value={preferences.autoSync}
              onValueChange={() => handlePreferenceToggle('autoSync')}
              trackColor={{ false: colors.border, true: colors.primary + '40' }}
              thumbColor={preferences.autoSync ? colors.primary : colors.textSecondary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="cloud-offline" size={20} color={colors.primary} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Mode hors ligne</Text>
                <Text style={styles.settingDescription}>
                  Utiliser l'app sans connexion
                </Text>
              </View>
            </View>
            <Switch
              value={preferences.offlineMode}
              onValueChange={() => handlePreferenceToggle('offlineMode')}
              trackColor={{ false: colors.border, true: colors.primary + '40' }}
              thumbColor={preferences.offlineMode ? colors.primary : colors.textSecondary}
            />
          </View>
        </View>

        {/* Stockage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stockage</Text>
          
          <View style={styles.storageInfo}>
            <View style={styles.storageItem}>
              <Text style={styles.storageLabel}>Données utilisateur</Text>
              <Text style={styles.storageValue}>{formatBytes(storageInfo.userDataSize)}</Text>
            </View>
            <View style={styles.storageItem}>
              <Text style={styles.storageLabel}>Cache</Text>
              <Text style={styles.storageValue}>{formatBytes(storageInfo.cacheSize)}</Text>
            </View>
            <View style={styles.storageItem}>
              <Text style={styles.storageLabel}>Total</Text>
              <Text style={[styles.storageValue, { fontWeight: '600' }]}>
                {formatBytes(storageInfo.totalSize)}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.settingItem} onPress={handleForceSync}>
            <View style={styles.settingLeft}>
              <Icon name="refresh" size={20} color={colors.primary} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Synchronisation forcée</Text>
                <Text style={styles.settingDescription}>
                  Statut: {syncStatus}
                </Text>
              </View>
            </View>
            <Icon name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleClearCache}>
            <View style={styles.settingLeft}>
              <Icon name="trash" size={20} color={colors.warning} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Vider le cache</Text>
                <Text style={styles.settingDescription}>
                  Libérer de l'espace de stockage
                </Text>
              </View>
            </View>
            <Icon name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Données */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Données</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleExportData}>
            <View style={styles.settingLeft}>
              <Icon name="download" size={20} color={colors.primary} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Exporter mes données</Text>
                <Text style={styles.settingDescription}>
                  Télécharger une copie de vos données
                </Text>
              </View>
            </View>
            <Icon name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleResetApp}>
            <View style={styles.settingLeft}>
              <Icon name="warning" size={20} color={colors.error} />
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: colors.error }]}>
                  Réinitialiser l'application
                </Text>
                <Text style={styles.settingDescription}>
                  Supprimer toutes les données locales
                </Text>
              </View>
            </View>
            <Icon name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Informations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Version de l'app</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Environnement</Text>
            <Text style={styles.infoValue}>
              {isProduction ? 'Production' : 'Développement'}
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Utilisateur connecté</Text>
            <Text style={styles.infoValue}>{authState.user?.phoneNumber}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  productionBanner: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: colors.success + '20',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  productionText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.success,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  },
  settingInfo: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  storageInfo: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  storageItem: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },
  storageLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  storageValue: {
    fontSize: 14,
    color: colors.text,
  },
  infoItem: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500' as const,
  },
};
