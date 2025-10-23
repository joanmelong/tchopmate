-- Script de diagnostic pour vérifier l'état du compte admin
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier tous les comptes admin
SELECT 
    c.id,
    c.user_id,
    c.nom,
    c.prenom,
    c.email,
    c.role,
    c.created_at,
    c.updated_at
FROM public.compte c
WHERE c.role = 'Administrateur'
ORDER BY c.created_at DESC;

-- 2. Vérifier les utilisateurs auth.users
SELECT 
    u.id,
    u.email,
    u.email_confirmed_at,
    u.created_at,
    u.last_sign_in_at
FROM auth.users u
WHERE u.email = 'joantsayem@gmail.com'
ORDER BY u.created_at DESC;

-- 3. Vérifier la correspondance entre auth.users et public.compte
SELECT 
    u.id as auth_user_id,
    u.email as auth_email,
    c.id as compte_id,
    c.user_id as compte_user_id,
    c.email as compte_email,
    c.role,
    CASE 
        WHEN c.user_id = u.id THEN 'CORRESPONDANCE OK'
        WHEN c.user_id IS NULL THEN 'COMPTE SANS USER_ID'
        ELSE 'CORRESPONDANCE NOK'
    END as statut_correspondance
FROM auth.users u
LEFT JOIN public.compte c ON c.email = u.email
WHERE u.email = 'joantsayem@gmail.com';

-- 4. Vérifier les politiques RLS sur la table compte
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'compte'
ORDER BY policyname;

-- 5. Tester la fonction is_admin()
SELECT public.is_admin() as is_admin_result;

-- 6. Vérifier les fonctions RPC créées
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%account%'
ORDER BY routine_name;
