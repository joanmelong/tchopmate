import { DishManagementRepository } from '@/data/repositories/DishManagementRepository';
import { GetDishesByRestaurant } from '@/core/use-cases/dish/GetDishesByRestaurant';
import { CreateDish } from '@/core/use-cases/dish/CreateDish';
import { UpdateDish } from '@/core/use-cases/dish/UpdateDish';
import { DeleteDish } from '@/core/use-cases/dish/DeleteDish';
import { DishDTO, CreateDishDTO, UpdateDishDTO } from '@/core/entities/Dish';

/**
 * DishService - Service façade pour la gestion des plats
 * Point d'entrée pour l'UI
 */
export class DishService {
  private repository = new DishManagementRepository();
  
  private getDishesByRestaurantUseCase = new GetDishesByRestaurant(this.repository);
  private createDishUseCase = new CreateDish(this.repository);
  private updateDishUseCase = new UpdateDish(this.repository);
  private deleteDishUseCase = new DeleteDish(this.repository);

  async getDishesByRestaurant(restaurantId: string): Promise<DishDTO[]> {
    return this.getDishesByRestaurantUseCase.execute(restaurantId);
  }

  async getDishesByCategory(restaurantId: string, category: string): Promise<DishDTO[]> {
    return this.repository.getDishesByCategory(restaurantId, category);
  }

  async getDishById(id: string): Promise<DishDTO | null> {
    return this.repository.getDishById(id);
  }

  async createDish(data: CreateDishDTO): Promise<DishDTO> {
    return this.createDishUseCase.execute(data);
  }

  async updateDish(id: string, data: UpdateDishDTO): Promise<DishDTO> {
    return this.updateDishUseCase.execute(id, data);
  }

  async deleteDish(id: string): Promise<void> {
    return this.deleteDishUseCase.execute(id);
  }

  async toggleAvailability(id: string, disponible: boolean): Promise<DishDTO> {
    return this.repository.toggleDishAvailability(id, disponible);
  }
}

// Instance singleton pour utilisation dans l'app
export const dishService = new DishService();
