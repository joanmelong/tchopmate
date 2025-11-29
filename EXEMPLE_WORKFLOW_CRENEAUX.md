# 📖 Exemple de Workflow - Système de Créneaux

## 🎬 Scénario complet

### Contexte
- **Restaurant:** "Le Resto U"
- **Date:** Lundi 28 novembre 2025
- **Heure actuelle:** 11:45
- **Client:** Marie, étudiante

---

## 👨‍🍳 Côté Gérant (Configuration)

### 1. Le gérant crée les créneaux
Le gérant du restaurant configure ses créneaux pour la semaine :

```
Créneaux du midi (Lundi-Vendredi):
┌─────────────┬──────────┬────────────┐
│ Créneau     │ Capacité │ Jours      │
├─────────────┼──────────┼────────────┤
│ 11:30-12:00 │ 10       │ Lun-Ven    │
│ 12:00-12:30 │ 10       │ Lun-Ven    │
│ 12:30-13:00 │ 10       │ Lun-Ven    │
│ 13:00-13:30 │ 10       │ Lun-Ven    │
│ 13:30-14:00 │ 8        │ Lun-Ven    │
└─────────────┴──────────┴────────────┘

Créneaux du soir (Lundi-Vendredi):
┌─────────────┬──────────┬────────────┐
│ Créneau     │ Capacité │ Jours      │
├─────────────┼──────────┼────────────┤
│ 18:00-18:30 │ 8        │ Lun-Ven    │
│ 18:30-19:00 │ 8        │ Lun-Ven    │
│ 19:00-19:30 │ 8        │ Lun-Ven    │
└─────────────┴──────────┴────────────┘
```

---

## 👩‍🎓 Côté Client (Commande)

### 2. Marie passe sa commande (11:45)

#### Étape 1: Choix des plats
```
Panier de Marie:
- Plat du jour: Poulet rôti + légumes (8.50€)
- Dessert: Tarte aux pommes (2.50€)
- Boisson: Eau (1.00€)
───────────────────────────────────────
Total: 12.00€
```

#### Étape 2: Sélection du créneau
Marie arrive sur la page de paiement et voit :

```
┌────────────────────────────────────────────────┐
│ Choisissez votre créneau de retrait 🕐         │
│ Aujourd'hui - Lundi 28 novembre                │
└────────────────────────────────────────────────┘

❌ 11:30-12:00  [PASSÉ - Non disponible]

✅ 12:00-12:30  [7 places restantes] ⭐ SÉLECTIONNÉ
   └─ Disponible dans 15 minutes

✅ 12:30-13:00  [10 places restantes]
   └─ Disponible dans 45 minutes

✅ 13:00-13:30  [9 places restantes]
   └─ Disponible dans 1h15

✅ 13:30-14:00  [8 places restantes]
   └─ Disponible dans 1h45

🔒 18:00-18:30  [COMPLET - 0 places]
   └─ Créneau complet

✅ 18:30-19:00  [5 places restantes]
   └─ Disponible dans 6h45
```

**Marie sélectionne:** 12:00-12:30

#### Étape 3: Confirmation
```
┌────────────────────────────────────────────────┐
│ ✅ Commande confirmée !                        │
│                                                 │
│ Numéro: #CMD-2025-001234                       │
│ Montant: 12.00€                                │
│ Créneau: 12:00-12:30 (Aujourd'hui)            │
│                                                 │
│ 📱 Vous recevrez une notification quand        │
│    votre commande sera prête                   │
└────────────────────────────────────────────────┘
```

---

## 🔔 Notifications automatiques

### 3. Marie reçoit des notifications

#### 11:46 - Commande confirmée
```
🔔 Nouvelle notification
───────────────────────────
✅ Commande confirmée
Votre commande #CMD-2025-001234 a été 
confirmée. Retrait prévu à 12:00-12:30.
```

#### 11:50 - En préparation
```
🔔 Nouvelle notification
───────────────────────────
🍳 Commande en préparation
Votre commande est en cours de préparation !
```

#### 12:05 - Commande prête
```
🔔 Nouvelle notification
───────────────────────────
✅ Commande prête !
Votre commande est prête ! Venez la retirer.
Créneau : 12:00-12:30
```

---

## 👨‍🍳 Côté Gérant (Gestion)

### 4. Le gérant voit les commandes groupées

#### Vue par créneau (12:00)
```
┌────────────────────────────────────────────────┐
│ 🕐 12:00 - 12:30                               │
│ 📦 8 commandes | 💰 96.00€                     │
│                                                 │
│ 3 en attente | 2 en préparation | 3 prêtes    │
└────────────────────────────────────────────────┘
  ▼ Cliquer pour voir les détails

┌────────────────────────────────────────────────┐
│ #CMD-001234 | Marie D. | 12.00€                │
│ ✅ PRÊTE                                       │
│ [Retirée] ←─ Bouton                           │
├────────────────────────────────────────────────┤
│ #CMD-001235 | Jean M. | 15.50€                 │
│ 🍳 EN PRÉPARATION                              │
│ [Prête] ←─ Bouton                              │
├────────────────────────────────────────────────┤
│ #CMD-001236 | Sophie L. | 10.00€               │
│ ⏳ EN ATTENTE                                  │
│ [Préparer] ←─ Bouton                           │
└────────────────────────────────────────────────┘
```

### 5. Le gérant change les statuts
```
11:50 → Gérant clique sur [Préparer] pour #CMD-001234
        ↓
        Marie reçoit: "🍳 Commande en préparation"

12:05 → Gérant clique sur [Prête] pour #CMD-001234
        ↓
        Marie reçoit: "✅ Commande prête !"

12:15 → Marie arrive et récupère sa commande
        ↓
        Gérant clique sur [Retirée]
        ↓
        Commande archivée
```

---

## 📊 Avantages du système

### Pour le restaurant
✅ **Organisation optimale**
- Commandes étalées sur la journée
- Pas de rush à 12h pile
- Préparation anticipée possible

✅ **Meilleure gestion**
- Vue claire par créneau
- Capacité contrôlée
- Moins de stress

### Pour les clients
✅ **Flexibilité**
- Choix de l'heure de retrait
- Visibilité sur la disponibilité
- Pas d'attente

✅ **Transparence**
- Notifications en temps réel
- Sait exactement quand venir
- Moins de frustration

---

## ⚠️ Cas particuliers

### Cas 1: Tous les créneaux sont passés
```
Heure actuelle: 14:30

┌────────────────────────────────────────────────┐
│ ⏰ Aucun créneau disponible aujourd'hui        │
│                                                 │
│ Tous les créneaux sont passés ou complets.    │
│ Revenez demain ou contactez le restaurant.    │
└────────────────────────────────────────────────┘
```

### Cas 2: Créneau complet
```
┌────────────────────────────────────────────────┐
│ 🔒 12:00-12:30  [COMPLET]                      │
│                                                 │
│ Ce créneau est complet (10/10 commandes)      │
│ Veuillez choisir un autre créneau.            │
└────────────────────────────────────────────────┘
```

### Cas 3: Client en retard
```
Créneau: 12:00-12:30
Heure actuelle: 12:45
Statut commande: PRETE

🔔 Notification automatique (12:35)
───────────────────────────────
⏰ Attention : créneau de retrait dépassé
Votre commande est prête mais le créneau 
est dépassé. Venez la retirer rapidement.
```

---

## 🎯 Résumé du flux

```
GÉRANT                    SYSTÈME                    CLIENT
  │                          │                          │
  │ 1. Configure créneaux    │                          │
  │─────────────────────────>│                          │
  │                          │                          │
  │                          │<─────────────────────────│
  │                          │ 2. Choisit plats         │
  │                          │                          │
  │                          │<─────────────────────────│
  │                          │ 3. Sélectionne créneau   │
  │                          │                          │
  │                          │ 4. Crée commande         │
  │                          │─────────────────────────>│
  │                          │    Notification ✅       │
  │                          │                          │
  │<─────────────────────────│                          │
  │ 5. Voit commande         │                          │
  │                          │                          │
  │ 6. Change statut         │                          │
  │─────────────────────────>│                          │
  │                          │ 7. Envoie notification   │
  │                          │─────────────────────────>│
  │                          │    Notification 🍳       │
  │                          │                          │
  │ 8. Commande prête        │                          │
  │─────────────────────────>│                          │
  │                          │ 9. Envoie notification   │
  │                          │─────────────────────────>│
  │                          │    Notification ✅       │
  │                          │                          │
  │<─────────────────────────│─────────────────────────│
  │ 10. Client retire        │                          │
  │                          │                          │
```

---

**Ce système transforme un restaurant universitaire classique en un service moderne de click & collect !** 🚀
