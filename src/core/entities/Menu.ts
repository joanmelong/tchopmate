/**
 * Entité Menu et Plat - Logique métier pure
 */

export interface PlatProps {
  id: number;
  nom: string;
  description?: string;
  prix: number;
  photo?: string;
  disponible: boolean;
  menuId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Plat {
  private props: PlatProps;

  constructor(props: PlatProps) {
    this.validateProps(props);
    this.props = { ...props };
  }

  // Getters
  get id(): number {
    return this.props.id;
  }

  get nom(): string {
    return this.props.nom;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get prix(): number {
    return this.props.prix;
  }

  get photo(): string | undefined {
    return this.props.photo;
  }

  get disponible(): boolean {
    return this.props.disponible;
  }

  get menuId(): number {
    return this.props.menuId;
  }

  // Méthodes métier
  isAvailable(): boolean {
    return this.props.disponible;
  }

  setDisponible(disponible: boolean): void {
    this.props.disponible = disponible;
    this.props.updatedAt = new Date();
  }

  updatePrix(nouveauPrix: number): void {
    if (nouveauPrix <= 0) {
      throw new Error('Le prix doit être supérieur à 0');
    }
    this.props.prix = nouveauPrix;
    this.props.updatedAt = new Date();
  }

  calculateTotalPrice(quantity: number): number {
    if (quantity <= 0) {
      throw new Error('La quantité doit être supérieure à 0');
    }
    return this.props.prix * quantity;
  }

  private validateProps(props: PlatProps): void {
    if (!props.nom || props.nom.trim().length === 0) {
      throw new Error('Le nom du plat est requis');
    }

    if (props.prix <= 0) {
      throw new Error('Le prix doit être supérieur à 0');
    }

    if (!props.menuId || props.menuId <= 0) {
      throw new Error('Le plat doit appartenir à un menu');
    }
  }

  toObject(): PlatProps {
    return { ...this.props };
  }
}

export interface MenuProps {
  id: number;
  nom: string;
  description?: string;
  restaurantId: string;
  plats?: Plat[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Menu {
  private props: MenuProps;

  constructor(props: MenuProps) {
    this.validateProps(props);
    this.props = { ...props, plats: props.plats || [] };
  }

  // Getters
  get id(): number {
    return this.props.id;
  }

  get nom(): string {
    return this.props.nom;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get restaurantId(): string {
    return this.props.restaurantId;
  }

  get plats(): Plat[] {
    return this.props.plats || [];
  }

  // Méthodes métier
  getAvailablePlats(): Plat[] {
    return this.plats.filter(plat => plat.isAvailable());
  }

  getPlatById(platId: number): Plat | undefined {
    return this.plats.find(plat => plat.id === platId);
  }

  getTotalPlats(): number {
    return this.plats.length;
  }

  getAvailablePlatsCount(): number {
    return this.getAvailablePlats().length;
  }

  private validateProps(props: MenuProps): void {
    if (!props.nom || props.nom.trim().length === 0) {
      throw new Error('Le nom du menu est requis');
    }

    if (!props.restaurantId) {
      throw new Error('Le menu doit appartenir à un restaurant');
    }
  }

  toObject(): Omit<MenuProps, 'plats'> & { plats?: PlatProps[] } {
    return {
      ...this.props,
      plats: this.plats.map(plat => plat.toObject()),
    };
  }
}
