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
