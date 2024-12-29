import React from 'react';
import { Bell, Mail } from 'lucide-react';
import { useGoalStore } from '../store/goalStore';
import { Button } from './ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { ScrollArea } from './ui/scroll-area';

export const InvitationNotification: React.FC = () => {
  const { invitations, acceptInvitation, rejectInvitation } = useGoalStore();

  // Filtrar apenas convites pendentes
  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');

  if (pendingInvitations.length === 0) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {pendingInvitations.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-xs">
              {pendingInvitations.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none flex items-center">
              <Mail className="mr-2 h-5 w-5" /> Convites Pendentes
            </h4>
            <p className="text-sm text-muted-foreground">
              Você tem {pendingInvitations.length} convite{pendingInvitations.length !== 1 ? 's' : ''} para metas
            </p>
          </div>
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {pendingInvitations.map((invitation) => (
                <div 
                  key={invitation.id} 
                  className="flex items-center justify-between p-2 border rounded-md"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {invitation.goals?.title || 'Meta sem título'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Convidado por {invitation.invited_by}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => acceptInvitation(invitation.id)}
                    >
                      Aceitar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => rejectInvitation(invitation.id)}
                    >
                      Rejeitar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
};
