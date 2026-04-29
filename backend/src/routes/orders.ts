import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { AuthenticatedRequest } from "../middleware/auth.js";

export const ordersRouter = Router();

const createOrderSchema = z.object({
  restaurantId: z.string().uuid(),
  items: z.array(
    z.object({
      menuItemId: z.string().uuid(),
      quantity: z.number().int().positive()
    })
  ),
  deliveryLat: z.number(),
  deliveryLng: z.number()
});

ordersRouter.post("/", async (req: AuthenticatedRequest, res) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success || !req.user) {
    return res.status(400).json({ message: "Payload invalide." });
  }

  const { restaurantId, items, deliveryLat, deliveryLng } = parsed.data;

  if (!items.length) {
    return res.status(400).json({ message: "Panier vide." });
  }

  const itemIds = items.map((item) => item.menuItemId);
  const menuResult = await pool.query(
    "SELECT id, price_cents FROM menu_items WHERE id = ANY($1::uuid[])",
    [itemIds]
  );

  const priceMap = new Map<string, number>(
    menuResult.rows.map((row) => [row.id, Number(row.price_cents)])
  );

  let totalCents = 0;
  for (const item of items) {
    const price = priceMap.get(item.menuItemId);
    if (!price) {
      return res.status(400).json({ message: "Menu item invalide." });
    }
    totalCents += price * item.quantity;
  }

  const orderResult = await pool.query(
    `INSERT INTO orders (user_id, restaurant_id, total_cents, delivery_lat, delivery_lng, courier_lat, courier_lng)
     VALUES ($1, $2, $3, $4, $5, $4, $5)
     RETURNING id, status, total_cents`,
    [req.user.userId, restaurantId, totalCents, deliveryLat, deliveryLng]
  );
  const order = orderResult.rows[0];

  for (const item of items) {
    const unitPrice = priceMap.get(item.menuItemId);
    await pool.query(
      `INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price_cents)
       VALUES ($1, $2, $3, $4)`,
      [order.id, item.menuItemId, item.quantity, unitPrice]
    );
  }

  return res.status(201).json(order);
});

ordersRouter.get("/:id", async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Non autorise." });
  }

  const { id } = req.params;
  const result = await pool.query(
    `SELECT id, status, total_cents, delivery_lat, delivery_lng, courier_lat, courier_lng, created_at
     FROM orders
     WHERE id = $1 AND user_id = $2`,
    [id, req.user.userId]
  );

  if (!result.rows[0]) {
    return res.status(404).json({ message: "Commande introuvable." });
  }

  return res.json(result.rows[0]);
});
