import type { Category, TransactionType } from "../types/index.js";

export const currency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export const shortDate = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(new Date(value));

export const fullDate = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(value));

export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export const categoryTone: Record<string, string> = {
  alimentação: "blue",
  mercado: "orange",
  transporte: "purple",
  entretenimento: "pink",
  utilidades: "yellow",
  investimento: "green",
  salário: "green",
  saúde: "red",
};

export function toneFor(category?: Category | null) {
  return category ? (categoryTone[category.title.toLocaleLowerCase("pt-BR")] ?? "gray") : "gray";
}

export const iconForCategory: Record<string, string> = {
  alimentação: "utensils",
  mercado: "shopping-cart",
  transporte: "car-front",
  entretenimento: "ticket",
  utilidades: "tool-case",
  investimento: "piggy-bank",
  salário: "briefcase-business",
  saúde: "heart-pulse",
};

export function categoryIcon(icon?: string | null, title?: string) {
  return icon || (title ? iconForCategory[title.toLocaleLowerCase("pt-BR")] : undefined) || "tag";
}

export function categoryAmount(
  transactions: {
    category: Category | null;
    amount: number;
    type: TransactionType;
  }[],
  categoryId: string,
) {
  return transactions
    .filter((item) => item.category?.id === categoryId && item.type === "EXPENSE")
    .reduce((sum, item) => sum + item.amount, 0);
}
