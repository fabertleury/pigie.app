import React, { useState, lazy, Suspense } from 'react';
import type { SavingsGoal } from '../types';
import { useGoalStore } from '../store/goalStore';

// Importação dinâmica do ícone
const MailIcon = lazy(() => import('lucide-react').then(mod => ({ default: mod.Mail })));

interface InviteModalProps {
  goal: SavingsGoal;
  onClose: () => void;
}

export function InviteModal({ goal, onClose }: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { inviteToGoal } = useGoalStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await inviteToGoal(goal.id, email);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar convite');
      console.error('Erro ao convidar:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-dark-card p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-light text-white mb-4">Convidar para Meta</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div className="relative">
            <Suspense fallback={<div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500">...</div>}>
              <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            </Suspense>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-dark pl-10 pr-4 py-2 rounded border border-gray-800 text-white"
              placeholder="Email do participante"
              required
            />
          </div>
          <div className="flex space-x-2 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Enviando...' : 'Enviar Convite'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}