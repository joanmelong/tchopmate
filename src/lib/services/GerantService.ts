/**
 * Service métier pour la gestion des gérants de restaurants
 * 
 * Ce service encapsule toute la logique métier liée à la gestion des gérants :
 * - Création de nouveaux gérants
 * - Récupération de la liste des gérants
 * - Vérification des autorisations
 * - Gestion des restaurants associés
 */

import { supabase } from "@/lib/supabaseClient";

export interface Gerant {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  numero_tel?: string;
  created_at: string;
  restaurant?: {
    id_restaurant: string;
    nom: string;
    localisation?: string;
  };
}

export interface CreateGerantData {
  email: string;
  nom?: string;
  prenom?: string;
  numero_tel?: string;
}

export class GerantService {
  /**
   * Crée un nouveau gérant dans la base de données
   * @param gerantData - Données du gérant à créer
   * @returns Promise<Gerant> - Le gérant créé
   * @throws Error si l'email existe déjà ou en cas d'erreur
   */
  static async createGerant(gerantData: CreateGerantData): Promise<Gerant> {
    try {
      // Utiliser la fonction RPC pour créer un gérant pré-autorisé
      const { data: newCompte, error: insertError } = await supabase.rpc('create_preauthorized_gerant', {
        p_email: gerantData.email.trim(),
        p_nom: gerantData.nom || 'Gérant',
        p_prenom: gerantData.prenom || 'Nouveau',
        p_numero_tel: gerantData.numero_tel || null
      });

      if (insertError) {
        throw new Error(`Erreur lors de la création du gérant: ${insertError.message}`);
      }

      return newCompte[0];
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Une erreur inattendue s'est produite lors de la création du gérant");
    }
  }

  /**
   * Récupère la liste de tous les gérants avec leurs restaurants associés
   * @returns Promise<Gerant[]> - Liste des gérants
   */
  static async getAllGerants(): Promise<Gerant[]> {
    try {
      const { data, error } = await supabase
        .from("compte")
        .select(`
          id,
          nom,
          prenom,
          email,
          numero_tel,
          created_at,
          restaurant (
            id_restaurant,
            nom,
            localisation
          )
        `)
        .eq("role", "Gerant")
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Erreur lors du chargement des gérants: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Une erreur inattendue s'est produite lors du chargement des gérants");
    }
  }

  /**
   * Récupère un gérant par son ID
   * @param gerantId - ID du gérant
   * @returns Promise<Gerant | null> - Le gérant ou null si non trouvé
   */
  static async getGerantById(gerantId: number): Promise<Gerant | null> {
    try {
      const { data, error } = await supabase
        .from("compte")
        .select(`
          id,
          nom,
          prenom,
          email,
          numero_tel,
          created_at,
          restaurant (
            id_restaurant,
            nom,
            localisation
          )
        `)
        .eq("id", gerantId)
        .eq("role", "Gerant")
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // Gérant non trouvé
        }
        throw new Error(`Erreur lors de la récupération du gérant: ${error.message}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Une erreur inattendue s'est produite lors de la récupération du gérant");
    }
  }

  /**
   * Vérifie si un email correspond à un gérant autorisé
   * @param email - Adresse email à vérifier
   * @returns Promise<boolean> - True si l'email est autorisé
   */
  static async isEmailAuthorized(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("compte")
        .select("id")
        .eq("email", email.trim())
        .eq("role", "Gerant")
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return false; // Email non trouvé
        }
        throw new Error(`Erreur lors de la vérification de l'email: ${error.message}`);
      }

      return !!data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Une erreur inattendue s'est produite lors de la vérification de l'email");
    }
  }

  /**
   * Met à jour les informations d'un gérant
   * @param gerantId - ID du gérant
   * @param updateData - Données à mettre à jour
   * @returns Promise<Gerant> - Le gérant mis à jour
   */
  static async updateGerant(gerantId: number, updateData: Partial<CreateGerantData>): Promise<Gerant> {
    try {
      const { data, error } = await supabase
        .from("compte")
        .update(updateData)
        .eq("id", gerantId)
        .eq("role", "Gerant")
        .select()
        .single();

      if (error) {
        throw new Error(`Erreur lors de la mise à jour du gérant: ${error.message}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Une erreur inattendue s'est produite lors de la mise à jour du gérant");
    }
  }

  /**
   * Supprime un gérant (et son restaurant associé)
   * @param gerantId - ID du gérant à supprimer
   * @returns Promise<void>
   */
  static async deleteGerant(gerantId: number): Promise<void> {
    try {
      // Supprimer le restaurant associé d'abord (cascade)
      await supabase
        .from("restaurant")
        .delete()
        .eq("gerant_id", gerantId);

      // Supprimer le compte gérant
      const { error } = await supabase
        .from("compte")
        .delete()
        .eq("id", gerantId)
        .eq("role", "Gerant");

      if (error) {
        throw new Error(`Erreur lors de la suppression du gérant: ${error.message}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Une erreur inattendue s'est produite lors de la suppression du gérant");
    }
  }

  /**
   * Récupère les statistiques des gérants
   * @returns Promise<{total: number, avecRestaurant: number, sansRestaurant: number}>
   */
  static async getGerantStats(): Promise<{
    total: number;
    avecRestaurant: number;
    sansRestaurant: number;
  }> {
    try {
      const gerants = await this.getAllGerants();
      
      return {
        total: gerants.length,
        avecRestaurant: gerants.filter(g => g.restaurant).length,
        sansRestaurant: gerants.filter(g => !g.restaurant).length,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Une erreur inattendue s'est produite lors du calcul des statistiques");
    }
  }
}
