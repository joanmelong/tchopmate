
---

# 🧱 TCHOPMATE — Base de Données PostgreSQL (Supabase)

### **Version stable**

Compatible Supabase SQL Editor (sans `IF NOT EXISTS` sur les policies)

---

## ⚙️ 1. ENUMERATIONS

```sql
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'statut') THEN
    CREATE TYPE public.statut AS ENUM ('LIVREE', 'EN_ATTENTE', 'PAYE');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'methode_payement') THEN
    CREATE TYPE public.methode_payement AS ENUM ('MobileMoney', 'OrangeMoney', 'Espece', 'Carte_bancaire');
  END IF;
END$$;
```

---

## 🧩 2. TABLES PRINCIPALES

### **Table `compte`**

```sql
CREATE TABLE IF NOT EXISTS public.compte (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  numero_tel VARCHAR(20),
  mot_de_passe TEXT,
  role VARCHAR(20) NOT NULL CHECK (role IN ('Client','Gerant','Administrateur')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### **Table `restaurant`**

```sql
CREATE TABLE IF NOT EXISTS public.restaurant (
  id_restaurant UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR(100) NOT NULL,
  localisation TEXT,
  photo TEXT,
  gerant_id INT REFERENCES public.compte(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### **Table `plat`**

```sql
CREATE TABLE IF NOT EXISTS public.plat (
  id_plat UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR(100) NOT NULL,
  description TEXT,
  prix NUMERIC(10,2) NOT NULL CHECK (prix >= 0),
  image TEXT,
  categorie VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### **Table `menu`**

```sql
CREATE TABLE IF NOT EXISTS public.menu (
  id_menu UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_menu DATE NOT NULL DEFAULT CURRENT_DATE,
  restaurant_id UUID NOT NULL REFERENCES public.restaurant(id_restaurant) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### **Table d’association `menu_plat`**

```sql
CREATE TABLE IF NOT EXISTS public.menu_plat (
  menu_id UUID NOT NULL REFERENCES public.menu(id_menu) ON DELETE CASCADE,
  plat_id UUID NOT NULL REFERENCES public.plat(id_plat) ON DELETE CASCADE,
  PRIMARY KEY (menu_id, plat_id)
);
```

### **Table `commande`**

```sql
CREATE TABLE IF NOT EXISTS public.commande (
  id_commande UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id INT REFERENCES public.compte(id) ON DELETE SET NULL,
  date_commande TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  statut public.statut NOT NULL DEFAULT 'EN_ATTENTE',
  montant_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  commentaire TEXT,
  livraison BOOLEAN NOT NULL DEFAULT FALSE,
  creneau_retrait TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### **Table d’association `commande_plat`**

```sql
CREATE TABLE IF NOT EXISTS public.commande_plat (
  commande_id UUID NOT NULL REFERENCES public.commande(id_commande) ON DELETE CASCADE,
  plat_id UUID NOT NULL REFERENCES public.plat(id_plat) ON DELETE RESTRICT,
  quantite INT NOT NULL DEFAULT 1 CHECK (quantite > 0),
  PRIMARY KEY (commande_id, plat_id)
);
```

### **Table `paiement`**

```sql
CREATE TABLE IF NOT EXISTS public.paiement (
  id_paiement BIGSERIAL PRIMARY KEY,
  commande_id UUID NOT NULL REFERENCES public.commande(id_commande) ON DELETE CASCADE,
  montant NUMERIC(12,2) NOT NULL CHECK (montant > 0),
  date_paiement TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  methode public.methode_payement NOT NULL
);
```

---

## ⚡ 3. INDEXES

```sql
CREATE INDEX IF NOT EXISTS idx_compte_user_id ON public.compte(user_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_gerant ON public.restaurant(gerant_id);
CREATE INDEX IF NOT EXISTS idx_menu_restaurant ON public.menu(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_commande_client ON public.commande(client_id);
CREATE INDEX IF NOT EXISTS idx_paiement_commande ON public.paiement(commande_id);
```

---

## 🧠 4. FONCTIONS UTILITAIRES

```sql
CREATE OR REPLACE FUNCTION public.current_compte_id()
RETURNS INT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT c.id FROM public.compte c WHERE c.user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.compte c
    WHERE c.user_id = auth.uid() AND c.role = 'Administrateur'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_gerant()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.compte c
    WHERE c.user_id = auth.uid() AND c.role = 'Gerant'
  );
$$;
```

---

## 🔁 5. TRIGGERS

### Mettre à jour automatiquement `updated_at`

```sql
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER t_upd_compte BEFORE UPDATE ON public.compte FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_upd_restaurant BEFORE UPDATE ON public.restaurant FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_upd_plat BEFORE UPDATE ON public.plat FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_upd_menu BEFORE UPDATE ON public.menu FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_upd_commande BEFORE UPDATE ON public.commande FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
```

### Remplir automatiquement le `client_id` lors d'une commande

```sql
CREATE OR REPLACE FUNCTION public.commande_set_client_id()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.client_id IS NULL THEN
    NEW.client_id := public.current_compte_id();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER t_ins_commande_client
BEFORE INSERT ON public.commande
FOR EACH ROW EXECUTE FUNCTION public.commande_set_client_id();
```

### Recalculer le montant total d’une commande

```sql
CREATE OR REPLACE FUNCTION public.recalc_commande_total(p_commande UUID)
RETURNS VOID
LANGUAGE sql AS $$
  UPDATE public.commande c
  SET montant_total = COALESCE((
    SELECT SUM(p.prix * cp.quantite)
    FROM public.commande_plat cp
    JOIN public.plat p ON p.id_plat = cp.plat_id
    WHERE cp.commande_id = c.id_commande
  ), 0)
  WHERE c.id_commande = p_commande;
$$;

CREATE OR REPLACE FUNCTION public.trg_recalc_total_iud()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE
  v_commande UUID;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    v_commande := OLD.commande_id;
  ELSE
    v_commande := NEW.commande_id;
  END IF;
  PERFORM public.recalc_commande_total(v_commande);
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER t_commande_plat_ins AFTER INSERT ON public.commande_plat FOR EACH ROW EXECUTE FUNCTION public.trg_recalc_total_iud();
CREATE TRIGGER t_commande_plat_upd AFTER UPDATE ON public.commande_plat FOR EACH ROW EXECUTE FUNCTION public.trg_recalc_total_iud();
CREATE TRIGGER t_commande_plat_del AFTER DELETE ON public.commande_plat FOR EACH ROW EXECUTE FUNCTION public.trg_recalc_total_iud();
```

### Mise à jour automatique du statut après paiement

```sql
CREATE OR REPLACE FUNCTION public.update_statut_on_payment(p_commande UUID)
RETURNS VOID
LANGUAGE plpgsql AS $$
DECLARE
  v_total NUMERIC(12,2);
  v_paid  NUMERIC(12,2);
BEGIN
  SELECT montant_total INTO v_total FROM public.commande WHERE id_commande = p_commande;
  SELECT COALESCE(SUM(montant),0) INTO v_paid FROM public.paiement WHERE commande_id = p_commande;

  IF v_total IS NOT NULL AND v_paid >= v_total THEN
    UPDATE public.commande SET statut = 'PAYE' WHERE id_commande = p_commande;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_update_statut_payment()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  PERFORM public.update_statut_on_payment(NEW.commande_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER t_payment_after_ins
AFTER INSERT ON public.paiement
FOR EACH ROW EXECUTE FUNCTION public.trg_update_statut_payment();
```

---

## 🔒 6. RLS (Row Level Security)

Activation :

```sql
ALTER TABLE public.compte ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_plat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commande ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commande_plat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paiement ENABLE ROW LEVEL SECURITY;
```

Policies :

```sql
CREATE POLICY p_select_all_plat ON public.plat FOR SELECT USING (true);
CREATE POLICY p_select_all_menu ON public.menu FOR SELECT USING (true);
CREATE POLICY p_select_all_restaurant ON public.restaurant FOR SELECT USING (true);
CREATE POLICY p_select_self_compte ON public.compte FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY p_select_self_commande ON public.commande FOR SELECT USING (client_id = public.current_compte_id() OR public.is_admin());
```

---

## 🖼️ 7. STOCKAGE DES IMAGES (Supabase Storage)

> ⚙️ Les buckets sont créés manuellement dans Supabase Storage.

### Création manuelle :

* **Bucket 1 :** `restaurants` (Public)
* **Bucket 2 :** `plats` (Public)

### Configuration :

* Dans le **Dashboard Supabase → Storage** :

  * Activer **“Public Read Access”** pour les deux buckets

### Exemple d’upload (JS / Supabase SDK)

```js
const filePath = `${user.id}/${crypto.randomUUID()}.jpg`;
const { data, error } = await supabase.storage
  .from('plats')
  .upload(filePath, file);

const publicUrl = supabase.storage
  .from('plats')
  .getPublicUrl(data.path)
  .data.publicUrl;
```

---

## ✅ FIN DU SCRIPT
