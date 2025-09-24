
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { commonStyles, colors } from '../../styles/commonStyles';
import Icon from '../../components/Icon';

interface PaymentMethod {
  id: 'orange' | 'mtn' | 'wave';
  name: string;
  icon: string;
  color: string;
  enabled: boolean;
  testAmount: number;
}

interface TontineDataComplete {
  name: string;
  description?: string;
  memberCount: number;
  contributionAmount: number;
  frequency: 'weekly' | 'monthly';
  drawOrder: 'manual' | 'random';
  members: any[];
  memberOrder: any[];
  invitationCode: string;
}

export default function Step4PaymentScreen() {
  const params = useLocalSearchParams();
  const [tontineData, setTontineData] = useState<TontineDataComplete | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: 'orange',
      name: 'Orange Money',
      icon: 'phone-portrait',
      color: '#FF6600',
      enabled: true,
      testAmount: 100
    },
    {
      id: 'mtn',
      name: 'MTN MoMo',
      icon: 'phone-portrait',
      color: '#FFCC00',
      enabled: true,
      testAmount: 100
    },
    {
      id: 'wave',
      name: 'Wave',
      icon: 'phone-portrait',
      color: '#00D4FF',
      enabled: true,
      testAmount: 100
    }
  ]);
  const [enableTestPayment, setEnableTestPayment] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (params.tontineData) {
      try {
        const data = JSON.parse(params.tontineData as string);
        setTontineData(data);
        console.log('Loaded tontine data for step 4:', data);
      } catch (error) {
        console.error('Error parsing tontine data:', error);
        router.back();
      }
    }
  }, [params]);

  const handleTogglePaymentMethod = (methodId: 'orange' | 'mtn' | 'wave') => {
    setPaymentMethods(prev => prev.map(method => 
      method.id === methodId 
        ? { ...method, enabled: !method.enabled }
        : method
    ));
    console.log('Toggled payment method:', methodId);
  };

  const handleTestPayment = async (methodId: 'orange' | 'mtn' | 'wave') => {
    const method = paymentMethods.find(m => m.id === methodId);
    if (!method) return;

    Alert.alert(
      'Test de paiement',
      `Tester le paiement de ${method.testAmount} FCFA via ${method.name}?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Tester',
          onPress: async () => {
            console.log(`Testing payment with ${method.name}`);
            
            // Simulate payment test
            Alert.alert(
              'Test en cours',
              'Veuillez suivre les instructions sur votre téléphone pour compléter le paiement test.',
              [{ text: 'OK' }]
            );

            // In a real app, this would integrate with the actual payment API
            setTimeout(() => {
              Alert.alert(
                'Test réussi',
                `Le paiement test de ${method.testAmount} FCFA via ${method.name} a été effectué avec succès.`,
                [{ text: 'OK' }]
              );
            }, 3000);
          }
        }
      ]
    );
  };

  const handleCreateTontine = async () => {
    const enabledMethods = paymentMethods.filter(m => m.enabled);
    
    if (enabledMethods.length === 0) {
      Alert.alert('Erreur', 'Vous devez activer au moins une méthode de paiement');
      return;
    }

    setIsCreating(true);

    try {
      // Simulate tontine creation
      console.log('Creating tontine with final data:', {
        ...tontineData,
        paymentMethods: enabledMethods,
        testPaymentEnabled: enableTestPayment
      });

      // In a real app, this would call the API to create the tontine
      await new Promise(resolve => setTimeout(resolve, 2000));

      Alert.alert(
        'Tontine créée avec succès! 🎉',
        `"${tontineData?.name}" a été créée avec succès.\n\nVos membres peuvent maintenant rejoindre la tontine avec le code: ${tontineData?.invitationCode}`,
        [
          {
            text: 'Voir ma tontine',
            onPress: () => {
              // Navigate to the created tontine
              router.replace('/');
            }
          }
        ]
      );

    } catch (error) {
      console.error('Error creating tontine:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la création de la tontine');
    } finally {
      setIsCreating(false);
    }
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

  const enabledMethodsCount = paymentMethods.filter(m => m.enabled).length;

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
            <Text style={commonStyles.textSecondary}>Étape 4 - Paiement</Text>
          </View>
        </View>

        {/* Progress Indicator */}
        <View style={{ flexDirection: 'row', marginBottom: 24, gap: 8 }}>
          <View style={{ flex: 1, height: 4, backgroundColor: colors.primary, borderRadius: 2 }} />
          <View style={{ flex: 1, height: 4, backgroundColor: colors.primary, borderRadius: 2 }} />
          <View style={{ flex: 1, height: 4, backgroundColor: colors.primary, borderRadius: 2 }} />
          <View style={{ flex: 1, height: 4, backgroundColor: colors.primary, borderRadius: 2 }} />
        </View>

        {/* Payment Methods Section */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>
            Méthodes de paiement ({enabledMethodsCount}/3 activées)
          </Text>

          {paymentMethods.map((method) => (
            <View key={method.id} style={[commonStyles.card, { marginBottom: 12 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: method.color + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16,
                }}>
                  <Icon name={method.icon} size={24} color={method.color} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 4 }]}>
                    {method.name}
                  </Text>
                  <Text style={commonStyles.textSecondary}>
                    {method.enabled ? 'Activé' : 'Désactivé'} • Test: {method.testAmount} FCFA
                  </Text>
                </View>

                <View style={{ alignItems: 'flex-end', gap: 8 }}>
                  <TouchableOpacity
                    style={{
                      width: 50,
                      height: 30,
                      borderRadius: 15,
                      backgroundColor: method.enabled ? colors.success : colors.border,
                      justifyContent: 'center',
                      paddingHorizontal: 2,
                    }}
                    onPress={() => handleTogglePaymentMethod(method.id)}
                  >
                    <View style={{
                      width: 26,
                      height: 26,
                      borderRadius: 13,
                      backgroundColor: colors.backgroundAlt,
                      alignSelf: method.enabled ? 'flex-end' : 'flex-start',
                    }} />
                  </TouchableOpacity>

                  {method.enabled && (
                    <TouchableOpacity
                      style={[commonStyles.buttonSecondary, { paddingHorizontal: 12, paddingVertical: 6 }]}
                      onPress={() => handleTestPayment(method.id)}
                    >
                      <Text style={[commonStyles.buttonSecondaryText, { fontSize: 12 }]}>
                        Tester
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Test Payment Option */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>
            Test d&apos;encaissement (optionnel)
          </Text>

          <View style={[commonStyles.card, { backgroundColor: colors.warning + '10', borderColor: colors.warning }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <TouchableOpacity
                style={{
                  width: 50,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: enableTestPayment ? colors.success : colors.border,
                  justifyContent: 'center',
                  paddingHorizontal: 2,
                  marginRight: 12,
                }}
                onPress={() => setEnableTestPayment(!enableTestPayment)}
              >
                <View style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor: colors.backgroundAlt,
                  alignSelf: enableTestPayment ? 'flex-end' : 'flex-start',
                }} />
              </TouchableOpacity>

              <View style={{ flex: 1 }}>
                <Text style={[commonStyles.text, { fontWeight: '600', color: colors.warning }]}>
                  Activer le test à 100 FCFA
                </Text>
              </View>
            </View>

            <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
              Chaque membre devra effectuer un paiement test de 100 FCFA pour valider sa méthode de paiement avant le premier tour.
            </Text>

            {enableTestPayment && (
              <View style={{
                backgroundColor: colors.backgroundAlt,
                padding: 12,
                borderRadius: 8,
                marginTop: 12,
                borderWidth: 1,
                borderColor: colors.warning,
              }}>
                <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 4, color: colors.warning }]}>
                  ⚠️ Important
                </Text>
                <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                  Les 100 FCFA de test seront remboursés automatiquement après validation ou ajoutés au premier paiement.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Final Summary */}
        <View style={[commonStyles.card, { backgroundColor: colors.background, borderColor: colors.primary, marginBottom: 24 }]}>
          <Text style={[commonStyles.text, { fontWeight: '600', color: colors.primary, marginBottom: 12 }]}>
            Résumé final
          </Text>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={commonStyles.textSecondary}>Nom</Text>
              <Text style={commonStyles.text}>{tontineData.name}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={commonStyles.textSecondary}>Membres</Text>
              <Text style={commonStyles.text}>{tontineData.members.length}/{tontineData.memberCount}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={commonStyles.textSecondary}>Cotisation</Text>
              <Text style={commonStyles.text}>{tontineData.contributionAmount.toLocaleString()} FCFA</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={commonStyles.textSecondary}>Fréquence</Text>
              <Text style={commonStyles.text}>
                {tontineData.frequency === 'weekly' ? 'Hebdomadaire' : 'Mensuelle'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={commonStyles.textSecondary}>Méthodes de paiement</Text>
              <Text style={commonStyles.text}>{enabledMethodsCount} activées</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={commonStyles.textSecondary}>Test de paiement</Text>
              <Text style={commonStyles.text}>
                {enableTestPayment ? 'Activé (100 FCFA)' : 'Désactivé'}
              </Text>
            </View>
          </View>
        </View>

        {/* Create Button */}
        <TouchableOpacity
          style={[
            commonStyles.button, 
            { marginBottom: 120 },
            isCreating && { backgroundColor: colors.border }
          ]}
          onPress={handleCreateTontine}
          disabled={isCreating || enabledMethodsCount === 0}
        >
          {isCreating ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[commonStyles.buttonText, { marginRight: 8 }]}>Création en cours...</Text>
              <Icon name="refresh" size={16} color={colors.backgroundAlt} />
            </View>
          ) : (
            <Text style={commonStyles.buttonText}>Créer la tontine 🎉</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
