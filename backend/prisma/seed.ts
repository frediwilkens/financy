import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";

const categories = [
  { title: "Alimentação", color: "#E07A5F", icon: "utensils" },
  { title: "Transporte", color: "#3D85C6", icon: "car" },
  { title: "Moradia", color: "#8E7CC3", icon: "house" },
  { title: "Saúde", color: "#6AA84F", icon: "heart-pulse" },
  { title: "Lazer", color: "#F1C232", icon: "sparkles" },
  { title: "Salário", color: "#45818E", icon: "wallet" },
];

async function seed() {
  const users = await prisma.user.findMany({ select: { id: true } });

  for (const user of users) {
    for (const category of categories) {
      const existing = await prisma.category.findFirst({
        where: { userId: user.id, title: category.title },
      });
      if (!existing) await prisma.category.create({ data: { ...category, userId: user.id } });
    }
  }
}

seed()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
