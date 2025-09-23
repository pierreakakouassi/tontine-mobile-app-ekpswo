
import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import * as Linking from 'expo-linking';

import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { useSync } from '../hooks/useSync';
import { paymentService } from '../services/paymentService';
import { commonStyles, colors } from '../styles/commonStyles';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isInitialized: notificationsInitialized } = useNotifications();
  const { performSync } = useSync();
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    // Handle deep links for payment callbacks
    const handleDeepLink = (url: string) => {
      console.log('Deep link received:', url);
      
      if (url.includes('payment-callback')) {
        handlePaymentCallback(url);
      }
    };

    // Listen for deep links
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    // Check if app was opened with a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => subscription?.remove();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('Initializing app...');

      // Wait for auth to initialize
      let attempts = 0;
      while (authLoading && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      // Perform initial sync if authenticated
      if (isAuthenticated) {
        console.log('User authenticated, performing initial sync...');
        await performSync();
      }

      // Wait a bit more for everything to settle
      await new Promise(resolve => setTimeout(resolve, 500));

      setIsAppReady(true);
      await SplashScreen.hideAsync();
      
      console.log('App initialization completed');
    } catch (error) {
      console.error('App initialization failed:', error);
      setIsAppReady(true);
      await SplashScreen.hideAsync();
    }
  };

  const handlePaymentCallback = async (url: string) => {
    try {
      console.log('Processing payment callback...');
      
      const result = await paymentService.processPaymentCallback(url);
      
      if (result.success && result.transactionId) {
        // Verify the payment
        const verification = await paymentService.verifyPayment(result.transactionId);
        
        if (verification.success) {
          console.log('Payment verified successfully');
          // Trigger sync to update payment status
          await performSync(true);
        } else {
          console.error('Payment verification failed:', verification.error);
        }
      } else {
        console.error('Payment callback processing failed:', result.error);
      }
    } catch (error) {
      console.error('Payment callback handling error:', error);
    }
  };

  if (!isAppReady) {
    return (
      <View style={[commonStyles.container, commonStyles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[commonStyles.text, { marginTop: 16 }]}>
          Initialisation...
        </Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="welcome" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="create-tontine" />
          <Stack.Screen name="tontine/[id]" />
          <Stack.Screen name="payment/[id]" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="help" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
