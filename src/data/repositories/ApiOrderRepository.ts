/**
 * Repository des commandes utilisant l'API existante (contourne RLS)
 */

import { IOrderRepository, OrderFilters } from '@/core/interfaces/IOrderRepository';
import { Order, OrderStatus, OrderItem } from '@/core/entities/Order';

export class ApiOrderRepository implements IOrderRepository {
  
  async getById(id: number): Promise<Order | null> {
    // TODO: Implémenter si nécessaire
    throw new Error('Méthode getById non implémentée pour ApiOrderRepository');
  }

  async getByStudentId(studentId: number): Promise<Order[]> {
    // TODO: Implémenter si nécessaire
    throw new Error('Méthode getByStudentId non implémentée pour ApiOrderRepository');
  }

  async getByRestaurantId(restaurantId: string, filters?: OrderFilters): Promise<Order[]> {
    try {
      // restaurantId est maintenant directement compte.id (integer)
      console.log('🔍 ApiOrderRepository: Utilisation compte.id =', restaurantId);
      
      // Utiliser l'API existante qui fonctionne avec compte.id
      const response = await fetch(`/api/resto/${restaurantId}/orders`);
      const data = await response.json();

      if (!response.ok) {
        console.error('Erreur API orders:', data);
        return [];
      }

      const commandes = data.commandes || [];
      
      // Convertir les données de l'API vers nos entités Order
      const orders = commandes.map((cmd: any) => {
        const items = cmd.items?.map((item: any) => new OrderItem({
          platId: item.plat_id || 0,
          platNom: item.name || 'Plat inconnu',
          quantite: item.qty || 1,
          prixUnitaire: item.price || 0,
        })) || [];

        return new Order({
          id: cmd.id_commande,
          studentId: cmd.client?.id || 0,
          restaurantId: restaurantId,
          items: items,
          status: this.mapStatus(cmd.statut),
          totalPrice: cmd.montant_total || 0,
          qrCode: undefined,
          createdAt: new Date(cmd.created_at),
          updatedAt: undefined,
        });
      });

      // Appliquer les filtres si nécessaire
      let filteredOrders = orders;

      if (filters?.status) {
        filteredOrders = filteredOrders.filter(order => order.status === filters.status);
      }

      if (filters?.dateFrom) {
        filteredOrders = filteredOrders.filter(order => 
          order.createdAt >= filters.dateFrom!
        );
      }

      if (filters?.dateTo) {
        filteredOrders = filteredOrders.filter(order => 
          order.createdAt <= filters.dateTo!
        );
      }

      return filteredOrders;
    } catch (error) {
      console.error('Erreur dans ApiOrderRepository.getByRestaurantId:', error);
      return [];
    }
  }



  async getWithFilters(filters: OrderFilters): Promise<Order[]> {
    if (filters.restaurantId) {
      return this.getByRestaurantId(filters.restaurantId, filters);
    }
    return [];
  }

  async create(data: any): Promise<Order> {
    throw new Error('Méthode create non implémentée pour ApiOrderRepository');
  }

  async updateStatus(id: number, status: OrderStatus): Promise<Order> {
    throw new Error('Méthode updateStatus non implémentée pour ApiOrderRepository');
  }

  async cancel(id: number): Promise<void> {
    throw new Error('Méthode cancel non implémentée pour ApiOrderRepository');
  }

  async getStats(restaurantId: string, dateFrom?: Date, dateTo?: Date): Promise<{
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    completedOrders: number;
  }> {
    try {
      const orders = await this.getByRestaurantId(restaurantId, {
        dateFrom,
        dateTo,
      });

      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
      const pendingOrders = orders.filter(order => 
        order.status === OrderStatus.EN_ATTENTE || 
        order.status === OrderStatus.EN_PREPARATION
      ).length;
      const completedOrders = orders.filter(order => 
        order.status === OrderStatus.RETIREE
      ).length;

      return {
        totalOrders,
        totalRevenue,
        pendingOrders,
        completedOrders,
      };
    } catch (error) {
      console.error('Erreur dans getStats:', error);
      return {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        completedOrders: 0,
      };
    }
  }

  private mapStatus(dbStatus: string): OrderStatus {
    const status = dbStatus?.toLowerCase();
    switch (status) {
      case 'en_attente':
        return OrderStatus.EN_ATTENTE;
      case 'en_preparation':
      case 'en préparation':
        return OrderStatus.EN_PREPARATION;
      case 'prete':
        return OrderStatus.PRETE;
      case 'livree':
      case 'livrée':
      case 'retiree':
        return OrderStatus.RETIREE;
      case 'annulee':
        return OrderStatus.ANNULEE;
      default:
        return OrderStatus.EN_ATTENTE;
    }
  }
}