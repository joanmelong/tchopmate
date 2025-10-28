# 🛠️ Commandes Utiles - TchopMate

## 📦 Installation et Configuration

### Installer les dépendances
```bash
npm install
# ou
pnpm install
```

### Installer les dépendances de test
```bash
npm install -D jest @testing-library/react @testing-library/jest-dom @types/jest ts-jest
```

---

## 🚀 Développement

### Lancer le serveur de développement
```bash
npm run dev
# Ouvre http://localhost:3000
```

### Build de production
```bash
npm run build
```

### Démarrer en mode production
```bash
npm start
```

### Linter (vérifier le code)
```bash
npm run lint
```

---

## 🧪 Tests

### Tous les tests
```bash
npm test
```

### Tests en mode watch (recommandé pendant le développement)
```bash
npm test -- --watch
```

### Tests avec coverage
```bash
npm test -- --coverage
```

### Tester un fichier spécifique
```bash
npm test User.test.ts
```

### Tester une suite spécifique
```bash
npm test -- --testNamePattern="LoginUseCase"
```

### Mettre à jour les snapshots
```bash
npm test -- -u
```

---

## 🔍 Debugging

### Inspecter le build Next.js
```bash
npm run build -- --debug
```

### Analyser le bundle
```bash
npm run analyze
```

### Mode verbose pour les tests
```bash
npm test -- --verbose
```

---

## 📊 Qualité du code

### Vérifier le TypeScript
```bash
npx tsc --noEmit
```

### Formater le code avec Prettier
```bash
npx prettier --write "src/**/*.{ts,tsx}"
```

### Vérifier le formatage
```bash
npx prettier --check "src/**/*.{ts,tsx}"
```

---

## 🗄️ Base de données (Supabase)

### Générer les types TypeScript depuis Supabase
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts
```

### Se connecter à Supabase
```bash
npx supabase login
```

### Initialiser Supabase localement
```bash
npx supabase init
```

### Démarrer Supabase en local
```bash
npx supabase start
```

---

## 🏗️ Architecture - Commandes personnalisées

### Créer une nouvelle entité (template)
```bash
# Copier le template
cp src/core/entities/User.ts src/core/entities/NewEntity.ts
# Puis éditer et adapter
```

### Créer un nouveau use case
```bash
# Créer le dossier si nécessaire
mkdir -p src/core/use-cases/feature-name

# Créer le fichier
touch src/core/use-cases/feature-name/MyUseCase.ts
```

### Créer un nouveau repository
```bash
# Interface
touch src/core/interfaces/IMyRepository.ts

# Implémentation
touch src/data/repositories/SupabaseMyRepository.ts

# Mapper
# Ajouter dans src/data/mappers/index.ts
```

---

## 📝 Génération de code

### Créer un composant React
```bash
# Créer le fichier
touch src/components/MyComponent.tsx
```

### Créer une page Next.js
```bash
# App Router - Créer le dossier et le fichier
mkdir -p src/app/my-page
touch src/app/my-page/page.tsx
```

### Créer un hook
```bash
touch src/hooks/use-my-feature.ts
```

---

## 🧹 Nettoyage

### Nettoyer le cache Next.js
```bash
rm -rf .next
```

### Nettoyer node_modules et réinstaller
```bash
rm -rf node_modules package-lock.json
npm install
```

### Nettoyer le cache de test
```bash
npm test -- --clearCache
```

---

## 🔧 Git (recommandations)

### Créer une nouvelle branche feature
```bash
git checkout -b feature/my-new-feature
```

### Commit avec convention
```bash
# Format: type(scope): message
git commit -m "feat(auth): add login use case"
git commit -m "fix(restaurant): correct validation logic"
git commit -m "refactor(orders): apply clean architecture"
git commit -m "test(user): add entity tests"
```

### Types de commit recommandés
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `refactor`: Refactorisation (pas de changement fonctionnel)
- `test`: Ajout/modification de tests
- `docs`: Documentation
- `style`: Formatage, style
- `perf`: Optimisation de performance
- `chore`: Tâches diverses (build, config, etc.)

### Vérifier les fichiers modifiés avant commit
```bash
git status
git diff
```

### Voir l'historique des commits
```bash
git log --oneline --graph --decorate
```

---

## 📦 Production

### Build et vérifier
```bash
npm run build && npm start
```

### Déployer sur Vercel
```bash
vercel --prod
```

### Variables d'environnement en production
```bash
# .env.production
NEXT_PUBLIC_SUPABASE_URL=your_production_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_key
```

---

## 🧪 Tests spécifiques à l'architecture

### Tester uniquement les entités
```bash
npm test -- tests/unit/entities
```

### Tester uniquement les use cases
```bash
npm test -- tests/unit/use-cases
```

### Tester avec coverage minimum requis
```bash
npm test -- --coverage --coverageThreshold='{"global":{"branches":80,"functions":80,"lines":80}}'
```

---

## 🔍 Debugging avancé

### Débugger un test avec Node
```bash
node --inspect-brk node_modules/.bin/jest --runInBand User.test.ts
# Puis ouvrir chrome://inspect dans Chrome
```

### Profiler les performances Next.js
```bash
ANALYZE=true npm run build
```

### Voir les dépendances du projet
```bash
npm ls --depth=0
```

### Vérifier les versions
```bash
npm outdated
```

---

## 📊 Scripts package.json recommandés

Ajouter dans votre `package.json` :

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:entities": "jest tests/unit/entities",
    "test:usecases": "jest tests/unit/use-cases",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write \"src/**/*.{ts,tsx}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx}\""
  }
}
```

---

## 🚦 Workflow recommandé

### 1. Créer une nouvelle fonctionnalité

```bash
# 1. Créer une branche
git checkout -b feature/new-payment-system

# 2. Créer l'entité
touch src/core/entities/Payment.ts

# 3. Créer les tests de l'entité
touch tests/unit/entities/Payment.test.ts

# 4. Exécuter les tests en watch mode
npm run test:watch

# 5. Créer l'interface du repository
touch src/core/interfaces/IPaymentRepository.ts

# 6. Créer le use case
touch src/core/use-cases/payment/ProcessPaymentUseCase.ts

# 7. Tester le use case
touch tests/unit/use-cases/ProcessPaymentUseCase.test.ts

# 8. Implémenter le repository
touch src/data/repositories/SupabasePaymentRepository.ts

# 9. Ajouter au container DI
# Éditer src/lib/di/container.ts

# 10. Créer le hook React
touch src/hooks/use-payment.ts

# 11. Vérifier que tout compile
npm run typecheck

# 12. Vérifier les tests
npm test

# 13. Commit
git add .
git commit -m "feat(payment): add payment processing"
git push origin feature/new-payment-system
```

---

## 🔄 Migration d'une page legacy

```bash
# 1. Identifier la page à migrer
# src/app/old-page/page.tsx

# 2. Créer une branche
git checkout -b refactor/migrate-old-page

# 3. Créer les entités si nécessaire
# (voir les exemples dans src/core/entities/)

# 4. Créer les use cases
# (voir les exemples dans src/core/use-cases/)

# 5. Créer les hooks
# (voir les exemples dans src/hooks/)

# 6. Refactoriser la page pour utiliser les hooks
# Remplacer les appels Supabase par des hooks

# 7. Tester manuellement
npm run dev

# 8. Vérifier qu'il n'y a plus d'imports Supabase dans la page
grep -r "supabaseClient" src/app/old-page/

# 9. Commit
git add .
git commit -m "refactor(old-page): apply clean architecture"
```

---

## ⚡ Astuces

### Redémarrer le serveur de développement proprement
```bash
# Arrêter tous les processus Node
pkill -f "next dev"

# Nettoyer et redémarrer
rm -rf .next && npm run dev
```

### Trouver les fichiers qui importent encore Supabase
```bash
grep -r "from '@/lib/supabaseClient'" src/app/ src/components/
```

### Compter les lignes de code
```bash
# Total
find src -name '*.ts' -o -name '*.tsx' | xargs wc -l

# Par couche
wc -l src/core/**/*.ts
wc -l src/data/**/*.ts
```

---

## 🆘 Résolution de problèmes

### "Module not found"
```bash
# Vérifier les imports
# Vérifier tsconfig.json paths
# Redémarrer le serveur
```

### Tests qui échouent aléatoirement
```bash
# Exécuter les tests en série
npm test -- --runInBand
```

### Build qui échoue
```bash
# Nettoyer et rebuild
rm -rf .next node_modules
npm install
npm run build
```

---

**Ces commandes vous aideront à travailler efficacement avec l'architecture propre ! 🚀**
