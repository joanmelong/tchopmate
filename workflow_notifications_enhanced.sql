-- ========================================
-- WORKFLOW NOTIFICATIONS AMÉLIORÉ
-- Implémentation du workflow spécifique demandé
-- ========================================

-- 1. Ajouter le nouveau type de notification pour confirmation de commande
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- 2. Fonction améliorée pour les notifications de changement de statut
CREATE OR REPLACE FUNCTION notify_commande_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_titre VARCHAR(255);
  v_message TEXT;
  v_creneau_info TEXT;
BEGIN
  -- Récupérer le user_id du client
  SELECT c.user_id INTO v_user_id
  FROM compte c
  WHERE c.id = NEW.client_id;
  
  -- Préparer les informations de créneau si disponibles
  IF NEW.creneau_retrait IS NOT NULL THEN
    v_creneau_info := ' Retrait prévu le ' || to_char(NEW.creneau_retrait, 'DD/MM/YYYY') || ' à partir de ' || to_char(NEW.creneau_retrait, 'HH24:MI');
  ELSE
    v_creneau_info := '';
  END IF;
  
  -- Créer une notification selon le nouveau statut
  IF NEW.statut = 'EN_PREPARATION' AND OLD.statut = 'EN_ATTENTE' THEN
    v_titre := 'Commande en préparation';
    v_message := 'Votre commande est maintenant en cours de préparation !' || v_creneau_info;
    
    PERFORM create_notification(
      v_user_id,
      NEW.id_commande,
      'commande_en_preparation',
      v_titre,
      v_message
    );
    
  ELSIF NEW.statut = 'PRETE' AND OLD.statut != 'PRETE' THEN
    v_titre := 'Commande prête !';
    v_message := 'Excellente nouvelle ! Votre commande est prête et vous attend.' || v_creneau_info;
    
    PERFORM create_notification(
      v_user_id,
      NEW.id_commande,
      'commande_prete',
      v_titre,
      v_message
    );
    
  ELSIF NEW.statut = 'ANNULEE' AND OLD.statut != 'ANNULEE' THEN
    v_titre := 'Commande annulée';
    v_message := 'Votre commande a été annulée. Contactez le restaurant pour plus d''informations.';
    
    PERFORM create_notification(
      v_user_id,
      NEW.id_commande,
      'commande_annulee',
      v_titre,
      v_message
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recréer le trigger
DROP TRIGGER IF EXISTS trigger_notify_commande_status ON commande;
CREATE TRIGGER trigger_notify_commande_status
  AFTER UPDATE OF statut ON commande
  FOR EACH ROW
  WHEN (OLD.statut IS DISTINCT FROM NEW.statut)
  EXECUTE FUNCTION notify_commande_status_change();

-- ========================================
-- 3. Fonction pour détecter les créneaux dépassés
-- ========================================

CREATE OR REPLACE FUNCTION check_creneaux_depasses()
RETURNS void AS $$
DECLARE
  v_commande RECORD;
  v_user_id UUID;
  v_message TEXT;
BEGIN
  -- Chercher les commandes PRETE avec créneau dépassé de plus d'1h
  FOR v_commande IN 
    SELECT c.id_commande, c.client_id, c.creneau_retrait, co.user_id
    FROM commande c
    INNER JOIN compte co ON co.id = c.client_id
    WHERE c.statut = 'PRETE'
      AND c.creneau_retrait IS NOT NULL
      AND c.creneau_retrait < NOW() - INTERVAL '1 hour'
      AND NOT EXISTS (
        -- Éviter les doublons de notifications
        SELECT 1 FROM notifications n 
        WHERE n.commande_id = c.id_commande 
        AND n.type = 'creneau_depasse'
      )
  LOOP
    v_message := 'Votre créneau de retrait du ' || 
                 to_char(v_commande.creneau_retrait, 'DD/MM/YYYY à HH24:MI') || 
                 ' est dépassé. Votre commande sera disponible au prochain créneau.';
    
    -- Créer la notification
    INSERT INTO notifications (user_id, commande_id, type, titre, message)
    VALUES (
      v_commande.user_id,
      v_commande.id_commande,
      'creneau_depasse',
      'Créneau de retrait dépassé',
      v_message
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 4. Fonction pour dupliquer les créneaux du jour précédent
-- ========================================

CREATE OR REPLACE FUNCTION duplicate_creneaux_if_needed()
RETURNS void AS $$
DECLARE
  v_restaurant RECORD;
  v_today DATE := CURRENT_DATE;
  v_yesterday DATE := CURRENT_DATE - INTERVAL '1 day';
  v_current_day_of_week INTEGER := EXTRACT(DOW FROM v_today);
BEGIN
  -- Convertir dimanche (0) en 7 pour correspondre à notre système
  IF v_current_day_of_week = 0 THEN
    v_current_day_of_week := 7;
  END IF;

  -- Pour chaque restaurant
  FOR v_restaurant IN SELECT DISTINCT restaurant_id FROM creneaux
  LOOP
    -- Vérifier s'il y a des créneaux pour aujourd'hui
    IF NOT EXISTS (
      SELECT 1 FROM creneaux 
      WHERE restaurant_id = v_restaurant.restaurant_id 
      AND v_current_day_of_week = ANY(jours_semaine)
      AND actif = true
    ) THEN
      -- Dupliquer les créneaux d'hier s'ils existent
      INSERT INTO creneaux (restaurant_id, heure_debut, heure_fin, capacite_max, actif, jours_semaine)
      SELECT 
        restaurant_id,
        heure_debut,
        heure_fin,
        capacite_max,
        actif,
        ARRAY[v_current_day_of_week] -- Créer pour le jour actuel
      FROM creneaux
      WHERE restaurant_id = v_restaurant.restaurant_id
      AND actif = true
      AND ARRAY_LENGTH(jours_semaine, 1) > 0
      LIMIT 10; -- Limiter pour éviter la duplication excessive
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 5. Tâches programmées (à exécuter via cron ou scheduler)
-- ========================================

-- Fonction à appeler toutes les heures pour vérifier les créneaux dépassés
-- SELECT check_creneaux_depasses();

-- Fonction à appeler chaque matin pour dupliquer les créneaux si nécessaire
-- SELECT duplicate_creneaux_if_needed();

-- ========================================
-- 6. Mise à jour des types de notifications dans l'interface
-- ========================================

-- Ajouter les nouveaux types de notifications
COMMENT ON COLUMN notifications.type IS 'Types: commande_confirmee, commande_en_preparation, commande_prete, commande_annulee, creneau_depasse';

-- ========================================
-- 7. Fonction utilitaire pour créer une notification de confirmation
-- ========================================

CREATE OR REPLACE FUNCTION create_commande_confirmation_notification(
  p_user_id UUID,
  p_commande_id UUID,
  p_creneau_retrait TIMESTAMP WITH TIME ZONE DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
  v_message TEXT;
BEGIN
  v_message := 'Votre commande #' || SUBSTRING(p_commande_id::TEXT, 1, 8) || ' a été envoyée avec succès !';
  
  IF p_creneau_retrait IS NOT NULL THEN
    v_message := v_message || ' Retrait prévu le ' || 
                 to_char(p_creneau_retrait, 'DD/MM/YYYY') || ' à partir de ' || 
                 to_char(p_creneau_retrait, 'HH24:MI') || '.';
  END IF;

  INSERT INTO notifications (user_id, commande_id, type, titre, message)
  VALUES (
    p_user_id,
    p_commande_id,
    'commande_confirmee',
    'Commande confirmée',
    v_message
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 8. Vérifications et tests
-- ========================================

-- Vérifier que les nouvelles fonctions existent
SELECT 
  proname as function_name,
  prosrc IS NOT NULL as has_body
FROM pg_proc 
WHERE proname IN (
  'check_creneaux_depasses',
  'duplicate_creneaux_if_needed', 
  'create_commande_confirmation_notification'
);

-- Vérifier les triggers
SELECT 
  tgname as trigger_name,
  tgenabled as enabled
FROM pg_trigger 
WHERE tgname = 'trigger_notify_commande_status';

COMMENT ON FUNCTION check_creneaux_depasses() IS 'Vérifie et notifie les créneaux dépassés de plus d''1h';
COMMENT ON FUNCTION duplicate_creneaux_if_needed() IS 'Duplique les créneaux du jour précédent si aucun créneau n''existe pour aujourd''hui';
COMMENT ON FUNCTION create_commande_confirmation_notification(UUID, UUID, TIMESTAMP WITH TIME ZONE) IS 'Crée une notification de confirmation de commande';