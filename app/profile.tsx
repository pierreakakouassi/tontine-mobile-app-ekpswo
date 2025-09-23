
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import { currentUser, getUserTontines, formatCurrency } from '../data/mockData';
import Icon from '../components/Icon';

export default function ProfileScreen() {
  const [userTontines] = useState(getUserTontines(currentUser.id));

  const handleEditProfile = () => {
    console.log('Edit profile');
    Alert.alert('Modifier le profil', 'Fonctionnalité à venir');
  };

  const handleNotificationSettings = () => {
    console.log('Notification settings');
    Alert.alert('Notifications', 'Fonctionnalité à venir');
  };

  const handleSupport = () => {
    console.log('Support');
    Alert.alert(
      'Support',
      'Contactez-nous:\n\n📞 +225 07 00 00 00 00\n📧 support@tontineapp.ci\n💬 WhatsApp: +225 07 00 00 00 00'
    );
  };

  const handleLogout = () => {
    console.log('Logout');
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnexion', style: 'destructive', onPress: () => console.log('User logged out') },
      ]
    );
  };

  const totalContributions = userTontines.reduce((sum, tontine) => {
    const userMember = tontine.members.find(m => m.userId === currentUser.id);
    return sum + (userMember?.totalContributions || 0);
  }, 0);

  const activeTontines = userTontines.filter(t => t.status === 'active').length;

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
          <Text style={commonStyles.title}>Mon profil</Text>
        </View>

        {/* Profile Card */}
        <View style={[commonStyles.card, { alignItems: 'center', marginBottom: 24 }]}>
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}>
            <Text style={{ color: colors.backgroundAlt, fontSize: 32, fontWeight: '600' }}>
              {currentUser.name.charAt(0)}
            </Text>
          </View>
          
          <Text style={[commonStyles.text, { fontSize: 20, fontWeight: '600', marginBottom: 4 }]}>
            {currentUser.name}
          </Text>
          <Text style={[commonStyles.textSecondary, { marginBottom: 16 }]}>
            {currentUser.phoneNumber}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Icon name="star" size={16} color={colors.warning} style={{ marginRight: 4 }} />
            <Text style={[commonStyles.text, { fontWeight: '600', color: colors.warning }]}>
              Score de fiabilité: {currentUser.reliabilityScore}%
            </Text>
          </View>

          <TouchableOpacity
            style={[commonStyles.buttonSecondary, { paddingHorizontal: 24 }]}
            onPress={handleEditProfile}
          >
            <Text style={commonStyles.buttonSecondaryText}>Modifier le profil</Text>
          </TouchableOpacity>
        </View>

        {/* Statistics */}
        <View style={[commonStyles.card, { marginBottom: 24 }]}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 16 }]}>
            Mes statistiques
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={[commonStyles.text, { fontSize: 24, fontWeight: '700', color: colors.primary }]}>
                {userTontines.length}
              </Text>
              <Text style={commonStyles.textSecondary}>Tontines</Text>
            </View>
            
            <View style={{ alignItems: 'center' }}>
              <Text style={[commonStyles.text, { fontSize: 24, fontWeight: '700', color: colors.success }]}>
                {activeTontines}
              </Text>
              <Text style={commonStyles.textSecondary}>Actives</Text>
            </View>
            
            <View style={{ alignItems: 'center' }}>
              <Text style={[commonStyles.text, { fontSize: 18, fontWeight: '700', color: colors.warning }]}>
                {formatCurrency(totalContributions).replace(' FCFA', '')}
              </Text>
              <Text style={commonStyles.textSecondary}>Cotisé</Text>
            </View>
          </View>
        </View>

        {/* Menu Options */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>Paramètres</Text>
          
          <TouchableOpacity
            style={[commonStyles.card, { flexDirection: 'row', alignItems: 'center', marginBottom: 12 }]}
            onPress={() => router.push('/settings')}
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
              <Icon name="settings" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[commonStyles.text, { fontWeight: '600' }]}>Paramètres</Text>
              <Text style={commonStyles.textSecondary}>Notifications, préférences et données</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[commonStyles.card, { flexDirection: 'row', alignItems: 'center', marginBottom: 12 }]}
            onPress={() => router.push('/help')}
          >
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.success + '20',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
            }}>
              <Icon name="help-circle" size={20} color={colors.success} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[commonStyles.text, { fontWeight: '600' }]}>Aide & FAQ</Text>
              <Text style={commonStyles.textSecondary}>Questions fréquentes et support</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[commonStyles.card, { flexDirection: 'row', alignItems: 'center', marginBottom: 12 }]}
            onPress={() => Alert.alert('À propos', 'Tontine App v1.0.0\nDéveloppé avec ❤️ en Côte d\'Ivoire')}
          >
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.accent + '20',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
            }}>
              <Icon name="information-circle" size={20} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[commonStyles.text, { fontWeight: '600' }]}>À propos</Text>
              <Text style={commonStyles.textSecondary}>Version et informations</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[commonStyles.card, { 
            flexDirection: 'row', 
            alignItems: 'center', 
            marginBottom: 24,
            backgroundColor: colors.error + '10',
            borderColor: colors.error,
          }]}
          onPress={handleLogout}
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
            <Icon name="log-out" size={20} color={colors.error} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[commonStyles.text, { fontWeight: '600', color: colors.error }]}>
              Déconnexion
            </Text>
            <Text style={[commonStyles.textSecondary, { color: colors.error }]}>
              Se déconnecter de l&apos;application
            </Text>
          </View>
        </TouchableOpacity>

        {/* Bottom spacing for navigation */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
