import { NextFunction, Request, Response } from "express";
import { verifyJwt } from "../utils/jwt.js";

export type AuthenticatedRequest = Request & {
  user?: { userId: string; email: string };
};

export const requireAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.replace("Bearer ", "")
    : undefined;

  if (!token) {
    return res.status(401).json({ message: "Token manquant." });
  }

  try {
    req.user = verifyJwt(token);
    next();
  } catch {
    return res.status(401).json({ message: "Token invalide." });
  }
};
