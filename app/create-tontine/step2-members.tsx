
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { commonStyles, colors } from '../../styles/commonStyles';
import { CreateTontineData } from '../../types';
import Icon from '../../components/Icon';
import * as Contacts from 'expo-contacts';

interface Member {
  id: string;
  name: string;
  phoneNumber: string;
  isAdmin: boolean;
  status: 'invited' | 'joined' | 'pending';
}

export default function Step2MembersScreen() {
  const params = useLocalSearchParams();
  const [tontineData, setTontineData] = useState<CreateTontineData | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [invitationCode, setInvitationCode] = useState('');

  useEffect(() => {
    // Parse tontine data from previous step
    if (params.tontineData) {
      try {
        const data = JSON.parse(params.tontineData as string);
        setTontineData(data);
        console.log('Loaded tontine data for step 2:', data);
        
        // Generate invitation code
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        setInvitationCode(code);
        
        // Add creator as admin
        setMembers([{
          id: 'creator',
          name: 'Vous (Admin)',
          phoneNumber: '+225 07 00 00 00 00', // Current user phone
          isAdmin: true,
          status: 'joined'
        }]);
      } catch (error) {
        console.error('Error parsing tontine data:', error);
        router.back();
      }
    }
  }, [params]);

  const handleAddMember = () => {
    if (!newMemberName.trim() || !newMemberPhone.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir le nom et le numéro de téléphone');
      return;
    }

    if (members.length >= (tontineData?.memberCount || 5)) {
      Alert.alert('Limite atteinte', `Vous ne pouvez ajouter que ${tontineData?.memberCount} membres maximum`);
      return;
    }

    const newMember: Member = {
      id: Date.now().toString(),
      name: newMemberName.trim(),
      phoneNumber: newMemberPhone.trim(),
      isAdmin: false,
      status: 'invited'
    };

    setMembers(prev => [...prev, newMember]);
    setNewMemberName('');
    setNewMemberPhone('');
    console.log('Added member:', newMember);
  };

  const handleRemoveMember = (memberId: string) => {
    if (memberId === 'creator') {
      Alert.alert('Erreur', 'Vous ne pouvez pas vous retirer de votre propre tontine');
      return;
    }

    Alert.alert(
      'Retirer le membre',
      'Êtes-vous sûr de vouloir retirer ce membre ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Retirer',
          style: 'destructive',
          onPress: () => {
            setMembers(prev => prev.filter(m => m.id !== memberId));
            console.log('Removed member:', memberId);
          }
        }
      ]
    );
  };

  const handleImportFromContacts = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Nous avons besoin d\'accéder à vos contacts pour cette fonctionnalité');
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
      });

      if (data.length > 0) {
        // Show contact picker (simplified for demo)
        Alert.alert(
          'Contacts trouvés',
          `${data.length} contacts disponibles. Fonctionnalité de sélection à venir.`,
          [{ text: 'OK' }]
        );
        console.log('Contacts loaded:', data.length);
      }
    } catch (error) {
      console.error('Error accessing contacts:', error);
      Alert.alert('Erreur', 'Impossible d\'accéder aux contacts');
    }
  };

  const generateInvitationLink = () => {
    const baseUrl = 'https://tontineapp.ci/join';
    return `${baseUrl}?code=${invitationCode}&tontine=${encodeURIComponent(tontineData?.name || '')}`;
  };

  const handleShareWhatsApp = () => {
    const inviteLink = generateInvitationLink();
    const message = `🎯 Rejoignez ma tontine "${tontineData?.name}"!\n\n💰 Cotisation: ${tontineData?.contributionAmount?.toLocaleString()} FCFA / ${tontineData?.frequency === 'weekly' ? 'semaine' : 'mois'}\n👥 ${tontineData?.memberCount} membres\n\nCode: ${invitationCode}\n\nLien: ${inviteLink}\n\nTéléchargez TontineCI et utilisez ce code pour nous rejoindre!`;
    
    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(whatsappUrl).then(supported => {
      if (supported) {
        Linking.openURL(whatsappUrl);
      } else {
        Alert.alert('WhatsApp non disponible', 'WhatsApp n\'est pas installé sur cet appareil');
      }
    });
    
    console.log('Sharing via WhatsApp:', message);
  };

  const handleShareSMS = () => {
    const inviteLink = generateInvitationLink();
    const message = `Rejoignez ma tontine "${tontineData?.name}"! Code: ${invitationCode} Lien: ${inviteLink}`;
    
    const smsUrl = `sms:?body=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(smsUrl).then(supported => {
      if (supported) {
        Linking.openURL(smsUrl);
      } else {
        Alert.alert('SMS non disponible', 'Impossible d\'ouvrir l\'application SMS');
      }
    });
    
    console.log('Sharing via SMS:', message);
  };

  const handleContinue = () => {
    if (members.length < 2) {
      Alert.alert('Membres insuffisants', 'Vous devez avoir au moins 2 membres (vous inclus)');
      return;
    }

    const updatedTontineData = {
      ...tontineData,
      members: members,
      invitationCode: invitationCode
    };

    console.log('Continuing to step 3 with data:', updatedTontineData);
    router.push({
      pathname: '/create-tontine/step3-order',
      params: { tontineData: JSON.stringify(updatedTontineData) }
    });
  };

  if (!tontineData) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={[commonStyles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={commonStyles.text}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
            <Text style={commonStyles.title}>Créer une tontine</Text>
            <Text style={commonStyles.textSecondary}>Étape 2 - Membres</Text>
          </View>
        </View>

        {/* Progress Indicator */}
        <View style={{ flexDirection: 'row', marginBottom: 24, gap: 8 }}>
          <View style={{ flex: 1, height: 4, backgroundColor: colors.primary, borderRadius: 2 }} />
          <View style={{ flex: 1, height: 4, backgroundColor: colors.primary, borderRadius: 2 }} />
          <View style={{ flex: 1, height: 4, backgroundColor: colors.border, borderRadius: 2 }} />
          <View style={{ flex: 1, height: 4, backgroundColor: colors.border, borderRadius: 2 }} />
        </View>

        {/* Tontine Summary */}
        <View style={[commonStyles.card, { marginBottom: 24, backgroundColor: colors.primary + '10', borderColor: colors.primary }]}>
          <Text style={[commonStyles.text, { fontWeight: '600', color: colors.primary, marginBottom: 8 }]}>
            {tontineData.name}
          </Text>
          <Text style={commonStyles.textSecondary}>
            {tontineData.contributionAmount.toLocaleString()} FCFA • {tontineData.memberCount} membres • {tontineData.frequency === 'weekly' ? 'Hebdomadaire' : 'Mensuelle'}
          </Text>
        </View>

        {/* Add Member Section */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>
            Ajouter des membres ({members.length}/{tontineData.memberCount})
          </Text>

          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            <TouchableOpacity
              style={[commonStyles.buttonSecondary, { flex: 1 }]}
              onPress={handleImportFromContacts}
            >
              <Icon name="people" size={16} color={colors.primary} style={{ marginBottom: 4 }} />
              <Text style={[commonStyles.buttonSecondaryText, { fontSize: 12 }]}>Carnet</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[commonStyles.buttonSecondary, { flex: 1 }]}
              onPress={() => Alert.alert('Scan QR', 'Fonctionnalité de scan QR à venir')}
            >
              <Icon name="qr-code" size={16} color={colors.primary} style={{ marginBottom: 4 }} />
              <Text style={[commonStyles.buttonSecondaryText, { fontSize: 12 }]}>QR Code</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            <TextInput
              style={[commonStyles.input, { flex: 1 }]}
              value={newMemberName}
              onChangeText={setNewMemberName}
              placeholder="Nom du membre"
              placeholderTextColor={colors.textSecondary}
            />
            <TextInput
              style={[commonStyles.input, { flex: 1 }]}
              value={newMemberPhone}
              onChangeText={setNewMemberPhone}
              placeholder="Numéro"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
            />
          </View>

          <TouchableOpacity
            style={[commonStyles.button, { marginBottom: 24 }]}
            onPress={handleAddMember}
            disabled={members.length >= tontineData.memberCount}
          >
            <Text style={commonStyles.buttonText}>Ajouter le membre</Text>
          </TouchableOpacity>
        </View>

        {/* Members List */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>
            Liste des membres
          </Text>

          {members.map((member, index) => (
            <View key={member.id} style={[commonStyles.card, { marginBottom: 12 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: member.isAdmin ? colors.primary : colors.accent,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}>
                  <Text style={{ color: colors.backgroundAlt, fontWeight: '600' }}>
                    {member.name.charAt(0)}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[commonStyles.text, { fontWeight: '600', marginRight: 8 }]}>
                      {member.name}
                    </Text>
                    {member.isAdmin && (
                      <View style={{
                        backgroundColor: colors.primary,
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 8,
                      }}>
                        <Text style={{ color: colors.backgroundAlt, fontSize: 10, fontWeight: '500' }}>
                          ADMIN
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={commonStyles.textSecondary}>
                    {member.phoneNumber}
                  </Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <View style={{
                    backgroundColor: member.status === 'joined' ? colors.success : 
                                   member.status === 'invited' ? colors.warning : colors.border,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,
                    marginBottom: 4,
                  }}>
                    <Text style={{ 
                      color: member.status === 'joined' ? colors.backgroundAlt : colors.text, 
                      fontSize: 12, 
                      fontWeight: '500' 
                    }}>
                      {member.status === 'joined' ? 'Rejoint' : 
                       member.status === 'invited' ? 'Invité' : 'En attente'}
                    </Text>
                  </View>
                  
                  {!member.isAdmin && (
                    <TouchableOpacity onPress={() => handleRemoveMember(member.id)}>
                      <Icon name="close-circle" size={20} color={colors.error} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Invitation Section */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>
            Lien d&apos;invitation
          </Text>

          <View style={[commonStyles.card, { backgroundColor: colors.background, borderColor: colors.primary }]}>
            <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
              Code d&apos;invitation
            </Text>
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              backgroundColor: colors.primary + '20',
              padding: 12,
              borderRadius: 8,
              marginBottom: 16
            }}>
              <Text style={[commonStyles.text, { 
                flex: 1, 
                fontSize: 18, 
                fontWeight: '700', 
                color: colors.primary,
                textAlign: 'center'
              }]}>
                {invitationCode}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  // Copy to clipboard functionality would go here
                  Alert.alert('Copié', 'Code copié dans le presse-papiers');
                }}
              >
                <Icon name="copy" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={[commonStyles.button, { flex: 1 }]}
                onPress={handleShareWhatsApp}
              >
                <Icon name="logo-whatsapp" size={16} color={colors.backgroundAlt} style={{ marginBottom: 4 }} />
                <Text style={[commonStyles.buttonText, { fontSize: 12 }]}>WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[commonStyles.buttonSecondary, { flex: 1 }]}
                onPress={handleShareSMS}
              >
                <Icon name="chatbubble" size={16} color={colors.primary} style={{ marginBottom: 4 }} />
                <Text style={[commonStyles.buttonSecondaryText, { fontSize: 12 }]}>SMS</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[commonStyles.button, { marginTop: 24, marginBottom: 120 }]}
          onPress={handleContinue}
        >
          <Text style={commonStyles.buttonText}>Continuer - Ordre de tirage</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
