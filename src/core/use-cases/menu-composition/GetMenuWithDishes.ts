import { IMenuCompositionRepository } from '../../interfaces/IMenuCompositionRepository';
import { MenuWithDishesDTO } from '../../entities/MenuComposition';

/**
 * Use Case: Récupérer un menu avec tous ses plats
 */
export class GetMenuWithDishes {
  constructor(private menuCompositionRepository: IMenuCompositionRepository) {}

  async execute(menuId: string): Promise<MenuWithDishesDTO | null> {
    if (!menuId) {
      throw new Error('Menu ID est requis');
    }

    return await this.menuCompositionRepository.getMenuWithDishes(menuId);
  }
}
