import React, { useMemo } from 'react';
import { Trophy, Users, ArrowUp } from 'lucide-react';
import { formatCurrency } from '../utils/depositCalculator';
import type { PaymentProof, User } from '../types';

interface GroupRankingProps {
  proofs: PaymentProof[];
  participants: User[];
  targetAmount: number;
}

export function GroupRanking({ proofs, participants, targetAmount }: GroupRankingProps) {
  const rankings = useMemo(() => {
    const userTotals = proofs.reduce((acc, proof) => {
      if (!proof.verified) return acc;
      acc[proof.user_id] = (acc[proof.user_id] || 0) + proof.deposit_number;
      return acc;
    }, {} as Record<string, number>);

    return participants
      .map(user => ({
        user,
        total: userTotals[user.id] || 0,
        percentage: ((userTotals[user.id] || 0) / targetAmount) * 100
      }))
      .sort((a, b) => b.total - a.total);
  }, [proofs, participants, targetAmount]);

  const totalDeposited = useMemo(() => 
    proofs.reduce((sum, proof) => proof.verified ? sum + proof.deposit_number : sum, 0),
    [proofs]
  );

  const remaining = targetAmount - totalDeposited;
  const splitPerPerson = remaining / participants.length;

  return (
    <div className="space-y-6">
      <div className="bg-dark-card p-6 rounded-xl border border-gray-800/50">
        <div className="flex items-center space-x-2 mb-4">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-medium text-white">Ranking de Depósitos</h3>
        </div>

        <div className="space-y-3">
          {rankings.map(({ user, total, percentage }, index) => (
            <div key={user.id} className="relative">
              <div className="absolute left-0 top-0 bottom-0 bg-primary/10 rounded-lg"
                   style={{ width: `${percentage}%` }} />
              <div className="relative flex items-center justify-between p-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center
                    ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                      index === 1 ? 'bg-gray-400/20 text-gray-400' :
                      index === 2 ? 'bg-amber-600/20 text-amber-600' :
                      'bg-gray-700/20 text-gray-700'}`}>
                    {index + 1}
                  </div>
                  <span className="text-white">{user.email}</span>
                </div>
                <div className="text-primary font-medium">
                  {formatCurrency(total)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-dark-card p-6 rounded-xl border border-gray-800/50">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium text-white">Divisão do Valor Restante</h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-dark/50 p-3 rounded-lg">
              <div className="text-sm text-gray-400">Total Depositado</div>
              <div className="text-lg text-white">{formatCurrency(totalDeposited)}</div>
            </div>
            <div className="bg-dark/50 p-3 rounded-lg">
              <div className="text-sm text-gray-400">Valor Restante</div>
              <div className="text-lg text-white">{formatCurrency(remaining)}</div>
            </div>
          </div>

          <div className="bg-primary/10 p-4 rounded-lg">
            <div className="flex items-center space-x-2 text-primary mb-2">
              <ArrowUp className="h-4 w-4" />
              <span className="text-sm font-medium">Cada participante precisa depositar</span>
            </div>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(splitPerPerson)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}