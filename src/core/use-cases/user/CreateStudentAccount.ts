import { IUserRepository } from '@/core/interfaces/IUserRepository';
import { CreateUserDTO, UserDTO, UserRole } from '@/core/entities/User';

export class CreateStudentAccount {
  constructor(private userRepository: IUserRepository) {}

  async execute(data: CreateUserDTO): Promise<UserDTO> {
    // Validation
    if (!data.nom || !data.prenom) {
      throw new Error('Le nom et le prénom sont requis');
    }

    if (!data.email || !this.isValidEmail(data.email)) {
      throw new Error('L\'email est invalide');
    }

    if (data.password && !this.isValidPassword(data.password)) {
      throw new Error('Le mot de passe doit contenir au moins 8 caractères avec majuscule, minuscule et chiffre');
    }

    // Créer l'utilisateur
    const user = await this.userRepository.createUser({
      ...data,
      role: UserRole.STUDENT
    });

    // Envoyer email de confirmation
    await this.userRepository.sendEmail(
      user.email,
      'Bienvenue sur TchopMate',
      `Bonjour ${user.prenom}, votre compte a été créé avec succès !`
    );

    return user;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPassword(password: string): boolean {
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /[0-9]/.test(password);
  }
}