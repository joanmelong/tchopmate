/**
 * Hook: useOrderService
 * Couche: Présentation (Pont UI ↔ Métier)
 * Hook pour utiliser le service de commande avec génération de QR code
 */

import { useState, useCallback } from 'react';
import { Order, OrderStatus, OrderItem } from '@/core/entities/Order';
import { User } from '@/core/entities/User';
import { OrderService } from '@/services/OrderService';
import { CreateOrderData } from '@/core/interfaces/IOrderRepository';

interface UseOrderServiceResult {
  // États
  isLoading: boolean;
  error: string | null;
  orders: Order[];
  currentOrder: Order | null;
  qrCode: string | null;

  // Actions de commande
  createOrder: (student: User, orderData: Omit<CreateOrderData, 'studentId'>) => Promise<{
    order: Order;
    qrCode: string;
  }>;
  getOrderById: (orderId: number) => Promise<Order | null>;
  getOrdersByStudentId: (studentId: number) => Promise<Order[]>;
  getOrdersByRestaurantId: (restaurantId: string) => Promise<Order[]>;
  updateOrderStatus: (orderId: number, status: OrderStatus) => Promise<Order>;
  cancelOrder: (orderId: number) => Promise<void>;
  confirmOrder: (orderId: number) => Promise<Order>;
  markOrderAsReady: (orderId: number) => Promise<Order>;
  markOrderAsPickedUp: (orderId: number) => Promise<Order>;

  // Actions QR Code
  generateQRCodeForOrder: (orderId: number) => Promise<string>;

  // Utilitaires
  calculateOrderTotal: (items: OrderItem[]) => number;
  clearError: () => void;
  resetState: () => void;
}

export function useOrderService(
  orderService: OrderService
): UseOrderServiceResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);

  const handleError = useCallback((err: unknown) => {
    const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
    setError(errorMessage);
    console.error('OrderService Error:', err);
  }, []);

  const createOrder = useCallback(async (
    student: User, 
    orderData: Omit<CreateOrderData, 'studentId'>
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await orderService.createOrder(student, orderData);
      setCurrentOrder(result.order);
      setQrCode(result.qrCode);
      return result;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [orderService, handleError]);

  const getOrderById = useCallback(async (orderId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const order = await orderService.getOrderById(orderId);
      setCurrentOrder(order);
      return order;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [orderService, handleError]);

  const getOrdersByStudentId = useCallback(async (studentId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const fetchedOrders = await orderService.getOrdersByStudentId(studentId);
      setOrders(fetchedOrders);
      return fetchedOrders;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [orderService, handleError]);

  const getOrdersByRestaurantId = useCallback(async (restaurantId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const fetchedOrders = await orderService.getOrdersByRestaurantId(restaurantId);
      setOrders(fetchedOrders);
      return fetchedOrders;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [orderService, handleError]);

  const updateOrderStatus = useCallback(async (orderId: number, status: OrderStatus) => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedOrder = await orderService.updateOrderStatus(orderId, status);
      
      // Mettre à jour les états locaux
      setCurrentOrder(prev => prev?.id === orderId ? updatedOrder : prev);
      setOrders(prev => prev.map(order => 
        order.id === orderId ? updatedOrder : order
      ));
      
      return updatedOrder;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [orderService, handleError]);

  const cancelOrder = useCallback(async (orderId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      await orderService.cancelOrder(orderId);
      
      // Mettre à jour les états locaux
      setOrders(prev => prev.filter(order => order.id !== orderId));
      setCurrentOrder(prev => prev?.id === orderId ? null : prev);
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [orderService, handleError]);

  const confirmOrder = useCallback(async (orderId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const confirmedOrder = await orderService.confirmOrder(orderId);
      
      // Mettre à jour les états locaux
      setCurrentOrder(prev => prev?.id === orderId ? confirmedOrder : prev);
      setOrders(prev => prev.map(order => 
        order.id === orderId ? confirmedOrder : order
      ));
      
      return confirmedOrder;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [orderService, handleError]);

  const markOrderAsReady = useCallback(async (orderId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const readyOrder = await orderService.markOrderAsReady(orderId);
      
      // Mettre à jour les états locaux
      setCurrentOrder(prev => prev?.id === orderId ? readyOrder : prev);
      setOrders(prev => prev.map(order => 
        order.id === orderId ? readyOrder : order
      ));
      
      return readyOrder;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [orderService, handleError]);

  const markOrderAsPickedUp = useCallback(async (orderId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const pickedUpOrder = await orderService.markOrderAsPickedUp(orderId);
      
      // Mettre à jour les états locaux
      setCurrentOrder(prev => prev?.id === orderId ? pickedUpOrder : prev);
      setOrders(prev => prev.map(order => 
        order.id === orderId ? pickedUpOrder : order
      ));
      
      return pickedUpOrder;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [orderService, handleError]);

  const generateQRCodeForOrder = useCallback(async (orderId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const generatedQrCode = await orderService.generateQRCodeForOrder(orderId);
      setQrCode(generatedQrCode);
      return generatedQrCode;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [orderService, handleError]);

  const calculateOrderTotal = useCallback((items: OrderItem[]) => {
    return orderService.calculateOrderTotal(items);
  }, [orderService]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetState = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setOrders([]);
    setCurrentOrder(null);
    setQrCode(null);
  }, []);

  return {
    // États
    isLoading,
    error,
    orders,
    currentOrder,
    qrCode,

    // Actions de commande
    createOrder,
    getOrderById,
    getOrdersByStudentId,
    getOrdersByRestaurantId,
    updateOrderStatus,
    cancelOrder,
    confirmOrder,
    markOrderAsReady,
    markOrderAsPickedUp,

    // Actions QR Code
    generateQRCodeForOrder,

    // Utilitaires
    calculateOrderTotal,
    clearError,
    resetState,
  };
}