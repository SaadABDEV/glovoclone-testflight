# iOS Build et Upload TestFlight

## Prerequis

- Compte Apple Developer actif
- Xcode recent installe
- Certificats/signing configures dans Apple Developer
- Bundle identifier unique (ex: `com.yourcompany.glovoclone`)
- Cle Stripe + Merchant ID Apple Pay configure

## 1) Configurer les variables

### Mobile (`mobile/.env`)

- `EXPO_PUBLIC_API_BASE_URL`
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_APPLE_MERCHANT_ID`

### Backend (`backend/.env`)

- `DATABASE_URL`
- `JWT_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `APPLE_TEAM_ID`
- `APPLE_KEY_ID`
- `APPLE_AUDIENCE` (doit correspondre au bundle identifier iOS)
- `APPLE_PRIVATE_KEY_BASE64`
- `FCM_PROJECT_ID`
- `FCM_CLIENT_EMAIL`
- `FCM_PRIVATE_KEY_BASE64`

## 2) iOS project

```bash
cd mobile
npx expo prebuild -p ios
open ios/GlovoClone.xcworkspace
```

Dans Xcode:

1. Selectionner target app
2. Onglet Signing & Capabilities:
   - Sign in with Apple
   - Apple Pay (merchant ID)
   - Push Notifications
   - Background Modes (Remote notifications)
3. Definir le bon Bundle Identifier
4. Definir Team et provisioning profile

## 3) Build Release (Xcode classique)

Dans Xcode:

1. `Product > Scheme > Edit Scheme` verifier mode Release pour Archive
2. `Product > Archive`
3. Organizer > Distribute App > App Store Connect > Upload

## 4) Build Release (EAS recommande)

Configurer `mobile/eas.json`:

- `submit.production.ios.ascAppId` = App Store Connect app id numerique
- `submit.production.ios.appleTeamId` = Apple Team ID

Puis lancer:

```bash
cd mobile
cp .env.production.example .env.production
npx eas login
npx eas build --platform ios --profile production
npx eas submit --platform ios --profile production
```

## 5) App Store Connect / TestFlight

1. Creer l'app iOS avec meme bundle identifier
2. Completer:
   - Privacy policy URL
   - Data collection declaration
   - Screenshots iPhone
3. Ajouter testeurs internes
4. Soumettre build TestFlight

## 6) Checklist anti-rejet Apple

- Sign in with Apple present et fonctionnel
- Permissions demandees au bon moment et avec justification
- Consentement privacy explicite avant tracking/notifications
- Paiements stables (Apple Pay + fallback carte)
- Aucune fonctionnalite factice visible utilisateur
- Ecrans de crash/error states traites
- Dark mode correct

## Optimisation acceptation rapide

Le projet est structure pour limiter les causes de rejet:

- Parcours auth iOS natif avec Apple Sign In
- Textes de permission iOS explicites dans Info.plist
- Ecran de consentement centralise
- Logs d'erreurs backend propres
- Gestion des etats de commande claire et testable
