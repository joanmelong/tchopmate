import { OrderDTO, CreateOrderDTO } from '../entities/Order';

export interface IOrderRepository {
  create(data: CreateOrderDTO): Promise<OrderDTO>;
  findById(id: string): Promise<OrderDTO | null>;
  findByUserId(userId: string): Promise<OrderDTO[]>;
  update(id: string, data: Partial<OrderDTO>): Promise<OrderDTO>;
}