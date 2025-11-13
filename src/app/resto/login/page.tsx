'use client';

/**
 * Page de connexion Gérant - Architecture Propre
 * Connexion uniquement via Google (pas de champ email)
 */

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGerantAuth } from '@/hooks/use-gerant-auth';
import { AlertCircle, Chrome } from 'lucide-react';

export default function RestoLoginPage() {
  const { loginWithGoogle, isLoading, error } = useGerantAuth();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');

  const displayError = error || errorParam;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">Espace Gérant</CardTitle>
          <CardDescription className="text-base">
            Connectez-vous pour gérer votre restaurant
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
            <p>Connexion sécurisée pour les gérants de restaurant</p>
            <p className="mt-2">Votre compte doit être préautorisé</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
