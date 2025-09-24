
import { apiService } from './apiService';
import { 
  Circle, 
  CircleMember, 
  User, 
  Cycle, 
  Payment, 
  Payout, 
  Penalty, 
  Invite, 
  Event,
  CreateCircleForm,
  PaymentForm 
} from '../types';

/**
 * Service pour gérer les opérations liées au modèle de données
 * Implémente la logique métier selon l'architecture MVP spécifiée
 */
class DataModelService {
  
  // ===== GESTION DES CERCLES (TONTINES) =====
  
  /**
   * Créer un nouveau cercle de tontine
   */
  async createCircle(data: CreateCircleForm): Promise<{ success: boolean; circle?: Circle; error?: string }> {
    try {
      console.log('Creating new circle:', data);
      
      // Validation des données
      if (!data.name || data.name.trim().length < 3) {
        return { success: false, error: 'Le nom du cercle doit contenir au moins 3 caractères' };
      }
      
      if (data.amount_per_round <= 0) {
        return { success: false, error: 'Le montant par tour doit être supérieur à 0' };
      }
      
      if (!['weekly', 'monthly'].includes(data.frequency)) {
        return { success: false, error: 'La fréquence doit être hebdomadaire ou mensuelle' };
      }
      
      // Appel API
      const response = await apiService.createCircle(data);
      
      if (response.success && response.data) {
        console.log('Circle created successfully:', response.data.id);
        return { success: true, circle: response.data };
      } else {
        return { success: false, error: response.error || 'Échec de la création du cercle' };
      }
    } catch (error) {
      console.error('Error creating circle:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  }
  
  /**
   * Rejoindre un cercle existant via code d'invitation
   */
  async joinCircle(circleId: string, inviteCode: string): Promise<{ success: boolean; member?: CircleMember; error?: string }> {
    try {
      console.log('Joining circle:', circleId, 'with code:', inviteCode);
      
      if (!inviteCode || inviteCode.trim().length < 4) {
        return { success: false, error: 'Code d\'invitation invalide' };
      }
      
      const response = await apiService.joinCircle(circleId, inviteCode);
      
      if (response.success && response.data) {
        console.log('Successfully joined circle');
        return { success: true, member: response.data };
      } else {
        return { success: false, error: response.error || 'Impossible de rejoindre le cercle' };
      }
    } catch (error) {
      console.error('Error joining circle:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  }
  
  /**
   * Obtenir les détails d'un cercle avec ses membres
   */
  async getCircleDetails(circleId: string): Promise<{ success: boolean; circle?: Circle & { members: (CircleMember & { user: User })[] }; error?: string }> {
    try {
      console.log('Getting circle details:', circleId);
      
      const response = await apiService.getCircleById(circleId);
      
      if (response.success && response.data) {
        return { success: true, circle: response.data };
      } else {
        return { success: false, error: response.error || 'Cercle non trouvé' };
      }
    } catch (error) {
      console.error('Error getting circle details:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  }
  
  // ===== GESTION DES INVITATIONS =====
  
  /**
   * Créer une invitation pour un cercle
   */
  async createInvitation(circleId: string, channel: 'LINK' | 'WHATSAPP' | 'SMS'): Promise<{ success: boolean; invite?: Invite; error?: string }> {
    try {
      console.log('Creating invitation for circle:', circleId, 'via', channel);
      
      const response = await apiService.createInvite(circleId, channel);
      
      if (response.success && response.data) {
        console.log('Invitation created:', response.data.code);
        return { success: true, invite: response.data };
      } else {
        return { success: false, error: response.error || 'Échec de la création de l\'invitation' };
      }
    } catch (error) {
      console.error('Error creating invitation:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  }
  
  /**
   * Envoyer des invitations WhatsApp
   */
  async sendWhatsAppInvitations(circleId: string, phoneNumbers: string[]): Promise<{ success: boolean; sentCount?: number; error?: string }> {
    try {
      console.log('Sending WhatsApp invitations to:', phoneNumbers.length, 'contacts');
      
      // Validation des numéros de téléphone
      const validNumbers = phoneNumbers.filter(phone => {
        const cleaned = phone.replace(/[\s\-\(\)]/g, '');
        return /^(\+225)?[0-9]{8,10}$/.test(cleaned);
      });
      
      if (validNumbers.length === 0) {
        return { success: false, error: 'Aucun numéro de téléphone valide' };
      }
      
      const response = await apiService.sendWhatsAppInvite(circleId, validNumbers);
      
      if (response.success && response.data) {
        console.log('WhatsApp invitations sent:', response.data.invites_sent);
        return { success: true, sentCount: response.data.invites_sent };
      } else {
        return { success: false, error: response.error || 'Échec de l\'envoi des invitations' };
      }
    } catch (error) {
      console.error('Error sending WhatsApp invitations:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  }
  
  // ===== GESTION DES PAIEMENTS =====
  
  /**
   * Initier un paiement Mobile Money
   */
  async initiatePayment(data: PaymentForm): Promise<{ success: boolean; paymentUrl?: string; txRef?: string; error?: string }> {
    try {
      console.log('Initiating payment:', data);
      
      // Validation des données de paiement
      if (!data.circle_id || !data.provider || !data.phone_number) {
        return { success: false, error: 'Données de paiement incomplètes' };
      }
      
      if (!['ORANGE', 'MTN', 'WAVE'].includes(data.provider)) {
        return { success: false, error: 'Fournisseur de paiement non supporté' };
      }
      
      // Validation du numéro de téléphone selon le fournisseur
      const phoneValidation = this.validatePhoneForProvider(data.phone_number, data.provider);
      if (!phoneValidation.isValid) {
        return { success: false, error: phoneValidation.error };
      }
      
      const response = await apiService.initiatePayment(data);
      
      if (response.success && response.data) {
        console.log('Payment initiated:', response.data.tx_ref);
        return { 
          success: true, 
          paymentUrl: response.data.payment_url,
          txRef: response.data.tx_ref 
        };
      } else {
        return { success: false, error: response.error || 'Échec de l\'initiation du paiement' };
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  }
  
  /**
   * Vérifier le statut d'un paiement
   */
  async verifyPayment(txRef: string): Promise<{ success: boolean; payment?: Payment; error?: string }> {
    try {
      console.log('Verifying payment:', txRef);
      
      const response = await apiService.verifyPayment(txRef);
      
      if (response.success && response.data) {
        console.log('Payment verified:', response.data.tx_status);
        return { success: true, payment: response.data };
      } else {
        return { success: false, error: response.error || 'Impossible de vérifier le paiement' };
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  }
  
  /**
   * Enregistrer un paiement en espèces (pour les admins)
   */
  async recordCashPayment(circleId: string, cycleId: string, memberId: string, amount: number): Promise<{ success: boolean; payment?: Payment; error?: string }> {
    try {
      console.log('Recording cash payment:', { circleId, cycleId, memberId, amount });
      
      if (amount <= 0) {
        return { success: false, error: 'Le montant doit être supérieur à 0' };
      }
      
      const response = await apiService.recordCashPayment(circleId, cycleId, memberId, amount);
      
      if (response.success && response.data) {
        console.log('Cash payment recorded');
        return { success: true, payment: response.data };
      } else {
        return { success: false, error: response.error || 'Échec de l\'enregistrement du paiement' };
      }
    } catch (error) {
      console.error('Error recording cash payment:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  }
  
  // ===== GESTION DES CYCLES =====
  
  /**
   * Obtenir le cycle actuel d'un cercle
   */
  async getCurrentCycle(circleId: string): Promise<{ success: boolean; cycle?: Cycle; error?: string }> {
    try {
      console.log('Getting current cycle for circle:', circleId);
      
      const response = await apiService.getCurrentCycle(circleId);
      
      if (response.success && response.data) {
        return { success: true, cycle: response.data };
      } else {
        return { success: false, error: response.error || 'Aucun cycle actuel trouvé' };
      }
    } catch (error) {
      console.error('Error getting current cycle:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  }
  
  /**
   * Démarrer le cycle suivant (pour les admins)
   */
  async startNextCycle(circleId: string): Promise<{ success: boolean; cycle?: Cycle; error?: string }> {
    try {
      console.log('Starting next cycle for circle:', circleId);
      
      const response = await apiService.startNextCycle(circleId);
      
      if (response.success && response.data) {
        console.log('Next cycle started:', response.data.index);
        return { success: true, cycle: response.data };
      } else {
        return { success: false, error: response.error || 'Impossible de démarrer le cycle suivant' };
      }
    } catch (error) {
      console.error('Error starting next cycle:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  }
  
  // ===== GESTION DES DÉCAISSEMENTS =====
  
  /**
   * Initier un décaissement pour le bénéficiaire du cycle
   */
  async initiatePayout(circleId: string, cycleId: string, provider: 'ORANGE' | 'MTN' | 'WAVE'): Promise<{ success: boolean; payout?: Payout; error?: string }> {
    try {
      console.log('Initiating payout:', { circleId, cycleId, provider });
      
      const response = await apiService.initiatePayout(circleId, cycleId, provider);
      
      if (response.success && response.data) {
        console.log('Payout initiated:', response.data.tx_ref);
        return { success: true, payout: response.data };
      } else {
        return { success: false, error: response.error || 'Échec de l\'initiation du décaissement' };
      }
    } catch (error) {
      console.error('Error initiating payout:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  }
  
  // ===== UTILITAIRES =====
  
  /**
   * Valider un numéro de téléphone selon le fournisseur
   */
  private validatePhoneForProvider(phone: string, provider: 'ORANGE' | 'MTN' | 'WAVE'): { isValid: boolean; error?: string } {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    
    // Patterns spécifiques aux opérateurs en Côte d'Ivoire
    const patterns = {
      ORANGE: /^(\+225)?(07|08|09)[0-9]{7}$/,
      MTN: /^(\+225)?(05|06)[0-9]{7}$/,
      WAVE: /^(\+225)?[0-9]{8,10}$/, // Wave accepte tous les opérateurs
    };
    
    const pattern = patterns[provider];
    if (!pattern.test(cleaned)) {
      const operatorNames = {
        ORANGE: 'Orange (07, 08, 09)',
        MTN: 'MTN (05, 06)',
        WAVE: 'Wave (tous opérateurs)',
      };
      
      return {
        isValid: false,
        error: `Numéro invalide pour ${operatorNames[provider]}. Format attendu: +225XXXXXXXX`
      };
    }
    
    return { isValid: true };
  }
  
  /**
   * Calculer le score de fiabilité d'un utilisateur
   */
  async calculateReliabilityScore(userId: string): Promise<number> {
    try {
      const response = await apiService.getUserAnalytics();
      
      if (response.success && response.data) {
        const { payment_history } = response.data;
        const total = payment_history.on_time + payment_history.late + payment_history.missed;
        
        if (total === 0) return 100; // Nouvel utilisateur
        
        // Formule de calcul du score
        const onTimeWeight = 1.0;
        const lateWeight = 0.5;
        const missedWeight = 0.0;
        
        const score = (
          (payment_history.on_time * onTimeWeight) +
          (payment_history.late * lateWeight) +
          (payment_history.missed * missedWeight)
        ) / total * 100;
        
        return Math.round(Math.max(0, Math.min(100, score)));
      }
      
      return 100; // Score par défaut
    } catch (error) {
      console.error('Error calculating reliability score:', error);
      return 100;
    }
  }
  
  /**
   * Formater un montant en devise locale
   */
  formatCurrency(amount: number, currency: string = 'XOF'): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  }
  
  /**
   * Calculer les frais de transaction selon le fournisseur
   */
  calculateTransactionFees(amount: number, provider: 'ORANGE' | 'MTN' | 'WAVE'): number {
    // Frais approximatifs en pourcentage (à ajuster selon les accords réels)
    const feeRates = {
      ORANGE: 0.025, // 2.5%
      MTN: 0.025,    // 2.5%
      WAVE: 0.02,    // 2.0%
    };
    
    const rate = feeRates[provider] || 0.025;
    return Math.round(amount * rate);
  }
  
  /**
   * Générer un code d'invitation unique
   */
  generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

export const dataModelService = new DataModelService();
