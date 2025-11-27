-- Diagnostic complet du compte admin et de l'OAuth

-- 1. Vérifier si le compte admin existe dans la table compte
SELECT 
    'Compte dans table compte' as check_type,
    c.id,
    c.user_id,
    c.nom,
    c.prenom,
    c.email,
    c.role,
    c.created_at
FROM public.compte c
WHERE c.email = 'joantsayem@gmail.com';

-- 2. Vérifier si l'utilisateur existe dans auth.users
SELECT 
    'Utilisateur dans auth.users' as check_type,
    u.id,
    u.email,
    u.created_at,
    u.email_confirmed_at,
    u.last_sign_in_at,
    u.raw_app_meta_data,
    u.raw_user_meta_data
FROM auth.users u
WHERE u.email = 'joantsayem@gmail.com';

-- 3. Vérifier la configuration OAuth Google
SELECT 
    'Configuration OAuth' as check_type,
    provider,
    enabled,
    client_id,
    secret IS NOT NULL as has_secret,
    redirect_uri,
    created_at
FROM auth.providers 
WHERE provider = 'google';

-- 4. Vérifier les politiques RLS sur la table compte
SELECT 
    'Politiques RLS' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'compte';

-- 5. Vérifier si RLS est activé sur la table compte
SELECT 
    'RLS Status' as check_type,
    schemaname,
    tablename,
    rowsecurity,
    relforcerowsecurity
FROM pg_tables pt
JOIN pg_class pc ON pc.relname = pt.tablename
WHERE pt.schemaname = 'public' AND pt.tablename = 'compte';

-- 6. Tester l'accès direct au compte admin (en tant qu'anon)
SET role anon;
SELECT 
    'Test accès anon' as check_type,
    count(*) as compte_count
FROM public.compte
WHERE email = 'joantsayem@gmail.com';

-- Revenir au rôle par défaut
RESET role;

-- 7. Si le compte n'existe pas, le créer
DO $$
DECLARE
    admin_exists BOOLEAN;
    admin_user_id UUID;
BEGIN
    -- Vérifier si un compte avec l'email admin existe
    SELECT EXISTS(
        SELECT 1 FROM public.compte 
        WHERE email = 'joantsayem@gmail.com'
    ) INTO admin_exists;
    
    IF NOT admin_exists THEN
        RAISE NOTICE 'Création du compte administrateur...';
        
        -- Générer un UUID pour l'admin
        admin_user_id := gen_random_uuid();
        
        -- Créer le compte admin dans la table public.compte
        INSERT INTO public.compte (
            user_id,
            nom,
            prenom,
            email,
            role,
            created_at,
            updated_at
        ) VALUES (
            admin_user_id,
            'Admin',
            'Root',
            'joantsayem@gmail.com',
            'Administrateur',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Compte administrateur créé avec succès avec user_id: %', admin_user_id;
    ELSE
        RAISE NOTICE 'Le compte administrateur existe déjà';
    END IF;
END $$;