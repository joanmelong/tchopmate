# Plan de Tests - Gestion Menus et Plats

## Tests fonctionnels

### 1. Gestion des Menus

#### Test 1.1: Création d'un menu
- [ ] **Cas nominal**
  - Remplir tous les champs
  - Valider le formulaire
  - Vérifier que le menu apparaît dans la liste
  - Vérifier les données en BDD

- [ ] **Validation des champs**
  - Nom vide → Erreur
  - Prix négatif → Erreur
  - Restaurant ID invalide → Erreur

- [ ] **Cas limites**
  - Très long nom (255 caractères)
  - Description avec caractères spéciaux
  - Prix avec décimales
  - URL d'image invalide

#### Test 1.2: Modification d'un menu
- [ ] Modifier le nom
- [ ] Modifier le prix
- [ ] Modifier la description
- [ ] Modifier l'image
- [ ] Vérifier que updated_at est mis à jour

#### Test 1.3: Suppression d'un menu
- [ ] Supprimer un menu
- [ ] Confirmer la suppression
- [ ] Vérifier la disparition de la liste
- [ ] Vérifier la suppression en BDD

#### Test 1.4: Toggle disponibilité
- [ ] Activer/désactiver un menu
- [ ] Vérifier le changement d'icône
- [ ] Vérifier en BDD

### 2. Gestion des Plats

#### Test 2.1: Création d'un plat
- [ ] **Cas nominal**
  - Remplir tous les champs obligatoires
  - Valider le formulaire
  - Vérifier l'apparition dans la liste

- [ ] **Validation des champs**
  - Nom vide → Erreur
  - Catégorie vide → Erreur
  - Prix vide → Erreur
  - Prix négatif → Erreur
  - Temps de préparation négatif → Erreur

#### Test 2.2: Filtrage par catégorie
- [ ] Créer des plats dans différentes catégories
- [ ] Cliquer sur une catégorie
- [ ] Vérifier que seuls les plats de cette catégorie s'affichent
- [ ] Cliquer sur "Tous"
- [ ] Vérifier que tous les plats s'affichent

#### Test 2.3: Modification d'un plat
- [ ] Modifier tous les champs
- [ ] Vérifier les changements

#### Test 2.4: Suppression d'un plat
- [ ] Supprimer un plat
- [ ] Vérifier la suppression

### 3. Tests de sécurité (RLS)

#### Test 3.1: Gérant
- [ ] Se connecter en tant que gérant
- [ ] Vérifier l'accès aux menus de son restaurant
- [ ] Vérifier l'impossibilité d'accéder aux menus d'autres restaurants

#### Test 3.2: Client
- [ ] Se connecter en tant que client
- [ ] Vérifier l'accès en lecture seule
- [ ] Vérifier que seuls les items disponibles sont visibles

#### Test 3.3: Non authentifié
- [ ] Se déconnecter
- [ ] Tenter d'accéder aux pages de gestion
- [ ] Vérifier la redirection ou l'erreur

### 4. Tests de performance

#### Test 4.1: Chargement
- [ ] Créer 100 menus
- [ ] Vérifier le temps de chargement
- [ ] Créer 500 plats
- [ ] Vérifier le temps de chargement

#### Test 4.2: Filtrage
- [ ] Créer plats dans 10 catégories
- [ ] Mesurer le temps de filtrage

### 5. Tests d'intégration

#### Test 5.1: Flux complet gérant
```
1. Connexion
2. Création menu
3. Création plats
4. Modification menu
5. Toggle disponibilité
6. Suppression
```

#### Test 5.2: Persistance des données
- [ ] Créer un menu
- [ ] Rafraîchir la page
- [ ] Vérifier que le menu est toujours là

#### Test 5.3: Gestion d'erreurs
- [ ] Simuler une perte de connexion
- [ ] Vérifier les messages d'erreur
- [ ] Vérifier la récupération après reconnexion

## Tests unitaires (à implémenter)

### Use Cases - Menus

#### CreateMenu
```typescript
describe('CreateMenu', () => {
  it('devrait créer un menu avec des données valides', async () => {
    // Arrange
    const mockRepo = {
      createMenu: jest.fn().mockResolvedValue(mockMenu)
    };
    const useCase = new CreateMenu(mockRepo);
    
    // Act
    const result = await useCase.execute(validMenuData);
    
    // Assert
    expect(result).toEqual(mockMenu);
    expect(mockRepo.createMenu).toHaveBeenCalledWith(validMenuData);
  });

  it('devrait rejeter si le nom est vide', async () => {
    // Arrange
    const mockRepo = { createMenu: jest.fn() };
    const useCase = new CreateMenu(mockRepo);
    
    // Act & Assert
    await expect(useCase.execute({ ...validMenuData, nom: '' }))
      .rejects.toThrow('Restaurant ID et nom sont requis');
  });

  it('devrait rejeter si le prix est négatif', async () => {
    // Arrange
    const mockRepo = { createMenu: jest.fn() };
    const useCase = new CreateMenu(mockRepo);
    
    // Act & Assert
    await expect(useCase.execute({ ...validMenuData, prix: -100 }))
      .rejects.toThrow('Le prix ne peut pas être négatif');
  });
});
```

#### UpdateMenu
```typescript
describe('UpdateMenu', () => {
  it('devrait mettre à jour un menu existant', async () => {
    // Test à implémenter
  });

  it('devrait rejeter si le menu n\'existe pas', async () => {
    // Test à implémenter
  });
});
```

#### DeleteMenu
```typescript
describe('DeleteMenu', () => {
  it('devrait supprimer un menu existant', async () => {
    // Test à implémenter
  });
  
  it('devrait rejeter si le menu n\'existe pas', async () => {
    // Test à implémenter
  });
});
```

### Use Cases - Plats

#### CreateDish
```typescript
describe('CreateDish', () => {
  it('devrait créer un plat avec des données valides', async () => {
    // Test à implémenter
  });

  it('devrait rejeter si la catégorie est vide', async () => {
    // Test à implémenter
  });

  it('devrait rejeter si le temps de préparation est négatif', async () => {
    // Test à implémenter
  });
});
```

### Repositories

#### MenuManagementRepository
```typescript
describe('MenuManagementRepository', () => {
  it('devrait récupérer les menus d\'un restaurant', async () => {
    // Test à implémenter avec mock Supabase
  });

  it('devrait créer un menu', async () => {
    // Test à implémenter
  });

  it('devrait gérer les erreurs Supabase', async () => {
    // Test à implémenter
  });
});
```

## Tests E2E (Playwright/Cypress)

### Scénario 1: Gérant crée son premier menu
```typescript
test('Gérant peut créer un menu complet', async ({ page }) => {
  // 1. Connexion
  await page.goto('/login');
  await page.fill('[name="email"]', 'gerant@test.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  // 2. Navigation vers menus
  await page.goto('/resto/test-id/menus');
  
  // 3. Création menu
  await page.click('text=Nouveau Menu');
  await page.fill('[name="nom"]', 'Menu du jour');
  await page.fill('[name="description"]', 'Menu complet');
  await page.fill('[name="prix"]', '2500');
  await page.click('button[type="submit"]');
  
  // 4. Vérification
  await expect(page.locator('text=Menu du jour')).toBeVisible();
});
```

### Scénario 2: Filtrage des plats par catégorie
```typescript
test('Client peut filtrer les plats par catégorie', async ({ page }) => {
  // Test à implémenter
});
```

## Checklist de qualité

### Code
- [ ] Pas de `any` TypeScript
- [ ] Gestion d'erreurs complète
- [ ] Validation des données
- [ ] Loading states
- [ ] Error states
- [ ] Success feedback (toasts)

### UX
- [ ] Messages d'erreur clairs
- [ ] Confirmations pour suppressions
- [ ] Feedback visuel (spinners)
- [ ] Responsive design
- [ ] Accessibilité (ARIA labels)

### Performance
- [ ] Pas de requêtes inutiles
- [ ] Debounce sur recherche (si implémenté)
- [ ] Optimisation des images
- [ ] Lazy loading (si nécessaire)

### Sécurité
- [ ] RLS activé
- [ ] Validation côté serveur
- [ ] Pas d'injection SQL
- [ ] Gestion des permissions

## Rapports de bugs

### Format
```markdown
**Titre**: [BUG] Description courte

**Description**: Description détaillée du problème

**Reproduction**:
1. Étape 1
2. Étape 2
3. Résultat observé

**Attendu**: Ce qui devrait se passer

**Environnement**:
- Navigateur: Chrome 120
- OS: Windows 11
- Version: dev

**Screenshots**: [si applicable]
```

## Suivi des tests

| Test | Status | Date | Testeur | Notes |
|------|--------|------|---------|-------|
| Création menu | ⏳ | - | - | - |
| Modification menu | ⏳ | - | - | - |
| Suppression menu | ⏳ | - | - | - |
| Création plat | ⏳ | - | - | - |
| Filtrage plats | ⏳ | - | - | - |
| RLS gérant | ⏳ | - | - | - |
| RLS client | ⏳ | - | - | - |

Légende:
- ⏳ À faire
- ✅ Passé
- ❌ Échoué
- 🔄 En cours
