# Guide: Résoudre l'erreur "column p.id_plat does not exist"

## Problème
Lorsque vous créez une commande, vous recevez l'erreur:
```
column p.id_plat does not exist
```

Cela vient du trigger `trg_recalc_total_iud` qui référence une colonne inexistante dans la table `plat`.

## Solution
Vous devez exécuter le script SQL `FIX_TRIGGER_ID_PLAT.sql` dans Supabase pour corriger le trigger.

### Étapes:

1. **Ouvrez la console Supabase**:
   - Allez sur https://supabase.com
   - Connectez-vous à votre projet TchopMate
   - Cliquez sur "SQL Editor" dans le menu de gauche

2. **Créez une nouvelle requête SQL**:
   - Cliquez sur "New Query"

3. **Copiez et exécutez le contenu de `FIX_TRIGGER_ID_PLAT.sql`**:
   ```sql
   -- FIX: Corriger le trigger trg_recalc_total_iud qui référence p.id_plat au lieu de p.id
   -- [... le reste du contenu du fichier ...]
   ```

4. **Cliquez sur "RUN"**

5. **Vérifiez que l'exécution est réussie** - Vous devriez voir "Success" en bas

6. **Testez la création de commande** en accédant à:
   - http://localhost:3000/commande/payment
   - Créez une commande en cliquant sur "Payer au restaurant"
   - Vous ne devriez plus voir l'erreur `column p.id_plat does not exist`

## Alternative: Utiliser le SQL Editor de Supabase directement

Si vous préférez, vous pouvez copier-coller directement le contenu du fichier dans l'éditeur SQL de Supabase sans télécharger de fichier.

## Qu'est-ce qui a été corrigé?

- **Avant**: `JOIN plat p ON cp.plat_id = p.id_plat` (référence erronée)
- **Après**: `JOIN plat p ON cp.plat_id = p.id` (référence correcte)

Le trigger recalcule maintenant correctement le montant total de la commande quand des items sont ajoutés/supprimés.
