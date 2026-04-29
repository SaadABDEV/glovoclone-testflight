# Backend API

## Setup

```bash
cp .env.example .env
npm install
npm run db:up
npm run migrate
npm run seed
npm run dev
```

## Endpoints principaux

- `POST /auth/email`
- `POST /auth/apple`
- `GET /restaurants?lat=&lng=`
- `GET /restaurants/:id/menu`
- `POST /orders`
- `POST /payments/intent`
- `GET /tracking/:orderId`
- `POST /tracking/update`
- `POST /notifications/register-token`
