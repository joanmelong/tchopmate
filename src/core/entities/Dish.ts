/**
 * DTOs pour la gestion des plats (interfaces légères pour l'UI)
 */
export interface DishDTO {
  id: string;
  restaurant_id: string; // UUID dans PostgreSQL
  nom: string;
  description?: string;
  prix: number;
  categorie: string;
  image_url?: string;
  disponible: boolean;
  temps_preparation?: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateDishDTO {
  restaurant_id: string; // UUID dans PostgreSQL
  nom: string;
  description?: string;
  prix: number;
  categorie: string;
  image_url?: string;
  disponible?: boolean;
  temps_preparation?: number;
}

export interface UpdateDishDTO {
  nom?: string;
  description?: string;
  prix?: number;
  categorie?: string;
  image_url?: string;
  disponible?: boolean;
  temps_preparation?: number;
}
