# Guide d'Exécution - User Story 4.1

## 📋 Résumé des Corrections

Votre schéma de base de données utilise :
- **Tables singulières** : `menu` et `plat` (pas `menus` et `plats`)
- **Restaurant** : `public.restaurant` avec `id_restaurant` et `gerant_id`
- **Compte** : `public.compte` avec `id` et `user_id`
- **Chaîne de liaison** : `restaurant.gerant_id → compte.id → compte.user_id → auth.uid()`

## ✅ Modifications Effectuées

### 1. Nouveau Script SQL
**Fichier** : `create_menu_plat_tables_adapted.sql`

✅ Tables nommées `menu` et `plat` (singulier)
✅ Foreign key correcte : `REFERENCES public.restaurant(id_restaurant)`
✅ RLS policies avec le bon JOIN :
```sql
restaurant_id IN (
  SELECT r.id_restaurant
  FROM public.restaurant r
  JOIN public.compte c ON r.gerant_id = c.id
  WHERE c.user_id = auth.uid()
)
```

### 2. Repositories Corrigés

**MenuManagementRepository.ts**
- ✅ `tableName = 'menu'` (au lieu de 'menus')

**DishManagementRepository.ts**
- ✅ `tableName = 'plat'` (au lieu de 'plats')

## 🚀 Instructions d'Exécution

### Étape 1 : Vérifier Votre Schéma Actuel

Dans l'éditeur SQL de Supabase, exécutez :

```sql
-- Vérifier les tables existantes
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('menu', 'plat', 'restaurant', 'compte');

-- Vérifier la structure de restaurant
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'restaurant';
```

### Étape 2 : Exécuter le Script Adapté

1. Ouvrir le fichier `create_menu_plat_tables_adapted.sql`
2. Copier tout le contenu
3. Coller dans l'éditeur SQL de Supabase
4. Exécuter

### Étape 3 : Vérification Post-Exécution

```sql
-- 1. Vérifier que les tables sont créées
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('menu', 'plat');

-- 2. Vérifier les politiques RLS
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies 
WHERE tablename IN ('menu', 'plat')
ORDER BY tablename, policyname;

-- 3. Vérifier les index
SELECT tablename, indexname 
FROM pg_indexes 
WHERE tablename IN ('menu', 'plat')
ORDER BY tablename;

-- 4. Tester l'insertion (remplacer 1 par un vrai id_restaurant)
INSERT INTO public.menu (restaurant_id, nom, description, prix)
VALUES (1, 'Menu Test', 'Test description', 25.00);
```

## 🔍 Troubleshooting

### Erreur : "relation menu/plat already exists"
**Solution** : Les tables existent déjà. Utilisez :
```sql
DROP TABLE IF EXISTS public.menu CASCADE;
DROP TABLE IF EXISTS public.plat CASCADE;
```
Puis ré-exécutez le script.

### Erreur : "violates foreign key constraint"
**Problème** : Le `restaurant_id` n'existe pas dans `restaurant.id_restaurant`

**Vérification** :
```sql
SELECT id_restaurant FROM public.restaurant LIMIT 5;
```

Utilisez un `id_restaurant` valide lors des tests.

### Erreur RLS : "new row violates row-level security policy"
**Problème** : Votre utilisateur n'est pas lié à un compte gérant

**Vérification** :
```sql
-- Vérifier votre user_id
SELECT auth.uid();

-- Vérifier le lien compte → restaurant
SELECT c.id, c.user_id, r.id_restaurant 
FROM public.compte c
LEFT JOIN public.restaurant r ON r.gerant_id = c.id
WHERE c.user_id = auth.uid();
```

Si aucun résultat : vous devez créer un enregistrement dans `compte` et `restaurant` lié à votre `auth.uid()`.

## 📊 Structure des Données

### Table `menu`
```typescript
{
  id: UUID (auto)
  restaurant_id: INTEGER (FK → restaurant.id_restaurant)
  nom: string
  description?: string
  prix?: number
  image_url?: string
  disponible: boolean (default: true)
  created_at: timestamp
  updated_at: timestamp
}
```

### Table `plat`
```typescript
{
  id: UUID (auto)
  restaurant_id: INTEGER (FK → restaurant.id_restaurant)
  nom: string
  description?: string
  prix: number (required)
  categorie: string (required)
  image_url?: string
  disponible: boolean (default: true)
  temps_preparation?: number (minutes)
  created_at: timestamp
  updated_at: timestamp
}
```

## 🎯 Prochaines Étapes

Après l'exécution réussie du script :

1. ✅ Tester les requêtes de base (INSERT, SELECT, UPDATE, DELETE)
2. ✅ Vérifier que le gérant ne voit que SES menus/plats
3. ✅ Vérifier que les clients voient tous les menus/plats disponibles
4. 🚀 Lancer l'application Next.js et tester les pages :
   - `/resto/[id]/menus` - Gestion des menus
   - `/resto/[id]/dishes` - Gestion des plats

## 📞 Support

Si vous rencontrez des erreurs :
1. Notez le message d'erreur exact
2. Vérifiez les sections Troubleshooting ci-dessus
3. Exécutez les requêtes de diagnostic fournies

---

**Dernière mise à jour** : Adaptation au schéma existant TchopMate
**Fichiers concernés** : 
- `create_menu_plat_tables_adapted.sql`
- `src/data/repositories/MenuManagementRepository.ts`
- `src/data/repositories/DishManagementRepository.ts`
