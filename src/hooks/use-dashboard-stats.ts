/**
 * Hook pour récupérer les statistiques du tableau de bord
 */

import { useState, useEffect } from 'react';
import { GetDashboardStatsUseCase, DashboardStats } from '@/core/use-cases/analytics/GetDashboardStatsUseCase';
import { ApiOrderRepository } from '@/data/repositories/ApiOrderRepository';
import { SupabaseDishRepository } from '@/data/repositories/SupabaseDishRepository';
import { User } from '@/core/entities/User';

export function useDashboardStats(user: User | null, restaurantId: string) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !restaurantId) {
      setIsLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const orderRepository = new ApiOrderRepository();
        const analyticsRepository = new SupabaseDishRepository(); // Implémente IAnalyticsRepository
        const useCase = new GetDashboardStatsUseCase(orderRepository, analyticsRepository);

        const dashboardStats = await useCase.execute(user, user.id.toString());
        setStats(dashboardStats);
      } catch (err) {
        console.error('Erreur lors du chargement des statistiques:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user, restaurantId]);

  return {
    stats,
    isLoading,
    error,
    refetch: () => {
      if (user && restaurantId) {
        const fetchStats = async () => {
          try {
            setIsLoading(true);
            setError(null);

            const orderRepository = new ApiOrderRepository();
            const analyticsRepository = new SupabaseDishRepository(); // Implémente IAnalyticsRepository
            const useCase = new GetDashboardStatsUseCase(orderRepository, analyticsRepository);

            const dashboardStats = await useCase.execute(user, user.id.toString());
            setStats(dashboardStats);
          } catch (err) {
            console.error('Erreur lors du chargement des statistiques:', err);
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
          } finally {
            setIsLoading(false);
          }
        };
        fetchStats();
      }
    }
  };
}