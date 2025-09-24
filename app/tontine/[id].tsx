
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Share } from 'react-native';
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
  const [showHistory, setShowHistory] = useState(false);

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

  const handleCollectPayout = () => {
    if (!tontine) return;
    
    const currentUserMember = tontine.members.find(m => m.userId === currentUser.id);
    const isCurrentBeneficiary = tontine.currentBeneficiary === currentUser.id;
    const isAdmin = tontine.createdBy === currentUser.id;
    
    if (!isCurrentBeneficiary && !isAdmin) {
      Alert.alert('Non autorisé', 'Seul le bénéficiaire actuel ou l\'admin peut encaisser');
      return;
    }

    const totalAmount = tontine.contributionAmount * tontine.members.length;
    
    Alert.alert(
      'Encaisser la cagnotte',
      `Montant à encaisser: ${formatCurrency(totalAmount)}\n\nConfirmez-vous l'encaissement pour ${currentUserMember?.user.name || 'le bénéficiaire'} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Encaisser',
          onPress: () => {
            // In a real app, this would process the payout
            Alert.alert(
              'Encaissement réussi! 🎉',
              `${formatCurrency(totalAmount)} ont été versés avec succès.\n\nLe prochain tour commencera automatiquement.`
            );
            console.log('Payout processed for:', currentUserMember?.user.name);
          }
        }
      ]
    );
  };

  const handleInviteMembers = () => {
    if (!tontine) return;
    
    const inviteMessage = `🎯 Rejoignez ma tontine "${tontine.name}"!\n\n💰 Cotisation: ${formatCurrency(tontine.contributionAmount)} / ${tontine.frequency === 'weekly' ? 'semaine' : 'mois'}\n👥 ${tontine.members.length}/${tontine.memberCount} membres\n\nCode: ${tontine.id.toUpperCase()}\n\nTéléchargez TontineCI et utilisez ce code pour nous rejoindre!`;
    
    Alert.alert(
      'Inviter des membres',
      'Comment souhaitez-vous partager l\'invitation ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'WhatsApp',
          onPress: () => {
            Share.share({
              message: inviteMessage,
              title: `Invitation Tontine - ${tontine.name}`
            });
          }
        },
        {
          text: 'SMS',
          onPress: () => {
            Share.share({
              message: inviteMessage,
              title: `Invitation Tontine - ${tontine.name}`
            });
          }
        },
        {
          text: 'Autre',
          onPress: () => {
            Share.share({
              message: inviteMessage,
              title: `Invitation Tontine - ${tontine.name}`
            });
          }
        }
      ]
    );
  };

  const handleMemberPress = (memberId: string) => {
    const member = tontine?.members.find(m => m.userId === memberId);
    if (!member) return;

    Alert.alert(
      member.user.name,
      `📱 ${member.user.phoneNumber}\n⭐ Score de fiabilité: ${member.user.reliabilityScore}%\n💰 Total cotisé: ${formatCurrency(member.totalContributions)}\n📅 Rejoint le: ${member.joinedAt.toLocaleDateString('fr-FR')}\n🎯 Position: ${member.position}${member.hasReceived ? '\n✅ A déjà reçu sa part' : ''}`,
      [
        { text: 'Fermer' },
        {
          text: 'Contacter',
          onPress: () => {
            Alert.alert('Contact', `Contacter ${member.user.name} via WhatsApp ou SMS ?`);
          }
        }
      ]
    );
  };

  const showPaymentHistory = () => {
    if (!tontine) return;

    // Mock payment history
    const history = [
      {
        round: tontine.currentRound,
        date: new Date(),
        beneficiary: tontine.members.find(m => m.userId === tontine.currentBeneficiary)?.user.name || 'Inconnu',
        payments: tontine.members.map(member => ({
          member: member.user.name,
          amount: tontine.contributionAmount,
          status: member.missedPayments > 0 ? 'En retard' : 'Payé',
          date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        })),
        totalCollected: tontine.contributionAmount * tontine.members.filter(m => m.missedPayments === 0).length,
        penalties: member => member.missedPayments * 500,
        disbursed: tontine.currentRound > 1
      }
    ];

    const historyText = history.map(h => 
      `Tour ${h.round} - ${h.date.toLocaleDateString('fr-FR')}\n` +
      `Bénéficiaire: ${h.beneficiary}\n` +
      `Collecté: ${formatCurrency(h.totalCollected)}\n` +
      `Paiements: ${h.payments.filter(p => p.status === 'Payé').length}/${h.payments.length}\n` +
      `${h.disbursed ? '✅ Décaissé' : '⏳ En cours'}`
    ).join('\n\n');

    Alert.alert(
      'Historique des paiements',
      historyText,
      [{ text: 'Fermer' }]
    );
  };

  const showTontineSettings = () => {
    if (!tontine) return;
    
    const isAdmin = tontine.createdBy === currentUser.id;
    
    if (!isAdmin) {
      Alert.alert('Non autorisé', 'Seul l\'administrateur peut modifier les paramètres');
      return;
    }

    Alert.alert(
      'Paramètres de la tontine',
      'Que souhaitez-vous faire ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Modifier l\'ordre',
          onPress: () => Alert.alert('Modifier l\'ordre', 'Fonctionnalité à venir')
        },
        {
          text: 'Ajouter un membre',
          onPress: () => Alert.alert('Ajouter un membre', 'Fonctionnalité à venir')
        },
        {
          text: 'Suspendre la tontine',
          style: 'destructive',
          onPress: () => Alert.alert('Suspendre', 'Êtes-vous sûr de vouloir suspendre cette tontine ?')
        }
      ]
    );
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
  const isAdmin = tontine.createdBy === currentUser.id;
  const isCurrentBeneficiary = tontine.currentBeneficiary === currentUser.id;

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
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={commonStyles.textSecondary}>
                {tontine.status === 'active' ? '🟢 Active' : 
                 tontine.status === 'completed' ? '✅ Terminée' : '⏸️ Suspendue'}
              </Text>
              <Text style={[commonStyles.textSecondary, { marginLeft: 8 }]}>
                • Tour {tontine.currentRound}/{tontine.totalRounds}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={showTontineSettings}>
            <Icon name="settings" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Next Beneficiary & Due Date */}
        {nextBeneficiary && (
          <View style={[commonStyles.card, { marginBottom: 16, backgroundColor: colors.primary + '10', borderColor: colors.primary }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="trophy" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={[commonStyles.text, { fontWeight: '600', color: colors.primary }]}>
                  Prochain bénéficiaire
                </Text>
              </View>
              <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                Échéance: {tontine.nextPaymentDate.toLocaleDateString('fr-FR')}
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

        {/* Progress Card */}
        <View style={[commonStyles.card, { marginBottom: 16 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={[commonStyles.text, { fontWeight: '600' }]}>Progression du cycle</Text>
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

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>Cagnotte totale collectée</Text>
              <Text style={[commonStyles.text, { fontWeight: '600', fontSize: 18, color: colors.success }]}>
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

        {/* Quick Actions */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
          <TouchableOpacity
            style={[commonStyles.button, { flex: 1 }]}
            onPress={handlePayContribution}
          >
            <Icon name="card" size={20} color={colors.backgroundAlt} style={{ marginBottom: 4 }} />
            <Text style={commonStyles.buttonText}>Payer ma part</Text>
          </TouchableOpacity>
          
          {(isCurrentBeneficiary || isAdmin) && (
            <TouchableOpacity
              style={[commonStyles.button, { flex: 1, backgroundColor: colors.success }]}
              onPress={handleCollectPayout}
            >
              <Icon name="wallet" size={20} color={colors.backgroundAlt} style={{ marginBottom: 4 }} />
              <Text style={commonStyles.buttonText}>Encaisser</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[commonStyles.buttonSecondary, { flex: 1 }]}
            onPress={handleInviteMembers}
          >
            <Icon name="person-add" size={20} color={colors.primary} style={{ marginBottom: 4 }} />
            <Text style={commonStyles.buttonSecondaryText}>Inviter</Text>
          </TouchableOpacity>
        </View>

        {/* Dashboard Actions */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
          <TouchableOpacity
            style={[commonStyles.buttonSecondary, { flex: 1 }]}
            onPress={showPaymentHistory}
          >
            <Icon name="time" size={16} color={colors.primary} style={{ marginBottom: 4 }} />
            <Text style={[commonStyles.buttonSecondaryText, { fontSize: 12 }]}>Historique</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[commonStyles.buttonSecondary, { flex: 1 }]}
            onPress={() => Alert.alert('Calendrier', 'Affichage du calendrier des paiements à venir')}
          >
            <Icon name="calendar" size={16} color={colors.primary} style={{ marginBottom: 4 }} />
            <Text style={[commonStyles.buttonSecondaryText, { fontSize: 12 }]}>Calendrier</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[commonStyles.buttonSecondary, { flex: 1 }]}
            onPress={() => Alert.alert('Statistiques', 'Affichage des statistiques détaillées')}
          >
            <Icon name="analytics" size={16} color={colors.primary} style={{ marginBottom: 4 }} />
            <Text style={[commonStyles.buttonSecondaryText, { fontSize: 12 }]}>Stats</Text>
          </TouchableOpacity>
        </View>

        {/* Members List */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>
            Liste des membres ({tontine.members.length}/{tontine.memberCount})
          </Text>
          
          {tontine.members.map((member, index) => {
            const isCurrentUser = member.userId === currentUser.id;
            const paymentStatus = member.missedPayments > 0 ? 'overdue' : 'completed';
            const nextTurn = member.position - tontine.currentRound;
            
            return (
              <TouchableOpacity
                key={member.userId}
                style={[commonStyles.card, { marginBottom: 12 }]}
                onPress={() => handleMemberPress(member.userId)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  {/* Avatar */}
                  <View style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: member.userId === tontine.createdBy ? colors.primary : colors.accent,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}>
                    <Text style={{ color: colors.backgroundAlt, fontWeight: '600', fontSize: 18 }}>
                      {member.user.name.charAt(0)}
                    </Text>
                  </View>
                  
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
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
                      {member.userId === tontine.createdBy && (
                        <View style={{
                          backgroundColor: colors.primary,
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          borderRadius: 8,
                          marginLeft: 4,
                        }}>
                          <Text style={{ color: colors.backgroundAlt, fontSize: 10, fontWeight: '500' }}>
                            ADMIN
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Icon name="star" size={12} color={colors.warning} style={{ marginRight: 4 }} />
                      <Text style={[commonStyles.textSecondary, { fontSize: 12, marginRight: 12 }]}>
                        Score: {member.user.reliabilityScore}%
                      </Text>
                      <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                        {nextTurn > 0 ? `Tour dans ${nextTurn}` : 
                         nextTurn === 0 ? 'Tour actuel' : 
                         'Tour passé'}
                      </Text>
                    </View>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    {/* Payment Status */}
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

                {/* Additional Info */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                    Position {member.position} • Rejoint le {member.joinedAt.toLocaleDateString('fr-FR')}
                  </Text>
                  
                  {member.hasReceived && (
                    <View style={{
                      backgroundColor: colors.success + '20',
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 6,
                    }}>
                      <Text style={{ color: colors.success, fontSize: 10, fontWeight: '500' }}>
                        ✓ A reçu
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tontine Info */}
        <View style={[commonStyles.card, { marginBottom: 24 }]}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 12 }]}>
            Informations de la tontine
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
                {tontine.drawOrder === 'manual' ? 'Manuel' : 'Aléatoire sécurisé'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={commonStyles.textSecondary}>Créée le</Text>
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
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={commonStyles.textSecondary}>Code d&apos;invitation</Text>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert('Code copié', `Code d'invitation: ${tontine.id.toUpperCase()}`);
                }}
              >
                <Text style={[commonStyles.text, { color: colors.primary, fontWeight: '600' }]}>
                  {tontine.id.toUpperCase()} 📋
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
