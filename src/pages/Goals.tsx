import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { useGoalStore } from '../store/goalStore';
import { GoalCard } from '../components/GoalCard';
import { NewGoalModal } from '../components/NewGoalModal';
import { InvitationsList } from '../components/InvitationsList';
import { PlusCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Goals: React.FC = () => {
  const { user } = useAuthStore();
  const { goals, invitations, fetchGoals, fetchInvitations, createGoal, acceptInvitation, rejectInvitation } = useGoalStore();
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGoals();
    fetchInvitations();
  }, []);

  const personalGoals = useMemo(() => 
    goals.filter(goal => !goal.is_group), 
    [goals]
  );

  const groupGoals = useMemo(() => 
    goals.filter(goal => goal.is_group), 
    [goals]
  );

  const handleCreateGoal = async ({ 
    title, 
    amount, 
    isGroup,
    pixKey,
    startDate 
  }: { 
    title: string; 
    amount: number; 
    isGroup: boolean;
    pixKey: string;
    startDate: string;
  }) => {
    if (!user) return;
    
    console.log('Criando meta com:', {
      title, 
      amount, 
      isGroup,
      startDate,
      userId: user.id
    });

    console.log('Chave PIX:', pixKey); // Adicionar log para chave PIX

    console.warn('DETALHES DA CRIAÇÃO DE META', {
      isGroupType: typeof isGroup,
      isGroupValue: isGroup,
      isGroupStrict: isGroup === true
    });

    await createGoal({
      title,
      target_amount: amount,
      created_by: user.id,
      is_group: isGroup === true, // Forçar booleano estrito
      pix_key: pixKey,
      start_date: startDate,
      maxNumber: amount / 200 // Calcular maxNumber baseado no amount
    });
  };

  return (
    <div className="space-y-8 p-4">
      {/* Cabeçalho e botão de nova meta */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-light">Minhas Metas</h1>
        <Button 
          onClick={() => navigate('/goals/new')}
          className="flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Nova Meta</span>
        </Button>
      </div>

      {/* Metas Pessoais */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium">Metas Pessoais</h2>
          <span className="text-sm text-gray-400">
            {personalGoals.length} meta{personalGoals.length !== 1 && 's'}
          </span>
        </div>
        {personalGoals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {personalGoals.map(goal => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        ) : (
          <div className="bg-dark-card rounded-lg p-6 text-center">
            <p className="text-gray-400">Você ainda não tem metas pessoais</p>
          </div>
        )}
      </section>

      {/* Metas em Grupo */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium">Metas em Grupo</h2>
          <span className="text-sm text-gray-400">
            {groupGoals.length} meta{groupGoals.length !== 1 && 's'}
          </span>
        </div>
        {groupGoals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupGoals.map(goal => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        ) : (
          <div className="bg-dark-card rounded-lg p-6 text-center">
            <p className="text-gray-400">Você ainda não tem metas em grupo</p>
          </div>
        )}
      </section>

      {/* Lista de Convites */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium">Convites</h2>
          <span className="text-sm text-gray-400">
            {invitations.length} convite{invitations.length !== 1 && 's'}
          </span>
        </div>
        <InvitationsList />
      </section>

      {/* Modal de Nova Meta */}
      {showNewGoalModal && (
        <NewGoalModal 
          onClose={() => setShowNewGoalModal(false)}
          onSubmit={async (data) => {
            await handleCreateGoal({
              title: data.title,
              amount: data.maxNumber * 200, // Valor correto
              isGroup: data.isGroup,
              pixKey: data.pixKey,
              startDate: data.startDate
            });
            setShowNewGoalModal(false);
          }}
          user={user!}
        />
      )}
    </div>
  );
};

export default Goals;