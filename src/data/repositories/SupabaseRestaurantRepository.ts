/**
 * Implémentation Supabase du repository Restaurant
 */

import { SupabaseClient } from '@supabase/supabase-js';
import {
  IRestaurantRepository,
  CreateRestaurantData,
  UpdateRestaurantData,
} from '@/core/interfaces/IRestaurantRepository';
import { Restaurant } from '@/core/entities/Restaurant';
import { RestaurantMapper } from '../mappers';
import { RestaurantDTO } from '../dto';

export class SupabaseRestaurantRepository implements IRestaurantRepository {
  constructor(private supabase: SupabaseClient) {}

  async getById(id: string): Promise<Restaurant | null> {
    const { data, error } = await this.supabase
      .from('restaurant')
      .select('*')
      .eq('id_restaurant', id)
      .single<RestaurantDTO>();

    if (error || !data) {
      return null;
    }

    return RestaurantMapper.toDomain(data);
  }

  async getByGerantId(gerantId: number): Promise<Restaurant | null> {
    const { data, error } = await this.supabase
      .from('restaurant')
      .select('*')
      .eq('gerant_id', gerantId)
      .single<RestaurantDTO>();

    if (error || !data) {
      return null;
    }

    return RestaurantMapper.toDomain(data);
  }

  async getAll(): Promise<Restaurant[]> {
    const { data, error } = await this.supabase
      .from('restaurant')
      .select('*');

    if (error || !data) {
      return [];
    }

    return data.map(dto => RestaurantMapper.toDomain(dto));
  }

  async create(createData: CreateRestaurantData): Promise<Restaurant> {
    const { data, error } = await this.supabase
      .from('restaurant')
      .insert({
        nom: createData.nom,
        localisation: createData.localisation,
        photo: createData.photo,
        gerant_id: createData.gerantId,
      })
      .select()
      .single<RestaurantDTO>();

    if (error || !data) {
      throw new Error('Erreur lors de la création du restaurant');
    }

    return RestaurantMapper.toDomain(data);
  }

  async update(id: string, updateData: UpdateRestaurantData): Promise<Restaurant> {
    const { data, error } = await this.supabase
      .from('restaurant')
      .update({
        nom: updateData.nom,
        localisation: updateData.localisation,
        photo: updateData.photo,
      })
      .eq('id_restaurant', id)
      .select()
      .single<RestaurantDTO>();

    if (error || !data) {
      throw new Error('Erreur lors de la mise à jour du restaurant');
    }

    return RestaurantMapper.toDomain(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('restaurant')
      .delete()
      .eq('id_restaurant', id);

    if (error) {
      throw new Error('Erreur lors de la suppression du restaurant');
    }
  }

  async gerantHasRestaurant(gerantId: number): Promise<boolean> {
    const { data } = await this.supabase
      .from('restaurant')
      .select('id_restaurant')
      .eq('gerant_id', gerantId)
      .single();

    return !!data;
  }
}
