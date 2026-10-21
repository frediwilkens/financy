export type TransactionType = "INCOME" | "EXPENSE";

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Category {
  id: string;
  title: string;
  description: string | null;
  color: string;
  icon: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
  category: Category | null;
  createdAt: string;
}

export interface AuthPayload {
  token: string;
  user: User;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface CategoryInput {
  title: string;
  description?: string | null;
  color: string;
  icon: string;
}

export interface TransactionInput {
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
  categoryId?: string | null;
}
