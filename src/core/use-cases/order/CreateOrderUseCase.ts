/**
 * Use Case: Créer une commande
 */

import { IOrderRepository, CreateOrderData } from '../../interfaces/IOrderRepository';
import { IPlatRepository } from '../../interfaces/IMenuRepository';
import { Order } from '../../entities/Order';
import { User } from '../../entities/User';

export class CreateOrderUseCase {
  constructor(
    private orderRepository: IOrderRepository,
    private platRepository: IPlatRepository
  ) {}

  async execute(student: User, data: Omit<CreateOrderData, 'studentId'>): Promise<Order> {
    // Vérification des permissions
    if (!student.isStudent()) {
      throw new Error('Seuls les étudiants peuvent passer des commandes');
    }

    // Validation
    if (!data.items || data.items.length === 0) {
      throw new Error('La commande doit contenir au moins un plat');
    }

    // Vérifier que tous les plats existent et sont disponibles
    for (const item of data.items) {
      const plat = await this.platRepository.getById(item.platId);
      
      if (!plat) {
        throw new Error(`Le plat ${item.platId} n'existe pas`);
      }

      if (!plat.isAvailable()) {
        throw new Error(`Le plat "${plat.nom}" n'est pas disponible`);
      }

      if (item.quantite <= 0) {
        throw new Error('La quantité doit être supérieure à 0');
      }
    }

    // Créer la commande
    const order = await this.orderRepository.create({
      ...data,
      studentId: student.id,
    });

    return order;
  }
}
