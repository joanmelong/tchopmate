/**
 * Interface pour les repositories d'analytiques
 */

export interface PopularDishData {
  dish: {
    id: string;
    nom: string;
    image_url?: string;
  };
  orderCount: number;
  revenue: number;
}

export interface IAnalyticsRepository {
  getPopularDishes(restaurantId: string, limit?: number): Promise<PopularDishData[]>;
}