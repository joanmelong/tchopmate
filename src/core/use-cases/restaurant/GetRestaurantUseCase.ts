/**
 * Use Case: Obtenir les informations d'un restaurant
 */

import { IRestaurantRepository } from '../../interfaces/IRestaurantRepository';
import { Restaurant } from '../../entities/Restaurant';

export class GetRestaurantUseCase {
  constructor(private restaurantRepository: IRestaurantRepository) {}

  async execute(restaurantId: string): Promise<Restaurant> {
    if (!restaurantId || restaurantId.trim().length === 0) {
      throw new Error('L\'ID du restaurant est requis');
    }

    const restaurant = await this.restaurantRepository.getById(restaurantId);
    
    if (!restaurant) {
      throw new Error('Restaurant non trouvé');
    }

    return restaurant;
  }
}
