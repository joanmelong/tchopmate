# Guide de Démarrage Rapide - Gestion Menus & Plats

## 🚀 Démarrage en 5 minutes

### Étape 1: Configuration de la base de données (2 min)

1. Ouvrez Supabase Dashboard
2. Allez dans l'éditeur SQL
3. Copiez et exécutez le contenu de `create_menus_plats_tables.sql`
4. Vérifiez que les tables sont créées :
   ```sql
   SELECT * FROM menus LIMIT 1;
   SELECT * FROM plats LIMIT 1;
   ```

### Étape 2: Vérification des permissions (1 min)

Assurez-vous d'avoir un compte gérant lié à un restaurant :

```sql
-- Vérifier votre compte gérant
SELECT * FROM gerants WHERE user_id = auth.uid();

-- Si vous n'en avez pas, créez-en un (remplacez les valeurs)
INSERT INTO gerants (user_id, restaurant_id)
VALUES ('VOTRE-USER-UUID', 'VOTRE-RESTAURANT-UUID');
```

### Étape 3: Démarrage de l'application (1 min)

```bash
# Si pas déjà fait
npm install

# Démarrer le serveur
npm run dev
```

### Étape 4: Tester la fonctionnalité (1 min)

1. Connectez-vous en tant que gérant
2. Naviguez vers `/resto/[votre-restaurant-id]/menus`
3. Cliquez sur "Nouveau Menu"
4. Créez votre premier menu !

---

## 📋 Checklist de vérification

### Avant de commencer
- [ ] Supabase configuré et accessible
- [ ] Variables d'environnement correctes (.env.local)
- [ ] Compte gérant créé et lié à un restaurant
- [ ] npm install exécuté

### Après l'installation
- [ ] Tables `menus` et `plats` créées
- [ ] Politiques RLS actives
- [ ] Index créés
- [ ] Triggers fonctionnels

### Test de base
- [ ] Peut créer un menu
- [ ] Peut modifier un menu
- [ ] Peut supprimer un menu
- [ ] Peut créer un plat
- [ ] Peut filtrer les plats par catégorie
- [ ] Peut toggle la disponibilité

---

## 🔧 Variables d'environnement requises

Fichier `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon
```

---

## 📍 URLs importantes

### Pages de gestion
- Menus: `http://localhost:3000/resto/[id]/menus`
- Plats: `http://localhost:3000/resto/[id]/dishes`

### Remplacez `[id]` par l'UUID de votre restaurant

Pour trouver l'ID de votre restaurant :
```sql
SELECT r.id, r.nom 
FROM restaurants r
JOIN gerants g ON r.id = g.restaurant_id
WHERE g.user_id = auth.uid();
```

---

## 🐛 Dépannage rapide

### Erreur: "Permission denied"
**Solution**: Vérifiez que vous êtes connecté en tant que gérant
```sql
SELECT * FROM gerants WHERE user_id = auth.uid();
```

### Erreur: "Table does not exist"
**Solution**: Exécutez le script SQL de création des tables

### Erreur: "Failed to fetch"
**Solution**: 
1. Vérifiez vos variables d'environnement
2. Redémarrez le serveur de développement
3. Vérifiez la console navigateur pour plus de détails

### Les menus n'apparaissent pas
**Solution**:
1. Vérifiez que le restaurant_id correspond
2. Vérifiez les politiques RLS :
   ```sql
   SELECT * FROM menus WHERE restaurant_id = 'VOTRE-ID';
   ```

---

## 📖 Structure de données

### Créer un menu
```typescript
{
  restaurant_id: "uuid-du-restaurant",
  nom: "Menu du jour",
  description: "Description optionnelle",
  prix: 2500,
  image_url: "https://...",
  disponible: true
}
```

### Créer un plat
```typescript
{
  restaurant_id: "uuid-du-restaurant",
  nom: "Ndolé aux crevettes",
  description: "Plat traditionnel",
  prix: 2500,
  categorie: "Plats traditionnels",
  image_url: "https://...",
  temps_preparation: 25,
  disponible: true
}
```

---

## 🎯 Exemples de données de test

```sql
-- Insérer des menus de test (remplacez RESTAURANT-UUID)
INSERT INTO menus (restaurant_id, nom, description, prix, disponible) VALUES
('RESTAURANT-UUID', 'Menu du jour', 'Menu complet avec entrée, plat et dessert', 3500, TRUE),
('RESTAURANT-UUID', 'Menu express', 'Plat + boisson', 2000, TRUE);

-- Insérer des plats de test
INSERT INTO plats (restaurant_id, nom, description, prix, categorie, temps_preparation, disponible) VALUES
('RESTAURANT-UUID', 'Ndolé aux crevettes', 'Plat traditionnel camerounais', 2500, 'Plats traditionnels', 25, TRUE),
('RESTAURANT-UUID', 'Poulet DG', 'Poulet sauté aux légumes et plantains', 3000, 'Plats traditionnels', 30, TRUE),
('RESTAURANT-UUID', 'Riz sauté aux légumes', 'Riz parfumé avec légumes frais', 1800, 'Plats végétariens', 20, TRUE),
('RESTAURANT-UUID', 'Jus de bissap', 'Boisson fraîchissante', 500, 'Boissons', 5, TRUE);
```

---

## 📚 Documentation complète

Pour plus de détails :
- Architecture : `CLEAN_ARCHITECTURE.md`
- Guide complet : `MENU_DISH_MANAGEMENT_README.md`
- Schéma BDD : `DATABASE_SCHEMA_MENUS_PLATS.md`
- Récapitulatif : `IMPLEMENTATION_SUMMARY.md`

---

## ✅ Vous êtes prêt !

L'implémentation respecte les principes de Clean Architecture et est prête pour la production.

**Bon développement ! 🚀**
