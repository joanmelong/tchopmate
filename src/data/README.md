# 💾 Data - Data Access Layer

## Description

Le dossier **Data** contient toutes les implémentations concrètes pour l'accès aux données. Cette couche fait le pont entre le **métier** (Core) et l'**infrastructure** (Supabase, API, etc.).

## Principe Fondamental

> "Le Data Layer implémente les interfaces définies dans Core, mais le Core ne connaît pas le Data Layer."

Cette couche définit **COMMENT** on accède aux données.

## Structure

```
data/
├── dto/               # Data Transfer Objects (format DB)
├── mappers/           # Conversions DTO ↔ Entities
└── repositories/      # Implémentations concrètes des repositories
```

## 📁 Sous-dossiers

### `dto/`
Contient les **Data Transfer Objects** qui correspondent exactement au schéma de la base de données:

- `index.ts` - Tous les DTOs (CompteDTO, RestaurantDTO, etc.)

**Caractéristiques:**
- Correspond 1:1 avec les tables Supabase
- Utilise snake_case (convention DB)
- Types simples (string, number, date)
- Aucune logique métier

**Exemple:**
```typescript
export interface CompteDTO {
  id: number;
  user_id: string | null;
  email: string;
  nom: string;
  prenom: string;
  numero_tel: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}
```

### `mappers/`
Contient les **Mappers** qui convertissent entre DTOs et Entities:

- `index.ts` - UserMapper, RestaurantMapper, OrderMapper, etc.

**Responsabilités:**
- Conversion DTO → Entity (pour lire)
- Conversion Entity → DTO (pour écrire)
- Transformation snake_case ↔ camelCase
- Parsing des dates, enums, etc.

**Exemple:**
```typescript
export class UserMapper {
  static toDomain(dto: CompteDTO): User {
    return new User({
      id: dto.id,
      userId: dto.user_id,
      email: dto.email,
      role: dto.role as UserRole,
      // ...
    });
  }
  
  static toDTO(user: User): Partial<CompteDTO> {
    return {
      nom: user.nom,
      prenom: user.prenom,
      // ...
    };
  }
}
```

### `repositories/`
Contient les **implémentations concrètes** des interfaces définies dans Core:

- `SupabaseAuthRepository.ts` - Implémente `IAuthRepository`
- `SupabaseRestaurantRepository.ts` - Implémente `IRestaurantRepository`
- `SupabaseUserRepository.ts` - Implémente `IUserRepository`

**Caractéristiques:**
- Connaît Supabase (client, requêtes SQL)
- Utilise les DTOs pour les requêtes
- Utilise les Mappers pour convertir
- Retourne des Entities (jamais des DTOs)
- Gère les erreurs techniques

**Exemple:**
```typescript
export class SupabaseAuthRepository implements IAuthRepository {
  constructor(private supabase: SupabaseClient) {}
  
  async login(credentials: AuthCredentials): Promise<AuthSession> {
    // 1. Requête Supabase
    const { data } = await this.supabase.auth.signInWithPassword({...});
    
    // 2. Récupérer DTO depuis DB
    const compteDTO = await this.supabase.from('compte').select('*')...;
    
    // 3. Convertir DTO → Entity
    const user = UserMapper.toDomain(compteDTO);
    
    // 4. Retourner Entity
    return { user, accessToken: data.session.access_token };
  }
}
```

## 🎯 Règles d'Or

### ✅ AUTORISÉ dans Data:
- Imports de Supabase, Axios, etc.
- Requêtes SQL/API
- Manipulation de DTOs
- Gestion erreurs techniques
- Logging technique

### ❌ INTERDIT dans Data:
- Logique métier (validation, calculs)
- Imports depuis `app/` ou `components/`
- Retourner des DTOs directement (toujours mapper)
- Dépendre d'un autre repository directement

## 📝 Tâches à Venir

### DTOs à Créer
- [ ] `PaymentDTO` - Pour la table `paiements`
- [ ] `NotificationDTO` - Pour la table `notifications`
- [ ] `ReviewDTO` - Pour la table `avis`

### Mappers à Créer
- [ ] `PaymentMapper` - Conversion Payment ↔ PaymentDTO
- [ ] `NotificationMapper` - Conversion Notification ↔ NotificationDTO
- [ ] `ReviewMapper` - Conversion Review ↔ ReviewDTO

### Repositories à Créer
- [ ] `SupabaseMenuRepository` - Pour gérer menus et plats
- [ ] `SupabaseOrderRepository` - Pour gérer les commandes
- [ ] `SupabasePaymentRepository` - Pour gérer les paiements

### Améliorations
- [ ] Ajouter retry logic pour les requêtes
- [ ] Implémenter cache pour réduire les appels DB
- [ ] Ajouter logging détaillé des requêtes
- [ ] Créer des types génériques pour réduire duplication

## 🧪 Tests

Les repositories doivent être testés avec des **mocks Supabase**:

```typescript
describe('SupabaseAuthRepository', () => {
  it('should login user with valid credentials', async () => {
    const mockSupabase = createMockSupabaseClient();
    const repo = new SupabaseAuthRepository(mockSupabase);
    
    const result = await repo.login({
      email: 'test@example.com',
      password: 'password',
    });
    
    expect(result.user).toBeInstanceOf(User);
  });
});
```

## 🔗 Flux de Données

```
UI/API Request
    ↓
Use Case
    ↓
IRepository (interface)
    ↓
Repository Implementation (ce dossier)
    ↓
Supabase/API Call
    ↓
DTO (raw data)
    ↓
Mapper
    ↓
Entity (business object)
    ↓
Return to Use Case
```

## 📚 Documentation

- **Architecture générale:** Voir `CLEAN_ARCHITECTURE.md`
- **DTOs et Schéma DB:** Voir `documentation/gestion_bd.md`
- **Guide de migration:** Voir `MIGRATION_GUIDE.md`

---

**Dernière mise à jour:** 11 novembre 2025  
**Statut:** ✅ Architecture établie - Repositories à compléter
