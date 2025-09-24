
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import { useNotifications } from '../hooks/useNotifications';
import Icon from '../components/Icon';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  type: 'payment' | 'reminder' | 'social' | 'system';
  timing?: string;
}

export default function NotificationsScreen() {
  const { notifications, markAsRead, clearAll } = useNotifications();
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'payment-due',
      title: 'Rappel de paiement (J-2)',
      description: 'Notification 2 jours avant l\'échéance',
      enabled: true,
      type: 'payment',
      timing: 'J-2'
    },
    {
      id: 'payment-due-1',
      title: 'Rappel de paiement (J-1)',
      description: 'Notification la veille de l\'échéance',
      enabled: true,
      type: 'payment',
      timing: 'J-1'
    },
    {
      id: 'payment-due-day',
      title: 'Rappel de paiement (Jour J)',
      description: 'Notification le jour de l\'échéance',
      enabled: true,
      type: 'payment',
      timing: 'J'
    },
    {
      id: 'payment-overdue',
      title: 'Paiement en retard (J+1)',
      description: 'Notification en cas de retard de paiement',
      enabled: true,
      type: 'payment',
      timing: 'J+1'
    },
    {
      id: 'payout-received',
      title: 'Réception de cagnotte',
      description: 'Notification quand vous recevez votre part',
      enabled: true,
      type: 'payment'
    },
    {
      id: 'round-complete',
      title: 'Tour terminé',
      description: 'Notification à la fin de chaque tour',
      enabled: true,
      type: 'system'
    },
    {
      id: 'member-joined',
      title: 'Nouveau membre',
      description: 'Notification quand quelqu\'un rejoint votre tontine',
      enabled: true,
      type: 'social'
    },
    {
      id: 'member-payment',
      title: 'Paiement d\'un membre',
      description: 'Notification quand un membre paie sa part',
      enabled: false,
      type: 'social'
    },
    {
      id: 'whatsapp-reminders',
      title: 'Rappels WhatsApp',
      description: 'Recevoir les rappels via WhatsApp',
      enabled: true,
      type: 'reminder'
    },
    {
      id: 'sms-reminders',
      title: 'Rappels SMS',
      description: 'Recevoir les rappels par SMS',
      enabled: true,
      type: 'reminder'
    },
    {
      id: 'push-notifications',
      title: 'Notifications push',
      description: 'Notifications dans l\'application',
      enabled: true,
      type: 'system'
    },
    {
      id: 'system-updates',
      title: 'Mises à jour système',
      description: 'Notifications des nouvelles fonctionnalités',
      enabled: false,
      type: 'system'
    }
  ]);

  const [activeTab, setActiveTab] = useState<'notifications' | 'settings'>('notifications');

  useEffect(() => {
    console.log('Notifications screen loaded');
  }, []);

  const handleToggleSetting = (settingId: string) => {
    setSettings(prev => prev.map(setting => 
      setting.id === settingId 
        ? { ...setting, enabled: !setting.enabled }
        : setting
    ));
    
    const setting = settings.find(s => s.id === settingId);
    console.log(`Toggled ${setting?.title}:`, !setting?.enabled);
    
    // Show confirmation for important settings
    if (settingId === 'payment-due' || settingId === 'payment-overdue') {
      const newState = !setting?.enabled;
      Alert.alert(
        newState ? 'Rappels activés' : 'Rappels désactivés',
        newState 
          ? 'Vous recevrez des rappels pour vos paiements'
          : '⚠️ Vous ne recevrez plus de rappels de paiement. Cela peut affecter votre score de fiabilité.',
        [{ text: 'Compris' }]
      );
    }
  };

  const handleTestNotification = () => {
    Alert.alert(
      'Test de notification',
      'Une notification de test va être envoyée dans quelques secondes.',
      [
        { text: 'Annuler' },
        {
          text: 'Envoyer',
          onPress: () => {
            setTimeout(() => {
              Alert.alert('🔔 Test de notification', 'Les notifications fonctionnent correctement !');
            }, 2000);
          }
        }
      ]
    );
  };

  const handleClearAllNotifications = () => {
    Alert.alert(
      'Effacer toutes les notifications',
      'Êtes-vous sûr de vouloir effacer toutes les notifications ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Effacer',
          style: 'destructive',
          onPress: () => {
            clearAll();
            Alert.alert('Notifications effacées', 'Toutes les notifications ont été supprimées.');
          }
        }
      ]
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment_reminder': return 'card';
      case 'payment_overdue': return 'warning';
      case 'payout_received': return 'wallet';
      case 'round_complete': return 'checkmark-circle';
      case 'member_joined': return 'person-add';
      default: return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'payment_reminder': return colors.primary;
      case 'payment_overdue': return colors.error;
      case 'payout_received': return colors.success;
      case 'round_complete': return colors.accent;
      case 'member_joined': return colors.warning;
      default: return colors.textSecondary;
    }
  };

  const getSettingIcon = (type: string) => {
    switch (type) {
      case 'payment': return 'card';
      case 'reminder': return 'alarm';
      case 'social': return 'people';
      case 'system': return 'settings';
      default: return 'notifications';
    }
  };

  const getSettingColor = (type: string) => {
    switch (type) {
      case 'payment': return colors.primary;
      case 'reminder': return colors.warning;
      case 'social': return colors.accent;
      case 'system': return colors.success;
      default: return colors.textSecondary;
    }
  };

  const groupedSettings = settings.reduce((groups, setting) => {
    if (!groups[setting.type]) {
      groups[setting.type] = [];
    }
    groups[setting.type].push(setting);
    return groups;
  }, {} as Record<string, NotificationSetting[]>);

  const getGroupTitle = (type: string) => {
    switch (type) {
      case 'payment': return '💳 Paiements';
      case 'reminder': return '⏰ Rappels';
      case 'social': return '👥 Social';
      case 'system': return '⚙️ Système';
      default: return type;
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={commonStyles.title}>Notifications</Text>
        <View style={{ flex: 1 }} />
        {activeTab === 'notifications' && notifications.length > 0 && (
          <TouchableOpacity onPress={handleClearAllNotifications}>
            <Text style={[commonStyles.text, { color: colors.error, fontSize: 14 }]}>
              Tout effacer
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tab Navigation */}
      <View style={{ 
        flexDirection: 'row', 
        backgroundColor: colors.surface,
        marginHorizontal: 20,
        marginVertical: 16,
        borderRadius: 8,
        padding: 4,
      }}>
        <TouchableOpacity
          style={[
            {
              flex: 1,
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 6,
              alignItems: 'center',
            },
            activeTab === 'notifications' && { backgroundColor: colors.primary }
          ]}
          onPress={() => setActiveTab('notifications')}
        >
          <Text style={[
            commonStyles.text,
            { fontSize: 14, fontWeight: '500' },
            activeTab === 'notifications' && { color: colors.backgroundAlt }
          ]}>
            Notifications ({notifications.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            {
              flex: 1,
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 6,
              alignItems: 'center',
            },
            activeTab === 'settings' && { backgroundColor: colors.primary }
          ]}
          onPress={() => setActiveTab('settings')}
        >
          <Text style={[
            commonStyles.text,
            { fontSize: 14, fontWeight: '500' },
            activeTab === 'settings' && { color: colors.backgroundAlt }
          ]}>
            Paramètres
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'notifications' ? (
          // Notifications List
          <View>
            {notifications.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Icon name="notifications-off" size={48} color={colors.textSecondary} style={{ marginBottom: 16 }} />
                <Text style={[commonStyles.text, { textAlign: 'center', marginBottom: 8 }]}>
                  Aucune notification
                </Text>
                <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginBottom: 24 }]}>
                  Vous recevrez ici vos rappels de paiement et autres notifications importantes.
                </Text>
                <TouchableOpacity
                  style={[commonStyles.buttonSecondary, { paddingHorizontal: 24 }]}
                  onPress={handleTestNotification}
                >
                  <Text style={commonStyles.buttonSecondaryText}>Tester les notifications</Text>
                </TouchableOpacity>
              </View>
            ) : (
              notifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  style={[
                    commonStyles.card,
                    { 
                      marginBottom: 12,
                      backgroundColor: notification.isRead ? colors.surface : colors.primary + '10',
                      borderColor: notification.isRead ? colors.border : colors.primary,
                    }
                  ]}
                  onPress={() => markAsRead(notification.id)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: getNotificationColor(notification.type) + '20',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}>
                      <Icon 
                        name={getNotificationIcon(notification.type)} 
                        size={20} 
                        color={getNotificationColor(notification.type)} 
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Text style={[
                          commonStyles.text, 
                          { 
                            fontWeight: '600', 
                            flex: 1,
                            color: notification.isRead ? colors.text : colors.primary
                          }
                        ]}>
                          {notification.title}
                        </Text>
                        {!notification.isRead && (
                          <View style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: colors.primary,
                            marginLeft: 8,
                          }} />
                        )}
                      </View>
                      
                      <Text style={[
                        commonStyles.textSecondary, 
                        { fontSize: 14, lineHeight: 20, marginBottom: 8 }
                      ]}>
                        {notification.message}
                      </Text>
                      
                      <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                        {notification.createdAt.toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        ) : (
          // Settings
          <View>
            {/* Test Notification Button */}
            <TouchableOpacity
              style={[commonStyles.card, { marginBottom: 24, backgroundColor: colors.primary + '10', borderColor: colors.primary }]}
              onPress={handleTestNotification}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="pulse" size={20} color={colors.primary} style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[commonStyles.text, { fontWeight: '600', color: colors.primary }]}>
                    Tester les notifications
                  </Text>
                  <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                    Vérifiez que les notifications fonctionnent
                  </Text>
                </View>
                <Icon name="chevron-forward" size={16} color={colors.primary} />
              </View>
            </TouchableOpacity>

            {/* Settings Groups */}
            {Object.entries(groupedSettings).map(([type, typeSettings]) => (
              <View key={type} style={{ marginBottom: 24 }}>
                <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>
                  {getGroupTitle(type)}
                </Text>
                
                {typeSettings.map((setting) => (
                  <View key={setting.id} style={[commonStyles.card, { marginBottom: 12 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: getSettingColor(setting.type) + '20',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                      }}>
                        <Icon 
                          name={getSettingIcon(setting.type)} 
                          size={16} 
                          color={getSettingColor(setting.type)} 
                        />
                      </View>

                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={[commonStyles.text, { fontWeight: '600', flex: 1 }]}>
                            {setting.title}
                          </Text>
                          {setting.timing && (
                            <View style={{
                              backgroundColor: colors.warning + '20',
                              paddingHorizontal: 6,
                              paddingVertical: 2,
                              borderRadius: 8,
                              marginRight: 8,
                            }}>
                              <Text style={{ 
                                color: colors.warning, 
                                fontSize: 10, 
                                fontWeight: '500' 
                              }}>
                                {setting.timing}
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text style={[commonStyles.textSecondary, { fontSize: 12, marginTop: 2 }]}>
                          {setting.description}
                        </Text>
                      </View>

                      <Switch
                        value={setting.enabled}
                        onValueChange={() => handleToggleSetting(setting.id)}
                        trackColor={{ false: colors.border, true: getSettingColor(setting.type) + '40' }}
                        thumbColor={setting.enabled ? getSettingColor(setting.type) : colors.textSecondary}
                      />
                    </View>
                  </View>
                ))}
              </View>
            ))}

            {/* Important Notice */}
            <View style={[commonStyles.card, { backgroundColor: colors.warning + '10', borderColor: colors.warning }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Icon name="warning" size={16} color={colors.warning} style={{ marginRight: 8 }} />
                <Text style={[commonStyles.text, { fontWeight: '600', color: colors.warning }]}>
                  Important
                </Text>
              </View>
              <Text style={[commonStyles.textSecondary, { fontSize: 12, lineHeight: 18 }]}>
                Désactiver les rappels de paiement peut affecter votre score de fiabilité et causer des retards dans vos tontines. 
                Nous recommandons de garder au moins les rappels J-1 et Jour J activés.
              </Text>
            </View>
          </View>
        )}

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
