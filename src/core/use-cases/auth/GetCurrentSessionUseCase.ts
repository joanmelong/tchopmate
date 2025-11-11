/**
 * Use Case: Obtenir la session actuelle
 */

import { IAuthRepository, AuthSession } from '../../interfaces/IAuthRepository';

export class GetCurrentSessionUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(): Promise<AuthSession | null> {
    return await this.authRepository.getCurrentSession();
  }
}
