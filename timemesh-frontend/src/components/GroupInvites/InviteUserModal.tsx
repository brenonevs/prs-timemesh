import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { groupsService } from '../../services/groups';
import { useToast } from '../../hooks/useToast';

interface InviteUserModalProps {
  open: boolean;
  onClose: () => void;
  groupId: number;
}

const InviteUserModal: React.FC<InviteUserModalProps> = ({ open, onClose, groupId }) => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await groupsService.inviteUser(groupId, username);
      toast({ title: 'Convite enviado!', description: `Convite enviado para ${username}` });
      setUsername('');
      onClose();
    } catch (error) {
      toast({ title: 'Erro ao convidar', description: 'Usuário não encontrado ou já convidado.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convidar usuário</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleInvite} className="space-y-4">
          <Input
            placeholder="Username do usuário"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <Button type="submit" isLoading={isLoading}>Convidar</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InviteUserModal; 