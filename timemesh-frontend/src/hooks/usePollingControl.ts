import { useRef, useCallback } from 'react';

interface UsePollingControlOptions {
  pollFn: () => Promise<void>;
  interval: number;
  enabled?: boolean;
}

export const usePollingControl = ({ pollFn, interval, enabled = true }: UsePollingControlOptions) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPausedRef = useRef(false);

  const startPolling = useCallback(() => {
    if (!enabled || isPausedRef.current) return;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      if (!isPausedRef.current) {
        pollFn();
      }
    }, interval);
  }, [pollFn, interval, enabled]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const pausePolling = useCallback(() => {
    isPausedRef.current = true;
  }, []);

  const resumePolling = useCallback(() => {
    isPausedRef.current = false;
  }, []);

  const restartPolling = useCallback(() => {
    stopPolling();
    startPolling();
  }, [stopPolling, startPolling]);

  return {
    startPolling,
    stopPolling,
    pausePolling,
    resumePolling,
    restartPolling,
    isPolling: intervalRef.current !== null,
    isPaused: isPausedRef.current
  };
}; 