'use client';

/**
 * Page de connexion Admin - Architecture Propre
 * Utilise les use cases via les hooks personnalisés
 */

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { AlertCircle, Chrome } from 'lucide-react';

export default function AdminLoginPage() {
  const { loginWithGoogle, isLoading, error } = useAdminAuth();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');

  const displayError = error || errorParam;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">Administration</CardTitle>
          <CardDescription className="text-base">
            Seule l&apos;adresse administrateur peut accéder à cette interface
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {displayError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{displayError}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={loginWithGoogle}
            disabled={isLoading}
            className="w-full h-12 text-base font-medium"
            variant="outline"
            size="lg"
          >
            <Chrome className="mr-2 h-5 w-5" />
            {isLoading ? 'Connexion en cours...' : 'Se connecter avec Google'}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <p>Connexion sécurisée réservée aux administrateurs</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
