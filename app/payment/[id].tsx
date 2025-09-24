
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { commonStyles, colors } from '../../styles/commonStyles';
import { getTontineById, formatCurrency, currentUser } from '../../data/mockData';
import { Tontine } from '../../types';
import Icon from '../../components/Icon';

interface PaymentMethod {
  id: 'orange' | 'mtn' | 'wave';
  name: string;
  icon: string;
  color: string;
  ussdCode: string;
  enabled: boolean;
  fees: number;
}

export default function PaymentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tontine, setTontine] = useState<Tontine | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'orange' | 'mtn' | 'wave' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState(currentUser.phoneNumber);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethods] = useState<PaymentMethod[]>([
    {
      id: 'orange',
      name: 'Orange Money',
      icon: 'phone-portrait',
      color: '#FF6600',
      ussdCode: '#144#',
      enabled: true,
      fees: 0
    },
    {
      id: 'mtn',
      name: 'MTN MoMo',
      icon: 'phone-portrait',
      color: '#FFCC00',
      ussdCode: '*133#',
      enabled: true,
      fees: 0
    },
    {
      id: 'wave',
      name: 'Wave',
      icon: 'phone-portrait',
      color: '#00D4FF',
      ussdCode: '*639#',
      enabled: true,
      fees: 0
    }
  ]);

  useEffect(() => {
    if (id) {
      const tontineData = getTontineById(id);
      setTontine(tontineData || null);
      console.log('Loaded tontine for payment:', tontineData?.name);
    }
  }, [id]);

  const handlePaymentMethodSelect = (methodId: 'orange' | 'mtn' | 'wave') => {
    setSelectedMethod(methodId);
    console.log('Selected payment method:', methodId);
  };

  const validatePhoneNumber = (phone: string, method: PaymentMethod) => {
    const cleanPhone = phone.replace(/\s+/g, '');
    
    switch (method.id) {
      case 'orange':
        return cleanPhone.startsWith('+22507') || cleanPhone.startsWith('07');
      case 'mtn':
        return cleanPhone.startsWith('+22505') || cleanPhone.startsWith('05') ||
               cleanPhone.startsWith('+22501') || cleanPhone.startsWith('01');
      case 'wave':
        return cleanPhone.length >= 8; // Wave accepts most numbers
      default:
        return false;
    }
  };

  const processPayment = async () => {
    if (!tontine || !selectedMethod) return;

    const method = paymentMethods.find(m => m.id === selectedMethod);
    if (!method) return;

    // Validate phone number
    if (!validatePhoneNumber(phoneNumber, method)) {
      Alert.alert(
        'Numéro invalide',
        `Le numéro ${phoneNumber} n'est pas compatible avec ${method.name}.\n\nVérifiez que votre numéro correspond à l'opérateur sélectionné.`
      );
      return;
    }

    const amount = tontine.contributionAmount;
    const totalAmount = amount + method.fees;

    Alert.alert(
      'Confirmer le paiement',
      `Montant: ${formatCurrency(amount)}\nFrais: ${formatCurrency(method.fees)}\nTotal: ${formatCurrency(totalAmount)}\n\nOpérateur: ${method.name}\nNuméro: ${phoneNumber}`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: () => initiatePayment(method, totalAmount)
        }
      ]
    );
  };

  const initiatePayment = async (method: PaymentMethod, amount: number) => {
    setIsProcessing(true);
    
    try {
      console.log(`Initiating ${method.name} payment for ${amount} FCFA`);

      // Simulate API call to initiate payment
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Show USSD instructions
      Alert.alert(
        'Paiement initié',
        `Votre paiement ${method.name} a été initié.\n\n📱 Suivez les instructions sur votre téléphone:\n\n1. Composez ${method.ussdCode}\n2. Suivez les instructions\n3. Confirmez le paiement de ${formatCurrency(amount)}\n\nVous recevrez une confirmation par SMS.`,
        [
          {
            text: 'Composer maintenant',
            onPress: () => {
              const ussdUrl = `tel:${encodeURIComponent(method.ussdCode)}`;
              Linking.canOpenURL(ussdUrl).then(supported => {
                if (supported) {
                  Linking.openURL(ussdUrl);
                } else {
                  Alert.alert('Erreur', 'Impossible d\'ouvrir le composeur téléphonique');
                }
              });
            }
          },
          {
            text: 'Plus tard',
            onPress: () => {
              // Simulate pending payment status
              setTimeout(() => {
                checkPaymentStatus(method, amount);
              }, 5000);
            }
          }
        ]
      );

    } catch (error) {
      console.error('Payment initiation failed:', error);
      Alert.alert('Erreur', 'Impossible d\'initier le paiement. Veuillez réessayer.');
    } finally {
      setIsProcessing(false);
    }
  };

  const checkPaymentStatus = (method: PaymentMethod, amount: number) => {
    // Simulate payment status check
    const isSuccess = Math.random() > 0.2; // 80% success rate for demo

    if (isSuccess) {
      Alert.alert(
        'Paiement réussi! 🎉',
        `Votre cotisation de ${formatCurrency(amount)} a été reçue avec succès.\n\nMerci pour votre participation à "${tontine?.name}"!\n\nVous recevrez une notification de confirmation.`,
        [
          {
            text: 'Retour à la tontine',
            onPress: () => router.back()
          }
        ]
      );
    } else {
      Alert.alert(
        'Paiement échoué',
        `Le paiement de ${formatCurrency(amount)} via ${method.name} a échoué.\n\nRaisons possibles:\n• Solde insuffisant\n• Problème réseau\n• Transaction annulée\n\nVeuillez réessayer.`,
        [
          { text: 'Réessayer', onPress: () => processPayment() },
          { text: 'Annuler', onPress: () => router.back() }
        ]
      );
    }
  };

  const showPaymentHelp = () => {
    Alert.alert(
      'Aide au paiement',
      '💡 Conseils pour un paiement réussi:\n\n' +
      '✅ Vérifiez votre solde avant de payer\n' +
      '✅ Assurez-vous d\'avoir du réseau\n' +
      '✅ Gardez votre téléphone allumé\n' +
      '✅ Notez le code de transaction\n\n' +
      '❓ En cas de problème:\n' +
      '• Contactez votre opérateur\n' +
      '• Vérifiez vos SMS\n' +
      '• Contactez le support Tontine CI',
      [{ text: 'Compris' }]
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

  const currentUserMember = tontine.members.find(m => m.userId === currentUser.id);
  const selectedMethodData = paymentMethods.find(m => m.id === selectedMethod);

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
            <Text style={commonStyles.title}>Payer ma part</Text>
            <Text style={commonStyles.textSecondary}>{tontine.name}</Text>
          </View>
          <TouchableOpacity onPress={showPaymentHelp}>
            <Icon name="help-circle" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Payment Summary */}
        <View style={[commonStyles.card, { marginBottom: 24, backgroundColor: colors.primary + '10', borderColor: colors.primary }]}>
          <Text style={[commonStyles.text, { fontWeight: '600', color: colors.primary, marginBottom: 12 }]}>
            Résumé du paiement
          </Text>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={commonStyles.textSecondary}>Cotisation</Text>
              <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                {formatCurrency(tontine.contributionAmount)}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={commonStyles.textSecondary}>Frais de transaction</Text>
              <Text style={commonStyles.text}>
                {selectedMethodData ? formatCurrency(selectedMethodData.fees) : '0 FCFA'}
              </Text>
            </View>
            <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 8 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={[commonStyles.text, { fontWeight: '600' }]}>Total à payer</Text>
              <Text style={[commonStyles.text, { fontWeight: '700', fontSize: 18, color: colors.primary }]}>
                {formatCurrency(tontine.contributionAmount + (selectedMethodData?.fees || 0))}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Method Selection */}
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
                  borderColor: selectedMethod === method.id ? method.color : colors.border,
                  borderWidth: selectedMethod === method.id ? 2 : 1,
                  backgroundColor: selectedMethod === method.id ? method.color + '10' : colors.surface
                }
              ]}
              onPress={() => handlePaymentMethodSelect(method.id)}
              disabled={!method.enabled}
            >
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
                    Code USSD: {method.ussdCode} • Frais: {formatCurrency(method.fees)}
                  </Text>
                </View>

                <View style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: selectedMethod === method.id ? method.color : colors.border,
                  backgroundColor: selectedMethod === method.id ? method.color : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {selectedMethod === method.id && (
                    <Icon name="checkmark" size={14} color={colors.backgroundAlt} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Phone Number Input */}
        {selectedMethod && (
          <View style={commonStyles.section}>
            <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>
              Numéro de téléphone
            </Text>
            
            <View style={[commonStyles.card, { backgroundColor: colors.background, borderColor: selectedMethodData?.color }]}>
              <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8, color: selectedMethodData?.color }]}>
                {selectedMethodData?.name}
              </Text>
              <TextInput
                style={[commonStyles.input, { marginBottom: 0 }]}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Ex: +225 07 00 00 00 00"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
              />
              <Text style={[commonStyles.textSecondary, { fontSize: 12, marginTop: 8 }]}>
                Assurez-vous que ce numéro correspond à votre compte {selectedMethodData?.name}
              </Text>
            </View>
          </View>
        )}

        {/* Payment Instructions */}
        {selectedMethod && (
          <View style={[commonStyles.card, { backgroundColor: colors.warning + '10', borderColor: colors.warning, marginBottom: 24 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Icon name="information-circle" size={16} color={colors.warning} style={{ marginRight: 8 }} />
              <Text style={[commonStyles.text, { fontWeight: '600', color: colors.warning }]}>
                Instructions de paiement
              </Text>
            </View>
            <Text style={[commonStyles.textSecondary, { fontSize: 12, lineHeight: 18 }]}>
              1. Cliquez sur "Payer maintenant" ci-dessous{'\n'}
              2. Composez {selectedMethodData?.ussdCode} sur votre téléphone{'\n'}
              3. Suivez les instructions à l&apos;écran{'\n'}
              4. Confirmez le paiement de {formatCurrency(tontine.contributionAmount + (selectedMethodData?.fees || 0))}{'\n'}
              5. Vous recevrez un SMS de confirmation
            </Text>
          </View>
        )}

        {/* Pay Button */}
        <TouchableOpacity
          style={[
            commonStyles.button,
            { 
              marginBottom: 24,
              backgroundColor: selectedMethod ? selectedMethodData?.color : colors.border
            },
            isProcessing && { opacity: 0.7 }
          ]}
          onPress={processPayment}
          disabled={!selectedMethod || isProcessing}
        >
          {isProcessing ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[commonStyles.buttonText, { marginRight: 8 }]}>Traitement...</Text>
              <Icon name="refresh" size={16} color={colors.backgroundAlt} />
            </View>
          ) : (
            <Text style={commonStyles.buttonText}>
              Payer {formatCurrency(tontine.contributionAmount + (selectedMethodData?.fees || 0))}
            </Text>
          )}
        </TouchableOpacity>

        {/* Security Notice */}
        <View style={[commonStyles.card, { backgroundColor: colors.success + '10', borderColor: colors.success }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Icon name="shield-checkmark" size={16} color={colors.success} style={{ marginRight: 8 }} />
            <Text style={[commonStyles.text, { fontWeight: '600', color: colors.success }]}>
              Paiement sécurisé
            </Text>
          </View>
          <Text style={[commonStyles.textSecondary, { fontSize: 12, lineHeight: 18 }]}>
            • Vos données sont chiffrées et protégées{'\n'}
            • Aucune information bancaire n&apos;est stockée{'\n'}
            • Transaction directe avec votre opérateur{'\n'}
            • Confirmation instantanée par SMS
          </Text>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
