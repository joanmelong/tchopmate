/**
 * Use Case: Obtenir les données analytiques détaillées
 */

import { IOrderRepository } from '../../interfaces/IOrderRepository';
import { IAnalyticsRepository } from '../../interfaces/IAnalyticsRepository';
import { User } from '../../entities/User';

export interface DailySalesData {
  day: string;
  sales: number;
  orders: number;
}

export interface CategoryData {
  name: string;
  value: number;
}

export interface PopularDish {
  name: string;
  orders: number;
  revenue: number;
  image?: string;
}

export interface AnalyticsData {
  dailySales: DailySalesData[];
  categoryData: CategoryData[];
  popularDishes: PopularDish[];
  totalRevenue: number;
  totalOrders: number;
}

export class GetAnalyticsDataUseCase {
  constructor(
    private orderRepository: IOrderRepository,
    private analyticsRepository: IAnalyticsRepository
  ) {}

  async execute(gerant: User, restaurantId: string, days: number = 7): Promise<AnalyticsData> {
    // Vérification des permissions
    if (!gerant.canManageOrders()) {
      throw new Error('Vous n\'avez pas les permissions pour voir les analytiques');
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Récupérer les commandes de la période (toutes les commandes, on filtrera après)
    const orders = await this.orderRepository.getByRestaurantId(restaurantId, {
      dateFrom: startDate,
      dateTo: endDate,
      // Ne pas filtrer par statut ici, on veut toutes les commandes pour les statistiques
    });

    // Générer les données de ventes quotidiennes
    const dailySales = this.generateDailySalesData(orders, days);

    // Générer les données par catégorie (simulation pour l'instant)
    const categoryData = this.generateCategoryData(orders);

    // Récupérer les plats populaires
    const popularDishes = await this.getPopularDishes(restaurantId, orders);

    // Calculer les totaux
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const totalOrders = orders.length;

    return {
      dailySales,
      categoryData,
      popularDishes,
      totalRevenue,
      totalOrders,
    };
  }

  private generateDailySalesData(orders: Array<{ totalPrice: number; createdAt: Date }>, days: number): DailySalesData[] {
    const salesByDay = new Map<string, { sales: number; orders: number }>();
    
    // Initialiser tous les jours avec 0
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayKey = this.getDayLabel(date);
      salesByDay.set(dayKey, { sales: 0, orders: 0 });
    }

    // Remplir avec les vraies données
    orders.forEach(order => {
      const dayKey = this.getDayLabel(order.createdAt);
      const existing = salesByDay.get(dayKey);
      if (existing) {
        existing.sales += order.totalPrice;
        existing.orders += 1;
      }
    });

    // Convertir en tableau et trier par date
    return Array.from(salesByDay.entries())
      .map(([day, data]) => ({
        day,
        sales: data.sales,
        orders: data.orders,
      }))
      .reverse(); // Plus récent en dernier
  }

  private getDayLabel(date: Date): string {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    return days[date.getDay()];
  }

  private generateCategoryData(orders: Array<{ items: Array<{ platNom: string; quantite: number }> }>): CategoryData[] {
    // Pour l'instant, simulation des catégories
    // TODO: Implémenter la logique réelle basée sur les types de plats
    const totalOrders = orders.length;
    
    if (totalOrders === 0) {
      return [
        { name: "Plats", value: 0 },
        { name: "Boissons", value: 0 },
        { name: "Desserts", value: 0 },
      ];
    }

    return [
      { name: "Plats", value: Math.round((totalOrders * 0.45 / totalOrders) * 100) },
      { name: "Boissons", value: Math.round((totalOrders * 0.30 / totalOrders) * 100) },
      { name: "Desserts", value: Math.round((totalOrders * 0.25 / totalOrders) * 100) },
    ];
  }

  private async getPopularDishes(restaurantId: string, orders: Array<{ items: Array<{ platNom: string; quantite: number; prixUnitaire: number }> }>): Promise<PopularDish[]> {
    // Compter les plats par nom
    const dishCounts = new Map<string, { count: number; revenue: number; name: string }>();
    
    orders.forEach(order => {
      order.items.forEach((item: { platNom: string; quantite: number; prixUnitaire: number }) => {
        const existing = dishCounts.get(item.platNom);
        const subtotal = item.quantite * item.prixUnitaire;
        if (existing) {
          existing.count += item.quantite;
          existing.revenue += subtotal;
        } else {
          dishCounts.set(item.platNom, {
            count: item.quantite,
            revenue: subtotal,
            name: item.platNom,
          });
        }
      });
    });

    // Si aucune commande, utiliser le repository pour récupérer des plats populaires simulés
    if (dishCounts.size === 0) {
      try {
        const popularDishesData = await this.analyticsRepository.getPopularDishes(restaurantId, 5);
        return popularDishesData.map(item => ({
          name: item.dish.nom,
          orders: item.orderCount,
          revenue: item.revenue,
          image: item.dish.image_url,
        }));
      } catch (error) {
        console.error('Erreur lors de la récupération des plats populaires:', error);
        return [];
      }
    }

    // Convertir en tableau et trier par popularité
    return Array.from(dishCounts.entries())
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .map(([_platId, data]) => ({
        name: data.name,
        orders: data.count,
        revenue: data.revenue,
        image: undefined, // TODO: Récupérer l'image depuis la base de données
      }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5); // Top 5
  }
}