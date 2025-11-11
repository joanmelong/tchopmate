# 📦 Source Code - Architecture Overview

## Description

Le dossier **src** contient tout le code source de l'application TchopMate, organisé selon les principes de **Clean Architecture**.

## 🏗️ Structure Complète

```
src/
├── app/                    # Next.js App Router (Pages & Layouts)
├── components/             # Composants React réutilisables
├── core/                   # ⭐ Business Logic Layer (Logique métier)
├── data/                   # 💾 Data Access Layer (Accès données)
├── hooks/                  # 🎣 React Custom Hooks (Interface Adapters)
├── lib/                    # 🛠️ Utilities & Infrastructure
├── modele/                 # ⚠️ Legacy Models (à migrer)
├── services/               # ⚠️ Legacy Services (à migrer)
├── styles/                 # 🎨 Styles globaux CSS
├── middleware.ts           # Next.js Middleware
└── components.json         # Configuration shadcn/ui
```

## 📂 Dossiers Principaux

### ⭐ `core/` - Le Cœur de l'Application

**Le métier pur, indépendant de tout.**

- `entities/` - Objets métier avec leurs règles (User, Restaurant, Menu, Order)
- `interfaces/` - Contrats que les repositories doivent respecter
- `use-cases/` - Cas d'utilisation orchestrant la logique métier

**Principe:** Cette couche ne dépend de RIEN. Tout dépend d'elle.

👉 [Voir documentation complète](./core/README.md)

---

### 💾 `data/` - Accès aux Données

**Implémentations concrètes pour accéder aux données.**

- `dto/` - Data Transfer Objects (format base de données)
- `mappers/` - Conversions entre DTOs et Entities
- `repositories/` - Implémentations des interfaces (Supabase)

**Principe:** Connaît Supabase, mais retourne des Entities.

👉 [Voir documentation complète](./data/README.md)

---

### 🎣 `hooks/` - React Custom Hooks

**Adaptateurs entre Use Cases et composants React.**

- `use-auth.ts` - Authentification
- `use-restaurant.ts` - Gestion restaurants
- `use-protected-route.ts` - Protection routes
- etc.

**Principe:** Exposent les Use Cases de manière idiomatique React.

👉 [Voir documentation complète](./hooks/README.md)

---

### 🛠️ `lib/` - Infrastructure & Utilitaires

**Configuration, DI Container, utilitaires.**

- `di/` - Dependency Injection Container ⭐
- `debug/` - Outils de débogage
- `services/` - Services legacy (à migrer)
- `supabaseClient.ts` - Configuration Supabase
- `utils.ts` - Fonctions utilitaires

**Principe:** Support technique pour l'application.

👉 [Voir documentation complète](./lib/README.md)

---

### 🎨 `app/` - Pages & Layouts Next.js

**Routes et pages de l'application.**

Structure App Router:
```
app/
├── page.tsx              # Page d'accueil
├── layout.tsx            # Layout principal
├── admin/               # Routes admin
│   ├── page.tsx
│   └── login/
├── resto/               # Routes gérant
│   ├── [id]/
│   ├── login/
│   └── create-resto/
├── login/               # Login étudiant
├── register/            # Inscription
├── menu/                # Menu restaurants
└── api/                 # API Routes
    ├── admin/
    └── gerant/
```

👉 [Voir documentation API](./app/api/README.md)

---

### 🧩 `components/` - Composants React

**Composants UI réutilisables.**

Organisation:
```
components/
├── ui/                  # Composants shadcn/ui de base
├── admin/               # Composants spécifiques admin
├── auth/                # Composants d'authentification
└── debug/               # Composants de debug
```

---

### ⚠️ `modele/` & `services/` - Legacy (À Migrer)

**Ancien code avant Clean Architecture.**

Ces dossiers contiennent du code legacy qui doit être migré vers la nouvelle architecture.

- `modele/` → Migrer vers `core/entities/`
- `services/` → Migrer vers `core/use-cases/` + `data/repositories/`

👉 [Plan de migration modèles](./modele/README.md)  
👉 [Plan de migration services](./services/README.md)

---

## 🎯 Principes d'Architecture

### Dependency Rule (Règle de Dépendance)

```
   app/ components/        (UI - Framework)
         ↓
      hooks/                (Interface Adapters)
         ↓
    core/use-cases/        (Business Logic)
         ↓
   core/interfaces/        (Contracts)
         ↑
  data/repositories/       (Infrastructure)
```

**Règle d'or:** Les dépendances pointent vers l'intérieur (vers le Core).

### Layers (Couches)

1. **Core** (Métier) - Ne dépend de rien
2. **Data** (Infrastructure) - Dépend du Core
3. **Hooks** (Adapters) - Dépend du Core
4. **App/Components** (UI) - Dépend des Hooks

### Flow de Données

```
User Action (UI)
    ↓
Component appelle Hook
    ↓
Hook appelle Use Case (via DI)
    ↓
Use Case utilise Repository (interface)
    ↓
Repository implémentation accède DB
    ↓
Retourne Entity
    ↓
Use Case retourne au Hook
    ↓
Hook met à jour l'état React
    ↓
Component re-render
```

## 📋 Checklist Migration Legacy

### Modèles (modele/)
- [ ] Identifier tous les fichiers utilisés
- [ ] Créer Entities équivalentes dans `core/entities/`
- [ ] Créer DTOs dans `data/dto/`
- [ ] Créer Mappers dans `data/mappers/`
- [ ] Migrer composants vers nouvelles Entities
- [ ] Supprimer ancien dossier

### Services (services/)
- [ ] Identifier toutes les fonctions utilisées
- [ ] Créer Use Cases dans `core/use-cases/`
- [ ] Créer Repositories dans `data/repositories/`
- [ ] Créer Hooks dans `hooks/`
- [ ] Migrer composants vers nouveaux Hooks
- [ ] Supprimer ancien dossier

## 🧪 Organisation des Tests

```
__tests__/
├── core/
│   ├── entities/        # Tests des entités
│   └── use-cases/       # Tests des use cases
├── data/
│   ├── mappers/         # Tests des mappers
│   └── repositories/    # Tests des repositories (avec mocks)
├── hooks/               # Tests des hooks React
└── integration/         # Tests d'intégration
```

## 🚀 Commandes Utiles

```bash
# Développement
npm run dev

# Build production
npm run build

# Tests
npm test

# Linter
npm run lint

# Format
npm run format
```

## 📚 Documentation Principale

- **[CLEAN_ARCHITECTURE.md]** - Architecture complète
- **[MIGRATION_GUIDE.md]** - Guide de migration
- **[TESTING_GUIDE.md]** - Guide des tests
- **[OAUTH_REFACTORING.md]** - Refactoring OAuth
- **[README.md]** (racine) - Overview du projet

## 🎓 Pour les Nouveaux Développeurs

### Par où commencer?

1. **Lire** `CLEAN_ARCHITECTURE.md` à la racine
2. **Explorer** `src/core/` pour comprendre le métier
3. **Regarder** un exemple complet: `/resto/[id]/page.tsx`
4. **Suivre** un flow de A à Z (ex: login étudiant)

### Créer une nouvelle feature

1. Créer l'**Entity** dans `core/entities/`
2. Créer l'**Interface Repository** dans `core/interfaces/`
3. Créer les **Use Cases** dans `core/use-cases/`
4. Créer les **DTOs** dans `data/dto/`
5. Créer le **Mapper** dans `data/mappers/`
6. Implémenter le **Repository** dans `data/repositories/`
7. Ajouter au **DI Container** dans `lib/di/container.ts`
8. Créer le **Hook** dans `hooks/`
9. Utiliser dans les **Components**

### Modifier une feature existante

1. Identifier le **Use Case** concerné
2. Modifier la logique dans le **Use Case**
3. Tester unitairement
4. Les composants UI n'ont rien à changer (découplage!)

## ⚡ Performance

- **Code splitting** automatique avec Next.js
- **Lazy loading** des routes
- **Dependency Injection** avec singleton pattern
- **Memoization** dans les hooks avec `useMemo`/`useCallback`

## 🔐 Sécurité

- **RLS (Row Level Security)** activé sur Supabase
- **Authentication** via Supabase Auth
- **Authorization** dans les Use Cases
- **Input validation** dans les Use Cases
- **HTTPS only** en production

## 📦 Technologies Utilisées

- **Next.js 14** - Framework React
- **TypeScript** - Typage statique
- **Supabase** - Backend as a Service
- **Tailwind CSS** - Styling
- **shadcn/ui** - Composants UI
- **Jest** - Testing

---

**Dernière mise à jour:** 11 novembre 2025  
**Version:** 2.0.0 (Clean Architecture)  
**Projet:** TchopMate - Plateforme de restauration universitaire
