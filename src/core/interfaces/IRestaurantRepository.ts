/**
 * Interface de repository pour les restaurants
 */

import { Restaurant } from '../entities/Restaurant';

export interface CreateRestaurantData {
  nom: string;
  localisation?: string;
  photo?: string;
  gerantId: number;
}

export interface UpdateRestaurantData {
  nom?: string;
  localisation?: string;
  photo?: string;
}

export interface IRestaurantRepository {
  /**
   * Récupérer un restaurant par son ID
   */
  getById(id: string): Promise<Restaurant | null>;

  /**
   * Récupérer le restaurant d'un gérant
   */
  getByGerantId(gerantId: number): Promise<Restaurant | null>;

  /**
   * Récupérer tous les restaurants
   */
  getAll(): Promise<Restaurant[]>;

  /**
   * Créer un nouveau restaurant
   */
  create(data: CreateRestaurantData): Promise<Restaurant>;

  /**
   * Mettre à jour un restaurant
   */
  update(id: string, data: UpdateRestaurantData): Promise<Restaurant>;

  /**
   * Supprimer un restaurant
   */
  delete(id: string): Promise<void>;

  /**
   * Vérifier si un gérant possède déjà un restaurant
   */
  gerantHasRestaurant(gerantId: number): Promise<boolean>;
}
