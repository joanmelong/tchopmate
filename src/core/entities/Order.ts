/**
 * Entité Order (Commande) - Logique métier pure
 */

export enum OrderStatus {
  EN_ATTENTE = 'en_attente',
  EN_PREPARATION = 'en_preparation',
  PRETE = 'prete',
  RETIREE = 'retiree',
  ANNULEE = 'annulee',
}

export interface OrderItemProps {
  platId: number;
  platNom: string;
  quantite: number;
  prixUnitaire: number;
}

export class OrderItem {
  private props: OrderItemProps;

  constructor(props: OrderItemProps) {
    this.validateProps(props);
    this.props = { ...props };
  }

  get platId(): number {
    return this.props.platId;
  }

  get platNom(): string {
    return this.props.platNom;
  }

  get quantite(): number {
    return this.props.quantite;
  }

  get prixUnitaire(): number {
    return this.props.prixUnitaire;
  }

  calculateSubtotal(): number {
    return this.props.quantite * this.props.prixUnitaire;
  }

  private validateProps(props: OrderItemProps): void {
    if (props.quantite <= 0) {
      throw new Error('La quantité doit être supérieure à 0');
    }

    if (props.prixUnitaire <= 0) {
      throw new Error('Le prix unitaire doit être supérieur à 0');
    }
  }

  toObject(): OrderItemProps {
    return { ...this.props };
  }
}

export interface OrderProps {
  id: number;
  studentId: number;
  restaurantId: string;
  items: OrderItem[];
  status: OrderStatus;
  totalPrice: number;
  qrCode?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export class Order {
  private props: OrderProps;

  constructor(props: OrderProps) {
    this.validateProps(props);
    this.props = { ...props };
  }

  // Getters
  get id(): number {
    return this.props.id;
  }

  get studentId(): number {
    return this.props.studentId;
  }

  get restaurantId(): string {
    return this.props.restaurantId;
  }

  get items(): OrderItem[] {
    return this.props.items;
  }

  get status(): OrderStatus {
    return this.props.status;
  }

  get totalPrice(): number {
    return this.props.totalPrice;
  }

  get qrCode(): string | undefined {
    return this.props.qrCode;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  // Méthodes métier
  calculateTotal(): number {
    return this.items.reduce((total, item) => total + item.calculateSubtotal(), 0);
  }

  canBeCancelled(): boolean {
    return this.props.status === OrderStatus.EN_ATTENTE || 
           this.props.status === OrderStatus.EN_PREPARATION;
  }

  canBePickedUp(): boolean {
    return this.props.status === OrderStatus.PRETE;
  }

  cancel(): void {
    if (!this.canBeCancelled()) {
      throw new Error('Cette commande ne peut pas être annulée');
    }
    this.props.status = OrderStatus.ANNULEE;
    this.props.updatedAt = new Date();
  }

  markAsInPreparation(): void {
    if (this.props.status !== OrderStatus.EN_ATTENTE) {
      throw new Error('Seules les commandes en attente peuvent être mises en préparation');
    }
    this.props.status = OrderStatus.EN_PREPARATION;
    this.props.updatedAt = new Date();
  }

  markAsReady(): void {
    if (this.props.status !== OrderStatus.EN_PREPARATION) {
      throw new Error('Seules les commandes en préparation peuvent être marquées comme prêtes');
    }
    this.props.status = OrderStatus.PRETE;
    this.props.updatedAt = new Date();
  }

  markAsPickedUp(): void {
    if (!this.canBePickedUp()) {
      throw new Error('Seules les commandes prêtes peuvent être retirées');
    }
    this.props.status = OrderStatus.RETIREE;
    this.props.updatedAt = new Date();
  }

  isPending(): boolean {
    return this.props.status === OrderStatus.EN_ATTENTE;
  }

  isInPreparation(): boolean {
    return this.props.status === OrderStatus.EN_PREPARATION;
  }

  isReady(): boolean {
    return this.props.status === OrderStatus.PRETE;
  }

  isCompleted(): boolean {
    return this.props.status === OrderStatus.RETIREE;
  }

  isCancelled(): boolean {
    return this.props.status === OrderStatus.ANNULEE;
  }

  setQRCode(qrCode: string): void {
    this.props.qrCode = qrCode;
    this.props.updatedAt = new Date();
  }

  private validateProps(props: OrderProps): void {
    if (!props.items || props.items.length === 0) {
      throw new Error('Une commande doit contenir au moins un plat');
    }

    if (props.totalPrice <= 0) {
      throw new Error('Le montant total doit être supérieur à 0');
    }

    if (!Object.values(OrderStatus).includes(props.status)) {
      throw new Error('Statut de commande invalide');
    }

    const calculatedTotal = props.items.reduce(
      (total, item) => total + item.calculateSubtotal(), 
      0
    );

    if (Math.abs(calculatedTotal - props.totalPrice) > 0.01) {
      throw new Error('Le total de la commande ne correspond pas à la somme des items');
    }
  }

  toObject(): Omit<OrderProps, 'items'> & { items: OrderItemProps[] } {
    return {
      ...this.props,
      items: this.items.map(item => item.toObject()),
    };
  }
}
