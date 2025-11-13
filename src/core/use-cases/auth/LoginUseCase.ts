/**
 * Use Case: Authentifier un utilisateur
 * Ce use case ne connaît RIEN de Supabase, React, ou Next.js
 * Il dépend uniquement de l'interface IAuthRepository
 */

import { IAuthRepository, AuthCredentials, AuthSession } from '../../interfaces/IAuthRepository';

export class LoginUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(credentials: AuthCredentials): Promise<AuthSession> {
    // Validation métier
    if (!credentials.email || credentials.email.trim().length === 0) {
      throw new Error('L\'email est requis');
    }

    if (!credentials.password || credentials.password.length < 6) {
      throw new Error('Le mot de passe doit contenir au moins 6 caractères');
    }

    // Déléguer à l'authentification via le repository
    try {
      const session = await this.authRepository.login(credentials);
      return session;
    } catch (error) {
      // Transformer les erreurs techniques en erreurs métier
      if (error instanceof Error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou mot de passe incorrect');
        }
        throw error;
      }
      throw new Error('Une erreur s\'est produite lors de la connexion');
    }
  }
}
