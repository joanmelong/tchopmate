
---

# 🍽️ Gestion de la Base de Données — TCHOPMATE

## 📘 1. Objectif

Mettre en place une base de données **PostgreSQL** hébergée sur **Supabase**, avec :

* des **tables relationnelles** pour les entités (Client, Restaurant, Plat, Menu, Commande, Paiement, etc.)
* la **sécurité RLS (Row Level Security)** gérée par Supabase Auth
* le **stockage d’images** via Supabase Storage (`plats` et `restaurants`)
* des **triggers** automatiques pour calculer les montants et statuts
* une **intégration directe avec le backend** (Node.js)

---

## 🧱 2. Structure de la base de données (PostgreSQL)

### 🧩 Schéma principal : `public`

#### **Tables principales**

| Table           | Rôle                                                         |
| --------------- | ------------------------------------------------------------ |
| `compte`        | Profil applicatif lié à `auth.users` (Client, Gérant, Admin) |
| `restaurant`    | Informations sur un restaurant et son gérant                 |
| `plat`          | Catalogue des plats disponibles                              |
| `menu`          | Ensemble de plats proposés à une date donnée                 |
| `menu_plat`     | Association N–N entre menus et plats                         |
| `commande`      | Commande passée par un client                                |
| `commande_plat` | Association N–N entre commandes et plats                     |
| `paiement`      | Enregistrements de paiements associés aux commandes          |

#### **Types énumérés**

```sql
CREATE TYPE statut AS ENUM ('LIVREE', 'EN_ATTENTE', 'PAYE');
CREATE TYPE methode_payement AS ENUM ('MobileMoney', 'OrangeMoney', 'Espece', 'Carte_bancaire');
```

#### **Relations clés**

* `compte.user_id` → `auth.users.id` (lien Supabase Auth)
* `restaurant.gerant_id` → `compte.id`
* `menu.restaurant_id` → `restaurant.id_restaurant`
* `commande.client_id` → `compte.id`
* `commande_plat(commande_id, plat_id)` → commandes et plats
* `paiement.commande_id` → `commande.id_commande`

---

## ⚙️ 3. Principales fonctions & triggers

### 🔹 Fonctions utilitaires

```sql
-- Récupère l'id du compte lié à l'utilisateur connecté
CREATE OR REPLACE FUNCTION public.current_compte_id()
RETURNS INT AS $$
  SELECT c.id FROM public.compte c WHERE c.user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Vérifie les rôles
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS(SELECT 1 FROM compte WHERE user_id = auth.uid() AND role='Administrateur');
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_gerant() RETURNS BOOLEAN AS $$
  SELECT EXISTS(SELECT 1 FROM compte WHERE user_id = auth.uid() AND role='Gerant');
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

### 🔹 Triggers automatiques

* `set_updated_at()` → met à jour `updated_at` sur chaque update
* `commande_set_client_id()` → remplit automatiquement `client_id` à partir du compte connecté
* `recalc_commande_total()` → recalcule `montant_total` après ajout/suppression de plats dans une commande
* `update_statut_on_payment()` → passe la commande en `PAYE` quand le total est atteint

---

## 🔒 4. Sécurité et RLS (Row Level Security)

Toutes les tables du schéma `public` ont la **RLS activée** :

```sql
ALTER TABLE public.compte ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commande ENABLE ROW LEVEL SECURITY;
-- etc.
```

### 🔹 Exemples de policies

```sql
-- Un utilisateur peut voir son propre compte
CREATE POLICY p_select_self_compte
ON public.compte
FOR SELECT
USING (user_id = auth.uid() OR public.is_admin());

-- Un client ne voit que ses commandes
CREATE POLICY p_select_self_commande
ON public.commande
FOR SELECT
USING (client_id = public.current_compte_id() OR public.is_admin());

-- Les plats, menus et restaurants sont publics
CREATE POLICY p_select_all_plat ON public.plat FOR SELECT USING (true);
CREATE POLICY p_select_all_menu ON public.menu FOR SELECT USING (true);
CREATE POLICY p_select_all_restaurant ON public.restaurant FOR SELECT USING (true);
```

---

## 🗂️ 5. Gestion du stockage d’images (Supabase Storage)

### 📦 Buckets à créer

Deux buckets publics dans Supabase :

| Bucket        | Contenu                       | Visibilité |
| ------------- | ----------------------------- | ---------- |
| `plats`       | Images des plats              | Public     |
| `restaurants` | Logos / photos de restaurants | Public     |

### 🔹 Création via SQL (compatible)

```sql
INSERT INTO storage.buckets (id, name, public)
SELECT 'restaurants', 'restaurants', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'restaurants');

INSERT INTO storage.buckets (id, name, public)
SELECT 'plats', 'plats', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'plats');
```

> ⚠️ Après exécution, configure dans le **Dashboard Supabase** :
>
> * **Storage → Buckets → Policies**
> * Active “Public Read Access” pour chaque bucket

---

## 🧠 6. Utilisation côté backend

### 🔹 Exemple avec Node.js / Supabase-js

```js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Récupération de données
const { data: plats, error } = await supabase
  .from("plat")
  .select("*");

// --- Insertion d'une commande
const { data: commande, error: cmdErr } = await supabase
  .from("commande")
  .insert([{ commentaire: "Sans piment" }])
  .select();

// --- Upload d'une image de plat
const filePath = `${user.id}/${crypto.randomUUID()}.jpg`;
const { data, error: uploadErr } = await supabase.storage
  .from("plats")
  .upload(filePath, file);

const imageUrl = supabase.storage.from("plats").getPublicUrl(data.path).data.publicUrl;

// --- Mise à jour du plat avec URL de l’image
await supabase.from("plat").update({ image: imageUrl }).eq("id_plat", idPlat);
```

---

### 🔹 Exemple avec NestJS (service)

```ts
// plat.service.ts
@Injectable()
export class PlatService {
  constructor(private supabase: SupabaseClient) {}

  async getAll() {
    const { data, error } = await this.supabase.from('plat').select('*');
    if (error) throw new Error(error.message);
    return data;
  }

  async createPlat(platDto: CreatePlatDto, file: File, userId: string) {
    const path = `${userId}/${crypto.randomUUID()}.jpg`;
    const { data: upload } = await this.supabase.storage.from('plats').upload(path, file);
    const publicUrl = this.supabase.storage.from('plats').getPublicUrl(upload.path).data.publicUrl;

    const { data, error } = await this.supabase.from('plat').insert([
      { ...platDto, image: publicUrl }
    ]);
    if (error) throw new Error(error.message);
    return data;
  }
}
```

---

## 🧾 7. Jeu de données initial (exemple)

```sql
-- Un admin et un client
INSERT INTO public.compte (user_id, nom, prenom, email, role)
VALUES 
('00000000-0000-0000-0000-000000000001', 'Admin', 'Root', 'admin@example.com', 'Administrateur'),
('00000000-0000-0000-0000-000000000002', 'Victor', 'Djidawo', 'victor@example.com', 'Client');

-- Un restaurant
INSERT INTO public.restaurant (nom, localisation, gerant_id)
VALUES ('Le Saint Jean', 'Yaoundé - Mvog-Ada', 2);

-- Trois plats
INSERT INTO public.plat (nom, description, prix, categorie)
VALUES
('Poulet DG', 'Plat traditionnel camerounais', 3500, 'Repas'),
('Eru et water-fufu', 'Spécialité du Sud-Ouest', 2500, 'Repas'),
('Jus de Bissap', 'Boisson naturelle', 1000, 'Boisson');

-- Un menu
INSERT INTO public.menu (restaurant_id) VALUES (
  (SELECT id_restaurant FROM public.restaurant LIMIT 1)
);

-- Associer plats au menu
INSERT INTO public.menu_plat (menu_id, plat_id)
SELECT m.id_menu, p.id_plat FROM public.menu m, public.plat p;

-- Une commande et un paiement
INSERT INTO public.commande (client_id, commentaire) VALUES (2, 'Livrer à domicile');
INSERT INTO public.commande_plat VALUES (
  (SELECT id_commande FROM public.commande LIMIT 1),
  (SELECT id_plat FROM public.plat LIMIT 1),
  2
);
INSERT INTO public.paiement (commande_id, montant, methode)
VALUES (
  (SELECT id_commande FROM public.commande LIMIT 1),
  7000,
  'MobileMoney'
);
```

---

## 🧭 8. Points forts de cette configuration

✅ **Sécurisée** : basée sur Supabase Auth + Row Level Security
✅ **Automatisée** : triggers de calcul et de mise à jour
✅ **Scalable** : chaque utilisateur gère ses propres données
✅ **Multicanal** : backend REST/GraphQL, front web ou mobile
✅ **Images hébergées proprement** : via Supabase Storage (buckets publics)

---

## 🧩 9. Structure simplifiée du modèle conceptuel

```text
[auth.users]
      │
      ▼
 [compte]──<gère>──[restaurant]
      │                │
      │                ▼
   <passe>          [menu]──<contient>──[plat]
    │                     │
    ▼                     ▼
 [commande]──<associe>──[paiement]
      │
      ▼
  [commande_plat]
```

---

## 🚀 10. Étapes à suivre pour tout répliquer

1. **Créer le projet Supabase**

   * Activer Auth et Storage
2. **Copier le script PostgreSQL** dans l’éditeur SQL et l’exécuter
3. **Créer les buckets**

   * `plats` et `restaurants`, cocher **Public**
4. **Configurer les policies Storage** (lecture publique)
5. **Uploader les images** via le SDK Supabase (frontend/backend)
6. **Tester avec le jeu de données** (vérifier montants et statuts automatiques)
7. **Brancher ton backend** (Node.js)

---
