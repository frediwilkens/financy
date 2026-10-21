import "reflect-metadata";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import cors from "cors";
import express from "express";
import { buildContext, type Context } from "./graphql/context.js";
import { createSchema } from "./graphql/schema.js";
import { env } from "./lib/env.js";

const schema = await createSchema();
const server = new ApolloServer<Context>({ schema });
await server.start();

const app = express();
app.use(
  "/graphql",
  cors({ origin: env.CORS_ORIGIN.split(","), credentials: true }),
  express.json(),
  expressMiddleware(server, { context: async ({ req }) => buildContext(req) }),
);

const httpServer = app.listen(env.PORT, () => {
  const address = httpServer.address();
  if (address && typeof address !== "string") {
    console.log(`GraphQL ready at http://localhost:${address.port}/graphql`);
  }
});
