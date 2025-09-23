
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from '../components/Icon';

export default function OnboardingScreen() {
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const handleNextStep = () => {
    console.log('Moving to step:', step + 1);
    
    if (step === 1) {
      if (!phoneNumber.trim()) {
        Alert.alert('Erreur', 'Veuillez saisir votre numéro de téléphone');
        return;
      }
      // In a real app, send OTP here
      setStep(2);
    } else if (step === 2) {
      if (!otpCode.trim() || otpCode.length !== 6) {
        Alert.alert('Erreur', 'Veuillez saisir le code à 6 chiffres');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!name.trim()) {
        Alert.alert('Erreur', 'Veuillez saisir votre nom complet');
        return;
      }
      // Complete registration
      Alert.alert(
        'Inscription réussie !',
        'Bienvenue dans Tontine App. Vous pouvez maintenant créer ou rejoindre des tontines.',
        [
          {
            text: 'Commencer',
            onPress: () => router.replace('/'),
          },
        ]
      );
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStep1 = () => (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <View style={{ alignItems: 'center', marginBottom: 40 }}>
        <View style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}>
          <Icon name="phone-portrait" size={40} color={colors.backgroundAlt} />
        </View>
        <Text style={[commonStyles.title, { textAlign: 'center', marginBottom: 8 }]}>
          Votre numéro de téléphone
        </Text>
        <Text style={[commonStyles.textSecondary, { textAlign: 'center' }]}>
          Nous utiliserons votre numéro pour sécuriser votre compte et les paiements
        </Text>
      </View>

      <View style={{ marginBottom: 40 }}>
        <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
          Numéro de téléphone
        </Text>
        <TextInput
          style={commonStyles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="+225 07 12 34 56 78"
          placeholderTextColor={colors.textSecondary}
          keyboardType="phone-pad"
        />
      </View>

      <TouchableOpacity
        style={commonStyles.button}
        onPress={handleNextStep}
      >
        <Text style={commonStyles.buttonText}>Continuer</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <View style={{ alignItems: 'center', marginBottom: 40 }}>
        <View style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: colors.success,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}>
          <Icon name="shield-checkmark" size={40} color={colors.backgroundAlt} />
        </View>
        <Text style={[commonStyles.title, { textAlign: 'center', marginBottom: 8 }]}>
          Vérification
        </Text>
        <Text style={[commonStyles.textSecondary, { textAlign: 'center' }]}>
          Nous avons envoyé un code de vérification au {phoneNumber}
        </Text>
      </View>

      <View style={{ marginBottom: 40 }}>
        <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
          Code de vérification
        </Text>
        <TextInput
          style={[commonStyles.input, { textAlign: 'center', fontSize: 24, letterSpacing: 8 }]}
          value={otpCode}
          onChangeText={setOtpCode}
          placeholder="123456"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
          maxLength={6}
        />
        <TouchableOpacity style={{ alignSelf: 'center', marginTop: 16 }}>
          <Text style={[commonStyles.textSecondary, { textDecorationLine: 'underline' }]}>
            Renvoyer le code
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ gap: 12 }}>
        <TouchableOpacity
          style={commonStyles.button}
          onPress={handleNextStep}
        >
          <Text style={commonStyles.buttonText}>Vérifier</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={commonStyles.buttonSecondary}
          onPress={handlePreviousStep}
        >
          <Text style={commonStyles.buttonSecondaryText}>Retour</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <View style={{ alignItems: 'center', marginBottom: 40 }}>
        <View style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: colors.accent,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}>
          <Icon name="person" size={40} color={colors.backgroundAlt} />
        </View>
        <Text style={[commonStyles.title, { textAlign: 'center', marginBottom: 8 }]}>
          Votre profil
        </Text>
        <Text style={[commonStyles.textSecondary, { textAlign: 'center' }]}>
          Dites-nous comment vous appeler
        </Text>
      </View>

      <View style={{ marginBottom: 40 }}>
        <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
          Nom complet
        </Text>
        <TextInput
          style={commonStyles.input}
          value={name}
          onChangeText={setName}
          placeholder="Kouassi Jean Baptiste"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={{ gap: 12 }}>
        <TouchableOpacity
          style={commonStyles.button}
          onPress={handleNextStep}
        >
          <Text style={commonStyles.buttonText}>Terminer</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={commonStyles.buttonSecondary}
          onPress={handlePreviousStep}
        >
          <Text style={commonStyles.buttonSecondaryText}>Retour</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.content}>
        {/* Progress Indicator */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'center', 
          alignItems: 'center',
          paddingVertical: 20,
          gap: 8,
        }}>
          {[1, 2, 3].map((stepNumber) => (
            <View
              key={stepNumber}
              style={{
                width: stepNumber === step ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: stepNumber <= step ? colors.primary : colors.border,
              }}
            />
          ))}
        </View>

        {/* Step Content */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </View>
    </SafeAreaView>
  );
}
