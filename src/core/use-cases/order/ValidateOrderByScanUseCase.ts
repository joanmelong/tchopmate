/**
 * Use Case: Valider une commande lorsque le gérant scanne le QR code
 * Couche: Core (Logique métier)
 */

import { IOrderRepository } from '@/core/interfaces/IOrderRepository';
import { OrderStatus } from '@/core/entities/Order';

export class ValidateOrderByScanUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  /**
   * Valide une commande identifiée par son ID extrait du QR code.
   * Règle: seule une commande en `EN_ATTENTE` peut être validée via scan.
   */
  async execute(orderId: number, validatedBy?: number): Promise<void> {
    const order = await this.orderRepository.getById(orderId);
    if (!order) {
      throw new Error('Commande introuvable');
    }

    if (order.status !== OrderStatus.EN_ATTENTE) {
      throw new Error('La commande ne peut pas être validée (statut invalide)');
    }

    // Mettre à jour le statut : on considère "validée" => EN_PREPARATION
    await this.orderRepository.updateStatus(orderId, OrderStatus.EN_PREPARATION);

    // Optionnel : on pourrait enregistrer qui a validé (validatedBy) si la BD le supporte
  }
}
