import { GraphQLError } from "graphql";
import { comparePassword, hashPassword, signToken } from "../lib/auth.js";
import { env } from "../lib/env.js";
import { prisma } from "../lib/prisma.js";
import { loginSchema, registerSchema } from "../validation/schemas.js";
import { badInput, notFound, parseInput } from "./errors.js";

export const authService = {
  async register(input: unknown) {
    const data = parseInput(registerSchema, input);
    if (await prisma.user.findUnique({ where: { email: data.email } })) {
      throw badInput("Email already in use");
    }
    const user = await prisma.user.create({
      data: { ...data, password: await hashPassword(data.password) },
    });
    return { token: signToken(user.id, env.JWT_SECRET), user };
  },

  async login(input: unknown) {
    const data = parseInput(loginSchema, input);
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user || !(await comparePassword(data.password, user.password))) {
      throw new GraphQLError("Invalid credentials", {
        extensions: { code: "UNAUTHENTICATED" },
      });
    }
    return { token: signToken(user.id, env.JWT_SECRET), user };
  },

  async me(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw notFound("User");
    return user;
  },
};
