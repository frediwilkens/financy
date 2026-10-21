import { prisma } from "../lib/prisma.js";
import { transactionInputSchema } from "../validation/schemas.js";
import { badInput, notFound, parseInput } from "./errors.js";

const withCategory = { category: true } as const;

function toGraphQL<T extends { amountCents: bigint }>(transaction: T) {
  const { amountCents, ...rest } = transaction;
  return { ...rest, amount: Number(amountCents) / 100 };
}

function toDatabase(input: ReturnType<typeof transactionInputSchema.parse>) {
  const amountCents = Math.round(input.amount * 100);
  if (!Number.isSafeInteger(amountCents)) {
    throw badInput("Transaction amount exceeds the supported range");
  }
  const { amount, ...rest } = input;
  return { ...rest, amountCents };
}

async function assertCategoryOwnership(userId: string, categoryId?: string | null) {
  if (!categoryId) return;
  const category = await prisma.category.findFirst({ where: { id: categoryId, userId } });
  if (!category) throw notFound("Category");
}

export const transactionService = {
  async list(userId: string) {
    const rows = await prisma.transaction.findMany({
      where: { userId },
      include: withCategory,
      orderBy: { date: "desc" },
    });
    return rows.map(toGraphQL);
  },

  async find(userId: string, id: string) {
    const row = await prisma.transaction.findFirst({
      where: { id, userId },
      include: withCategory,
    });
    return row ? toGraphQL(row) : null;
  },

  async create(userId: string, rawInput: unknown) {
    const input = parseInput(transactionInputSchema, rawInput);
    await assertCategoryOwnership(userId, input.categoryId);
    const row = await prisma.transaction.create({
      data: { ...toDatabase(input), categoryId: input.categoryId ?? null, userId },
      include: withCategory,
    });
    return toGraphQL(row);
  },

  async update(userId: string, id: string, rawInput: unknown) {
    const input = parseInput(transactionInputSchema, rawInput);
    await assertCategoryOwnership(userId, input.categoryId);
    const { count } = await prisma.transaction.updateMany({
      where: { id, userId },
      data: { ...toDatabase(input), categoryId: input.categoryId ?? null },
    });
    if (!count) throw notFound("Transaction");
    const row = await prisma.transaction.findUniqueOrThrow({
      where: { id },
      include: withCategory,
    });
    return toGraphQL(row);
  },

  async remove(userId: string, id: string) {
    const { count } = await prisma.transaction.deleteMany({ where: { id, userId } });
    if (!count) throw notFound("Transaction");
    return true;
  },
};
