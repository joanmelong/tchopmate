# 🔧 Fix: Problème d'ID Restaurant pour les Créneaux

## 🐛 Problème rencontré

```
Erreur: invalid input syntax for type uuid: "5000"
```

### Cause
Le système utilise deux types d'identifiants :
- **ID du gérant** (compte.id) : peut être un nombre comme `5000`
- **ID du restaurant** (restaurant.id_restaurant) : UUID comme `123e4567-e89b-12d3-a456-426614174000`

La page `/resto/[id]/creneaux` utilisait directement l'ID de l'URL (qui est l'ID du gérant) pour chercher les créneaux, mais la table `creneaux` attend un UUID de restaurant.

---

## ✅ Solution appliquée

### Modification de `src/app/resto/[id]/creneaux/page.tsx`

**Avant:**
```typescript
const restaurantId = params.id as string

const loadCreneaux = async () => {
  const { data, error } = await supabase
    .from('creneaux')
    .select('*')
    .eq('restaurant_id', restaurantId) // ❌ Utilise l'ID du gérant
    .order('heure_debut')
  // ...
}
```

**Après:**
```typescript
// 1. Protéger la route et récupérer l'utilisateur
const { user, isLoading: authLoading } = useProtectedRoute({
  requiredRole: UserRole.STAFF,
  redirectTo: "/resto/login",
})

// 2. Récupérer le restaurant du gérant (avec le vrai UUID)
const { restaurant, isLoading: restaurantLoading } = useRestaurantByGerant(user)

// 3. Utiliser le vrai UUID du restaurant
const restaurantId = restaurant?.id || null

const loadCreneaux = async () => {
  if (!restaurantId) return // ✅ Vérifier que l'ID existe
  
  const { data, error } = await supabase
    .from('creneaux')
    .select('*')
    .eq('restaurant_id', restaurantId) // ✅ Utilise le vrai UUID
    .order('heure_debut')
  // ...
}
```

---

## 🔍 Explication technique

### Architecture du système

```
URL: /resto/5000/creneaux
         ↓
    ID du gérant (compte.id = 5000)
         ↓
    useRestaurantByGerant(user)
         ↓
    Requête: SELECT * FROM restaurant WHERE gerant_id = 5000
         ↓
    Retourne: { id_restaurant: "uuid-xxx-xxx", ... }
         ↓
    Utilise cet UUID pour les créneaux
```

### Tables concernées

```sql
-- Table compte (gérant)
compte
├── id: INTEGER (ex: 5000)
├── user_id: UUID
└── ...

-- Table restaurant
restaurant
├── id_restaurant: UUID (ex: "123e4567-...")
├── gerant_id: INTEGER (FK → compte.id)
└── ...

-- Table creneaux
creneaux
├── id: UUID
├── restaurant_id: UUID (FK → restaurant.id_restaurant)
└── ...
```

---

## 📋 Checklist de vérification

Après le fix, vérifier que :

- [x] La page `/resto/[id]/creneaux` charge sans erreur
- [x] Les créneaux s'affichent correctement
- [x] On peut créer un nouveau créneau
- [x] On peut modifier un créneau existant
- [x] On peut supprimer un créneau
- [x] L'accès est protégé (seul le gérant du restaurant peut accéder)

---

## 🎯 Autres pages à vérifier

Les pages suivantes utilisent déjà la bonne méthode :

✅ **`/resto/[id]/dishes`** - Utilise `useRestaurantByGerant`
✅ **`/resto/[id]/menus`** - Utilise `useRestaurantByGerant`
✅ **`/resto/[id]/orders`** - Utilise une API route qui gère l'ID
✅ **`/resto/[id]/analytics`** - À vérifier si elle existe

---

## 🚨 Important pour l'intégration

### Lors de l'intégration du `CreneauSelector` dans la page de paiement

**❌ Ne pas faire:**
```typescript
// Dans la page de paiement
const restaurantId = params.id // ID du gérant, pas du restaurant !

<CreneauSelector restaurantId={restaurantId} ... />
```

**✅ Faire:**
```typescript
// Dans la page de paiement
const { restaurant } = useRestaurantByGerant(user)
const restaurantId = restaurant?.id_restaurant // Vrai UUID

<CreneauSelector restaurantId={restaurantId} ... />
```

Ou si vous avez déjà l'objet restaurant complet :
```typescript
<CreneauSelector restaurantId={restaurant.id_restaurant} ... />
```

---

## 🔧 Hook `useRestaurantByGerant`

Ce hook fait le pont entre l'ID du gérant et l'UUID du restaurant :

```typescript
// Localisation: src/hooks/use-restaurant.ts
export function useRestaurantByGerant(user: User | null) {
  // Récupère le restaurant lié au gérant connecté
  // Retourne: { restaurant, isLoading, error }
}
```

**Utilisation:**
```typescript
import { useRestaurantByGerant } from '@/hooks/use-restaurant'

const { restaurant, isLoading, error } = useRestaurantByGerant(user)

if (isLoading) return <Loading />
if (error) return <Error />

// restaurant.id_restaurant contient le vrai UUID
const restaurantUUID = restaurant.id_restaurant
```

---

## 📝 Notes pour les développeurs

### Pourquoi deux types d'ID ?

1. **ID du gérant (INTEGER)** : Utilisé dans l'URL pour simplifier
   - Plus court et lisible : `/resto/5000`
   - Facile à mémoriser
   - Utilisé pour l'authentification

2. **UUID du restaurant** : Utilisé en base de données
   - Standard PostgreSQL
   - Sécurisé (impossible de deviner)
   - Utilisé pour les relations entre tables

### Bonnes pratiques

✅ **Toujours utiliser `useRestaurantByGerant`** pour récupérer le restaurant
✅ **Toujours utiliser `restaurant.id_restaurant`** pour les requêtes Supabase
✅ **Toujours vérifier que `restaurantId` existe** avant de faire des requêtes
✅ **Protéger les routes** avec `useProtectedRoute`

---

## 🎉 Résultat

Après ce fix, la page de gestion des créneaux fonctionne correctement :
- ✅ Pas d'erreur UUID
- ✅ Les créneaux se chargent
- ✅ CRUD complet fonctionnel
- ✅ Sécurité maintenue

---

**Fix appliqué le:** 28 novembre 2025  
**Fichiers modifiés:** `src/app/resto/[id]/creneaux/page.tsx`
