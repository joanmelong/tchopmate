# 🧪 Guide de Test - Clean Architecture

## 📋 Configuration des tests

### Installation des dépendances

```bash
npm install -D jest @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/jest ts-jest
```

### Fichiers de configuration

- `jest.config.ts` - Configuration Jest
- `jest.setup.ts` - Setup global
- `tsconfig.test.json` - Configuration TypeScript pour les tests

---

## 🎯 Stratégie de test

### 1. Tests des Entités (100% coverage requis)

Les entités sont la partie la plus critique - elles contiennent les règles métier.

**Fichier** : `tests/unit/entities/User.test.ts`

```typescript
import { User, UserRole } from '@/core/entities/User';

describe('User Entity', () => {
  describe('Validation', () => {
    it('devrait créer un utilisateur valide', () => {
      const user = new User({
        id: 1,
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean@example.com',
        role: UserRole.STUDENT,
      });

      expect(user.nom).toBe('Dupont');
      expect(user.fullName).toBe('Jean Dupont');
    });

    it('devrait rejeter un email invalide', () => {
      expect(() => new User({
        id: 1,
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'invalide',
        role: UserRole.STUDENT,
      })).toThrow('Email invalide');
    });
  });

  describe('Règles métier', () => {
    it('un étudiant ne peut pas gérer de restaurant', () => {
      const student = new User({
        id: 1,
        nom: 'Etudiant',
        prenom: 'Test',
        email: 'test@example.com',
        role: UserRole.STUDENT,
      });

      expect(student.canManageRestaurant()).toBe(false);
    });

    it('un gérant peut gérer un restaurant', () => {
      const gerant = new User({
        id: 1,
        nom: 'Gerant',
        prenom: 'Test',
        email: 'test@example.com',
        role: UserRole.STAFF,
      });

      expect(gerant.canManageRestaurant()).toBe(true);
    });
  });
});
```

### 2. Tests des Use Cases (avec mocks)

Les use cases orchestrent la logique métier. On mock les repositories.

**Fichier** : `tests/unit/use-cases/LoginUseCase.test.ts`

```typescript
import { LoginUseCase } from '@/core/use-cases/auth/LoginUseCase';
import { IAuthRepository } from '@/core/interfaces/IAuthRepository';
import { User, UserRole } from '@/core/entities/User';

class MockAuthRepository implements IAuthRepository {
  async login(credentials) {
    if (credentials.email === 'test@example.com') {
      return {
        user: new User({
          id: 1,
          nom: 'Test',
          prenom: 'User',
          email: credentials.email,
          role: UserRole.STUDENT,
        }),
        accessToken: 'fake-token',
      };
    }
    throw new Error('Invalid credentials');
  }

  // Autres méthodes non utilisées
  async register() { throw new Error('Not implemented'); }
  async logout() {}
  async getCurrentSession() { return null; }
  async isAuthenticated() { return false; }
  async resetPassword() {}
}

describe('LoginUseCase', () => {
  let mockRepo: IAuthRepository;
  let useCase: LoginUseCase;

  beforeEach(() => {
    mockRepo = new MockAuthRepository();
    useCase = new LoginUseCase(mockRepo);
  });

  it('devrait rejeter un email vide', async () => {
    await expect(
      useCase.execute({ email: '', password: 'test123' })
    ).rejects.toThrow('L\'email est requis');
  });

  it('devrait rejeter un mot de passe trop court', async () => {
    await expect(
      useCase.execute({ email: 'test@example.com', password: '123' })
    ).rejects.toThrow('Le mot de passe doit contenir au moins 6 caractères');
  });

  it('devrait authentifier avec des identifiants valides', async () => {
    const session = await useCase.execute({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(session.user.email).toBe('test@example.com');
    expect(session.accessToken).toBe('fake-token');
  });

  it('devrait rejeter des identifiants invalides', async () => {
    await expect(
      useCase.execute({
        email: 'wrong@example.com',
        password: 'wrongpass',
      })
    ).rejects.toThrow();
  });
});
```

### 3. Tests des Repositories (avec Supabase Test Client)

Les repositories peuvent être testés avec un client Supabase de test ou des mocks.

**Fichier** : `tests/integration/repositories/SupabaseAuthRepository.test.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import { SupabaseAuthRepository } from '@/data/repositories/SupabaseAuthRepository';

// Setup test Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const testClient = createClient(supabaseUrl, supabaseKey);

describe('SupabaseAuthRepository', () => {
  let repository: SupabaseAuthRepository;

  beforeEach(() => {
    repository = new SupabaseAuthRepository(testClient);
  });

  afterEach(async () => {
    // Cleanup
    await testClient.auth.signOut();
  });

  it('devrait créer un compte et retourner un User', async () => {
    const user = await repository.register({
      email: 'test@example.com',
      password: 'password123',
      nom: 'Test',
      prenom: 'User',
    });

    expect(user.email).toBe('test@example.com');
    expect(user.nom).toBe('Test');
    expect(user.isStudent()).toBe(true);
  });
});
```

### 4. Tests des Mappers

Tester la conversion DTOs ↔ Entités.

**Fichier** : `tests/unit/mappers/UserMapper.test.ts`

```typescript
import { UserMapper } from '@/data/mappers';
import { User, UserRole } from '@/core/entities/User';
import { CompteDTO } from '@/data/dto';

describe('UserMapper', () => {
  const mockDTO: CompteDTO = {
    id: 1,
    user_id: 'auth-123',
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean@example.com',
    numero_tel: '+237612345678',
    role: 'Etudiant',
  };

  it('devrait convertir un DTO en entité User', () => {
    const user = UserMapper.toDomain(mockDTO);

    expect(user).toBeInstanceOf(User);
    expect(user.id).toBe(1);
    expect(user.nom).toBe('Dupont');
    expect(user.role).toBe(UserRole.STUDENT);
  });

  it('devrait convertir une entité User en DTO', () => {
    const user = new User({
      id: 1,
      userId: 'auth-123',
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean@example.com',
      role: UserRole.STUDENT,
    });

    const dto = UserMapper.toDTO(user);

    expect(dto.id).toBe(1);
    expect(dto.nom).toBe('Dupont');
    expect(dto.role).toBe(UserRole.STUDENT);
  });
});
```

### 5. Tests des Hooks (avec React Testing Library)

**Fichier** : `tests/unit/hooks/useAuth.test.tsx`

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '@/hooks/use-auth';

// Mock du router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock du DI container
jest.mock('@/lib/di', () => ({
  getDI: () => ({
    loginUseCase: {
      execute: jest.fn().mockResolvedValue({
        user: { isAdmin: () => false, isStaff: () => false },
        accessToken: 'token',
      }),
    },
    logoutUseCase: {
      execute: jest.fn(),
    },
  }),
}));

describe('useAuth hook', () => {
  it('devrait fournir une fonction login', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.login).toBeDefined();
    expect(result.current.logout).toBeDefined();
  });

  it('devrait gérer l\'état de chargement', async () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(false);

    result.current.login({ email: 'test@example.com', password: 'test' });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});
```

---

## 🏃 Exécuter les tests

### Tous les tests

```bash
npm test
```

### Tests en mode watch

```bash
npm test -- --watch
```

### Tests avec coverage

```bash
npm test -- --coverage
```

### Tests d'un fichier spécifique

```bash
npm test User.test.ts
```

---

## 📊 Objectifs de couverture

| Couche | Objectif | Priorité |
|--------|----------|----------|
| **Entities** | 100% | 🔴 Critique |
| **Use Cases** | 90%+ | 🔴 Critique |
| **Mappers** | 100% | 🟡 Important |
| **Repositories** | 70%+ | 🟢 Souhaitable |
| **Hooks** | 60%+ | 🟢 Souhaitable |

---

## ✅ Checklist avant commit

- [ ] Tous les tests passent
- [ ] Coverage des entités > 90%
- [ ] Coverage des use cases > 80%
- [ ] Pas de tests ignorés (`it.skip`, `describe.skip`)
- [ ] Pas de `console.log` dans les tests

---

## 🧪 Exemples de tests par type

### Test d'une règle métier complexe

```typescript
describe('Order.canBeCancelled', () => {
  it('une commande en attente peut être annulée', () => {
    const order = new Order({
      id: 1,
      status: OrderStatus.EN_ATTENTE,
      items: [...],
      totalPrice: 5000,
      // ...
    });

    expect(order.canBeCancelled()).toBe(true);
  });

  it('une commande retirée ne peut pas être annulée', () => {
    const order = new Order({
      id: 1,
      status: OrderStatus.RETIREE,
      items: [...],
      totalPrice: 5000,
      // ...
    });

    expect(order.canBeCancelled()).toBe(false);
  });
});
```

### Test d'une validation

```typescript
describe('Restaurant validation', () => {
  it('devrait rejeter un restaurant sans nom', () => {
    expect(() => new Restaurant({
      id: '1',
      nom: '',
      gerantId: 1,
    })).toThrow('Le nom du restaurant est requis');
  });

  it('devrait rejeter un nom trop long', () => {
    expect(() => new Restaurant({
      id: '1',
      nom: 'a'.repeat(101),
      gerantId: 1,
    })).toThrow('Le nom du restaurant ne peut pas dépasser 100 caractères');
  });
});
```

### Test d'un use case avec plusieurs dépendances

```typescript
describe('CreateOrderUseCase', () => {
  let mockOrderRepo: IOrderRepository;
  let mockPlatRepo: IPlatRepository;
  let useCase: CreateOrderUseCase;

  beforeEach(() => {
    mockOrderRepo = {
      create: jest.fn().mockResolvedValue(mockOrder),
      // ...
    };

    mockPlatRepo = {
      getById: jest.fn().mockResolvedValue(mockPlat),
      // ...
    };

    useCase = new CreateOrderUseCase(mockOrderRepo, mockPlatRepo);
  });

  it('devrait créer une commande valide', async () => {
    const student = new User({ role: UserRole.STUDENT, ... });
    
    const order = await useCase.execute(student, {
      restaurantId: '1',
      items: [{ platId: 1, quantite: 2 }],
    });

    expect(order).toBeDefined();
    expect(mockOrderRepo.create).toHaveBeenCalled();
  });

  it('devrait rejeter si un plat n\'est pas disponible', async () => {
    mockPlatRepo.getById = jest.fn().mockResolvedValue({
      ...mockPlat,
      isAvailable: () => false,
    });

    await expect(
      useCase.execute(student, { ... })
    ).rejects.toThrow('n\'est pas disponible');
  });
});
```

---

## 🔍 Debugging des tests

### Afficher la sortie

```bash
npm test -- --verbose
```

### Débugger un test spécifique

```typescript
it.only('ce test sera le seul à s\'exécuter', () => {
  // ...
});
```

### Ignorer temporairement un test

```typescript
it.skip('ce test sera ignoré', () => {
  // ...
});
```

---

## 📚 Ressources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

**Bons tests = Code de qualité !** ✅
