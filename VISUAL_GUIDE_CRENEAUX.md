# 🎨 Guide Visuel - Système de Créneaux

## 📱 Interface Client

### 1. Badge de notifications (Navigation)
```
┌─────────────────────────────────────────────┐
│  🏠 Accueil   🍽️ Menu   ❤️ Favoris   🔔 3  │
│                                      ↑      │
│                                      │      │
│                              Badge rouge    │
│                              avec compteur  │
└─────────────────────────────────────────────┘
```

### 2. Sélecteur de créneaux (Page paiement)
```
┌─────────────────────────────────────────────────────────┐
│  Choisissez votre créneau de retrait  [Aujourd'hui]    │
│  Lundi 28 novembre - Sélectionnez l'heure de retrait   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────┐  ┌──────────────────────┐   │
│  │  🕐 12:00 - 12:30   │  │  🕐 12:30 - 13:00   │   │
│  │                      │  │                      │   │
│  │  👥 7 places        │  │  👥 10 places       │   │
│  │                      │  │                      │   │
│  │  [Sélectionné] ✓    │  │                      │   │
│  └──────────────────────┘  └──────────────────────┘   │
│                                                         │
│  ┌──────────────────────┐  ┌──────────────────────┐   │
│  │  🕐 13:00 - 13:30   │  │  🕐 13:30 - 14:00   │   │
│  │                      │  │                      │   │
│  │  👥 9 places        │  │  👥 8 places        │   │
│  │                      │  │                      │   │
│  │                      │  │                      │   │
│  └──────────────────────┘  └──────────────────────┘   │
│                                                         │
│  ┌──────────────────────┐  ┌──────────────────────┐   │
│  │  🕐 18:00 - 18:30   │  │  🕐 18:30 - 19:00   │   │
│  │                      │  │                      │   │
│  │  🔒 COMPLET         │  │  👥 5 places        │   │
│  │                      │  │                      │   │
│  │  (grisé)            │  │                      │   │
│  └──────────────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 3. Page de notifications
```
┌─────────────────────────────────────────────────────────┐
│  ← Notifications                [Tout marquer comme lu] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ✅  Commande prête !          [commande_prete]  │   │
│  │                                                  │   │
│  │ Votre commande est prête ! Venez la retirer.   │   │
│  │ Créneau : 12:00                                 │   │
│  │                                                  │   │
│  │ Il y a 5 minutes                          [✓]   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🍳  Commande en préparation  [en_preparation]  │   │
│  │                                                  │   │
│  │ Votre commande est en cours de préparation !   │   │
│  │                                                  │   │
│  │ Il y a 15 minutes                         [✓]   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ✅  Commande confirmée       [commande_confirmee]│  │
│  │                                                  │   │
│  │ Votre commande a été confirmée.                │   │
│  │ Retrait prévu à 12:00-12:30                    │   │
│  │                                                  │   │
│  │ Il y a 20 minutes                               │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 👨‍🍳 Interface Gérant

### 1. Page de gestion des créneaux
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
│  │                  │  │                  │           │
│  │ [Actif]         │  │ [Actif]         │           │
│  │ 👥 10 max       │  │ 👥 10 max       │           │
│  │ Lun Mar Mer Jeu │  │ Lun Mar Mer Jeu │           │
│  │ Ven             │  │ Ven             │           │
│  │                  │  │                  │           │
│  │ [✏️ Modifier] [🗑️]│  │ [✏️ Modifier] [🗑️]│           │
│  └──────────────────┘  └──────────────────┘           │
└─────────────────────────────────────────────────────────┘
```

### 2. Formulaire de création/modification
```
┌─────────────────────────────────────────────────────────┐
│  Nouveau créneau                                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Heure de début          Heure de fin                  │
│  ┌──────────────┐        ┌──────────────┐             │
│  │ 12:00        │        │ 12:30        │             │
│  └──────────────┘        └──────────────┘             │
│                                                         │
│  Capacité maximale                                      │
│  ┌──────────────┐                                      │
│  │ 10           │                                      │
│  └──────────────┘                                      │
│                                                         │
│  Jours de la semaine                                    │
│  [Lun] [Mar] [Mer] [Jeu] [Ven] [Sam] [Dim]           │
│   ✓     ✓     ✓     ✓     ✓     ☐     ☐             │
│                                                         │
│  ☑️ Créneau actif                                       │
│                                                         │
│  [Créer]  [Annuler]                                    │
└─────────────────────────────────────────────────────────┘
```

### 3. Vue des commandes par créneau
```
┌─────────────────────────────────────────────────────────┐
│  Commandes par créneau                    [50 commandes]│
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🕐 12:00 - 12:30                            [▼] │   │
│  │ 📦 8 commandes | 💰 96.00€                      │   │
│  │ [3 en attente] [2 en préparation] [3 prêtes]   │   │
│  ├─────────────────────────────────────────────────┤   │
│  │                                                  │   │
│  │  #CMD-001234 | Marie D. | 12.00€               │   │
│  │  ✅ PRÊTE                      [Retirée]       │   │
│  │                                                  │   │
│  │  #CMD-001235 | Jean M. | 15.50€                │   │
│  │  🍳 EN PRÉPARATION             [Prête]         │   │
│  │                                                  │   │
│  │  #CMD-001236 | Sophie L. | 10.00€              │   │
│  │  ⏳ EN ATTENTE                 [Préparer]      │   │
│  │                                                  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🕐 12:30 - 13:00                            [▶] │   │
│  │ 📦 10 commandes | 💰 120.00€                    │   │
│  │ [5 en attente] [3 en préparation] [2 prêtes]   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🕐 13:00 - 13:30                            [▶] │   │
│  │ 📦 5 commandes | 💰 60.00€                      │   │
│  │ [2 en attente] [2 en préparation] [1 prête]    │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 Code couleur

### Statuts des commandes
```
⏳ EN ATTENTE       → Jaune  (bg-yellow-100)
🍳 EN PRÉPARATION   → Bleu   (bg-blue-100)
✅ PRÊTE            → Vert   (bg-green-100)
📦 RETIRÉE          → Gris   (bg-gray-100)
❌ ANNULÉE          → Rouge  (bg-red-100)
```

### Disponibilité des créneaux
```
🟢 Disponible (>20% places)  → Vert   (text-green-600)
🟠 Bientôt complet (<20%)    → Orange (text-orange-600)
🔴 Complet (0 places)        → Rouge  (text-red-600)
```

### Types de notifications
```
✅ Commande confirmée        → Gris   (bg-gray-100)
🍳 En préparation            → Bleu   (bg-blue-100)
✅ Commande prête            → Vert   (bg-green-100)
⏰ Créneau dépassé           → Orange (bg-orange-100)
❌ Commande annulée          → Rouge  (bg-red-100)
```

---

## 📱 Responsive Design

### Mobile (< 640px)
```
┌─────────────────────┐
│  Créneaux (1 col)   │
├─────────────────────┤
│  🕐 12:00 - 12:30  │
│  👥 7 places       │
│  [Sélectionné] ✓   │
├─────────────────────┤
│  🕐 12:30 - 13:00  │
│  👥 10 places      │
│                     │
├─────────────────────┤
│  🕐 13:00 - 13:30  │
│  👥 9 places       │
│                     │
└─────────────────────┘
```

### Tablet (640px - 1024px)
```
┌───────────────────────────────────────┐
│  Créneaux (2 colonnes)                │
├───────────────────────────────────────┤
│  🕐 12:00-12:30    🕐 12:30-13:00    │
│  👥 7 places       👥 10 places      │
│  [Sélectionné] ✓                     │
├───────────────────────────────────────┤
│  🕐 13:00-13:30    🕐 13:30-14:00    │
│  👥 9 places       👥 8 places       │
│                                       │
└───────────────────────────────────────┘
```

### Desktop (> 1024px)
```
┌─────────────────────────────────────────────────────────┐
│  Créneaux (2-3 colonnes)                                │
├─────────────────────────────────────────────────────────┤
│  🕐 12:00-12:30    🕐 12:30-13:00    🕐 13:00-13:30    │
│  👥 7 places       👥 10 places      👥 9 places       │
│  [Sélectionné] ✓                                       │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Points d'attention UX

### ✅ Bonnes pratiques implémentées

1. **Feedback visuel immédiat**
   - Badge rouge pour les notifications non lues
   - Bordure orange sur le créneau sélectionné
   - Animations de transition

2. **Clarté de l'information**
   - Badge "Aujourd'hui" bien visible
   - Date complète affichée
   - Nombre de places restantes

3. **Prévention des erreurs**
   - Créneaux passés cachés automatiquement
   - Créneaux complets grisés et non cliquables
   - Minimum 15 min d'avance requis

4. **Accessibilité**
   - Labels clairs
   - Contraste suffisant
   - Icônes + texte

5. **Performance**
   - Chargement avec spinner
   - Mise à jour en temps réel
   - Rafraîchissement automatique (30s)

---

## 🚀 Animations et transitions

```css
/* Exemples de transitions utilisées */

Badge notification:
  - Apparition: fade-in + scale
  - Compteur: pulse quand nouveau

Sélection créneau:
  - Hover: border-color + shadow
  - Selected: border-width + background

Notifications:
  - Nouvelle: slide-in-right
  - Marquée lue: opacity transition
  - Suppression: slide-out-left

Collapsible (commandes):
  - Ouverture: height + opacity
  - Fermeture: height + opacity
  - Icône: rotate (chevron)
```

---

**Ce guide visuel vous aide à comprendre l'interface avant même de l'intégrer !** 🎨
