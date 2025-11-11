# 🚨 Fix Auth Admin - Guide Rapide

## Problème Identifié

L'erreur "Rôle invalide" indique que:
1. Le compte existe dans la base de données
2. Mais le rôle n'est pas "Administrateur"

## Solution Immédiate

### Étape 1: Vérifier le compte dans Supabase

Allez dans Supabase Dashboard → Table Editor → Table `compte`

Cherchez l'email: `joantsayem@gmail.com`

### Étape 2: Corriger le rôle

Exécutez cette requête SQL dans Supabase SQL Editor:

```sql
-- Vérifier le compte actuel
SELECT id, email, role, user_id, nom, prenom 
FROM compte 
WHERE email = 'joantsayem@gmail.com';

-- Corriger le rôle
UPDATE compte 
SET role = 'Administrateur'
WHERE email = 'joantsayem@gmail.com';

-- Vérifier que c'est corrigé
SELECT id, email, role, user_id, nom, prenom 
FROM compte 
WHERE email = 'joantsayem@gmail.com';
```

### Étape 3: Réessayer la connexion

1. Rafraîchir la page `/admin/login`
2. Cliquer sur "Se connecter avec Google"
3. S'authentifier avec `joantsayem@gmail.com`
4. Devrait maintenant rediriger vers `/admin`

## Logs de Débogage

Les logs dans la console navigateur vous montreront:

```
[HandleAdminCallback] Début du traitement
[SupabaseAuthRepository] Session OAuth récupérée: { userId: '...', email: '...' }
[SupabaseAuthRepository] Recherche compte par user_id: { ... }
[HandleAdminCallback] Session récupérée: { hasSession: true, email: '...', role: '...' }
[HandleAdminCallback] Vérification email: { received: '...', expected: '...', match: true }
[HandleAdminCallback] Vérification rôle: { role: '...', isAdmin: true/false }
```

## Si le Problème Persiste

### Créer le compte admin manuellement

```sql
-- Supprimer l'ancien compte si nécessaire
DELETE FROM compte WHERE email = 'joantsayem@gmail.com';

-- Créer un nouveau compte admin
INSERT INTO compte (email, nom, prenom, role)
VALUES ('joantsayem@gmail.com', 'Tsayem', 'Joan', 'Administrateur');
```

### Vérifier les rôles disponibles

```sql
-- Lister tous les rôles uniques
SELECT DISTINCT role FROM compte;
```

Vous devriez voir:
- `Etudiant`
- `Gerant`
- `Administrateur`

**ATTENTION:** Le rôle doit être exactement `Administrateur` (avec majuscule, sans faute).

## Valeurs Correctes des Rôles

| Rôle | Valeur dans DB |
|------|----------------|
| Admin | `Administrateur` |
| Gérant | `Gerant` |
| Étudiant | `Etudiant` |

## Après la Correction

1. Se déconnecter de Google (si déjà connecté)
2. Fermer tous les onglets localhost:3000
3. Rouvrir `/admin/login`
4. Se reconnecter

La session sera rafraîchie et le nouveau rôle sera pris en compte.

---

**Date:** 11 novembre 2025
