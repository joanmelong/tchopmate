/**
 * Interface de repository pour les utilisateurs
 */

import { User, UserRole } from '../entities/User';

export interface UpdateUserData {
  nom?: string;
  prenom?: string;
  numeroTel?: string;
  email?: string;
}

export interface IUserRepository {
  /**
   * Récupérer un utilisateur par son ID
   */
  getById(id: number): Promise<User | null>;

  /**
   * Récupérer un utilisateur par son user_id d'authentification
   */
  getByAuthId(authId: string): Promise<User | null>;

  /**
   * Récupérer un utilisateur par son email
   */
  getByEmail(email: string): Promise<User | null>;

  /**
   * Récupérer tous les utilisateurs d'un certain rôle
   */
  getByRole(role: UserRole): Promise<User[]>;

  /**
   * Créer un nouveau profil utilisateur
   */
  create(data: {
    userId: string;
    nom: string;
    prenom: string;
    email: string;
    numeroTel?: string;
    role: UserRole;
  }): Promise<User>;

  /**
   * Mettre à jour un utilisateur
   */
  update(id: number, data: UpdateUserData): Promise<User>;

  /**
   * Supprimer un utilisateur
   */
  delete(id: number): Promise<void>;
}
