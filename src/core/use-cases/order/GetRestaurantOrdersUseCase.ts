/**
 * Use Case: Obtenir les commandes d'un restaurant
 */

import { IOrderRepository, OrderFilters } from '../../interfaces/IOrderRepository';
import { Order } from '../../entities/Order';
import { User } from '../../entities/User';

export class GetRestaurantOrdersUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(gerant: User, restaurantId: string, filters?: OrderFilters): Promise<Order[]> {
    // Vérification des permissions
    if (!gerant.canManageOrders()) {
      throw new Error('Vous n\'avez pas les permissions pour voir les commandes');
    }

    const orders = await this.orderRepository.getByRestaurantId(restaurantId, filters);
    
    return orders;
  }
}
