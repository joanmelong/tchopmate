'use client';

/**
 * Page de callback Admin - Architecture Propre
 * Gère le retour OAuth et redirige vers le dashboard
 */

import { useEffect } from 'react';
import { useAdminAuth } from '@/hooks/use-admin-auth';

export default function AdminCallbackPage() {
  const { handleCallback } = useAdminAuth();

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
