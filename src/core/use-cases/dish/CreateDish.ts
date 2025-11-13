import { IDishManagementRepository } from '../../interfaces/IMenuRepository';
import { DishDTO, CreateDishDTO } from '../../entities/Dish';

/**
 * CreateDish Use Case
 * Crée un nouveau plat pour un restaurant
 */
export class CreateDish {
  constructor(private dishRepository: IDishManagementRepository) {}

  async execute(data: CreateDishDTO): Promise<DishDTO> {
    // Validation
    if (!data.restaurant_id || !data.nom || data.prix === undefined || !data.categorie) {
      throw new Error('Restaurant ID, nom, prix et catégorie sont requis');
    }

    if (data.prix < 0) {
      throw new Error('Le prix ne peut pas être négatif');
    }

    if (data.temps_preparation !== undefined && data.temps_preparation < 0) {
      throw new Error('Le temps de préparation ne peut pas être négatif');
    }

    return await this.dishRepository.createDish(data);
  }
}
