# 📦 Modèles (Legacy)

## Description

Ce dossier contient les anciens modèles TypeScript utilisés avant la migration vers Clean Architecture.

## Fichiers Actuels

- `plat.ts` - Modèle legacy pour les plats

## 🔄 Migration en Cours

Ces modèles sont progressivement remplacés par les **entités** dans `src/core/entities/`.

### État de Migration

| Modèle Legacy | Entité Clean Architecture | Statut |
|---------------|---------------------------|--------|
| `plat.ts` | `src/core/entities/Menu.ts` (classe Plat) | ⚠️ À migrer |

## 📝 Tâches à Venir

- [ ] Analyser l'utilisation de `plat.ts` dans le codebase
- [ ] Migrer les composants utilisant `plat.ts` vers `Plat` entity
- [ ] Supprimer `plat.ts` une fois la migration complète
- [ ] Supprimer ce dossier si vide après migration

## 🎯 Objectif Final

Ce dossier devrait être supprimé une fois que tous les modèles legacy auront été remplacés par les entités Clean Architecture.

---

**Date de création:** 11 novembre 2025  
**Statut:** Legacy - À migrer
