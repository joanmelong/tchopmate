import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';
import { getClientFromRequest } from '@/lib/supabase-server';

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Supabase URL or service key missing for API /api/gerant/commandes');
}

const admin = createClient(url ?? '', serviceKey ?? '', { auth: { persistSession: false } });

// Utility: determine restaurant id for the current gerant
async function getRestaurantForGerant(clientId: number) {
  try {
    // Try to find restaurant where gerant_id equals client.id
    const { data: restaurant, error } = await admin
      .from('restaurant')
      .select('id_restaurant')
      .eq('gerant_id', clientId)
      .maybeSingle();

    if (error) {
      console.error('Erreur récupération restaurant par gerant_id:', error);
      return null;
    }

    return restaurant?.id_restaurant ?? null;
  } catch (e) {
    console.error('Exception getRestaurantForGerant:', e);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const client = await getClientFromRequest(request);
    if (!client) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }

    const restaurantId = await getRestaurantForGerant(client.id);
    if (!restaurantId) {
      return NextResponse.json({ error: 'Pas de restaurant associé au gérant' }, { status: 403 });
    }

    console.log('[API /api/gerant/commandes] get commandes pour restaurant', restaurantId);

    // Detect if caller asked for a specific commande
    const url = new URL(request.url);
    const segments = url.pathname.split('/').filter(Boolean);
    // segments: ['api', 'gerant', 'commandes'] or ['api','gerant','commandes','{id}']
    const possibleId = segments.length > 3 ? segments[3] : null;
    if (possibleId) {
      // Return a single commande details
      const { data: cmd, error: cmdErr } = await admin
        .from('commande')
        .select('id_commande, date_commande, statut, montant_total, commentaire, livraison, created_at, updated_at, client_id')
        .eq('id_commande', possibleId)
        .maybeSingle();
      if (cmdErr || !cmd) {
        console.error('[API /api/gerant/commandes] erreur fetch commande details:', possibleId, cmdErr);
        return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
      }
      // Get items
      const { data: itemsRows } = await admin
        .from('commande_plat')
        .select('quantite, plat_id, plat(nom, prix, image_url, description, categorie, temps_preparation)')
        .eq('commande_id', possibleId);
      // Client
      let clientInfo: any = null;
      if (cmd.client_id) {
        const { data: clientRow } = await admin.from('compte').select('id, nom, prenom, email, numero_tel').eq('id', cmd.client_id).maybeSingle();
        clientInfo = clientRow ?? null;
      }
      return NextResponse.json({ ok: true, commande: { ...cmd, items: itemsRows || [], client: clientInfo } });
    }

    // Récupérer commande_plat pour le restaurant
    const { data: cpRows, error: cpError } = await admin
      .from('commande')
      .select('id_commande, client_id,statut, montant_total, commentaire, livraison, created_at, updated_at');

    if (cpError) {
      console.error('[API /api/gerant/commandes] erreur fetch commande_plat:', cpError);
      return NextResponse.json({ error: cpError.message || cpError }, { status: 500 });
    }

    // Rassembler les ids de commandes uniques
    const commandeIds = Array.from(new Set((cpRows || []).map((r: any) => r.commande_id)));

    // Pour chaque commande ID, récupérer les détails
    const commandes: any[] = [];
    for (const id of commandeIds) {
      const { data: cmd, error: cmdErr } = await admin
        .from('commande')
        .select('id_commande, date_commande, statut, montant_total, commentaire, livraison, created_at, updated_at, client_id')
        .eq('id_commande', id)
        .maybeSingle();

      if (cmdErr) {
        console.error('[API /api/gerant/commandes] erreur fetch commande details:', id, cmdErr);
      }

      // Récupérer les items filtrant par commande_id
      const items = (cpRows || []).filter((r: any) => r.commande_id === id).map((r: any) => ({
        id: r.plat_id,
        plat_id: r.plat_id,
        quantite: r.quantite,
        nom: r.plat?.nom,
        prix: r.plat?.prix,
        image_url: r.plat?.image_url,
      }));

      // Récupérer le client
      let clientInfo: any = null;
      try {
        if (cmd?.client_id) {
          const { data: clientRow } = await admin.from('compte').select('id, nom, prenom, email, numero_tel').eq('id', cmd.client_id).maybeSingle();
          clientInfo = clientRow ?? null;
        }
      } catch (e) {
        console.error('[API /api/gerant/commandes] erreur fetch client info:', e);
      }

      commandes.push({ ...cmd, items, client: clientInfo });
    }

    return NextResponse.json({ ok: true, commandes });
  } catch (e) {
    console.error('[API /api/gerant/commandes] Exception GET:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // delete by id in pathname
    const url = new URL(request.url);
    const segments = url.pathname.split('/');
    const id = segments.pop();

    const client = await getClientFromRequest(request);
    if (!client) return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });

    const restaurantId = await getRestaurantForGerant(client.id);
    if (!restaurantId) return NextResponse.json({ error: 'Pas de restaurant associé' }, { status: 403 });

    // Vérifier que la commande appartient au restaurant via commande_plat -> plat.restaurant_id
    const { data: cpRows, error: cpError } = await admin
      .from('commande_plat')
      .select('commande_id')
      .eq('commande_id', id)
      .filter('plat.restaurant_id', 'eq', restaurantId)
      .limit(1);

    if (cpError) {
      console.error('[API /api/gerant/commandes] erreur check commande belongs to restaurant:', cpError);
      return NextResponse.json({ error: cpError.message || cpError }, { status: 500 });
    }

    if (!(cpRows && cpRows.length > 0)) {
      return NextResponse.json({ error: 'Commande non liée à votre restaurant' }, { status: 403 });
    }

    // Logically cancel or update statut -> annule
    const { error: updateError } = await admin.from('commande').update({ statut: 'annule' }).eq('id_commande', id);
    if (updateError) {
      console.error('[API /api/gerant/commandes] erreur annulation commande:', updateError);
      return NextResponse.json({ error: updateError.message || updateError }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[API /api/gerant/commandes] Exception DELETE:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const parts = pathname.split('/');
    const last = parts.pop();
    const secondLast = parts.pop();

    const client = await getClientFromRequest(request);
    if (!client) return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });

    const restaurantId = await getRestaurantForGerant(client.id);
    if (!restaurantId) return NextResponse.json({ error: 'Pas de restaurant associé' }, { status: 403 });

    // If endpoint is .../status
    if (last === 'status') {
      const orderId = secondLast;
      const body = await request.json();
      const { statut } = body;

      // Validate belongs to restaurant
      const { data: cpRows, error: cpError } = await admin
        .from('commande_plat')
        .select('commande_id')
        .eq('commande_id', orderId)
        .filter('plat.restaurant_id', 'eq', restaurantId)
        .limit(1);

      if (cpError) {
        console.error('[API /api/gerant/commandes] erreur check commande belongs to restaurant:', cpError);
        return NextResponse.json({ error: cpError.message || cpError }, { status: 500 });
      }

      if (!(cpRows && cpRows.length > 0)) {
        return NextResponse.json({ error: 'Commande non liée à votre restaurant' }, { status: 403 });
      }

      // Update statut
      const { error: updateError, data: updated } = await admin.from('commande').update({ statut }).eq('id_commande', orderId).select().single();

      if (updateError) {
        console.error('[API /api/gerant/commandes] erreur update statut:', updateError);
        return NextResponse.json({ error: updateError.message || updateError }, { status: 500 });
      }

      return NextResponse.json({ ok: true, commande: updated });
    }

    // If endpoint is .../assign
    if (last === 'assign') {
      const orderId = secondLast;
      const body = await request.json();
      const { livreurId } = body;

      const { data: cpRows, error: cpError } = await admin
        .from('commande_plat')
        .select('commande_id')
        .eq('commande_id', orderId)
        .filter('plat.restaurant_id', 'eq', restaurantId)
        .limit(1);

      if (cpError) {
        console.error('[API /api/gerant/commandes] erreur check commande belongs to restaurant:', cpError);
        return NextResponse.json({ error: cpError.message || cpError }, { status: 500 });
      }

      if (!(cpRows && cpRows.length > 0)) {
        return NextResponse.json({ error: 'Commande non liée à votre restaurant' }, { status: 403 });
      }

      // Update livreur_id & statut
      const updates: any = { statut: 'en_livraison' };
      if (typeof livreurId === 'number' || (typeof livreurId === 'string' && livreurId.trim() !== '')) updates.livreur_id = livreurId;

      const { error: updateError, data: updated } = await admin.from('commande').update(updates).eq('id_commande', orderId).select().single();
      if (updateError) {
        console.error('[API /api/gerant/commandes] erreur assign livreur:', updateError);
        return NextResponse.json({ error: updateError.message || updateError }, { status: 500 });
      }

      return NextResponse.json({ ok: true, commande: updated });
    }

    return NextResponse.json({ error: 'Action non supportée' }, { status: 400 });
  } catch (e) {
    console.error('[API /api/gerant/commandes] Exception PATCH:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
