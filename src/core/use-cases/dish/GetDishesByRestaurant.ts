import { IDishManagementRepository } from '../../interfaces/IMenuRepository';
import { DishDTO } from '../../entities/Dish';

/**
 * GetDishesByRestaurant Use Case
 * Récupère tous les plats d'un restaurant
 */
export class GetDishesByRestaurant {
  constructor(private dishRepository: IDishManagementRepository) {}

  async execute(restaurantId: string): Promise<DishDTO[]> {
    if (!restaurantId) {
      throw new Error('Restaurant ID is required');
    }
    return await this.dishRepository.getDishesByRestaurantId(restaurantId);
  }
}
