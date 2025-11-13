# Guide de Diagnostic et Correction - Liaison Gérant → Restaurant

## 🎯 Problème Identifié

Vous êtes **authentifié via Google** mais l'application ne peut pas charger vos plats/menus.

**Cause probable** : Chaîne de liaison brisée entre :
```
Auth Google → Compte → Restaurant → Plats/Menus
```

## 🔍 Diagnostic en 3 Étapes

### Étape 1 : Afficher le Diagnostic dans l'Interface

1. **Rechargez la page** `/resto/[votre_id]/dishes`
2. Vous devriez voir un panneau **"🔍 Diagnostic de Configuration"**
3. Lisez attentivement chaque étape :
   - ✅ Vert = OK
   - ❌ Rouge = Problème à corriger
   - ⚠️ Jaune = Attention (normal si vous débutez)

### Étape 2 : Exécuter le Diagnostic SQL

1. **Ouvrir Supabase Dashboard** → SQL Editor
2. **Copier/Coller** le contenu de `diagnostic_gerant_restaurant.sql`
3. **Exécuter** (bouton Run)
4. **Analyser les résultats** :

#### Résultat Attendu (OPTIMAL)
```sql
-- 1. Utilisateur actuel
user_id: abc-123-xyz
email: votre.email@gmail.com

-- 2. Compte du gérant
compte_id: 5000
user_id: abc-123-xyz
nom: Votre Nom
role: gerant

-- 3. Restaurant du gérant
id_restaurant: 123
restaurant_nom: Votre Restaurant
gerant_id: 5000

-- 6. RÉSUMÉ COMPLET
compte_id: 5000
id_restaurant: 123
nombre_plats: 0 (ou plus)
nombre_menus: 0 (ou plus)
```

#### Si Problème 1 : "Utilisateur sans compte"
```sql
-- Résultat vide pour la section 2
```
**Solution** : Vous devez créer un compte lié à votre user_id → **Étape 3A**

#### Si Problème 2 : "Compte sans restaurant"
```sql
-- Section 2 OK, mais section 3 vide
```
**Solution** : Vous devez créer un restaurant → **Étape 3B**

### Étape 3A : Créer un Compte (si manquant)

1. **Ouvrir** `fix_liaison_gerant_restaurant.sql`
2. **Trouver ÉTAPE 3** dans le fichier
3. **Remplacer** les valeurs entre `<>` :
   ```sql
   INSERT INTO public.compte (user_id, nom, prenom, email, role)
   VALUES (
     auth.uid(),
     'Tchoupo',        -- ← VOTRE NOM
     'Jean',           -- ← VOTRE PRÉNOM
     auth.email(),
     'gerant'
   )
   RETURNING *;
   ```
4. **Exécuter** cette requête
5. **Noter le compte_id** retourné (exemple : 5000)
6. **Passer à l'Étape 3B**

### Étape 3B : Créer un Restaurant (si manquant)

1. **Trouver ÉTAPE 5** dans `fix_liaison_gerant_restaurant.sql`
2. **Remplacer** les valeurs :
   ```sql
   INSERT INTO public.restaurant (nom, localisation, gerant_id)
   VALUES (
     'Chez Mama Africa',          -- ← NOM DE VOTRE RESTAURANT
     'Yaoundé, Bastos',            -- ← LOCALISATION
     (SELECT id FROM public.compte WHERE user_id = auth.uid())
   )
   RETURNING *;
   ```
3. **Exécuter** cette requête
4. **Noter l'id_restaurant** retourné (exemple : 123)

## ✅ Vérification Finale

Exécutez cette requête pour vérifier que tout est OK :

```sql
SELECT 
  auth.uid() as auth_user_id,
  auth.email() as auth_email,
  c.id as compte_id,
  c.nom || ' ' || c.prenom as gerant_nom,
  r.id_restaurant,
  r.nom as restaurant_nom
FROM public.compte c
LEFT JOIN public.restaurant r ON r.gerant_id = c.id
WHERE c.user_id = auth.uid();
```

**Résultat attendu** :
| auth_user_id | compte_id | id_restaurant | restaurant_nom |
|--------------|-----------|---------------|----------------|
| abc-123-xyz  | 5000      | 123           | Chez Mama Africa |

✅ Si toutes les colonnes sont remplies → **Succès !**

## 🧪 Test de l'Application

1. **Rechargez** la page `/resto/5000/dishes`
2. **Vérifiez** le diagnostic :
   - ✅ Étape 1-2-3 doivent être vertes
   - ⚠️ Étape 4-5 en jaune si pas encore de plats/menus (normal)
3. **Masquez** le diagnostic (bouton en haut)
4. **Cliquez** "Nouveau Plat"
5. **Remplissez** le formulaire
6. **Drag & drop** une image
7. **Créer**

### Résultats Attendus

✅ **Succès** :
- Pas d'erreur console
- Le plat apparaît dans la liste
- L'image s'affiche

❌ **Si erreur RLS** :
- Message : "new row violates row-level security policy"
- **Solution** : Les politiques RLS ne sont pas créées → Exécutez `create_menu_plat_tables_adapted.sql`

❌ **Si erreur Storage** :
- Message : "permission denied for bucket"
- **Solution** : Les buckets Storage ne sont pas créés → Voir `GUIDE_UPLOAD_IMAGES.md`

## 🔧 Troubleshooting Détaillé

### Erreur : "Cannot read property 'id' of null"

**Cause** : Le hook `useRestaurantByGerant` ne trouve pas de restaurant

**Vérification** :
```sql
SELECT * FROM public.restaurant 
WHERE gerant_id = (SELECT id FROM public.compte WHERE user_id = auth.uid());
```

**Si vide** : Créez le restaurant (Étape 3B)

### Erreur : "invalid input syntax for type uuid"

**Cause** : Mauvais type d'ID utilisé

**Vérification** :
1. Vérifiez que `restaurant.id` est bien un nombre
2. Vérifiez que vous utilisez `parseInt(restaurant.id, 10)`

### Erreur : "RLS policy violation"

**Cause** : Les politiques RLS ne permettent pas l'accès

**Solution** :
1. Vérifiez que les politiques existent :
   ```sql
   SELECT tablename, policyname FROM pg_policies 
   WHERE tablename IN ('plat', 'menu');
   ```
2. Si vide : Exécutez `create_menu_plat_tables_adapted.sql`

### Le diagnostic affiche tout en vert mais ça ne marche pas

**Cause possible** : Incohérence de types (string vs number)

**Vérification** :
```typescript
// Dans la console navigateur
console.log(typeof restaurant.id);        // Doit être "string"
console.log(typeof parseInt(restaurant.id, 10)); // Doit être "number"
```

## 📊 Schéma de la Chaîne de Liaison

```
Google OAuth
    ↓ (Authentification)
auth.users (user_id: "abc-123-xyz")
    ↓ (Liaison)
public.compte (id: 5000, user_id: "abc-123-xyz")
    ↓ (Liaison)
public.restaurant (id_restaurant: 123, gerant_id: 5000)
    ↓ (Liaison)
public.plat (restaurant_id: 123)
public.menu (restaurant_id: 123)
```

**Points de rupture possibles** :
1. ❌ Pas de compte avec `user_id = auth.uid()`
2. ❌ Pas de restaurant avec `gerant_id = compte.id`
3. ❌ Restaurant existe mais `gerant_id` incorrect
4. ❌ Politiques RLS bloquent l'accès

## 🎓 Après la Correction

Une fois que tout fonctionne :

1. **Masquez le diagnostic** (bouton dans l'interface)
2. **Créez vos premiers plats/menus**
3. **Testez l'upload d'images**
4. **Configurez Supabase Storage** (voir `GUIDE_UPLOAD_IMAGES.md`)

## 📝 Checklist de Vérification

- [ ] Authentification Google fonctionne
- [ ] Compte créé dans `public.compte`
- [ ] Compte lié à `auth.uid()`
- [ ] Restaurant créé dans `public.restaurant`
- [ ] Restaurant lié au compte (`gerant_id = compte.id`)
- [ ] Tables `plat` et `menu` existent
- [ ] Politiques RLS créées
- [ ] Buckets Storage créés (dishes, menus)
- [ ] Politiques Storage créées
- [ ] Diagnostic affiche tout en vert
- [ ] Création de plat fonctionne
- [ ] Upload d'image fonctionne

---

**Fichiers de référence** :
- `diagnostic_gerant_restaurant.sql` - Diagnostic SQL complet
- `fix_liaison_gerant_restaurant.sql` - Scripts de correction
- `create_menu_plat_tables_adapted.sql` - Création tables + RLS
- `setup_storage_buckets.sql` - Configuration Storage
- `GUIDE_UPLOAD_IMAGES.md` - Guide upload d'images

**Support** : Si le problème persiste après avoir suivi ce guide, partagez les résultats du diagnostic SQL.
