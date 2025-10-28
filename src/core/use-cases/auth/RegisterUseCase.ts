/**
 * Use Case: Créer un nouveau compte utilisateur
 */

import { IAuthRepository, RegisterData } from '../../interfaces/IAuthRepository';
import { IUserRepository } from '../../interfaces/IUserRepository';
import { User, UserRole } from '../../entities/User';

export class RegisterUseCase {
  constructor(
    private authRepository: IAuthRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(data: RegisterData & { role: UserRole }): Promise<User> {
    // Validations métier
    this.validateRegistrationData(data);

    // Vérifier si l'email existe déjà
    const existingUser = await this.userRepository.getByEmail(data.email);
    if (existingUser) {
      throw new Error('Cet email est déjà utilisé');
    }

    // Créer le compte d'authentification
    const user = await this.authRepository.register(data);

    return user;
  }

  private validateRegistrationData(data: RegisterData & { role: UserRole }): void {
    if (!data.email || data.email.trim().length === 0) {
      throw new Error('L\'email est requis');
    }

    if (!data.password || data.password.length < 6) {
      throw new Error('Le mot de passe doit contenir au moins 6 caractères');
    }

    if (!data.nom || data.nom.trim().length === 0) {
      throw new Error('Le nom est requis');
    }

    if (!data.prenom || data.prenom.trim().length === 0) {
      throw new Error('Le prénom est requis');
    }

    if (!Object.values(UserRole).includes(data.role)) {
      throw new Error('Rôle invalide');
    }
  }
}
