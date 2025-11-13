import { IMenuManagementRepository } from '@/core/interfaces/IMenuRepository';
import { MenuDTO, CreateMenuDTO, UpdateMenuDTO } from '@/core/entities/Menu';
import { supabase } from '@/lib/supabaseClient';

/**
 * MenuManagementRepository - Implémentation Supabase du repository de menus
 * Couche Data - gère la persistance des données
 */
export class MenuManagementRepository implements IMenuManagementRepository {
  private readonly tableName = 'menu';

  async getMenusByRestaurantId(restaurantId: number): Promise<MenuDTO[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch menus: ${error.message}`);
    }

    return data || [];
  }

  async getMenuById(id: string): Promise<MenuDTO | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch menu: ${error.message}`);
    }

    return data;
  }

  async createMenu(menuData: CreateMenuDTO): Promise<MenuDTO> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert({
        ...menuData,
        disponible: menuData.disponible ?? true,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create menu: ${error.message}`);
    }

    return data;
  }

  async updateMenu(id: string, menuData: UpdateMenuDTO): Promise<MenuDTO> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({
        ...menuData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update menu: ${error.message}`);
    }

    return data;
  }

  async deleteMenu(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete menu: ${error.message}`);
    }
  }

  async toggleMenuAvailability(id: string, disponible: boolean): Promise<MenuDTO> {
    return this.updateMenu(id, { disponible });
  }
}
