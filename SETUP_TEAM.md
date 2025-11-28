# Guide de configuration pour l'équipe

## Installation rapide

### 1. Cloner le projet
```bash
git clone <url-du-repo>
cd tchopmate
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration de l'environnement

Copiez le fichier d'exemple :
```bash
cp .env.example .env.local
```

Puis éditez `.env.local` et remplissez avec vos clés Supabase :
- Allez sur https://supabase.com/dashboard
- Sélectionnez votre projet
- Settings > API
- Copiez les clés dans `.env.local`

⚠️ **Ne commitez JAMAIS le fichier `.env.local` !**

### 4. Configuration de la base de données

Suivez les instructions dans `SETUP_DATABASE.md` pour exécuter les scripts SQL nécessaires.

### 5. Lancer le projet
```bash
npm run dev
```

Le site sera accessible sur http://localhost:3000

## Structure du projet

```
src/
├── app/                    # Pages Next.js
│   ├── menu/              # Page menu client
│   ├── favoris/           # Page favoris (stockés en BD)
│   ├── commandes/         # Page commandes client
│   ├── resto/[id]/orders/ # Page gestion commandes gérant
│   └── api/               # API routes
├── components/            # Composants réutilisables
├── lib/                   # Utilitaires
└── services/              # Services API

Scripts SQL (à la racine) :
- add_statut_enum_values.sql
- fix_compte_rls_select.sql
- fix_all_rls_for_orders.sql
- create_favoris_table.sql
- enable_rls_back.sql
```

## Fonctionnalités principales

### Pour les clients
- Parcourir le menu
- Ajouter des plats aux favoris (stockés en BD)
- Passer des commandes
- Voir l'historique des commandes

### Pour les gérants
- Voir les commandes de leur restaurant
- Gérer les statuts : En attente → Prêt → Livrée
- Gérer les menus et plats

## Problèmes courants

### Le serveur ne démarre pas
- Vérifiez que `.env.local` existe et contient les bonnes clés
- Vérifiez que `node_modules` est installé : `npm install`

### Erreurs d'authentification
- Vérifiez que `SUPABASE_SERVICE_ROLE_KEY` est bien configurée
- Redémarrez le serveur après avoir modifié `.env.local`

### Les commandes ne s'affichent pas
- Vérifiez que tous les scripts SQL ont été exécutés
- Vérifiez la console du navigateur et les logs du serveur

## Besoin d'aide ?

Consultez `SETUP_DATABASE.md` pour la configuration de la base de données.
