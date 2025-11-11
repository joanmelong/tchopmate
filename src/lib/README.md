# 🛠️ Lib - Utilities & Infrastructure

## Description

Le dossier **Lib** contient les **utilitaires**, **configurations** et **infrastructure** de l'application.

## Structure

```
lib/
├── debug/              # Outils de débogage
├── di/                 # Dependency Injection Container
├── services/           # Services legacy (à migrer)
├── supabaseClient.ts   # Configuration client Supabase
└── utils.ts            # Fonctions utilitaires
```

## 📁 Sous-dossiers

### `di/` - Dependency Injection ⭐

**Le cœur de l'Architecture Propre.**

Contient le **DIContainer** qui centralise la création et la gestion de toutes les dépendances.

**Fichiers:**
- `container.ts` - Classe DIContainer singleton
- `index.ts` - Export `getDI()` helper

**Principe:**
```typescript
// Au lieu de créer manuellement:
const authRepo = new SupabaseAuthRepository(supabase);
const loginUseCase = new LoginUseCase(authRepo);

// On utilise le DI Container:
const di = getDI();
const loginUseCase = di.loginUseCase; // Créé automatiquement
```

**Tâches à venir:**
- [ ] Ajouter tous les nouveaux Use Cases au container
- [ ] Implémenter lazy loading pour optimiser performance
- [ ] Ajouter support pour environnements de test
- [ ] Créer factory methods pour configurations complexes

### `debug/` - Outils de Débogage

Contient des utilitaires pour le débogage de l'application.

**Fichiers:**
- `AuthDebugger.ts` - Débogage de l'authentification

**Tâches à venir:**
- [ ] Créer `DatabaseDebugger.ts` pour inspecter les requêtes DB
- [ ] Créer `StateDebugger.ts` pour visualiser l'état de l'app
- [ ] Ajouter des logs structurés avec niveaux (info, warn, error)
- [ ] Créer un panneau de debug en mode développement

### `services/` - Services Legacy

⚠️ **À MIGRER** - Ces services utilisent l'ancienne architecture.

**Fichiers:**
- `AuthService.ts` - Service d'authentification legacy
- `GerantService.ts` - Service gérant legacy

**Plan de migration:**
1. Identifier toutes les fonctions utilisées
2. Créer Use Cases équivalents dans `src/core/use-cases/`
3. Créer Hooks dans `src/hooks/`
4. Migrer les composants vers les nouveaux hooks
5. Supprimer les services legacy

**Tâches:**
- [ ] Analyser `AuthService.ts` - quelles fonctions sont encore utilisées?
- [ ] Analyser `GerantService.ts` - quelles fonctions sont encore utilisées?
- [ ] Créer plan de migration détaillé
- [ ] Migrer progressivement
- [ ] Supprimer les fichiers une fois migration complète

## 📄 Fichiers Principaux

### `supabaseClient.ts`

Configure et exporte le client Supabase.

```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);
```

**Tâches:**
- [ ] Ajouter types TypeScript pour les tables Supabase
- [ ] Configurer RLS (Row Level Security) policies
- [ ] Ajouter retry logic pour les erreurs réseau
- [ ] Créer client séparé pour admin (avec clé service)

### `utils.ts`

Contient les fonctions utilitaires générales.

**Exemples typiques:**
```typescript
// Formatage
export function formatPrice(amount: number): string;
export function formatDate(date: Date): string;

// Validation
export function isValidEmail(email: string): boolean;
export function isValidPhone(phone: string): boolean;

// Transformation
export function slugify(text: string): string;
export function capitalize(text: string): string;
```

**Tâches:**
- [ ] Documenter toutes les fonctions existantes
- [ ] Ajouter tests unitaires pour chaque fonction
- [ ] Organiser en catégories (format, validation, transform)
- [ ] Ajouter fonctions pour manipulation de dates
- [ ] Ajouter fonctions pour manipulation de prix/devise

## 🎯 Règles d'Or

### ✅ AUTORISÉ dans Lib:
- Fonctions utilitaires pures
- Configuration de clients externes (Supabase, etc.)
- Outils de débogage
- Helpers génériques

### ❌ INTERDIT dans Lib:
- Logique métier (doit être dans Core)
- Composants React (sauf outils debug)
- Code spécifique à un feature (doit être dans le module concerné)

## 📝 Tâches Générales

### Améliorations DIContainer
- [ ] Implémenter pattern Singleton thread-safe
- [ ] Ajouter méthode `reset()` pour les tests
- [ ] Créer `TestDIContainer` pour les tests unitaires
- [ ] Documenter comment ajouter un nouveau Use Case

### Nouveaux Utilitaires
- [ ] `currency.ts` - Formatage devise (FCFA)
- [ ] `validators.ts` - Validateurs réutilisables
- [ ] `formatters.ts` - Formateurs de données
- [ ] `constants.ts` - Constantes globales

### Configuration
- [ ] `config.ts` - Configuration centralisée de l'app
- [ ] `env.ts` - Validation des variables d'environnement
- [ ] `features.ts` - Feature flags

## 🧪 Tests

Tous les utilitaires doivent avoir des tests unitaires:

```typescript
describe('utils', () => {
  describe('formatPrice', () => {
    it('should format price with FCFA', () => {
      expect(formatPrice(1000)).toBe('1 000 FCFA');
    });
  });
});
```

## 📚 Documentation

- **Dependency Injection:** Voir `CLEAN_ARCHITECTURE.md`
- **Configuration Supabase:** Voir documentation Supabase
- **Pattern Singleton:** Rechercher "Singleton Pattern TypeScript"

---

**Dernière mise à jour:** 11 novembre 2025  
**Statut:** ✅ Infrastructure de base - Services legacy à migrer
