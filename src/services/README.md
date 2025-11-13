# 🔧 Services (Legacy)

## Description

Ce dossier contient les anciens services utilisés avant la migration vers Clean Architecture.

## Fichiers Actuels

- `platsServices.ts` - Service legacy pour la gestion des plats

## 🔄 Migration en Cours

Ces services sont progressivement remplacés par:
- **Use Cases** dans `src/core/use-cases/`
- **Repositories** dans `src/data/repositories/`
- **Hooks** dans `src/hooks/`

### Architecture Cible

```
Services Legacy → Use Cases + Repositories
                 ↓
                Hooks (pour React)
                 ↓
                Components UI
```

## 📝 Tâches à Venir

### Pour `platsServices.ts`:

- [ ] Identifier toutes les fonctions utilisées
- [ ] Créer les use cases correspondants:
  - `GetPlatUseCase`
  - `CreatePlatUseCase`
  - `UpdatePlatUseCase`
  - `DeletePlatUseCase`
- [ ] Créer `IMenuRepository` si pas déjà fait
- [ ] Implémenter `SupabaseMenuRepository`
- [ ] Créer hook `use-menu.ts`
- [ ] Migrer les composants vers les nouveaux hooks
- [ ] Supprimer `platsServices.ts`

## 🎯 Objectif Final

Ce dossier devrait être supprimé une fois que tous les services legacy auront été remplacés par l'architecture propre (Use Cases + Repositories).

## 📚 Référence

Voir `CLEAN_ARCHITECTURE.md` à la racine du projet pour comprendre la nouvelle architecture.

---

**Date de création:** 11 novembre 2025  
**Statut:** Legacy - À migrer
