import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { groupsService, Group } from '../services/groups';

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

  const fetchTeams = async () => {
    setIsLoading(true);
    try {
      const data = await groupsService.getGroups();
      setTeams(data);
    } catch (e) {
      setTeams([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();

    const intervalId = setInterval(fetchTeams, pollInterval);

    return () => clearInterval(intervalId);
  }, [pollInterval]);

  const addTeam = (team: Group) => {
    setTeams(prevTeams => {
      if (prevTeams.some(t => t.id === team.id)) {
        return prevTeams;
      }
      return [...prevTeams, team];
    });
  };

  const removeTeam = (teamId: number) => {
    setTeams(prevTeams => prevTeams.filter(team => team.id !== teamId));
  };

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