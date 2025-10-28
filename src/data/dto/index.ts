/**
 * DTOs (Data Transfer Objects) - Représentent la structure des données de la BD
 */

export interface CompteDTO {
  id: number;
  user_id: string;
  nom: string;
  prenom: string;
  email: string;
  numero_tel?: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

export interface RestaurantDTO {
  id_restaurant: string;
  nom: string;
  localisation?: string;
  photo?: string;
  gerant_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface MenuDTO {
  id: number;
  nom: string;
  description?: string;
  restaurant_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface PlatDTO {
  id: number;
  nom: string;
  description?: string;
  prix: number;
  photo?: string;
  disponible: boolean;
  menu_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface CommandeDTO {
  id: number;
  etudiant_id: number;
  restaurant_id: string;
  statut: string;
  montant_total: number;
  qr_code?: string;
  created_at: string;
  updated_at?: string;
}

export interface LigneCommandeDTO {
  id: number;
  commande_id: number;
  plat_id: number;
  quantite: number;
  prix_unitaire: number;
}
