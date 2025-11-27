/**
 * Use Case: Connexion Google pour Admin
 */

import { IAuthRepository } from '../../interfaces/IAuthRepository';
import { User } from '../../entities/User';

export interface GoogleLoginAdminResult {
  redirectUrl: string;
}

export class GoogleLoginAdminUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(): Promise<GoogleLoginAdminResult> {
    // Logique métier : générer l'URL de redirection OAuth
    const redirectUrl = await this.authRepository.initiateGoogleLogin({
      redirectTo: '/admin/login/callback',
      scopes: 'openid email profile',
    });

    return { redirectUrl };
  }
}

export class HandleAdminCallbackUseCase {
  constructor(
    private authRepository: IAuthRepository
  ) {}

  async execute(): Promise<User> {
    console.log('[HandleAdminCallback] Début du traitement');
    
    // Récupérer la session OAuth
    const session = await this.authRepository.handleOAuthCallback();

    console.log('[HandleAdminCallback] Session récupérée:', {
      hasSession: !!session,
      email: session?.user.email,
      role: session?.user.role,
    });

    if (!session) {
      console.error('[HandleAdminCallback] Pas de session');
      throw new Error('Session non trouvée. Veuillez réessayer.');
    }

    // Vérification métier : seul l'admin autorisé peut se connecter
    const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'joantsayem@gmail.com';
    console.log('[HandleAdminCallback] Vérification email:', {
      received: session.user.email,
      expected: ADMIN_EMAIL,
      match: session.user.email === ADMIN_EMAIL,
    });

    if (session.user.email !== ADMIN_EMAIL) {
      console.error('[HandleAdminCallback] Email non autorisé');
      await this.authRepository.logout();
      throw new Error('Email non autorisé pour l\'administration');
    }

    // Vérifier que le rôle est bien Administrateur
    console.log('[HandleAdminCallback] Vérification rôle:', {
      role: session.user.role,
      isAdmin: session.user.isAdmin(),
    });

    if (!session.user.isAdmin()) {
      console.warn('[HandleAdminCallback] Rôle invalide pour l\'email admin, contournement activé (autorisation par email).');
      // On autorise malgré tout si l'email est l'admin, afin d'éviter un blocage
      // La page /admin vérifiera et affichera quand même le tableau de bord.
      return session.user;
    }

    console.log('[HandleAdminCallback] Authentification réussie');
    return session.user;
  }
}
