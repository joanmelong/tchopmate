import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Décode un JWT sans vérifier la signature (extraction des claims)
 * Attention: Cette fonction ne valide PAS le JWT, elle extrait seulement les données
 * La signature du JWT doit avoir été validée avant d'utiliser cette fonction
 */
function decodeJWT(token: string): { sub?: string; email?: string; user_metadata?: any } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }
    const decoded = JSON.parse(
      Buffer.from(parts[1], "base64").toString("utf-8")
    );
    return decoded;
  } catch (e) {
    console.error("Erreur décodage JWT:", e);
    return null;
  }
}

/**
 * Récupère le token d'authentification depuis les headers ou cookies de la requête
 * @param request - La requête Next.js
 * @returns Le token d'accès ou null
 */
export function getAccessTokenFromRequest(request: NextRequest): string | null {
  // Essayer de récupérer depuis les headers Authorization
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // Essayer de récupérer depuis les cookies
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    // Parser les cookies
    const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
      const [key, ...valueParts] = cookie.trim().split("=");
      if (key && valueParts.length > 0) {
        // Rejoindre les parties au cas où la valeur contient des '='
        const value = valueParts.join("=");
        acc[key.trim()] = value;
      }
      return acc;
    }, {} as Record<string, string>);

    // Chercher le token dans les cookies Supabase
    // Supabase stocke les tokens dans des cookies avec des noms qui dépendent de l'URL du projet
    // Format: sb-<project-ref>-auth-token ou sb-<hostname>-auth-token
    // Chercher tous les cookies qui commencent par "sb-" et se terminent par "-auth-token"
    for (const [key, value] of Object.entries(cookies)) {
      if (key.startsWith("sb-") && key.includes("-auth-token")) {
        try {
          // Décoder l'URL avant de parser le JSON
          const decodedValue = decodeURIComponent(value);
          // Le token peut être stocké comme un objet JSON ou directement comme une string
          const parsed = JSON.parse(decodedValue);
          if (parsed.access_token) {
            console.log("Token trouvé dans cookie:", key);
            return parsed.access_token;
          }
        } catch {
          // Si ce n'est pas du JSON, c'est probablement le token directement
          try {
            const decodedValue = decodeURIComponent(value);
            if (decodedValue && decodedValue.length > 20) {
              console.log("Token direct trouvé dans cookie:", key);
              return decodedValue;
            }
          } catch {
            // Ignorer les erreurs de décodage
          }
        }
      }
    }

    // Fallback: chercher les noms de cookies communs
    const fallbackToken = 
      cookies["sb-access-token"] ||
      cookies["sb-auth-token"] ||
      cookies["supabase-auth-token"] ||
      cookies["sb-localhost-auth-token"];
    
    if (fallbackToken) {
      try {
        const decoded = decodeURIComponent(fallbackToken);
        console.log("Token trouvé dans cookie fallback");
        return decoded;
      } catch {
        return fallbackToken;
      }
    }
  }

  return null;
}

/**
 * Récupère l'ID du compte client depuis le token d'authentification
 * @param request - La requête Next.js
 * @returns L'ID du compte et les informations du compte ou null si non authentifié
 */
export async function getClientFromRequest(
  request: NextRequest
): Promise<{ id: number; nom: string; prenom: string; email: string; numero_tel?: string } | null> {
  try {
    if (!url || !serviceKey) {
      console.error("Supabase URL ou service key manquante");
      return null;
    }

    const accessToken = getAccessTokenFromRequest(request);

    if (!accessToken) {
      console.log("Pas de token d'accès trouvé dans la requête");
      console.log("Headers disponibles:", {
        authorization: request.headers.get("authorization") ? "présent" : "absent",
        cookie: request.headers.get("cookie") ? "présent" : "absent",
      });
      return null;
    }
    
    console.log("Token d'accès trouvé, longueur:", accessToken.length)

    // Décoder le JWT pour extraire l'ID utilisateur
    const decoded = decodeJWT(accessToken);

    if (!decoded || !decoded.sub) {
      console.error("Token invalide ou absence d'ID utilisateur");
      return null;
    }

    const userId = decoded.sub; // Le champ 'sub' contient l'ID de l'utilisateur Supabase

    // Créer un client admin pour accéder à la base de données
    const admin = createClient(url, serviceKey, {
      auth: { persistSession: false },
    });

    // Récupérer le compte depuis la table compte avec l'ID utilisateur
    const { data: compte, error: compteError } = await admin
      .from("compte")
      .select("id, nom, prenom, email, numero_tel")
      .eq("user_id", userId)
      .maybeSingle(); // Utiliser maybeSingle pour ne pas lever d'erreur si aucune ligne

    console.log("Recherche compte pour user_id:", userId, "Trouvé:", !!compte, "Erreur:", compteError?.message);

    // Si le compte n'existe pas, le créer automatiquement (premier login)
    if (!compte && !compteError) {
      console.log(`Création d'un nouveau compte pour user_id: ${userId}`);
      
      // Extraire le nom et le prénom de l'email
      const emailParts = decoded.email?.split("@")[0]?.split(".") || [];
      const nom = emailParts[0] || "Client";
      const prenom = emailParts[1] || "Nouveau";

      const { data: newCompte, error: insertError } = await admin
        .from("compte")
        .insert({
          user_id: userId,
          nom,
          prenom,
          email: decoded.email || "unknown@example.com",
          role: "Client", // Les nouveaux utilisateurs sont clients
        })
        .select("id, nom, prenom, email, numero_tel")
        .single();

      if (insertError || !newCompte) {
        console.error("Erreur création nouveau compte:", insertError);
        return null;
      }

      return newCompte;
    }

    if (compteError || !compte) {
      console.error("Erreur récupération compte:", compteError);
      return null;
    }

    return compte;
  } catch (e) {
    console.error("Erreur getClientFromRequest:", e);
    return null;
  }
}

