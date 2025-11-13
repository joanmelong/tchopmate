import { IDishManagementRepository } from '../../interfaces/IMenuRepository';

/**
 * DeleteDish Use Case
 * Supprime un plat
 */
export class DeleteDish {
  constructor(private dishRepository: IDishManagementRepository) {}

  async execute(id: string): Promise<void> {
    if (!id) {
      throw new Error('Dish ID is required');
    }

    const existingDish = await this.dishRepository.getDishById(id);
    if (!existingDish) {
      throw new Error('Dish not found');
    }

    await this.dishRepository.deleteDish(id);
  }
}
