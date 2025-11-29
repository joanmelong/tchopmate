-- ========================================
-- Système de créneaux horaires et notifications
-- ========================================

-- 1. Modifier la table commande pour ajouter le créneau
ALTER TABLE commande 
ADD COLUMN IF NOT EXISTS creneau_retrait TIMESTAMP WITH TIME ZONE;

-- 2. Créer la table des créneaux disponibles
CREATE TABLE IF NOT EXISTS public.creneaux (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES public.restaurant(id_restaurant) ON DELETE CASCADE,
  heure_debut TIME NOT NULL,
  heure_fin TIME NOT NULL,
  capacite_max INTEGER DEFAULT 10, -- Nombre max de commandes par créneau
  actif BOOLEAN DEFAULT true,
  jours_semaine INTEGER[] DEFAULT ARRAY[1,2,3,4,5], -- 1=Lundi, 7=Dimanche
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contrainte : heure_fin doit être après heure_debut
  CONSTRAINT check_heures CHECK (heure_fin > heure_debut)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_creneaux_restaurant_id ON public.creneaux(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_creneaux_actif ON public.creneaux(actif);

-- 3. Créer la table des notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  commande_id UUID REFERENCES public.commande(id_commande) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'commande_confirmee', 'commande_prete', 'creneau_depasse', 'commande_annulee'
  titre VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  lue BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_lue ON public.notifications(lue);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- ========================================
-- Politiques RLS
-- ========================================

-- Activer RLS sur les nouvelles tables
ALTER TABLE public.creneaux ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Politiques pour creneaux
DROP POLICY IF EXISTS "Tout le monde peut voir les créneaux actifs" ON creneaux;
CREATE POLICY "Tout le monde peut voir les créneaux actifs"
ON creneaux
FOR SELECT
USING (actif = true);

DROP POLICY IF EXISTS "Gerants peuvent gérer leurs créneaux" ON creneaux;
CREATE POLICY "Gerants peuvent gérer leurs créneaux"
ON creneaux
FOR ALL
USING (
  restaurant_id IN (
    SELECT r.id_restaurant 
    FROM restaurant r
    INNER JOIN compte c ON c.id = r.gerant_id
    WHERE c.user_id = auth.uid()
  )
);

-- Politiques pour notifications
DROP POLICY IF EXISTS "Users peuvent voir leurs notifications" ON notifications;
CREATE POLICY "Users peuvent voir leurs notifications"
ON notifications
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users peuvent marquer leurs notifications comme lues" ON notifications;
CREATE POLICY "Users peuvent marquer leurs notifications comme lues"
ON notifications
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role peut créer des notifications" ON notifications;
CREATE POLICY "Service role peut créer des notifications"
ON notifications
FOR INSERT
WITH CHECK (true);

-- ========================================
-- Fonction pour créer une notification
-- ========================================

CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_commande_id UUID,
  p_type VARCHAR,
  p_titre VARCHAR,
  p_message TEXT
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, commande_id, type, titre, message)
  VALUES (p_user_id, p_commande_id, p_type, p_titre, p_message)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- Trigger pour créer des notifications automatiques
-- ========================================

CREATE OR REPLACE FUNCTION notify_commande_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_titre VARCHAR(255);
  v_message TEXT;
BEGIN
  -- Récupérer le user_id du client
  SELECT c.user_id INTO v_user_id
  FROM compte c
  WHERE c.id = NEW.client_id;
  
  -- Créer une notification selon le nouveau statut
  IF NEW.statut = 'EN_PREPARATION' AND OLD.statut = 'EN_ATTENTE' THEN
    v_titre := 'Commande en préparation';
    v_message := 'Votre commande est en cours de préparation !';
    
    PERFORM create_notification(
      v_user_id,
      NEW.id_commande,
      'commande_en_preparation',
      v_titre,
      v_message
    );
    
  ELSIF NEW.statut = 'PRETE' AND OLD.statut != 'PRETE' THEN
    v_titre := 'Commande prête !';
    v_message := 'Votre commande est prête ! Venez la retirer.';
    
    IF NEW.creneau_retrait IS NOT NULL THEN
      v_message := v_message || ' Créneau : ' || to_char(NEW.creneau_retrait, 'HH24:MI');
    END IF;
    
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

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_notify_commande_status ON commande;
CREATE TRIGGER trigger_notify_commande_status
  AFTER UPDATE OF statut ON commande
  FOR EACH ROW
  WHEN (OLD.statut IS DISTINCT FROM NEW.statut)
  EXECUTE FUNCTION notify_commande_status_change();

-- ========================================
-- Données de test : Créneaux par défaut
-- ========================================

-- Exemple : Créer des créneaux pour un restaurant
-- Remplacez 'VOTRE-RESTAURANT-UUID' par un vrai ID de restaurant

-- INSERT INTO creneaux (restaurant_id, heure_debut, heure_fin, capacite_max, jours_semaine) VALUES
-- ('VOTRE-RESTAURANT-UUID', '11:30', '12:00', 10, ARRAY[1,2,3,4,5]),
-- ('VOTRE-RESTAURANT-UUID', '12:00', '12:30', 10, ARRAY[1,2,3,4,5]),
-- ('VOTRE-RESTAURANT-UUID', '12:30', '13:00', 10, ARRAY[1,2,3,4,5]),
-- ('VOTRE-RESTAURANT-UUID', '13:00', '13:30', 10, ARRAY[1,2,3,4,5]),
-- ('VOTRE-RESTAURANT-UUID', '18:00', '18:30', 8, ARRAY[1,2,3,4,5]),
-- ('VOTRE-RESTAURANT-UUID', '18:30', '19:00', 8, ARRAY[1,2,3,4,5]),
-- ('VOTRE-RESTAURANT-UUID', '19:00', '19:30', 8, ARRAY[1,2,3,4,5]);

-- ========================================
-- Vérifications
-- ========================================

-- Vérifier la structure des tables
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name IN ('creneaux', 'notifications')
ORDER BY table_name, ordinal_position;

-- Vérifier les politiques RLS
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename IN ('creneaux', 'notifications')
ORDER BY tablename, policyname;
