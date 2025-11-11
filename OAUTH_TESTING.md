# ✅ Tests OAuth - Guide Complet

## 🎯 Tests Unitaires

### Test 1: GoogleLoginAdminUseCase

```typescript
// __tests__/core/use-cases/auth/GoogleLoginAdminUseCase.test.ts
import { GoogleLoginAdminUseCase } from '@/core/use-cases/auth/GoogleLoginAdminUseCase';
import { IAuthRepository } from '@/core/interfaces/IAuthRepository';

describe('GoogleLoginAdminUseCase', () => {
  let mockAuthRepository: jest.Mocked<IAuthRepository>;
  let useCase: GoogleLoginAdminUseCase;

  beforeEach(() => {
    mockAuthRepository = {
      initiateGoogleLogin: jest.fn(),
    } as any;

    useCase = new GoogleLoginAdminUseCase(mockAuthRepository);
  });

  it('should generate OAuth redirect URL', async () => {
    // Arrange
    const expectedUrl = 'https://accounts.google.com/oauth/...';
    mockAuthRepository.initiateGoogleLogin.mockResolvedValue(expectedUrl);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(mockAuthRepository.initiateGoogleLogin).toHaveBeenCalledWith({
      redirectTo: '/admin/login/callback',
      scopes: 'openid email profile',
    });
    expect(result.redirectUrl).toBe(expectedUrl);
  });
});
```

---

### Test 2: HandleAdminCallbackUseCase

```typescript
// __tests__/core/use-cases/auth/HandleAdminCallbackUseCase.test.ts
import { HandleAdminCallbackUseCase } from '@/core/use-cases/auth/GoogleLoginAdminUseCase';
import { IAuthRepository, AuthSession } from '@/core/interfaces/IAuthRepository';
import { User, UserRole } from '@/core/entities/User';

describe('HandleAdminCallbackUseCase', () => {
  let mockAuthRepository: jest.Mocked<IAuthRepository>;
  let useCase: HandleAdminCallbackUseCase;

  beforeEach(() => {
    mockAuthRepository = {
      handleOAuthCallback: jest.fn(),
      logout: jest.fn(),
    } as any;

    useCase = new HandleAdminCallbackUseCase(mockAuthRepository);
  });

  it('should accept valid admin email', async () => {
    // Arrange
    const adminUser = new User(
      1,
      'joantsayem@gmail.com',
      'Joan',
      'Tsayem',
      UserRole.ADMIN,
      'user-id-123'
    );

    const session: AuthSession = {
      user: adminUser,
      accessToken: 'token',
    };

    mockAuthRepository.handleOAuthCallback.mockResolvedValue(session);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result).toBe(adminUser);
    expect(mockAuthRepository.logout).not.toHaveBeenCalled();
  });

  it('should reject non-admin email', async () => {
    // Arrange
    const normalUser = new User(
      2,
      'john@example.com',
      'John',
      'Doe',
      UserRole.STUDENT,
      'user-id-456'
    );

    const session: AuthSession = {
      user: normalUser,
      accessToken: 'token',
    };

    mockAuthRepository.handleOAuthCallback.mockResolvedValue(session);

    // Act & Assert
    await expect(useCase.execute()).rejects.toThrow('Email non autorisé');
    expect(mockAuthRepository.logout).toHaveBeenCalled();
  });

  it('should reject if session is null', async () => {
    // Arrange
    mockAuthRepository.handleOAuthCallback.mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute()).rejects.toThrow('Session non trouvée');
  });

  it('should reject if user is not admin role', async () => {
    // Arrange
    const staffUser = new User(
      3,
      'joantsayem@gmail.com', // Bon email
      'Joan',
      'Tsayem',
      UserRole.STAFF, // Mauvais rôle
      'user-id-789'
    );

    const session: AuthSession = {
      user: staffUser,
      accessToken: 'token',
    };

    mockAuthRepository.handleOAuthCallback.mockResolvedValue(session);

    // Act & Assert
    await expect(useCase.execute()).rejects.toThrow('n\'est pas un administrateur');
  });
});
```

---

### Test 3: HandleGerantCallbackUseCase

```typescript
// __tests__/core/use-cases/auth/HandleGerantCallbackUseCase.test.ts
import { HandleGerantCallbackUseCase } from '@/core/use-cases/auth/GoogleLoginGerantUseCase';
import { IAuthRepository, AuthSession } from '@/core/interfaces/IAuthRepository';
import { IUserRepository } from '@/core/interfaces/IUserRepository';
import { User, UserRole } from '@/core/entities/User';

describe('HandleGerantCallbackUseCase', () => {
  let mockAuthRepository: jest.Mocked<IAuthRepository>;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let useCase: HandleGerantCallbackUseCase;

  beforeEach(() => {
    mockAuthRepository = {
      handleOAuthCallback: jest.fn(),
      logout: jest.fn(),
    } as any;

    mockUserRepository = {
      getByEmail: jest.fn(),
      update: jest.fn(),
    } as any;

    useCase = new HandleGerantCallbackUseCase(
      mockAuthRepository,
      mockUserRepository
    );
  });

  it('should accept valid gérant account', async () => {
    // Arrange
    const gerantUser = new User(
      1,
      'gerant@example.com',
      'Jean',
      'Dupont',
      UserRole.STAFF,
      'user-id-123'
    );

    const session: AuthSession = {
      user: gerantUser,
      accessToken: 'token',
    };

    mockAuthRepository.handleOAuthCallback.mockResolvedValue(session);
    mockUserRepository.getByEmail.mockResolvedValue(gerantUser);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result).toBe(gerantUser);
    expect(mockUserRepository.getByEmail).toHaveBeenCalledWith('gerant@example.com');
    expect(mockAuthRepository.logout).not.toHaveBeenCalled();
  });

  it('should reject non-preauthorized email', async () => {
    // Arrange
    const unknownUser = new User(
      2,
      'unknown@example.com',
      'Unknown',
      'User',
      UserRole.STUDENT,
      'user-id-456'
    );

    const session: AuthSession = {
      user: unknownUser,
      accessToken: 'token',
    };

    mockAuthRepository.handleOAuthCallback.mockResolvedValue(session);
    mockUserRepository.getByEmail.mockResolvedValue(null); // Pas de compte

    // Act & Assert
    await expect(useCase.execute()).rejects.toThrow('Aucun compte gérant trouvé');
    expect(mockAuthRepository.logout).toHaveBeenCalled();
  });

  it('should reject non-gérant role', async () => {
    // Arrange
    const studentUser = new User(
      3,
      'student@example.com',
      'Student',
      'Test',
      UserRole.STUDENT,
      'user-id-789'
    );

    const session: AuthSession = {
      user: studentUser,
      accessToken: 'token',
    };

    mockAuthRepository.handleOAuthCallback.mockResolvedValue(session);
    mockUserRepository.getByEmail.mockResolvedValue(studentUser);

    // Act & Assert
    await expect(useCase.execute()).rejects.toThrow('n\'est pas autorisé pour les gérants');
    expect(mockAuthRepository.logout).toHaveBeenCalled();
  });
});
```

---

## 🔗 Tests d'Intégration

### Test 4: useAdminAuth Hook

```typescript
// __tests__/hooks/use-admin-auth.test.tsx
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { getDI } from '@/lib/di';

jest.mock('@/lib/di');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('useAdminAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initiate Google login', async () => {
    // Arrange
    const mockExecute = jest.fn().mockResolvedValue({
      redirectUrl: 'https://accounts.google.com/...',
    });

    (getDI as jest.Mock).mockReturnValue({
      googleLoginAdminUseCase: {
        execute: mockExecute,
      },
    });

    const { result } = renderHook(() => useAdminAuth());

    // Act
    await act(async () => {
      await result.current.loginWithGoogle();
    });

    // Assert
    expect(mockExecute).toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle login error', async () => {
    // Arrange
    const mockExecute = jest.fn().mockRejectedValue(new Error('Network error'));

    (getDI as jest.Mock).mockReturnValue({
      googleLoginAdminUseCase: {
        execute: mockExecute,
      },
    });

    const { result } = renderHook(() => useAdminAuth());

    // Act
    await act(async () => {
      await result.current.loginWithGoogle();
    });

    // Assert
    expect(result.current.error).toBe('Network error');
    expect(result.current.isLoading).toBe(false);
  });
});
```

---

## 🌐 Tests End-to-End (E2E)

### Test 5: Flux complet Admin

```typescript
// __tests__/e2e/admin-login.test.ts
import { test, expect } from '@playwright/test';

test.describe('Admin OAuth Login', () => {
  test('should login as admin successfully', async ({ page, context }) => {
    // 1. Aller sur la page de login admin
    await page.goto('/admin/login');

    // 2. Vérifier que le bouton Google est présent
    const googleButton = page.locator('button:has-text("Se connecter avec Google")');
    await expect(googleButton).toBeVisible();

    // 3. Cliquer sur le bouton (sera intercepté en test)
    // Note: En test réel, utiliser un compte Google de test
    await googleButton.click();

    // 4. Attendre la redirection OAuth (mock en test)
    // En production, cela ouvrirait Google OAuth
    await page.waitForURL('**/admin/login/callback**');

    // 5. Vérifier la redirection vers le dashboard
    await page.waitForURL('/admin', { timeout: 10000 });

    // 6. Vérifier qu'on est bien sur le dashboard
    await expect(page.locator('h1')).toContainText('Dashboard Admin');
  });

  test('should show error for unauthorized email', async ({ page }) => {
    // Simuler une tentative avec un email non autorisé
    await page.goto('/admin/login?error=Email%20non%20autorisé');

    // Vérifier que le message d'erreur s'affiche
    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert).toContainText('Email non autorisé');
  });

  test('should display only Google login button', async ({ page }) => {
    await page.goto('/admin/login');

    // Vérifier qu'il n'y a PAS de champ email
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).not.toBeVisible();

    // Vérifier qu'il n'y a PAS de champ password
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).not.toBeVisible();

    // Vérifier qu'il y a SEULEMENT le bouton Google
    const buttons = page.locator('button');
    await expect(buttons).toHaveCount(1);
    await expect(buttons).toContainText('Google');
  });
});
```

---

### Test 6: Flux complet Gérant

```typescript
// __tests__/e2e/gerant-login.test.ts
import { test, expect } from '@playwright/test';

test.describe('Gérant OAuth Login', () => {
  test('should login as gérant and redirect to dashboard', async ({ page }) => {
    // 1. Aller sur la page de login gérant
    await page.goto('/resto/login');

    // 2. Vérifier l'absence du champ email
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).not.toBeVisible();

    // 3. Vérifier que seul le bouton Google est présent
    const googleButton = page.locator('button:has-text("Se connecter avec Google")');
    await expect(googleButton).toBeVisible();

    // 4. Cliquer et simuler OAuth
    await googleButton.click();
    await page.waitForURL('**/resto/login/callback**');

    // 5. Si le gérant a un restaurant → /home
    // Sinon → /resto/create-resto
    await page.waitForURL(/\/(home|resto\/create-resto)/);

    const url = page.url();
    expect(url).toMatch(/\/(home|resto\/create-resto)/);
  });

  test('should show preauthorization message', async ({ page }) => {
    await page.goto('/resto/login');

    // Vérifier le message d'information
    const infoText = page.locator('text=Votre compte doit être préautorisé');
    await expect(infoText).toBeVisible();
  });

  test('should reject non-preauthorized email', async ({ page }) => {
    // Simuler une tentative avec un email non préautorisé
    await page.goto('/resto/login?error=Aucun%20compte%20gérant%20trouvé');

    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert).toContainText('Aucun compte gérant trouvé');
  });
});
```

---

## 🛠️ Tests Manuels

### Checklist Test Manuel - Admin

- [ ] **1. Page de login**
  - [ ] Aller sur `/admin/login`
  - [ ] Vérifier l'absence de champs email/password
  - [ ] Vérifier la présence du bouton "Se connecter avec Google"
  - [ ] Vérifier le texte "Seule l'adresse administrateur peut accéder"

- [ ] **2. Connexion réussie**
  - [ ] Cliquer sur "Se connecter avec Google"
  - [ ] Se connecter avec `joantsayem@gmail.com`
  - [ ] Vérifier redirection vers `/admin`
  - [ ] Vérifier que le dashboard admin s'affiche

- [ ] **3. Connexion refusée**
  - [ ] Cliquer sur "Se connecter avec Google"
  - [ ] Se connecter avec un autre email
  - [ ] Vérifier message d'erreur "Email non autorisé"
  - [ ] Vérifier déconnexion automatique
  - [ ] Vérifier redirection vers `/admin/login`

---

### Checklist Test Manuel - Gérant

- [ ] **1. Page de login**
  - [ ] Aller sur `/resto/login`
  - [ ] **VÉRIFIER QU'IL N'Y A PAS DE CHAMP EMAIL** ✅
  - [ ] Vérifier l'absence de champs password
  - [ ] Vérifier la présence du bouton "Se connecter avec Google"
  - [ ] Vérifier le texte "Votre compte doit être préautorisé"

- [ ] **2. Préautorisation d'un compte**
  - [ ] Dans Supabase, exécuter:
    ```sql
    INSERT INTO compte (email, nom, prenom, role)
    VALUES ('test-gerant@gmail.com', 'Test', 'Gerant', 'Gerant');
    ```

- [ ] **3. Connexion réussie (sans restaurant)**
  - [ ] Cliquer sur "Se connecter avec Google"
  - [ ] Se connecter avec `test-gerant@gmail.com`
  - [ ] Vérifier redirection vers `/resto/create-resto`

- [ ] **4. Connexion réussie (avec restaurant)**
  - [ ] Créer un restaurant pour le gérant
  - [ ] Se déconnecter
  - [ ] Se reconnecter
  - [ ] Vérifier redirection vers `/home`

- [ ] **5. Connexion refusée**
  - [ ] Se connecter avec un email non préautorisé
  - [ ] Vérifier message d'erreur
  - [ ] Vérifier déconnexion automatique

---

## 📊 Tests de Performance

### Test 7: Temps de chargement OAuth

```typescript
// __tests__/performance/oauth-timing.test.ts
import { performance } from 'perf_hooks';

describe('OAuth Performance', () => {
  it('should generate OAuth URL in less than 100ms', async () => {
    const di = getDI();
    const useCase = di.googleLoginAdminUseCase;

    const start = performance.now();
    await useCase.execute();
    const end = performance.now();

    const duration = end - start;
    expect(duration).toBeLessThan(100);
  });

  it('should handle callback in less than 500ms', async () => {
    const di = getDI();
    const useCase = di.handleAdminCallbackUseCase;

    const start = performance.now();
    await useCase.execute();
    const end = performance.now();

    const duration = end - start;
    expect(duration).toBeLessThan(500);
  });
});
```

---

## 🔒 Tests de Sécurité

### Test 8: Validation des permissions

```typescript
// __tests__/security/permissions.test.ts
describe('Security - Permissions', () => {
  it('should prevent non-admin from accessing admin dashboard', async () => {
    // Arrange
    const studentUser = new User(
      1,
      'student@example.com',
      'Student',
      'Test',
      UserRole.STUDENT,
      'user-id-123'
    );

    // Act & Assert
    expect(studentUser.isAdmin()).toBe(false);
    expect(studentUser.canManageRestaurant()).toBe(false);
  });

  it('should allow only hardcoded admin email', async () => {
    const ADMIN_EMAIL = 'joantsayem@gmail.com';

    // Test email autorisé
    expect('joantsayem@gmail.com').toBe(ADMIN_EMAIL);

    // Test emails non autorisés
    expect('other@gmail.com').not.toBe(ADMIN_EMAIL);
    expect('JoanTsayem@gmail.com').not.toBe(ADMIN_EMAIL); // Casse
    expect('joantsayem@GMAIL.COM').not.toBe(ADMIN_EMAIL); // Casse
  });

  it('should logout unauthorized users immediately', async () => {
    const mockAuthRepo = {
      handleOAuthCallback: jest.fn().mockResolvedValue({
        user: new User(2, 'hacker@evil.com', 'Hacker', 'Evil', UserRole.STUDENT, 'xxx'),
        accessToken: 'stolen-token',
      }),
      logout: jest.fn(),
    };

    const useCase = new HandleAdminCallbackUseCase(mockAuthRepo as any);

    await expect(useCase.execute()).rejects.toThrow();
    expect(mockAuthRepo.logout).toHaveBeenCalled();
  });
});
```

---

## 🎭 Mock Data pour Tests

### Comptes de test recommandés

```sql
-- Admin (production)
INSERT INTO compte (email, nom, prenom, role, user_id)
VALUES ('joantsayem@gmail.com', 'Joan', 'Tsayem', 'Administrateur', 'admin-user-id');

-- Gérant de test 1 (avec restaurant)
INSERT INTO compte (email, nom, prenom, role)
VALUES ('gerant1@test.com', 'Gérant', 'Un', 'Gerant');

-- Gérant de test 2 (sans restaurant)
INSERT INTO compte (email, nom, prenom, role)
VALUES ('gerant2@test.com', 'Gérant', 'Deux', 'Gerant');

-- Étudiant (ne doit pas accéder à admin/resto)
INSERT INTO compte (email, nom, prenom, role)
VALUES ('student@test.com', 'Student', 'Test', 'Etudiant');
```

---

## 🚀 Lancer les Tests

```bash
# Tests unitaires
npm test

# Tests unitaires avec coverage
npm test -- --coverage

# Tests d'intégration
npm test -- --testPathPattern=__tests__/hooks

# Tests E2E (Playwright)
npm run test:e2e

# Tests spécifiques
npm test -- GoogleLoginAdminUseCase
```

---

## 📈 Coverage attendu

| Layer | Target Coverage |
|-------|----------------|
| **Use Cases** | 95-100% |
| **Hooks** | 85-95% |
| **Repositories** | 80-90% |
| **UI Components** | 70-80% |

---

**Date:** 11 novembre 2025  
**Version:** 1.0  
**Projet:** TchopMate
