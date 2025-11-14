/**
 * Use Case: Générer un QR Code pour une commande
 * Couche: Core (Logique métier)
 */

import { Order } from '../../entities/Order';

export interface IQRCodeGenerator {
  generate(data: string): Promise<string>;
}

export class GenerateOrderQRCodeUseCase {
  constructor(private qrCodeGenerator: IQRCodeGenerator) {}

  async execute(order: Order): Promise<string> {
    // Validation métier
    if (order.isCancelled()) {
      throw new Error('Impossible de générer un QR code pour une commande annulée');
    }

    // Données à encoder dans le QR code
    const qrData = JSON.stringify({
      orderId: order.id,
      restaurantId: order.restaurantId,
      studentId: order.studentId,
      totalPrice: order.totalPrice,
      status: order.status,
      timestamp: order.createdAt.toISOString(),
    });

    // Génération du QR code
    const qrCodeDataUrl = await this.qrCodeGenerator.generate(qrData);

    return qrCodeDataUrl;
  }
}
