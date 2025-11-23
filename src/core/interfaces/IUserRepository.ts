// src/core/interfaces/IUserRepository.ts

import { UserDTO, CreateUserDTO } from '@/core/entities/User'

export interface IUserRepository {
  createUser(data: CreateUserDTO): Promise<UserDTO>
  findByEmail(email: string): Promise<UserDTO | null>
  findByMatricule(matricule: string): Promise<UserDTO | null>
  findById(id: string): Promise<UserDTO | null>
  updateUser(id: string, data: Partial<UserDTO>): Promise<UserDTO>
  sendEmail(to: string, subject: string, body: string): Promise<void>
}