import { buildSchema } from "type-graphql";
import type { Context } from "./context.js";
import { AuthResolver } from "./resolvers/auth.resolver.js";
import { CategoryResolver } from "./resolvers/category.resolver.js";
import { TransactionResolver } from "./resolvers/transaction.resolver.js";
import { UserResolver } from "./resolvers/user.resolver.js";

export function createSchema() {
  return buildSchema({
    resolvers: [AuthResolver, UserResolver, CategoryResolver, TransactionResolver],
    authChecker: ({ context }: { context: Context }) => Boolean(context.userId),
    validate: false,
    emitSchemaFile: "./schema.graphql",
  });
}
