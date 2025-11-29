/**
 * Use Case: Obtenir les statistiques du tableau de bord
 */

import { IOrderRepository } from '../../interfaces/IOrderRepository';
import { IAnalyticsRepository } from '../../interfaces/IAnalyticsRepository';
import { User } from '../../entities/User';

export interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  totalCustomers: number;
  popularDishesCount: number;
  todayOrdersChange: string;
  revenueChange: string;
  customersChange: string;
}

export class GetDashboardStatsUseCase {
  constructor(
    private orderRepository: IOrderRepository,
    private analyticsRepository: IAnalyticsRepository
  ) {}

  async execute(gerant: User, restaurantId: string): Promise<DashboardStats> {
    // Vérification des permissions
    if (!gerant.canManageOrders()) {
      throw new Error('Vous n\'avez pas les permissions pour voir les statistiques');
    }

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    // Statistiques d'aujourd'hui
    const todayStats = await this.orderRepository.getStats(
      restaurantId, 
      startOfToday, 
      today
    );

    // Statistiques d'hier pour comparaison
    const yesterdayStats = await this.orderRepository.getStats(
      restaurantId, 
      startOfYesterday, 
      startOfToday
    );

    // Statistiques générales
    const allTimeStats = await this.orderRepository.getStats(restaurantId);

    // Calculer les changements en pourcentage
    const ordersChange = this.calculatePercentageChange(
      yesterdayStats.totalOrders, 
      todayStats.totalOrders
    );
    
    const revenueChange = this.calculatePercentageChange(
      yesterdayStats.totalRevenue, 
      todayStats.totalRevenue
    );

    // Pour les clients, on utilise le nombre de commandes uniques
    const customersChange = this.calculatePercentageChange(
      yesterdayStats.totalOrders, 
      todayStats.totalOrders
    );

    return {
      todayOrders: todayStats.totalOrders,
      todayRevenue: todayStats.totalRevenue,
      totalCustomers: allTimeStats.totalOrders, // Approximation
      popularDishesCount: 12, // Valeur fixe pour l'instant
      todayOrdersChange: ordersChange,
      revenueChange: revenueChange,
      customersChange: customersChange,
    };
  }

  private calculatePercentageChange(oldValue: number, newValue: number): string {
    if (oldValue === 0) {
      return newValue > 0 ? '+100%' : '0%';
    }
    
    const change = ((newValue - oldValue) / oldValue) * 100;
    const sign = change >= 0 ? '+' : '';
    return `${sign}${Math.round(change)}%`;
  }
}