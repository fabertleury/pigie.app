import React from 'react';
import { Mail } from 'lucide-react';
import type { GoalInvitation } from '../types';

interface InvitationCardProps {
  invitation: GoalInvitation;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

export function InvitationCard({ invitation, onAccept, onReject }: InvitationCardProps) {
  return (
    <div className="bg-dark-card p-4 rounded-md border border-gray-800/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4 text-primary" />
          <span className="text-sm text-gray-400">{invitation.invited_email}</span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onAccept(invitation.id)}
            className="px-3 py-1 text-xs bg-primary/10 text-primary rounded-md hover:bg-primary/20"
          >
            Aceitar
          </button>
          <button
            onClick={() => onReject(invitation.id)}
            className="px-3 py-1 text-xs bg-red-500/10 text-red-400 rounded-md hover:bg-red-500/20"
          >
            Recusar
          </button>
        </div>
      </div>
    </div>
  );
}