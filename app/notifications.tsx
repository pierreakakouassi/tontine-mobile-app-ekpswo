
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import { getUserNotifications, currentUser } from '../data/mockData';
import { Notification } from '../types';
import Icon from '../components/Icon';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState(getUserNotifications(currentUser.id));

  const handleNotificationPress = (notification: Notification) => {
    console.log('Notification pressed:', notification.id);
    
    // Mark as read
    setNotifications(prev => 
      prev.map(n => 
        n.id === notification.id ? { ...n, isRead: true } : n
      )
    );

    // Navigate to relevant screen if applicable
    if (notification.tontineId) {
      router.push(`/tontine/${notification.tontineId}`);
    }
  };

  const handleMarkAllRead = () => {
    console.log('Mark all notifications as read');
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Effacer toutes les notifications',
      'Êtes-vous sûr de vouloir effacer toutes les notifications ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Effacer', 
          style: 'destructive',
          onPress: () => {
            setNotifications([]);
            console.log('All notifications cleared');
          }
        },
      ]
    );
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'payment_reminder':
        return 'time';
      case 'payment_overdue':
        return 'warning';
      case 'payout_received':
        return 'checkmark-circle';
      case 'round_complete':
        return 'trophy';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'payment_reminder':
        return colors.warning;
      case 'payment_overdue':
        return colors.error;
      case 'payout_received':
        return colors.success;
      case 'round_complete':
        return colors.primary;
      default:
        return colors.textSecondary;
    }
  };

  const formatNotificationTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'À l\'instant';
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Il y a ${diffInDays}j`;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 20,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
              <Icon name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <View>
              <Text style={commonStyles.title}>Notifications</Text>
              {unreadCount > 0 && (
                <Text style={commonStyles.textSecondary}>
                  {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                </Text>
              )}
            </View>
          </View>

          {notifications.length > 0 && (
            <TouchableOpacity onPress={handleMarkAllRead}>
              <Text style={[commonStyles.text, { color: colors.primary, fontWeight: '600' }]}>
                Tout lire
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <View style={[commonStyles.card, { alignItems: 'center', paddingVertical: 60 }]}>
            <Icon name="notifications-off" size={48} color={colors.textSecondary} style={{ marginBottom: 16 }} />
            <Text style={[commonStyles.text, { textAlign: 'center', marginBottom: 8 }]}>
              Aucune notification
            </Text>
            <Text style={[commonStyles.textSecondary, { textAlign: 'center' }]}>
              Vous recevrez ici vos rappels de paiement et autres notifications importantes
            </Text>
          </View>
        ) : (
          <View style={commonStyles.section}>
            {notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  commonStyles.card,
                  { 
                    marginBottom: 12,
                    backgroundColor: notification.isRead ? colors.card : colors.primary + '05',
                    borderLeftWidth: 4,
                    borderLeftColor: notification.isRead ? colors.border : getNotificationColor(notification.type),
                  }
                ]}
                onPress={() => handleNotificationPress(notification)}
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
                      name={getNotificationIcon(notification.type) as any} 
                      size={20} 
                      color={getNotificationColor(notification.type)} 
                    />
                  </View>
                  
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <Text style={[
                        commonStyles.text, 
                        { 
                          fontWeight: notification.isRead ? '500' : '600',
                          flex: 1,
                          marginRight: 8,
                        }
                      ]}>
                        {notification.title}
                      </Text>
                      <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                        {formatNotificationTime(notification.createdAt)}
                      </Text>
                    </View>
                    
                    <Text style={[
                      commonStyles.textSecondary,
                      { 
                        opacity: notification.isRead ? 0.7 : 1,
                      }
                    ]}>
                      {notification.message}
                    </Text>

                    {!notification.isRead && (
                      <View style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: colors.primary,
                        position: 'absolute',
                        top: 0,
                        right: 0,
                      }} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            {notifications.length > 0 && (
              <TouchableOpacity
                style={[commonStyles.card, { 
                  alignItems: 'center',
                  backgroundColor: colors.background,
                  borderColor: colors.error,
                  marginTop: 16,
                }]}
                onPress={handleClearAll}
              >
                <Icon name="trash" size={20} color={colors.error} style={{ marginBottom: 4 }} />
                <Text style={[commonStyles.text, { color: colors.error, fontWeight: '600' }]}>
                  Effacer toutes les notifications
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Bottom spacing for navigation */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
