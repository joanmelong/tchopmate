import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { gerant_id, user_id, nom, prenom } = (await request.json()) as {
      gerant_id?: number;
      user_id?: string;
      nom?: string;
      prenom?: string;
    };

    console.log("[API /gerant/link-account] Requête reçue:", { gerant_id, user_id, nom, prenom });

    if (!gerant_id || !user_id) {
      return NextResponse.json({ error: "gerant_id et user_id requis" }, { status: 400 });
    }

    const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      console.error("[API /gerant/link-account] Configuration Supabase manquante");
      return NextResponse.json({ error: "Configuration serveur manquante" }, { status: 500 });
    }

    const admin = createClient(url, serviceKey, {
      auth: { persistSession: false },
    });

    // Construire l'objet de mise à jour
    const updates: Record<string, string> = { user_id };
    if (nom) updates.nom = nom;
    if (prenom) updates.prenom = prenom;

    console.log("[API /gerant/link-account] Mise à jour:", updates);

    // Mettre à jour le compte
    const { data, error } = await admin
      .from("compte")
      .update(updates)
      .eq("id", gerant_id)
      .eq("role", "Gerant")
      .select()
      .single();

    if (error) {
      console.error("[API /gerant/link-account] Erreur mise à jour:", error);
      return NextResponse.json({ error: error.message ?? "Erreur lors de la liaison" }, { status: 500 });
    }

    console.log("[API /gerant/link-account] Compte lié avec succès:", data);
    return NextResponse.json({ ok: true, compte: data }, { status: 200 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[API /gerant/link-account] Exception:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
