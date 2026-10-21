import { Arg, Mutation, Resolver } from "type-graphql";
import { authService } from "../../services/auth.service.js";
import { AuthPayload, LoginInput, RegisterInput } from "../models.js";

@Resolver()
export class AuthResolver {
  @Mutation(() => AuthPayload)
  register(@Arg("input", () => RegisterInput) input: RegisterInput) {
    return authService.register(input);
  }

  @Mutation(() => AuthPayload)
  login(@Arg("input", () => LoginInput) input: LoginInput) {
    return authService.login(input);
  }
}
