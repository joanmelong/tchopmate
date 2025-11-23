// ============================================
// TEST 2 : Order Use Cases
// ============================================
// File: tests/unit/use-cases/order/OrderUseCases.test.ts

import GetOrdersByUser from '@/core/use-cases/order/GetOrdersByUser'
import CreateOrder from '@/core/use-cases/order/CreateOrder'
import UpdateOrderStatus from '@/core/use-cases/order/UpdateOrderStatus'
import { OrderDTO, CreateOrderDTO } from '@/core/entities/Order'

// Mock Order Repository
class MockOrderRepo {
  public orders: any[] = []
  public dishes: any[] = []
  public timeSlots: any[] = []

  async create(data: CreateOrderDTO): Promise<OrderDTO> {
    // Vérifier disponibilité du plat
    const dish = this.dishes.find(d => d.id === data.dish_id)
    if (!dish) throw new Error('Dish not found')
    if (!dish.disponible) throw new Error('Dish is not available')

    // Vérifier disponibilité du créneau
    const slot = this.timeSlots.find(s => s.id === data.time_slot_id)
    if (!slot) throw new Error('Time slot not found')
    if (slot.current_capacity >= slot.max_capacity) {
      throw new Error('Time slot is full')
    }

    // Vérifier que le créneau n'est pas dans le passé
    const now = new Date()
    const [hours, minutes] = slot.start_time.split(':')
    const slotTime = new Date()
    slotTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
    
    if (slotTime < now) {
      throw new Error('Cannot order for past time slots')
    }

    // Valider la quantité
    if (!data.quantity || data.quantity < 1) {
      throw new Error('Quantity must be at least 1')
    }

    const newOrder: OrderDTO = {
      id: `order-${Math.random()}`,
      user_id: data.user_id,
      dish_id: data.dish_id,
      dish_name: dish.nom,
      time_slot_id: data.time_slot_id,
      time_slot: `${slot.start_time}-${slot.end_time}`,
      quantity: data.quantity,
      prix_total: dish.prix * data.quantity,
      statut: 'En attente',
      notes: data.notes,
      created_at: new Date(),
      updated_at: new Date()
    }

    this.orders.push(newOrder)
    
    // Décrémenter la capacité du créneau
    slot.current_capacity += data.quantity

    return newOrder
  }

  async findById(id: string): Promise<OrderDTO | null> {
    return this.orders.find(o => o.id === id) || null
  }

  async findByUserId(userId: string): Promise<OrderDTO[]> {
    return this.orders.filter(o => o.user_id === userId)
  }

  async update(id: string, data: Partial<OrderDTO>): Promise<OrderDTO> {
    const idx = this.orders.findIndex(o => o.id === id)
    if (idx === -1) throw new Error('Order not found')
    
    this.orders[idx] = { ...this.orders[idx], ...data, updated_at: new Date() }
    return this.orders[idx]
  }
}

describe('Order Use Cases', () => {
  let repo: MockOrderRepo

  beforeEach(() => {
    repo = new MockOrderRepo()
    
    // Plats de test
    repo.dishes = [
      {
        id: 'dish1',
        nom: 'Ndolé',
        prix: 1500,
        disponible: true
      },
      {
        id: 'dish2',
        nom: 'Poulet DG',
        prix: 2000,
        disponible: false // Indisponible
      }
    ]

    // Créneaux horaires
    repo.timeSlots = [
      {
        id: 'slot1',
        start_time: '12:00',
        end_time: '12:15',
        max_capacity: 10,
        current_capacity: 3
      },
      {
        id: 'slot2',
        start_time: '12:15',
        end_time: '12:30',
        max_capacity: 5,
        current_capacity: 5 // Complet
      }
    ]
  })

  // ========== CreateOrder Tests ==========
  
  describe('CreateOrder', () => {
    test('should create order successfully', async () => {
      const useCase = new CreateOrder(repo)
      
      const result = await useCase.execute({
        user_id: 'u1',
        dish_id: 'dish1',
        time_slot_id: 'slot1',
        quantity: 1,
        notes: 'Sans piment'
      })

      expect(result).toBeDefined()
      expect(result.dish_name).toBe('Ndolé')
      expect(result.prix_total).toBe(1500)
      expect(result.statut).toBe('En attente')
      expect(result.time_slot).toBe('12:00-12:15')
    })

    test('should calculate total price correctly', async () => {
      const useCase = new CreateOrder(repo)
      
      const result = await useCase.execute({
        user_id: 'u1',
        dish_id: 'dish1',
        time_slot_id: 'slot1',
        quantity: 3
      })

      expect(result.prix_total).toBe(4500) // 1500 * 3
      expect(result.quantity).toBe(3)
    })

    test('should reject unavailable dish', async () => {
      const useCase = new CreateOrder(repo)
      
      await expect(useCase.execute({
        user_id: 'u1',
        dish_id: 'dish2', // Indisponible
        time_slot_id: 'slot1',
        quantity: 1
      })).rejects.toThrow('Dish is not available')
    })

    test('should reject full time slot', async () => {
      const useCase = new CreateOrder(repo)
      
      await expect(useCase.execute({
        user_id: 'u1',
        dish_id: 'dish1',
        time_slot_id: 'slot2', // Complet
        quantity: 1
      })).rejects.toThrow('Time slot is full')
    })

    test('should reject invalid quantity', async () => {
      const useCase = new CreateOrder(repo)
      
      await expect(useCase.execute({
        user_id: 'u1',
        dish_id: 'dish1',
        time_slot_id: 'slot1',
        quantity: 0
      })).rejects.toThrow('Quantity must be at least 1')

      await expect(useCase.execute({
        user_id: 'u1',
        dish_id: 'dish1',
        time_slot_id: 'slot1',
        quantity: -1
      })).rejects.toThrow('Quantity must be at least 1')
    })

    test('should reject missing required fields', async () => {
      const useCase = new CreateOrder(repo)
      
      await expect(useCase.execute({
        user_id: 'u1'
      } as any)).rejects.toThrow()
    })

    test('should decrement time slot capacity', async () => {
      const useCase = new CreateOrder(repo)
      
      const initialCapacity = repo.timeSlots[0].current_capacity
      
      await useCase.execute({
        user_id: 'u1',
        dish_id: 'dish1',
        time_slot_id: 'slot1',
        quantity: 2
      })

      expect(repo.timeSlots[0].current_capacity).toBe(initialCapacity + 2)
    })
  })

  // ========== GetOrdersByUser Tests ==========
  
  describe('GetOrdersByUser', () => {
    beforeEach(() => {
      // Ajouter des commandes de test
      repo.orders = [
        {
          id: 'order1',
          user_id: 'u1',
          dish_id: 'dish1',
          dish_name: 'Ndolé',
          time_slot_id: 'slot1',
          time_slot: '12:00-12:15',
          quantity: 1,
          prix_total: 1500,
          statut: 'En attente',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 'order2',
          user_id: 'u1',
          dish_id: 'dish1',
          dish_name: 'Ndolé',
          time_slot_id: 'slot1',
          time_slot: '12:00-12:15',
          quantity: 1,
          prix_total: 1500,
          statut: 'Retiré',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 'order3',
          user_id: 'u2',
          dish_id: 'dish1',
          dish_name: 'Ndolé',
          time_slot_id: 'slot1',
          time_slot: '12:00-12:15',
          quantity: 1,
          prix_total: 1500,
          statut: 'En attente',
          created_at: new Date(),
          updated_at: new Date()
        }
      ]
    })

    test('should return all orders for user', async () => {
      const useCase = new GetOrdersByUser(repo)
      
      const result = await useCase.execute('u1')

      expect(result).toHaveLength(2)
      expect(result.every(o => o.user_id === 'u1')).toBe(true)
    })

    test('should return empty array for user with no orders', async () => {
      const useCase = new GetOrdersByUser(repo)
      
      const result = await useCase.execute('u999')

      expect(result).toHaveLength(0)
    })

    test('should filter by status', async () => {
      const useCase = new GetOrdersByUser(repo)
      
      const result = await useCase.execute('u1', { status: 'En attente' })

      expect(result).toHaveLength(1)
      expect(result[0].statut).toBe('En attente')
    })
  })

  // ========== UpdateOrderStatus Tests ==========
  
  describe('UpdateOrderStatus', () => {
    beforeEach(() => {
      repo.orders = [
        {
          id: 'order1',
          user_id: 'u1',
          dish_id: 'dish1',
          dish_name: 'Ndolé',
          time_slot_id: 'slot1',
          time_slot: '12:00-12:15',
          quantity: 1,
          prix_total: 1500,
          statut: 'En attente',
          created_at: new Date(),
          updated_at: new Date()
        }
      ]
    })

    test('should update status from En attente to En préparation', async () => {
      const useCase = new UpdateOrderStatus(repo)
      
      const result = await useCase.execute('order1', 'En préparation')

      expect(result.statut).toBe('En préparation')
    })

    test('should update status from En préparation to Prêt', async () => {
      const useCase = new UpdateOrderStatus(repo)
      
      // Mettre d'abord en préparation
      await useCase.execute('order1', 'En préparation')
      
      // Puis mettre prêt
      const result = await useCase.execute('order1', 'Prêt')

      expect(result.statut).toBe('Prêt')
    })

    test('should update status from Prêt to Retiré', async () => {
      const useCase = new UpdateOrderStatus(repo)
      
      await useCase.execute('order1', 'En préparation')
      await useCase.execute('order1', 'Prêt')
      
      const result = await useCase.execute('order1', 'Retiré')

      expect(result.statut).toBe('Retiré')
    })

    test('should reject invalid status transition', async () => {
      const useCase = new UpdateOrderStatus(repo)
      
      // Essayer de passer directement de "En attente" à "Retiré"
      await expect(useCase.execute('order1', 'Retiré'))
        .rejects.toThrow(/transition/i)
    })

    test('should reject reverting status', async () => {
      const useCase = new UpdateOrderStatus(repo)
      
      await useCase.execute('order1', 'En préparation')
      
      // Essayer de revenir en arrière
      await expect(useCase.execute('order1', 'En attente'))
        .rejects.toThrow(/revert/i)
    })

    test('should throw for non-existent order', async () => {
      const useCase = new UpdateOrderStatus(repo)
      
      await expect(useCase.execute('invalid-id', 'Prêt'))
        .rejects.toThrow('Order not found')
    })
  })
})