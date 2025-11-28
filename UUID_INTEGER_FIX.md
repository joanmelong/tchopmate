# 🔧 Fix: UUID vs Integer - Problème de Type

## ❌ Problème Identifié

```
invalid input syntax for type integer: "991105f3-83c6-4ce8-aad7-d5d9a77fdc61"
```

## 🔍 Cause Racine

**Confusion entre deux types d'ID** :
- `user_id` (UUID) : Identifiant Supabase Auth (`991105f3-83c6-4ce8-aad7-d5d9a77fdc61`)
- `compte.id` (integer) : Clé primaire de la table compte (`5000`, `5001`, etc.)

## 📋 Structure de la Base

```sql
-- Table compte
compte (
  id INTEGER PRIMARY KEY,        -- 5000, 5001, etc.
  user_id UUID,                 -- 991105f3-83c6-4ce8-aad7-d5d9a77fdc61
  nom, prenom, email, role
)

-- Table restaurant
restaurant (
  id_restaurant INTEGER PRIMARY KEY,
  gerant_id INTEGER REFERENCES compte(id),  -- Pas user_id !
  nom, localisation
)
```

## ✅ Solution Implémentée

### 1. Hooks Corrigés
- `useDashboardStats` et `useAnalyticsData` utilisent maintenant `user.id` (compte.id)
- Plus de confusion entre UUID et integer

### 2. ApiOrderRepository Simplifié
- Utilise directement `compte.id` sans conversion
- Plus besoin de récupérer l'UUID

### 3. Debug Amélioré
- Affiche clairement quel ID est utilisé
- Montre la différence entre `user_id` et `compte.id`

## 🧪 Test Immédiat

1. **Rafraîchis la page** du tableau de bord
2. **Clique sur "Tester les données"**
3. **Tu devrais voir** dans la console :
   ```
   🔍 Test avec compte.id: 5000
   📊 Statistiques: { totalOrders: X, totalRevenue: Y }
   ```

## 📝 Avant vs Après

### ❌ Avant (Incorrect)
```typescript
// URL: /resto/991105f3-83c6-4ce8-aad7-d5d9a77fdc61
// API: /api/resto/991105f3-83c6-4ce8-aad7-d5d9a77fdc61/orders
// Erreur: UUID dans un champ integer
```

### ✅ Après (Correct)
```typescript
// URL: /resto/991105f3-83c6-4ce8-aad7-d5d9a77fdc61 (inchangé)
// Mais utilisation interne: user.id = 5000
// API: /api/resto/5000/orders
// Succès: Integer dans un champ integer
```

## 🔍 Vérification

Le composant de debug va maintenant afficher :
- **Gérant ID** : L'UUID original (pour info)
- **Compte ID utilisé** : L'integer utilisé pour l'API
- **Restaurant trouvé** : Données du restaurant
- **Statistiques** : Vraies données récupérées

## 🚀 Résultat Attendu

Après ces corrections :
- ✅ Plus d'erreur "invalid input syntax for type integer"
- ✅ L'API `/api/resto/[compte.id]/orders` fonctionne
- ✅ Les statistiques s'affichent correctement
- ✅ Les graphiques utilisent les vraies données

## 📋 Note Importante

L'URL `/resto/[id]` continue d'utiliser l'UUID pour la cohérence de l'interface, mais en interne, nous utilisons maintenant le bon `compte.id` pour les requêtes API.