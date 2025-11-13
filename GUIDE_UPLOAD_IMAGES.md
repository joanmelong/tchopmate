# Guide de Déploiement - Upload d'Images avec Supabase Storage

## 📋 Corrections Effectuées

### 1. ✅ Correction du Type `restaurant_id`

**Problème** : L'erreur `invalid input syntax for type uuid: "5000"` était causée par un type mismatch.

**Solution** : 
- Tous les DTOs utilisent maintenant `restaurant_id: number` (au lieu de `string`)
- Correspondance avec le schéma PostgreSQL : `restaurant_id INTEGER`

**Fichiers modifiés** :
- ✅ `src/core/entities/Dish.ts`
- ✅ `src/core/entities/Menu.ts`
- ✅ `src/core/interfaces/IMenuRepository.ts`
- ✅ `src/core/use-cases/dish/GetDishesByRestaurant.ts`
- ✅ `src/core/use-cases/menu/GetMenusByRestaurant.ts`
- ✅ `src/data/repositories/DishManagementRepository.ts`
- ✅ `src/data/repositories/MenuManagementRepository.ts`
- ✅ `src/services/DishService.ts`
- ✅ `src/services/MenuService.ts`
- ✅ `src/components/restaurant/DishManagement.tsx`
- ✅ `src/components/restaurant/DishForm.tsx`
- ✅ `src/components/restaurant/MenuManagement.tsx`
- ✅ `src/components/restaurant/MenuForm.tsx`

### 2. ✅ Système d'Upload d'Images

**Nouveaux fichiers créés** :

1. **`src/services/ImageUploadService.ts`**
   - Upload vers Supabase Storage
   - Suppression d'images
   - Compression automatique (1200px, 80% qualité)
   - Validation (type MIME, taille max 5MB)

2. **`src/components/ui/image-upload.tsx`**
   - Drag & drop d'images
   - Preview en temps réel
   - Progression d'upload
   - Suppression d'images
   - Intégration avec Supabase Storage

3. **`setup_storage_buckets.sql`**
   - Politiques RLS pour Storage
   - Configuration des buckets
   - Documentation complète

## 🚀 Étapes de Déploiement

### Étape 1 : Créer les Buckets dans Supabase

1. **Ouvrir Supabase Dashboard**
   - Aller sur https://app.supabase.com
   - Sélectionner votre projet TchopMate

2. **Créer le bucket 'dishes'**
   - Dashboard → Storage → Create bucket
   - **Nom** : `dishes`
   - **Public** : ✅ Coché (pour accès public aux images)
   - **File size limit** : 5 MB
   - **Allowed MIME types** : `image/jpeg, image/jpg, image/png, image/webp, image/gif`
   - Cliquer sur "Create bucket"

3. **Créer le bucket 'menus'**
   - Répéter avec **Nom** : `menus`
   - Mêmes paramètres que 'dishes'

4. **(Optionnel) Créer le bucket 'restaurants'**
   - Pour les logos de restaurants
   - **Nom** : `restaurants`
   - Mêmes paramètres

### Étape 2 : Configurer les Politiques RLS

1. **Ouvrir SQL Editor**
   - Dashboard → SQL Editor → New query

2. **Exécuter le script**
   - Ouvrir le fichier `setup_storage_buckets.sql`
   - Copier TOUT le contenu (sections 2, 3, 4 - les politiques)
   - Coller dans SQL Editor
   - Cliquer sur "Run"

3. **Vérifier les politiques**
   ```sql
   SELECT * FROM storage.policies 
   WHERE bucket_id IN ('dishes', 'menus');
   ```
   
   Vous devriez voir :
   - 4 politiques pour 'dishes' (INSERT, UPDATE, DELETE, SELECT)
   - 4 politiques pour 'menus' (INSERT, UPDATE, DELETE, SELECT)

### Étape 3 : Vérifier la Configuration

1. **Vérifier les buckets**
   ```sql
   SELECT * FROM storage.buckets 
   WHERE name IN ('dishes', 'menus');
   ```

2. **Vérifier votre accès gérant**
   ```sql
   SELECT 
     r.id_restaurant,
     c.id as compte_id,
     c.user_id
   FROM public.restaurant r
   JOIN public.compte c ON r.gerant_id = c.id
   WHERE c.user_id = auth.uid();
   ```
   
   ⚠️ **Important** : Cette requête doit retourner AU MOINS une ligne avec votre `id_restaurant`.
   
   Si elle retourne vide :
   - Vous n'êtes pas lié à un restaurant
   - Créez d'abord un restaurant via l'interface
   - Ou liez votre compte à un restaurant existant

### Étape 4 : Tester l'Application

1. **Démarrer l'application Next.js**
   ```powershell
   npm run dev
   ```

2. **Se connecter en tant que gérant**
   - Assurez-vous d'être connecté avec un compte gérant
   - Vérifiez que vous avez un `id_restaurant` valide

3. **Tester la création d'un plat avec image**
   - Aller sur `/resto/[votre_id_restaurant]/dishes`
   - Cliquer sur "Nouveau Plat"
   - Remplir le formulaire
   - **Drag & drop une image** dans la zone d'upload OU cliquer pour parcourir
   - Vérifier la preview
   - Soumettre le formulaire

4. **Vérifications**
   ✅ L'image est uploadée sans erreur
   ✅ La preview s'affiche correctement
   ✅ Le plat est créé avec l'image
   ✅ L'image s'affiche dans la liste des plats

### Étape 5 : Vérifier dans Supabase Storage

1. **Ouvrir Storage**
   - Dashboard → Storage → dishes

2. **Vérifier la structure**
   ```
   dishes/
   ├── 5000/                    <- Votre restaurant_id
   │   ├── 1699123456789-abc123.jpg
   │   └── 1699123456790-def456.png
   └── 5001/                    <- Autre restaurant
       └── ...
   ```

3. **Vérifier l'URL publique**
   - Cliquer sur un fichier
   - Copier l'URL publique
   - Coller dans un navigateur → l'image doit s'afficher

## 🔍 Dépannage

### Erreur : "new row violates row-level security policy"

**Cause** : Les politiques RLS empêchent l'upload

**Solutions** :
1. Vérifier que vous êtes authentifié :
   ```sql
   SELECT auth.uid(); -- Doit retourner votre UUID
   ```

2. Vérifier le lien compte → restaurant :
   ```sql
   SELECT 
     c.id,
     c.user_id,
     r.id_restaurant,
     r.gerant_id
   FROM public.compte c
   LEFT JOIN public.restaurant r ON r.gerant_id = c.id
   WHERE c.user_id = auth.uid();
   ```

3. Vérifier que le chemin est correct :
   - Format attendu : `{restaurant_id}/{filename}`
   - Exemple : `5000/1699123456789-abc123.jpg`

### Erreur : "bucket does not exist"

**Solution** : Créer les buckets via Dashboard → Storage

### Erreur : "Failed to upload image: permission denied"

**Solutions** :
1. Vérifier que le bucket est public (Dashboard → Storage → Settings)
2. Vérifier que les politiques RLS sont créées
3. Vérifier que vous utilisez le bon `restaurant_id`

### L'image ne s'affiche pas

**Solutions** :
1. Vérifier l'URL dans la base de données :
   ```sql
   SELECT id, nom, image_url FROM public.plat WHERE id = 'votre_id';
   ```

2. Vérifier que l'URL est valide :
   - Format : `https://[project].supabase.co/storage/v1/object/public/dishes/[restaurant_id]/[filename]`

3. Tester l'URL directement dans le navigateur

### Erreur TypeScript après les modifications

**Solution** : Redémarrer le serveur de développement
```powershell
# Arrêter avec Ctrl+C
npm run dev
```

## 📊 Exemple de Test Complet

### 1. Préparer les données de test

```sql
-- Vérifier votre configuration
SELECT 
  auth.uid() as my_user_id,
  c.id as my_compte_id,
  r.id_restaurant as my_restaurant_id
FROM public.compte c
LEFT JOIN public.restaurant r ON r.gerant_id = c.id
WHERE c.user_id = auth.uid();
```

### 2. Tester l'upload

1. Aller sur `/resto/[id_restaurant]/dishes`
2. Créer un nouveau plat :
   - **Nom** : "Ndolé aux crevettes"
   - **Catégorie** : "Plats traditionnels"
   - **Prix** : 2500
   - **Description** : "Plat traditionnel camerounais"
   - **Image** : Drag & drop d'une photo

3. Vérifier dans Storage :
   ```
   dishes/[votre_id_restaurant]/[timestamp]-[random].jpg
   ```

### 3. Tester la lecture

1. Actualiser la page
2. Vérifier que :
   - Le plat apparaît dans la liste
   - L'image s'affiche correctement
   - Le prix et la description sont corrects

### 4. Tester la modification

1. Cliquer sur "Modifier"
2. Changer l'image (drag & drop une nouvelle)
3. Vérifier que :
   - L'ancienne image est remplacée
   - La nouvelle image s'affiche

### 5. Tester la suppression

1. Supprimer le plat de test
2. Vérifier dans Storage que l'image est toujours là (ou la supprimer manuellement)

## 🎯 Prochaines Améliorations Possibles

### Images optimisées
- Générer plusieurs tailles (thumbnail, medium, large)
- Utiliser Next.js Image avec loader Supabase
- Lazy loading avec placeholder blur

### Gestion avancée
- Recadrage d'images avant upload
- Filtres et ajustements
- Galerie d'images pour les plats

### Performances
- CDN pour les images
- Cache navigateur optimisé
- WebP conversion automatique

## 📝 Notes Importantes

1. **Type restaurant_id** : Toujours utiliser `number` (INTEGER en PostgreSQL)

2. **Structure des fichiers** : `{bucket}/{restaurant_id}/{timestamp}-{random}.{ext}`

3. **Sécurité** : Les politiques RLS garantissent que :
   - Seuls les gérants peuvent uploader dans LEUR restaurant
   - Tout le monde peut voir les images (lecture publique)

4. **Compression** : Les images sont automatiquement compressées :
   - Largeur max : 1200px
   - Qualité : 80%
   - Réduction typique : 50-70% de la taille

5. **Formats supportés** : JPG, PNG, WebP, GIF (max 5MB)

---

**Dernière mise à jour** : Intégration complète de l'upload d'images avec Supabase Storage
