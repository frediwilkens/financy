import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LOGIN, REGISTER } from "../graphql/operations.js";
import { apolloClient } from "../lib/apollo.js";
import { setAuthToken } from "../lib/authToken.js";
import type { AuthPayload, LoginInput, RegisterInput, User } from "../types/index.js";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      async login(input) {
        const result = await apolloClient.mutate<{ login: AuthPayload }, { input: LoginInput }>({
          mutation: LOGIN,
          variables: { input },
        });
        if (!result.data?.login) throw new Error("Não foi possível entrar na conta.");
        set({
          user: result.data.login.user,
          token: result.data.login.token,
          isAuthenticated: true,
        });
        setAuthToken(result.data.login.token);
      },
      async register(input) {
        const result = await apolloClient.mutate<
          { register: AuthPayload },
          { input: RegisterInput }
        >({ mutation: REGISTER, variables: { input } });
        if (!result.data?.register) throw new Error("Não foi possível criar a conta.");
        set({
          user: result.data.register.user,
          token: result.data.register.token,
          isAuthenticated: true,
        });
        setAuthToken(result.data.register.token);
      },
      logout() {
        set({ user: null, token: null, isAuthenticated: false });
        setAuthToken(null);
        void apolloClient.clearStore();
      },
      setUser(user) {
        set({ user });
      },
    }),
    {
      name: "financy-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
