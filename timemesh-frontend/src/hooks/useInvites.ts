import { useState, useEffect } from 'react';
import { groupsService } from '../services/groups';

export const useInvites = (pollInterval = 30000) => {
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
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
    // Initial fetch
    fetchInvites();

    // Set up polling
    const intervalId = setInterval(fetchInvites, pollInterval);

    // Cleanup
    return () => clearInterval(intervalId);
  }, [pollInterval]);

  const handleAcceptInvite = async (invite: any) => {
    setIsLoading(true);
    try {
      await groupsService.acceptInvite(invite);
      setPendingInvites((current) => current.filter(i => i.id !== invite.id));
    } catch (error) {
      // Handle error if needed
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectInvite = async (invite: any) => {
    setIsLoading(true);
    try {
      await groupsService.rejectInvite(invite);
      setPendingInvites((current) => current.filter(i => i.id !== invite.id));
    } catch (error) {
      // Handle error if needed
    } finally {
      setIsLoading(false);
    }
  };

  return {
    pendingInvites,
    isLoading,
    handleAcceptInvite,
    handleRejectInvite,
    refreshInvites: fetchInvites
  };
}; 