# 🔍 Diagnostic Complet - Auth Admin

## Symptômes Observés

```
GET /admin/login/callback 200 in 1003ms
GET /admin/login?error=R%C3%B4le+invalide 200 in 561ms
```

Bloqué à: `http://localhost:3000/admin/login/callback#`

## Analyse du Problème

### Cause #1: Rôle Incorrect dans la Base de Données ✅ **PLUS PROBABLE**

Le message "Rôle invalide" indique que:
- ✅ L'email est correct (`joantsayem@gmail.com`)
- ✅ La session OAuth fonctionne
- ❌ Le rôle dans la DB n'est pas `Administrateur`

**Solution:**
```sql
UPDATE compte 
SET role = 'Administrateur'
WHERE email = 'joantsayem@gmail.com';
```

### Cause #2: Compte Admin Inexistant

Le compte n'existe pas encore dans la table `compte`.

**Solution:**
```sql
INSERT INTO compte (email, nom, prenom, role)
VALUES ('joantsayem@gmail.com', 'Tsayem', 'Joan', 'Administrateur');
```

### Cause #3: user_id Non Lié

Le compte existe mais `user_id` est NULL ou ne correspond pas.

**Vérification:**
```sql
SELECT id, email, role, user_id 
FROM compte 
WHERE email = 'joantsayem@gmail.com';
```

**Solution:** Le code gère automatiquement la liaison maintenant.

## Étapes de Diagnostic

### 1. Ouvrir la Console Navigateur (F12)

Vous devriez voir ces logs:

```
[useAdminAuth] Début du callback
[HandleAdminCallback] Début du traitement
[SupabaseAuthRepository] Session OAuth récupérée: { userId: '...', email: 'joantsayem@gmail.com' }
[SupabaseAuthRepository] Recherche compte par user_id: { ... }
[HandleAdminCallback] Session récupérée: { hasSession: true, email: 'joantsayem@gmail.com', role: '???' }
[HandleAdminCallback] Vérification email: { received: 'joantsayem@gmail.com', expected: 'joantsayem@gmail.com', match: true }
[HandleAdminCallback] Vérification rôle: { role: '???', isAdmin: false }
[HandleAdminCallback] Rôle invalide
```

**Point clé:** Regarder la valeur de `role` dans les logs.

### 2. Vérifier le Compte dans Supabase

Aller dans: **Supabase Dashboard → Table Editor → Table `compte`**

Chercher: `joantsayem@gmail.com`

Colonnes à vérifier:
- `email`: doit être `joantsayem@gmail.com`
- `role`: doit être **exactement** `Administrateur`
- `user_id`: peut être NULL la première fois (sera mis à jour)

### 3. Valeurs Correctes des Rôles

| UserRole Enum | Valeur DB | Correct? |
|---------------|-----------|----------|
| `UserRole.ADMIN` | `Administrateur` | ✅ |
| `UserRole.STAFF` | `Gerant` | ✅ |
| `UserRole.STUDENT` | `Etudiant` | ✅ |

**Valeurs INCORRECTES à éviter:**
- ❌ `Admin` (sans "istrateur")
- ❌ `administrateur` (minuscule)
- ❌ `ADMINISTRATEUR` (majuscules)
- ❌ `admin`

## Solutions par Ordre de Priorité

### Solution 1: Corriger le Rôle (90% des cas)

```sql
-- Dans Supabase SQL Editor
UPDATE compte 
SET role = 'Administrateur'
WHERE email = 'joantsayem@gmail.com';

-- Vérifier
SELECT id, email, role, user_id 
FROM compte 
WHERE email = 'joantsayem@gmail.com';
```

**Résultat attendu:**
```
id | email                    | role            | user_id
---+-------------------------+-----------------+----------
1  | joantsayem@gmail.com    | Administrateur  | xxxxxxxx
```

### Solution 2: Créer le Compte (si inexistant)

```sql
-- Vérifier d'abord
SELECT * FROM compte WHERE email = 'joantsayem@gmail.com';

-- Si aucun résultat, créer
INSERT INTO compte (email, nom, prenom, role)
VALUES ('joantsayem@gmail.com', 'Tsayem', 'Joan', 'Administrateur');
```

### Solution 3: Nettoyer et Recréer

```sql
-- ATTENTION: Cela supprime le compte existant
DELETE FROM compte WHERE email = 'joantsayem@gmail.com';

-- Recréer proprement
INSERT INTO compte (email, nom, prenom, role)
VALUES ('joantsayem@gmail.com', 'Tsayem', 'Joan', 'Administrateur');
```

## Procédure de Test Complète

### 1. Corriger la Base de Données

Exécuter la Solution 1 ci-dessus.

### 2. Se Déconnecter Complètement

```javascript
// Dans la console navigateur (F12)
localStorage.clear();
sessionStorage.clear();
```

Ou simplement: **Fermer tous les onglets localhost:3000**

### 3. Vider le Cache Supabase

Dans Supabase Dashboard:
- Authentication → Users
- Si `joantsayem@gmail.com` apparaît, noter son `user_id`
- Sinon, il sera créé automatiquement

### 4. Réessayer la Connexion

1. Ouvrir **nouveau onglet**: `http://localhost:3000/admin/login`
2. Ouvrir **Console navigateur** (F12)
3. Cliquer **"Se connecter avec Google"**
4. S'authentifier avec `joantsayem@gmail.com`
5. Observer les logs dans la console

### 5. Vérifier les Logs Attendus

**Succès:**
```
[useAdminAuth] Début du callback
[HandleAdminCallback] Début du traitement
[SupabaseAuthRepository] Session OAuth récupérée: { userId: 'xxx', email: 'joantsayem@gmail.com' }
[SupabaseAuthRepository] Recherche compte par user_id: { userId: 'xxx', found: true }
[HandleAdminCallback] Session récupérée: { hasSession: true, email: 'joantsayem@gmail.com', role: 'Administrateur' }
[HandleAdminCallback] Vérification email: { received: 'joantsayem@gmail.com', expected: 'joantsayem@gmail.com', match: true }
[HandleAdminCallback] Vérification rôle: { role: 'Administrateur', isAdmin: true }
[HandleAdminCallback] Authentification réussie
[useAdminAuth] Callback réussi, redirection vers /admin
```

**Échec:**
```
[HandleAdminCallback] Vérification rôle: { role: 'Etudiant', isAdmin: false }
[HandleAdminCallback] Rôle invalide
[useAdminAuth] Erreur callback: Rôle invalide. Vous devez avoir le rôle Administrateur dans la base de données.
```

## Vérifications Supplémentaires

### A. Vérifier la Configuration OAuth Google

Supabase Dashboard → Authentication → Providers → Google

- ✅ Enabled: ON
- ✅ Client ID: configuré
- ✅ Client Secret: configuré

### B. Vérifier les URLs de Redirection

Dans Google Cloud Console:
- Redirect URIs doit inclure: `https://your-project.supabase.co/auth/v1/callback`

### C. Vérifier les Variables d'Environnement

`.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### D. Vérifier le Schéma de la Table

```sql
-- La table compte doit avoir ces colonnes
\d compte

-- Colonnes requises:
-- id (int/bigint)
-- email (text)
-- nom (text)
-- prenom (text)
-- role (text)
-- user_id (uuid, nullable)
```

## Cas Particuliers

### Si "Session non trouvée"

La session OAuth n'est pas établie. Causes possibles:
- Cookies bloqués
- Mode privé/incognito
- Extensions navigateur (adblocker)

**Solution:** Désactiver les extensions et réessayer.

### Si Boucle Infinie de Redirection

Le callback s'exécute mais redirige à nouveau vers Google.

**Solution:** Vérifier que `detectSessionInUrl: true` dans la config Supabase:

```typescript
// src/lib/supabaseClient.ts
export const createClient = () => {
  return createClientInstance(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true, // ✅ IMPORTANT
      },
    }
  );
};
```

## Commandes SQL Utiles

### Lister tous les comptes
```sql
SELECT id, email, nom, prenom, role, user_id, created_at
FROM compte
ORDER BY created_at DESC;
```

### Lister tous les rôles uniques
```sql
SELECT DISTINCT role, COUNT(*) as count
FROM compte
GROUP BY role;
```

### Trouver les comptes sans user_id
```sql
SELECT id, email, role
FROM compte
WHERE user_id IS NULL;
```

### Lier un user_id manuellement
```sql
UPDATE compte
SET user_id = 'uuid-from-supabase-auth'
WHERE email = 'joantsayem@gmail.com';
```

## Contact Support

Si le problème persiste après toutes ces vérifications:

1. Capturer les logs complets de la console
2. Faire une capture d'écran de la table `compte` dans Supabase
3. Vérifier la configuration OAuth dans Supabase et Google Cloud
4. Consulter les logs Supabase (Dashboard → Logs)

---

**Dernière mise à jour:** 11 novembre 2025  
**Temps de résolution estimé:** 5-10 minutes
