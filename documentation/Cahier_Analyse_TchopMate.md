# 📘 Cahier d’Analyse – TchopMate

## 1. Présentation du projet
TchopMate est une application web permettant aux étudiants de consulter le menu, commander un repas, payer au comptoir et retirer via QR code.

## 2. Contexte
- **Académique** : Projet SCRUM.
- **Technologique** : Digitalisation croissante.
- **Sociétal** : Réduction des files et gaspillage alimentaire.

---

# 2. Besoins

## 2.1 Besoins fonctionnels
### Gestion des comptes
- Création de compte via email/WhatsApp/Google
- Authentification sécurisée
- Réinitialisation de mot de passe

### Consultation du menu
- Menu du jour
- Disponibilité en temps réel
- Filtrage

### Commandes
- Sélection plats + créneau
- Récapitulatif
- Génération QR unique

### Gestion QR
- Génération
- Expiration
- Validation via scan staff

### Gestion restaurant
- Gestion menus
- Suivi commandes en temps réel

### Notifications
- Confirmation commande
- Rappel retrait

---

## 2.2 Besoins non fonctionnels
- Sécurité (HTTPS, hash)
- Disponibilité
- Performance (<2s)
- Scalabilité
- Confidentialité
- Maintenabilité (architecture claire)

---

# 3. Acteurs
- **Client (Étudiant)**
- **Gérant du restaurant**
- **Administrateur**

---

# 4. Cas d’utilisation (résumé Markdown)
### UC1 – Créer un compte
### UC2 – Se connecter
### UC3 – Consulter le menu
### UC4 – Passer une commande
### UC5 – Recevoir QR code
### UC6 – Scanner QR code
### UC7 – Gérer les menus
### UC8 – Suivre les commandes

---

# 5. Diagrammes UML (résumés en texte)
### Diagramme de classes – Entités principales
- **Client**
- **Commande**
- **Plat**
- **Menu**
- **Restaurant**
- **Compte**
- **Paiement**

(Méthodes et attributs listés dans la version PDF.)

---

# Conclusion
Document de référence pour la compréhension globale du système, servant de base au cahier de conception.
