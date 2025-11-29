# 🚀 Guide d'Intégration Rapide - Système de Créneaux

## ⚡ 3 étapes pour activer le système

### Étape 1: Exécuter le SQL (2 min)

1. Ouvrir Supabase Dashboard
2. Aller dans **SQL Editor**
3. Copier-coller le contenu de `create_creneaux_notifications.sql`
4. Cliquer sur **Run**

✅ Vérification:
```sql
-- Vérifier que les tables existent
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('creneaux', 'notifications');
```

---

### Étape 2: Ajouter le badge de notifications (5 min)

Trouver votre composant de navigation principal et ajouter:

```tsx
// Exemple: src/components/layout/Header.tsx ou Navigation.tsx
import { NotificationBadge } from "@/components/notifications/NotificationBadge"

export function Header() {
  return (
    <header>
      {/* ... votre navigation existante ... */}
      
      {/* Ajouter le badge ici */}
      <NotificationBadge />
      
      {/* ... reste de la navigation ... */}
    </header>
  )
}
```

---

### Étape 3: Intégrer dans le paiement (10 min)

Modifier `src/app/commande/payment/page.tsx`:

```tsx
import { CreneauSelector } from "@/components/notifications/CreneauSelector"
import { useState } from "react"

export default function PaymentPage() {
  // Ajouter ces states
  const [selectedCreneau, setSelectedCreneau] = useState<string | null>(null)
  const [creneauDetails, setCreneauDetails] = useState<{
    debut: string
    fin: string
  } | null>(null)

  // Dans le JSX, AVANT le bouton de paiement
  return (
    <div>
      {/* ... formulaire existant ... */}
      
      {/* AJOUTER ICI */}
      <div className="mb-6">
        <CreneauSelector
          restaurantId={restaurantId}
          selectedCreneau={selectedCreneau}
          onSelect={(id, debut, fin) => {
            setSelectedCreneau(id)
            setCreneauDetails({ debut, fin })
          }}
        />
      </div>
      
      {/* ... bouton de paiement ... */}
    </div>
  )
}

// Modifier la fonction de création de commande
const handlePayment = async () => {
  // Calculer la date du créneau
  const today = new Date().toISOString().split('T')[0]
  const creneauRetrait = creneauDetails 
    ? new Date(`${today}T${creneauDetails.debut}`)
    : null

  // Créer la commande avec le créneau
  const { data, error } = await supabase
    .from('commande')
    .insert({
      // ... vos champs existants ...
      creneau_retrait: creneauRetrait  // AJOUTER CETTE LIGNE
    })
    .select()
    .single()

  // ... reste du code ...
}
```

---

## 🎯 Bonus: Ajouter le lien dans le menu gérant

Dans votre menu de navigation gérant:

```tsx
// Exemple: src/components/restaurant/GerantMenu.tsx
import { Clock } from "lucide-react"

<Link href={`/resto/${restaurantId}/creneaux`}>
  <Clock className="h-5 w-5" />
  Gérer les créneaux
</Link>
```

---

## ✅ Checklist de vérification

- [ ] SQL exécuté sans erreur
- [ ] Tables `creneaux` et `notifications` créées
- [ ] Badge de notifications visible dans la navigation
- [ ] Compteur de notifications fonctionne
- [ ] Page `/notifications` accessible
- [ ] Sélecteur de créneaux visible au paiement
- [ ] Créneaux enregistrés dans les commandes
- [ ] Page `/resto/[id]/creneaux` accessible pour les gérants
- [ ] Notifications créées automatiquement lors des changements de statut

---

## 🧪 Test rapide

### 1. Créer des créneaux (Gérant)
```
1. Aller sur /resto/[votre-id]/creneaux
2. Créer 3 créneaux:
   - 12:00 - 12:30 (capacité: 5)
   - 12:30 - 13:00 (capacité: 5)
   - 13:00 - 13:30 (capacité: 5)
```

### 2. Passer une commande (Client)
```
1. Choisir des plats
2. Aller au paiement
3. Sélectionner un créneau
4. Valider la commande
5. Vérifier que le créneau est enregistré
```

### 3. Tester les notifications (Client)
```
1. En tant que gérant, changer le statut de la commande
2. Vérifier que le badge de notifications s'incrémente
3. Cliquer sur le badge
4. Voir la notification
5. Marquer comme lu
```

---

## 🐛 Dépannage

### Le badge ne s'affiche pas
- Vérifier que l'utilisateur est connecté
- Vérifier les politiques RLS dans Supabase
- Ouvrir la console: `useNotifications` doit retourner un nombre

### Les créneaux ne s'affichent pas
- Vérifier que des créneaux existent pour ce restaurant
- Vérifier que les créneaux sont actifs (`actif = true`)
- Vérifier les politiques RLS

### Les notifications ne sont pas créées
- Vérifier que le trigger est actif:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'trigger_notify_commande_status';
```
- Vérifier les logs Supabase

---

## 📞 Support

Si vous rencontrez des problèmes:
1. Vérifier les logs Supabase (Database > Logs)
2. Vérifier la console du navigateur
3. Consulter `IMPLEMENTATION_CRENEAUX.md` pour plus de détails

---

**Temps total d'intégration: ~20 minutes**
