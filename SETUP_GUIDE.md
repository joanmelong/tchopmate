# 🚀 Guide de Mise en Place - Système d'Authentification Automatique

## 📋 Vue d'Ensemble

Le nouveau système fonctionne ainsi :
1. **Admin/Gérant** se connecte via Google Auth
2. **Supabase** crée automatiquement l'utilisateur dans `auth.users`
3. **Callback** crée automatiquement le compte dans `public.compte` avec le bon rôle
4. **Redirection** vers l'interface appropriée

## 🔧 Installation

### Étape 1 : Exécuter le Script Principal
Copier et exécuter `automatic_auth_system.sql` dans l'éditeur SQL de Supabase :

```sql
-- Ce script crée :
-- ✅ Fonction create_user_account() pour contourner RLS
-- ✅ Politiques RLS corrigées
-- ✅ Trigger automatique pour créer les comptes
-- ✅ Gestion des rôles selon l'email
```

### Étape 2 : Exécuter le Script des Gérants
Copier et exécuter `preauthorized_gerants.sql` dans l'éditeur SQL de Supabase :

```sql
-- Ce script crée :
-- ✅ Fonction create_preauthorized_gerant() pour l'admin
-- ✅ Fonction link_preauthorized_account() pour la liaison
-- ✅ Politiques RLS pour les comptes pré-autorisés
```

## 🎯 Fonctionnement du Système

### Pour l'Administrateur
1. **Connexion** : `/admin/login` → Google Auth
2. **Callback** : Vérification email `joantsayem@gmail.com`
3. **Création** : Compte admin créé automatiquement
4. **Redirection** : `/admin` (dashboard admin)

### Pour les Gérants
1. **Admin crée** : Gérant via interface admin (email seulement)
2. **Gérant se connecte** : `/resto/login` → Google Auth
3. **Callback** : Liaison automatique du compte pré-autorisé
4. **Redirection** : `/resto/create-resto` ou `/resto/[id]`

### Pour les Clients
1. **Connexion** : Google Auth depuis n'importe où
2. **Callback** : Compte client créé automatiquement
3. **Redirection** : Interface client

## 🔍 Vérification

### Vérifier les Fonctions Créées
```sql
-- Vérifier les fonctions RPC
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%account%';
```

### Vérifier les Politiques RLS
```sql
-- Vérifier les politiques
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'compte'
ORDER BY policyname;
```

### Vérifier le Trigger
```sql
-- Vérifier le trigger
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

## 🧪 Test du Système

### Test Admin
1. Se déconnecter complètement
2. Aller sur `/admin/login`
3. Se connecter avec `joantsayem@gmail.com`
4. Vérifier la redirection vers `/admin`

### Test Gérant
1. **Admin** : Créer un gérant via `/admin`
2. **Gérant** : Se connecter avec l'email autorisé
3. Vérifier la redirection vers `/resto/create-resto`

### Test Client
1. Se connecter avec n'importe quel autre email Google
2. Vérifier la création automatique du compte client

## 🛠️ Dépannage

### Erreur "Fonction RPC non disponible"
```sql
-- Vérifier que les fonctions existent
SELECT * FROM public.create_user_account(
  gen_random_uuid(),
  'Test',
  'Admin',
  'test@example.com',
  'Administrateur'
);
```

### Erreur "Politique RLS"
```sql
-- Vérifier les politiques
SELECT * FROM pg_policies WHERE tablename = 'compte';
```

### Erreur "Trigger non créé"
```sql
-- Recréer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 📊 Avantages du Nouveau Système

### ✅ Automatique
- Création automatique des comptes lors de l'authentification
- Liaison automatique des comptes pré-autorisés
- Gestion automatique des rôles

### ✅ Sécurisé
- Politiques RLS correctes
- Fonctions RPC avec privilèges élevés
- Vérification des emails autorisés

### ✅ Flexible
- Support des comptes pré-autorisés (gérants)
- Création automatique des clients
- Gestion des mises à jour d'informations

### ✅ Robuste
- Gestion des erreurs complète
- Fallbacks en cas de problème
- Logs détaillés pour le débogage

## 🚨 Points d'Attention

### Sécurité
- L'email admin est codé en dur (`joantsayem@gmail.com`)
- Les gérants doivent être créés par l'admin
- Les clients sont créés automatiquement

### Performance
- Les fonctions RPC sont optimisées
- Les politiques RLS sont efficaces
- Les triggers sont légers

### Maintenance
- Surveiller les logs d'erreur
- Vérifier les politiques RLS régulièrement
- Tester les nouvelles fonctionnalités

---

**🎉 Le système est maintenant entièrement automatique !** Plus besoin de créer manuellement les comptes, tout se fait lors de l'authentification Google.
