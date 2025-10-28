/**
 * Entité Restaurant - Logique métier pure
 * Aucune dépendance externe
 */

export interface RestaurantProps {
  id: string;
  nom: string;
  localisation?: string;
  photo?: string;
  gerantId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Restaurant {
  private props: RestaurantProps;

  constructor(props: RestaurantProps) {
    this.validateProps(props);
    this.props = { ...props };
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get nom(): string {
    return this.props.nom;
  }

  get localisation(): string | undefined {
    return this.props.localisation;
  }

  get photo(): string | undefined {
    return this.props.photo;
  }

  get gerantId(): number {
    return this.props.gerantId;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  // Méthodes métier
  hasPhoto(): boolean {
    return !!this.props.photo && this.props.photo.trim().length > 0;
  }

  hasLocation(): boolean {
    return !!this.props.localisation && this.props.localisation.trim().length > 0;
  }

  isManagedBy(gerantId: number): boolean {
    return this.props.gerantId === gerantId;
  }

  updateNom(nom: string): void {
    if (!nom || nom.trim().length === 0) {
      throw new Error('Le nom du restaurant est requis');
    }
    this.props.nom = nom;
    this.props.updatedAt = new Date();
  }

  updateLocalisation(localisation: string): void {
    this.props.localisation = localisation;
    this.props.updatedAt = new Date();
  }

  updatePhoto(photo: string): void {
    this.props.photo = photo;
    this.props.updatedAt = new Date();
  }

  // Validation métier
  private validateProps(props: RestaurantProps): void {
    if (!props.nom || props.nom.trim().length === 0) {
      throw new Error('Le nom du restaurant est requis');
    }

    if (!props.gerantId || props.gerantId <= 0) {
      throw new Error('Un restaurant doit avoir un gérant');
    }

    if (props.nom.length > 100) {
      throw new Error('Le nom du restaurant ne peut pas dépasser 100 caractères');
    }
  }

  toObject(): RestaurantProps {
    return { ...this.props };
  }
}
