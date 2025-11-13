import { IDishManagementRepository } from '@/core/interfaces/IMenuRepository';
import { DishDTO, CreateDishDTO, UpdateDishDTO } from '@/core/entities/Dish';
import { supabase } from '@/lib/supabaseClient';

/**
 * DishManagementRepository - Implémentation Supabase du repository de plats
 * Couche Data - gère la persistance des données
 */
export class DishManagementRepository implements IDishManagementRepository {
  private readonly tableName = 'plat';

  async getDishesByRestaurantId(restaurantId: string): Promise<DishDTO[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('categorie', { ascending: true })
      .order('nom', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch dishes: ${error.message}`);
    }

    return data || [];
  }

  async getDishesByCategory(restaurantId: string, category: string): Promise<DishDTO[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('categorie', category)
      .order('nom', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch dishes by category: ${error.message}`);
    }

    return data || [];
  }

  async getDishById(id: string): Promise<DishDTO | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch dish: ${error.message}`);
    }

    return data;
  }

  async createDish(dishData: CreateDishDTO): Promise<DishDTO> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert({
        ...dishData,
        disponible: dishData.disponible ?? true,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create dish: ${error.message}`);
    }

    return data;
  }

  async updateDish(id: string, dishData: UpdateDishDTO): Promise<DishDTO> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({
        ...dishData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update dish: ${error.message}`);
    }

    return data;
  }

  async deleteDish(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete dish: ${error.message}`);
    }
  }

  async toggleDishAvailability(id: string, disponible: boolean): Promise<DishDTO> {
    return this.updateDish(id, { disponible });
  }
}
