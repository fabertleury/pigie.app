import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Edit, Users, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SavingsGoal } from '../types';
import { useGoalStore } from '../store/goalStore';
import { useToast } from './ui/toaster';
import { formatCurrency } from '../utils/formatters';

interface GoalCardProps {
  goal: SavingsGoal;
  onEdit?: () => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onEdit }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { deleteGoal } = useGoalStore();
  const { showToast } = useToast();

  const handleDeleteGoal = async () => {
    try {
      await deleteGoal(goal.id);
      showToast({
        message: 'Meta excluída com sucesso!',
        type: 'success'
      });
    } catch (error) {
      showToast({
        message: `Erro ao deletar meta: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        type: 'error'
      });
    } finally {
      setConfirmDelete(false);
    }
  };

  const progressPercentage = goal.total_deposits 
    ? Math.min((goal.total_deposits / goal.target_amount) * 100, 100) 
    : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-dark-card rounded-xl p-6 border border-gray-800/50 space-y-4 relative"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">{goal.title}</h2>
        <div className="flex space-x-2">
          {onEdit && (
            <button 
              onClick={onEdit}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Edit className="h-5 w-5" />
            </button>
          )}
          <button 
            onClick={() => setConfirmDelete(true)}
            className="text-red-500 hover:text-red-400 transition-colors"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-400">
          <span>Progresso</span>
          <span>{formatCurrency(goal.total_deposits)} / {formatCurrency(goal.target_amount)}</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-400">
            {goal.participants?.length || 0} participantes
          </span>
        </div>
        
        {progressPercentage === 100 && (
          <div className="flex items-center space-x-2 text-green-500">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm">Meta concluída</span>
          </div>
        )}
      </div>

      <Link
        to={`/goals/${goal.id}`}
        className="w-full flex items-center justify-center space-x-2 py-2 text-sm text-primary hover:text-primary-dark transition-colors"
      >
        <span>Ver detalhes</span>
        <ArrowRight className="h-4 w-4" />
      </Link>

      <AnimatePresence>
        {confirmDelete && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 bg-dark-card rounded-xl flex flex-col justify-center items-center z-10"
          >
            <p className="text-white mb-4">Tem certeza que deseja excluir esta meta?</p>
            <div className="flex space-x-4">
              <button 
                onClick={handleDeleteGoal}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Confirmar
              </button>
              <button 
                onClick={() => setConfirmDelete(false)}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};