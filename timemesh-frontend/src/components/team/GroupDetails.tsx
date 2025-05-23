import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog';
import { Group, GroupMember, groupsService } from '../../services/groups';
import { formatDistanceToNow } from 'date-fns';
import { Users, Calendar, UserPlus } from 'lucide-react';
import { Button } from '../ui/Button';
import InviteUserModal from '../GroupInvites/InviteUserModal';
import { useAuth } from '../../hooks/useAuth';

interface GroupDetailsProps {
  group: Group;
  open: boolean;
  onClose: () => void;
}

export const GroupDetails: React.FC<GroupDetailsProps> = ({ group, open, onClose }) => {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const { user } = useAuth();

  const isOwner = user?.id === group.owner_id;

  useEffect(() => {
    if (open) {
      fetchMembers();
    }
  }, [open, group.id]);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const data = await groupsService.getGroupMembers(group.id);
      setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{group.name}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-6">
            {/* Informações do Grupo */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Criado {formatDistanceToNow(new Date(group.created_at), { addSuffix: true })}</span>
              </div>
              
              {group.description && (
                <p className="text-muted-foreground">{group.description}</p>
              )}
            </div>

            {/* Lista de Membros */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <h3 className="font-semibold">Membros ({members.length})</h3>
                </div>
                {isOwner && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowInviteModal(true)}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Convidar
                  </Button>
                )}
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-2">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/20"
                    >
                      <div>
                        <p className="font-medium">{member.user}</p>
                        <p className="text-sm text-muted-foreground">
                          Convidado por {member.invited_by}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(member.accepted_at || member.invited_at), { addSuffix: true })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <InviteUserModal
        open={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        groupId={group.id}
      />
    </>
  );
}; 