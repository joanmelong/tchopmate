-- Script SQL pour corriger les politiques RLS de la table compte
-- À exécuter dans l'éditeur SQL de Supabase

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS p_select_self_compte ON public.compte;
DROP POLICY IF EXISTS p_insert_self_compte ON public.compte;
DROP POLICY IF EXISTS p_update_self_compte ON public.compte;
DROP POLICY IF EXISTS p_delete_self_compte ON public.compte;

-- Créer les nouvelles politiques RLS pour la table compte

-- 1. Politique SELECT : Un utilisateur peut voir son propre compte, les admins peuvent voir tous
CREATE POLICY p_select_self_compte ON public.compte 
FOR SELECT 
USING (
  user_id = auth.uid() 
  OR public.is_admin()
);

-- 2. Politique INSERT : Permettre la création de compte pour les utilisateurs authentifiés
-- et permettre aux admins de créer des comptes
CREATE POLICY p_insert_self_compte ON public.compte 
FOR INSERT 
WITH CHECK (
  user_id = auth.uid() 
  OR public.is_admin()
);

-- 3. Politique UPDATE : Un utilisateur peut modifier son propre compte, les admins peuvent modifier tous
CREATE POLICY p_update_self_compte ON public.compte 
FOR UPDATE 
USING (
  user_id = auth.uid() 
  OR public.is_admin()
)
WITH CHECK (
  user_id = auth.uid() 
  OR public.is_admin()
);

-- 4. Politique DELETE : Un utilisateur peut supprimer son propre compte, les admins peuvent supprimer tous
CREATE POLICY p_delete_self_compte ON public.compte 
FOR DELETE 
USING (
  user_id = auth.uid() 
  OR public.is_admin()
);

-- Vérifier que les politiques sont bien créées
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'compte'
ORDER BY policyname;
