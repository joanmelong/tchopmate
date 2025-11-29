/**
 * Implémentation Supabase du repository Dish
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { IDishRepository } from '@/core/interfaces/IDishRepository';
import { IAnalyticsRepository, PopularDishData } from '@/core/interfaces/IAnalyticsRepository';
import { DishDTO, CreateDishDTO, UpdateDishDTO } from '@/core/entities/Dish';
import { createClient } from '@supabase/supabase-js';

export class SupabaseDishRepository implements IDishRepository, IAnalyticsRepository {
  private supabase: SupabaseClient;

  constructor(supabase?: SupabaseClient) {
    this.supabase = supabase || this.createSupabaseClient();
  }

  private createSupabaseClient(): SupabaseClient {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    return createClient(supabaseUrl, supabaseKey);
  }

  async getDishesByRestaurantId(restaurantId: string): Promise<DishDTO[]> {
    try {
      // Étape 1: Trouver le restaurant du gérant (restaurantId est en fait le gerantId)
      const { data: restaurant, error: errorRestaurant } = await this.supabase
        .from("restaurant")
        .select("id_restaurant")
        .eq("gerant_id", restaurantId)
        .single();

      if (errorRestaurant || !restaurant) {
        console.error("Restaurant non trouvé pour le gérant", restaurantId, errorRestaurant);
        return [];
      }

      const realRestaurantId = restaurant.id_restaurant;

      // Étape 2: Récupérer les plats du restaurant
      const { data, error } = await this.supabase
        .from('plat')
        .select('*')
        .eq('restaurant_id', realRestaurantId)
        .eq('disponible', true)
        .order('nom');

      if (error || !data) {
        return [];
      }

      return data.map(item => this.mapToDishDTO(item));
    } catch (error) {
      console.error("Erreur dans getDishesByRestaurantId:", error);
      return [];
    }
  }

  async getDishesByCategory(restaurantId: string, category: string): Promise<DishDTO[]> {
    const { data, error } = await this.supabase
      .from('plat')
      .select('*')
      .eq('restaurant_id', parseInt(restaurantId))
      .eq('categorie', category)
      .eq('disponible', true)
      .order('nom');

    if (error || !data) {
      return [];
    }

    return data.map(item => this.mapToDishDTO(item));
  }

  async getDishById(id: string): Promise<DishDTO | null> {
    const { data, error } = await this.supabase
      .from('plat')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapToDishDTO(data);
  }

  async createDish(dishData: CreateDishDTO): Promise<DishDTO> {
    const { data, error } = await this.supabase
      .from('plat')
      .insert({
        restaurant_id: parseInt(dishData.restaurant_id),
        nom: dishData.nom,
        description: dishData.description,
        prix: dishData.prix,
        categorie: dishData.categorie,
        image_url: dishData.image_url,
        disponible: dishData.disponible ?? true,
        temps_preparation: dishData.temps_preparation,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error('Erreur lors de la création du plat');
    }

    return this.mapToDishDTO(data);
  }

  async updateDish(id: string, updateData: UpdateDishDTO): Promise<DishDTO> {
    const { data, error } = await this.supabase
      .from('plat')
      .update({
        nom: updateData.nom,
        description: updateData.description,
        prix: updateData.prix,
        categorie: updateData.categorie,
        image_url: updateData.image_url,
        disponible: updateData.disponible,
        temps_preparation: updateData.temps_preparation,
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new Error('Erreur lors de la mise à jour du plat');
    }

    return this.mapToDishDTO(data);
  }

  async deleteDish(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('plat')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error('Erreur lors de la suppression du plat');
    }
  }

  async toggleDishAvailability(id: string, disponible: boolean): Promise<DishDTO> {
    const { data, error } = await this.supabase
      .from('plat')
      .update({ disponible })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new Error('Erreur lors de la mise à jour de la disponibilité');
    }

    return this.mapToDishDTO(data);
  }

  // Méthode pour les statistiques (interface IAnalyticsRepository)
  async getPopularDishes(restaurantId: string, limit: number = 5): Promise<PopularDishData[]> {
    try {
      // Étape 1: Trouver le restaurant du gérant (restaurantId est en fait le gerantId)
      const { data: restaurant, error: errorRestaurant } = await this.supabase
        .from("restaurant")
        .select("id_restaurant")
        .eq("gerant_id", restaurantId)
        .single();

      if (errorRestaurant || !restaurant) {
        console.error("Restaurant non trouvé pour le gérant", restaurantId, errorRestaurant);
        return [];
      }

      const realRestaurantId = restaurant.id_restaurant;

      // Cette requête nécessite une jointure complexe avec les commandes
      // Pour l'instant, on retourne les plats les plus récents
      const { data, error } = await this.supabase
        .from('plat')
        .select('id, nom, image_url')
        .eq('restaurant_id', realRestaurantId)
        .eq('disponible', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error || !data) {
        return [];
      }

      return data.map(item => ({
        dish: {
          id: item.id,
          nom: item.nom,
          image_url: item.image_url,
        },
        orderCount: Math.floor(Math.random() * 50) + 10, // Simulation pour l'instant
        revenue: Math.floor(Math.random() * 100000) + 50000, // Simulation pour l'instant
      }));
    } catch (error) {
      console.error("Erreur dans getPopularDishes:", error);
      return [];
    }
  }

  private mapToDishDTO(data: { id: number; nom: string; description?: string; prix: number; image_url?: string; disponible: boolean; restaurant_id: string; categorie?: string; temps_preparation?: number; created_at?: string; updated_at?: string }): DishDTO {
    return {
      id: String(data.id),
      restaurant_id: data.restaurant_id.toString(),
      nom: data.nom,
      description: data.description,
      prix: data.prix,
      categorie: data.categorie || 'plat',
      image_url: data.image_url,
      disponible: data.disponible ?? true,
      temps_preparation: data.temps_preparation,
      created_at: data.created_at ? new Date(data.created_at) : new Date(),
      updated_at: data.updated_at ? new Date(data.updated_at) : new Date(),
    };
  }
}