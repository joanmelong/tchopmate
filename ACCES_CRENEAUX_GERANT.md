# 🎯 Accès à la Gestion des Créneaux (Gérant)

## 📍 Où trouver la gestion des créneaux ?

### Dans le menu latéral du gérant

Après connexion en tant que gérant, vous verrez le menu suivant :

```
┌─────────────────────────────────┐
│  TM  TchopMate                  │
├─────────────────────────────────┤
│                                 │
│  📊 Tableau de bord             │
│                                 │
│  🍽️  Gestion des plats          │
│                                 │
│  📖 Gestion des menus           │
│                                 │
│  🛒 Commandes                   │
│                                 │
│  🕐 Créneaux horaires  ← ICI ! │
│                                 │
│  📈 Statistiques                │
│                                 │
├─────────────────────────────────┤
│  🚪 Déconnexion                 │
└─────────────────────────────────┘
```

---

## 🚀 Accès rapide

### URL directe
```
/resto/[votre-id]/creneaux
```

Exemple : `/resto/123e4567-e89b-12d3-a456-426614174000/creneaux`

---

## 📋 Que peut faire le gérant sur cette page ?

### ✅ Créer des créneaux
1. Cliquer sur **"+ Nouveau créneau"**
2. Définir l'heure de début et fin
3. Définir la capacité maximale
4. Choisir les jours de la semaine
5. Activer/Désactiver le créneau
6. Sauvegarder

### ✏️ Modifier des créneaux
1. Cliquer sur **"Modifier"** sur un créneau existant
2. Changer les paramètres
3. Sauvegarder

### 🗑️ Supprimer des créneaux
1. Cliquer sur l'icône **poubelle** 🗑️
2. Confirmer la suppression

---

## 🎨 Aperçu de la page

```
┌─────────────────────────────────────────────────────────┐
│  ← Gestion des créneaux          [+ Nouveau créneau]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────┐  ┌──────────────────┐           │
│  │ 🕐 11:30 - 12:00│  │ 🕐 12:00 - 12:30│           │
│  │                  │  │                  │           │
│  │ [Actif]         │  │ [Actif]         │           │
│  │ 👥 10 max       │  │ 👥 10 max       │           │
│  │ Lun Mar Mer Jeu │  │ Lun Mar Mer Jeu │           │
│  │ Ven             │  │ Ven             │           │
│  │                  │  │                  │           │
│  │ [✏️ Modifier] [🗑️]│  │ [✏️ Modifier] [🗑️]│           │
│  └──────────────────┘  └──────────────────┘           │
│                                                         │
│  ┌──────────────────┐  ┌──────────────────┐           │
│  │ 🕐 12:30 - 13:00│  │ 🕐 13:00 - 13:30│           │
│  │ ...              │  │ ...              │           │
│  └──────────────────┘  └──────────────────┘           │
└─────────────────────────────────────────────────────────┘
```

---

## 🔑 Permissions

### Qui peut accéder ?
- ✅ Gérants connectés
- ✅ Uniquement pour leurs propres restaurants
- ❌ Clients (pas d'accès)
- ❌ Autres gérants (pas d'accès aux restaurants des autres)

### Sécurité
Les politiques RLS (Row Level Security) garantissent que :
- Un gérant ne voit que les créneaux de ses restaurants
- Un gérant ne peut modifier que les créneaux de ses restaurants
- Les créneaux sont protégés contre les accès non autorisés

---

## 📱 Responsive

La page s'adapte à tous les écrans :

### Desktop (> 1024px)
```
┌─────────────────────────────────────────────────────────┐
│  3 créneaux par ligne                                   │
│  [Créneau 1] [Créneau 2] [Créneau 3]                   │
│  [Créneau 4] [Créneau 5] [Créneau 6]                   │
└─────────────────────────────────────────────────────────┘
```

### Tablet (640px - 1024px)
```
┌───────────────────────────────────────┐
│  2 créneaux par ligne                 │
│  [Créneau 1] [Cr��neau 2]             │
│  [Créneau 3] [Créneau 4]             │
└───────────────────────────────────────┘
```

### Mobile (< 640px)
```
┌─────────────────────┐
│  1 créneau par ligne│
│  [Créneau 1]        │
│  [Créneau 2]        │
│  [Créneau 3]        │
└─────────────────────┘
```

---

## 🎯 Workflow typique

### 1. Première utilisation
```
Connexion gérant
    ↓
Menu latéral → "Créneaux horaires"
    ↓
Page vide avec message "Aucun créneau"
    ↓
Cliquer sur "+ Nouveau créneau"
    ↓
Créer 5-6 créneaux pour le midi
    ↓
Créer 3-4 créneaux pour le soir
    ↓
✅ Système prêt !
```

### 2. Utilisation quotidienne
```
Connexion gérant
    ↓
Menu latéral → "Commandes"
    ↓
Voir les commandes groupées par créneau
    ↓
Gérer les commandes
```

### 3. Modification des créneaux
```
Menu latéral → "Créneaux horaires"
    ↓
Cliquer sur "Modifier" sur un créneau
    ↓
Changer la capacité ou les horaires
    ↓
Sauvegarder
    ↓
✅ Créneau mis à jour !
```

---

## 💡 Conseils

### Créneaux recommandés

**Pour le midi (11h30 - 14h00)**
```
11:30 - 12:00  (10 commandes)
12:00 - 12:30  (10 commandes)
12:30 - 13:00  (10 commandes)
13:00 - 13:30  (10 commandes)
13:30 - 14:00  (8 commandes)
```

**Pour le soir (18h00 - 19h30)**
```
18:00 - 18:30  (8 commandes)
18:30 - 19:00  (8 commandes)
19:00 - 19:30  (8 commandes)
```

### Bonnes pratiques
- ✅ Créer des créneaux de 30 minutes
- ✅ Adapter la capacité à votre cuisine
- ✅ Désactiver plutôt que supprimer (pour garder l'historique)
- ✅ Tester avec quelques créneaux avant de tout configurer

---

## 🐛 Problèmes courants

### "Je ne vois pas le menu Créneaux horaires"
**Solutions :**
1. Vérifier que vous êtes connecté en tant que gérant
2. Rafraîchir la page (F5)
3. Vider le cache du navigateur
4. Vérifier que le fichier `sidebar.tsx` a été modifié

### "Erreur 404 sur /resto/[id]/creneaux"
**Solutions :**
1. Vérifier que le fichier `src/app/resto/[id]/creneaux/page.tsx` existe
2. Redémarrer le serveur de développement
3. Vérifier les logs de la console

### "Je ne peux pas créer de créneau"
**Solutions :**
1. Vérifier que le SQL a été exécuté
2. Vérifier les politiques RLS dans Supabase
3. Vérifier que vous êtes bien gérant du restaurant
4. Consulter les logs Supabase

---

## ✅ Checklist de vérification

Avant de commencer à utiliser les créneaux :

- [ ] Le SQL `create_creneaux_notifications.sql` a été exécuté
- [ ] Le menu "Créneaux horaires" est visible dans la sidebar
- [ ] Je peux accéder à `/resto/[id]/creneaux`
- [ ] Je peux cliquer sur "+ Nouveau créneau"
- [ ] Le formulaire s'affiche correctement
- [ ] Je peux créer un créneau de test
- [ ] Le créneau apparaît dans la liste
- [ ] Je peux modifier le créneau
- [ ] Je peux supprimer le créneau

---

## 📞 Support

Si vous avez des problèmes :
1. Consulter `FAQ_CRENEAUX.md`
2. Vérifier les logs Supabase
3. Vérifier la console du navigateur
4. Relire `GUIDE_INTEGRATION_CRENEAUX.md`

---

**Le lien est maintenant disponible dans le menu latéral du gérant !** 🎉
