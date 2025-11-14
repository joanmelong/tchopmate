import { MenuCompositionRepository } from '@/data/repositories/MenuCompositionRepository';
import { AddDishToMenu } from '@/core/use-cases/menu-composition/AddDishToMenu';
import { RemoveDishFromMenu } from '@/core/use-cases/menu-composition/RemoveDishFromMenu';
import { GetMenuWithDishes } from '@/core/use-cases/menu-composition/GetMenuWithDishes';
import { UpdateMenuDish } from '@/core/use-cases/menu-composition/UpdateMenuDish';
import {
  MenuWithDishesDTO,
  AddDishToMenuDTO,
  UpdateMenuPlatDTO,
  MenuPlatDTO,
} from '@/core/entities/MenuComposition';

/**
 * Service pour la composition de menus avec des plats
 */
export class MenuCompositionService {
  private repository = new MenuCompositionRepository();

  private addDishToMenuUseCase = new AddDishToMenu(this.repository);
  private removeDishFromMenuUseCase = new RemoveDishFromMenu(this.repository);
  private getMenuWithDishesUseCase = new GetMenuWithDishes(this.repository);
  private updateMenuDishUseCase = new UpdateMenuDish(this.repository);

  /**
   * Récupérer un menu avec tous ses plats
   */
  async getMenuWithDishes(menuId: string): Promise<MenuWithDishesDTO | null> {
    return this.getMenuWithDishesUseCase.execute(menuId);
  }

  /**
   * Récupérer tous les menus d'un restaurant avec leurs plats
   */
  async getMenusWithDishesByRestaurant(restaurantId: string): Promise<MenuWithDishesDTO[]> {
    return this.repository.getMenusWithDishesByRestaurant(restaurantId);
  }

  /**
   * Ajouter un plat à un menu
   */
  async addDishToMenu(data: AddDishToMenuDTO): Promise<MenuPlatDTO> {
    return this.addDishToMenuUseCase.execute(data);
  }

  /**
   * Retirer un plat d'un menu
   */
  async removeDishFromMenu(menuPlatId: string): Promise<void> {
    return this.removeDishFromMenuUseCase.execute(menuPlatId);
  }

  /**
   * Mettre à jour un plat dans un menu
   */
  async updateMenuDish(menuPlatId: string, data: UpdateMenuPlatDTO): Promise<MenuPlatDTO> {
    return this.updateMenuDishUseCase.execute(menuPlatId, data);
  }

  /**
   * Vider tous les plats d'un menu
   */
  async clearMenuDishes(menuId: string): Promise<void> {
    return this.repository.clearMenuDishes(menuId);
  }

  /**
   * Calculer le prix total d'un menu
   */
  async calculateMenuTotalPrice(menuId: string): Promise<number> {
    return this.repository.calculateMenuTotalPrice(menuId);
  }
}

// Instance singleton
export const menuCompositionService = new MenuCompositionService();
