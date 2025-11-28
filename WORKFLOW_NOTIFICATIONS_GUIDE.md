# 🔔 Guide du Workflow de Notifications TchopMate

## 📋 Vue d'ensemble du workflow

Ce document décrit le workflow complet des notifications dans l'application TchopMate, de la commande du client jusqu'à la récupération.

## 🎯 Workflow étape par étape

### 1. **Client passe une commande**
- Le client sélectionne ses plats dans le menu
- Il choisit un créneau horaire de retrait disponible
- Il confirme sa commande

**Actions automatiques :**
- ✅ Commande créée avec statut `EN_ATTENTE`
- 🔔 **Notification immédiate** : "Commande confirmée" avec détails du créneau

### 2. **Page Commandes du client**
- Affiche **uniquement** les commandes avec statut `EN_ATTENTE`
- Montre les informations de créneau de retrait
- Badge informatif expliquant le système

### 3. **Gérant gère les créneaux**
- Interface dédiée `/resto/[id]/creneaux` pour définir les créneaux
- Configuration des horaires, capacités et jours de la semaine
- **Persistance automatique** : si aucun créneau n'est défini pour le jour suivant, les créneaux de la veille sont dupliqués

### 4. **Gérant change le statut de la commande**

#### Statut `EN_PREPARATION`
- 🔔 **Notification** : "Commande en préparation" + info créneau

#### Statut `PRETE`
- 🔔 **Notification** : "Commande prête !" + rappel du créneau
- La commande disparaît de la page "Mes Commandes" du client

### 5. **Gestion des créneaux dépassés**
- **Vérification automatique** toutes les heures
- Si créneau dépassé de **+1h** :
  - 🔔 **Notification** : "Créneau de retrait dépassé"
  - Message : "Votre commande sera disponible au prochain créneau"

## 🛠️ Architecture technique

### Base de données

```sql
-- Table notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  commande_id UUID REFERENCES commande(id_commande),
  type VARCHAR(50), -- Types de notifications
  titre VARCHAR(255),
  message TEXT,
  lue BOOLEAN DEFAULT false,
  created_at TIMESTAMP
);

-- Table creneaux
CREATE TABLE creneaux (
  id UUID PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurant(id_restaurant),
  heure_debut TIME,
  heure_fin TIME,
  capacite_max INTEGER DEFAULT 10,
  actif BOOLEAN DEFAULT true,
  jours_semaine INTEGER[] -- [1,2,3,4,5] pour Lun-Ven
);
```

### Types de notifications

| Type | Description | Déclencheur |
|------|-------------|-------------|
| `commande_confirmee` | Commande envoyée avec succès | Création de commande |
| `commande_en_preparation` | Commande en cours de préparation | Statut → `EN_PREPARATION` |
| `commande_prete` | Commande prête pour retrait | Statut → `PRETE` |
| `commande_annulee` | Commande annulée | Statut → `ANNULEE` |
| `creneau_depasse` | Créneau de retrait dépassé | Vérification automatique |

### Triggers automatiques

```sql
-- Trigger sur changement de statut
CREATE TRIGGER trigger_notify_commande_status
  AFTER UPDATE OF statut ON commande
  FOR EACH ROW
  WHEN (OLD.statut IS DISTINCT FROM NEW.statut)
  EXECUTE FUNCTION notify_commande_status_change();
```

## 🔄 Tâches automatisées

### Vérification des créneaux dépassés
- **Fréquence** : Toutes les heures
- **Endpoint** : `POST /api/notifications/check-creneaux`
- **Fonction SQL** : `check_creneaux_depasses()`

### Duplication des créneaux
- **Fréquence** : Chaque matin à 6h
- **Endpoint** : `POST /api/creneaux/duplicate-daily`
- **Fonction SQL** : `duplicate_creneaux_if_needed()`

## 🎨 Interface utilisateur

### Composants principaux

1. **NotificationBell** (`/components/notification-bell.tsx`)
   - Badge avec compteur de notifications non lues
   - Panel latéral avec aperçu des notifications
   - Lien vers la page complète

2. **Page Notifications** (`/app/notifications/page.tsx`)
   - Liste complète des notifications
   - Marquer comme lu (individuel/global)
   - Icônes et couleurs par type

3. **Page Commandes** (`/app/commandes/page.tsx`)
   - Filtrée sur statut `EN_ATTENTE` uniquement
   - Affichage des créneaux de retrait
   - Badge informatif sur le fonctionnement

### Hook de notifications

```typescript
// Hook principal
const { unreadCount, loading, refresh } = useNotifications()

// Actualisation automatique toutes les 30 secondes
// Filtrage par utilisateur connecté
```

## 📱 Expérience utilisateur

### Pour le client
1. **Commande** → Notification immédiate de confirmation
2. **Attente** → Voir sa commande dans "Mes Commandes"
3. **Préparation** → Notification de début de préparation
4. **Prêt** → Notification + commande disparaît de la liste
5. **Retard** → Notification si créneau dépassé

### Pour le gérant
1. **Configuration** → Définir les créneaux via interface dédiée
2. **Gestion** → Changer les statuts des commandes
3. **Automatisation** → Créneaux dupliqués automatiquement

## 🚀 Déploiement et maintenance

### Scripts de déploiement
```sql
-- Exécuter le script principal
\i workflow_notifications_enhanced.sql

-- Vérifier l'installation
SELECT * FROM pg_proc WHERE proname LIKE '%creneau%';
```

### Monitoring
- Surveiller les logs des endpoints `/api/notifications/check-creneaux`
- Vérifier la duplication des créneaux chaque matin
- Monitorer le nombre de notifications non lues

### Configuration cron (optionnel)
```bash
# Vérification des créneaux dépassés (toutes les heures)
0 * * * * curl -X POST https://votre-app.com/api/notifications/check-creneaux

# Duplication des créneaux (chaque matin à 6h)
0 6 * * * curl -X POST https://votre-app.com/api/creneaux/duplicate-daily
```

## 🔧 Personnalisation

### Ajouter un nouveau type de notification
1. Modifier la fonction `notify_commande_status_change()`
2. Ajouter l'icône dans `getIcon()` des composants
3. Ajouter la couleur dans `getTypeColor()`

### Modifier les délais
- Créneau dépassé : Changer `INTERVAL '1 hour'` dans `check_creneaux_depasses()`
- Actualisation : Modifier `30000` ms dans `useNotifications`

## 📞 Support

En cas de problème :
1. Vérifier les logs Supabase
2. Tester les endpoints manuellement
3. Vérifier les politiques RLS
4. Contrôler les triggers SQL

---

**Version** : 1.0  
**Dernière mise à jour** : Novembre 2024