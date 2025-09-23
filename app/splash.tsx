
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from '../components/Icon';

export default function SplashScreen() {
  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      // In a real app, check if user is logged in
      // For now, go directly to main app
      router.replace('/');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
      <View style={{ alignItems: 'center' }}>
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
          Tontine App
        </Text>
        <Text style={[commonStyles.textSecondary, { fontSize: 18, textAlign: 'center' }]}>
          Épargnez ensemble, gagnez ensemble
        </Text>
      </View>
    </SafeAreaView>
  );
}
