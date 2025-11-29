# 📋 Implémentation du Système de Créneaux et Notifications

## ✅ Étape 3 : Système de Notifications - TERMINÉ

### 🎯 Objectif
Implémenter un système complet de créneaux horaires et de notifications pour améliorer l'expérience client et l'organisation du restaurant.

**Principe:** Le client commande et choisit un créneau de retrait **pour le jour même** (click & collect). Il ne peut pas commander pour demain ou plus tard.

---

## 📦 Ce qui a été créé

### 1. Base de données (SQL)
**Fichier:** `create_creneaux_notifications.sql`

✅ **Tables créées:**
- `creneaux` - Gestion des créneaux horaires par restaurant
- `notifications` - Système de notifications pour les clients

✅ **Fonctionnalités:**
- Politiques RLS pour la sécurité
- Triggers automatiques pour créer des notifications lors des changements de statut
- Fonction `create_notification()` pour créer des notifications
- Contraintes de validation (heure_fin > heure_debut)

✅ **Types de notifications:**
- `commande_en_preparation` - Commande en cours de préparation
- `commande_prete` - Commande prête à retirer
- `commande_annulee` - Commande annulée
- `creneau_depasse` - Créneau de retrait dépassé

---

### 2. Composants Frontend

#### 📱 NotificationBadge
**Fichier:** `src/components/notifications/NotificationBadge.tsx`

Badge cliquable avec compteur de notifications non lues à ajouter dans la navigation.

**Fonctionnalités:**
- Affiche le nombre de notifications non lues
- Badge rouge avec le compteur
- Redirection vers `/notifications`
- Rafraîchissement automatique toutes les 30s

#### 🕐 CreneauSelector
**Fichier:** `src/components/notifications/CreneauSelector.tsx`

Sélecteur de créneaux pour les clients lors de la commande.

**Fonctionnalités:**
- Affiche les créneaux disponibles
- Indique le nombre de places restantes
- Bloque les créneaux complets
- Code couleur selon la disponibilité (vert/orange/rouge)
- Mise à jour en temps réel

---

### 3. Pages

#### 🔔 Page Notifications Client
**Fichier:** `src/app/notifications/page.tsx`

Page complète de gestion des notifications pour les clients.

**Fonctionnalités:**
- Liste toutes les notifications
- Marquer comme lu (individuellement ou tout)
- Icônes et couleurs selon le type
- Tri par date (plus récent en premier)
- Badge "non lu" sur les nouvelles notifications

#### ⚙️ Page Gestion Créneaux (Gérant)
**Fichier:** `src/app/resto/[id]/creneaux/page.tsx`

Interface complète pour que les gérants gèrent leurs créneaux.

**Fonctionnalités:**
- Créer/Modifier/Supprimer des créneaux
- Définir les horaires (début/fin)
- Définir la capacité maximale
- Choisir les jours de la semaine
- Activer/Désactiver des créneaux
- Vue en grille responsive

---

## 🚀 Comment utiliser

### Pour les développeurs

#### 1. Exécuter le script SQL
```bash
# Dans Supabase SQL Editor
# Copier-coller le contenu de create_creneaux_notifications.sql
# Exécuter le script
```

#### 2. Ajouter le badge de notifications dans la navigation
```tsx
// Dans votre composant de navigation (Header/Navbar)
import { NotificationBadge } from "@/components/notifications/NotificationBadge"

// Ajouter dans le JSX
<NotificationBadge />
```

#### 3. Intégrer le sélecteur de créneaux dans le paiement
```tsx
// Dans src/app/commande/payment/page.tsx
import { CreneauSelector } from "@/components/notifications/CreneauSelector"

const [selectedCreneau, setSelectedCreneau] = useState<string | null>(null)
const [creneauDetails, setCreneauDetails] = useState<{debut: string, fin: string} | null>(null)

// Dans le formulaire de paiement
<CreneauSelector
  restaurantId={restaurantId}
  selectedCreneau={selectedCreneau}
  onSelect={(id, debut, fin) => {
    setSelectedCreneau(id)
    setCreneauDetails({ debut, fin })
  }}
/>

// Lors de la création de la commande
const creneauRetrait = creneauDetails 
  ? new Date(`${today}T${creneauDetails.debut}`)
  : null

await supabase.from('commande').insert({
  // ... autres champs
  creneau_retrait: creneauRetrait
})
```

---

### Pour les gérants

#### 1. Créer des créneaux
1. Aller sur `/resto/[id]/creneaux`
2. Cliquer sur "Nouveau créneau"
3. Définir:
   - Heure de début et fin
   - Capacité maximale
   - Jours de la semaine
   - Actif/Inactif
4. Sauvegarder

#### 2. Exemple de créneaux typiques
```
Midi:
- 11:30 - 12:00 (10 commandes)
- 12:00 - 12:30 (10 commandes)
- 12:30 - 13:00 (10 commandes)
- 13:00 - 13:30 (10 commandes)

Soir:
- 18:00 - 18:30 (8 commandes)
- 18:30 - 19:00 (8 commandes)
- 19:00 - 19:30 (8 commandes)
```

---

### Pour les clients

#### 1. Passer une commande avec créneau
1. Choisir ses plats
2. Aller au paiement
3. **Sélectionner un créneau horaire pour AUJOURD'HUI**
   - Seuls les créneaux futurs sont affichés (minimum 15 min d'avance)
   - Les créneaux passés ne sont pas visibles
   - Les créneaux complets sont grisés
4. Voir le nombre de places restantes
5. Confirmer la commande

#### 2. Recevoir des notifications
Les clients reçoivent automatiquement des notifications:
- ✅ Commande confirmée
- 🍳 Commande en préparation
- 🔔 Commande prête à retirer
- ⏰ Créneau de retrait dépassé
- ❌ Commande annulée

#### 3. Consulter les notifications
1. Cliquer sur l'icône 🔔 (badge avec compteur)
2. Voir toutes les notifications
3. Marquer comme lu
4. Cliquer sur "Tout marquer comme lu"

---

## 🔧 Prochaines étapes

### À faire pour finaliser

1. **Intégrer NotificationBadge dans la navigation**
   - Trouver le composant Header/Navbar
   - Ajouter le badge à côté du menu utilisateur

2. **Intégrer CreneauSelector dans le paiement**
   - Modifier `src/app/commande/payment/page.tsx`
   - Ajouter la sélection de créneau avant la validation
   - Enregistrer le créneau dans la commande

3. **Ajouter un lien vers la gestion des créneaux**
   - Dans le menu gérant
   - Ajouter un bouton "Gérer les créneaux"

4. **Tester le système complet**
   - Créer des créneaux
   - Passer une commande avec créneau
   - Changer le statut de la commande
   - Vérifier les notifications

---

## 📊 Workflow complet

```
CLIENT                          SYSTÈME                         GÉRANT
  |                                |                               |
  | 1. Choisit plats              |                               |
  |------------------------------>|                               |
  |                                |                               |
  | 2. Sélectionne créneau        |                               |
  |------------------------------>|                               |
  |                                |                               |
  | 3. Passe commande             |                               |
  |------------------------------>|                               |
  |                                | 4. Crée notification         |
  |<------------------------------|    "Commande confirmée"       |
  |                                |                               |
  |                                |<------------------------------|
  |                                | 5. Change statut              |
  |                                |    "EN_PREPARATION"           |
  |                                |                               |
  | 6. Notification               |                               |
  |    "En préparation"           |                               |
  |<------------------------------|                               |
  |                                |                               |
  |                                |<------------------------------|
  |                                | 7. Change statut "PRETE"     |
  |                                |                               |
  | 8. Notification               |                               |
  |    "Commande prête !"         |                               |
  |<------------------------------|                               |
  |                                |                               |
  | 9. Vient retirer              |                               |
  |------------------------------>|------------------------------>|
  |                                |                               |
```

---

## 🎨 Captures d'écran (à venir)

- [ ] Badge de notifications dans la navigation
- [ ] Page de notifications
- [ ] Sélecteur de créneaux
- [ ] Page de gestion des créneaux (gérant)
- [ ] Vue des commandes groupées par créneau

---

## 🐛 Problèmes connus

Aucun pour le moment.

---

## 📝 Notes techniques

### Sécurité (RLS)
- Les clients ne voient que leurs propres notifications
- Les gérants ne peuvent gérer que les créneaux de leurs restaurants
- Les créneaux inactifs ne sont pas visibles pour les clients

### Performance
- Index sur `user_id`, `lue`, `created_at` pour les notifications
- Index sur `restaurant_id`, `actif` pour les créneaux
- Rafraîchissement automatique toutes les 30s (configurable)

### Extensibilité
- Facile d'ajouter de nouveaux types de notifications
- Possibilité d'ajouter des notifications push (à venir)
- Possibilité d'ajouter des emails (à venir)

---

## 📚 Ressources

- [Documentation Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Documentation Supabase Triggers](https://supabase.com/docs/guides/database/postgres/triggers)
- [Next.js App Router](https://nextjs.org/docs/app)

---

**Dernière mise à jour:** 28 novembre 2025
**Statut:** ✅ Implémentation terminée - En attente d'intégration
