import { Field, Float, ID, InputType, ObjectType, registerEnumType } from "type-graphql";

export enum TransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
}

registerEnumType(TransactionType, { name: "TransactionType" });

@ObjectType()
export class UserModel {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  email!: string;
}

@ObjectType()
export class AuthPayload {
  @Field()
  token!: string;

  @Field(() => UserModel)
  user!: UserModel;
}

@ObjectType()
export class CategoryModel {
  @Field(() => ID)
  id!: string;

  @Field()
  title!: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field()
  color!: string;

  @Field()
  icon!: string;

  @Field(() => Date)
  createdAt!: Date;
}

@ObjectType()
export class TransactionModel {
  @Field(() => ID)
  id!: string;

  @Field()
  description!: string;

  @Field(() => Float)
  amount!: number;

  @Field(() => TransactionType)
  type!: TransactionType;

  @Field(() => Date)
  date!: Date;

  @Field(() => CategoryModel, { nullable: true })
  category?: CategoryModel | null;

  @Field(() => Date)
  createdAt!: Date;
}

@InputType()
export class RegisterInput {
  @Field()
  name!: string;

  @Field()
  email!: string;

  @Field()
  password!: string;
}

@InputType()
export class LoginInput {
  @Field()
  email!: string;

  @Field()
  password!: string;
}

@InputType()
export class CategoryInput {
  @Field()
  title!: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field()
  color!: string;

  @Field()
  icon!: string;
}

@InputType()
export class TransactionInput {
  @Field()
  description!: string;

  @Field(() => Float)
  amount!: number;

  @Field(() => TransactionType)
  type!: TransactionType;

  @Field(() => Date)
  date!: Date;

  @Field(() => ID, { nullable: true })
  categoryId?: string | null;
}
