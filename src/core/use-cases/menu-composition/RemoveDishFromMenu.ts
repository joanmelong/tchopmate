import { IMenuCompositionRepository } from '../../interfaces/IMenuCompositionRepository';

/**
 * Use Case: Retirer un plat d'un menu
 */
export class RemoveDishFromMenu {
  constructor(private menuCompositionRepository: IMenuCompositionRepository) {}

  async execute(menuPlatId: string): Promise<void> {
    if (!menuPlatId) {
      throw new Error('Menu-Plat ID est requis');
    }

    await this.menuCompositionRepository.removeDishFromMenu(menuPlatId);
  }
}
