import { IDishManagementRepository } from '../../interfaces/IMenuRepository';
import { DishDTO, UpdateDishDTO } from '../../entities/Dish';

/**
 * UpdateDish Use Case
 * Met à jour un plat existant
 */
export class UpdateDish {
  constructor(private dishRepository: IDishManagementRepository) {}

  async execute(id: string, data: UpdateDishDTO): Promise<DishDTO> {
    if (!id) {
      throw new Error('Dish ID is required');
    }

    if (data.prix !== undefined && data.prix < 0) {
      throw new Error('Le prix ne peut pas être négatif');
    }

    if (data.temps_preparation !== undefined && data.temps_preparation < 0) {
      throw new Error('Le temps de préparation ne peut pas être négatif');
    }

    const existingDish = await this.dishRepository.getDishById(id);
    if (!existingDish) {
      throw new Error('Dish not found');
    }

    return await this.dishRepository.updateDish(id, data);
  }
}
