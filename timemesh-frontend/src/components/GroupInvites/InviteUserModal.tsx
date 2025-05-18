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
      toast({ title: 'Convite enviado!', description: `Convite enviado com sucesso para ${username}.` });
      setUsername('');
      onClose();
    } catch (error: any) {
      const msg = error?.response?.data?.detail || error?.response?.data?.error || '';
      if (msg.includes('não encontrado') || msg.includes('not found')) {
        toast({
          title: 'Usuário não encontrado',
          description: 'Verifique o nome de usuário e tente novamente.',
          variant: 'destructive',
        });
      } else if (msg.includes('já foi convidado') || msg.includes('already invited')) {
        toast({
          title: 'Usuário já convidado',
          description: 'Este usuário já foi convidado para este grupo.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Erro ao enviar convite',
          description: 'Erro ao enviar convite. Tente novamente.',
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
          <DialogTitle className="text-center">Convidar usuário</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleInvite} className="flex flex-col gap-4 mt-2">
          <Input
            placeholder="Username do usuário"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            disabled={isLoading}
            className="w-full"
          />
          <Button type="submit" isLoading={isLoading} disabled={isLoading} className="w-full">
            {isLoading ? 'Enviando...' : 'Convidar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InviteUserModal; 