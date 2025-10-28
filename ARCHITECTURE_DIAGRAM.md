# 📊 Architecture Visuelle - TchopMate

## 🏗️ Vue d'ensemble des couches

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRAMEWORKS & DRIVERS                       │
│                     (Couche la plus externe)                    │
├─────────────────────────────────────────────────────────────────┤
│  • Next.js App Router                                           │
│  • React Components                                             │
│  • Supabase Client                                              │
│  • UI Libraries (shadcn/ui)                                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓ dépend de
┌─────────────────────────────────────────────────────────────────┐
│                      INTERFACE ADAPTERS                         │
│                   (Adaptateurs d'interface)                     │
├─────────────────────────────────────────────────────────────────┤
│  • Hooks React (useAuth, useSession, useRestaurant)            │
│  • Repositories Supabase (implémentations concrètes)           │
│  • Mappers (DTO ↔ Entities)                                    │
│  • DTOs (Data Transfer Objects)                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓ dépend de
┌─────────────────────────────────────────────────────────────────┐
│                         USE CASES                               │
│                    (Logique applicative)                        │
├─────────────────────────────────────────────────────────────────┤
│  • LoginUseCase                                                 │
│  • RegisterUseCase                                              │
│  • GetRestaurantByGerantUseCase                                │
│  • CreateOrderUseCase                                           │
│  • UpdateOrderStatusUseCase                                     │
│  • ... autres use cases                                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓ dépend de
┌─────────────────────────────────────────────────────────────────┐
│                          ENTITIES                               │
│                   (Logique métier pure)                         │
├─────────────────────────────────────────────────────────────────┤
│  • User (avec règles métier)                                    │
│  • Restaurant                                                    │
│  • Menu / Plat                                                   │
│  • Order / OrderItem                                             │
│  • NO DEPENDENCIES! ✅                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flux de données complet

### Exemple : Connexion d'un utilisateur

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. UI Layer - LoginPage.tsx                                      │
│                                                                   │
│  const { login } = useAuth();                                    │
│  await login({ email, password });                               │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 2. Hook Layer - useAuth.ts                                       │
│                                                                   │
│  const di = getDI();                                             │
│  const session = await di.loginUseCase.execute(credentials);     │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 3. DI Container - container.ts                                   │
│                                                                   │
│  get loginUseCase() {                                            │
│    return new LoginUseCase(this.authRepository);                 │
│  }                                                                │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 4. Use Case - LoginUseCase.ts                                    │
│                                                                   │
│  async execute(credentials: AuthCredentials) {                   │
│    // Validation métier                                          │
│    if (!isValidEmail(credentials.email)) throw Error();          │
│    // Déléguer au repository                                     │
│    return await this.authRepository.login(credentials);          │
│  }                                                                │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 5. Repository - SupabaseAuthRepository.ts                        │
│                                                                   │
│  async login(credentials) {                                      │
│    const { data } = await supabase.auth.signInWithPassword(...); │
│    const compteData = await supabase.from('compte')...;          │
│    return UserMapper.toDomain(compteData);  // DTO → Entity      │
│  }                                                                │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 6. Mapper - UserMapper.ts                                        │
│                                                                   │
│  static toDomain(dto: CompteDTO): User {                         │
│    return new User({                                             │
│      id: dto.id,                                                 │
│      nom: dto.nom,                                               │
│      role: dto.role as UserRole,                                 │
│      // ...                                                       │
│    });                                                            │
│  }                                                                │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 7. Entity - User.ts                                              │
│                                                                   │
│  class User {                                                     │
│    isStudent() { return this.role === UserRole.STUDENT; }        │
│    canManageRestaurant() { return this.isStaff() || ... }        │
│    // Règles métier pures                                        │
│  }                                                                │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Règle de dépendance (Dependency Rule)

```
     EXTERNE                                    INTERNE
        ↓                                          ↓

┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│          │────→│          │────→│          │────→│          │
│    UI    │     │  Hooks   │     │   Use    │     │ Entities │
│ (React)  │     │ (Adapt.) │     │  Cases   │     │ (Métier) │
│          │←────│          │←────│          │←────│          │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     ↑                                                   ↑
   Connaît                                        Ne connaît
   le métier                                        PERSONNE
     
┌──────────┐
│ Supabase │
│   Repo   │────→ Implémente l'interface définie par le métier
└──────────┘
```

**Règle d'or** : Les flèches de dépendance pointent toujours VERS L'INTÉRIEUR.

---

## 📁 Structure de fichiers détaillée

```
src/
├── core/                               # 🧠 COUCHE MÉTIER
│   ├── entities/                       
│   │   ├── User.ts                     # ✅ Entité pure
│   │   │   ├── class User { }
│   │   │   ├── isStudent(): boolean
│   │   │   ├── canManageRestaurant(): boolean
│   │   │   └── validateEmail(): void
│   │   │
│   │   ├── Restaurant.ts
│   │   │   ├── class Restaurant { }
│   │   │   ├── isManagedBy(id): boolean
│   │   │   └── updateNom(nom): void
│   │   │
│   │   ├── Menu.ts
│   │   │   ├── class Menu { }
│   │   │   ├── class Plat { }
│   │   │   └── getAvailablePlats(): Plat[]
│   │   │
│   │   └── Order.ts
│   │       ├── class Order { }
│   │       ├── canBeCancelled(): boolean
│   │       ├── markAsReady(): void
│   │       └── calculateTotal(): number
│   │
│   ├── interfaces/                     # ✅ Contrats
│   │   ├── IAuthRepository.ts
│   │   │   └── interface IAuthRepository {
│   │   │         login(credentials): Promise<AuthSession>
│   │   │         register(data): Promise<User>
│   │   │       }
│   │   │
│   │   ├── IRestaurantRepository.ts
│   │   ├── IUserRepository.ts
│   │   ├── IMenuRepository.ts
│   │   └── IOrderRepository.ts
│   │
│   └── use-cases/                      # ✅ Logique applicative
│       ├── auth/
│       │   ├── LoginUseCase.ts
│       │   │   └── execute(credentials) → AuthSession
│       │   ├── RegisterUseCase.ts
│       │   ├── GetCurrentSessionUseCase.ts
│       │   └── LogoutUseCase.ts
│       │
│       ├── restaurant/
│       │   ├── GetRestaurantUseCase.ts
│       │   ├── GetRestaurantByGerantUseCase.ts
│       │   │   └── execute(gerant: User) → Restaurant
│       │   └── CreateRestaurantUseCase.ts
│       │
│       └── order/
│           ├── CreateOrderUseCase.ts
│           │   └── execute(student, data) → Order
│           ├── GetRestaurantOrdersUseCase.ts
│           └── UpdateOrderStatusUseCase.ts
│
├── data/                               # 💾 COUCHE DONNÉES
│   ├── dto/
│   │   └── index.ts                    # CompteDTO, RestaurantDTO, etc.
│   │
│   ├── mappers/
│   │   └── index.ts
│   │       ├── UserMapper.toDomain(dto) → User
│   │       ├── UserMapper.toDTO(user) → CompteDTO
│   │       ├── RestaurantMapper.toDomain(dto) → Restaurant
│   │       └── ...
│   │
│   └── repositories/
│       ├── SupabaseAuthRepository.ts
│       │   └── implements IAuthRepository
│       │       ├── login() { supabase.auth.signInWithPassword() }
│       │       └── getCurrentSession() { ... }
│       │
│       ├── SupabaseRestaurantRepository.ts
│       └── SupabaseUserRepository.ts
│
├── lib/                                # 🔧 INFRASTRUCTURE
│   ├── di/
│   │   ├── container.ts                # Injection de dépendances
│   │   │   └── class DIContainer {
│   │   │         get loginUseCase() { ... }
│   │   │         get authRepository() { ... }
│   │   │       }
│   │   └── index.ts
│   │
│   ├── supabaseClient.ts               # Client Supabase
│   └── utils.ts
│
├── hooks/                              # ⚛️ ADAPTATEURS REACT
│   ├── use-auth.ts
│   │   └── useAuth() {
│   │         const di = getDI();
│   │         return { login, logout };
│   │       }
│   │
│   ├── use-session.ts
│   ├── use-restaurant.ts
│   └── use-protected-route.ts
│
├── components/                         # 🎨 UI
│   ├── ui/                             # Composants de base
│   └── admin/                          # Composants métier
│
└── app/                                # 📄 PAGES (Next.js)
    ├── (auth)/
    │   ├── login/
    │   └── register/
    ├── (student)/
    │   └── home/
    ├── (staff)/
    │   └── resto/[id]/                 # ✅ REFACTORISÉ
    └── (admin)/
        └── admin/
```

---

## 🧪 Testabilité

### Sans Clean Architecture ❌

```typescript
// Impossible de tester sans Supabase, React, etc.
test('Login test', () => {
  // 💥 Besoin de Supabase mock
  // 💥 Besoin de Next.js router mock
  // 💥 Besoin de React Testing Library
  // 💥 Tests fragiles et lents
});
```

### Avec Clean Architecture ✅

```typescript
// Tests purs, rapides, indépendants
test('User.isStudent() retourne true pour un étudiant', () => {
  const user = new User({ role: UserRole.STUDENT, ... });
  expect(user.isStudent()).toBe(true);
  // ✅ Pas de dépendance
  // ✅ Test instantané
  // ✅ 100% fiable
});

test('LoginUseCase rejette un email invalide', async () => {
  const mockRepo = { login: jest.fn() };
  const useCase = new LoginUseCase(mockRepo);
  
  await expect(
    useCase.execute({ email: 'invalide', password: '123' })
  ).rejects.toThrow();
  // ✅ Mock simple
  // ✅ Test la logique métier
});
```

---

## 🔄 Changer de base de données

### Actuellement : Supabase

```typescript
class SupabaseAuthRepository implements IAuthRepository {
  async login(credentials) {
    const { data } = await this.supabase.auth.signInWithPassword(...);
    return UserMapper.toDomain(data);
  }
}
```

### Demain : PostgreSQL direct

```typescript
class PostgresAuthRepository implements IAuthRepository {
  async login(credentials) {
    const user = await this.pool.query('SELECT * FROM users WHERE ...');
    return UserMapper.toDomain(user);
  }
}
```

### Ou Firebase

```typescript
class FirebaseAuthRepository implements IAuthRepository {
  async login(credentials) {
    const userCredential = await signInWithEmailAndPassword(...);
    return UserMapper.toDomain(userCredential.user);
  }
}
```

**Le métier ne change PAS !** ✅

---

## 📊 Comparaison : Avant / Après

| Aspect | Code Spaghetti ❌ | Clean Architecture ✅ |
|--------|-------------------|----------------------|
| **Dépendances** | Supabase partout | Supabase isolé dans repositories |
| **Testabilité** | Difficile, nécessite mocks complexes | Facile, tests unitaires purs |
| **Maintenabilité** | Modifications impactent tout | Modifications isolées par couche |
| **Réutilisabilité** | Code dupliqué | Use cases réutilisables |
| **Lisibilité** | Logique éparpillée | Chaque couche a un rôle clair |
| **Changement de DB** | Refactorisation massive | Changer le repository uniquement |
| **Changement d'UI** | Logique couplée à React | UI indépendante du métier |
| **Onboarding** | Difficile de comprendre | Structure claire et documentée |

---

## 🎓 Concepts clés

### 1. Entités (Entities)
- Objets métier purs
- Contiennent les règles métier fondamentales
- **Aucune dépendance externe**

### 2. Use Cases
- Orchestrent les opérations métier
- Dépendent des **interfaces**, pas des implémentations
- Testables sans infrastructure

### 3. Repositories (Interfaces)
- Définissent les **contrats** d'accès aux données
- Le métier ne connaît que ces interfaces

### 4. Repositories (Implémentations)
- Implémentent les interfaces
- Connaissent Supabase, PostgreSQL, etc.
- Facilement remplaçables

### 5. Mappers
- Convertissent DTOs ↔ Entités
- Isolent le métier de la structure de la DB

### 6. Injection de Dépendances
- Résout les dépendances au runtime
- Facilite les tests (injection de mocks)

---

**Cette architecture rend votre code :**
- ✅ **Testable**
- ✅ **Maintenable**
- ✅ **Évolutif**
- ✅ **Indépendant des frameworks**
- ✅ **Professionnel**
