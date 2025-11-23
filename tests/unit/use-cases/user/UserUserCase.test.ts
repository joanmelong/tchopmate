// ============================================
// TEST 1 : User & Authentication Use Cases
// ============================================
// File: tests/unit/use-cases/user/UserUseCases.test.ts

import { CreateStudentAccount } from '@/core/use-cases/user/CreateStudentAccount'
import { LoginWithPassword } from '@/core/use-cases/user/LoginWithPassword'
import  ResetPassword  from '@/core/use-cases/user/ResetPassword'
import { IUserRepository } from '@/core/interfaces/IUserRepository'
import { UserDTO, CreateUserDTO } from '@/core/entities/User'
import * as bcrypt from 'bcrypt'
import { describe, test, expect, beforeEach } from '@jest/globals'

// Mock User Repository
// Dans ton fichier de test (ou dans un dossier __mocks__)

class MockUserRepo implements IUserRepository {
  public users: UserDTO[] = []
  public emailsSent: string[] = []

  async createUser(data: CreateUserDTO): Promise<UserDTO> {
    if (this.users.some(u => u.email === data.email)) {
      throw new Error('Email already exists')
    }

    const newUser: UserDTO = {
      id: `user-${Math.random().toString(36).substr(2, 9)}`,
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      matricule: data.matricule,
      password_hash: data.password ? await bcrypt.hash(data.password, 10) : undefined,
      google_id: data.google_id,
      phone: data.phone,
      created_at: new Date(),
      updated_at: new Date(),
      role: 'student'
    }
    this.users.push(newUser)
    return newUser
  }

  async findByEmail(email: string): Promise<UserDTO | null> {
    return this.users.find(u => u.email === email) || null
  }

  async findByMatricule(matricule: string): Promise<UserDTO | null> {
    return this.users.find(u => u.matricule === matricule) || null
  }

  async findById(id: string): Promise<UserDTO | null> {
    return this.users.find(u => u.id === id) || null
  }

  async updateUser(id: string, data: Partial<UserDTO>): Promise<UserDTO> {
    const idx = this.users.findIndex(u => u.id === id)
    if (idx === -1) throw new Error('User not found')
    
    this.users[idx] = { ...this.users[idx], ...data, updated_at: new Date() }
    return this.users[idx]
  }

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    this.emailsSent.push(to)
  }
}


describe('User & Authentication Use Cases', () => {
  let repo: MockUserRepo

  beforeEach(() => {
    repo = new MockUserRepo()
    // Utilisateur existant pour les tests de connexion
    repo.users = [
      {
        id: 'u1',
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@univ.cm',
        matricule: '21A001',
        password_hash: bcrypt.hashSync('Password123!', 10),
        phone: '+237600000000',
        created_at: new Date(),
        updated_at: new Date(),
        role: 'student'
      }
    ]
  })

  // ========== CreateStudentAccount Tests ==========
  
  describe('CreateStudentAccount', () => {
    test('should create account with email and password', async () => {
      const useCase = new CreateStudentAccount(repo)
      
      const result = await useCase.execute({
        nom: 'Kamga',
        prenom: 'Marie',
        email: 'marie.kamga@univ.cm',
        password: 'SecurePass123!',
        phone: '+237677777777'
      })

      expect(result).toBeDefined()
      expect(result.email).toBe('marie.kamga@univ.cm')
      expect(result.nom).toBe('Kamga')
      expect(result.password_hash).toBeDefined()
      expect(result.password_hash).not.toBe('SecurePass123!') // Doit être hashé
      expect(repo.emailsSent).toContain('marie.kamga@univ.cm') // Email de confirmation
    })

    test('should create account with Google OAuth', async () => {
      const useCase = new CreateStudentAccount(repo)
      
      const result = await useCase.execute({
        nom: 'Nkono',
        prenom: 'Paul',
        email: 'paul.nkono@gmail.com',
        google_id: 'google-oauth-12345',
        phone: '+237688888888'
      })

      expect(result).toBeDefined()
      expect(result.google_id).toBe('google-oauth-12345')
      expect(result.password_hash).toBeUndefined()
    })

    test('should reject duplicate email', async () => {
      const useCase = new CreateStudentAccount(repo)
      
      await expect(useCase.execute({
        nom: 'Test',
        prenom: 'User',
        email: 'jean.dupont@univ.cm', // Email déjà existant
        password: 'Password123!'
      })).rejects.toThrow('Email already exists')
    })

    test('should reject weak password', async () => {
      const useCase = new CreateStudentAccount(repo)
      
      await expect(useCase.execute({
        nom: 'Test',
        prenom: 'User',
        email: 'test@univ.cm',
        password: '123' // Trop faible
      })).rejects.toThrow('Le mot de passe doit contenir')
    })

    test('should reject invalid email format', async () => {
      const useCase = new CreateStudentAccount(repo)
      
      await expect(useCase.execute({
        nom: 'Test',
        prenom: 'User',
        email: 'invalid-email',
        password: 'Password123!'
      })).rejects.toThrow(/email/i)
    })

    test('should reject missing required fields', async () => {
      const useCase = new CreateStudentAccount(repo)
      
      await expect(useCase.execute({
        email: 'test@univ.cm'
      } as any)).rejects.toThrow()
    })
  })

  // ========== LoginWithPassword Tests ==========
  
  describe('LoginWithPassword', () => {
    test('should login successfully with email', async () => {
      const useCase = new LoginWithPassword(repo)
      
      const result = await useCase.execute({
        identifier: 'jean.dupont@univ.cm',
        password: 'Password123!'
      })

      expect(result).toBeDefined()
      expect(result.user).toBeDefined()
      expect(result.token).toBeDefined()
      expect(result.user.email).toBe('jean.dupont@univ.cm')
    })

    test('should login successfully with matricule', async () => {
      const useCase = new LoginWithPassword(repo)
      
      const result = await useCase.execute({
        identifier: '21A001',
        password: 'Password123!'
      })

      expect(result).toBeDefined()
      expect(result.user.matricule).toBe('21A001')
    })

    test('should reject unknown identifier', async () => {
      const useCase = new LoginWithPassword(repo)
      
      await expect(useCase.execute({
        identifier: 'unknown@test.cm',
        password: 'Password123!'
      })).rejects.toThrow('Invalid credentials')
    })

    test('should reject wrong password', async () => {
      const useCase = new LoginWithPassword(repo)
      
      await expect(useCase.execute({
        identifier: 'jean.dupont@univ.cm',
        password: 'WrongPassword'
      })).rejects.toThrow('Invalid credentials')
    })

    test('should reject empty credentials', async () => {
      const useCase = new LoginWithPassword(repo)
      
      await expect(useCase.execute({
        identifier: '',
        password: ''
      })).rejects.toThrow()
    })
  })

  // ========== ResetPassword Tests ==========
  
  describe('ResetPassword', () => {
    test('should send reset email', async () => {
      const useCase = new ResetPassword(repo)
      
      await useCase.requestReset('jean.dupont@univ.cm')

      expect(repo.emailsSent).toContain('jean.dupont@univ.cm')
    })

    test('should not reveal if email exists', async () => {
      const useCase = new ResetPassword(repo)
      
      // Ne doit pas throw même si l'email n'existe pas (sécurité)
      await expect(useCase.requestReset('unknown@test.cm')).resolves.not.toThrow()
    })

    test('should reset password with valid token', async () => {
      const useCase = new ResetPassword(repo)
      
      const token = await useCase.requestReset('jean.dupont@univ.cm')
      
      await useCase.resetPassword(token, 'NewPassword123!')

      // Vérifier que le nouveau mot de passe fonctionne
      const loginUseCase = new LoginWithPassword(repo)
      const result = await loginUseCase.execute({
        identifier: 'jean.dupont@univ.cm',
        password: 'NewPassword123!'
      })

      expect(result).toBeDefined()
    })

    test('should reject expired token', async () => {
      const useCase = new ResetPassword(repo)
      
      await expect(useCase.resetPassword('expired-token', 'NewPass123!'))
        .rejects.toThrow('expired')
    })
  })
})