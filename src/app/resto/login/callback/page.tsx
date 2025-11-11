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

        // Si le compte n'est pas encore lié à un user_id, utiliser la fonction RPC
        if (!gerantData.user_id) {
          const { data: linkedAccount, error: linkError } = await supabase.rpc('link_preauthorized_account', {
            p_user_id: session.user.id,
            p_email: session.user.email!
          });

          if (linkError) {
            console.error("Erreur liaison compte:", linkError);
            await supabase.auth.signOut();
            router.push("/resto/login?error=link_error");
            return;
          }

          console.log("Compte gérant lié avec succès:", linkedAccount);
        } else {
          // Mettre à jour les informations depuis Google si nécessaire
          const fullName = session.user.user_metadata?.full_name?.split(' ') || [];
          const nom = fullName[0] || gerantData.nom;
          const prenom = fullName[1] || gerantData.prenom;

          const { error: updateError } = await supabase
            .from("compte")
            .update({
              nom,
              prenom,
              user_id: session.user.id,
            })
            .eq("id", gerantData.id);

          if (updateError) {
            console.error("Erreur mise à jour compte gérant:", updateError);
            // Continuer même en cas d'erreur de mise à jour
          }
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
