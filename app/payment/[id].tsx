
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { commonStyles, colors } from '../../styles/commonStyles';
import { getTontineById, formatCurrency, currentUser } from '../../data/mockData';
import { Tontine, PaymentMethod } from '../../types';
import Icon from '../../components/Icon';

const paymentMethods: { id: PaymentMethod; name: string; icon: string; color: string }[] = [
  { id: 'orange', name: 'Orange Money', icon: 'phone-portrait', color: '#FF6600' },
  { id: 'mtn', name: 'MTN Mobile Money', icon: 'phone-portrait', color: '#FFCC00' },
  { id: 'wave', name: 'Wave', icon: 'phone-portrait', color: '#00D4FF' },
];

export default function PaymentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tontine, setTontine] = useState<Tontine | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('orange');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (id) {
      const tontineData = getTontineById(id);
      setTontine(tontineData || null);
      console.log('Loaded tontine for payment:', tontineData?.name);
    }
  }, [id]);

  const handlePayment = async () => {
    if (!tontine) return;

    console.log('Processing payment:', {
      tontineId: tontine.id,
      amount: tontine.contributionAmount,
      method: selectedMethod,
    });

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      Alert.alert(
        'Paiement réussi !',
        `Votre cotisation de ${formatCurrency(tontine.contributionAmount)} a été payée avec succès via ${paymentMethods.find(m => m.id === selectedMethod)?.name}.`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    }, 2000);
  };

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    console.log('Selected payment method:', method);
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

  const currentUserMember = tontine.members.find(m => m.userId === currentUser.id);

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
          <Text style={commonStyles.title}>Paiement</Text>
        </View>

        {/* Payment Summary */}
        <View style={[commonStyles.card, { marginBottom: 24, backgroundColor: colors.primary + '10', borderColor: colors.primary }]}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 16, color: colors.primary }]}>
            Résumé du paiement
          </Text>
          
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={commonStyles.textSecondary}>Tontine</Text>
              <Text style={commonStyles.text}>{tontine.name}</Text>
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={commonStyles.textSecondary}>Tour</Text>
              <Text style={commonStyles.text}>{tontine.currentRound} / {tontine.totalRounds}</Text>
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={commonStyles.textSecondary}>Montant à payer</Text>
              <Text style={[commonStyles.text, { fontSize: 18, fontWeight: '700', color: colors.primary }]}>
                {formatCurrency(tontine.contributionAmount)}
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={commonStyles.textSecondary}>Frais de service</Text>
              <Text style={commonStyles.text}>Gratuit</Text>
            </View>
            
            <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 8 }} />
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={[commonStyles.text, { fontWeight: '600' }]}>Total</Text>
              <Text style={[commonStyles.text, { fontSize: 18, fontWeight: '700', color: colors.primary }]}>
                {formatCurrency(tontine.contributionAmount)}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>
            Choisir un moyen de paiement
          </Text>
          
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                commonStyles.card,
                { 
                  marginBottom: 12,
                  borderColor: selectedMethod === method.id ? colors.primary : colors.border,
                  borderWidth: selectedMethod === method.id ? 2 : 1,
                }
              ]}
              onPress={() => handleMethodSelect(method.id)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: method.color + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16,
                }}>
                  <Icon name={method.icon as any} size={24} color={method.color} />
                </View>
                
                <View style={{ flex: 1 }}>
                  <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                    {method.name}
                  </Text>
                  <Text style={commonStyles.textSecondary}>
                    Paiement sécurisé et instantané
                  </Text>
                </View>

                <View style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: selectedMethod === method.id ? colors.primary : colors.border,
                  backgroundColor: selectedMethod === method.id ? colors.primary : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {selectedMethod === method.id && (
                    <View style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: colors.backgroundAlt,
                    }} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment Instructions */}
        <View style={[commonStyles.card, { marginBottom: 24, backgroundColor: colors.background }]}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 12 }]}>
            Instructions
          </Text>
          <View style={{ gap: 8 }}>
            <Text style={commonStyles.textSecondary}>
              • Assurez-vous d&apos;avoir suffisamment de solde sur votre compte
            </Text>
            <Text style={commonStyles.textSecondary}>
              • Le paiement sera traité instantanément
            </Text>
            <Text style={commonStyles.textSecondary}>
              • Vous recevrez une confirmation par SMS
            </Text>
            <Text style={commonStyles.textSecondary}>
              • En cas de problème, contactez le support
            </Text>
          </View>
        </View>

        {/* Pay Button */}
        <TouchableOpacity
          style={[
            commonStyles.button,
            { 
              marginBottom: 24,
              opacity: isProcessing ? 0.7 : 1,
            }
          ]}
          onPress={handlePayment}
          disabled={isProcessing}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            {isProcessing && (
              <Icon name="hourglass" size={20} color={colors.backgroundAlt} style={{ marginRight: 8 }} />
            )}
            <Text style={commonStyles.buttonText}>
              {isProcessing ? 'Traitement en cours...' : `Payer ${formatCurrency(tontine.contributionAmount)}`}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
