import { Authorized, Ctx, Query, Resolver } from "type-graphql";
import { authService } from "../../services/auth.service.js";
import { requireUserId } from "../../services/errors.js";
import type { Context } from "../context.js";
import { UserModel } from "../models.js";

@Resolver()
export class UserResolver {
  @Authorized()
  @Query(() => UserModel)
  me(@Ctx() ctx: Context) {
    return authService.me(requireUserId(ctx.userId));
  }
}
