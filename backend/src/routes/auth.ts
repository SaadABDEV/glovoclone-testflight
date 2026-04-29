import { Router } from "express";
import { z } from "zod";
import appleSigninAuth from "apple-signin-auth";
import { pool } from "../db/pool.js";
import { signJwt } from "../utils/jwt.js";
import { env } from "../config/env.js";

export const authRouter = Router();

const emailAuthSchema = z.object({
  email: z.string().email(),
  fullName: z.string().optional()
});

const appleSchema = z.object({
  identityToken: z.string(),
  user: z.object({
    email: z.string().email().optional(),
    fullName: z.string().optional(),
    sub: z.string().optional()
  })
});

authRouter.post("/email", async (req, res) => {
  const parsed = emailAuthSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Payload invalide." });
  }

  const { email, fullName } = parsed.data;
  const userResult = await pool.query(
    `INSERT INTO users (email, full_name)
     VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE SET full_name = COALESCE(EXCLUDED.full_name, users.full_name)
     RETURNING id, email`,
    [email, fullName ?? null]
  );

  const user = userResult.rows[0];
  const token = signJwt({ userId: user.id, email: user.email });
  return res.json({ token, user });
});

authRouter.post("/apple", async (req, res) => {
  const parsed = appleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Payload invalide." });
  }

  try {
    const { identityToken, user } = parsed.data;
    const appleUser = await appleSigninAuth.verifyIdToken(identityToken, {
      audience: env.APPLE_AUDIENCE ?? "com.yourcompany.glovoclone",
      ignoreExpiration: false
    });

    const email = user.email ?? appleUser.email;
    const sub = user.sub ?? appleUser.sub;

    if (!email || !sub) {
      return res.status(400).json({ message: "Donnees Apple insuffisantes." });
    }

    const userResult = await pool.query(
      `INSERT INTO users (email, full_name, apple_sub)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET apple_sub = COALESCE(users.apple_sub, EXCLUDED.apple_sub)
       RETURNING id, email`,
      [email, user.fullName ?? null, sub]
    );

    const dbUser = userResult.rows[0];
    const token = signJwt({ userId: dbUser.id, email: dbUser.email });
    return res.json({ token, user: dbUser });
  } catch {
    return res.status(401).json({ message: "Echec verification Apple ID." });
  }
});
