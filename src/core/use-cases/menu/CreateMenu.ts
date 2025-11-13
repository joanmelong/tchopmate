import { IMenuManagementRepository } from '../../interfaces/IMenuRepository';
import { MenuDTO, CreateMenuDTO } from '../../entities/Menu';

/**
 * CreateMenu Use Case
 * Crée un nouveau menu pour un restaurant
 */
export class CreateMenu {
  constructor(private menuRepository: IMenuManagementRepository) {}

  async execute(data: CreateMenuDTO): Promise<MenuDTO> {
    // Validation
    if (!data.restaurant_id || !data.nom) {
      throw new Error('Restaurant ID et nom sont requis');
    }

    if (data.prix !== undefined && data.prix < 0) {
      throw new Error('Le prix ne peut pas être négatif');
    }

    return await this.menuRepository.createMenu(data);
  }
}
