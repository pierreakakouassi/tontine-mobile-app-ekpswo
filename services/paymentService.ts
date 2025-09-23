
import { Payment, PaymentMethod } from '../types';
import { apiService } from './apiService';
import * as Linking from 'expo-linking';

export interface PaymentProvider {
  name: string;
  id: PaymentMethod;
  color: string;
  icon: string;
  isAvailable: boolean;
}

export const PAYMENT_PROVIDERS: PaymentProvider[] = [
  {
    name: 'Orange Money',
    id: 'orange',
    color: '#FF6600',
    icon: 'phone',
    isAvailable: true,
  },
  {
    name: 'MTN Mobile Money',
    id: 'mtn',
    color: '#FFCC00',
    icon: 'phone',
    isAvailable: true,
  },
  {
    name: 'Wave',
    id: 'wave',
    color: '#00D4FF',
    icon: 'phone',
    isAvailable: true,
  },
];

class PaymentService {
  private pendingPayments: Map<string, { tontineId: string; amount: number }> = new Map();

  async initiatePayment(
    tontineId: string, 
    amount: number, 
    paymentMethod: PaymentMethod
  ): Promise<{ success: boolean; paymentUrl?: string; transactionId?: string; error?: string }> {
    try {
      console.log(`Initiating ${paymentMethod} payment for tontine ${tontineId}, amount: ${amount}`);

      // In development mode, simulate payment flow
      if (__DEV__) {
        const mockTransactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Store pending payment
        this.pendingPayments.set(mockTransactionId, { tontineId, amount });
        
        // Simulate payment URL
        const paymentUrl = this.generateMockPaymentUrl(paymentMethod, mockTransactionId, amount);
        
        console.log('Mock payment initiated:', mockTransactionId);
        return {
          success: true,
          paymentUrl,
          transactionId: mockTransactionId,
        };
      }

      // In production, call the real API
      const response = await apiService.initiatePayment(tontineId, paymentMethod);
      
      if (response.success && response.data) {
        console.log('Payment initiated successfully');
        return {
          success: true,
          paymentUrl: response.data.paymentUrl,
          transactionId: response.data.transactionId,
        };
      } else {
        console.error('Payment initiation failed:', response.error);
        return {
          success: false,
          error: response.error || 'Failed to initiate payment',
        };
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed',
      };
    }
  }

  private generateMockPaymentUrl(method: PaymentMethod, transactionId: string, amount: number): string {
    const baseUrls = {
      orange: 'https://payment.orange.ci',
      mtn: 'https://payment.mtn.ci',
      wave: 'https://payment.wave.com',
    };

    return `${baseUrls[method]}/pay?transaction=${transactionId}&amount=${amount}&callback=${encodeURIComponent('tontineapp://payment-callback')}`;
  }

  async processPaymentCallback(url: string): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      console.log('Processing payment callback:', url);
      
      const parsedUrl = Linking.parse(url);
      const transactionId = parsedUrl.queryParams?.transaction as string;
      const status = parsedUrl.queryParams?.status as string;

      if (!transactionId) {
        return { success: false, error: 'Missing transaction ID' };
      }

      if (status === 'success') {
        console.log('Payment callback indicates success');
        return { success: true, transactionId };
      } else {
        console.log('Payment callback indicates failure');
        return { success: false, error: 'Payment was cancelled or failed' };
      }
    } catch (error) {
      console.error('Payment callback processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Callback processing failed',
      };
    }
  }

  async verifyPayment(transactionId: string): Promise<{ success: boolean; payment?: Payment; error?: string }> {
    try {
      console.log('Verifying payment:', transactionId);

      // In development mode, simulate verification
      if (__DEV__) {
        const pendingPayment = this.pendingPayments.get(transactionId);
        
        if (pendingPayment) {
          const mockPayment: Payment = {
            id: transactionId,
            tontineId: pendingPayment.tontineId,
            userId: '1', // Current user ID
            amount: pendingPayment.amount,
            round: 1,
            status: 'completed',
            paymentMethod: 'orange', // Default for mock
            transactionId,
            createdAt: new Date(),
            paidAt: new Date(),
          };

          this.pendingPayments.delete(transactionId);
          console.log('Mock payment verified successfully');
          
          return {
            success: true,
            payment: mockPayment,
          };
        } else {
          return { success: false, error: 'Transaction not found' };
        }
      }

      // In production, verify with API
      const response = await apiService.verifyPayment(transactionId);
      
      if (response.success && response.data) {
        console.log('Payment verified successfully');
        return {
          success: true,
          payment: response.data,
        };
      } else {
        console.error('Payment verification failed:', response.error);
        return {
          success: false,
          error: response.error || 'Payment verification failed',
        };
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Verification failed',
      };
    }
  }

  async openPaymentUrl(paymentUrl: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Opening payment URL:', paymentUrl);
      
      const canOpen = await Linking.canOpenURL(paymentUrl);
      
      if (canOpen) {
        await Linking.openURL(paymentUrl);
        return { success: true };
      } else {
        return { success: false, error: 'Cannot open payment URL' };
      }
    } catch (error) {
      console.error('Error opening payment URL:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to open payment',
      };
    }
  }

  getPaymentProvider(method: PaymentMethod): PaymentProvider | undefined {
    return PAYMENT_PROVIDERS.find(provider => provider.id === method);
  }

  getAllPaymentProviders(): PaymentProvider[] {
    return PAYMENT_PROVIDERS.filter(provider => provider.isAvailable);
  }
}

export const paymentService = new PaymentService();
