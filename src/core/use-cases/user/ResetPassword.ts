// src/core/use-cases/user/ResetPassword.ts

import { IUserRepository } from '@/core/interfaces/IUserRepository'
import * as crypto from 'crypto'
import * as bcrypt from 'bcrypt'

export default class ResetPassword {
  // Stockage temporaire des tokens (en vrai → Redis ou DB)
  private resetTokens = new Map<string, { userId: string; expiresAt: Date }>()

  constructor(private readonly userRepo: IUserRepository) {}

  // Retourne le token brut (uniquement en test !)
  async requestReset(email: string): Promise<string> {
    const user = await this.userRepo.findByEmail(email)

    let token = ''
    if (user) {
      token = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

      this.resetTokens.set(token, { userId: String(user.id), expiresAt })

      await this.userRepo.sendEmail(
        user.email,
        'Réinitialisation de mot de passe',
        `Votre lien : http://localhost:3000/reset?token=${token}`
      )
    }

    // En prod tu retournerais juste un message, mais pour les tests on retourne le token
    return token // ← IMPORTANT : on retourne le vrai token ici
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const data = this.resetTokens.get(token)

    if (!data) {
      throw new Error('Token expired or invalid')
    }

    if (data.expiresAt < new Date()) {
      this.resetTokens.delete(token)
      throw new Error('Token expired')
    }

    const hash = await bcrypt.hash(newPassword, 10)
    await this.userRepo.updateUser(data.userId, { password_hash: hash })

    // Nettoyage
    this.resetTokens.delete(token)
  }
}