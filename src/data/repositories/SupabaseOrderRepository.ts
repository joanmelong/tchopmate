/**
 * Implémentation Supabase du repository des commandes
 * Couche: Data (Infrastructure)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Order, OrderStatus, OrderItem } from '@/core/entities/Order';
import { IOrderRepository, CreateOrderData, OrderFilters } from '@/core/interfaces/IOrderRepository';
import { OrderMapper } from '@/data/mappers';
import { CommandeDTO } from '@/data/dto';

interface SupabaseLigneCommande {
  plat_id: number;
  quantite: number;
  prix_unitaire: number;
  plats?: {
    nom: string;
  };
}

interface SupabaseCommandeWithLignes extends CommandeDTO {
  lignes_commande?: SupabaseLigneCommande[];
}

export class SupabaseOrderRepository implements IOrderRepository {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  async getById(id: number): Promise<Order | null> {
    try {
      // Récupérer la commande
      const { data: commandeData, error: commandeError } = await this.supabase
        .from('commandes')
        .select('*')
        .eq('id', id)
        .single();

      if (commandeError || !commandeData) {
        return null;
      }

      // Récupérer les lignes de commande
      const { data: lignesData, error: lignesError } = await this.supabase
        .from('lignes_commande')
        .select(`
          *,
          plats (
            id,
            nom,
            prix
          )
        `)
        .eq('commande_id', id);

      if (lignesError) {
        throw new Error(`Erreur lors de la récupération des lignes de commande: ${lignesError.message}`);
      }

      // Créer les OrderItems
      const orderItems = lignesData?.map(ligne => 
        new OrderItem({
          platId: ligne.plat_id,
          platNom: ligne.plats?.nom || 'Plat inconnu',
          quantite: ligne.quantite,
          prixUnitaire: ligne.prix_unitaire
        })
      ) || [];

      // Mapper vers l'entité métier
      return OrderMapper.toDomain(commandeData as CommandeDTO, orderItems);
    } catch (error) {
      console.error('Erreur lors de la récupération de la commande:', error);
      throw error;
    }
  }

  async getByStudentId(studentId: number): Promise<Order[]> {
    try {
      const { data: commandesData, error } = await this.supabase
        .from('commandes')
        .select(`
          *,
          lignes_commande (
            *,
            plats (
              id,
              nom,
              prix
            )
          )
        `)
        .eq('etudiant_id', studentId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Erreur lors de la récupération des commandes: ${error.message}`);
      }

      return this.mapCommandesToOrders(commandesData || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes par étudiant:', error);
      throw error;
    }
  }

  async getByRestaurantId(restaurantId: string, filters?: OrderFilters): Promise<Order[]> {
    try {
      let query = this.supabase
        .from('commandes')
        .select(`
          *,
          lignes_commande (
            *,
            plats (
              id,
              nom,
              prix
            )
          )
        `)
        .eq('restaurant_id', restaurantId);

      // Appliquer les filtres
      if (filters?.status) {
        query = query.eq('statut', filters.status);
      }

      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom.toISOString());
      }

      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo.toISOString());
      }

      query = query.order('created_at', { ascending: false });

      const { data: commandesData, error } = await query;

      if (error) {
        throw new Error(`Erreur lors de la récupération des commandes: ${error.message}`);
      }

      return this.mapCommandesToOrders(commandesData || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes par restaurant:', error);
      throw error;
    }
  }

  async getWithFilters(filters: OrderFilters): Promise<Order[]> {
    try {
      let query = this.supabase
        .from('commandes')
        .select(`
          *,
          lignes_commande (
            *,
            plats (
              id,
              nom,
              prix
            )
          )
        `);

      // Appliquer les filtres
      if (filters.restaurantId) {
        query = query.eq('restaurant_id', filters.restaurantId);
      }

      if (filters.studentId) {
        query = query.eq('etudiant_id', filters.studentId);
      }

      if (filters.status) {
        query = query.eq('statut', filters.status);
      }

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom.toISOString());
      }

      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo.toISOString());
      }

      query = query.order('created_at', { ascending: false });

      const { data: commandesData, error } = await query;

      if (error) {
        throw new Error(`Erreur lors de la récupération des commandes: ${error.message}`);
      }

      return this.mapCommandesToOrders(commandesData || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes avec filtres:', error);
      throw error;
    }
  }

  async create(data: CreateOrderData): Promise<Order> {
    try {
      // Récupérer les détails des plats pour calculer le total
      const { data: platsData, error: platsError } = await this.supabase
        .from('plats')
        .select('id, nom, prix')
        .in('id', data.items.map(item => item.platId));

      if (platsError) {
        throw new Error(`Erreur lors de la récupération des plats: ${platsError.message}`);
      }

      // Calculer le montant total
      let montantTotal = 0;
      const lignesCommande = data.items.map(item => {
        const plat = platsData?.find(p => p.id === item.platId);
        if (!plat) {
          throw new Error(`Plat avec l'ID ${item.platId} introuvable`);
        }
        const sousTotal = plat.prix * item.quantite;
        montantTotal += sousTotal;
        return {
          plat_id: item.platId,
          quantite: item.quantite,
          prix_unitaire: plat.prix
        };
      });

      // Créer la commande
      const { data: commandeData, error: commandeError } = await this.supabase
        .from('commandes')
        .insert({
          etudiant_id: data.studentId,
          restaurant_id: data.restaurantId,
          statut: OrderStatus.EN_ATTENTE,
          montant_total: montantTotal
        })
        .select()
        .single();

      if (commandeError) {
        throw new Error(`Erreur lors de la création de la commande: ${commandeError.message}`);
      }

      // Créer les lignes de commande
      const lignesAvecCommandeId = lignesCommande.map(ligne => ({
        ...ligne,
        commande_id: commandeData.id
      }));

      const { error: lignesError } = await this.supabase
        .from('lignes_commande')
        .insert(lignesAvecCommandeId);

      if (lignesError) {
        // Rollback: supprimer la commande créée
        await this.supabase
          .from('commandes')
          .delete()
          .eq('id', commandeData.id);
        
        throw new Error(`Erreur lors de la création des lignes de commande: ${lignesError.message}`);
      }

      // Récupérer la commande complète créée
      const createdOrder = await this.getById(commandeData.id);
      if (!createdOrder) {
        throw new Error('Erreur lors de la récupération de la commande créée');
      }

      return createdOrder;
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      throw error;
    }
  }

  async updateStatus(id: number, status: OrderStatus): Promise<Order> {
    try {
      const { error } = await this.supabase
        .from('commandes')
        .update({ 
          statut: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erreur lors de la mise à jour du statut: ${error.message}`);
      }

      const updatedOrder = await this.getById(id);
      if (!updatedOrder) {
        throw new Error('Erreur lors de la récupération de la commande mise à jour');
      }

      return updatedOrder;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  }

  async cancel(id: number): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('commandes')
        .update({ 
          statut: OrderStatus.ANNULEE,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        throw new Error(`Erreur lors de l'annulation de la commande: ${error.message}`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'annulation de la commande:', error);
      throw error;
    }
  }

  async updateQRCode(id: number, qrCode: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('commandes')
        .update({ 
          qr_code: qrCode,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        throw new Error(`Erreur lors de la mise à jour du QR code: ${error.message}`);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du QR code:', error);
      throw error;
    }
  }

  async getStats(restaurantId: string, dateFrom?: Date, dateTo?: Date): Promise<{
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    completedOrders: number;
  }> {
    try {
      let query = this.supabase
        .from('commandes')
        .select('statut, montant_total')
        .eq('restaurant_id', restaurantId);

      if (dateFrom) {
        query = query.gte('created_at', dateFrom.toISOString());
      }

      if (dateTo) {
        query = query.lte('created_at', dateTo.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
      }

      const stats = (data || []).reduce(
        (acc, commande) => {
          acc.totalOrders++;
          acc.totalRevenue += commande.montant_total;
          
          if (commande.statut === OrderStatus.EN_ATTENTE || commande.statut === OrderStatus.EN_PREPARATION) {
            acc.pendingOrders++;
          }
          
          if (commande.statut === OrderStatus.RETIREE) {
            acc.completedOrders++;
          }
          
          return acc;
        },
        {
          totalOrders: 0,
          totalRevenue: 0,
          pendingOrders: 0,
          completedOrders: 0
        }
      );

      return stats;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  private mapCommandesToOrders(commandesData: SupabaseCommandeWithLignes[]): Order[] {
    return commandesData.map(commandeData => {
      const orderItems = (commandeData.lignes_commande || []).map((ligne: SupabaseLigneCommande) => 
        new OrderItem({
          platId: ligne.plat_id,
          platNom: ligne.plats?.nom || 'Plat inconnu',
          quantite: ligne.quantite,
          prixUnitaire: ligne.prix_unitaire
        })
      );

      return OrderMapper.toDomain(commandeData as CommandeDTO, orderItems);
    });
  }
}