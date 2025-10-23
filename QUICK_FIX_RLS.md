# 🚨 Résolution Rapide - Erreur RLS Admin

## ❌ Problème
```
Erreur création compte: new row violates row-level security policy for table "compte"
```

## ✅ Solution Immédiate

### Étape 1 : Exécuter le Script SQL
Copier et exécuter ce script dans l'éditeur SQL de Supabase :

```sql
-- Créer la fonction RPC pour contourner RLS
CREATE OR REPLACE FUNCTION public.create_admin_account(
  p_user_id UUID,
  p_nom VARCHAR(100),
  p_prenom VARCHAR(100),
  p_email VARCHAR(150),
  p_role VARCHAR(20)
)
RETURNS TABLE(
  id INTEGER,
  user_id UUID,
  nom VARCHAR(100),
  prenom VARCHAR(100),
  email VARCHAR(150),
  role VARCHAR(20),
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_compte_id INTEGER;
BEGIN
  SELECT c.id INTO v_compte_id
  FROM public.compte c
  WHERE c.email = p_email;
  
  IF v_compte_id IS NOT NULL THEN
    UPDATE public.compte 
    SET 
      user_id = p_user_id,
      nom = p_nom,
      prenom = p_prenom,
      role = p_role,
      updated_at = NOW()
    WHERE id = v_compte_id;
    
    RETURN QUERY
    SELECT 
      c.id, c.user_id, c.nom, c.prenom, c.email, c.role, c.created_at
    FROM public.compte c
    WHERE c.id = v_compte_id;
  ELSE
    INSERT INTO public.compte (
      user_id, nom, prenom, email, role, created_at, updated_at
    ) VALUES (
      p_user_id, p_nom, p_prenom, p_email, p_role, NOW(), NOW()
    ) RETURNING 
      public.compte.id, public.compte.user_id, public.compte.nom, 
      public.compte.prenom, public.compte.email, public.compte.role, 
      public.compte.created_at;
  END IF;
END;
$$;

-- Donner les permissions
GRANT EXECUTE ON FUNCTION public.create_admin_account TO authenticated;
```

### Étape 2 : Créer le Compte Admin Manuellement
Si la fonction RPC ne fonctionne pas, créer le compte manuellement :

```sql
-- Créer le compte admin avec un user_id temporaire
INSERT INTO public.compte (
  user_id,
  nom,
  prenom,
  email,
  role,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(), -- user_id temporaire
  'Admin',
  'Root',
  'joantsayem@gmail.com',
  'Administrateur',
  NOW(),
  NOW()
);
```

### Étape 3 : Tester la Connexion
1. Se déconnecter complètement
2. Effacer les cookies du navigateur
3. Se reconnecter via `/admin/login`
4. Vérifier que la redirection fonctionne

## 🔧 Solution Alternative (Si RLS Pose Problème)

### Désactiver Temporairement RLS
```sql
-- ATTENTION: À utiliser uniquement en développement
ALTER TABLE public.compte DISABLE ROW LEVEL SECURITY;

-- Créer le compte admin
INSERT INTO public.compte (
  user_id,
  nom,
  prenom,
  email,
  role,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Admin',
  'Root',
  'joantsayem@gmail.com',
  'Administrateur',
  NOW(),
  NOW()
);

-- Réactiver RLS
ALTER TABLE public.compte ENABLE ROW LEVEL SECURITY;
```

### Corriger les Politiques RLS
```sql
-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS p_select_self_compte ON public.compte;
DROP POLICY IF EXISTS p_insert_self_compte ON public.compte;
DROP POLICY IF EXISTS p_update_self_compte ON public.compte;
DROP POLICY IF EXISTS p_delete_self_compte ON public.compte;

-- Créer les nouvelles politiques
CREATE POLICY p_select_self_compte ON public.compte 
FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY p_insert_self_compte ON public.compte 
FOR INSERT WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY p_update_self_compte ON public.compte 
FOR UPDATE USING (user_id = auth.uid() OR public.is_admin())
WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY p_delete_self_compte ON public.compte 
FOR DELETE USING (user_id = auth.uid() OR public.is_admin());
```

## 🎯 Solution Recommandée

**Utiliser le script complet** (`complete_rls_fix.sql`) qui :
1. ✅ Crée la fonction RPC
2. ✅ Corrige les politiques RLS
3. ✅ Crée le compte admin si nécessaire
4. ✅ Vérifie l'état final

## 🔍 Vérification

Après exécution, vérifier que tout fonctionne :

```sql
-- Vérifier le compte admin
SELECT * FROM public.compte WHERE email = 'joantsayem@gmail.com';

-- Vérifier les politiques
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'compte';

-- Vérifier la fonction
SELECT * FROM public.create_admin_account(
  gen_random_uuid(),
  'Test',
  'Admin',
  'test@example.com',
  'Administrateur'
);
```

---

**⚠️ Important** : Ces scripts doivent être exécutés avec précaution. En production, toujours tester d'abord sur un environnement de développement.
