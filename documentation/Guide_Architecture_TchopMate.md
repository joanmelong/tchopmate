# 🏛️ Guide d’Architecture Propre – TchopMate

## Architecture globale (Next.js)
```
app/
  (auth)/
  (student)/
  (staff)/
  (admin)/
components/
core/
data/
lib/
public/
tests/
styles/
```

### Correspondance User Stories → Modules Core
- Auth : core/auth
- Menu : core/menu
- Commande : core/order
- QR : lib/qr + components/qr
- Paiement : core/payment
- Notifications : core/notification

## Bonnes pratiques
- Séparer UI / logique / data
- Utiliser Typescript
- Centraliser accès DB
