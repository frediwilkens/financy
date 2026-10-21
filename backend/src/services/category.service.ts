import { prisma } from "../lib/prisma.js";
import { categoryInputSchema } from "../validation/schemas.js";
import { notFound, parseInput } from "./errors.js";

export const categoryService = {
  list(userId: string) {
    return prisma.category.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  find(userId: string, id: string) {
    return prisma.category.findFirst({ where: { id, userId } });
  },

  create(userId: string, input: unknown) {
    return prisma.category.create({
      data: { ...parseInput(categoryInputSchema, input), userId },
    });
  },

  async update(userId: string, id: string, input: unknown) {
    const data = parseInput(categoryInputSchema, input);
    const { count } = await prisma.category.updateMany({ where: { id, userId }, data });
    if (!count) throw notFound("Category");
    return prisma.category.findUniqueOrThrow({ where: { id } });
  },

  async remove(userId: string, id: string) {
    const { count } = await prisma.category.deleteMany({ where: { id, userId } });
    if (!count) throw notFound("Category");
    return true;
  },
};
