# 🍽️ TchopMate - Application de Gestion de Commandes

[![Clean Architecture](https://img.shields.io/badge/Architecture-Clean-blue.svg)](./CLEAN_ARCHITECTURE.md)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-DB-green.svg)](https://supabase.com)

Application web de gestion de commandes de plats pour restaurants universitaires, construite avec **Clean Architecture**.

---

## 📋 Table des matières

- [🎯 Fonctionnalités](#-fonctionnalités)
- [🏗️ Architecture](#️-architecture)
- [🚀 Démarrage rapide](#-démarrage-rapide)
- [📖 Documentation](#-documentation)
- [🧪 Tests](#-tests)
- [🤝 Contribution](#-contribution)

---

## 🎯 Fonctionnalités

### Pour les Étudiants
- ✅ Consulter les menus des restaurants
- ✅ Passer des commandes en ligne
- ✅ Suivre l'état de leurs commandes
- ✅ Scanner un QR code pour retirer la commande

### Pour les Gérants
- ✅ Gérer leur restaurant
- ✅ Créer et modifier les menus
- ✅ Ajouter/modifier/supprimer des plats
- ✅ Voir et traiter les commandes
- ✅ Consulter les statistiques de vente

### Pour les Administrateurs
- ✅ Vue globale sur tous les restaurants
- ✅ Gestion des utilisateurs
- ✅ Statistiques générales

---

## 🏗️ Architecture

Ce projet suit les principes de **Clean Architecture** pour garantir :

- ✅ **Indépendance des frameworks** : Le métier ne dépend pas de React/Next.js
- ✅ **Testabilité** : Logique métier testable sans UI ni DB
- ✅ **Indépendance de l'UI** : Facile de changer d'UI framework
- ✅ **Indépendance de la DB** : Facile de changer de base de données
- ✅ **Séparation des responsabilités** : Chaque couche a un rôle clair

### Structure des couches

```
src/
├── core/               # 🧠 Logique métier (entités, use cases)
├── data/               # 💾 Accès aux données (repositories, DTOs)
├── lib/                # 🔧 Configuration (DI, Supabase)
├── hooks/              # ⚛️ Hooks React (pont UI ↔ métier)
├── components/         # 🎨 Composants UI
└── app/                # 📄 Pages Next.js
```

📚 **[Lire la documentation complète de l'architecture](./CLEAN_ARCHITECTURE.md)**

---

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+
- npm ou pnpm
- Compte Supabase

### Installation

```bash
# Cloner le projet
git clone https://github.com/jojo-math/tchopmate.git
cd tchopmate

# Installer les dépendances
npm install
# ou
pnpm install

# Copier le fichier d'environnement
cp .env.example .env.local

# Configurer les variables d'environnement
# Éditer .env.local avec vos clés Supabase
```

### Variables d'environnement

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Lancer le serveur de développement

```bash
npm run dev
# ou
pnpm dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [📘 CLEAN_ARCHITECTURE.md](./CLEAN_ARCHITECTURE.md) | Guide complet de l'architecture |
| [📊 ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md) | Diagrammes et schémas visuels |
| [🚀 MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) | Guide de migration du code legacy |
| [🧪 TESTING_GUIDE.md](./TESTING_GUIDE.md) | Guide des tests unitaires |
| [⚙️ SETUP_GUIDE.md](./SETUP_GUIDE.md) | Configuration initiale |

---

## 🧪 Tests

Le projet utilise **Jest** et **React Testing Library** pour les tests.

### Exécuter les tests

```bash
# Tous les tests
npm test

# Mode watch
npm test -- --watch

# Coverage
npm test -- --coverage
```

### Exemple de test

```typescript
// Test d'une entité (logique métier pure)
test('Un étudiant peut passer une commande', () => {
  const student = new User({ role: UserRole.STUDENT, ... });
  expect(student.isStudent()).toBe(true);
});

// Test d'un use case
test('LoginUseCase valide les credentials', async () => {
  const useCase = new LoginUseCase(mockRepo);
  await expect(
    useCase.execute({ email: '', password: '' })
  ).rejects.toThrow('Email requis');
});
```

📚 **[Voir le guide complet des tests](./TESTING_GUIDE.md)**

---

## 📁 Structure du projet

```
tchopmate/
├── src/
│   ├── core/                    # Logique métier
│   │   ├── entities/            # Entités (User, Restaurant, Order...)
│   │   ├── interfaces/          # Interfaces des repositories
│   │   └── use-cases/           # Cas d'utilisation métier
│   │
│   ├── data/                    # Couche données
│   │   ├── dto/                 # Data Transfer Objects
│   │   ├── mappers/             # Convertisseurs DTO ↔ Entities
│   │   └── repositories/        # Implémentations Supabase
│   │
│   ├── lib/                     # Configuration
│   │   ├── di/                  # Injection de dépendances
│   │   └── supabaseClient.ts    # Client Supabase
│   │
│   ├── hooks/                   # Hooks React personnalisés
│   │   ├── use-auth.ts
│   │   ├── use-session.ts
│   │   └── use-restaurant.ts
│   │
│   ├── components/              # Composants UI
│   │   ├── ui/                  # Composants de base
│   │   └── admin/               # Composants métier
│   │
│   └── app/                     # Pages Next.js (App Router)
│       ├── (auth)/              # Groupe : Authentification
│       ├── (student)/           # Groupe : Étudiants
│       ├── (staff)/             # Groupe : Gérants
│       └── (admin)/             # Groupe : Administrateurs
│
├── tests/                       # Tests
│   └── unit/
│       ├── entities/            # Tests des entités
│       └── use-cases/           # Tests des use cases
│
├── documentation/               # Documentation du projet
│
├── CLEAN_ARCHITECTURE.md        # Guide architecture
├── MIGRATION_GUIDE.md           # Guide migration
├── TESTING_GUIDE.md             # Guide tests
└── README.md                    # Ce fichier
```

---

## 🛠️ Technologies utilisées

- **Framework** : [Next.js 14](https://nextjs.org) (App Router)
- **Language** : [TypeScript](https://www.typescriptlang.org)
- **Base de données** : [Supabase](https://supabase.com) (PostgreSQL + Auth)
- **UI** : [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- **Tests** : [Jest](https://jestjs.io) + [React Testing Library](https://testing-library.com)
- **Architecture** : Clean Architecture / Hexagonal Architecture

---

## 🤝 Contribution

### Workflow de contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. **Suivre l'architecture Clean** (voir [CLEAN_ARCHITECTURE.md](./CLEAN_ARCHITECTURE.md))
4. Écrire les tests
5. Commit les changements (`git commit -m 'Add: AmazingFeature'`)
6. Push vers la branche (`git push origin feature/AmazingFeature`)
7. Ouvrir une Pull Request

### Règles de contribution

- ✅ Suivre l'architecture Clean (entités → use cases → repositories → UI)
- ✅ Écrire des tests pour les entités et use cases
- ✅ Pas d'appel direct à Supabase dans les composants
- ✅ Utiliser les hooks pour accéder à la logique métier
- ✅ TypeScript strict mode
- ✅ Code formaté avec Prettier

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](./LICENSE) pour plus de détails.

---

## 👥 Équipe

- **Développement** : Équipe TchopMate
- **Architecture** : Clean Architecture
- **Branche actuelle** : `fix/auth-admin`

---

## 📞 Support

Pour toute question ou problème :

1. Consulter la [documentation](./CLEAN_ARCHITECTURE.md)
2. Voir les [issues GitHub](https://github.com/jojo-math/tchopmate/issues)
3. Contacter l'équipe de développement

---

## ⭐ Remerciements

Merci à tous les contributeurs qui ont participé à ce projet !

---

**Construit avec ❤️ et Clean Architecture**
