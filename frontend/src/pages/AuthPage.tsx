import { Eye, EyeOff, LockKeyhole, LogIn, Mail, UserRound, UserRoundPlus } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Brand } from "../components/Brand.js";
import { toast } from "../components/Toast.js";
import { Button, Field, Input, Spinner } from "../components/ui.js";
import { useAuthStore } from "../stores/auth.js";

export function AuthPage({ mode }: { mode: "login" | "signup" }) {
  const isLogin = mode === "login";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  if (isAuthenticated) return <Navigate to="/" replace />;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      if (isLogin) await login({ email, password });
      else await register({ name, email, password });
      toast.success(isLogin ? "Login realizado com sucesso." : "Conta criada com sucesso.");
      navigate(searchParams.get("redirect") || "/", { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível autenticar.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <Link className="auth-brand" to="/">
        <Brand />
      </Link>
      <section className={`auth-card${isLogin ? " auth-card--login" : " auth-card--signup"}`}>
        <header className="auth-card__header">
          <h1>{isLogin ? "Fazer login" : "Criar conta"}</h1>
          <p>
            {isLogin
              ? "Entre na sua conta para continuar"
              : "Comece a controlar suas finanças ainda hoje"}
          </p>
        </header>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-fields">
            {!isLogin && (
              <Field label="Nome completo">
                <div className="input-with-icon">
                  <UserRound size={16} />
                  <Input
                    autoComplete="name"
                    placeholder="Seu nome completo"
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </div>
              </Field>
            )}
            <Field label="E-mail">
              <div className="input-with-icon">
                <Mail size={16} />
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="mail@exemplo.com"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
            </Field>
            <Field
              label="Senha"
              hint={!isLogin ? "A senha deve ter no mínimo 8 caracteres" : undefined}
            >
              <div className="input-with-icon">
                <LockKeyhole size={16} />
                <Input
                  type={showPassword ? "text" : "password"}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  placeholder="Digite sua senha"
                  minLength={isLogin ? 1 : 8}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  className="input-trailing"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>
            {isLogin && (
              <div className="auth-links">
                <label className="remember-check">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                  />
                  Lembrar-me
                </label>
                <button
                  type="button"
                  className="text-link"
                  onClick={() => toast.info("A recuperação de senha ainda não está disponível.")}
                >
                  Recuperar senha
                </button>
              </div>
            )}
          </div>
          <Button type="submit" className="auth-submit" disabled={submitting}>
            {submitting ? <Spinner label="Autenticando" /> : isLogin ? "Entrar" : "Cadastrar"}
          </Button>
          <div className="divider">
            <span />
            ou
            <span />
          </div>
          <div className="auth-footer">
            <p>{isLogin ? "Ainda não tem uma conta?" : "Já tem uma conta?"}</p>
            <Link
              className="button button--outline auth-secondary"
              to={isLogin ? "/signup" : "/login"}
            >
              {isLogin ? <UserRoundPlus size={17} /> : <LogIn size={17} />}
              {isLogin ? "Criar conta" : "Fazer login"}
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
