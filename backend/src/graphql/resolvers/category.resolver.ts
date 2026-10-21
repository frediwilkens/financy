import { Arg, Authorized, Ctx, ID, Mutation, Query, Resolver } from "type-graphql";
import { categoryService } from "../../services/category.service.js";
import { requireUserId } from "../../services/errors.js";
import type { Context } from "../context.js";
import { CategoryInput, CategoryModel } from "../models.js";

@Resolver(() => CategoryModel)
export class CategoryResolver {
  @Authorized()
  @Query(() => [CategoryModel])
  categories(@Ctx() ctx: Context) {
    return categoryService.list(requireUserId(ctx.userId));
  }

  @Authorized()
  @Query(() => CategoryModel, { nullable: true })
  category(@Arg("id", () => ID) id: string, @Ctx() ctx: Context) {
    return categoryService.find(requireUserId(ctx.userId), id);
  }

  @Authorized()
  @Mutation(() => CategoryModel)
  createCategory(@Arg("input", () => CategoryInput) input: CategoryInput, @Ctx() ctx: Context) {
    return categoryService.create(requireUserId(ctx.userId), input);
  }

  @Authorized()
  @Mutation(() => CategoryModel)
  updateCategory(
    @Arg("id", () => ID) id: string,
    @Arg("input", () => CategoryInput) input: CategoryInput,
    @Ctx() ctx: Context,
  ) {
    return categoryService.update(requireUserId(ctx.userId), id, input);
  }

  @Authorized()
  @Mutation(() => Boolean)
  deleteCategory(@Arg("id", () => ID) id: string, @Ctx() ctx: Context) {
    return categoryService.remove(requireUserId(ctx.userId), id);
  }
}
