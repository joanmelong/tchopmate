/**
 * Test du use case LoginUseCase
 */

import { LoginUseCase } from '@/core/use-cases/auth/LoginUseCase';
import { IAuthRepository, AuthCredentials, AuthSession, RegisterData, GoogleLoginOptions } from '@/core/interfaces/IAuthRepository';
import { User, UserRole } from '@/core/entities/User';



export class MockAuthRepository implements IAuthRepository {
  // Pour inspecter ce que les tests ont fait
  public emailsSent: string[] = [];
  public sessions: AuthSession | null = null;

  async login(credentials: AuthCredentials): Promise<AuthSession> {
    if (credentials.email === 'test@example.com' && credentials.password === 'password123') {
      const user = new User({
        id: 1,
        nom: 'Test',
        prenom: 'User',
        email: credentials.email,
        role: UserRole.STUDENT,
      });

      const session = { user, accessToken: 'fake-token' };
      this.sessions = session;
      return session;
    }

    throw new Error('Invalid login credentials');
  }

  async register(data: RegisterData): Promise<User> {
    return new User({
      id: 999,
      ...data,
      role: UserRole.STUDENT
    });
  }

  async logout(): Promise<void> {
    this.sessions = null;
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    return this.sessions;
  }

  async isAuthenticated(): Promise<boolean> {
    return this.sessions !== null;
  }

  async resetPassword(email: string): Promise<void> {
    this.emailsSent.push(email);
  }

  async initiateGoogleLogin(options: GoogleLoginOptions): Promise<string> {
    return "https://mock.google.oauth/redirect";
  }

  async handleOAuthCallback(): Promise<AuthSession | null> {
    const user = new User({
      id: 2,
      nom: 'OAuth',
      prenom: 'User',
      email: 'oauth@test.com',
      role: UserRole.STUDENT,
    });

    return {
      user,
      accessToken: 'mock-oauth-token'
    };
  }
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
