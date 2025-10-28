/**
 * Test du use case LoginUseCase
 */

import { LoginUseCase } from '@/core/use-cases/auth/LoginUseCase';
import { IAuthRepository, AuthCredentials, AuthSession } from '@/core/interfaces/IAuthRepository';
import { User, UserRole } from '@/core/entities/User';

// Mock du repository
class MockAuthRepository implements IAuthRepository {
  async login(credentials: AuthCredentials): Promise<AuthSession> {
    if (credentials.email === 'test@example.com' && credentials.password === 'password123') {
      const user = new User({
        id: 1,
        nom: 'Test',
        prenom: 'User',
        email: credentials.email,
        role: UserRole.STUDENT,
      });

      return {
        user,
        accessToken: 'fake-token',
      };
    }

    throw new Error('Invalid login credentials');
  }

  async register(): Promise<User> {
    throw new Error('Not implemented');
  }

  async logout(): Promise<void> {}
  
  async getCurrentSession(): Promise<AuthSession | null> {
    return null;
  }

  async isAuthenticated(): Promise<boolean> {
    return false;
  }

  async resetPassword(): Promise<void> {}
}

describe('LoginUseCase', () => {
  let mockRepo: IAuthRepository;
  let useCase: LoginUseCase;

  beforeEach(() => {
    mockRepo = new MockAuthRepository();
    useCase = new LoginUseCase(mockRepo);
  });

  describe('Validation', () => {
    it('devrait rejeter un email vide', async () => {
      await expect(
        useCase.execute({ email: '', password: 'password123' })
      ).rejects.toThrow('L\'email est requis');
    });

    it('devrait rejeter un mot de passe trop court', async () => {
      await expect(
        useCase.execute({ email: 'test@example.com', password: '123' })
      ).rejects.toThrow('Le mot de passe doit contenir au moins 6 caractères');
    });
  });

  describe('Authentification', () => {
    it('devrait authentifier avec des identifiants valides', async () => {
      const session = await useCase.execute({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(session).toBeDefined();
      expect(session.user.email).toBe('test@example.com');
      expect(session.accessToken).toBe('fake-token');
    });

    it('devrait rejeter des identifiants invalides', async () => {
      await expect(
        useCase.execute({
          email: 'wrong@example.com',
          password: 'wrongpass',
        })
      ).rejects.toThrow('Email ou mot de passe incorrect');
    });
  });
});
