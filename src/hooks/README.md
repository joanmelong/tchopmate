# 🎣 Hooks - React Custom Hooks Layer

## Description

Le dossier **Hooks** contient les **React Custom Hooks** qui servent d'**Interface Adapters** entre les Use Cases (logique métier) et les composants UI (React).

## Principe Fondamental

> "Les hooks adaptent les Use Cases pour React, sans que React ne pollue le métier."

Cette couche permet aux composants React d'utiliser la logique métier de manière idiomatique React (state, effects, etc.).

## Structure

```
hooks/
├── use-auth.ts              # Authentification générale
├── use-admin-auth.ts        # Authentification admin
├── use-gerant-auth.ts       # Authentification gérant
├── use-session.ts           # Gestion de session
├── use-restaurant.ts        # Opérations restaurants
├── use-protected-route.ts   # Protection de routes
├── use-mobile.ts            # Détection mobile (UI)
└── use-toast.ts             # Notifications toast (UI)
```

## 📋 Hooks Existants

### Authentification

#### `use-auth.ts`
Hook principal pour l'authentification des étudiants.

```typescript
const { 
  login,          // Connexion email/password
  logout,         // Déconnexion
  isLoading,      // État de chargement
  error           // Message d'erreur
} = useAuth();
```

#### `use-admin-auth.ts`
Hook spécialisé pour l'authentification admin OAuth.

```typescript
const {
  loginWithGoogle,  // Initie OAuth Google
  handleCallback,   // Traite le retour OAuth
  isLoading,
  error
} = useAdminAuth();
```

#### `use-gerant-auth.ts`
Hook spécialisé pour l'authentification gérant OAuth.

```typescript
const {
  loginWithGoogle,  // Initie OAuth Google
  handleCallback,   // Traite le retour OAuth + redirection intelligente
  isLoading,
  error
} = useGerantAuth();
```

#### `use-session.ts`
Hook pour gérer la session utilisateur courante.

```typescript
const {
  user,           // Utilisateur connecté (User entity)
  isLoading,      // Chargement session
  isAuthenticated // Booléen authentification
} = useSession();
```

### Restaurants

#### `use-restaurant.ts`
Hook pour les opérations sur les restaurants.

```typescript
const {
  restaurant,      // Restaurant entity
  isLoading,
  error,
  refetch          // Recharger le restaurant
} = useRestaurant(gerantUser);
```

### Protection

#### `use-protected-route.ts`
Hook pour protéger les routes selon les rôles.

```typescript
useProtectedRoute({
  requiredRoles: [UserRole.STAFF, UserRole.ADMIN],
  redirectTo: '/login'
});
```

### UI Utilities

#### `use-mobile.ts`
Hook pour détecter si l'appareil est mobile.

```typescript
const isMobile = useMobile();
```

#### `use-toast.ts`
Hook pour afficher des notifications toast.

```typescript
const { toast } = useToast();

toast({
  title: "Succès",
  description: "Opération réussie",
});
```

## 🎯 Règles d'Or

### ✅ AUTORISÉ dans Hooks:
- Imports React (`useState`, `useEffect`, etc.)
- Imports de Use Cases via DI Container
- Gestion d'état local (loading, error)
- Navigation (`useRouter`)
- Conversions de format pour l'UI

### ❌ INTERDIT dans Hooks:
- Logique métier (doit être dans Use Cases)
- Appels directs Supabase/API (doit passer par Repositories)
- Imports de composants UI
- Logique de validation métier

## 📝 Tâches à Venir

### Hooks à Créer

#### Menus et Plats
- [ ] `use-menu.ts` - Gestion des menus
  ```typescript
  const { menus, createMenu, updateMenu, deleteMenu } = useMenu(restaurantId);
  ```

- [ ] `use-plat.ts` - Gestion des plats
  ```typescript
  const { plats, createPlat, updatePlat, deletePlat, toggleAvailability } = usePlat(menuId);
  ```

#### Commandes
- [ ] `use-orders.ts` - Gestion des commandes côté gérant
  ```typescript
  const { orders, updateOrderStatus, cancelOrder } = useOrders(restaurantId);
  ```

- [ ] `use-cart.ts` - Panier côté étudiant
  ```typescript
  const { cart, addToCart, removeFromCart, checkout } = useCart();
  ```

- [ ] `use-order-history.ts` - Historique commandes étudiant
  ```typescript
  const { orders, reorder } = useOrderHistory(userId);
  ```

#### Restaurant
- [ ] `use-restaurant-status.ts` - Ouvrir/fermer restaurant
  ```typescript
  const { isOpen, toggleStatus } = useRestaurantStatus(restaurantId);
  ```

#### Utilisateurs
- [ ] `use-profile.ts` - Gestion du profil
  ```typescript
  const { profile, updateProfile } = useProfile();
  ```

- [ ] `use-gerants.ts` - Liste des gérants (admin)
  ```typescript
  const { gerants, createGerant, deleteGerant } = useGerants();
  ```

## 🏗️ Structure Type d'un Hook

```typescript
import { useState, useEffect } from 'react';
import { getDI } from '@/lib/di';

export function useMyFeature() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performAction = async (params) => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. Récupérer le Use Case via DI
      const di = getDI();
      const useCase = di.myFeatureUseCase;

      // 2. Exécuter le Use Case
      const result = await useCase.execute(params);

      // 3. Mettre à jour l'état
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data,
    isLoading,
    error,
    performAction,
  };
}
```

## 🧪 Tests

Les hooks doivent être testés avec `@testing-library/react-hooks`:

```typescript
import { renderHook, act } from '@testing-library/react';
import { useAuth } from './use-auth';

describe('useAuth', () => {
  it('should login user', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login({
        email: 'test@example.com',
        password: 'password',
      });
    });

    expect(result.current.error).toBeNull();
  });
});
```

## 🔗 Flux d'Utilisation

```
Component
    ↓
Hook (ce dossier)
    ↓
Use Case (via DI Container)
    ↓
Repository
    ↓
Database/API
```

## 📚 Documentation

- **Guide des hooks React:** [React Hooks Documentation](https://react.dev/reference/react)
- **Architecture générale:** Voir `CLEAN_ARCHITECTURE.md`
- **Tests des hooks:** Voir `TESTING_GUIDE.md`

---

**Dernière mise à jour:** 11 novembre 2025  
**Statut:** ✅ Hooks de base créés - À compléter pour menus/commandes
