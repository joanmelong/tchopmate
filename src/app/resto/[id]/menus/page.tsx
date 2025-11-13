"use client"

import { useParams } from 'next/navigation';
import { MenuManagement } from '@/components/restaurant/MenuManagement';
import { useProtectedRoute } from '@/hooks/use-protected-route';
import { useRestaurantByGerant } from '@/hooks/use-restaurant';
import { UserRole } from '@/core/entities/User';

export default function MenusPage() {
  const params = useParams();
  const gerantId = params.id as string;

  // Protéger la route
  const { user, isLoading: authLoading } = useProtectedRoute({
    requiredRole: UserRole.STAFF,
    redirectTo: "/resto/login",
  });

  // Récupérer le restaurant du gérant
  const { restaurant, isLoading: restaurantLoading, error } = useRestaurantByGerant(user);

  const isLoading = authLoading || restaurantLoading;

  // Vérifier que l'utilisateur accède à son propre restaurant
  if (user && user.id.toString() !== gerantId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Accès non autorisé</h2>
          <p className="text-muted-foreground">
            Vous n&apos;avez pas accès à ce restaurant
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-red-600">
          <p>Erreur: {error || "Restaurant non trouvé"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <MenuManagement restaurantId={restaurant.id} />
    </div>
  );
}
