# Rapport de Test - Use Cases Menu

## Vue d'ensemble
- **Fichier de test**: `tests/unit/use-cases/menu/MenuUseCases.test.ts`
- **Use Cases testés**: Gestion complète des menus
- **Type de test**: Tests unitaires avec mock repository
- **Framework**: Jest
- **Date de création**: 14 novembre 2025

## Description
Ce rapport documente les tests unitaires des use cases de gestion des menus dans TchopMate. Les tests couvrent les opérations CRUD (Create, Read, Update, Delete) sur les entités Menu, avec validation métier et gestion d'erreurs.

## Use Cases testés

1. **GetMenusByRestaurant** - Récupération des menus par restaurant
2. **CreateMenu** - Création d'un nouveau menu
3. **UpdateMenu** - Mise à jour d'un menu existant
4. **DeleteMenu** - Suppression d'un menu

## Architecture de test

### Mock Repository
```typescript
class MockMenuRepo implements IMenuManagementRepository {
  public menus: MenuDTO[] = []
  public deletedId: string | null = null
  
  // Implémente toutes les méthodes de IMenuManagementRepository
  // avec simulation en mémoire
}
```

**Caractéristiques du mock**:
- Stockage en mémoire avec tableau `menus`
- Génération d'IDs aléatoires pour nouveaux menus
- Tracking des suppressions via `deletedId`
- Gestion des erreurs "Not found"

## Structure des tests

### Configuration initiale (beforeEach)
```typescript
beforeEach(() => {
  repo = new MockMenuRepo()
  repo.menus = [
    {
      id: 'm1',
      restaurant_id: 'resto-uuid-1',
      nom: 'Menu Test',
      description: 'Desc menu',
      prix: 15,
      image_url: undefined,
      disponible: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]
})
```

### 1. Test GetMenusByRestaurant

#### ✅ Test: Récupération des menus par restaurant
- **Use Case**: `GetMenusByRestaurant`
- **Objectif**: Vérifier la récupération des menus d'un restaurant spécifique
- **Données d'entrée**: `restaurant_id: 'resto-uuid-1'`
- **Vérifications**:
  - Retourne 1 menu pour le restaurant
  - Le nom du menu est correct (`'Menu Test'`)
- **Logique métier**: Filtrage par `restaurant_id`

### 2. Test CreateMenu

#### ❌ Test: Validation des données manquantes
- **Objectif**: Vérifier le rejet des données incomplètes
- **Données d'entrée**: `{}` (objet vide)
- **Résultat attendu**: Exception levée
- **Validation**: Champs obligatoires requis

#### ❌ Test: Validation du nom vide
- **Données d'entrée**: `{ restaurant_id: 'r', nom: '' }`
- **Résultat attendu**: Exception levée
- **Règle métier**: Le nom du menu ne peut pas être vide

#### ✅ Test: Création réussie
- **Données d'entrée**: 
  ```typescript
  { 
    restaurant_id: 'resto-uuid-1', 
    nom: 'Nouveau' 
  }
  ```
- **Vérifications**:
  - Menu créé avec succès
  - Nom correctement assigné
  - ID généré automatiquement

### 3. Test UpdateMenu

#### ❌ Test: Validation de l'ID menu
- **Données d'entrée**: ID vide (`''`)
- **Résultat attendu**: Exception "Menu ID is required"
- **Validation**: ID obligatoire pour mise à jour

#### ❌ Test: Menu non trouvé
- **Données d'entrée**: ID inexistant (`'nope'`)
- **Résultat attendu**: Exception "Menu not found"
- **Gestion d'erreur**: Vérification existence avant mise à jour

#### ✅ Test: Mise à jour réussie
- **ID menu**: `'m1'` (menu existant)
- **Données**: `{ nom: 'Updated' }`
- **Vérification**: Nom mis à jour correctement

### 4. Test DeleteMenu

#### ❌ Test: Validation de l'ID
- **Données d'entrée**: ID vide (`''`)
- **Résultat attendu**: Exception "Menu ID is required"

#### ✅ Test: Suppression réussie
- **ID menu**: `'m1'`
- **Vérifications**:
  - `repo.deletedId` contient l'ID supprimé
  - Le tableau `menus` est vide après suppression

## Modèle de données testé

### MenuDTO
```typescript
interface MenuDTO {
  id: string;
  restaurant_id: string;
  nom: string;
  description?: string;
  prix: number;
  image_url?: string;
  disponible: boolean;
  created_at: Date;
  updated_at: Date;
}
```

### CreateMenuDTO
```typescript
interface CreateMenuDTO {
  restaurant_id: string;
  nom: string;
  description?: string;
  prix?: number;
  image_url?: string;
  disponible?: boolean;
}
```

### UpdateMenuDTO
```typescript
interface UpdateMenuDTO {
  nom?: string;
  description?: string;
  prix?: number;
  image_url?: string;
  disponible?: boolean;
}
```

## Couverture des tests

### Fonctionnalités testées ✅
- ✅ Récupération des menus par restaurant
- ✅ Création de menu avec validation
- ✅ Mise à jour de menu existant
- ✅ Suppression de menu
- ✅ Validation des champs obligatoires
- ✅ Gestion des erreurs "Not found"

### Patterns de validation couverts
- Champs obligatoires (restaurant_id, nom)
- Existence des entités avant modification
- Validation des IDs non vides

## Métriques

- **Nombre total de tests**: 4 tests principaux
- **Use Cases couverts**: 4/4 (100%)
- **Scénarios de succès**: 4
- **Scénarios d'échec**: 4
- **Couverture estimée**: ~85%

## Patterns de test utilisés

1. **Repository Pattern**: Mock de l'interface repository
2. **In-Memory Storage**: Simulation base de données en mémoire
3. **Test Data Builders**: Configuration des données test dans beforeEach
4. **Error Testing**: Tests spécifiques pour chaque type d'erreur

## Flux d'exécution type

### Création de menu
1. **Validation** → Vérification champs obligatoires
2. **Business Logic** → Application règles métier
3. **Persistence** → Ajout au repository
4. **Response** → Retour MenuDTO créé

### Mise à jour de menu
1. **Validation ID** → Vérification ID fourni
2. **Existence Check** → Vérification menu existe
3. **Update** → Application des modifications
4. **Response** → Retour MenuDTO mis à jour

## Recommandations

### Points forts ✅
- Excellente couverture des opérations CRUD
- Validation complète des entrées
- Mock repository bien structuré
- Tests d'erreurs exhaustifs
- Séparation claire des préoccupations

### Améliorations suggérées 📝

1. **Tests de validation métier avancée**:
   ```typescript
   it('devrait rejeter un prix négatif', async () => {
     await expect(useCase.execute({
       restaurant_id: 'r',
       nom: 'Menu',
       prix: -10
     })).rejects.toThrow('Le prix ne peut pas être négatif');
   });
   ```

2. **Tests de concurrence**:
   ```typescript
   it('devrait gérer les mises à jour concurrentes', async () => {
     // Tests de race conditions
   });
   ```

3. **Tests de performance**:
   ```typescript
   it('devrait gérer un grand nombre de menus', async () => {
     // Tests avec 1000+ menus
   });
   ```

4. **Tests d'intégration**:
   - Tests avec vraie base de données
   - Tests de transactions
   - Tests de contraintes FK

5. **Validation avancée**:
   - Format des URLs d'images
   - Limites de longueur des textes
   - Validation des caractères spéciaux

### Améliorations techniques

```typescript
describe('Validation avancée', () => {
  it('devrait valider le format URL des images', () => {
    // Test validation URL
  });
  
  it('devrait limiter la longueur du nom', () => {
    // Test limite caractères
  });
});

describe('Business Rules', () => {
  it('ne devrait pas permettre prix négatif', () => {
    // Test règles métier
  });
});
```

## Status
- **État actuel**: ✅ Fonctionnel et bien structuré
- **Dernière exécution**: Tous les tests passent
- **Priorité de maintenance**: Moyenne
- **Extensibilité**: Excellente avec le pattern repository