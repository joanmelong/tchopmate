# 🔧 Guide de Debug - Données Analytiques

## 🎯 Problème Identifié

Les statistiques affichent 0 alors qu'il y a des commandes visibles dans la page de gestion des commandes.

## 🔍 Cause Probable

**Confusion entre `gerantId` et `restaurantId`** :
- L'URL `/resto/[id]` utilise l'ID du gérant (compte.id)
- Mais les données sont liées au restaurant via `restaurant.id_restaurant`
- Il faut d'abord trouver le restaurant du gérant, puis récupérer ses données

## ✅ Corrections Apportées

### 1. Repository des Commandes (`SupabaseOrderRepository.ts`)
- ✅ Utilise maintenant la même logique que l'API `/api/resto/[id]/orders`
- ✅ Trouve d'abord le restaurant via `restaurant.gerant_id = gerantId`
- ✅ Récupère toutes les commandes puis les filtre par restaurant
- ✅ Utilise les bons noms de colonnes (`id_commande`, `statut`, etc.)

### 2. Repository des Plats (`SupabaseDishRepository.ts`)
- ✅ Même logique : trouve le restaurant du gérant d'abord
- ✅ Récupère les plats du bon restaurant

### 3. Composant de Debug
- ✅ Ajouté `DataDebugger` au tableau de bord
- ✅ Permet de tester les données en temps réel
- ✅ Affiche les logs dans la console

## 🧪 Comment Tester

### Étape 1: Accéder au Tableau de Bord
1. Va sur `/resto/[gerantId]` (ton tableau de bord)
2. Tu verras maintenant un composant bleu "🔧 Debug des Données"

### Étape 2: Tester les Données
1. Clique sur "Tester les données"
2. Ouvre la console du navigateur (F12)
3. Regarde les logs qui s'affichent :
   ```
   🔍 Test avec restaurantId (gerantId): [ton_gerant_id]
   📊 Statistiques: { totalOrders: X, totalRevenue: Y, ... }
   📦 Commandes: [array des commandes]
   🍽️ Plats: [array des plats]
   ⭐ Plats populaires: [array des plats populaires]
   ```

### Étape 3: Analyser les Résultats

#### ✅ Si ça marche :
- Tu verras des données dans les statistiques
- Les composants du tableau de bord afficheront les vraies données
- Tu peux supprimer le composant de debug

#### ❌ Si ça ne marche pas :
- Regarde les erreurs dans la console
- Vérifie que ton `gerantId` correspond bien à un restaurant
- Vérifie que les commandes ont des plats du bon restaurant

## 🔍 Requêtes SQL de Debug

Si tu veux vérifier directement dans la base de données :

```sql
-- 1. Vérifier le lien gérant -> restaurant
SELECT r.id_restaurant, r.nom, r.gerant_id 
FROM restaurant r 
WHERE r.gerant_id = [TON_GERANT_ID];

-- 2. Vérifier les commandes
SELECT COUNT(*) as total_commandes 
FROM commande c;

-- 3. Vérifier les commandes avec plats du restaurant
SELECT c.id_commande, c.statut, c.montant_total, p.nom as plat_nom
FROM commande c
JOIN commande_plat cp ON c.id_commande = cp.commande_id
JOIN plat p ON cp.plat_id = p.id
WHERE p.restaurant_id = [TON_RESTAURANT_ID];
```

## 🚀 Prochaines Étapes

1. **Teste avec le composant de debug**
2. **Vérifie les logs dans la console**
3. **Si ça marche, supprime le composant de debug**
4. **Si ça ne marche pas, partage les logs d'erreur**

## 📝 Notes Importantes

- Le `restaurantId` dans les hooks est maintenant le `gerantId`
- Les repositories gèrent automatiquement la conversion
- Tous les composants utilisent maintenant les vraies données
- Les états de loading et d'erreur sont gérés

## 🗑️ Nettoyage

Une fois que tout fonctionne, supprime :
1. Le composant `DataDebugger` du tableau de bord
2. Le fichier `src/components/debug/DataDebugger.tsx`
3. Ce fichier de debug