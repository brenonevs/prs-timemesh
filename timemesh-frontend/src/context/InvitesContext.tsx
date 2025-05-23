import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { groupsService } from '../services/groups';

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

  const fetchInvites = async () => {
    setIsLoading(true);
    try {
      const data = await groupsService.getPendingInvites();
      setPendingInvites(data);
    } catch (e) {
      setPendingInvites([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvites();

    const intervalId = setInterval(fetchInvites, pollInterval);

    return () => clearInterval(intervalId);
  }, [pollInterval]);

  const handleAcceptInvite = async (invite: Invite) => {
    setIsLoading(true);
    try {
      await groupsService.acceptInvite(invite);
      setPendingInvites((current) => current.filter(i => i.id !== invite.id));
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectInvite = async (invite: Invite) => {
    setIsLoading(true);
    try {
      await groupsService.rejectInvite(invite);
      setPendingInvites((current) => current.filter(i => i.id !== invite.id));
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

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