import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    console.log("[API /admin/gerants] Début de la requête");
    
    const { email, nom, prenom } = (await request.json()) as {
      email?: string;
      nom?: string;
      prenom?: string;
    };

    console.log("[API /admin/gerants] Email reçu:", email);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.log("[API /admin/gerants] Email invalide");
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log("[API /admin/gerants] URL présente:", !!url);
    console.log("[API /admin/gerants] Service key présente:", !!serviceKey);
    console.log("[API /admin/gerants] NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("[API /admin/gerants] SUPABASE_URL:", process.env.SUPABASE_URL);
    
    if (!url || !serviceKey) {
      console.error("[API /admin/gerants] Configuration manquante - URL:", !!url, "ServiceKey:", !!serviceKey);
      return NextResponse.json({ error: "SUPABASE non configuré côté serveur (URL ou clé service manquante)" }, { status: 500 });
    }

    const admin = createClient(url, serviceKey, {
      auth: { persistSession: false },
    });

    console.log("[API /admin/gerants] Client Supabase créé");

    // Vérifier si un compte existe déjà avec cet email
    const { data: existing, error: checkError } = await admin
      .from("compte")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    console.log("[API /admin/gerants] Vérification existence - existing:", !!existing, "error:", checkError?.message);

    if (checkError) {
      console.error("[API /admin/gerants] Erreur vérification:", checkError);
      return NextResponse.json({ error: checkError.message ?? "Erreur de vérification" }, { status: 500 });
    }

    if (existing) {
      console.log("[API /admin/gerants] Compte déjà existant");
      return NextResponse.json({ error: "Un compte avec cette adresse email existe déjà" }, { status: 409 });
    }

    console.log("[API /admin/gerants] Calcul du prochain ID...");

    // Récupérer le dernier ID de gérant (>= 5000)
    const { data: lastGerant, error: lastError } = await admin
      .from("compte")
      .select("id")
      .eq("role", "Gerant")
      .gte("id", 5000)
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastError) {
      console.error("[API /admin/gerants] Erreur récupération dernier ID:", lastError);
      return NextResponse.json({ error: "Erreur lors du calcul de l'ID" }, { status: 500 });
    }

    const nextId = lastGerant ? lastGerant.id + 1 : 5000;
    console.log("[API /admin/gerants] Prochain ID:", nextId);

    console.log("[API /admin/gerants] Tentative d'insertion...");

    // Créer le gérant avec l'ID spécifique et user_id NULL (sera rempli lors de la connexion Google)
    const { data: created, error: insertError } = await admin
      .from("compte")
      .insert({
        id: nextId,
        nom: nom || "Gérant",
        prenom: prenom || "Nouveau",
        email: email,
        role: "Gerant",
        user_id: null, // Sera rempli lors de la première connexion Google
      })
      .select()
      .single();

    if (insertError) {
      console.error("[API /admin/gerants] Erreur insertion:", insertError);
      return NextResponse.json({ error: insertError.message ?? "Erreur lors de la création du gérant" }, { status: 500 });
    }

    // Provisionner également l'utilisateur dans Auth pour éviter l'erreur 'Database error saving new user' au premier OAuth
    try {
      console.log("[API /admin/gerants] Provisionnement utilisateur Auth pour:", email);
      const { data: authUser, error: authErr } = await admin.auth.admin.createUser({
        email: email,
        email_confirm: true,
        user_metadata: { role: "Gerant", preauthorized: true },
      });
      if (authErr) {
        // Si l'utilisateur existe déjà, on ignore
        console.warn("[API /admin/gerants] createUser a échoué (ignoré):", authErr);
      } else {
        console.log("[API /admin/gerants] Utilisateur Auth provisionné:", authUser?.user?.id);
      }
    } catch (e) {
      console.warn("[API /admin/gerants] Exception createUser (ignorée):", e);
    }

    console.log("[API /admin/gerants] Gérant créé avec succès:", created);
    return NextResponse.json({ ok: true, gerant: created }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[API /admin/gerants] Exception non gérée:", msg, e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
