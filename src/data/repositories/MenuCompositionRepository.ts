import { IMenuCompositionRepository } from '@/core/interfaces/IMenuCompositionRepository';
import {
  MenuPlatDTO,
  MenuWithDishesDTO,
  AddDishToMenuDTO,
  UpdateMenuPlatDTO,
} from '@/core/entities/MenuComposition';
import { supabase } from '@/lib/supabaseClient';

/**
 * Repository pour la gestion de la composition des menus
 * Gère la table de liaison menu_plat
 */
export class MenuCompositionRepository implements IMenuCompositionRepository {
  private readonly tableName = 'menu_plat';
  private readonly menuTable = 'menu';
  private readonly platTable = 'plat';

  async getMenuWithDishes(menuId: string): Promise<MenuWithDishesDTO | null> {
    // Récupérer le menu
    const { data: menu, error: menuError } = await supabase
      .from(this.menuTable)
      .select('*')
      .eq('id', menuId)
      .single();

    if (menuError || !menu) {
      if (menuError?.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch menu: ${menuError?.message}`);
    }

    // Récupérer les plats du menu avec leurs détails
    const { data: menuPlats, error: platsError } = await supabase
      .from(this.tableName)
      .select(`
        *,
        plat:plat_id (*)
      `)
      .eq('menu_id', menuId)
      .order('ordre', { ascending: true });

    if (platsError) {
      throw new Error(`Failed to fetch menu dishes: ${platsError.message}`);
    }

    return {
      ...menu,
      plats: menuPlats || [],
    };
  }

  async getMenusWithDishesByRestaurant(restaurantId: string): Promise<MenuWithDishesDTO[]> {
    // Récupérer tous les menus du restaurant
    const { data: menus, error: menusError } = await supabase
      .from(this.menuTable)
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (menusError) {
      throw new Error(`Failed to fetch menus: ${menusError.message}`);
    }

    if (!menus || menus.length === 0) {
      return [];
    }

    // Récupérer les plats pour tous les menus
    const menuIds = menus.map(m => m.id);
    const { data: menuPlats, error: platsError } = await supabase
      .from(this.tableName)
      .select(`
        *,
        plat:plat_id (*)
      `)
      .in('menu_id', menuIds)
      .order('ordre', { ascending: true });

    if (platsError) {
      throw new Error(`Failed to fetch menu dishes: ${platsError.message}`);
    }

    // Grouper les plats par menu
    const platsByMenu = (menuPlats || []).reduce((acc, mp) => {
      if (!acc[mp.menu_id]) acc[mp.menu_id] = [];
      acc[mp.menu_id].push(mp);
      return acc;
    }, {} as Record<string, MenuPlatDTO[]>);

    // Combiner menus et plats
    return menus.map(menu => ({
      ...menu,
      plats: platsByMenu[menu.id] || [],
    }));
  }

  async getMenuDishes(menuId: string): Promise<MenuPlatDTO[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        plat:plat_id (*)
      `)
      .eq('menu_id', menuId)
      .order('ordre', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch menu dishes: ${error.message}`);
    }

    return data || [];
  }

  async addDishToMenu(data: AddDishToMenuDTO): Promise<MenuPlatDTO> {
    const { data: result, error } = await supabase
      .from(this.tableName)
      .insert({
        menu_id: data.menu_id,
        plat_id: data.plat_id,
        quantite: data.quantite || 1,
        ordre: data.ordre || 0,
      })
      .select(`
        *,
        plat:plat_id (*)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to add dish to menu: ${error.message}`);
    }

    return result;
  }

  async updateMenuDish(id: string, data: UpdateMenuPlatDTO): Promise<MenuPlatDTO> {
    const { data: result, error } = await supabase
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select(`
        *,
        plat:plat_id (*)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to update menu dish: ${error.message}`);
    }

    return result;
  }

  async removeDishFromMenu(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to remove dish from menu: ${error.message}`);
    }
  }

  async clearMenuDishes(menuId: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('menu_id', menuId);

    if (error) {
      throw new Error(`Failed to clear menu dishes: ${error.message}`);
    }
  }

  async isDishInMenu(menuId: string, platId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('id')
      .eq('menu_id', menuId)
      .eq('plat_id', platId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to check dish in menu: ${error.message}`);
    }

    return !!data;
  }

  async calculateMenuTotalPrice(menuId: string): Promise<number> {
    const { data, error } = await supabase.rpc('calculate_menu_total_price', {
      menu_uuid: menuId,
    });

    if (error) {
      // Si la fonction n'existe pas, calculer manuellement
      const dishes = await this.getMenuDishes(menuId);
      return dishes.reduce((total, mp) => {
        const prix = mp.plat?.prix || 0;
        return total + (prix * mp.quantite);
      }, 0);
    }

    return data || 0;
  }
}
