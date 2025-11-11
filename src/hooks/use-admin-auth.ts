/**
 * Hook pour l'authentification Admin via Google OAuth
 * Respecte l'architecture propre en utilisant les use cases
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDI } from '@/lib/di';

export function useAdminAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const di = getDI();
      const useCase = di.googleLoginAdminUseCase;
      const result = await useCase.execute();

      // Rediriger vers Google OAuth
      window.location.href = result.redirectUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
      setIsLoading(false);
    }
  };

  const handleCallback = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('[useAdminAuth] Début du callback');

      // Attendre un peu pour que la session OAuth soit établie
      await new Promise(resolve => setTimeout(resolve, 1000));

      const di = getDI();
      const useCase = di.handleAdminCallbackUseCase;
      await useCase.execute();

      console.log('[useAdminAuth] Callback réussi, redirection vers /admin');
      // Rediriger vers le dashboard admin
      router.push('/admin');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'authentification';
      console.error('[useAdminAuth] Erreur callback:', errorMessage);
      setError(errorMessage);
      setIsLoading(false);
      
      // Rediriger vers la page de login avec l'erreur
      router.push(`/admin/login?error=${encodeURIComponent(errorMessage)}`);
    }
  };

  return {
    loginWithGoogle,
    handleCallback,
    isLoading,
    error,
  };
}
