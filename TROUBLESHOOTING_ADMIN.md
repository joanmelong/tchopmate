# 🔧 Guide de Dépannage - Erreur Création Compte Admin

## 🚨 Problème Identifié

**Erreur** : `Erreur création compte admin: {}`

**Cause** : Conflit lors de la création du compte administrateur, probablement dû à :
- Contrainte d'unicité sur l'email (`joantsayem@gmail.com`)
- Compte existant avec un `user_id` différent
- Problème de synchronisation entre `auth.users` et `public.compte`

## 🛠️ Solutions

### Solution 1 : Vérification Manuelle (Recommandée)

1. **Accéder à Supabase Dashboard**
   - Aller dans **Authentication > Users**
   - Vérifier si `joantsayem@gmail.com` existe

2. **Vérifier la table `compte`**
   ```sql
   SELECT * FROM public.compte WHERE email = 'joantsayem@gmail.com';
   ```

3. **Si le compte existe** :
   - Noter l'`id` et le `user_id`
   - Vérifier si le `role` est `Administrateur`

### Solution 2 : Script de Correction

Exécuter le script SQL fourni (`create_admin_account.sql`) dans l'éditeur SQL de Supabase :

```sql
-- Vérifier l'état actuel
SELECT * FROM public.compte WHERE email = 'joantsayem@gmail.com';

-- Si nécessaire, créer le compte admin
-- (Le script gère automatiquement les cas d'existence)
```

### Solution 3 : Nettoyage des Doublons

Si des comptes en double existent :

```sql
-- Identifier les doublons
SELECT email, COUNT(*) as count 
FROM public.compte 
WHERE email = 'joantsayem@gmail.com' 
GROUP BY email 
HAVING COUNT(*) > 1;

-- Supprimer les doublons (garder le plus récent)
DELETE FROM public.compte 
WHERE id NOT IN (
  SELECT MAX(id) 
  FROM public.compte 
  WHERE email = 'joantsayem@gmail.com'
);
```

### Solution 4 : Debug en Console

Ajouter temporairement dans la page admin :

```typescript
import { AuthDebugger } from '@/lib/debug/AuthDebugger';

// Dans le composant admin
useEffect(() => {
  AuthDebugger.checkAdminDatabaseState();
}, []);
```

Puis ouvrir la console du navigateur pour voir l'état de la base de données.

## 🔍 Diagnostic Avancé

### Vérifier les Contraintes

```sql
-- Vérifier les contraintes sur la table compte
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'compte';
```

### Vérifier les Index

```sql
-- Vérifier les index uniques
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'compte';
```

## 🚀 Test de la Solution

Après correction :

1. **Se déconnecter** complètement
2. **Effacer les cookies** du navigateur
3. **Se reconnecter** via `/admin/login`
4. **Vérifier** que la redirection vers `/admin` fonctionne

## 📋 Checklist de Vérification

- [ ] Email `joantsayem@gmail.com` existe dans `auth.users`
- [ ] Compte correspondant existe dans `public.compte`
- [ ] Le `role` est bien `Administrateur`
- [ ] Le `user_id` correspond entre les deux tables
- [ ] Aucun doublon dans `public.compte`
- [ ] Les contraintes RLS permettent l'accès admin

## 🔒 Sécurité

**Important** : Après résolution du problème, supprimer :
- Le fichier `AuthDebugger.ts`
- Les logs de debug dans le callback
- Le script SQL temporaire

## 📞 Support

Si le problème persiste :

1. **Vérifier les logs Supabase** dans le dashboard
2. **Consulter la documentation** Supabase Auth
3. **Vérifier la configuration** OAuth Google
4. **Tester avec un autre email** temporairement

---

*Ce guide doit être utilisé uniquement pour le développement. En production, ces opérations doivent être effectuées avec précaution.*
