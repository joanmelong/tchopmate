# Tests Unitaires — Parcours Étudiant (Client)

Ce document décrit les tests unitaires à réaliser pour les fonctionnalités du parcours étudiant :
- Consultation du menu
- Commande de plats

---

## Fonctionnalité : Consultation du menu

### Résultat attendu
L’étudiant visualise la liste des plats disponibles avec leurs détails et peut filtrer selon ses préférences alimentaires.

### Déroulement du cas nominal
1. L’étudiant ouvre l’application et se connecte.
2. Il clique sur "Consulter le menu".
3. Le système affiche le menu du jour et les plats fixes (nom, description, prix, disponibilité).
4. L’étudiant applique un filtre (exemple : végétarien). La liste s’actualise correctement.

Résultat attendu : le menu s’affiche correctement avec les plats filtrés, les prix et les disponibilités exacts.

### Cas alternatifs (gestion des exceptions)
- Le serveur est indisponible : message d’erreur "Impossible de charger le menu, réessayez plus tard".
- Aucun plat disponible : message "Aucun plat disponible pour aujourd’hui".
- Erreur dans le chargement d’une image : affichage d’un visuel par défaut ("Image non disponible").
- Erreur de connexion : message "Vérifiez votre connexion internet".

---

## Fonctionnalité : Commande de plats

### Résultat attendu
L’étudiant sélectionne un plat, choisit un créneau horaire et valide la commande, qui s’enregistre correctement.

### Déroulement du cas nominal
1. L’étudiant consulte le menu.
2. Il sélectionne un plat et un créneau horaire.
3. Il clique sur "Commander".
4. Le système affiche un récapitulatif (plat, créneau, prix).
5. L’étudiant confirme la commande.
6. Le système enregistre la commande et affiche "Commande validée".

Résultat attendu : la commande est enregistrée en base, un message de confirmation s’affiche, et le processus se termine sans erreur.

### Cas alternatifs (gestion des exceptions)
- Le plat sélectionné est épuisé : message "Ce plat n’est plus disponible".
- Le créneau horaire est complet : message "Créneau indisponible, veuillez en choisir un autre".
- Problème réseau : message "Erreur de connexion, réessayez".
- L’étudiant tente de commander sans être connecté : redirection vers la page de connexion.
- Erreur serveur à la validation : message "La commande n’a pas pu être enregistrée, veuillez réessayer".

---
