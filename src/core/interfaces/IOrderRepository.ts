/**
 * Interface de repository pour les commandes
 */

import { Order, OrderStatus } from '../entities/Order';

export interface CreateOrderData {
  studentId: number;
  restaurantId: string;
  items: Array<{
    platId: number;
    quantite: number;
  }>;
}

export interface OrderFilters {
  restaurantId?: string;
  studentId?: number;
  status?: OrderStatus;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface IOrderRepository {
  /**
   * Récupérer une commande par son ID
   */
  getById(id: number): Promise<Order | null>;

  /**
   * Récupérer les commandes d'un étudiant
   */
  getByStudentId(studentId: number): Promise<Order[]>;

  /**
   * Récupérer les commandes d'un restaurant
   */
  getByRestaurantId(restaurantId: string, filters?: OrderFilters): Promise<Order[]>;

  /**
   * Récupérer les commandes avec filtres
   */
  getWithFilters(filters: OrderFilters): Promise<Order[]>;

  /**
   * Créer une nouvelle commande
   */
  create(data: CreateOrderData): Promise<Order>;

  /**
   * Mettre à jour le statut d'une commande
   */
  updateStatus(id: number, status: OrderStatus): Promise<Order>;

  /**
   * Annuler une commande
   */
  cancel(id: number): Promise<void>;

  /**
   * Récupérer les statistiques de commandes pour un restaurant
   */
  getStats(restaurantId: string, dateFrom?: Date, dateTo?: Date): Promise<{
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    completedOrders: number;
  }>;
}
