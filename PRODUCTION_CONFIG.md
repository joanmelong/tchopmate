# 🚀 Guide de Configuration Production - TchopMate

## 📋 Configurations requises pour le déploiement

### 1. Variables d'environnement Vercel
Ajouter ces variables dans Vercel Dashboard > Settings > Environment Variables :

```env
NEXT_PUBLIC_SUPABASE_URL=https://roykkxkzibsnrpwfwplw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJveWtreGt6aWJzbnJwd2Z3cGx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNzM2NTQsImV4cCI6MjA3NDc0OTY1NH0.vU3MxuEbJqKtk2-bPaecoVhtfJVKlcBqgrgXi7Sqvgo
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJveWtreGt6aWJzbnJwd2Z3cGx3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTE3MzY1NCwiZXhwIjoyMDc0NzQ5NjU0fQ.fOZTrNXPL-Tfze4LDzNOGLhLthBSzPNZKBX7gXGbKxg
NEXT_PUBLIC_SITE_URL=https://tchopmate.vercel.app
```

### 2. 🔧 Configuration Supabase Dashboard

#### A. Authentification - Site URL
1. Aller dans Supabase Dashboard > Authentication > URL Configuration
2. Ajouter les URLs autorisées :
   - **Site URL**: `https://tchopmate.vercel.app`
   - **Redirect URLs**: 
     - `https://tchopmate.vercel.app/home`
     - `https://tchopmate.vercel.app/admin/login/callback`
     - `https://tchopmate.vercel.app/resto/login/callback`

#### B. OAuth Providers (Google)
1. Aller dans Authentication > Providers > Google
2. Vérifier que les **Authorized redirect URIs** incluent :
   - `https://roykkxkzibsnrpwfwplw.supabase.co/auth/v1/callback`

#### C. CORS - Domaines autorisés
1. Aller dans API > Settings
2. Ajouter dans **CORS allowed origins** :
   - `https://tchopmate.vercel.app`
   - `https://*.vercel.app` (pour les preview deployments)

### 3. 📦 Storage Configuration
Les images sont déjà configurées pour Supabase Storage via `next.config.ts`

### 4. 🔐 RLS (Row Level Security)
Les politiques RLS sont déjà en place et fonctionneront en production.

### 5. ✅ Vérifications avant déploiement
- [ ] Variables d'environnement configurées sur Vercel
- [ ] Site URL mis à jour dans Supabase
- [ ] Redirect URLs configurées
- [ ] CORS configuré
- [ ] `npm run build` réussit
- [ ] `npm run dev` fonctionne

## 🚀 Commandes de déploiement
```bash
# Build local pour tester
npm run build

# Démarrer en mode développement
npm run dev

# Push vers Vercel (si Vercel CLI installé)
vercel --prod
```

## 🔍 Vérifications post-déploiement
1. Tester l'authentification Google
2. Vérifier l'affichage des images
3. Tester les redirections après login
4. Vérifier les APIs côté serveur