import { describe, expect, it } from "vitest";
import { comparePassword, hashPassword, signToken, verifyToken } from "../src/lib/auth.js";
import {
  categoryInputSchema,
  registerSchema,
  transactionInputSchema,
} from "../src/validation/schemas.js";

describe("validation", () => {
  it("normalizes email on register", () => {
    const r = registerSchema.parse({ name: "A", email: " A@B.com ", password: "12345678" });
    expect(r.email).toBe("a@b.com");
  });

  it("rejects short password", () => {
    expect(registerSchema.safeParse({ name: "A", email: "a@b.com", password: "123" }).success).toBe(
      false,
    );
  });

  it("rejects non-positive transaction amount", () => {
    const r = transactionInputSchema.safeParse({
      description: "x",
      amount: 0,
      type: "INCOME",
      date: "2026-01-01",
    });
    expect(r.success).toBe(false);
  });

  it("rejects invalid category color", () => {
    expect(categoryInputSchema.safeParse({ title: "t", color: "red", icon: "i" }).success).toBe(
      false,
    );
  });
});

describe("auth", () => {
  it("hashes and compares passwords", async () => {
    const hash = await hashPassword("secret123");
    expect(await comparePassword("secret123", hash)).toBe(true);
    expect(await comparePassword("wrong", hash)).toBe(false);
  });

  it("signs and verifies tokens", () => {
    const token = signToken("user-1", "s");
    expect(verifyToken(token, "s")).toBe("user-1");
    expect(verifyToken(token, "other")).toBeNull();
    expect(verifyToken("garbage", "s")).toBeNull();
  });
});
