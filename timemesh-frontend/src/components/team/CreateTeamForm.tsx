import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Plus } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { groupsService } from '../../services/groups';
import { useModalRegistration } from '../../context/ModalContext';

interface CreateTeamFormProps {
  onTeamCreated: () => void;
}

export const CreateTeamForm = ({ onTeamCreated }: CreateTeamFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Register with modal context
  useModalRegistration(isOpen, 'create-team-modal');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await groupsService.createGroup({ name });
      toast({
        title: 'Team created!',
        description: 'Your new team has been created successfully.',
      });
      onTeamCreated();
      setName('');
      setIsOpen(false);
    } catch (error) {
      toast({
        title: 'Error creating team',
        description: 'Failed to create team. Please try again.',
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
          Create New Team
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby="create-team-description">
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
          <DialogDescription id="create-team-description">
            Create a new team and start collaborating with others. You can invite members after creating the team.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Team Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter team name"
              required
              aria-label="Team name"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Team'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 