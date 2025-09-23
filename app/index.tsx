
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import { currentUser, getUserTontines, formatCurrency } from '../data/mockData';
import Icon from '../components/Icon';

export default function HomeScreen() {
  const [userTontines, setUserTontines] = useState(getUserTontines(currentUser.id));

  useEffect(() => {
    console.log('Home screen loaded, user tontines:', userTontines.length);
  }, [userTontines.length]);

  const handleCreateTontine = () => {
    console.log('Navigate to create tontine');
    router.push('/create-tontine');
  };

  const handleJoinTontine = () => {
    console.log('Navigate to join tontine');
    Alert.alert('Rejoindre une tontine', 'Fonctionnalité à venir - Vous pourrez rejoindre une tontine avec un code d\'invitation');
  };

  const handleTontinePress = (tontineId: string) => {
    console.log('Navigate to tontine dashboard:', tontineId);
    router.push(`/tontine/${tontineId}`);
  };

  const handleProfilePress = () => {
    console.log('Navigate to profile');
    router.push('/profile');
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          paddingVertical: 20,
        }}>
          <View>
            <Text style={commonStyles.title}>Bonjour {currentUser.name.split(' ')[0]} 👋</Text>
            <Text style={commonStyles.textSecondary}>Gérez vos tontines facilement</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity 
              onPress={() => router.push('/notifications')}
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: colors.backgroundAlt,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Icon name="notifications" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleProfilePress}>
              <View style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon name="person" size={24} color={colors.backgroundAlt} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={commonStyles.section}>
          <Text style={commonStyles.subtitle}>Actions rapides</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity 
              style={[commonStyles.button, { flex: 1 }]}
              onPress={handleCreateTontine}
            >
              <Icon name="add-circle" size={20} color={colors.backgroundAlt} style={{ marginBottom: 4 }} />
              <Text style={commonStyles.buttonText}>Créer</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[commonStyles.buttonSecondary, { flex: 1 }]}
              onPress={handleJoinTontine}
            >
              <Icon name="people" size={20} color={colors.primary} style={{ marginBottom: 4 }} />
              <Text style={commonStyles.buttonSecondaryText}>Rejoindre</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* My Tontines */}
        <View style={commonStyles.section}>
          <Text style={commonStyles.subtitle}>Mes tontines ({userTontines.length})</Text>
          
          {userTontines.length === 0 ? (
            <View style={[commonStyles.card, { alignItems: 'center', paddingVertical: 40 }]}>
              <Icon name="wallet" size={48} color={colors.textSecondary} style={{ marginBottom: 16 }} />
              <Text style={[commonStyles.text, { textAlign: 'center', marginBottom: 8 }]}>
                Aucune tontine pour le moment
              </Text>
              <Text style={[commonStyles.textSecondary, { textAlign: 'center' }]}>
                Créez votre première tontine ou rejoignez-en une existante
              </Text>
            </View>
          ) : (
            userTontines.map((tontine) => {
              const totalCollected = tontine.members.reduce((sum, member) => sum + member.totalContributions, 0);
              const nextBeneficiary = tontine.members.find(m => m.userId === tontine.currentBeneficiary);
              
              return (
                <TouchableOpacity
                  key={tontine.id}
                  style={commonStyles.card}
                  onPress={() => handleTontinePress(tontine.id)}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 4 }]}>
                        {tontine.name}
                      </Text>
                      <Text style={commonStyles.textSecondary}>
                        {tontine.members.length}/{tontine.memberCount} membres
                      </Text>
                    </View>
                    <View style={{
                      backgroundColor: tontine.status === 'active' ? colors.success : colors.textSecondary,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 12,
                    }}>
                      <Text style={{ color: colors.backgroundAlt, fontSize: 12, fontWeight: '500' }}>
                        {tontine.status === 'active' ? 'Actif' : 'Inactif'}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={commonStyles.textSecondary}>Total collecté</Text>
                    <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                      {formatCurrency(totalCollected)}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={commonStyles.textSecondary}>Cotisation</Text>
                    <Text style={commonStyles.text}>
                      {formatCurrency(tontine.contributionAmount)} / {tontine.frequency === 'weekly' ? 'semaine' : 'mois'}
                    </Text>
                  </View>

                  {nextBeneficiary && (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={commonStyles.textSecondary}>Prochain bénéficiaire</Text>
                      <Text style={[commonStyles.text, { color: colors.primary, fontWeight: '500' }]}>
                        {nextBeneficiary.user.name}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Bottom spacing for navigation */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
