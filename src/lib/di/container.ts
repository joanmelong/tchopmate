/**
 * Container d'injection de dépendances
 * Centralise la création et la gestion des dépendances
 */

import { SupabaseClient } from '@supabase/supabase-js';

// Repositories
import { IAuthRepository } from '@/core/interfaces/IAuthRepository';
import { IRestaurantRepository } from '@/core/interfaces/IRestaurantRepository';
import { IUserRepository } from '@/core/interfaces/IUserRepository';

import { SupabaseAuthRepository } from '@/data/repositories/SupabaseAuthRepository';
import { SupabaseRestaurantRepository } from '@/data/repositories/SupabaseRestaurantRepository';
import { SupabaseUserRepository } from '@/data/repositories/SupabaseUserRepository';

// Use Cases - Auth
import { LoginUseCase } from '@/core/use-cases/auth/LoginUseCase';
import { RegisterUseCase } from '@/core/use-cases/auth/RegisterUseCase';
import { GetCurrentSessionUseCase } from '@/core/use-cases/auth/GetCurrentSessionUseCase';
import { LogoutUseCase } from '@/core/use-cases/auth/LogoutUseCase';

// Use Cases - Restaurant
import { GetRestaurantUseCase } from '@/core/use-cases/restaurant/GetRestaurantUseCase';
import { GetRestaurantByGerantUseCase } from '@/core/use-cases/restaurant/GetRestaurantByGerantUseCase';
import { CreateRestaurantUseCase } from '@/core/use-cases/restaurant/CreateRestaurantUseCase';

/**
 * Le container DI suit le principe de l'inversion de dépendance
 * Les use cases dépendent des interfaces, pas des implémentations
 */
export class DIContainer {
  private static instance: DIContainer;
  
  // Repositories
  private _authRepository?: IAuthRepository;
  private _restaurantRepository?: IRestaurantRepository;
  private _userRepository?: IUserRepository;

  // Use Cases - Auth
  private _loginUseCase?: LoginUseCase;
  private _registerUseCase?: RegisterUseCase;
  private _getCurrentSessionUseCase?: GetCurrentSessionUseCase;
  private _logoutUseCase?: LogoutUseCase;

  // Use Cases - Restaurant
  private _getRestaurantUseCase?: GetRestaurantUseCase;
  private _getRestaurantByGerantUseCase?: GetRestaurantByGerantUseCase;
  private _createRestaurantUseCase?: CreateRestaurantUseCase;

  private constructor(private supabase: SupabaseClient) {}

  static initialize(supabase: SupabaseClient): void {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer(supabase);
    }
  }

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      throw new Error('DIContainer must be initialized before use');
    }
    return DIContainer.instance;
  }

  // ========== REPOSITORIES ==========

  get authRepository(): IAuthRepository {
    if (!this._authRepository) {
      this._authRepository = new SupabaseAuthRepository(this.supabase);
    }
    return this._authRepository;
  }

  get restaurantRepository(): IRestaurantRepository {
    if (!this._restaurantRepository) {
      this._restaurantRepository = new SupabaseRestaurantRepository(this.supabase);
    }
    return this._restaurantRepository;
  }

  get userRepository(): IUserRepository {
    if (!this._userRepository) {
      this._userRepository = new SupabaseUserRepository(this.supabase);
    }
    return this._userRepository;
  }

  // ========== USE CASES - AUTH ==========

  get loginUseCase(): LoginUseCase {
    if (!this._loginUseCase) {
      this._loginUseCase = new LoginUseCase(this.authRepository);
    }
    return this._loginUseCase;
  }

  get registerUseCase(): RegisterUseCase {
    if (!this._registerUseCase) {
      this._registerUseCase = new RegisterUseCase(
        this.authRepository,
        this.userRepository
      );
    }
    return this._registerUseCase;
  }

  get getCurrentSessionUseCase(): GetCurrentSessionUseCase {
    if (!this._getCurrentSessionUseCase) {
      this._getCurrentSessionUseCase = new GetCurrentSessionUseCase(this.authRepository);
    }
    return this._getCurrentSessionUseCase;
  }

  get logoutUseCase(): LogoutUseCase {
    if (!this._logoutUseCase) {
      this._logoutUseCase = new LogoutUseCase(this.authRepository);
    }
    return this._logoutUseCase;
  }

  // ========== USE CASES - RESTAURANT ==========

  get getRestaurantUseCase(): GetRestaurantUseCase {
    if (!this._getRestaurantUseCase) {
      this._getRestaurantUseCase = new GetRestaurantUseCase(this.restaurantRepository);
    }
    return this._getRestaurantUseCase;
  }

  get getRestaurantByGerantUseCase(): GetRestaurantByGerantUseCase {
    if (!this._getRestaurantByGerantUseCase) {
      this._getRestaurantByGerantUseCase = new GetRestaurantByGerantUseCase(
        this.restaurantRepository
      );
    }
    return this._getRestaurantByGerantUseCase;
  }

  get createRestaurantUseCase(): CreateRestaurantUseCase {
    if (!this._createRestaurantUseCase) {
      this._createRestaurantUseCase = new CreateRestaurantUseCase(this.restaurantRepository);
    }
    return this._createRestaurantUseCase;
  }
}

// Helper pour obtenir le container
export const getDI = () => DIContainer.getInstance();
