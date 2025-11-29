# Intégration des Données Analytiques - TchopMate

## 📊 Vue d'ensemble

Ce document décrit l'intégration des vraies données de la base de données dans les pages **Tableau de bord** et **Analytiques** de TchopMate.

## 🏗️ Architecture Implémentée

### Use Cases Créés

1. **GetDashboardStatsUseCase** (`src/core/use-cases/analytics/GetDashboardStatsUseCase.ts`)
   - Récupère les statistiques du tableau de bord
   - Calcule les changements par rapport à la veille
   - Fournit les métriques clés : commandes, revenus, clients, plats populaires

2. **GetAnalyticsDataUseCase** (`src/core/use-cases/analytics/GetAnalyticsDataUseCase.ts`)
   - Récupère les données analytiques détaillées
   - Génère les graphiques de ventes quotidiennes
   - Calcule la répartition par catégorie
   - Identifie les plats populaires

### Repositories Créés

1. **SupabaseOrderRepository** (`src/data/repositories/SupabaseOrderRepository.ts`)
   - Implémente `IOrderRepository`
   - Gère les requêtes vers la table `commande`
   - Fournit les statistiques de commandes

2. **SupabaseDishRepository** (`src/data/repositories/SupabaseDishRepository.ts`)
   - Implémente `IDishRepository` et `IAnalyticsRepository`
   - Gère les requêtes vers la table `plat`
   - Fournit les données des plats populaires

### Hooks Créés

1. **useDashboardStats** (`src/hooks/use-dashboard-stats.ts`)
   - Hook pour récupérer les statistiques du tableau de bord
   - Gère le loading et les erreurs
   - Fournit une fonction de refetch

2. **useAnalyticsData** (`src/hooks/use-analytics-data.ts`)
   - Hook pour récupérer les données analytiques
   - Paramétrable par nombre de jours
   - Gère le loading et les erreurs

## 🔄 Composants Mis à Jour

### Tableau de Bord (`src/app/resto/[id]/page.tsx`)

- **DashboardStats** : Affiche les vraies statistiques avec loading states
- **DailySalesChart** : Graphique des ventes de la semaine avec vraies données
- **PopularDishes** : Top 3 des plats populaires avec vraies données

### Page Analytiques (`src/app/resto/[id]/analytics/page.tsx`)

- **Graphiques de ventes** : Données réelles par jour
- **Répartition par catégorie** : Basée sur les vraies commandes
- **Tendance des revenus** : Évolution réelle sur 7 jours
- **Statistiques supplémentaires** : Métriques calculées en temps réel

## 📋 Schéma de Base de Données Utilisé

### Tables Principales

```sql
-- Table des commandes
commande (
  id_commande,
  client_id,
  restaurant_id,
  statut,
  montant_total,
  created_at,
  updated_at
)

-- Table de liaison commande-plat
commande_plat (
  commande_id,
  plat_id,
  quantite
)

-- Table des plats
plat (
  id,
  restaurant_id,
  nom,
  prix,
  categorie,
  image_url,
  disponible,
  created_at
)
```

## 🎯 Fonctionnalités Implémentées

### Tableau de Bord
- ✅ Commandes du jour avec pourcentage de changement
- ✅ Revenus du jour avec évolution
- ✅ Nombre total de clients
- ✅ Graphique des ventes de la semaine
- ✅ Top 3 des plats populaires

### Page Analytiques
- ✅ Graphique en barres des ventes par jour
- ✅ Graphique circulaire de répartition par catégorie
- ✅ Graphique linéaire de tendance des revenus
- ✅ Cartes de statistiques (revenus totaux, commandes, moyennes)

## 🔧 États de Chargement et Erreurs

Tous les composants incluent :
- **Loading states** : Animations de skeleton pendant le chargement
- **Error handling** : Messages d'erreur utilisateur-friendly
- **Empty states** : Messages quand aucune donnée n'est disponible
- **Refetch capability** : Possibilité de recharger les données

## 🚀 Utilisation

### Pour le Tableau de Bord
```tsx
<DashboardStats user={user} restaurantId={restaurant.id.toString()} />
<DailySalesChart user={user} restaurantId={restaurant.id.toString()} />
<PopularDishes user={user} restaurantId={restaurant.id.toString()} />
```

### Pour les Analytiques
La page `/resto/[id]/analytics` utilise automatiquement les hooks pour récupérer et afficher les données.

## 📈 Métriques Calculées

### Statistiques du Tableau de Bord
- **Commandes du jour** : Nombre de commandes créées aujourd'hui
- **Revenus du jour** : Somme des montants des commandes d'aujourd'hui
- **Changements** : Pourcentage de variation par rapport à hier
- **Clients** : Nombre total de commandes (approximation)

### Données Analytiques
- **Ventes quotidiennes** : Revenus et nombre de commandes par jour (7 derniers jours)
- **Plats populaires** : Classement par nombre de commandes
- **Répartition par catégorie** : Simulation basée sur les données réelles
- **Revenus moyens** : Calcul automatique par commande

## 🔮 Améliorations Futures

1. **Requêtes optimisées** : Implémenter des requêtes SQL plus complexes pour les plats populaires
2. **Cache** : Ajouter un système de cache pour les statistiques
3. **Temps réel** : Intégrer des mises à jour en temps réel
4. **Filtres avancés** : Permettre de filtrer par période, catégorie, etc.
5. **Export** : Fonctionnalité d'export des données analytiques

## 🐛 Notes de Débogage

- Les repositories utilisent les variables d'environnement `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Les noms de colonnes correspondent au schéma existant de la base de données
- Les statuts de commandes sont mappés correctement entre la DB et l'application
- Les données de simulation sont utilisées quand les vraies données ne sont pas disponibles