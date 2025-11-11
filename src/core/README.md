# 🎯 Core - Business Logic Layer

## Description

Le dossier **Core** contient la **logique métier pure** de l'application. Cette couche est **totalement indépendante** de tout framework, bibliothèque ou infrastructure.

## Principe Fondamental

> "Le métier ne doit dépendre de rien. Tout dépend du métier."

Cette couche définit **CE QUE** fait l'application, sans se soucier du **COMMENT**.

## Structure

```
core/
├── entities/          # Entités métier avec leurs règles
├── interfaces/        # Contrats (interfaces de repositories)
└── use-cases/         # Cas d'utilisation (business logic)
```

## 📁 Sous-dossiers

### `entities/`
Contient les **entités métier** avec leur logique business:
- `User.ts` - Utilisateur avec permissions et validation
- `Restaurant.ts` - Restaurant avec règles de gestion
- `Menu.ts` - Menu et Plat avec disponibilité
- `Order.ts` - Commande avec état et transitions

**Caractéristiques:**
- Aucune dépendance externe
- Validation métier incluse
- Méthodes métier pures (ex: `user.canManageRestaurant()`)

### `interfaces/`
Définit les **contrats** que les repositories doivent respecter:
- `IAuthRepository.ts` - Authentification
- `IRestaurantRepository.ts` - Gestion restaurants
- `IUserRepository.ts` - Gestion utilisateurs
- `IMenuRepository.ts` - Gestion menus/plats
- `IOrderRepository.ts` - Gestion commandes

**Principe:**
> Les use cases dépendent des interfaces, pas des implémentations.

### `use-cases/`
Contient les **cas d'utilisation** qui orchestrent la logique métier:
- `auth/` - Authentification et autorisation
- `restaurant/` - Opérations sur les restaurants
- `menu/` - Opérations sur les menus
- `order/` - Opérations sur les commandes

**Structure type:**
```typescript
export class LoginUseCase {
  constructor(private authRepository: IAuthRepository) {}
  
  async execute(credentials: AuthCredentials): Promise<User> {
    // Logique métier pure
  }
}
```

## 🎯 Règles d'Or

### ✅ AUTORISÉ dans Core:
- Logique métier pure
- Validation de données
- Règles business
- Calculs et transformations métier
- Dépendances entre entités core

### ❌ INTERDIT dans Core:
- `import` de React, Next.js, Supabase
- Accès direct à la base de données
- Appels HTTP/API
- Manipulation du DOM
- Dépendances vers `data/`, `lib/`, `app/`

## 📝 Tâches à Venir

### Entités à Créer
- [ ] `Payment` - Gestion des paiements
- [ ] `Notification` - Système de notifications
- [ ] `Review` - Avis et notes

### Use Cases à Créer
- [ ] `GetAllMenusUseCase` - Récupérer tous les menus
- [ ] `UpdatePlatAvailabilityUseCase` - Modifier disponibilité plat
- [ ] `CancelOrderUseCase` - Annuler une commande
- [ ] `GetOrderHistoryUseCase` - Historique des commandes
- [ ] `UpdateRestaurantStatusUseCase` - Ouvrir/fermer restaurant

### Interfaces à Créer
- [ ] `IPaymentRepository` - Gestion paiements
- [ ] `INotificationRepository` - Envoi notifications

## 🧪 Tests

Tous les éléments du Core doivent être **100% testables** sans dépendances externes.

Exemple:
```typescript
// __tests__/core/use-cases/auth/LoginUseCase.test.ts
describe('LoginUseCase', () => {
  it('should authenticate valid user', async () => {
    const mockRepo = createMockAuthRepository();
    const useCase = new LoginUseCase(mockRepo);
    // Test de la logique métier pure
  });
});
```

## 📚 Documentation

- **Architecture générale:** Voir `CLEAN_ARCHITECTURE.md`
- **Guide de migration:** Voir `MIGRATION_GUIDE.md`
- **Guide de test:** Voir `TESTING_GUIDE.md`

---

**Dernière mise à jour:** 11 novembre 2025  
**Statut:** ✅ Architecture établie - En expansion continue
