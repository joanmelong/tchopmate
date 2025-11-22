-- FIX: Corriger le trigger trg_recalc_total_iud qui référence p.id_plat au lieu de p.id
-- Le problème: La colonne 'id_plat' n'existe pas dans la table 'plat'
-- La solution: Renommer la référence à 'p.id' dans le trigger

-- 1. Supprimer le trigger existant
DROP TRIGGER IF EXISTS trg_recalc_total_iud ON commande_plat;
DROP FUNCTION IF EXISTS recalc_total_iu();

-- 2. Recréer la fonction avec la bonne référence de colonne
CREATE OR REPLACE FUNCTION recalc_total_iu()
RETURNS TRIGGER AS $$
DECLARE
  plat_prix NUMERIC;
  total NUMERIC;
BEGIN
  -- Récupérer le prix du plat en fonction du plat_id
  SELECT prix INTO plat_prix FROM plat WHERE id = NEW.plat_id;

  IF plat_prix IS NULL THEN
    RAISE EXCEPTION 'Plat non trouvé pour plat_id: %', NEW.plat_id;
  END IF;

  -- Mettre à jour la commande avec le nouveau total
  UPDATE commande 
  SET montant_total = (
    SELECT SUM(cp.quantite * p.prix)
    FROM commande_plat cp
    JOIN plat p ON cp.plat_id = p.id
    WHERE cp.commande_id = NEW.commande_id
  )
  WHERE id_commande = NEW.commande_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Recréer le trigger
CREATE TRIGGER trg_recalc_total_iud
AFTER INSERT OR UPDATE OR DELETE ON commande_plat
FOR EACH ROW
EXECUTE FUNCTION recalc_total_iu();
