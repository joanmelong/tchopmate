"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/hooks/use-session";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Chrome } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const { user, isLoading: sessionLoading } = useSession();
  const { loginWithGoogle, isLoading: oauthLoading, error: oauthError } = useAdminAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [redirecting, setRedirecting] = useState(false);

  // Auto-redirection si déjà connecté
  useEffect(() => {
    if (sessionLoading) return;
    if (user) {
      if (user.isAdmin()) {
        setRedirecting(true);
        router.replace("/admin");
      } else if (user.isStaff()) {
        setRedirecting(true);
        router.replace(`/resto/${user.id}`);
      } else {
        setRedirecting(true);
        router.replace("/home");
      }
    }
  }, [user, sessionLoading, router]);

  const errorParam = searchParams.get("error");
  const displayError = oauthError || errorParam;

  if (redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Redirection...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
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
            disabled={oauthLoading}
            className="w-full h-12 text-base font-medium"
            variant="outline"
            size="lg"
          >
            <Chrome className="mr-2 h-5 w-5" />
            {oauthLoading ? "Connexion en cours..." : "Se connecter avec Google"}
          </Button>
          <div className="text-center text-xs text-muted-foreground flex justify-center gap-4">
            <Link href="/" className="hover:underline">Accueil</Link>
            <Link href="/resto/login" className="hover:underline">Espace Gérant</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
