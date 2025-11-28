# Feature: Page de profil client

## Description
Ajout d'une page de profil permettant aux clients de gérer leurs informations personnelles (nom, prénom, téléphone). Ces informations sont ensuite affichées dans les détails des commandes.

## Fichiers créés

### 1. `src/app/profil/page.tsx`
Page de profil client avec :
- Formulaire pour modifier nom, prénom, téléphone
- Email en lecture seule (géré par l'authentification)
- Avatar personnalisé
- Validation des données
- Sauvegarde dans la table `compte`
- Création automatique du compte si inexistant
- Messages de succès/erreur avec toast

## Fichiers modifiés

### 1. `src/app/commandes/page.tsx`
- Ajout d'un lien vers le profil dans le header desktop (clic sur l'avatar)
- Ajout d'un bouton "Mon Profil" dans le menu mobile
- Texte "Voir le profil" sous le nom d'utilisateur

### 2. `src/app/menu/page.tsx`
- Ajout d'un lien vers le profil dans le header desktop (clic sur l'avatar)
- Ajout d'un bouton "Mon Profil" dans le menu mobile
- Import de l'icône User renommée en UserIcon pour éviter les conflits

## Fonctionnalités

### Gestion du profil
1. **Chargement automatique** : Les données sont chargées depuis la table `compte` au montage du composant
2. **Création automatique** : Si le compte n'existe pas, il est créé lors de la première sauvegarde
3. **Validation** :
   - Nom et prénom requis
   - Numéro de téléphone optionnel mais validé (format international)
4. **Sauvegarde** : Mise à jour ou insertion dans la table `compte`

### Affichage dans les commandes
Les informations du profil sont récupérées via l'API `/api/commandes` qui inclut déjà les données du client :
```typescript
client: {
  id: number
  nom: string
  prenom: string
  email: string
  numero_tel?: string
}
```

## Navigation
- Depuis le menu : Clic sur l'avatar ou bouton "Mon Profil"
- Depuis les commandes : Clic sur l'avatar ou bouton "Mon Profil"
- URL directe : `/profil`

## Base de données
Utilise la table `compte` existante avec les champs :
- `user_id` : UUID de l'utilisateur Supabase
- `nom` : Nom de famille
- `prenom` : Prénom
- `email` : Email (synchronisé avec l'auth)
- `numero_tel` : Numéro de téléphone (optionnel)
- `role` : "Client" par défaut

## Améliorations futures possibles
1. Upload d'avatar personnalisé
2. Gestion des adresses de livraison
3. Préférences alimentaires
4. Historique des modifications
5. Suppression du compte
