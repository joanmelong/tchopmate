export type OrderStatus = 'En attente' | 'En préparation' | 'Prêt' | 'Retiré' | 'Annulé';

export interface OrderDTO {
  id: string;
  user_id: string;
  dish_id: string;
  dish_name: string;
  time_slot_id: string;
  time_slot: string;
  quantity: number;
  prix_total: number;
  statut: OrderStatus;
  notes?: string;
  qr_code?: string;
  payment_status?: 'pending' | 'paid';
  created_at: Date;
  updated_at: Date;
}

export interface CreateOrderDTO {
  user_id: string;
  dish_id: string;
  time_slot_id: string;
  quantity: number;
  notes?: string;
}