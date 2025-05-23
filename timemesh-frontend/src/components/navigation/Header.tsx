import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Menu, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../ui/Button';
import InvitesDropdown from '../GroupInvites/InvitesDropdown';
import { useInvites } from '../../hooks/useInvites';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { 
    pendingInvites, 
    isLoading, 
    handleAcceptInvite, 
    handleRejectInvite 
  } = useInvites();
  
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