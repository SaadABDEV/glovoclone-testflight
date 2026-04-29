import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { AuthenticatedRequest } from "../middleware/auth.js";

export const notificationsRouter = Router();

const registerTokenSchema = z.object({
  token: z.string().min(20)
});

notificationsRouter.post("/register-token", async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Non autorise." });
  }

  const parsed = registerTokenSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Token push invalide." });
  }

  await pool.query(
    `INSERT INTO device_tokens (user_id, token, platform)
     VALUES ($1, $2, 'ios')`,
    [req.user.userId, parsed.data.token]
  );

  return res.json({ ok: true });
});
