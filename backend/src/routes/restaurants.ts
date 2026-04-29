import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool.js";

export const restaurantsRouter = Router();

const locationSchema = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number()
});

restaurantsRouter.get("/", async (req, res) => {
  const parsed = locationSchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ message: "lat/lng invalides." });
  }

  const { lat, lng } = parsed.data;

  const result = await pool.query(
    `SELECT id, name, image_url, latitude, longitude, eta_min,
      ((latitude - $1)^2 + (longitude - $2)^2) AS distance
     FROM restaurants
     ORDER BY distance ASC
     LIMIT 20`,
    [lat, lng]
  );

  return res.json(result.rows);
});

restaurantsRouter.get("/:id/menu", async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(
    "SELECT id, name, description, image_url, price_cents FROM menu_items WHERE restaurant_id = $1 ORDER BY name ASC",
    [id]
  );
  return res.json(result.rows);
});
