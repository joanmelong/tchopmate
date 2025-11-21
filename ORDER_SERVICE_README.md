# 📦 Service de Commande avec QR Code - TchopMate

## 🚀 Vue d'ensemble

Ce système implémente une architecture complète pour la gestion des commandes avec génération automatique de QR codes lors de la confirmation. Il suit les principes de Clean Architecture pour assurer une séparation claire des responsabilités.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     PRÉSENTATION                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐  │
│  │  OrderConfirm.  │  │  useOrderService│  │  ExamplePage │  │
│  │     tsx         │  │     .ts         │  │     .tsx     │  │
│  └─────────────────┘  └─────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                     SERVICES                                │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │  OrderService   │  │ QRCodeGenerator │                   │
│  │     .ts         │  │     .ts         │                   │
│  └─────────────────┘  └─────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                    CORE (MÉTIER)                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐  │
│  │   Order.ts      │  │CreateOrderUse   │  │GenerateQRUse │  │
│  │   (Entity)      │  │   Case.ts       │  │   Case.ts    │  │
│  └─────────────────┘  └─────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                    DATA (INFRASTRUCTURE)                    │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │SupabaseOrder    │  │   OrderMapper   │                   │
│  │Repository.ts    │  │     .ts         │                   │
│  └─────────────────┘  └─────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Fonctionnalités

### ✅ Gestion des Commandes
- ✅ Création de commande avec validation métier
- ✅ Calcul automatique du montant total
- ✅ Gestion des statuts (EN_ATTENTE, EN_PREPARATION, PRETE, RETIREE, ANNULEE)
- ✅ Validation des plats et quantités

### ✅ Génération de QR Code
- ✅ Génération automatique lors de la confirmation
- ✅ QR Code contenant les données essentielles de la commande
- ✅ Format PNG en base64 pour affichage direct
- ✅ Correction d'erreur niveau M pour la fiabilité

### ✅ Interface Utilisateur
- ✅ Composant de confirmation avec aperçu de la commande
- ✅ Modal d'affichage du QR code
- ✅ Gestion des états de chargement et d'erreur
- ✅ Interface responsive

## 📁 Structure des Fichiers

```
src/
├── services/
│   └── OrderService.ts              # Service principal de commande
├── hooks/
│   └── useOrderService.ts           # Hook React pour UI
├── components/
│   └── OrderConfirmation.tsx        # Composant de confirmation
├── data/
│   └── repositories/
│       └── SupabaseOrderRepository.ts  # Implémentation Supabase
├── core/
│   ├── entities/
│   │   └── Order.ts                 # Entité métier Order
│   ├── use-cases/
│   │   ├── order/
│   │   │   └── CreateOrderUseCase.ts
│   │   └── qr-code/
│   │       └── GenerateOrderQRCodeUseCase.ts
│   └── interfaces/
│       └── IOrderRepository.ts      # Contrat du repository
└── app/
    └── example-order/
        └── page.tsx                 # Page d'exemple
```

## 🔧 Installation et Configuration

### 1. Dépendances

```bash
npm install qrcode @types/qrcode
```

### 2. Variables d'Environnement

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Base de Données (Supabase)

Créez les tables suivantes :

```sql
-- Table des commandes
CREATE TABLE commandes (
  id SERIAL PRIMARY KEY,
  etudiant_id INTEGER NOT NULL,
  restaurant_id TEXT NOT NULL,
  statut TEXT NOT NULL DEFAULT 'en_attente',
  montant_total DECIMAL(10,2) NOT NULL,
  qr_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Table des lignes de commande
CREATE TABLE lignes_commande (
  id SERIAL PRIMARY KEY,
  commande_id INTEGER REFERENCES commandes(id) ON DELETE CASCADE,
  plat_id INTEGER NOT NULL,
  quantite INTEGER NOT NULL,
  prix_unitaire DECIMAL(10,2) NOT NULL
);

-- Index pour les performances
CREATE INDEX idx_commandes_etudiant ON commandes(etudiant_id);
CREATE INDEX idx_commandes_restaurant ON commandes(restaurant_id);
CREATE INDEX idx_lignes_commande_commande ON lignes_commande(commande_id);
```

## 🎮 Utilisation

### 1. Initialisation des Services

```typescript
import { OrderService } from '@/services/OrderService';
import { SupabaseOrderRepository } from '@/data/repositories/SupabaseOrderRepository';

// Initialiser les repositories
const orderRepository = new SupabaseOrderRepository();
const platRepository = new YourPlatRepository(); // À implémenter

// Créer le service
const orderService = new OrderService(orderRepository, platRepository);
```

### 2. Utilisation dans un Composant

```typescript
import { useOrderService } from '@/hooks/useOrderService';
import { OrderConfirmation } from '@/components/OrderConfirmation';

function CartPage() {
  const orderService = new OrderService(/* ... */);
  
  const cartItems = [
    {
      platId: 1,
      platNom: 'Ndolé aux crevettes',
      quantite: 2,
      prixUnitaire: 2500,
      image: '/images/ndole.jpg'
    }
  ];

  return (
    <OrderConfirmation
      orderItems={cartItems}
      restaurantId="restaurant-123"
      restaurantName="Restaurant Saint Jean"
      student={currentUser}
      orderService={orderService}
      onOrderConfirmed={(order, qrCode) => {
        console.log('Commande confirmée!', order.id);
        // Rediriger ou afficher une notification
      }}
    />
  );
}
```

### 3. Gestion des Commandes (Côté Restaurant)

```typescript
function RestaurantDashboard() {
  const { 
    orders, 
    updateOrderStatus, 
    getOrdersByRestaurantId 
  } = useOrderService(orderService);

  useEffect(() => {
    getOrdersByRestaurantId(restaurantId);
  }, []);

  const handleConfirmOrder = async (orderId: number) => {
    await updateOrderStatus(orderId, OrderStatus.EN_PREPARATION);
  };

  const handleMarkReady = async (orderId: number) => {
    await updateOrderStatus(orderId, OrderStatus.PRETE);
  };

  return (
    <div>
      {orders.map(order => (
        <OrderCard 
          key={order.id}
          order={order}
          onConfirm={() => handleConfirmOrder(order.id)}
          onMarkReady={() => handleMarkReady(order.id)}
        />
      ))}
    </div>
  );
}
```

## 🎨 Données du QR Code

Le QR code généré contient les informations suivantes au format JSON :

```json
{
  "orderId": 123,
  "restaurantId": "restaurant-uuid-123",
  "studentId": 456,
  "totalPrice": 5400,
  "status": "en_attente",
  "timestamp": "2025-11-14T10:30:00.000Z"
}
```

## 🔒 Validation Métier

### Règles de Création de Commande
- ✅ Seuls les étudiants peuvent passer des commandes
- ✅ Une commande doit contenir au moins un plat
- ✅ Tous les plats doivent exister et être disponibles
- ✅ Les quantités doivent être supérieures à 0
- ✅ Le montant total doit correspondre à la somme des items

### Règles de Changement de Statut
- ✅ Seules les commandes en attente peuvent être confirmées
- ✅ Seules les commandes en préparation peuvent être marquées prêtes
- ✅ Seules les commandes prêtes peuvent être retirées
- ✅ Seules les commandes en attente ou en préparation peuvent être annulées

## 🧪 Tests

Pour tester le système, utilisez la page d'exemple :

```bash
npm run dev
# Naviguez vers http://localhost:3000/example-order
```

## 🔧 Personnalisation

### Modifier le QR Code

Pour personnaliser l'apparence du QR code :

```typescript
// Dans QRCodeGenerator.generate()
const options = {
  errorCorrectionLevel: 'M' as const,
  type: 'image/png' as const,
  quality: 0.92,
  margin: 1,
  width: 256,
  color: {
    dark: '#FF6B35',    // Couleur orange pour TchopMate
    light: '#FFFFFF'    // Fond blanc
  }
};
```

### Ajouter des Notifications

```typescript
const handleOrderConfirmed = (order: Order, qrCode: string) => {
  // Notification push
  if ('Notification' in window) {
    new Notification('Commande confirmée!', {
      body: `Votre commande #${order.id} est en cours de préparation`,
      icon: '/icon-order.png'
    });
  }
  
  // Notification toast
  toast.success('Commande confirmée avec succès!');
};
```

## 🚨 Gestion d'Erreurs

Le système gère automatiquement :
- ❌ Plats indisponibles
- ❌ Données de commande invalides  
- ❌ Erreurs de réseau
- ❌ Erreurs de génération de QR code
- ❌ Violations des règles métier

## 📱 Compatibilité

- ✅ React 18+
- ✅ Next.js 13+
- ✅ TypeScript 5+
- ✅ Supabase
- ✅ Mobile responsive

## 🤝 Contribution

Pour contribuer au système :

1. Respectez l'architecture Clean Architecture
2. Écrivez des tests pour les nouvelles fonctionnalités
3. Utilisez TypeScript strict
4. Documentez les nouvelles interfaces

## 📞 Support

Pour toute question ou problème :
- Consultez les logs de développement dans la console
- Vérifiez les variables d'environnement
- Assurez-vous que les tables Supabase sont créées
- Testez avec la page d'exemple `/example-order`