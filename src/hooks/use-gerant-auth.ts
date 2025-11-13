/**
 * Hook pour l'authentification Gérant via Google OAuth
 * Respecte l'architecture propre en utilisant les use cases
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDI } from '@/lib/di';

export function useGerantAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const di = getDI();
      const useCase = di.googleLoginGerantUseCase;
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

      const di = getDI();
      const useCase = di.handleGerantCallbackUseCase;
      const user = await useCase.execute();

      // Vérifier si le gérant a déjà un restaurant
      const restaurantUseCase = di.getRestaurantByGerantUseCase;
      try {
        await restaurantUseCase.execute(user);
        // Rediriger vers le dashboard
        router.push(`/resto/${user.id}`);
      } catch {
        // Pas de restaurant, rediriger vers la création
        router.push('/resto/create-resto');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'authentification');
      setIsLoading(false);
      // Rediriger vers la page de login avec l'erreur
      router.push(`/resto/login?error=${encodeURIComponent(err instanceof Error ? err.message : 'Erreur inconnue')}`);
    }
  };

  return {
    loginWithGoogle,
    handleCallback,
    isLoading,
    error,
  };
}
