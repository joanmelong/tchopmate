/**
 * Use Case: Déconnecter un utilisateur
 */

import { IAuthRepository } from '../../interfaces/IAuthRepository';

export class LogoutUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(): Promise<void> {
    await this.authRepository.logout();
  }
}
