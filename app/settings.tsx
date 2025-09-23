
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from '../components/Icon';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState({
    paymentReminders: true,
    payoutAlerts: true,
    weeklyReports: false,
    marketing: false,
  });

  const [preferences, setPreferences] = useState({
    darkMode: false,
    biometricAuth: false,
    autoBackup: true,
  });

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    console.log(`Toggled ${key}:`, !notifications[key]);
  };

  const handlePreferenceToggle = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    console.log(`Toggled ${key}:`, !preferences[key]);
  };

  const handleResetApp = () => {
    Alert.alert(
      'Réinitialiser l\'application',
      'Cette action supprimera toutes vos données locales. Êtes-vous sûr ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Réinitialiser', 
          style: 'destructive',
          onPress: () => console.log('App reset')
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Exporter mes données',
      'Vos données seront exportées au format JSON et sauvegardées sur votre appareil.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Exporter',
          onPress: () => console.log('Data exported')
        },
      ]
    );
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center',
          paddingVertical: 20,
        }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={commonStyles.title}>Paramètres</Text>
        </View>

        {/* Notifications */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>
            Notifications
          </Text>
          
          <View style={[commonStyles.card, { gap: 16 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                  Rappels de paiement
                </Text>
                <Text style={commonStyles.textSecondary}>
                  Recevoir des rappels avant les échéances
                </Text>
              </View>
              <Switch
                value={notifications.paymentReminders}
                onValueChange={() => handleNotificationToggle('paymentReminders')}
                trackColor={{ false: colors.border, true: colors.primary + '40' }}
                thumbColor={notifications.paymentReminders ? colors.primary : colors.textSecondary}
              />
            </View>

            <View style={{ height: 1, backgroundColor: colors.border }} />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                  Alertes de paiement
                </Text>
                <Text style={commonStyles.textSecondary}>
                  Notifications quand quelqu&apos;un reçoit sa part
                </Text>
              </View>
              <Switch
                value={notifications.payoutAlerts}
                onValueChange={() => handleNotificationToggle('payoutAlerts')}
                trackColor={{ false: colors.border, true: colors.primary + '40' }}
                thumbColor={notifications.payoutAlerts ? colors.primary : colors.textSecondary}
              />
            </View>

            <View style={{ height: 1, backgroundColor: colors.border }} />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                  Rapports hebdomadaires
                </Text>
                <Text style={commonStyles.textSecondary}>
                  Résumé de vos tontines chaque semaine
                </Text>
              </View>
              <Switch
                value={notifications.weeklyReports}
                onValueChange={() => handleNotificationToggle('weeklyReports')}
                trackColor={{ false: colors.border, true: colors.primary + '40' }}
                thumbColor={notifications.weeklyReports ? colors.primary : colors.textSecondary}
              />
            </View>

            <View style={{ height: 1, backgroundColor: colors.border }} />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                  Offres promotionnelles
                </Text>
                <Text style={commonStyles.textSecondary}>
                  Recevoir des offres et nouveautés
                </Text>
              </View>
              <Switch
                value={notifications.marketing}
                onValueChange={() => handleNotificationToggle('marketing')}
                trackColor={{ false: colors.border, true: colors.primary + '40' }}
                thumbColor={notifications.marketing ? colors.primary : colors.textSecondary}
              />
            </View>
          </View>
        </View>

        {/* Preferences */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>
            Préférences
          </Text>
          
          <View style={[commonStyles.card, { gap: 16 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                  Mode sombre
                </Text>
                <Text style={commonStyles.textSecondary}>
                  Interface sombre pour économiser la batterie
                </Text>
              </View>
              <Switch
                value={preferences.darkMode}
                onValueChange={() => handlePreferenceToggle('darkMode')}
                trackColor={{ false: colors.border, true: colors.primary + '40' }}
                thumbColor={preferences.darkMode ? colors.primary : colors.textSecondary}
              />
            </View>

            <View style={{ height: 1, backgroundColor: colors.border }} />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                  Authentification biométrique
                </Text>
                <Text style={commonStyles.textSecondary}>
                  Utiliser l&apos;empreinte ou Face ID
                </Text>
              </View>
              <Switch
                value={preferences.biometricAuth}
                onValueChange={() => handlePreferenceToggle('biometricAuth')}
                trackColor={{ false: colors.border, true: colors.primary + '40' }}
                thumbColor={preferences.biometricAuth ? colors.primary : colors.textSecondary}
              />
            </View>

            <View style={{ height: 1, backgroundColor: colors.border }} />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                  Sauvegarde automatique
                </Text>
                <Text style={commonStyles.textSecondary}>
                  Sauvegarder vos données dans le cloud
                </Text>
              </View>
              <Switch
                value={preferences.autoBackup}
                onValueChange={() => handlePreferenceToggle('autoBackup')}
                trackColor={{ false: colors.border, true: colors.primary + '40' }}
                thumbColor={preferences.autoBackup ? colors.primary : colors.textSecondary}
              />
            </View>
          </View>
        </View>

        {/* Data Management */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>
            Gestion des données
          </Text>
          
          <TouchableOpacity
            style={[commonStyles.card, { flexDirection: 'row', alignItems: 'center', marginBottom: 12 }]}
            onPress={handleExportData}
          >
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.primary + '20',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
            }}>
              <Icon name="download" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                Exporter mes données
              </Text>
              <Text style={commonStyles.textSecondary}>
                Télécharger une copie de vos données
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[commonStyles.card, { 
              flexDirection: 'row', 
              alignItems: 'center',
              backgroundColor: colors.error + '10',
              borderColor: colors.error,
            }]}
            onPress={handleResetApp}
          >
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.error + '20',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
            }}>
              <Icon name="refresh" size={20} color={colors.error} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[commonStyles.text, { fontWeight: '600', color: colors.error }]}>
                Réinitialiser l&apos;application
              </Text>
              <Text style={[commonStyles.textSecondary, { color: colors.error }]}>
                Supprimer toutes les données locales
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>

        {/* Bottom spacing for navigation */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
