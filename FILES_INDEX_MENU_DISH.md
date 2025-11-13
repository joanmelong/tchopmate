# Index des fichiers - Gestion Menus et Plats

Ce document liste tous les fichiers créés/modifiés pour la User Story 4.1.

## 📁 Structure complète

### 🎯 Core Layer (Business Logic)

| Fichier | Type | Description |
|---------|------|-------------|
| `src/core/entities/Menu.ts` | Entité | DTOs pour les menus (MenuDTO, CreateMenuDTO, UpdateMenuDTO) |
| `src/core/entities/Dish.ts` | Entité | DTOs pour les plats (DishDTO, CreateDishDTO, UpdateDishDTO) |
| `src/core/interfaces/IMenuRepository.ts` | Interface | IMenuManagementRepository, IDishManagementRepository |
| `src/core/interfaces/IDishRepository.ts` | Interface | IDishRepository (mis à jour) |
| `src/core/use-cases/menu/GetMenusByRestaurant.ts` | Use Case | Récupérer les menus d'un restaurant |
| `src/core/use-cases/menu/CreateMenu.ts` | Use Case | Créer un nouveau menu |
| `src/core/use-cases/menu/UpdateMenu.ts` | Use Case | Mettre à jour un menu |
| `src/core/use-cases/menu/DeleteMenu.ts` | Use Case | Supprimer un menu |
| `src/core/use-cases/dish/GetDishesByRestaurant.ts` | Use Case | Récupérer les plats d'un restaurant |
| `src/core/use-cases/dish/CreateDish.ts` | Use Case | Créer un nouveau plat |
| `src/core/use-cases/dish/UpdateDish.ts` | Use Case | Mettre à jour un plat |
| `src/core/use-cases/dish/DeleteDish.ts` | Use Case | Supprimer un plat |

### 💾 Data Layer (Persistence)

| Fichier | Type | Description |
|---------|------|-------------|
| `src/data/repositories/MenuManagementRepository.ts` | Repository | Implémentation Supabase pour les menus |
| `src/data/repositories/DishManagementRepository.ts` | Repository | Implémentation Supabase pour les plats |

### 🔧 Service Layer (Facade)

| Fichier | Type | Description |
|---------|------|-------------|
| `src/services/MenuService.ts` | Service | Service façade pour la gestion des menus |
| `src/services/DishService.ts` | Service | Service façade pour la gestion des plats |

### 🎨 Presentation Layer (UI)

| Fichier | Type | Description |
|---------|------|-------------|
| `src/components/restaurant/MenuManagement.tsx` | Component | Composant de gestion des menus |
| `src/components/restaurant/MenuForm.tsx` | Component | Formulaire de création/modification de menu |
| `src/components/restaurant/DishManagement.tsx` | Component | Composant de gestion des plats |
| `src/components/restaurant/DishForm.tsx` | Component | Formulaire de création/modification de plat |
| `src/app/resto/[id]/menus/page.tsx` | Page | Page de gestion des menus (modifiée) |
| `src/app/resto/[id]/dishes/page.tsx` | Page | Page de gestion des plats (modifiée) |

### 📚 Documentation

| Fichier | Type | Description |
|---------|------|-------------|
| `DATABASE_SCHEMA_MENUS_PLATS.md` | Documentation | Schéma détaillé de la base de données |
| `create_menus_plats_tables.sql` | Script SQL | Script de création des tables et RLS |
| `MENU_DISH_MANAGEMENT_README.md` | Guide | Guide complet d'utilisation |
| `IMPLEMENTATION_SUMMARY.md` | Documentation | Récapitulatif technique détaillé |
| `QUICK_START_MENU_DISH.md` | Guide | Guide de démarrage rapide (5 min) |
| `TESTING_PLAN_MENU_DISH.md` | Plan de tests | Plan de tests complet |
| `CHANGELOG_MENU_DISH.md` | Changelog | Journal des modifications |
| `EXECUTIVE_SUMMARY_MENU_DISH.md` | Résumé | Résumé exécutif du projet |
| `FILES_INDEX_MENU_DISH.md` | Index | Ce fichier - Index de tous les fichiers |

---

## 🗂️ Par catégorie fonctionnelle

### Gestion des Menus
```
Core:
├── entities/Menu.ts
├── interfaces/IMenuRepository.ts (IMenuManagementRepository)
└── use-cases/menu/
    ├── GetMenusByRestaurant.ts
    ├── CreateMenu.ts
    ├── UpdateMenu.ts
    └── DeleteMenu.ts

Data:
└── repositories/MenuManagementRepository.ts

Service:
└── MenuService.ts

UI:
├── components/restaurant/MenuManagement.tsx
├── components/restaurant/MenuForm.tsx
└── app/resto/[id]/menus/page.tsx
```

### Gestion des Plats
```
Core:
├── entities/Dish.ts
├── interfaces/IMenuRepository.ts (IDishManagementRepository)
└── use-cases/dish/
    ├── GetDishesByRestaurant.ts
    ├── CreateDish.ts
    ├── UpdateDish.ts
    └── DeleteDish.ts

Data:
└── repositories/DishManagementRepository.ts

Service:
└── DishService.ts

UI:
├── components/restaurant/DishManagement.tsx
├── components/restaurant/DishForm.tsx
└── app/resto/[id]/dishes/page.tsx
```

---

## 📊 Statistiques

| Catégorie | Nombre |
|-----------|--------|
| **Entités** | 2 |
| **Interfaces** | 2 |
| **Use Cases** | 8 |
| **Repositories** | 2 |
| **Services** | 2 |
| **Composants React** | 4 |
| **Pages** | 2 |
| **Fichiers Documentation** | 8 |
| **Scripts SQL** | 1 |
| **TOTAL** | **31 fichiers** |

---

## 🎯 Dépendances entre fichiers

### Flux de dépendance (de haut en bas)

```
Pages (UI)
  ↓ utilise
Composants de gestion
  ↓ utilise
Services (façade)
  ↓ utilise
Use Cases (core)
  ↓ utilise
Interfaces (core)
  ↑ implémentée par
Repositories (data)
  ↓ utilise
Supabase Client
```

### Exemple concret - Création de menu

```
MenuForm.tsx
  → MenuService.createMenu()
    → CreateMenu.execute()
      → IMenuManagementRepository.createMenu()
        → MenuManagementRepository.createMenu()
          → supabase.from('menus').insert()
```

---

## 📖 Guide de lecture

### Pour commencer
1. **EXECUTIVE_SUMMARY_MENU_DISH.md** - Vue d'ensemble
2. **QUICK_START_MENU_DISH.md** - Démarrage en 5 min

### Pour comprendre
1. **IMPLEMENTATION_SUMMARY.md** - Architecture détaillée
2. **DATABASE_SCHEMA_MENUS_PLATS.md** - Structure BDD

### Pour développer
1. **MENU_DISH_MANAGEMENT_README.md** - Guide complet
2. **Code source** - Fichiers dans src/

### Pour tester
1. **TESTING_PLAN_MENU_DISH.md** - Plan de tests
2. **create_menus_plats_tables.sql** - Setup BDD

### Pour référence
1. **CHANGELOG_MENU_DISH.md** - Historique
2. **FILES_INDEX_MENU_DISH.md** - Ce fichier

---

## 🔍 Où trouver quoi ?

### Je veux...

**...créer un nouveau menu**
→ Voir `src/components/restaurant/MenuForm.tsx`
→ Use case: `src/core/use-cases/menu/CreateMenu.ts`

**...comprendre la validation**
→ Voir les use cases dans `src/core/use-cases/`

**...modifier le schéma de BDD**
→ Voir `DATABASE_SCHEMA_MENUS_PLATS.md`
→ Modifier `create_menus_plats_tables.sql`

**...ajouter une nouvelle fonctionnalité**
→ Suivre l'architecture dans `IMPLEMENTATION_SUMMARY.md`
→ Créer use case → repository → service → UI

**...comprendre les permissions RLS**
→ Voir `create_menus_plats_tables.sql` (section RLS)
→ Documentation dans `DATABASE_SCHEMA_MENUS_PLATS.md`

**...tester l'application**
→ Suivre `QUICK_START_MENU_DISH.md`
→ Plan détaillé dans `TESTING_PLAN_MENU_DISH.md`

---

## 🔗 Liens entre fichiers

### DTOs (Entities)
- Utilisés partout comme contrats de données
- Définis dans `src/core/entities/`
- Importés par use cases, services, repositories, UI

### Interfaces
- Définies dans `src/core/interfaces/`
- Implémentées par repositories dans `src/data/`
- Utilisées par use cases pour l'injection de dépendances

### Use Cases
- Définissent la logique métier
- Dépendent uniquement des interfaces (pas d'implémentation)
- Appelés par les services

### Services
- Façades qui orchestrent les use cases
- Point d'entrée pour l'UI
- Gèrent les repositories

### Repositories
- Implémentent les interfaces du core
- Communiquent avec Supabase
- Transforment les données BDD en DTOs

### Composants UI
- Appellent les services
- Affichent les données
- Gèrent l'interaction utilisateur

---

## 🛠️ Outils utilisés

| Outil | Usage |
|-------|-------|
| **TypeScript** | Langage principal |
| **React** | Composants UI |
| **Next.js 14** | Framework et routing |
| **Supabase** | Base de données et auth |
| **shadcn/ui** | Composants UI |
| **Tailwind CSS** | Styling |
| **Lucide React** | Icônes |

---

## 📝 Notes importantes

1. **Tous les fichiers suivent l'architecture propre** définie dans le projet
2. **Aucune dépendance circulaire** - Les couches ne dépendent que des couches inférieures
3. **Types TypeScript stricts** partout
4. **Documentation en français** pour faciliter la maintenance
5. **Cohérence de nommage** dans tous les fichiers

---

## 🚀 Prochaines étapes

Si vous devez ajouter une fonctionnalité :
1. Créer l'entité/DTO dans `src/core/entities/`
2. Définir l'interface dans `src/core/interfaces/`
3. Créer les use cases dans `src/core/use-cases/`
4. Implémenter le repository dans `src/data/repositories/`
5. Créer le service dans `src/services/`
6. Créer les composants UI dans `src/components/`
7. Créer les pages dans `src/app/`
8. Documenter dans un fichier MD

---

**Version:** 1.0.0  
**Date:** 2025-11-13  
**Projet:** TchopMate - User Story 4.1
