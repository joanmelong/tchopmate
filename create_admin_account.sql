-- Script SQL pour créer le compte administrateur TCHOPMATE
-- À exécuter dans l'éditeur SQL de Supabase si nécessaire

-- Vérifier si le compte admin existe déjà
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
        -- Créer un utilisateur auth.users temporaire pour l'admin
        -- Note: En production, ceci devrait être fait via l'interface Supabase Auth
        INSERT INTO auth.users (
            id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            role
        ) VALUES (
            gen_random_uuid(),
            'joantsayem@gmail.com',
            crypt('temp_password', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"full_name": "Admin Root"}',
            false,
            'authenticated'
        ) RETURNING id INTO admin_user_id;
        
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
        
        RAISE NOTICE 'Compte administrateur créé avec succès';
    ELSE
        RAISE NOTICE 'Le compte administrateur existe déjà';
    END IF;
END $$;

-- Vérifier le compte créé
SELECT 
    c.id,
    c.nom,
    c.prenom,
    c.email,
    c.role,
    c.created_at
FROM public.compte c
WHERE c.email = 'joantsayem@gmail.com';
