# 🖼️ Assets Publics

## Description

Ce dossier contient tous les **assets statiques** publiquement accessibles de l'application TchopMate.

## 📁 Structure

```
public/
├── *.jpg                  # Images de plats africains
├── *.svg                  # Icônes et logos vectoriels
└── *.png                  # Images d'interface
```

## 🍽️ Images de Plats

### Plats Camerounais
- `ndole-camerounais-plat-traditionnel.jpg` - Ndolé traditionnel
- `ndole-aux-crevettes.jpg` - Ndolé aux crevettes
- `poulet-dg-cameroun-plantain.jpg` - Poulet DG avec plantain
- `poulet-dg.jpg` - Poulet DG
- `beignets-haricots-cameroun-frits.jpg` - Beignets haricots

### Plats Africains Généraux
- `african-rice-dish-with-vegetables-and-meat.jpg` - Riz aux légumes et viande
- `african-peanut-soup-with-fufu-and-vegetables.jpg` - Soupe d'arachide avec fufu
- `african-stew-with-fufu-traditional-meal.jpg` - Ragoût avec fufu
- `delicious-african-jollof-rice-with-grilled-chicken.jpg` - Jollof rice poulet grillé
- `delicious-african-food-plate-with-rice-and-vegetab.jpg` - Assiette complète
- `grilled-chicken-with-plantains-african-cuisine.jpg` - Poulet grillé plantains
- `grilled-fish-with-atti-k--and-spicy-sauce.jpg` - Poisson grillé attiéké
- `traditional-african-ndole-dish-with-plantains-and-.jpg` - Ndolé avec plantains

### Accompagnements
- `banane-plantain-grill-e.jpg` - Banane plantain grillée
- `riz-saut--l-gumes.jpg` / `riz-saute-legumes.jpg` - Riz sauté légumes
- `fresh-african-salad-with-vegetables.jpg` - Salade africaine

### Boissons
- `jus-bissap-hibiscus-rouge.jpg` / `jus-bissap.jpg` - Jus de bissap
- `jus-orange-frais.jpg` - Jus d'orange frais
- `bouteille-eau-min-rale.jpg` - Eau minérale

### Desserts
- `fruits-tropicaux-frais.jpg` - Fruits tropicaux

## 🎨 Ressources Graphiques

### Logos & Icônes
- `placeholder-logo.png` / `placeholder-logo.svg` - Logo temporaire
- `next.svg` - Logo Next.js
- `vercel.svg` - Logo Vercel
- `file.svg` - Icône fichier
- `globe.svg` - Icône globe
- `window.svg` - Icône fenêtre

### Placeholders
- `placeholder.jpg` / `placeholder.svg` - Image placeholder générique
- `placeholder-user.jpg` - Avatar utilisateur par défaut
- `student-avatar.png` - Avatar étudiant
- `diverse-food-spread.png` - Spread de nourriture diverse

## 🎯 Conventions de Nommage

### Format Actuel (à nettoyer)
- Mélange de formats: `poulet-dg.jpg` et `poulet_dg.jpg`
- Caractères accentués: `grill-e`, `l-gumes`
- Espaces encodés: `atti-k--`

### Format Recommandé
```
[catégorie]-[nom]-[variant].extension

Exemples:
- plat-ndole-traditionnel.jpg
- plat-poulet-dg-plantain.jpg
- boisson-jus-bissap.jpg
- icon-logo-tchopmate.svg
- placeholder-user-default.png
```

## 📝 Tâches à Venir

### Organisation
- [ ] Créer sous-dossiers par catégorie:
  ```
  public/
  ├── images/
  │   ├── plats/
  │   ├── boissons/
  │   └── desserts/
  ├── icons/
  ├── logos/
  └── placeholders/
  ```

- [ ] Renommer tous les fichiers selon la convention
- [ ] Supprimer les doublons
- [ ] Compresser les images (optimisation)

### Nouvelles Images
- [ ] Logo officiel TchopMate
- [ ] Favicon (16x16, 32x32, 192x192)
- [ ] Icône d'application (PWA)
- [ ] Images pour partage social (Open Graph)
- [ ] Screenshots pour documentation

### Optimisation
- [ ] Convertir JPG en WebP (meilleur compression)
- [ ] Créer versions responsive (sm, md, lg)
- [ ] Générer sprites pour petites icônes
- [ ] Implémenter lazy loading

## 🖼️ Dimensions Recommandées

### Images de Plats
- **Miniature:** 300x300px
- **Carte:** 600x400px
- **Détail:** 1200x800px

### Logos
- **Favicon:** 16x16, 32x32, 48x48
- **Logo header:** 200x60px
- **Logo full:** 400x120px

### Open Graph (Partage Social)
- **OG Image:** 1200x630px
- **Twitter Card:** 1200x600px

## 🚀 Utilisation dans le Code

### Image Next.js Optimisée

```tsx
import Image from 'next/image';

<Image
  src="/ndole-camerounais-plat-traditionnel.jpg"
  alt="Ndolé Camerounais"
  width={600}
  height={400}
  priority // Pour les images above the fold
/>
```

### Image Statique

```tsx
<img 
  src="/placeholder-logo.svg" 
  alt="TchopMate Logo"
  width="200"
  height="60"
/>
```

### Background CSS

```css
.hero {
  background-image: url('/diverse-food-spread.png');
}
```

## 📦 Compression d'Images

### Outils Recommandés
- **[TinyPNG](https://tinypng.com/)** - Compression PNG/JPG
- **[Squoosh](https://squoosh.app/)** - Compression et conversion
- **[ImageOptim](https://imageoptim.com/)** - Batch optimization

### Script NPM

```json
{
  "scripts": {
    "optimize-images": "imagemin public/*.{jpg,png} --out-dir=public/optimized"
  }
}
```

## 🎨 Sources d'Images

### Pour Ajouter de Nouvelles Images
- **[Unsplash](https://unsplash.com/)** - Photos libres haute qualité
- **[Pexels](https://www.pexels.com/)** - Photos et vidéos gratuites
- **[Pixabay](https://pixabay.com/)** - Images libres de droits

### Critères de Sélection
- ✅ Haute résolution (minimum 1200px largeur)
- ✅ Bonne luminosité
- ✅ Représentation authentique de la cuisine africaine
- ✅ Licence libre (CC0 ou équivalent)

## 📐 Guidelines Design

### Photos de Plats
- Éclairage naturel de préférence
- Angle légèrement du dessus (45°)
- Fond neutre ou assiette/plat visible
- Couleurs vives et appétissantes

### Icônes & Logos
- Format vectoriel (SVG) quand possible
- Style cohérent entre toutes les icônes
- Taille minimale 24x24px pour lisibilité

## 🔒 Droits d'Auteur

⚠️ **Important:** Vérifier que toutes les images ont les droits appropriés.

Pour chaque image:
- [ ] Vérifier la licence
- [ ] Attribuer si nécessaire
- [ ] Documenter la source

Créer un fichier `IMAGE_CREDITS.md` listant:
- Nom du fichier
- Source
- Auteur
- Licence
- URL originale

## 🌍 Accessibilité

### Alt Text
Toujours fournir un texte alternatif descriptif:

```tsx
// ❌ Mauvais
<Image src="/plat.jpg" alt="Plat" />

// ✅ Bon
<Image 
  src="/ndole-camerounais.jpg" 
  alt="Assiette de Ndolé camerounais avec plantain et poisson fumé" 
/>
```

### Contraste
S'assurer que le texte sur images a un contraste suffisant (ratio 4.5:1 minimum).

---

**Dernière mise à jour:** 11 novembre 2025  
**Statut:** ⚠️ À organiser et optimiser  
**Taille totale:** ~20MB (à réduire avec WebP et compression)
