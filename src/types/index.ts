// Adicionar ao arquivo existente
export type GoalStatus = 'active' | 'completed' | 'paused';
export type InvitationStatus = 'pending' | 'accepted' | 'rejected';

export interface SavingsGoal {
  id: string;
  title: string;
  target_amount: number;
  total_deposits: number;
  total_deposit_slots: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  status: GoalStatus;
  is_group: boolean;
  participants: string[];
  pix_key?: string;
  maxNumber?: number; // Para compatibilidade com formulário
  isGroup?: boolean;  // Para compatibilidade com formulário
  pixKey?: string;    // Para compatibilidade com formulário
}

export interface GoalInvitation {
  id: string;
  goal_id: string;
  invited_by: string;
  invited_email: string;
  status: InvitationStatus;
  created_at: string;
  savings_goals?: Pick<SavingsGoal, 'title'>;
}

export interface PaymentProof {
  id: string;
  goal_id: string;
  user_id: string;
  file_url: string;
  verified: boolean;
  verified_by?: string;
  verified_at?: string;
  deposit_number?: number;
  created_at: string;
}

export interface GoalParticipant {
  user_id: string;
  goal_id: string;
  total_deposited: number;
  joined_at: string;
}