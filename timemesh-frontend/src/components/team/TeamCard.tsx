import React from 'react';
import { Users, MoreVertical } from 'lucide-react';
import { Button } from '../ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/DropdownMenu';
import { Group } from '../../services/groups';
import { useAuth } from '../../hooks/useAuth';

interface TeamCardProps {
  team: Group;
  onDelete: (teamId: number) => void;
}

export const TeamCard = ({ team, onDelete }: TeamCardProps) => {
  const { user } = useAuth();
  const isOwner = user && Number(user.id) === team.owner_id;

  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{team.name}</h3>
            <p className="text-sm text-muted-foreground">{team.description || 'Sem descrição'}</p>
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

      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">
            {team.members.length} membros
          </span>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
            Criado em {new Date(team.created_at).toLocaleDateString('pt-BR')}
          </span>
        </div>
      </div>
    </div>
  );
}; 