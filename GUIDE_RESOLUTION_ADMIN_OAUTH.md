# Guide de Résolution - Connexion Admin OAuth Google

## Problème
La connexion admin avec Google OAuth ne fonctionne pas avec l'email `joantsayem@gmail.com`.

## Diagnostic étape par étape

### 1. Vérifier la configuration OAuth Google dans Supabase

1. Aller dans le dashboard Supabase : https://roykkxkzibsnrpwfwplw.supabase.co
2. Aller dans **Authentication > Providers**
3. Vérifier que **Google** est activé
4. Vérifier la configuration :
   - **Client ID** : doit être configuré
   - **Client Secret** : doit être configuré
   - **Redirect URL** : doit être `http://localhost:3000/admin/login/callback` pour le dev

### 2. Vérifier le compte admin dans la base de données

Exécuter le script `diagnostic_admin_oauth.sql` dans l'éditeur SQL de Supabase.

### 3. Vérifier les variables d'environnement

✅ `NEXT_PUBLIC_ADMIN_EMAIL=joantsayem@gmail.com` - Ajouté

### 4. Étapes de test

1. Aller sur http://localhost:3000/admin/debug
2. Vérifier les informations affichées
3. Cliquer sur "Test Google Login"
4. Observer les logs dans la console du navigateur

### 5. Résolutions possibles

#### Si OAuth Google n'est pas configuré :
1. Aller dans Google Cloud Console
2. Créer un projet OAuth si nécessaire
3. Configurer les credentials OAuth 2.0
4. Ajouter les URIs de redirection :
   - `http://localhost:3000/auth/callback` (Supabase)
   - `http://localhost:3000/admin/login/callback` (Notre app)

#### Si le compte admin n'existe pas :
Exécuter le script SQL de création du compte admin.

#### Si les politiques RLS bloquent :
Vérifier et ajuster les politiques RLS sur la table `compte`.

### 6. Test de la redirection OAuth

URL de test direct (remplacer CLIENT_ID) :
```
https://roykkxkzibsnrpwfwplw.supabase.co/auth/v1/authorize?provider=google&redirect_to=http://localhost:3000/admin/login/callback
```

### 7. Logs à surveiller

Dans la console du navigateur :
- `[useAdminAuth] Début du callback`
- `[HandleAdminCallback] Session récupérée`
- `[SupabaseAuthRepository] Session OAuth récupérée`

## Actions immédiates

1. ✅ Variable d'environnement `NEXT_PUBLIC_ADMIN_EMAIL` ajoutée
2. ✅ Debugging amélioré dans le hook `useAdminAuth`
3. ✅ Page de debug créée : `/admin/debug`
4. 🔄 À faire : Exécuter le script SQL de diagnostic
5. 🔄 À faire : Vérifier la configuration OAuth Google dans Supabase