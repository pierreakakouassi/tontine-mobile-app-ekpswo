
import { User, Tontine, TontineMember, Payment, Notification } from '../types';

// Mock current user
export const currentUser: User = {
  id: '1',
  phoneNumber: '+225 07 12 34 56 78',
  name: 'Kouassi Jean',
  reliabilityScore: 95,
  createdAt: new Date('2024-01-15'),
};

// Mock users
export const mockUsers: User[] = [
  currentUser,
  {
    id: '2',
    phoneNumber: '+225 05 98 76 54 32',
    name: 'Aya Marie',
    reliabilityScore: 88,
    createdAt: new Date('2024-01-10'),
  },
  {
    id: '3',
    phoneNumber: '+225 01 23 45 67 89',
    name: 'Koffi Paul',
    reliabilityScore: 92,
    createdAt: new Date('2024-01-20'),
  },
  {
    id: '4',
    phoneNumber: '+225 07 11 22 33 44',
    name: 'Adjoua Grace',
    reliabilityScore: 85,
    createdAt: new Date('2024-02-01'),
  },
  {
    id: '5',
    phoneNumber: '+225 05 55 66 77 88',
    name: 'Yao Michel',
    reliabilityScore: 90,
    createdAt: new Date('2024-01-25'),
  },
];

// Mock tontine members
const createTontineMembers = (userIds: string[]): TontineMember[] => {
  return userIds.map((userId, index) => ({
    userId,
    user: mockUsers.find(u => u.id === userId)!,
    joinedAt: new Date('2024-02-01'),
    position: index + 1,
    hasReceived: index < 2, // First 2 members have already received
    receivedAt: index < 2 ? new Date(2024, 1, index * 7 + 1) : undefined,
    totalContributions: index < 2 ? 50000 : 40000, // Those who received have paid more
    missedPayments: index === 3 ? 1 : 0, // One member has missed a payment
    status: 'active',
  }));
};

// Mock tontines
export const mockTontines: Tontine[] = [
  {
    id: '1',
    name: 'Cercle des Amis',
    description: 'Tontine entre amis pour épargner ensemble',
    memberCount: 5,
    contributionAmount: 10000,
    frequency: 'weekly',
    drawOrder: 'manual',
    members: createTontineMembers(['1', '2', '3', '4', '5']),
    currentRound: 3,
    totalRounds: 5,
    status: 'active',
    createdBy: '1',
    createdAt: new Date('2024-02-01'),
    nextPaymentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // In 2 days
    currentBeneficiary: '3',
  },
  {
    id: '2',
    name: 'Tontine Bureau',
    description: 'Épargne collective des collègues',
    memberCount: 4,
    contributionAmount: 15000,
    frequency: 'monthly',
    drawOrder: 'random',
    members: createTontineMembers(['1', '2', '3', '4']),
    currentRound: 1,
    totalRounds: 4,
    status: 'active',
    createdBy: '2',
    createdAt: new Date('2024-03-01'),
    nextPaymentDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // In 5 days
    currentBeneficiary: '2',
  },
];

// Mock payments
export const mockPayments: Payment[] = [
  {
    id: '1',
    tontineId: '1',
    userId: '1',
    amount: 10000,
    round: 3,
    status: 'completed',
    paymentMethod: 'orange',
    transactionId: 'TXN123456',
    createdAt: new Date('2024-03-15'),
    paidAt: new Date('2024-03-15'),
  },
  {
    id: '2',
    tontineId: '1',
    userId: '2',
    amount: 10000,
    round: 3,
    status: 'completed',
    paymentMethod: 'mtn',
    transactionId: 'TXN123457',
    createdAt: new Date('2024-03-15'),
    paidAt: new Date('2024-03-15'),
  },
  {
    id: '3',
    tontineId: '1',
    userId: '4',
    amount: 10000,
    round: 3,
    status: 'overdue',
    paymentMethod: 'wave',
    createdAt: new Date('2024-03-15'),
  },
];

// Mock notifications
export const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '1',
    type: 'payment_reminder',
    title: 'Rappel de paiement',
    message: 'Votre cotisation pour "Cercle des Amis" est due dans 2 jours',
    tontineId: '1',
    isRead: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
  },
  {
    id: '2',
    userId: '1',
    type: 'payout_received',
    title: 'Paiement reçu',
    message: 'Aya Marie a reçu 50,000 FCFA de "Cercle des Amis"',
    tontineId: '1',
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
];

// Helper functions
export const getTontineById = (id: string): Tontine | undefined => {
  return mockTontines.find(t => t.id === id);
};

export const getUserTontines = (userId: string): Tontine[] => {
  return mockTontines.filter(t => 
    t.members.some(m => m.userId === userId)
  );
};

export const getTontinePayments = (tontineId: string): Payment[] => {
  return mockPayments.filter(p => p.tontineId === tontineId);
};

export const getUserNotifications = (userId: string): Notification[] => {
  return mockNotifications.filter(n => n.userId === userId);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(amount).replace('XOF', 'FCFA');
};

export const getPaymentStatusColor = (status: Payment['status']): string => {
  switch (status) {
    case 'completed':
      return '#4CAF50';
    case 'pending':
      return '#FF9800';
    case 'overdue':
      return '#F44336';
    case 'failed':
      return '#F44336';
    default:
      return '#757575';
  }
};

export const getPaymentStatusText = (status: Payment['status']): string => {
  switch (status) {
    case 'completed':
      return 'Payé';
    case 'pending':
      return 'En attente';
    case 'overdue':
      return 'En retard';
    case 'failed':
      return 'Échec';
    default:
      return 'Inconnu';
  }
};
