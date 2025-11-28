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
    console.log("=== Vérification des créneaux dépassés ===");
    
    // Appeler la fonction SQL pour vérifier les créneaux dépassés
    const { data, error } = await admin.rpc('check_creneaux_depasses');
    
    if (error) {
      console.error("Erreur lors de la vérification des créneaux:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log("Vérification des créneaux terminée avec succès");
    return NextResponse.json({ 
      success: true, 
      message: "Vérification des créneaux dépassés effectuée" 
    });
    
  } catch (error) {
    console.error("Exception lors de la vérification des créneaux:", error);
    return NextResponse.json({ 
      error: "Erreur interne du serveur" 
    }, { status: 500 });
  }
}

// Endpoint GET pour les tâches cron
export async function GET() {
  return POST();
}