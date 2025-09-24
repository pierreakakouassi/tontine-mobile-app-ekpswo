
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from '../components/Icon';

export default function WelcomeScreen() {
  const handleGetStarted = () => {
    console.log('Navigate to onboarding');
    router.push('/onboarding');
  };

  const handleLogin = () => {
    console.log('Navigate to login');
    // For now, just go to main app
    router.replace('/');
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 }}>
          <View style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32,
          }}>
            <Icon name="wallet" size={60} color={colors.backgroundAlt} />
          </View>
          
          <Text style={[commonStyles.title, { fontSize: 32, textAlign: 'center', marginBottom: 16 }]}>
            TontineCI
          </Text>
          <Text style={[commonStyles.textSecondary, { fontSize: 18, textAlign: 'center', marginBottom: 40 }]}>
            Créer/rejoindre une tontine en 2 minutes
          </Text>
        </View>

        {/* Features */}
        <View style={{ marginBottom: 40 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <View style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: colors.success + '20',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
            }}>
              <Icon name="card" size={24} color={colors.success} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 4 }]}>
                Mobile Money intégré
              </Text>
              <Text style={commonStyles.textSecondary}>
                Orange/MTN/Wave ou cash enregistré
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <View style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: colors.primary + '20',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
            }}>
              <Icon name="eye" size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 4 }]}>
                Transparence totale
              </Text>
              <Text style={commonStyles.textSecondary}>
                Qui a payé, qui reçoit, calendrier, historique
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <View style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: colors.warning + '20',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
            }}>
              <Icon name="chatbubbles" size={24} color={colors.warning} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 4 }]}>
                Rappels automatiques
              </Text>
              <Text style={commonStyles.textSecondary}>
                WhatsApp/SMS pour ne jamais oublier
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: colors.accent + '20',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
            }}>
              <Icon name="star" size={24} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 4 }]}>
                Score de fiabilité
              </Text>
              <Text style={commonStyles.textSecondary}>
                Évaluation des membres basée sur l'historique
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ gap: 16, marginBottom: 40 }}>
          <TouchableOpacity
            style={commonStyles.button}
            onPress={handleGetStarted}
          >
            <Text style={commonStyles.buttonText}>Créer un compte</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={commonStyles.buttonSecondary}
            onPress={handleLogin}
          >
            <Text style={commonStyles.buttonSecondaryText}>Se connecter</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={{ alignItems: 'center', paddingBottom: 40 }}>
          <Text style={[commonStyles.textSecondary, { fontSize: 12, textAlign: 'center' }]}>
            En continuant, vous acceptez nos conditions d&apos;utilisation et notre politique de confidentialité
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
