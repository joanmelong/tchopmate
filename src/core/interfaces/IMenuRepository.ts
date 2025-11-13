/**
 * Interface de repository pour les menus et plats
 */

import { Menu, Plat } from '../entities/Menu';

export interface CreateMenuData {
  nom: string;
  description?: string;
  restaurantId: string;
}

export interface UpdateMenuData {
  nom?: string;
  description?: string;
}

export interface CreatePlatData {
  nom: string;
  description?: string;
  prix: number;
  photo?: string;
  menuId: number;
  disponible?: boolean;
}

export interface UpdatePlatData {
  nom?: string;
  description?: string;
  prix?: number;
  photo?: string;
  disponible?: boolean;
}

export interface IMenuRepository {
  /**
   * Récupérer un menu par son ID avec ses plats
   */
  getById(id: number): Promise<Menu | null>;

  /**
   * Récupérer tous les menus d'un restaurant
   */
  getByRestaurantId(restaurantId: string): Promise<Menu[]>;

  /**
   * Créer un nouveau menu
   */
  create(data: CreateMenuData): Promise<Menu>;

  /**
   * Mettre à jour un menu
   */
  update(id: number, data: UpdateMenuData): Promise<Menu>;

  /**
   * Supprimer un menu
   */
  delete(id: number): Promise<void>;
}

export interface IPlatRepository {
  /**
   * Récupérer un plat par son ID
   */
  getById(id: number): Promise<Plat | null>;

  /**
   * Récupérer tous les plats d'un menu
   */
  getByMenuId(menuId: number): Promise<Plat[]>;

  /**
   * Récupérer uniquement les plats disponibles d'un menu
   */
  getAvailableByMenuId(menuId: number): Promise<Plat[]>;

  /**
   * Créer un nouveau plat
   */
  create(data: CreatePlatData): Promise<Plat>;

  /**
   * Mettre à jour un plat
   */
  update(id: number, data: UpdatePlatData): Promise<Plat>;

  /**
   * Supprimer un plat
   */
  delete(id: number): Promise<void>;

  /**
   * Changer la disponibilité d'un plat
   */
  setDisponible(id: number, disponible: boolean): Promise<void>;
}

/**
 * Extension pour gérer les DTOs simplifiés (pour l'interface de gestion)
 */
import { MenuDTO, CreateMenuDTO, UpdateMenuDTO } from '../entities/Menu';
import { DishDTO, CreateDishDTO, UpdateDishDTO } from '../entities/Dish';

export interface IMenuManagementRepository {
  getMenusByRestaurantId(restaurantId: number): Promise<MenuDTO[]>;
  getMenuById(id: string): Promise<MenuDTO | null>;
  createMenu(data: CreateMenuDTO): Promise<MenuDTO>;
  updateMenu(id: string, data: UpdateMenuDTO): Promise<MenuDTO>;
  deleteMenu(id: string): Promise<void>;
  toggleMenuAvailability(id: string, disponible: boolean): Promise<MenuDTO>;
}

export interface IDishManagementRepository {
  getDishesByRestaurantId(restaurantId: string): Promise<DishDTO[]>;
  getDishesByCategory(restaurantId: string, category: string): Promise<DishDTO[]>;
  getDishById(id: string): Promise<DishDTO | null>;
  createDish(data: CreateDishDTO): Promise<DishDTO>;
  updateDish(id: string, data: UpdateDishDTO): Promise<DishDTO>;
  deleteDish(id: string): Promise<void>;
  toggleDishAvailability(id: string, disponible: boolean): Promise<DishDTO>;
}
