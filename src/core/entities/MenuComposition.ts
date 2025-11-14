/**
 * Entités pour la composition de menus avec des plats
 */

import { DishDTO } from './Dish';

/**
 * Représente un plat dans un menu avec sa quantité et son ordre
 */
export interface MenuPlatDTO {
  id: string;
  menu_id: string;
  plat_id: string;
  quantite: number;
  ordre: number;
  created_at: Date;
  
  // Données du plat (jointure)
  plat?: DishDTO;
}

/**
 * Menu avec ses plats composés
 */
export interface MenuWithDishesDTO {
  id: string;
  restaurant_id: string;
  nom: string;
  description?: string;
  prix?: number;
  image_url?: string;
  disponible: boolean;
  created_at: Date;
  updated_at: Date;
  
  // Plats composant le menu
  plats: MenuPlatDTO[];
}

/**
 * DTO pour ajouter un plat à un menu
 */
export interface AddDishToMenuDTO {
  menu_id: string;
  plat_id: string;
  quantite?: number;
  ordre?: number;
}

/**
 * DTO pour mettre à jour un plat dans un menu
 */
export interface UpdateMenuPlatDTO {
  quantite?: number;
  ordre?: number;
}

/**
 * DTO pour réorganiser les plats d'un menu
 */
export interface ReorderMenuDishesDTO {
  menu_id: string;
  dishes: Array<{
    plat_id: string;
    ordre: number;
  }>;
}
