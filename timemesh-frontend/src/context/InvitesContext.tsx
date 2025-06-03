import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { groupsService } from '../services/groups';
import { useAuth } from '../hooks/useAuth';
import { useModal } from './ModalContext';
import { usePollingControl } from '../hooks/usePollingControl';

interface Invite {
  id: number;
  group_id: number;
  group: {
    name: string;
  };
  invited_by: string;
  invited_at: string;
}

interface InvitesContextType {
  pendingInvites: Invite[];
  isLoading: boolean;
  refreshInvites: () => Promise<void>;
  handleAcceptInvite: (invite: Invite) => Promise<void>;
  handleRejectInvite: (invite: Invite) => Promise<void>;
}

const InvitesContext = createContext<InvitesContextType | undefined>(undefined);

interface InvitesProviderProps {
  children: ReactNode;
  pollInterval?: number;
}

export const InvitesProvider = ({ children, pollInterval = 30000 }: InvitesProviderProps) => {
  const [pendingInvites, setPendingInvites] = useState<Invite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { hasOpenModals } = useModal();
  const lastDataRef = useRef<string>('');

  const fetchInvites = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const data = await groupsService.getPendingInvites();
      
      // Only update state if data actually changed to prevent unnecessary re-renders
      const dataString = JSON.stringify(data);
      if (dataString !== lastDataRef.current) {
        setPendingInvites(data);
        lastDataRef.current = dataString;
      }
    } catch (e) {
      console.error('Failed to fetch invites:', e);
      // Only clear invites if we don't have any data yet
      if (pendingInvites.length === 0) {
        setPendingInvites([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, pendingInvites.length]);

  // Create polling control that respects modal state
  const { startPolling, stopPolling, pausePolling, resumePolling } = usePollingControl({
    pollFn: fetchInvites,
    interval: pollInterval,
    enabled: !!user
  });

  // Initial fetch and start polling
  useEffect(() => {
    if (!user) return;

    fetchInvites();
    startPolling();

    return () => {
      stopPolling();
    };
  }, [user, fetchInvites, startPolling, stopPolling]);

  // Pause/resume polling based on modal state
  useEffect(() => {
    if (hasOpenModals) {
      pausePolling();
    } else {
      resumePolling();
    }
  }, [hasOpenModals, pausePolling, resumePolling]);

  const handleAcceptInvite = useCallback(async (invite: Invite) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await groupsService.acceptInvite(invite);
      setPendingInvites((current) => {
        const newInvites = current.filter(i => i.id !== invite.id);
        lastDataRef.current = JSON.stringify(newInvites);
        return newInvites;
      });
    } catch (error) {
      console.error('Failed to accept invite:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const handleRejectInvite = useCallback(async (invite: Invite) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await groupsService.rejectInvite(invite);
      setPendingInvites((current) => {
        const newInvites = current.filter(i => i.id !== invite.id);
        lastDataRef.current = JSON.stringify(newInvites);
        return newInvites;
      });
    } catch (error) {
      console.error('Failed to reject invite:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return (
    <InvitesContext.Provider value={{
      pendingInvites,
      isLoading,
      refreshInvites: fetchInvites,
      handleAcceptInvite,
      handleRejectInvite
    }}>
      {children}
    </InvitesContext.Provider>
  );
};

export const useInvites = () => {
  const context = useContext(InvitesContext);
  if (context === undefined) {
    throw new Error('useInvites must be used within an InvitesProvider');
  }
  return context;
}; 