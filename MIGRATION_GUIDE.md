# 🚀 Guide de Migration - Code Spaghetti → Clean Architecture

## 📊 État actuel du projet

### ✅ Déjà refactorisé avec Clean Architecture :
- ✅ **Entités** : User, Restaurant, Menu, Plat, Order
- ✅ **Repositories** : Auth, Restaurant, User
- ✅ **Use Cases** : Login, Register, GetRestaurant, GetRestaurantByGerant, CreateRestaurant
- ✅ **Hooks** : useAuth, useSession, useRestaurant, useProtectedRoute
- ✅ **Page** : `/resto/[id]` (tableau de bord gérant)

### ⚠️ À migrer (code spaghetti restant) :
- ⚠️ Page `/login`
- ⚠️ Page `/register`
- ⚠️ Page `/admin`
- ⚠️ Page `/home` (étudiants)
- ⚠️ Composants admin (dashboard-stats, daily-sales-chart, etc.)
- ⚠️ Gestion des commandes
- ⚠️ Gestion des menus et plats

---

## 📋 Plan de migration étape par étape

### Phase 1 : Compléter les repositories manquants ✅

**Déjà fait** :
- ✅ SupabaseAuthRepository
- ✅ SupabaseRestaurantRepository
- ✅ SupabaseUserRepository

**À faire** :
- ⚠️ SupabaseMenuRepository
- ⚠️ SupabasePlatRepository
- ⚠️ SupabaseOrderRepository

### Phase 2 : Créer les use cases manquants

**Déjà fait** :
- ✅ LoginUseCase
- ✅ RegisterUseCase
- ✅ GetCurrentSessionUseCase
- ✅ LogoutUseCase
- ✅ GetRestaurantUseCase
- ✅ GetRestaurantByGerantUseCase
- ✅ CreateRestaurantUseCase
- ✅ CreateOrderUseCase
- ✅ GetRestaurantOrdersUseCase
- ✅ UpdateOrderStatusUseCase

**À faire** :
- ⚠️ GetMenusByRestaurantUseCase
- ⚠️ CreateMenuUseCase
- ⚠️ UpdateMenuUseCase
- ⚠️ DeleteMenuUseCase
- ⚠️ CreatePlatUseCase
- ⚠️ UpdatePlatUseCase
- ⚠️ DeletePlatUseCase
- ⚠️ GetOrderStatsUseCase

### Phase 3 : Créer les hooks manquants

**Déjà fait** :
- ✅ useAuth
- ✅ useSession
- ✅ useRestaurant
- ✅ useProtectedRoute

**À faire** :
- ⚠️ useMenus
- ⚠️ usePlats
- ⚠️ useOrders
- ⚠️ useOrderStats

### Phase 4 : Refactoriser les pages

**Déjà fait** :
- ✅ `/resto/[id]` - Tableau de bord gérant

**À faire** :
- ⚠️ `/login` - Page de connexion
- ⚠️ `/register` - Page d'inscription
- ⚠️ `/admin` - Tableau de bord admin
- ⚠️ `/home` - Page d'accueil étudiants
- ⚠️ `/menu` - Page du menu
- ⚠️ `/resto/create-resto` - Création de restaurant

### Phase 5 : Refactoriser les composants

**À faire** :
- ⚠️ `dashboard-stats.tsx` - Récupérer stats via use case
- ⚠️ `daily-sales-chart.tsx` - Récupérer données via use case
- ⚠️ `popular-dishes.tsx` - Récupérer plats via use case
- ⚠️ `recent-orders.tsx` - Récupérer commandes via use case
- ⚠️ `menu-tabs.tsx` - Utiliser hooks pour menus
- ⚠️ `dish-dialog.tsx` - Utiliser hooks pour plats

---

## 🔧 Guide de migration d'une page

### Exemple : Migration de `/login`

#### ❌ AVANT (Code Spaghetti)

```tsx
// app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ❌ Appel direct à Supabase dans le composant
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    // ❌ Logique métier dans le composant
    const { data: compteData } = await supabase
      .from("compte")
      .select("role")
      .eq("user_id", data.user.id)
      .single();

    // ❌ Routing métier dans le composant
    if (compteData.role === "Admin") {
      router.push("/admin");
    } else if (compteData.role === "Gerant") {
      router.push(`/resto/${compteData.id}`);
    } else {
      router.push("/home");
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {/* ... */}
    </form>
  );
}
```

#### ✅ APRÈS (Clean Architecture)

```tsx
// app/login/page.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error } = useAuth(); // ✅ Hook

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ Le hook gère tout (use case + routing)
    await login({ email, password });
  };

  return (
    <form onSubmit={handleLogin}>
      {error && <p className="text-red-500">{error}</p>}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isLoading}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isLoading}
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}
```

**Avantages** :
- ✅ Composant simple et focalisé sur l'UI
- ✅ Logique métier testable sans React
- ✅ Pas de dépendance à Supabase
- ✅ Réutilisable (le hook peut être utilisé ailleurs)

---

## 🔧 Guide de migration d'un composant

### Exemple : Migration de `dashboard-stats.tsx`

#### ❌ AVANT

```tsx
// components/admin/dashboard-stats.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export function DashboardStats() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      // ❌ Appel direct à Supabase
      const { data } = await supabase
        .from("commande")
        .select("montant_total, statut");

      // ❌ Logique métier dans le composant
      const totalRevenue = data.reduce((sum, c) => sum + c.montant_total, 0);
      const pending = data.filter(c => c.statut === "en_attente").length;

      setStats({
        totalOrders: data.length,
        totalRevenue,
        pendingOrders: pending,
      });
    };

    fetchStats();
  }, []);

  return <div>{/* Affichage */}</div>;
}
```

#### ✅ APRÈS

**1. Créer le use case**

```typescript
// core/use-cases/order/GetOrderStatsUseCase.ts
export class GetOrderStatsUseCase {
  constructor(private orderRepo: IOrderRepository) {}

  async execute(restaurantId: string) {
    return await this.orderRepo.getStats(restaurantId);
  }
}
```

**2. Créer le hook**

```typescript
// hooks/use-order-stats.ts
export function useOrderStats(restaurantId: string) {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const di = getDI();

  useEffect(() => {
    const fetchStats = async () => {
      const data = await di.getOrderStatsUseCase.execute(restaurantId);
      setStats(data);
      setIsLoading(false);
    };
    fetchStats();
  }, [restaurantId]);

  return { stats, isLoading };
}
```

**3. Utiliser dans le composant**

```tsx
// components/admin/dashboard-stats.tsx
"use client";

import { useOrderStats } from "@/hooks/use-order-stats";

export function DashboardStats({ restaurantId }: { restaurantId: string }) {
  const { stats, isLoading } = useOrderStats(restaurantId);

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div>
      <StatCard label="Commandes" value={stats.totalOrders} />
      <StatCard label="Revenu" value={stats.totalRevenue} />
      <StatCard label="En attente" value={stats.pendingOrders} />
    </div>
  );
}
```

---

## 📝 Checklist de migration pour chaque fichier

Avant de migrer un fichier, vérifiez :

- [ ] Identifier tous les appels à `supabase.*` dans le fichier
- [ ] Identifier toute logique métier (calculs, validations, etc.)
- [ ] Créer l'entité si nécessaire
- [ ] Créer l'interface du repository si nécessaire
- [ ] Créer le repository Supabase
- [ ] Créer le(s) use case(s)
- [ ] Ajouter au container DI
- [ ] Créer le hook React
- [ ] Refactoriser le composant/page
- [ ] Tester le fonctionnement
- [ ] Supprimer les imports Supabase du composant

---

## 🎯 Priorités de migration

### Haute priorité (impact utilisateur)
1. ⚠️ Pages de connexion/inscription
2. ⚠️ Gestion des commandes (création, statut)
3. ⚠️ Affichage des menus

### Priorité moyenne
4. ⚠️ Tableaux de bord (stats)
5. ⚠️ Gestion des menus/plats

### Priorité basse
6. ⚠️ Fonctionnalités admin avancées

---

## ✅ Validation de la migration

Pour chaque fichier migré, vérifiez :

1. ✅ **Aucun import de Supabase** dans les composants/pages
2. ✅ **Aucune logique métier** dans les composants (uniquement UI)
3. ✅ **Tests unitaires** des entités et use cases
4. ✅ **Fonctionnalité testée** manuellement
5. ✅ **Performance** non dégradée

---

## 🚨 Pièges à éviter

❌ **Ne pas** créer des use cases trop granulaires  
✅ **Grouper** les opérations liées ensemble

❌ **Ne pas** mettre de logique UI dans les use cases  
✅ **Séparer** la logique métier de la présentation

❌ **Ne pas** appeler directement les repositories depuis les composants  
✅ **Toujours** passer par les use cases

❌ **Ne pas** oublier de mapper les DTOs vers les entités  
✅ **Systématiquement** utiliser les mappers

---

## 📞 Aide

Si vous êtes bloqué pendant la migration :

1. Consultez `CLEAN_ARCHITECTURE.md`
2. Regardez les exemples déjà migrés (`/resto/[id]`)
3. Vérifiez le container DI pour les dépendances

**Bonne migration ! 🚀**
