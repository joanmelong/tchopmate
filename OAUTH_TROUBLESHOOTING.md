# 🔧 Guide de Dépannage OAuth - Architecture Propre

## 🚨 Problèmes Courants et Solutions

### 1️⃣ "Property 'window' is undefined" (Erreur SSR)

**Symptôme:**
```
ReferenceError: window is not defined
```

**Cause:** 
Next.js tente d'exécuter le code côté serveur, mais `window.location.origin` n'existe que côté client.

**Solution:**
Le code actuel est déjà protégé avec `'use client'` en haut des pages. Si l'erreur persiste:

```typescript
// Dans SupabaseAuthRepository.ts
async initiateGoogleLogin(options: GoogleLoginOptions): Promise<string> {
  const origin = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
  const { data, error } = await this.supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}${options.redirectTo}`,
      scopes: options.scopes || 'openid email profile',
    },
  });
  // ...
}
```

---

### 2️⃣ "DIContainer must be initialized before use"

**Symptôme:**
```
Error: DIContainer must be initialized before use
```

**Cause:**
Le container DI n'a pas été initialisé avec le client Supabase.

**Solution:**
Vérifier que `src/lib/di/index.ts` initialise correctement le container:

```typescript
// src/lib/di/index.ts
import { createClient } from '@/lib/supabaseClient';
import { DIContainer } from './container';

const supabase = createClient();
DIContainer.initialize(supabase);

export const getDI = () => DIContainer.getInstance();
```

---

### 3️⃣ "Email non autorisé pour l'administration"

**Symptôme:**
Admin ne peut pas se connecter même avec le bon email.

**Cause:**
- Email hardcodé ne correspond pas
- Session OAuth contient un email différent

**Vérification:**
```typescript
// Dans GoogleLoginAdminUseCase.ts, vérifier:
const ADMIN_EMAIL = 'joantsayem@gmail.com';

// Ajouter un log temporaire:
console.log('Email OAuth:', session.user.email);
console.log('Admin attendu:', ADMIN_EMAIL);
```

**Solution:**
Mettre à jour l'email autorisé dans le use case ou utiliser une variable d'environnement:

```typescript
// .env.local
NEXT_PUBLIC_ADMIN_EMAIL=joantsayem@gmail.com

// GoogleLoginAdminUseCase.ts
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
```

---

### 4️⃣ "Aucun compte gérant trouvé avec cet email"

**Symptôme:**
Gérant ne peut pas se connecter malgré l'existence du compte.

**Cause:**
- Email pas dans la table `compte`
- Rôle incorrect (pas "Gerant")
- Casse différente (majuscules/minuscules)

**Vérification SQL:**
```sql
-- Vérifier l'existence du compte
SELECT id, email, role, user_id 
FROM compte 
WHERE email ILIKE 'email@example.com';

-- Vérifier le rôle exact
SELECT DISTINCT role FROM compte WHERE role LIKE '%erant%';
```

**Solution:**
```sql
-- Créer un compte gérant préautorisé
INSERT INTO compte (email, nom, prenom, role)
VALUES ('gerant@example.com', 'Nom', 'Prenom', 'Gerant');

-- OU corriger le rôle existant
UPDATE compte 
SET role = 'Gerant'
WHERE email = 'gerant@example.com';
```

---

### 5️⃣ Redirection OAuth infinie

**Symptôme:**
La page callback redirige en boucle vers Google.

**Cause:**
- Le callback ne récupère pas la session correctement
- La session expire immédiatement

**Vérification:**
```typescript
// Ajouter dans handleOAuthCallback() de SupabaseAuthRepository
const { data: { session }, error } = await this.supabase.auth.getSession();
console.log('Session OAuth:', session);
console.log('Erreur session:', error);
```

**Solution:**
```typescript
// Vérifier que Supabase est bien configuré
// src/lib/supabaseClient.ts
export const createClient = () => {
  return createClientInstance(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true, // IMPORTANT pour OAuth
      },
    }
  );
};
```

---

### 6️⃣ "handleCallback is not a function"

**Symptôme:**
```
TypeError: handleCallback is not a function
```

**Cause:**
Le hook ne retourne pas correctement la fonction.

**Solution:**
Vérifier que le hook utilise `useCallback` pour éviter les recréations:

```typescript
import { useCallback } from 'react';

export function useAdminAuth() {
  const handleCallback = useCallback(async () => {
    // ...
  }, []); // Dépendances appropriées

  return {
    loginWithGoogle,
    handleCallback, // ✅ Retourner la fonction
    isLoading,
    error,
  };
}
```

---

### 7️⃣ Compte créé mais rôle "Etudiant" au lieu de "Gerant"

**Symptôme:**
Le gérant se connecte mais n'a pas les bonnes permissions.

**Cause:**
Le repository crée un compte avec le rôle par défaut "Etudiant".

**Solution:**
Modifier `HandleGerantCallbackUseCase` pour ne PAS créer de compte automatiquement:

```typescript
export class HandleGerantCallbackUseCase {
  async execute(): Promise<User> {
    const session = await this.authRepository.handleOAuthCallback();

    if (!session) {
      throw new Error('Session non trouvée');
    }

    // NE PAS créer de compte, seulement récupérer l'existant
    const user = await this.userRepository.getByEmail(session.user.email);

    if (!user) {
      await this.authRepository.logout();
      throw new Error('Votre compte n\'est pas préautorisé. Contactez un administrateur.');
    }

    if (!user.isStaff()) {
      await this.authRepository.logout();
      throw new Error('Vous n\'avez pas les permissions gérant.');
    }

    // Mettre à jour user_id OAuth si nécessaire
    if (!user.userId || user.userId !== session.user.userId) {
      await this.userRepository.linkOAuthAccount(user.id, session.user.userId);
    }

    return user;
  }
}
```

---

### 8️⃣ "Invalid redirect URL"

**Symptôme:**
```
Error: Invalid redirect URL for OAuth
```

**Cause:**
L'URL de callback n'est pas autorisée dans Supabase.

**Solution:**
1. Aller dans Supabase Dashboard
2. Authentication → URL Configuration
3. Ajouter les URLs de redirection:
   ```
   http://localhost:3000/admin/login/callback
   http://localhost:3000/resto/login/callback
   https://votre-domaine.com/admin/login/callback
   https://votre-domaine.com/resto/login/callback
   ```

---

### 9️⃣ CORS Error lors de l'OAuth

**Symptôme:**
```
Access to fetch at 'https://accounts.google.com/...' has been blocked by CORS
```

**Cause:**
Configuration Google OAuth incorrecte.

**Solution:**
1. Google Cloud Console → APIs & Services → Credentials
2. Configurer "Authorized redirect URIs":
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
3. Configurer "Authorized JavaScript origins":
   ```
   http://localhost:3000
   https://votre-domaine.com
   ```

---

### 🔟 L'utilisateur est redirigé mais les données ne sont pas synchronisées

**Symptôme:**
L'authentification réussit mais l'utilisateur n'apparaît pas comme connecté.

**Cause:**
La session n'est pas propagée correctement dans l'application.

**Solution:**
Utiliser un hook global de session:

```typescript
// src/app/layout.tsx
'use client';

import { useEffect } from 'react';
import { getDI } from '@/lib/di';

export default function RootLayout({ children }) {
  useEffect(() => {
    const di = getDI();
    const sessionUseCase = di.getCurrentSessionUseCase;
    
    // Initialiser la session au chargement
    sessionUseCase.execute().catch(console.error);
  }, []);

  return <html>{children}</html>;
}
```

---

## 🧪 Tests de Diagnostic

### Test 1: Vérifier l'initialisation du DI Container
```typescript
// Test dans une page
console.log('DI Container:', getDI());
console.log('Auth Repository:', getDI().authRepository);
```

### Test 2: Vérifier la génération de l'URL OAuth
```typescript
const useCase = getDI().googleLoginAdminUseCase;
const result = await useCase.execute();
console.log('OAuth URL:', result.redirectUrl);
```

### Test 3: Vérifier la session OAuth
```typescript
const { data } = await supabase.auth.getSession();
console.log('Session active:', data.session);
```

### Test 4: Vérifier le profil utilisateur
```sql
SELECT * FROM compte WHERE email = 'votre-email@example.com';
```

---

## 📊 Checklist de Vérification

Avant de signaler un bug, vérifier:

- [ ] Variables d'environnement correctement configurées (`.env.local`)
- [ ] Supabase OAuth provider activé (Google)
- [ ] URLs de redirection autorisées dans Supabase
- [ ] Google Cloud Console correctement configuré
- [ ] Compte existe dans la table `compte` (pour gérant)
- [ ] Rôle correct assigné dans la base de données
- [ ] `DIContainer` initialisé dans `src/lib/di/index.ts`
- [ ] Pages contiennent `'use client'` en haut
- [ ] Pas d'erreurs de compilation TypeScript
- [ ] Console navigateur ne montre pas d'erreurs JavaScript

---

## 🔍 Logs de Débogage

Activer les logs détaillés:

```typescript
// src/core/use-cases/auth/HandleAdminCallbackUseCase.ts
export class HandleAdminCallbackUseCase {
  async execute(): Promise<User> {
    console.log('[HandleAdminCallback] Début');
    
    const session = await this.authRepository.handleOAuthCallback();
    console.log('[HandleAdminCallback] Session:', session);

    if (!session) {
      console.error('[HandleAdminCallback] Pas de session');
      throw new Error('Session non trouvée');
    }

    const ADMIN_EMAIL = 'joantsayem@gmail.com';
    console.log('[HandleAdminCallback] Email reçu:', session.user.email);
    console.log('[HandleAdminCallback] Email attendu:', ADMIN_EMAIL);

    if (session.user.email !== ADMIN_EMAIL) {
      console.error('[HandleAdminCallback] Email non autorisé');
      await this.authRepository.logout();
      throw new Error('Email non autorisé pour l\'administration');
    }

    if (!session.user.isAdmin()) {
      console.error('[HandleAdminCallback] Role incorrect:', session.user.role);
      throw new Error('L\'utilisateur n\'est pas un administrateur');
    }

    console.log('[HandleAdminCallback] Succès');
    return session.user;
  }
}
```

---

## 📞 Support

Si le problème persiste après avoir suivi ce guide:

1. Vérifier la console navigateur (F12)
2. Vérifier les logs du serveur Next.js
3. Vérifier les logs Supabase Dashboard
4. Consulter la documentation:
   - [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
   - [Next.js App Router Docs](https://nextjs.org/docs/app)
5. Revenir aux anciennes pages si nécessaire:
   ```bash
   # Restaurer l'ancienne page admin
   Move-Item -Path "src/app/admin/login/page-old.tsx.bak" -Destination "src/app/admin/login/page.tsx" -Force
   ```

---

**Date:** 11 novembre 2025  
**Version:** 1.0  
**Projet:** TchopMate
