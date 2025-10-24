# 🛡️ Système d'Administration TCHOPMATE

## 📋 Vue d'ensemble

Le système d'administration de TCHOPMATE permet aux administrateurs de gérer les gérants de restaurants et de superviser l'ensemble de la plateforme. Il utilise une architecture sécurisée basée sur l'authentification Google et la gestion des rôles.

## 🔐 Sécurité et Authentification

### Administrateur
- **Email autorisé** : `joantsayem@gmail.com` uniquement
- **Authentification** : Google OAuth
- **Accès** : Interface complète d'administration

### Gérants
- **Création** : Par l'administrateur via l'interface admin
- **Authentification** : Google OAuth (vérification email)
- **Accès** : Interface restaurateur limitée à leur restaurant

## 🏗️ Architecture

### Séparation des responsabilités

```
📁 src/
├── 🛡️ app/admin/           # Interface d'administration
│   ├── login/              # Connexion admin
│   └── page.tsx           # Dashboard admin
├── 🍽️ app/resto/          # Interface restaurateur
│   ├── login/             # Connexion gérant
│   ├── create-resto/      # Création restaurant
│   └── [id]/              # Dashboard gérant
├── 🔧 lib/services/       # Services métier
│   ├── AuthService.ts     # Gestion authentification
│   └── GerantService.ts   # Gestion gérants
└── 🛡️ middleware.ts       # Protection routes
```

### Services Métier

#### `AuthService`
- Vérification des rôles (Admin/Gérant)
- Gestion des sessions
- Callbacks d'authentification Google
- Validation des autorisations

#### `GerantService`
- Création de gérants
- Récupération des listes
- Statistiques
- Gestion des restaurants associés

## 🚀 Flux d'Utilisation

### 1. Connexion Administrateur
```
/admin/login → Google Auth → /admin/login/callback → /admin
```

### 2. Création d'un Gérant
```
Admin saisit email → Création compte gérant → Email envoyé au gérant
```

### 3. Connexion Gérant
```
/resto/login → Saisie email → Google Auth → /resto/login/callback → Redirection
```

### 4. Première Connexion Gérant
```
Callback → /resto/create-resto → Création restaurant → /resto/[id]
```

### 5. Connexions Suivantes
```
Callback → Vérification restaurant → /resto/[id] (dashboard)
```

## 🔒 Sécurité Implémentée

### Middleware de Protection
- Vérification des tokens d'authentification
- Validation des rôles utilisateur
- Redirection automatique si non autorisé

### Validation des Emails
- Admin : `joantsayem@gmail.com` uniquement
- Gérants : Emails créés par l'admin uniquement

### Row Level Security (RLS)
- Politiques Supabase activées
- Accès restreint par rôle
- Isolation des données

## 📊 Fonctionnalités Admin

### Dashboard Principal
- **Statistiques** : Nombre de gérants, restaurants créés, en attente
- **Création** : Nouveau gérant par email
- **Liste** : Tous les gérants avec statut restaurant

### Gestion des Gérants
- ✅ Création automatique de comptes
- ✅ Vérification des emails autorisés
- ✅ Suivi des restaurants associés
- ✅ Statistiques en temps réel

## 🍽️ Fonctionnalités Gérant

### Connexion Sécurisée
- ✅ Vérification email autorisé
- ✅ Authentification Google obligatoire
- ✅ Redirection automatique selon statut

### Création Restaurant
- ✅ Formulaire complet (nom, localisation, photo)
- ✅ Upload d'images sécurisé
- ✅ Validation des données

### Dashboard Gérant
- ✅ Informations restaurant dynamiques
- ✅ Profil gérant personnalisé
- ✅ Interface responsive

## 🛠️ Technologies Utilisées

- **Frontend** : Next.js 14, React, TypeScript
- **UI** : Tailwind CSS, shadcn/ui
- **Authentification** : Supabase Auth + Google OAuth
- **Base de données** : PostgreSQL (Supabase)
- **Stockage** : Supabase Storage
- **Sécurité** : Row Level Security, Middleware

## 🔧 Configuration Requise

### Variables d'Environnement
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Configuration Supabase
1. **Auth** : Activer Google OAuth
2. **Storage** : Créer buckets `restaurants` et `plats`
3. **Database** : Exécuter le script de création des tables
4. **RLS** : Activer les politiques de sécurité

## 📝 Notes de Développement

### Principes Respectés
- ✅ **Séparation des responsabilités** : Services métier isolés
- ✅ **Interface utilisateur** : Composants réutilisables
- ✅ **Logique métier** : Services dédiés
- ✅ **Données** : Accès centralisé via Supabase

### Commentaires Code
- Documentation complète des services
- Explication des flux d'authentification
- Gestion d'erreurs robuste
- Types TypeScript stricts

## 🚨 Points d'Attention

### Sécurité
- L'email admin est codé en dur (`joantsayem@gmail.com`)
- Vérification double : rôle + email autorisé
- Déconnexion automatique si non autorisé

### Performance
- Chargement asynchrone des données
- États de chargement utilisateur
- Gestion d'erreurs gracieuse

### Évolutivité
- Services métier modulaires
- Interface admin extensible
- Architecture prête pour nouvelles fonctionnalités

---

*Système développé selon les principes d'architecture propre et les bonnes pratiques de sécurité.*
