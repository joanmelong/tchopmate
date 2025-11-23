import { IUserRepository } from '@/core/interfaces/IUserRepository';
import { UserDTO } from '@/core/entities/User';
import * as bcrypt from 'bcrypt';

export interface LoginCredentials {
  identifier: string; // Email ou matricule
  password: string;
}

export interface LoginResult {
  user: UserDTO;
  token: string;
}

export class LoginWithPassword {
  constructor(private userRepository: IUserRepository) {}

  async execute(credentials: LoginCredentials): Promise<LoginResult> {
    // Validation
    if (!credentials.identifier || credentials.identifier.trim() === '') {
      throw new Error('L\'identifiant est requis');
    }

    if (!credentials.password || credentials.password.trim() === '') {
      throw new Error('Le mot de passe est requis');
    }

    // Rechercher l'utilisateur par email ou matricule
    let user: UserDTO | null = null;

    if (this.isEmail(credentials.identifier)) {
      user = await this.userRepository.findByEmail(credentials.identifier);
    } else {
      user = await this.userRepository.findByMatricule(credentials.identifier);
    }

    // Vérifier si l'utilisateur existe
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Vérifier si l'utilisateur a un mot de passe (pas OAuth)
    if (!user.password_hash) {
      throw new Error('Invalid credentials');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Générer le token JWT (simplifié pour les tests)
    const token = this.generateToken(user);

    return {
      user,
      token
    };
  }

  private isEmail(identifier: string): boolean {
    return identifier.includes('@');
  }

  private generateToken(user: UserDTO): string {
    // Token simplifié pour les tests
    // En production, utilisez jsonwebtoken
    return `token-${user.id}-${Date.now()}`;
  }
}