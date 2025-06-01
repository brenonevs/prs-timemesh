import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/Dialog';
import { Group, GroupMember, groupsService } from '../../services/groups';
import { formatDistanceToNow } from 'date-fns';
import { Users, Calendar, UserPlus } from 'lucide-react';
import { Button } from '../ui/Button';
import InviteUserModal from '../GroupInvites/InviteUserModal';
import { useAuth } from '../../hooks/useAuth';
import { GroupCommonAvailability } from './GroupCommonAvailability';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';

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

  const isOwner = user?.id !== undefined && Number(user.id) === group.owner_id;

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
        <DialogContent className="max-w-2xl" aria-describedby="group-details-description">
          <DialogHeader>
            <DialogTitle>{group.name}</DialogTitle>
            <DialogDescription id="group-details-description">
              View and manage team members and common availability
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="members" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="availability">Common Availability</TabsTrigger>
            </TabsList>

            <TabsContent value="members" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {members.length} members
                    </span>
                  </div>

                  {isOwner && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowInviteModal(true)}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite Member
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
                            Invited by {member.invited_by}
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
            </TabsContent>

            <TabsContent value="availability" className="mt-4">
              <GroupCommonAvailability groupId={group.id} />
            </TabsContent>
          </Tabs>
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