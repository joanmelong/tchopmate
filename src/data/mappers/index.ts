/**
 * Mappers - Convertissent entre DTOs (base de données) et Entités (métier)
 */

import { User, UserRole, UserProps } from '@/core/entities/User';
import { Restaurant, RestaurantProps } from '@/core/entities/Restaurant';
import { Menu, MenuProps, Plat, PlatProps } from '@/core/entities/Menu';
import { 
  Order, 
  OrderProps, 
  OrderItem, 
  OrderItemProps, 
  OrderStatus 
} from '@/core/entities/Order';
import { 
  CompteDTO, 
  RestaurantDTO, 
  MenuDTO, 
  PlatDTO,
  CommandeDTO,
  LigneCommandeDTO
} from '../dto';

export class UserMapper {
  static toDomain(dto: CompteDTO): User {
    const props: UserProps = {
      id: dto.id,
      userId: dto.user_id,
      nom: dto.nom,
      prenom: dto.prenom,
      email: dto.email,
      numeroTel: dto.numero_tel,
      role: dto.role as UserRole,
      createdAt: dto.created_at ? new Date(dto.created_at) : undefined,
      updatedAt: dto.updated_at ? new Date(dto.updated_at) : undefined,
    };
    return new User(props);
  }

  static toDTO(user: User): Partial<CompteDTO> {
    return {
      id: user.id,
      user_id: user.userId,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      numero_tel: user.numeroTel,
      role: user.role,
    };
  }
}

export class RestaurantMapper {
  static toDomain(dto: RestaurantDTO): Restaurant {
    const props: RestaurantProps = {
      id: dto.id_restaurant,
      nom: dto.nom,
      localisation: dto.localisation,
      photo: dto.photo,
      gerantId: dto.gerant_id,
      createdAt: dto.created_at ? new Date(dto.created_at) : undefined,
      updatedAt: dto.updated_at ? new Date(dto.updated_at) : undefined,
    };
    return new Restaurant(props);
  }

  static toDTO(restaurant: Restaurant): Partial<RestaurantDTO> {
    return {
      id_restaurant: restaurant.id,
      nom: restaurant.nom,
      localisation: restaurant.localisation,
      photo: restaurant.photo,
      gerant_id: restaurant.gerantId,
    };
  }
}

export class PlatMapper {
  static toDomain(dto: PlatDTO): Plat {
    const props: PlatProps = {
      id: dto.id,
      nom: dto.nom,
      description: dto.description,
      prix: dto.prix,
      photo: dto.photo,
      disponible: dto.disponible,
      menuId: dto.menu_id,
      createdAt: dto.created_at ? new Date(dto.created_at) : undefined,
      updatedAt: dto.updated_at ? new Date(dto.updated_at) : undefined,
    };
    return new Plat(props);
  }

  static toDTO(plat: Plat): Partial<PlatDTO> {
    return {
      id: plat.id,
      nom: plat.nom,
      description: plat.description,
      prix: plat.prix,
      photo: plat.photo,
      disponible: plat.disponible,
      menu_id: plat.menuId,
    };
  }
}

export class MenuMapper {
  static toDomain(dto: MenuDTO, plats?: PlatDTO[]): Menu {
    const props: MenuProps = {
      id: dto.id,
      nom: dto.nom,
      description: dto.description,
      restaurantId: dto.restaurant_id,
      plats: plats?.map(p => PlatMapper.toDomain(p)),
      createdAt: dto.created_at ? new Date(dto.created_at) : undefined,
      updatedAt: dto.updated_at ? new Date(dto.updated_at) : undefined,
    };
    return new Menu(props);
  }

  static toDTO(menu: Menu): Partial<MenuDTO> {
    return {
      id: menu.id,
      nom: menu.nom,
      description: menu.description,
      restaurant_id: menu.restaurantId,
    };
  }
}

export class OrderItemMapper {
  static toDomain(dto: LigneCommandeDTO & { plat_nom?: string }): OrderItem {
    const props: OrderItemProps = {
      platId: dto.plat_id,
      platNom: dto.plat_nom || '',
      quantite: dto.quantite,
      prixUnitaire: dto.prix_unitaire,
    };
    return new OrderItem(props);
  }

  static toDTO(item: OrderItem): Partial<LigneCommandeDTO> {
    return {
      plat_id: item.platId,
      quantite: item.quantite,
      prix_unitaire: item.prixUnitaire,
    };
  }
}

export class OrderMapper {
  static toDomain(dto: CommandeDTO, items: OrderItem[]): Order {
    const props: OrderProps = {
      id: dto.id,
      studentId: dto.etudiant_id,
      restaurantId: dto.restaurant_id,
      items,
      status: dto.statut as OrderStatus,
      totalPrice: dto.montant_total,
      qrCode: dto.qr_code,
      createdAt: new Date(dto.created_at),
      updatedAt: dto.updated_at ? new Date(dto.updated_at) : undefined,
    };
    return new Order(props);
  }

  static toDTO(order: Order): Partial<CommandeDTO> {
    return {
      id: order.id,
      etudiant_id: order.studentId,
      restaurant_id: order.restaurantId,
      statut: order.status,
      montant_total: order.totalPrice,
      qr_code: order.qrCode,
    };
  }
}
