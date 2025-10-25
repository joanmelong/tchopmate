"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Logo } from "@/components/logo";
import { Shield, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AdminLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Vérifier si l'utilisateur est déjà connecté comme admin
  useEffect(() => {
    const checkAdminAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Vérifier si c'est un admin
        const { data: compteData } = await supabase
          .from("compte")
          .select("role, email")
          .eq("user_id", session.user.id)
          .single();

        if (compteData?.role === "Administrateur") {
          router.push("/admin");
        }
      }
    };

    checkAdminAuth();
  }, [router]);

  // Gérer les erreurs depuis l'URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    
    if (errorParam) {
      switch (errorParam) {
        case 'auth_error':
          setError('Erreur d\'authentification. Veuillez réessayer.');
          break;
        case 'no_session':
          setError('Session non trouvée. Veuillez vous reconnecter.');
          break;
        case 'unauthorized':
          setError('Accès non autorisé. Seule l\'adresse administrateur peut accéder à cette interface.');
          break;
        case 'db_error':
          setError('Erreur de base de données. Veuillez contacter l\'administrateur.');
          break;
        case 'role_error':
          setError('Erreur lors de la mise à jour du rôle. Veuillez réessayer.');
          break;
        case 'update_error':
          setError('Erreur lors de la mise à jour du compte. Veuillez réessayer.');
          break;
        case 'constraint_error':
          setError('Conflit de données. Veuillez contacter l\'administrateur.');
          break;
        case 'callback_error':
          setError('Erreur lors du traitement de la connexion. Veuillez réessayer.');
          break;
        case 'manual_creation_needed':
          setError('Création manuelle du compte admin nécessaire. Veuillez contacter l\'administrateur système.');
          break;
        default:
          setError('Une erreur inattendue s\'est produite.');
      }
    }
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");

    try {
      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/admin/login/callback`,
          scopes: "openid email profile",
        },
      });

      if (authError) {
        console.error("Erreur Google Auth:", authError);
        setError("Erreur lors de la connexion avec Google");
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.error("Erreur inattendue:", error);
      setError("Une erreur inattendue s'est produite");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Colonne gauche - Formulaire */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <Link href="/">
              <Logo size="default" />
            </Link>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center space-y-2">
              <div className="flex justify-center mb-4">
                <div className="bg-red-500/10 rounded-full p-3">
                  <Shield className="h-8 w-8 text-red-500" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">Administration</CardTitle>
              <CardDescription className="text-base">
                Accès réservé aux administrateurs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Information sur l'accès restreint */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Accès restreint
                    </span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Seule une adresse <strong>administrateur</strong> peut accéder à cette interface.
                  </p>
                </div>

                <Button 
                  onClick={handleGoogleLogin} 
                  className="w-full h-11 text-base font-medium" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    "Connexion en cours..."
                  ) : (
                    <>
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Se connecter avec Google
                    </>
                  )}
                </Button>
              </div>

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Retour à l&apos;</span>
                <Link href="/" className="text-primary hover:underline font-medium">
                  Accueil
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Colonne droite - Image et texte */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-red-500/20 to-orange-500/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent" />
        <div className="relative z-10 flex flex-col justify-center items-center text-center p-12">
          <div className="max-w-md">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Administration TCHOPMATE
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Gérez les gérants de restaurants et supervisez l&apos;ensemble de la plateforme. 
              Interface sécurisée pour les administrateurs.
            </p>
          </div>
        </div>
        {/* Image décorative */}
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-red-500/30 to-transparent rounded-full -translate-x-1/2 translate-y-1/2" />
      </div>
    </div>
  );
}
