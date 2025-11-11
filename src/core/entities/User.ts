/**
 * Entité User - Logique métier pure
 * Cette classe ne dépend d'AUCUN framework ou bibliothèque externe
 * Elle contient uniquement la logique métier liée aux utilisateurs
 */

export enum UserRole {
  STUDENT = 'Etudiant',
  STAFF = 'Gerant',
  ADMIN = 'Admin',
}

export interface UserProps {
  id: number;
  userId?: string; // Auth provider ID (Supabase, etc.)
  nom: string;
  prenom: string;
  email: string;
  numeroTel?: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  private props: UserProps;

  constructor(props: UserProps) {
    this.validateProps(props);
    this.props = { ...props };
  }

  // Getters
  get id(): number {
    return this.props.id;
  }

  get userId(): string | undefined {
    return this.props.userId;
  }

  get nom(): string {
    return this.props.nom;
  }

  get prenom(): string {
    return this.props.prenom;
  }

  get email(): string {
    return this.props.email;
  }

  get numeroTel(): string | undefined {
    return this.props.numeroTel;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get fullName(): string {
    return `${this.props.prenom} ${this.props.nom}`;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  // Méthodes métier
  isStudent(): boolean {
    return this.props.role === UserRole.STUDENT;
  }

  isStaff(): boolean {
    return this.props.role === UserRole.STAFF;
  }

  isAdmin(): boolean {
    return this.props.role === UserRole.ADMIN;
  }

  canManageRestaurant(): boolean {
    return this.isStaff() || this.isAdmin();
  }

  canManageOrders(): boolean {
    return this.isStaff() || this.isAdmin();
  }

  // Validation métier
  private validateProps(props: UserProps): void {
    if (!props.nom || props.nom.trim().length === 0) {
      throw new Error('Le nom est requis');
    }

    if (!props.prenom || props.prenom.trim().length === 0) {
      throw new Error('Le prénom est requis');
    }

    if (!props.email || !this.isValidEmail(props.email)) {
      throw new Error('Email invalide');
    }

    if (!Object.values(UserRole).includes(props.role)) {
      throw new Error('Rôle invalide');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Pour faciliter la sérialisation
  toObject(): UserProps {
    return { ...this.props };
  }
}
