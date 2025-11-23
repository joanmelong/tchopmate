// src/core/use-cases/order/CreateOrder.ts
import { IOrderRepository } from '@/core/interfaces/IOrderRepository'
import { CreateOrderDTO, OrderDTO } from '@/core/entities/Order'

export default class CreateOrder {
  constructor(private readonly orderRepo: IOrderRepository) {}

  async execute(data: CreateOrderDTO): Promise<OrderDTO> {
    // Le mock fait déjà toutes les validations → on appelle simplement le repo
    // En vrai projet tu ferais les validations ici ou dans un service séparé
    return await this.orderRepo.create(data)
  }
}