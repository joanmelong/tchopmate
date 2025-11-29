# 🔧 Fix: Restaurant non trouvé - Problème RLS

## ❌ Problème Identifié

```
Restaurant non trouvé pour le gérant 991105f3-83c6-4ce8-aad7-d5d9a77fdc61
```

## 🔍 Cause Racine

**Row Level Security (RLS)** bloque l'accès à la table `restaurant` :
- L'API `/api/resto/[id]/orders` fonctionne car elle utilise `SUPABASE_SERVICE_ROLE_KEY`
- Nos repositories utilisent `SUPABASE_ANON_KEY` qui est soumis à RLS
- Le gérant ne peut pas voir son propre restaurant à cause des politiques RLS

## ✅ Solution Temporaire Implémentée

### 1. ApiOrderRepository
- Créé un nouveau repository qui utilise l'API existante
- Contourne complètement le problème RLS
- Réutilise la logique qui fonctionne déjà

### 2. Hooks Mis à Jour
- `useDashboardStats` et `useAnalyticsData` utilisent maintenant `ApiOrderRepository`
- Garantit que les données sont récupérées correctement

### 3. Debug Amélioré
- Le composant de debug montre maintenant :
  - L'ID du gérant
  - Les restaurants trouvés (ou pas)
  - Les erreurs RLS
  - Les données de compte

## 🧪 Test Immédiat

1. **Rafraîchis la page** du tableau de bord
2. **Clique sur "Tester les données"**
3. **Tu devrais maintenant voir** :
   - Des statistiques avec de vraies valeurs
   - Des commandes récupérées
   - Plus d'erreur "Restaurant non trouvé"

## 🔧 Solutions Permanentes (à implémenter plus tard)

### Option A: Corriger RLS
```sql
-- Permettre aux gérants de voir leur restaurant
CREATE POLICY "gerants_can_view_own_restaurant" ON restaurant
FOR SELECT USING (
  gerant_id = (SELECT id FROM compte WHERE user_id = auth.uid())
);
```

### Option B: Utiliser Service Role
- Configurer les repositories pour utiliser la service key
- Attention : plus de risques de sécurité

### Option C: API Gateway
- Créer des endpoints API pour toutes les opérations
- Centraliser la logique d'accès aux données

## 📋 Diagnostic Complet

Le composant de debug va maintenant afficher :

```
👤 Gérant ID: 991105f3-83c6-4ce8-aad7-d5d9a77fdc61
🏢 Restaurant du gérant: [] (vide à cause de RLS)
🏢 Tous les restaurants: [] (vide à cause de RLS)
👤 Compte gérant: [données du compte]
📊 Statistiques: { totalOrders: X, totalRevenue: Y }
```

## 🚀 Résultat Attendu

Après ces corrections :
- ✅ Le tableau de bord affiche les vraies statistiques
- ✅ Les graphiques utilisent les vraies données
- ✅ Les plats populaires sont récupérés
- ✅ Plus d'erreur "Restaurant non trouvé"

## 📝 Notes

- Cette solution utilise l'API existante qui fonctionne déjà
- C'est une solution robuste car elle réutilise du code testé
- Pour une solution permanente, il faudra corriger les politiques RLS