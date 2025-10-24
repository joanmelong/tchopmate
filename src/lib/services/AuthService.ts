/**
 * Service métier pour l'authentification et la gestion des sessions
 * 
 * Ce service encapsule toute la logique d'authentification :
 * - Vérification des rôles utilisateur
 * - Gestion des sessions admin et gérant
 * - Validation des autorisations
 */

import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";

export interface UserProfile {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  numero_tel?: string;
  role: "Client" | "Gerant" | "Administrateur";
  user_id: string;
}

export class AuthService {
  /**
   * Vérifie si l'utilisateur actuel est un administrateur
   * @returns Promise<boolean> - True si l'utilisateur est admin
   */
  static async isAdmin(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return false;
      }

      // Vérifier le rôle admin ET l'email autorisé
      const { data: compteData } = await supabase
        .from("compte")
        .select("role, email")
        .eq("user_id", session.user.id)
        .single();

      return compteData?.role === "Administrateur" && 
             compteData?.email === "joantsayem@gmail.com";
    } catch (error) {
      console.error("Erreur vérification admin:", error);
      return false;
    }
  }

  /**
   * Vérifie si l'utilisateur actuel est un gérant
   * @returns Promise<boolean> - True si l'utilisateur est gérant
   */
  static async isGerant(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return false;
      }

      const { data: compteData } = await supabase
        .from("compte")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      return compteData?.role === "Gerant";
    } catch (error) {
      console.error("Erreur vérification gérant:", error);
      return false;
    }
  }

  /**
   * Récupère le profil de l'utilisateur connecté
   * @returns Promise<UserProfile | null> - Le profil utilisateur ou null
   */
  static async getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return null;
      }

      const { data: compteData, error } = await supabase
        .from("compte")
        .select("id, nom, prenom, email, numero_tel, role, user_id")
        .eq("user_id", session.user.id)
        .single();

      if (error) {
        console.error("Erreur récupération profil:", error);
        return null;
      }

      return compteData;
    } catch (error) {
      console.error("Erreur inattendue récupération profil:", error);
      return null;
    }
  }

  /**
   * Vérifie si l'utilisateur connecté peut accéder à un gérant spécifique
   * @param gerantId - ID du gérant
   * @returns Promise<boolean> - True si l'accès est autorisé
   */
  static async canAccessGerant(gerantId: string): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return false;
      }

      // Un admin peut accéder à tous les gérants
      const isAdmin = await this.isAdmin();
      if (isAdmin) {
        return true;
      }

      // Un gérant ne peut accéder qu'à son propre compte
      const { data: compteData } = await supabase
        .from("compte")
        .select("id, role")
        .eq("user_id", session.user.id)
        .single();

      return compteData?.role === "Gerant" && 
             compteData?.id.toString() === gerantId;
    } catch (error) {
      console.error("Erreur vérification accès gérant:", error);
      return false;
    }
  }

  /**
   * Déconnecte l'utilisateur actuel
   * @returns Promise<void>
   */
  static async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      throw new Error("Erreur lors de la déconnexion");
    }
  }

  /**
   * Lance l'authentification Google pour les administrateurs
   * @returns Promise<void>
   */
  static async signInWithGoogleAdmin(): Promise<void> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/admin/login/callback`,
          scopes: "openid email profile",
        },
      });

      if (error) {
        throw new Error(`Erreur Google Auth: ${error.message}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Une erreur inattendue s'est produite lors de l'authentification");
    }
  }

  /**
   * Lance l'authentification Google pour les gérants
   * @returns Promise<void>
   */
  static async signInWithGoogleGerant(): Promise<void> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/resto/login/callback`,
          scopes: "openid email profile",
        },
      });

      if (error) {
        throw new Error(`Erreur Google Auth: ${error.message}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Une erreur inattendue s'est produite lors de l'authentification");
    }
  }

  /**
   * Traite le callback d'authentification Google pour les admins
   * @returns Promise<UserProfile> - Le profil admin créé/mis à jour
   */
  static async handleAdminCallback(): Promise<UserProfile> {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        throw new Error("Session non trouvée");
      }

      // Vérifier que l'email correspond à l'admin autorisé
      if (session.user.email !== "joantsayem@gmail.com") {
        await supabase.auth.signOut();
        throw new Error("Email non autorisé pour l'administration");
      }

      // Vérifier ou créer le compte admin
      const { data: existingCompte } = await supabase
        .from("compte")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (!existingCompte) {
        // Créer le compte admin
        const fullName = session.user.user_metadata?.full_name?.split(' ') || [];
        const nom = fullName[0] || "Admin";
        const prenom = fullName[1] || "Root";

        const { data: newCompte, error: insertError } = await supabase
          .from("compte")
          .insert({
            user_id: session.user.id,
            nom,
            prenom,
            email: session.user.email!,
            role: "Administrateur",
          })
          .select()
          .single();

        if (insertError) {
          throw new Error(`Erreur création compte admin: ${insertError.message}`);
        }

        return newCompte;
      } else {
        // Mettre à jour le rôle si nécessaire
        if (existingCompte.role !== "Administrateur") {
          const { data: updatedCompte, error: updateError } = await supabase
            .from("compte")
            .update({ role: "Administrateur" })
            .eq("id", existingCompte.id)
            .select()
            .single();

          if (updateError) {
            throw new Error(`Erreur mise à jour rôle: ${updateError.message}`);
          }

          return updatedCompte;
        }

        return existingCompte;
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Une erreur inattendue s'est produite lors du traitement du callback");
    }
  }

  /**
   * Traite le callback d'authentification Google pour les gérants
   * @returns Promise<UserProfile> - Le profil gérant
   */
  static async handleGerantCallback(): Promise<UserProfile> {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        throw new Error("Session non trouvée");
      }

      // Vérifier si l'email correspond à un gérant autorisé
      const { data: gerantData, error: gerantError } = await supabase
        .from("compte")
        .select("*")
        .eq("email", session.user.email)
        .eq("role", "Gerant")
        .single();

      if (gerantError || !gerantData) {
        await supabase.auth.signOut();
        throw new Error("Email non autorisé pour les gérants");
      }

      // Mettre à jour le compte avec les informations Google
      const fullName = session.user.user_metadata?.full_name?.split(' ') || [];
      const nom = fullName[0] || gerantData.nom;
      const prenom = fullName[1] || gerantData.prenom;

      const { data: updatedCompte, error: updateError } = await supabase
        .from("compte")
        .update({
          nom,
          prenom,
          user_id: session.user.id,
        })
        .eq("id", gerantData.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Erreur mise à jour compte gérant: ${updateError.message}`);
      }

      return updatedCompte;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Une erreur inattendue s'est produite lors du traitement du callback");
    }
  }
}
