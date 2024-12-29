import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { SavingsGoal, GoalInvitation, PaymentProof } from '../types';
import { useEffect } from 'react';
import { useAuthStore } from './authStore';

const generateUniqueId = () => {
  return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
};

interface GoalStore {
  goals: SavingsGoal[];
  invitations: GoalInvitation[];
  proofs: Record<string, PaymentProof[]>;
  availableNumbers: Record<string, number[]>;
  participants: Record<string, any[]>;
  user: any;
  fetchGoals: () => Promise<void>;
  createGoal: (goal: Omit<SavingsGoal, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'participants'>) => Promise<SavingsGoal>;
  updateGoal: (goalId: string, updates: Partial<SavingsGoal>) => Promise<SavingsGoal | null>;
  deleteGoal: (goalId: string) => Promise<boolean>;
  fetchInvitations: () => Promise<void>;
  createInvitation: (goalId: string, email: string) => Promise<GoalInvitation>;
  fetchProofs: (goalId: string) => Promise<PaymentProof[]>;
  uploadProof: (goalId: string, file: File) => Promise<PaymentProof>;
  verifyProof: (proofId: string, verified: boolean) => Promise<void>;
  requestDepositNumbers: (goalId: string, quantity?: number) => Promise<number[]>;
  markNumberAsUsed: (goalId: string, number: number) => Promise<void>;
  fetchParticipants: (goalId: string) => Promise<any[]>;
  updateUser: (user: any) => void;
  set: (newState: Partial<GoalStore>) => void;
}

export const useGoalStore = create<GoalStore>()(
  persist(
    (set, get) => ({
      goals: [],
      invitations: [],
      proofs: {},
      availableNumbers: {},
      participants: {},
      user: null,

      set: (newState) => {
        console.log('Chamando set no goalStore:', { newState });
        set(newState);
      },

      createGoal: async (goal) => {
        try {
          const state = get();
          if (!state.user) {
            throw new Error('Usuário não autenticado');
          }

          console.log('DADOS RECEBIDOS PARA CRIAR META', {
            goal,
            user: {
              id: state.user.id,
              cpf: state.user.cpf,
              document_number: state.user.document_number,
              pix_key: state.user.pix_key,
              email: state.user.email
            }
          });

          // Limpar chave PIX de entrada
          const cleanPixKey = goal.pixKey?.replace(/\D/g, '');
          
          // Obter CPF do usuário, removendo caracteres não numéricos
          const userCpf = state.user.document_number?.replace(/\D/g, '');
          const userPixKey = state.user.pix_key?.replace(/\D/g, '');
          const userEmail = state.user.email;

          console.log('VERIFICAÇÃO DE CHAVE PIX', {
            inputPixKey: cleanPixKey,
            userCpf,
            userPixKey,
            userEmail,
            userDocumentNumber: state.user.document_number
          });

          // Definir chave PIX com prioridade
          let finalPixKey = cleanPixKey || userCpf || userPixKey;

          console.log('CHAVE PIX FINAL', {
            finalPixKey,
            length: finalPixKey?.length,
            source: finalPixKey === cleanPixKey ? 'input' 
                   : finalPixKey === userCpf ? 'userCpf' 
                   : finalPixKey === userPixKey ? 'userPixKey' 
                   : 'undefined'
          });

          // Se ainda não tiver chave PIX, usar ID do usuário
          if (!finalPixKey) {
            finalPixKey = state.user.id;
          }

          // Calcular target_amount
          const targetAmount = goal.maxNumber > 0 
            ? goal.maxNumber * 200 
            : 50000; // Valor padrão se maxNumber for inválido

          // Adicionar campos padrão
          const newGoal = {
            title: goal.title,
            created_by: state.user.id,
            created_at: goal.startDate || new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: 'active',
            is_group: goal.isGroup === true, // Garantir que seja booleano
            participants: [state.user.id],
            total_deposits: 0,
            total_deposit_slots: goal.maxNumber,
            target_amount: targetAmount,
            pix_key: finalPixKey // Adicionar chave PIX
          };

          console.log('META A SER CRIADA', newGoal);

          // Verificar colunas disponíveis
          const { data: tableInfo, error: tableError } = await supabase
            .from('savings_goals')
            .select('*')
            .limit(1);

          if (tableError) {
            console.error('Erro ao buscar informações da tabela:', tableError);
          } else if (tableInfo && tableInfo.length > 0) {
            console.log('Colunas disponíveis:', Object.keys(tableInfo[0]));
          }

          const { data, error } = await supabase
            .from('savings_goals')
            .insert(newGoal)
            .select()
            .single();

          if (error) {
            console.error('Erro ao criar meta:', {
              errorCode: error.code,
              errorMessage: error.message,
              errorDetails: error.details,
              fullError: JSON.stringify(error, null, 2)
            });
            throw error;
          }

          // Atualizar estado local imediatamente
          set(state => ({
            goals: [...state.goals, data]
          }));

          return data;
        } catch (error) {
          console.error('Erro ao criar meta:', error);
          throw error;
        }
      },

      fetchGoals: async () => {
        try {
          const state = get();
          if (!state.user) {
            throw new Error('Usuário não autenticado');
          }

          console.log('Buscando metas do usuário', { 
            userId: state.user.id,
            currentGoals: state.goals
          });

          const { data, error } = await supabase
            .from('savings_goals')
            .select('*')
            .or(`created_by.eq.${state.user.id},participants.cs.{${state.user.id}}`);

          if (error) {
            console.error('Erro ao buscar metas:', {
              code: error.code,
              message: error.message,
              details: error.details
            });
            throw error;
          }

          console.log('Metas encontradas:', { 
            count: data.length, 
            goals: data 
          });

          set(state => ({
            goals: data
          }));

          return data;
        } catch (error) {
          console.error('Erro ao buscar metas:', error);
          throw error;
        }
      },

      updateGoal: async (goalId, updates) => {
        try {
          const state = get();
          if (!state.user) {
            throw new Error('Usuário não autenticado');
          }

          const { data, error } = await supabase
            .from('savings_goals')
            .update(updates)
            .eq('id', goalId)
            .select()
            .single();

          if (error) throw error;

          set(state => ({
            goals: state.goals.map(goal => 
              goal.id === goalId ? { ...goal, ...updates } : goal
            )
          }));

          return data;
        } catch (error) {
          console.error('Erro ao atualizar meta:', error);
          return null;
        }
      },

      deleteGoal: async (goalId: string) => {
        const state = get();
        const user = state.user;
        
        console.log('Estado completo:', state);
        console.log('Usuário atual:', user);
        
        if (!user) {
          console.error('Usuário não autenticado');
          throw new Error('Usuário não autenticado');
        }

        // Buscar detalhes da meta
        const { data: goal, error: goalError } = await supabase
          .from('savings_goals')
          .select('created_by, total_deposits')
          .eq('id', goalId)
          .single();

        if (goalError) {
          console.error('Erro ao buscar meta:', goalError);
          throw goalError;
        }

        // Verificar se tem depósitos
        if (goal.total_deposits > 0) {
          console.error('Meta com depósitos não pode ser excluída');
          throw new Error('Não é possível excluir metas com depósitos');
        }

        // Verificar se o usuário é o criador da meta
        if (goal.created_by !== user.id) {
          console.error('Usuário não é o criador da meta');
          throw new Error('Apenas o criador pode excluir a meta');
        }

        // Deletar a meta
        const { error } = await supabase
          .from('savings_goals')
          .delete()
          .eq('id', goalId);

        if (error) {
          console.error('Erro ao deletar meta:', error);
          throw error;
        }

        // Atualizar estado local
        set(state => ({
          goals: state.goals.filter(g => g.id !== goalId)
        }));

        return true;
      },

      fetchInvitations: async () => {
        try {
          const state = get();
          if (!state.user) {
            console.warn('Usuário não autenticado ao buscar convites');
            return;
          }

          const { data: invitations, error } = await supabase
            .from('goal_invitations')
            .select('*')
            .eq('invited_email', state.user.email);

          if (error) {
            console.error('Erro ao buscar convites:', error);
            return;
          }

          set({ invitations: invitations || [] });
        } catch (error) {
          console.error('Erro inesperado ao buscar convites:', error);
        }
      },

      createInvitation: async (goalId: string, email: string) => {
        try {
          const state = get();
          if (!state.user) {
            throw new Error('Usuário não autenticado');
          }

          const { data, error } = await supabase
            .from('goal_invitations')
            .insert({ 
              goal_id: goalId, 
              invited_by: state.user.id, 
              invited_email: email 
            })
            .select()
            .single();

          if (error) throw error;

          return data;
        } catch (error) {
          console.error('Erro ao criar convite:', error);
          throw error;
        }
      },

      fetchProofs: async (goalId: string) => {
        try {
          const state = get();
          if (!state.user) {
            console.warn('Usuário não autenticado ao buscar comprovantes');
            return;
          }

          const { data, error } = await supabase
            .from('payment_proofs')
            .select('*')
            .eq('goal_id', goalId)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Erro ao buscar comprovantes:', error);
            return;
          }

          // Atualizar estado de provas para este goal específico
          set(state => ({
            proofs: {
              ...state.proofs,
              [goalId]: data || []
            }
          }));

          return data || [];
        } catch (error) {
          console.error('Erro inesperado ao buscar comprovantes:', error);
          return [];
        }
      },

      uploadProof: async (goalId: string, file: File) => {
        try {
          const state = get();
          if (!state.user) {
            throw new Error('Usuário não autenticado');
          }

          // Gerar nome único para o arquivo
          const fileExt = file.name.split('.').pop();
          const fileName = `${state.user.id}_${Date.now()}.${fileExt}`;
          const filePath = `proofs/${goalId}/${fileName}`;

          // Upload do arquivo
          const { error: uploadError } = await supabase.storage
            .from('goal_proofs')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          // Obter URL pública
          const { data: { publicUrl }, error: urlError } = supabase.storage
            .from('goal_proofs')
            .getPublicUrl(filePath);

          if (urlError) throw urlError;

          // Solicitar número de depósito
          const { data: depositNumbers, error: depositError } = await supabase.rpc(
            'request_deposit_numbers', 
            { p_goal_id: goalId, p_user_id: state.user.id, p_quantity: 1 }
          );

          if (depositError) throw depositError;

          // Salvar informações do comprovante
          const { data: proof, error } = await supabase
            .from('payment_proofs')
            .insert({
              goal_id: goalId,
              user_id: state.user.id,
              file_url: publicUrl,
              verified: false,
              deposit_number: depositNumbers[0]
            })
            .select()
            .single();

          if (error) throw error;

          // Atualizar estado local
          set(state => ({
            proofs: {
              ...state.proofs,
              [goalId]: [proof, ...(state.proofs[goalId] || [])]
            }
          }));

          return proof;
        } catch (error) {
          console.error('Erro ao enviar comprovante:', error);
          throw error;
        }
      },

      verifyProof: async (proofId: string, verified: boolean) => {
        try {
          const state = get();
          if (!state.user) {
            throw new Error('Usuário não autenticado');
          }

          // Buscar goal_id do comprovante
          const { data: proof, error: proofError } = await supabase
            .from('payment_proofs')
            .select('goal_id')
            .eq('id', proofId)
            .single();

          if (proofError) throw proofError;

          // Atualizar comprovante
          const { error } = await supabase
            .from('payment_proofs')
            .update({ 
              verified, 
              verified_by: state.user.id,
              verified_at: new Date().toISOString() 
            })
            .eq('id', proofId);

          if (error) throw error;

          // Atualizar estado local
          set(state => {
            const updatedProofs = { ...state.proofs };
            if (updatedProofs[proof.goal_id]) {
              updatedProofs[proof.goal_id] = updatedProofs[proof.goal_id].map(p => 
                p.id === proofId ? { ...p, verified } : p
              );
            }
            return { proofs: updatedProofs };
          });
        } catch (error) {
          console.error('Erro ao verificar comprovante:', error);
          throw error;
        }
      },

      requestDepositNumbers: async (goalId: string, quantity?: number) => {
        try {
          console.log('Solicitando números de depósito', { 
            goalId, 
            quantity,
            goals: get().goals,
            availableNumbers: get().availableNumbers
          });

          const state = get();
          if (!state.user) {
            throw new Error('Usuário não autenticado');
          }

          // Verificar se a meta existe
          const goal = state.goals.find(g => g.id === goalId);
          if (!goal) {
            console.warn('Meta não encontrada', { goalId, goals: state.goals });
            throw new Error('Meta não encontrada');
          }

          // Buscar números de depósito já usados
          const { data: usedNumbers, error: usedNumbersError } = await supabase
            .from('payment_proofs')
            .select('deposit_number')
            .eq('goal_id', goalId)
            .not('deposit_number', 'is', null);

          if (usedNumbersError) {
            console.error('Erro ao buscar números usados:', usedNumbersError);
          }

          const { data, error } = await supabase.rpc(
            'request_deposit_numbers', 
            { 
              p_goal_id: goalId, 
              p_quantity: quantity || goal.total_deposit_slots || 10,
              p_user_id: state.user.id 
            }
          );

          if (error) {
            console.error('Erro ao solicitar números de depósito:', {
              code: error.code,
              message: error.message,
              details: error.details,
              hint: error.hint
            });
            throw error;
          }

          console.log('Números de depósito recebidos:', {
            data,
            usedNumbers: usedNumbers?.map(n => n.deposit_number)
          });

          // Atualizar números disponíveis no estado local
          set(state => ({
            availableNumbers: {
              ...state.availableNumbers,
              [goalId]: data
            }
          }));

          return data;
        } catch (error) {
          console.error('Erro ao solicitar números de depósito:', error);
          throw error;
        }
      },

      markNumberAsUsed: async (goalId: string, number: number) => {
        try {
          const state = get();
          if (!state.user) {
            throw new Error('Usuário não autenticado');
          }

          const { error } = await supabase.rpc(
            'mark_number_as_used', 
            { p_goal_id: goalId, p_user_id: state.user.id, p_number: number }
          );

          if (error) throw error;

          set(state => {
            const updatedNumbers = { ...state.availableNumbers };
            if (updatedNumbers[goalId]) {
              updatedNumbers[goalId] = updatedNumbers[goalId].filter(n => n !== number);
            }
            return { availableNumbers: updatedNumbers };
          });
        } catch (error) {
          console.error('Erro ao marcar número como usado:', error);
          throw error;
        }
      },

      fetchParticipants: async (goalId: string) => {
        try {
          const state = get();
          if (!state.user) {
            console.warn('Usuário não autenticado ao buscar participantes');
            return;
          }

          const { data, error } = await supabase
            .from('savings_goals')
            .select('participants')
            .eq('id', goalId)
            .single();

          if (error) {
            console.error('Erro ao buscar participantes:', error);
            return;
          }

          set(state => ({
            participants: {
              ...state.participants,
              [goalId]: data.participants
            }
          }));

          return data.participants;
        } catch (error) {
          console.error('Erro inesperado ao buscar participantes:', error);
          return [];
        }
      },

      updateUser: (user: any) => {
        console.log('Atualizando usuário no goalStore:', { user });
        set({ user });

        // Se usuário estiver logado, buscar dados
        if (user) {
          set((state) => ({
            ...state,
            fetchGoals: async () => {
              try {
                const { data: goals, error } = await supabase
                  .from('savings_goals')
                  .select('*')
                  .or(`created_by.eq.${user.id},participants.cs.{${user.id}}`);

                if (error) {
                  console.error('Erro ao buscar metas:', error);
                  return;
                }

                set({ goals: goals || [] });
              } catch (error) {
                console.error('Erro inesperado ao buscar metas:', error);
              }
            }
          }));
        }
      },

      set: (newState: Partial<GoalStore>) => set(newState)
    }),
    {
      name: 'goal-storage',
      partialize: (state) => ({
        goals: state.goals,
        invitations: state.invitations,
        proofs: state.proofs,
        availableNumbers: state.availableNumbers,
        participants: state.participants,
        user: state.user
      }),
      version: 2
    }
  )
);

// Hook para inicializar dados do usuário
export function useInitializeGoalData() {
  const { user: authUser } = useAuthStore();
  const goalStore = useGoalStore();

  useEffect(() => {
    // Sincronizar usuário apenas uma vez quando o aplicativo carrega
    if (authUser && !goalStore.user) {
      goalStore.updateUser(authUser);
    }

    // Configurar listener de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Mudança de estado de autenticação:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        goalStore.updateUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        goalStore.updateUser(null);
      }
    });

    // Limpar listener quando o componente desmontar
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [authUser, goalStore]);
}