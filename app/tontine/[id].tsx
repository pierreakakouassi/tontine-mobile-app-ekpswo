
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { commonStyles, colors } from '../../styles/commonStyles';
import { getTontineById, formatCurrency, getPaymentStatusColor, getPaymentStatusText, currentUser } from '../../data/mockData';
import { Tontine, Payment } from '../../types';
import Icon from '../../components/Icon';
import ProgressBar from '../../components/ProgressBar';

export default function TontineDashboardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tontine, setTontine] = useState<Tontine | null>(null);

  useEffect(() => {
    if (id) {
      const tontineData = getTontineById(id);
      setTontine(tontineData || null);
      console.log('Loaded tontine:', tontineData?.name);
    }
  }, [id]);

  const handlePayContribution = () => {
    console.log('Navigate to payment screen');
    router.push(`/payment/${id}`);
  };

  const handleInviteMembers = () => {
    console.log('Invite members functionality');
    Alert.alert(
      'Inviter des membres',
      'Partagez ce code avec vos amis pour qu\'ils rejoignent la tontine:\n\nCode: ' + tontine?.id.toUpperCase(),
      [
        { text: 'Partager par WhatsApp', onPress: () => console.log('Share via WhatsApp') },
        { text: 'Partager par SMS', onPress: () => console.log('Share via SMS') },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  const handleMemberPress = (memberId: string) => {
    console.log('View member profile:', memberId);
    // Could navigate to member profile
  };

  if (!tontine) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={[commonStyles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={commonStyles.text}>Tontine non trouvée</Text>
          <TouchableOpacity
            style={[commonStyles.button, { marginTop: 20 }]}
            onPress={() => router.back()}
          >
            <Text style={commonStyles.buttonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const totalCollected = tontine.members.reduce((sum, member) => sum + member.totalContributions, 0);
  const currentUserMember = tontine.members.find(m => m.userId === currentUser.id);
  const nextBeneficiary = tontine.members.find(m => m.userId === tontine.currentBeneficiary);
  const progress = (tontine.currentRound / tontine.totalRounds) * 100;

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
          <View style={{ flex: 1 }}>
            <Text style={commonStyles.title}>{tontine.name}</Text>
            <Text style={commonStyles.textSecondary}>
              Tour {tontine.currentRound} sur {tontine.totalRounds}
            </Text>
          </View>
        </View>

        {/* Progress Card */}
        <View style={[commonStyles.card, { marginBottom: 16 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={[commonStyles.text, { fontWeight: '600' }]}>Progression</Text>
            <Text style={[commonStyles.text, { color: colors.primary, fontWeight: '600' }]}>
              {Math.round(progress)}%
            </Text>
          </View>
          
          <ProgressBar 
            progress={progress} 
            height={8}
            color={colors.primary}
            backgroundColor={colors.border}
          />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>Total collecté</Text>
              <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                {formatCurrency(totalCollected)}
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>Par tour</Text>
              <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                {formatCurrency(tontine.contributionAmount * tontine.memberCount)}
              </Text>
            </View>
          </View>
        </View>

        {/* Next Beneficiary */}
        {nextBeneficiary && (
          <View style={[commonStyles.card, { marginBottom: 16, backgroundColor: colors.primary + '10', borderColor: colors.primary }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Icon name="trophy" size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={[commonStyles.text, { fontWeight: '600', color: colors.primary }]}>
                Prochain bénéficiaire
              </Text>
            </View>
            <Text style={[commonStyles.text, { fontSize: 18, fontWeight: '600' }]}>
              {nextBeneficiary.user.name}
            </Text>
            <Text style={commonStyles.textSecondary}>
              Recevra {formatCurrency(tontine.contributionAmount * tontine.memberCount)}
            </Text>
          </View>
        )}

        {/* Quick Actions */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
          <TouchableOpacity
            style={[commonStyles.button, { flex: 1 }]}
            onPress={handlePayContribution}
          >
            <Icon name="card" size={20} color={colors.backgroundAlt} style={{ marginBottom: 4 }} />
            <Text style={commonStyles.buttonText}>Payer ma part</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[commonStyles.buttonSecondary, { flex: 1 }]}
            onPress={handleInviteMembers}
          >
            <Icon name="person-add" size={20} color={colors.primary} style={{ marginBottom: 4 }} />
            <Text style={commonStyles.buttonSecondaryText}>Inviter</Text>
          </TouchableOpacity>
        </View>

        {/* Members List */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>
            Membres ({tontine.members.length}/{tontine.memberCount})
          </Text>
          
          {tontine.members.map((member, index) => {
            const isCurrentUser = member.userId === currentUser.id;
            const paymentStatus = member.missedPayments > 0 ? 'overdue' : 'completed';
            
            return (
              <TouchableOpacity
                key={member.userId}
                style={[commonStyles.card, { marginBottom: 12 }]}
                onPress={() => handleMemberPress(member.userId)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: colors.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}>
                    <Text style={{ color: colors.backgroundAlt, fontWeight: '600' }}>
                      {member.user.name.charAt(0)}
                    </Text>
                  </View>
                  
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={[commonStyles.text, { fontWeight: '600', marginRight: 8 }]}>
                        {member.user.name}
                      </Text>
                      {isCurrentUser && (
                        <View style={{
                          backgroundColor: colors.accent,
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          borderRadius: 8,
                        }}>
                          <Text style={{ color: colors.backgroundAlt, fontSize: 10, fontWeight: '500' }}>
                            Vous
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={commonStyles.textSecondary}>
                      Position {member.position} • Score: {member.user.reliabilityScore}%
                    </Text>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <View style={{
                      backgroundColor: getPaymentStatusColor(paymentStatus),
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 12,
                      marginBottom: 4,
                    }}>
                      <Text style={{ color: colors.backgroundAlt, fontSize: 12, fontWeight: '500' }}>
                        {getPaymentStatusText(paymentStatus)}
                      </Text>
                    </View>
                    <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                      {formatCurrency(member.totalContributions)}
                    </Text>
                  </View>
                </View>

                {member.hasReceived && (
                  <View style={{
                    backgroundColor: colors.success + '20',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 6,
                    alignSelf: 'flex-start',
                  }}>
                    <Text style={{ color: colors.success, fontSize: 12, fontWeight: '500' }}>
                      ✓ A reçu sa part
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tontine Info */}
        <View style={[commonStyles.card, { marginBottom: 24 }]}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 12 }]}>
            Informations
          </Text>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={commonStyles.textSecondary}>Fréquence</Text>
              <Text style={commonStyles.text}>
                {tontine.frequency === 'weekly' ? 'Hebdomadaire' : 'Mensuelle'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={commonStyles.textSecondary}>Ordre de tirage</Text>
              <Text style={commonStyles.text}>
                {tontine.drawOrder === 'manual' ? 'Manuel' : 'Aléatoire'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={commonStyles.textSecondary}>Créé le</Text>
              <Text style={commonStyles.text}>
                {tontine.createdAt.toLocaleDateString('fr-FR')}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={commonStyles.textSecondary}>Prochain paiement</Text>
              <Text style={[commonStyles.text, { color: colors.warning, fontWeight: '500' }]}>
                {tontine.nextPaymentDate.toLocaleDateString('fr-FR')}
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
