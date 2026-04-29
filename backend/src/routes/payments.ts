import { Router } from "express";
import { z } from "zod";
import { createPaymentIntent } from "../services/stripe.js";
import { AuthenticatedRequest } from "../middleware/auth.js";

export const paymentsRouter = Router();

const paymentIntentSchema = z.object({
  orderId: z.string().uuid(),
  amountCents: z.number().int().positive()
});

paymentsRouter.post("/intent", async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Non autorise." });
  }

  const parsed = paymentIntentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Payload invalide." });
  }

  const { orderId, amountCents } = parsed.data;

  const intent = await createPaymentIntent(amountCents, {
    orderId,
    userId: req.user.userId
  });

  return res.json({
    clientSecret: intent.client_secret,
    paymentIntentId: intent.id
  });
});
