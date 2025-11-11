"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AdminLoginCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("Début du callback admin...");
        
        // Récupérer la session après la redirection OAuth
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Erreur session:", sessionError);
          router.push("/admin/login?error=auth_error");
          return;
        }

        if (!session?.user) {
          console.error("Aucune session trouvée");
          router.push("/admin/login?error=no_session");
          return;
        }

        console.log("Session trouvée pour:", session.user.email);

        // Vérifier si l'email correspond à l'admin autorisé
        const adminEmail = "joantsayem@gmail.com";
        if (session.user.email !== adminEmail) {
          console.error("Email non autorisé:", session.user.email);
          await supabase.auth.signOut();
          router.push("/admin/login?error=unauthorized");
          return;
        }

        console.log("Email autorisé, traitement du compte...");

        // Approche simplifiée : vérifier d'abord si le compte existe
        let adminAccount = null;

        try {
          // Essayer de récupérer le compte par user_id
          const { data: existingByUserId } = await supabase
            .from("compte")
            .select("*")
            .eq("user_id", session.user.id)
            .single();

          if (existingByUserId) {
            console.log("Compte trouvé par user_id:", existingByUserId);
            adminAccount = existingByUserId;
          }
        } catch {
          console.log("Aucun compte trouvé par user_id");
        }

        // Si pas trouvé par user_id, essayer par email
        if (!adminAccount) {
          try {
            const { data: existingByEmail } = await supabase
              .from("compte")
              .select("*")
              .eq("email", session.user.email!)
              .single();

            if (existingByEmail) {
              console.log("Compte trouvé par email:", existingByEmail);
              adminAccount = existingByEmail;
            }
          } catch {
            console.log("Aucun compte trouvé par email");
          }
        }

        // Si le compte existe, le mettre à jour
        if (adminAccount) {
          const updates: Record<string, string> = {};
          
          // Mettre à jour le user_id si nécessaire
          if (adminAccount.user_id !== session.user.id) {
            updates.user_id = session.user.id;
          }
          
          // Mettre à jour le rôle si nécessaire
          if (adminAccount.role !== "Administrateur") {
            updates.role = "Administrateur";
          }

          // Mettre à jour les informations personnelles depuis Google
          const fullName = session.user.user_metadata?.full_name?.split(' ') || [];
          if (fullName.length >= 2) {
            updates.nom = fullName[0];
            updates.prenom = fullName[1];
          }

          if (Object.keys(updates).length > 0) {
            console.log("Mise à jour du compte avec:", updates);
            const { error: updateError } = await supabase
              .from("compte")
              .update(updates)
              .eq("id", adminAccount.id);

            if (updateError) {
              console.error("Erreur mise à jour:", updateError);
              // Continuer même en cas d'erreur de mise à jour
            } else {
              console.log("Compte mis à jour avec succès");
            }
          }
        } else {
          // Si aucun compte trouvé, essayer de le créer via RPC mais continuer même si ça échoue
          console.log("Aucun compte trouvé, tentative de création...");
          
          try {
            const fullName = session.user.user_metadata?.full_name?.split(' ') || [];
            const nom = fullName[0] || "Admin";
            const prenom = fullName[1] || "Root";

            const { data: rpcResult, error: rpcError } = await supabase.rpc('create_user_account', {
              p_user_id: session.user.id,
              p_nom: nom,
              p_prenom: prenom,
              p_email: session.user.email!,
              p_role: 'Administrateur'
            });

            if (rpcError) {
              console.error("Erreur RPC:", rpcError);
              console.log("Impossible de créer le compte automatiquement, mais l'admin peut quand même accéder au dashboard");
            } else {
              console.log("Compte créé via RPC:", rpcResult);
            }
          } catch {
            console.log("RPC non disponible, mais l'admin peut quand même accéder au dashboard");
          }
        }

        console.log("Compte admin configuré avec succès - redirection vers /admin");

        // --- Envoi des tokens au serveur pour créer un cookie HTTP-only ---
        try {
          console.log("Tentative d'envoi des tokens au serveur...");
          const res = await fetch("/api/admin/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              access_token: session.access_token,
              refresh_token: session.refresh_token,
            }),
          });

          if (!res.ok) {
            // Log plus d'infos pour faciliter le debug côté client
            const text = await res.text().catch(() => "(no body)");
            console.error("Erreur création cookie session:", res.status, text);
            // On n'empêche pas la redirection locale : la session Supabase côté client reste active
          } else {
            console.log("Cookie de session créé côté serveur");
          }
        } catch (err) {
          console.error("Impossible de joindre /api/admin/session:", err);
          // continuer la redirection malgré l'échec de la création du cookie
        }

        // Attendre un peu pour que la session soit bien synchronisée
        console.log("⏳ Attente de 500ms pour synchronisation de la session...");
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Redirection vers le dashboard admin
        console.log("🚀 EXECUTION DE router.push('/admin')");
        router.push("/admin");
        console.log("✅ router.push('/admin') exécuté");

      } catch (error) {
        console.error("Erreur callback:", error);
        router.push("/admin/login?error=callback_error");
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
  <p className="text-muted-foreground">Vérification de l’authentification...</p>
      </div>
    </div>
  );
}