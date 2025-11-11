/**
 * Implémentation Supabase du repository d'authentification
 * Cette couche CONNAÎT Supabase mais le métier ne la connaît pas
 */

import { SupabaseClient } from '@supabase/supabase-js';
import {
  IAuthRepository,
  AuthCredentials,
  RegisterData,
  AuthSession,
} from '@/core/interfaces/IAuthRepository';
import { User, UserRole } from '@/core/entities/User';
import { UserMapper } from '../mappers';
import { CompteDTO } from '../dto';

export class SupabaseAuthRepository implements IAuthRepository {
  constructor(private supabase: SupabaseClient) {}

  async login(credentials: AuthCredentials): Promise<AuthSession> {
    // Authentification Supabase
    const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (authError || !authData.user || !authData.session) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Récupérer le profil utilisateur
    const { data: compteData, error: compteError } = await this.supabase
      .from('compte')
      .select('*')
      .eq('user_id', authData.user.id)
      .single<CompteDTO>();

    if (compteError || !compteData) {
      throw new Error('Profil utilisateur non trouvé');
    }

    // Convertir en entité métier
    const user = UserMapper.toDomain(compteData);

    return {
      user,
      accessToken: authData.session.access_token,
      refreshToken: authData.session.refresh_token,
    };
  }

  async register(data: RegisterData): Promise<User> {
    // Créer le compte d'authentification
    const { data: authData, error: authError } = await this.supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || 'Erreur lors de la création du compte');
    }

    // Créer le profil utilisateur
    const { data: compteData, error: compteError } = await this.supabase
      .from('compte')
      .insert({
        user_id: authData.user.id,
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        numero_tel: data.numeroTel,
        role: UserRole.STUDENT, // Par défaut
      })
      .select()
      .single<CompteDTO>();

    if (compteError || !compteData) {
      throw new Error('Erreur lors de la création du profil');
    }

    return UserMapper.toDomain(compteData);
  }

  async logout(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      throw new Error('Erreur lors de la déconnexion');
    }
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    const { data: { session } } = await this.supabase.auth.getSession();

    if (!session?.user) {
      return null;
    }

    // Récupérer le profil
    const { data: compteData } = await this.supabase
      .from('compte')
      .select('*')
      .eq('user_id', session.user.id)
      .single<CompteDTO>();

    if (!compteData) {
      return null;
    }

    const user = UserMapper.toDomain(compteData);

    return {
      user,
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
    };
  }

  async isAuthenticated(): Promise<boolean> {
    const session = await this.getCurrentSession();
    return session !== null;
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email);
    if (error) {
      throw new Error('Erreur lors de la réinitialisation du mot de passe');
    }
  }
}
