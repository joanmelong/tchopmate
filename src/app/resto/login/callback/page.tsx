"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDI } from "@/lib/di";

export default function GerantCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [redirectId, setRedirectId] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const di = getDI();
        const user = await di.handleGerantCallbackUseCase.execute();
        setRedirectId(String(user.id));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur callback");
      }
    };
    run();
  }, []);

  useEffect(() => {
    if (redirectId) {
      router.replace(`/resto/${redirectId}`);
    }
  }, [redirectId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white">
      <div className="space-y-4 text-center">
        {!error && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto" />
            <p className="text-sm text-muted-foreground">Connexion en cours...</p>
          </>
        )}
        {error && (
          <div className="space-y-2">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={() => router.replace("/resto/login?error=" + encodeURIComponent(error))}
              className="text-xs underline"
            >
              Retour à la connexion
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
'use client';

/**
 * Page de callback Gérant - Architecture Propre
 * Gère le retour OAuth et redirige selon l'état du compte
 */

import { useEffect } from 'react';
import { useGerantAuth } from '@/hooks/use-gerant-auth';

export default function RestoCallbackPage() {
  const { handleCallback } = useGerantAuth();

  useEffect(() => {
    handleCallback();
  }, [handleCallback]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg text-muted-foreground">Authentification en cours...</p>
      </div>
    </div>
  );
}
