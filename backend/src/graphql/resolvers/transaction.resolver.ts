import { Arg, Authorized, Ctx, ID, Mutation, Query, Resolver } from "type-graphql";
import { requireUserId } from "../../services/errors.js";
import { transactionService } from "../../services/transaction.service.js";
import type { Context } from "../context.js";
import { TransactionInput, TransactionModel } from "../models.js";

@Resolver(() => TransactionModel)
export class TransactionResolver {
  @Authorized()
  @Query(() => [TransactionModel])
  transactions(@Ctx() ctx: Context) {
    return transactionService.list(requireUserId(ctx.userId));
  }

  @Authorized()
  @Query(() => TransactionModel, { nullable: true })
  transaction(@Arg("id", () => ID) id: string, @Ctx() ctx: Context) {
    return transactionService.find(requireUserId(ctx.userId), id);
  }

  @Authorized()
  @Mutation(() => TransactionModel)
  createTransaction(
    @Arg("input", () => TransactionInput) input: TransactionInput,
    @Ctx() ctx: Context,
  ) {
    return transactionService.create(requireUserId(ctx.userId), input);
  }

  @Authorized()
  @Mutation(() => TransactionModel)
  updateTransaction(
    @Arg("id", () => ID) id: string,
    @Arg("input", () => TransactionInput) input: TransactionInput,
    @Ctx() ctx: Context,
  ) {
    return transactionService.update(requireUserId(ctx.userId), id, input);
  }

  @Authorized()
  @Mutation(() => Boolean)
  deleteTransaction(@Arg("id", () => ID) id: string, @Ctx() ctx: Context) {
    return transactionService.remove(requireUserId(ctx.userId), id);
  }
}
