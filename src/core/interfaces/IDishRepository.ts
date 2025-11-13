import { DishDTO, CreateDishDTO, UpdateDishDTO } from '../entities/Dish';

/**
 * IDishRepository - Interface du repository pour les plats
 * Suit le principe de séparation des interfaces (ISP)
 */
export interface IDishRepository {
  getDishesByRestaurantId(restaurantId: string): Promise<DishDTO[]>;
  getDishesByCategory(restaurantId: string, category: string): Promise<DishDTO[]>;
  getDishById(id: string): Promise<DishDTO | null>;
  createDish(data: CreateDishDTO): Promise<DishDTO>;
  updateDish(id: string, data: UpdateDishDTO): Promise<DishDTO>;
  deleteDish(id: string): Promise<void>;
  toggleDishAvailability(id: string, disponible: boolean): Promise<DishDTO>;
}
