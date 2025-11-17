"use client";

import { useParams } from "next/navigation";
import { useProtectedRoute } from "@/hooks/use-protected-route";
import { useRestaurantByGerant } from "@/hooks/use-restaurant";
import { UserRole } from "@/core/entities/User";
import { DashboardStats } from "@/components/admin/dashboard-stats";
import { DailySalesChart } from "@/components/admin/daily-sales-chart";
import { PopularDishes } from "@/components/admin/popular-dishes";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { error } from "console";
import router from "next/router";

/**
 * Page du tableau de bord gérant - REFACTORISÉE avec Clean Architecture
 * 
 * AVANT : Appels directs à Supabase dans le composant ❌
 * APRÈS : Utilisation des hooks qui utilisent les use cases ✅
 * 
 * Avantages :
 * - Logique métier testable sans React
 * - Pas de dépendance directe à Supabase
 * - Peut changer de base de données facilement
 * - Code réutilisable
 */
export default function AdminDashboard() {
  const params = useParams();
  const gerantId = params.id as string;

  // Hook de protection de route avec vérification du rôle
  const { user, isLoading: authLoading, isAuthorized } = useProtectedRoute({
    requiredRole: UserRole.STAFF,
    redirectTo: "/resto/login",
  });

  // Hook pour récupérer le restaurant du gérant
  const { restaurant, isLoading: restaurantLoading, error } = useRestaurantByGerant(user);

  const isLoading = authLoading || restaurantLoading;

  // Vérifier que l'utilisateur accède bien à son propre dashboard
  if (user && user.id.toString() !== gerantId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white">
        <div className="text-center">
          <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <LogOut className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Accès non autorisé</h2>
          <p className="text-muted-foreground">
            Vous n&apos;avez pas accès à ce tableau de bord
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white">
        <div className="text-center">
          <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <LogOut className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
          <p className="text-muted-foreground mb-4">
            {error || "Aucun restaurant trouvé"}
          </p>
        </div>
      </div>
    );
  }

    if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white">
        <div className="text-center">
          <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <LogOut className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => router.push("/resto/login")}>
            Retour à la connexion
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-600 mt-1">
          Bienvenue {user?.fullName} - {restaurant.nom}
        </p>
      </div>

      <DashboardStats restaurantId={restaurant.id} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DailySalesChart restaurantId={restaurant.id} />
        </div>
        <div>
          <PopularDishes restaurantId={restaurant.id} />
        </div>
      </div>
    </div>
  );
}

