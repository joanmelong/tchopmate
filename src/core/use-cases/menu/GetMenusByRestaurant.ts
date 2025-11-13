import { IMenuManagementRepository } from '../../interfaces/IMenuRepository';
import { MenuDTO } from '../../entities/Menu';

/**
 * GetMenusByRestaurant Use Case
 * Récupère tous les menus d'un restaurant
 */
export class GetMenusByRestaurant {
  constructor(private menuRepository: IMenuManagementRepository) {}

  async execute(restaurantId: number): Promise<MenuDTO[]> {
    if (!restaurantId) {
      throw new Error('Restaurant ID is required');
    }
    return await this.menuRepository.getMenusByRestaurantId(restaurantId);
  }
}
