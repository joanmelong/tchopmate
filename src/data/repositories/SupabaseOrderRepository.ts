/**
 * Implémentation Supabase du repository Order
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { IOrderRepository, CreateOrderData, OrderFilters } from '@/core/interfaces/IOrderRepository';
import { Order, OrderStatus, OrderItem } from '@/core/entities/Order';
import { createClient } from '@supabase/supabase-js';

export class SupabaseOrderRepository implements IOrderRepository {
  private supabase: SupabaseClient;

  constructor(supabase?: SupabaseClient) {
    this.supabase = supabase || this.createSupabaseClient();
  }

  private createSupabaseClient(): SupabaseClient {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    return createClient(supabaseUrl, supabaseKey);
  }

  async getById(id: number): Promise<Order | null> {
    try {
      // Récupérer la commande
      const { data: commande, error } = await this.supabase
        .from('commande')
        .select('*')
        .eq('id_commande', id)
        .single();

      if (error || !commande) {
        return null;
      }

      // Récupérer les commande_plat
      const { data: commandePlats, error: errorCP } = await this.supabase
        .from("commande_plat")
        .select("*")
        .eq("commande_id", id);

      if (errorCP) {
        console.error("Erreur chargement commande_plat:", errorCP);
        return null;
      }

      // Récupérer les plats
      const platIds = commandePlats?.map(cp => cp.plat_id) || [];
      const { data: plats, error: errorPlats } = await this.supabase
        .from("plat")
        .select("*")
        .in("id", platIds);

      if (errorPlats) {
        console.error("Erreur chargement plats:", errorPlats);
        return null;
      }

      // Construire les items
      const items = commandePlats?.map((cp: { plat_id: number; quantite: number }) => {
        const plat = plats?.find(p => p.id === cp.plat_id);
        return {
          platId: cp.plat_id,
          platNom: plat?.nom || 'Plat inconnu',
          quantite: cp.quantite || 1,
          prixUnitaire: plat?.prix || 0,
        };
      }) || [];

      return this.mapToOrder({
        ...commande,
        items: items,
      });
    } catch (error) {
      console.error("Erreur dans getById:", error);
      return null;
    }
  }

  async getByStudentId(studentId: number): Promise<Order[]> {
    const { data, error } = await this.supabase
      .from('commande')
      .select(`
        *,
        commande_plat (
          quantite,
          plat_id,
          plat (
            id,
            nom,
            prix
          )
        )
      `)
      .eq('client_id', studentId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(item => this.mapToOrder(item));
  }

  async getByRestaurantId(restaurantId: string, filters?: OrderFilters): Promise<Order[]> {
    try {
      // Étape 1: Trouver le restaurant du gérant (restaurantId est en fait le gerantId)
      const { data: restaurant, error: errorRestaurant } = await this.supabase
        .from("restaurant")
        .select("id_restaurant, nom")
        .eq("gerant_id", restaurantId)
        .single();

      if (errorRestaurant || !restaurant) {
        console.error("Restaurant non trouvé pour le gérant", restaurantId, errorRestaurant);
        return [];
      }

      const realRestaurantId = restaurant.id_restaurant;

      // Étape 2: Récupérer toutes les commandes
      let query = this.supabase
        .from('commande')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom.toISOString());
      }

      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo.toISOString());
      }

      if (filters?.status) {
        query = query.eq('statut', this.mapStatusToDb(filters.status));
      }

      const { data: commandes, error: errorCommandes } = await query;

      if (errorCommandes || !commandes) {
        console.error("Erreur chargement commandes:", errorCommandes);
        return [];
      }

      if (commandes.length === 0) {
        return [];
      }

      // Étape 3: Récupérer les commande_plat
      const commandeIds = commandes.map(c => c.id_commande);
      const { data: commandePlats, error: errorCP } = await this.supabase
        .from("commande_plat")
        .select("*")
        .in("commande_id", commandeIds);

      if (errorCP) {
        console.error("Erreur chargement commande_plat:", errorCP);
        return [];
      }

      // Étape 4: Récupérer les plats
      const platIds = [...new Set(commandePlats?.map(cp => cp.plat_id) || [])];
      const { data: plats, error: errorPlats } = await this.supabase
        .from("plat")
        .select("*")
        .in("id", platIds);

      if (errorPlats) {
        console.error("Erreur chargement plats:", errorPlats);
        return [];
      }

      // Étape 5: Filtrer et transformer les commandes pour ce restaurant
      const commandesRestaurant = commandes
        .map((cmd: { id_commande: number; client_id: number; statut: string; montant_total: number; created_at: string; creneau_id?: number }) => {
          const cmdPlats = commandePlats?.filter(cp => cp.commande_id === cmd.id_commande) || [];
          
          // Vérifier si au moins un plat appartient au restaurant
          const platsRestaurant = cmdPlats.filter(cp => {
            const plat = plats?.find(p => p.id === cp.plat_id);
            return plat?.restaurant_id === realRestaurantId || String(plat?.restaurant_id) === String(realRestaurantId);
          });

          if (platsRestaurant.length === 0) {
            return null;
          }

          const items = platsRestaurant.map((cp: { commande_id: number; plat_id: number; quantite: number }) => {
            const plat = plats?.find(p => p.id === cp.plat_id);
            return {
              platId: cp.plat_id,
              platNom: plat?.nom || 'Plat inconnu',
              quantite: cp.quantite || 1,
              prixUnitaire: plat?.prix || 0,
            };
          });

          return {
            ...cmd,
            items: items,
          };
        })
        .filter(Boolean);

      return commandesRestaurant.map(item => this.mapToOrder(item));
    } catch (error) {
      console.error("Erreur dans getByRestaurantId:", error);
      return [];
    }
  }

  async getWithFilters(filters: OrderFilters): Promise<Order[]> {
    let query = this.supabase
      .from('commande')
      .select(`
        *,
        commande_plat (
          quantite,
          prix_unitaire,
          plat (
            id,
            nom,
            prix
          )
        )
      `);

    if (filters.restaurantId) {
      query = query.eq('restaurant_id', filters.restaurantId);
    }

    if (filters.studentId) {
      query = query.eq('student_id', filters.studentId);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom.toISOString());
    }

    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo.toISOString());
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    return data.map(item => this.mapToOrder(item));
  }

  async create(createData: CreateOrderData): Promise<Order> {
    // TODO: Implémenter la création de commande
    throw new Error('Méthode create non implémentée');
  }

  async updateStatus(id: number, status: OrderStatus): Promise<Order> {
    const { data, error } = await this.supabase
      .from('commande')
      .update({ status })
      .eq('id', id)
      .select(`
        *,
        commande_plat (
          quantite,
          prix_unitaire,
          plat (
            id,
            nom,
            prix
          )
        )
      `)
      .single();

    if (error || !data) {
      throw new Error('Erreur lors de la mise à jour du statut');
    }

    return this.mapToOrder(data);
  }

  async cancel(id: number): Promise<void> {
    const { error } = await this.supabase
      .from('commande')
      .update({ status: OrderStatus.ANNULEE })
      .eq('id', id);

    if (error) {
      throw new Error('Erreur lors de l\'annulation de la commande');
    }
  }

  async getStats(restaurantId: string, dateFrom?: Date, dateTo?: Date): Promise<{
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    completedOrders: number;
  }> {
    try {
      // Utiliser la même logique que getByRestaurantId pour récupérer les commandes
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
      console.error("Erreur dans getStats:", error);
      return {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        completedOrders: 0,
      };
    }
  }

  private mapToOrder(data: { id_commande: number; client_id: number; statut: string; montant_total: number; created_at: string; items?: Array<{ platId: number; platNom: string; quantite: number; prixUnitaire: number }> }): Order {
    // Mapper les données de la base vers l'entité Order
    const items = data.items?.map((item: { platId: number; platNom: string; quantite: number; prixUnitaire: number }) => ({
      platId: item.platId || 0,
      platNom: item.platNom || 'Plat inconnu',
      quantite: item.quantite || 1,
      prixUnitaire: item.prixUnitaire || 0,
    })) || [];

    return new Order({
      id: data.id_commande,
      studentId: data.client_id || 0,
      restaurantId: data.restaurant_id || '',
      items: items.map((item: { platId: number; platNom: string; quantite: number; prixUnitaire: number }) => new OrderItem(item)),
      status: this.mapStatus(data.statut),
      totalPrice: data.montant_total || 0,
      qrCode: data.qr_code,
      createdAt: new Date(data.created_at),
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
    });
  }

  private mapStatus(dbStatus: string): OrderStatus {
    const status = dbStatus?.toLowerCase();
    switch (status) {
      case 'en_attente':
        return OrderStatus.EN_ATTENTE;
      case 'en_preparation':
        return OrderStatus.EN_PREPARATION;
      case 'prete':
        return OrderStatus.PRETE;
      case 'livree':
      case 'retiree':
        return OrderStatus.RETIREE;
      case 'annulee':
        return OrderStatus.ANNULEE;
      default:
        return OrderStatus.EN_ATTENTE;
    }
  }

  private mapStatusToDb(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.EN_ATTENTE:
        return 'EN_ATTENTE';
      case OrderStatus.EN_PREPARATION:
        return 'EN_PREPARATION';
      case OrderStatus.PRETE:
        return 'PRETE';
      case OrderStatus.RETIREE:
        return 'LIVREE'; // Dans la DB, c'est LIVREE
      case OrderStatus.ANNULEE:
        return 'ANNULEE';
      default:
        return 'EN_ATTENTE';
    }
  }
}