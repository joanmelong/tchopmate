import { IMenuManagementRepository } from '../../interfaces/IMenuRepository';
import { MenuDTO, UpdateMenuDTO } from '../../entities/Menu';

/**
 * UpdateMenu Use Case
 * Met à jour un menu existant
 */
export class UpdateMenu {
  constructor(private menuRepository: IMenuManagementRepository) {}

  async execute(id: string, data: UpdateMenuDTO): Promise<MenuDTO> {
    if (!id) {
      throw new Error('Menu ID is required');
    }

    if (data.prix !== undefined && data.prix < 0) {
      throw new Error('Le prix ne peut pas être négatif');
    }

    const existingMenu = await this.menuRepository.getMenuById(id);
    if (!existingMenu) {
      throw new Error('Menu not found');
    }

    return await this.menuRepository.updateMenu(id, data);
  }
}
