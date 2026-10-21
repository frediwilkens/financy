import { type ChildProcess, spawn } from "node:child_process";
import { once } from "node:events";
import { rm } from "node:fs/promises";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../src/lib/prisma.js";

interface GraphQLResponse<T = Record<string, unknown>> {
  data?: T | null;
  errors?: { message: string; extensions?: { code?: string } }[];
}

function waitForServer(child: ChildProcess): Promise<number> {
  return new Promise((resolve, reject) => {
    let output = "";
    const timeout = setTimeout(() => reject(new Error("Timed out starting test server")), 10_000);
    child.stdout?.on("data", (chunk: Buffer) => {
      output += chunk.toString();
      const match = output.match(/GraphQL ready at http:\/\/localhost:(\d+)\/graphql/);
      if (match) {
        clearTimeout(timeout);
        resolve(Number(match[1]));
      }
    });
    child.stderr?.on("data", (chunk: Buffer) => {
      output += chunk.toString();
    });
    child.once("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.once("exit", (code) => {
      clearTimeout(timeout);
      reject(new Error(`Test server exited before startup (code ${code}): ${output}`));
    });
  });
}

describe("GraphQL API with SQLite", () => {
  let server: ChildProcess;
  let endpoint: string;
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const firstEmail = `integration-one-${suffix}@example.test`;
  const secondEmail = `integration-two-${suffix}@example.test`;

  async function request<T>(
    query: string,
    options: { token?: string; variables?: Record<string, unknown> } = {},
  ) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(options.token ? { authorization: `Bearer ${options.token}` } : {}),
      },
      body: JSON.stringify({ query, variables: options.variables }),
    });
    return (await response.json()) as GraphQLResponse<T>;
  }

  beforeAll(async () => {
    server = spawn("node", ["dist/server.js"], {
      cwd: process.cwd(),
      env: { ...process.env, PORT: "0", CORS_ORIGIN: "http://localhost:5173" },
      stdio: ["ignore", "pipe", "pipe"],
    });
    const port = await waitForServer(server);
    endpoint = `http://localhost:${port}/graphql`;
  });

  afterAll(async () => {
    if (server && server.exitCode === null) {
      server.kill("SIGTERM");
      await once(server, "exit");
    }
    await prisma.$disconnect();
    const databasePath = join(process.cwd(), "prisma", "integration-test.db");
    await rm(databasePath, { force: true });
    await rm(`${databasePath}-journal`, { force: true });
  });

  it("supports auth and CRUD while enforcing per-user ownership", async () => {
    const register = await request<{
      register: { token: string; user: { id: string; email: string } };
    }>(
      `mutation Register($input: RegisterInput!) {
        register(input: $input) { user { id email } token }
      }`,
      { variables: { input: { name: "First User", email: firstEmail, password: "password-123" } } },
    );
    expect(register.errors).toBeUndefined();
    const firstUser = register.data?.register.user;
    expect(firstUser?.id).toBeTruthy();
    const firstToken = register.data?.register.token;
    expect(firstToken).toBeTruthy();

    const login = await request<{
      login: { token: string; user: { id: string } };
    }>(`mutation Login($input: LoginInput!) { login(input: $input) { user { id } token } }`, {
      variables: { input: { email: firstEmail, password: "password-123" } },
    });
    expect(login.errors).toBeUndefined();
    expect(login.data?.login.user.id).toBe(firstUser?.id);

    const categoryResult = await request<{
      createCategory: { id: string; title: string };
    }>(
      `mutation CreateCategory($input: CategoryInput!) {
        createCategory(input: $input) { id title }
      }`,
      {
        token: firstToken,
        variables: {
          input: { title: "Food", description: "Meals", color: "#123456", icon: "utensils" },
        },
      },
    );
    expect(categoryResult.errors).toBeUndefined();
    const categoryId = categoryResult.data?.createCategory.id;
    expect(categoryId).toBeTruthy();

    const transactionResult = await request<{
      createTransaction: { id: string; amount: number; type: string; category: { title: string } };
    }>(
      `mutation CreateTransaction($input: TransactionInput!) {
        createTransaction(input: $input) { id amount type category { title } }
      }`,
      {
        token: firstToken,
        variables: {
          input: {
            description: "Lunch",
            amount: 19.95,
            type: "EXPENSE",
            date: "2026-10-19T12:00:00.000Z",
            categoryId,
          },
        },
      },
    );
    expect(transactionResult.errors).toBeUndefined();
    const createdTransaction = transactionResult.data?.createTransaction;
    expect(createdTransaction).toMatchObject({
      amount: 19.95,
      type: "EXPENSE",
      category: { title: "Food" },
    });
    const persisted = await prisma.transaction.findFirstOrThrow({
      where: { userId: firstUser?.id },
    });
    expect(persisted.amountCents).toBe(1995n);

    const updateTransaction = await request<{
      updateTransaction: { amount: number; description: string };
    }>(
      `mutation UpdateTransaction($id: ID!, $input: TransactionInput!) {
        updateTransaction(id: $id, input: $input) { amount description }
      }`,
      {
        token: firstToken,
        variables: {
          id: createdTransaction?.id,
          input: {
            description: "Updated lunch",
            amount: 20.05,
            type: "EXPENSE",
            date: "2026-10-19T12:00:00.000Z",
            categoryId,
          },
        },
      },
    );
    expect(updateTransaction.errors).toBeUndefined();
    expect(updateTransaction.data?.updateTransaction).toEqual({
      amount: 20.05,
      description: "Updated lunch",
    });

    const listTransactions = await request<{ transactions: { id: string }[] }>(
      "{ transactions { id amount } }",
      { token: firstToken },
    );
    expect(listTransactions.errors).toBeUndefined();
    expect(listTransactions.data?.transactions).toHaveLength(1);

    const updateCategory = await request<{ updateCategory: { title: string } }>(
      `mutation UpdateCategory($id: ID!, $input: CategoryInput!) {
        updateCategory(id: $id, input: $input) { title }
      }`,
      {
        token: firstToken,
        variables: {
          id: categoryId,
          input: { title: "Meals", description: "Food", color: "#123456", icon: "utensils" },
        },
      },
    );
    expect(updateCategory.errors).toBeUndefined();
    expect(updateCategory.data?.updateCategory.title).toBe("Meals");

    const secondRegister = await request<{ register: { token: string; user: { id: string } } }>(
      `mutation Register($input: RegisterInput!) { register(input: $input) { user { id } token } }`,
      {
        variables: { input: { name: "Second User", email: secondEmail, password: "password-123" } },
      },
    );
    expect(secondRegister.errors).toBeUndefined();
    const secondUser = secondRegister.data?.register.user;
    const secondToken = secondRegister.data?.register.token;

    const secondUsersCategories = await request<{ categories: { id: string }[]; category: null }>(
      `query CategoryOwnership($id: ID!) { categories { id } category(id: $id) { id } }`,
      { token: secondToken, variables: { id: categoryId } },
    );
    expect(secondUsersCategories.errors).toBeUndefined();
    expect(secondUsersCategories.data).toEqual({ categories: [], category: null });

    const foreignUpdate = await request(
      `mutation UpdateTransaction($id: ID!, $input: TransactionInput!) {
        updateTransaction(id: $id, input: $input) { id }
      }`,
      {
        token: secondToken,
        variables: {
          id: createdTransaction?.id,
          input: {
            description: "Unauthorized edit",
            amount: 4,
            type: "EXPENSE",
            date: "2026-10-19T12:00:00.000Z",
          },
        },
      },
    );
    expect(foreignUpdate.errors?.[0]?.extensions?.code).toBe("NOT_FOUND");

    const unauthenticated = await request("{ categories { id } }");
    expect(unauthenticated.errors?.[0]?.extensions?.code).toBe("UNAUTHENTICATED");

    const foreignCategoryTransaction = await request(
      `mutation CreateTransaction($input: TransactionInput!) {
        createTransaction(input: $input) { id }
      }`,
      {
        token: secondToken,
        variables: {
          input: {
            description: "Forbidden category",
            amount: 2,
            type: "EXPENSE",
            date: "2026-10-19T12:00:00.000Z",
            categoryId,
          },
        },
      },
    );
    expect(foreignCategoryTransaction.errors?.[0]?.extensions?.code).toBe("NOT_FOUND");

    const deleteTransaction = await request<{ deleteTransaction: boolean }>(
      `mutation DeleteTransaction($id: ID!) { deleteTransaction(id: $id) }`,
      { token: firstToken, variables: { id: createdTransaction?.id } },
    );
    expect(deleteTransaction.errors).toBeUndefined();
    expect(deleteTransaction.data?.deleteTransaction).toBe(true);

    const deleteCategory = await request<{ deleteCategory: boolean }>(
      `mutation DeleteCategory($id: ID!) { deleteCategory(id: $id) }`,
      { token: firstToken, variables: { id: categoryId } },
    );
    expect(deleteCategory.errors).toBeUndefined();
    expect(deleteCategory.data?.deleteCategory).toBe(true);
    expect(secondUser?.id).not.toBe(firstUser?.id);
  });
});
