/**
 * Use Case: Connexion Google pour Gérant
 */

import { IAuthRepository } from '../../interfaces/IAuthRepository';
import { IUserRepository } from '../../interfaces/IUserRepository';
import { User } from '../../entities/User';

export interface GoogleLoginGerantResult {
  redirectUrl: string;
}

export class GoogleLoginGerantUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(): Promise<GoogleLoginGerantResult> {
    // Logique métier : générer l'URL de redirection OAuth
    const redirectUrl = await this.authRepository.initiateGoogleLogin({
      redirectTo: '/resto/login/callback',
      scopes: 'openid email profile',
    });

    return { redirectUrl };
  }
}

export class HandleGerantCallbackUseCase {
  constructor(
    private authRepository: IAuthRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(): Promise<User> {
    // Récupérer la session OAuth
    const session = await this.authRepository.handleOAuthCallback();

    if (!session) {
      throw new Error('Session non trouvée');
    }

    // Vérification métier : l'utilisateur doit être un gérant
    const user = await this.userRepository.getByEmail(session.user.email);

    if (!user) {
      await this.authRepository.logout();
      throw new Error('Aucun compte gérant trouvé avec cet email');
    }

    if (!user.isStaff()) {
      await this.authRepository.logout();
      throw new Error('Cet email n\'est pas autorisé pour les gérants');
    }

    // Mettre à jour le user_id si nécessaire
    if (!user.userId || user.userId !== session.user.userId) {
      await this.userRepository.update(user.id, {
        // Le user_id sera mis à jour via le repository
      });
    }

    return user;
  }
}
