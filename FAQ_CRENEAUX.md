# ❓ FAQ - Système de Créneaux et Notifications

## Questions fréquentes

---

### 📅 Gestion des dates

#### Q: Le client peut-il commander pour demain ?
**R:** Non, le système est conçu pour des commandes **le jour même uniquement** (click & collect). C'est un choix de design pour simplifier la gestion du restaurant universitaire.

#### Q: Que se passe-t-il si tous les créneaux sont passés ?
**R:** Le client voit un message "Aucun créneau disponible aujourd'hui" et est invité à revenir demain.

#### Q: Peut-on ajouter la réservation pour le lendemain ?
**R:** Oui, c'est possible en modifiant le `CreneauSelector` pour ajouter un sélecteur de date. Mais ce n'est pas implémenté par défaut.

---

### ⏰ Créneaux horaires

#### Q: Quelle est la durée minimale d'un créneau ?
**R:** Il n'y a pas de minimum technique, mais 30 minutes est recommandé pour une bonne organisation.

#### Q: Peut-on avoir des créneaux qui se chevauchent ?
**R:** Oui, techniquement c'est possible. Par exemple: 12:00-12:45 et 12:30-13:15. Mais ce n'est pas recommandé pour éviter la confusion.

#### Q: Combien de temps avant le créneau le client doit-il commander ?
**R:** Minimum 15 minutes. C'est configurable dans le code (`currentMinutes + 15`).

#### Q: Les créneaux sont-ils automatiquement désactivés le weekend ?
**R:** Non, c'est géré par le champ `jours_semaine`. Le gérant choisit les jours actifs (1=Lundi, 7=Dimanche).

---

### 🔔 Notifications

#### Q: Les notifications sont-elles en temps réel ?
**R:** Presque. Le badge se rafraîchit toutes les 30 secondes. Pour du vrai temps réel, il faudrait implémenter Supabase Realtime.

#### Q: Le client reçoit-il des emails ?
**R:** Non, pas dans cette version. Seules les notifications in-app sont implémentées. Les emails peuvent être ajoutés via un service comme SendGrid.

#### Q: Peut-on désactiver certains types de notifications ?
**R:** Pas dans cette version, mais c'est facile à ajouter avec une table `user_notification_preferences`.

#### Q: Les notifications sont-elles supprimées automatiquement ?
**R:** Non, elles restent dans la base de données. Vous pouvez ajouter un job CRON pour supprimer les notifications de plus de 30 jours.

---

### 👨‍🍳 Gestion restaurant

#### Q: Un gérant peut-il gérer plusieurs restaurants ?
**R:** Oui, via la table `liaison_gerant_restaurant`. Chaque restaurant a ses propres créneaux.

#### Q: Peut-on copier les créneaux d'un restaurant à un autre ?
**R:** Pas dans l'interface actuelle, mais c'est possible via SQL:
```sql
INSERT INTO creneaux (restaurant_id, heure_debut, heure_fin, capacite_max, jours_semaine)
SELECT 'nouveau-restaurant-id', heure_debut, heure_fin, capacite_max, jours_semaine
FROM creneaux
WHERE restaurant_id = 'ancien-restaurant-id';
```

#### Q: Comment voir les statistiques des créneaux ?
**R:** Pas implémenté, mais vous pouvez créer une page analytics avec des requêtes SQL:
```sql
SELECT 
  DATE_TRUNC('hour', creneau_retrait) as creneau,
  COUNT(*) as nb_commandes,
  SUM(montant_total) as total
FROM commande
WHERE restaurant_id = 'xxx'
GROUP BY creneau
ORDER BY creneau;
```

---

### 🔒 Sécurité et RLS

#### Q: Un client peut-il voir les notifications d'un autre client ?
**R:** Non, les politiques RLS garantissent que chaque utilisateur ne voit que ses propres notifications.

#### Q: Un gérant peut-il modifier les créneaux d'un autre restaurant ?
**R:** Non, les politiques RLS vérifient que le gérant est bien lié au restaurant.

#### Q: Qui peut créer des notifications ?
**R:** Seul le service role (via les triggers) peut créer des notifications. Les utilisateurs ne peuvent que les lire et les marquer comme lues.

---

### 🐛 Problèmes courants

#### Q: Le badge de notifications ne s'affiche pas
**R:** Vérifiez:
1. L'utilisateur est connecté (`auth.uid()` retourne un ID)
2. Les politiques RLS sont actives
3. La table `notifications` existe
4. Le hook `useNotifications` ne retourne pas d'erreur (console)

#### Q: Les créneaux ne s'affichent pas
**R:** Vérifiez:
1. Des créneaux existent pour ce restaurant
2. Les créneaux sont actifs (`actif = true`)
3. Le jour actuel est dans `jours_semaine`
4. Les créneaux ne sont pas tous passés

#### Q: Les notifications ne sont pas créées automatiquement
**R:** Vérifiez:
1. Le trigger `trigger_notify_commande_status` existe
2. La fonction `notify_commande_status_change()` existe
3. Les logs Supabase pour voir les erreurs
4. Le statut de la commande a bien changé

#### Q: Erreur "relation creneaux does not exist"
**R:** Le script SQL n'a pas été exécuté. Allez dans Supabase SQL Editor et exécutez `create_creneaux_notifications.sql`.

---

### 📊 Performance

#### Q: Combien de créneaux peut-on créer ?
**R:** Techniquement illimité, mais pour la performance, restez raisonnable (< 50 créneaux par restaurant).

#### Q: Le système peut-il gérer 1000 commandes par jour ?
**R:** Oui, sans problème. Supabase (PostgreSQL) peut gérer bien plus.

#### Q: Faut-il nettoyer les anciennes notifications ?
**R:** Recommandé après 30 jours. Créez un job CRON:
```sql
DELETE FROM notifications 
WHERE created_at < NOW() - INTERVAL '30 days';
```

---

### 🎨 Personnalisation

#### Q: Peut-on changer les couleurs ?
**R:** Oui, modifiez les classes Tailwind dans les composants. Par exemple, remplacez `bg-orange-500` par `bg-blue-500`.

#### Q: Peut-on changer le délai de rafraîchissement des notifications ?
**R:** Oui, dans `use-notifications.ts`, changez `30000` (30s) par la valeur souhaitée en millisecondes.

#### Q: Peut-on ajouter des sons aux notifications ?
**R:** Oui, utilisez l'API Web Audio:
```typescript
const audio = new Audio('/notification-sound.mp3')
audio.play()
```

---

### 🚀 Évolutions futures

#### Q: Peut-on ajouter des notifications push ?
**R:** Oui, avec l'API Web Push. Nécessite:
1. Service Worker
2. Demande de permission utilisateur
3. Backend pour envoyer les push

#### Q: Peut-on intégrer avec Google Calendar ?
**R:** Oui, via l'API Google Calendar pour ajouter le créneau au calendrier du client.

#### Q: Peut-on ajouter un système de file d'attente ?
**R:** Oui, en ajoutant un champ `position_file` et en mettant à jour automatiquement quand une commande est retirée.

---

### 💡 Bonnes pratiques

#### Q: Combien de créneaux recommandez-vous ?
**R:** 
- Midi: 5-6 créneaux de 30 min (11:30-14:00)
- Soir: 3-4 créneaux de 30 min (18:00-19:30)

#### Q: Quelle capacité par créneau ?
**R:** Dépend de votre cuisine:
- Petite cuisine: 5-8 commandes
- Moyenne cuisine: 10-15 commandes
- Grande cuisine: 20+ commandes

#### Q: Faut-il bloquer les commandes sans créneau ?
**R:** Recommandé pour forcer l'organisation. Mais vous pouvez rendre le créneau optionnel en modifiant le code.

---

### 🔧 Maintenance

#### Q: Comment sauvegarder les données ?
**R:** Supabase fait des backups automatiques. Vous pouvez aussi exporter:
```sql
COPY (SELECT * FROM creneaux) TO '/tmp/creneaux_backup.csv' CSV HEADER;
COPY (SELECT * FROM notifications) TO '/tmp/notifications_backup.csv' CSV HEADER;
```

#### Q: Comment restaurer après une erreur ?
**R:** Si vous avez supprimé des données par erreur:
1. Allez dans Supabase Dashboard > Database > Backups
2. Restaurez le backup le plus récent
3. Ou utilisez les logs pour recréer les données

---

### 📱 Mobile

#### Q: L'interface est-elle responsive ?
**R:** Oui, tous les composants utilisent Tailwind avec des breakpoints (sm:, md:, lg:).

#### Q: Peut-on créer une app mobile native ?
**R:** Oui, avec React Native et la même logique. Supabase fonctionne aussi sur mobile.

---

### 🌍 Internationalisation

#### Q: Peut-on traduire en plusieurs langues ?
**R:** Oui, utilisez `next-intl` ou `react-i18next`. Les textes sont déjà en français, facile à extraire.

#### Q: Les dates sont-elles localisées ?
**R:** Oui, on utilise `toLocaleDateString('fr-FR')` et `toLocaleString('fr-FR')`.

---

### 💰 Coûts

#### Q: Quel est le coût Supabase ?
**R:** 
- Gratuit jusqu'à 500 MB de base de données
- Pro: 25$/mois pour plus de ressources
- Les notifications et créneaux prennent très peu d'espace

#### Q: Faut-il payer pour les notifications ?
**R:** Non, les notifications in-app sont gratuites. Les push notifications et emails peuvent avoir un coût selon le service.

---

## 📞 Support

Si votre question n'est pas ici:
1. Consultez `IMPLEMENTATION_CRENEAUX.md`
2. Consultez `EXEMPLE_WORKFLOW_CRENEAUX.md`
3. Vérifiez les logs Supabase
4. Ouvrez une issue sur GitHub

---

**Dernière mise à jour:** 28 novembre 2025
