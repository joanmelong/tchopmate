import { 
  MenuPlatDTO, 
  MenuWithDishesDTO, 
  AddDishToMenuDTO, 
  UpdateMenuPlatDTO 
} from '../entities/MenuComposition';

/**
 * Interface pour la gestion de la composition des menus
 * Permet d'associer des plats à des menus
 */
export interface IMenuCompositionRepository {
  /**
   * Récupérer un menu avec tous ses plats
   */
  getMenuWithDishes(menuId: string): Promise<MenuWithDishesDTO | null>;

  /**
   * Récupérer tous les menus d'un restaurant avec leurs plats
   */
  getMenusWithDishesByRestaurant(restaurantId: string): Promise<MenuWithDishesDTO[]>;

  /**
   * Récupérer les plats d'un menu
   */
  getMenuDishes(menuId: string): Promise<MenuPlatDTO[]>;

  /**
   * Ajouter un plat à un menu
   */
  addDishToMenu(data: AddDishToMenuDTO): Promise<MenuPlatDTO>;

  /**
   * Mettre à jour un plat dans un menu (quantité, ordre)
   */
  updateMenuDish(id: string, data: UpdateMenuPlatDTO): Promise<MenuPlatDTO>;

  /**
   * Retirer un plat d'un menu
   */
  removeDishFromMenu(id: string): Promise<void>;

  /**
   * Retirer tous les plats d'un menu
   */
  clearMenuDishes(menuId: string): Promise<void>;

  /**
   * Vérifier si un plat est déjà dans un menu
   */
  isDishInMenu(menuId: string, platId: string): Promise<boolean>;

  /**
   * Calculer le prix total d'un menu basé sur ses plats
   */
  calculateMenuTotalPrice(menuId: string): Promise<number>;
}
