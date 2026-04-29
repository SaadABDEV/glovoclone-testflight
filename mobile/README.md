# Mobile iOS

## Installation

```bash
cp .env.example .env
npm install
npx expo prebuild -p ios
npm run ios
```

## Configuration TestFlight (EAS)

1. Dupliquer les variables production:

```bash
cp .env.production.example .env.production
```

2. Mettre a jour `ASC_APP_ID`, `APPLE_TEAM_ID`, `IOS_BUNDLE_IDENTIFIER`, cle Stripe live et API URL.

3. Build + upload TestFlight:

```bash
npx eas login
npx eas build --platform ios --profile production
npx eas submit --platform ios --profile production
```

## Capacites iOS a activer (Xcode)

- Sign in with Apple
- Apple Pay (merchant ID)
- Push Notifications
- Background Modes > Remote notifications

## Bundle identifier

Par defaut: `com.yourcompany.glovoclone` (a personnaliser avant upload TestFlight).
