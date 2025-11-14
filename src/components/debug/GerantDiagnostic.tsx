'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface DiagnosticResult {
  step: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  data?: unknown;
}

export function GerantDiagnostic() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    runDiagnostic();
  }, []);

  const runDiagnostic = async () => {
    const diagnosticResults: DiagnosticResult[] = [];

    try {
      // 1. Vérifier l'authentification
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        diagnosticResults.push({
          step: '1. Authentification',
          status: 'error',
          message: 'Utilisateur non authentifié',
          data: { error: authError?.message }
        });
        setResults(diagnosticResults);
        setIsLoading(false);
        return;
      }

      diagnosticResults.push({
        step: '1. Authentification',
        status: 'success',
        message: `Connecté en tant que ${user.email}`,
        data: { user_id: user.id, email: user.email }
      });

      // 2. Vérifier le compte
      const { data: compte, error: compteError } = await supabase
        .from('compte')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (compteError || !compte) {
        diagnosticResults.push({
          step: '2. Compte',
          status: 'error',
          message: `❌ PROBLÈME : Aucun compte lié à votre utilisateur Google`,
          data: { 
            error: compteError?.message,
            solution: 'Vous devez créer un compte dans la table "compte" avec votre user_id'
          }
        });
        setResults(diagnosticResults);
        setIsLoading(false);
        return;
      }

      diagnosticResults.push({
        step: '2. Compte',
        status: 'success',
        message: `Compte trouvé : ${compte.nom} ${compte.prenom} (ID: ${compte.id})`,
        data: compte
      });

      // 3. Vérifier le restaurant
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurant')
        .select('*')
        .eq('gerant_id', compte.id)
        .single();

      if (restaurantError || !restaurant) {
        diagnosticResults.push({
          step: '3. Restaurant',
          status: 'error',
          message: `❌ PROBLÈME : Aucun restaurant lié à votre compte (compte.id = ${compte.id})`,
          data: { 
            error: restaurantError?.message,
            solution: 'Vous devez créer un restaurant avec gerant_id = ' + compte.id
          }
        });
        setResults(diagnosticResults);
        setIsLoading(false);
        return;
      }

      diagnosticResults.push({
        step: '3. Restaurant',
        status: 'success',
        message: `Restaurant trouvé : ${restaurant.nom} (id_restaurant: ${restaurant.id_restaurant})`,
        data: restaurant
      });

      // 4. Vérifier les plats
      const { data: plats, error: platsError } = await supabase
        .from('plat')
        .select('*')
        .eq('restaurant_id', restaurant.id_restaurant);

      if (platsError) {
        diagnosticResults.push({
          step: '4. Plats',
          status: 'error',
          message: `Erreur lors de la récupération des plats : ${platsError.message}`,
          data: { error: platsError }
        });
      } else {
        diagnosticResults.push({
          step: '4. Plats',
          status: plats && plats.length > 0 ? 'success' : 'warning',
          message: `${plats?.length || 0} plat(s) trouvé(s)`,
          data: { count: plats?.length, restaurant_id_utilisé: restaurant.id_restaurant }
        });
      }

      // 5. Vérifier les menus
      const { data: menus, error: menusError } = await supabase
        .from('menu')
        .select('*')
        .eq('restaurant_id', restaurant.id_restaurant);

      if (menusError) {
        diagnosticResults.push({
          step: '5. Menus',
          status: 'error',
          message: `Erreur lors de la récupération des menus : ${menusError.message}`,
          data: { error: menusError }
        });
      } else {
        diagnosticResults.push({
          step: '5. Menus',
          status: menus && menus.length > 0 ? 'success' : 'warning',
          message: `${menus?.length || 0} menu(s) trouvé(s)`,
          data: { count: menus?.length }
        });
      }

      // 6. Tester les politiques RLS
      // Certaines bases peuvent ne pas avoir de colonne "id" sur plat.
      // On teste donc une sélection minimale compatible.
      const { error: rlsTestError } = await supabase
        .from('plat')
        .select('*')
        .limit(1);

      diagnosticResults.push({
        step: '6. Politiques RLS',
        status: rlsTestError ? 'error' : 'success',
        message: rlsTestError 
          ? `❌ Problème RLS : ${rlsTestError.message}` 
          : '✅ Politiques RLS fonctionnelles',
        data: { error: rlsTestError }
      });

    } catch (error) {
      diagnosticResults.push({
        step: 'Erreur Générale',
        status: 'error',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        data: error
      });
    }

    setResults(diagnosticResults);
    setIsLoading(false);
  };

  const getIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Diagnostic de la liaison Gérant → Restaurant</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Diagnostic de la liaison Gérant → Restaurant</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {results.map((result, index) => (
          <Alert key={index} variant={result.status === 'error' ? 'destructive' : 'default'}>
            <div className="flex items-start gap-3">
              {getIcon(result.status)}
              <div className="flex-1">
                <div className="font-semibold">{result.step}</div>
                <AlertDescription className="mt-1">
                  {result.message}
                </AlertDescription>
                {result.data !== undefined && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                      Voir les détails
                    </summary>
                    <pre className="mt-2 text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </Alert>
        ))}

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <h4 className="font-semibold mb-2">🔍 Solutions possibles</h4>
          <ul className="text-sm space-y-2 list-disc list-inside">
            <li>
              Si <strong>&quot;Compte&quot;</strong> est en erreur : Exécutez le script SQL pour créer un compte lié à votre user_id
            </li>
            <li>
              Si <strong>&quot;Restaurant&quot;</strong> est en erreur : Créez un restaurant via l&apos;interface ou SQL
            </li>
            <li>
              Si <strong>&quot;Plats/Menus&quot;</strong> sont en warning : C&apos;est normal si vous n&apos;avez rien créé encore
            </li>
            <li>
              Si <strong>&quot;Politiques RLS&quot;</strong> sont en erreur : Vérifiez que les politiques sont bien créées
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
