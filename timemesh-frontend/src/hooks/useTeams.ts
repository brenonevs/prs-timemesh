import { useState, useEffect } from 'react';
import { groupsService, Group } from '../services/groups';

export const useTeams = (pollInterval = 30000) => {
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
    // Initial fetch
    fetchTeams();

    // Set up polling
    const intervalId = setInterval(fetchTeams, pollInterval);

    // Cleanup
    return () => clearInterval(intervalId);
  }, [pollInterval]);

  const handleDeleteTeam = async (teamId: number) => {
    setIsLoading(true);
    try {
      await groupsService.deleteGroup(teamId);
      setTeams(prevTeams => prevTeams.filter(team => team.id !== teamId));
    } catch (error) {
      // Handle error if needed
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    teams,
    isLoading,
    handleDeleteTeam,
    refreshTeams: fetchTeams
  };
}; 