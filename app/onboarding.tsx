
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import Icon from '../components/Icon';

export default function OnboardingScreen() {
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp' | 'profile'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleSendOtp = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir votre numéro de téléphone');
      return;
    }

    // Validate phone number
    const validation = authService.validatePhoneNumber(phoneNumber);
    if (!validation.isValid) {
      Alert.alert('Erreur', validation.error);
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await authService.sendOtp(validation.normalized!);
      
      if (result.success) {
        setStep('otp');
        setOtpTimer(result.expiresIn || 300); // Default 5 minutes
        setPhoneNumber(validation.normalized!);
        Alert.alert(
          'Code envoyé', 
          __DEV__ 
            ? 'En mode développement, utilisez n\'importe quel code à 4 chiffres'
            : `Un code de vérification a été envoyé au ${validation.normalized}`
        );
      } else {
        Alert.alert('Erreur', result.error || 'Impossible d\'envoyer le code');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir le code de vérification');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await authService.verifyOtp(phoneNumber, otp);
      
      if (result.success) {
        if (result.user && !result.user.name) {
          // User needs to complete profile
          setStep('profile');
        } else {
          // User is fully registered, redirect to home
          router.replace('/');
        }
      } else {
        Alert.alert('Erreur', result.error || 'Code de vérification invalide');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir votre nom');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await authService.updateUser({ name: name.trim() });
      
      if (result.success) {
        Alert.alert('Bienvenue!', 'Votre profil a été créé avec succès', [
          { text: 'Continuer', onPress: () => router.replace('/') }
        ]);
      } else {
        Alert.alert('Erreur', result.error || 'Impossible de créer le profil');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpTimer > 0) return;
    
    setIsLoading(true);
    try {
      const result = await authService.sendOtp(phoneNumber);
      if (result.success) {
        setOtpTimer(result.expiresIn || 300);
        Alert.alert('Code renvoyé', 'Un nouveau code a été envoyé');
      } else {
        Alert.alert('Erreur', result.error || 'Impossible de renvoyer le code');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderPhoneStep = () => (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <View style={{ alignItems: 'center', marginBottom: 40 }}>
        <View style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}>
          <Icon name="phone" size={40} color={colors.backgroundAlt} />
        </View>
        <Text style={[commonStyles.title, { textAlign: 'center', marginBottom: 8 }]}>
          Bienvenue sur TontineApp
        </Text>
        <Text style={[commonStyles.textSecondary, { textAlign: 'center' }]}>
          Saisissez votre numéro de téléphone pour commencer
        </Text>
      </View>

      <View style={commonStyles.section}>
        <Text style={[commonStyles.text, { marginBottom: 8 }]}>Numéro de téléphone</Text>
        <TextInput
          style={commonStyles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="+225 XX XX XX XX XX"
          keyboardType="phone-pad"
          autoFocus
          maxLength={15}
        />
        <Text style={[commonStyles.textSecondary, { fontSize: 12, marginTop: 4 }]}>
          Format: +225XXXXXXXX ou XXXXXXXX
        </Text>
      </View>

      <TouchableOpacity
        style={[commonStyles.button, { opacity: isLoading ? 0.7 : 1 }]}
        onPress={handleSendOtp}
        disabled={isLoading}
      >
        <Text style={commonStyles.buttonText}>
          {isLoading ? 'Envoi en cours...' : 'Envoyer le code'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderOtpStep = () => (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <View style={{ alignItems: 'center', marginBottom: 40 }}>
        <View style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: colors.success,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}>
          <Icon name="mail" size={40} color={colors.backgroundAlt} />
        </View>
        <Text style={[commonStyles.title, { textAlign: 'center', marginBottom: 8 }]}>
          Vérification
        </Text>
        <Text style={[commonStyles.textSecondary, { textAlign: 'center' }]}>
          Saisissez le code envoyé au {phoneNumber}
        </Text>
      </View>

      <View style={commonStyles.section}>
        <Text style={[commonStyles.text, { marginBottom: 8 }]}>Code de vérification</Text>
        <TextInput
          style={[commonStyles.input, { textAlign: 'center', fontSize: 24, letterSpacing: 8 }]}
          value={otp}
          onChangeText={setOtp}
          placeholder="0000"
          keyboardType="number-pad"
          autoFocus
          maxLength={6}
        />
        {otpTimer > 0 && (
          <Text style={[commonStyles.textSecondary, { fontSize: 12, marginTop: 4, textAlign: 'center' }]}>
            Code expire dans {formatTimer(otpTimer)}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={[commonStyles.button, { opacity: isLoading ? 0.7 : 1 }]}
        onPress={handleVerifyOtp}
        disabled={isLoading}
      >
        <Text style={commonStyles.buttonText}>
          {isLoading ? 'Vérification...' : 'Vérifier'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[commonStyles.buttonSecondary, { marginTop: 12, opacity: otpTimer > 0 ? 0.5 : 1 }]}
        onPress={handleResendOtp}
        disabled={otpTimer > 0 || isLoading}
      >
        <Text style={commonStyles.buttonSecondaryText}>
          {otpTimer > 0 ? `Renvoyer dans ${formatTimer(otpTimer)}` : 'Renvoyer le code'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ marginTop: 20, alignItems: 'center' }}
        onPress={() => setStep('phone')}
      >
        <Text style={[commonStyles.textSecondary, { textDecorationLine: 'underline' }]}>
          Modifier le numéro
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderProfileStep = () => (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <View style={{ alignItems: 'center', marginBottom: 40 }}>
        <View style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: colors.warning,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}>
          <Icon name="person" size={40} color={colors.backgroundAlt} />
        </View>
        <Text style={[commonStyles.title, { textAlign: 'center', marginBottom: 8 }]}>
          Complétez votre profil
        </Text>
        <Text style={[commonStyles.textSecondary, { textAlign: 'center' }]}>
          Comment souhaitez-vous être appelé(e) ?
        </Text>
      </View>

      <View style={commonStyles.section}>
        <Text style={[commonStyles.text, { marginBottom: 8 }]}>Nom complet</Text>
        <TextInput
          style={commonStyles.input}
          value={name}
          onChangeText={setName}
          placeholder="Ex: Jean Kouassi"
          autoFocus
          autoCapitalize="words"
          maxLength={50}
        />
      </View>

      <TouchableOpacity
        style={[commonStyles.button, { opacity: isLoading ? 0.7 : 1 }]}
        onPress={handleCompleteProfile}
        disabled={isLoading}
      >
        <Text style={commonStyles.buttonText}>
          {isLoading ? 'Création...' : 'Créer mon profil'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={commonStyles.container}>
      <KeyboardAvoidingView 
        style={commonStyles.content} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {step === 'phone' && renderPhoneStep()}
        {step === 'otp' && renderOtpStep()}
        {step === 'profile' && renderProfileStep()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
