/**
 * Hook pour la session utilisateur
 */

import { useState, useEffect } from 'react';
import { getDI } from '@/lib/di';
import { User } from '@/core/entities/User';

interface UseSessionReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSession(): UseSessionReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const di = getDI();

  const fetchSession = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const session = await di.getCurrentSessionUseCase.execute();
      setUser(session?.user || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération de la session');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    refetch: fetchSession,
  };
}
