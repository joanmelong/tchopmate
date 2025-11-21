/**
 * Service de gestion des commandes avec génération de QR code
 * Couche: Services (Infrastructure)
 */

import { Order, OrderStatus, OrderItem } from '@/core/entities/Order';
import { CreateOrderUseCase } from '@/core/use-cases/order/CreateOrderUseCase';
import { GenerateOrderQRCodeUseCase, IQRCodeGenerator } from '@/core/use-cases/qr-code/GenerateOrderQRCodeUseCase';
import { IOrderRepository, CreateOrderData } from '@/core/interfaces/IOrderRepository';
import { IPlatRepository } from '@/core/interfaces/IMenuRepository';
import { User } from '@/core/entities/User';
import { QRCodeGeneratorService } from '@/lib/services/QRCodeGeneratorService';

/**
 * Service principal de gestion des commandes
 */
export class OrderService {
  private createOrderUseCase: CreateOrderUseCase;
  private generateQRCodeUseCase: GenerateOrderQRCodeUseCase;
  private qrCodeGenerator: QRCodeGeneratorService;

  constructor(
    private orderRepository: IOrderRepository,
    private platRepository: IPlatRepository
  ) {
    this.qrCodeGenerator = new QRCodeGeneratorService();
    this.createOrderUseCase = new CreateOrderUseCase(orderRepository, platRepository);
    this.generateQRCodeUseCase = new GenerateOrderQRCodeUseCase(this.qrCodeGenerator);
  }

  /**
   * Créer une nouvelle commande avec génération automatique du QR code
   */
  async createOrder(student: User, orderData: Omit<CreateOrderData, 'studentId'>): Promise<{
    order: Order;
    qrCode: string;
  }> {
    try {
      // 1. Créer la commande
      const order = await this.createOrderUseCase.execute(student, orderData);

      // 2. Générer le QR code pour la commande
      const qrCode = await this.generateQRCodeUseCase.execute(order);

      // 3. Mettre à jour la commande avec le QR code (si nécessaire)
      if (order.qrCode !== qrCode) {
        await this.orderRepository.updateQRCode(order.id, qrCode);
        // Mettre à jour l'entité localement
        order.setQRCode(qrCode);
      }

      return {
        order,
        qrCode
      };
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      throw error;
    }
  }

  /**
   * Générer ou régénérer le QR code pour une commande existante
   */
  async generateQRCodeForOrder(orderId: number): Promise<string> {
    try {
      // Récupérer la commande
      const order = await this.orderRepository.getById(orderId);
      if (!order) {
        throw new Error('Commande introuvable');
      }

      // Générer le QR code
      const qrCode = await this.generateQRCodeUseCase.execute(order);

      // Mettre à jour en base de données
      await this.orderRepository.updateQRCode(orderId, qrCode);

      return qrCode;
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error);
      throw error;
    }
  }

  /**
   * Récupérer une commande par son ID
   */
  async getOrderById(orderId: number): Promise<Order | null> {
    return await this.orderRepository.getById(orderId);
  }

  /**
   * Récupérer les commandes d'un étudiant
   */
  async getOrdersByStudentId(studentId: number): Promise<Order[]> {
    return await this.orderRepository.getByStudentId(studentId);
  }

  /**
   * Récupérer les commandes d'un restaurant
   */
  async getOrdersByRestaurantId(restaurantId: string): Promise<Order[]> {
    return await this.orderRepository.getByRestaurantId(restaurantId);
  }

  /**
   * Mettre à jour le statut d'une commande
   */
  async updateOrderStatus(orderId: number, status: OrderStatus): Promise<Order> {
    return await this.orderRepository.updateStatus(orderId, status);
  }

  /**
   * Annuler une commande
   */
  async cancelOrder(orderId: number): Promise<void> {
    // Récupérer la commande pour validation métier
    const order = await this.orderRepository.getById(orderId);
    if (!order) {
      throw new Error('Commande introuvable');
    }

    // Valider que la commande peut être annulée (logique métier)
    if (!order.canBeCancelled()) {
      throw new Error('Cette commande ne peut pas être annulée');
    }

    // Annuler la commande
    await this.orderRepository.cancel(orderId);
  }

  /**
   * Confirmer une commande (passage de EN_ATTENTE à EN_PREPARATION)
   */
  async confirmOrder(orderId: number): Promise<Order> {
    const order = await this.orderRepository.getById(orderId);
    if (!order) {
      throw new Error('Commande introuvable');
    }

    if (order.status !== OrderStatus.EN_ATTENTE) {
      throw new Error('Seules les commandes en attente peuvent être confirmées');
    }

    return await this.orderRepository.updateStatus(orderId, OrderStatus.EN_PREPARATION);
  }

  /**
   * Marquer une commande comme prête
   */
  async markOrderAsReady(orderId: number): Promise<Order> {
    const order = await this.orderRepository.getById(orderId);
    if (!order) {
      throw new Error('Commande introuvable');
    }

    if (order.status !== OrderStatus.EN_PREPARATION) {
      throw new Error('Seules les commandes en préparation peuvent être marquées comme prêtes');
    }

    return await this.orderRepository.updateStatus(orderId, OrderStatus.PRETE);
  }

  /**
   * Marquer une commande comme retirée
   */
  async markOrderAsPickedUp(orderId: number): Promise<Order> {
    const order = await this.orderRepository.getById(orderId);
    if (!order) {
      throw new Error('Commande introuvable');
    }

    if (!order.canBePickedUp()) {
      throw new Error('Seules les commandes prêtes peuvent être retirées');
    }

    return await this.orderRepository.updateStatus(orderId, OrderStatus.RETIREE);
  }

  /**
   * Calculer le montant total d'une commande
   */
  calculateOrderTotal(items: OrderItem[]): number {
    return items.reduce((total, item) => {
      return total + (item.prixUnitaire * item.quantite);
    }, 0);
  }

  /**
   * Valider les données d'une commande avant création
   */
  private validateOrderData(orderData: Omit<CreateOrderData, 'studentId'>): void {
    if (!orderData.items || orderData.items.length === 0) {
      throw new Error('La commande doit contenir au moins un plat');
    }

    for (const item of orderData.items) {
      if (item.quantite <= 0) {
        throw new Error('La quantité doit être supérieure à 0');
      }
    }
  }
}

// Export du type pour utilisation dans d'autres modules
export type { IQRCodeGenerator };