/**
 * Implémentation Supabase du repository User
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { IUserRepository, UpdateUserData } from '@/core/interfaces/IUserRepository';
import { User, UserRole } from '@/core/entities/User';
import { UserMapper } from '../mappers';
import { CompteDTO } from '../dto';

export class SupabaseUserRepository implements IUserRepository {
  constructor(private supabase: SupabaseClient) {}

  async getById(id: number): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('compte')
      .select('*')
      .eq('id', id)
      .single<CompteDTO>();

    if (error || !data) {
      return null;
    }

    return UserMapper.toDomain(data);
  }

  async getByAuthId(authId: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('compte')
      .select('*')
      .eq('user_id', authId)
      .single<CompteDTO>();

    if (error || !data) {
      return null;
    }

    return UserMapper.toDomain(data);
  }

  async getByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('compte')
      .select('*')
      .eq('email', email)
      .single<CompteDTO>();

    if (error || !data) {
      return null;
    }

    return UserMapper.toDomain(data);
  }

  async getByRole(role: UserRole): Promise<User[]> {
    const { data, error } = await this.supabase
      .from('compte')
      .select('*')
      .eq('role', role);

    if (error || !data) {
      return [];
    }

    return data.map(dto => UserMapper.toDomain(dto));
  }

  async create(createData: {
    userId: string;
    nom: string;
    prenom: string;
    email: string;
    numeroTel?: string;
    role: UserRole;
  }): Promise<User> {
    const { data, error } = await this.supabase
      .from('compte')
      .insert({
        user_id: createData.userId,
        nom: createData.nom,
        prenom: createData.prenom,
        email: createData.email,
        numero_tel: createData.numeroTel,
        role: createData.role,
      })
      .select()
      .single<CompteDTO>();

    if (error || !data) {
      throw new Error('Erreur lors de la création du profil utilisateur');
    }

    return UserMapper.toDomain(data);
  }

  async update(id: number, updateData: UpdateUserData): Promise<User> {
    const { data, error } = await this.supabase
      .from('compte')
      .update({
        nom: updateData.nom,
        prenom: updateData.prenom,
        numero_tel: updateData.numeroTel,
        email: updateData.email,
      })
      .eq('id', id)
      .select()
      .single<CompteDTO>();

    if (error || !data) {
      throw new Error('Erreur lors de la mise à jour du profil');
    }

    return UserMapper.toDomain(data);
  }

  async delete(id: number): Promise<void> {
    const { error } = await this.supabase
      .from('compte')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error('Erreur lors de la suppression du profil');
    }
  }
}
