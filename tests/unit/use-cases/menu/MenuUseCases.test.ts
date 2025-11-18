import { GetMenusByRestaurant } from '@/core/use-cases/menu/GetMenusByRestaurant'
import { CreateMenu } from '@/core/use-cases/menu/CreateMenu'
import { UpdateMenu } from '@/core/use-cases/menu/UpdateMenu'
import { DeleteMenu } from '@/core/use-cases/menu/DeleteMenu'
import { IMenuManagementRepository } from '@/core/interfaces/IMenuRepository'
import { MenuDTO, CreateMenuDTO, UpdateMenuDTO } from '@/core/entities/Menu'

class MockMenuRepo implements IMenuManagementRepository {
  public menus: MenuDTO[] = []
  public deletedId: string | null = null

  async getMenusByRestaurantId(restaurantId: string): Promise<MenuDTO[]> {
    return this.menus.filter((m) => m.restaurant_id === restaurantId)
  }
  async getMenuById(id: string): Promise<MenuDTO | null> {
    return this.menus.find((m) => m.id === id) ?? null
  }
  async createMenu(data: CreateMenuDTO): Promise<MenuDTO> {
    const menu: MenuDTO = {
      id: `menu-${Math.random()}`,
      restaurant_id: data.restaurant_id,
      nom: data.nom,
      description: data.description,
      prix: data.prix,
      image_url: data.image_url,
      disponible: data.disponible ?? true,
      created_at: new Date(),
      updated_at: new Date(),
    }
    this.menus.push(menu)
    return menu
  }
  async updateMenu(id: string, data: UpdateMenuDTO): Promise<MenuDTO> {
    const idx = this.menus.findIndex((m) => m.id === id)
    if (idx === -1) throw new Error('Not found')
    const updated = { ...this.menus[idx], ...data, updated_at: new Date() }
    this.menus[idx] = updated
    return updated
  }
  async deleteMenu(id: string): Promise<void> {
    this.deletedId = id
    this.menus = this.menus.filter((m) => m.id !== id)
  }
  async toggleMenuAvailability(id: string, disponible: boolean): Promise<MenuDTO> {
    const menu = await this.getMenuById(id)
    if (!menu) throw new Error('Not found')
    menu.disponible = disponible
    menu.updated_at = new Date()
    return menu
  }
}

describe('Menu Use Cases', () => {
  let repo: MockMenuRepo

  beforeEach(() => {
    repo = new MockMenuRepo()
    repo.menus = [
      {
        id: 'm1',
        restaurant_id: 'resto-uuid-1',
        nom: 'Menu Test',
        description: 'Desc menu',
        prix: 15,
        image_url: undefined,
        disponible: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]
  })

  test('GetMenusByRestaurant returns menus', async () => {
    const useCase = new GetMenusByRestaurant(repo as unknown as IMenuManagementRepository)
    const result = await useCase.execute('resto-uuid-1')
    expect(result).toHaveLength(1)
    expect(result[0].nom).toBe('Menu Test')
  })

  test('CreateMenu validates and creates', async () => {
    const useCase = new CreateMenu(repo as unknown as IMenuManagementRepository)
    await expect(useCase.execute({} as any)).rejects.toThrow()

    await expect(useCase.execute({ restaurant_id: 'r', nom: '' } as any)).rejects.toThrow()

    const created = await useCase.execute({ restaurant_id: 'resto-uuid-1', nom: 'Nouveau' } as CreateMenuDTO)
    expect(created).toBeDefined()
    expect(created.nom).toBe('Nouveau')
  })

  test('UpdateMenu validates and updates', async () => {
    const useCase = new UpdateMenu(repo as unknown as IMenuManagementRepository)
    await expect(useCase.execute('', {} as any)).rejects.toThrow('Menu ID is required')
    await expect(useCase.execute('nope', {} as UpdateMenuDTO)).rejects.toThrow('Menu not found')

    const updated = await useCase.execute('m1', { nom: 'Updated' } as UpdateMenuDTO)
    expect(updated.nom).toBe('Updated')
  })

  test('DeleteMenu validates and deletes', async () => {
    const useCase = new DeleteMenu(repo as unknown as IMenuManagementRepository)
    await expect(useCase.execute('')).rejects.toThrow('Menu ID is required')

    await useCase.execute('m1')
    expect(repo.deletedId).toBe('m1')
    expect(repo.menus).toHaveLength(0)
  })
})
