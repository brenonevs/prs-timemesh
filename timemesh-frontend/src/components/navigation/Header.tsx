import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Menu, Bell, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { groupsService } from '../../services/groups';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '../ui/DropdownMenu';
import { Button } from '../ui/Button';
import InvitesDropdown from '../GroupInvites/InvitesDropdown';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [pendingInvites, setPendingInvites] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    async function fetchInvites() {
      setIsLoading(true);
      try {
        const data = await groupsService.getPendingInvites();
        setPendingInvites(data);
      } catch (e) {
        setPendingInvites([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchInvites();
  }, []);

  const handleAcceptInvite = async (invite: any) => {
    setIsLoading(true);
    try {
      await groupsService.acceptInvite(invite);
      setPendingInvites((current) => current.filter(i => i.id !== invite.id));
    } catch (error) {
      // Trate o erro conforme necessário
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectInvite = async (inviteId: string) => {
    setIsLoading(true);
    try {
      await groupsService.rejectInvite(inviteId);
      setPendingInvites((current) => current.filter(invite => invite.id !== inviteId));
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <header className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-card/80 backdrop-blur-md border-b border-border shadow-sm">
      <div className="flex-1 flex items-center justify-between px-4">
        <div className="lg:hidden">
          <button
            type="button"
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/20 focus:outline-none"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 lg:ml-4" />
        
        <div className="flex items-center gap-2">
          <InvitesDropdown
            invites={pendingInvites}
            onAccept={handleAcceptInvite}
            onReject={handleRejectInvite}
            isLoading={isLoading}
          />
          <button
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/20 focus:outline-none transition-colors"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
          <div className="ml-2 flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};