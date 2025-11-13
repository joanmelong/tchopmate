import { MenuManagementRepository } from '@/data/repositories/MenuManagementRepository';
import { GetMenusByRestaurant } from '@/core/use-cases/menu/GetMenusByRestaurant';
import { CreateMenu } from '@/core/use-cases/menu/CreateMenu';
import { UpdateMenu } from '@/core/use-cases/menu/UpdateMenu';
import { DeleteMenu } from '@/core/use-cases/menu/DeleteMenu';
import { MenuDTO, CreateMenuDTO, UpdateMenuDTO } from '@/core/entities/Menu';

/**
 * MenuService - Service façade pour la gestion des menus
 * Point d'entrée pour l'UI
 */
export class MenuService {
  private repository = new MenuManagementRepository();
  
  private getMenusByRestaurantUseCase = new GetMenusByRestaurant(this.repository);
  private createMenuUseCase = new CreateMenu(this.repository);
  private updateMenuUseCase = new UpdateMenu(this.repository);
  private deleteMenuUseCase = new DeleteMenu(this.repository);

  async getMenusByRestaurant(restaurantId: number): Promise<MenuDTO[]> {
    return this.getMenusByRestaurantUseCase.execute(restaurantId);
  }

  async getMenuById(id: string): Promise<MenuDTO | null> {
    return this.repository.getMenuById(id);
  }

  async createMenu(data: CreateMenuDTO): Promise<MenuDTO> {
    return this.createMenuUseCase.execute(data);
  }

  async updateMenu(id: string, data: UpdateMenuDTO): Promise<MenuDTO> {
    return this.updateMenuUseCase.execute(id, data);
  }

  async deleteMenu(id: string): Promise<void> {
    return this.deleteMenuUseCase.execute(id);
  }

  async toggleAvailability(id: string, disponible: boolean): Promise<MenuDTO> {
    return this.repository.toggleMenuAvailability(id, disponible);
  }
}

// Instance singleton pour utilisation dans l'app
export const menuService = new MenuService();
