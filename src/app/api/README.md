# 🌐 API Routes - Next.js API Layer

## Description

Le dossier **API** contient les **API Routes** de Next.js qui exposent des endpoints HTTP pour:
- Les opérations administrateur
- Les opérations gérant
- Les opérations tierces (webhooks, intégrations)

## Principe Fondamental

> "Les API Routes sont de simples adaptateurs HTTP qui délèguent aux Use Cases."

Ces routes transforment des requêtes HTTP en appels de Use Cases, puis retournent les réponses en JSON.

## Structure

```
api/
├── admin/          # Endpoints admin
│   ├── gerants/    # Gestion des gérants
│   └── session/    # Session admin
└── gerant/         # Endpoints gérant
    ├── link-account/    # Liaison compte OAuth
    └── restaurants/     # Gestion restaurants
```

## 📁 Routes Existantes

### Admin Routes

#### `POST /api/admin/gerants` - Créer un gérant
Permet à l'admin de créer un compte gérant.

**Responsabilités:**
1. Valider les données reçues
2. Vérifier l'authentification admin
3. Appeler le Use Case `CreateGerantUseCase`
4. Retourner la réponse JSON

#### `GET /api/admin/session` - Session admin
Récupère les informations de session admin.

### Gérant Routes

#### `POST /api/gerant/link-account` - Lier compte OAuth
Lie un compte Google OAuth à un compte gérant existant.

#### `GET/POST /api/gerant/restaurants` - Gestion restaurants
CRUD sur les restaurants du gérant.

## 🏗️ Structure Type d'une API Route

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDI } from '@/lib/di';

export async function POST(request: NextRequest) {
  try {
    // 1. Parser les données
    const body = await request.json();

    // 2. Valider les données (optionnel, mais recommandé)
    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    // 3. Récupérer le Use Case via DI
    const di = getDI();
    const useCase = di.loginUseCase;

    // 4. Exécuter le Use Case
    const result = await useCase.execute({
      email: body.email,
      password: body.password,
    });

    // 5. Retourner la réponse
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    // 6. Gérer les erreurs
    console.error('[API Login Error]:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Erreur serveur',
      },
      { status: 500 }
    );
  }
}
```

## 🎯 Règles d'Or

### ✅ AUTORISÉ dans API Routes:
- Parsing de requêtes HTTP
- Validation basique des inputs
- Appel de Use Cases via DI
- Gestion d'erreurs HTTP (status codes)
- Logging des requêtes
- Authentification/autorisation (middleware)

### ❌ INTERDIT dans API Routes:
- Logique métier (doit être dans Use Cases)
- Appels directs aux Repositories
- Appels directs à Supabase (sauf auth check)
- Calculs ou transformations métier

## 📝 Tâches à Venir

### Routes Admin à Créer

- [ ] `GET /api/admin/dashboard` - Statistiques dashboard
  ```typescript
  // Appelle GetDashboardStatsUseCase
  // Retourne: orders count, revenue, active restaurants
  ```

- [ ] `GET /api/admin/gerants` - Liste des gérants
  ```typescript
  // Appelle GetAllGerantsUseCase
  ```

- [ ] `DELETE /api/admin/gerants/[id]` - Supprimer un gérant
  ```typescript
  // Appelle DeleteGerantUseCase
  ```

- [ ] `GET /api/admin/orders` - Toutes les commandes
  ```typescript
  // Appelle GetAllOrdersUseCase
  ```

### Routes Gérant à Créer

- [ ] `GET /api/gerant/dashboard` - Dashboard gérant
  ```typescript
  // Statistiques du restaurant
  ```

- [ ] `GET /api/gerant/orders` - Commandes du restaurant
  ```typescript
  // Appelle GetRestaurantOrdersUseCase
  ```

- [ ] `PATCH /api/gerant/orders/[id]/status` - Changer statut commande
  ```typescript
  // Appelle UpdateOrderStatusUseCase
  ```

- [ ] `GET /api/gerant/menus` - Menus du restaurant
  ```typescript
  // Appelle GetRestaurantMenusUseCase
  ```

- [ ] `POST /api/gerant/menus` - Créer un menu
  ```typescript
  // Appelle CreateMenuUseCase
  ```

- [ ] `POST /api/gerant/plats` - Créer un plat
  ```typescript
  // Appelle CreatePlatUseCase
  ```

### Routes Publiques/Étudiant à Créer

- [ ] `GET /api/restaurants` - Liste restaurants publics
- [ ] `GET /api/restaurants/[id]` - Détails restaurant
- [ ] `GET /api/restaurants/[id]/menus` - Menus d'un restaurant
- [ ] `POST /api/orders` - Créer une commande
- [ ] `GET /api/orders/[id]` - Détails commande
- [ ] `POST /api/payments` - Traiter un paiement

### Webhooks

- [ ] `POST /api/webhooks/payment` - Webhook paiements
  ```typescript
  // Appelé par le provider de paiement (Mobile Money, etc.)
  ```

## 🔐 Middleware d'Authentification

Créer des middlewares pour protéger les routes:

```typescript
// middleware/authAdmin.ts
export async function requireAdmin(request: NextRequest) {
  const di = getDI();
  const sessionUseCase = di.getCurrentSessionUseCase;
  const session = await sessionUseCase.execute();

  if (!session || !session.user.isAdmin()) {
    return NextResponse.json(
      { error: 'Non autorisé' },
      { status: 401 }
    );
  }

  return null; // Continue
}

// Utilisation:
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  // Route protégée...
}
```

**Tâches:**
- [ ] Créer `requireAdmin()` middleware
- [ ] Créer `requireGerant()` middleware
- [ ] Créer `requireAuth()` middleware
- [ ] Appliquer aux routes sensibles

## 🧪 Tests

Les API routes doivent être testées avec des requêtes HTTP simulées:

```typescript
import { POST } from './route';
import { NextRequest } from 'next/server';

describe('POST /api/auth/login', () => {
  it('should login with valid credentials', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
```

## 📚 Documentation API

Considérer l'utilisation de:
- **Swagger/OpenAPI** pour documenter les endpoints
- **Postman Collection** pour tester manuellement
- **Thunder Client** (VS Code extension)

**Tâches:**
- [ ] Créer `openapi.yaml` avec tous les endpoints
- [ ] Générer documentation auto avec Swagger UI
- [ ] Créer collection Postman pour tests manuels

## 🔗 Flux Typique

```
HTTP Request
    ↓
API Route (ce dossier)
    ↓
Use Case (via DI Container)
    ↓
Repository
    ↓
Database
    ↓
Return Entity
    ↓
API Route serializes to JSON
    ↓
HTTP Response
```

## 📊 Codes de Statut HTTP

Utiliser les bons codes:
- `200` - Succès
- `201` - Créé
- `400` - Requête invalide (validation)
- `401` - Non authentifié
- `403` - Non autorisé (permissions)
- `404` - Non trouvé
- `500` - Erreur serveur

---

**Dernière mise à jour:** 11 novembre 2025  
**Statut:** ⚠️ Routes de base créées - CRUD complet à implémenter
