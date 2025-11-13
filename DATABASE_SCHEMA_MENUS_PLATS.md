# Schéma de Base de Données pour la Gestion des Menus et Plats

## User Story 4.1 - Gestion des Menus et Plats

### Tables requises

#### Table `menus`
```sql
CREATE TABLE IF NOT EXISTS menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  nom VARCHAR(255) NOT NULL,
  description TEXT,
  prix DECIMAL(10, 2),
  image_url TEXT,
  disponible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX idx_menus_restaurant_id ON menus(restaurant_id);
CREATE INDEX idx_menus_disponible ON menus(disponible);
```

#### Table `plats`
```sql
CREATE TABLE IF NOT EXISTS plats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  nom VARCHAR(255) NOT NULL,
  description TEXT,
  prix DECIMAL(10, 2) NOT NULL,
  categorie VARCHAR(100) NOT NULL,
  image_url TEXT,
  disponible BOOLEAN DEFAULT TRUE,
  temps_preparation INTEGER, -- en minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX idx_plats_restaurant_id ON plats(restaurant_id);
CREATE INDEX idx_plats_categorie ON plats(categorie);
CREATE INDEX idx_plats_disponible ON plats(disponible);
```

### Politiques RLS (Row Level Security)

#### Politiques pour `menus`
```sql
-- Activer RLS
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;

-- Les gérants peuvent voir tous les menus de leur restaurant
CREATE POLICY "Gérants peuvent voir leurs menus"
  ON menus FOR SELECT
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM gerants 
      WHERE user_id = auth.uid()
    )
  );

-- Les gérants peuvent créer des menus pour leur restaurant
CREATE POLICY "Gérants peuvent créer des menus"
  ON menus FOR INSERT
  WITH CHECK (
    restaurant_id IN (
      SELECT restaurant_id FROM gerants 
      WHERE user_id = auth.uid()
    )
  );

-- Les gérants peuvent modifier leurs menus
CREATE POLICY "Gérants peuvent modifier leurs menus"
  ON menus FOR UPDATE
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM gerants 
      WHERE user_id = auth.uid()
    )
  );

-- Les gérants peuvent supprimer leurs menus
CREATE POLICY "Gérants peuvent supprimer leurs menus"
  ON menus FOR DELETE
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM gerants 
      WHERE user_id = auth.uid()
    )
  );

-- Les clients peuvent voir les menus disponibles
CREATE POLICY "Clients peuvent voir les menus disponibles"
  ON menus FOR SELECT
  USING (disponible = TRUE);
```

#### Politiques pour `plats`
```sql
-- Activer RLS
ALTER TABLE plats ENABLE ROW LEVEL SECURITY;

-- Les gérants peuvent voir tous les plats de leur restaurant
CREATE POLICY "Gérants peuvent voir leurs plats"
  ON plats FOR SELECT
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM gerants 
      WHERE user_id = auth.uid()
    )
  );

-- Les gérants peuvent créer des plats pour leur restaurant
CREATE POLICY "Gérants peuvent créer des plats"
  ON plats FOR INSERT
  WITH CHECK (
    restaurant_id IN (
      SELECT restaurant_id FROM gerants 
      WHERE user_id = auth.uid()
    )
  );

-- Les gérants peuvent modifier leurs plats
CREATE POLICY "Gérants peuvent modifier leurs plats"
  ON plats FOR UPDATE
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM gerants 
      WHERE user_id = auth.uid()
    )
  );

-- Les gérants peuvent supprimer leurs plats
CREATE POLICY "Gérants peuvent supprimer leurs plats"
  ON plats FOR DELETE
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM gerants 
      WHERE user_id = auth.uid()
    )
  );

-- Les clients peuvent voir les plats disponibles
CREATE POLICY "Clients peuvent voir les plats disponibles"
  ON plats FOR SELECT
  USING (disponible = TRUE);
```

### Triggers pour `updated_at`

```sql
-- Fonction trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour menus
CREATE TRIGGER update_menus_updated_at
  BEFORE UPDATE ON menus
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour plats
CREATE TRIGGER update_plats_updated_at
  BEFORE UPDATE ON plats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Notes importantes

1. **UUID vs Integer**: Les IDs utilisent UUID pour une meilleure sécurité et éviter les énumérations
2. **Cascade Delete**: Quand un restaurant est supprimé, tous ses menus et plats sont automatiquement supprimés
3. **RLS**: Les politiques garantissent que:
   - Les gérants ne peuvent gérer que les menus/plats de leur restaurant
   - Les clients ne voient que les items disponibles
   - Les utilisateurs non authentifiés peuvent consulter les menus publics
4. **Performance**: Des index sont créés sur les colonnes fréquemment utilisées dans les requêtes

### Migration depuis les données en dur

Si vous avez déjà des données en dur dans le code, vous devrez:
1. Exécuter ces scripts SQL dans votre base Supabase
2. Migrer les données existantes si nécessaire
3. Vérifier que les types correspondent (UUID vs number)
