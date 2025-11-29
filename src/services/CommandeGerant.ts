import { supabase } from '@/lib/supabaseClient';

/**
 * Services clientes pour la gestion des commandes côté gérants (restaurateurs)
 * Les fonctions suivantes appellent l'API 'api/gerant/commandes' qui expose
 * les fonctionnalités serveurs (authentification, filtrage par restaurant, etc.)
 */
export type GerantOrderItem = {
  id: string;
  plat_id?: string;
  quantite?: number;
  nom?: string;
  prix?: number;
  image_url?: string;
};

export type GerantOrder = {
  id_commande: string;
  date_commande?: string;
  statut?: string; // Statut de la commande (en_attente, en_cours, livree...)
  montant_total?: number;
  items?: Array<GerantOrderItem>;
  client?: {
    id?: number;
    nom?: string;
    prenom?: string;
    email?: string;
    numero_tel?: string;
  };
};

export class CommandeGerantService {
  private static isSingleRestaurantMode(): boolean {
    try {
      return (process && process.env && (process.env.NEXT_PUBLIC_SINGLE_RESTAURANT === 'true')) || false
    } catch (e) {
      return false
    }
  }
  private static shouldValidateRestaurantOwner(): boolean {
    try {
      // READ NEXT_PUBLIC_... for client builds, fallback to backend var if present
      return (process && process.env && ((process.env.NEXT_PUBLIC_VALIDATE_GERANT_RESTAURANT === 'true') || (process.env.VALIDATE_GERANT_RESTAURANT === 'true'))) || false
    } catch (e) {
      return false
    }
  }
  // Helper: find the compte (profile) id for the current auth user
  private static async getCompteIdByAuthUser(): Promise<number | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: compteRow, error } = await supabase
        .from('compte')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error || !compteRow) return null;
      return compteRow.id as number;
    } catch (e) {
      console.error('[CommandeGerantService] getCompteIdByAuthUser exception:', e);
      return null;
    }
  }

  // The previous implementation enforced a restaurant->commande ownership
  // check: this has been removed to decouple ordre from restaurant in the service layer.
  // If needed, ownership checks should be implemented in the caller or via a dedicated policy.
  private static async getRestaurantIdForGerant(): Promise<string | null> {
    try {
      const compteId = await this.getCompteIdByAuthUser();
      if (!compteId) return null;

      const { data: restaurantRow, error } = await supabase
        .from('restaurant')
        .select('id_restaurant')
        .eq('gerant_id', compteId)
        .maybeSingle();
      if (error || !restaurantRow) return null;
      return restaurantRow.id_restaurant as string;
    } catch (e) {
      console.error('[CommandeGerantService] getRestaurantIdForGerant exception:', e);
      return null;
    }
  }

  static async fetchOrders(): Promise<GerantOrder[]> {
    console.log('[CommandeGerantService] fetchOrders: récupérer les commandes du restaurant via Supabase')
    try {
      // Optionally constrain to restaurant if validation is enabled
      let query = supabase
        .from('commande_plat')
        .select('commande_id, quantite, plat_id, plat(nom, prix, image_url, description, categorie, temps_preparation)')
      const shouldValidate = this.shouldValidateRestaurantOwner()
      const restaurantId = shouldValidate ? await this.getRestaurantIdForGerant() : null
      if (shouldValidate && !restaurantId) {
        console.warn('[CommandeGerantService] fetchOrders: pas de restaurant associé au gérant')
        return [];
      }
      if (shouldValidate && restaurantId) query = query.filter('plat.restaurant_id', 'eq', restaurantId)
      const { data: cpRows, error: cpError } = await query;

      if (cpError) {
        console.error('[CommandeGerantService] fetchOrders erreur fetch commande_plat:', cpError);
        return [];
      }

      const commandeIds = Array.from(new Set((cpRows || []).map((r: any) => r.commande_id)));
      const commandes: GerantOrder[] = [];
      for (const id of commandeIds) {
        const { data: cmd, error: cmdErr } = await supabase
          .from('commande')
          .select('id_commande, date_commande, statut, montant_total, commentaire, livraison, created_at, client_id')
          .eq('id_commande', id)
          .maybeSingle();

        if (cmdErr) {
          console.error('[CommandeGerantService] fetchOrders erreur fetch commande details:', id, cmdErr);
          continue;
        }

        const items = (cpRows || []).filter((r: any) => r.commande_id === id).map((r: any) => ({
          // commande_plat n'a pas de colonne 'id' dans le schéma; utiliser plat_id pour l'identifiant
          id: r.plat_id || `${id}-${r.plat_id}`,
          plat_id: r.plat_id,
          quantite: r.quantite,
          nom: r.plat?.nom,
          prix: r.plat?.prix,
          image_url: r.plat?.image_url,
        }));

        // Récupérer le client si disponible
        let clientInfo: any = null;
        try {
          if (cmd?.client_id) {
            const { data: clientRow } = await supabase
              .from('compte')
              .select('id, nom, prenom, email, numero_tel')
              .eq('id', cmd.client_id)
              .maybeSingle();
            clientInfo = clientRow ?? null;
          }
        } catch (e) {
          console.error('[CommandeGerantService] fetchOrders erreur fetch client info:', e);
        }

        commandes.push({
          id_commande: cmd?.id_commande,
          date_commande: cmd?.date_commande || cmd?.created_at,
          statut: cmd?.statut,
          montant_total: cmd?.montant_total,
          items,
          client: clientInfo,
        });
      }
      console.log('[CommandeGerantService] fetchOrders: récupéré', commandes.length, 'commandes')
      return commandes;
    } catch (e) {
      console.error('[CommandeGerantService] Exception fetchOrders:', e)
      return []
    }
  }

  static async getOrder(orderId: string): Promise<GerantOrder | null> {
    console.log('[CommandeGerantService] getOrder:', orderId)
    try {

      // Récupérer la commande
      const { data: cmd, error: cmdErr } = await supabase
        .from('commande')
        .select('id_commande, date_commande, statut, montant_total, commentaire, livraison, created_at, client_id')
        .eq('id_commande', orderId)
        .maybeSingle();
      if (cmdErr || !cmd) {
        console.error('[CommandeGerantService] getOrder erreur fetch commande:', cmdErr);
        return null;
      }

      // Récupérer items pour la commande et vérifier qu'ils appartiennent au restaurant
      // Fetch items and optionally validate restaurant ownership
      const shouldValidateItems = this.shouldValidateRestaurantOwner()
      const itemsRestaurantId = shouldValidateItems ? await this.getRestaurantIdForGerant() : null
      let itemsQuery = supabase
        .from('commande_plat')
        .select('quantite, plat_id, plat(nom, prix, image_url, description, categorie, temps_preparation)')
        .eq('commande_id', orderId)
      if (shouldValidateItems && itemsRestaurantId) itemsQuery = itemsQuery.filter('plat.restaurant_id', 'eq', itemsRestaurantId)
      const { data: itemsRows, error: itemsErr } = await itemsQuery;
      if (itemsErr) {
        console.error('[CommandeGerantService] getOrder erreur items:', itemsErr);
        return null;
      }

      let clientInfo: any = null;
      try {
        if (cmd.client_id) {
          const { data: clientRow } = await supabase
            .from('compte')
            .select('id, nom, prenom, email, numero_tel')
            .eq('id', cmd.client_id)
            .maybeSingle();
          clientInfo = clientRow ?? null;
        }
      } catch (e) {
        console.error('[CommandeGerantService] getOrder erreur client info:', e);
      }

      const items = (itemsRows || []).map((r: any) => ({
        id: r.plat_id ?? `${orderId}-${r.plat_id}`,
        plat_id: r.plat_id,
        quantite: r.quantite,
        nom: r.plat?.nom,
        prix: r.plat?.prix,
        image_url: r.plat?.image_url,
      }));

      return {
        id_commande: cmd.id_commande,
        date_commande: cmd.date_commande || cmd.created_at,
        statut: cmd.statut,
        montant_total: cmd.montant_total,
        items,
        client: clientInfo,
      };
    } catch (e) {
      console.error('[CommandeGerantService] Exception getOrder:', e)
      return null
    }
  }

  /**
   * Change le statut d'une commande (e.g., en_cours -> livree)
   * N.B.: Ne fait pas de validation complexe côté client, serveur DOIT vérifier l'autorisation
   */
  static async updateOrderStatus(orderId: string, newStatus: string): Promise<boolean> {
    console.log('[CommandeGerantService] updateOrderStatus', orderId, '->', newStatus)
    try {
      // Optionally validate restaurant owner before update
      if (this.shouldValidateRestaurantOwner()) {
        const rId = await this.getRestaurantIdForGerant()
        if (!rId) {
          console.warn('[CommandeGerantService] updateOrderStatus: no restaurant associated to gerant')
          return false
        }
        let cpQuery = supabase.from('commande_plat').select('commande_id').eq('commande_id', orderId).limit(1)
        if (rId) cpQuery = cpQuery.filter('plat.restaurant_id', 'eq', rId)
        const { data: cpRows, error: cpError } = await cpQuery;
        if (cpError) {
          console.error('[CommandeGerantService] updateOrderStatus erreur check belongs:', cpError)
          return false;
        }
        if (!cpRows || cpRows.length === 0) {
          console.warn('[CommandeGerantService] updateOrderStatus: order not linked to restaurant')
          return false;
        }
      }

      const { error: updateError } = await supabase
        .from('commande')
        .update({ statut: newStatus })
        .eq('id_commande', orderId);
      if (updateError) {
        console.error('[CommandeGerantService] updateOrderStatus update error:', updateError)
        return false;
      }
      return true
    } catch (e) {
      console.error('[CommandeGerantService] Exception updateOrderStatus:', e)
      return false
    }
  }

  /**
   * Assigner la commande à un livreur (facultatif)
   */
  static async assignDelivery(orderId: string, livreurId: number | string): Promise<boolean> {
    console.log('[CommandeGerantService] assignDelivery', orderId, '->', livreurId)
    try {
      // Optionally validate restaurant owner before assignDelivery
      if (this.shouldValidateRestaurantOwner()) {
        const rId = await this.getRestaurantIdForGerant()
        if (!rId) {
          console.warn('[CommandeGerantService] assignDelivery: no restaurant associated to gerant')
          return false
        }
        const { data: cpRows, error: cpError } = await supabase
          .from('commande_plat')
          .select('commande_id')
          .eq('commande_id', orderId)
          .filter('plat.restaurant_id', 'eq', rId)
          .limit(1);
        if (cpError) {
          console.error('[CommandeGerantService] assignDelivery erreur check belongs:', cpError)
          return false;
        }
        if (!cpRows || cpRows.length === 0) {
          console.warn('[CommandeGerantService] assignDelivery: order not linked to restaurant')
          return false;
        }
      }

      const updates: any = { statut: 'en_livraison' };
      if (typeof livreurId === 'number' || (typeof livreurId === 'string' && String(livreurId).trim() !== '')) updates.livreur_id = livreurId;
      const { error: updateError } = await supabase.from('commande').update(updates).eq('id_commande', orderId);
      if (updateError) {
        console.error('[CommandeGerantService] assignDelivery update error:', updateError)
        return false;
      }

      return true
    } catch (e) {
      console.error('[CommandeGerantService] Exception assignDelivery:', e)
      return false
    }
  }

  /**
   * Marque la commande comme prête
   */
  static async markOrderReady(orderId: string): Promise<boolean> {
    return this.updateOrderStatus(orderId, 'prete')
  }

  /**
   * Annule une commande
   */
  static async cancelOrder(orderId: string): Promise<boolean> {
    console.log('[CommandeGerantService] cancelOrder', orderId)
    try {
      // Optionally validate restaurant owner before cancel
      if (this.shouldValidateRestaurantOwner()) {
        const rId = await this.getRestaurantIdForGerant()
        if (!rId) {
          console.warn('[CommandeGerantService] cancelOrder: no restaurant associated to gerant')
          return false
        }
        const { data: cpRows, error: cpError } = await supabase
          .from('commande_plat')
          .select('commande_id')
          .eq('commande_id', orderId)
          .filter('plat.restaurant_id', 'eq', rId)
          .limit(1);
        if (cpError) {
          console.error('[CommandeGerantService] cancelOrder erreur check belongs:', cpError)
          return false;
        }
        if (!cpRows || cpRows.length === 0) {
          console.warn('[CommandeGerantService] cancelOrder: order not linked to restaurant')
          return false;
        }
      }

      const { error: updateError } = await supabase.from('commande').update({ statut: 'annule' }).eq('id_commande', orderId);
      if (updateError) {
        console.error('[CommandeGerantService] cancelOrder update error:', updateError)
        return false;
      }
      console.log('[CommandeGerantService] cancelOrder success')
      return true
    } catch (e) {
      console.error('[CommandeGerantService] Exception cancelOrder:', e)
      return false
    }
  }
}
