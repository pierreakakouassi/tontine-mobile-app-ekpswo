
import { apiService } from './apiService';
import { PaymentForm, Payment } from '../types';

/**
 * Service pour gérer les intégrations Mobile Money
 * Supporte Orange Money, MTN MoMo et Wave
 */
class MobileMoneyService {
  
  // ===== CONFIGURATION DES FOURNISSEURS =====
  
  private readonly providers = {
    ORANGE: {
      name: 'Orange Money',
      color: '#FF6600',
      icon: 'phone-portrait',
      ussdCode: '#144#',
      prefixes: ['07', '08', '09'],
      fees: 0.025, // 2.5%
    },
    MTN: {
      name: 'MTN Mobile Money',
      color: '#FFCC00',
      icon: 'phone-portrait',
      ussdCode: '*133#',
      prefixes: ['05', '06'],
      fees: 0.025, // 2.5%
    },
    WAVE: {
      name: 'Wave',
      color: '#00D4FF',
      icon: 'phone-portrait',
      ussdCode: '*144*4*4#',
      prefixes: ['05', '06', '07', '08', '09'], // Accepte tous
      fees: 0.02, // 2.0%
    },
  };
  
  /**
   * Obtenir les informations d'un fournisseur
   */
  getProviderInfo(provider: 'ORANGE' | 'MTN' | 'WAVE') {
    return this.providers[provider];
  }
  
  /**
   * Obtenir tous les fournisseurs disponibles
   */
  getAvailableProviders() {
    return Object.entries(this.providers).map(([key, value]) => ({
      id: key as 'ORANGE' | 'MTN' | 'WAVE',
      ...value,
    }));
  }
  
  // ===== VALIDATION DES NUMÉROS =====
  
  /**
   * Valider un numéro de téléphone pour un fournisseur spécifique
   */
  validatePhoneNumber(phone: string, provider: 'ORANGE' | 'MTN' | 'WAVE'): {
    isValid: boolean;
    normalized?: string;
    error?: string;
  } {
    try {
      // Nettoyer le numéro
      const cleaned = phone.replace(/[\s\-\(\)]/g, '');
      
      // Vérifier le format de base
      if (!/^(\+225)?[0-9]{8,10}$/.test(cleaned)) {
        return {
          isValid: false,
          error: 'Format de numéro invalide. Utilisez +225XXXXXXXX ou XXXXXXXX',
        };
      }
      
      // Normaliser au format international
      const normalized = cleaned.startsWith('+225') ? cleaned : `+225${cleaned}`;
      
      // Extraire le préfixe (2 premiers chiffres après +225)
      const prefix = normalized.substring(4, 6);
      
      // Vérifier la compatibilité avec le fournisseur
      const providerInfo = this.providers[provider];
      if (!providerInfo.prefixes.includes(prefix)) {
        return {
          isValid: false,
          error: `Ce numéro n'est pas compatible avec ${providerInfo.name}. Préfixes acceptés: ${providerInfo.prefixes.join(', ')}`,
        };
      }
      
      return {
        isValid: true,
        normalized,
      };
    } catch (error) {
      return {
        isValid: false,
        error: 'Erreur de validation du numéro',
      };
    }
  }
  
  /**
   * Détecter automatiquement le fournisseur d'un numéro
   */
  detectProvider(phone: string): 'ORANGE' | 'MTN' | 'WAVE' | null {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    const normalized = cleaned.startsWith('+225') ? cleaned : `+225${cleaned}`;
    
    if (!/^(\+225)?[0-9]{8,10}$/.test(cleaned)) {
      return null;
    }
    
    const prefix = normalized.substring(4, 6);
    
    // Orange: 07, 08, 09
    if (['07', '08', '09'].includes(prefix)) {
      return 'ORANGE';
    }
    
    // MTN: 05, 06
    if (['05', '06'].includes(prefix)) {
      return 'MTN';
    }
    
    return null; // Numéro non reconnu
  }
  
  // ===== GESTION DES PAIEMENTS =====
  
  /**
   * Initier un paiement Mobile Money
   */
  async initiatePayment(data: PaymentForm): Promise<{
    success: boolean;
    paymentUrl?: string;
    txRef?: string;
    ussdCode?: string;
    instructions?: string;
    error?: string;
  }> {
    try {
      console.log('Initiating Mobile Money payment:', data);
      
      // Validation des données
      const validation = this.validatePaymentData(data);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }
      
      // Appel API pour initier le paiement
      const response = await apiService.initiatePayment(data);
      
      if (response.success && response.data) {
        const providerInfo = this.providers[data.provider];
        
        return {
          success: true,
          paymentUrl: response.data.payment_url,
          txRef: response.data.tx_ref,
          ussdCode: providerInfo.ussdCode,
          instructions: this.generatePaymentInstructions(data.provider, data.phone_number),
        };
      } else {
        return {
          success: false,
          error: response.error || 'Échec de l\'initiation du paiement',
        };
      }
    } catch (error) {
      console.error('Error initiating Mobile Money payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }
  
  /**
   * Vérifier le statut d'un paiement
   */
  async verifyPayment(txRef: string): Promise<{
    success: boolean;
    payment?: Payment;
    status?: 'PENDING' | 'SUCCESS' | 'FAILED';
    error?: string;
  }> {
    try {
      console.log('Verifying payment status:', txRef);
      
      const response = await apiService.verifyPayment(txRef);
      
      if (response.success && response.data) {
        return {
          success: true,
          payment: response.data,
          status: response.data.tx_status,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Impossible de vérifier le paiement',
        };
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }
  
  /**
   * Annuler un paiement en cours
   */
  async cancelPayment(txRef: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      console.log('Cancelling payment:', txRef);
      
      const response = await apiService.cancelPayment(txRef);
      
      if (response.success) {
        return { success: true };
      } else {
        return {
          success: false,
          error: response.error || 'Impossible d\'annuler le paiement',
        };
      }
    } catch (error) {
      console.error('Error cancelling payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }
  
  // ===== UTILITAIRES =====
  
  /**
   * Valider les données de paiement
   */
  private validatePaymentData(data: PaymentForm): {
    isValid: boolean;
    error?: string;
  } {
    // Vérifier les champs obligatoires
    if (!data.circle_id || !data.provider || !data.phone_number) {
      return {
        isValid: false,
        error: 'Données de paiement incomplètes',
      };
    }
    
    // Vérifier le fournisseur
    if (!['ORANGE', 'MTN', 'WAVE'].includes(data.provider)) {
      return {
        isValid: false,
        error: 'Fournisseur de paiement non supporté',
      };
    }
    
    // Valider le numéro de téléphone
    const phoneValidation = this.validatePhoneNumber(data.phone_number, data.provider);
    if (!phoneValidation.isValid) {
      return {
        isValid: false,
        error: phoneValidation.error,
      };
    }
    
    return { isValid: true };
  }
  
  /**
   * Générer les instructions de paiement pour l'utilisateur
   */
  private generatePaymentInstructions(provider: 'ORANGE' | 'MTN' | 'WAVE', phoneNumber: string): string {
    const providerInfo = this.providers[provider];
    
    switch (provider) {
      case 'ORANGE':
        return `Instructions Orange Money:
1. Composez ${providerInfo.ussdCode} sur votre téléphone ${phoneNumber}
2. Sélectionnez "Paiement marchand"
3. Suivez les instructions à l'écran
4. Confirmez avec votre code PIN Orange Money

Ou utilisez l'application Orange Money pour scanner le QR code.`;
        
      case 'MTN':
        return `Instructions MTN Mobile Money:
1. Composez ${providerInfo.ussdCode} sur votre téléphone ${phoneNumber}
2. Sélectionnez "Paiements"
3. Choisissez "Paiement marchand"
4. Suivez les instructions à l'écran
5. Confirmez avec votre code PIN MTN MoMo

Ou utilisez l'application MTN MoMo.`;
        
      case 'WAVE':
        return `Instructions Wave:
1. Ouvrez l'application Wave sur votre téléphone
2. Scannez le QR code affiché
3. Vérifiez le montant et le destinataire
4. Confirmez avec votre code PIN Wave

Ou composez ${providerInfo.ussdCode} pour le menu USSD.`;
        
      default:
        return 'Suivez les instructions de votre fournisseur de paiement.';
    }
  }
  
  /**
   * Calculer les frais de transaction
   */
  calculateFees(amount: number, provider: 'ORANGE' | 'MTN' | 'WAVE'): {
    feeAmount: number;
    feePercentage: number;
    totalAmount: number;
  } {
    const providerInfo = this.providers[provider];
    const feeAmount = Math.round(amount * providerInfo.fees);
    
    return {
      feeAmount,
      feePercentage: providerInfo.fees * 100,
      totalAmount: amount + feeAmount,
    };
  }
  
  /**
   * Formater un numéro de téléphone pour l'affichage
   */
  formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    const normalized = cleaned.startsWith('+225') ? cleaned : `+225${cleaned}`;
    
    if (normalized.length === 12) {
      // Format: +225 XX XX XX XX XX
      return `${normalized.substring(0, 4)} ${normalized.substring(4, 6)} ${normalized.substring(6, 8)} ${normalized.substring(8, 10)} ${normalized.substring(10, 12)}`;
    }
    
    return phone; // Retourner tel quel si format non reconnu
  }
  
  /**
   * Obtenir le statut de disponibilité d'un fournisseur
   */
  async getProviderStatus(provider: 'ORANGE' | 'MTN' | 'WAVE'): Promise<{
    available: boolean;
    message?: string;
  }> {
    try {
      // En production, ceci ferait un appel API pour vérifier la disponibilité
      // Pour le moment, on simule que tous les fournisseurs sont disponibles
      
      const response = await apiService.getAvailablePaymentMethods();
      
      if (response.success && response.data) {
        const providerData = response.data.find(p => p.provider === provider);
        
        if (providerData) {
          return {
            available: providerData.enabled,
            message: providerData.enabled ? 'Service disponible' : 'Service temporairement indisponible',
          };
        }
      }
      
      // Fallback: considérer comme disponible
      return {
        available: true,
        message: 'Service disponible',
      };
    } catch (error) {
      console.error('Error checking provider status:', error);
      return {
        available: false,
        message: 'Impossible de vérifier la disponibilité du service',
      };
    }
  }
  
  /**
   * Obtenir l'historique des paiements d'un utilisateur
   */
  async getPaymentHistory(circleId?: string): Promise<{
    success: boolean;
    payments?: Payment[];
    error?: string;
  }> {
    try {
      console.log('Getting payment history for circle:', circleId);
      
      const response = circleId 
        ? await apiService.getCirclePayments(circleId)
        : await apiService.getUserPayments();
      
      if (response.success && response.data) {
        return {
          success: true,
          payments: response.data,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Impossible de récupérer l\'historique',
        };
      }
    } catch (error) {
      console.error('Error getting payment history:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }
  
  /**
   * Générer un rapport de paiement pour un cercle
   */
  async generatePaymentReport(circleId: string): Promise<{
    success: boolean;
    report?: {
      totalPaid: number;
      totalPending: number;
      totalFailed: number;
      paymentsByProvider: Record<string, number>;
      memberPaymentStatus: Array<{
        memberId: string;
        memberName: string;
        totalPaid: number;
        missedPayments: number;
        reliabilityScore: number;
      }>;
    };
    error?: string;
  }> {
    try {
      console.log('Generating payment report for circle:', circleId);
      
      const [paymentsResponse, circleResponse] = await Promise.all([
        apiService.getCirclePayments(circleId),
        apiService.getCircleById(circleId),
      ]);
      
      if (!paymentsResponse.success || !circleResponse.success) {
        return {
          success: false,
          error: 'Impossible de récupérer les données du cercle',
        };
      }
      
      const payments = paymentsResponse.data || [];
      const circle = circleResponse.data;
      
      // Calculer les statistiques
      const totalPaid = payments
        .filter(p => p.tx_status === 'SUCCESS')
        .reduce((sum, p) => sum + p.amount, 0);
      
      const totalPending = payments
        .filter(p => p.tx_status === 'PENDING')
        .reduce((sum, p) => sum + p.amount, 0);
      
      const totalFailed = payments
        .filter(p => p.tx_status === 'FAILED')
        .reduce((sum, p) => sum + p.amount, 0);
      
      // Paiements par fournisseur
      const paymentsByProvider = payments.reduce((acc, payment) => {
        acc[payment.provider] = (acc[payment.provider] || 0) + payment.amount;
        return acc;
      }, {} as Record<string, number>);
      
      // Statut des membres (simulation - en production, ceci viendrait de l'API)
      const memberPaymentStatus = circle?.members?.map(member => ({
        memberId: member.user_id,
        memberName: member.user.name,
        totalPaid: payments
          .filter(p => p.member_id === member.user_id && p.tx_status === 'SUCCESS')
          .reduce((sum, p) => sum + p.amount, 0),
        missedPayments: payments
          .filter(p => p.member_id === member.user_id && p.tx_status === 'FAILED')
          .length,
        reliabilityScore: member.user.reliability_score,
      })) || [];
      
      return {
        success: true,
        report: {
          totalPaid,
          totalPending,
          totalFailed,
          paymentsByProvider,
          memberPaymentStatus,
        },
      };
    } catch (error) {
      console.error('Error generating payment report:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }
}

export const mobileMoneyService = new MobileMoneyService();
