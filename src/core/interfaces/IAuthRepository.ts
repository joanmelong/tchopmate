/**
 * Interface de repository pour l'authentification
 * Cette interface définit le CONTRAT - l'implémentation concrète sera dans la couche data/
 */

import { User } from '../entities/User';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  numeroTel?: string;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

export interface GoogleLoginOptions {
  redirectTo: string;
  scopes?: string;
}

/**
 * Le repository ne retourne que des entités métier ou des erreurs
 * Il ne doit JAMAIS exposer des détails d'implémentation (Supabase, etc.)
 */
export interface IAuthRepository {
  /**
   * Authentifier un utilisateur
   */
  login(credentials: AuthCredentials): Promise<AuthSession>;

  /**
   * Créer un nouveau compte utilisateur
   */
  register(data: RegisterData): Promise<User>;

  /**
   * Déconnecter l'utilisateur
   */
  logout(): Promise<void>;

  /**
   * Récupérer la session actuelle
   */
  getCurrentSession(): Promise<AuthSession | null>;

  /**
   * Vérifier si un utilisateur est authentifié
   */
  isAuthenticated(): Promise<boolean>;

  /**
   * Réinitialiser le mot de passe
   */
  resetPassword(email: string): Promise<void>;

  /**
   * Initier la connexion Google OAuth
   */
  initiateGoogleLogin(options: GoogleLoginOptions): Promise<string>;

  /**
   * Gérer le callback OAuth après redirection
   */
  handleOAuthCallback(): Promise<AuthSession | null>;
}
