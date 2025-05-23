import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { groupsService } from '../../services/groups';
import { useToast } from '../../hooks/useToast';
import { useInvites } from '../../hooks/useInvites';

interface InviteUserModalProps {
  open: boolean;
  onClose: () => void;
  groupId: number;
}

const InviteUserModal: React.FC<InviteUserModalProps> = ({ open, onClose, groupId }) => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { refreshInvites } = useInvites();

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await groupsService.inviteUser(groupId, username);
      toast({ title: 'Invite sent!', description: `Successfully invited ${username}.` });
      setUsername('');
      onClose();
      // Trigger a refresh of invites
      refreshInvites();
    } catch (error: any) {
      const msg = error?.response?.data?.detail || error?.response?.data?.error || '';
      if (msg.includes('not found')) {
        toast({
          title: 'User not found',
          description: 'Please check the username and try again.',
          variant: 'destructive',
        });
      } else if (msg.includes('already invited')) {
        toast({
          title: 'User already invited',
          description: 'This user has already been invited to this group.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error sending invite',
          description: 'Failed to send invite. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">Invite User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleInvite} className="flex flex-col gap-4 mt-2">
          <Input
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            disabled={isLoading}
            className="w-full"
          />
          <Button type="submit" isLoading={isLoading} disabled={isLoading} className="w-full">
            {isLoading ? 'Sending...' : 'Invite'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InviteUserModal; 