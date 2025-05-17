import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Plus } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { groupsService } from '../../services/groups';

interface CreateTeamFormProps {
  onTeamCreated: () => void;
}

export const CreateTeamForm = ({ onTeamCreated }: CreateTeamFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await groupsService.createGroup({ name, description: '' });
      toast({
        title: 'Time criado com sucesso!',
        description: 'O time foi criado e você já é membro dele.',
      });
      setIsOpen(false);
      setName('');
      onTeamCreated();
    } catch (error) {
      toast({
        title: 'Erro ao criar time',
        description: 'Ocorreu um erro ao criar o time. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="primary" className="md:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Criar Novo Time
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Novo Time</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Time</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome do time"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? 'Criando...' : 'Criar Time'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 