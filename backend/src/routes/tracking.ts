import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { sendPushNotification } from "../services/notifications.js";

export const trackingRouter = Router();

const updateTrackingSchema = z.object({
  orderId: z.string().uuid(),
  courierLat: z.number(),
  courierLng: z.number(),
  status: z.enum(["accepted", "preparing", "on_the_way", "delivered"])
});

trackingRouter.post("/update", async (req, res) => {
  const parsed = updateTrackingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Payload tracking invalide." });
  }

  const { orderId, courierLat, courierLng, status } = parsed.data;

  const orderResult = await pool.query(
    `UPDATE orders
     SET courier_lat = $1, courier_lng = $2, status = $3
     WHERE id = $4
     RETURNING id, user_id, status`,
    [courierLat, courierLng, status, orderId]
  );

  const order = orderResult.rows[0];
  if (!order) {
    return res.status(404).json({ message: "Commande introuvable." });
  }

  const tokensResult = await pool.query(
    "SELECT token FROM device_tokens WHERE user_id = $1",
    [order.user_id]
  );

  await Promise.all(
    tokensResult.rows.map((row) =>
      sendPushNotification(
        row.token,
        "Mise a jour commande",
        `Statut: ${status.replaceAll("_", " ")}`,
        { orderId, status }
      )
    )
  );

  return res.json({ ok: true });
});

trackingRouter.get("/:orderId", async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Non autorise." });
  }

  const orderId = req.params.orderId;
  const result = await pool.query(
    `SELECT id, status, courier_lat, courier_lng, delivery_lat, delivery_lng
     FROM orders
     WHERE id = $1 AND user_id = $2`,
    [orderId, req.user.userId]
  );

  if (!result.rows[0]) {
    return res.status(404).json({ message: "Tracking introuvable." });
  }

  return res.json(result.rows[0]);
});
