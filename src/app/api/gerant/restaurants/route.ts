import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const auth = request.headers.get("authorization") || request.headers.get("Authorization");
    if (!auth || !auth.toLowerCase().startsWith("bearer ")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const token = auth.slice(7);

    const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      return NextResponse.json({ error: "Configuration serveur manquante" }, { status: 500 });
    }

    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

    // Vérifier l'utilisateur à partir du token
    const { data: userRes, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userRes?.user) {
      return NextResponse.json({ error: "Session invalide" }, { status: 401 });
    }

    const { nom, localisation } = (await request.json()) as { nom?: string; localisation?: string | null };
    if (!nom?.trim()) {
      return NextResponse.json({ error: "Nom requis" }, { status: 400 });
    }

    // Récupérer le compte gérant lié à cet utilisateur
    const { data: compte, error: compteError } = await admin
      .from("compte")
      .select("id, role")
      .eq("user_id", userRes.user.id)
      .single();

    if (compteError || !compte || compte.role !== "Gerant") {
      return NextResponse.json({ error: "Accès réservé au gérant" }, { status: 403 });
    }

    // Vérifier s'il n'existe pas déjà un restaurant
    const { data: existing } = await admin
      .from("restaurant")
      .select("id_restaurant")
      .eq("gerant_id", compte.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Restaurant déjà existant" }, { status: 409 });
    }

    const { data: created, error: insertError } = await admin
      .from("restaurant")
      .insert({ nom: nom.trim(), localisation: localisation || null, gerant_id: compte.id })
      .select("id_restaurant")
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message ?? "Erreur lors de la création" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id_restaurant: created?.id_restaurant, gerant_id: compte.id }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
