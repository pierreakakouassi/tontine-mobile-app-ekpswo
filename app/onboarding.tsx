
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Icon from '../components/Icon';
import { useAuth } from '../hooks/useAuth';
import { commonStyles, colors } from '../styles/commonStyles';

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('fr');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { sendOtp, verifyOtp } = useAuth();

  const handleNextStep = async () => {
    if (currentStep === 1) {
      if (!phoneNumber.trim()) {
        Alert.alert('Erreur', 'Veuillez saisir votre numéro de téléphone');
        return;
      }

      setIsLoading(true);
      console.log('Sending OTP to:', phoneNumber);
      
      const result = await sendOtp(phoneNumber);
      setIsLoading(false);

      if (result.success) {
        setCurrentStep(2);
        Alert.alert(
          'Code envoyé', 
          'Un code de vérification a été envoyé à votre numéro de téléphone'
        );
      } else {
        Alert.alert('Erreur', result.error || 'Impossible d\'envoyer le code');
      }
    } else if (currentStep === 2) {
      if (!otp.trim() || otp.length !== 4) {
        Alert.alert('Erreur', 'Veuillez saisir le code à 4 chiffres');
        return;
      }

      setIsLoading(true);
      console.log('Verifying OTP:', otp);
      
      const result = await verifyOtp(phoneNumber, otp);
      setIsLoading(false);

      if (result.success) {
        setCurrentStep(3);
      } else {
        Alert.alert('Erreur', result.error || 'Code de vérification incorrect');
      }
    } else if (currentStep === 3) {
      if (!name.trim()) {
        Alert.alert('Erreur', 'Veuillez saisir votre nom');
        return;
      }

      if (!acceptedTerms) {
        Alert.alert('Erreur', 'Veuillez accepter les conditions d\'utilisation');
        return;
      }

      // Complete onboarding
      console.log('Onboarding completed for:', { name, language, phoneNumber });
      Alert.alert(
        'Bienvenue !',
        'Votre compte a été créé avec succès. Vous pouvez maintenant créer ou rejoindre une tontine.',
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
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep1 = () => (
    <View style={commonStyles.container}>
      <View style={commonStyles.header}>
        <Text style={commonStyles.title}>Bienvenue !</Text>
        <Text style={commonStyles.subtitle}>
          Commençons par vérifier votre numéro de téléphone
        </Text>
      </View>

      <View style={commonStyles.content}>
        <View style={commonStyles.inputContainer}>
          <Text style={commonStyles.label}>Numéro de téléphone</Text>
          <TextInput
            style={commonStyles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="+225 XX XX XX XX XX"
            keyboardType="phone-pad"
            autoFocus
          />
        </View>

        <Text style={commonStyles.helperText}>
          Nous utiliserons ce numéro pour vous identifier et vous envoyer des notifications importantes.
        </Text>
      </View>

      <View style={commonStyles.footer}>
        <TouchableOpacity
          style={[commonStyles.button, commonStyles.primaryButton]}
          onPress={handleNextStep}
          disabled={isLoading}
        >
          <Text style={commonStyles.buttonText}>
            {isLoading ? 'Envoi...' : 'Continuer'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={commonStyles.container}>
      <TouchableOpacity
        style={commonStyles.backButton}
        onPress={handlePreviousStep}
      >
        <Icon name="arrow-left" size={24} color={colors.text} />
      </TouchableOpacity>

      <View style={commonStyles.header}>
        <Text style={commonStyles.title}>Vérification</Text>
        <Text style={commonStyles.subtitle}>
          Saisissez le code à 4 chiffres envoyé au {phoneNumber}
        </Text>
      </View>

      <View style={commonStyles.content}>
        <View style={commonStyles.inputContainer}>
          <Text style={commonStyles.label}>Code de vérification</Text>
          <TextInput
            style={[commonStyles.input, { textAlign: 'center', fontSize: 24, letterSpacing: 8 }]}
            value={otp}
            onChangeText={setOtp}
            placeholder="0000"
            keyboardType="numeric"
            maxLength={4}
            autoFocus
          />
        </View>

        <TouchableOpacity
          style={commonStyles.linkButton}
          onPress={() => {
            setCurrentStep(1);
            setOtp('');
          }}
        >
          <Text style={commonStyles.linkText}>
            Modifier le numéro de téléphone
          </Text>
        </TouchableOpacity>
      </View>

      <View style={commonStyles.footer}>
        <TouchableOpacity
          style={[commonStyles.button, commonStyles.primaryButton]}
          onPress={handleNextStep}
          disabled={isLoading}
        >
          <Text style={commonStyles.buttonText}>
            {isLoading ? 'Vérification...' : 'Vérifier'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={commonStyles.container}>
      <TouchableOpacity
        style={commonStyles.backButton}
        onPress={handlePreviousStep}
      >
        <Icon name="arrow-left" size={24} color={colors.text} />
      </TouchableOpacity>

      <View style={commonStyles.header}>
        <Text style={commonStyles.title}>Profil minimal</Text>
        <Text style={commonStyles.subtitle}>
          Quelques informations pour finaliser votre compte
        </Text>
      </View>

      <View style={commonStyles.content}>
        <View style={commonStyles.inputContainer}>
          <Text style={commonStyles.label}>Votre nom *</Text>
          <TextInput
            style={commonStyles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ex: Jean Kouassi"
            autoFocus
          />
        </View>

        <View style={commonStyles.inputContainer}>
          <Text style={commonStyles.label}>Langue préférée</Text>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
            <TouchableOpacity
              style={[
                commonStyles.buttonSecondary,
                { flex: 1 },
                language === 'fr' && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => setLanguage('fr')}
            >
              <Text style={[
                commonStyles.buttonSecondaryText,
                language === 'fr' && { color: colors.backgroundAlt }
              ]}>
                Français
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                commonStyles.buttonSecondary,
                { flex: 1 },
                language === 'nouchi' && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => setLanguage('nouchi')}
            >
              <Text style={[
                commonStyles.buttonSecondaryText,
                language === 'nouchi' && { color: colors.backgroundAlt }
              ]}>
                Nouchi FR
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ marginTop: 20 }}>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center' }}
            onPress={() => setAcceptedTerms(!acceptedTerms)}
          >
            <View style={{
              width: 20,
              height: 20,
              borderRadius: 4,
              borderWidth: 2,
              borderColor: acceptedTerms ? colors.primary : colors.border,
              backgroundColor: acceptedTerms ? colors.primary : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}>
              {acceptedTerms && (
                <Icon name="checkmark" size={12} color={colors.backgroundAlt} />
              )}
            </View>
            <Text style={[commonStyles.text, { flex: 1, fontSize: 14 }]}>
              J&apos;accepte les{' '}
              <Text style={{ color: colors.primary, textDecorationLine: 'underline' }}>
                conditions d&apos;utilisation
              </Text>
              {' '}et la{' '}
              <Text style={{ color: colors.primary, textDecorationLine: 'underline' }}>
                politique de confidentialité
              </Text>
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[commonStyles.helperText, { marginTop: 16 }]}>
          Ce nom sera visible par les autres membres de vos tontines.
        </Text>
      </View>

      <View style={commonStyles.footer}>
        <TouchableOpacity
          style={[commonStyles.button, commonStyles.primaryButton]}
          onPress={handleNextStep}
        >
          <Text style={commonStyles.buttonText}>Terminer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView style={commonStyles.scrollView} showsVerticalScrollIndicator={false}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </ScrollView>
    </SafeAreaView>
  );
}
