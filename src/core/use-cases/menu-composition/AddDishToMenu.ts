import { IMenuCompositionRepository } from '../../interfaces/IMenuCompositionRepository';
import { AddDishToMenuDTO, MenuPlatDTO } from '../../entities/MenuComposition';

/**
 * Use Case: Ajouter un plat à un menu
 */
export class AddDishToMenu {
  constructor(private menuCompositionRepository: IMenuCompositionRepository) {}

  async execute(data: AddDishToMenuDTO): Promise<MenuPlatDTO> {
    // Validation
    if (!data.menu_id) {
      throw new Error('Menu ID est requis');
    }

    if (!data.plat_id) {
      throw new Error('Plat ID est requis');
    }

    if (data.quantite !== undefined && data.quantite <= 0) {
      throw new Error('La quantité doit être supérieure à 0');
    }

    // Vérifier si le plat n'est pas déjà dans le menu
    const exists = await this.menuCompositionRepository.isDishInMenu(
      data.menu_id,
      data.plat_id
    );

    if (exists) {
      throw new Error('Ce plat est déjà dans le menu');
    }

    // Ajouter le plat au menu
    return await this.menuCompositionRepository.addDishToMenu(data);
  }
}
