-- Création de la table qr_commandes
CREATE TABLE IF NOT EXISTS qr_commandes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id VARCHAR(255) NOT NULL,
  client_id INTEGER NOT NULL,
  qr_code_data_url TEXT NOT NULL,
  qr_code_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT fk_qr_commandes_client FOREIGN KEY (client_id) REFERENCES compte(id) ON DELETE CASCADE,
  CONSTRAINT fk_qr_commandes_order FOREIGN KEY (order_id) REFERENCES commande(id_commande) ON DELETE CASCADE,
  CONSTRAINT unique_qr_commandes_order UNIQUE(order_id, client_id)
);

-- Index pour recherches rapides
CREATE INDEX IF NOT EXISTS idx_qr_commandes_client_id ON qr_commandes(client_id);
CREATE INDEX IF NOT EXISTS idx_qr_commandes_order_id ON qr_commandes(order_id);
CREATE INDEX IF NOT EXISTS idx_qr_commandes_created_at ON qr_commandes(created_at DESC);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_qr_commandes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_qr_commandes_updated_at
BEFORE UPDATE ON qr_commandes
FOR EACH ROW
EXECUTE FUNCTION update_qr_commandes_updated_at();
