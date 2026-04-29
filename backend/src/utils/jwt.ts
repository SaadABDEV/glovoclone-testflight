import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export type TokenPayload = {
  userId: string;
  email: string;
};

export const signJwt = (payload: TokenPayload) =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });

export const verifyJwt = (token: string) =>
  jwt.verify(token, env.JWT_SECRET) as TokenPayload;
