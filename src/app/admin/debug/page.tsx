"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/hooks/use-session";
import { getDI } from "@/lib/di";

export default function AdminDebugPage() {
  const { user, isLoading } = useSession();
  const [authState, setAuthState] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const di = getDI();
        const authRepo = di.authRepository;
        
        // Vérifier la session actuelle
        const session = await authRepo.getCurrentSession();
        console.log('Session actuelle:', session);
        
        setAuthState({
          hasSession: !!session,
          user: session?.user,
          email: session?.user?.email,
          role: session?.user?.role,
          isAdmin: session?.user?.isAdmin(),
        });

        // Test de récupération du callback OAuth
        try {
          const oauthSession = await authRepo.handleOAuthCallback();
          console.log('OAuth Callback test:', oauthSession);
        } catch (err) {
          console.log('OAuth Callback test error:', err);
        }

      } catch (error) {
        console.error('Erreur lors du check auth:', error);
        setAuthState({ error: error instanceof Error ? error.message : 'Erreur inconnue' });
      }
    };

    checkAuth();
  }, []);

  const testGoogleLogin = async () => {
    try {
      const di = getDI();
      const useCase = di.googleLoginAdminUseCase;
      const result = await useCase.execute();
      console.log('Test Google login:', result);
      window.location.href = result.redirectUrl;
    } catch (error) {
      console.error('Erreur test Google login:', error);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Debug Admin Auth</h1>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Session Hook State</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify({
              isLoading,
              user: user ? {
                id: user.id,
                email: user.email,
                role: user.role,
                isAdmin: user.isAdmin(),
                nom: user.nom,
                prenom: user.prenom,
              } : null
            }, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Auth Repository State</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(authState, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Environment Variables</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify({
              NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
              NEXT_PUBLIC_ADMIN_EMAIL: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
              NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
              hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            }, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">URL Info</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {typeof window !== 'undefined' ? JSON.stringify({
              href: window.location.href,
              origin: window.location.origin,
              pathname: window.location.pathname,
              search: window.location.search,
              hash: window.location.hash,
            }, null, 2) : 'Window not available'}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Actions</h2>
          <div className="space-y-4">
            <button 
              onClick={testGoogleLogin}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Test Google Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}