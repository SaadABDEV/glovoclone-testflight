import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { authRouter } from "./routes/auth.js";
import { restaurantsRouter } from "./routes/restaurants.js";
import { ordersRouter } from "./routes/orders.js";
import { paymentsRouter } from "./routes/payments.js";
import { trackingRouter } from "./routes/tracking.js";
import { notificationsRouter } from "./routes/notifications.js";
import { requireAuth } from "./middleware/auth.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRouter);
app.use("/restaurants", restaurantsRouter);
app.use("/orders", requireAuth, ordersRouter);
app.use("/payments", requireAuth, paymentsRouter);
app.use("/tracking", requireAuth, trackingRouter);
app.use("/notifications", requireAuth, notificationsRouter);

app.listen(env.PORT, () => {
  console.log(`API demarree sur :${env.PORT}`);
});
