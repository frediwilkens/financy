import type { Request } from "express";
import { verifyToken } from "../lib/auth.js";
import { env } from "../lib/env.js";

export interface Context {
  userId: string | null;
}

export function buildContext(req: Request): Context {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  return { userId: token ? verifyToken(token, env.JWT_SECRET) : null };
}
