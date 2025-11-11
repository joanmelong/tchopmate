/**
 * Hook pour gérer un restaurant
 */

import { useState, useEffect } from 'react';
import { getDI } from '@/lib/di';
import { Restaurant } from '@/core/entities/Restaurant';
import { User } from '@/core/entities/User';

interface UseRestaurantReturn {
  restaurant: Restaurant | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useRestaurantByGerant(gerant: User | null): UseRestaurantReturn {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const di = getDI();

  const fetchRestaurant = async () => {
    if (!gerant) {
      setRestaurant(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const resto = await di.getRestaurantByGerantUseCase.execute(gerant);
      setRestaurant(resto);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération du restaurant');
      setRestaurant(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurant();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gerant?.id]);

  return {
    restaurant,
    isLoading,
    error,
    refetch: fetchRestaurant,
  };
}
