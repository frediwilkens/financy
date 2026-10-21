import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const hashPassword = (password: string) => bcrypt.hash(password, 10);

export const comparePassword = (password: string, hash: string) => bcrypt.compare(password, hash);

export const signToken = (userId: string, secret: string) =>
  jwt.sign({ sub: userId }, secret, { expiresIn: "7d" });

export function verifyToken(token: string, secret: string): string | null {
  try {
    const payload = jwt.verify(token, secret);
    return typeof payload === "object" && typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}
