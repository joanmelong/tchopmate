# Definition of Done (DoD) — Parcours Étudiant (Client)

## Contexte
Ce document définit les critères permettant de considérer comme "terminées" les fonctionnalités du parcours étudiant dans l’application de commande de plats pour restaurant universitaire.

Les fonctionnalités concernées :
- Consultation du menu (User Story 2.1)
- Commande de plats (User Story 2.2)

---

## Fonctionnalité : Consultation du menu

### Critères de complétion
Une user story “Consulter le menu” est considérée comme Done lorsque :
- Le menu du jour et les plats fixes sont affichés avec nom, description, prix et disponibilité.
- Les filtres (végétarien, plats du jour, etc.) fonctionnent correctement.
- Les données sont chargées depuis la base et se mettent à jour en temps réel.
- Les erreurs d’affichage ou de chargement sont gérées par un message d’erreur clair.
- Les tests unitaires et fonctionnels associés passent avec succès.
- Le code a été revu et validé par un autre développeur.
- Le design est conforme à la maquette (validation UI/UX).
- La documentation technique du module “menu” est mise à jour.
- Le Product Owner valide la fonctionnalité sur l’environnement de test.

---

## Fonctionnalité : Commande de plats

### Critères de complétion
Une user story “Passer une commande” est considérée comme Done lorsque :
- L’étudiant peut sélectionner un plat et un créneau horaire disponible.
- Un récapitulatif clair de la commande est affiché (plat, créneau, prix).
- La commande est enregistrée en base de données et confirmée.
- Un message visuel de confirmation s’affiche à l’utilisateur.
- Les tests unitaires et d’intégration passent à 100 %.
- Le code est conforme aux normes de développement du projet.
- La revue de code (code review) a été effectuée.
- La documentation technique est mise à jour.
- Le Product Owner a validé le parcours de commande sur la plateforme de test.

---
