/**
 * Utilitaire de débogage pour l'authentification admin
 * À utiliser temporairement pour diagnostiquer les problèmes
 */

import { supabase } from "@/lib/supabaseClient";

export class AuthDebugger {
  /**
   * Vérifie l'état de la base de données pour l'admin
   */
  static async checkAdminDatabaseState() {
    console.log("=== DEBUG: État de la base de données admin ===");
    
    try {
      // Vérifier tous les comptes avec l'email admin
      const { data: adminAccounts, error: adminError } = await supabase
        .from("compte")
        .select("*")
        .eq("email", "joantsayem@gmail.com");

      if (adminError) {
        console.error("Erreur récupération comptes admin:", adminError);
      } else {
        console.log("Comptes admin trouvés:", adminAccounts);
      }

      // Vérifier tous les comptes administrateurs
      const { data: allAdmins, error: adminsError } = await supabase
        .from("compte")
        .select("*")
        .eq("role", "Administrateur");

      if (adminsError) {
        console.error("Erreur récupération administrateurs:", adminsError);
      } else {
        console.log("Tous les administrateurs:", allAdmins);
      }

      // Vérifier la session actuelle
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Erreur session:", sessionError);
      } else if (session?.user) {
        console.log("Session actuelle:", {
          id: session.user.id,
          email: session.user.email,
          metadata: session.user.user_metadata
        });

        // Vérifier le compte lié à cette session
        const { data: linkedAccount, error: linkedError } = await supabase
          .from("compte")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        if (linkedError) {
          console.error("Erreur compte lié:", linkedError);
        } else {
          console.log("Compte lié à la session:", linkedAccount);
        }
      } else {
        console.log("Aucune session active");
      }

    } catch (error) {
      console.error("Erreur générale debug:", error);
    }
    
    console.log("=== FIN DEBUG ===");
  }

  /**
   * Nettoie les comptes admin en double (à utiliser avec précaution)
   */
  static async cleanupDuplicateAdminAccounts() {
    console.log("=== DEBUG: Nettoyage des comptes admin en double ===");
    
    try {
      // Récupérer tous les comptes admin
      const { data: adminAccounts, error } = await supabase
        .from("compte")
        .select("*")
        .eq("email", "joantsayem@gmail.com")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Erreur récupération comptes:", error);
        return;
      }

      console.log("Comptes admin trouvés:", adminAccounts);

      if (adminAccounts && adminAccounts.length > 1) {
        console.log("Comptes en double détectés, suppression des doublons...");
        
        // Garder le premier compte, supprimer les autres
        const accountsToDelete = adminAccounts.slice(1);
        
        for (const account of accountsToDelete) {
          const { error: deleteError } = await supabase
            .from("compte")
            .delete()
            .eq("id", account.id);

          if (deleteError) {
            console.error(`Erreur suppression compte ${account.id}:`, deleteError);
          } else {
            console.log(`Compte ${account.id} supprimé`);
          }
        }
      } else {
        console.log("Aucun doublon détecté");
      }

    } catch (error) {
      console.error("Erreur nettoyage:", error);
    }
    
    console.log("=== FIN NETTOYAGE ===");
  }

  /**
   * Force la création d'un compte admin (à utiliser avec précaution)
   */
  static async forceCreateAdminAccount(userId: string, email: string) {
    console.log("=== DEBUG: Création forcée compte admin ===");
    
    try {
      const { data, error } = await supabase
        .from("compte")
        .insert({
          user_id: userId,
          nom: "Admin",
          prenom: "Root",
          email: email,
          role: "Administrateur",
        })
        .select()
        .single();

      if (error) {
        console.error("Erreur création forcée:", error);
      } else {
        console.log("Compte admin créé avec succès:", data);
      }

    } catch (error) {
      console.error("Erreur générale création forcée:", error);
    }
    
    console.log("=== FIN CRÉATION FORCÉE ===");
  }
}

// Fonction globale pour le débogage (à supprimer en production)
if (typeof window !== 'undefined') {
  (window as any).authDebugger = AuthDebugger;
}
