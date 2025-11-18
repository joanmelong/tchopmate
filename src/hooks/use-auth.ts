/**
 * Hook pour l'authentification
 * Ce hook fait le pont entre React et les use cases métier
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDI } from '@/lib/di';
import { AuthCredentials } from '@/core/interfaces/IAuthRepository';


interface UseAuthReturn {
  login: (credentials: AuthCredentials) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useAuth(): UseAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const di = getDI();

  const login = async (credentials: AuthCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      // Utiliser le use case au lieu d'appeler Supabase directement
      const session = await di.loginUseCase.execute(credentials);
      
      // Redirection basée sur le rôle
      if (session.user.isAdmin()) {
        router.push('/admin');
      } else if (session.user.isStaff()) {
        router.push(`/resto/${session.user.id}`);
      } else {
        router.push('/home');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await di.logoutUseCase.execute();
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de déconnexion');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    logout,
    isLoading,
    error,
  };
}
