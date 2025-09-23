
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Icon from '../components/Icon';
import { useAuth } from '../hooks/useAuth';
import { useSync } from '../hooks/useSync';
import { useNotifications } from '../hooks/useNotifications';
import { storageService } from '../services/storageService';
import { commonStyles, colors } from '../styles/commonStyles';

export default function SettingsScreen() {
  const { logout } = useAuth();
  const { performSync, isOnline, lastSync, isSyncing } = useSync();
  const { cancelAllNotifications } = useNotifications();
  
  const [notifications, setNotifications] = useState({
    paymentReminders: true,
    roundComplete: true,
    invitations: true,
    marketing: false,
  });

  const [preferences, setPreferences] = useState({
    autoSync: true,
    offlineMode: false,
    biometricAuth: false,
  });

  const [storageSize, setStorageSize] = useState<number>(0);

  useEffect(() => {
    loadSettings();
    getStorageSize();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsResult = await storageService.getSettings();
      if (settingsResult.success && settingsResult.data) {
        const settings = settingsResult.data;
        if (settings.notifications) {
          setNotifications({ ...notifications, ...settings.notifications });
        }
        if (settings.preferences) {
          setPreferences({ ...preferences, ...settings.preferences });
        }
      }
      console.log('Settings loaded');
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      await storageService.storeSettings({
        notifications,
        preferences,
      });
      console.log('Settings saved');
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const getStorageSize = async () => {
    try {
      const result = await storageService.getStorageSize();
      if (result.success && result.size !== undefined) {
        setStorageSize(result.size);
      }
    } catch (error) {
      console.error('Failed to get storage size:', error);
    }
  };

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    const newNotifications = { ...notifications, [key]: !notifications[key] };
    setNotifications(newNotifications);
    saveSettings();
    console.log('Notification setting toggled:', key, newNotifications[key]);
  };

  const handlePreferenceToggle = (key: keyof typeof preferences) => {
    const newPreferences = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPreferences);
    saveSettings();
    console.log('Preference setting toggled:', key, newPreferences[key]);
  };

  const handleForceSync = async () => {
    try {
      console.log('Force sync requested');
      const result = await performSync(true);
      
      if (result.success) {
        Alert.alert('Succès', 'Synchronisation terminée avec succès');
      } else {
        Alert.alert('Erreur', result.error || 'Échec de la synchronisation');
      }
    } catch (error) {
      console.error('Force sync error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la synchronisation');
    }
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Vider le cache',
      'Cette action supprimera toutes les données mises en cache. Êtes-vous sûr ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Vider',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear non-essential data but keep user auth
              await storageService.removeData('tontines');
              await storageService.removeData('payments');
              await storageService.removeData('notifications');
              
              await getStorageSize();
              Alert.alert('Succès', 'Cache vidé avec succès');
              console.log('Cache cleared');
            } catch (error) {
              console.error('Failed to clear cache:', error);
              Alert.alert('Erreur', 'Impossible de vider le cache');
            }
          },
        },
      ]
    );
  };

  const handleExportData = async () => {
    try {
      console.log('Data export requested');
      const result = await storageService.exportData();
      
      if (result.success && result.data) {
        // In a real app, you would share this data or save to file
        Alert.alert(
          'Export réussi',
          'Vos données ont été exportées. Dans une version complète, elles seraient sauvegardées dans un fichier.',
          [
            {
              text: 'OK',
              onPress: () => console.log('Export data length:', result.data?.length),
            },
          ]
        );
      } else {
        Alert.alert('Erreur', result.error || 'Échec de l\'export');
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'export');
    }
  };

  const handleResetApp = () => {
    Alert.alert(
      'Réinitialiser l\'application',
      'Cette action supprimera toutes vos données et vous déconnectera. Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réinitialiser',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelAllNotifications();
              await storageService.clearAllData();
              await logout();
              console.log('App reset completed');
            } catch (error) {
              console.error('App reset error:', error);
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
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView style={commonStyles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={commonStyles.container}>
          {/* Header */}
          <View style={commonStyles.header}>
            <TouchableOpacity
              style={commonStyles.backButton}
              onPress={() => router.back()}
            >
              <Icon name="arrow-left" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={commonStyles.title}>Paramètres</Text>
          </View>

          {/* Sync Status */}
          <View style={commonStyles.card}>
            <View style={commonStyles.row}>
              <Text style={commonStyles.label}>État de connexion</Text>
              <View style={commonStyles.statusIndicator}>
                <View style={[
                  commonStyles.statusDot,
                  { backgroundColor: isOnline ? colors.success : colors.error }
                ]} />
                <Text style={commonStyles.statusText}>
                  {isOnline ? 'En ligne' : 'Hors ligne'}
                </Text>
              </View>
            </View>
            
            {lastSync && (
              <View style={commonStyles.row}>
                <Text style={commonStyles.label}>Dernière sync</Text>
                <Text style={commonStyles.value}>
                  {lastSync.toLocaleString('fr-FR')}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[commonStyles.button, commonStyles.secondaryButton]}
              onPress={handleForceSync}
              disabled={isSyncing}
            >
              <Text style={commonStyles.buttonText}>
                {isSyncing ? 'Synchronisation...' : 'Synchroniser maintenant'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Notifications */}
          <View style={commonStyles.section}>
            <Text style={commonStyles.sectionTitle}>Notifications</Text>
            
            <View style={commonStyles.settingItem}>
              <View>
                <Text style={commonStyles.settingLabel}>Rappels de paiement</Text>
                <Text style={commonStyles.settingDescription}>
                  Recevoir des rappels avant les échéances
                </Text>
              </View>
              <Switch
                value={notifications.paymentReminders}
                onValueChange={() => handleNotificationToggle('paymentReminders')}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>

            <View style={commonStyles.settingItem}>
              <View>
                <Text style={commonStyles.settingLabel}>Fin de tour</Text>
                <Text style={commonStyles.settingDescription}>
                  Notifications quand un tour se termine
                </Text>
              </View>
              <Switch
                value={notifications.roundComplete}
                onValueChange={() => handleNotificationToggle('roundComplete')}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>

            <View style={commonStyles.settingItem}>
              <View>
                <Text style={commonStyles.settingLabel}>Invitations</Text>
                <Text style={commonStyles.settingDescription}>
                  Notifications pour les nouvelles invitations
                </Text>
              </View>
              <Switch
                value={notifications.invitations}
                onValueChange={() => handleNotificationToggle('invitations')}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>
          </View>

          {/* Preferences */}
          <View style={commonStyles.section}>
            <Text style={commonStyles.sectionTitle}>Préférences</Text>
            
            <View style={commonStyles.settingItem}>
              <View>
                <Text style={commonStyles.settingLabel}>Synchronisation automatique</Text>
                <Text style={commonStyles.settingDescription}>
                  Synchroniser automatiquement les données
                </Text>
              </View>
              <Switch
                value={preferences.autoSync}
                onValueChange={() => handlePreferenceToggle('autoSync')}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>

            <View style={commonStyles.settingItem}>
              <View>
                <Text style={commonStyles.settingLabel}>Mode hors ligne</Text>
                <Text style={commonStyles.settingDescription}>
                  Utiliser l'app sans connexion internet
                </Text>
              </View>
              <Switch
                value={preferences.offlineMode}
                onValueChange={() => handlePreferenceToggle('offlineMode')}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>
          </View>

          {/* Storage & Data */}
          <View style={commonStyles.section}>
            <Text style={commonStyles.sectionTitle}>Stockage et données</Text>
            
            <View style={commonStyles.row}>
              <Text style={commonStyles.label}>Espace utilisé</Text>
              <Text style={commonStyles.value}>{formatBytes(storageSize)}</Text>
            </View>

            <TouchableOpacity
              style={commonStyles.settingButton}
              onPress={handleForceSync}
            >
              <Icon name="refresh-cw" size={20} color={colors.primary} />
              <Text style={commonStyles.settingButtonText}>Actualiser les données</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={commonStyles.settingButton}
              onPress={handleClearCache}
            >
              <Icon name="trash-2" size={20} color={colors.warning} />
              <Text style={[commonStyles.settingButtonText, { color: colors.warning }]}>
                Vider le cache
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={commonStyles.settingButton}
              onPress={handleExportData}
            >
              <Icon name="download" size={20} color={colors.primary} />
              <Text style={commonStyles.settingButtonText}>Exporter mes données</Text>
            </TouchableOpacity>
          </View>

          {/* Danger Zone */}
          <View style={commonStyles.section}>
            <Text style={[commonStyles.sectionTitle, { color: colors.error }]}>
              Zone de danger
            </Text>
            
            <TouchableOpacity
              style={[commonStyles.settingButton, { borderColor: colors.error }]}
              onPress={handleResetApp}
            >
              <Icon name="alert-triangle" size={20} color={colors.error} />
              <Text style={[commonStyles.settingButtonText, { color: colors.error }]}>
                Réinitialiser l'application
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
