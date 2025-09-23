
import { useState, useEffect } from 'react';
import { authService, AuthState } from '../services/authService';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    console.log('Setting up auth state listener');
    
    const unsubscribe = authService.subscribe((state) => {
      console.log('Auth state updated:', state);
      setAuthState(state);
    });

    return unsubscribe;
  }, []);

  const sendOtp = async (phoneNumber: string) => {
    console.log('Sending OTP via hook:', phoneNumber);
    return authService.sendOtp(phoneNumber);
  };

  const verifyOtp = async (phoneNumber: string, otp: string) => {
    console.log('Verifying OTP via hook:', phoneNumber);
    return authService.verifyOtp(phoneNumber, otp);
  };

  const logout = async () => {
    console.log('Logging out via hook');
    return authService.logout();
  };

  const updateUser = async (userData: any) => {
    console.log('Updating user via hook');
    return authService.updateUser(userData);
  };

  return {
    ...authState,
    sendOtp,
    verifyOtp,
    logout,
    updateUser,
  };
}
