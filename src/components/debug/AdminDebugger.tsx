"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function AdminDebugger() {
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const runDebug = async () => {
      try {
        console.log("=== DEBUG ADMIN ===");
        
        // 1. Vérifier la session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log("Session:", session);
        console.log("Erreur session:", sessionError);

        // 2. Vérifier le compte admin
        if (session?.user) {
          const { data: compteData, error: compteError } = await supabase
            .from("compte")
            .select("*")
            .eq("user_id", session.user.id)
            .single();
          
          console.log("Compte admin:", compteData);
          console.log("Erreur compte:", compteError);

          // 3. Vérifier tous les comptes admin
          const { data: allAdmins, error: allAdminsError } = await supabase
            .from("compte")
            .select("*")
            .eq("role", "Administrateur");
          
          console.log("Tous les admins:", allAdmins);
          console.log("Erreur tous admins:", allAdminsError);

          setDebugInfo({
            session: session,
            sessionError: sessionError,
            compte: compteData,
            compteError: compteError,
            allAdmins: allAdmins,
            allAdminsError: allAdminsError
          });
        }
        
        console.log("=== FIN DEBUG ===");
      } catch (error) {
        console.error("Erreur debug:", error);
      }
    };

    runDebug();
  }, []);

  if (!debugInfo) {
    return <div>Chargement du debug...</div>;
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg text-xs">
      <h3 className="font-bold mb-2">Debug Admin</h3>
      <div className="space-y-2">
        <div>
          <strong>Session:</strong> {debugInfo.session ? "✅ Trouvée" : "❌ Non trouvée"}
        </div>
        <div>
          <strong>Email:</strong> {debugInfo.session?.user?.email || "N/A"}
        </div>
        <div>
          <strong>User ID:</strong> {debugInfo.session?.user?.id || "N/A"}
        </div>
        <div>
          <strong>Compte:</strong> {debugInfo.compte ? "✅ Trouvé" : "❌ Non trouvé"}
        </div>
        <div>
          <strong>Rôle:</strong> {debugInfo.compte?.role || "N/A"}
        </div>
        <div>
          <strong>Total Admins:</strong> {debugInfo.allAdmins?.length || 0}
        </div>
        {debugInfo.compteError && (
          <div className="text-red-600">
            <strong>Erreur compte:</strong> {debugInfo.compteError.message}
          </div>
        )}
      </div>
    </div>
  );
}
