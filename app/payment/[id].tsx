
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Icon from '../../components/Icon';
import { useSync } from '../../hooks/useSync';
import { paymentService, PAYMENT_PROVIDERS } from '../../services/paymentService';
import { getTontineById, formatCurrency, currentUser } from '../../data/mockData';
import { commonStyles, colors } from '../../styles/commonStyles';
import { Tontine, PaymentMethod } from '../../types';

export default function PaymentScreen() {
  const { id } = useLocalSearchParams();
  const [tontine, setTontine] = useState<Tontine | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { forceSyncTontine } = useSync();

  useEffect(() => {
    if (id) {
      const tontineData = getTontineById(id as string);
      setTontine(tontineData || null);
      console.log('Payment screen loaded for tontine:', tontineData?.name);
    }
  }, [id]);

  const handlePayment = async () => {
    if (!tontine || !selectedMethod) {
      Alert.alert('Erreur', 'Veuillez sélectionner un mode de paiement');
      return;
    }

    try {
      setIsProcessing(true);
      console.log('Initiating payment:', {
        tontine: tontine.name,
        amount: tontine.contributionAmount,
        method: selectedMethod,
      });

      const result = await paymentService.initiatePayment(
        tontine.id,
        tontine.contributionAmount,
        selectedMethod
      );

      if (result.success && result.paymentUrl) {
        console.log('Payment initiated successfully');
        
        // Open payment URL
        const openResult = await paymentService.openPaymentUrl(result.paymentUrl);
        
        if (openResult.success) {
          Alert.alert(
            'Paiement en cours',
            'Vous allez être redirigé vers votre application de paiement. Revenez dans l\'app une fois le paiement terminé.',
            [
              {
                text: 'OK',
                onPress: () => {
                  // Navigate back and wait for payment callback
                  router.back();
                },
              },
            ]
          );
        } else {
          Alert.alert('Erreur', openResult.error || 'Impossible d\'ouvrir le lien de paiement');
        }
      } else {
        Alert.alert('Erreur', result.error || 'Impossible d\'initier le paiement');
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors du paiement');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    console.log('Payment method selected:', method);
  };

  if (!tontine) {
    return (
      <SafeAreaView style={commonStyles.safeArea}>
        <View style={[commonStyles.container, commonStyles.centerContent]}>
          <Text style={commonStyles.text}>Tontine introuvable</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView style={commonStyles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={commonStyles.container}>
          {/* Header */}
          <View style={commonStyles.header}>
            <TouchableOpacity
              style={commonStyles.backButton}
              onPress={() => router.back()}
            >
              <Icon name="arrow-left" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={commonStyles.title}>Paiement</Text>
          </View>

          {/* Payment Details */}
          <View style={commonStyles.card}>
            <Text style={commonStyles.cardTitle}>{tontine.name}</Text>
            <View style={commonStyles.row}>
              <Text style={commonStyles.label}>Montant à payer</Text>
              <Text style={[commonStyles.value, { color: colors.primary, fontSize: 24, fontWeight: 'bold' }]}>
                {formatCurrency(tontine.contributionAmount)}
              </Text>
            </View>
            <View style={commonStyles.row}>
              <Text style={commonStyles.label}>Fréquence</Text>
              <Text style={commonStyles.value}>
                {tontine.frequency === 'weekly' ? 'Hebdomadaire' : 'Mensuelle'}
              </Text>
            </View>
            <View style={commonStyles.row}>
              <Text style={commonStyles.label}>Prochaine échéance</Text>
              <Text style={commonStyles.value}>
                {new Date(tontine.nextPaymentDate).toLocaleDateString('fr-FR')}
              </Text>
            </View>
          </View>

          {/* Payment Methods */}
          <View style={commonStyles.section}>
            <Text style={commonStyles.sectionTitle}>Mode de paiement</Text>
            
            {PAYMENT_PROVIDERS.map((provider) => (
              <TouchableOpacity
                key={provider.id}
                style={[
                  commonStyles.paymentMethod,
                  selectedMethod === provider.id && commonStyles.paymentMethodSelected,
                ]}
                onPress={() => handleMethodSelect(provider.id)}
              >
                <View style={commonStyles.paymentMethodContent}>
                  <View style={[commonStyles.paymentMethodIcon, { backgroundColor: provider.color }]}>
                    <Icon name={provider.icon} size={24} color="white" />
                  </View>
                  <Text style={commonStyles.paymentMethodName}>{provider.name}</Text>
                </View>
                <View style={[
                  commonStyles.radio,
                  selectedMethod === provider.id && commonStyles.radioSelected,
                ]}>
                  {selectedMethod === provider.id && (
                    <View style={commonStyles.radioInner} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Security Notice */}
          <View style={commonStyles.securityNotice}>
            <Icon name="shield-check" size={20} color={colors.success} />
            <Text style={commonStyles.securityText}>
              Vos paiements sont sécurisés et cryptés
            </Text>
          </View>

          {/* Payment Button */}
          <TouchableOpacity
            style={[
              commonStyles.button,
              commonStyles.primaryButton,
              (!selectedMethod || isProcessing) && commonStyles.buttonDisabled,
            ]}
            onPress={handlePayment}
            disabled={!selectedMethod || isProcessing}
          >
            <Text style={commonStyles.buttonText}>
              {isProcessing ? 'Traitement...' : `Payer ${formatCurrency(tontine.contributionAmount)}`}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
