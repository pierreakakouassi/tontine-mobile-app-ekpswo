
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

  const handleLanguageSettings = () => {
    Alert.alert(
      'Langue',
      'Choisissez votre langue préférée:',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Français', onPress: () => console.log('Language set to French') },
        { text: 'Nouchi FR', onPress: () => console.log('Language set to Nouchi') },
        { text: 'English', onPress: () => console.log('Language set to English') }
      ]
    );
  };

  const handlePaymentMethodSettings = () => {
    Alert.alert(
      'Méthode de paiement par défaut',
      'Choisissez votre méthode préférée:',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Orange Money', onPress: () => console.log('Default payment: Orange') },
        { text: 'MTN MoMo', onPress: () => console.log('Default payment: MTN') },
        { text: 'Wave', onPress: () => console.log('Default payment: Wave') }
      ]
    );
  };

  const handleSupport = () => {
    console.log('Support');
    Alert.alert(
      'Support & Aide',
      'Comment pouvons-nous vous aider ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'FAQ', onPress: () => router.push('/help') },
        { text: 'Contacter par WhatsApp', onPress: () => console.log('Contact WhatsApp') },
        { text: 'Contacter par Email', onPress: () => console.log('Contact Email') }
      ]
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

  const showReliabilityDetails = () => {
    const totalTontines = userTontines.length;
    const completedTontines = userTontines.filter(t => t.status === 'completed').length;
    const activeTontines = userTontines.filter(t => t.status === 'active').length;
    
    // Calculate reliability metrics
    const totalPaymentsDue = userTontines.reduce((sum, tontine) => {
      const userMember = tontine.members.find(m => m.userId === currentUser.id);
      return sum + (tontine.currentRound * (userMember ? 1 : 0));
    }, 0);
    
    const onTimePayments = totalPaymentsDue; // Mock: assume all payments were on time
    const latePayments = 0; // Mock: no late payments
    const punctualityRate = totalPaymentsDue > 0 ? (onTimePayments / totalPaymentsDue) * 100 : 100;
    
    const accountAge = Math.floor((Date.now() - currentUser.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    
    Alert.alert(
      'Score de fiabilité détaillé',
      `🎯 Score global: ${currentUser.reliabilityScore}%\n\n` +
      `📊 Détails du calcul:\n` +
      `• Ponctualité des paiements: ${punctualityRate.toFixed(1)}%\n` +
      `• Tontines complétées: ${completedTontines}/${totalTontines}\n` +
      `• Paiements à l'heure: ${onTimePayments}/${totalPaymentsDue}\n` +
      `• Retards: ${latePayments}\n` +
      `• Ancienneté du compte: ${accountAge} jours\n` +
      `• Litiges: 0\n\n` +
      `💡 Comment améliorer votre score:\n` +
      `• Payez toujours à temps\n` +
      `• Complétez vos tontines\n` +
      `• Évitez les litiges\n` +
      `• Restez actif sur l'app`,
      [{ text: 'Compris' }]
    );
  };

  const totalContributions = userTontines.reduce((sum, tontine) => {
    const userMember = tontine.members.find(m => m.userId === currentUser.id);
    return sum + (userMember?.totalContributions || 0);
  }, 0);

  const activeTontines = userTontines.filter(t => t.status === 'active').length;
  const completedTontines = userTontines.filter(t => t.status === 'completed').length;

  // Calculate total received from completed tontines
  const totalReceived = userTontines.reduce((sum, tontine) => {
    if (tontine.status === 'completed') {
      const userMember = tontine.members.find(m => m.userId === currentUser.id);
      if (userMember?.hasReceived) {
        return sum + (tontine.contributionAmount * tontine.memberCount);
      }
    }
    return sum;
  }, 0);

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

          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}
            onPress={showReliabilityDetails}
          >
            <Icon name="star" size={16} color={colors.warning} style={{ marginRight: 4 }} />
            <Text style={[commonStyles.text, { fontWeight: '600', color: colors.warning }]}>
              Score de fiabilité: {currentUser.reliabilityScore}%
            </Text>
            <Icon name="information-circle" size={14} color={colors.textSecondary} style={{ marginLeft: 4 }} />
          </TouchableOpacity>

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
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 }}>
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
              <Text style={[commonStyles.text, { fontSize: 24, fontWeight: '700', color: colors.warning }]}>
                {completedTontines}
              </Text>
              <Text style={commonStyles.textSecondary}>Terminées</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={[commonStyles.text, { fontSize: 18, fontWeight: '700', color: colors.accent }]}>
                {formatCurrency(totalContributions).replace(' FCFA', '')}
              </Text>
              <Text style={commonStyles.textSecondary}>Cotisé</Text>
            </View>
            
            <View style={{ alignItems: 'center' }}>
              <Text style={[commonStyles.text, { fontSize: 18, fontWeight: '700', color: colors.success }]}>
                {formatCurrency(totalReceived).replace(' FCFA', '')}
              </Text>
              <Text style={commonStyles.textSecondary}>Reçu</Text>
            </View>
          </View>

          {/* Reliability Metrics */}
          <View style={{ 
            backgroundColor: colors.background, 
            borderRadius: 8, 
            padding: 12,
            borderWidth: 1,
            borderColor: colors.border,
            marginTop: 16,
          }}>
            <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8, fontSize: 14 }]}>
              Indicateurs de fiabilité
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={[commonStyles.text, { fontSize: 16, fontWeight: '600', color: colors.success }]}>
                  0
                </Text>
                <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>Retards</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={[commonStyles.text, { fontSize: 16, fontWeight: '600', color: colors.primary }]}>
                  100%
                </Text>
                <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>Ponctualité</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={[commonStyles.text, { fontSize: 16, fontWeight: '600', color: colors.warning }]}>
                  {Math.floor((Date.now() - currentUser.createdAt.getTime()) / (1000 * 60 * 60 * 24))}j
                </Text>
                <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>Ancienneté</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={[commonStyles.text, { fontSize: 16, fontWeight: '600', color: colors.success }]}>
                  0
                </Text>
                <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>Litiges</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Settings Menu */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>Paramètres</Text>
          
          <TouchableOpacity
            style={[commonStyles.card, { flexDirection: 'row', alignItems: 'center', marginBottom: 12 }]}
            onPress={handleLanguageSettings}
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
              <Icon name="language" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[commonStyles.text, { fontWeight: '600' }]}>Langue</Text>
              <Text style={commonStyles.textSecondary}>Français (par défaut)</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[commonStyles.card, { flexDirection: 'row', alignItems: 'center', marginBottom: 12 }]}
            onPress={() => router.push('/notifications')}
          >
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.warning + '20',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
            }}>
              <Icon name="notifications" size={20} color={colors.warning} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[commonStyles.text, { fontWeight: '600' }]}>Notifications</Text>
              <Text style={commonStyles.textSecondary}>Rappels et alertes</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[commonStyles.card, { flexDirection: 'row', alignItems: 'center', marginBottom: 12 }]}
            onPress={handlePaymentMethodSettings}
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
              <Icon name="card" size={20} color={colors.success} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[commonStyles.text, { fontWeight: '600' }]}>Moyen de paiement par défaut</Text>
              <Text style={commonStyles.textSecondary}>Orange Money</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[commonStyles.card, { flexDirection: 'row', alignItems: 'center', marginBottom: 12 }]}
            onPress={() => router.push('/settings')}
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
              <Icon name="settings" size={20} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[commonStyles.text, { fontWeight: '600' }]}>Paramètres avancés</Text>
              <Text style={commonStyles.textSecondary}>Données, synchronisation, sécurité</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Support & Help */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>Support & Aide</Text>
          
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
              <Text style={commonStyles.textSecondary}>Questions fréquentes et guides</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[commonStyles.card, { flexDirection: 'row', alignItems: 'center', marginBottom: 12 }]}
            onPress={handleSupport}
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
              <Icon name="chatbubble-ellipses" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[commonStyles.text, { fontWeight: '600' }]}>Contacter le support</Text>
              <Text style={commonStyles.textSecondary}>WhatsApp, Email, Téléphone</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[commonStyles.card, { flexDirection: 'row', alignItems: 'center', marginBottom: 12 }]}
            onPress={() => Alert.alert('À propos', 'Tontine CI v1.0.0\n\n🇨🇮 Développé avec ❤️ en Côte d\'Ivoire\n\n📱 La première app de tontine digitale ivoirienne\n\n🎯 Mission: Démocratiser l\'épargne collective\n\n👥 Équipe: Développeurs locaux passionnés\n\n📧 Contact: hello@tontine-ci.com')}
          >
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.warning + '20',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
            }}>
              <Icon name="information-circle" size={20} color={colors.warning} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[commonStyles.text, { fontWeight: '600' }]}>À propos de Tontine CI</Text>
              <Text style={commonStyles.textSecondary}>Version, équipe et mission</Text>
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
