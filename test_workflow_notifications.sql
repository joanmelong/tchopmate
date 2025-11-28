-- ========================================
-- SCRIPT DE TEST DU WORKFLOW DE NOTIFICATIONS
-- ========================================

-- 1. Vérifier que les tables existent
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name IN ('notifications', 'creneaux', 'commande')
  AND column_name IN ('type', 'creneau_retrait', 'jours_semaine')
ORDER BY table_name, ordinal_position;

-- 2. Vérifier que les fonctions existent
SELECT 
  proname as function_name,
  prosrc IS NOT NULL as has_body,
  proargnames as arguments
FROM pg_proc 
WHERE proname IN (
  'notify_commande_status_change',
  'check_creneaux_depasses',
  'duplicate_creneaux_if_needed',
  'create_notification',
  'create_commande_confirmation_notification'
)
ORDER BY proname;

-- 3. Vérifier les triggers
SELECT 
  tgname as trigger_name,
  tgenabled as enabled,
  tgrelid::regclass as table_name
FROM pg_trigger 
WHERE tgname LIKE '%notify%' OR tgname LIKE '%creneau%'
ORDER BY tgname;

-- 4. Vérifier les politiques RLS
SELECT 
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('notifications', 'creneaux')
ORDER BY tablename, policyname;

-- 5. Test de création de notification
DO $$
DECLARE
  v_test_user_id UUID := '00000000-0000-0000-0000-000000000001'; -- UUID de test
  v_test_commande_id UUID := gen_random_uuid();
  v_notification_id UUID;
BEGIN
  -- Tenter de créer une notification de test
  BEGIN
    SELECT create_notification(
      v_test_user_id,
      v_test_commande_id,
      'test_workflow',
      'Test du workflow',
      'Ceci est un test du système de notifications'
    ) INTO v_notification_id;
    
    RAISE NOTICE 'Test réussi - Notification créée avec ID: %', v_notification_id;
    
    -- Nettoyer le test
    DELETE FROM notifications WHERE id = v_notification_id;
    RAISE NOTICE 'Test nettoyé';
    
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Erreur lors du test de création de notification: %', SQLERRM;
  END;
END $$;

-- 6. Test de la fonction de vérification des créneaux
DO $$
BEGIN
  BEGIN
    PERFORM check_creneaux_depasses();
    RAISE NOTICE 'Test réussi - Fonction check_creneaux_depasses() exécutée';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Erreur lors du test check_creneaux_depasses: %', SQLERRM;
  END;
END $$;

-- 7. Test de la fonction de duplication des créneaux
DO $$
BEGIN
  BEGIN
    PERFORM duplicate_creneaux_if_needed();
    RAISE NOTICE 'Test réussi - Fonction duplicate_creneaux_if_needed() exécutée';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Erreur lors du test duplicate_creneaux_if_needed: %', SQLERRM;
  END;
END $$;

-- 8. Vérifier les types de notifications supportés
SELECT DISTINCT type, COUNT(*) as count
FROM notifications 
GROUP BY type
ORDER BY type;

-- 9. Statistiques des créneaux
SELECT 
  restaurant_id,
  COUNT(*) as nb_creneaux,
  MIN(heure_debut) as premier_creneau,
  MAX(heure_fin) as dernier_creneau,
  AVG(capacite_max) as capacite_moyenne
FROM creneaux 
WHERE actif = true
GROUP BY restaurant_id
ORDER BY restaurant_id;

-- 10. Vérifier les commandes avec créneaux
SELECT 
  statut,
  COUNT(*) as nb_commandes,
  COUNT(creneau_retrait) as avec_creneau,
  COUNT(*) - COUNT(creneau_retrait) as sans_creneau
FROM commande 
GROUP BY statut
ORDER BY statut;

-- ========================================
-- RÉSULTATS ATTENDUS
-- ========================================

/*
✅ Tables : notifications, creneaux doivent exister avec les bonnes colonnes
✅ Fonctions : Toutes les fonctions doivent être présentes avec has_body = true
✅ Triggers : trigger_notify_commande_status doit être enabled = O (actif)
✅ Politiques RLS : Politiques pour notifications et creneaux doivent exister
✅ Tests : Tous les tests doivent afficher "Test réussi"

Si des erreurs apparaissent, exécuter d'abord :
- create_creneaux_notifications.sql
- workflow_notifications_enhanced.sql
*/

-- ========================================
-- COMMANDES DE MAINTENANCE
-- ========================================

-- Nettoyer les anciennes notifications (plus de 30 jours)
-- DELETE FROM notifications WHERE created_at < NOW() - INTERVAL '30 days';

-- Réactiver tous les créneaux d'un restaurant
-- UPDATE creneaux SET actif = true WHERE restaurant_id = 'VOTRE-RESTAURANT-ID';

-- Marquer toutes les notifications comme lues pour un utilisateur
-- UPDATE notifications SET lue = true WHERE user_id = 'VOTRE-USER-ID' AND lue = false;

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST DU WORKFLOW DE NOTIFICATIONS TERMINÉ';
  RAISE NOTICE '========================================';
END $$;