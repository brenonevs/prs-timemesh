import React from 'react';
import { Users, MoreVertical, UserPlus } from 'lucide-react';
import { Button } from '../ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/DropdownMenu';
import { Group } from '../../services/groups';
import { useAuth } from '../../hooks/useAuth';
import InviteUserModal from '../GroupInvites/InviteUserModal';
import { Tooltip } from '../ui/Tooltip';

interface TeamCardProps {
  team: Group;
  onDelete: (teamId: number) => void;
}

export const TeamCard = ({ team, onDelete }: TeamCardProps) => {
  const { user } = useAuth();
  const isOwner = user && Number(user.id) === team.owner_id;
  const [isInviteOpen, setIsInviteOpen] = React.useState(false);

  return (
    <div className="bg-card border border-border rounded-xl p-6 flex flex-col justify-between h-full min-h-[220px] transition-shadow hover:shadow-xl hover:border-primary/40">
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center shadow-md">
              <Users className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground mb-1">{team.name}</h3>
              <p className="text-sm text-muted-foreground mb-1">{team.description || 'Sem descrição'}</p>
            </div>
          </div>
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-5 h-5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(team.id)}
                >
                  Excluir Time
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <div className="mt-6 flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Users className="w-4 h-4 text-primary" />
            <span className="font-medium">{team.members.length} membro{team.members.length !== 1 ? 's' : ''}</span>
          </span>
          <div style={{ minWidth: 40, minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isOwner ? (
              <Tooltip content="Convidar usuário para o grupo">
                <Button
                  onClick={() => setIsInviteOpen(true)}
                  variant="ghost"
                  size="icon"
                  className="ml-1"
                >
                  <UserPlus className="w-5 h-5" />
                </Button>
              </Tooltip>
            ) : (
              <span style={{ display: 'inline-block', width: 40, height: 40 }} />
            )}
            <InviteUserModal
              open={isInviteOpen}
              onClose={() => setIsInviteOpen(false)}
              groupId={team.id}
            />
          </div>
        </div>
        <div className="border-t border-border/60 my-2 mx-0" />
      </div>
      <div className="flex items-center justify-center gap-2 px-2">
        <span className="px-3 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full">
          Criado em {new Date(team.created_at).toLocaleDateString('pt-BR')}
        </span>
      </div>
    </div>
  );
}; 