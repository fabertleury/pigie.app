import React, { useEffect, lazy, Suspense } from 'react';
import { useGoalStore } from '../store/goalStore';

// Importação dinâmica dos ícones
const CheckIcon = lazy(() => import('lucide-react').then(mod => ({ default: mod.Check })));
const XIcon = lazy(() => import('lucide-react').then(mod => ({ default: mod.X })));

export function InvitationsList() {
  const { 
    invitations, 
    fetchInvitations, 
    acceptInvitation, 
    rejectInvitation 
  } = useGoalStore();

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      await acceptInvitation(invitationId);
    } catch (error) {
      console.error('Erro ao aceitar convite:', error);
    }
  };

  const handleRejectInvitation = async (invitationId: string) => {
    try {
      await rejectInvitation(invitationId);
    } catch (error) {
      console.error('Erro ao rejeitar convite:', error);
    }
  };

  if (invitations.length === 0) {
    return (
      <div className="text-center text-gray-400 py-4">
        Você não tem convites pendentes
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white mb-4">Convites Pendentes</h2>
      {invitations.map((invitation) => (
        <div 
          key={invitation.id} 
          className="bg-dark-card p-4 rounded-lg flex justify-between items-center"
        >
          <div>
            <p className="text-white">Convite para meta</p>
            <p className="text-sm text-gray-400">
              Convidado por: {invitation.invited_by}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleAcceptInvitation(invitation.id)}
              className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full"
              title="Aceitar Convite"
            >
              <Suspense fallback={<div>✓</div>}>
                <CheckIcon size={20} />
              </Suspense>
            </button>
            <button
              onClick={() => handleRejectInvitation(invitation.id)}
              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full"
              title="Rejeitar Convite"
            >
              <Suspense fallback={<div>✗</div>}>
                <XIcon size={20} />
              </Suspense>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
