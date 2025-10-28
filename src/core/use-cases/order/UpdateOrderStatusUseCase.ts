/**
 * Use Case: Mettre à jour le statut d'une commande
 */

import { IOrderRepository } from '../../interfaces/IOrderRepository';
import { Order, OrderStatus } from '../../entities/Order';
import { User } from '../../entities/User';

export class UpdateOrderStatusUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(user: User, orderId: number, newStatus: OrderStatus): Promise<Order> {
    // Vérification des permissions
    if (!user.canManageOrders()) {
      throw new Error('Vous n\'avez pas les permissions pour modifier une commande');
    }

    // Récupérer la commande
    const order = await this.orderRepository.getById(orderId);
    if (!order) {
      throw new Error('Commande non trouvée');
    }

    // Valider la transition de statut selon la logique métier
    this.validateStatusTransition(order, newStatus);

    // Mettre à jour le statut
    const updatedOrder = await this.orderRepository.updateStatus(orderId, newStatus);
    
    return updatedOrder;
  }

  private validateStatusTransition(order: Order, newStatus: OrderStatus): void {
    const currentStatus = order.status;

    // Définir les transitions valides
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.EN_ATTENTE]: [OrderStatus.EN_PREPARATION, OrderStatus.ANNULEE],
      [OrderStatus.EN_PREPARATION]: [OrderStatus.PRETE, OrderStatus.ANNULEE],
      [OrderStatus.PRETE]: [OrderStatus.RETIREE],
      [OrderStatus.RETIREE]: [],
      [OrderStatus.ANNULEE]: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new Error(
        `Transition invalide : impossible de passer de "${currentStatus}" à "${newStatus}"`
      );
    }
  }
}
