/**
 * Use Case: Obtenir le restaurant d'un gérant avec vérification de permissions
 */

import { IRestaurantRepository } from '../../interfaces/IRestaurantRepository';
import { Restaurant } from '../../entities/Restaurant';
import { User } from '../../entities/User';

export class GetRestaurantByGerantUseCase {
  constructor(private restaurantRepository: IRestaurantRepository) {}

  async execute(gerant: User): Promise<Restaurant> {
    // Vérification des permissions métier
    if (!gerant.canManageRestaurant()) {
      throw new Error('Vous n\'avez pas les permissions pour gérer un restaurant');
    }

    const restaurant = await this.restaurantRepository.getByGerantId(gerant.id);
    
    if (!restaurant) {
      throw new Error('Aucun restaurant trouvé pour ce gérant');
    }

    // Vérifier que le gérant est bien propriétaire
    if (!restaurant.isManagedBy(gerant.id)) {
      throw new Error('Vous n\'êtes pas autorisé à accéder à ce restaurant');
    }

    return restaurant;
  }
}
