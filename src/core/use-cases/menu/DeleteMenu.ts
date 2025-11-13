import { IMenuManagementRepository } from '../../interfaces/IMenuRepository';

/**
 * DeleteMenu Use Case
 * Supprime un menu
 */
export class DeleteMenu {
  constructor(private menuRepository: IMenuManagementRepository) {}

  async execute(id: string): Promise<void> {
    if (!id) {
      throw new Error('Menu ID is required');
    }

    const existingMenu = await this.menuRepository.getMenuById(id);
    if (!existingMenu) {
      throw new Error('Menu not found');
    }

    await this.menuRepository.deleteMenu(id);
  }
}
