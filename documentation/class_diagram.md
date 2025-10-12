
---

# 📘 Diagramme de classes — Système de gestion de restaurant

## 🧑‍💼 Classe `Client`

**Méthodes :**

* `+ commander() : void`
* `+ inscrire() : Client`
* `+ seconnecter() : void`
* `+ consulterHistoriqueCom() : void`
* `+ consulterMenu() : void`

---

## 🍽️ Classe `Plat`

**Attributs :**

* `- idPlat : string`
* `- nom : String`
* `- description : String`
* `- prix : double`
* `- image : object`
* `- categorie : String`

**Méthodes :**

* `+ ajouterPlat() : void`
* `+ modifierPlat() : void`
* `+ supprimerPlat() : void`

---

## 📋 Classe `Menu`

**Attributs :**

* `- idMenu : string`
* `- date : Date`
* `- listePlats : string`

**Méthodes :**

* `+ creerMenu() : void`
* `+ ajouterPlat() : void`
* `+ retirerPlat() : void`

---

## 🏢 Classe `Restaurant`

**Attributs :**

* `- idRestaurant : string`
* `- nom : String`
* `- localisation : String`
* `- photo : object`

**Méthodes :**

* `+ gererMenus() : void`
* `+ gererCommandes() : void`
* `+ gererPlats() : void`

---

## 👨‍🍳 Classe `Gerant`

**Méthodes :**

* `+ gererMenu() : void`
* `+ validerMenu() : void`
* `+ creerPlat() : void`

---

## 💳 Classe `Paiement`

**Attributs :**

* `- idPaiement : int`
* `- montant : double`
* `- date : Date`
* `- methode : methodePayement`

**Méthodes :**

* `+ effectuerPaiement() : void`
* `+ verifierPaiement() : void`

---

## 🧾 Enum `methodePayement`

* `MobileMoney`
* `OrangeMoney`
* `Espece`
* `Carte_bancaire`

---

## 📦 Classe `Commande`

**Attributs :**

* `- idCommande : string`
* `- date : Date`
* `- statut : statut`
* `- montantTotal : double`
* `- commentaire : string`
* `- livraison : boolean`
* `- crenau_retrait : Date`

**Méthodes :**

* `+ creerCommande() : void`
* `+ modifierCommande() : void`
* `+ annulerCommande() : void`
* `+ calculerMontant() : void`
* `+ listerPlat() : void`

---

## 🧑‍💻 Classe `Administrateur`

**Méthodes :**

* `+ gererComptes() : void`
* `+ genererRapports() : void`
* `+ configurerSysteme() : void`
* `+ gererDonnees() : void`

---

## 👥 Classe `Compte`

**Attributs :**

* `- id : int`
* `- nom : String`
* `- prenom : String`
* `- email : string`
* `- numero_tel : int`
* `- mot_de_passe : string`

**Méthodes :**

* `+ seconnecter() : void`
* `+ deconnecter() : void`

---

## 🧩 Enum `statut`

* `LIVREE`
* `EN_ATTENTE`
* `PAYE`

---

## 🔗 Relations entre classes

| Source           | Relation      | Cible             | Détail   |
| :--------------- | :------------ | :---------------- | :------- |
| `Gerant`         | hérite de     | `Compte`          | —        |
| `Client`         | hérite de     | `Compte`          | —        |
| `Administrateur` | hérite de     | `Compte`          | —        |
| `Client`         | 1 — 0..*      | `Commande`        | passe    |
| `Commande`       | 1 — 1..*      | `Plat`            | contient |
| `Menu`           | 1..* o-- 1..* | `Plat`            | contient |
| `Commande`       | 1 — 1         | `Paiement`        | associé  |
| `Restaurant`     | 1..* — 1      | `Menu`            | possède  |
| `Client`         | 0..* — 0..*   | `Menu`            | consulte |
| `Gerant`         | 1 — 1         | `Restaurant`      | s’occupe |
| `Gerant`         | 1 — 0..*      | `Menu`            | gère     |
| `Commande`       | 0..* ..> 1    | `methodePayement` | inclut   |
| `Commande`       | 0..* ..> 1    | `statut`          | possède  |
| `Administrateur` | 1 — 0..*      | `Gerant`          | gère     |

---

