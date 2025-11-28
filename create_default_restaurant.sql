-- ========================================
-- CRÉATION D'UN RESTAURANT PAR DÉFAUT
-- Pour les tests et le développement
-- ========================================

-- Vérifier s'il existe déjà des restaurants
DO $$
DECLARE
  v_restaurant_count INTEGER;
  v_restaurant_id UUID;
  v_gerant_id INTEGER;
BEGIN
  -- Compter les restaurants existants
  SELECT COUNT(*) INTO v_restaurant_count FROM restaurant;
  
  -- Si aucun restaurant n'existe, en créer un par défaut
  IF v_restaurant_count = 0 THEN
    RAISE NOTICE 'Aucun restaurant trouvé, création d''un restaurant par défaut...';
    
    -- Créer un compte gérant par défaut s'il n'existe pas
    INSERT INTO compte (nom, prenom, email, numero_tel, role)
    VALUES ('Restaurant', 'TchopMate', 'admin@tchopmate.cm', '+237600000000', 'STAFF')
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO v_gerant_id;
    
    -- Si le compte existait déjà, récupérer son ID
    IF v_gerant_id IS NULL THEN
      SELECT id INTO v_gerant_id FROM compte WHERE email = 'admin@tchopmate.cm';
    END IF;
    
    -- Créer le restaurant par défaut
    INSERT INTO restaurant (
      nom,
      adresse,
      numero_tel,
      email,
      description,
      gerant_id,
      actif
    ) VALUES (
      'Restaurant Universitaire TchopMate',
      'Campus Principal, Université de Yaoundé I',
      '+237600000000',
      'admin@tchopmate.cm',
      'Restaurant universitaire proposant une cuisine africaine authentique et moderne.',
      v_gerant_id,
      true
    )
    RETURNING id_restaurant INTO v_restaurant_id;
    
    RAISE NOTICE 'Restaurant par défaut créé avec ID: %', v_restaurant_id;
    
    -- Créer quelques créneaux par défaut
    INSERT INTO creneaux (restaurant_id, heure_debut, heure_fin, capacite_max, actif, jours_semaine) VALUES
    (v_restaurant_id, '11:30', '12:00', 15, true, ARRAY[1,2,3,4,5]),
    (v_restaurant_id, '12:00', '12:30', 15, true, ARRAY[1,2,3,4,5]),
    (v_restaurant_id, '12:30', '13:00', 15, true, ARRAY[1,2,3,4,5]),
    (v_restaurant_id, '13:00', '13:30', 15, true, ARRAY[1,2,3,4,5]),
    (v_restaurant_id, '18:00', '18:30', 10, true, ARRAY[1,2,3,4,5]),
    (v_restaurant_id, '18:30', '19:00', 10, true, ARRAY[1,2,3,4,5]),
    (v_restaurant_id, '19:00', '19:30', 10, true, ARRAY[1,2,3,4,5]);
    
    RAISE NOTICE 'Créneaux par défaut créés pour le restaurant';
    
  ELSE
    RAISE NOTICE 'Restaurant(s) existant(s) trouvé(s): %', v_restaurant_count;
  END IF;
END $$;

-- Vérifier le résultat
SELECT 
  r.id_restaurant,
  r.nom,
  r.adresse,
  COUNT(c.id) as nb_creneaux
FROM restaurant r
LEFT JOIN creneaux c ON c.restaurant_id = r.id_restaurant
GROUP BY r.id_restaurant, r.nom, r.adresse
ORDER BY r.nom;

-- Afficher les créneaux créés
SELECT 
  r.nom as restaurant,
  c.heure_debut,
  c.heure_fin,
  c.capacite_max,
  c.jours_semaine
FROM restaurant r
INNER JOIN creneaux c ON c.restaurant_id = r.id_restaurant
WHERE c.actif = true
ORDER BY r.nom, c.heure_debut;