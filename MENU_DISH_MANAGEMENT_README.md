# Gestion des Menus et Plats - User Story 4.1

## Vue d'ensemble

Cette fonctionnalité implémente la gestion complète des menus et plats pour les restaurants, en suivant les principes de **Clean Architecture** définis dans le projet.

## Architecture

### Couches

```
┌─────────────────────────────────────────┐
│          Presentation Layer             │
│  - MenuManagement.tsx (Component)       │
│  - DishManagement.tsx (Component)       │
│  - MenuForm.tsx / DishForm.tsx          │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│          Service Layer                  │
│  - MenuService.ts                       │
│  - DishService.ts                       │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│          Use Cases (Core)               │
│  - GetMenusByRestaurant                 │
│  - CreateMenu / UpdateMenu / DeleteMenu │
│  - CreateDish / UpdateDish / DeleteDish │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│          Interfaces (Core)              │
│  - IMenuManagementRepository            │
│  - IDishManagementRepository            │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│          Data Layer                     │
│  - MenuManagementRepository             │
│  - DishManagementRepository             │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│          Supabase Database              │
│  - menus table                          │
│  - plats table                          │
└─────────────────────────────────────────┘
```

## Installation et Configuration

### 1. Configuration de la base de données

Exécutez le script SQL dans Supabase:

```bash
# Copiez le contenu de create_menus_plats_tables.sql
# et exécutez-le dans l'éditeur SQL de Supabase
```

Ou via la ligne de commande Supabase:

```bash
supabase db execute -f create_menus_plats_tables.sql
```

### 2. Vérification des tables

Vérifiez que les tables ont été créées:

```sql
SELECT * FROM menus LIMIT 1;
SELECT * FROM plats LIMIT 1;
```

### 3. Structure des fichiers créés

```
src/
├── core/
│   ├── entities/
│   │   ├── Menu.ts (DTOs: MenuDTO, CreateMenuDTO, UpdateMenuDTO)
│   │   └── Dish.ts (DTOs: DishDTO, CreateDishDTO, UpdateDishDTO)
│   ├── interfaces/
│   │   └── IMenuRepository.ts (IMenuManagementRepository, IDishManagementRepository)
│   └── use-cases/
│       ├── menu/
│       │   ├── GetMenusByRestaurant.ts
│       │   ├── CreateMenu.ts
│       │   ├── UpdateMenu.ts
│       │   └── DeleteMenu.ts
│       └── dish/
│           ├── GetDishesByRestaurant.ts
│           ├── CreateDish.ts
│           ├── UpdateDish.ts
│           └── DeleteDish.ts
├── data/
│   └── repositories/
│       ├── MenuManagementRepository.ts
│       └── DishManagementRepository.ts
├── services/
│   ├── MenuService.ts
│   └── DishService.ts
├── components/
│   └── restaurant/
│       ├── MenuManagement.tsx
│       ├── MenuForm.tsx
│       ├── DishManagement.tsx
│       └── DishForm.tsx
└── app/
    └── resto/
        └── [id]/
            ├── menus/
            │   └── page.tsx
            └── dishes/
                └── page.tsx
```

## Utilisation

### Routes

- **Gestion des menus**: `/resto/[id]/menus`
- **Gestion des plats**: `/resto/[id]/dishes`

Où `[id]` est l'UUID du restaurant.

### Fonctionnalités

#### Gestion des Menus

1. **Créer un menu**
   - Cliquez sur "Nouveau Menu"
   - Remplissez le formulaire (nom, description, prix, image, disponibilité)
   - Validez

2. **Modifier un menu**
   - Cliquez sur l'icône "Modifier" (crayon)
   - Modifiez les champs souhaités
   - Enregistrez

3. **Supprimer un menu**
   - Cliquez sur l'icône "Supprimer" (poubelle)
   - Confirmez la suppression

4. **Toggle disponibilité**
   - Cliquez sur l'icône œil pour activer/désactiver

#### Gestion des Plats

1. **Créer un plat**
   - Cliquez sur "Nouveau Plat"
   - Remplissez le formulaire:
     - Nom *
     - Catégorie *
     - Prix *
     - Description (optionnel)
     - Temps de préparation (optionnel)
     - Image URL (optionnel)
     - Disponibilité
   - Validez

2. **Filtrer par catégorie**
   - Utilisez les boutons de catégorie en haut
   - Cliquez sur "Tous" pour voir tous les plats

3. **Modifier/Supprimer un plat**
   - Identique aux menus

## Validation métier

Les Use Cases incluent la validation suivante:

### Menus
- ✅ Nom requis
- ✅ Restaurant ID requis
- ✅ Prix positif (si fourni)

### Plats
- ✅ Nom requis
- ✅ Restaurant ID requis
- ✅ Catégorie requise
- ✅ Prix requis et positif
- ✅ Temps de préparation positif (si fourni)

## Sécurité (RLS)

Les politiques Row Level Security garantissent que:

1. **Gérants**:
   - Peuvent gérer uniquement les menus/plats de leur restaurant
   - Ont accès complet (CRUD) à leurs données

2. **Clients**:
   - Peuvent voir uniquement les menus/plats disponibles
   - Lecture seule

3. **Non authentifiés**:
   - Peuvent voir les menus/plats publics disponibles

## Tests

Pour tester les fonctionnalités:

1. Connectez-vous en tant que gérant
2. Naviguez vers `/resto/[votre-restaurant-id]/menus`
3. Créez quelques menus
4. Naviguez vers `/resto/[votre-restaurant-id]/dishes`
5. Créez des plats avec différentes catégories
6. Testez les filtres, modifications, suppressions

## Principes d'architecture respectés

### ✅ Separation of Concerns
- Chaque couche a une responsabilité unique
- Les entités métier sont indépendantes de l'infrastructure

### ✅ Dependency Inversion
- Les use cases dépendent d'interfaces, pas d'implémentations
- Le core ne dépend pas de la couche data

### ✅ Single Responsibility
- Chaque use case fait une seule chose
- Les repositories gèrent uniquement la persistance

### ✅ Open/Closed Principle
- Facilement extensible pour ajouter de nouveaux use cases
- Pas besoin de modifier le code existant

## Prochaines étapes

1. **Tests unitaires**: Ajouter des tests pour les use cases
2. **Upload d'images**: Intégrer Supabase Storage pour les images
3. **Relations menu-plats**: Créer une table de liaison
4. **Statistiques**: Ajouter des métriques sur les plats les plus commandés

## Troubleshooting

### Erreur: "Cannot find module"
- Vérifiez que tous les fichiers ont été créés
- Redémarrez le serveur de développement

### Erreur: "Permission denied"
- Vérifiez que les politiques RLS sont correctement configurées
- Assurez-vous d'être connecté en tant que gérant

### Erreur: "Failed to fetch"
- Vérifiez la connexion à Supabase
- Vérifiez que les tables existent
- Consultez la console pour plus de détails

## Support

Pour toute question, consultez:
- `ARCHITECTURE_DIAGRAM.md`
- `CLEAN_ARCHITECTURE.md`
- `DATABASE_SCHEMA_MENUS_PLATS.md`
