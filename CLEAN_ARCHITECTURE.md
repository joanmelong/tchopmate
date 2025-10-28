# 🏗️ Architecture Propre (Clean Architecture) - TchopMate

## 📋 Vue d'ensemble

Ce projet a été refactorisé pour suivre les principes de **Clean Architecture** (Architecture Hexagonale). Voici les avantages :

✅ **Indépendance des frameworks** : Le métier ne connaît pas React, Next.js ou Supabase  
✅ **Testabilité** : Toute la logique métier peut être testée sans UI ni base de données  
✅ **Indépendance de l'UI** : On peut remplacer React par Vue sans modifier le métier  
✅ **Indépendance de la DB** : On peut remplacer Supabase par PostgreSQL direct  
✅ **Séparation des responsabilités** : Chaque couche a une responsabilité claire  

---

## 🎯 Structure des dossiers

```
src/
├── core/                           # 🧠 LOGIQUE MÉTIER (Ne dépend de RIEN)
│   ├── entities/                   # Entités du domaine
│   │   ├── User.ts                 # Entité User avec règles métier
│   │   ├── Restaurant.ts           # Entité Restaurant
│   │   ├── Menu.ts                 # Entités Menu et Plat
│   │   └── Order.ts                # Entité Order (Commande)
│   │
│   ├── interfaces/                 # Contrats (abstractions)
│   │   ├── IAuthRepository.ts      # Interface pour l'authentification
│   │   ├── IRestaurantRepository.ts
│   │   ├── IUserRepository.ts
│   │   ├── IMenuRepository.ts
│   │   └── IOrderRepository.ts
│   │
│   └── use-cases/                  # Cas d'utilisation métier
│       ├── auth/
│       │   ├── LoginUseCase.ts     # UC: Connexion
│       │   ├── RegisterUseCase.ts  # UC: Inscription
│       │   ├── GetCurrentSessionUseCase.ts
│       │   └── LogoutUseCase.ts
│       ├── restaurant/
│       │   ├── GetRestaurantUseCase.ts
│       │   ├── GetRestaurantByGerantUseCase.ts
│       │   └── CreateRestaurantUseCase.ts
│       └── order/
│           ├── CreateOrderUseCase.ts
│           ├── GetRestaurantOrdersUseCase.ts
│           └── UpdateOrderStatusUseCase.ts
│
├── data/                           # 💾 ACCÈS AUX DONNÉES
│   ├── dto/                        # Data Transfer Objects
│   │   └── index.ts                # DTOs Supabase (CompteDTO, RestaurantDTO, etc.)
│   │
│   ├── mappers/                    # Convertisseurs DTO ↔ Entités
│   │   └── index.ts                # UserMapper, RestaurantMapper, etc.
│   │
│   └── repositories/               # Implémentations concrètes
│       ├── SupabaseAuthRepository.ts
│       ├── SupabaseRestaurantRepository.ts
│       └── SupabaseUserRepository.ts
│
├── lib/                            # 🔧 CONFIGURATION & UTILS
│   ├── di/                         # Injection de dépendances
│   │   ├── container.ts            # Container DI
│   │   └── index.ts
│   ├── supabaseClient.ts           # Client Supabase
│   └── utils.ts
│
├── hooks/                          # ⚛️ HOOKS REACT (Pont UI ↔ Use Cases)
│   ├── use-auth.ts                 # Hook authentification
│   ├── use-session.ts              # Hook session utilisateur
│   ├── use-restaurant.ts           # Hook restaurant
│   └── use-protected-route.ts      # Hook protection de routes
│
├── components/                     # 🎨 COMPOSANTS UI
│   ├── ui/                         # Composants réutilisables
│   ├── admin/                      # Composants admin
│   └── ...
│
├── app/                            # 📄 PAGES & ROUTES (Next.js App Router)
│   ├── (auth)/                     # Groupe : Authentification
│   │   ├── login/
│   │   └── register/
│   ├── (student)/                  # Groupe : Étudiants
│   │   └── home/
│   ├── (staff)/                    # Groupe : Gérants
│   │   └── resto/[id]/
│   └── (admin)/                    # Groupe : Administrateurs
│       └── admin/
│
└── tests/                          # 🧪 TESTS
    └── unit/
        ├── entities/               # Tests des entités
        └── use-cases/              # Tests des use cases
```

---

## 🔄 Flux de dépendances (Règle de dépendance)

```
┌─────────────────────────────────────────────────┐
│  UI (React Components, Pages)                   │
│  Dépend de ↓                                    │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Hooks (use-auth, use-session, etc.)           │
│  Dépend de ↓                                    │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Use Cases (LoginUseCase, etc.)                │
│  Dépend de ↓ (INTERFACES uniquement)           │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Entities (User, Restaurant, Order)            │
│  Ne dépend de RIEN ✅                           │
└─────────────────────────────────────────────────┘
                    ↑
┌─────────────────────────────────────────────────┐
│  Repositories (SupabaseAuthRepository)         │
│  Implémente les interfaces ↑                    │
└─────────────────────────────────────────────────┘
```

**Règle d'or** : Les couches internes ne connaissent JAMAIS les couches externes.

---

## 📖 Exemple d'utilisation

### ❌ AVANT (Code Spaghetti)

```tsx
// Dans le composant React - TOUT mélangé
const { data: { session } } = await supabase.auth.getSession();
const { data: compteData } = await supabase
  .from("compte")
  .select("*")
  .eq("user_id", session.user.id)
  .single();
```

### ✅ APRÈS (Clean Architecture)

```tsx
// Dans le composant React - Utilise un hook
const { user, isLoading, error } = useSession();

// Le hook utilise un use case
const di = getDI();
const session = await di.getCurrentSessionUseCase.execute();

// Le use case utilise un repository (via interface)
class GetCurrentSessionUseCase {
  constructor(private authRepository: IAuthRepository) {}
  
  async execute() {
    return await this.authRepository.getCurrentSession();
  }
}

// Le repository implémente l'interface
class SupabaseAuthRepository implements IAuthRepository {
  async getCurrentSession() {
    const { data } = await this.supabase.auth.getSession();
    // Convertit DTO → Entité
    return UserMapper.toDomain(data);
  }
}
```

---

## 🚀 Comment ajouter une nouvelle fonctionnalité

### Exemple : Ajouter la gestion des paiements

1. **Créer l'entité** (`core/entities/Payment.ts`)
```typescript
export class Payment {
  constructor(private props: PaymentProps) {}
  
  // Règles métier
  canBeRefunded(): boolean { /* ... */ }
}
```

2. **Créer l'interface du repository** (`core/interfaces/IPaymentRepository.ts`)
```typescript
export interface IPaymentRepository {
  create(data: CreatePaymentData): Promise<Payment>;
  getById(id: string): Promise<Payment | null>;
}
```

3. **Créer le use case** (`core/use-cases/payment/ProcessPaymentUseCase.ts`)
```typescript
export class ProcessPaymentUseCase {
  constructor(private paymentRepo: IPaymentRepository) {}
  
  async execute(data: PaymentData): Promise<Payment> {
    // Validation métier
    // Logique métier
    return await this.paymentRepo.create(data);
  }
}
```

4. **Implémenter le repository** (`data/repositories/SupabasePaymentRepository.ts`)
```typescript
export class SupabasePaymentRepository implements IPaymentRepository {
  async create(data: CreatePaymentData): Promise<Payment> {
    const { data: dto } = await this.supabase
      .from('paiements')
      .insert(data);
    return PaymentMapper.toDomain(dto);
  }
}
```

5. **Ajouter au container DI** (`lib/di/container.ts`)
```typescript
get paymentRepository(): IPaymentRepository {
  return new SupabasePaymentRepository(this.supabase);
}

get processPaymentUseCase(): ProcessPaymentUseCase {
  return new ProcessPaymentUseCase(this.paymentRepository);
}
```

6. **Créer un hook React** (`hooks/use-payment.ts`)
```typescript
export function usePayment() {
  const di = getDI();
  
  const processPayment = async (data: PaymentData) => {
    return await di.processPaymentUseCase.execute(data);
  };
  
  return { processPayment };
}
```

7. **Utiliser dans un composant**
```tsx
const { processPayment } = usePayment();
await processPayment(paymentData);
```

---

## 🧪 Tests

Grâce à l'architecture propre, vous pouvez tester :

### Tests des entités (sans aucune dépendance)
```typescript
test('Un étudiant peut passer une commande', () => {
  const student = new User({ role: UserRole.STUDENT, ... });
  expect(student.isStudent()).toBe(true);
});
```

### Tests des use cases (avec mock des repositories)
```typescript
test('LoginUseCase rejette un email invalide', async () => {
  const mockRepo = { login: jest.fn() };
  const useCase = new LoginUseCase(mockRepo);
  
  await expect(
    useCase.execute({ email: 'invalide', password: '123' })
  ).rejects.toThrow('Email invalide');
});
```

---

## 🔄 Migration progressive

Vous n'avez pas besoin de tout refactoriser d'un coup :

1. ✅ **Commencez par les nouvelles fonctionnalités** avec la Clean Architecture
2. ✅ **Refactorisez page par page** l'ancien code
3. ✅ **Les deux approches peuvent coexister** temporairement

---

## 📚 Ressources

- [Clean Architecture (Uncle Bob)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)

---

## ✨ Avantages concrets

| Avant | Après |
|-------|-------|
| ❌ Supabase partout dans les composants | ✅ Supabase isolé dans les repositories |
| ❌ Logique métier mélangée avec l'UI | ✅ Logique métier dans les use cases |
| ❌ Impossible de tester sans React | ✅ Tests unitaires purs |
| ❌ Couplage fort avec Supabase | ✅ Peut changer de DB facilement |
| ❌ Code dupliqué | ✅ Réutilisable via use cases |

---

**Maintenu par** : Équipe TchopMate  
**Dernière mise à jour** : Octobre 2025
