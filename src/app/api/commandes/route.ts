import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getClientFromRequest } from "@/lib/supabase-server";
import type { NextRequest } from "next/server";

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !serviceKey) {
  console.error("Supabase URL or service key missing for API /api/commandes");
  throw new Error("Configuration Supabase manquante");
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

export async function POST(request: NextRequest) {
  try {
    console.log("=== POST /api/commandes ===");
    console.log("Headers:", {
      authorization: request.headers.get("authorization") ? "présent" : "absent",
      cookie: request.headers.get("cookie") ? "présent" : "absent",
    });
    
    // Vérifier l'authentification et récupérer les informations du client
    const client = await getClientFromRequest(request);
    console.log("Client récupéré:", client ? `ID: ${client.id}, ${client.prenom} ${client.nom}` : "null")
    
    if (!client) {
      console.error("Authentification échouée - client null");
      return NextResponse.json(
        { error: "Authentification requise. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { items, commentaire = null, livraison = false, creneau_retrait = null } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "items requis" }, { status: 400 });
    }

    // Insérer une commande avec le client_id
    const { data: commandeData, error: cmdErr } = await admin
      .from("commande")
      .insert({
        client_id: client.id,
        commentaire,
        livraison,
        creneau_retrait,
      })
      .select("id_commande")
      .single();

    if (cmdErr || !commandeData) {
      console.error("Erreur insertion commande:", cmdErr);
      return NextResponse.json({ error: cmdErr?.message ?? "Erreur insertion commande" }, { status: 500 });
    }

    const commandeId = commandeData.id_commande;

    // Pour chaque item, résoudre le plat (UUID) depuis la table plat en utilisant le nom fourni
    const rowsToInsert: Array<{ commande_id: string; plat_id: string; quantite: number }> = [];

    for (const it of items) {
      const name = String(it.name ?? "").trim();
      const quantity = Number(it.quantity ?? it.quantite ?? 1) || 1;
      if (!name) {
        return NextResponse.json({ error: "Chaque item doit contenir un champ 'name'" }, { status: 400 });
      }

      const { data: platRow, error: platErr } = await admin
        .from("plat")
        .select("id")
        .ilike("nom", `%${name}%`)
        .maybeSingle();
      
      if (platErr || !platRow) {
        console.error("Plat introuvable:", name, platErr);
        // Essayer une recherche par égalité exacte comme dernier recours
        const { data: exactMatch } = await admin.from("plat").select("id").eq("nom", name).maybeSingle();
        if (!exactMatch) {
          return NextResponse.json({ error: `Plat introuvable: ${name}. Vérifiez que le plat existe en BD.` }, { status: 400 });
        }
        rowsToInsert.push({ commande_id: commandeId, plat_id: exactMatch.id, quantite: quantity });
      } else {
        rowsToInsert.push({ commande_id: commandeId, plat_id: platRow.id, quantite: quantity });
      }
    }

    // Inserer les lignes commande_plat
    const { error: insRowsErr } = await admin.from("commande_plat").insert(rowsToInsert);
    if (insRowsErr) {
      console.error("Erreur insertion commande_plat:", insRowsErr);
      return NextResponse.json({ error: insRowsErr.message ?? "Erreur insertion items" }, { status: 500 });
    }

    // Récupérer la commande finalisée (avec montant recalculé par trigger)
    const { data: finalCmd, error: finalErr } = await admin
      .from("commande")
      .select(
        `id_commande, date_commande, statut, montant_total, commentaire, livraison, created_at, updated_at`
      )
      .eq("id_commande", commandeId)
      .single();

    if (finalErr || !finalCmd) {
      console.error("Erreur récupération commande:", finalErr);
      return NextResponse.json({ error: finalErr?.message ?? "Erreur récupération commande" }, { status: 500 });
    }

    // Récupérer les items avec infos plats pour l'affichage (incluant description, categorie, temps_preparation)
    const { data: itemsData, error: itemsErr } = await admin
      .from("commande_plat")
      .select("quantite, plat_id, plat(nom, prix, image_url, description, categorie, temps_preparation)")
      .eq("commande_id", commandeId);

    if (itemsErr) {
      console.error("Erreur récupération items:", itemsErr);
    }

    const response = {
      ...finalCmd,
      items: itemsData ?? [],
      // Ajouter les informations du client
      client: {
        id: client.id,
        nom: client.nom,
        prenom: client.prenom,
        email: client.email,
        numero_tel: client.numero_tel,
      },
    };

    return NextResponse.json({ ok: true, commande: response }, { status: 201 });
  } catch (e) {
    console.error("Exception POST /api/commandes:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification et récupérer les informations du client
    const client = await getClientFromRequest(request);

    if (!client) {
      return NextResponse.json(
        { error: "Authentification requise. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    // Récupérer uniquement les commandes du client authentifié
    const { data: commandes, error } = await admin
      .from("commande")
      .select("id_commande, date_commande, statut, montant_total, commentaire, livraison, created_at")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Erreur fetch commandes:", error);
      return NextResponse.json({ error: error.message ?? "Erreur lecture commandes" }, { status: 500 });
    }

    // Pour chaque commande, récupérer les items avec toutes les infos plats
    const results: any[] = [];
    for (const c of commandes ?? []) {
      const { data: itemsData, error: itemsErr } = await admin
        .from("commande_plat")
        .select("quantite, id, plat_id, plat(nom, prix, image_url, description, categorie, temps_preparation)")
        .eq("commande_id", c.id_commande);

      if (itemsErr) {
        console.error("Erreur fetch commande_plat pour", c.id_commande, itemsErr);
      }

      results.push({
        ...c,
        items: itemsData ?? [],
        // Ajouter les informations du client
        client: {
          id: client.id,
          nom: client.nom,
          prenom: client.prenom,
          email: client.email,
          numero_tel: client.numero_tel,
        },
      });
    }

    return NextResponse.json({ ok: true, commandes: results });
  } catch (e) {
    console.error("Exception GET /api/commandes:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
