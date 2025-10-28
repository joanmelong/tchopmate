/**
 * Use Case: Créer un nouveau restaurant
 */

import { IRestaurantRepository, CreateRestaurantData } from '../../interfaces/IRestaurantRepository';
import { Restaurant } from '../../entities/Restaurant';
import { User } from '../../entities/User';

export class CreateRestaurantUseCase {
  constructor(private restaurantRepository: IRestaurantRepository) {}

  async execute(gerant: User, data: Omit<CreateRestaurantData, 'gerantId'>): Promise<Restaurant> {
    // Vérification des permissions
    if (!gerant.canManageRestaurant()) {
      throw new Error('Vous n\'avez pas les permissions pour créer un restaurant');
    }

    // Vérifier que le gérant n'a pas déjà un restaurant
    const hasRestaurant = await this.restaurantRepository.gerantHasRestaurant(gerant.id);
    if (hasRestaurant) {
      throw new Error('Vous possédez déjà un restaurant');
    }

    // Validation des données
    if (!data.nom || data.nom.trim().length === 0) {
      throw new Error('Le nom du restaurant est requis');
    }

    // Créer le restaurant
    const restaurant = await this.restaurantRepository.create({
      ...data,
      gerantId: gerant.id,
    });

    return restaurant;
  }
}
