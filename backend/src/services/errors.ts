import { GraphQLError } from "graphql";
import { ZodError, type ZodType } from "zod";

export const notFound = (entity: string) =>
  new GraphQLError(`${entity} not found`, { extensions: { code: "NOT_FOUND" } });

export const unauthenticated = () =>
  new GraphQLError("Not authenticated", { extensions: { code: "UNAUTHENTICATED" } });

export const badInput = (message: string) =>
  new GraphQLError(message, { extensions: { code: "BAD_USER_INPUT" } });

export function parseInput<T>(schema: ZodType<T>, input: unknown): T {
  try {
    return schema.parse(input);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new GraphQLError(error.issues[0]?.message ?? "Invalid input", {
        extensions: { code: "BAD_USER_INPUT", issues: error.issues },
      });
    }
    throw error;
  }
}

export function requireUserId(userId: string | null): string {
  if (!userId) throw unauthenticated();
  return userId;
}
