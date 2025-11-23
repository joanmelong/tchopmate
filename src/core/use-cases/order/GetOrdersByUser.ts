// src/core/use-cases/order/GetOrdersByUser.ts
import { IOrderRepository } from '@/core/interfaces/IOrderRepository'
import { OrderDTO, OrderStatus } from '@/core/entities/Order'

interface Filters {
  status?: OrderStatus
}

export default class GetOrdersByUser {
  constructor(private readonly orderRepo: IOrderRepository) {}

  async execute(userId: string, filters?: Filters): Promise<OrderDTO[]> {
    const orders = await this.orderRepo.findByUserId(userId)

    if (!filters?.status) return orders

    return orders.filter(order => order.statut === filters.status)
  }
}