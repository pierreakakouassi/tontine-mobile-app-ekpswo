
export interface User {
  id: string;
  phoneNumber: string;
  name: string;
  profileImage?: string;
  reliabilityScore: number;
  createdAt: Date;
}

export interface Tontine {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  contributionAmount: number;
  frequency: 'weekly' | 'monthly';
  drawOrder: 'manual' | 'random';
  members: TontineMember[];
  currentRound: number;
  totalRounds: number;
  status: 'active' | 'completed' | 'paused';
  createdBy: string;
  createdAt: Date;
  nextPaymentDate: Date;
  currentBeneficiary?: string;
}

export interface TontineMember {
  userId: string;
  user: User;
  joinedAt: Date;
  position: number;
  hasReceived: boolean;
  receivedAt?: Date;
  totalContributions: number;
  missedPayments: number;
  status: 'active' | 'inactive';
}

export interface Payment {
  id: string;
  tontineId: string;
  userId: string;
  amount: number;
  round: number;
  status: 'pending' | 'completed' | 'failed' | 'overdue';
  paymentMethod: 'orange' | 'mtn' | 'wave';
  transactionId?: string;
  createdAt: Date;
  paidAt?: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'payment_reminder' | 'payment_overdue' | 'payout_received' | 'round_complete';
  title: string;
  message: string;
  tontineId?: string;
  isRead: boolean;
  createdAt: Date;
}

export type PaymentMethod = 'orange' | 'mtn' | 'wave';

export interface CreateTontineData {
  name: string;
  description?: string;
  memberCount: number;
  contributionAmount: number;
  frequency: 'weekly' | 'monthly';
  drawOrder: 'manual' | 'random';
}
