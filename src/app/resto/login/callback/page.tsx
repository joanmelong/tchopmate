"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function RestoLoginCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Récupérer la session après la redirection OAuth
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Erreur session:", sessionError);
          router.push("/resto/login?error=auth_error");
          return;
        }

        if (!session?.user) {
          router.push("/resto/login?error=no_session");
          return;
        }

        // Vérifier si l'email correspond à un gérant autorisé
        const { data: gerantData, error: gerantError } = await supabase
          .from("compte")
          .select("id, email, role, nom, prenom, user_id")
          .eq("email", session.user.email)
          .eq("role", "Gerant")
          .single();

        if (gerantError || !gerantData) {
          // Déconnecter l'utilisateur s'il n'est pas autorisé
          await supabase.auth.signOut();
          router.push("/resto/login?error=unauthorized");
          return;
        }

        // Mettre à jour le user_id et les informations depuis Google
        console.log("Mise à jour du compte gérant...");
        const fullName = session.user.user_metadata?.full_name?.split(' ') || [];
        const updates: Record<string, string> = {
          user_id: session.user.id,
        };
        
        // Mettre à jour nom/prénom seulement s'ils sont disponibles depuis Google
        if (fullName.length >= 1 && fullName[0]) {
          updates.nom = fullName[0];
        }
        if (fullName.length >= 2 && fullName[1]) {
          updates.prenom = fullName[1];
        }

        const { error: updateError } = await supabase
          .from("compte")
          .update(updates)
          .eq("id", gerantData.id);

        if (updateError) {
          console.error("Erreur mise à jour compte gérant:", updateError);
          // Si l'erreur est due aux RLS, utiliser l'API serveur
          try {
            const res = await fetch("/api/gerant/link-account", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                gerant_id: gerantData.id,
                user_id: session.user.id,
                nom: updates.nom,
                prenom: updates.prenom,
              }),
            });

            if (!res.ok) {
              console.error("Erreur API link-account:", await res.text());
              // Continuer même en cas d'erreur
            } else {
              console.log("Compte gérant lié avec succès via API");
            }
          } catch (apiError) {
            console.error("Erreur appel API link-account:", apiError);
            // Continuer même en cas d'erreur
          }
        } else {
          console.log("Compte gérant mis à jour avec succès");
        }

        // Vérifier si le gérant a déjà un restaurant
        const { data: restaurantData } = await supabase
          .from("restaurant")
          .select("id_restaurant")
          .eq("gerant_id", gerantData.id)
          .single();

        if (restaurantData) {
          // Restaurant existe, aller au tableau de bord
          router.push(`/resto/${gerantData.id}`);
        } else {
          // Première connexion, créer le restaurant
          router.push("/resto/create-resto");
        }
      } catch (error) {
        console.error("Erreur callback:", error);
        router.push("/resto/login?error=callback_error");
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
  <p className="text-muted-foreground">Vérification de l&apos;authentification...</p>
      </div>
    </div>
  );
}
