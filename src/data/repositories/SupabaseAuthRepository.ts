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
  GoogleLoginOptions,
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

  async initiateGoogleLogin(options: GoogleLoginOptions): Promise<string> {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${options.redirectTo}`,
        scopes: options.scopes || 'openid email profile',
      },
    });

    if (error || !data.url) {
      throw new Error('Erreur lors de l\'initialisation de la connexion Google');
    }

    return data.url;
  }

  async handleOAuthCallback(): Promise<AuthSession | null> {
    // Attendre que la session soit échangée avec le code OAuth
    // Supabase gère automatiquement l'échange du code en session
    const { data: { session }, error } = await this.supabase.auth.getSession();

    if (error) {
      console.error('[SupabaseAuthRepository] Erreur getSession:', error);
      return null;
    }

    if (!session?.user) {
      console.warn('[SupabaseAuthRepository] Pas de session utilisateur');
      return null;
    }

    console.log('[SupabaseAuthRepository] Session OAuth récupérée:', {
      userId: session.user.id,
      email: session.user.email,
    });

    // Récupérer ou créer le profil utilisateur
    const { data: compteData, error: compteError } = await this.supabase
      .from('compte')
      .select('*')
      .eq('user_id', session.user.id)
      .single<CompteDTO>();
    
    let finalCompteData = compteData;

    console.log('[SupabaseAuthRepository] Recherche compte par user_id:', {
      userId: session.user.id,
      found: !!finalCompteData,
      error: compteError?.message,
    });

    // Si pas trouvé par user_id, chercher par email
    if (!finalCompteData) {
      const { data: compteByEmail } = await this.supabase
        .from('compte')
        .select('*')
        .eq('email', session.user.email!)
        .single<CompteDTO>();

      console.log('[SupabaseAuthRepository] Recherche compte par email:', {
        email: session.user.email,
        found: !!compteByEmail,
      });

      if (compteByEmail) {
        // Mettre à jour le user_id
        const { data: updatedCompte, error: updateError } = await this.supabase
          .from('compte')
          .update({ user_id: session.user.id })
          .eq('id', compteByEmail.id)
          .select()
          .single<CompteDTO>();

        if (!updateError && updatedCompte) {
          console.log('[SupabaseAuthRepository] Compte mis à jour avec user_id');
          finalCompteData = updatedCompte;
        }
      }
    }

    // Si le compte n'existe toujours pas, le créer
    if (!finalCompteData) {
      console.log('[SupabaseAuthRepository] Création nouveau compte');
      const { data: newCompte, error: createError } = await this.supabase
        .from('compte')
        .insert({
          user_id: session.user.id,
          email: session.user.email!,
          nom: session.user.user_metadata?.family_name || '',
          prenom: session.user.user_metadata?.given_name || '',
          role: UserRole.STUDENT,
        })
        .select()
        .single<CompteDTO>();

      if (createError || !newCompte) {
        throw new Error('Erreur lors de la création du profil');
      }

      finalCompteData = newCompte;
    }

    const user = UserMapper.toDomain(finalCompteData);

    return {
      user,
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
    };
  }
}
