/**
 * Hook pour récupérer les données analytiques
 */

import { useState, useEffect } from 'react';
import { GetAnalyticsDataUseCase, AnalyticsData } from '@/core/use-cases/analytics/GetAnalyticsDataUseCase';
import { ApiOrderRepository } from '@/data/repositories/ApiOrderRepository';
import { SupabaseDishRepository } from '@/data/repositories/SupabaseDishRepository';
import { User } from '@/core/entities/User';

export function useAnalyticsData(user: User | null, restaurantId: string, days: number = 7) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !restaurantId) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const orderRepository = new ApiOrderRepository();
        const analyticsRepository = new SupabaseDishRepository(); // Implémente IAnalyticsRepository
        const useCase = new GetAnalyticsDataUseCase(orderRepository, analyticsRepository);

        const analyticsData = await useCase.execute(user, user.id.toString(), days);
        setData(analyticsData);
      } catch (err) {
        console.error('Erreur lors du chargement des données analytiques:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, restaurantId, days]);

  return {
    data,
    isLoading,
    error,
    refetch: () => {
      if (user && restaurantId) {
        const fetchData = async () => {
          try {
            setIsLoading(true);
            setError(null);

            const orderRepository = new ApiOrderRepository();
            const analyticsRepository = new SupabaseDishRepository(); // Implémente IAnalyticsRepository
            const useCase = new GetAnalyticsDataUseCase(orderRepository, analyticsRepository);

            const analyticsData = await useCase.execute(user, user.id.toString(), days);
            setData(analyticsData);
          } catch (err) {
            console.error('Erreur lors du chargement des données analytiques:', err);
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
          } finally {
            setIsLoading(false);
          }
        };
        fetchData();
      }
    }
  };
}