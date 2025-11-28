import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !serviceKey) {
  throw new Error("Configuration Supabase manquante");
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

export async function POST() {
  try {
    console.log("=== Duplication des créneaux quotidiens ===");
    
    // Appeler la fonction SQL pour dupliquer les créneaux si nécessaire
    const { data, error } = await admin.rpc('duplicate_creneaux_if_needed');
    
    if (error) {
      console.error("Erreur lors de la duplication des créneaux:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log("Duplication des créneaux terminée avec succès");
    return NextResponse.json({ 
      success: true, 
      message: "Duplication des créneaux effectuée si nécessaire" 
    });
    
  } catch (error) {
    console.error("Exception lors de la duplication des créneaux:", error);
    return NextResponse.json({ 
      error: "Erreur interne du serveur" 
    }, { status: 500 });
  }
}

// Endpoint GET pour les tâches cron
export async function GET() {
  return POST();
}