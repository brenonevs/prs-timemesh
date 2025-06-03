import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { groupsService, Group } from '../services/groups';
import { useAuth } from '../hooks/useAuth';
import { useModal } from './ModalContext';
import { usePollingControl } from '../hooks/usePollingControl';

interface TeamsContextType {
  teams: Group[];
  isLoading: boolean;
  refreshTeams: () => Promise<void>;
  addTeam: (team: Group) => void;
  removeTeam: (teamId: number) => void;
}

const TeamsContext = createContext<TeamsContextType | undefined>(undefined);

interface TeamsProviderProps {
  children: ReactNode;
  pollInterval?: number;
}

export const TeamsProvider = ({ children, pollInterval = 30000 }: TeamsProviderProps) => {
  const [teams, setTeams] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { hasOpenModals } = useModal();
  const lastDataRef = useRef<string>('');

  const fetchTeams = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const data = await groupsService.getGroups();
      
      // Only update state if data actually changed to prevent unnecessary re-renders
      const dataString = JSON.stringify(data);
      if (dataString !== lastDataRef.current) {
        setTeams(data);
        lastDataRef.current = dataString;
      }
    } catch (e) {
      console.error('Failed to fetch teams:', e);
      // Only clear teams if we don't have any data yet
      if (teams.length === 0) {
        setTeams([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, teams.length]);

  // Create polling control that respects modal state
  const { startPolling, stopPolling, pausePolling, resumePolling } = usePollingControl({
    pollFn: fetchTeams,
    interval: pollInterval,
    enabled: !!user
  });

  // Initial fetch and start polling
  useEffect(() => {
    if (!user) return;

    fetchTeams();
    startPolling();

    return () => {
      stopPolling();
    };
  }, [user, fetchTeams, startPolling, stopPolling]);

  // Pause/resume polling based on modal state
  useEffect(() => {
    if (hasOpenModals) {
      pausePolling();
    } else {
      resumePolling();
    }
  }, [hasOpenModals, pausePolling, resumePolling]);

  const addTeam = useCallback((team: Group) => {
    setTeams(prevTeams => {
      if (prevTeams.some(t => t.id === team.id)) {
        return prevTeams;
      }
      const newTeams = [...prevTeams, team];
      lastDataRef.current = JSON.stringify(newTeams);
      return newTeams;
    });
  }, []);

  const removeTeam = useCallback((teamId: number) => {
    setTeams(prevTeams => {
      const newTeams = prevTeams.filter(team => team.id !== teamId);
      lastDataRef.current = JSON.stringify(newTeams);
      return newTeams;
    });
  }, []);

  return (
    <TeamsContext.Provider value={{
      teams,
      isLoading,
      refreshTeams: fetchTeams,
      addTeam,
      removeTeam
    }}>
      {children}
    </TeamsContext.Provider>
  );
};

export const useTeams = () => {
  const context = useContext(TeamsContext);
  if (context === undefined) {
    throw new Error('useTeams must be used within a TeamsProvider');
  }
  return context;
}; 