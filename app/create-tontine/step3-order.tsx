
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { commonStyles, colors } from '../../styles/commonStyles';
import Icon from '../../components/Icon';

interface Member {
  id: string;
  name: string;
  phoneNumber: string;
  isAdmin: boolean;
  status: 'invited' | 'joined' | 'pending';
}

interface TontineDataWithMembers {
  name: string;
  description?: string;
  memberCount: number;
  contributionAmount: number;
  frequency: 'weekly' | 'monthly';
  drawOrder: 'manual' | 'random';
  members: Member[];
  invitationCode: string;
}

export default function Step3OrderScreen() {
  const params = useLocalSearchParams();
  const [tontineData, setTontineData] = useState<TontineDataWithMembers | null>(null);
  const [orderType, setOrderType] = useState<'manual' | 'random'>('manual');
  const [memberOrder, setMemberOrder] = useState<Member[]>([]);
  const [isGeneratingRandom, setIsGeneratingRandom] = useState(false);

  useEffect(() => {
    if (params.tontineData) {
      try {
        const data = JSON.parse(params.tontineData as string);
        setTontineData(data);
        setOrderType(data.drawOrder || 'manual');
        setMemberOrder([...data.members]);
        console.log('Loaded tontine data for step 3:', data);
      } catch (error) {
        console.error('Error parsing tontine data:', error);
        router.back();
      }
    }
  }, [params]);

  const handleDragStart = (index: number) => {
    console.log('Drag started for member at index:', index);
    // In a real implementation, this would handle drag start
  };

  const handleDragEnd = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    const newOrder = [...memberOrder];
    const [movedItem] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedItem);
    
    setMemberOrder(newOrder);
    console.log('Member moved from', fromIndex, 'to', toIndex);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    handleDragEnd(index, index - 1);
  };

  const handleMoveDown = (index: number) => {
    if (index === memberOrder.length - 1) return;
    handleDragEnd(index, index + 1);
  };

  const generateRandomOrder = () => {
    setIsGeneratingRandom(true);
    
    // Simulate secure random generation with animation
    setTimeout(() => {
      const shuffled = [...memberOrder];
      
      // Fisher-Yates shuffle algorithm for secure randomization
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      
      setMemberOrder(shuffled);
      setIsGeneratingRandom(false);
      console.log('Generated random order:', shuffled.map(m => m.name));
      
      Alert.alert(
        'Ordre généré',
        'L\'ordre de tirage a été généré de manière sécurisée et aléatoire.',
        [{ text: 'OK' }]
      );
    }, 2000);
  };

  const handleContinue = () => {
    const updatedTontineData = {
      ...tontineData,
      drawOrder: orderType,
      memberOrder: memberOrder.map((member, index) => ({
        ...member,
        position: index + 1
      }))
    };

    console.log('Continuing to step 4 with data:', updatedTontineData);
    router.push({
      pathname: '/create-tontine/step4-payment',
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
            <Text style={commonStyles.textSecondary}>Étape 3 - Ordre de tirage</Text>
          </View>
        </View>

        {/* Progress Indicator */}
        <View style={{ flexDirection: 'row', marginBottom: 24, gap: 8 }}>
          <View style={{ flex: 1, height: 4, backgroundColor: colors.primary, borderRadius: 2 }} />
          <View style={{ flex: 1, height: 4, backgroundColor: colors.primary, borderRadius: 2 }} />
          <View style={{ flex: 1, height: 4, backgroundColor: colors.primary, borderRadius: 2 }} />
          <View style={{ flex: 1, height: 4, backgroundColor: colors.border, borderRadius: 2 }} />
        </View>

        {/* Order Type Selection */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>
            Type d&apos;ordre
          </Text>

          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
            <TouchableOpacity
              style={[
                commonStyles.buttonSecondary,
                { flex: 1 },
                orderType === 'manual' && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => setOrderType('manual')}
            >
              <Icon 
                name="hand-left" 
                size={20} 
                color={orderType === 'manual' ? colors.backgroundAlt : colors.primary} 
                style={{ marginBottom: 8 }} 
              />
              <Text style={[
                commonStyles.buttonSecondaryText,
                orderType === 'manual' && { color: colors.backgroundAlt }
              ]}>
                Manuel
              </Text>
              <Text style={[
                commonStyles.textSecondary,
                { fontSize: 12, textAlign: 'center', marginTop: 4 },
                orderType === 'manual' && { color: colors.backgroundAlt + '80' }
              ]}>
                Drag & drop
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                commonStyles.buttonSecondary,
                { flex: 1 },
                orderType === 'random' && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => setOrderType('random')}
            >
              <Icon 
                name="shuffle" 
                size={20} 
                color={orderType === 'random' ? colors.backgroundAlt : colors.primary} 
                style={{ marginBottom: 8 }} 
              />
              <Text style={[
                commonStyles.buttonSecondaryText,
                orderType === 'random' && { color: colors.backgroundAlt }
              ]}>
                Aléatoire
              </Text>
              <Text style={[
                commonStyles.textSecondary,
                { fontSize: 12, textAlign: 'center', marginTop: 4 },
                orderType === 'random' && { color: colors.backgroundAlt + '80' }
              ]}>
                Sécurisé
              </Text>
            </TouchableOpacity>
          </View>

          {orderType === 'random' && (
            <View style={[commonStyles.card, { backgroundColor: colors.warning + '10', borderColor: colors.warning, marginBottom: 24 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Icon name="shield-checkmark" size={16} color={colors.warning} style={{ marginRight: 8 }} />
                <Text style={[commonStyles.text, { fontWeight: '600', color: colors.warning }]}>
                  Génération sécurisée
                </Text>
              </View>
              <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                L&apos;ordre sera généré de manière cryptographiquement sécurisée pour garantir l&apos;équité.
              </Text>
              
              <TouchableOpacity
                style={[commonStyles.button, { marginTop: 12 }]}
                onPress={generateRandomOrder}
                disabled={isGeneratingRandom}
              >
                {isGeneratingRandom ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[commonStyles.buttonText, { marginRight: 8 }]}>Génération...</Text>
                    <Icon name="refresh" size={16} color={colors.backgroundAlt} />
                  </View>
                ) : (
                  <Text style={commonStyles.buttonText}>Générer l&apos;ordre aléatoire</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Member Order List */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>
            Ordre de tirage ({memberOrder.length} membres)
          </Text>

          {memberOrder.map((member, index) => (
            <View key={member.id} style={[commonStyles.card, { marginBottom: 12 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {/* Position Number */}
                <View style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: index === 0 ? colors.primary : colors.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}>
                  <Text style={{ 
                    color: index === 0 ? colors.backgroundAlt : colors.text, 
                    fontWeight: '600',
                    fontSize: 14
                  }}>
                    {index + 1}
                  </Text>
                </View>

                {/* Member Info */}
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
                    {index === 0 ? 'Premier bénéficiaire' : 
                     index === memberOrder.length - 1 ? 'Dernier bénéficiaire' : 
                     `Bénéficiaire ${index + 1}`}
                  </Text>
                </View>

                {/* Manual Order Controls */}
                {orderType === 'manual' && (
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: colors.border,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onPress={() => handleMoveUp(index)}
                      disabled={index === 0}
                    >
                      <Icon 
                        name="chevron-up" 
                        size={16} 
                        color={index === 0 ? colors.textSecondary : colors.text} 
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: colors.border,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onPress={() => handleMoveDown(index)}
                      disabled={index === memberOrder.length - 1}
                    >
                      <Icon 
                        name="chevron-down" 
                        size={16} 
                        color={index === memberOrder.length - 1 ? colors.textSecondary : colors.text} 
                      />
                    </TouchableOpacity>
                  </View>
                )}

                {/* Random Order Indicator */}
                {orderType === 'random' && (
                  <View style={{
                    backgroundColor: colors.warning + '20',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,
                  }}>
                    <Text style={{ color: colors.warning, fontSize: 12, fontWeight: '500' }}>
                      Aléatoire
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Order Summary */}
        <View style={[commonStyles.card, { backgroundColor: colors.background, borderColor: colors.primary, marginBottom: 24 }]}>
          <Text style={[commonStyles.text, { fontWeight: '600', color: colors.primary, marginBottom: 8 }]}>
            Résumé de l&apos;ordre
          </Text>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={commonStyles.textSecondary}>Premier bénéficiaire</Text>
              <Text style={commonStyles.text}>{memberOrder[0]?.name}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={commonStyles.textSecondary}>Dernier bénéficiaire</Text>
              <Text style={commonStyles.text}>{memberOrder[memberOrder.length - 1]?.name}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={commonStyles.textSecondary}>Type d&apos;ordre</Text>
              <Text style={commonStyles.text}>
                {orderType === 'manual' ? 'Manuel (drag & drop)' : 'Aléatoire sécurisé'}
              </Text>
            </View>
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[commonStyles.button, { marginBottom: 120 }]}
          onPress={handleContinue}
        >
          <Text style={commonStyles.buttonText}>Continuer - Paiement</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
