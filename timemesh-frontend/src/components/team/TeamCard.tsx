import React, { useState } from 'react';
import { Users, MoreVertical, UserPlus, Info } from 'lucide-react';
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
import { GroupDetails } from './GroupDetails';

interface TeamCardProps {
  team: Group;
  onDelete: (teamId: number) => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({ team, onDelete }) => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { user } = useAuth();
  const isOwner = user && Number(user.id) === team.owner_id;

  return (
    <>
      <div className="bg-card rounded-lg border border-border p-4 hover:border-primary/50 transition-colors">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">{team.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {team.members.length} membros
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip content="Ver detalhes">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDetails(true)}
              >
                <Info className="w-4 h-4" />
              </Button>
            </Tooltip>

            {isOwner && (
              <>
                <Tooltip content="Convidar usuário">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowInviteModal(true)}
                  >
                    <UserPlus className="w-4 h-4" />
                  </Button>
                </Tooltip>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => onDelete(team.id)}
                    >
                      Deletar time
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </div>

      <InviteUserModal
        open={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        groupId={team.id}
      />

      <GroupDetails
        group={team}
        open={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </>
  );
}; 