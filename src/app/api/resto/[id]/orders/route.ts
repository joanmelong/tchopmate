import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !serviceKey) {
  throw new Error("Configuration Supabase manquante");
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gerantId = params.id; // C'est l'ID du gérant (compte.id)
    console.log("=== API /resto/[id]/orders ===");
    console.log("Gérant ID (compte.id):", gerantId);

    // Étape 1: Trouver le restaurant du gérant
    const { data: restaurant, error: errorRestaurant } = await admin
      .from("restaurant")
      .select("id_restaurant, nom")
      .eq("gerant_id", gerantId)
      .single();

    if (errorRestaurant || !restaurant) {
      console.error("Erreur: Restaurant non trouvé pour le gérant", gerantId, errorRestaurant);
      return NextResponse.json({ 
        error: "Restaurant non trouvé pour ce gérant",
        commandes: [],
        debug: { gerantId, error: errorRestaurant?.message }
      }, { status: 404 });
    }

    const restaurantId = restaurant.id_restaurant;
    console.log("Restaurant trouvé:", restaurant.nom, "ID:", restaurantId);

    // Récupérer toutes les commandes
    const { data: commandes, error: errorCommandes } = await admin
      .from("commande")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (errorCommandes) {
      console.error("Erreur chargement commandes:", errorCommandes);
      return NextResponse.json({ error: errorCommandes.message }, { status: 500 });
    }

    console.log("Nombre de commandes trouvées:", commandes?.length || 0);

    if (!commandes || commandes.length === 0) {
      console.log("Aucune commande dans la base");
      return NextResponse.json({ commandes: [], debug: { message: "Aucune commande" } });
    }

    // Récupérer tous les commande_plat
    const commandeIds = commandes.map(c => c.id_commande);
    console.log("IDs des commandes:", commandeIds);
    
    const { data: commandePlats, error: errorCP } = await admin
      .from("commande_plat")
      .select("*")
      .in("commande_id", commandeIds);

    if (errorCP) {
      console.error("Erreur chargement commande_plat:", errorCP);
    }
    
    console.log("Nombre de commande_plat trouvés:", commandePlats?.length || 0);
    if (commandePlats && commandePlats.length > 0) {
      console.log("Exemple commande_plat:", commandePlats[0]);
    }

    // Récupérer tous les plats
    const platIds = [...new Set(commandePlats?.map(cp => cp.plat_id) || [])];
    console.log("IDs des plats:", platIds);
    
    const { data: plats, error: errorPlats } = await admin
      .from("plat")
      .select("*")
      .in("id", platIds);

    if (errorPlats) {
      console.error("Erreur chargement plats:", errorPlats);
    }
    
    console.log("Nombre de plats trouvés:", plats?.length || 0);
    if (plats && plats.length > 0) {
      console.log("Exemple plat:", plats[0]);
      console.log("Restaurant IDs des plats:", plats.map(p => p.restaurant_id));
    }

    // Récupérer les infos clients
    const clientIds = [...new Set(commandes.map(c => c.client_id).filter(Boolean))];
    const { data: clients, error: errorClients } = await admin
      .from("compte")
      .select("*")
      .in("id", clientIds);

    if (errorClients) {
      console.error("Erreur chargement clients:", errorClients);
    }

    // Filtrer et transformer les commandes pour ce restaurant
    const commandesRestaurant = commandes
      .map((cmd: { id_commande: number; client_id: number; statut: string; montant_total: number; created_at: string; creneau_id?: number }) => {
        const cmdPlats = commandePlats?.filter(cp => cp.commande_id === cmd.id_commande) || [];
        
        // Vérifier si au moins un plat appartient au restaurant
        const platsRestaurant = cmdPlats.filter(cp => {
          const plat = plats?.find(p => p.id === cp.plat_id);
          const match = plat?.restaurant_id === restaurantId || String(plat?.restaurant_id) === String(restaurantId);
          if (cmdPlats.length > 0) {
            console.log(`Commande ${cmd.id_commande}: plat ${plat?.nom}, restaurant_id=${plat?.restaurant_id} vs ${restaurantId}, match=${match}`);
          }
          return match;
        });

        if (platsRestaurant.length === 0) {
          console.log(`Commande ${cmd.id_commande} filtrée (pas de plats du restaurant ${restaurantId})`);
          return null;
        }
        
        console.log(`Commande ${cmd.id_commande} gardée (${platsRestaurant.length} plats du restaurant)`);


        const client = clients?.find(c => c.id === cmd.client_id);
        
        console.log(`Client pour commande ${cmd.id_commande}:`, {
          client_id: cmd.client_id,
          client_trouve: !!client,
          nom: client?.nom,
          prenom: client?.prenom,
        });
        
        const items = platsRestaurant.map((cp: { commande_id: number; plat_id: number; quantite: number }) => {
          const plat = plats?.find(p => p.id === cp.plat_id);
          return {
            name: plat?.nom || "Plat",
            qty: cp.quantite || 1,
            price: plat?.prix || 0,
          };
        });

        return {
          id_commande: cmd.id_commande,
          date_commande: cmd.date_commande,
          statut: cmd.statut,
          montant_total: cmd.montant_total,
          created_at: cmd.created_at,
          client: {
            id: cmd.client_id,
            nom: client?.nom || "",
            prenom: client?.prenom || "",
            numero_tel: client?.numero_tel || "",
          },
          items,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ 
      commandes: commandesRestaurant,
      debug: {
        total_commandes: commandes.length,
        total_commande_plat: commandePlats?.length || 0,
        total_plats: plats?.length || 0,
        commandes_restaurant: commandesRestaurant.length,
      }
    });
  } catch (e) {
    console.error("Exception GET /api/resto/[id]/orders:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
