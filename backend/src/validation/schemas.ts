import { z } from "zod";

const email = z.string().trim().toLowerCase().email("Invalid email");
const password = z.string().min(8, "Password must have at least 8 characters");

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email,
  password,
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});

const color = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color must be a hex like #1F6F43");

export const categoryInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().nullish(),
  color,
  icon: z.string().trim().min(1, "Icon is required"),
});

export const transactionInputSchema = z.object({
  description: z.string().trim().min(1, "Description is required"),
  amount: z.number().positive("Amount must be greater than zero"),
  type: z.enum(["INCOME", "EXPENSE"]),
  date: z.coerce.date(),
  categoryId: z.string().nullish(),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;
export type TransactionInput = z.infer<typeof transactionInputSchema>;
