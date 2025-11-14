import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
      const [key, value] = cookie.trim().split("=");
      if (key && value) {
        acc[key.trim()] = decodeURIComponent(value);
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
          // Le token peut être stocké comme un objet JSON ou directement comme une string
          const parsed = JSON.parse(value);
          if (parsed.access_token) {
            return parsed.access_token;
          }
        } catch {
          // Si ce n'est pas du JSON, c'est probablement le token directement
          return value;
        }
      }
    }

    // Fallback: chercher les noms de cookies communs
    return (
      cookies["sb-access-token"] ||
      cookies["sb-auth-token"] ||
      cookies["supabase-auth-token"] ||
      cookies["sb-localhost-auth-token"] ||
      null
    );
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
      return null;
    }

    // Créer un client admin pour vérifier le token
    const admin = createClient(url, serviceKey, {
      auth: { persistSession: false },
    });

    // Vérifier le token et récupérer l'utilisateur
    const {
      data: { user },
      error: userError,
    } = await admin.auth.getUser(accessToken);

    if (userError || !user) {
      console.error("Erreur récupération utilisateur:", userError);
      return null;
    }

    // Récupérer le compte depuis la table compte avec l'admin client
    const { data: compte, error: compteError } = await admin
      .from("compte")
      .select("id, nom, prenom, email, numero_tel")
      .eq("user_id", user.id)
      .single();

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

