import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGoalStore } from '../store/goalStore';
import { useAuthStore } from '../store/authStore';
import { NumberRoulette } from '../components/NumberRoulette';
import { NumberTable } from '../components/NumberTable';
import { NumberDrawer } from '../components/NumberDrawer';
import { DepositGrid } from '../components/DepositGrid';
import { Loader2 } from 'lucide-react';

const DepositNumbers: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { 
    goals, 
    availableNumbers, 
    requestDepositNumbers, 
    markNumberAsUsed,
    uploadProof,
    fetchGoals
  } = useGoalStore();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extrair ID da URL
  const extractedId = window.location.pathname.split('/').pop();
  const goalId = id || extractedId;

  console.log('Parâmetros da URL:', { 
    id, 
    extractedId,
    goalId,
    goals, 
    goal: goals.find(g => g.id === goalId),
    windowLocation: window.location.href,
    availableNumbers: availableNumbers[goalId]
  });

  const goal = goals.find(g => g.id === goalId);
  const numbers = goalId ? availableNumbers[goalId] || [] : [];

  console.log('Números disponíveis:', {
    goalId,
    numbers,
    availableNumbersState: availableNumbers
  });

  useEffect(() => {
    const fetchNumbers = async () => {
      try {
        setIsLoading(true);
        
        // Se não tiver metas, buscar primeiro
        if (goals.length === 0) {
          console.log('Buscando metas antes de solicitar números');
          await fetchGoals();
        }

        console.log('Dados para solicitar números', { 
          goalId, 
          goals, 
          goal: goals.find(g => g.id === goalId) 
        });

        if (goalId) {
          await requestDepositNumbers(goalId, 10);
        }
      } catch (err) {
        setError('Erro ao buscar números de depósito');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNumbers();
  }, [goalId, goals.length]);

  const handleNumberDrawn = async (number: number) => {
    try {
      if (goalId) {
        await markNumberAsUsed(goalId, number);
      }
    } catch (err) {
      console.error('Erro ao marcar número como usado', err);
    }
  };

  if (!goal || !user) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-400">Meta não encontrada</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-dark-card rounded-xl p-6 border border-gray-800/50">
        <h1 className="text-2xl font-light text-white mb-4">{goal.title}</h1>
        <p className="text-gray-400">
          Sorteie e copie um número de depósito para contribuir com sua meta.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <NumberRoulette 
          maxNumber={goal.total_deposit_slots} 
          onNumberDrawn={handleNumberDrawn} 
        />
        
        <div className="space-y-4">
          <NumberTable 
            numbers={numbers} 
            onCopyNumber={(number) => {
              if (goalId) {
                markNumberAsUsed(goalId, number);
              }
            }} 
          />

          <DepositGrid 
            totalDeposits={goal.total_deposit_slots} 
            completedNumbers={goal.completed_deposit_numbers || []} 
          />
        </div>
      </div>
    </div>
  );
};

export default DepositNumbers;
