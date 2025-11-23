export enum UserRole {
  STUDENT = 'student',
  ADMIN = 'admin',
  STAFF = 'staff'
}

export interface UserProps {
  id: number | string;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
  matricule?: string;
  phone?: string;
  password_hash?: string;
  google_id?: string;
  created_at?: Date;
  updated_at?: Date;
}

export class User {
  public readonly id: number | string;
  public readonly nom: string;
  public readonly prenom: string;
  public readonly email: string;
  public readonly role: UserRole;
  public readonly matricule?: string;
  public readonly phone?: string;
  public readonly password_hash?: string;
  public readonly google_id?: string;
  public readonly created_at?: Date;
  public readonly updated_at?: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.nom = props.nom;
    this.prenom = props.prenom;
    this.email = props.email;
    this.role = props.role;
    this.matricule = props.matricule;
    this.phone = props.phone;
    this.password_hash = props.password_hash;
    this.google_id = props.google_id;
    this.created_at = props.created_at || new Date();
    this.updated_at = props.updated_at || new Date();
  }

  get fullName(): string {
    return `${this.prenom} ${this.nom}`;
  }
}

// DTOs
export interface UserDTO {
  id: number | string;
  nom: string;
  prenom: string;
  email: string;
  role: 'student' | 'admin' | 'restaurant'  // ← AJOUTER CETTE LIGNE
  matricule?: string;
  phone?: string;
  password_hash?: string;
  google_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserDTO {
  nom: string;
  prenom: string;
  email: string;
  password?: string;
  matricule?: string;
  phone?: string;
  google_id?: string;
  role?: UserRole;  // ← AJOUTER CETTE LIGNE

}