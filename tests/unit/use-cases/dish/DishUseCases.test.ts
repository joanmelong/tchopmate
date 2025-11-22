import { GetDishesByRestaurant } from '@/core/use-cases/dish/GetDishesByRestaurant'
import { CreateDish } from '@/core/use-cases/dish/CreateDish'
import { UpdateDish } from '@/core/use-cases/dish/UpdateDish'
import { DeleteDish } from '@/core/use-cases/dish/DeleteDish'
import { IDishManagementRepository } from '@/core/interfaces/IMenuRepository'
import { DishDTO, CreateDishDTO, UpdateDishDTO } from '@/core/entities/Dish'

// Mock repository implementing only the methods used by tests
class MockDishRepo implements IDishManagementRepository {
  public dishes: DishDTO[] = []
  public deleteCalledWith: string | null = null

  async getDishesByRestaurantId(restaurantId: string): Promise<DishDTO[]> {
    return this.dishes.filter((d) => d.restaurant_id === restaurantId)
  }
  async getDishesByCategory(restaurantId: string, category: string): Promise<DishDTO[]> {
    return this.dishes.filter((d) => d.restaurant_id === restaurantId && d.categorie === category)
  }
  async getDishById(id: string): Promise<DishDTO | null> {
    return this.dishes.find((d) => d.id === id) ?? null
  }
  async createDish(data: CreateDishDTO): Promise<DishDTO> {
    const newDish: DishDTO = {
      id: `dish-${Math.random()}`,
      restaurant_id: data.restaurant_id,
      nom: data.nom,
      description: data.description,
      prix: data.prix,
      categorie: data.categorie,
      image_url: data.image_url,
      disponible: data.disponible ?? true,
      temps_preparation: data.temps_preparation,
      created_at: new Date(),
      updated_at: new Date(),
    }
    this.dishes.push(newDish)
    return newDish
  }
  async updateDish(id: string, data: UpdateDishDTO): Promise<DishDTO> {
    const idx = this.dishes.findIndex((d) => d.id === id)
    if (idx === -1) throw new Error('Not found')
    const existing = this.dishes[idx]
    const updated = { ...existing, ...data, updated_at: new Date() }
    this.dishes[idx] = updated
    return updated
  }
  async deleteDish(id: string): Promise<void> {
    this.deleteCalledWith = id
    this.dishes = this.dishes.filter((d) => d.id !== id)
  }
  async toggleDishAvailability(id: string, disponible: boolean): Promise<DishDTO> {
    const dish = await this.getDishById(id)
    if (!dish) throw new Error('Not found')
    dish.disponible = disponible
    dish.updated_at = new Date()
    return dish
  }
}

describe('Dish Use Cases', () => {
  let repo: MockDishRepo

  beforeEach(() => {
    repo = new MockDishRepo()
    // Seed with one dish
    repo.dishes = [
      {
        id: 'd1',
        restaurant_id: 'resto-uuid-1',
        nom: 'Plat Test',
        description: 'Desc',
        prix: 9.5,
        categorie: 'salade',
        image_url: undefined,
        disponible: true,
        temps_preparation: 10,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]
  })

  test('GetDishesByRestaurant returns dishes for restaurant', async () => {
    const useCase = new GetDishesByRestaurant(repo as unknown as IDishManagementRepository)
    const result = await useCase.execute('resto-uuid-1')
    expect(result).toHaveLength(1)
    expect(result[0].nom).toBe('Plat Test')
  })

  test('GetDishesByRestaurant throws if restaurantId missing', async () => {
    const useCase = new GetDishesByRestaurant(repo as unknown as IDishManagementRepository)
    await expect(useCase.execute('')).rejects.toThrow('Restaurant ID is required')
  })

  test('CreateDish validates required fields and creates', async () => {
    const useCase = new CreateDish(repo as unknown as IDishManagementRepository)

    // Missing fields
    await expect(useCase.execute({} as any)).rejects.toThrow()

    // Negative price
    await expect(
      useCase.execute({ restaurant_id: 'r', nom: 'N', prix: -1, categorie: 'c' } as CreateDishDTO)
    ).rejects.toThrow('Le prix ne peut pas être négatif')

    // Valid create
    const created = await useCase.execute({ restaurant_id: 'resto-uuid-1', nom: 'Nouveau', prix: 5, categorie: 'c' })
    expect(created).toBeDefined()
    expect(created.nom).toBe('Nouveau')
  })

  test('UpdateDish validates and updates existing dish', async () => {
    const useCase = new UpdateDish(repo as unknown as IDishManagementRepository)

    // Missing id
    await expect(useCase.execute('', {} as any)).rejects.toThrow('Dish ID is required')

    // Not found
    await expect(useCase.execute('nope', { nom: 'X' } as UpdateDishDTO)).rejects.toThrow('Dish not found')

    const updated = await useCase.execute('d1', { prix: 12 } as UpdateDishDTO)
    expect(updated.prix).toBe(12)
  })

  test('DeleteDish validates and deletes', async () => {
    const useCase = new DeleteDish(repo as unknown as IDishManagementRepository)

    await expect(useCase.execute('')).rejects.toThrow('Dish ID is required')

    // Delete existing
    await useCase.execute('d1')
    expect(repo.deleteCalledWith).toBe('d1')
    expect(repo.dishes).toHaveLength(0)
  })
})
