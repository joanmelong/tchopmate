import { IMenuCompositionRepository } from '../../interfaces/IMenuCompositionRepository';
import { UpdateMenuPlatDTO, MenuPlatDTO } from '../../entities/MenuComposition';

/**
 * Use Case: Mettre à jour un plat dans un menu (quantité, ordre)
 */
export class UpdateMenuDish {
  constructor(private menuCompositionRepository: IMenuCompositionRepository) {}

  async execute(menuPlatId: string, data: UpdateMenuPlatDTO): Promise<MenuPlatDTO> {
    if (!menuPlatId) {
      throw new Error('Menu-Plat ID est requis');
    }

    if (data.quantite !== undefined && data.quantite <= 0) {
      throw new Error('La quantité doit être supérieure à 0');
    }

    return await this.menuCompositionRepository.updateMenuDish(menuPlatId, data);
  }
}
