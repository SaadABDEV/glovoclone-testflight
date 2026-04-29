# Glovo Clone iOS (TestFlight Ready)

Application mobile iOS inspiree de Uber Eats, optimisee pour React Native + backend Node.js, avec architecture compatible TestFlight.

## Stack

- Mobile: React Native (Expo prebuild iOS) + TypeScript
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL
- Auth: JWT + Sign in with Apple
- Payments: Stripe (Apple Pay + carte)
- Maps: `react-native-maps` (Apple Maps sur iOS)
- Push notifications: APNs via Firebase Cloud Messaging (FCM)

## Structure

- `mobile/`: application iOS React Native
- `backend/`: API REST et logique metier

## Demarrage rapide

### 1) Backend

```bash
cd backend
cp .env.example .env
npm install
npm run db:up
npm run migrate
npm run dev
```

### 2) Mobile

```bash
cd mobile
cp .env.example .env
npm install
npx expo prebuild -p ios
npm run ios
```

## Build Xcode + TestFlight

Guide detaille: `docs/TESTFLIGHT_GUIDE.md`
