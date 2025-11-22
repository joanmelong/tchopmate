# Guide de correction de l'erreur de création de commande

## Problème identifié

L'erreur `column p.id_plat does not exist` se produit lors de la création d'une commande car :

1. La fonction SQL `recalc_commande_total` utilise `p.id_plat` dans sa jointure
2. La table `plat` utilise `id` (UUID) comme clé primaire, pas `id_plat`
3. Lorsqu'une ligne est insérée dans `commande_plat`, le trigger SQL se déclenche et essaie d'exécuter cette fonction, ce qui cause l'erreur

## Solution

Exécutez le script SQL `fix_commande_trigger.sql` dans votre base de données Supabase.

### Étapes pour appliquer la correction

1. **Ouvrez Supabase Dashboard**
   - Connectez-vous à votre projet Supabase
   - Allez dans l'éditeur SQL

2. **Exécutez le script de correction**
   - Copiez le contenu du fichier `fix_commande_trigger.sql`
   - Collez-le dans l'éditeur SQL
   - Cliquez sur "Run" pour exécuter le script

3. **Vérifiez que la correction a été appliquée**
   - Le script affichera la définition de la fonction corrigée à la fin
   - Vérifiez que la jointure utilise maintenant `p.id` au lieu de `p.id_plat`

## Ce que fait le script

1. **Corrige la fonction `recalc_commande_total`**
   - Remplace `p.id_plat` par `p.id` dans la jointure
   - Cette fonction recalcule automatiquement le montant total d'une commande

2. **Corrige la contrainte de clé étrangère `commande_plat.plat_id`**
   - Supprime les anciennes contraintes qui pourraient pointer vers `id_plat`
   - Recrée la contrainte pour pointer vers `plat.id`

## Test de la correction

Après avoir exécuté le script :

1. Essayez de créer une commande depuis l'application
2. Vérifiez que la commande est créée sans erreur
3. Vérifiez que le montant total est correctement calculé

## Si l'erreur persiste

Si vous rencontrez toujours des erreurs :

1. Vérifiez que la table `plat` a bien une colonne `id` (UUID)
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'plat' AND table_schema = 'public';
   ```

2. Vérifiez que la table `commande_plat` a bien une colonne `plat_id` (UUID)
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'commande_plat' AND table_schema = 'public';
   ```

3. Vérifiez que la fonction a été corrigée
   ```sql
   SELECT pg_get_functiondef(oid) 
   FROM pg_proc 
   WHERE proname = 'recalc_commande_total' 
   AND pronamespace = 'public'::regnamespace;
   ```

