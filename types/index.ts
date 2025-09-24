
export interface User {
  id: string;
  phone: string;
  name: string;
  avatar_url?: string;
  reliability_score: number;
  lang: string;
  created_at: string;
}

export interface OTP {
  id: string;
  phone: string;
  code_hash: string;
  expires_at: string;
  used: boolean;
}

export interface Circle {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  currency: string; // Default 'XOF'
  amount_per_round: number;
  frequency: 'weekly' | 'monthly';
  status: 'active' | 'completed' | 'paused';
  created_at: string;
}

export interface CircleMember {
  id: string;
  circle_id: string;
  user_id: string;
  role: 'ADMIN' | 'MEMBER';
  order_index: number;
  joined_at: string;
}

export interface Cycle {
  id: string;
  circle_id: string;
  index: number;
  start_date: string;
  end_date: string;
  beneficiary_member_id: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
}

export interface Payment {
  id: string;
  circle_id: string;
  cycle_id: string;
  member_id: string;
  amount: number;
  fee_amount: number;
  provider: 'ORANGE' | 'MTN' | 'WAVE' | 'CASH';
  tx_ref?: string;
  tx_status: 'PENDING' | 'SUCCESS' | 'FAILED';
  paid_at?: string;
}

export interface Payout {
  id: string;
  circle_id: string;
  cycle_id: string;
  beneficiary_member_id: string;
  amount: number;
  provider: 'ORANGE' | 'MTN' | 'WAVE' | 'CASH';
  tx_ref?: string;
  tx_status: 'PENDING' | 'SUCCESS' | 'FAILED';
  paid_at?: string;
}

export interface Penalty {
  id: string;
  payment_id: string;
  circle_id: string;
  member_id: string;
  amount: number;
  reason: string;
  created_at: string;
}

export interface Invite {
  id: string;
  circle_id: string;
  inviter_id: string;
  code: string;
  status: 'pending' | 'accepted' | 'expired';
  channel: 'LINK' | 'WHATSAPP' | 'SMS';
  created_at: string;
}

export interface Event {
  id: string;
  circle_id: string;
  actor_id: string;
  type: string;
  payload: any; // JSONB equivalent
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'payment_reminder' | 'payment_overdue' | 'payout_received' | 'round_complete' | 'member_joined' | 'cycle_started';
  title: string;
  message: string;
  circle_id?: string;
  is_read: boolean;
  created_at: string;
}

// Legacy types for backward compatibility
export interface Tontine extends Circle {
  memberCount: number;
  contributionAmount: number;
  drawOrder: 'manual' | 'random';
  members: TontineMember[];
  currentRound: number;
  totalRounds: number;
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

export type PaymentMethod = 'orange' | 'mtn' | 'wave';

export interface CreateTontineData {
  name: string;
  description?: string;
  memberCount: number;
  contributionAmount: number;
  frequency: 'weekly' | 'monthly';
  drawOrder: 'manual' | 'random';
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form data types
export interface CreateCircleForm {
  name: string;
  description?: string;
  amount_per_round: number;
  frequency: 'weekly' | 'monthly';
  currency: string;
}

export interface JoinCircleForm {
  invite_code: string;
}

export interface PaymentForm {
  circle_id: string;
  provider: 'ORANGE' | 'MTN' | 'WAVE';
  phone_number: string;
}
