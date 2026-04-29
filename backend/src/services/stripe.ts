import Stripe from "stripe";
import { env } from "../config/env.js";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (amountCents: number, metadata: Record<string, string>) =>
  stripe.paymentIntents.create({
    amount: amountCents,
    currency: "eur",
    metadata,
    automatic_payment_methods: { enabled: true }
  });
