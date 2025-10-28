/**
 * Hook pour protéger les routes selon le rôle
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from './use-session';
import { UserRole } from '@/core/entities/User';

interface UseProtectedRouteOptions {
  requiredRole?: UserRole;
  redirectTo?: string;
}

export function useProtectedRoute(options: UseProtectedRouteOptions = {}) {
  const { user, isLoading } = useSession();
  const router = useRouter();
  const { requiredRole, redirectTo = '/login' } = options;

  useEffect(() => {
    if (isLoading) return;

    // Pas de session -> redirection
    if (!user) {
      router.push(redirectTo);
      return;
    }

    // Vérifier le rôle si requis
    if (requiredRole && user.role !== requiredRole) {
      // Rediriger vers la page appropriée selon le rôle
      if (user.isAdmin()) {
        router.push('/admin');
      } else if (user.isStaff()) {
        router.push(`/resto/${user.id}`);
      } else {
        router.push('/home');
      }
    }
  }, [user, isLoading, requiredRole, redirectTo, router]);

  return {
    user,
    isLoading,
    isAuthorized: !isLoading && !!user && (!requiredRole || user.role === requiredRole),
  };
}
